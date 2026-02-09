#!/bin/bash

# ColorFlex Data Consolidation Script
# Prepares data for deployment by ensuring all files are in proper locations

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 ColorFlex Deploy Preparation${NC}"
echo -e "${BLUE}===============================${NC}"

# Ensure directories exist
echo -e "${YELLOW}📁 Ensuring directory structure...${NC}"
mkdir -p src/data/collections
mkdir -p src/data/mockups
mkdir -p dist

# Check for required files
echo -e "${YELLOW}🔍 Checking required files...${NC}"

REQUIRED_FILES=(
    "src/data/collections.json"
    "src/data/colors.json"
    "src/data/furniture-config.json"
)

MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    else
        echo -e "${GREEN}✅ Found: $file${NC}"
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Missing files:${NC}"
    for file in "${MISSING_FILES[@]}"; do
        echo -e "   ❌ $file"
    done
    echo ""
    echo -e "${YELLOW}💡 To generate missing files:${NC}"
    echo "   - Run: node src/data/cf-dl.js true [collection-name]"
    echo "   - Or restore from backup: ./restore_collections.sh"
    echo ""
fi

# Check collections directory
echo -e "${YELLOW}🖼️  Checking collections directory...${NC}"
if [ -d "src/data/collections" ]; then
    COLLECTION_COUNT=$(find src/data/collections -maxdepth 1 -type d | wc -l)
    COLLECTION_COUNT=$((COLLECTION_COUNT - 1)) # Subtract the collections dir itself
    echo -e "${GREEN}✅ Found $COLLECTION_COUNT collections${NC}"
    
    # List collections
    if [ $COLLECTION_COUNT -gt 0 ]; then
        echo -e "${BLUE}📋 Available collections:${NC}"
        for dir in src/data/collections/*/; do
            if [ -d "$dir" ]; then
                collection=$(basename "$dir")
                thumbnail_count=$(find "$dir/thumbnails" -name "*.jpg" -o -name "*.png" 2>/dev/null | wc -l)
                layer_count=$(find "$dir/layers" -name "*.jpg" -o -name "*.png" 2>/dev/null | wc -l)
                echo -e "   📁 ${collection}: ${thumbnail_count} thumbnails, ${layer_count} layers"
            fi
        done
    fi
else
    echo -e "${YELLOW}⚠️  Collections directory not found: src/data/collections${NC}"
fi

# Check if build exists
echo -e "${YELLOW}🔨 Checking build status...${NC}"
if [ -f "dist/color-flex-core.min.js" ]; then
    BUILD_SIZE=$(du -h dist/color-flex-core.min.js | cut -f1)
    echo -e "${GREEN}✅ Build exists: color-flex-core.min.js (${BUILD_SIZE})${NC}"
else
    echo -e "${YELLOW}⚠️  No build found. Run: npm run build${NC}"
fi

# Show deployment options
echo ""
echo -e "${BLUE}🚀 Ready for deployment!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo ""
echo -e "${GREEN}Option 1 - Full deployment:${NC}"
echo "   ./deploy.sh -all"
echo ""
echo -e "${GREEN}Option 2 - Step by step:${NC}"
echo "   ./deploy.sh -build      # Build application"
echo "   ./deploy.sh -app        # Deploy application"
echo "   ./deploy.sh -data       # Deploy data files"
echo "   ./deploy.sh -images     # Deploy all images"
echo ""
echo -e "${GREEN}Option 3 - Specific collection:${NC}"
echo "   ./deploy.sh -collection botanicals"
echo ""
echo -e "${GREEN}Option 4 - Data update only:${NC}"
echo "   ./deploy.sh -data -csv"
echo ""

# Make deploy script executable
chmod +x deploy.sh
echo -e "${GREEN}✅ Deploy script is now executable${NC}"