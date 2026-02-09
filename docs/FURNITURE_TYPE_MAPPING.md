# Furniture Type Mapping - CRITICAL REFERENCE

## The Problem This Solves
There are TWO different naming conventions used in the furniture system:

1. **mockupLayers keys** (in collections.json) - User-friendly names
2. **furniture-config.json keys** - Internal config keys

These DO NOT match. Code must map between them.

## The Mapping

| UI Button Value | mockupLayers Key | Config Key |
|-----------------|------------------|------------|
| Sofa-Capitol | `Sofa-Capitol` | `furniture` |
| Sofa-Kite | `Sofa-Kite` | `furniture-kite` |

## Where This Mapping Exists in Code

### CFM.js - THREE locations need this mapping:

1. **`renderFabricMockup()` ~line 14639**
   ```javascript
   const furnitureTypeToConfigKey = {
       'Sofa-Capitol': 'furniture',
       'Sofa-Kite': 'furniture-kite'
   };
   configKey = furnitureTypeToConfigKey[appState.selectedFurnitureType] || 'furniture';
   ```

2. **`updateRoomMockup()` ~line 12740**
   ```javascript
   const furnitureTypeToConfigKey = {
       'Sofa-Capitol': 'furniture',
       'Sofa-Kite': 'furniture-kite'
   };
   const furnitureConfigKey = furnitureTypeToConfigKey[selectedFurnitureType] || 'furniture';
   ```

3. **`switchFurniture()` ~line 6899**
   ```javascript
   const furnitureTypeToConfigKey = {
       'Sofa-Capitol': 'furniture',
       'Sofa-Kite': 'furniture-kite'
   };
   const configKey = furnitureTypeToConfigKey[furnitureType] || 'furniture';
   ```

## Template Button Setup

In `page.colorflex-furniture-simple.liquid`:
```html
<button onclick="window.setFurnitureType('Sofa-Capitol')" data-furniture-type="Sofa-Capitol">Capitol Sofa</button>
<button onclick="window.setFurnitureType('Sofa-Kite')" data-furniture-type="Sofa-Kite">Kite Sofa</button>
```

## Data Structures

### collections.json pattern mockupLayers:
```json
{
  "mockupLayers": {
    "Sofa-Capitol": {
      "1.0": [...layers...],
      "1.25": [...layers...]
    },
    "Sofa-Kite": {
      "1.0": [...layers...],
      "1.25": [...layers...]
    }
  }
}
```

### furniture-config.json:
```json
{
  "furniture": { "mockup": "...", "base": "...", ... },
  "furniture-kite": { "mockup": "...", "base": "...", ... }
}
```

## Adding New Furniture Types

If you add a new furniture type (e.g., "Sofa-Chesterfield"):

1. Add mockupLayers with key `Sofa-Chesterfield` in collections.json
2. Add config with key `furniture-chesterfield` in furniture-config.json
3. Update the mapping in ALL THREE locations in CFM.js
4. Add button in template with `data-furniture-type="Sofa-Chesterfield"`

## Common Errors

**Error**: `No furniture config found for: Sofa-Capitol`
**Cause**: Using mockupLayers key directly for config lookup
**Fix**: Apply the mapping before config lookup

---
*Last Updated: January 18, 2026*
