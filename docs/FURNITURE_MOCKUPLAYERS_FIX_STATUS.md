# Furniture mockupLayers Fix - Status & Next Steps

**Date:** 2026-01-22  
**Issue:** Furniture mode broken in both standard (`colorflex-furniture`) and simple (`extraordinary-color-furniture`) pages  
**Key Clue:** FOLKSIE works in simple page but NOT in standard page  
**Root Cause:** `createFurniturePattern()` in standard furniture mode wasn't merging `mockupLayers` from variant collections

## Current Status

### ✅ Fixed
1. **`createFurniturePattern()` now merges `mockupLayers`** - When creating furniture patterns in standard mode, it now looks up the variant collection (e.g., `folksie.fur-1`) and merges `mockupLayers` into the pattern object
2. **Both `.fur-1` and `.fur` formats supported** - Checks multiple naming formats for variant collections

### 🔍 Architecture Understanding

**Standard Furniture Page** (`colorflex-furniture`):
- User clicks "Try Furniture" → `switchToFurnitureMode()` is called
- Creates virtual furniture collection with `createFurniturePattern()` for each pattern
- **BEFORE FIX:** `createFurniturePattern()` only constructed paths, didn't merge `mockupLayers`
- **AFTER FIX:** `createFurniturePattern()` now also merges `mockupLayers` from variant collection
- When pattern is selected, `updateFurniturePreview()` uses `mockupLayers` if available, otherwise constructs paths

**Simple Furniture Page** (`extraordinary-color-furniture`):
- Uses base collections directly (no virtual furniture collection)
- When pattern is selected, `loadPatternData()` merges `mockupLayers` from variant collection
- `updateFurniturePreview()` uses `mockupLayers` directly
- **Folksie works** because it has `mockupLayers` as an array in `folksie.fur-1` collection

## Code Changes Made

### `createFurniturePattern()` - Lines 6923-6958
- **Added:** Lookup of furniture variant collection (`.fur-1`, `.fur`, `-fur-1`, `-fur`)
- **Added:** Merge `mockupLayers` from variant collection into furniture pattern
- **Result:** Standard furniture page now has `mockupLayers` available, just like simple page

## Why Folksie Works in Simple But Not Standard

**Folksie Collection Structure:**
- Base collection: `folksie` (has `pattern.layers` for preview)
- Variant collection: `folksie.fur-1` (has `mockupLayers` as array for furniture mockup)

**Simple Page Flow:**
1. User selects `folksie` collection
2. User selects a pattern
3. `loadPatternData()` finds `folksie.fur-1` variant and merges `mockupLayers`
4. `updateFurniturePreview()` uses `mockupLayers` directly ✅

**Standard Page Flow (BEFORE FIX):**
1. User selects `folksie` collection
2. User clicks "Try Furniture" → `switchToFurnitureMode()` called
3. `createFurniturePattern()` creates furniture patterns WITHOUT `mockupLayers`
4. User selects a pattern
5. `updateFurniturePreview()` doesn't find `mockupLayers`, tries to construct paths ❌
6. Constructed paths might be wrong or files don't exist

**Standard Page Flow (AFTER FIX):**
1. User selects `folksie` collection
2. User clicks "Try Furniture" → `switchToFurnitureMode()` called
3. `createFurniturePattern()` now finds `folksie.fur-1` and merges `mockupLayers` ✅
4. User selects a pattern
5. `updateFurniturePreview()` uses `mockupLayers` directly ✅

## Next Steps

### Immediate Testing
1. **Deploy and test standard furniture page** - Verify Folksie now works
2. **Test other collections** - Verify they still work (both with and without `mockupLayers`)
3. **Test simple furniture page** - Verify it still works (should be unaffected)

### If Issues Persist
1. **Check console logs** - Look for:
   - `✅ Found furniture variant collection` messages
   - `✅ Found mockupLayers in variant collection` messages
   - `⚠️ No mockupLayers found` warnings
2. **Verify variant collection names** - Ensure they match expected formats (`.fur-1`, `.fur`, `-fur-1`, `-fur`)
3. **Check pattern matching** - Ensure pattern names/slugs match between base and variant collections

## Files Modified

1. `src/CFM.js`
   - `createFurniturePattern()` - Lines 6923-6958 (added `mockupLayers` merge logic)

## Related Issues

- Standard furniture page was constructing paths instead of using `mockupLayers` from variant collections
- This caused issues for collections like Folksie that have `mockupLayers` defined
- Simple furniture page worked because it used `loadPatternData()` which already merged `mockupLayers`

## Testing Checklist

- [ ] Standard furniture page: Folksie collection works
- [ ] Standard furniture page: Other collections still work
- [ ] Simple furniture page: Folksie still works (unaffected)
- [ ] Simple furniture page: Other collections still work
- [ ] Console shows `mockupLayers` being merged in standard mode
- [ ] No CORS errors
- [ ] No 404 errors for layer files
