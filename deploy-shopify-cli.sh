#!/bin/bash

# Shopify CLI Deployment Script for ColorFlex
# Created: November 19, 2025
# Updated: January 5, 2026 - Added auto-theme selection
# Updated: January 15, 2026 - Added automatic backup system before deployment
# Updated: February 2026 - Added --nodelete to full push; added layout option
#
# Theme root: theme files live under src/ (layout/, assets/, sections/, etc.),
# so all ${SHOPIFY_CMD} theme push commands use --path src. Do not change to --path .
# unless the theme is moved to the repo root.
#
# Use this script for ALL theme deployments (not one-off ${SHOPIFY_CMD} theme push).
#
# Backup System:
#   - Automatically creates backups before deploying assets
#   - Restore with: ./scripts/backup-assets.sh restore latest
#   - See BACKUP_SYSTEM.md for details

set -e  # Exit on error

# Load Theme Access password if present (so you don't have to source config/local.env each time)
if [ -f "config/local.env" ]; then
    set -a
    source config/local.env
    set +a
fi

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

# Auto-select theme by branch: bassett → CF Bassett preview, main (or other) → live theme
# IMPORTANT: Bassett must never contaminate the main site. When pushing to LIVE, we never push Bassett-only files.
LIVE_THEME_ID="150150381799"
CF_BASSETT_THEME_ID="154901938407"
if command -v git &> /dev/null; then
    GIT_BRANCH=$(git branch --show-current 2>/dev/null || true)
    if [ "$GIT_BRANCH" = "bassett" ]; then
        THEME_ID="$CF_BASSETT_THEME_ID"
    else
        THEME_ID="$LIVE_THEME_ID"
    fi
else
    THEME_ID="$LIVE_THEME_ID"
fi
IS_LIVE_THEME=false
[ "$THEME_ID" = "$LIVE_THEME_ID" ] && IS_LIVE_THEME=true
THEME_FLAG="--theme=${THEME_ID} --store=${SHOPIFY_STORE}"
# If you get 401 "Service is not valid for authentication", use a Theme Access password:
# 1. In Shopify Admin: Online Store → Themes → Add theme → Connect from GitHub, or use the Theme Access app.
# 2. Or: Apps → Develop apps → [Your app] → API credentials → create a custom app with Theme read/write.
# 3. Export the password: export SHOPIFY_THEME_PASSWORD="your-theme-access-password"
if [ -n "${SHOPIFY_THEME_PASSWORD:-}" ]; then
    THEME_FLAG="${THEME_FLAG} --password=${SHOPIFY_THEME_PASSWORD}"
    echo -e "${GREEN}Using SHOPIFY_THEME_PASSWORD for theme auth.${NC}"
fi

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
    echo "  config          - Push theme config (settings_schema.json) so new options like ColorFlex appear in Theme settings"
    echo "  locales         - Push only locales (translations, fixes 'Translation missing')"
    echo "  sections        - Push only sections"
    echo "  snippets        - Push only snippets"
    echo "  changed         - Push only modified/staged theme files under src/ (what you're working on)"
    echo "  only <path>      - Push a single file (path relative to src/, e.g. templates/page.colorflex.liquid)"
    echo "  furniture       - Deploy furniture mode (assets + template + snippet)"
    echo "  clothing        - Deploy clothing mode (assets + template)"
    echo "  bassett         - Deploy Bassett mode (Bassett JS + page template)"
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
        echo "  ./deploy-shopify-cli.sh bassett    # Deploy Bassett mode"
        echo "  ./deploy-shopify-cli.sh all         # Push entire theme (safe: --nodelete)"
    echo "  ./deploy-shopify-cli.sh pull        # Pull theme from Shopify → theme-pull/"
    echo ""
}

# Shopify CLI: use global if available, otherwise npx (avoids EACCES on npm install -g)
if command -v shopify &> /dev/null; then
    SHOPIFY_CMD="shopify"
    echo -e "${GREEN}✅ Shopify CLI found${NC}"
else
    SHOPIFY_CMD="npx shopify"
    echo -e "${YELLOW}Using npx shopify (no global install). To install globally: see docs/SETUP_AFTER_REBUILD.md)${NC}"
fi
echo ""

# Determine what to deploy
DEPLOY_MODE="${1:-all}"

# Show which theme and store we're pushing to (auto-selected by branch)
if command -v git &> /dev/null; then
    GIT_BRANCH=$(git branch --show-current 2>/dev/null || true)
else
    GIT_BRANCH=""
