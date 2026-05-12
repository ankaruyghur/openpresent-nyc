# Jae Cha photos — day-to-day operations

How to add, remove, and reorder photos on `/jaecha`.

## How the system is wired

```
LaCie/Portfolio 2026/<category>/[<project>/]<file>.jpg
                  │
                  │  npm run jaecha:upload --source <path>
                  ▼
   scripts/process-jaecha-photos.ts
                  │
                  │  ─ resize to thumb/medium/large × avif/webp
                  │  ─ generate 20px blurDataURL
                  │  ─ idempotent S3 upload
                  │  ─ regenerate photos.ts
                  ▼
                S3 (openpresent bucket)
                  │   key:        web-assets/jaecha/<project-id>/<slug>-<size>.<ext>
                  │   public URL: /jaecha/<project-id>/<slug>-<size>.<ext>
                  │   (the CloudFront distribution's Origin path strips `web-assets/`)
                  ▼
              CloudFront
                  │   NEXT_PUBLIC_CLOUDFRONT_DOMAIN_WEB
                  ▼
              <JaePhoto> component on the site
                  ▲
                  │  curation.ts decides order / hero / hidden
                  │  photos.ts catalogs every uploaded photo
                  │  data.ts lists projects
```

**Three files, three jobs:**

| File | Hand-edited? | What it controls |
|------|------|------|
| `src/app/jaecha/_components/data.ts` | **Yes** | The list of projects (titles, categories, accents) |
| `src/app/jaecha/_components/photos.ts` | **No — generated** | Every uploaded photo's metadata (dimensions, blur preview, S3 base path) |
| `src/app/jaecha/_components/curation.ts` | **Yes** | Display order, hero shot, hidden drafts, home-grid picks |

## Photo identity: source filename → slug

The script slugifies each source filename into a permanent identifier. Examples:

All keys are prefixed with `web-assets/jaecha/` in S3. The CloudFront `_WEB`
distribution has an Origin path of `/web-assets`, which means the public URL
omits that segment:

- **S3 key:** `web-assets/jaecha/<project-id>/<slug>-<size>.<ext>`
- **Public URL:** `https://<NEXT_PUBLIC_CLOUDFRONT_DOMAIN_WEB>/jaecha/<project-id>/<slug>-<size>.<ext>`

Don't try to fetch a `/web-assets/...` URL — CloudFront's Origin path will
double-prepend it and S3 will return 403.

| Source filename | Slug | S3 key | Public URL path |
|------|------|------|------|
| `Portrait-Env (5).jpg` | `portrait-env-5` | `web-assets/jaecha/env/portrait-env-5-medium.avif` | `/jaecha/env/portrait-env-5-medium.avif` |
| `JJ-001.jpg` | `jj-001` | `web-assets/jaecha/evt-jungle-jungle-2024/jj-001-medium.avif` | `/jaecha/evt-jungle-jungle-2024/jj-001-medium.avif` |

