#!/usr/bin/env python3
"""
Extract the spinning-arrow idle animation for the Open Present cursor from the
op_cursor.png sprite sheet (a wide RGBA sheet of many cursor states).

We take the FIRST 6 frames — an arrow doing a spin/flip (full → opening → edge-on
sliver → reforming). The source is already transparent (no Photoshop pass needed).

Frames are aligned on their content's TOP-LEFT corner (the arrow's pointing tip),
not centered, so the tip stays anchored while the arrow body spins around it —
the tip is the cursor hotspot.

Output: public/op/cursors/spin.png — 6 frames × CELL×CELL, transparent.

Run:
    python3 scripts/extract-op-cursor.py /path/to/op_cursor.png
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image

# X-spans of the first 6 frames (from alpha-gap detection on the sheet).
FRAMES = [(7, 29), (38, 55), (65, 80), (90, 103), (114, 130), (139, 158)]
ALPHA_T = 20  # opacity threshold for "content"
CELL_W, CELL_H = 28, 34  # uniform cell (fits max content 22×30 with margin)
# Where each frame's top-left content corner lands inside the cell. This is also
# the cursor hotspot region (the arrow tip sits a hair inside the top-left).
ANCHOR_X, ANCHOR_Y = 3, 2

OUT = Path(__file__).resolve().parent.parent / "public" / "op" / "cursors" / "spin.png"


def main() -> None:
    if len(sys.argv) < 2:
        print("usage: extract-op-cursor.py <op_cursor.png>", file=sys.stderr)
        sys.exit(1)
    src_path = Path(sys.argv[1]).expanduser()
    if not src_path.exists():
        print(f"source not found: {src_path}", file=sys.stderr)
        sys.exit(1)

    src = Image.open(src_path).convert("RGBA")
    arr = np.array(src)
    alpha = arr[:, :, 3]

    frames = len(FRAMES)
    strip = Image.new("RGBA", (CELL_W * frames, CELL_H), (0, 0, 0, 0))

    for i, (sx, ex) in enumerate(FRAMES):
        sub = alpha[:, sx:ex]
        ys, xs = np.where(sub > ALPHA_T)
        # Content's top-left corner in sheet coords.
        cy = ys.min()
        cx = sx + xs.min()
        # Crop the content box and paste it at the fixed anchor inside the cell.
        cw = xs.max() - xs.min() + 1
        ch = ys.max() - ys.min() + 1
        content = src.crop((cx, cy, cx + cw, cy + ch))
        strip.paste(content, (i * CELL_W + ANCHOR_X, ANCHOR_Y), content)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    strip.save(OUT)
    print(f"wrote {OUT.relative_to(OUT.parents[2])} — {frames} frames, cell {CELL_W}×{CELL_H}")
    print(f"hotspot ≈ ({ANCHOR_X}, {ANCHOR_Y}) (arrow tip)")


if __name__ == "__main__":
    main()