fi
if [ "$THEME_ID" = "$CF_BASSETT_THEME_ID" ]; then
    echo -e "${BLUE}🎯 Deploy target: CF Bassett (theme ${THEME_ID}) — branch: ${GIT_BRANCH:-?}${NC}"
else
    echo -e "${BLUE}🎯 Deploy target: Live theme (${THEME_ID}) — branch: ${GIT_BRANCH:-?}${NC}"
fi
echo -e "${BLUE}   Store: ${SHOPIFY_STORE}${NC}"
echo ""

case "$DEPLOY_MODE" in
    assets)
        echo "📦 Deploying ASSETS only..."
        echo ""
        echo "Files to deploy:"
        echo "  - src/assets/color-flex-core.min.js"
        if [ "$IS_LIVE_THEME" = false ]; then
            echo "  - src/assets/color-flex-bassett.min.js (Bassett theme only; skipped for live)"
        fi
        echo "  - src/assets/color-flex-furniture.min.js"
        echo "  - src/assets/color-flex-clothing.min.js"
        echo "  - src/assets/color-flex-furniture-simple.min.js"
        echo "  - src/assets/color-flex-clothing-simple.min.js"
        echo "  - src/assets/unified-pattern-modal.js"
        echo "  - src/assets/ProductConfigurationFlow.js"
        echo "  - src/assets/colorflex-simple-mode.css"
        echo "  - src/assets/furniture-config.json (if exists)"
        echo ""
        if [ "$IS_LIVE_THEME" = true ]; then
            echo -e "${GREEN}(Live theme: Bassett bundle excluded — main site must not load Bassett.)${NC}"
            echo ""
        fi
        read -p "Continue? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            # ✅ Create backup before deploying
            echo ""
            echo -e "${BLUE}💾 Creating backup before deployment...${NC}"
            bash ./scripts/backup-assets.sh create "Before assets deployment - $(date +"%Y-%m-%d %H:%M")"
            echo ""
            
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only assets/color-flex-core.min.js
            # Never push Bassett bundle to live theme (Bassett is local-only; must not appear on main site)
            if [ "$IS_LIVE_THEME" = false ]; then
                ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only assets/color-flex-bassett.min.js
            fi
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only assets/color-flex-furniture.min.js
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only assets/color-flex-clothing.min.js
            # ✅ FIX: Deploy simple mode JS files
            if [ -f "src/assets/color-flex-furniture-simple.min.js" ]; then
                ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only assets/color-flex-furniture-simple.min.js
            fi
            if [ -f "src/assets/color-flex-clothing-simple.min.js" ]; then
                ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only assets/color-flex-clothing-simple.min.js
            fi
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only assets/unified-pattern-modal.js
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only assets/ProductConfigurationFlow.js
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only assets/colorflex-simple-mode.css
            # Deploy furniture-config.json if it exists
            if [ -f "src/assets/furniture-config.json" ]; then
                ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only assets/furniture-config.json
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
                ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only "assets/$name" --nodelete
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

        # Always sync from data/collections.json so Shopify gets the full file (not an old smaller copy in src/assets/)
        if [ -f "data/collections.json" ]; then
            cp data/collections.json src/assets/collections.json
            echo -e "${GREEN}✅ Synced data/collections.json → src/assets/collections.json${NC}"
        elif [ ! -f "src/assets/collections.json" ]; then
            echo -e "${RED}❌ data/collections.json not found and src/assets/collections.json missing${NC}"
            exit 1
        else
            echo -e "${YELLOW}⚠️  data/collections.json not found; pushing existing src/assets/collections.json${NC}"
        fi

        echo ""

        # Check for --yes flag (skip confirmation in automated workflows)
        if [[ "$2" == "--yes" ]]; then
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only assets/collections.json
            echo -e "${GREEN}✅ collections.json deployed to Shopify assets${NC}"
        else
            read -p "Continue? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only assets/collections.json
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
                ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only templates/index.json --nodelete
            fi
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only templates/page.colorflex-furniture-simple.liquid --nodelete
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only templates/page.colorflex-clothing-simple.liquid --nodelete
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only templates/page.extraordinary-color.liquid --nodelete
            echo -e "${GREEN}✅ Templates deployed successfully${NC}"
        else
            read -p "Continue? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                if [ -f "src/templates/index.json" ]; then
                    ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only templates/index.json --nodelete
                fi
                ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only templates/page.colorflex-furniture-simple.liquid --nodelete
                ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only templates/page.colorflex-clothing-simple.liquid --nodelete
                ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only templates/page.extraordinary-color.liquid --nodelete
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
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only sections/main-product.liquid --nodelete
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only sections/rich-text.liquid --nodelete
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only sections/header.liquid --nodelete
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only sections/header-group.json --nodelete
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only sections/footer.liquid --nodelete
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only sections/footer-group.json --nodelete
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
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only snippets/shopify-product-colorflex-button.liquid
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
        # Live theme: never push Bassett-only files (main site must not show Bassett)
        if [ "$IS_LIVE_THEME" = true ]; then
            THEME_PATHS=$(echo "$THEME_PATHS" | grep -v '^templates/page\.colorflex-bassett\.liquid$' | grep -v '^assets/color-flex-bassett\.min\.js$')
        fi
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
                ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only "$relpath" --nodelete --allow-live
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
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only assets/color-flex-furniture.min.js

            echo ""
            echo "Step 2/3: Deploying furniture template..."
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only templates/page.colorflex-furniture.liquid

            echo ""
            echo "Step 3/3: Deploying product button snippet..."
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only snippets/shopify-product-colorflex-button.liquid

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
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only assets/color-flex-clothing.min.js

            echo ""
            echo "Step 2/2: Deploying clothing template..."
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only templates/page.colorflex-clothing.liquid

            echo ""
            echo -e "${GREEN}✅ Clothing mode deployed successfully${NC}"
            echo ""
            echo "Next steps:"
            echo "  1. Test at: https://saffroncottage.shop/pages/colorflex-clothing"
            echo "  2. Check console for: '👕 CLOTHING MODE: Loaded X collections'"
            echo "  3. Verify collections.json loads from server (NOT Shopify assets)"
        fi
        ;;

    bassett)
        echo "BASSETT is local only — do not deploy to Shopify."
        echo "Run 'npm run bassett' for local preview at http://localhost:3333"
        echo "Exiting without pushing any Bassett assets."
        exit 1
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
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only layout/theme.liquid
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
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only locales/ --nodelete
            echo -e "${GREEN}✅ Locales deployed successfully${NC}"
        fi
        ;;

    config)
        echo "⚙️ Deploying THEME CONFIG (settings_schema.json)..."
        echo ""
        echo "This makes new Theme settings (e.g. ColorFlex → chameleon icon) appear in the editor."
        echo "  - src/config/settings_schema.json"
        echo ""
        read -p "Continue? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only config/settings_schema.json --nodelete
            echo -e "${GREEN}✅ Config deployed. Refresh Theme settings in the editor to see the new option(s).${NC}"
        fi
        ;;

    all)
        echo "🌐 Deploying ENTIRE THEME (add/update only, --nodelete)..."
        echo ""
        echo -e "${YELLOW}Files in src/ will be pushed. Remote-only files are kept (--nodelete).${NC}"
        if [ "$IS_LIVE_THEME" = true ]; then
            echo -e "${YELLOW}⚠️  Live theme: Bassett files in src/ will be pushed too (no exclude). To keep main site free of Bassett, use: assets, templates, sections, etc. separately.${NC}"
            echo -e "${YELLOW}   The bar shows 'CF Bassett' when the published theme's name in Shopify is 'CF Bassett'. Rename it in Online Store → Themes so the main site does not show that name.${NC}"
        fi
        echo ""
        read -p "Are you sure? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --nodelete
            echo -e "${GREEN}✅ Theme deployed successfully${NC}"
        fi
        ;;

    only)
        ONEPATH="$2"
        if [[ -z "$ONEPATH" ]]; then
            echo -e "${RED}❌ Usage: ./deploy-shopify-cli.sh only <path>${NC}"
            echo "Path relative to src/, e.g. sections/header.liquid or src/sections/header.liquid"
            exit 1
        fi
        # Normalize: strip leading src/ so both "sections/foo" and "src/sections/foo" work
        ONEPATH="${ONEPATH#src/}"
        if [[ ! -f "src/$ONEPATH" ]]; then
            echo -e "${RED}❌ File not found: src/$ONEPATH${NC}"
            exit 1
        fi
        # Block Bassett-only files from being pushed to live theme
        if [ "$IS_LIVE_THEME" = true ]; then
            case "$ONEPATH" in
                templates/page.colorflex-bassett.liquid|assets/color-flex-bassett.min.js)
                    echo -e "${RED}❌ Cannot push Bassett-only file to the live theme. Main site must not load Bassett.${NC}"
                    echo "Use the Bassett theme (branch: bassett) or run Bassett locally: npm run bassett"
                    exit 1
                    ;;
            esac
        fi
        echo "📤 Deploying single file (no Git)..."
        echo "  → $ONEPATH"
        echo ""
        ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only "$ONEPATH" --nodelete --allow-live
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
