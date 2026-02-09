#!/bin/bash

# ColorFlex Incremental Update Script
# Downloads only new/missing content from Airtable, preserving existing data

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 ColorFlex Incremental Update${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo -e "${YELLOW}💡 This script provides smart incremental updates from Airtable:${NC}"
echo "   • Only downloads missing or new images"
echo "   • Preserves existing collections data"
echo "   • Much faster than full downloads"
echo ""

# Check if collections.json exists
if [ ! -f "data/collections.json" ]; then
    echo -e "${RED}❌ No existing collections.json found.${NC}"
    echo -e "${YELLOW}💡 For first-time setup, run: node data/cf-dl.js true${NC}"
    exit 1
fi

# Parse existing collections.json to see what we have
echo -e "${YELLOW}📋 Analyzing existing collections...${NC}"

# Get current collection count
CURRENT_COUNT=$(node -e "
try {
    const data = require('./data/collections.json');
    console.log('Current collections: ' + data.collections.length);
    data.collections.forEach(c => {
        const patternCount = c.patterns ? c.patterns.length : 0;
        console.log('  📁 ' + c.name + ': ' + patternCount + ' patterns');
    });
} catch(e) {
    console.log('Error reading collections.json');
}
")

echo "$CURRENT_COUNT"

# Check what collection directories exist
echo -e "${YELLOW}🖼️  Checking downloaded assets...${NC}"
if [ -d "data/collections" ]; then
    for dir in data/collections/*/; do
        if [ -d "$dir" ]; then
            collection=$(basename "$dir")
            if [ "$collection" != "coordinates" ]; then
                thumbnail_count=$(find "$dir/thumbnails" -name "*.jpg" -o -name "*.png" 2>/dev/null | wc -l)
                layer_count=$(find "$dir/layers" -name "*.jpg" -o -name "*.png" 2>/dev/null | wc -l)
                echo -e "  🖼️  ${collection}: ${thumbnail_count} thumbnails, ${layer_count} layers"
            fi
        fi
    done
    
    # Check coordinates separately
    if [ -d "data/collections/coordinates" ]; then
        coord_thumb_count=$(find "data/collections/coordinates/thumbnails" -name "*.jpg" -o -name "*.png" 2>/dev/null | wc -l)
        coord_layer_count=$(find "data/collections/coordinates/layers" -name "*.jpg" -o -name "*.png" 2>/dev/null | wc -l)
        echo -e "  🎯 coordinates: ${coord_thumb_count} thumbnails, ${coord_layer_count} layers"
    fi
fi

echo ""
echo -e "${BLUE}🎯 Update Options:${NC}"
echo ""
echo -e "${GREEN}1. Incremental Data Update:${NC}"
echo "   - Updates collections.json with latest Airtable data"
echo "   - Preserves existing data, adds new patterns"
echo "   - No image downloads"
echo ""
echo -e "${GREEN}2. Incremental with Missing Images:${NC}"  
echo "   - Updates data AND downloads missing images"
echo "   - Only downloads images that don't exist locally"
echo "   - Skips existing files"
echo ""
echo -e "${GREEN}3. Full Refresh (Specific Collection):${NC}"
echo "   - Completely refresh one collection"
echo "   - Re-downloads all images for that collection"
echo "   - Updates data for that collection only"
echo ""
echo -e "${GREEN}4. Force Refresh (Specific Collection):${NC}"
echo "   - Force re-download all images even if they exist"
echo "   - Useful for fixing corrupted images"
echo "   - Uses 'force' parameter to bypass file checks"
echo ""
echo -e "${GREEN}5. Generate Shopify CSV Only:${NC}"
echo "   - Generate standardized Shopify import CSV"
echo "   - Uses existing collections.json data"
echo "   - Places CSV in deployment/csv/ directory"
echo ""

# Get user choice
echo -e "${YELLOW}Choose an option (1-5): ${NC}"
read -r choice

case $choice in
    1)
        echo -e "${BLUE}🔄 Running incremental data update...${NC}"
        echo -e "${YELLOW}Fetching latest data from Airtable (no images)...${NC}"
        echo -e "${BLUE}📝 This will regenerate collections.json with updated paths${NC}"
        node src/scripts/cf-dl.js false null false
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Data update completed!${NC}"
            echo -e "${YELLOW}💡 To deploy: ./deploy.sh -data${NC}"
        else
            echo -e "${RED}❌ Data update failed${NC}"
        fi
        ;;
        
    2)
        echo -e "${BLUE}🔄 Running incremental update with missing images...${NC}"
        
        # First update data
        echo -e "${YELLOW}Step 1: Updating data from Airtable...${NC}"
        node src/scripts/cf-dl.js false null false
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Data updated successfully${NC}"
            
            # Then download missing images
            echo -e "${YELLOW}Step 2: Downloading missing images...${NC}"
            node src/scripts/cf-dl.js true null false
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Incremental update completed!${NC}"
                echo -e "${YELLOW}💡 To deploy: ./deploy.sh -data -images${NC}"
            else
                echo -e "${RED}❌ Image download failed${NC}"
            fi
        else
            echo -e "${RED}❌ Data update failed${NC}"
        fi
        ;;
        
    3)
        echo -e "${YELLOW}Available collections:${NC}"
        echo "  - botanicals"
        echo "  - farmhouse" 
        echo "  - english-cottage"
        echo "  - abundance"
        echo "  - traditions"
        echo "  - coordinates"
        echo "  - bombay"
        echo "  - geometry"
        echo "  - silk-road"
        echo "  - wall-panels"
        echo "  - new-orleans"
        echo "  - folksie"
        echo "  - coverlets"
        echo ""
        echo -e "${YELLOW}Enter collection name to refresh: ${NC}"
        read -r collection_name
        
        if [ -n "$collection_name" ]; then
            echo -e "${BLUE}🔄 Full refresh for collection: ${collection_name}${NC}"
            
            # Remove existing collection directory to force re-download
            if [ -d "data/collections/${collection_name}" ]; then
                echo -e "${YELLOW}🗑️  Removing existing ${collection_name} images...${NC}"
                rm -rf "data/collections/${collection_name}"
            fi
            
            # Update and download for specific collection
            node src/scripts/cf-dl.js true "$collection_name" false
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Full refresh of '${collection_name}' completed!${NC}"
                echo -e "${YELLOW}💡 To deploy: ./deploy.sh -collection ${collection_name} -data${NC}"
            else
                echo -e "${RED}❌ Collection refresh failed${NC}"
            fi
        else
            echo -e "${RED}❌ No collection name provided${NC}"
        fi
        ;;
        
    4)
        echo -e "${YELLOW}Available collections:${NC}"
        echo "  - botanicals"
        echo "  - farmhouse" 
        echo "  - english-cottage"
        echo "  - abundance"
        echo "  - traditions"
        echo "  - coordinates"
        echo "  - bombay"
        echo "  - geometry"
        echo "  - silk-road"
        echo "  - wall-panels"
        echo "  - new-orleans"
        echo "  - folksie"
        echo "  - coverlets"
        echo ""
        echo -e "${YELLOW}Enter collection name to force refresh: ${NC}"
        read -r collection_name
        
        if [ -n "$collection_name" ]; then
            echo -e "${BLUE}🔄 Force refresh for collection: ${collection_name}${NC}"
            echo -e "${YELLOW}⚠️  This will re-download ALL images even if they exist${NC}"
            
            # Use force download parameter to re-download everything
            node src/scripts/cf-dl.js true "$collection_name" force
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Force refresh of '${collection_name}' completed!${NC}"
                echo -e "${YELLOW}💡 To deploy: ./deploy.sh -collection ${collection_name} -data${NC}"
            else
                echo -e "${RED}❌ Force refresh failed${NC}"
            fi
        else
            echo -e "${RED}❌ No collection name provided${NC}"
        fi
        ;;
        
    5)
        echo -e "${BLUE}📄 Generating Shopify CSV...${NC}"
        echo -e "${YELLOW}Creating standardized import file in deployment/csv/${NC}"
        
        cd data
        node ../src/scripts/cf-dl.js false null true false
        cd ..
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Shopify CSV generated successfully!${NC}"
            echo -e "${YELLOW}📁 File location: deployment/csv/shopify-import-$(date +%Y%m%d).csv${NC}"
            echo -e "${YELLOW}💡 Ready for Shopify import${NC}"
        else
            echo -e "${RED}❌ CSV generation failed${NC}"
        fi
        ;;
        
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}📊 Post-Update Summary:${NC}"

# Show updated counts
UPDATED_COUNT=$(node -e "
try {
    const data = require('./data/collections.json');
    console.log('Total collections: ' + data.collections.length);
    let totalPatterns = 0;
    data.collections.forEach(c => {
        const patternCount = c.patterns ? c.patterns.length : 0;
        totalPatterns += patternCount;
    });
    console.log('Total patterns: ' + totalPatterns);
} catch(e) {
    console.log('Error reading updated collections.json');
}
")

echo "$UPDATED_COUNT"

echo -e "${GREEN}🎉 Update process completed!${NC}"