# Clothing Collections - Complete Documentation

**Last Updated:** October 19, 2025
**Status:** CORRECTED after destructive changes

---

## Overview

Clothing collections allow patterns to be rendered on mannequin mockups (dress, pants suit, etc.) instead of room scenes. They use the existing furniture system infrastructure but with `isClothing: true` flag.

---

## Architecture

### Key Principle
**Clothing collections reuse the furniture rendering system.** They are NOT a separate system - they are furniture items with the `isClothing: true` flag.

### File Structure

```
data/
├── collections.json          # Pattern definitions (NO mockup fields!)
├── furniture-config.json     # Mockup definitions + isClothing flag
└── mockups/clothing/         # Mannequin images
    ├── dress-mannequin.png
    ├── dress-base.png
    ├── pants-suit-mannequin.png
    └── pants-suit-base.png
```

---

## Configuration Files

### 1. furniture-config.json

This is where clothing mockups are defined:

```json
{
  "clothing": {
    "name": "Clothing Dress",
    "thumbnail": "data/mockups/clothing/dress-mannequin.png",
    "mockup": "data/mockups/clothing/dress-mannequin.png",
    "base": "data/mockups/clothing/dress-base.png",
    "compatibleCollections": [
      "botanicals.clo-1",
      "bombay.clo-1",
      "traditions.clo-1",
      "folksie.clo-1",
      "geometry.clo-1",
      "ikats.clo-1"
    ],
    "isClothing": true,
    "description": "Clothing mockup with dress mannequin (CLO-1 collections)"
  },
  "clothing-pants": {
    "name": "Clothing Pants Suit",
    "mockup": "data/mockups/clothing/pants-suit-mannequin.png",
    "base": "data/mockups/clothing/pants-suit-base.png",
    "compatibleCollections": ["botanicals-clo2"],
    "isClothing": true,
    "description": "Clothing mockup with pants-suit mannequin (CLO-2 collections)"
  }
}
```

**Critical Fields:**
- `isClothing: true` - Marks this as a clothing mockup (not furniture)
- `compatibleCollections` - Lists which collections use this mockup
- `mockup` - Path to the mannequin image
- `base` - Path to the base layer (if needed)

### 2. collections.json

Clothing collections are defined like normal collections:

```json
{
  "name": "traditions.clo-1",
  "displayName": "Traditions (CLO-1)",
  "curatedColors": [...],
  "coordinates": null,
  "patterns": [
    {
      "name": "Rosehip",
      "slug": "rosehip",
      "thumbnail": "./data/collections/traditions/thumbnails/rosehip.jpg",
      "tilingType": "straight",
      "size": [24, 24],
      "layerLabels": ["Wreath", "Round Center", "Leaves", "Heart Flower"],
      "layers": [
        "./data/collections/traditions/layers/rosehip_wreath_layer-1.jpg",
        "./data/collections/traditions/layers/rosehip_round-center_layer-2.jpg",
        "./data/collections/traditions/layers/rosehip_leaves_layer-3.jpg",
        "./data/collections/traditions/layers/rosehip_heart-flower_layer-4.jpg"
      ]
    }
  ]
}
```

**Important:**
- NO `mockup` or `mockupImage` fields in collections.json
- `coordinates: null` (no coordinate patterns for clothing)
- `layers` paths point to regular JPG pattern layers
- Collection name includes `.clo-1` or `-clo2` suffix

---

## How It Works

### 1. Collection Detection (CFM.js lines 6336-6350)

```javascript
// Check if this is a clothing collection via furniture-config
const compatibleFurniture = getCompatibleFurnitureForCollection(selectedCollection.name);
const isClothingCollection = compatibleFurniture.some(f => f.config.isClothing);

if (isClothingCollection) {
    console.log("🎽 Clothing collection detected via furniture-config");
    // Hide scale controls
    document.getElementById('scaleControls').style.display = 'none';
    // Hide coordinates section
    document.getElementById('coordinatesSection').style.display = 'none';
}
```

**Process:**
1. App loads collection (e.g., "traditions.clo-1")
2. Calls `getCompatibleFurnitureForCollection("traditions.clo-1")`
3. Finds "clothing" furniture with `isClothing: true` in its `compatibleCollections`
4. Hides UI elements (scale controls, coordinates section)

### 2. Try Furniture Button (CFM.js lines 3878-3893)

The "Try Furniture" button is suppressed for clothing collections:

```javascript
// Skip Try Furniture button for clothing collections
const collectionName = currentCollection || appState.selectedCollection;
const isClothingCollection = collectionName && (
    collectionName.includes('.clo-1') ||
    collectionName.includes('-clo2') ||
    collectionName.includes('clo-1') ||
    collectionName.includes('clo2')
);

if (isClothingCollection) {
    console.log("🎽 Skipping Try Furniture button for clothing collection:", collectionName);
    return;
}
```

**Why:** Clothing collections render directly on the mockup - users don't click "Try Furniture" first.

### 3. Rendering

Clothing collections render using the same furniture rendering code but:
- No room scene background
- Patterns composite directly onto the mannequin
- No furniture controls (only color/layer controls)

---

## Adding New Clothing Collections

### Option A: New Collection (e.g., "ikats-clo3")

1. **Update furniture-config.json:**
```json
{
  "clothing-clo3": {
    "name": "Clothing Type 3",
    "mockup": "data/mockups/clothing/clo3-mannequin.png",
    "base": "data/mockups/clothing/clo3-base.png",
    "compatibleCollections": ["ikats-clo3", "bombay-clo3"],
    "isClothing": true,
    "description": "Third clothing mockup type"
  }
}
```

