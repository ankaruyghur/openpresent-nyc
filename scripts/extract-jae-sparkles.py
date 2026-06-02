#!/usr/bin/env python3
"""
Extract the sparkle animation strip for Jae Cha's cursor trail from a sprite
sheet (Mario's Early Years cursor sparkles).

The source sheet has a horizontal band of 8 sparkle-cluster frames separated by
maroon vertical divider lines. The frames read as one cluster's lifecycle:
newborn seeds → grow → peak → spread → fade to nearly empty. We export them as a
single horizontal strip of uniform 40×40 cells, in lifecycle order, each cell
centered on that frame's cluster so the animation doesn't jitter.

The sheet's background is white (not magenta), so we DON'T key it here — the
strip is exported as-is for a manual Photoshop transparency pass (white → alpha),
matching how the cursor `click.png` was handled.

Geometry (measured from the sheet):
  - sparkle band rows ~28–60
  - 7 divider columns at x ≈ 29, 67, 109, 150, 191, 230, 277 → 8 frames
  - frame 7's far-right region holds a stray cursor sprite; we trim it off

Run:
    python3 scripts/extract-jae-sparkles.py /path/to/stars.png

Output: public/jaecha/cursors/sparkles.png  (8 frames × 40×40, white bg)
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image

# Divider centers split the band into 8 frames. Edges wrap the first/last frame.
DIVIDERS = [29, 67, 109, 150, 191, 230, 277]
BAND_Y0, BAND_Y1 = 28, 60
CELL = 40  # uniform output cell (fits the largest cluster ~32×31 with margin)
# Frame 7's real sparkles end ~x=299; the stray cursor sprite occupies x≈300–331
# (overlapping the band), so everything from here right is erased.
FRAME7_XMAX = 299

OUT = Path(__file__).resolve().parent.parent / "public" / "jaecha" / "cursors" / "sparkles.png"


def content_mask(arr: np.ndarray) -> np.ndarray:
    """True where a pixel is real sparkle content (not white bg, not red divider)."""
    r = arr[:, :, 0].astype(int)
    g = arr[:, :, 1].astype(int)
    b = arr[:, :, 2].astype(int)
    white = (r > 235) & (g > 235) & (b > 235)
    red = (r > 100) & (r < 210) & (g < 70) & (b < 70)
    return ~white & ~red


def frame_bounds(width: int) -> list[tuple[int, int]]:
    """X-spans of the 8 frames, derived from the divider columns."""
    edges = [0, *DIVIDERS, width]
    spans = []
    for i in range(len(edges) - 1):
        x0 = edges[i] + (1 if i > 0 else 0)
        x1 = edges[i + 1] - (1 if i < len(edges) - 2 else 0)
        if i == 7:
            x1 = min(x1, FRAME7_XMAX)
        spans.append((x0, x1))
    return spans


def main() -> None:
    if len(sys.argv) < 2:
        print("usage: extract-jae-sparkles.py <stars.png>", file=sys.stderr)
        sys.exit(1)
    src_path = Path(sys.argv[1]).expanduser()
    if not src_path.exists():
        print(f"source not found: {src_path}", file=sys.stderr)
        sys.exit(1)

    src = Image.open(src_path).convert("RGB")
    spans = frame_bounds(src.width)
    frames = len(spans)
    strip = Image.new("RGB", (CELL * frames, CELL), (255, 255, 255))

    # Erase divider columns + the stray cursor sprite to white first, so neither
    # bleeds into a cell AND neither skews the per-frame content centering below.
    clean = src.copy()
    cpix = clean.load()
    for dx in DIVIDERS:
        for ex in range(dx - 1, dx + 2):  # divider is ~1px but anti-aliased
            for ey in range(0, src.height):
                cpix[ex, ey] = (255, 255, 255)
    for ex in range(FRAME7_XMAX, src.width):  # stray cursor sprite region
        for ey in range(0, src.height):
            cpix[ex, ey] = (255, 255, 255)

    content = content_mask(np.array(clean))

    for i, (x0, x1) in enumerate(spans):
        sub = content[BAND_Y0:BAND_Y1, x0:x1]
        ys, xs = np.where(sub)
        if len(xs) == 0:
            print(f"  frame {i}: empty", file=sys.stderr)
            continue
        # Center the cell on the cluster. Dividers + cursor are already erased to
        # white in `clean`, so an oversized cell can't pull in red/cursor pixels.
        cx = x0 + (xs.min() + xs.max()) // 2
        cy = BAND_Y0 + (ys.min() + ys.max()) // 2
        crop_x0 = cx - CELL // 2
        crop_y0 = cy - CELL // 2
        cell = clean.crop((crop_x0, crop_y0, crop_x0 + CELL, crop_y0 + CELL))
        strip.paste(cell, (i * CELL, 0))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    strip.save(OUT)
    print(f"wrote {OUT.relative_to(OUT.parents[3])} — {frames} frames, cell {CELL}×{CELL} (white bg)")
    print("Next: open it in Photoshop and key the white background to transparent.")


if __name__ == "__main__":
    main()
