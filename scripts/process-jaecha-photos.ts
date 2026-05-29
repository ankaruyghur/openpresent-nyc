#!/usr/bin/env node
/**
 * Generate optimized variants of Jae Cha's photographs and upload them to S3.
 *
 * Run with:
 *   npm run jaecha:upload -- --source "/path/to/Portfolio 2026"
 *
 * Idempotent: skips uploads whose S3 key already exists. Re-running after
 * adding new photos uploads only the new ones.
 *
 * Outputs src/app/jaecha/_components/photos.ts — the metadata catalog the
 * site reads at build time. Commit that file after running.
 *
 * See docs/JAECHA_PHOTOS.md for the day-to-day add / remove / reorder workflow.
 */

import { config as dotenvConfig } from 'dotenv';
import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import * as readline from 'node:readline';
import sharp from 'sharp';

// Mirror Next.js's env-file precedence: .env.local > .env. Load both so the
// script reads the same AWS credentials the rest of the app does.
dotenvConfig({ path: path.resolve(__dirname, '..', '.env.local') });
dotenvConfig({ path: path.resolve(__dirname, '..', '.env') });

import { PROJECTS, type Project } from '../src/app/jaecha/_components/data';
import type { JaePhoto, PhotoSize } from '../src/app/jaecha/_components/photo-types';

// ── Configuration ──────────────────────────────────────────────────────────

const S3_BUCKET = process.env.AWS_S3_BUCKET_NAME;
const S3_REGION = process.env.AWS_REGION ?? 'us-east-1';

/**
 * Where Jae's photos live in S3. The leading `web-assets/` segment groups
 * them alongside other public site assets.
 */
const S3_KEY_PREFIX = 'web-assets/jaecha';

/**
 * What the SITE sees as the URL path (after CloudFront's origin path strips
 * `web-assets/` automatically). Public URL =
 * `https://${NEXT_PUBLIC_CLOUDFRONT_DOMAIN_WEB}/${PUBLIC_PATH_PREFIX}/...`.
 *
 * If you ever change the CloudFront distribution's Origin path, this is the
 * knob that needs to flip in lockstep.
 */
const PUBLIC_PATH_PREFIX = 'jaecha';

const SIZE_WIDTHS: Record<PhotoSize, number> = {
  thumb: 400,
  medium: 1200,
  large: 2400,
};

const FORMATS = ['avif', 'webp'] as const;
type Format = (typeof FORMATS)[number];

const AVIF_QUALITY = 55;
const WEBP_QUALITY = 78;

const BLUR_WIDTH = 20;
const BLUR_QUALITY = 40;

/** Max parallel sharp pipelines. sharp is multithreaded internally, so keep low. */
const CONCURRENCY = 3;

/** Source filename extensions to process. Sharp handles all of these natively. */
const SOURCE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.heic', '.tif', '.tiff']);

const REPO_ROOT = path.resolve(__dirname, '..');
const PHOTOS_OUT = path.join(
  REPO_ROOT,
  'src',
  'app',
  'jaecha',
  '_components',
  'photos.ts',
);

const CONTENT_TYPES: Record<Format, string> = {
  avif: 'image/avif',
  webp: 'image/webp',
};

// ── CLI ────────────────────────────────────────────────────────────────────

type Args = {
  source: string;
  project: string | null;
  dryRun: boolean;
  prune: boolean;
  yes: boolean;
  force: boolean;
};

function parseArgs(): Args {
  const args = process.argv.slice(2);
  let source: string | null = null;
  let project: string | null = null;
  let dryRun = false;
  let prune = false;
  let yes = false;
  let force = false;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--source' || a === '-s') source = args[++i];
    else if (a === '--project' || a === '-p') project = args[++i];
    else if (a === '--dry-run') dryRun = true;
    else if (a === '--prune') prune = true;
    else if (a === '--yes' || a === '-y') yes = true;
    else if (a === '--force') force = true;
    else if (a === '--help' || a === '-h') {
      console.log(`Usage: npm run jaecha:upload -- --source "/path/to/Portfolio 2026" [options]

Options:
  --source, -s     Root folder containing Jae's portfolio (required).
  --project, -p    Only process one project ID (useful for testing). When set,
                   photos.ts is NOT rewritten — run a full pass without
                   --project to regenerate the catalog.
  --dry-run        Process locally, log what would happen, but don't push to S3
                   or rewrite photos.ts.
  --prune          Detect photos in S3 / photos.ts that no longer exist in the
                   source folder and delete their variants. Off by default —
                   removals are explicit.
  --force          Re-upload every variant even if S3 already has it. Use after
                   the source files at existing slugs have been replaced with
                   different content (e.g. Jae renumbered his portfolio).
                   Doesn't bypass --prune; combine the flags if you also want
                   orphans deleted.
  --yes, -y        Skip the interactive confirmation prompt.
  --help, -h       Show this help.`);
      process.exit(0);
    }
  }
  if (!source) {
    console.error('error: --source is required.\n  hint: --source "/Volumes/.../Portfolio 2026"');
    process.exit(2);
  }
  return { source, project, dryRun, prune, yes, force };
}

