# Furniture Tweaking Guide

## Wall Mask Blend Mode

**Location:** `src/CFM.js` line **14974**

**Current setting:**
```javascript
blendMode: "source-over",  // Line 14974
```

**To change to "screen" (lightens):**
```javascript
blendMode: "screen",  // Lightens - good for lighter wall colors
```

**To change to "lighten" (picks lighter of two colors):**
```javascript
blendMode: "lighten",  // Picks lighter color between wall and background
```

**Other blend mode options:**
- `"multiply"` - Darkens (opposite of screen)
- `"overlay"` - Combines multiply and screen
- `"soft-light"` - Softer version of overlay
- `"hard-light"` - Stronger version of overlay
- `"color-dodge"` - Very bright effect
- `"color-burn"` - Very dark effect

**Note:** The wall mask is applied as the final layer (STEP 5) in `updateFurniturePreview()`.

---

## Image Positioning

**Location:** `src/CFM.js` lines **8473-8476** in `drawFurnitureLayer()` function

**Current settings:**
```javascript
// Horizontal position (centered by default)
let drawX = (renderWidth / 2) - (scaledWidth / 2) + (offsetX * renderScale);

// Vertical position (centered with 15% upward shift for furniture)
const verticalOffset = isSimpleModeRender && window.COLORFLEX_MODE === 'FURNITURE' ? -(renderHeight * 0.15) : 0;
let drawY = (renderHeight / 2) - (scaledHeight / 2) + (offsetY * renderScale) + verticalOffset;
```

### To adjust vertical position:
Change the `0.15` value on **line 8475**:
- **Negative values** = shift UP (show more bottom)
- **Positive values** = shift DOWN (show more top)
- **0.15** = 15% of canvas height upward
- **0.20** = 20% upward (more bottom visible)
- **0.10** = 10% upward (less bottom visible)

**Example - shift up more (20%):**
```javascript
const verticalOffset = isSimpleModeRender && window.COLORFLEX_MODE === 'FURNITURE' ? -(renderHeight * 0.20) : 0;
```

**Example - shift down (5%):**
```javascript
const verticalOffset = isSimpleModeRender && window.COLORFLEX_MODE === 'FURNITURE' ? (renderHeight * 0.05) : 0;
```

### To adjust horizontal position:
Modify the `drawX` calculation on **line 8473**:
- Add/subtract pixels: `+ 50` (shift right) or `- 50` (shift left)
- Or use percentage: `+ (renderWidth * 0.1)` (10% right)

**Example - shift right 50px:**
```javascript
let drawX = (renderWidth / 2) - (scaledWidth / 2) + (offsetX * renderScale) + 50;
```

### Important Notes:
- **Positioning is done on the CANVAS**, not the container
- The container (`#roomMockup`) is 800x600 and uses `overflow: visible`
- All layers (mockup, patterns, wall mask) use the same `drawX`/`drawY` positioning
- The `verticalOffset` only applies to furniture simple mode

---

## Quick Reference

| What to Change | File | Line | Current Value |
|---------------|------|------|---------------|
| Wall mask blend mode | `src/CFM.js` | 14974 | `"source-over"` |
| Vertical image position | `src/CFM.js` | 8475 | `-0.15` (15% up) |
| Horizontal image position | `src/CFM.js` | 8473 | Centered |

---

## Testing Changes

After making changes:
1. Save the file
2. Run: `./scripts/build-backup-deploy.sh furniture-simple "Your change description"`
3. Test on the Extraordinary Color Furniture page
