#!/usr/bin/env python3
"""
Export Bassett PSD: composite (pattern + blanket) and/or raw layers.
Run from repo root. Uses bassett_psd package (pip install -r requirements-psd.txt).

  # Composite only (default)
  python scripts/bassett_psd_export.py <psd> <pattern> --out-dir ./out --blanket "#336699"

  # Export raw layers only (no pattern used)
  python scripts/bassett_psd_export.py <psd> <pattern> --out-dir ./my_layers --layers-only

  # Composite + also export per-layer PNGs
  python scripts/bassett_psd_export.py <psd> <pattern> --layers
"""
import argparse
import sys
from pathlib import Path

# Repo root = parent of scripts
REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

from bassett_psd.processor import process_psd_to_composite_png
from bassett_psd.export_layers_raw import export_layers_raw


def default_out_dir():
    if (REPO_ROOT.parent / "colorflex2-bassett").is_dir():
        return REPO_ROOT.parent / "colorflex2-bassett" / "bassett_psd_output"
    return REPO_ROOT / "bassett_psd_output"


def main():
    parser = argparse.ArgumentParser(description="Bassett PSD → composite PNG and/or raw layers")
    parser.add_argument("psd_path", type=Path, help="Path to sofa PSD")
    parser.add_argument("pattern_path", type=Path, nargs="?", default=None, help="Path to pattern image (optional for --layers-only)")
    parser.add_argument("--out-dir", type=Path, default=None, help="Output directory (default: colorflex2-bassett/bassett_psd_output if worktree exists, else ./bassett_psd_output)")
    parser.add_argument("--blanket", type=str, default="#336699", help="Blanket color hex")
    parser.add_argument("--layers", action="store_true", help="In addition to composite, export each layer as PNG")
    parser.add_argument("--layers-only", action="store_true", help="Only export raw layers as PNGs (no composite; pattern not used)")
    args = parser.parse_args()

    if not args.psd_path.exists():
        print(f"PSD not found: {args.psd_path}", file=sys.stderr)
        sys.exit(1)

    out_dir = args.out_dir if args.out_dir is not None else default_out_dir()
    out_dir = out_dir.resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    if args.layers_only:
        results = export_layers_raw(args.psd_path, out_dir, layer_names=None)
        for name, p in results:
            print(p)
        return

    if args.pattern_path is None or not args.pattern_path.exists():
        print("Pattern path required for composite (omit --layers-only to generate composite).", file=sys.stderr)
        sys.exit(1)

    pattern = str(args.pattern_path)

    # Composite
    result = process_psd_to_composite_png(str(args.psd_path), pattern, args.blanket)
    out_path = out_dir / "composite.png"
    if "data_url" in result:
        import base64
        data = result["data_url"].split(",", 1)[1]
        out_path.write_bytes(base64.b64decode(data))
    print(out_path)

    if args.layers:
        results = export_layers_raw(args.psd_path, out_dir, layer_names=None)
        for name, p in results:
            print(p)


if __name__ == "__main__":
    main()
