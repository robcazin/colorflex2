#!/bin/bash
#
# One-off ColorFlex deployment — build then push, no prompts, no interaction.
# 1. Runs npm run build (webpack → minified JS in src/assets/)
# 2. Pushes entire theme from src/ to the live theme (--nodelete)
#
# Usage:
#   ./deploy-one-off.sh              # Build + deploy to live theme
#   DEPLOY_BASSETT=1 ./deploy-one-off.sh   # Build + deploy to CF Bassett (preview) theme
#   SKIP_BUILD=1 ./deploy-one-off.sh      # Deploy only (no build)
#
# Prerequisites:
#   - config/local.env (optional; sources SHOPIFY_THEME_PASSWORD if set)
#   - config/shopify.json or default store
#   - shopify CLI: `shopify` or `npx shopify`
#   - npm install (for build)
#

set -e

# Load theme auth from config
if [ -f "config/local.env" ]; then
    set -a
    source config/local.env
    set +a
fi

# Store from config
CONFIG_FILE="config/shopify.json"
if [ -f "$CONFIG_FILE" ]; then
    SHOPIFY_STORE=$(jq -r '.production.store' "$CONFIG_FILE" 2>/dev/null || \
        grep -o '"store"[[:space:]]*:[[:space:]]*"[^"]*"' "$CONFIG_FILE" | \
        head -1 | sed 's/.*"store"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/' || \
        echo "f63bae-86.myshopify.com")
else
    SHOPIFY_STORE="f63bae-86.myshopify.com"
fi

LIVE_THEME_ID="150150381799"
CF_BASSETT_THEME_ID="154901938407"

if [ -n "${DEPLOY_BASSETT:-}" ] && [ "$DEPLOY_BASSETT" != "0" ]; then
    THEME_ID="$CF_BASSETT_THEME_ID"
    echo "Deploy target: CF Bassett (preview) theme $THEME_ID"
else
    THEME_ID="$LIVE_THEME_ID"
    echo "Deploy target: Live theme $THEME_ID"
fi

THEME_FLAG="--theme=${THEME_ID} --store=${SHOPIFY_STORE}"
[ -n "${SHOPIFY_THEME_PASSWORD:-}" ] && THEME_FLAG="${THEME_FLAG} --password=${SHOPIFY_THEME_PASSWORD}"

if command -v shopify &> /dev/null; then
    SHOPIFY_CMD="shopify"
else
    SHOPIFY_CMD="npx shopify"
fi

if [ -z "${SKIP_BUILD:-}" ] || [ "$SKIP_BUILD" = "0" ]; then
    echo "Building (npm run build)..."
    npm run build
    echo "Build done."
fi

echo "Pushing theme (src/ → Shopify, --nodelete)..."
$SHOPIFY_CMD theme push $THEME_FLAG --path src --nodelete
echo "Done."
