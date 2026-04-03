#!/usr/bin/env bash
# Wrapper: Airtable → collections.json + CSV + Shopify (updates existing products).
# Same as: ./update-collection.sh sync "$@"
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec "$ROOT/update-collection.sh" sync "$@"
