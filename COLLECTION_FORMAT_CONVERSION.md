# Collection Format Conversion Guide

## Problem Statement

The **standard furniture page** (`colorflex-furniture`) expects collections to use the **old single-scale array format** (like Folksie and Coverlets), while newer collections (Farmhouse, Geometry) use the **nested multi-resolution format** which is only compatible with the **furniture-simple page**.

**Important Naming Convention:**
- **"mockup"** = images for the mockup preview container (furniture/room preview)
- **"pattern"** = images for the pattern preview (fabric/pattern layers)
- `mockupLayers` refers to mockup preview images, NOT pattern layers

## Format Comparison

### ✅ Working Format (Folksie, Coverlets) - Standard Furniture Page

```json
{
  "name": "folksie.fur-1",
  "patterns": [
    {
      "name": "Cherie Cherie",
      "mockupLayers": [
        "./data/furniture/sofa-capitol/patterns/folksie/cherie-cherie/cherie-cherie_texture_layer-1.png",
        "./data/furniture/sofa-capitol/patterns/folksie/cherie-cherie/cherie-cherie_cherries_layer-2.png",
        "./data/furniture/sofa-capitol/patterns/folksie/cherie-cherie/cherie-cherie_leaves_layer-3.png",
        "./data/furniture/sofa-capitol/patterns/folksie/cherie-cherie/cherie-cherie_design_layer-4.png"
      ]
    }
  ]
}
```

**Key characteristics:**
- `mockupLayers` is an **array of strings** (file paths to mockup preview images)
- These are images for the mockup preview container (furniture/room), NOT pattern layers
- Paths are **relative** (start with `./data/...`)
- **Single scale only** (typically 1.0X equivalent)
- Works with **standard furniture page** (`colorflex-furniture`)

### ❌ Not Working Format (Farmhouse, Geometry) - Multi-Resolution Format

```json
{
  "name": "farmhouse.fur-1",
  "patterns": [
    {
      "name": "A Little Birdie Told Me",
      "mockupLayers": {
        "Sofa-Capitol": {
          "0.5": [
            {
              "path": "https://so-animation.com/colorflex/data/collections/farmhouse-fur/layers/Sofa-Capitol/a-little-birdie-told-me_pattern_layer-1_scale-0.5.png",
              "label": "Pattern",
              "index": 1
            }
          ],
          "1.0": [
            {
              "path": "https://so-animation.com/colorflex/data/collections/farmhouse-fur/layers/Sofa-Capitol/a-little-birdie-told-me_pattern_layer-1_scale-1.0.png",
              "label": "Pattern",
              "index": 1
            }
          ],
          "1.25": [...],
          "1.5": [...],
          "2.0": [...]
        },
        "Sofa-Kite": {
          "0.5": [...],
          "1.0": [...],
          ...
        }
      }
    }
  ]
}
```

**Key characteristics:**
- `mockupLayers` is a **nested object** with furniture types and scales
- These are images for the mockup preview container (furniture/room), NOT pattern layers
- Paths are **absolute URLs** (start with `https://...`)
- **Multiple scales** (0.5, 1.0, 1.25, 1.5, 2.0)
- **Multiple furniture types** (Sofa-Capitol, Sofa-Kite)
- Only works with **furniture-simple page** (`colorflex-furniture-simple`)

## Conversion Process

To convert a multi-resolution collection to the standard format:

### Step 1: Extract 1.0 Scale Mockup Layers

For each pattern, extract the `"1.0"` scale mockup layers from `"Sofa-Capitol"`:
Note: These are mockup preview images (furniture/room), NOT pattern layers

```javascript
// From multi-res format:
const multiResLayers = pattern.mockupLayers["Sofa-Capitol"]["1.0"];

// Extract just the paths:
const standardLayers = multiResLayers.map(layer => layer.path);
```

### Step 2: Convert URLs to Relative Paths

Convert absolute URLs to relative paths:

```javascript
// From: "https://so-animation.com/colorflex/data/collections/farmhouse-fur/layers/Sofa-Capitol/..."
// To:   "./data/collections/farmhouse-fur/layers/Sofa-Capitol/..."

function convertUrlToRelative(url) {
  // Remove domain and protocol
  const match = url.match(/\/data\/.*$/);
  if (match) {
    return "." + match[0];
  }
  return url;
}
```

### Step 3: Create Standard Format

Replace the nested `mockupLayers` object with a simple array:

```json
{
  "mockupLayers": [
    "./data/collections/farmhouse-fur/layers/Sofa-Capitol/a-little-birdie-told-me_pattern_layer-1_scale-1.0.png"
  ]
}
```

## Collections Status

### ✅ Working (Standard Format)
- `folksie.fur-1` - Uses array format
- `coverlets.fur-1` - Uses array format

### ❌ Needs Conversion (Multi-Res Format)
- `farmhouse.fur-1` - Needs conversion to array format
- `geometry.fur-1` - Needs conversion to array format
- (Other collections with nested `mockupLayers`)

## Implementation Notes

1. **Standard furniture page** (`colorflex-furniture`) expects:
   - `mockupLayers` as an array of strings
   - Relative paths starting with `./data/...`
   - Single scale (typically 1.0X)

2. **Furniture-simple page** (`colorflex-furniture-simple`) expects:
   - `mockupLayers` as nested object with scales
   - Can handle both relative and absolute URLs
   - Multiple scales and furniture types

3. **Both formats can coexist** in `collections.json`:
   - Collections with array format → standard furniture page
   - Collections with nested format → furniture-simple page
   - The code in `updateFurniturePreview()` detects the format and routes accordingly

