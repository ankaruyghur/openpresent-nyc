'use client';

import { useEffect, useRef, useState } from 'react';
import './cursor.css';
import { createTrail } from './trail';
import type { CursorProviderProps, CursorStateConfig, CursorTheme } from './types';

/**
 * Site-wide custom animated cursor engine.
 *
 * Hides the OS cursor and renders a `position: fixed` follower that tracks the
 * pointer and cycles a theme's sprite states (idle / hover / click / …). Mount
 * it once per surface that wants a custom cursor, passing a `CursorTheme`:
 *
 *   <CursorProvider theme={jaechaCursorTheme} />
 *
 * Design notes:
 * - The follower position is written to a transform directly in the pointermove
 *   handler (no React state per move, no rAF deferral), so it never trails the
 *   real pointer by a frame.
 * - Hover targets declare themselves with `data-cursor="<state>"` on any
 *   element; the engine switches to that state while the pointer is over it
 *   (falling back to idle if the theme doesn't define it).
 * - The OS cursor hide is a single permanent stylesheet rule (cursor.css) keyed
 *   on the `op-cursor-hidden` class. A low-rate interval re-asserts that class
 *   for cases where the OS re-resolves the native cursor with no pointer event
 *   (modal close while stationary, focus change, notification).
 * - Disabled on touch / coarse pointers, respects prefers-reduced-motion, and
 *   only activates after all sprite strips preload (so the native cursor never
 *   hides behind a broken sprite).
 */

const HIDE_CLASS = 'op-cursor-hidden';
const DEFAULT_SCALE = 1.3;

/**
 * Ref-count the hide class on <html> across all live provider instances /
 * StrictMode double-mounts. The class goes on at the first instance and only
 * comes off when the last one unmounts, so a double-invoked effect can't strip
 * it while another instance still wants it.
 */
let hideRefCount = 0;
function acquireHide() {
  hideRefCount += 1;
  ensureHidden();
}
function releaseHide() {
  hideRefCount = Math.max(0, hideRefCount - 1);
  if (hideRefCount === 0) {
    document.documentElement.classList.remove(HIDE_CLASS);
  }
}
/**
 * Re-assert the hide class. Idempotent and cheap — only touches the DOM if the
 * class was actually dropped. The `op-cursor-hidden *` stylesheet rule does the
 * rest; nothing else is needed.
 */
function ensureHidden() {
  if (hideRefCount <= 0) return;
  const root = document.documentElement;
  if (!root.classList.contains(HIDE_CLASS)) {
    root.classList.add(HIDE_CLASS);
  }
}

/** CSS keyframes name for a theme state, namespaced by theme id. */
function keyframesName(themeId: string, state: string) {
  return `op-cursor-${themeId}-${state}`;
}

/** Keyframes name for the one-shot click spin-up. */
function clickSpinName(themeId: string) {
  return `op-cursor-${themeId}-clickspin`;
}

/**
 * Build the click spin-up keyframe on a REAL time budget (not normalized), so the
 * spin genuinely decelerates to the idle frame rate by the end.
 *
 * Per-frame intervals ease from a fast burst up to exactly the idle frame time
 * (1/idle.fps). We accumulate frames until ~durationMs is filled, then trim to a
 * whole number of strip cycles so the spin ends on frame 0 (where idle begins) —
 * giving a seamless, on-beat handoff at true idle speed. Returns the CSS and the
 * actual duration (seconds) to run it for.
 */
