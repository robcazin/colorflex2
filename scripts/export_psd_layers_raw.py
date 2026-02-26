#!/usr/bin/env python3
"""
Export PSD layers as raw PNGs. Wrapper around bassett_psd.export_layers_raw.
Usage: python scripts/export_psd_layers_raw.py <psd_path> [--out-dir DIR] [--layer "Name 1" "Name 2"]
"""
import argparse
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

from bassett_psd.export_layers_raw import export_layers_raw


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("psd_path", type=Path)
    parser.add_argument("--out-dir", type=Path, default=Path("./layers_out"))
    parser.add_argument("--layer", action="append", dest="layers", default=[])
    args = parser.parse_args()

    layers = args.layers if args.layers else None
    results = export_layers_raw(args.psd_path, args.out_dir, layers)
    for name, p in results:
        print(name, "->", p)


if __name__ == "__main__":
    main()
