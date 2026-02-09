# Clothing Mode - Complete Documentation

**Last Updated**: January 6, 2026
**Status**: ✅ FULLY FUNCTIONAL - Ready for Production
**Latest Session**: `docs/session-summaries/SESSION_20260105_FINAL_clothing_mode_complete.md`

---

## 🎯 Overview

Clothing Mode allows users to customize fabric patterns and preview them on garments (dress, pantsuit) with realistic shadows and highlights. Users can switch between garments, adjust pattern scale, and see live previews with proper compositing.

---

## ✅ Current Features (All Working)

### Garment Selector
- **Location**: Above mockup preview
- **Options**: Dress | Pantsuit
- **Behavior**: Buttons highlight when active (blue background)
- **Function**: `window.selectGarment(garmentType)`
- **State**: Persists across pattern changes

### Scale Controls
- **Layout**: Horizontal: `PATTERN SCALE  −  1.25X  +`
- **Scales**: 1.0X, 1.25X, 1.5X, 2.0X
- **Behavior**: Increment/decrement buttons
- **State**: Persists across pattern changes
- **Functions**: `incrementClothingScale()`, `decrementClothingScale()`

### Pattern Rendering
- **Multi-scale**: Pre-rendered mockup layers at each scale
- **Garment-specific**: Separate layers for dress and pantsuit
- **Compositing**: Base → Pattern → Shadow → Gloss

### Visual Enhancements
- **Shadow overlay**: Multiply blend at configurable opacity (default: 1.0)
- **Gloss highlights**: Screen blend at configurable opacity (default: 0.25)
- **Garment-specific gloss**: `dress-gloss.png`, `pants-suit-gloss.png`

---

## 📁 File Structure

### Directory Layout
```
data/collections/botanicals-clo/
  layers/
    dress/
      pattern_layer-1_scale-1.0.png
      pattern_layer-1_scale-1.25.png
      pattern_layer-1_scale-1.5.png
      pattern_layer-1_scale-2.0.png
    pantsuit/
      pattern_layer-1_scale-1.0.png
      pattern_layer-1_scale-1.25.png
      pattern_layer-1_scale-1.5.png
      pattern_layer-1_scale-2.0.png
  thumbnails/
    pattern.jpg

data/mockups/clothing/
  dress-gloss.png         # 320KB - Highlights for dress
  pants-suit-gloss.png    # 282KB - Highlights for pantsuit
  dress-base.png          # Base mockup (optional)
  pantsuit-base.png       # Base mockup (optional)
```

---

## 🎨 Collections.json Structure

### Pattern Entry
```json
{
  "name": "botanicals.clo-1",
  "displayName": "Botanicals (Clothing)",
  "mode": "CLOTHING",
  "patterns": [
    {
      "name": "Botanical Stems",
      "slug": "botanical-stems",
      "colorFlex": true,
      "tilingType": "straight",
      "layerLabels": ["Silhouettes"],
      "layers": ["./data/collections/botanicals/layers/pattern_layer-1.jpg"],
      "mockupLayers": {
        "dress": {
          "1.0": ["./data/collections/botanicals-clo/layers/dress/pattern_layer-1_scale-1.0.png"],
          "1.25": ["./data/collections/botanicals-clo/layers/dress/pattern_layer-1_scale-1.25.png"],
          "1.5": ["./data/collections/botanicals-clo/layers/dress/pattern_layer-1_scale-1.5.png"],
          "2.0": ["./data/collections/botanicals-clo/layers/dress/pattern_layer-1_scale-2.0.png"]
        },
        "pantsuit": {
          "1.0": ["./data/collections/botanicals-clo/layers/pantsuit/pattern_layer-1_scale-1.0.png"],
          "1.25": ["./data/collections/botanicals-clo/layers/pantsuit/pattern_layer-1_scale-1.25.png"],
          "1.5": ["./data/collections/botanicals-clo/layers/pantsuit/pattern_layer-1_scale-1.5.png"],
          "2.0": ["./data/collections/botanicals-clo/layers/pantsuit/pattern_layer-1_scale-2.0.png"]
        }
      },
      "thumbnail": "./data/collections/botanicals/thumbnails/pattern.jpg"
    }
  ]
}
```

**Key Points:**
- **mockupLayers**: Nested object `{garment: {scale: [layers]}}`
- **layers**: Original JPG layers for pattern preview (not used in mockup rendering)
- **slug**: Used for pattern lookup (NOT `.id`)

---

## 💻 Code Implementation

### Garment Selector (`src/CFM.js` lines 2841-2866)

