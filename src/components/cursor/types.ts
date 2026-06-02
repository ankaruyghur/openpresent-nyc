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
  /** Optional falling-sparkle trail emitted from the cursor. */
  trail?: CursorTrailConfig;
};

/**
 * A particle trail: spawns sprite particles from the cursor that fall, advance
 * through the strip's frames (aging), and fade out. Emitted while the pointer
 * moves and as a burst on click.
 */
export type CursorTrailConfig = {
  /** Sprite strip URL — frames played in order as the particle ages. */
  src: string;
  /** Frame count in the strip. */
  frames: number;
  /** Source-pixel cell size (assumed square cells laid out horizontally). */
  cell: number;
  /** On-screen scale of each particle. Default 1. */
  scale?: number;
  /** Particle lifetime in ms (fall + frame cycle + fade happen over this). Default 900. */
  lifetime?: number;
  /**
   * Hold the first frame for this multiple of a normal frame's duration. >1
   * lengthens the TOTAL life (frames 1..N keep their normal duration) so a fresh
   * sparkle lingers near the cursor before aging. Default 1 (no extra hold).
   */
  firstFrameHold?: number;
  /** Downward acceleration in px/s². Default 900. */
  gravity?: number;
  /** Avg ms between trail emissions while moving. Lower = denser. Default 55. */
  emitInterval?: number;
  /** Particles spawned per click burst. Default 8. */
  burst?: number;
  /** Hard cap on simultaneous live particles (perf guard). Default 60. */
  max?: number;
};

export type CursorProviderProps = {
  theme: CursorTheme;
  /** Force-disable the custom cursor (native cursor stays). Default false. */
  disabled?: boolean;
};
