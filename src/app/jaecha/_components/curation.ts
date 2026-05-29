import type { JaePhoto } from './photo-types';
import { PHOTOS } from './photos';

/**
 * Per-project curation: human-edited display order, hero shot, hidden drafts.
 *
 * The upload script populates `photos.ts` with every photo it finds in S3.
 * This file decides what the site actually shows and in what order.
 *
 * Keys are project IDs (must match data.ts). Values:
 *   order:         Photo IDs (= source slugs) in display order. Photos in
 *                  PHOTOS but not in `order` are appended after, in natural sort.
 *   hero:          Photo ID rendered as the hero on the project detail page.
 *                  Defaults to the first photo in the resolved order.
 *   hidden:        Photo IDs that have been uploaded but should NOT appear on
 *                  the site (drafts, alternate edits, etc.).
 *   homeGridPicks: Optional override for which photos from this project
 *                  appear on the /jaecha home grid. Empty = use whole order.
 *
 * Editing this file does NOT require re-running the upload script.
 */
export type Curation = {
  order?: string[];
  hero?: string;
  hidden?: string[];
  homeGridPicks?: string[];
};

export const CURATION: Record<string, Curation> = {
  // The contact page shows getProjectHero('info'). The other Info photo
  // stays uploaded but is excluded from rendering via `hidden`.
  info: {
    hero: 'info/pinkypromise2-13-16-27',
    hidden: ['info/pinkypromise2-13-16-26'],
  },

  // Add per-project overrides here as we curate. Example shape:
  //
  // 'evt-jungle-jungle-2024': {
  //   order: ['evt-jungle-jungle-2024/jj-007', 'evt-jungle-jungle-2024/jj-003'],
  //   hero: 'evt-jungle-jungle-2024/jj-007',
  //   hidden: ['evt-jungle-jungle-2024/jj-099'],
  // },
};

/**
 * Cross-project home-grid sequence. Order matches Jae's `Homepage/` folder
 * (Homepage-1.jpg → first tile, Homepage-2.jpg → second, …). IDs unknown to
 * PHOTOS are silently dropped, so this list survives renames if you re-run
 * the upload script.
 */
export const HOME_GRID: string[] = [
  'bts-a-preserving-sweet-2023/bts-aps-1',         // Homepage-1
  'env/portrait-env-1',                            // Homepage-2
  'evt-jungle-jungle-2024/events-opjj-1',          // Homepage-3
  'env/portrait-env-2',                            // Homepage-4
  'env/portrait-env-3',                            // Homepage-5
  'bts-america-fever-malibu/bts-afm-2',            // Homepage-6
  'bts-america-fever-lancaster/bts-afl-1',         // Homepage-7
  'bts-america-fever-lancaster/bts-afl-8',         // Homepage-8
  'bts-america-fever-lancaster/bts-afl-16',        // Homepage-9
  'env/portrait-env-4',                            // Homepage-10
  'env/portrait-env-6',                            // Homepage-11
  'env/portrait-env-5',                            // Homepage-12
  'env/portrait-env-8',                            // Homepage-13
  'evt-jungle-jungle-2024/events-opjj-4',          // Homepage-14
  'evt-jungle-jungle-2024/events-opjj-7',          // Homepage-15
  'evt-jungle-jungle-2024/events-opjj-3',          // Homepage-16
  'evt-open-soul-vol-iii-2025/events-osviii-1',    // Homepage-17
  'bts-kelsey-kuan-roller-coaster-mv/bts-kkrcmv-1', // Homepage-18
  'env/portrait-env-9',                            // Homepage-19
  'env/portrait-env-10',                           // Homepage-20
  'env/portrait-env-11',                           // Homepage-21
  'evt-pinky-promise-2026/events-oppp-3',          // Homepage-22
  'env/portrait-env-21',                           // Homepage-23
  'env/portrait-env-22',                           // Homepage-24
  'cm-by-way-of-2021-lily/commercial-bwol-1',      // Homepage-25
  'evt-pinky-promise-2026/events-oppp-2',          // Homepage-26
  'env/portrait-env-20',                           // Homepage-27
  'env/portrait-env-19',                           // Homepage-28
  'env/portrait-env-13',                           // Homepage-29
  'env/portrait-env-14',                           // Homepage-30
];

/**
 * Resolve the display order of photos for a project, applying curation.
 *
 * 1. Start with photos uploaded to S3 (from PHOTOS[projectId]).
 * 2. Drop any IDs listed in `hidden`.
 * 3. If `order` is set, sort: listed IDs first (in their listed order),
 *    then unlisted photos in their natural array order.
 */
export function getProjectPhotos(projectId: string): JaePhoto[] {
  const all = PHOTOS[projectId] ?? [];
  const c = CURATION[projectId] ?? {};
  const hiddenSet = new Set(c.hidden ?? []);
  const visible = all.filter((p) => !hiddenSet.has(p.id));

  if (!c.order || c.order.length === 0) return visible;

  const byId = new Map(visible.map((p) => [p.id, p]));
  const ordered: JaePhoto[] = [];
  const seen = new Set<string>();

  for (const id of c.order) {
    if (seen.has(id)) continue; // Tolerate duplicate IDs in `order`.
    const p = byId.get(id);
    if (p) {
      ordered.push(p);
      seen.add(id);
    }
  }
  for (const p of visible) {
    if (!seen.has(p.id)) ordered.push(p);
  }
  return ordered;
}

/**
 * The "hero" photo for a project: explicit curation pick if present, otherwise
 * the first photo in the resolved order. Returns null if the project has no
 * uploaded photos yet.
 */
export function getProjectHero(projectId: string): JaePhoto | null {
  const c = CURATION[projectId] ?? {};
  const photos = getProjectPhotos(projectId);
  if (c.hero) {
    const match = photos.find((p) => p.id === c.hero);
    if (match) return match;
  }
  return photos[0] ?? null;
}

/**
 * The photos to feature on the /jaecha home grid for a given project.
 * Defaults to the full curated order; can be narrowed via `homeGridPicks`.
 */
export function getHomeGridPicks(projectId: string): JaePhoto[] {
  const c = CURATION[projectId] ?? {};
  const photos = getProjectPhotos(projectId);
  if (!c.homeGridPicks || c.homeGridPicks.length === 0) return photos;
  const pickSet = new Set(c.homeGridPicks);
  return photos.filter((p) => pickSet.has(p.id));
}

/**
 * Resolve HOME_GRID (cross-project sequence) into a list of photos in
 * Jae's intended order. IDs that no longer exist in PHOTOS are dropped.
 */
export function getHomeGrid(): JaePhoto[] {
  const byId = new Map<string, JaePhoto>();
  for (const list of Object.values(PHOTOS)) {
    for (const p of list) byId.set(p.id, p);
  }
  const out: JaePhoto[] = [];
  for (const id of HOME_GRID) {
    const p = byId.get(id);
    if (p) out.push(p);
  }
  return out;
}
