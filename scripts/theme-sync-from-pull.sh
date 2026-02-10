#!/bin/bash
# Copy theme files from a pulled theme directory (e.g. theme-pull/) into src/.
# Overwrites files that exist in theme-pull but does NOT delete files that exist
# only in src (e.g. src/config/colorFlex-modes.js). Run after theme-pull.sh.
#
# Usage:
#   ./scripts/theme-sync-from-pull.sh           # sync from theme-pull/
#   ./scripts/theme-sync-from-pull.sh theme-pull-20260207-1200

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PULL_DIR="${1:-theme-pull}"
LOCAL="src"

if [ ! -d "$PULL_DIR" ]; then
    echo "❌ Pull directory not found: $PULL_DIR"
    echo ""
    echo "Pull the theme first: ./scripts/theme-pull.sh"
    echo "Then run: ./scripts/theme-sync-from-pull.sh $PULL_DIR"
    exit 1
fi

echo "📋 Syncing $PULL_DIR/ → $LOCAL/ (merge: overwrite only, keep local-only files)"
echo "   (config, templates, sections, layout)"
echo ""

for dir in config templates sections layout; do
    if [ -d "$PULL_DIR/$dir" ]; then
        mkdir -p "$LOCAL/$dir"
        # Copy/overwrite; do not delete files that exist only in src
        rsync -a --exclude='.DS_Store' "$PULL_DIR/$dir/" "$LOCAL/$dir/"
        echo "  ✓ $dir"
    fi
done

echo ""
echo "✅ Done. Editor changes from $PULL_DIR/ are in $LOCAL/. Local-only files kept."
echo "   Commit when ready: ./scripts/git-save.sh \"Sync from Shopify (theme-pull)\""
