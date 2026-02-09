#!/bin/bash
# Deploy CLO-2 layer files to server for specified collections

# Server configuration (paths relative to src/blender/)
SSH_KEY="../../../code-build/deploy_key"  # Up 3 levels from src/blender/
SSH_PORT="2222"
SSH_USER="soanimat@162.241.24.65"
SERVER_PATH="/home4/soanimat/public_html/colorflex/data/collections"
LOCAL_BASE="../../data/collections"  # Up 2 levels from src/blender/

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=================================================="
echo "🚀 CLO-2 COLLECTIONS DEPLOYMENT SCRIPT"
echo "==================================================${NC}"

# Check if collection names provided
if [ $# -eq 0 ]; then
    echo -e "${RED}❌ No collections specified${NC}"
    echo ""
    echo "Usage: $0 <collection1> <collection2> ..."
    echo ""
    echo "Examples:"
    echo "  $0 bombay"
    echo "  $0 bombay coordinates english-cottage"
    echo "  $0 all  # Deploy all rendered CLO-2 collections"
    exit 1
fi

# Handle "all" option
if [ "$1" == "all" ]; then
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
else
    COLLECTIONS=("$@")
fi

TOTAL=${#COLLECTIONS[@]}
CURRENT=0
FAILED=()

echo ""
echo "📦 Collections to deploy: ${TOTAL}"
echo ""

for collection in "${COLLECTIONS[@]}"; do
    CURRENT=$((CURRENT + 1))

    echo -e "${BLUE}[$CURRENT/$TOTAL] Deploying: ${collection}-clo2${NC}"

    # Check if local directory exists
    LOCAL_PATH="${LOCAL_BASE}/${collection}-clo2/layers"
    if [ ! -d "$LOCAL_PATH" ]; then
        echo -e "${RED}  ❌ Directory not found: ${LOCAL_PATH}${NC}"
        FAILED+=("${collection}")
        echo ""
        continue
    fi

    # Count files to upload
    FILE_COUNT=$(ls -1 "${LOCAL_PATH}"/*.png 2>/dev/null | wc -l)
    echo "  📁 Files to upload: ${FILE_COUNT}"

    if [ "$FILE_COUNT" -eq 0 ]; then
        echo -e "${RED}  ❌ No PNG files found in ${LOCAL_PATH}${NC}"
        FAILED+=("${collection}")
        echo ""
        continue
    fi

    # Create directory on server first
    echo "  📂 Creating directory on server..."
    ssh -p ${SSH_PORT} -i ${SSH_KEY} ${SSH_USER} \
        "mkdir -p ${SERVER_PATH}/${collection}-clo2/layers"

    # Deploy using rsync
    rsync -avz --progress \
        -e "ssh -p ${SSH_PORT} -i ${SSH_KEY}" \
        "${LOCAL_PATH}/" \
        "${SSH_USER}:${SERVER_PATH}/${collection}-clo2/layers/"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}  ✅ Successfully deployed ${collection}-clo2${NC}"
    else
        echo -e "${RED}  ❌ Failed to deploy ${collection}-clo2${NC}"
        FAILED+=("${collection}")
    fi

    echo ""
done

# Summary
echo -e "${BLUE}=================================================="
echo "📊 DEPLOYMENT SUMMARY"
echo "==================================================${NC}"
echo "Total: $TOTAL collections"
echo "Successful: $((TOTAL - ${#FAILED[@]}))"
echo "Failed: ${#FAILED[@]}"

if [ ${#FAILED[@]} -gt 0 ]; then
    echo ""
    echo -e "${RED}Failed collections:${NC}"
    for fail in "${FAILED[@]}"; do
        echo "  ❌ $fail"
    done
    exit 1
else
    echo ""
    echo -e "${GREEN}✅ All collections deployed successfully!${NC}"
    echo ""
    echo "🌐 Files are now live at:"
    for collection in "${COLLECTIONS[@]}"; do
        echo "  https://so-animation.com/colorflex/data/collections/${collection}-clo2/layers/"
    done
    exit 0
fi