```javascript
window.selectGarment = function(garmentType) {
    console.log(`👗 Selecting garment: ${garmentType}`);

    // Update appState
    appState.selectedGarment = garmentType;

    // Update button states
    const buttons = document.querySelectorAll('.garment-button');
    buttons.forEach(btn => {
        const btnGarment = btn.getAttribute('data-garment');
        if (btnGarment === garmentType) {
            btn.style.background = '#4a90e2';
            btn.style.color = 'white';
        } else {
            btn.style.background = '#e2e8f0';
            btn.style.color = '#2d3748';
        }
    });

    // Reload current pattern with new garment
    if (appState.currentPattern && appState.selectedCollection) {
        loadPatternData(appState.selectedCollection, appState.currentPattern.slug);
    }

    console.log(`✅ Switched to ${garmentType}`);
};
```

### Compositing Controls (`src/CFM.js` lines 14357-14363)

```javascript
// ========================================
// CLOTHING MODE COMPOSITING CONTROLS
// Edit these values to adjust shadow and gloss intensity
// ========================================
const CLOTHING_SHADOW_OPACITY = 1.0;    // Shadow strength: 0.0 (invisible) to 1.0 (full)
const CLOTHING_GLOSS_OPACITY = 0.25;    // Gloss/highlight strength: 0.0 (no gloss) to 1.0 (full gloss)
                                         // Typical range: 0.15-0.35 for realistic fabric highlights
```

**How to Adjust:**
1. Edit values at lines 14361-14362 in `src/CFM.js`
2. Rebuild: `npm run build:clothing`
3. Deploy: `./deploy-shopify-cli.sh clothing`

**Typical Ranges:**
- **Shadow**: 0.6-1.0 (1.0 = full strength, 0.7 = softer shadows)
- **Gloss**: 0.15-0.35 (0.15 = subtle, 0.25 = moderate, 0.35 = strong)

### Shadow Implementation (`src/CFM.js` line 14575)

```javascript
// Composite the masked shadow onto main canvas with multiply blend
ctx.globalCompositeOperation = "multiply";
ctx.globalAlpha = CLOTHING_SHADOW_OPACITY;
ctx.drawImage(shadowCanvas, 0, 0, canvasWidth, canvasHeight);
ctx.globalAlpha = 1.0; // Reset alpha
ctx.globalCompositeOperation = "source-over"; // Reset

console.log(`✅ Shadow overlay applied (opacity: ${CLOTHING_SHADOW_OPACITY}, multiply blend)`);
```

### Gloss Implementation (`src/CFM.js` line 14606)

```javascript
// Map garment names: "dress" → "dress-gloss.png", "pantsuit" → "pants-suit-gloss.png"
const glossFileName = selectedGarment === 'pantsuit' ? 'pants-suit-gloss.png' : `${selectedGarment}-gloss.png`;
const glossPath = `data/mockups/clothing/${glossFileName}`;

console.log(`🔍 Loading gloss layer from: ${glossPath}`);

const glossImg = new Image();
glossImg.crossOrigin = "anonymous";

await new Promise((resolve, reject) => {
    glossImg.onload = resolve;
    glossImg.onerror = reject;
    glossImg.src = `https://so-animation.com/colorflex/${glossPath}`;
});

// Apply gloss layer with screen blend mode
ctx.globalCompositeOperation = "screen";
ctx.globalAlpha = CLOTHING_GLOSS_OPACITY;
ctx.drawImage(glossImg, 0, 0, canvasWidth, canvasHeight);

// Reset alpha and composite operation
ctx.globalAlpha = 1.0;
ctx.globalCompositeOperation = "source-over";

console.log(`✅ Gloss layer applied (opacity: ${CLOTHING_GLOSS_OPACITY}, screen blend)`);
```

---

## 🎨 Template Implementation

### Garment Selector (`src/templates/page.colorflex-clothing.liquid` line 550+)

```html
<div id="garmentSelector" style="display: flex; align-items: center; justify-content: center; gap: 0.75rem; margin-bottom: 1rem;">
  <span style="font-size: 0.85rem; font-weight: 600; color: white; text-transform: uppercase;">Garment:</span>
  <button onclick="window.selectGarment('dress')" data-garment="dress" class="garment-button"
          style="padding: 0.4rem 1rem; background: #4a90e2; color: white; border: none; border-radius: 4px; font-size: 0.85rem; font-weight: 600; cursor: pointer;">
    Dress
  </button>
  <button onclick="window.selectGarment('pantsuit')" data-garment="pantsuit" class="garment-button"
          style="padding: 0.4rem 1rem; background: #e2e8f0; color: #2d3748; border: none; border-radius: 4px; font-size: 0.85rem; font-weight: 600; cursor: pointer;">
    Pantsuit
  </button>
</div>
```

### Scale Controls (`src/templates/page.colorflex-clothing.liquid` line 565+)

```html
<div id="scaleControls" style="display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: center !important; gap: 1rem !important; margin-top: 0.75rem !important;">
  <span style="font-size: 0.9rem; font-weight: 600; color: white; text-transform: uppercase; letter-spacing: 0.5px;">Pattern Scale</span>
  <button onclick="decrementClothingScale()"
          style="width: 32px; height: 32px; border-radius: 50%; background: #4a90e2; color: white; border: none; font-size: 1.2rem; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center;">
    −
  </button>
  <span id="currentScaleDisplay" style="min-width: 60px; text-align: center; font-weight: 600; color: white;">1.0X</span>
  <button onclick="incrementClothingScale()"
          style="width: 32px; height: 32px; border-radius: 50%; background: #4a90e2; color: white; border: none; font-size: 1.2rem; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center;">
    +
  </button>
