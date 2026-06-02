import type { CursorTrailConfig } from './types';

/**
 * Falling-sparkle particle trail for the custom cursor.
 *
 * Each particle is a small DOM div showing one frame of the sprite strip via
 * background-position. On every animation frame a particle falls (gravity),
 * advances through the strip's frames as it ages, and fades out; at end of life
 * it's removed. Particles are spawned by the cursor engine (a steady trail while
 * the pointer moves + a burst on click).
 *
 * The rAF loop runs ONLY while particles are alive — when the last one dies the
 * loop stops, so an idle cursor costs nothing (matching the engine's no-idle-loop
 * design). A hard `max` cap bounds DOM/CPU under fast flicking.
 */

type Particle = {
  el: HTMLDivElement;
  x: number; // current top-left position (px)
  y: number;
  vx: number; // velocity (px/s)
  vy: number;
  born: number; // ms timestamp
  rot: number; // static rotation (deg) for variety
};

export type Trail = {
  /** Spawn one particle centered at viewport (x, y). */
  emit: (x: number, y: number) => void;
  /** Spawn `n` particles in a radial burst at (x, y). */
  burst: (x: number, y: number, n?: number) => void;
  /** Remove all particles + the container and stop the loop. */
  destroy: () => void;
};

export function createTrail(cfg: CursorTrailConfig): Trail {
  const scale = cfg.scale ?? 1;
  const baseLife = cfg.lifetime ?? 900;
  const gravity = cfg.gravity ?? 900;
  const max = cfg.max ?? 60;
  const firstHold = cfg.firstFrameHold ?? 1;
  const size = cfg.cell * scale;
  const stripW = cfg.cell * cfg.frames * scale;

  // Frame timing: frames 1..N each get a normal slice (baseLife / frames); frame
  // 0 gets that slice × firstFrameHold. The extra hold ADDS to total life rather
  // than stealing from the later frames, so they keep their normal duration.
  // `lifetime` is the effective total; `frameEnd[i]` = life (0..1) frame i ends.
  const slice = baseLife / cfg.frames;
  const frameMs = Array.from({ length: cfg.frames }, (_, i) =>
    i === 0 ? slice * firstHold : slice,
  );
  const lifetime = frameMs.reduce((a, b) => a + b, 0);
  const frameEnd: number[] = [];
  let acc = 0;
  for (const ms of frameMs) {
    acc += ms;
    frameEnd.push(acc / lifetime);
  }
  const frameForLife = (life: number) => {
    for (let i = 0; i < frameEnd.length; i++) if (life < frameEnd[i]) return i;
    return cfg.frames - 1;
  };

  // A single fixed, click-through container holds all particles, beneath the
  // cursor follower (which is zIndex 99999).
  const layer = document.createElement('div');
  layer.setAttribute('aria-hidden', 'true');
  layer.style.cssText =
    'position:fixed;inset:0;z-index:99998;pointer-events:none;overflow:hidden;';
  document.body.appendChild(layer);

  const particles: Particle[] = [];
  let raf = 0;
  let lastT = 0;

  // Vary motion without Math.random() at call sites that need determinism — a
  // tiny LCG seeded per-particle by a rolling counter is plenty for visual jitter.
  let seed = 1;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };

  const makeEl = () => {
    const el = document.createElement('div');
    el.style.cssText =
      `position:absolute;width:${size}px;height:${size}px;` +
      `background-image:url(${cfg.src});background-repeat:no-repeat;` +
      `background-size:${stripW}px ${size}px;image-rendering:pixelated;` +
      `will-change:transform,opacity;`;
    return el;
  };

  const spawn = (x: number, y: number, vx: number, vy: number) => {
    if (particles.length >= max) return;
    const el = makeEl();
    const rot = (rand() - 0.5) * 40;
    const p: Particle = { el, x: x - size / 2, y: y - size / 2, vx, vy, born: now(), rot };
    el.style.backgroundPosition = '0 0';
    el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${rot}deg)`;
    layer.appendChild(el);
    particles.push(p);
    ensureLoop();
  };

  // now(): rAF timestamps drive the sim; we read performance.now via the loop arg.
  let clock = 0;
  const now = () => clock;

  const tick = (t: number) => {
    if (!lastT) lastT = t;
    const dt = Math.min(0.05, (t - lastT) / 1000); // clamp big gaps (tab switch)
    lastT = t;
    clock = t;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      const age = t - p.born;
      const life = age / lifetime;
      if (life >= 1) {
        p.el.remove();
        particles.splice(i, 1);
        continue;
      }
      // Integrate fall.
      p.vy += gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      // Age through the strip frames (0 → last) on the weighted schedule.
      const frame = frameForLife(life);
      // Fade: stay fully opaque until late in life, then drop off over the
      // final stretch only.
      const FADE_START = 0.8;
      const opacity = life < FADE_START ? 1 : 1 - (life - FADE_START) / (1 - FADE_START);
      p.el.style.backgroundPosition = `${-frame * cfg.cell * scale}px 0`;
      p.el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${p.rot}deg)`;
      p.el.style.opacity = opacity.toFixed(3);
    }

    if (particles.length > 0) {
      raf = requestAnimationFrame(tick);
    } else {
      raf = 0;
      lastT = 0;
    }
  };

  const ensureLoop = () => {
    if (!raf) raf = requestAnimationFrame(tick);
  };

  return {
    emit(x, y) {
      // Gentle drift: slight sideways scatter, small initial downward velocity.
      const vx = (rand() - 0.5) * 40;
      const vy = rand() * 30;
      spawn(x, y, vx, vy);
    },
    burst(x, y, n = cfg.burst ?? 8) {
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n + rand() * 0.5;
        const speed = 55 + rand() * 90; // moderate burst — near the cursor but with some spread
        spawn(x, y, Math.cos(a) * speed, Math.sin(a) * speed - 42); // slight up bias, gravity pulls down
      }
    },
    destroy() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      particles.length = 0;
      layer.remove();
    },
  };
}
