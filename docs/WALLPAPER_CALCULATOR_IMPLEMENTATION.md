# Wallpaper Calculator Implementation Documentation

**Session Date:** 2026-02-04  
**Last Updated:** 2026-02-06 10:03:00  
**Backup Created:** 2026-02-06 10:03:39 (Full backup: `backups/full-backup-2026-02-06_10-03-39/`, 11GB)

## Overview

This document describes the implementation of the Wallpaper Calculator feature, including the calculator icon in the header, modal popup functionality, and all related features added during this session.

## Features Implemented

### 1. Calculator Icon in Header
- **Location:** `src/sections/header.liquid` (lines ~248-264)
- **Description:** A calculator icon added to the header navigation, positioned between the search icon and account icon
- **Implementation:**
  - Uses inline `onclick` handler: `onclick="if(typeof window.loadCalculatorModal==='function'){window.loadCalculatorModal();}return false;"`
  - Icon SVG matches other header icons styling
  - `href="javascript:void(0);"` prevents navigation
  - Includes `aria-label` and `title` for accessibility

### 2. Modal Popup System
- **Location:** `src/sections/header.liquid` (lines ~438-904)
- **Description:** Dynamically loads and displays the calculator HTML as a draggable modal overlay
- **Key Functions:**
  - `window.loadCalculatorModal()` - Main function that loads calculator HTML from Shopify assets
  - Fetches `wallpaperCalculator.html` from `{{ "wallpaperCalculator.html" | asset_url }}`
  - Creates modal overlay and content elements dynamically
  - Injects calculator HTML content into modal

### 3. Draggable Modal with Pin/Lock Functionality
- **Location:** `src/sections/header.liquid` (lines ~750-814)
- **Description:** Modal can be dragged by the header, and can be pinned to stay open
- **Features:**
  - **Dragging:** Click and drag the modal header to reposition
  - **Pin Button:** Located in header, toggles between pin (📍) and lock (🔒) states
  - **Pinned State:** 
    - Background overlay becomes very light (`rgba(0,0,0,0.1)`)
    - Modal stays open when clicking outside
    - Allows background interactions
  - **Unpinned State:**
    - Darker background overlay (`rgba(0,0,0,0.4)`)
    - Clicking outside closes the modal

### 4. CSS Scoping and Isolation
- **Location:** `src/sections/header.liquid` (lines ~621-666)
- **Description:** Prevents calculator CSS from affecting the main page, and prevents page CSS from affecting calculator
- **Implementation:**
  - Extracts `<style>` block from calculator HTML
  - Removes `body` and `html` styles that would affect the page
  - Scopes all remaining selectors to `#calculatorDraggableModal`
  - Handles comma-separated selectors (e.g., `input, select` → `#calculatorDraggableModal input, #calculatorDraggableModal select`)
  - Adds additional reset styles for width constraints and transform resets

### 5. Width Constraints and Field Sizing
- **Location:** 
  - `src/wallpaperCalculator.html` (lines ~106-108, 134-137, 155-160, 172-174, 184-196, 240-246)
  - `src/sections/header.liquid` (lines ~664-680)
- **Description:** Ensures calculator fields maintain proper width even when loaded from ColorFlex page
- **Implementation:**
  - All layout elements have `width: 100% !important` and `max-width: 100% !important`
  - `box-sizing: border-box !important` on all containers
  - Additional width constraints injected via scoped styles in `header.liquid`
  - Applied to: `.container`, `.content`, `.section`, `.form-group`, `.input-row`, `input`, `select`

### 6. Transform/Scale Reset (ColorFlex Page Compatibility)
- **Location:**
  - `src/wallpaperCalculator.html` (lines ~70-77)
  - `src/sections/header.liquid` (lines ~483-495, 497-509, 664-672)
- **Description:** Prevents ColorFlex page's scale settings from stretching the calculator
- **Implementation:**
  - `transform: none !important` on modal container and all children
  - `scale: 1 !important` on modal container and all children
  - `zoom: 1 !important` on modal container and all children
  - Applied to both the static HTML and dynamically created modal elements

### 7. Arial Font for Strip Details
- **Location:** `src/wallpaperCalculator.html` (lines ~546-581)
- **Description:** Strip detail information uses Arial font for better readability
- **Implementation:**
  - `font-family: Arial, sans-serif !important` on:
    - `.strip-detail`
    - `.strip-info`
    - `.strip-header`
    - `.strip-pattern-type`
    - `.strip-meta`