// ── Helpers ────────────────────────────────────────────────────────────────

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

/**
 * Convert a source filename to a stable, S3-safe slug.
 *
 *   "Portrait-Env (5).jpg"       → "portrait-env-5"
 *   "JJ-001.jpg"                 → "jj-001"
 *   "America Fever Lancaster.tif"→ "america-fever-lancaster"
 *
 * The slug is the photo's permanent identity. If a source file is renamed,
 * its slug changes and the upload script treats it as a new photo.
 */
function slugify(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, '');
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

async function listSourcePhotos(folder: string): Promise<{ filename: string; fullPath: string }[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(folder);
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw e;
  }
  return entries
    .filter((name) => SOURCE_EXTS.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
    .map((filename) => ({ filename, fullPath: path.join(folder, filename) }));
}

async function confirm(prompt: string): Promise<boolean> {
  // If stdin isn't a TTY (e.g. piped, CI, or some npm-script wrapping), there's
  // nobody to type a confirmation — bail with a clear hint instead of hanging.
  if (!process.stdin.isTTY) {
    console.error(`error: cannot prompt for confirmation — stdin is not a TTY.`);
    console.error(`  re-run with --yes to skip the confirmation.`);
    process.exit(2);
  }
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer: string = await new Promise((resolve) => {
    rl.question(`${prompt} [y/N] `, (a) => resolve(a));
  });
  rl.close();
  return /^y(es)?$/i.test(answer.trim());
}

// ── S3 ─────────────────────────────────────────────────────────────────────

const s3 = new S3Client({ region: S3_REGION });

async function s3Exists(key: string): Promise<boolean> {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: S3_BUCKET, Key: key }));
    return true;
  } catch (e) {
    const status = (e as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
    if (status === 404 || status === 403) return false;
    throw e;
  }
}

async function s3Put(key: string, body: Buffer, contentType: string): Promise<void> {
  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  );
}

async function s3Delete(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));
}

// ── Image processing ───────────────────────────────────────────────────────

async function generateVariant(
  pipeline: sharp.Sharp,
  width: number,
  format: Format,
): Promise<Buffer> {
  const resized = pipeline.clone().resize({ width, withoutEnlargement: true });
  if (format === 'avif') return resized.avif({ quality: AVIF_QUALITY, effort: 5 }).toBuffer();
  return resized.webp({ quality: WEBP_QUALITY, effort: 5 }).toBuffer();
}

async function generateBlur(pipeline: sharp.Sharp): Promise<string> {
  const buf = await pipeline
    .clone()
    .resize({ width: BLUR_WIDTH, withoutEnlargement: true })
    .webp({ quality: BLUR_QUALITY })
    .toBuffer();
  return `data:image/webp;base64,${buf.toString('base64')}`;
}

type ProcessedPhoto = {
  meta: JaePhoto;
  uploaded: number;
  skipped: number;
  bytes: number;
};

async function processOnePhoto(
  project: Project,
  filename: string,
  fullPath: string,
  dryRun: boolean,
  force: boolean,
): Promise<ProcessedPhoto> {
  const slug = slugify(filename);
  const buf = await fs.readFile(fullPath);
  // .rotate() applies EXIF orientation and strips the tag so downstream
  // transforms operate on visually-correct pixels.
  const pipeline = sharp(buf).rotate();
  const { width, height } = await pipeline.metadata();
  if (!width || !height) {
    throw new Error(`Could not read dimensions from ${fullPath}`);
  }

  const s3KeyBase = `${S3_KEY_PREFIX}/${project.id}/${slug}`;
  const publicBasePath = `${PUBLIC_PATH_PREFIX}/${project.id}/${slug}`;
  const sizes: PhotoSize[] = ['thumb', 'medium', 'large'];

  let uploaded = 0;
  let skipped = 0;
  let bytes = 0;

  for (const size of sizes) {
    for (const format of FORMATS) {
      const key = `${s3KeyBase}-${size}.${format}`;
      const exists = dryRun || force ? false : await s3Exists(key);
      if (exists) {
        skipped++;
        continue;
      }
      const variant = await generateVariant(pipeline, SIZE_WIDTHS[size], format);
      bytes += variant.length;
      if (!dryRun) {
        await s3Put(key, variant, CONTENT_TYPES[format]);
      }
      uploaded++;
    }
  }

  const blurDataURL = await generateBlur(pipeline);

  const meta: JaePhoto = {
    id: `${project.id}/${slug}`,
    basePath: publicBasePath,
    sizes,
    width,
    height,
    blurDataURL,
    alt: `${project.title} — ${slug}`,
  };

  return { meta, uploaded, skipped, bytes };
}

