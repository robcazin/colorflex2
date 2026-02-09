#!/bin/bash

# ColorFlex Asset Backup System
# Creates timestamped backups of minified JS files before deployment
# Allows quick rollback without Git commits

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
ASSETS_DIR="src/assets"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Files to backup (minified JS and CSS)
FILES_TO_BACKUP=(
    "color-flex-core.min.js"
    "color-flex-furniture.min.js"
    "color-flex-clothing.min.js"
    "color-flex-furniture-simple.min.js"
    "color-flex-clothing-simple.min.js"
    "unified-pattern-modal.js"
    "ProductConfigurationFlow.js"
    "colorflex-simple-mode.css"
)

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Function to create a backup
create_backup() {
    local backup_name="${TIMESTAMP}_assets"
    local backup_path="${BACKUP_DIR}/${backup_name}"
    
    echo -e "${BLUE}📦 Creating backup: ${backup_name}${NC}"
    echo ""
    
    # Create backup directory
    mkdir -p "$backup_path"
    
    # Copy each file if it exists
    local files_backed_up=0
    for file in "${FILES_TO_BACKUP[@]}"; do
        local source_file="${ASSETS_DIR}/${file}"
        if [ -f "$source_file" ]; then
            cp "$source_file" "$backup_path/"
            echo -e "  ${GREEN}✅${NC} $file"
            ((files_backed_up++))
        else
            echo -e "  ${YELLOW}⚠️${NC} $file (not found, skipping)"
        fi
    done
    
    # Create metadata file
    cat > "${backup_path}/_metadata.json" <<EOF
{
    "timestamp": "$TIMESTAMP",
    "date": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "files_backed_up": $files_backed_up,
    "git_commit": "$(git rev-parse --short HEAD 2>/dev/null || echo 'not-available')",
    "git_branch": "$(git branch --show-current 2>/dev/null || echo 'not-available')",
    "description": "$1"
}
EOF
    
    # Create symlink to latest backup
    ln -sfn "$backup_name" "${BACKUP_DIR}/latest"
    
    echo ""
    echo -e "${GREEN}✅ Backup created: ${backup_path}${NC}"
    echo -e "   ${BLUE}📝 Metadata: ${backup_path}/_metadata.json${NC}"
    echo ""
    
    # List recent backups
    list_backups 5
}

# Function to list backups
list_backups() {
    local limit=${1:-10}
    
    echo -e "${BLUE}📋 Recent backups (showing last $limit):${NC}"
    echo ""
    
    if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A $BACKUP_DIR 2>/dev/null)" ]; then
        echo -e "  ${YELLOW}No backups found${NC}"
        return
    fi
    
    # List backups sorted by modification time (newest first)
    local count=0
    for backup in $(ls -t "$BACKUP_DIR" 2>/dev/null | grep -v "^latest$" | head -$limit); do
        local backup_path="${BACKUP_DIR}/${backup}"
        if [ -d "$backup_path" ] && [ -f "${backup_path}/_metadata.json" ]; then
            local date=$(jq -r '.date' "${backup_path}/_metadata.json" 2>/dev/null || echo "unknown")
            local desc=$(jq -r '.description' "${backup_path}/_metadata.json" 2>/dev/null || echo "")
            local commit=$(jq -r '.git_commit' "${backup_path}/_metadata.json" 2>/dev/null || echo "")
            
            ((count++))
            echo -e "  ${GREEN}${count}.${NC} ${backup}"
            echo -e "     Date: ${date}"
            if [ -n "$desc" ] && [ "$desc" != "null" ]; then
                echo -e "     Desc: ${desc}"
            fi
            if [ -n "$commit" ] && [ "$commit" != "not-available" ]; then
                echo -e "     Git: ${commit}"
            fi
            echo ""
        fi
    done
    
    if [ $count -eq 0 ]; then
        echo -e "  ${YELLOW}No valid backups found${NC}"
    fi
}

