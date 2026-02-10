#!/bin/bash

# Shopify CLI Deployment Script for ColorFlex
# Created: November 19, 2025
# Updated: January 5, 2026 - Added auto-theme selection
# Updated: January 15, 2026 - Added automatic backup system before deployment
# Updated: February 2026 - Added --nodelete to full push; added layout option
#
# Use this script for ALL theme deployments (not one-off shopify theme push).
#
# Backup System:
#   - Automatically creates backups before deploying assets
#   - Restore with: ./scripts/backup-assets.sh restore latest
#   - See BACKUP_SYSTEM.md for details

set -e  # Exit on error

echo "🚀 ColorFlex Shopify CLI Deployment"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Auto-select live theme (Updated copy of Sense #150150381799)
THEME_ID="150150381799"
THEME_FLAG="--theme=${THEME_ID} --store=${SHOPIFY_STORE}"

# Function to show usage
show_usage() {
    echo "Usage: ./deploy-shopify-cli.sh [option]"
    echo ""
    echo "Options:"
    echo "  assets          - Push only assets (ColorFlex JS + colorflex-simple-mode.css)"
    echo "  css             - Push all CSS files in src/assets/ (theme + ColorFlex)"
    echo "  data            - Push only collections.json to assets"
    echo "  templates       - Push only templates"
    echo "  layout          - Push only layout (e.g. theme.liquid)"
    echo "  locales         - Push only locales (translations, fixes 'Translation missing')"
    echo "  sections        - Push only sections"
    echo "  snippets        - Push only snippets"
    echo "  changed         - Push only modified/staged theme files under src/ (what you're working on)"
    echo "  only <path>      - Push a single file (path relative to src/, e.g. templates/page.colorflex.liquid)"
    echo "  furniture       - Deploy furniture mode (assets + template + snippet)"
    echo "  clothing        - Deploy clothing mode (assets + template)"
    echo "  all             - Push all local files, keep remote-only files (--nodelete)"
    echo "  pull            - Pull theme from Shopify into theme-pull/ (for sync/compare)"
    echo ""
    echo "Examples:"
    echo "  ./deploy-shopify-cli.sh assets      # Upload ColorFlex JS + colorflex-simple-mode.css"
    echo "  ./deploy-shopify-cli.sh css         # Upload all CSS in src/assets/ (after restoring theme CSS)"
    echo "  ./deploy-shopify-cli.sh data        # Upload collections.json"
    echo "  ./deploy-shopify-cli.sh templates  # Upload index.json + simple mode pages"
    echo "  ./deploy-shopify-cli.sh layout      # Upload layout/theme.liquid"
    echo "  ./deploy-shopify-cli.sh sections    # Upload main-product.liquid"
    echo "  ./deploy-shopify-cli.sh changed     # Upload only modified/staged files (say n to cancel; use cfo <path> for one file)"
    echo "  ./deploy-shopify-cli.sh only templates/page.colorflex.liquid   # Upload one file only"
    echo "  ./deploy-shopify-cli.sh furniture   # Deploy furniture mode"
    echo "  ./deploy-shopify-cli.sh clothing    # Deploy clothing mode"
    echo "  ./deploy-shopify-cli.sh all         # Push entire theme (safe: --nodelete)"
    echo "  ./deploy-shopify-cli.sh pull        # Pull theme from Shopify → theme-pull/"
    echo ""
}

# Check if Shopify CLI is installed
if ! command -v shopify &> /dev/null; then
    echo -e "${RED}❌ Shopify CLI not found!${NC}"
    echo "Install it with: brew tap shopify/shopify && brew install shopify-cli"
    exit 1
fi

echo -e "${GREEN}✅ Shopify CLI found${NC}"
echo ""

# Determine what to deploy
DEPLOY_MODE="${1:-all}"

case "$DEPLOY_MODE" in
    assets)
        echo "📦 Deploying ASSETS only..."
        echo ""
        echo "Files to deploy:"
        echo "  - src/assets/color-flex-core.min.js"
        echo "  - src/assets/color-flex-furniture.min.js"
        echo "  - src/assets/color-flex-clothing.min.js"
        echo "  - src/assets/color-flex-furniture-simple.min.js"
        echo "  - src/assets/color-flex-clothing-simple.min.js"
        echo "  - src/assets/unified-pattern-modal.js"
        echo "  - src/assets/ProductConfigurationFlow.js"
        echo "  - src/assets/colorflex-simple-mode.css"
        echo "  - src/assets/furniture-config.json (if exists)"
        echo ""
        read -p "Continue? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            # ✅ Create backup before deploying
            echo ""
            echo -e "${BLUE}💾 Creating backup before deployment...${NC}"
            bash ./scripts/backup-assets.sh create "Before assets deployment - $(date +"%Y-%m-%d %H:%M")"
            echo ""
            
            shopify theme push ${THEME_FLAG} --path src --only assets/color-flex-core.min.js
            shopify theme push ${THEME_FLAG} --path src --only assets/color-flex-furniture.min.js
            shopify theme push ${THEME_FLAG} --path src --only assets/color-flex-clothing.min.js
            # ✅ FIX: Deploy simple mode JS files
            if [ -f "src/assets/color-flex-furniture-simple.min.js" ]; then
                shopify theme push ${THEME_FLAG} --path src --only assets/color-flex-furniture-simple.min.js
            fi
            if [ -f "src/assets/color-flex-clothing-simple.min.js" ]; then
                shopify theme push ${THEME_FLAG} --path src --only assets/color-flex-clothing-simple.min.js
            fi
            shopify theme push ${THEME_FLAG} --path src --only assets/unified-pattern-modal.js
            shopify theme push ${THEME_FLAG} --path src --only assets/ProductConfigurationFlow.js
            shopify theme push ${THEME_FLAG} --path src --only assets/colorflex-simple-mode.css
            # Deploy furniture-config.json if it exists
            if [ -f "src/assets/furniture-config.json" ]; then
                shopify theme push ${THEME_FLAG} --path src --only assets/furniture-config.json
            fi
            echo -e "${GREEN}✅ Assets deployed successfully${NC}"
        fi
        ;;

    css)
        echo "🎨 Deploying CSS only (all .css in src/assets/)..."
        echo ""
        if [ ! -d "src/assets" ]; then
            echo -e "${RED}❌ src/assets/ not found${NC}"
            exit 1
        fi
        CSS_COUNT=$(find src/assets -maxdepth 1 -name "*.css" 2>/dev/null | wc -l | tr -d ' ')
        if [ "$CSS_COUNT" -eq 0 ]; then
            echo -e "${YELLOW}⚠️  No .css files in src/assets/${NC}"
            echo "Add theme CSS (e.g. base.css, component-*.css) from previous theme, then run this again."
            exit 1
        fi
        echo "Files to deploy:"
        find src/assets -maxdepth 1 -name "*.css" -exec basename {} \; | sort | sed 's/^/  - src\/assets\//'
        echo ""
        read -p "Continue? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            for f in src/assets/*.css; do
                [ -f "$f" ] || continue
                name=$(basename "$f")
                shopify theme push ${THEME_FLAG} --path src --only "assets/$name" --nodelete
                echo "  ✓ $name"
            done
            echo -e "${GREEN}✅ CSS deployed successfully${NC}"
        fi
        ;;

    data)
        echo "📊 Deploying COLLECTIONS.JSON only..."
        echo ""
        echo "Files to deploy:"
        echo "  - src/assets/collections.json → Shopify assets/"
        echo ""

        # Check if collections.json exists in src/assets/
        if [ ! -f "src/assets/collections.json" ]; then
            echo -e "${YELLOW}⚠️  collections.json not found in src/assets/${NC}"
            echo "Copying from data/collections.json..."

            if [ -f "data/collections.json" ]; then
                cp data/collections.json src/assets/collections.json
                echo -e "${GREEN}✅ Copied data/collections.json → src/assets/collections.json${NC}"
            else
                echo -e "${RED}❌ data/collections.json not found!${NC}"
                exit 1
            fi
        fi

        echo ""

        # Check for --yes flag (skip confirmation in automated workflows)
        if [[ "$2" == "--yes" ]]; then
            shopify theme push ${THEME_FLAG} --path src --only assets/collections.json
            echo -e "${GREEN}✅ collections.json deployed to Shopify assets${NC}"
        else
            read -p "Continue? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                shopify theme push ${THEME_FLAG} --path src --only assets/collections.json
                echo -e "${GREEN}✅ collections.json deployed to Shopify assets${NC}"
            fi
        fi
        ;;

    templates)
        echo "📄 Deploying TEMPLATES..."
        echo ""
        echo "Files to deploy:"
        echo "  - src/templates/index.json (homepage)"
        echo "  - src/templates/page.colorflex-furniture-simple.liquid"
        echo "  - src/templates/page.colorflex-clothing-simple.liquid"
        echo "  - src/templates/page.extraordinary-color.liquid"
        echo ""

        # Check for --yes flag (skip confirmation in automated workflows)
        if [[ "$2" == "--yes" ]]; then
            if [ -f "src/templates/index.json" ]; then
                shopify theme push ${THEME_FLAG} --path src --only templates/index.json --nodelete
            fi
            shopify theme push ${THEME_FLAG} --path src --only templates/page.colorflex-furniture-simple.liquid --nodelete
            shopify theme push ${THEME_FLAG} --path src --only templates/page.colorflex-clothing-simple.liquid --nodelete
            shopify theme push ${THEME_FLAG} --path src --only templates/page.extraordinary-color.liquid --nodelete
            echo -e "${GREEN}✅ Templates deployed successfully${NC}"
        else
            read -p "Continue? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                if [ -f "src/templates/index.json" ]; then
                    shopify theme push ${THEME_FLAG} --path src --only templates/index.json --nodelete
                fi
                shopify theme push ${THEME_FLAG} --path src --only templates/page.colorflex-furniture-simple.liquid --nodelete
                shopify theme push ${THEME_FLAG} --path src --only templates/page.colorflex-clothing-simple.liquid --nodelete
                shopify theme push ${THEME_FLAG} --path src --only templates/page.extraordinary-color.liquid --nodelete
                echo -e "${GREEN}✅ Templates deployed successfully${NC}"
            fi
        fi
        ;;

    sections)
        echo "📑 Deploying SECTIONS only..."
        echo ""
        echo "Files to deploy:"
        echo "  - src/sections/main-product.liquid"
        echo "  - src/sections/rich-text.liquid"
        echo "  - src/sections/header.liquid (calculator icon in menu)"
        echo "  - src/sections/header-group.json"
        echo "  - src/sections/footer.liquid"
        echo "  - src/sections/footer-group.json"
        echo ""
        read -p "Continue? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            shopify theme push ${THEME_FLAG} --path src --only sections/main-product.liquid --nodelete
            shopify theme push ${THEME_FLAG} --path src --only sections/rich-text.liquid --nodelete
            shopify theme push ${THEME_FLAG} --path src --only sections/header.liquid --nodelete
            shopify theme push ${THEME_FLAG} --path src --only sections/header-group.json --nodelete
            shopify theme push ${THEME_FLAG} --path src --only sections/footer.liquid --nodelete
            shopify theme push ${THEME_FLAG} --path src --only sections/footer-group.json --nodelete
            echo -e "${GREEN}✅ Sections deployed successfully${NC}"
        fi
        ;;

    snippets)
        echo "✂️ Deploying SNIPPETS only..."
        echo ""
        echo "Files to deploy:"
        echo "  - src/shopify-product-colorflex-button.liquid"
        echo ""
        read -p "Continue? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            shopify theme push ${THEME_FLAG} --path src --only snippets/shopify-product-colorflex-button.liquid
            echo -e "${GREEN}✅ Snippets deployed successfully${NC}"
        fi
        ;;

    changed)
        echo "🔬 Deploying only the theme files you've been working on (modified or staged)..."
        echo ""
        if ! git rev-parse --is-inside-work-tree &>/dev/null; then
            echo -e "${RED}❌ Not a git repository. Run from project root or use another option (e.g. templates, sections, all).${NC}"
            exit 1
        fi
        CHANGED_FILES=$( { git diff --name-only HEAD -- src/; git diff --name-only --cached -- src/; } 2>/dev/null | sort -u)
        if [[ -z "$CHANGED_FILES" ]]; then
            echo -e "${YELLOW}No modified or staged files under src/.${NC}"
            echo "To deploy one file: ./deploy-shopify-cli.sh only sections/main-product.liquid  (or cfo sections/main-product.liquid)"
            exit 0
        fi
        THEME_PATHS=""
        for f in $CHANGED_FILES; do
            [[ -f "$f" ]] || continue
            case "$f" in
                src/sections/*)   THEME_PATHS="${THEME_PATHS} ${f#src/}";;
                src/templates/*)  THEME_PATHS="${THEME_PATHS} ${f#src/}";;
                src/snippets/*)   THEME_PATHS="${THEME_PATHS} ${f#src/}";;
                src/layout/*)     THEME_PATHS="${THEME_PATHS} ${f#src/}";;
                src/assets/*)     THEME_PATHS="${THEME_PATHS} ${f#src/}";;
                src/locales/*)    THEME_PATHS="${THEME_PATHS} ${f#src/}";;
                *) ;;
            esac
        done
        THEME_PATHS=$(echo "$THEME_PATHS" | tr ' ' '\n' | grep -v '^$' | sort -u)
        if [[ -z "$THEME_PATHS" ]]; then
            echo -e "${YELLOW}No theme files in that set (only sections, templates, snippets, layout, assets, locales).${NC}"
            exit 0
        fi
        echo "Files to deploy (modified or staged):"
        echo "$THEME_PATHS" | sed 's/^/  - src\//'
        echo ""
        if [[ "$2" == "--yes" ]]; then
            SKIP_CONFIRM=1
        else
            read -p "Continue? (y/n) " -n 1 -r
            echo
            [[ $REPLY =~ ^[Yy]$ ]] && SKIP_CONFIRM=1
        fi
        if [[ -n "$SKIP_CONFIRM" ]]; then
            COUNT=0
            while IFS= read -r relpath; do
                [[ -z "$relpath" ]] && continue
                shopify theme push ${THEME_FLAG} --path src --only "$relpath" --nodelete --allow-live
                echo "  ✓ $relpath"
                ((COUNT++)) || true
            done <<< "$THEME_PATHS"
            echo -e "${GREEN}✅ Deployed $COUNT file(s) successfully${NC}"
        fi
        ;;

    furniture)
        echo "🪑 Deploying FURNITURE MODE..."
        echo ""
        echo "Files to deploy:"
        echo "  1. src/assets/color-flex-furniture.min.js → assets/"
        echo "  2. src/templates/page.colorflex-furniture.liquid → templates/"
        echo "  3. src/shopify-product-colorflex-button.liquid → snippets/"
        echo ""
        read -p "Continue? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            # ✅ Create backup before deploying
            echo ""
            echo -e "${BLUE}💾 Creating backup before deployment...${NC}"
            bash ./scripts/backup-assets.sh create "Before furniture mode deployment - $(date +"%Y-%m-%d %H:%M")"
            echo ""
            
            echo ""
            echo "Step 1/3: Deploying furniture JS..."
            shopify theme push ${THEME_FLAG} --path src --only assets/color-flex-furniture.min.js

            echo ""
            echo "Step 2/3: Deploying furniture template..."
            shopify theme push ${THEME_FLAG} --path src --only templates/page.colorflex-furniture.liquid

            echo ""
            echo "Step 3/3: Deploying product button snippet..."
            shopify theme push ${THEME_FLAG} --path src --only snippets/shopify-product-colorflex-button.liquid

            echo ""
            echo -e "${GREEN}✅ Furniture mode deployed successfully${NC}"
            echo ""
            echo "Next steps:"
            echo "  1. Test at: https://saffroncottage.shop/pages/colorflex-furniture"
            echo "  2. Check console for: '🪑 FURNITURE MODE: Enabled'"
            echo "  3. Verify furniture-config.json loads from server"
        fi
        ;;

    clothing)
        echo "👕 Deploying CLOTHING MODE..."
        echo ""
        echo "Files to deploy:"
        echo "  1. src/assets/color-flex-clothing.min.js → assets/"
        echo "  2. src/templates/page.colorflex-clothing.liquid → templates/"
        echo ""
        read -p "Continue? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            # ✅ Create backup before deploying
            echo ""
            echo -e "${BLUE}💾 Creating backup before deployment...${NC}"
            bash ./scripts/backup-assets.sh create "Before clothing mode deployment - $(date +"%Y-%m-%d %H:%M")"
            echo ""
            
            echo ""
            echo "Step 1/2: Deploying clothing JS..."
            shopify theme push ${THEME_FLAG} --path src --only assets/color-flex-clothing.min.js

            echo ""
            echo "Step 2/2: Deploying clothing template..."
            shopify theme push ${THEME_FLAG} --path src --only templates/page.colorflex-clothing.liquid

            echo ""
            echo -e "${GREEN}✅ Clothing mode deployed successfully${NC}"
            echo ""
            echo "Next steps:"
            echo "  1. Test at: https://saffroncottage.shop/pages/colorflex-clothing"
            echo "  2. Check console for: '👕 CLOTHING MODE: Loaded X collections'"
            echo "  3. Verify collections.json loads from server (NOT Shopify assets)"
        fi
        ;;

    layout)
        echo "📐 Deploying LAYOUT only..."
        echo ""
        echo "Files to deploy:"
        echo "  - src/layout/theme.liquid"
        echo ""
        read -p "Continue? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            shopify theme push ${THEME_FLAG} --path src --only layout/theme.liquid
            echo -e "${GREEN}✅ Layout deployed successfully${NC}"
        fi
        ;;

    locales)
        echo "🌐 Deploying LOCALES only..."
        echo ""
        echo "Files to deploy:"
        echo "  - src/locales/en.default.json (fixes 'Translation missing')"
        echo ""
        read -p "Continue? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            shopify theme push ${THEME_FLAG} --path src --only locales/ --nodelete
            echo -e "${GREEN}✅ Locales deployed successfully${NC}"
        fi
        ;;

    all)
        echo "🌐 Deploying ENTIRE THEME (add/update only, --nodelete)..."
        echo ""
        echo -e "${YELLOW}Files in src/ will be pushed. Remote-only files are kept (--nodelete).${NC}"
        echo ""
        read -p "Are you sure? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            shopify theme push ${THEME_FLAG} --path src --nodelete
            echo -e "${GREEN}✅ Theme deployed successfully${NC}"
        fi
        ;;

    only)
        ONEPATH="$2"
        if [[ -z "$ONEPATH" ]]; then
            echo -e "${RED}❌ Usage: ./deploy-shopify-cli.sh only <path>${NC}"
            echo "Path is relative to src/, e.g. templates/page.colorflex.liquid or sections/header.liquid"
            exit 1
        fi
        if [[ ! -f "src/$ONEPATH" ]]; then
            echo -e "${RED}❌ File not found: src/$ONEPATH${NC}"
            exit 1
        fi
        echo "📤 Deploying single file (no Git)..."
        echo "  → src/$ONEPATH"
        echo ""
        shopify theme push ${THEME_FLAG} --path src --only "$ONEPATH" --nodelete --allow-live
        echo -e "${GREEN}✅ Deployed $ONEPATH${NC}"
        ;;

    pull)
        echo "📥 Pulling theme from Shopify into theme-pull/..."
        echo ""
        bash "$(dirname "$0")/scripts/theme-pull.sh"
        echo -e "${GREEN}✅ Pull complete. Compare with: ./scripts/theme-compare.sh${NC}"
        ;;

    help|--help|-h)
        show_usage
        exit 0
        ;;

    *)
        echo -e "${RED}❌ Unknown option: $DEPLOY_MODE${NC}"
        echo ""
        show_usage
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment complete!"
