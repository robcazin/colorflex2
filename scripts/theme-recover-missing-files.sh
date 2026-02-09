#!/bin/bash
# Recover missing theme files from another (intact) theme.
# Use the theme you got index.json from - it should have all snippets, section groups, etc.
#
# Usage:
#   By theme ID (pull from Shopify):  ./scripts/theme-recover-missing-files.sh THEME_ID
#   From downloaded folder:            ./scripts/theme-recover-missing-files.sh /path/to/downloaded-theme
#
# To download a theme: Shopify Admin → Online Store → Themes → [theme] → Actions → Download theme file.
# Then unzip it and pass the folder path to this script.

set -e
SRC_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$SRC_ROOT"

ARG="$1"
SOURCE_DIR="./theme-recovery-pull"
STORE="${SHOPIFY_STORE:-f63bae-86.myshopify.com}"
SOURCE_DIR=""

if [ -z "$ARG" ]; then
  echo "Usage: $0 THEME_ID   OR   $0 /path/to/downloaded-theme"
  echo ""
  echo "  THEME_ID              - Pull from Shopify (shopify theme list --store=$STORE)"
  echo "  /path/to/theme-folder - Use an already-downloaded theme folder"
  echo ""
  echo "Download a theme: Shopify Admin → Themes → [theme] → Actions → Download theme file → unzip"
  exit 1
fi

# If argument looks like a path (slash or existing dir), use it as source
if [ -d "$ARG" ]; then
  SOURCE_DIR="$(cd "$ARG" && pwd)"
  echo "Using downloaded theme folder: $SOURCE_DIR"
elif [ -d "./$ARG" ]; then
  SOURCE_DIR="$(cd "./$ARG" && pwd)"
  echo "Using downloaded theme folder: $SOURCE_DIR"
else
  echo "Pulling theme $ARG from $STORE into $SOURCE_DIR..."
  rm -rf "$SOURCE_DIR"
  mkdir -p "$SOURCE_DIR"
  shopify theme pull --theme="$ARG" --store="$STORE" --path "$SOURCE_DIR"
  SOURCE_DIR="$SRC_ROOT/$SOURCE_DIR"
fi

echo ""
echo "Copying only MISSING files into src/ (will not overwrite your customizations)..."
echo ""

# Snippets: copy any file that exists in source but not in src
if [ -d "$SOURCE_DIR/snippets" ]; then
  for f in "$SOURCE_DIR/snippets"/*.liquid; do
    [ -f "$f" ] || continue
    name=$(basename "$f")
    if [ ! -f "src/snippets/$name" ]; then
      cp "$f" "src/snippets/$name"
      echo "  + src/snippets/$name"
    fi
  done
fi

# Sections: same - only add missing
if [ -d "$SOURCE_DIR/sections" ]; then
  for f in "$SOURCE_DIR/sections"/*.liquid; do
    [ -f "$f" ] || continue
    name=$(basename "$f")
    if [ ! -f "src/sections/$name" ]; then
      cp "$f" "src/sections/$name"
      echo "  + src/sections/$name"
    fi
  done
  for f in "$SOURCE_DIR/sections"/*.json; do
    [ -f "$f" ] || continue
    name=$(basename "$f")
    if [ ! -f "src/sections/$name" ]; then
      cp "$f" "src/sections/$name"
      echo "  + src/sections/$name"
    fi
  done
fi

# Config: copy files that are in pull but not in src (e.g. section group configs)
if [ -d "$SOURCE_DIR/config" ]; then
  for f in "$SOURCE_DIR/config"/*.json; do
    [ -f "$f" ] || continue
    name=$(basename "$f")
    if [ ! -f "src/config/$name" ]; then
      cp "$f" "src/config/$name"
      echo "  + src/config/$name"
    fi
  done
  # Section groups (header-group.json, footer-group.json) live in sections/, not config/sections/
  for f in "$SOURCE_DIR/sections"/*-group.json; do
    [ -f "$f" ] || continue
    name=$(basename "$f")
    if [ ! -f "src/sections/$name" ]; then
      cp "$f" "src/sections/$name"
      echo "  + src/sections/$name"
    fi
  done
fi

# Locales: add entire locales folder if missing
if [ -d "$SOURCE_DIR/locales" ] && [ ! -d "src/locales" ]; then
  cp -R "$SOURCE_DIR/locales" "src/locales"
  echo "  + src/locales/ (entire folder)"
elif [ -d "$SOURCE_DIR/locales" ]; then
  for f in "$SOURCE_DIR/locales"/*.json; do
    [ -f "$f" ] || continue
    name=$(basename "$f")
    if [ ! -f "src/locales/$name" ]; then
      mkdir -p src/locales
      cp "$f" "src/locales/$name"
      echo "  + src/locales/$name"
    fi
  done
fi

# Layout: only add if missing (do not overwrite theme.liquid)
if [ -d "$SOURCE_DIR/layout" ]; then
  for f in "$SOURCE_DIR/layout"/*.liquid; do
    [ -f "$f" ] || continue
    name=$(basename "$f")
    if [ ! -f "src/layout/$name" ]; then
      cp "$f" "src/layout/$name"
      echo "  + src/layout/$name"
    fi
  done
fi

# Templates: only add if missing (do not overwrite index.json or your pages)
if [ -d "$SOURCE_DIR/templates" ]; then
  for f in "$SOURCE_DIR/templates"/*.liquid "$SOURCE_DIR/templates"/*.json; do
    [ -f "$f" ] || continue
    name=$(basename "$f")
    if [ ! -f "src/templates/$name" ]; then
      cp "$f" "src/templates/$name"
      echo "  + src/templates/$name"
    fi
  done
fi

# Assets: only add theme core assets that are missing (avoid overwriting ColorFlex assets)
if [ -d "$SOURCE_DIR/assets" ]; then
  for f in "$SOURCE_DIR/assets"/*.js "$SOURCE_DIR/assets"/*.css "$SOURCE_DIR/assets"/*.liquid; do
    [ -f "$f" ] || continue
    name=$(basename "$f")
    if [ ! -f "src/assets/$name" ]; then
      cp "$f" "src/assets/$name"
      echo "  + src/assets/$name"
    fi
  done
fi

echo ""
echo "Done. You can remove the pull directory if you want: rm -rf $SOURCE_DIR"
echo ""
echo "Next: deploy with --nodelete so you don't delete anything again:"
echo "  ./deploy-shopify-cli.sh all"
echo ""
