#!/bin/bash
# Pull the live theme from Shopify into a local directory for comparison/sync.
# Use this after making changes in the Shopify theme editor so you can diff
# and merge those changes into src/.
#
# Usage:
#   ./scripts/theme-pull.sh           # Pull into theme-pull/
#   ./scripts/theme-pull.sh --stamped  # Pull into theme-pull-YYYYMMDD-HHMM/

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

CONFIG_FILE="config/shopify.json"
if [ -f "$CONFIG_FILE" ]; then
    SHOPIFY_STORE=$(jq -r '.production.store' "$CONFIG_FILE" 2>/dev/null || echo "f63bae-86.myshopify.com")
else
    SHOPIFY_STORE="f63bae-86.myshopify.com"
fi
THEME_ID="${THEME_ID:-150150381799}"
STAMPED=""
[ "$1" = "--stamped" ] && STAMPED=1

if [ -n "$STAMPED" ]; then
    PULL_DIR="theme-pull-$(date +%Y%m%d-%H%M)"
else
    PULL_DIR="theme-pull"
fi

echo "📥 Pulling theme $THEME_ID from $SHOPIFY_STORE into $PULL_DIR/"
echo ""

if [ -d "$PULL_DIR" ] && [ -z "$STAMPED" ]; then
    echo "Directory $PULL_DIR already exists. Overwriting."
    read -p "Continue? (y/n) " -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]] || exit 0
fi

rm -rf "$PULL_DIR"
mkdir -p "$PULL_DIR"
shopify theme pull --theme="$THEME_ID" --store="$SHOPIFY_STORE" --path "$PULL_DIR"

echo ""
echo "✅ Theme saved to $PULL_DIR/"
echo ""
echo "Next steps:"
echo "  Compare with local:  ./scripts/theme-compare.sh $PULL_DIR"
echo "  Or:                  ./scripts/theme-compare.sh   # uses theme-pull if present"
echo "  Copy editor changes: manually copy from $PULL_DIR/config/ or $PULL_DIR/templates/ into src/"
