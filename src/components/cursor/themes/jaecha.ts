import type { CursorTheme } from '../types';

/**
 * MapleStory-style cursor for the Jae Cha photography portfolio.
 *
 * Sprite strips are produced by `scripts/extract-jae-cursors.py` into
 * `public/jaecha/cursors/`. The `?v=N` query is a manual cache-buster — bump it
 * if you re-run the extractor and the browser serves a stale strip.
 *
 *   - idle  : pointing hand (animated)
 *   - hover  : pointing hand + bouncing gift — used on `data-cursor="hover"` tiles
 *   - click : the idle hand frozen on its "pressed" frame while the mouse is down
 *
 * The idle/hover hands point UP, so their hotspot is the top-left fingertip
 * (5,1). Click reuses the idle strip (same hotspot) frozen on frame 2, so the
 * cursor doesn't shift or change shape on press.
 */
export const jaechaCursorTheme: CursorTheme = {
  id: 'jaecha',
  scale: 1.3,
  pressState: 'click',
  states: {
    idle: {
      src: '/jaecha/cursors/default.png?v=5',
      frames: 4,
      cellW: 33,
      cellH: 30,
      fps: 6,
      hotspot: { x: 5, y: 1 },
    },
    hover: {
      src: '/jaecha/cursors/gift.png?v=5',
      frames: 7,
      cellW: 42,
      cellH: 30,
      fps: 12,
      hotspot: { x: 5, y: 1 },
    },
    click: {
      src: '/jaecha/cursors/default.png?v=5',
      frames: 4,
      cellW: 33,
      cellH: 30,
      fps: 6,
      hotspot: { x: 5, y: 1 },
      freezeFrame: 2,
    },
  },
};
