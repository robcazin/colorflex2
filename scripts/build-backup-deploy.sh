#!/bin/bash

# ColorFlex Backup, Build, and Deploy Script
# Backs up current state, builds new files, and deploys to Shopify
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
BACKUP_DIR="./backups"
ASSETS_DIR="src/assets"
SOURCE_DIR="src"
CFM_SOURCE="${SOURCE_DIR}/CFM.js"
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
    echo "ColorFlex Backup, Build, and Deploy"
    echo "===================================="
    echo ""
    echo "Usage: $0 <mode> [description]"
    echo ""
    echo "Modes:"
    echo "  all              - Backup, build, and deploy ALL pages (wallpaper, furniture, clothing)"
    echo "  furniture         - Backup, build, and deploy furniture page"
    echo "  clothing          - Backup, build, and deploy clothing page"
    echo "  furniture-simple  - Backup, build, and deploy furniture-simple page"
    echo "  clothing-simple   - Backup, build, and deploy clothing-simple page"
    echo "  wallpaper         - Backup, build, and deploy wallpaper/core page"
    echo ""
    echo "Options:"
    echo "  [description]     - Optional description for backup (e.g., \"Before multi-res fix\")"
    echo ""
    echo "Examples:"
    echo "  $0 all            - Backup, build, and deploy all pages"
    echo "  $0 furniture"
    echo "  $0 furniture-simple \"Testing pattern preview fix\""
    echo "  $0 clothing \"Before zoom fix\""
    echo ""
    echo "Restore from backup:"
    echo "  $0 restore furniture"
    echo "  $0 restore furniture-simple latest"
    echo ""
    echo "Note: CFM.js is automatically backed up if modified (efficient checksum check)"
    echo ""
}

# Function to get file checksum (efficient comparison)
get_file_checksum() {
    local file=$1
    if command -v md5sum &> /dev/null; then
        md5sum "$file" 2>/dev/null | cut -d' ' -f1
    elif command -v md5 &> /dev/null; then
        md5 -q "$file" 2>/dev/null
    elif command -v shasum &> /dev/null; then
        shasum -a 256 "$file" 2>/dev/null | cut -d' ' -f1
    else
        # Fallback: use modification time
        stat -f "%m" "$file" 2>/dev/null || stat -c "%Y" "$file" 2>/dev/null || echo "0"
    fi
}

# Function to check if CFM.js has changed since last backup
cfm_has_changed() {
    if [ ! -f "$CFM_SOURCE" ]; then
        return 1  # File doesn't exist, can't check
    fi
    
    local current_checksum=$(get_file_checksum "$CFM_SOURCE")
    local last_backup="${BACKUP_DIR}/latest_cfm_checksum"
    
    if [ -f "$last_backup" ]; then
        local last_checksum=$(cat "$last_backup")
        if [ "$current_checksum" = "$last_checksum" ]; then
            return 1  # No change
        fi
    fi
    
    return 0  # Changed or no previous backup
}

# Function to backup CFM.js (only if changed)
backup_cfm_if_changed() {
    if [ ! -f "$CFM_SOURCE" ]; then
        return 0  # File doesn't exist, skip
    fi
    
    if ! cfm_has_changed; then
        echo -e "  ${CYAN}ℹ️${NC}  CFM.js unchanged since last backup (skipping)"
        return 0
    fi
    
    local backup_name="${TIMESTAMP}_cfm"
    local backup_path="${BACKUP_DIR}/${backup_name}"
    
    echo -e "  ${BLUE}💾${NC} Backing up CFM.js (source file changed)..."
    
    # Create backup directory
    mkdir -p "$backup_path"
    
    # Copy CFM.js
    cp "$CFM_SOURCE" "$backup_path/"
    
    # Save checksum for future comparison
    local checksum=$(get_file_checksum "$CFM_SOURCE")
    echo "$checksum" > "${BACKUP_DIR}/latest_cfm_checksum"
    
    # Create metadata
    local file_size=$(stat -f "%z" "$CFM_SOURCE" 2>/dev/null || stat -c "%s" "$CFM_SOURCE" 2>/dev/null || echo "0")
    cat > "${backup_path}/_metadata.json" <<EOF
{
    "timestamp": "$TIMESTAMP",
    "date": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "type": "source",
    "file": "CFM.js",
    "size_bytes": $file_size,
    "checksum": "$checksum",
    "git_commit": "$(git rev-parse --short HEAD 2>/dev/null || echo 'not-available')",
    "git_branch": "$(git branch --show-current 2>/dev/null || echo 'not-available')"
}
EOF
    
    # Create symlink to latest CFM backup
    ln -sfn "$backup_name" "${BACKUP_DIR}/latest_cfm"
    
    echo -e "    ${GREEN}✅${NC} CFM.js backed up (${file_size} bytes)"
}

