# Clothing Mode Architecture: Single Collection with Garment Switcher

**Date**: December 26, 2025
**Status**: ✅ RECOMMENDED APPROACH

## Decision: One Collection vs Two Collections

### ❌ Rejected Approach: Two Separate Collections
```
Collections:
- botanicals.clo-1 (pantsuit/winter)
- botanicals.clo-2 (dress)

Problems:
- User must switch collections to see same pattern on different garment
- Duplicate pattern entries in collections.json
- More complex navigation (collection switcher instead of garment switcher)
- Harder to maintain consistency across garment versions
```

### ✅ Recommended Approach: Single Collection with Garment Switcher
```
Collection:
- botanicals.clo (one collection)

UI Features:
- Garment switcher buttons: [Dress] [Pantsuit]
- Same pattern, different garment mockups
- Seamless switching without losing pattern/color state

Benefits:
- Intuitive user experience (stay in collection, change garment)
- Single source of truth per pattern
- Easier maintenance and updates
- Natural workflow: customize pattern → preview on different garments
```

---

## File Structure

### Directory Layout
```
data/collections/botanicals-clo/
  layers/
    dress/
      botanical-stems_silhouettes_layer-1_scale-1.0.png
      botanical-stems_silhouettes_layer-1_scale-1.1.png
      botanical-stems_silhouettes_layer-1_scale-1.2.png
      botanical-stems_silhouettes_layer-1_scale-1.3.png
      manifest_botanical-stems.json
    pantsuit/
      botanical-stems_silhouettes_layer-1_scale-1.0.png
      botanical-stems_silhouettes_layer-1_scale-1.1.png
      botanical-stems_silhouettes_layer-1_scale-1.2.png
      botanical-stems_silhouettes_layer-1_scale-1.3.png
      manifest_botanical-stems.json
  thumbnails/
    botanical-stems.jpg
```