# Function to restore from backup
restore_backup() {
    local backup_name=$1
    
    if [ -z "$backup_name" ]; then
        echo -e "${RED}❌ Error: Backup name required${NC}"
        echo ""
        echo "Usage: $0 restore <backup_name>"
        echo "   or: $0 restore latest"
        echo ""
        list_backups
        exit 1
    fi
    
    # Handle "latest" symlink
    if [ "$backup_name" = "latest" ]; then
        if [ -L "${BACKUP_DIR}/latest" ]; then
            backup_name=$(basename $(readlink "${BACKUP_DIR}/latest"))
        else
            echo -e "${RED}❌ Error: No 'latest' backup found${NC}"
            exit 1
        fi
    fi
    
    local backup_path="${BACKUP_DIR}/${backup_name}"
    
    if [ ! -d "$backup_path" ]; then
        echo -e "${RED}❌ Error: Backup not found: ${backup_name}${NC}"
        echo ""
        list_backups
        exit 1
    fi
    
    echo -e "${YELLOW}⚠️  WARNING: This will overwrite current files in ${ASSETS_DIR}/${NC}"
    echo -e "${YELLOW}   Restoring from: ${backup_name}${NC}"
    echo ""
    read -p "Continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Restore cancelled"
        exit 0
    fi
    
    echo ""
    echo -e "${BLUE}🔄 Restoring files...${NC}"
    
    # Restore each file
    local files_restored=0
    for file in "${FILES_TO_BACKUP[@]}"; do
        local backup_file="${backup_path}/${file}"
        local target_file="${ASSETS_DIR}/${file}"
        
        if [ -f "$backup_file" ]; then
            cp "$backup_file" "$target_file"
            echo -e "  ${GREEN}✅${NC} Restored $file"
            ((files_restored++))
        else
            echo -e "  ${YELLOW}⚠️${NC} $file (not in backup, skipping)"
        fi
    done
    
    echo ""
    echo -e "${GREEN}✅ Restored ${files_restored} file(s) from ${backup_name}${NC}"
    
    # Show metadata
    if [ -f "${backup_path}/_metadata.json" ]; then
        echo ""
        echo -e "${BLUE}📝 Backup metadata:${NC}"
        cat "${backup_path}/_metadata.json" | jq '.' 2>/dev/null || cat "${backup_path}/_metadata.json"
    fi
}

# Function to show usage
show_usage() {
    echo "ColorFlex Asset Backup System"
    echo "============================="
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  create [description]  - Create a new backup (auto-called before deploy)"
    echo "  list [limit]          - List recent backups (default: 10)"
    echo "  restore <name>        - Restore from a backup"
    echo "  restore latest         - Restore from the latest backup"
    echo "  clean [days]           - Remove backups older than N days (default: 30)"
    echo ""
    echo "Examples:"
    echo "  $0 create \"Before furniture fix\""
    echo "  $0 list 5"
    echo "  $0 restore 20250115_143022_assets"
    echo "  $0 restore latest"
    echo "  $0 clean 7"
    echo ""
}

# Function to clean old backups
clean_backups() {
    local days=${1:-30}
    
    echo -e "${YELLOW}🧹 Cleaning backups older than ${days} days...${NC}"
    echo ""
    
    if [ ! -d "$BACKUP_DIR" ]; then
        echo -e "${YELLOW}No backup directory found${NC}"
        return
    fi
    
    local removed=0
    local cutoff=$(date -v-${days}d +%s 2>/dev/null || date -d "${days} days ago" +%s)
    
    for backup in "$BACKUP_DIR"/*; do
        if [ -d "$backup" ] && [ "$(basename "$backup")" != "latest" ]; then
            local backup_time=$(stat -f "%m" "$backup" 2>/dev/null || stat -c "%Y" "$backup" 2>/dev/null || echo "0")
            if [ "$backup_time" -lt "$cutoff" ]; then
                echo -e "  ${YELLOW}🗑️${NC} Removing $(basename "$backup")"
                rm -rf "$backup"
                ((removed++))
            fi
        fi
    done
    
    echo ""
    if [ $removed -eq 0 ]; then
        echo -e "${GREEN}✅ No old backups to clean${NC}"
    else
        echo -e "${GREEN}✅ Removed ${removed} old backup(s)${NC}"
    fi
}

# Main command handling
case "${1:-}" in
    create)
        create_backup "${2:-}"
        ;;
    list)
        list_backups "${2:-10}"
        ;;
    restore)
        restore_backup "${2:-}"
        ;;
    clean)
        clean_backups "${2:-30}"
        ;;
    help|--help|-h|"")
        show_usage
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo ""
        show_usage
        exit 1
        ;;
esac