# Function to create single-file backup
create_single_backup() {
    local mode=$1
    local file=$2
    local description=$3
    local backup_name="${TIMESTAMP}_${mode}"
    local backup_path="${BACKUP_DIR}/${backup_name}"
    
    echo -e "${BLUE}💾 Creating backup for ${mode}...${NC}"
    
    # Create backup directory
    mkdir -p "$backup_path"
    
    # Backup CFM.js if it has changed (efficient check)
    backup_cfm_if_changed
    
    # Copy the built file
    local source_file="${ASSETS_DIR}/${file}"
    if [ -f "$source_file" ]; then
        cp "$source_file" "$backup_path/"
        echo -e "  ${GREEN}✅${NC} Backed up: $file"
    else
        echo -e "  ${RED}❌${NC} File not found: $source_file"
        exit 1
    fi
    
    # ✅ Also backup furniture-config.json if it exists (furniture mode only)
    if [ "$mode" = "furniture" ] && [ -f "$FURNITURE_CONFIG" ]; then
        cp "$FURNITURE_CONFIG" "$backup_path/"
        echo -e "  ${GREEN}✅${NC} Backed up: furniture-config.json"
    fi
    
    # Create metadata
    cat > "${backup_path}/_metadata.json" <<EOF
{
    "timestamp": "$TIMESTAMP",
    "date": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "mode": "$mode",
    "file": "$file",
    "cfm_backed_up": $(cfm_has_changed && echo "true" || echo "false"),
    "git_commit": "$(git rev-parse --short HEAD 2>/dev/null || echo 'not-available')",
    "git_branch": "$(git branch --show-current 2>/dev/null || echo 'not-available')",
    "description": "$description"
}
EOF
    
    # Create symlink to latest backup for this mode
    ln -sfn "$backup_name" "${BACKUP_DIR}/latest_${mode}"
    
    echo -e "${GREEN}✅ Backup created: ${backup_path}${NC}"
    echo ""
}

# Function to restore single file from backup
restore_single_backup() {
    local mode=$1
    local backup_name=$2
    
    if [ -z "$backup_name" ]; then
        backup_name="latest_${mode}"
    fi
    
    if [ "$backup_name" = "latest_${mode}" ]; then
        if [ -L "${BACKUP_DIR}/${backup_name}" ]; then
            backup_name=$(basename $(readlink "${BACKUP_DIR}/${backup_name}"))
        else
            echo -e "${RED}❌ No latest backup found for ${mode}${NC}"
            exit 1
        fi
    fi
    
    local backup_path="${BACKUP_DIR}/${backup_name}"
    
    if [ ! -d "$backup_path" ]; then
        echo -e "${RED}❌ Backup not found: ${backup_name}${NC}"
        exit 1
    fi
    
    # Try to get file from metadata, fallback to mode output
    local file=$(get_output_file "$mode")
    if [ -f "${backup_path}/_metadata.json" ]; then
        # Try jq first, then grep as fallback
        local metadata_file=$(jq -r '.file' "${backup_path}/_metadata.json" 2>/dev/null || \
            grep -o '"file"[[:space:]]*:[[:space:]]*"[^"]*"' "${backup_path}/_metadata.json" 2>/dev/null | \
            sed 's/.*"file"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/' || echo "$file")
        if [ -n "$metadata_file" ] && [ "$metadata_file" != "null" ]; then
            file="$metadata_file"
        fi
    fi
    
    local source_file="${backup_path}/${file}"
    local target_file="${ASSETS_DIR}/${file}"
    
    if [ -f "$source_file" ]; then
        cp "$source_file" "$target_file"
        echo -e "${GREEN}✅ Restored ${file} from ${backup_name}${NC}"
        
        # Also check if CFM.js backup exists and offer to restore it
        local cfm_backup="${BACKUP_DIR}/latest_cfm"
        if [ -L "$cfm_backup" ] && [ -f "${cfm_backup}/CFM.js" ]; then
            echo ""
            echo -e "${CYAN}💡 CFM.js backup also available. Restore it?${NC}"
            read -p "Restore CFM.js from backup? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                cp "${cfm_backup}/CFM.js" "$CFM_SOURCE"
                echo -e "${GREEN}✅ Restored CFM.js from backup${NC}"
            fi
        fi
        
        echo ""
        echo -e "${CYAN}💡 To deploy the restored file:${NC}"
        echo -e "   ./deploy-shopify-cli.sh assets"
        echo -e "   or: shopify theme push --theme=150150381799 --path src --only assets/${file}"
    else
        echo -e "${RED}❌ Backup file not found: ${source_file}${NC}"
        exit 1
    fi
}

