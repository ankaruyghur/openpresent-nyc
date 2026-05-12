'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { activateOnKey } from './a11y';
import { PALETTE } from './data';
import { JaePhoto } from './JaePhoto';
import type { JaePhoto as JaePhotoMeta } from './photo-types';
import { ZoomOverlay } from './ZoomOverlay';
import { useIsMobile } from './useIsMobile';

type ZoomItem = { kind: 'zoom'; photo: JaePhotoMeta };
type LinkItem = { kind: 'link'; photo: JaePhotoMeta; href: string; caption?: string };
export type RowItem = ZoomItem | LinkItem;

type Props = {
  label: string;
  items: RowItem[];
  viewAllHref: string;
};

/**
 * Horizontal row of up to 3 photo tiles, displayed under a label with a
 * "view all" affordance. Each item is either a click-to-zoom tile (used for
 * Environmental, which is one flat collection) or a link-out tile (used for
 * Events / Behind the Scenes, where each tile represents a project).
 */
export function PortraitRow({ label, items, viewAllHref }: Props) {
  const isMobile = useIsMobile();
  const pad = isMobile ? 20 : 60;
  const gap = isMobile ? 12 : 16;
  const shown = items.slice(0, 3);
  const [zoomed, setZoomed] = useState<number | null>(null);
  const [imgW, setImgW] = useState(360);

  useEffect(() => {
    const update = () => {
      const availW = window.innerWidth - pad * 2;
      const w = isMobile
        ? Math.round(window.innerWidth * 0.7)
        : Math.floor((availW - gap * (shown.length - 1)) / Math.max(shown.length, 1));
      setImgW(w);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [isMobile, pad, gap, shown.length]);

  const rowH = Math.round(imgW * 1.38);
  const zoomedItem = zoomed !== null && shown[zoomed]?.kind === 'zoom' ? (shown[zoomed] as ZoomItem) : null;

  if (shown.length === 0) {
    return null;
  }

  const tileSizes = isMobile ? `${imgW}px` : `${Math.round(100 / shown.length)}vw`;

  return (
    <div style={{ marginBottom: 0, position: 'relative' }}>
      <div style={{ padding: `32px ${pad}px 16px`, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            fontFamily: 'var(--font-jae-serif), Georgia, serif',
            fontSize: 12,
            color: PALETTE.dark,
            letterSpacing: 3,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </div>
        <Link
          href={viewAllHref}
          aria-label={`View all ${label}`}
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            border: `1px solid ${PALETTE.gray3}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            color: PALETTE.gray3,
            fontFamily: 'var(--font-jae-mono), monospace',
            lineHeight: 1,
            transition: 'all 0.2s ease',
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = PALETTE.dark;
            e.currentTarget.style.color = PALETTE.dark;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = PALETTE.gray3;
            e.currentTarget.style.color = PALETTE.gray3;
          }}
        >
          +
        </Link>
      </div>
      <div
        className="jae-scroll"
        style={{
          display: 'flex',
          gap,
          padding: `0 ${pad}px 32px`,
          overflowX: isMobile ? 'auto' : 'hidden',
          overflowY: 'hidden',
        }}
      >
        {shown.map((item, i) => {
          const tileStyle = {
            flex: isMobile ? `0 0 ${imgW}px` : '1 1 0%',
            cursor: item.kind === 'zoom' ? 'zoom-in' : 'pointer',
          } as const;
          const tile = (
            <div style={{ width: '100%', height: rowH, position: 'relative' }}>
              <JaePhoto photo={item.photo} size="medium" sizes={tileSizes} />
            </div>
          );

          if (item.kind === 'zoom') {
            return (
              <div
                key={item.photo.id}
                role="button"
                tabIndex={0}
                aria-label={`Zoom into ${item.photo.alt}`}
                onClick={() => setZoomed(i)}
                onKeyDown={activateOnKey(() => setZoomed(i))}
                style={tileStyle}
              >
                {tile}
              </div>
            );
          }
          return (
            <Link
              key={item.photo.id}
              href={item.href}
              style={{ ...tileStyle, textDecoration: 'none', color: 'inherit' }}
            >
              {tile}
              {item.caption && (
                <div
                  style={{
                    fontFamily: 'var(--font-jae-mono), monospace',
                    fontSize: 9,
                    color: PALETTE.gray4,
                    letterSpacing: 0.7,
                    marginTop: 10,
                  }}
                >
                  {item.caption}
                </div>
              )}
            </Link>
          );
        })}
        {isMobile && <div style={{ flex: '0 0 20px' }} />}
      </div>
      <div style={{ height: 1, background: PALETTE.gray2, margin: `0 ${pad}px` }} />

      {zoomedItem && (
        <ZoomOverlay photo={zoomedItem.photo} onClose={() => setZoomed(null)} />
      )}
    </div>
  );
}
