'use client';

import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { activateOnKey } from '../../_components/a11y';
import { getProjectPhotos } from '../../_components/curation';
import { INFO_PROJECT_ID, PALETTE, PROJECTS, type Project, subSlug } from '../../_components/data';
import { Footer } from '../../_components/Footer';
import { JaePhoto } from '../../_components/JaePhoto';
import type { JaePhoto as JaePhotoMeta } from '../../_components/photo-types';
import { ZoomOverlay } from '../../_components/ZoomOverlay';
import { useIsMobile } from '../../_components/useIsMobile';

type RowFull = { type: 'full'; idx: number };
type RowWide = { type: 'wide'; idx: number };
type RowPair = { type: 'pair'; idx1: number; idx2: number };
type RowTrio = { type: 'trio'; idx1: number; idx2: number; idx3: number };
type Row = RowFull | RowWide | RowPair | RowTrio;

function categoryHref(project: Project): { href: string; label: string } {
  switch (project.category) {
    case 'Portraits':
      return project.sub
        ? { href: `/jaecha/portraits/${subSlug(project.sub)}`, label: project.sub }
        : { href: '/jaecha/portraits', label: 'Portraits' };
    case 'Still Life':
      return { href: '/jaecha/still-life', label: 'Still Life' };
    case 'Landscape':
      return { href: '/jaecha/landscape', label: 'Landscape' };
    case 'Commercial':
      return { href: '/jaecha/commercial', label: 'Commercial' };
    case 'Info':
      // Unreachable — the route guards Info projects via notFound() before this
      // function runs. Fall back to the portfolio home if we somehow get here.
      return { href: '/jaecha', label: 'Home' };
  }
}

/**
 * Pack a photo set into mixed layout rows (full / wide / pair / trio) while
 * matching each photo to a slot that suits its orientation.
 *
 * Rules:
 *   - Portrait (aspect < 0.85): `full` slot (1100×580) — closest fit without
 *     forcing landscape crop. Pairs only with another adjacent portrait.
 *   - Landscape (aspect > 1.2): `wide` slot (1100×420) — preserves wide framing.
 *     Pairs/trios only when the next 1 or 2 photos are also landscape.
 *   - Square (0.85–1.2): `full` slot — fits cleanly in the tall box.
 *
 * Order is never changed — we step through `photos` in array order so Jae's
 * curated sequence is preserved exactly. `allowMultiCol=false` on mobile
 * collapses everything to single-column rows.
 */
function buildLayout(photos: JaePhotoMeta[], allowMultiCol: boolean): Row[] {
  if (photos.length === 0) return [];
  const rows: Row[] = [];
  let i = 0;

  const aspect = (p: JaePhotoMeta) => p.width / p.height;
  const isLandscape = (p: JaePhotoMeta) => aspect(p) > 1.2;
  const isPortrait = (p: JaePhotoMeta) => aspect(p) < 0.85;

  while (i < photos.length) {
    const p1 = photos[i];
    const p2 = photos[i + 1];
    const p3 = photos[i + 2];

    if (allowMultiCol && p2 && p3 && isLandscape(p1) && isLandscape(p2) && isLandscape(p3)) {
      rows.push({ type: 'trio', idx1: i, idx2: i + 1, idx3: i + 2 });
      i += 3;
      continue;
    }
    if (allowMultiCol && p2 && isLandscape(p1) && isLandscape(p2)) {
      rows.push({ type: 'pair', idx1: i, idx2: i + 1 });
      i += 2;
      continue;
    }
    if (allowMultiCol && p2 && isPortrait(p1) && isPortrait(p2)) {
      rows.push({ type: 'pair', idx1: i, idx2: i + 1 });
      i += 2;
      continue;
    }
    if (isLandscape(p1)) {
      rows.push({ type: 'wide', idx: i });
      i++;
      continue;
    }
    // Portrait or square → tall full slot.
    rows.push({ type: 'full', idx: i });
    i++;
  }

  return rows;
}

