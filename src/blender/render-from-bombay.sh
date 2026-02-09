#!/bin/bash
# Resume rendering from bombay onwards

BLENDER="/Applications/Blender.app/Contents/MacOS/Blender"
SCRIPT="./colorflex-batch-render.py"

GARMENT_NAMES=("dress" "pantsuit")
BLEND_FILES=(
    "/Volumes/K3/jobs/saffron/blender/dress-fabric-ready2.blend"
    "/Volumes/K3/jobs/saffron/blender/dress-fabric-girl-base3.blend"
)
GARMENT_OBJECTS=("dress" "winter2")

# Skip botanicals, start from bombay
COLLECTIONS=(
    "bombay"
    "coordinates"
    "cottage-sketch-book"
    "coverlets"
    "english-cottage"
    "farmhouse"
    "folksie"
    "geometry"
    "ikats"
    "new-orleans"
    "silk-road"
    "traditions"
)

echo "Starting render from bombay..."

for i in "${!GARMENT_NAMES[@]}"; do
    GARMENT="${GARMENT_NAMES[$i]}"
    BLEND_FILE="${BLEND_FILES[$i]}"
    GARMENT_OBJ="${GARMENT_OBJECTS[$i]}"

    for collection in "${COLLECTIONS[@]}"; do
        echo "Rendering: $collection/$GARMENT"
        
        "$BLENDER" "$BLEND_FILE" \
            --background \
            --python "$SCRIPT" \
            -- --collection="$collection" --garment="$GARMENT" --garment-object="$GARMENT_OBJ"
    done
done

echo "✅ Render complete!"
