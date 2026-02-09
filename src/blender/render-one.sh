#!/bin/bash
# Quick wrapper to render a single pattern
# Usage: ./render-one.sh folksie "Folk Sketches" dress [rotation]

COLLECTION=$1
PATTERN=$2
GARMENT=${3:-dress}  # Default to dress if not specified
ROTATION=${4:-0}     # Default to 0 degrees if not specified

if [ -z "$COLLECTION" ] || [ -z "$PATTERN" ]; then
    echo "Usage: ./render-one.sh <collection> <pattern-name> [garment] [rotation]"
    echo ""
    echo "Examples:"
    echo "  ./render-one.sh folksie \"Folk Sketches\" dress"
    echo "  ./render-one.sh folksie \"Folk Sketches\" dress 90"
    echo "  ./render-one.sh farmhouse \"Folkart Sketch\" dress 180"
    echo "  ./render-one.sh botanicals \"Flowering Fern\" pantsuit 0"
    echo ""
    exit 1
fi

BLEND_FILE="/Volumes/K3/jobs/saffron/blender/dress-fabric-ready2.blend"

echo "🎬 Rendering single pattern..."
echo "   Collection: $COLLECTION"
echo "   Pattern: $PATTERN"
echo "   Garment: $GARMENT"
if [ "$ROTATION" != "0" ]; then
    echo "   Rotation: ${ROTATION}°"
fi
echo ""

/Applications/Blender.app/Contents/MacOS/Blender \
    "$BLEND_FILE" \
    --background \
    --python "$(dirname "$0")/render-single-pattern.py" \
    -- \
    --collection="$COLLECTION" \
    --pattern="$PATTERN" \
    --garment="$GARMENT" \
    --garment-object="$GARMENT" \
    --rotation="$ROTATION"

echo ""
echo "✅ Done! Files saved to:"
echo "   data/collections/${COLLECTION}-clo/layers/${GARMENT}/"