### 8. Auto-Scroll to Results
- **Location:** `src/wallpaperCalculator.html` (lines ~1027-1050)
- **Description:** Automatically scrolls to results section after calculation completes
- **Implementation:**
  - Finds scrollable container (modal content)
  - Calculates scroll position to bring results into view
  - Adds highlight animation (box-shadow) that fades after 2 seconds
  - Uses smooth scrolling behavior

## File Structure

### Main Files

1. **`src/sections/header.liquid`**
   - Calculator icon HTML (lines ~248-264)
   - `loadCalculatorModal()` function (lines ~445-841)
   - Modal creation and styling (lines ~479-509)
   - CSS scoping logic (lines ~621-666)
   - Draggable functionality (lines ~750-814)
   - Pin/lock functionality (lines ~553-588)

2. **`src/wallpaperCalculator.html`**
   - Complete calculator HTML, CSS, and JavaScript
   - Located in Shopify assets directory
   - Contains all calculator logic and styling
   - Auto-scroll functionality
   - Results display logic

## Key Code Locations

### Calculator Icon
```liquid
<!-- src/sections/header.liquid, lines ~248-264 -->
<a
  href="javascript:void(0);"
  class="header__icon header__icon--calculator link focus-inset"
  id="wallpaperCalculatorIcon"
  aria-label="Open Wallpaper Calculator"
  title="Wallpaper Calculator"
  rel="nofollow"
  onclick="if(typeof window.loadCalculatorModal==='function'){window.loadCalculatorModal();}return false;"
>
```

### Modal Loading Function
```javascript
// src/sections/header.liquid, lines ~445-841
window.loadCalculatorModal = function() {
  // Check for existing modal
  // Fetch calculator HTML from Shopify assets
  // Create modal overlay and content
  // Inject calculator HTML
  // Set up draggable functionality
  // Set up pin/lock functionality
}
```

### CSS Scoping
```javascript
// src/sections/header.liquid, lines ~621-666
// Extract calculator styles
// Remove body/html styles
// Scope selectors to #calculatorDraggableModal
// Handle comma-separated selectors
// Inject scoped styles into page head
```

### Draggable Functionality
```javascript
// src/sections/header.liquid, lines ~750-814
// mousedown: Start dragging
// mousemove: Update position (constrained to viewport)
// mouseup: Stop dragging
```

### Pin/Lock Toggle
```javascript
// src/sections/header.liquid, lines ~553-588
function togglePin() {
  modal.isPinned = !modal.isPinned;
  // Update button icon and styling
  // Adjust background overlay opacity
  // Enable/disable close-on-backdrop-click
}
```

## Styling Details

### Modal Container
- **Width:** 800px (enforced with `!important`)
- **Max-width:** 90vw for responsive behavior
- **Position:** Fixed, centered with flexbox
- **Z-index:** 10000 (overlay), 10001 (content)
- **Background:** Dark blue gradient (`#1a202c` to `#2d3748`)
- **Border:** 3px solid gold (`#d4af37`)

### Color Scheme
- **Primary:** Gold (`#d4af37`)
- **Background:** Dark blue (`#1a202c`)
- **Text:** Light beige (`#f0e6d2`)
- **Accents:** Teal (`#c6eeef`, `#14797d`)

### Fonts
- **Body:** IM Fell English (serif)
- **Headings/Accents:** Special Elite (monospace)
- **Title:** Island Moments (cursive, white)
- **Strip Details:** Arial (sans-serif)

## Technical Notes

### Modal Structure
1. **Overlay** (`#calculatorModalOverlay`): Full-screen backdrop
2. **Modal Content** (`#calculatorDraggableModal`): Draggable calculator container
3. **Scrollable Content**: Inner container with calculator HTML

### Event Handling
- Icon click uses inline `onclick` for reliability
- Modal close: Close button, overlay click (when unpinned), ESC key
- Drag: Header mousedown/mousemove/mouseup
- Pin: Button click toggles state

### CSS Isolation Strategy
1. Extract calculator styles from HTML
2. Remove global styles (body, html)
3. Scope remaining selectors to modal ID
4. Inject as separate `<style>` element
5. Remove on modal close

