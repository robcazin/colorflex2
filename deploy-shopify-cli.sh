#!/bin/bash

# Shopify CLI Deployment Script for ColorFlex
# Created: November 19, 2025
# Updated: January 5, 2026 - Added auto-theme selection
# Updated: January 15, 2026 - Added automatic backup system before deployment
# Updated: February 2026 - Added --nodelete to full push; added layout option
# Updated: March 2026 - changed-assets: push only git-changed files under src/assets/
# Updated: April 2026 - last-edits: push the N most recently modified theme files (mtime), for small edits
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

# Default target: live theme. Only the "bassett" command pushes to CF Bassett (unpublished preview).
# You can work from main only; preview Bassett via Online Store → Themes → CF Bassett → Preview.
LIVE_THEME_ID="150150381799"
CF_BASSETT_THEME_ID="154901938407"
THEME_ID="$LIVE_THEME_ID"
IS_LIVE_THEME=true
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
    echo "  changed         - Push only modified/staged theme files under src/ (layout, sections, snippets, assets, …)"
    echo "  changed-assets  - Same as changed, but only files under src/assets/ (CSS/JS/json in assets)"
    echo "  last-edits [N]  - Push the N most recently modified theme files by save time (default N=2). Use after tiny edits."
    echo "  pdp             - Push ColorFlex product-page set (layout + PDP CSS + main-product + both snippets)"
    echo "  only <path>      - Push a single file (path relative to src/, e.g. templates/page.colorflex.liquid)"
    echo "  furniture       - Deploy furniture mode (assets + template + snippet)"
    echo "  clothing        - Deploy clothing mode (assets + template)"
    echo "  bassett         - Deploy Bassett to CF Bassett theme (unpublished preview only)"
    echo "  bassett-live    - Deploy Bassett to LIVE theme → use for pages/bassett on main store"
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
    echo "  ./deploy-shopify-cli.sh changed --yes          # Upload all modified theme files (no prompt)"
    echo "  ./deploy-shopify-cli.sh changed-assets --yes   # Upload only modified files in src/assets/"
    echo "  ./deploy-shopify-cli.sh last-edits --yes       # Upload the 2 most recently saved theme files"
    echo "  ./deploy-shopify-cli.sh last-edits 5 --yes     # Upload the 5 most recently saved theme files"
    echo "  ./deploy-shopify-cli.sh pdp --yes              # Full PDP ColorFlex UI (after theme edits; not one file)"
    echo "  ./deploy-shopify-cli.sh changed                # Same, with y/n confirm (use only <path> for one file)"
    echo "  ./deploy-shopify-cli.sh only templates/page.colorflex.liquid   # Upload one file only"
    echo "  ./deploy-shopify-cli.sh furniture   # Deploy furniture mode"
        echo "  ./deploy-shopify-cli.sh clothing    # Deploy clothing mode"
    echo "  ./deploy-shopify-cli.sh bassett       # Deploy to CF Bassett theme (preview only)"
    echo "  ./deploy-shopify-cli.sh bassett-live  # Deploy to live theme (for pages/bassett on main store)"
    echo "  ./deploy-shopify-cli.sh all           # Push entire theme (safe: --nodelete)"
    echo "  ./deploy-shopify-cli.sh pull        # Pull theme from Shopify → theme-pull/"
    echo ""
}

