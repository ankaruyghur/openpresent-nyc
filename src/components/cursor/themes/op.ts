import type { CursorTheme } from '../types';

/**
 * Open Present cursor — a spinning arrow, used on the homepage and the
 * ikaros-escape page.
 *
 * The idle animation is a 6-frame arrow spin/flip (full → opening → edge-on
 * sliver → reforming). Extracted by `scripts/extract-op-cursor.py` into
 * `public/op/cursors/spin.png`, aligned on the arrow tip so it stays anchored
 * while the arrow spins. Hotspot ≈ the top-left tip.
 *
 * On click, `clickSpin` replays the idle spin fast and decelerates back to
 * normal speed (ease-out) — no separate click sprite.
 */
export const opCursorTheme: CursorTheme = {
  id: 'op',
  scale: 1.1,
  states: {
    idle: {
      src: '/op/cursors/spin.png?v=1',
      frames: 6,
      cellW: 28,
      cellH: 34,
      fps: 8,
      hotspot: { x: 3, y: 2 },
    },
  },
  // Click = the idle spin bursts fast (~3 spins) then eases back to idle speed.
  clickSpin: { durationMs: 1500 },
};