### Width Constraint Strategy
1. Apply `!important` flags to all width-related properties
2. Use `box-sizing: border-box` consistently
3. Inject additional constraints via scoped styles
4. Target all layout containers and form elements

### Transform Reset Strategy
1. Apply resets to modal container
2. Apply resets to all children via CSS selector
3. Use `!important` to override any inherited transforms
4. Applied in both static HTML and dynamic injection

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Uses CSS Grid and Flexbox
- Uses ES6+ JavaScript features

## Future Considerations

### Potential Enhancements
1. **Horizontal Waste Calculation:** Automatically calculate waste from partial-width edge strips (removed in this session, can be re-implemented)
2. **Save/Load Calculations:** Allow users to save and reload calculations
3. **Print Functionality:** Add print-friendly view
4. **Export Options:** Export results as PDF or CSV

### Known Limitations
- Modal is constrained to viewport (cannot float outside browser window)
- Calculator HTML must be in Shopify assets directory
- CSS scoping requires careful selector handling

## Deployment

### Files to Deploy
1. `src/sections/header.liquid` - Contains icon and modal loader
2. `src/assets/wallpaperCalculator.html` - Calculator HTML file

### Deployment Command
```bash
shopify theme push --theme=150150381799 --store=f63bae-86.myshopify.com --path src --only sections/header.liquid assets/wallpaperCalculator.html
```

## Troubleshooting

### Calculator Icon Not Clickable
- Check browser console for JavaScript errors
- Verify `loadCalculatorModal` function is defined
- Check that icon has correct `id="wallpaperCalculatorIcon"`

### Modal Not Appearing
- Check browser console for fetch errors
- Verify `wallpaperCalculator.html` exists in Shopify assets
- Check z-index values (should be 10000+)

### Styling Conflicts
- Verify CSS scoping is working (check injected styles in DevTools)
- Check for `!important` flags on width constraints
- Verify transform resets are applied

### Fields Too Wide on ColorFlex Page
- Check that width constraints are injected via scoped styles
- Verify `box-sizing: border-box` is applied
- Check for conflicting CSS from ColorFlex page

## Session Summary

This session implemented a complete wallpaper calculator feature with:
- Header icon integration
- Modal popup system
- Draggable interface with pin/lock
- CSS isolation from page styles
- Width constraint system
- Transform reset for ColorFlex compatibility
- Arial font for strip details
- Auto-scroll to results

All features are production-ready and deployed to Shopify theme.

## Backup Information

**Full Backup Created:** 2026-02-06 10:03:39  
**Backup Location:** `backups/full-backup-2026-02-06_10-03-39/`  
**Backup Size:** 11GB  
**Backup Script:** `scripts/full-backup.sh` (newly created)

### Backup Verification
✅ All key files verified in backup:
- `src/sections/header.liquid` - Calculator icon & modal loader
- `src/assets/wallpaperCalculator.html` - Calculator HTML
- `data/collections.json` - Master collection data (73,973 lines)
- `docs/WALLPAPER_CALCULATOR_IMPLEMENTATION.md` - This documentation

The full backup includes all source code, data files, documentation, and configuration files. This provides a complete snapshot of the project state at the time of the wallpaper calculator implementation.

### Backup Contents
- **Source Code:** Complete `src/` directory including:
  - `src/sections/header.liquid` (Calculator icon & modal loader)
  - `src/assets/wallpaperCalculator.html` (Calculator HTML)
  - All JavaScript, CSS, and Liquid template files
- **Data Files:** Complete `data/` directory including:
  - `data/collections.json` (Master collection data - 73,973 lines)
  - All collection metadata and layer files
- **Documentation:** Complete `docs/` directory including:
  - `docs/WALLPAPER_CALCULATOR_IMPLEMENTATION.md` (This document)
- **Scripts:** All utility and deployment scripts
- **Configuration:** All config files including Shopify settings

### Restoring from Backup
To restore files from this backup:
```bash
# Restore specific file
cp backups/full-backup-2026-02-06_10-03-39/src/sections/header.liquid src/sections/header.liquid

# Restore entire directory
cp -r backups/full-backup-2026-02-06_10-03-39/src/ src/

# Restore data files
cp -r backups/full-backup-2026-02-06_10-03-39/data/ data/
```
