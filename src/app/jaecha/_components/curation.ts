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