function buildClickSpin(theme: CursorTheme): { css: string; durationSec: number } {
  const idle = theme.states.idle;
  const idleMs = 1000 / idle.fps; // idle frame time — the deceleration target
  const budgetMs = theme.clickSpin?.durationMs ?? 1000;
  const fastMs = idleMs * 0.32; // initial burst (~3× idle speed)
  // Hold the fast spin at constant speed until holdMs, THEN ease fast → idle over
  // the remaining budget. So it stays full-speed, then visibly winds down at the end.
  const holdMs = theme.clickSpin?.holdMs ?? 800;

  // Phase 1: flat-fast plateau until holdMs. Phase 2: ease fast → idle over the
  // remaining budget window, and KEEP easing until we actually reach idle speed
  // (so the spin always finishes fully decelerated, never cut off mid-slowdown).
  const slowdownMs = Math.max(1, budgetMs - holdMs);
  const intervals: number[] = [];
  let elapsed = 0;
  let slow = 0; // time spent in the slowdown phase
  while (true) {
    if (elapsed < holdMs) {
      intervals.push(fastMs); // flat-fast plateau
      elapsed += fastMs;
      continue;
    }
    const p = slow / slowdownMs;
    const e = 1 - Math.pow(1 - Math.min(1, p), 2); // ease-out
    const iv = fastMs + (idleMs - fastMs) * e;
    intervals.push(iv);
    elapsed += iv;
    slow += iv;
    if (iv >= idleMs - 0.5) break; // fully decelerated to idle — stop
  }
  // Round UP to a whole number of strip cycles so it ends on frame 0, padding any
  // extra frames at idle speed (never chop the deceleration we just built).
  const rem = intervals.length % idle.frames;
  if (rem !== 0) {
    for (let i = 0; i < idle.frames - rem; i++) intervals.push(idleMs);
  }
  const used = intervals;
  const total = used.reduce((a, b) => a + b, 0);

  const stops = [`  0% { background-position-x: 0; animation-timing-function: step-end; }`];
  let acc = 0;
  for (let k = 1; k <= used.length; k++) {
    acc += used[k - 1];
    const pct = ((acc / total) * 100).toFixed(3);
    const posCell = k % idle.frames; // wrap within the strip (ends at 0)
    stops.push(
      `  ${pct}% { background-position-x: ${-posCell * idle.cellW}px; animation-timing-function: step-end; }`,
    );
  }
  return {
    css: `@keyframes ${clickSpinName(theme.id)} {\n${stops.join('\n')}\n}`,
    durationSec: total / 1000,
  };
}

/**
 * Build the <style> text for all animated states in a theme. Each state steps
 * background-position-x across its strip, looping back to frame 0 (sawtooth).
 * Frozen / single-frame states are driven via inline style, not keyframes.
 *
 * If the theme has `clickSpin`, also emit a one-shot keyframe that replays the
 * IDLE strip `spins` times but DECELERATING (ease-out): the frame advances are
 * baked into eased percentage stops so it starts fast and settles to ~idle
 * speed, then the engine hands back to the steady idle loop.
 */
function buildKeyframes(theme: CursorTheme): string {
  const parts = Object.entries(theme.states)
    .filter(([, s]) => s.freezeFrame === undefined && s.frames > 1)
    .map(([state, s]) => {
      const end = -s.cellW * s.frames;
      return `@keyframes ${keyframesName(theme.id, state)} {
  from { background-position-x: 0; }
  to { background-position-x: ${end}px; }
}`;
    });

  if (theme.clickSpin) {
    const { css } = buildClickSpin(theme);
    parts.push(css);
  }

  return parts.join('\n');
}

