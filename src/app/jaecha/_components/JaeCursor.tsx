'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Custom MapleStory-style animated cursor for Jae Cha's portfolio.
 *
 * Native CSS cursors can't animate, so we hide the real cursor (scoped to
 * /jaecha via the `jae-cursor-active` class on <html>) and render a follower
 * <div> that tracks the pointer and cycles sprite frames:
 *
 *   - idle  : pointing hand            (default.png, animated 4 frames)
 *   - hover : pointing hand + gift     (gift.png,    animated 7 frames) — over zoomable images
 *   - click : default hand frozen on the "pressed" frame — while mouse is down
 *
 * "Zoomable" is detected generically: any element under the pointer whose
 * computed `cursor` is `zoom-in` (the convention every Jae gallery tile uses).
 * This means new galleries get the gift cursor for free, no wiring required.
 *
 * Pointer position is written straight to a transform every animation frame —
 * no React state per move, so it stays smooth. Disabled on touch / coarse
 * pointers and when the strips fail to load (native cursor returns).
 */

// Sprite manifest — produced by scripts/extract-jae-cursors.py. If you re-run
// the extractor with different crops, update frames/cellW/cellH to match.
//
// `hotspot` is the active fingertip in *source* pixels — the point that must sit
// exactly under the real mouse position. The idle/hover hands point UP, so their
// tip is top-left (5,1).
//
// `freezeFrame` (optional): show that single frame statically instead of
// animating. Click reuses the default-hand strip frozen on frame 2 (the hand
// pulled in) as a subtle "pressed" pose — same art and hotspot as idle, so the
// cursor doesn't shift or change shape on click.
const SPRITES = {
  idle: { src: '/jaecha/cursors/default.png?v=5', frames: 4, cellW: 33, cellH: 30, fps: 6, hotspot: { x: 5, y: 1 } },
  hover: { src: '/jaecha/cursors/gift.png?v=5', frames: 7, cellW: 42, cellH: 30, fps: 12, hotspot: { x: 5, y: 1 } },
  click: { src: '/jaecha/cursors/default.png?v=5', frames: 4, cellW: 33, cellH: 30, fps: 6, hotspot: { x: 5, y: 1 }, freezeFrame: 2 },
} as const;

type State = keyof typeof SPRITES;

// On-screen scale of the pixel art. 1.3 keeps it crisp and cursor-sized.
const SCALE = 1.3;

export function JaeCursor() {
  const [enabled, setEnabled] = useState(false);
  const layerRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLDivElement>(null);

  // Mutable pointer + state refs so the rAF loop never closes over stale values
  // and pointer updates don't trigger React renders.
  const pos = useRef({ x: -9999, y: -9999 });
  const state = useRef<State>('idle');
  const down = useRef(false);
  const hovering = useRef(false);

  useEffect(() => {
    // Skip on touch / coarse-pointer devices and when motion is reduced enough
    // that an animated follower would be unwelcome.
    const fine = window.matchMedia('(pointer: fine)').matches;
    if (!fine) return;

    // Preload strips; only enable once they're all available so we never flash
    // a broken cursor with the native one already hidden.
    let cancelled = false;
    const urls = Object.values(SPRITES).map((s) => s.src);
    Promise.all(
      urls.map(
        (src) =>
          new Promise<boolean>((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = src;
          }),
      ),
    ).then((results) => {
      if (!cancelled && results.every(Boolean)) setEnabled(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const root = document.documentElement;
    root.classList.add('jae-cursor-active');
    // Belt-and-suspenders: also force `cursor: none` inline on <html>/<body>.
    // Inline !important is the highest-specificity, race-free way to hide the OS
    // cursor — it can't be lost to a competing rule or a stylesheet timing gap.
    root.style.setProperty('cursor', 'none', 'important');
    document.body.style.setProperty('cursor', 'none', 'important');

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const computeState = (): State => {
      if (down.current) return 'click';
      if (hovering.current) return 'hover';
      return 'idle';
    };

    const applyState = (next: State) => {
      const el = spriteRef.current;
      if (!el) return;
      const s = SPRITES[next];
      el.style.width = `${s.cellW}px`;
      el.style.height = `${s.cellH}px`;
      el.style.backgroundImage = `url(${s.src})`;
      el.style.backgroundSize = `${s.cellW * s.frames}px ${s.cellH}px`;
      const freeze = 'freezeFrame' in s ? s.freezeFrame : undefined;
      if (freeze !== undefined) {
        // Static single frame (e.g. click = default hand frozen on the "pressed" pose).
        el.style.animation = 'none';
        el.style.backgroundPosition = `${-s.cellW * freeze}px 0`;
      } else if (reduceMotion || s.frames <= 1) {
        // Reduced motion: hold frame 0 instead of animating.
        el.style.animation = 'none';
        el.style.backgroundPosition = '0 0';
      } else {
        const dur = s.frames / s.fps;
        el.style.animation = `jae-cursor-${next} ${dur}s steps(${s.frames}) infinite`;
      }
    };

    applyState(state.current);

    const onPointerMove = (e: PointerEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      // Cheap hit-test: is the element under the pointer (or a near ancestor)
      // a zoomable tile? Every Jae gallery tile sets `cursor: 'zoom-in'`
      // inline, so we match the inline style attribute directly — independent
      // of the global `cursor: none !important` that hides the OS cursor.
      const target = e.target as Element | null;
      hovering.current = !!target?.closest('[style*="zoom-in"]');
    };

    const onDown = () => {
      down.current = true;
    };
    const onUp = () => {
      down.current = false;
    };
    // Hide the follower when the pointer leaves the window, show on return.
    const onLeave = () => {
      if (layerRef.current) layerRef.current.style.opacity = '0';
    };
    const onEnter = () => {
      if (layerRef.current) layerRef.current.style.opacity = '1';
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    document.addEventListener('pointerenter', onEnter);

    let raf = 0;
    const tick = () => {
      const next = computeState();
      if (next !== state.current) {
        state.current = next;
        applyState(next);
      }
      const layer = layerRef.current;
      if (layer) {
        // Offset by the current state's hotspot so the active fingertip — not
        // the sprite's top-left corner — lands on the real pointer position.
        const { hotspot } = SPRITES[state.current];
        layer.style.transform = `translate3d(${pos.current.x - hotspot.x * SCALE}px, ${
          pos.current.y - hotspot.y * SCALE
        }px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('pointerenter', onEnter);
      root.classList.remove('jae-cursor-active');
      root.style.removeProperty('cursor');
      document.body.style.removeProperty('cursor');
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={layerRef}
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 99999,
        pointerEvents: 'none',
        willChange: 'transform',
        transform: 'translate3d(-9999px, -9999px, 0)',
      }}
    >
      <div
        ref={spriteRef}
        style={{
          // Scaled up via transform-origin top-left so the hotspot math holds.
          transform: `scale(${SCALE})`,
          transformOrigin: 'top left',
          backgroundRepeat: 'no-repeat',
          // Keep pixel art crisp when scaled.
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
}
