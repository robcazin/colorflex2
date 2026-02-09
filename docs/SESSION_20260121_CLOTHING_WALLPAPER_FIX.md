# Session Notes: Clothing Page Loading Wallpaper Engine Fix
**Date:** January 21, 2025
**Issue:** Extraordinary Color clothing page was loading the wallpaper engine instead of the clothing engine

## Problem
The clothing page (`/pages/extraordinary-color-clothing`) was rendering wallpaper mockups instead of clothing mockups, even though `window.COLORFLEX_MODE = 'CLOTHING'` was set in the template.

## Root Cause
The `updateRoomMockup()` function was checking for clothing mode by looking for `-clo` or `.clo-` in the collection name:
```javascript
const isClothingCollection = appState.selectedCollection?.name?.includes('-clo') || appState.selectedCollection?.name?.includes('.clo-');
```

However, the clothing page uses **base collections** (e.g., `bombay`, `geometry`) rather than the `.clo-1` variant collections. So when a base collection was selected, `isClothingCollection` would be `false`, causing the wallpaper engine to run instead of skipping to `renderFabricMockup()`.

## Solution
Updated `updateRoomMockup()` to also check `window.COLORFLEX_MODE === 'CLOTHING'` in addition to checking the collection name:

```javascript
// Clothing mode uses renderFabricMockup() - skip updateRoomMockup entirely
// ✅ FIX: Check both collection name AND window.COLORFLEX_MODE (clothing page uses base collections without -clo suffix)
const isClothingCollection = appState.selectedCollection?.name?.includes('-clo') || appState.selectedCollection?.name?.includes('.clo-');
const isClothingMode = window.COLORFLEX_MODE === 'CLOTHING';
if (isClothingCollection || isClothingMode) {
  console.log("👗 Skipping updateRoomMockup() for clothing mode - use renderFabricMockup() instead");
  console.log(`  👗 isClothingCollection: ${isClothingCollection}, isClothingMode: ${isClothingMode}`);
  return;
}
```

## Files Modified
- `src/CFM.js` (line ~13083-13090)
- `src/templates/page.colorflex-clothing.liquid` (lines 33-41, 602-610)
- `src/templates/page.colorflex-clothing-simple.liquid` (lines 96-111, 328-336)

## Additional Fix: Mode Detection Script
After initial deployment, it was discovered that `window.COLORFLEX_MODE` was not being set before CFM.js loaded. Added:

1. **Freeze COLORFLEX_MODE** using `Object.defineProperty()` to prevent overwrites
2. **Safety check** right before CFM.js script tag to ensure mode is set:
   ```javascript
   <script>
     // ✅ CRITICAL: Ensure COLORFLEX_MODE is set before loading CFM.js
     if (!window.COLORFLEX_MODE) {
       window.COLORFLEX_MODE = 'CLOTHING';
       console.log('🔧 COLORFLEX_MODE was missing, setting to CLOTHING');
     }
     console.log('🔧 Final check before CFM.js load: COLORFLEX_MODE =', window.COLORFLEX_MODE);
   </script>
   ```

## Testing
- Verify that the clothing page (`/pages/extraordinary-color-clothing`) now uses `renderFabricMockup()` instead of `updateRoomMockup()`
- Check console logs to confirm "👗 Skipping updateRoomMockup() for clothing mode" appears
- Verify that clothing mockups render correctly with garment selection (dress/pantsuit)

## Related Issues
- This fix ensures that mode detection works correctly when using base collections (which is the standard architecture for furniture/clothing pages)
- The same pattern should be applied to furniture mode detection if similar issues arise

## Notes
- The clothing page template correctly sets `window.COLORFLEX_MODE = 'CLOTHING'` (line 36 of `page.colorflex-clothing.liquid`)
- Other parts of the code (e.g., `createColorInput`, `loadPatternData`) already check `window.COLORFLEX_MODE === 'CLOTHING'` correctly
- This was the missing piece that caused `updateRoomMockup()` to run when it shouldn't
