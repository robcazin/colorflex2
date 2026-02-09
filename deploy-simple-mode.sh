#!/bin/bash

# ColorFlex Simple Mode Deployment Script
# Deploys only the simple mode templates and CSS

echo "🚀 Deploying ColorFlex Simple Mode Files..."
echo ""

# Deploy templates and CSS (files are in src/)
shopify theme push --theme 150150381799 \
  --path src \
  --only \
    templates/page.colorflex-furniture-simple.liquid \
    templates/page.colorflex-clothing-simple.liquid \
    assets/colorflex-simple-mode.css \
  --nodelete \
  --allow-live

echo ""
echo "✅ Simple mode files deployed!"
echo ""
echo "Pages to test:"
echo "  - /pages/extraordinary-color-furniture"
echo "  - /pages/extraordinary-color-clothing"
