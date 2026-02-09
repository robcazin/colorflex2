# PC Rendering Guide for ColorFlex Clothing

## Quick Start

### 1. Copy Files to PC
Copy these to your PC:
```
render-clo-blender-gui.py  → D:/Projects/colorFlex/
collections.json           → D:/Projects/colorFlex/data/
```

### 2. Update File Paths in Script
Open `render-clo-blender-gui.py` in a text editor and update lines 22-27:

```python
# CHANGE THESE FOR YOUR PC:
"json_file_path": "D:/Projects/colorFlex/data/collections.json",
"output_root": "D:/Projects/colorFlex/data/collections",
```

Use forward slashes (`/`) even on Windows!

### 3. Open in Blender

**Option A: From Blender File**
1. Open your dress Blender file (e.g., `dress-fabric-ready2.blend`)
2. Switch to **Scripting** workspace (top tabs)
3. Click **Open** in Text Editor
4. Select `render-clo-blender-gui.py`

**Option B: New Blender Instance**
1. Open Blender
2. Go to Scripting workspace
3. Click **Open** → select the script
4. Open your scene file separately (File → Open → dress-fabric-ready2.blend)

### 4. Configure What to Render

In the script's CONFIG section (lines 30-45), comment out collections you DON'T want:

```python
"target_collections": [
    "botanicals",      # ✅ Will render
    "bombay",          # ✅ Will render
    # "coordinates",  # ❌ Won't render (commented out)
    # "english-cottage",
],
```

### 5. Run the Script

Click the **▶ Run Script** button (or press `Alt+P`)

Progress will print in:
- **Blender Console** (Window → Toggle System Console)
- **Info Editor** (bottom panel)

### 6. Monitor Progress

The script will print:
```
📊 Render Plan:
  Collections: 2
  Garments: 2
  Scales: 4
  Estimated renders: ~240 files

🚀 STARTING RENDER...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁 COLLECTION: botanicals
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Found 4 patterns

  🎭 Garment: dress (object: dress)

📐 Pattern: Flowering Fern (3 layers)
  🎯 Scale 1.0X (UV=6)
    🎬 Rendering: flowering-fern_flowers_layer-1_scale-1.0.png
    ✅ Saved: flowering-fern_flowers_layer-1_scale-1.0.png
```

## Tips for PC Rendering

### Speed Up Renders
In CONFIG section, change:
```python
"render_samples": 4,  # Changed from 8 (2X faster)
```

### Render Specific Garment Only
Comment out the garment you don't want:
```python
"target_garments": [
    {"name": "dress", "object": "dress"},
    # {"name": "pantsuit", "object": "winter2"},  # Skip pantsuit
],
```

### Skip Existing Files
Already rendered some? Keep this on:
```python
"skip_existing": True,  # Won't re-render existing files
```

## Nightly Batch Rendering

### Night 1: Botanicals + Bombay (~1,200 files, ~9 hours)
```python
"target_collections": [
    "botanicals",
    "bombay",
],
```

### Night 2: English Cottage + Coordinates (~1,700 files, ~13 hours)
```python
"target_collections": [
    "english-cottage",
    "coordinates",
],
```

### Night 3: Traditions + Silk Road + Folksie (~1,800 files, ~14 hours)
```python
"target_collections": [
    "traditions",
    "silk-road",
    "folksie",
],
```

### Night 4: Remaining Collections
```python
"target_collections": [
    "cottage-sketch-book",
    "coverlets",
    "farmhouse",
    "geometry",
    "ikats",
    "new-orleans",
],
```

## Troubleshooting

### "collections.json not found"
- Check the `json_file_path` is correct
- Use forward slashes: `D:/Projects/` not `D:\Projects\`

### "Garment object 'dress' not found"
- Make sure you opened the correct Blender file first
- Check object exists in Outliner

### "Material 'M_StandardTile' not found"
- Verify material names match your Blender file
- Check CONFIG lines 57-59

### Script stops unexpectedly
- Check Blender console for errors (Window → Toggle System Console)
- Make sure output directory is writable

## Output Location

Files render to:
```
D:/Projects/colorFlex/data/collections/
  botanicals-clo/
    layers/
      dress/
        flowering-fern_flowers_layer-1_scale-1.0.png
        flowering-fern_flowers_layer-1_scale-1.2.png
        ...
      pantsuit/
        ...
```

Copy these back to Mac when done!
