# in3D + Blender + ColorFlex Prototype Workflow
**Date:** December 4, 2025
**Status:** Prototype Phase - No API Required

---

## Overview

This document outlines how to create a working ColorFlex + in3D demo using Blender and the in3D web interface, **without waiting for API access**.

---

## Phase 1: Generate in3D Avatars

### Step 1: Create Avatars via in3D Web Interface

**URL:** https://in3d.io/

**Process:**
1. **Sign up / Log in** to in3D web app
2. **Upload photos** (or use phone camera):
   - Front view
   - Side view (optional for better accuracy)
3. **Generate avatar** - Takes ~60 seconds
4. **Download as GLB**:
   - Click "Export"
   - Select format: **GLB** (recommended for web)
   - Resolution: **2048×2048 texture** (highest quality)
   - Save to: `/Volumes/K3/jobs/saffron/colorFlex-shopify/assets/avatars/`

**File naming convention:**
```
avatar_male_medium_john.glb
avatar_female_small_sarah.glb
avatar_female_large_maria.glb
```

### Step 2: Organize Avatar Assets

```
/assets/avatars/
├── README.md (notes on each avatar)
├── avatar_male_medium_john.glb (John - 5'10", 170 lbs)
├── avatar_female_small_sarah.glb (Sarah - 5'4", 120 lbs)
└── avatar_female_large_maria.glb (Maria - 5'8", 180 lbs)
```

**Expected file size:** 5-15 MB each (depends on texture quality)

---

## Phase 2: Blender Setup

### Prerequisites

**Software:**
- Blender 3.6+ (download from blender.org)
- Python 3.10+ (comes with Blender)

**Blender Add-ons (built-in):**
- glTF 2.0 Importer/Exporter (should be enabled by default)

### Import in3D Avatar

**Manual Method:**
1. Open Blender
2. `File → Import → glTF 2.0 (.glb/.gltf)`
3. Select avatar GLB file
4. Avatar should load with textures

**Python Script Method:**
```python
import bpy

# Clear scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# Import avatar
avatar_path = "/Volumes/K3/jobs/saffron/colorFlex-shopify/assets/avatars/avatar_female_medium.glb"
bpy.ops.import_scene.gltf(filepath=avatar_path)

print("✅ Avatar imported successfully")
```

---

## Phase 3: Create Garment Geometry

### Option A: Simple Dress (Quick Test)

**Use Blender's built-in tools:**

```python
import bpy

# Create dress base (cylinder)
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.3,
    depth=1.2,
    location=(0, 0, 1)
)
dress = bpy.context.active_object
dress.name = "Dress"

# Add subdivision for smooth look
mod = dress.modifiers.new(name="Subdivision", type='SUBSURF')
mod.levels = 2

# Add Shrinkwrap modifier to fit avatar
shrinkwrap = dress.modifiers.new(name="Shrinkwrap", type='SHRINKWRAP')
shrinkwrap.target = bpy.data.objects['Avatar']  # Adjust name if needed
shrinkwrap.wrap_method = 'PROJECT'
shrinkwrap.offset = 0.02  # Small gap from body
```

### Option B: Import Vogue Pattern (Advanced)

**If you have DXF files from Vogue patterns:**

1. Install DXF importer add-on (if not built-in)
2. Import pattern pieces
3. Use Array modifier + Curve modifier to wrap around avatar
4. Use Solidify modifier to give thickness

**Python example:**
```python
import bpy

# Import DXF pattern
bpy.ops.import_scene.dxf(filepath="/path/to/vogue_pattern_bodice.dxf")

# Convert to mesh and modify (requires manual adjustment)
```

**Note:** DXF import is complex. For prototype, stick with Option A.

---

## Phase 4: Apply ColorFlex Texture

### ColorFlex Pattern Integration

**Step 1: Get ColorFlex Pattern Image**

Use existing ColorFlex patterns from server:
```
https://so-animation.com/colorflex/data/collections/bombay/thumbnails/delhi-large.jpg
https://so-animation.com/colorflex/data/collections/english-cottage/thumbnails/keswick.jpg
https://so-animation.com/colorflex/data/collections/botanicals/thumbnails/nile-valley.jpg
```

Or generate custom proof:
1. Open ColorFlex page
2. Select pattern + colors
3. Click "Download Proof"
4. Save as: `/assets/patterns/custom_pattern_proof.jpg`

**Step 2: Apply Texture in Blender**

**Manual Method:**
1. Select garment object
2. Switch to Shading workspace
3. Add → Texture → Image Texture
4. Open ColorFlex pattern image
5. Connect Image Texture → Base Color on Principled BSDF