2. **Add to collections.json:**
```json
{
  "name": "ikats-clo3",
  "displayName": "Ikats (CLO-3)",
  "coordinates": null,
  "curatedColors": [...],
  "patterns": [...]
}
```

3. **Upload mockup images:**
- Upload `clo3-mannequin.png` to server
- Upload `clo3-base.png` to server

4. **No code changes needed!** The detection logic handles any collection with `.clo-#` or `-clo#` suffix.

### Option B: Add Existing Collection to Clothing

To make "bombay" work as "bombay-clo2":

1. **Update furniture-config.json:**
```json
{
  "clothing-pants": {
    "compatibleCollections": [
      "botanicals-clo2",
      "bombay-clo2"  // Add here
    ]
  }
}
```

2. **Clone collection in collections.json:**
```json
{
  "name": "bombay-clo2",
  "displayName": "Bombay (CLO-2)",
  "coordinates": null,
  "curatedColors": [...],  // Copy from "bombay"
  "patterns": [...]        // Copy from "bombay"
}
```

---

## Product Setup (Shopify)

### Product Title Format
Use " (Clothing)" suffix to distinguish from wallpaper versions:
- **Good:** "Rosehip (Clothing)"
- **Bad:** "Rosehip CLO-1" (collection type is internal, not customer-facing)

### Product Metafields
```
product.metafields.color_flex.collection = "traditions.clo-1"
product.metafields.color_flex.pattern = "rosehip"
```

### Product Tags
```
tags: "Traditions (CLO-1), pattern, clothing, custom-color, colorflex"
```

### URL Handling (main-product.liquid lines 1472-1474)
The " (Clothing)" suffix is stripped before passing to ColorFlex:
```javascript
const patternName = productData.productTitle
  .replace(/\s*(wallpaper|wall\s*paper)\s*/gi, '')
  .trim();
// Pattern "Rosehip (Clothing)" becomes "Rosehip" in ColorFlex URL
```

---

## Common Mistakes & Fixes

### ❌ WRONG: Adding mockup to CLOTHING collections in collections.json
```json
{
  "name": "traditions.clo-1",
  "mockup": "clothing",  // ❌ NO! Clothing collections get mockups from furniture-config
  "mockupImage": "..."   // ❌ NO!
}
```

**Fix:** Remove these fields from CLOTHING collections. They get mockups from furniture-config.json.

**IMPORTANT:** Regular ColorFlex collections (english-cottage, botanicals, etc.) DO need `mockup` fields for room scenes:
```json
{
  "name": "english-cottage",
  "mockup": "./data/mockups/English-Countryside-Bedroom-1-W60H40.png",  // ✅ YES! Regular collections need this
  ...
}
```

### ❌ WRONG: Checking collection.mockup in code
```javascript
if (selectedCollection.mockup) {  // ❌ Will always be falsy!
```

**Fix:** Check furniture-config via `getCompatibleFurnitureForCollection()`:
```javascript
const compatibleFurniture = getCompatibleFurnitureForCollection(selectedCollection.name);
const isClothingCollection = compatibleFurniture.some(f => f.config.isClothing);
```

### ❌ WRONG: Creating separate rendering code for clothing
Clothing uses the SAME furniture rendering system.

**Fix:** Set `isClothing: true` in furniture-config and let the existing code handle it.

---

## Testing Checklist

When adding/fixing clothing collections:

- [ ] Collection name includes `.clo-#` or `-clo#` suffix
- [ ] furniture-config.json has entry with `isClothing: true`
- [ ] Collection is in furniture config's `compatibleCollections` array
- [ ] collections.json has `coordinates: null`
- [ ] collections.json does NOT have `mockup` or `mockupImage` fields
- [ ] Mockup images exist on server
- [ ] Product has " (Clothing)" suffix in title
- [ ] Console shows "🎽 Clothing collection detected"
- [ ] Scale controls are hidden
- [ ] Coordinates section is hidden
- [ ] "Try Furniture" button does NOT appear
- [ ] Pattern renders on mannequin mockup
- [ ] Color changes update correctly

---

## Files Modified (Oct 19, 2025)

### Fixed Files:
1. **data/collections.json** - Removed incorrect mockup fields
2. **src/CFM.js** (lines 6336-6350) - Fixed UI hiding to use furniture-config
3. **src/assets/color-flex-core.min.js** - Rebuilt (222 KB)

### Upload to Shopify:
- `data/collections.json` → Shopify assets/collections.json
- `src/assets/color-flex-core.min.js` → Shopify assets/color-flex-core.min.js

---

## Support for Future Clothing Types

The system is designed to support unlimited clothing types:
- CLO-1: Dress mannequin (currently 6 collections)
- CLO-2: Pants suit mannequin (currently botanicals-clo2)
- CLO-3, CLO-4, etc.: Just add to furniture-config.json

**No CFM.js changes needed** - the detection logic handles all `-clo#` and `.clo-#` patterns automatically.

---

## Historical Notes

**October 16-19, 2025:** During attempts to add CLO-2, several destructive changes were made:
1. Added `mockup`/`mockupImage` to collections.json (incorrect)
2. Changed detection logic to check `selectedCollection.mockup` (incorrect)
3. Removed `coordinates` fields (was correct but reason was wrong)
4. Lost track of furniture-config.json as source of truth

**Corrected:** Detection now properly uses furniture-config.json via `getCompatibleFurnitureForCollection()`.

**Backup Created:** Before making future clothing changes, ALWAYS backup CFM.js:
```bash
cp src/CFM.js src/CFM.js.backup-$(date +%Y%m%d-%H%M%S)
```
