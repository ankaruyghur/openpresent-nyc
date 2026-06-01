#!/usr/bin/env python3
"""
Extract animated cursor sprite strips for Jae Cha's portfolio from a MapleStory
cursor sprite sheet.

Source: a magenta-keyed (#FF00FF) sheet with one animation per horizontal band.
We pull two bands:

  - default : plain pointing hand          (band 0, 4 frames)  -> resting cursor
              (the click state reuses this strip frozen on one frame)
  - gift    : pointing hand + bouncing gift (band 2, 7 frames) -> hover on zoomable

Each band is exported as ONE horizontal sprite strip of uniform cells so the
frontend can animate it with `animation: steps(N)` over background-position.

Frame alignment keeps the hand's anchor at the same cell pixel so the cursor
doesn't jitter. Uniform grids (default) use a fixed pitch; the gift band's
sprites aren't perfectly gridded, so it aligns per-frame on the detected hand
edge (`align="fingertip"`).

Magenta is keyed to full transparency; the anti-aliased magenta halo around
sprites is softened by pulling alpha down where a pixel is magenta-dominant.

Run:
    python3 scripts/extract-jae-cursors.py /path/to/maplestory_cursors.png

Output: public/jaecha/cursors/{default,gift}.png  (+ a strip manifest printed to stdout)
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image

# Each band: (y0, y1) tight vertical bounds, x_origin of first frame, frame pitch,
# frame count, and how many leading pixels of the cell to keep as left padding.
# Pitch/origin come from the detected even column spacing in the source sheet.
BANDS = {
    "default": dict(y0=4,   y1=34,  x0=8,  pitch=33, frames=4),
    # The gift frames are NOT on a perfectly uniform grid (sprite gaps vary by a
    # pixel), so a fixed pitch leaves the hand wobbling 1px frame-to-frame. We
    # instead align on the detected hand fingertip: each frame is placed so its
    # fingertip lands at the same cell-relative pixel. `cell_w` is given
    # explicitly (wide enough to hold the hand + the bouncing gift).
    "gift":    dict(y0=77,  y1=107, frames=7, align="fingertip", cell_w=42, tip_cell_x=5),
}

# Repo-relative output dir.
OUT_DIR = Path(__file__).resolve().parent.parent / "public" / "jaecha" / "cursors"


def key_magenta_to_alpha(rgb: np.ndarray) -> np.ndarray:
    """RGB array (H,W,3) -> RGBA (H,W,4) with magenta keyed transparent.

    A pixel is treated as background when red & blue are high and green is low.
    Partially-magenta edge pixels get proportionally reduced alpha to kill the
    pink halo without hard-clipping the sprite outline.
    """
    r = rgb[:, :, 0].astype(np.int16)
    g = rgb[:, :, 1].astype(np.int16)
    b = rgb[:, :, 2].astype(np.int16)

    # "Magenta-ness": how much this pixel looks like (255,0,255).
    magenta = (r > 180) & (b > 180) & (g < 90)
    # Edge halo: reddish/purple pixels with mid green.
    halo = (r > 150) & (b > 150) & (g >= 90) & (g < 170)

    alpha = np.full(rgb.shape[:2], 255, dtype=np.uint8)
    alpha[magenta] = 0
    alpha[halo] = 90  # soften, don't erase

    rgba = np.dstack([rgb, alpha]).astype(np.uint8)
    # Where fully transparent, zero the color too (avoids dark fringing on scale).
    rgba[alpha == 0] = (0, 0, 0, 0)
    return rgba


def _sprite_spans(fg: np.ndarray, y0: int, y1: int) -> list[tuple[int, int]]:
    """Column spans of contiguous non-background content in band [y0,y1)."""
    occ = fg[y0:y1].any(axis=0)
    spans = []
    in_s = False
    s = 0
    for x, v in enumerate(occ):
        if v and not in_s:
            s, in_s = x, True
        elif not v and in_s:
            spans.append((s, x))
            in_s = False
    if in_s:
        spans.append((s, len(occ)))
    return spans


def _hand_tip_x(arr: np.ndarray, fg: np.ndarray, y0: int, y1: int, sx0: int, sx1: int) -> int:
    """Sheet-x of the hand's fingertip within sprite span [sx0,sx1).

    The hand is the low-saturation (white/grey) blob; the gift is colourful and
    moves, so we mask it out and take the LEFT edge of the hand as the anchor —
    the cuff/finger left edge is stable across frames, unlike the topmost pixel
    (which the gift's highlights can spoof).
    """
    region = arr[y0:y1, sx0:sx1].astype(int)
    r, g, b = region[:, :, 0], region[:, :, 1], region[:, :, 2]
    sat = np.maximum(np.maximum(r, g), b) - np.minimum(np.minimum(r, g), b)
    hand = fg[y0:y1, sx0:sx1] & (sat < 45)
    xs = np.where(hand.any(axis=0))[0]
    return sx0 + int(xs.min())


def extract_band(src: Image.Image, spec: dict) -> tuple[Image.Image, int, int]:
    """Return (strip_image, cell_w, cell_h) for one animation band."""
    y0, y1 = spec["y0"], spec["y1"]
    frames = spec["frames"]
    cell_h = y1 - y0
    arr = np.array(src.convert("RGB"))

    if spec.get("align") == "fingertip":
        # Per-frame alignment: detect each sprite's hand anchor and place frames
        # so the anchor lands at the same cell-relative x in every cell. Kills
        # the sub-pixel wobble a fixed pitch leaves behind.
        cell_w = spec["cell_w"]
        tip_cell_x = spec["tip_cell_x"]
        mag = (arr[:, :, 0] > 240) & (arr[:, :, 1] < 40) & (arr[:, :, 2] > 240)
        fg = ~mag
        spans = _sprite_spans(fg, y0, y1)
        if len(spans) != frames:
            print(f"  warning: detected {len(spans)} gift sprites, expected {frames}",
                  file=sys.stderr)
        strip = Image.new("RGBA", (cell_w * frames, cell_h), (0, 0, 0, 0))
        for i, (sx0, sx1) in enumerate(spans[:frames]):
            tip = _hand_tip_x(arr, fg, y0, y1, sx0, sx1)
            # We want `tip` to map to cell-x `tip_cell_x`, so the source crop
            # starts at `tip - tip_cell_x`.
            crop_x0 = tip - tip_cell_x
            cell = arr[y0:y1, crop_x0:crop_x0 + cell_w]
            if cell.shape[1] < cell_w:  # pad past sheet edge with keyable magenta
                pad = np.full((cell_h, cell_w - cell.shape[1], 3), (255, 0, 255), dtype=cell.dtype)
                cell = np.concatenate([cell, pad], axis=1)
            rgba = key_magenta_to_alpha(cell)
            strip.paste(Image.fromarray(rgba), (i * cell_w, 0))
        return strip, cell_w, cell_h

    # Fixed-pitch path (uniform grids: default hand, click finger).
    x0, pitch = spec["x0"], spec["pitch"]
    cell_w = pitch
    strip = Image.new("RGBA", (cell_w * frames, cell_h), (0, 0, 0, 0))
    for i in range(frames):
        fx = x0 + i * pitch
        cell = arr[y0:y1, fx:fx + cell_w]
        if cell.shape[1] < cell_w:
            pad = np.full((cell_h, cell_w - cell.shape[1], 3), (255, 0, 255), dtype=cell.dtype)
            cell = np.concatenate([cell, pad], axis=1)
        rgba = key_magenta_to_alpha(cell)
        strip.paste(Image.fromarray(rgba), (i * cell_w, 0))

    return strip, cell_w, cell_h


def main() -> None:
    if len(sys.argv) < 2:
        print("usage: extract-jae-cursors.py <maplestory_cursors.png>", file=sys.stderr)
        sys.exit(1)
    src_path = Path(sys.argv[1]).expanduser()
    if not src_path.exists():
        print(f"source not found: {src_path}", file=sys.stderr)
        sys.exit(1)

    src = Image.open(src_path)
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    print("Extracted cursor strips:")
    manifest = {}
    for name, spec in BANDS.items():
        strip, cw, ch = extract_band(src, spec)
        out = OUT_DIR / f"{name}.png"
        strip.save(out)
        manifest[name] = dict(frames=spec["frames"], cellW=cw, cellH=ch)
        print(f"  {name:8s} -> {out.relative_to(OUT_DIR.parent.parent.parent)}  "
              f"{spec['frames']} frames, cell {cw}x{ch}")

    print("\nFrontend manifest (frames / cell size):")
    for name, m in manifest.items():
        print(f"  {name}: {m}")


if __name__ == "__main__":
    main()
