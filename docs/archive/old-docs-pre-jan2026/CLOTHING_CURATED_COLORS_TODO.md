# Clothing Curated Colors Issue - TODO

**Date**: November 14, 2025
**Status**: ⏸️ PINNED FOR LATER

## Issue Description

Currently, clothing collections only show curated colors in the color picker. They should also include designer colors like the wallpaper site does.

## Current Behavior
- Clothing mode: Only curated colors available
- Wallpaper mode: Both curated + designer colors available

## Expected Behavior
- Clothing mode should show BOTH curated and designer colors
- Same color selection experience as wallpaper mode

## Technical Notes

The color picker population happens in `populateColors()` or similar function. Need to check:
1. Where clothing mode filters colors
2. Why designer colors are excluded
3. How to include both color sets for clothing

## Files to Check
- `src/CFM.js` - Color picker population logic
- Look for clothing-specific color filtering

---

**Priority**: Medium
**Complexity**: Low-Medium
**Next Steps**: Review color picker logic for clothing mode vs wallpaper mode
