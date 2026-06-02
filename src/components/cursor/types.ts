/**
 * Types for the site-wide custom cursor engine (`CursorProvider`).
 *
 * A cursor is a set of named *states* (idle, hover, click, …), each backed by a
 * horizontal sprite strip that's stepped frame-by-frame. A *theme* bundles those
 * states for one portfolio/surface; the engine itself is theme-agnostic.
 */

/** One visual state of the cursor, backed by a horizontal sprite strip. */
export type CursorStateConfig = {
  /** Public URL of the sprite strip (e.g. '/jaecha/cursors/default.png?v=5'). */
  src: string;
  /** Number of frames (cells) in the strip. */
  frames: number;
  /** Source-pixel width of one cell. */
  cellW: number;
  /** Source-pixel height of one cell. */
  cellH: number;
  /** Animation speed in frames per second. */
  fps: number;
  /**
   * The "active point" of the art in source pixels — the pixel that should sit
   * exactly under the real mouse position (e.g. a pointing fingertip). The
   * follower is offset by `hotspot × scale` so the art lands on the pointer.
   */
  hotspot: { x: number; y: number };
  /**
   * Show this single frame statically instead of animating. Used for press
   * feedback (e.g. a "pressed" pose) where a held frame reads better than a loop.
   */
  freezeFrame?: number;
};

/**
 * A cursor theme: the full set of states for one surface.
 *
 * `idle` and `click` are required; any additional key is a hoverable variant
 * referenced from the DOM via `data-cursor="<key>"`.
 */
export type CursorTheme = {
  /** Unique id — namespaces the injected @keyframes (e.g. `op-cursor-<id>-idle`). */
  id: string;
  /** On-screen scale of the pixel art. Default 1.3. */
  scale?: number;
  /** State shown while the mouse is held down. Default 'click'. */
  pressState?: string;
  states: { idle: CursorStateConfig; click: CursorStateConfig } & Record<
    string,
    CursorStateConfig
  >;
};

export type CursorProviderProps = {
  theme: CursorTheme;
  /** Force-disable the custom cursor (native cursor stays). Default false. */
  disabled?: boolean;
};
