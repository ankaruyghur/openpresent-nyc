'use client';

import { useEffect, useState } from 'react';
import { activateOnKey } from './a11y';
import { PALETTE } from './data';
import { JaePhoto } from './JaePhoto';
import type { JaePhoto as JaePhotoMeta } from './photo-types';
import { ZoomOverlay } from './ZoomOverlay';
import { useIsMobile } from './useIsMobile';

type Props = {
  title: string;
  photos: JaePhotoMeta[];
  /** Index of photo to render full-width as a hero. Null = none. */
  featuredIndex?: number | null;
};

/**
 * Two-column scattered grid for flat collections (Still Life, Landscape).
 * Each tile zooms in place; one photo can be highlighted as a full-width hero.
 */
export function ScatteredGallery({ title, photos, featuredIndex = null }: Props) {
  const isMobile = useIsMobile();
  const pad = isMobile ? 16 : 60;
  const [zoomed, setZoomed] = useState<JaePhotoMeta | null>(null);
  const [viewport, setViewport] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const update = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: PALETTE.bone, paddingTop: 64, position: 'relative' }}>
      <div
        style={{
          padding: `32px ${pad}px 16px`,
          fontFamily: 'var(--font-jae-serif), Georgia, serif',
          fontSize: 13,
          color: PALETTE.dark,
          letterSpacing: 3,
          textTransform: 'uppercase',
        }}
      >
        {title}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? 12 : 16,
          padding: `8px ${pad}px 60px`,
        }}
      >
        {photos.map((photo, i) => {
          const isFeatured = i === featuredIndex;
          const baseH = viewport
            ? isMobile
              ? Math.round(viewport.w * 1.1)
              : Math.round((viewport.h - 64) * 0.7)
            : 600;
          const tileH = isFeatured && !isMobile ? Math.round(baseH * 1.1) : baseH;
          const sizes = isFeatured && !isMobile ? '100vw' : isMobile ? '100vw' : '50vw';
          return (
            <div
              key={photo.id}
              role="button"
              tabIndex={0}
              aria-label={`Zoom into ${photo.alt}`}
              onClick={() => setZoomed(photo)}
              onKeyDown={activateOnKey(() => setZoomed(photo))}
              style={{
                cursor: 'zoom-in',
                position: 'relative',
                width: '100%',
                height: tileH,
                transition: 'transform 0.3s ease',
                gridColumn: isFeatured && !isMobile ? 'span 2' : undefined,
                boxShadow: isFeatured
                  ? `0 8px 40px ${PALETTE.dark}18`
                  : `0 4px 20px ${PALETTE.dark}10`,
              }}
              onMouseEnter={(e) => {
                if (!isMobile) e.currentTarget.style.transform = 'scale(1.01)';
              }}
              onMouseLeave={(e) => {
                if (!isMobile) e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <JaePhoto photo={photo} size="medium" sizes={sizes} priority={i < 2} />
            </div>
          );
        })}
      </div>

      {zoomed && <ZoomOverlay photo={zoomed} onClose={() => setZoomed(null)} />}
    </div>
  );
}
