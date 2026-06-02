'use client';

import { useEffect, useMemo, useState } from 'react';
import { activateOnKey } from './_components/a11y';
import { getHomeGrid } from './_components/curation';
import { PALETTE } from './_components/data';
import { JaePhoto } from './_components/JaePhoto';
import type { JaePhoto as JaePhotoMeta } from './_components/photo-types';
import { ZoomOverlay } from './_components/ZoomOverlay';
import { useIsMobile } from './_components/useIsMobile';

type Placement = { left?: string; right?: string; transform?: string };

const DESKTOP_PLACEMENTS: Placement[] = [
  { left: '6vw' },
  { left: 'auto', right: '6vw' },
  { left: '50%', transform: 'translateX(-50%)' },
  { left: '22vw' },
  { left: 'auto', right: '4vw' },
  { left: '10vw' },
  { left: '50%', transform: 'translateX(-50%)' },
  { left: 'auto', right: '10vw' },
  { left: '50vw' },
  { left: '4vw' },
];

const MOBILE_PLACEMENTS: Placement[] = [
  { left: '50%', transform: 'translateX(-50%)' },
  { left: '4vw' },
  { left: 'auto', right: '4vw' },
  { left: '50%', transform: 'translateX(-50%)' },
  { left: '6vw' },
];

const DESKTOP_WIDTHS = ['38vw', '36vw', '40vw', '35vw', '39vw', '37vw', '41vw', '36vw', '38vw', '40vw', '35vw', '38vw', '36vw', '40vw', '37vw', '39vw', '36vw', '38vw', '35vw', '41vw', '37vw', '40vw', '36vw', '38vw', '39vw'];
const MOBILE_WIDTHS = ['82vw', '78vw', '85vw', '80vw', '83vw', '78vw', '84vw', '80vw', '82vw', '85vw', '78vw', '83vw', '80vw', '84vw', '82vw'];

type HomeTile = JaePhotoMeta & { uid: string };

export default function JaechaHome() {
  const isMobile = useIsMobile();
  const [zoomed, setZoomed] = useState<string | null>(null);
  const [viewport, setViewport] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const update = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Jae's curated home-grid sequence — order matches the source `Homepage/`
  // folder (Homepage-1 first, etc). See HOME_GRID in curation.ts.
  const allPhotos = useMemo(() => getHomeGrid(), []);

  const tiles = useMemo<HomeTile[]>(
    () => allPhotos.map((p, i) => ({ ...p, uid: `${p.id}-${i}` })),
    [allPhotos],
  );

  const placements = isMobile ? MOBILE_PLACEMENTS : DESKTOP_PLACEMENTS;
  const widths = isMobile ? MOBILE_WIDTHS : DESKTOP_WIDTHS;

  const imgH = viewport ? Math.round(viewport.h * (isMobile ? 0.55 : 0.72)) : 650;
  const rowH = viewport ? imgH + Math.round(viewport.h * (isMobile ? 0.08 : 0.12)) : 700;

  const zoomedPhoto = zoomed ? tiles.find((t) => t.uid === zoomed) ?? null : null;

  return (
    <div style={{ background: PALETTE.bone, width: '100%', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <div
        className="jae-scroll"
        style={{
          width: '100%',
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingTop: 64,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: '24vh' }}>
          {tiles.map((t, i) => {
            const pl = placements[i % placements.length];
            const w = widths[i % widths.length];
            return (
              <div key={t.uid} style={{ position: 'relative', height: rowH, flexShrink: 0 }}>
                <div
                  role="button"
                  tabIndex={0}
                  data-cursor="hover"
                  aria-label={`Zoom into ${t.alt}`}
                  onClick={() => setZoomed(t.uid)}
                  onKeyDown={activateOnKey(() => setZoomed(t.uid))}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: pl.left,
                    right: pl.right,
                    transform: pl.transform || 'none',
                    width: w,
                    height: imgH,
                    cursor: 'zoom-in',
                    transition: 'transform 0.3s ease',
                    boxShadow: `0 4px 24px ${PALETTE.dark}10`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = `${pl.transform || ''} scale(1.015)`.trim();
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = pl.transform || 'none';
                  }}
                >
                  <JaePhoto
                    photo={t}
                    size="medium"
                    sizes={isMobile ? '85vw' : '40vw'}
                    priority={i < 15}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {zoomedPhoto && (
        <ZoomOverlay photo={zoomedPhoto} onClose={() => setZoomed(null)} />
      )}
    </div>
  );
}
