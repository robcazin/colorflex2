# CLOTHING MODE FIX - Path Mismatch (November 18, 2025)

## Problem
Clothing mockup was displaying correctly, but **pattern layers were not rendering**. Console showed 404 errors for pattern layer images.

## Root Cause
**Path mismatch in collections.json:**
- Collections.json had: `botanicals_clo1` (underscore)
- Server directory is: `botanicals-clo1` (dash)
- Result: All pattern layer image requests failed with 404

**Example 404 error:**
```
GET https://so-animation.com/colorflex/data/collections/botanicals_clo1/layers/key-largo_back-leaf_layer-1.png
net::ERR_FAILED 404 (Not Found)
```

**Correct path:**
```
GET https://so-animation.com/colorflex/data/collections/botanicals-clo1/layers/key-largo_back-leaf_layer-1.png
HTTP/2 200 ✅
```

## Investigation
Console output (temp.js) showed:
- Line 1227: 404 error for `botanicals_clo1/layers/...`
- Line 1226: CORS error (secondary issue from 404)
- Line 716: Code was correctly trying to load mockupLayers from collections.json
- Lines 1210-1224: Thumbnail 404s for `botanicals_clo1/thumbnails/...` (same issue)

The mockupLayers array in collections.json contained:
```json
"mockupLayers": [
  "./data/collections/botanicals_clo1/layers/key-largo_back-leaf_layer-1.png",
  "./data/collections/botanicals_clo1/layers/key-largo_left-leaves_layer-2.png",
  ...
]
```

But the actual server structure is:
```
/data/collections/botanicals-clo1/layers/ (dash, not underscore)
```

## Solution
Fixed `data/collections.json` by replacing ALL occurrences:
- `botanicals_clo1` → `botanicals-clo1`

**Command used:**
```bash
sed -i '' 's/botanicals_clo1/botanicals-clo1/g' data/collections.json
```

## Verification
Other clothing collections already had correct dash format:
- `bombay-clo1` ✅
- `traditions-clo1` ✅
- `folksie-clo1` ✅
- `geometry-clo1` ✅
- `ikats-clo1` ✅

Only botanicals had the underscore typo.

## Deployment
**File to upload:**
- `data/collections.json` → Server: `/home4/soanimat/public_html/colorflex/data/`

**Script created:**
- `./fix-clothing-paths.sh` - Automated upload script

**Manual upload via script:**
```bash
./fix-clothing-paths.sh
```

**Manual upload via SCP:**
```bash
scp data/collections.json soanimat@162.241.24.65:/home4/soanimat/public_html/colorflex/data/
```

## Expected Result After Upload
1. Hard refresh clothing page (Cmd+Shift+R)
2. Pattern layers load correctly from `botanicals-clo1/layers/`
3. Pattern renders on dress mockup
4. Thumbnails load correctly in sidebar
5. No 404 errors in console

## Why This Happened
The collections.json was likely generated or edited with incorrect directory names. The actual files on the server use dash format (`-clo1`), but the JSON metadata had underscore format (`_clo1`).

## Backup
Backup created before fix:
- `data/collections.json.backup-clothing-path-fix-[timestamp]`

## Related Files
- `src/CFM.js` - No changes needed (code is correct)
- `src/templates/page.colorflex-clothing.liquid` - No changes needed
- `data/furniture-config.json` - No changes needed
- Only `data/collections.json` needed fixing

## Status
✅ **FIXED LOCALLY** - Ready for server deployment
⏳ **PENDING UPLOAD** - User needs to run `./fix-clothing-paths.sh` or upload manually