## Related Scripts

### `update-collection.sh`
Located at: `/Volumes/K3/jobs/colorflex2/update-collection.sh`

This script is used to update collections from Airtable. It:
- Fetches data from Airtable using `src/scripts/cf-dl.js`
- Downloads images
- Generates Shopify CSV files
- Deploys to server
- Uploads `collections.json` to Shopify assets

**Usage:**
```bash
./update-collection.sh complete <collection-name>    # Full update
./update-collection.sh metadata <collection-name>    # Data only
./update-collection.sh images <collection-name>      # Images only
```

### `deploy-shopify-cli.sh`
Located at: `/Volumes/K3/jobs/colorflex2/deploy-shopify-cli.sh`

This script deploys assets to Shopify using the Shopify CLI:
- Uploads minified JS files
- Uploads `collections.json` to Shopify assets
- Deploys templates and sections

**Usage:**
```bash
./deploy-shopify-cli.sh data        # Upload collections.json
./deploy-shopify-cli.sh assets      # Upload JS files
./deploy-shopify-cli.sh furniture   # Deploy furniture mode
```

## Conversion Process

To convert a multi-resolution collection to the standard format:

### Step 1: Identify Collections Needing Conversion

Check `collections.json` for collections with nested `mockupLayers`:
```bash
# Search for collections with nested mockupLayers structure
grep -A 5 '"mockupLayers": {' data/collections.json | grep -B 5 '"Sofa-Capitol"'
```

### Step 2: Extract 1.0 Scale Layers

For each pattern, extract the `"1.0"` scale layers from `"Sofa-Capitol"`:

```javascript
// From multi-res format:
const multiResLayers = pattern.mockupLayers["Sofa-Capitol"]["1.0"];

// Extract just the paths:
const standardLayers = multiResLayers.map(layer => layer.path);
```

### Step 3: Convert URLs to Relative Paths

Convert absolute URLs to relative paths:

```javascript
// From: "https://so-animation.com/colorflex/data/collections/farmhouse-fur/layers/Sofa-Capitol/..."
// To:   "./data/collections/farmhouse-fur/layers/Sofa-Capitol/..."

function convertUrlToRelative(url) {
  // Remove domain and protocol
  const match = url.match(/\/data\/.*$/);
  if (match) {
    return "." + match[0];
  }
  return url;
}
```

### Step 4: Update collections.json

Manually edit `collections.json` or create a conversion script to:
1. Find all patterns with nested `mockupLayers`
2. Extract `"1.0"` scale from `"Sofa-Capitol"`
3. Convert URLs to relative paths
4. Replace nested object with simple array

### Step 5: Deploy Updated collections.json

After conversion, deploy the updated file:
```bash
# Copy to src/assets/ for Shopify upload
cp data/collections.json src/assets/collections.json

# Deploy to Shopify
./deploy-shopify-cli.sh data --yes
```

### Step 6: Test on Standard Furniture Page

Test the converted collections at:
- `https://saffroncottage.shop/pages/colorflex-furniture`
- Verify collections load correctly
- Verify patterns render with correct layers

## Automated Script

### `build-furniture-mockup-layers.js`
Located at: `/Volumes/K3/jobs/colorflex2/scripts/build-furniture-mockup-layers.js`

This script scans the file system and automatically builds `mockupLayers` entries for furniture collections. It can generate:
- **Standard format** (array of strings) - for `colorflex-furniture` page
- **Multi-resolution format** (nested object) - for `colorflex-furniture-simple` page
- **Both formats** - detects which format is available and uses it

**Usage:**
```bash
# Build both formats (auto-detect)
node scripts/build-furniture-mockup-layers.js

# Build standard format only
node scripts/build-furniture-mockup-layers.js --format=standard

# Build multi-res format only
node scripts/build-furniture-mockup-layers.js --format=multi-res

# Process specific collection
node scripts/build-furniture-mockup-layers.js --collection=farmhouse

# Dry run (see what would be generated)
node scripts/build-furniture-mockup-layers.js --dry-run

# Custom output file
node scripts/build-furniture-mockup-layers.js --output=data/collections-updated.json
```

**How it works:**
1. Scans `data/collections/` and `data/furniture/` directories
2. Looks for furniture mockup layer files (PNG files for mockup preview, NOT pattern layers)
3. Detects file structure:
   - Standard: `data/furniture/sofa-capitol/patterns/{collection}/{pattern}/*.png` (mockup preview images)
   - Multi-res: `data/collections/{collection}-fur/layers/{furnitureType}/*_scale-{scale}.png` (mockup preview images at different scales)
4. Generates appropriate `mockupLayers` structure (mockup preview images)
5. Updates `collections.json` with generated entries

**File Structure Detection:**
- **Standard format**: Looks for files in `data/furniture/sofa-capitol/patterns/{collection}/{pattern}/`
- **Multi-res format**: Looks for files with `_scale-{scale}` in filename
- Automatically sorts layers by layer number if present in filename

## Next Steps

1. ✅ **Documentation Complete** - This guide explains the format differences
2. ✅ **Conversion Script Created** - `build-furniture-mockup-layers.js` automates the process
3. ⏳ **Run Script** - Execute script to scan file system and build entries
4. ⏳ **Review Generated Entries** - Check that generated `mockupLayers` are correct
5. ⏳ **Test Standard Furniture Page** - Verify all collections work
6. ⏳ **Deploy to Shopify** - Upload updated `collections.json`
