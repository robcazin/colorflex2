# 🚀 DEPLOYMENT QUICK REFERENCE
08.29.2025
## **Type 1: JavaScript Code (Bug Fixes, Features)**
```bash
# What: CFM.js changes, new features, bug fixes
# Where: Shopify Admin → Assets
npm run build
cp dist/color-flex-core.min.js assets/color-flex-core.min.js  
cp dist/color-flex-core.min.js assets/color-flex-core.min-bu.js
# Upload both files from assets/ to Shopify manually
```

## **Type 2: Collection Data/Images** 
```bash
# What: New patterns, images, collection updates
# Where: so-animation.com server
./update                                    # Full sync
./update --metadata-only                    # Collection metadata only (curated colors, mockups)
./update -m --collection=coordinates        # Specific collection metadata only
./enhanced-deploy.sh -ui-collection [name]  # Specific collection
./smart-monitor-deployment.sh [collection]  # Test deployment
```

## **Type 3: Shopify Templates**
```bash
# What: Cart changes, liquid templates, page sections  
# Where: Shopify Admin → Themes → Edit Code
# Process: Manual upload of .liquid files
```

## **Files by Location:**

### `assets/` folder → Shopify Assets
- `color-flex-core.min.js` (main)
- `color-flex-core.min-bu.js` (what Shopify actually uses)

### Root scripts → Server deployment  
- `./update` - Data/image sync
- `./enhanced-deploy.sh` - Advanced deployment
- `./smart-monitor-deployment.sh` - Testing

### `src/` folder → Shopify Themes
- `sections/*.liquid` 
- `templates/*.liquid`
- `cart-deployment-steps.md`

## **Quick Commands:**
```bash
# Just built JavaScript? 
npm run build && cp dist/color-flex-core.min.js assets/color-flex-core.min.js && cp dist/color-flex-core.min.js assets/color-flex-core.min-bu.js

# Just updated collection data?
./update

# Testing deployment?
./smart-monitor-deployment.sh [collection] [pattern]
```

## **Bassett (Bassett page / room preview)**
- **Deploy to live** (so `/pages/bassett` is public): `./deploy-shopify-cli.sh bassett-live`  
  Script builds the Bassett bundle from source then pushes `color-flex-bassett.min.js`, template, and worker to the live theme.
- **Bassett shows only ColorFlex patterns** (standard patterns excluded) so thumbnail loads don’t depend on B2 CORS. When B2 CORS is fixed, this filter can be relaxed in `CFM.js` (BASSETT collection filter in `initializeApp`).
- **Default collection** on first load: Hip to Be Square. Curated colors bar is refreshed after initial pattern load so it appears on first load.

## **Emergency Troubleshooting:**
- **JavaScript not updating?** Check if you uploaded the `-bu.js` file to Shopify
- **Images not loading?** Run `./update` to sync server files  
- **Cart not working?** Check liquid templates in Shopify admin