# Epoch mtime for theme files (BSD stat on macOS, GNU stat elsewhere)
_theme_mtime() {
    if stat -f '%m' "$1" &>/dev/null; then
        stat -f '%m' "$1"
    else
        stat -c '%Y' "$1" 2>/dev/null
    fi
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

# "bassett" command always targets CF Bassett (unpublished preview); everything else → live theme
if [ "$DEPLOY_MODE" = "bassett" ]; then
    THEME_ID="$CF_BASSETT_THEME_ID"
    IS_LIVE_THEME=false
    THEME_FLAG="--theme=${THEME_ID} --store=${SHOPIFY_STORE}"
    [ -n "${SHOPIFY_THEME_PASSWORD:-}" ] && THEME_FLAG="${THEME_FLAG} --password=${SHOPIFY_THEME_PASSWORD}"
fi

# Show which theme and store we're pushing to
if [ "$THEME_ID" = "$CF_BASSETT_THEME_ID" ]; then
    echo -e "${BLUE}🎯 Deploy target: CF Bassett / preview theme (${THEME_ID})${NC}"
else
    echo -e "${BLUE}🎯 Deploy target: Live theme (${THEME_ID})${NC}"
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
        echo "  - src/assets/colorflex-responsive.css"
        echo "  - src/assets/colorflex-product-page.css (PDP button + collection story helpers)"
        echo "  - src/assets/mockups.json"
        echo "  - src/assets/*mask*.png (if any)"
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
            [ -f "src/assets/colorflex-responsive.css" ] && ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only assets/colorflex-responsive.css
            [ -f "src/assets/colorflex-product-page.css" ] && ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only assets/colorflex-product-page.css
            # Deploy mockups.json and any tint mask assets (used for mockup tinting)
            if [ -f "src/assets/mockups.json" ]; then
                ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only assets/mockups.json
            fi
            for f in src/assets/*mask*.png; do
                [ -f "$f" ] || continue
                name=$(basename "$f")
                ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only "assets/$name"
                echo "  ✓ $name"
            done
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
        echo "📑 Deploying SECTIONS (and pagination snippet)..."
        echo ""
        echo "Files to deploy:"
        echo "  - sections/main-product.liquid"
        echo "  - sections/rich-text.liquid"
        echo "  - sections/header.liquid, header-group.json"
        echo "  - sections/footer.liquid, footer-group.json"
        echo "  - sections/main-collection-product-grid.liquid (collection product grid + pagination)"
        echo "  - sections/main-list-collections.liquid (list collections + pagination)"
        echo "  - snippets/pagination.liquid (required for collection/list pagination)"
        echo ""
        if [[ "$2" == "--yes" ]]; then
            DO_PUSH=true
        else
            read -p "Continue? (y/n) " -n 1 -r
            echo
            [[ $REPLY =~ ^[Yy]$ ]] && DO_PUSH=true
        fi
        if [[ "$DO_PUSH" == true ]]; then
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only sections/main-product.liquid --nodelete
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only sections/rich-text.liquid --nodelete
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only sections/header.liquid --nodelete
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only sections/header-group.json --nodelete
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only sections/footer.liquid --nodelete
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only sections/footer-group.json --nodelete
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only sections/main-collection-product-grid.liquid --nodelete
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only sections/main-list-collections.liquid --nodelete
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only snippets/pagination.liquid --nodelete
            echo -e "${GREEN}✅ Sections and pagination snippet deployed successfully${NC}"
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

    changed-assets)
        echo "🔬 Deploying only modified/staged files under src/assets/ (CSS, JS, JSON, images, …)..."
        echo ""
        if ! git rev-parse --is-inside-work-tree &>/dev/null; then
            echo -e "${RED}❌ Not a git repository. Run from project root or use: ./deploy-shopify-cli.sh only assets/<file>${NC}"
            exit 1
        fi
        CHANGED_FILES=$(
            {
                git diff --name-only HEAD -- src/assets/
                git diff --name-only --cached -- src/assets/
                git ls-files --others --exclude-standard -- src/assets/
            } 2>/dev/null | sort -u
        )
        if [[ -z "$CHANGED_FILES" ]]; then
            echo -e "${YELLOW}No modified, staged, or untracked files under src/assets/.${NC}"
            echo "Tip: For layout/sections/snippets too, run: ./deploy-shopify-cli.sh changed"
            exit 0
        fi
        THEME_PATHS=""
        for f in $CHANGED_FILES; do
            [[ -f "$f" ]] || continue
            case "$f" in
                src/assets/*) THEME_PATHS="${THEME_PATHS} ${f#src/}";;
            esac
        done
        THEME_PATHS=$(echo "$THEME_PATHS" | tr ' ' '\n' | grep -v '^$' | sort -u)
        if [[ -z "$THEME_PATHS" ]]; then
            echo -e "${YELLOW}No trackable asset files in that set.${NC}"
            exit 0
        fi
        echo "Asset files to deploy:"
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
            echo -e "${GREEN}✅ Deployed $COUNT asset file(s) successfully${NC}"
        fi
        ;;

    last-edits)
        echo "🕐 Deploying the most recently saved theme files (by filesystem mtime, not git status)..."
        echo ""
        N=2
        if [[ "$2" =~ ^[0-9]+$ ]]; then
            N="$2"
            SKIP_ARG="${3:-}"
        else
            SKIP_ARG="${2:-}"
        fi
        if [ "$N" -lt 1 ]; then
            echo -e "${RED}❌ Count must be a positive integer (e.g. last-edits 3).${NC}"
            exit 1
        fi
        if [ "$N" -gt 50 ]; then
            echo -e "${YELLOW}⚠️  Capping at 50 files.${NC}"
            N=50
        fi
        RECENT_TMP=$(mktemp)
        find src/sections src/templates src/snippets src/layout src/assets src/locales src/config \
            -type f 2>/dev/null | while IFS= read -r f; do
            m=$(_theme_mtime "$f") || continue
            printf '%s\t%s\n' "$m" "$f"
        done | sort -t "$(printf '\t')" -k1 -rn | cut -f2- > "$RECENT_TMP"
        THEME_PATHS=""
        PICKED=0
        while IFS= read -r f; do
            [[ -z "$f" ]] && continue
            [[ -f "$f" ]] || continue
            case "$f" in
                src/sections/*|src/templates/*|src/snippets/*|src/layout/*|src/assets/*|src/locales/*|src/config/*)
                    relpath="${f#src/}"
                    if [ "$IS_LIVE_THEME" = true ]; then
                        case "$relpath" in
                            templates/page.colorflex-bassett.liquid|assets/color-flex-bassett.min.js)
                                continue
                                ;;
                        esac
                    fi
                    THEME_PATHS="${THEME_PATHS}${relpath}"$'\n'
                    PICKED=$((PICKED + 1))
                    [ "$PICKED" -ge "$N" ] && break
                    ;;
            esac
        done < "$RECENT_TMP"
        rm -f "$RECENT_TMP"
        THEME_PATHS=$(echo "$THEME_PATHS" | grep -v '^$')
        if [[ -z "$THEME_PATHS" ]]; then
            echo -e "${YELLOW}No theme files found under sections, templates, snippets, layout, assets, locales, config.${NC}"
            exit 0
        fi
        echo "Most recently saved files (up to $N) → deploy:"
        echo "$THEME_PATHS" | sed 's/^/  - src\//'
        echo ""
        echo -e "${BLUE}Tip: This uses file save time. Use ${NC}changed${BLUE} for “everything git thinks changed under src/”.${NC}"
        echo ""
        if [[ "$SKIP_ARG" == "--yes" ]]; then
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
            done <<< "$(echo "$THEME_PATHS")"
            echo -e "${GREEN}✅ Deployed $COUNT file(s) successfully${NC}"
        fi
        ;;

    pdp)
        echo "🛒 Deploying ColorFlex product page bundle (layout + assets + section + snippets)..."
        echo ""
        echo "Why: The live PDP uses snippets/shopify-product-colorflex-button (from product.json) plus"
        echo "     main-product.liquid, theme.liquid (PDP CSS link), and product-pattern-description."
        echo "     Pushing one file often leaves another copy stale (e.g. duplicate button removed from price block)."
        echo ""
        PDP_FILES=(
            layout/theme.liquid
            assets/colorflex-product-page.css
            snippets/shopify-product-colorflex-button.liquid
            snippets/product-pattern-description.liquid
            sections/main-product.liquid
        )
        for rel in "${PDP_FILES[@]}"; do
            if [[ ! -f "src/$rel" ]]; then
                echo -e "${RED}❌ Missing: src/$rel${NC}"
                exit 1
            fi
            echo "  - src/$rel"
        done
        echo ""
        if [[ "$2" == "--yes" ]]; then
            SKIP_CONFIRM=1
        else
            read -p "Continue? (y/n) " -n 1 -r
            echo
            [[ $REPLY =~ ^[Yy]$ ]] && SKIP_CONFIRM=1
        fi
        if [[ -n "$SKIP_CONFIRM" ]]; then
            for rel in "${PDP_FILES[@]}"; do
                ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only "$rel" --nodelete --allow-live
                echo "  ✓ $rel"
            done
            echo -e "${GREEN}✅ PDP bundle deployed. Hard-refresh the product page (cache).${NC}"
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
        echo "Deploying BASSETT to CF Bassett theme only (unpublished — for web testing)."
        echo "Target: CF Bassett theme ${THEME_ID}. Live theme is not touched."
        echo ""
        echo -e "${YELLOW}Building Bassett bundle from source (CFM.js, etc.)...${NC}"
        npm run build -- --env mode=bassett || { echo -e "${RED}Build failed. Fix errors and try again.${NC}"; exit 1; }
        echo ""
        echo "Files to deploy:"
        echo "  - src/assets/color-flex-bassett.min.js"
        echo "  - src/templates/page.colorflex-bassett.liquid"
        echo "  - src/assets/pattern-displace.worker.js"
        echo ""
        if [ ! -f "src/assets/pattern-displace.worker.js" ] && [ -f "src/workers/pattern-displace.worker.js" ]; then
            cp src/workers/pattern-displace.worker.js src/assets/pattern-displace.worker.js
            echo -e "${GREEN}Copied worker to src/assets/ for theme deploy.${NC}"
        fi
        read -p "Continue? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only assets/color-flex-bassett.min.js --nodelete
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only templates/page.colorflex-bassett.liquid --nodelete
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only assets/pattern-displace.worker.js --nodelete
            echo -e "${GREEN}Bassett deployed to CF Bassett theme. Preview at: Online Store → Themes → CF Bassett → Preview.${NC}"
            echo "Preview at: Online Store → Themes → CF Bassett → Preview (not a public URL)."
            echo "For a public URL, use: ./deploy-shopify-cli.sh bassett-live and create a Page (see help)."
        fi
        ;;

    bassett-live)
        echo "Deploying BASSETT to LIVE theme so the Bassett page is reachable from anywhere."
        echo "Target: Live theme (${THEME_ID})."
        echo ""
        echo -e "${YELLOW}Building Bassett bundle from source (CFM.js, etc.)...${NC}"
        npm run build -- --env mode=bassett || { echo -e "${RED}Build failed. Fix errors and try again.${NC}"; exit 1; }
        echo ""
        echo "Files to deploy:"
        echo "  - src/assets/color-flex-bassett.min.js"
        echo "  - src/templates/page.colorflex-bassett.liquid"
        echo "  - src/assets/pattern-displace.worker.js"
        echo ""
        echo -e "${BLUE}After deploy: In Shopify Admin → Online Store → Pages → Add page (e.g. title 'Bassett').${NC}"
        echo -e "${BLUE}Set template to 'ColorFlex Bassett' (or 'page.colorflex-bassett'). Save.${NC}"
        echo -e "${BLUE}Public URL will be: https://YOUR-STORE/pages/bassett (use your store domain and page handle)${NC}"
        echo ""
        if [ ! -f "src/assets/pattern-displace.worker.js" ] && [ -f "src/workers/pattern-displace.worker.js" ]; then
            cp src/workers/pattern-displace.worker.js src/assets/pattern-displace.worker.js
            echo -e "${GREEN}Copied worker to src/assets/ for theme deploy.${NC}"
        fi
        read -p "Continue? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only assets/color-flex-bassett.min.js --nodelete
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only templates/page.colorflex-bassett.liquid --nodelete
            ${SHOPIFY_CMD} theme push ${THEME_FLAG} --path src --only assets/pattern-displace.worker.js --nodelete
            echo -e "${GREEN}Bassett deployed to live theme.${NC}"
            echo "Create a Page in Shopify with template 'ColorFlex Bassett' to get a public URL."
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
        else
            echo "Deployment cancelled."
            exit 0
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
                    echo "Use: ./deploy-shopify-cli.sh bassett  (or run Bassett locally: npm run bassett)"
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