# Main execution
COMMAND="${1:-}"
MODE="${2:-}"

# Handle restore command
if [ "$COMMAND" = "restore" ]; then
    if [ -z "$MODE" ]; then
        echo -e "${RED}❌ Error: Mode required for restore${NC}"
        echo ""
        echo "Usage: $0 restore <mode> [backup_name]"
        echo "   or: $0 restore <mode> latest"
        echo ""
        echo "Modes: furniture, clothing, furniture-simple, clothing-simple, wallpaper"
        exit 1
    fi
    
    output_file=$(get_output_file "$MODE")
    if [ -z "$output_file" ]; then
        echo -e "${RED}❌ Error: Unknown mode: ${MODE}${NC}"
        exit 1
    fi
    
    restore_single_backup "$MODE" "${3:-latest_${MODE}}"
    exit 0
fi

# Normal build+backup+deploy flow
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

echo -e "${CYAN}🚀 ColorFlex Backup, Build, and Deploy${NC}"
echo -e "${CYAN}=====================================${NC}"
echo ""
echo -e "Mode: ${BLUE}${MODE}${NC}"
echo -e "Build: ${YELLOW}npm run ${BUILD_CMD}${NC}"
if [ "$IS_ALL_MODE" = true ]; then
    echo -e "Files: ${GREEN}All (wallpaper, furniture, clothing)${NC}"
else
    echo -e "File: ${GREEN}${OUTPUT_FILE}${NC}"
fi
echo -e "Description: ${DESCRIPTION}"
echo ""

# Step 1: Backup CURRENT built file BEFORE building (if it exists)
echo -e "${BLUE}💾 Step 1/4: Backing up current built file...${NC}"
echo ""

if [ "$IS_ALL_MODE" = true ]; then
    # For "all" mode, backup all existing files
    ALL_FILES=($(get_all_output_files))
    for file in "${ALL_FILES[@]}"; do
        file_path="${ASSETS_DIR}/${file}"
        if [ -f "$file_path" ]; then
            # Determine mode from filename
            case "$file" in
                color-flex-core.min.js) file_mode="wallpaper" ;;
                color-flex-furniture.min.js) file_mode="furniture" ;;
                color-flex-clothing.min.js) file_mode="clothing" ;;
                *) file_mode="unknown" ;;
            esac
            if [ "$file_mode" != "unknown" ]; then
                create_single_backup "$file_mode" "$file" "$DESCRIPTION (pre-build backup)"
            fi
        fi
    done
else
    # For single mode, backup the current file if it exists
    if [ -f "$OUTPUT_PATH" ]; then
        create_single_backup "$MODE" "$OUTPUT_FILE" "$DESCRIPTION (pre-build backup)"
    else
        echo -e "  ${CYAN}ℹ️${NC}  No existing file to backup (new file)"
        echo ""
    fi
fi

# Step 2: Check and backup CFM.js if changed (before build)
echo -e "${BLUE}🔍 Step 2/4: Checking source file...${NC}"
echo ""
if [ -f "$CFM_SOURCE" ]; then
    if cfm_has_changed; then
        echo -e "${YELLOW}⚠️  CFM.js has been modified${NC}"
        backup_cfm_if_changed
        echo ""
    else
        echo -e "${GREEN}✅ CFM.js unchanged since last backup${NC}"
        echo ""
    fi
else
    echo -e "${YELLOW}⚠️  CFM.js not found (skipping source backup)${NC}"
    echo ""
fi

# Step 3: Build
echo -e "${BLUE}📦 Step 3/4: Building...${NC}"
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

# Step 4: Deploy
echo -e "${BLUE}🚀 Step 4/4: Deploying to Shopify...${NC}"
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
        echo ""
        echo -e "${CYAN}💡 To restore the backup:${NC}"
        echo -e "   ./scripts/build-backup-deploy.sh restore ${MODE}"
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
    echo -e "   Backup: ${BACKUP_DIR}/latest_${MODE}"
    echo ""
    echo -e "${CYAN}💡 Verification:${NC}"
    echo -e "   Check Shopify admin to confirm files were uploaded"
    echo -e "   Test the page to verify changes are live"
    echo ""
    echo -e "${CYAN}💡 To rollback if needed:${NC}"
    echo -e "   ./scripts/build-backup-deploy.sh restore ${MODE}"
    echo ""
fi
