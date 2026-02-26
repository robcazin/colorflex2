#!/usr/bin/env bash
# Run the Bassett PSD through Photoshop (JSX) to get warped output.
# Requires: Photoshop installed, bridge file written, then Photoshop runs the JSX.
#
# Usage (from repo root; run from colorflex2-bassett when using the worktree):
#   ./scripts/run_bassett_photoshop.sh <psd_path> <pattern_path> [output_path] [--blanket HEX] [--tile]
#
#   --tile        Tile the pattern with 4 repeats across (and 4 down). Override with --repeats N.
#   --repeats N   With --tile: use N repeats across/down (default 4). Ignored without --tile.
#   --so-size N  With --tile: output size N×N to match SO layer (default 4096). Override with TILE_OUTPUT_SIZE.
#   TILE_WIDTH / TILE_HEIGHT  With --tile: use fixed pixel size instead of repeat count.
#   --pillow-scale N   Scale pillows (left/right) by N, e.g. 1.2 = 120% (default 1.0). Passed to JSX.
#   --sofa-scale N     Scale sofa fabric layer by N (default 1.0). Passed to JSX.
#
# Example:
#   ./scripts/run_bassett_photoshop.sh .../sofa-with-pillows-mockup-1.psd ~/Downloads/pantry.jpg --tile
#
# Output defaults to: colorflex2-bassett/bassett_psd_output/composite_photoshop.png (if worktree exists)
#   else ./bassett_psd_output/composite_photoshop.png
# Override with third argument or --output path.

set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)"
BASSETT_PSD="$REPO_ROOT/bassett_psd"
BRIDGE_FILE="$BASSETT_PSD/bassett_psd_bridge.txt"
DONE_FILE="$BASSETT_PSD/bassett_psd_done.txt"
JSX_FILE="$BASSETT_PSD/render_with_photoshop.jsx"

# REPO_ROOT = repo root (parent of scripts). Default output: when running from colorflex2-bassett worktree use ./bassett_psd_output; when running from main repo, use sibling colorflex2-bassett/bassett_psd_output if present.
default_out_dir() {
  local name
  name="$(basename "$REPO_ROOT")"
  if [ "$name" = "colorflex2-bassett" ]; then
    echo "$REPO_ROOT/bassett_psd_output"
  elif [ -d "$REPO_ROOT/../colorflex2-bassett" ]; then
    echo "$REPO_ROOT/../colorflex2-bassett/bassett_psd_output"
  else
    echo "$REPO_ROOT/bassett_psd_output"
  fi
}

OUT_DIR="$(default_out_dir)"
OUT_PATH=""
PSD_PATH=""
PATTERN_PATH=""
BLANKET_HEX="#336699"
TILE=""
REPEATS=4
SO_SIZE="${TILE_OUTPUT_SIZE:-4096}"
PILLOW_SCALE="1.0"
SOFA_SCALE="1.0"

while [ $# -gt 0 ]; do
  case "$1" in
    --output)   OUT_PATH="$2"; shift 2 ;;
    --blanket)  BLANKET_HEX="$2"; shift 2 ;;
    --tile)     TILE=1; shift ;;
    --repeats)  REPEATS="$2"; shift 2 ;;
    --so-size)  SO_SIZE="$2"; shift 2 ;;
    --pillow-scale) PILLOW_SCALE="$2"; shift 2 ;;
    --sofa-scale)   SOFA_SCALE="$2"; shift 2 ;;
    *)
      if [ -z "$PSD_PATH" ]; then PSD_PATH="$1"
      elif [ -z "$PATTERN_PATH" ]; then PATTERN_PATH="$1"
      elif [ -z "$OUT_PATH" ]; then OUT_PATH="$1"; fi
      shift
      ;;
  esac
done

if [ -z "$OUT_PATH" ]; then
  mkdir -p "$OUT_DIR"
  OUT_PATH="$OUT_DIR/composite_photoshop.png"
fi

if [ -z "$PSD_PATH" ] || [ -z "$PATTERN_PATH" ]; then
  echo "Usage: $0 <psd_path> <pattern_path> [output_path] [--blanket HEX] [--tile] [--repeats N] [--pillow-scale N] [--sofa-scale N]"
  exit 1
fi

PATTERN_ABS="$(cd "$(dirname "$PATTERN_PATH")" 2>/dev/null && pwd)/$(basename "$PATTERN_PATH")"
if [ -n "$TILE" ] && [ -f "$REPO_ROOT/scripts/tile_pattern_for_bassett.py" ]; then
  TILED="$(mktemp -t bassett_tiled.XXXXXX.png)"
  python3 "$REPO_ROOT/scripts/tile_pattern_for_bassett.py" "$PATTERN_ABS" "$TILED" --repeats "$REPEATS" --size "$SO_SIZE" 2>/dev/null || true
  if [ -f "$TILED" ]; then
    PATTERN_ABS="$TILED"
  fi
fi

mkdir -p "$(dirname "$OUT_PATH")"
echo "PSD_PATH=$PSD_PATH" > "$BRIDGE_FILE"
echo "PATTERN_PATH=$PATTERN_ABS" >> "$BRIDGE_FILE"
echo "OUTPUT_PATH=$OUT_PATH" >> "$BRIDGE_FILE"
echo "BLANKET_HEX=$BLANKET_HEX" >> "$BRIDGE_FILE"
echo "PILLOW_SCALE=$PILLOW_SCALE" >> "$BRIDGE_FILE"
echo "SOFA_SCALE=$SOFA_SCALE" >> "$BRIDGE_FILE"

# Run Photoshop with JSX (macOS)
if [ "$(uname)" = "Darwin" ] && [ -f "$JSX_FILE" ]; then
  osascript -e "tell application \"Adobe Photoshop 2024\" to do javascript file \"$JSX_FILE\"" 2>/dev/null || \
  osascript -e "tell application \"Adobe Photoshop 2023\" to do javascript file \"$JSX_FILE\"" 2>/dev/null || \
  osascript -e "tell application \"Adobe Photoshop\" to do javascript file \"$JSX_FILE\"" 2>/dev/null || true
fi

echo "Output: $OUT_PATH"
