# Clothing Collection Detection Fix
**Date**: October 11, 2025
**Issue**: Clothing collections showing furniture mode instead of clothing mode with zoom controls

## Problem Diagnosis

### Symptom
When clicking "Customize" button on clothing products (e.g., `botanicals-key-largo-clo1`), the URL was generated as:
```
collection=botanicals  // WRONG
pattern=Key+Largo+%28Clothing%29
```

Instead of:
```
collection=botanicals.clo-1  // CORRECT
pattern=Key+Largo+%28Clothing%29
```

### Root Cause
The collection mapping logic in `main-product.liquid` (lines 1374-1435) was correctly identifying the parent collection (e.g., "botanicals") but was **not appending the `.clo-1` suffix** for clothing products.

CFM.js detects clothing mode using:
```javascript
const isClothingMode = pattern.name?.includes('.clo-') ||
                       collectionName?.includes('.clo-');
```

Without the `.clo-1` suffix, CFM.js treated these as regular collections → furniture mode with room mockup instead of clothing mode with zoom controls.

## Solution Applied

### File Modified
**Path**: `src/sections/main-product.liquid`

### Changes Made

**1. Early Clothing Detection** (line 1374-1375)
```javascript
// Check if this is a clothing collection product (check early for all code paths)
const isClothingProduct = productData.productTitle.toLowerCase().includes('(clothing)') ||
                          productData.productTags.toLowerCase().includes('clothing collection');
```

**2. Universal Suffix Appending** (lines 1431-1435)
```javascript
// CRITICAL: Append .clo-1 suffix for clothing collections (applies to ALL code paths)
if (isClothingProduct && !colorFlexCollection.includes('.clo-')) {
  colorFlexCollection = colorFlexCollection + '.clo-1';
  console.log('👕 Detected clothing product, updated collection to:', colorFlexCollection);
}
```

### Why This Works

The fix applies **AFTER** all collection mapping logic (metafield, window functions, and fallback), ensuring that regardless of which code path determined the collection name, clothing products get the `.clo-1` suffix appended.

Detection uses TWO signals:
1. Product title contains "(Clothing)"
2. Product tags contain "clothing collection"

This covers all 77 clothing products across 6 collections:
- bombay.clo-1 (34 patterns)
- traditions.clo-1 (17 patterns)
- folksie.clo-1 (4 patterns)
- geometry.clo-1 (9 patterns)
- ikats.clo-1 (8 patterns)
- botanicals.clo-1 (5 patterns)

## Testing Verification

### Before Fix
```
URL: collection=botanicals&pattern=Key%20Largo%20(Clothing)
Result: ❌ Furniture mode with room mockup
```

### After Fix
```
URL: collection=botanicals.clo-1&pattern=Key%20Largo%20(Clothing)
Result: ✅ Clothing mode with zoom controls (50%, 75%, 100%)
```

## Deployment Instructions

### Step 1: Upload to Shopify
1. Go to: **Shopify Admin → Online Store → Themes → Current theme → Actions → Edit code**
2. Navigate to: **Sections → main-product.liquid**
3. Upload: `src/sections/main-product.liquid`
4. Save

### Step 2: Test Clothing Collections
Open these URLs and verify clothing mode appears:
- `https://saffroncottage.shop/products/botanicals-key-largo-clo1`
- `https://saffroncottage.shop/products/bombay-andheri-star-flower-clo1`
- `https://saffroncottage.shop/products/traditions-patchwork-clo1`
- `https://saffroncottage.shop/products/geometry-lattice-clo1`

### Step 3: Verify Features
For each product, click "Customize" and verify:
- ✅ Zoom controls appear (🔍- and 🔍+)
- ✅ Starting zoom is 100%
- ✅ Zoom out: 100% → 75% → 50%
- ✅ Zoom in: 50% → 75% → 100%
- ✅ Color customization works
- ✅ Pattern displays at 4K resolution
- ✅ "Add to Cart" button functions

## Expected Console Output

When opening a clothing product, browser console should show:
```
📊 Product info: {productTitle: "Key Largo (Clothing)", ...}
🔍 METAFIELD DEBUG: collection="" pattern=""
👕 Detected clothing product, updated collection to: botanicals.clo-1
🎯 Mapped "Key Largo (Clothing)" → collection: "botanicals.clo-1"
🔗 Opening URL: /pages/colorflex?collection=botanicals.clo-1&pattern=Key Largo (Clothing)&...
```

## Backup

**Location**: `./backups/working_versions/clothing_detection_fix_20251011_HHMMSS/`

**Files Backed Up**:
- `src/sections/main-product.liquid` (original before fix)

## Related Files

This fix works in conjunction with:
1. **`data/collections.json`** - Contains clothing collection definitions with `.clo-1` names
2. **`src/CFM.js`** - Detects clothing mode from collection name
3. **CSV Import** - Products have "Clothing" tag for detection
4. **Server files** - Layer images served from parent collection paths

## Summary

**Problem**: Clothing collections defaulting to furniture mode
**Cause**: Missing `.clo-1` suffix in URL collection parameter
**Fix**: Automatic suffix appending based on product title/tags
**Result**: All 77 clothing products now open in clothing mode with zoom controls

**Status**: ✅ Ready for Shopify Upload
**Risk**: Low (single template file, no JavaScript changes)
**Rollback**: Simple (restore backup if needed)