// ── Photos.ts emission ─────────────────────────────────────────────────────

function emitPhotosFile(map: Record<string, JaePhoto[]>): string {
  const lines: string[] = [];
  lines.push('// AUTO-GENERATED by scripts/process-jaecha-photos.ts — do not edit by hand.');
  lines.push(`// Last generated: ${new Date().toISOString()}`);
  lines.push("import type { JaePhoto } from './photo-types';");
  lines.push('');
  lines.push('export const PHOTOS: Record<string, JaePhoto[]> = {');
  const projectIds = Object.keys(map).sort();
  for (const id of projectIds) {
    const photos = map[id];
    lines.push(`  ${JSON.stringify(id)}: [`);
    for (const p of photos) {
      lines.push(`    ${JSON.stringify(p)},`);
    }
    lines.push('  ],');
  }
  lines.push('};');
  lines.push('');
  return lines.join('\n');
}

// ── Concurrency limiter ────────────────────────────────────────────────────

async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

// ── Prune ──────────────────────────────────────────────────────────────────

/**
 * For one project, find photos that exist in the current photos.ts but no
 * longer have a matching source file. Return the orphan slugs so the caller
 * can delete them.
 */
async function findOrphans(
  project: Project,
  sourceSlugs: Set<string>,
): Promise<string[]> {
  // Read the previous photos.ts to know what's currently catalogued.
  const previous = await readPreviousPhotos();
  const known = previous[project.id] ?? [];
  return known
    .map((p) => p.id.split('/').slice(1).join('/')) // strip "<project-id>/" prefix
    .filter((slug) => !sourceSlugs.has(slug));
}

let cachedPrevious: Record<string, JaePhoto[]> | null = null;
async function readPreviousPhotos(): Promise<Record<string, JaePhoto[]>> {
  if (cachedPrevious) return cachedPrevious;
  try {
    const mod = await import('../src/app/jaecha/_components/photos');
    cachedPrevious = (mod.PHOTOS as Record<string, JaePhoto[]>) ?? {};
  } catch {
    cachedPrevious = {};
  }
  return cachedPrevious;
}

