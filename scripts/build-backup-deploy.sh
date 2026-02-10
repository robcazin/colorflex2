#!/bin/bash

# ColorFlex Build and Deploy Script
# Builds minified JS (and optionally templates) and deploys to Shopify.
# History/restore: use Git (e.g. ./scripts/git-save.sh "message" then git checkout if needed).
# Usage: ./scripts/build-backup-deploy.sh <mode> [description]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
ASSETS_DIR="src/assets"
SOURCE_DIR="src"
FURNITURE_CONFIG="${ASSETS_DIR}/furniture-config.json"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Read store from config file
CONFIG_FILE="config/shopify.json"
if [ -f "$CONFIG_FILE" ]; then
    # Extract store from production config (fallback to hardcoded if jq not available)
    SHOPIFY_STORE=$(jq -r '.production.store' "$CONFIG_FILE" 2>/dev/null || \
        grep -o '"store"[[:space:]]*:[[:space:]]*"[^"]*"' "$CONFIG_FILE" | \
        head -1 | sed 's/.*"store"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/' || \
        echo "f63bae-86.myshopify.com")
else
    SHOPIFY_STORE="f63bae-86.myshopify.com"
fi

# Mode to build command and output file mapping (bash 3.2 compatible)
get_build_cmd() {
    case "$1" in
        furniture) echo "build:furniture" ;;
        clothing) echo "build:clothing" ;;
        furniture-simple) echo "build:furniture-simple" ;;
        clothing-simple) echo "build:clothing-simple" ;;
        wallpaper) echo "build:wallpaper" ;;
        all) echo "build:all" ;;
        *) echo "" ;;
    esac
}

get_output_file() {
    case "$1" in
        furniture) echo "color-flex-furniture.min.js" ;;
        clothing) echo "color-flex-clothing.min.js" ;;
        furniture-simple) echo "color-flex-furniture-simple.min.js" ;;
        clothing-simple) echo "color-flex-clothing-simple.min.js" ;;
        wallpaper) echo "color-flex-core.min.js" ;;
        all) echo "all" ;;  # Special marker for all mode
        *) echo "" ;;
    esac
}

# Get all output files for "all" mode
get_all_output_files() {
    echo "color-flex-core.min.js"
    echo "color-flex-furniture.min.js"
    echo "color-flex-clothing.min.js"
}

# Function to show usage
show_usage() {
    echo "ColorFlex Build and Deploy"
    echo "=========================="
    echo ""
    echo "Usage: $0 <mode> [description]"
    echo ""
    echo "Modes:"
    echo "  all              - Build and deploy ALL (wallpaper, furniture, clothing)"
    echo "  furniture        - Build and deploy furniture page"
    echo "  clothing         - Build and deploy clothing page"
    echo "  furniture-simple - Build and deploy furniture-simple page"
    echo "  clothing-simple  - Build and deploy clothing-simple page"
    echo "  wallpaper        - Build and deploy wallpaper/core page"
    echo ""
    echo "Options:"
    echo "  [description]     - Optional (unused; kept for compatibility)"
    echo ""
    echo "Examples:"
    echo "  $0 all"
    echo "  $0 wallpaper"
    echo "  $0 furniture"
    echo ""
    echo "History/restore: use Git (e.g. git checkout <commit> -- path/to/file). See docs/GIT_LOCAL_WORKFLOW.md"
    echo ""
}

# Main execution
COMMAND="${1:-}"
MODE="${2:-}"

# Normal build+deploy flow
MODE="$COMMAND"
DESCRIPTION="${2:-Build + deploy for ${MODE}}"

if [ -z "$MODE" ]; then
    echo -e "${RED}❌ Error: Mode required${NC}"
    echo ""
    show_usage
    exit 1
fi

# Validate mode and get build command/output file
BUILD_CMD=$(get_build_cmd "$MODE")
OUTPUT_FILE=$(get_output_file "$MODE")

if [ -z "$BUILD_CMD" ] || [ -z "$OUTPUT_FILE" ]; then
    echo -e "${RED}❌ Error: Unknown mode: ${MODE}${NC}"
    echo ""
    show_usage
    exit 1
fi

# Check if this is "all" mode
IS_ALL_MODE=false
if [ "$OUTPUT_FILE" = "all" ]; then
    IS_ALL_MODE=true
    OUTPUT_PATH=""  # Will be set per file in all mode
else
    OUTPUT_PATH="${ASSETS_DIR}/${OUTPUT_FILE}"
fi