**The slug is the photo's permanent ID.** It appears in S3 keys, in `photos.ts`, and in `curation.ts`. Don't rename source files casually — a rename creates a "new" photo in S3 and orphans the old one (you'd then `--prune` to clean up).

---

## Adding photos

1. Drop the new image(s) into the right project folder under `Portfolio 2026/`. Use a meaningful filename — that becomes the permanent slug.
2. Run the upload script:
   ```bash
   npm run jaecha:upload -- --source "/Volumes/.../Portfolio 2026"
   ```
3. The script uploads only the new variants (existing photos are skipped via S3 `HeadObject`), regenerates `photos.ts`, and prints a summary.
4. By default the new photos appear **at the end** of their project's natural sort order on the site. If you want them somewhere else, add them to `curation.ts` `order`.
5. `git add src/app/jaecha/_components/photos.ts && git commit -m "Add N photos to <project>"` and push.

### Adding a brand-new project

1. Create a sub-folder under the matching category in `Portfolio 2026/`, e.g. `Commercial/New Brand 2026/`.
2. Add the project to `data.ts` with a stable `id` and the `sourceFolder` pointing at that path. **Pick the ID carefully — it becomes the S3 prefix forever.**
3. Run `npm run jaecha:upload -- --source "..."` and commit `photos.ts`.

---

## Removing photos

Removal is opt-in (the script won't delete unless you say so).

### Remove specific photos from a project

1. Delete (or move out of) the source file(s) from `Portfolio 2026/`.
2. Run with `--prune`:
   ```bash
   npm run jaecha:upload -- --source "/Volumes/.../Portfolio 2026" --prune
   ```
3. The script detects photos in `photos.ts` that no longer have a matching source file, deletes their S3 variants, and excludes them from the new `photos.ts`.
4. Commit `photos.ts`.

### Dry-run a removal first (recommended)

```bash
npm run jaecha:upload -- --source "..." --prune --dry-run
```
Shows what would be deleted without touching S3 or `photos.ts`.

### Hide without deleting (drafts, alt edits)

If you want a photo in S3 but not on the site, add its ID to `curation.ts`
(IDs are `<project-id>/<slug>` — look up the exact value in `photos.ts`):

```ts
'evt-jungle-jungle-2024': {
  hidden: ['evt-jungle-jungle-2024/events-opjj-3'],
},
```

The photo stays in S3 (free to "unhide" later by removing the entry). No script run needed.

### Removing an entire project

1. Delete the project from `data.ts`.
2. Manually delete its prefix from S3 (`aws s3 rm s3://openpresent/web-assets/jaecha/<project-id>/ --recursive`). The upload script won't do this automatically — it's a destructive operation on a whole category.
3. Run `npm run jaecha:upload -- --source "..."` to regenerate `photos.ts` without the removed project.

---

## Reordering photos

**No script run needed.** Edit `src/app/jaecha/_components/curation.ts`:

```ts
export const CURATION: Record<string, Curation> = {
  'evt-jungle-jungle-2024': {
    order: [
      'evt-jungle-jungle-2024/events-opjj-7',
      'evt-jungle-jungle-2024/events-opjj-3',
      'evt-jungle-jungle-2024/events-opjj-1',
    ],
    hero: 'evt-jungle-jungle-2024/events-opjj-7',
  },
};
```

**Photo IDs are always in the form `<project-id>/<slug>`** — that matches the
`id` field in `photos.ts`. If you put a bare slug like `'events-opjj-7'` the
match silently fails.

Rules:
- IDs listed in `order` appear first, in that order
- Photos in S3 but not listed in `order` are appended after, in natural sort
- `hero` is the photo featured on the project detail page (defaults to first)
- `hidden` photos are skipped entirely

Save → commit → push. The site picks it up on next deploy (and instantly in dev).

### Curating the home grid

The `/jaecha` scattered grid pulls across all portfolio projects by default. To pin specific photos for a project:

```ts
'evt-jungle-jungle-2024': {
  homeGridPicks: [
    'evt-jungle-jungle-2024/events-opjj-7',
    'evt-jungle-jungle-2024/events-opjj-3',
  ],
},
```

Empty / missing `homeGridPicks` = all visible photos from the project are eligible.

---

## Swapping the bio / contact photo

The `/jaecha/contact` page shows a single self-portrait of Jae. It lives in
a dedicated "Info" project (`id: 'info'`, source folder `Info Self Portrait/`),
not a portfolio project — it's filtered out of `PORTFOLIO_PROJECTS`, the home
grid, portrait rows, gallery pages, and the `/jaecha/p/[id]` route.

The page resolves the photo via `getProjectHero('info')`, which respects the
curation file. So you can have multiple uploaded self-portraits and choose
one as the "live" pick without re-running the upload script.

### Pick a different bio photo

1. Make sure both old + new are present in `Portfolio 2026/Info Self Portrait/`.
2. Run `npm run jaecha:upload -- --source "/path/to/Portfolio 2026"` so the
   new file lands in S3 and `photos.ts` gets its metadata.
3. Edit `_components/curation.ts`:

   ```ts
   info: {
     hero: 'info/<new-slug>',        // ← the new pick
     hidden: ['info/<old-slug>'],    // ← keeps S3 copy but hides from the site
   },
   ```

4. Commit `photos.ts` (if it changed) and `curation.ts`. Done.

### Replace the bio photo entirely (delete the old one)

1. Remove the old file from `Portfolio 2026/Info Self Portrait/`, drop in the new one.
2. Run `npm run jaecha:upload -- --source "..." --prune` — the script detects
   the missing file, deletes its S3 variants, and excludes it from `photos.ts`.
3. Update `_components/curation.ts` `info.hero` to the new slug (and remove the
   stale `hidden` entry if any).
4. Commit `photos.ts` and `curation.ts`.

If only one photo lives in `Info Self Portrait/`, you can skip the `hero`
override — `getProjectHero('info')` falls back to the only visible photo.

---

## How categories work (Info vs Portfolio)

`PROJECTS` in `data.ts` includes every uploadable collection — portfolio work
**and** the bio "Info" entry. Two helpers split them:

- `PROJECTS` — the raw list. Use only for: upload-script iteration, and the
  `/jaecha/p/[id]` route (which needs to find any project by ID, then guards
  `Info` separately with `notFound()`).
- `PORTFOLIO_PROJECTS` — `PROJECTS` minus `category === 'Info'`. Use everywhere
  on the site that means "the actual photography work": home grid, portrait
  rows, gallery pages, navigation.

When you add a new top-level kind of work (say, a future "Editorial" category),
add it to `Category` in `data.ts`, give it a couple `PROJECTS` entries, and it
flows through `PORTFOLIO_PROJECTS` automatically. If you add something that
*shouldn't* appear in the portfolio (like another sidebar/bio asset), use
`category: 'Info'` — or extend the filter in `PORTFOLIO_PROJECTS`.

---

## Useful script flags

```bash
# Upload everything (the default workflow)
npm run jaecha:upload -- --source "/Volumes/.../Portfolio 2026"

# One project only (faster iteration when testing a new project)
npm run jaecha:upload -- --source "..." --project evt-pinky-promise-2026
# ⚠ does NOT rewrite photos.ts. Run a full pass after.

# See what would happen without writing anything
npm run jaecha:upload -- --source "..." --dry-run

# Detect & delete S3 photos whose source files have been removed
npm run jaecha:upload -- --source "..." --prune

# Skip the "Proceed?" confirmation (CI / scripting)
npm run jaecha:upload -- --source "..." --yes
```

## Variant sizes & format

| Size | Width (px) | Use case | Approx file size (AVIF) |
|------|------|------|------|
| `thumb` | 400 | Small grid thumbnails | 20–40 KB |
| `medium` | 1200 | Default display | 80–200 KB |
| `large` | 2400 | Zoom overlay, retina detail pages | 250–600 KB |

Each size is encoded as both AVIF (default) and WebP (fallback for older browsers). The `<JaePhoto>` component lets Next.js's image optimizer pick.

Originals stay on the LaCie drive as archival.

## Troubleshooting

**`AccessDenied` on upload**
The IAM user in `.env.local` needs `s3:PutObject`, `s3:HeadObject`, and (for `--prune`) `s3:DeleteObject` on `arn:aws:s3:::openpresent/web-assets/jaecha/*`.

**`ENOENT` reading source folder**
Make sure the LaCie drive is mounted and the `--source` path is exactly right (quote it — there are spaces).

**Filename slug collision error**
Two source files slugified to the same string (e.g. `My Photo.jpg` and `my-photo.jpg`). Rename one and re-run.

**Photo orientation wrong**
The script applies EXIF orientation via `sharp().rotate()`. If a specific photo's still sideways, the EXIF tag may be missing or wrong — fix it in the original or rotate the file itself.

**Want to invalidate CloudFront cache after re-uploading**
Variants are uploaded with `Cache-Control: max-age=31536000, immutable`. Replacing a photo with the *same slug* hits the same S3 key — CloudFront will keep serving the old version until cache expires. Either:
- Bump a query string in the `<JaePhoto>` URL (one-off, no infra change), or
- Run a CloudFront invalidation: `aws cloudfront create-invalidation --distribution-id <id> --paths "/jaecha/<project-id>/<slug>*"` (no `web-assets/` — invalidation paths use the public URL form)