export default function ProjectDetail() {
  const params = useParams<{ id: string }>();
  const project = PROJECTS.find((p) => p.id === params.id);
  const isMobile = useIsMobile();
  const [zoomed, setZoomed] = useState<JaePhotoMeta | null>(null);

  const photos = useMemo(() => (project ? getProjectPhotos(project.id) : []), [project]);

  const layout = useMemo(
    () => (project ? buildLayout(photos, !isMobile) : []),
    [project, photos, isMobile],
  );

  if (!project || project.id === INFO_PROJECT_ID) {
    // The bio "project" isn't browsable as a portfolio piece.
    notFound();
  }

  const allInCategory = PROJECTS.filter((p) => p.category === project.category && p.sub === project.sub);
  const currentIdx = allInCategory.findIndex((p) => p.id === project.id);
  const nextProject = allInCategory[(currentIdx + 1) % allInCategory.length];
  const prevProject = allInCategory[(currentIdx - 1 + allInCategory.length) % allInCategory.length];
  const back = categoryHref(project);
  const pad = isMobile ? 20 : 80;

  /**
   * Render a photo at its true aspect ratio inside a slot box. The wrapper
   * has the slot's max width/height; the photo is sized to fit inside without
   * cropping (whichever dimension is the binding constraint).
   */
  function PhotoTile({
    photo,
    maxWidth,
    maxHeight,
    sizes,
    label,
    priority,
  }: {
    photo: JaePhotoMeta;
    /** Slot max width — CSS string (e.g. "100%", "50%") or px number. */
    maxWidth: string | number;
    /** Slot max height in px. The photo will never exceed this. */
    maxHeight: number;
    sizes: string;
    label: string;
    priority?: boolean;
  }) {
    const aspect = photo.width / photo.height;
    // Compute the actual rendered photo size, capped by both axes.
    // Use a CSS variable so width="50%" still works for paired layouts.
    const widthStyle = typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth;
    return (
      <div
        style={{
          flex: typeof maxWidth === 'string' && maxWidth.endsWith('%') ? `0 1 ${maxWidth}` : `0 0 ${widthStyle}`,
          maxWidth: widthStyle,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          role="button"
          tabIndex={0}
          data-cursor="hover"
          aria-label={`Zoom into ${label}`}
          onClick={() => setZoomed(photo)}
          onKeyDown={activateOnKey(() => setZoomed(photo))}
          style={{
            // Photo box: respect the actual aspect ratio, bounded by slot.
            aspectRatio: `${photo.width} / ${photo.height}`,
            maxHeight,
            maxWidth: '100%',
            // Width derived from height when height is the binding constraint.
            width: `min(100%, ${maxHeight * aspect}px)`,
            position: 'relative',
            cursor: 'zoom-in',
          }}
        >
          <JaePhoto photo={photo} size="medium" sizes={sizes} priority={priority} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: PALETTE.bone, paddingTop: 64 }}>
      <div style={{ padding: `40px ${pad}px 24px`, maxWidth: 1100 }}>
        <Link
          href={back.href}
          style={{
            fontFamily: 'var(--font-jae-mono), monospace',
            fontSize: 10,
            color: PALETTE.gray3,
            marginBottom: 20,
            letterSpacing: 0.8,
            display: 'inline-block',
            textDecoration: 'none',
          }}
        >
          ← Back to {back.label}
        </Link>
        <h1
          style={{
            fontFamily: 'var(--font-jae-serif), Georgia, serif',
            fontSize: isMobile ? 22 : 32,
            fontWeight: 400,
            color: PALETTE.dark,
            margin: '0 0 8px',
            letterSpacing: 0.5,
          }}
        >
          {project.title}
        </h1>
        <div
          style={{
            fontFamily: 'var(--font-jae-mono), monospace',
            fontSize: 10,
            color: PALETTE.gray4,
            letterSpacing: 0.8,
          }}
        >
          {project.sub ? `${project.category} — ${project.sub}` : project.category}
          {photos.length > 0 ? ` · ${photos.length} photograph${photos.length === 1 ? '' : 's'}` : ''}
        </div>
      </div>

      <div style={{ padding: `0 ${pad}px 40px`, maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : 24 }}>
          {layout.map((row, i) => {
            if (row.type === 'full') {
              const photo = photos[row.idx];
              if (!photo) return null;
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'center' }}>
                  <PhotoTile
                    photo={photo}
                    maxWidth="100%"
                    maxHeight={isMobile ? 520 : 800}
                    sizes={isMobile ? '100vw' : '1100px'}
                    label={photo.alt}
                    priority={i === 0}
                  />
                </div>
              );
            }
            if (row.type === 'wide') {
              const photo = photos[row.idx];
              if (!photo) return null;
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'center' }}>
                  <PhotoTile
                    photo={photo}
                    maxWidth="100%"
                    maxHeight={isMobile ? 300 : 540}
                    sizes={isMobile ? '100vw' : '1100px'}
                    label={photo.alt}
                  />
                </div>
              );
            }
            if (row.type === 'pair') {
              const a = photos[row.idx1];
              const b = photos[row.idx2];
              if (!a || !b) return null;
              const isPortraitPair = a.width / a.height < 0.85 && b.width / b.height < 0.85;
              const pairMaxHeight = isPortraitPair ? 700 : 520;
              return (
                <div key={i} style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
                  <PhotoTile photo={a} maxWidth="50%" maxHeight={pairMaxHeight} sizes="550px" label={a.alt} />
                  <PhotoTile photo={b} maxWidth="50%" maxHeight={pairMaxHeight} sizes="550px" label={b.alt} />
                </div>
              );
            }
            const a = photos[row.idx1];
            const b = photos[row.idx2];
            const c = photos[row.idx3];
            if (!a || !b || !c) return null;
            return (
              <div key={i} style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
                <PhotoTile photo={a} maxWidth="33.3%" maxHeight={400} sizes="370px" label={a.alt} />
                <PhotoTile photo={b} maxWidth="33.3%" maxHeight={400} sizes="370px" label={b.alt} />
                <PhotoTile photo={c} maxWidth="33.3%" maxHeight={400} sizes="370px" label={c.alt} />
              </div>
            );
          })}
        </div>
      </div>

      {nextProject && prevProject && allInCategory.length > 1 && (
        <div
          style={{
            display: 'flex',
            borderTop: `1px solid ${PALETTE.gray2}`,
            flexDirection: isMobile ? 'column' : 'row',
          }}
        >
          <Link
            href={`/jaecha/p/${prevProject.id}`}
            style={{
              flex: 1,
              padding: isMobile ? '24px 20px' : '40px 80px',
              borderRight: isMobile ? 'none' : `1px solid ${PALETTE.gray2}`,
              borderBottom: isMobile ? `1px solid ${PALETTE.gray2}` : 'none',
              transition: 'background 0.15s',
              textDecoration: 'none',
              color: 'inherit',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = PALETTE.boneDark)}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{ fontFamily: 'var(--font-jae-mono), monospace', fontSize: 9, color: PALETTE.gray3, letterSpacing: 1, marginBottom: 8 }}>
              ← PREVIOUS
            </div>
            <div style={{ fontFamily: 'var(--font-jae-serif), Georgia, serif', fontSize: isMobile ? 14 : 16, color: PALETTE.dark }}>
              {prevProject.title}
            </div>
          </Link>
          <Link
            href={`/jaecha/p/${nextProject.id}`}
            style={{
              flex: 1,
              padding: isMobile ? '24px 20px' : '40px 80px',
              textAlign: isMobile ? 'left' : 'right',
              transition: 'background 0.15s',
              textDecoration: 'none',
              color: 'inherit',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = PALETTE.boneDark)}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{ fontFamily: 'var(--font-jae-mono), monospace', fontSize: 9, color: PALETTE.gray3, letterSpacing: 1, marginBottom: 8 }}>
              NEXT →
            </div>
            <div style={{ fontFamily: 'var(--font-jae-serif), Georgia, serif', fontSize: isMobile ? 14 : 16, color: PALETTE.dark }}>
              {nextProject.title}
            </div>
          </Link>
        </div>
      )}

      <Footer />

      {zoomed && <ZoomOverlay photo={zoomed} onClose={() => setZoomed(null)} />}
    </div>
  );
}