echo -e "${CYAN}🚀 ColorFlex Build and Deploy${NC}"
echo -e "${CYAN}============================${NC}"
echo ""
echo -e "Mode: ${BLUE}${MODE}${NC}"
echo -e "Build: ${YELLOW}npm run ${BUILD_CMD}${NC}"
if [ "$IS_ALL_MODE" = true ]; then
    echo -e "Files: ${GREEN}All (wallpaper, furniture, clothing)${NC}"
else
    echo -e "File: ${GREEN}${OUTPUT_FILE}${NC}"
fi
echo ""

# Step 1: Build
echo -e "${BLUE}📦 Step 1/2: Building...${NC}"
echo ""

if [ "$IS_ALL_MODE" = true ]; then
    # For "all" mode, track all files (bash 3.2 compatible - no associative arrays)
    ALL_FILES=($(get_all_output_files))
    
    echo -e "${CYAN}📊 Before build:${NC}"
    for file in "${ALL_FILES[@]}"; do
        file_path="${ASSETS_DIR}/${file}"
        if [ -f "$file_path" ]; then
            file_size=$(stat -f "%z" "$file_path" 2>/dev/null || stat -c "%s" "$file_path" 2>/dev/null || echo "0")
            echo -e "   ${file}: ${file_size} bytes"
        else
            echo -e "   ${file}: (new file)"
        fi
    done
    echo ""
else
    # For single mode, track one file
    OLD_MOD_TIME="0"
    OLD_SIZE="0"
    if [ -f "$OUTPUT_PATH" ]; then
        OLD_MOD_TIME=$(stat -f "%m" "$OUTPUT_PATH" 2>/dev/null || stat -c "%Y" "$OUTPUT_PATH" 2>/dev/null || echo "0")
        OLD_SIZE=$(stat -f "%z" "$OUTPUT_PATH" 2>/dev/null || stat -c "%s" "$OUTPUT_PATH" 2>/dev/null || echo "0")
        echo -e "${CYAN}📊 Before build:${NC}"
        echo -e "   File: ${OUTPUT_FILE}"
        echo -e "   Size: ${OLD_SIZE} bytes"
        echo -e "   Modified: $(date -r "$OLD_MOD_TIME" 2>/dev/null || date -d "@$OLD_MOD_TIME" 2>/dev/null || echo 'unknown')"
        echo ""
    fi
fi

npm run "${BUILD_CMD}"
echo ""

