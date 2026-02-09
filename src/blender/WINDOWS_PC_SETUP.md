# ColorFlex Rendering on Windows PC - Setup Guide

## Step 1: Copy Files to Your PC

### Required Files:
```
C:\ColorFlex\
  ├── data\
  │   ├── collections.json          (from your Mac)
  │   └── collections\              (layer image folders)
  │       ├── botanicals\
  │       │   └── layers\
  │       │       └── *.jpg files
  │       ├── bombay\
  │       │   └── layers\
  │       │       └── *.jpg files
  │       └── ... (other collections)
  │
  ├── blender\
  │   ├── render-single-collection.py   (the script)
  │   ├── dress-fabric-ready2.blend
  │   └── dress-fabric-girl-base2.blend
  │
  └── output\                       (will be created automatically)
```

### Files to Copy from Mac:
1. **Collections data:**
   - `/Volumes/K3/jobs/saffron/colorFlex-shopify/data/collections.json`
   - `/Volumes/K3/jobs/saffron/colorFlex-shopify/data/collections/*/layers/*.jpg`

2. **Blender files:**
   - `/Volumes/K3/jobs/saffron/blender/dress-fabric-ready2.blend`
   - `/Volumes/K3/jobs/saffron/blender/dress-fabric-girl-base2.blend`

3. **Render script:**
   - `/Volumes/K3/jobs/saffron/colorFlex-shopify/src/blender/render-single-collection.py`

---

## Step 2: Edit Script Configuration

Open `render-single-collection.py` in a text editor and update these lines:

```python
# CONFIGURATION - EDIT THESE FOR YOUR WINDOWS PC

# Which collection to render
TARGET_COLLECTION = "botanicals"  # Change for each batch

# WINDOWS PATHS - Update these
COLLECTIONS_JSON = r"C:\ColorFlex\data\collections.json"
LAYERS_BASE_PATH = r"C:\ColorFlex\data\collections"
OUTPUT_ROOT = r"C:\ColorFlex\output"

# Garment Blender files (FULL PATHS)
GARMENT_SCENES = {
    "dress": {
        "file": r"C:\ColorFlex\blender\dress-fabric-ready2.blend",
        "object": "dress"
    },
    "pantsuit": {
        "file": r"C:\ColorFlex\blender\dress-fabric-girl-base2.blend",
        "object": "winter2"
    }
}
```

**IMPORTANT:** Use `r"C:\path"` format (raw strings) for Windows paths!

---

## Step 3: Run in Blender

### Method 1: Blender GUI (Recommended)
1. Open Blender
2. Switch to **Scripting** workspace (top menu)
3. Click **Open** in Text Editor panel
4. Select `render-single-collection.py`
5. Click **Run Script** button (▶ icon)
6. Watch **System Console** for progress (Window → Toggle System Console)

### Method 2: Command Line
```cmd
cd C:\ColorFlex\blender
"C:\Program Files\Blender Foundation\Blender 3.6\blender.exe" ^
  --background ^
  --python render-single-collection.py
```

---

## Step 4: Render Each Collection

Edit `TARGET_COLLECTION` in the script and run for each:

```python
# Batch 1
TARGET_COLLECTION = "botanicals"  # Run script

# Batch 2
TARGET_COLLECTION = "bombay"  # Run script

# Batch 3
TARGET_COLLECTION = "coordinates"  # Run script

# ... etc for all 13 collections
```

---

## Collections to Render

```python
COLLECTIONS = [
    "botanicals",
    "bombay",
    "coordinates",
    "cottage-sketch-book",
    "coverlets",
    "english-cottage",
    "farmhouse",
    "folksie",
    "geometry",
    "ikats",
    "new-orleans",
    "silk-road",
    "traditions"
]
```

---

## Output Structure

After rendering, your output will be:

