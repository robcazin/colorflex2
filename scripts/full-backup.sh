#!/bin/bash

# ColorFlex Full Backup Script
# Creates a comprehensive backup of all source code and data files
# Created: 2026-02-06

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_NAME="full-backup-${TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

echo -e "${BLUE}📦 Creating Full Backup: ${BACKUP_NAME}${NC}"
echo ""

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_PATH"

# Directories to backup
DIRS_TO_BACKUP=(
    "src"
    "data"
    "docs"
    "scripts"
    "config"
)

# Files to backup (root level important files)
FILES_TO_BACKUP=(
    "package.json"
    "package-lock.json"
    "webpack.config.js"
    "deploy-shopify-cli.sh"
    "deploy-simple-mode.sh"
    "deploy.sh"
    "update-collection.sh"
)

# Copy directories
echo -e "${YELLOW}📁 Copying directories...${NC}"
for dir in "${DIRS_TO_BACKUP[@]}"; do
    if [ -d "$dir" ]; then
        echo "  → $dir/"
        cp -r "$dir" "$BACKUP_PATH/" 2>/dev/null || {
            echo -e "${YELLOW}    ⚠️  Some files in $dir/ may be excluded (gitignore)${NC}"
            rsync -a --exclude='.git' --exclude='node_modules' "$dir" "$BACKUP_PATH/" 2>/dev/null || true
        }
    else
        echo -e "${YELLOW}    ⚠️  Directory $dir/ not found${NC}"
    fi
done

# Copy files
echo -e "${YELLOW}📄 Copying files...${NC}"
for file in "${FILES_TO_BACKUP[@]}"; do
    if [ -f "$file" ]; then
        echo "  → $file"
        cp "$file" "$BACKUP_PATH/" 2>/dev/null || true
    fi
done

# Create backup manifest
echo -e "${YELLOW}📋 Creating backup manifest...${NC}"
MANIFEST_FILE="${BACKUP_PATH}/BACKUP_MANIFEST.txt"
cat > "$MANIFEST_FILE" << EOF
ColorFlex Full Backup Manifest
==============================
Backup Date: $(date)
Backup Name: ${BACKUP_NAME}
Backup Path: ${BACKUP_PATH}

Directories Backed Up:
$(for dir in "${DIRS_TO_BACKUP[@]}"; do echo "  - $dir/"; done)

Files Backed Up:
$(for file in "${FILES_TO_BACKUP[@]}"; do echo "  - $file"; done)

Key Files:
  - src/sections/header.liquid (Calculator icon & modal)
  - src/assets/wallpaperCalculator.html (Calculator HTML)
  - src/assets/collections.json (Collection data)
  - data/collections.json (Master collection data)
  - docs/WALLPAPER_CALCULATOR_IMPLEMENTATION.md (Calculator docs)

Backup Size:
$(du -sh "$BACKUP_PATH" 2>/dev/null | cut -f1)

EOF

# Calculate backup size
BACKUP_SIZE=$(du -sh "$BACKUP_PATH" 2>/dev/null | cut -f1)

echo ""
echo -e "${GREEN}✅ Full backup created successfully!${NC}"
echo -e "${GREEN}   Location: ${BACKUP_PATH}${NC}"
echo -e "${GREEN}   Size: ${BACKUP_SIZE}${NC}"
echo ""
echo -e "${BLUE}📋 Manifest: ${MANIFEST_FILE}${NC}"
echo ""

# List recent backups
echo -e "${BLUE}📚 Recent full backups:${NC}"
ls -lth "$BACKUP_DIR"/full-backup-* 2>/dev/null | head -5 | awk '{print "  " $9 " (" $5 ")"}' || echo "  No previous backups found"

echo ""