# Verify build output
if [ "$IS_ALL_MODE" = true ]; then
    # Verify all files were built
    ALL_FILES=($(get_all_output_files))
    MISSING_FILES=()
    for file in "${ALL_FILES[@]}"; do
        file_path="${ASSETS_DIR}/${file}"
        if [ ! -f "$file_path" ]; then
            MISSING_FILES+=("$file")
        fi
    done
    
    if [ ${#MISSING_FILES[@]} -gt 0 ]; then
        echo -e "${RED}❌ Build failed: Missing files: ${MISSING_FILES[*]}${NC}"
        exit 1
    fi
    
    # Show after build stats
    echo -e "${CYAN}📊 After build:${NC}"
    for file in "${ALL_FILES[@]}"; do
        file_path="${ASSETS_DIR}/${file}"
        NEW_SIZE=$(stat -f "%z" "$file_path" 2>/dev/null || stat -c "%s" "$file_path" 2>/dev/null || echo "0")
        echo -e "   ${file}: ${NEW_SIZE} bytes"
    done
    echo ""
    echo -e "${GREEN}✅ Build complete: All files built${NC}"
    echo ""
else
    # Single file mode
    if [ ! -f "$OUTPUT_PATH" ]; then
        echo -e "${RED}❌ Build failed: ${OUTPUT_FILE} not found${NC}"
        exit 1
    fi
    
    # Get file modification time AFTER build
    NEW_MOD_TIME=$(stat -f "%m" "$OUTPUT_PATH" 2>/dev/null || stat -c "%Y" "$OUTPUT_PATH" 2>/dev/null || echo "0")
    NEW_SIZE=$(stat -f "%z" "$OUTPUT_PATH" 2>/dev/null || stat -c "%s" "$OUTPUT_PATH" 2>/dev/null || echo "0")
    
    echo -e "${CYAN}📊 After build:${NC}"
    echo -e "   File: ${OUTPUT_FILE}"
    echo -e "   Size: ${NEW_SIZE} bytes"
    echo -e "   Modified: $(date -r "$NEW_MOD_TIME" 2>/dev/null || date -d "@$NEW_MOD_TIME" 2>/dev/null || echo 'unknown')"
    echo ""
    
    if [ "$OLD_MOD_TIME" != "0" ] && [ "$OLD_MOD_TIME" = "$NEW_MOD_TIME" ]; then
        echo -e "${YELLOW}⚠️  WARNING: File modification time unchanged - build may not have updated the file!${NC}"
        echo -e "${YELLOW}   Old: ${OLD_MOD_TIME}, New: ${NEW_MOD_TIME}${NC}"
        echo ""
    fi
    
    if [ "$OLD_SIZE" != "0" ] && [ "$OLD_SIZE" = "$NEW_SIZE" ]; then
        echo -e "${YELLOW}⚠️  WARNING: File size unchanged - build may not have updated the file!${NC}"
        echo -e "${YELLOW}   Old: ${OLD_SIZE} bytes, New: ${NEW_SIZE} bytes${NC}"
        echo ""
    fi
    
    echo -e "${GREEN}✅ Build complete: ${OUTPUT_FILE}${NC}"
    echo ""
fi

# Step 2: Deploy
echo -e "${BLUE}🚀 Step 2/2: Deploying to Shopify...${NC}"
echo ""

if [ "$IS_ALL_MODE" = true ]; then
    ALL_FILES=($(get_all_output_files))
    echo -e "${YELLOW}⚠️  About to deploy ALL files:${NC}"
    for file in "${ALL_FILES[@]}"; do
        echo -e "   - ${file}"
    done
    echo ""
    read -p "Continue with deployment? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Deployment cancelled${NC}"
        exit 0
    fi
    
    echo ""
    THEME_ID="150150381799"
    
    # Deploy all files
    for file in "${ALL_FILES[@]}"; do
        echo -e "${BLUE}Uploading ${file}...${NC}"
        shopify theme push --theme=${THEME_ID} --store=${SHOPIFY_STORE} --path src --only "assets/${file}"
        if [ $? -eq 0 ]; then
            echo -e "   ${GREEN}✅ ${file} deployed${NC}"
        else
            echo -e "   ${RED}❌ ${file} deployment failed${NC}"
        fi
        echo ""
    done
    
    # Also deploy furniture-config.json if it exists
    if [ -f "$FURNITURE_CONFIG" ]; then
        echo -e "${BLUE}Uploading furniture-config.json...${NC}"
        shopify theme push --theme=${THEME_ID} --store=${SHOPIFY_STORE} --path src --only "assets/furniture-config.json"
        if [ $? -eq 0 ]; then
            echo -e "   ${GREEN}✅ furniture-config.json deployed${NC}"
        else
            echo -e "   ${YELLOW}⚠️  furniture-config.json deployment failed (may not exist)${NC}"
        fi
        echo ""
    fi
    
    echo -e "${GREEN}✅ Deployment complete!${NC}"
    echo ""
    echo -e "${CYAN}📋 Summary:${NC}"
    echo -e "   Mode: ${MODE} (all pages)"
    echo -e "   Files deployed: ${#ALL_FILES[@]}"
    echo ""
else
    echo -e "${YELLOW}⚠️  About to deploy: ${OUTPUT_FILE}${NC}"
    echo ""
    read -p "Continue with deployment? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Deployment cancelled${NC}"
        exit 0
    fi
    
    echo ""
    echo -e "${BLUE}Uploading ${OUTPUT_FILE}...${NC}"
    
    # Use Shopify CLI to deploy
    THEME_ID="150150381799"
    
    # Verify file exists before deploying
    if [ ! -f "${ASSETS_DIR}/${OUTPUT_FILE}" ]; then
        echo -e "   ${RED}❌ File not found: ${ASSETS_DIR}/${OUTPUT_FILE}${NC}"
        echo -e "   ${RED}❌ Cannot deploy - file does not exist!${NC}"
        exit 1
    fi
    
    echo -e "   ${CYAN}📁 Source file: ${ASSETS_DIR}/${OUTPUT_FILE}${NC}"
    FILE_SIZE=$(stat -f "%z" "${ASSETS_DIR}/${OUTPUT_FILE}" 2>/dev/null || stat -c "%s" "${ASSETS_DIR}/${OUTPUT_FILE}" 2>/dev/null || echo "0")
    echo -e "   ${CYAN}📊 File size: ${FILE_SIZE} bytes${NC}"
    echo ""
    
    shopify theme push --theme=${THEME_ID} --store=${SHOPIFY_STORE} --path src --only "assets/${OUTPUT_FILE}"
    DEPLOY_EXIT=$?
    
    if [ $DEPLOY_EXIT -eq 0 ]; then
        echo -e "   ${GREEN}✅ ${OUTPUT_FILE} deployed successfully${NC}"
    else
        echo -e "   ${RED}❌ ${OUTPUT_FILE} deployment failed (exit code: $DEPLOY_EXIT)${NC}"
        echo -e "   ${YELLOW}💡 Check Shopify CLI output above for error details${NC}"
        exit 1
    fi
    
    # ✅ Also deploy furniture-config.json if it exists (furniture mode only)
    if [ "$MODE" = "furniture" ] && [ -f "$FURNITURE_CONFIG" ]; then
        echo ""
        echo -e "${BLUE}Uploading furniture-config.json...${NC}"
        shopify theme push --theme=${THEME_ID} --store=${SHOPIFY_STORE} --path src --only "assets/furniture-config.json"
        if [ $? -eq 0 ]; then
            echo -e "   ${GREEN}✅ furniture-config.json deployed${NC}"
        else
            echo -e "   ${YELLOW}⚠️  furniture-config.json deployment failed (may not exist)${NC}"
        fi
    fi
    
    # ✅ Also deploy template and CSS for furniture-simple and clothing-simple modes
    if [ "$MODE" = "furniture-simple" ]; then
        echo ""
        echo -e "${BLUE}Uploading template and CSS for furniture-simple...${NC}"
        shopify theme push --theme=${THEME_ID} --store=${SHOPIFY_STORE} --path src --only "templates/page.colorflex-furniture-simple.liquid" --nodelete
        TEMPLATE_EXIT=$?
        shopify theme push --theme=${THEME_ID} --store=${SHOPIFY_STORE} --path src --only "assets/colorflex-simple-mode.css"
        CSS_EXIT=$?
        if [ $TEMPLATE_EXIT -eq 0 ] && [ $CSS_EXIT -eq 0 ]; then
            echo -e "   ${GREEN}✅ Template and CSS deployed${NC}"
        else
            echo -e "   ${RED}❌ Template/CSS deployment failed (template: $TEMPLATE_EXIT, CSS: $CSS_EXIT)${NC}"
            exit 1
        fi
    elif [ "$MODE" = "clothing" ]; then
        echo ""
        echo -e "${BLUE}Uploading template for clothing...${NC}"
        # Verify template file exists before deploying
        if [ ! -f "src/templates/page.colorflex-clothing.liquid" ]; then
            echo -e "   ${RED}❌ Template file not found: src/templates/page.colorflex-clothing.liquid${NC}"
            echo -e "   ${RED}❌ Cannot deploy template - file does not exist!${NC}"
            exit 1
        fi
        shopify theme push --theme=${THEME_ID} --store=${SHOPIFY_STORE} --path src --only "templates/page.colorflex-clothing.liquid" --nodelete
        TEMPLATE_EXIT=$?
        if [ $TEMPLATE_EXIT -eq 0 ]; then
            echo -e "   ${GREEN}✅ Template deployed${NC}"
        else
            echo -e "   ${RED}❌ Template deployment failed (exit code: $TEMPLATE_EXIT)${NC}"
            echo -e "   ${YELLOW}💡 Check Shopify CLI output above for error details${NC}"
            exit 1
        fi
    elif [ "$MODE" = "clothing-simple" ]; then
        echo ""
        echo -e "${BLUE}Uploading template and CSS for clothing-simple...${NC}"
        shopify theme push --theme=${THEME_ID} --store=${SHOPIFY_STORE} --path src --only "templates/page.colorflex-clothing-simple.liquid" --nodelete
        TEMPLATE_EXIT=$?
        shopify theme push --theme=${THEME_ID} --store=${SHOPIFY_STORE} --path src --only "assets/colorflex-simple-mode.css"
        CSS_EXIT=$?
        if [ $TEMPLATE_EXIT -eq 0 ] && [ $CSS_EXIT -eq 0 ]; then
            echo -e "   ${GREEN}✅ Template and CSS deployed${NC}"
        else
            echo -e "   ${RED}❌ Template/CSS deployment failed (template: $TEMPLATE_EXIT, CSS: $CSS_EXIT)${NC}"
            exit 1
        fi
    fi
    
    echo ""
    echo -e "${GREEN}✅ Deployment complete!${NC}"
    echo ""
    echo -e "${CYAN}📋 Summary:${NC}"
    echo -e "   Mode: ${MODE}"
    echo -e "   File: ${OUTPUT_FILE}"
    echo -e "   Theme ID: ${THEME_ID}"
    echo ""
    echo -e "${CYAN}💡 Verification:${NC}"
    echo -e "   Check Shopify admin to confirm files were uploaded"
    echo -e "   Test the page to verify changes are live"
    echo ""
    echo -e "${CYAN}💡 To rollback: use Git (e.g. git checkout <commit> -- src/assets/${OUTPUT_FILE})${NC}"
    echo ""
fi
