#!/bin/bash
# BATCH 1: Botanicals + Bombay
# ~1,200 files, ~9-10 hours

BLENDER="/Applications/Blender.app/Contents/MacOS/Blender"
SCRIPT="./colorflex-batch-render.py"

GARMENT_NAMES=("dress" "pantsuit")
BLEND_FILES=(
    "/Volumes/K3/jobs/saffron/blender/dress-fabric-ready2.blend"
    "/Volumes/K3/jobs/saffron/blender/dress-fabric-girl-base3.blend"
)
GARMENT_OBJECTS=("dress" "winter2")

# Batch 1 collections (4 hours, 984 files)
COLLECTIONS=(
    "botanicals"
    "bombay"
    "coordinates"
)

echo "=================================================="
echo "🎨 BATCH 1: Botanicals + Bombay + Coordinates"
echo "=================================================="
echo "Estimated: 984 files, ~4 hours (4 samples)"
echo ""
read -p "Start render? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

START_TIME=$(date +%s)
TOTAL_RENDERS=$((${#COLLECTIONS[@]} * ${#GARMENT_NAMES[@]}))
CURRENT=0
FAILED=()

for i in "${!GARMENT_NAMES[@]}"; do
    GARMENT="${GARMENT_NAMES[$i]}"
    BLEND_FILE="${BLEND_FILES[$i]}"
    GARMENT_OBJ="${GARMENT_OBJECTS[$i]}"

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎭 GARMENT: $GARMENT (Object: $GARMENT_OBJ)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    for collection in "${COLLECTIONS[@]}"; do
        CURRENT=$((CURRENT + 1))
        echo ""
        echo "[$CURRENT/$TOTAL_RENDERS] Rendering: $collection/$GARMENT"
        echo "=================================================="

        "$BLENDER" "$BLEND_FILE" \
            --background \
            --python "$SCRIPT" \
            -- --collection="$collection" --garment="$GARMENT" --garment-object="$GARMENT_OBJ"

        if [ $? -eq 0 ]; then
            echo "✅ SUCCESS: $collection/$GARMENT"
        else
            echo "❌ FAILED: $collection/$GARMENT"
            FAILED+=("$collection/$GARMENT")
        fi
    done
done

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
HOURS=$((DURATION / 3600))
MINUTES=$(((DURATION % 3600) / 60))

echo ""
echo "=================================================="
echo "🎉 BATCH 1 COMPLETE"
echo "=================================================="
echo "Time: ${HOURS}h ${MINUTES}m"
echo "Successful: $((TOTAL_RENDERS - ${#FAILED[@]}))/$TOTAL_RENDERS"

if [ ${#FAILED[@]} -gt 0 ]; then
    echo ""
    echo "Failed:"
    for fail in "${FAILED[@]}"; do
        echo "  ❌ $fail"
    done
fi
