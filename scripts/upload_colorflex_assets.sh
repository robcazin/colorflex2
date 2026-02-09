#!/usr/bin/env bash
set -euo pipefail

# Upload built ColorFlex assets to Shopify theme using Admin API
# Usage: ./scripts/upload_colorflex_assets.sh [environment]
# Environment defaults to "production" and reads credentials from `config/shopify.json`.

ENVIRONMENT=${1:-production}
CONFIG_FILE="config/shopify.json"

if [ ! -f "$CONFIG_FILE" ]; then
  echo "❌ Config file not found: $CONFIG_FILE"
  exit 1
fi

STORE=$(jq -r ".${ENVIRONMENT}.store // empty" "$CONFIG_FILE")
THEME_ID=$(jq -r ".${ENVIRONMENT}.theme_id // empty" "$CONFIG_FILE")
TOKEN=$(jq -r ".${ENVIRONMENT}.auth_method // empty" "$CONFIG_FILE")

if [ -z "$STORE" ]; then
  echo "❌ Store not configured for environment: $ENVIRONMENT"
  exit 1
fi

if [ -z "$THEME_ID" ]; then
  echo "⚠️  Theme ID empty in config for $ENVIRONMENT — attempting to find from CONSOLE LOG"
  if [ -f "CONSOLE LOG" ]; then
    THEME_ID=$(grep -m1 "theme_id" "CONSOLE LOG" | sed -n 's/.*theme_id: \([0-9]*\).*/\1/p') || true
  fi
fi

if [ -z "$THEME_ID" ]; then
  echo "❌ Theme ID not found. Please set it in $CONFIG_FILE under .$ENVIRONMENT.theme_id"
  exit 1
fi

if [ -z "$TOKEN" ]; then
  echo "⚠️  No token found in config ($CONFIG_FILE). You must provide an Admin access token (PAT) as .$ENVIRONMENT.auth_method"
  exit 1
fi

API_BASE="https://${STORE}/admin/api/2025-10/themes/${THEME_ID}/assets.json"

echo "🔐 Using store: $STORE"
echo "🧷 Theme ID: $THEME_ID"
echo "🔁 API endpoint: $API_BASE"

upload_asset() {
  local src="$1"
  local key="assets/$(basename "$src")"

  if [ ! -f "$src" ]; then
    echo "⚠️  Source file not found: $src — skipping"
    return
  fi

  echo "📤 Preparing upload for: $src -> $key"

  # For JS files (and large files) use base64 attachment
  if [[ "$src" == *.js ]]; then
    base64 -w0 "$src" > /tmp/asset.b64
    jq -n --arg k "$key" --rawfile b64 /tmp/asset.b64 '{asset: {key: $k, attachment: $b64}}' > /tmp/asset.json
  else
    # For JSON/text, upload as `value` to preserve readability
    jq -Rs --arg k "$key" '{asset: {key: $k, value: .}}' < "$src" > /tmp/asset.json
  fi

  echo "🔗 Uploading $key to Shopify..."
  http_status=$(curl -s -o /tmp/asset.response -w "%{http_code}" \
    -X PUT "$API_BASE" \
    -H "X-Shopify-Access-Token: ${TOKEN}" \
    -H "Content-Type: application/json" \
    --data-binary @/tmp/asset.json)

  if [ "$http_status" = "200" ] || [ "$http_status" = "201" ]; then
    echo "✅ Uploaded: $key (HTTP $http_status)"
    cat /tmp/asset.response | jq -r '.asset.key, .asset.public_url // "(no public_url)"'
  else
    echo "❌ Upload failed for $key (HTTP $http_status)"
    cat /tmp/asset.response | jq .
    return 1
  fi

  # cleanup
  rm -f /tmp/asset.json /tmp/asset.b64 /tmp/asset.response || true
}

echo "
Starting upload of two assets:
- src/assets/furniture-config.json
- src/assets/color-flex-clothing.min.js
"

upload_asset "src/assets/furniture-config.json"
upload_asset "src/assets/color-flex-clothing.min.js"

echo "
Done. Verify in browser devtools (Network) that:
- /assets/furniture-config.json returns 200 and contains clothing keys
- clothing pages load color-flex-clothing.min.js (status 200)
"

exit 0