**Python Script:**
```python
import bpy

# Get garment object
dress = bpy.data.objects['Dress']

# Create material
mat = bpy.data.materials.new(name="ColorFlex_Pattern")
mat.use_nodes = True
dress.data.materials.append(mat)

# Get nodes
nodes = mat.node_tree.nodes
links = mat.node_tree.links

# Clear default nodes
nodes.clear()

# Add Principled BSDF
bsdf = nodes.new('ShaderNodeBsdfPrincipled')
bsdf.location = (0, 0)

# Add Material Output
output = nodes.new('ShaderNodeOutputMaterial')
output.location = (300, 0)

# Add Image Texture
tex_node = nodes.new('ShaderNodeTexImage')
tex_node.location = (-300, 0)

# Load ColorFlex pattern
pattern_path = "/Volumes/K3/jobs/saffron/colorFlex-shopify/assets/patterns/delhi-large.jpg"
tex_node.image = bpy.data.images.load(pattern_path)

# Connect nodes
links.new(tex_node.outputs['Color'], bsdf.inputs['Base Color'])
links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])

print("✅ ColorFlex pattern applied")
```

### Step 3: UV Unwrapping (If Needed)

If texture looks stretched:

```python
import bpy

dress = bpy.data.objects['Dress']

# Select dress and enter Edit mode
bpy.context.view_layer.objects.active = dress
bpy.ops.object.mode_set(mode='EDIT')

# Select all faces
bpy.ops.mesh.select_all(action='SELECT')

# Smart UV Project
bpy.ops.uv.smart_project(angle_limit=66, island_margin=0.02)

# Return to Object mode
bpy.ops.object.mode_set(mode='OBJECT')

print("✅ UV unwrapping complete")
```

---

## Phase 5: Lighting & Camera Setup

### Professional Lighting Rig

```python
import bpy
import math

# Clear existing lights
for obj in bpy.data.objects:
    if obj.type == 'LIGHT':
        bpy.data.objects.remove(obj, do_unlink=True)

# Key light (main light)
bpy.ops.object.light_add(type='AREA', location=(3, -3, 4))
key_light = bpy.context.active_object
key_light.data.energy = 300
key_light.data.size = 2
key_light.rotation_euler = (math.radians(45), 0, math.radians(45))

# Fill light (soften shadows)
bpy.ops.object.light_add(type='AREA', location=(-3, -3, 3))
fill_light = bpy.context.active_object
fill_light.data.energy = 150
fill_light.data.size = 2

# Back light (rim light)
bpy.ops.object.light_add(type='AREA', location=(0, 3, 3))
back_light = bpy.context.active_object
back_light.data.energy = 200
back_light.data.size = 1.5

print("✅ Lighting setup complete")
```

### Camera Setup

```python
import bpy
import math

# Add camera
bpy.ops.object.camera_add(location=(0, -3, 1.5))
camera = bpy.context.active_object

# Point camera at avatar
camera.rotation_euler = (math.radians(90), 0, 0)

# Set as active camera
bpy.context.scene.camera = camera

print("✅ Camera setup complete")
```

---

## Phase 6: Rendering & Export

### Render Still Image

**For screenshots/presentations:**

```python
import bpy

# Set render settings
scene = bpy.context.scene
scene.render.engine = 'CYCLES'  # Or 'EEVEE' for faster render
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.image_settings.file_format = 'PNG'

# Output path
scene.render.filepath = "/Volumes/K3/jobs/saffron/colorFlex-shopify/renders/colorflex_avatar_demo.png"

# Render
bpy.ops.render.render(write_still=True)

print("✅ Render complete")
```

### Export as GLB (for Web Viewer)

**Export avatar + garment + textures:**

```python
import bpy

# Select avatar and garment
avatar = bpy.data.objects['Avatar']  # Adjust name
dress = bpy.data.objects['Dress']

bpy.ops.object.select_all(action='DESELECT')
avatar.select_set(True)
dress.select_set(True)

# Export as GLB
output_path = "/Volumes/K3/jobs/saffron/colorFlex-shopify/assets/exports/colorflex_demo_avatar.glb"

bpy.ops.export_scene.gltf(
    filepath=output_path,
    export_format='GLB',
    export_textures=True,
    export_materials='EXPORT',
    export_selected=True
)

print(f"✅ Exported to: {output_path}")
```

---

## Phase 7: Three.js Web Viewer Integration

### Use Prototype Viewer

**File:** `docs/in3d-prototype-viewer.html`

**How to use:**

