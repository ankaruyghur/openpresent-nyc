'use client';

import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { activateOnKey } from '../../_components/a11y';
import { getProjectHero, getProjectPhotos } from '../../_components/curation';
import { PALETTE, PROJECTS, subFromSlug } from '../../_components/data';
import { JaePhoto } from '../../_components/JaePhoto';
import type { JaePhoto as JaePhotoMeta } from '../../_components/photo-types';
import { ZoomOverlay } from '../../_components/ZoomOverlay';
import { useIsMobile } from '../../_components/useIsMobile';

export default function SubSectionGallery() {
  const params = useParams<{ sub: string }>();
  const sub = subFromSlug(params.sub);
  const isMobile = useIsMobile();
  const [zoomed, setZoomed] = useState<JaePhotoMeta | null>(null);
  const [viewport, setViewport] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const update = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  if (!sub) {
    notFound();
  }

  const isEnv = sub === 'Environmental';
  const pad = isMobile ? 20 : 60;
  const subProjects = PROJECTS.filter((p) => p.sub === sub);

  // For Environmental, photos = the single project's photos.
  // For Events / BTS, photos = one hero per project (linking to project detail).
  const envPhotos: JaePhotoMeta[] = isEnv && subProjects[0]
    ? getProjectPhotos(subProjects[0].id)
    : [];

  const projectHeroes = isEnv
    ? []
    : subProjects
        .map((p) => ({ project: p, hero: getProjectHero(p.id) }))
        .filter((x): x is { project: typeof subProjects[number]; hero: JaePhotoMeta } => x.hero !== null);

  const rowH = viewport ? Math.round(viewport.h * (isMobile ? 0.45 : 0.65)) : 600;
  const gridImgW = isMobile ? 300 : Math.round(rowH / 1.38);
  const envImgW = isMobile ? '80vw' : '42vw';
  const envImgH = viewport ? Math.round(viewport.h * (isMobile ? 0.75 : 0.85)) : 720;

  return (
    <div style={{ minHeight: '100vh', background: PALETTE.bone, paddingTop: 64, position: 'relative' }}>
      <div style={{ padding: `32px ${pad}px 16px`, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link
          href="/jaecha/portraits"
          style={{
            fontFamily: 'var(--font-jae-mono), monospace',
            fontSize: 10,
            color: PALETTE.gray3,
            letterSpacing: 0.8,
            textDecoration: 'none',
          }}
        >
          ← Portraits
        </Link>
        <span style={{ color: PALETTE.gray2 }}>|</span>
        <span
          style={{
            fontFamily: 'var(--font-jae-serif), Georgia, serif',
            fontSize: 13,
            color: PALETTE.dark,
            letterSpacing: 3,
            textTransform: 'uppercase',
          }}
        >
          {sub}
        </span>
      </div>

      {isEnv ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? 32 : 48,
            padding: '24px 0 80px',
          }}
        >
          {envPhotos.map((photo, i) => {
            const alignRight = i % 2 === 1;
            return (
              <div
                key={photo.id}
                role="button"
                tabIndex={0}
                data-cursor="hover"
                aria-label={`Zoom into ${photo.alt}`}
                onClick={() => setZoomed(photo)}
                onKeyDown={activateOnKey(() => setZoomed(photo))}
                style={{
                  display: 'flex',
                  justifyContent: isMobile ? 'center' : alignRight ? 'flex-end' : 'flex-start',
                  paddingLeft: !isMobile && !alignRight ? '8vw' : isMobile ? pad : undefined,
                  paddingRight: !isMobile && alignRight ? '8vw' : isMobile ? pad : undefined,
                  cursor: 'zoom-in',
                }}
              >
                <div
                  style={{
                    width: envImgW,
                    height: envImgH,
                    position: 'relative',
                    transition: 'transform 0.3s ease',
                    boxShadow: `0 6px 32px ${PALETTE.dark}10`,
                  }}
                  onMouseEnter={(e) => {
                    if (!isMobile) e.currentTarget.style.transform = 'scale(1.008)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isMobile) e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <JaePhoto
                    photo={photo}
                    size="medium"
                    sizes={isMobile ? '80vw' : '42vw'}
                    priority={i < 2}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : `repeat(auto-fill, minmax(${gridImgW}px, 1fr))`,
            gap: isMobile ? 20 : 16,
            padding: `16px ${pad}px ${pad}px`,
          }}
        >
          {projectHeroes.map(({ project, hero }) => (
            <Link
              key={project.id}
              href={`/jaecha/p/${project.id}`}
              style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{ width: '100%', height: rowH, position: 'relative' }}>
                <JaePhoto photo={hero} size="medium" sizes={isMobile ? '100vw' : `${gridImgW}px`} />
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-jae-mono), monospace',
                  fontSize: 9,
                  color: PALETTE.gray4,
                  letterSpacing: 0.7,
                  marginTop: 10,
                }}
              >
                {project.title}
              </div>
            </Link>
          ))}
        </div>
      )}

      {zoomed && <ZoomOverlay photo={zoomed} onClose={() => setZoomed(null)} />}
    </div>
  );
}
