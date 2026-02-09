# Clothing mockupLayers Fix - Status & Next Steps

**Date:** 2026-01-22  
**Issue:** Standard clothing page showing flat tiled pattern instead of clothing mockup  
**Root Cause:** `pattern.mockupLayers` not being found because variant collection lookup was only checking `.clo` format, but collections use `-clo` format (hyphen)

## Current Status

### ✅ Fixed
1. **Removed all path construction logic** - Now uses `mockupLayers` directly from `collections.json`
2. **Both standard and simple clothing use multi-resolution** - Both use `mockupLayers[garment][selectedClothingScale]`
3. **Fixed variant collection lookup** - Now checks both `.clo` and `-clo` formats (and `-1` variants)

### 🔍 Debugging Added
- Added extensive logging to identify why `mockupLayers` isn't being found
- Logs show: pattern name, mockupLayers existence, type, selectedGarment, selectedClothingScale

### ⚠️ Known Issue
- **Standard clothing page still showing flat tiled pattern**
- Console shows: `pattern.mockupLayers exists: false`
- Pattern: "Andheri Star Flower" from "bombay" collection
- Expected: Should find `mockupLayers` from "bombay-clo" variant collection

## Code Changes Made

### 1. `renderFabricMockup()` - Lines 16729-16774
- Removed all path construction logic
- Simplified to use `mockupLayers` directly from `collections.json`
- Both standard and simple clothing use `appState.selectedClothingScale` for multi-resolution
- Falls back to `pattern.layers` if `mockupLayers` doesn't exist (with warning)

### 2. `loadPatternData()` - Lines 11728-11750
- Fixed variant collection lookup to check both `.clo` and `-clo` formats
- Also checks `-1` variants for backwards compatibility
- Merges `mockupLayers` from variant collection into pattern object

### 3. `renderFabricMockup()` - Lines 16738-16780 (NEW)
- Added fallback to look up variant collection if `mockupLayers` is still missing
- This catches cases where `loadPatternData()` didn't merge `mockupLayers` for some reason
- Merges `mockupLayers` directly into pattern object and updates `appState.currentPattern`

## Next Steps

### Immediate (After Break)
1. **Test the fix** - Deploy and check if variant collection is now being found
2. **Verify console logs** - Check if `mockupLayers` is now being merged from variant collection
3. **If still failing:**
   - Check if "bombay-clo" collection exists in `collections.json`
   - Verify the pattern "Andheri Star Flower" exists in "bombay-clo" with `mockupLayers`
   - Add fallback in `renderFabricMockup()` to look up variant collection if `mockupLayers` is missing

### Future Cleanup
1. **Rename `furniture-config.json`** - Contains config for clothing, furniture, and fabric (misleading name)
2. **Document architecture** - Clear documentation of:
   - Base collections vs variant collections
   - How `mockupLayers` are structured
   - How patterns are merged from variants
3. **Remove debug logging** - Clean up excessive console logs once issue is resolved

## Architecture Notes

### Collections Structure
- **Base collections**: `bombay`, `cottage-sketch-book`, etc. (contain `pattern.layers` for preview)
- **Variant collections**: `bombay-clo`, `bombay.clo-1`, `cottage-sketch-book-clo`, etc. (contain `mockupLayers` for clothing mockups)
- **Pattern merging**: When loading a pattern from base collection, `loadPatternData()` looks up the variant collection and merges `mockupLayers` into the pattern object

### mockupLayers Structure
```json
{
  "mockupLayers": {
    "dress": {
      "1.0": ["./data/collections/bombay-clo/layers/dress/pattern_layer-1_scale-1.0.png", ...],
      "1.5": [...],
      "2.0": [...]
    },
    "pantsuit": {
      "1.0": [...],
      ...
    }
  }
}
```

### Terminology
- **"mockup"** = Base layer (garment/mannequin silhouette) from `furniture-config.json`
- **"mockupLayers"** = Pattern layers at different scales from `collections.json` variant collections

## Testing Checklist

- [ ] Standard clothing page loads `mockupLayers` from variant collection
- [ ] Pattern layers display correctly (not flat tiled pattern)
- [ ] Multi-resolution works for both standard and simple clothing pages
- [ ] Fallback to `pattern.layers` works if `mockupLayers` doesn't exist
- [ ] No CORS errors
- [ ] No 404 errors for layer files

## Files Modified

1. `src/CFM.js`
   - `renderFabricMockup()` - Lines 16729-16780 (simplified mockupLayers usage + fallback lookup)
   - `loadPatternData()` - Lines 11728-11750 (fixed variant collection lookup)

## Related Issues

- Standard clothing page was using `pattern.layers` (pattern preview paths) instead of `mockupLayers` (clothing mockup paths)
- Path construction was creating incorrect paths that don't exist on server
- Variant collection lookup was only checking `.clo` format, missing `-clo` format
