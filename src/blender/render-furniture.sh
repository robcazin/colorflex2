#!/bin/bash
set -euo pipefail

ROOT="/Volumes/K3/jobs/saffron/colorFlex-shopify/src/blender"
BLENDER="/Applications/Blender.app/Contents/MacOS/Blender"
BLEND="$ROOT/kite-sofa-ready1.blend"
SCRIPT="$ROOT/colorflex-batch-render-multires-pc.py"

COLLECTION="ikats"
PIECE="Sofa-Kite"
PIECE_OBJECT="Sofa-Kite"

cd "$ROOT"

"$BLENDER" \
  --factory-startup \
  "$BLEND" \
  --background \
  --python "$SCRIPT" \
  -- --collection="$COLLECTION" --piece="$PIECE" --piece-object="$PIECE_OBJECT"
