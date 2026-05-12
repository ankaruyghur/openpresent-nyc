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
 * Pack a photo set into mixed layout rows (full / wide / pair / trio).
 * Deterministic per project id so revisiting renders the same layout.
 * `allowMultiCol=false` on mobile collapses everything to single-column rows.
 */
function buildLayout(project: Project, photoCount: number, allowMultiCol: boolean): Row[] {
  if (photoCount <= 0) return [];
  const rows: Row[] = [];
  let remaining = photoCount;
  let idx = 0;
  rows.push({ type: 'full', idx: idx++ });
  remaining--;
  while (remaining > 0) {
    const r = (idx * 7 + project.id.charCodeAt(0)) % 4;
    if (allowMultiCol && r === 0 && remaining >= 2) {
      rows.push({ type: 'pair', idx1: idx, idx2: idx + 1 });
      idx += 2;
      remaining -= 2;
    } else if (allowMultiCol && r === 1 && remaining >= 3) {
      rows.push({ type: 'trio', idx1: idx, idx2: idx + 1, idx3: idx + 2 });
      idx += 3;
      remaining -= 3;
    } else if (r === 2) {
      rows.push({ type: 'wide', idx: idx++ });
      remaining--;
    } else {
      rows.push({ type: 'full', idx: idx++ });
      remaining--;
    }
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
    () => (project ? buildLayout(project, photos.length, !isMobile) : []),
    [project, photos.length, isMobile],
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

  function PhotoTile({
    photo,
    width,
    height,
    sizes,
    label,
    priority,
  }: {
    photo: JaePhotoMeta;
    width: string;
    height: number;
    sizes: string;
    label: string;
    priority?: boolean;
  }) {
    return (
      <div
        role="button"
        tabIndex={0}
        aria-label={`Zoom into ${label}`}
        onClick={() => setZoomed(photo)}
        onKeyDown={activateOnKey(() => setZoomed(photo))}
        style={{
          width,
          height,
          position: 'relative',
          cursor: 'zoom-in',
        }}
      >
        <JaePhoto photo={photo} size="medium" sizes={sizes} priority={priority} />
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

      <div style={{ padding: `0 ${pad}px 40px`, maxWidth: 1100 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : 24 }}>
          {layout.map((row, i) => {
            if (row.type === 'full') {
              const photo = photos[row.idx];
              if (!photo) return null;
              return (
                <PhotoTile
                  key={i}
                  photo={photo}
                  width="100%"
                  height={isMobile ? 300 : 580}
                  sizes={isMobile ? '100vw' : '1100px'}
                  label={photo.alt}
                  priority={i === 0}
                />
              );
            }
            if (row.type === 'wide') {
              const photo = photos[row.idx];
              if (!photo) return null;
              return (
                <PhotoTile
                  key={i}
                  photo={photo}
                  width="100%"
                  height={isMobile ? 240 : 420}
                  sizes={isMobile ? '100vw' : '1100px'}
                  label={photo.alt}
                />
              );
            }
            if (row.type === 'pair') {
              const a = photos[row.idx1];
              const b = photos[row.idx2];
              if (!a || !b) return null;
              return (
                <div key={i} style={{ display: 'flex', gap: 24 }}>
                  <PhotoTile photo={a} width="50%" height={520} sizes="550px" label={a.alt} />
                  <PhotoTile photo={b} width="50%" height={520} sizes="550px" label={b.alt} />
                </div>
              );
            }
            const a = photos[row.idx1];
            const b = photos[row.idx2];
            const c = photos[row.idx3];
            if (!a || !b || !c) return null;
            return (
              <div key={i} style={{ display: 'flex', gap: 24 }}>
                <PhotoTile photo={a} width="33.3%" height={400} sizes="370px" label={a.alt} />
                <PhotoTile photo={b} width="33.3%" height={400} sizes="370px" label={b.alt} />
                <PhotoTile photo={c} width="33.3%" height={400} sizes="370px" label={c.alt} />
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