async function deletePhotoVariants(projectId: string, slug: string, dryRun: boolean): Promise<number> {
  const s3KeyBase = `${S3_KEY_PREFIX}/${projectId}/${slug}`;
  const sizes: PhotoSize[] = ['thumb', 'medium', 'large'];
  let deleted = 0;
  for (const size of sizes) {
    for (const format of FORMATS) {
      const key = `${s3KeyBase}-${size}.${format}`;
      if (!dryRun) {
        try {
          await s3Delete(key);
        } catch {
          // If the key doesn't exist that's fine; we wanted it gone.
        }
      }
      deleted++;
    }
  }
  return deleted;
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs();

  if (!S3_BUCKET) {
    console.error('error: AWS_S3_BUCKET_NAME is not set. Check .env.local.');
    process.exit(2);
  }

  try {
    await fs.access(args.source);
  } catch {
    console.error(`error: source folder does not exist: ${args.source}`);
    process.exit(2);
  }

  console.log(`source:   ${args.source}`);
  console.log(`bucket:   s3://${S3_BUCKET}/${S3_KEY_PREFIX}/  (served at /${PUBLIC_PATH_PREFIX}/* via CloudFront)`);
  console.log(`region:   ${S3_REGION}`);
  console.log(`projects: ${args.project ?? 'all'}`);
  console.log(`mode:     ${args.dryRun ? 'DRY RUN (no S3 writes, no photos.ts emit)' : 'LIVE'}`);
  console.log(`prune:    ${args.prune ? 'YES — orphan photos will be deleted' : 'no'}`);
  console.log(`force:    ${args.force ? 'YES — every variant will be re-uploaded' : 'no'}`);
  console.log('');

  const projects = args.project
    ? PROJECTS.filter((p) => p.id === args.project)
    : PROJECTS;

  if (projects.length === 0) {
    console.error(`error: no projects match --project ${args.project}`);
    process.exit(2);
  }

  if (!args.dryRun && !args.yes) {
    const ok = await confirm('Proceed?');
    if (!ok) {
      console.log('aborted.');
      process.exit(0);
    }
  }

  const photosMap: Record<string, JaePhoto[]> = {};
  let totalUploaded = 0;
  let totalSkipped = 0;
  let totalBytes = 0;
  let totalDeleted = 0;
  const allOrphans: { projectId: string; slug: string }[] = [];
  const t0 = Date.now();

  for (const project of projects) {
    const folder = path.join(args.source, project.sourceFolder);
    const files = await listSourcePhotos(folder);
    if (files.length === 0) {
      console.log(`[${project.id}] no photos in ${folder} — skipping`);
      continue;
    }

    // Detect filename collisions early.
    const slugCounts = new Map<string, string[]>();
    for (const f of files) {
      const slug = slugify(f.filename);
      const arr = slugCounts.get(slug) ?? [];
      arr.push(f.filename);
      slugCounts.set(slug, arr);
    }
    const collisions = [...slugCounts.entries()].filter(([, names]) => names.length > 1);
    if (collisions.length > 0) {
      console.error(`[${project.id}] ERROR: filename slug collisions:`);
      for (const [slug, names] of collisions) {
        console.error(`  "${slug}" ← ${names.join(', ')}`);
      }
      console.error('  rename source files to disambiguate and re-run.');
      process.exit(1);
    }

    console.log(`[${project.id}] ${files.length} photos in ${project.sourceFolder}`);

    const results = await mapLimit(files, CONCURRENCY, async ({ filename, fullPath }) => {
      const result = await processOnePhoto(project, filename, fullPath, args.dryRun, args.force);
      console.log(
        `  ${project.id}/${slugify(filename)}  ↑${result.uploaded} ⤳${result.skipped}  ${fmtBytes(result.bytes)}  ← ${filename}`,
      );
      return result;
    });

    photosMap[project.id] = results.map((r) => r.meta);
    totalUploaded += results.reduce((s, r) => s + r.uploaded, 0);
    totalSkipped += results.reduce((s, r) => s + r.skipped, 0);
    totalBytes += results.reduce((s, r) => s + r.bytes, 0);

    // Orphan detection — only meaningful when we're rewriting photos.ts
    // (i.e. a full run). If --prune isn't set we just log them.
    const sourceSlugs = new Set(files.map((f) => slugify(f.filename)));
    const orphans = await findOrphans(project, sourceSlugs);
    if (orphans.length > 0) {
      console.log(`  [orphans] ${orphans.length} photo(s) in photos.ts no longer in source:`);
      for (const slug of orphans) console.log(`    - ${slug}`);
      if (args.prune) {
        for (const slug of orphans) {
          const n = await deletePhotoVariants(project.id, slug, args.dryRun);
          totalDeleted += n;
          allOrphans.push({ projectId: project.id, slug });
          console.log(`    ${args.dryRun ? '[dry-run] would delete' : 'deleted'} ${n} variants of ${slug}`);
        }
      } else {
        console.log('    re-run with --prune to delete them from S3 and photos.ts.');
        // Without --prune we still keep them in the new photos.ts to preserve
        // current site state — the user has to opt in to removal.
        const previous = await readPreviousPhotos();
        const known = previous[project.id] ?? [];
        const kept = known.filter((p) => orphans.includes(p.id.split('/').slice(1).join('/')));
        photosMap[project.id] = [...photosMap[project.id], ...kept];
      }
    }
  }

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log('');
  console.log(
    `done in ${elapsed}s — ↑${totalUploaded} variants, ⤳${totalSkipped} skipped, ${fmtBytes(totalBytes)} processed` +
      (args.prune ? `, ✕${totalDeleted} deleted` : ''),
  );

  if (args.dryRun) {
    console.log('(dry run — no S3 writes, photos.ts NOT rewritten)');
    return;
  }

  if (args.project) {
    console.log(`note: ran with --project ${args.project}; photos.ts NOT rewritten.`);
    console.log('      re-run without --project to regenerate the full catalog.');
    return;
  }

  await fs.writeFile(PHOTOS_OUT, emitPhotosFile(photosMap), 'utf8');
  console.log(`wrote ${path.relative(REPO_ROOT, PHOTOS_OUT)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