export function CursorProvider({ theme, disabled = false }: CursorProviderProps) {
  const [enabled, setEnabled] = useState(false);
  const layerRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLDivElement>(null);

  const scale = theme.scale ?? DEFAULT_SCALE;
  const pressState = theme.pressState ?? 'click';

  // Mutable pointer + state refs so the event handlers never close over stale
  // values and pointer updates don't trigger React renders.
  const pos = useRef({ x: -9999, y: -9999 });
  const state = useRef<string>('idle');
  const down = useRef(false);
  /** Name of the hover variant the pointer is currently over, or null. */
  const hoverVariant = useRef<string | null>(null);

  // Preload all sprite strips; only enable once they all resolve so we never
  // hide the native cursor behind a broken sprite.
  useEffect(() => {
    if (disabled) return;
    const fine = window.matchMedia('(pointer: fine)').matches;
    if (!fine) return;

    let cancelled = false;
    const urls = Array.from(
      new Set([
        ...Object.values(theme.states).map((s) => s.src),
        ...(theme.trail ? [theme.trail.src] : []),
      ]),
    );
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
  }, [disabled, theme]);

  useEffect(() => {
    if (!enabled) return;

    // Acquire the OS-cursor hide (ref-counted; survives StrictMode remounts).
    acquireHide();

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Optional falling-sparkle trail. Skipped entirely under reduced motion. Its
    // rAF loop only runs while particles are alive, so an idle cursor costs nothing.
    const trail = theme.trail && !reduceMotion ? createTrail(theme.trail) : null;
    const emitInterval = theme.trail?.emitInterval ?? 55;
    let lastEmit = 0;

    const getState = (name: string): CursorStateConfig =>
      theme.states[name] ?? theme.states.idle;

    const computeState = (): string => {
      // With clickSpin, the press feedback is the spin-up animation (handled
      // separately), not a state switch — so don't change state on down.
      if (down.current && !theme.clickSpin) return theme.states[pressState] ? pressState : 'idle';
      return hoverVariant.current ?? 'idle';
    };

    // Real spin duration (matches the time-based keyframe schedule, so the
    // animation runs at the cadence it was built for and ends at idle speed).
    const clickSpinDur = theme.clickSpin ? buildClickSpin(theme).durationSec : 0;

    // One-shot click spin-up: play the decelerating keyframe once, then revert to
    // whatever state we should be in (idle/hover). Guarded so rapid clicks restart.
    const playClickSpin = () => {
      const el = spriteRef.current;
      if (!el || !theme.clickSpin || reduceMotion) return;
      // Restart cleanly if a spin is already running.
      el.style.animation = 'none';
      void el.offsetWidth; // reflow so the re-assigned animation restarts
      el.style.animation = `${clickSpinName(theme.id)} ${clickSpinDur}s linear 1`;
      const onEnd = () => {
        el.removeEventListener('animationend', onEnd);
        applyState(state.current); // back to the steady idle/hover loop
      };
      el.addEventListener('animationend', onEnd);
    };

    const applyState = (next: string) => {
      const el = spriteRef.current;
      if (!el) return;
      const s = getState(next);
      el.style.width = `${s.cellW}px`;
      el.style.height = `${s.cellH}px`;
      el.style.backgroundImage = `url(${s.src})`;
      el.style.backgroundSize = `${s.cellW * s.frames}px ${s.cellH}px`;
      if (s.freezeFrame !== undefined) {
        // Static single frame (e.g. a "pressed" pose).
        el.style.animation = 'none';
        el.style.backgroundPosition = `${-s.cellW * s.freezeFrame}px 0`;
      } else if (reduceMotion || s.frames <= 1) {
        // Reduced motion: hold frame 0 instead of animating.
        el.style.animation = 'none';
        el.style.backgroundPosition = '0 0';
      } else {
        // Regular loop: step through all frames, then jump back to frame 0.
        const dur = s.frames / s.fps;
        el.style.animation = `${keyframesName(theme.id, next)} ${dur}s steps(${s.frames}) infinite`;
      }
    };

    applyState(state.current);

    // Apply the follower position straight from the pointer event — not deferred
    // to a rAF tick — so the cursor never trails the real pointer by a frame.
    const place = () => {
      const layer = layerRef.current;
      if (!layer) return;
      const { hotspot } = getState(state.current);
      layer.style.transform = `translate3d(${pos.current.x - hotspot.x * scale}px, ${
        pos.current.y - hotspot.y * scale
      }px, 0)`;
    };

    const onPointerMove = (e: PointerEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      // Generic hover hit-test: the nearest ancestor carrying `data-cursor`
      // declares which state to switch to. Unknown values fall back to idle.
      const matched = (e.target as Element | null)?.closest('[data-cursor]');
      const variant = matched?.getAttribute('data-cursor') ?? null;
      const nextVariant = variant && theme.states[variant] ? variant : null;
      if (nextVariant !== hoverVariant.current) {
        hoverVariant.current = nextVariant;
        const next = computeState();
        if (next !== state.current) {
          state.current = next;
          applyState(next);
        }
      }
      place();
      ensureHidden();

      // Emit a trail particle, throttled by emitInterval so density is
      // frame-rate independent (fast flicks spawn more within the cap).
      if (trail) {
        const t = performance.now();
        if (t - lastEmit >= emitInterval) {
          lastEmit = t;
          trail.emit(e.clientX, e.clientY);
        }
      }
    };

    const syncState = () => {
      const next = computeState();
      if (next !== state.current) {
        state.current = next;
        applyState(next);
        place();
      }
    };
    const onDown = () => {
      down.current = true;
      if (theme.clickSpin) playClickSpin();
      else syncState();
      if (trail) trail.burst(pos.current.x, pos.current.y);
    };
    const onUp = () => {
      down.current = false;
      syncState();
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
    // Fast-path hide recovery on focus/visibility changes.
    window.addEventListener('focus', ensureHidden);
    document.addEventListener('visibilitychange', ensureHidden);

    // Stationary-cursor hide recovery: the OS can re-resolve the native cursor
    // with no pointer event (modal close while still, notification). A low-rate
    // interval re-asserts the hide for that case without putting the cursor on a
    // 60fps loop that competes with paint — position is event-driven (no lag).
    const recover = window.setInterval(ensureHidden, 250);

    return () => {
      window.clearInterval(recover);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('pointerenter', onEnter);
      window.removeEventListener('focus', ensureHidden);
      document.removeEventListener('visibilitychange', ensureHidden);
      trail?.destroy();
      releaseHide();
    };
  }, [enabled, theme, scale, pressState]);

  if (!enabled) return null;

  return (
    <>
      {/* Per-theme @keyframes, namespaced by theme id. */}
      <style>{buildKeyframes(theme)}</style>
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
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            backgroundRepeat: 'no-repeat',
            // Keep pixel art crisp when scaled.
            imageRendering: 'pixelated',
          }}
        />
      </div>
    </>
  );
}
