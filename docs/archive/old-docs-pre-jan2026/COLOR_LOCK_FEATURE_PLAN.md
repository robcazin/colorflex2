# Color Lock Feature - Implementation Plan
**Date:** October 22, 2025
**Backup:** `backups/working_versions/proof_system_complete_20251022_*/`

## User Request
Add a color lock feature that prevents thumbnail clicks from resetting user-customized colors. When locked, clicking a different pattern thumbnail will preserve the current color selections instead of loading that pattern's default colors.

## Current Behavior
When a user clicks a pattern thumbnail:
1. `handleThumbnailClick()` calls `loadPatternData()` (line 9917 in CFM.js)
2. `handlePatternSelection()` is called (line 7489)
3. Pattern's default colors (designer_colors or curatedColors) are loaded (lines 7503-7509)
4. User's custom color selections are lost

## Proposed Solution

### UI Component
**Location:** Next to "Color Layers" heading in `src/templates/page.colorflex.liquid` line 118

**Options:**
1. **Inline after text**: "Color Layers 🔒" (unlocked) / "Color Layers 🔓" (locked)
2. **Below heading**: Centered padlock icon button
3. **Floating button**: Small button near heading

**Recommended:** Option 2 - small button below heading for clarity

### UI Mockup
```
        Color Layers
          [🔓]  ← Click to toggle lock

    Background: [color picker]
    Layer 1: [color picker]
    ...
```

### State Management
Add to `appState` in CFM.js:
```javascript
colorsLocked: false  // Default unlocked
```

### Code Changes Required

#### 1. Add Lock Button to Liquid Template
**File:** `src/templates/page.colorflex.liquid` (around line 118)
```liquid
<h3 id="colorLayersHeading" ...>Color Layers</h3>
<div id="colorLockToggle" style="text-align: center; margin: 5px 0;">
  <button id="colorLockBtn" style="...">
    <span id="colorLockIcon">🔓</span>
    <span id="colorLockText">Unlocked</span>
  </button>
</div>
```

#### 2. Add Toggle Function
**File:** `src/CFM.js` (new function around line 7400-7450)
```javascript
function toggleColorLock() {
    appState.colorsLocked = !appState.colorsLocked;

    const btn = document.getElementById('colorLockBtn');
    const icon = document.getElementById('colorLockIcon');
    const text = document.getElementById('colorLockText');

    if (appState.colorsLocked) {
        icon.textContent = '🔒';
        text.textContent = 'Locked';
        btn.style.background = 'rgba(212, 175, 55, 0.3)'; // Highlight when locked
    } else {
        icon.textContent = '🔓';
        text.textContent = 'Unlocked';
        btn.style.background = 'rgba(110, 110, 110, 0.2)';
    }
}

// Expose to window for button onclick
window.toggleColorLock = toggleColorLock;
```

#### 3. Modify handlePatternSelection
**File:** `src/CFM.js` line 7489
**Change:** Check `appState.colorsLocked` and pass `preserveColors: true` if locked
```javascript
function handlePatternSelection(patternName, preserveColors = false) {
    // Check if colors are locked
    if (appState.colorsLocked) {
        preserveColors = true;
        console.log('🔒 Colors locked - preserving user selections');
    }

    // ... rest of existing code

    // Existing logic at line 7512-7514 already handles preserveColors
    const savedColors = preserveColors ?
        appState.currentLayers.map(layer => layer.color) : [];
```

#### 4. Update handleThumbnailClick
**File:** `src/CFM.js` line 9905
**Change:** Pass preserveColors flag based on lock state
```javascript
function handleThumbnailClick(patternId) {
    // ... existing code ...

    // Check if we need to preserve colors
    const shouldPreserveColors = appState.colorsLocked;

    // Need to pass preserveColors to loadPatternData somehow
    // OR modify loadPatternData to check appState.colorsLocked directly
}
```

## Implementation Complexity

### Minimal Work Required:
1. ✅ **UI Button** - Simple HTML/CSS in Liquid template (~15 lines)
2. ✅ **Toggle Function** - Basic state management (~25 lines)
3. ✅ **Check Lock State** - Modify handlePatternSelection (~3 lines)
4. ✅ **Initialize State** - Add `colorsLocked: false` to appState (~1 line)

**Total Estimated Code:** ~50 lines
**Difficulty:** Low - leverages existing `preserveColors` logic
**Testing Required:** Click patterns with lock on/off, verify colors preserved/reset

### Existing Code That Helps:
- `handlePatternSelection()` already has `preserveColors` parameter (line 7489)
- Logic to save/restore colors already exists (lines 7512-7514)
- Just need to hook up the UI toggle to set the flag

## Visual Design Considerations

### Button Styling:
```css
#colorLockBtn {
    background: rgba(110, 110, 110, 0.2);
    border: 1px solid #d4af37;
    border-radius: 4px;
    padding: 4px 12px;
    cursor: pointer;
    color: #d4af37;
    font-size: 0.9rem;
    transition: all 0.3s ease;
}

#colorLockBtn:hover {
    background: rgba(212, 175, 55, 0.2);
    transform: scale(1.05);
}

#colorLockBtn.locked {
    background: rgba(212, 175, 55, 0.3);
    border-color: #ffd700;
}
```

## Testing Checklist
- [ ] Lock button toggles icon (🔓 ↔ 🔒) and text (Unlocked ↔ Locked)
- [ ] With lock OFF: clicking pattern changes colors to defaults
- [ ] With lock ON: clicking pattern preserves current colors
- [ ] Lock state persists across pattern clicks
- [ ] Lock state visual feedback clear to user
- [ ] Button positioning doesn't break layout
- [ ] Works with all pattern types (ColorFlex, Standard, Clothing)

## Benefits
1. **User Control** - Prevents accidental color loss when browsing patterns
2. **Workflow Improvement** - Can try colors across multiple patterns
3. **Minimal Code** - Leverages existing preserveColors logic
4. **Clear UX** - Universal lock icon metaphor

## Risks
- **None significant** - feature is additive and defaults to unlocked (current behavior)
- If there's a bug, users can always unlock and reload pattern

## Files to Modify
1. `src/templates/page.colorflex.liquid` - Add button UI
2. `src/CFM.js` - Add toggle function and modify handlePatternSelection
3. Rebuild: `npm run build`
4. Upload: `src/assets/color-flex-core.min.js` to Shopify

---

**Status:** Ready to implement
**Estimated Time:** 30-45 minutes
