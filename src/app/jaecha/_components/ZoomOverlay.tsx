'use client';

import { useEffect, useState } from 'react';
import { PALETTE } from './data';
import { JaePhoto } from './JaePhoto';
import type { JaePhoto as JaePhotoMeta } from './photo-types';

type Props = {
  photo: JaePhotoMeta;
  onClose: () => void;
};

/**
 * Full-bleed zoom overlay. Fetches the `large` tier on demand — the medium
 * tier already cached from the grid acts as the visual fallback during load
 * (Next.js does the crossfade via blurDataURL).
 */
export function ZoomOverlay({ photo, onClose }: Props) {
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 520, h: 750 });

  useEffect(() => {
    const update = () => {
      // Fit the photo within ~68%×82% of the viewport while honoring its
      // aspect ratio so we don't crop or letterbox.
      const maxW = window.innerWidth * 0.86;
      const maxH = window.innerHeight * 0.86;
      const ratio = photo.width / photo.height;
      let w = maxW;
      let h = w / ratio;
      if (h > maxH) {
        h = maxH;
        w = h * ratio;
      }
      setSize({ w: Math.round(w), h: Math.round(h) });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [photo.width, photo.height]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock background scrolling while a photo is expanded — site-wide, since this
  // overlay is the single expand mechanism across every jaecha page. A class on
  // <html> drives the CSS lock (see jaecha.css), which freezes both document
  // scroll (taller sub-pages) and the inner `.jae-scroll` container (home grid).
  // A class — not imperative inline styles — so React re-renders can't clobber
  // the lock on the `.jae-scroll` element it owns.
  useEffect(() => {
    document.documentElement.classList.add('jae-scroll-locked');
    return () => document.documentElement.classList.remove('jae-scroll-locked');
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: `${PALETTE.bone}F4`,
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'zoom-out',
        animation: 'jaeZoomFadeIn 0.2s ease',
      }}
    >
      <style>{`@keyframes jaeZoomFadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
      <div
        style={{
          width: size.w,
          height: size.h,
          position: 'relative',
          boxShadow: `0 32px 100px ${PALETTE.dark}20`,
        }}
      >
        <JaePhoto
          photo={photo}
          size="large"
          sizes={`${size.w}px`}
          priority
        />
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 28,
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'var(--font-jae-mono), monospace',
          fontSize: 9,
          color: PALETTE.gray3,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        Click anywhere to close • Esc
      </div>
    </div>
  );
}
