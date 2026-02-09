# Missing Shadow Layers Report

**Date:** 2026-01-22  
**Issue:** Shadow layers listed in collections.json but PNG files don't exist on filesystem

## Summary

Shadow layers are **critical** if they're listed in Airtable with the "isshadow" keyword. The validation found 5 missing shadow layer files for Coverlets furniture mockups.

## Missing Shadow Layers

### Coverlets.fur-1 Collection (5 patterns)

All missing shadow layers follow this pattern:
- Expected path: `data/collections/coverlets-fur/layers/Sofa-Capitol/{pattern}_shadows_layer-1_scale-1.0.png`

**Missing Files:**
1. `charleston-bay_shadows_layer-1_scale-1.0.png`
2. `franklin_shadows_layer-1_scale-1.0.png`
3. `oxford_shadows_layer-1_scale-1.0.png`
4. `piqua-1852_shadows_layer-1_scale-1.0.png`
5. `rosemount_shadows_layer-1_scale-1.0.png`

**Pattern Layers Present:**
- ✅ `charleston-bay_pattern_layer-2_scale-1.0.png` (exists)
- ✅ `franklin_flowers_layer-2_scale-1.0.png` (exists)
- ✅ `oxford_round-design_layer-2_scale-1.0.png` (exists)
- ✅ Pattern layers exist for all scales (0.5, 1.0, 1.25, 1.5, 2.0)

**Shadow Layers Missing:**
- ❌ Shadow layers don't exist for any scale

## Collections.json Structure

These patterns have `mockupLayers` arrays that include shadow layer paths:

```json
"mockupLayers": [
  "./data/collections/coverlets-fur/layers/Sofa-Capitol/charleston-bay_shadows_layer-1_scale-1.0.png",
  "./data/collections/coverlets-fur/layers/Sofa-Capitol/charleston-bay_pattern_layer-2_scale-1.0.png"
]
```

The shadow layer is listed first, but the file doesn't exist.

## Shadow Layer Identification

Shadow layers are identified by:
1. **`isShadow === true`** flag in layer object
2. **Path contains "ISSHADOW"** (case-insensitive) - e.g., `*_isshadows_layer-1.jpg`
3. **Layer label contains "Shadow"** - e.g., "Shadows", "Shadow"

## Examples of Working Shadow Layers

### Farmhouse Collection
- ✅ `root-vegetables-paper-scraps_isshadows_layer-1.jpg` (pattern layer)
- ✅ `root-vegetables-paper-scraps_shadows_layer-1_scale-1.0.png` (clothing mockup)
- ✅ All scales present (0.5, 1.0, 1.25, 1.5, 2.0)

### Botanicals Collection
- ✅ Shadow Dance pattern has shadow layers in clothing mockups
- ✅ All scales present

## Action Required

### Option 1: Render Shadow Layers
The shadow layer PNG files need to be rendered for Coverlets furniture mockups. This likely requires:
1. Using the Blender rendering pipeline
2. Rendering from the base pattern layer (texture_layer-1.jpg) with shadow effects
3. Generating all scales (0.5, 1.0, 1.25, 1.5, 2.0) for consistency

### Option 2: Remove from collections.json (if not needed)
If shadow layers aren't actually needed for these patterns, they can be removed from `mockupLayers` arrays. However, if they're marked with "isshadow" in Airtable, they should be rendered.

## Related Patterns

The base pattern layers exist:
- `charleston-bay_texture_layer-1_scale-1.0.png` ✅
- `franklin_texture_layer-1_scale-1.0.png` (likely exists)
- Pattern layers exist for all patterns

The shadow layers should be rendered from these base layers or from the original JPG pattern layers.

## Next Steps

1. **Check Airtable** - Verify if these patterns have "isshadow" keyword
2. **Render shadow layers** - Use Blender pipeline to generate missing shadow layer PNGs
3. **Update validation** - After rendering, re-run validation to confirm files exist

## Validation Command

```bash
node scripts/validate-collections-filesystem.js
```

This will show if shadow layers are still missing after rendering.