1. **Place GLB files** in correct location:
```bash
mkdir -p /Volumes/K3/jobs/saffron/colorFlex-shopify/assets/avatars
mv colorflex_demo_avatar.glb /Volumes/K3/jobs/saffron/colorFlex-shopify/assets/avatars/avatar_female_medium.glb
```

2. **Start local server** (required for loading GLB files):
```bash
cd /Volumes/K3/jobs/saffron/colorFlex-shopify
python3 -m http.server 8000
```

3. **Open viewer** in browser:
```
http://localhost:8000/docs/in3d-prototype-viewer.html
```

4. **Test functionality:**
   - Click "Female - Small Build" to load avatar
   - Click pattern buttons to apply ColorFlex textures
   - Use "Rotate View" and camera controls
   - Capture screenshot for presentation

---

## Complete Blender Script

**Save as:** `blender_colorflex_prototype.py`

```python
import bpy
import math

# ============================================================================
# ColorFlex + in3D Blender Prototype Script
# ============================================================================

# Configuration
AVATAR_PATH = "/Volumes/K3/jobs/saffron/colorFlex-shopify/assets/avatars/avatar_female_medium.glb"
PATTERN_PATH = "/Volumes/K3/jobs/saffron/colorFlex-shopify/assets/patterns/delhi-large.jpg"
OUTPUT_PATH = "/Volumes/K3/jobs/saffron/colorFlex-shopify/assets/exports/colorflex_demo_avatar.glb"
RENDER_PATH = "/Volumes/K3/jobs/saffron/colorFlex-shopify/renders/colorflex_avatar_demo.png"

# ============================================================================
# Step 1: Clear Scene
# ============================================================================
print("🧹 Clearing scene...")
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

for block in bpy.data.meshes:
    if block.users == 0:
        bpy.data.meshes.remove(block)

for block in bpy.data.materials:
    if block.users == 0:
        bpy.data.materials.remove(block)

for block in bpy.data.textures:
    if block.users == 0:
        bpy.data.textures.remove(block)

for block in bpy.data.images:
    if block.users == 0:
        bpy.data.images.remove(block)

# ============================================================================
# Step 2: Import Avatar
# ============================================================================
print(f"📥 Importing avatar: {AVATAR_PATH}")
bpy.ops.import_scene.gltf(filepath=AVATAR_PATH)

# Get imported avatar (assumes single object or parent)
avatar = None
for obj in bpy.context.scene.objects:
    if obj.type == 'MESH' or obj.type == 'ARMATURE':
        avatar = obj
        break

if not avatar:
    print("❌ No avatar found after import")
    exit()

avatar.name = "Avatar"
print(f"✅ Avatar imported: {avatar.name}")

# ============================================================================
# Step 3: Create Simple Dress Geometry
# ============================================================================
print("👗 Creating dress geometry...")
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.35,
    depth=1.2,
    location=(0, 0, 1)
)
dress = bpy.context.active_object
dress.name = "Dress"

# Add subdivision surface
mod_subsurf = dress.modifiers.new(name="Subdivision", type='SUBSURF')
mod_subsurf.levels = 2

# Add shrinkwrap to fit avatar
mod_shrink = dress.modifiers.new(name="Shrinkwrap", type='SHRINKWRAP')
mod_shrink.target = avatar
mod_shrink.wrap_method = 'PROJECT'
mod_shrink.offset = 0.02

print("✅ Dress created")

# ============================================================================
# Step 4: Apply ColorFlex Texture
# ============================================================================
print(f"🎨 Applying ColorFlex pattern: {PATTERN_PATH}")

# Create material
mat = bpy.data.materials.new(name="ColorFlex_Pattern")
mat.use_nodes = True
dress.data.materials.clear()
dress.data.materials.append(mat)

# Setup nodes
nodes = mat.node_tree.nodes
links = mat.node_tree.links
nodes.clear()

# Principled BSDF
bsdf = nodes.new('ShaderNodeBsdfPrincipled')
bsdf.location = (0, 0)

# Material Output
output = nodes.new('ShaderNodeOutputMaterial')
output.location = (300, 0)

# Image Texture
tex_node = nodes.new('ShaderNodeTexImage')
tex_node.location = (-300, 0)
tex_node.image = bpy.data.images.load(PATTERN_PATH)

# Connect
links.new(tex_node.outputs['Color'], bsdf.inputs['Base Color'])
links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])

print("✅ Pattern applied")

# ============================================================================
# Step 5: UV Unwrap Dress
# ============================================================================
print("🗺️  UV unwrapping...")
bpy.context.view_layer.objects.active = dress
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.uv.smart_project(angle_limit=66, island_margin=0.02)
bpy.ops.object.mode_set(mode='OBJECT')

print("✅ UV unwrapping complete")

# ============================================================================
# Step 6: Setup Lighting
# ============================================================================
print("💡 Setting up lights...")

# Key light
bpy.ops.object.light_add(type='AREA', location=(3, -3, 4))
key_light = bpy.context.active_object
key_light.data.energy = 300
key_light.data.size = 2
key_light.rotation_euler = (math.radians(45), 0, math.radians(45))

# Fill light
bpy.ops.object.light_add(type='AREA', location=(-3, -3, 3))
fill_light = bpy.context.active_object
fill_light.data.energy = 150
fill_light.data.size = 2

# Back light
bpy.ops.object.light_add(type='AREA', location=(0, 3, 3))
back_light = bpy.context.active_object
back_light.data.energy = 200
back_light.data.size = 1.5

print("✅ Lighting complete")

# ============================================================================
# Step 7: Setup Camera
# ============================================================================
print("📷 Setting up camera...")
bpy.ops.object.camera_add(location=(0, -3, 1.5))
camera = bpy.context.active_object
camera.rotation_euler = (math.radians(90), 0, 0)
bpy.context.scene.camera = camera

print("✅ Camera setup complete")

# ============================================================================
# Step 8: Render Image
# ============================================================================
print(f"🎬 Rendering to: {RENDER_PATH}")
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.image_settings.file_format = 'PNG'
scene.render.filepath = RENDER_PATH

bpy.ops.render.render(write_still=True)

print("✅ Render complete")

# ============================================================================
# Step 9: Export GLB for Web
# ============================================================================
print(f"💾 Exporting GLB to: {OUTPUT_PATH}")

bpy.ops.object.select_all(action='DESELECT')
avatar.select_set(True)
dress.select_set(True)

bpy.ops.export_scene.gltf(
    filepath=OUTPUT_PATH,
    export_format='GLB',
    export_textures=True,
    export_materials='EXPORT',
    export_selected=True
)

print("✅ Export complete")

# ============================================================================
# COMPLETE!
# ============================================================================
print("")
print("=" * 60)
print("✅ ColorFlex + in3D Prototype Complete!")
print("=" * 60)
print(f"📸 Rendered image: {RENDER_PATH}")
print(f"💾 Web-ready GLB: {OUTPUT_PATH}")
print("")
print("Next steps:")
print("1. Open rendered image to verify look")
print("2. Load GLB in Three.js viewer (docs/in3d-prototype-viewer.html)")
print("3. Test pattern swapping in web viewer")
print("=" * 60)
```

