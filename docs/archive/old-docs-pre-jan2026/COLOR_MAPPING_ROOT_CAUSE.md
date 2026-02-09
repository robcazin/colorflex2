# Color Mapping Root Cause Analysis - October 22, 2025

## Problem Identified

Print pattern shows no color information in the info strip at the bottom.

## Console Log Analysis

From `CONSOLE_LOG.10.22.25`:

```
🎨 PRINT PATTERN - Layer Structure:
  - Total layers: 1
  - Shadow layers: 0 []
  - Non-shadow layers: 1 ['0:Background']  ← WRONG LABEL!
  - layerLabels length: 2 (includes background at [0])
  - appState.layerInputs length: 2

🎨 PRINT PATTERN - Non-shadow layer 0:
  - Label: "Background"  ← SHOULD BE ACTUAL PATTERN LAYER NAME!
  - Input index: 1
  - layerInput exists: true
  - Color name from input: "Fresh Eucalyptus"
  - Color RGB lookup: #ADBCB4
  - Layer path: PROOF PATH (high-res)
  - Expected from layerLabels[1]: Fresh Eucalyptus
```

## Root Cause: Off-By-One Error

### The Problem Code (Line 9890-9891 in CFM.js)

```javascript
appState.currentPattern.layers.forEach((layer, index) => {
    const label = layerLabels[index].label;  // ← BUG: Should be [index + 1]
    const isShadow = layer.isShadow === true;
    (isShadow ? shadowLayers : nonShadowLayers).push({ layer, index, label });
});
```

### Why This Is Wrong

**Step 1:** Build layerLabels from pattern layers (line 9872-9875)
```javascript
layerLabels = appState.currentPattern.layers.map((l, i) => ({
    label: appState.currentPattern.layerLabels?.[i] || `Layer ${i + 1}`,
    color: appState.layerInputs[i + (isWall ? 2 : 1)]?.input?.value || "Snowbound"
}));
```
At this point, `layerLabels[0]` = actual first layer label

**Step 2:** Add background to BEGINNING (line 9878-9881)
```javascript
layerLabels.unshift({
    label: "Background",
    color: backgroundInput.value || "Snowbound"
});
```
Now `layerLabels[0]` = "Background", and actual layers are at [1], [2], [3], etc.

**Step 3:** Build shadow/non-shadow arrays with WRONG index (line 9890-9891)
```javascript
appState.currentPattern.layers.forEach((layer, index) => {
    const label = layerLabels[index].label;  // ← READS WRONG INDEX!
    // When index=0 (first pattern layer), reads layerLabels[0] = "Background"
    // Should read layerLabels[1] = actual first layer
});
```

### The Result

For a pattern with 1 layer:
- `layerLabels = ["Background", "Layer 1"]`
- `currentPattern.layers[0]` = actual pattern layer
- Code reads `layerLabels[0]` = "Background" ❌
- Should read `layerLabels[1]` = "Layer 1" ✅

This is why the non-shadow layer array shows: `['0:Background']` instead of `['0:Layer 1']`

## Impact on Print Output

The label is used in the print preview text:
```javascript
layerLabels.forEach(({ label, color }, index) => {
    const swNumber = appState.selectedCollection?.curatedColors?.[index] || color || "N/A";
    textContent += `<li>${toInitialCaps(label)} | ${swNumber}</li>`;
});
```

Because the label is "Background" instead of the actual layer name, the info strip shows wrong information.

## The Fix

**Line 9891 in CFM.js:**

**Before:**
```javascript
const label = layerLabels[index].label;
```

**After:**
```javascript
// Account for background at layerLabels[0] - actual layers start at [1]
const label = layerLabels[index + 1].label;
```

## Additional Issue: Color Mismatch?

Looking at the console output:
- Background color: "Underseas" (#7c8e87) ✅
- Layer 0 color: "Fresh Eucalyptus" (#ADBCB4) ✅

The colors ARE being retrieved correctly! The issue is just the label being wrong.

However, we should verify the color information is showing in the print output. The print preview shows:
```javascript
layerLabels.forEach(({ label, color }, index) => {
    const swNumber = appState.selectedCollection?.curatedColors?.[index] || color || "N/A";
    textContent += `<li>${toInitialCaps(label)} | ${swNumber}</li>`;
});
```

This should show:
```
Background | Underseas
Layer 1 | Fresh Eucalyptus
```

But because labels are wrong, it might show:
```
Background | Underseas
Background | Fresh Eucalyptus  ← Wrong label, but right color
```

## Testing After Fix

After applying the fix, console should show:
```
🎨 PRINT PATTERN - Non-shadow layer 0:
  - Label: "Layer 1"  ← FIXED!
  - Input index: 1
  - Color name from input: "Fresh Eucalyptus"
  - Color RGB lookup: #ADBCB4
```

And print output should show correct layer names with colors.
