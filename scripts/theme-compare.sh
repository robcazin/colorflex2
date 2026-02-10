#!/bin/bash
# Compare local src/ with a pulled theme directory (e.g. theme-pull/).
# Reports modification times and whether file contents differ.
# Use after theme-pull.sh to see what changed in the editor vs local.
#
# Usage:
#   ./scripts/theme-compare.sh [path-to-pulled-theme]
#   Default path: theme-pull (if present)

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PULL_DIR="${1:-theme-pull}"
LOCAL="src"

if [ ! -d "$PULL_DIR" ]; then
    echo "❌ Pull directory not found: $PULL_DIR"
    echo ""
    echo "Pull the theme first:"
    echo "  ./scripts/theme-pull.sh"
    echo "  ./scripts/theme-pull.sh --stamped   # theme-pull-YYYYMMDD-HHMM"
    echo ""
    echo "Then run: ./scripts/theme-compare.sh $PULL_DIR"
    exit 1
fi

echo "📊 Comparing: $LOCAL/  vs  $PULL_DIR/"
echo "   (dates are local mtime; diff = content differs)"
echo ""

# Files that the theme editor typically changes (good to compare)
EDITOR_RELEVANT="config settings_data.json templates sections layout theme.liquid locales"
DIFF_COUNT=0
ONLY_LOCAL=0
ONLY_REMOTE=0

# Portable mtime display (macOS vs Linux)
mtime() {
    local f="$1"
    if stat -f "%Sm" -t "%Y-%m-%d %H:%M" "$f" 2>/dev/null; then
        return
    fi
    stat -c "%y" "$f" 2>/dev/null | cut -d. -f1 | tr 'T' ' '
}

# Compare by walking src and the pull dir
compare_dir() {
    local subdir="$1"
    local local_dir="$LOCAL/$subdir"
    local remote_dir="$PULL_DIR/$subdir"
    [ -z "$subdir" ] && local_dir="$LOCAL" && remote_dir="$PULL_DIR"

    for local_path in "$local_dir"/* "$local_dir"/**/*; do
        [ -f "$local_path" ] || continue
        rel="${local_path#$LOCAL/}"
        remote_path="$PULL_DIR/$rel"
        if [ ! -f "$remote_path" ]; then
            echo "  only in local: $rel"
            ((ONLY_LOCAL++)) || true
            continue
        fi
        if ! cmp -s "$local_path" "$remote_path" 2>/dev/null; then
            local_mtime=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" "$local_path" 2>/dev/null || stat -c "%y" "$local_path" 2>/dev/null | cut -d. -f1)
            remote_mtime=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" "$remote_path" 2>/dev/null || stat -c "%y" "$remote_path" 2>/dev/null | cut -d. -f1)
            echo "  DIFF  $rel"
            echo "        local:  $local_mtime   remote: $remote_mtime"
            ((DIFF_COUNT++)) || true
        fi
    done

    for remote_path in "$remote_dir"/* "$remote_dir"/**/*; do
        [ -f "$remote_path" ] || continue
        rel="${remote_path#$PULL_DIR/}"
        local_path="$LOCAL/$rel"
        [ -f "$local_path" ] && continue
        echo "  only in remote: $rel"
        ((ONLY_REMOTE++)) || true
    done
}

# Use a simple find-based comparison so we don't depend on bash globstar
compare_files() {
    echo "--- Config & templates (editor changes) ---"
    for f in "$PULL_DIR"/config/*.json "$PULL_DIR"/templates/*.json "$PULL_DIR"/templates/*.liquid; do
        [ -f "$f" ] || continue
        rel="${f#$PULL_DIR/}"
        local_f="$LOCAL/$rel"
        if [ ! -f "$local_f" ]; then
            echo "  only in remote: $rel"
            ((ONLY_REMOTE++)) || true
            continue
        fi
        if ! cmp -s "$local_f" "$f" 2>/dev/null; then
            lm=$(mtime "$local_f")
            rm=$(mtime "$f")
            echo "  DIFF  $rel"
            echo "        local: $lm   remote: $rm"
            ((DIFF_COUNT++)) || true
        fi
    done
    for f in "$LOCAL"/config/*.json "$LOCAL"/templates/*.json "$LOCAL"/templates/*.liquid; do
        [ -f "$f" ] || continue
        rel="${f#$LOCAL/}"
        [ -f "$PULL_DIR/$rel" ] && continue
        echo "  only in local: $rel"
        ((ONLY_LOCAL++)) || true
    done

    echo ""
    echo "--- Sections ---"
    for f in "$PULL_DIR"/sections/*.liquid "$PULL_DIR"/sections/*.json; do
        [ -f "$f" ] || continue
        rel="${f#$PULL_DIR/}"
        local_f="$LOCAL/$rel"
        if [ ! -f "$local_f" ]; then
            echo "  only in remote: $rel"
            ((ONLY_REMOTE++)) || true
            continue
        fi
        if ! cmp -s "$local_f" "$f" 2>/dev/null; then
            lm=$(mtime "$local_f")
            rm=$(mtime "$f")
            echo "  DIFF  $rel"
            echo "        local: $lm   remote: $rm"
            ((DIFF_COUNT++)) || true
        fi
    done
    for f in "$LOCAL"/sections/*.liquid "$LOCAL"/sections/*.json; do
        [ -f "$f" ] || continue
        rel="${f#$LOCAL/}"
        [ -f "$PULL_DIR/$rel" ] && continue
        echo "  only in local: $rel"
        ((ONLY_LOCAL++)) || true
    done

    echo ""
    echo "--- Layout ---"
    for layout in theme.liquid; do
        [ -f "$LOCAL/layout/$layout" ] || continue
        [ -f "$PULL_DIR/layout/$layout" ] || continue
        if ! cmp -s "$LOCAL/layout/$layout" "$PULL_DIR/layout/$layout" 2>/dev/null; then
            lm=$(mtime "$LOCAL/layout/$layout")
            rm=$(mtime "$PULL_DIR/layout/$layout")
            echo "  DIFF  layout/$layout"
            echo "        local: $lm   remote: $rm"
            ((DIFF_COUNT++)) || true
        fi
    done
}

compare_files

echo ""
echo "--- Summary ---"
echo "  Files that differ (content): $DIFF_COUNT"
echo "  Only in local:               $ONLY_LOCAL"
echo "  Only in remote:              $ONLY_REMOTE"
echo ""
if [ "$DIFF_COUNT" -gt 0 ]; then
    echo "To see a diff for a file:  diff src/path/to/file $PULL_DIR/path/to/file"
    echo "To copy from remote:       cp $PULL_DIR/path/to/file src/path/to/file"
fi