</div>
```

---

## 🛠️ Build & Deployment

### Build Command
```bash
npm run build:clothing
```

**Output**: `src/assets/color-flex-clothing.min.js` (~270 KB)

### Deploy Command
```bash
./deploy-shopify-cli.sh clothing
```

**Deploys:**
1. `color-flex-clothing.min.js` → Shopify assets/
2. `page.colorflex-clothing.liquid` → Shopify templates/

### Testing
**Test URL**: `https://saffroncottage.shop/pages/colorflex-clothing`

**Verify:**
- ✅ Garment selector buttons above mockup
- ✅ "Dress" highlighted by default (blue background)
- ✅ Clicking "Pantsuit" switches mockup and highlights pantsuit button
- ✅ Scale controls horizontal layout: `PATTERN SCALE  −  1.25X  +`
- ✅ All text white and readable
- ✅ Gloss layer adds realistic sheen
- ✅ Console shows: `✅ Gloss layer applied (opacity: 0.25, screen blend)`

---

## 🐛 Troubleshooting

### Issue: Pattern not found errors
**Check**: Console shows pattern slug being used
**Fix**: Ensure using `pattern.slug` (not `.id`) in loadPatternData calls

### Issue: Wrong gloss file loads
**Check**: Console shows: `🔍 Loading gloss layer from: data/mockups/clothing/[file]`
**Fix**: Verify gloss files exist on server:
```bash
curl -I https://so-animation.com/colorflex/data/mockups/clothing/dress-gloss.png
curl -I https://so-animation.com/colorflex/data/mockups/clothing/pants-suit-gloss.png
```

### Issue: Scale controls stacked vertically
**Check**: Browser console for CSS errors
**Fix**: Clear cache (Cmd+Shift+R), verify template deployed with `!important` flags

### Issue: Text too dark to read
**Check**: Inspect element, verify `color: white` in styles
**Fix**: Redeploy template, clear browser cache

### Issue: Shadow/gloss too strong or weak
**Fix**: Edit constants (lines 14361-14362), rebuild, deploy

---

## 🎓 Architecture Decisions

### Why Single Collection with Garment Switcher?

**✅ Benefits:**
- Intuitive UX: Stay in collection, change garment view
- Single source of truth per pattern
- Easy to add new garments (just add subdirectory)
- Garment preference persists across patterns

**❌ Rejected Alternative:**
- Two separate collections (botanicals.clo-1 for dress, botanicals.clo-2 for pantsuit)
- Problems: Duplicate entries, confusing navigation, harder maintenance

### Why Nested mockupLayers Structure?

**Structure**: `{garment: {scale: [layers]}}`

**Benefits:**
- Supports multiple garments without code changes
- Clean separation of concerns
- Scalable to additional garments (hoodie, t-shirt, etc.)
- Mirrors multi-scale pattern used in wallpaper mode

---

## 🔄 Blender Rendering Workflow

### Render All Clothing Collections
```bash
cd src/blender
./render-all-clo2.sh
```

**Output**: Generates PNG layers at 4 scales for each garment

### Update Collections.json
```bash
python3 update-clo2-collection.py botanicals
```

**Creates**: Nested mockupLayers structure with all garments and scales

### Deploy to Server
```bash
./deploy-clo2-collections.sh botanicals
# Or deploy all:
./deploy-clo2-collections.sh all
```

---

## 📊 Performance Metrics

**Build Time**: ~2.4 seconds
**File Size**: ~270 KB (within acceptable range)
**Load Time**: No significant impact (compositing done client-side)
**Browser Compatibility**: All modern browsers (Canvas API)

---

## 🚀 Future Enhancements (Optional)

1. **UI Sliders** - Live adjustment of shadow/gloss opacity
2. **More Garments** - Add coat, skirt, hoodie, t-shirt
3. **Front/Back Views** - Toggle garment orientation
4. **Texture Variations** - Different fabric base textures (linen, velvet, etc.)
5. **Pattern Rotation** - Allow 90° rotation of patterns

---

## 📚 Related Documentation

- **SESSION_20260105_FINAL_clothing_mode_complete.md** - Latest session with all fixes
- **GARMENT_SELECTOR_IMPLEMENTATION.md** - Original garment selector architecture
- **MULTI_VERSION_IMPLEMENTATION.md** - Multi-mode system (wallpaper, furniture, clothing)
- **ARCHITECTURE.md** - System-wide architecture and deployment rules

---

_Last Updated: January 6, 2026_
_Status: Production-Ready_