**To run:**
```bash
/Applications/Blender.app/Contents/MacOS/Blender --background --python blender_colorflex_prototype.py
```

---

## Testing Checklist

- [ ] in3D avatar downloads as GLB (5-15 MB)
- [ ] Avatar imports into Blender with textures
- [ ] Dress geometry fits avatar body
- [ ] ColorFlex pattern texture applies correctly
- [ ] Lighting looks professional (no harsh shadows)
- [ ] Rendered image shows pattern clearly
- [ ] GLB exports with textures included
- [ ] Web viewer loads avatar and garment
- [ ] Pattern swapping works in viewer
- [ ] Camera controls work smoothly

---

## Troubleshooting

### Avatar imports but no textures
- Check if GLB includes embedded textures (in3D should embed by default)
- Try re-exporting from in3D with "Include Textures" checked

### Dress doesn't fit avatar
- Adjust Shrinkwrap modifier offset (try 0.01 to 0.05)
- Change wrap method from PROJECT to TARGET_PROJECT
- Ensure avatar is selected as Shrinkwrap target

### Pattern looks stretched
- UV unwrap the dress mesh (Edit mode → Select All → U → Smart UV Project)
- Adjust texture repeat in Shading workspace

### Render is too dark
- Increase light energy values (300-500 for key light)
- Add environment lighting (World → Background → Strength = 0.3)

### GLB file too large (>50 MB)
- Reduce texture resolution in pattern image (resize to 2048×2048)
- Use JPEG instead of PNG for patterns
- Enable "Compression" in GLB export settings

---

## Next Steps After Prototype

Once prototype validates the concept:

1. **Contact in3D for API access** - Show them working demo
2. **Integrate with ColorFlex clothing page** - Add avatar viewer
3. **Build production pipeline** - Automate Blender processing
4. **Add measurement extraction** - Use avatar data for sizing
5. **Implement kiosk UI** - Full customer experience

---

**Ready to build! Start with generating 2-3 test avatars from in3D.**
