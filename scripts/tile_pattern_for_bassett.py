#!/usr/bin/env python3
"""Tile a pattern image N×N for Bassett Smart Object (e.g. 4096×4096, 4 repeats)."""
import argparse
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    Image = None


def main():
    parser = argparse.ArgumentParser(description="Tile pattern for Bassett SO")
    parser.add_argument("input", type=Path, help="Input pattern image")
    parser.add_argument("output", type=Path, help="Output tiled PNG path")
    parser.add_argument("--repeats", type=int, default=4, help="Repeats across and down")
    parser.add_argument("--size", type=int, default=4096, help="Output size (square)")
    args = parser.parse_args()

    if Image is None:
        print("PIL/Pillow required", file=sys.stderr)
        sys.exit(1)
    if not args.input.exists():
        print(f"Not found: {args.input}", file=sys.stderr)
        sys.exit(1)

    img = Image.open(args.input).convert("RGBA")
    w, h = img.size
    if w <= 0 or h <= 0:
        sys.exit(1)
    n = args.repeats
    out_size = args.size
    # Tile to n×n repeats then resize to out_size
    tiled = Image.new("RGBA", (w * n, h * n))
    for i in range(n):
        for j in range(n):
            tiled.paste(img, (i * w, j * h))
    out = tiled.resize((out_size, out_size), Image.Resampling.LANCZOS)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    out.save(args.output)
    print(args.output)


if __name__ == "__main__":
    main()
