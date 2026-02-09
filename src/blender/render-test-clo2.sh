#!/bin/bash
# TEST RENDER - Single collection to verify UV scales
# Renders botanicals collection only (4 patterns, 15 layers)
# Total: 15 layers × 2 garments × 4 scales = 120 PNG files
# Estimated time: 15-20 minutes

BLENDER="/Applications/Blender.app/Contents/MacOS/Blender"
SCRIPT="./colorflex-batch-render.py"

# Define garments using parallel arrays (Bash 3 compatible)
GARMENT_NAMES=("dress" "pantsuit")
BLEND_FILES=(
    "/Volumes/K3/jobs/saffron/blender/dress-fabric-ready2.blend"
    "/Volumes/K3/jobs/saffron/blender/dress-fabric-girl-base3.blend"
)
GARMENT_OBJECTS=("dress" "winter2")

# TEST: Only botanicals collection
COLLECTIONS=("botanicals")

echo "=================================================="
echo "🧪 TEST RENDER: Botanicals Collection"
echo "=================================================="
echo "This will render:"
echo "  - 4 patterns (Flowering Fern, etc.)"
echo "  - 15 total layers"
echo "  - 2 garments (dress + pantsuit)"
echo "  - 4 scales (1.0X, 1.2X, 1.5X, 2.0X)"
echo "  - Total: 120 PNG files"
echo "  - Estimated time: 15-20 minutes"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

# Track progress
TOTAL_RENDERS=$((${#COLLECTIONS[@]} * ${#GARMENT_NAMES[@]}))
CURRENT=0
START_TIME=$(date +%s)

# Iterate through garments
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

        # Run Blender in background
        "$BLENDER" "$BLEND_FILE" \
            --background \
            --python "$SCRIPT" \
            -- --collection="$collection" --garment="$GARMENT" --garment-object="$GARMENT_OBJ"

        if [ $? -eq 0 ]; then
            echo "✅ SUCCESS: $collection/$GARMENT rendered"
        else
            echo "❌ FAILED: $collection/$GARMENT"
            exit 1
        fi
    done
done

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

echo ""
echo "=================================================="
echo "🎉 TEST RENDER COMPLETE"
echo "=================================================="
echo "Time elapsed: ${MINUTES}m ${SECONDS}s"
echo ""
echo "📁 Output location:"
echo "  data/collections/botanicals-clo/layers/dress/"
echo "  data/collections/botanicals-clo/layers/pantsuit/"
echo ""
echo "🔍 Verify UV scales:"
echo "  1. Check pattern sizes look correct"
echo "  2. Compare 1.0X vs 2.0X - should be 2X larger"
echo "  3. Check all 4 scales rendered (120 total PNG files)"
echo ""
echo "✅ If scales look good, run full render:"
echo "  ./render-all-clo2.sh"
echo ""
