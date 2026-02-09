#!/bin/bash
# Batch render CLO versions for all ColorFlex collections
# Renders with multiple garment scenes
# Compatible with Bash 3.x (macOS default)
# 01.15.2026

BLENDER="/Applications/Blender.app/Contents/MacOS/Blender"
SCRIPT="./colorflex-batch-render.py"  # Script is in same directory

# Define garments using parallel arrays (Bash 3 compatible)
GARMENT_NAMES=("dress" "pantsuit")
BLEND_FILES=(
    "/Volumes/K3/jobs/saffron/blender/dress-fabric-ready2.blend"
    "/Volumes/K3/jobs/saffron/blender/dress-fabric-girl-base2.blend"
)
GARMENT_OBJECTS=("dress" "winter2")

# Collections to render with multi-scale (1.0X, 1.1X, 1.2X, 1.3X)
COLLECTIONS=(
    "botanicals"
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

echo "=================================================="
echo "🎨 BATCH RENDERING CLOTHING FOR ALL COLLECTIONS"
echo "🎭 Rendering with ${#GARMENT_NAMES[@]} garment models"
echo "=================================================="
echo "Total collections: ${#COLLECTIONS[@]}"
echo "Total renders: $((${#COLLECTIONS[@]} * ${#GARMENT_NAMES[@]}))"
echo ""

# Track progress
TOTAL_RENDERS=$((${#COLLECTIONS[@]} * ${#GARMENT_NAMES[@]}))
CURRENT=0
FAILED=()

# Iterate through garments using index
for i in "${!GARMENT_NAMES[@]}"; do
    GARMENT="${GARMENT_NAMES[$i]}"
    BLEND_FILE="${BLEND_FILES[$i]}"
    GARMENT_OBJ="${GARMENT_OBJECTS[$i]}"

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎭 GARMENT: $GARMENT (Object: $GARMENT_OBJ)"
    echo "📁 Blender file: $(basename "$BLEND_FILE")"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    for collection in "${COLLECTIONS[@]}"; do
        CURRENT=$((CURRENT + 1))
        echo ""
        echo "[$CURRENT/$TOTAL_RENDERS] Rendering: $collection/$GARMENT"
        echo "=================================================="

        # Run Blender in background with collection and garment
        "$BLENDER" "$BLEND_FILE" \
            --background \
            --python "$SCRIPT" \
            -- --collection="$collection" --garment="$GARMENT" --garment-object="$GARMENT_OBJ"

        # Check if successful
        if [ $? -eq 0 ]; then
            echo "✅ SUCCESS: $collection/$GARMENT rendered"
        else
            echo "❌ FAILED: $collection/$GARMENT"
            FAILED+=("$collection/$GARMENT")
        fi
    done
done

echo ""
echo "=================================================="
echo "🎉 BATCH RENDERING COMPLETE"
echo "=================================================="
echo "Total renders: $TOTAL_RENDERS"
echo "Successful: $((TOTAL_RENDERS - ${#FAILED[@]}))"
echo "Failed: ${#FAILED[@]}"

if [ ${#FAILED[@]} -gt 0 ]; then
    echo ""
    echo "Failed renders:"
    for fail in "${FAILED[@]}"; do
        echo "  ❌ $fail"
    done
    exit 1
else
    echo ""
    echo "✅ All collections rendered successfully!"
    echo ""
    echo "📁 Output directories created:"
    for collection in "${COLLECTIONS[@]}"; do
        echo ""
        echo "  Collection: ${collection}-clo/layers/"
        for garment in "${GARMENT_NAMES[@]}"; do
            echo "    - data/collections/${collection}-clo/layers/${garment}/"
        done
    done
    echo ""
    echo "📝 Next steps:"
    echo "  1. Deploy layer files: ./deploy-clo2-collections.sh <collection>"
    echo "  2. Update collections.json: python3 update-clo2-collection.py <collection>"
    echo "  3. Deploy collections.json: ./deploy-shopify-cli.sh data"
    exit 0
fi