```
C:\ColorFlex\output\
  ├── botanicals-clo\
  │   └── layers\
  │       ├── dress\
  │       │   ├── botanical-stems_silhouettes_layer-1_scale-1.0.png
  │       │   ├── botanical-stems_silhouettes_layer-1_scale-1.1.png
  │       │   ├── botanical-stems_silhouettes_layer-1_scale-1.2.png
  │       │   └── botanical-stems_silhouettes_layer-1_scale-1.3.png
  │       └── pantsuit\
  │           ├── botanical-stems_silhouettes_layer-1_scale-1.0.png
  │           └── ... (same files)
  │
  ├── bombay-clo\
  │   └── layers\
  │       ├── dress\
  │       └── pantsuit
  │
  └── ... (other collections)
```

---

## Progress Monitoring

In Blender's **System Console** you'll see:

```
==================================================================
🎨 COLORFLEX MULTI-SCALE RENDERER v2.0
==================================================================
Collection: botanicals
Output: C:\ColorFlex\output
==================================================================
✅ Loaded collections.json
✅ Found collection: botanicals
   Patterns: 4

==================================================================
🎭 GARMENT: dress
📁 Scene: dress-fabric-ready2.blend
🎯 Object: dress
==================================================================
✅ Loaded scene
✅ Material: Material.001

[1/4] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  📐 Pattern: botanical-stems
     Layers: 1

    Layer 1/1: Silhouettes
      ✅ 1.0X → botanical-stems_silhouettes_layer-1_scale-1.0.png
      ✅ 1.1X → botanical-stems_silhouettes_layer-1_scale-1.1.png
      ✅ 1.2X → botanical-stems_silhouettes_layer-1_scale-1.2.png
      ✅ 1.3X → botanical-stems_silhouettes_layer-1_scale-1.3.png

... (continues for all patterns)
```

---

## Estimated Time

- **Per pattern:** ~2-3 minutes (4 scales × 2 garments × ~20 sec/render)
- **Botanicals (4 patterns):** ~10 minutes
- **Bombay (34 patterns):** ~90 minutes
- **All 13 collections:** ~5-8 hours total

On a powerful PC with GPU, this should be MUCH faster than the Mac!

---

## Troubleshooting

### "collections.json not found"
- Check path: `COLLECTIONS_JSON = r"C:\ColorFlex\data\collections.json"`
- Make sure you copied the file from Mac

### "Blend file not found"
- Check paths in `GARMENT_SCENES`
- Use full absolute paths with `r"C:\..."` format

### "Image not found"
- Check `LAYERS_BASE_PATH = r"C:\ColorFlex\data\collections"`
- Make sure all layer JPG files are copied from Mac
- Layer paths in collections.json use forward slashes: `./data/collections/botanicals/layers/file.jpg`

### Script runs but no output
- Check `OUTPUT_ROOT` path
- Make sure Blender has write permissions to that folder
- Look for error messages in System Console

---

## After Rendering

1. **Verify output files:**
   ```cmd
   dir /s C:\ColorFlex\output\botanicals-clo\layers\dress\*.png
   ```

2. **Copy back to Mac:**
   - Use USB drive, network share, or cloud storage
   - Copy entire `output\` folder back to Mac
   - Place at: `/Volumes/K3/jobs/saffron/colorFlex-shopify/data/collections/`

3. **Continue workflow on Mac:**
   - Run `update-clo2-collection.py` to update collections.json
   - Deploy to server
   - Update Shopify

---

## Quick Reference

**Start rendering:**
1. Edit `TARGET_COLLECTION = "botanicals"`
2. Open Blender → Scripting
3. Open script → Run Script
4. Wait for completion
5. Change collection name
6. Repeat

**Monitor progress:**
- Window → Toggle System Console

**Kill if needed:**
- Close Blender (will stop at current pattern)
- Or: File → Quit

---

## Performance Tips

1. **Close other programs** to free up GPU/RAM
2. **Disable viewport rendering** (Blender should already be in background mode when script runs)
3. **Run overnight** for all collections
4. **Use SSD** for input/output files if possible
5. **GPU rendering**: Make sure Cycles is set to GPU Compute in Blender Preferences

---

## Notes

- Script automatically creates output directories
- Each collection renders BOTH garments (dress + pantsuit)
- Each pattern renders ALL scales (1.0X, 1.1X, 1.2X, 1.3X)
- Progress is printed to console in real-time
- Safe to run multiple times (will overwrite existing files)