### Garment Subdirectories
- **dress/**: Rendered with dress-fabric-ready2.blend, "dress" object
- **pantsuit/**: Rendered with dress-fabric-girl-base2.blend, "winter2" object

---

## Collections.json Structure

### Pattern Entry
```json
{
  "name": "botanicals.clo",
  "displayName": "Botanicals (Clothing)",
  "mode": "CLOTHING",
  "patterns": [
    {
      "name": "botanical-stems",
      "slug": "botanical-stems",
      "displayName": "Botanical Stems",
      "colorFlex": true,
      "tilingType": "straight",
      "layerLabels": ["Silhouettes"],
      "layers": ["./data/collections/botanicals/layers/botanical-stems_silhouettes_layer-1.jpg"],
      "mockupLayers": {
        "dress": {
          "1.0": ["./data/collections/botanicals-clo/layers/dress/botanical-stems_silhouettes_layer-1_scale-1.0.png"],
          "1.1": ["./data/collections/botanicals-clo/layers/dress/botanical-stems_silhouettes_layer-1_scale-1.1.png"],
          "1.2": ["./data/collections/botanicals-clo/layers/dress/botanical-stems_silhouettes_layer-1_scale-1.2.png"],
          "1.3": ["./data/collections/botanicals-clo/layers/dress/botanical-stems_silhouettes_layer-1_scale-1.3.png"]
        },
        "pantsuit": {
          "1.0": ["./data/collections/botanicals-clo/layers/pantsuit/botanical-stems_silhouettes_layer-1_scale-1.0.png"],
          "1.1": ["./data/collections/botanicals-clo/layers/pantsuit/botanical-stems_silhouettes_layer-1_scale-1.1.png"],
          "1.2": ["./data/collections/botanicals-clo/layers/pantsuit/botanical-stems_silhouettes_layer-1_scale-1.2.png"],
          "1.3": ["./data/collections/botanicals-clo/layers/pantsuit/botanical-stems_silhouettes_layer-1_scale-1.3.png"]
        }
      },
      "thumbnail": "./data/collections/botanicals/thumbnails/botanical-stems.jpg",
      "designer_colors": [...]
    }
  ]
}
```

---

## UI Implementation

### Garment Switcher Buttons
**Location**: Clothing page sidebar or top controls

```html
<div class="garment-switcher">
  <button class="garment-btn active" data-garment="dress">Dress</button>
  <button class="garment-btn" data-garment="pantsuit">Pantsuit</button>
</div>
```

### JavaScript Logic (CFM.js)
```javascript
// Application state
appState.selectedGarment = 'dress'; // Default garment

// Garment switcher handler
function switchGarment(garmentName) {
    console.log(`🎭 Switching to garment: ${garmentName}`);

    // Update state
    appState.selectedGarment = garmentName;

    // Update active button styling
    document.querySelectorAll('.garment-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.garment === garmentName);
    });

    // Re-render mockup with new garment layers
    updateClothingMockup();
}

// Updated mockup rendering
function updateClothingMockup() {
    const pattern = appState.selectedPattern;
    const garment = appState.selectedGarment || 'dress';
    const scale = appState.currentScale || 100;
    const scaleLabel = (scale / 100).toFixed(2);

    // Get garment-specific layers at current scale
    const garmentLayers = pattern.mockupLayers[garment];
    const layersForScale = garmentLayers[scaleLabel] || garmentLayers["1.0"];

    // Render mockup with selected garment layers
    renderClothingMockup(layersForScale);
}
```

### State Persistence
- Garment selection persists when switching patterns
- User can browse patterns while keeping preferred garment view
- Same as current scale persistence behavior

---

## Blender Rendering Scripts

### Updated: `colorflex-batch-render.py`

**Command-line arguments**:
```bash
--collection=botanicals   # Collection name
--garment=dress           # Garment subdirectory (dress or pantsuit)
--garment-object=dress    # Blender object name
```

**Output directory**:
```python
out_dir = os.path.join(
    CONFIG["output_root"],
    f"{collection_name}-clo",
    "layers",
    garment_name  # Subdirectory: dress or pantsuit
)
```

### Updated: `render-all-clo.sh`

**Garment configuration**:
```bash
# Define garments with their Blender files and object names
declare -A SCENES
SCENES["dress"]="/Volumes/K3/jobs/saffron/blender/dress-fabric-ready2.blend"
SCENES["pantsuit"]="/Volumes/K3/jobs/saffron/blender/dress-fabric-girl-base2.blend"

declare -A GARMENT_OBJECTS
GARMENT_OBJECTS["dress"]="dress"
GARMENT_OBJECTS["pantsuit"]="winter2"

# Render loop
for garment in "${!SCENES[@]}"; do
    BLEND_FILE="${SCENES[$garment]}"
    GARMENT_OBJ="${GARMENT_OBJECTS[$garment]}"

    for collection in "${COLLECTIONS[@]}"; do
        "$BLENDER" "$BLEND_FILE" \
            --background \
            --python "$SCRIPT" \
            -- --collection="$collection" --garment="$garment" --garment-object="$GARMENT_OBJ"
    done
done
```

---

## Deployment Workflow

### 1. Render All Collections
```bash
cd src/blender
./render-all-clo.sh
```

**Output**: `botanicals-clo/layers/dress/` and `botanicals-clo/layers/pantsuit/`

### 2. Update Collections.json
```bash
python3 update-clo-collection.py botanicals
```

**Creates**: Single `botanicals.clo` collection with garment-specific mockupLayers

### 3. Deploy to Server
```bash
./deploy-clo-collections.sh botanicals
```

**Uploads**: Both dress/ and pantsuit/ subdirectories to server

### 4. Update Frontend
- Add garment switcher buttons to clothing page template
- Implement `switchGarment()` function in CFM.js
- Update `updateClothingMockup()` to use selected garment

---

## Benefits Summary

### User Experience
- ✅ Stay in one collection while comparing garments
- ✅ Intuitive workflow: customize → preview on different garments
- ✅ No need to switch between collections
- ✅ Garment preference persists across patterns

### Developer Experience
- ✅ Single source of truth per pattern
- ✅ Easier to add new garments (just add subdirectory)
- ✅ Less duplication in collections.json
- ✅ Simpler maintenance and updates

### System Architecture
- ✅ Clean file organization with garment subdirectories
- ✅ Consistent naming convention
- ✅ Scales easily to additional garments
- ✅ Follows existing multi-scale pattern

---

## Future Expansion

### Adding More Garments
```
botanicals-clo/layers/
  dress/
  pantsuit/
  hoodie/      ← New garment
  t-shirt/     ← New garment
```

**Steps**:
1. Create Blender scene with new garment
2. Add garment to render-all-clo.sh configuration
3. Re-run rendering
4. Add button to garment switcher UI
5. No changes needed to collections.json structure!

---

## Related Files

- **Blender Script**: `src/blender/colorflex-batch-render.py`
- **Batch Render**: `src/blender/render-all-clo.sh`
- **Update Script**: `update-clo-collection.py`
- **Deployment**: `src/blender/deploy-clo-collections.sh`
- **Frontend**: `src/CFM.js` (needs garment switcher implementation)
- **Template**: `src/templates/page.colorflex-clothing.liquid`
