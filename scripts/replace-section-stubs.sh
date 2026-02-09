#!/bin/bash
# Replace stub section files with real sections from the previous (intact) theme.
# Run this after theme-recover-missing-files.sh if you want full section behavior
# instead of the minimal stubs that only allow templates to deploy.
#
# Usage: ./scripts/replace-section-stubs.sh /path/to/previous-theme
#
# Example: ./scripts/replace-section-stubs.sh ~/Downloads/Updated-copy-of-Sense
# Or:      ./scripts/replace-section-stubs.sh ./theme-recovery-pull

set -e
SRC_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$SRC_ROOT"

SOURCE_DIR="$1"
if [ -z "$SOURCE_DIR" ] || [ ! -d "$SOURCE_DIR" ]; then
  echo "Usage: $0 /path/to/previous-theme"
  echo ""
  echo "  Pass the folder of your previous theme (e.g. downloaded zip extracted)."
  echo "  Section stubs in src/sections/ will be overwritten with the real sections."
  exit 1
fi
SOURCE_DIR="$(cd "$SOURCE_DIR" && pwd)"

# Sections we added as stubs – replace with previous theme’s versions
STUB_SECTIONS=(
  main-404.liquid
  main-article.liquid
  main-blog.liquid
  main-collection-banner.liquid
  main-collection-product-grid.liquid
  main-page.liquid
  contact-form.liquid
  email-signup-banner.liquid
  related-products.liquid
  main-search.liquid
  main-activate-account.liquid
  main-account.liquid
  main-addresses.liquid
  main-order.liquid
  main-login.liquid
  main-register.liquid
  main-reset-password.liquid
)

echo "Replacing section stubs with files from: $SOURCE_DIR"
echo ""

for name in "${STUB_SECTIONS[@]}"; do
  if [ -f "$SOURCE_DIR/sections/$name" ]; then
    cp "$SOURCE_DIR/sections/$name" "src/sections/$name"
    echo "  ✓ src/sections/$name"
  else
    echo "  − $name not found in source (skipped)"
  fi
done

echo ""
echo "Done. Deploy when ready: ./deploy-shopify-cli.sh all"
