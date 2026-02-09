"""
ColorFlex Multi-Scale Clothing Render Script (Blender Interactive)
Version 2.0 - Simplified for Windows PC

HOW TO USE ON WINDOWS PC:
1. Copy this file to your PC
2. Copy collections.json to your PC
3. Copy pattern layer images to your PC
4. Edit CONFIGURATION section below
5. Open Blender → Scripting workspace
6. Open this file in Text Editor
7. Click "Run Script"

RECOMMENDED WORKFLOW:
- Render ONE collection at a time
- Run script once for each collection
- Change TARGET_COLLECTION in config for each run
"""

import bpy
import os
import json

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def slugify(text):
    """Convert text to URL-friendly slug"""
    return text.lower().replace(" ", "-").replace("'", "").replace("&", "")

# ============================================================================
# CONFIGURATION - EDIT THESE FOR YOUR WINDOWS PC
# ============================================================================

# Which collection to render (change for each batch)
TARGET_COLLECTION = "botanicals"  # Options: botanicals, bombay, coordinates, etc.

# WINDOWS PATHS - Update these for your PC
COLLECTIONS_JSON = r"D:\jobs-local-pc\EC\data\collections.json"
LAYERS_BASE_PATH = r"D:\jobs-local-pc\EC\data\collections"
OUTPUT_ROOT = r"D:\jobs-local-pc\EC\output"

# Garment Blender files on your PC (FULL PATHS)
GARMENT_SCENES = {
    "dress": {
        "file": r"D:\jobs-local-pc\EC\blender\dress-fabric-ready2.blend",
        "object": "dress"
    },
    "pantsuit": {
        "file": r"D:\jobs-local-pc\EC\blender\dress-fabric-girl-base2.blend",
        "object": "winter2"
    }
}

# Scale settings (don't change unless needed)
RENDER_SCALES = [1.0, 0.909, 0.833, 0.769]
SCALE_LABELS = ["1.0", "1.1", "1.2", "1.3"]

# Render quality
SAMPLES = 8
RES_X = 600
RES_Y = 800

# ============================================================================
# SCRIPT CODE - DO NOT EDIT BELOW
# ============================================================================

def load_collections_json():
    """Load collections.json file"""
    if not os.path.exists(COLLECTIONS_JSON):
        print(f"❌ ERROR: collections.json not found at: {COLLECTIONS_JSON}")
        return None

    with open(COLLECTIONS_JSON, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"✅ Loaded collections.json")
    return data

def find_collection(data, collection_name):
    """Find collection in collections.json"""
    for coll in data.get('collections', []):
        if coll.get('name', '').lower() == collection_name.lower():
            return coll
    return None

def set_uv_scale(mat, scale_value):
    """Set UV scale on material"""
    if not mat or not mat.use_nodes:
        return

    nt = mat.node_tree

    # Find or create Mapping node
    mapping = None
    for node in nt.nodes:
        if node.type == 'MAPPING':
            mapping = node
            break

    if not mapping:
        mapping = nt.nodes.new('ShaderNodeMapping')
        mapping.location = (-400, 0)

    # Set scale
    if 'Scale' in mapping.inputs:
        mapping.inputs['Scale'].default_value = (scale_value, scale_value, scale_value)

def load_image_to_material(mat, image_path):
    """Load image file onto material's image texture"""
    if not mat or not mat.use_nodes:
        return False

    # Check if image exists
    if not os.path.exists(image_path):
        print(f"      ⚠️ Image not found: {image_path}")
        return False

    # Remove old image if exists
    img_name = os.path.basename(image_path)
    if img_name in bpy.data.images:
        bpy.data.images.remove(bpy.data.images[img_name])

    # Load new image
    img = bpy.data.images.load(image_path, check_existing=False)

    # Apply to texture node
    for node in mat.node_tree.nodes:
        if node.type == 'TEX_IMAGE':
            node.image = img
            return True

    return False

def render_pattern(pattern, collection_name, garment_name, garment_obj, material):
    """Render one pattern at all scales"""

    pattern_name = pattern['name']
    pattern_slug = pattern.get('slug', slugify(pattern_name))  # Generate slug if not present
    layers = pattern.get('layers', [])
    layer_labels = pattern.get('layerLabels', [])

    if not layers:
        print(f"  ⚠️ No layers found for: {pattern_name}")
        return

    print(f"\n  📐 Pattern: {pattern_name}")
    print(f"     Layers: {len(layers)}")

    # Create output directory
    out_dir = os.path.join(OUTPUT_ROOT, f"{collection_name}-clo", "layers", garment_name)
    os.makedirs(out_dir, exist_ok=True)

    # Render each layer
    for layer_idx, layer_item in enumerate(layers, 1):
        # Handle both string and dict formats
        if isinstance(layer_item, dict):
            layer_path = layer_item.get('url', layer_item.get('path', ''))
        else:
            layer_path = layer_item

        label = layer_labels[layer_idx-1] if layer_idx-1 < len(layer_labels) else f"Layer {layer_idx}"
        label_slug = slugify(label)

        print(f"\n    Layer {layer_idx}/{len(layers)}: {label}")

        # Convert relative path to absolute
        if layer_path.startswith("./"):
            layer_path = layer_path[2:]

        # Remove data/collections/ prefix if present (already in LAYERS_BASE_PATH)
        if layer_path.startswith("data/collections/"):
            layer_path = layer_path[17:]  # Remove "data/collections/"

        full_path = os.path.join(LAYERS_BASE_PATH, layer_path.replace('/', '\\'))

        # Load image
        if not load_image_to_material(material, full_path):
            continue

        # Render at each scale
        for scale, scale_label in zip(RENDER_SCALES, SCALE_LABELS):
            # Set UV scale
            set_uv_scale(material, scale)

            # Update scene
            bpy.context.view_layer.update()

            # Output filename
            filename = f"{pattern_slug}_{label_slug}_layer-{layer_idx}_scale-{scale_label}.png"
            output_path = os.path.join(out_dir, filename)

            # Render
            bpy.context.scene.render.filepath = output_path
            bpy.ops.render.render(write_still=True)

            print(f"      ✅ {scale_label}X → {filename}")

def render_garment(collection, garment_name):
    """Render entire collection for one garment"""

    garment_info = GARMENT_SCENES[garment_name]
    blend_file = garment_info['file']
    object_name = garment_info['object']

    print(f"\n{'='*70}")
    print(f"🎭 GARMENT: {garment_name}")
    print(f"📁 Scene: {os.path.basename(blend_file)}")
    print(f"🎯 Object: {object_name}")
    print(f"{'='*70}")

    # Load blend file
    if not os.path.exists(blend_file):
        print(f"❌ Blend file not found: {blend_file}")
        return

    bpy.ops.wm.open_mainfile(filepath=blend_file)
    print(f"✅ Loaded scene")

    # Find object
    if object_name not in bpy.data.objects:
        print(f"❌ Object not found: {object_name}")
        return

    obj = bpy.data.objects[object_name]

    # Get material
    if not obj.material_slots or not obj.material_slots[0].material:
        print(f"❌ No material on object")
        return

    mat = obj.material_slots[0].material
    print(f"✅ Material: {mat.name}")

    # Setup render
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = SAMPLES
    scene.render.resolution_x = RES_X
    scene.render.resolution_y = RES_Y
    scene.render.image_settings.file_format = 'PNG'

    # Render each pattern
    patterns = collection.get('patterns', [])
    total = len(patterns)

    for idx, pattern in enumerate(patterns, 1):
        print(f"\n[{idx}/{total}] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        render_pattern(pattern, TARGET_COLLECTION, garment_name, obj, mat)

    print(f"\n✅ {garment_name.upper()} COMPLETE!")

def main():
    """Main execution"""

    try:
        print("\n" + "="*70)
        print("🎨 COLORFLEX MULTI-SCALE RENDERER v2.0")
        print("="*70)
        print(f"Collection: {TARGET_COLLECTION}")
        print(f"Output: {OUTPUT_ROOT}")
        print("="*70)
    except Exception as e:
        print(f"\n❌ ERROR AT START: {str(e)}")
        import traceback
        traceback.print_exc()
        return

    # Load collections.json
    data = load_collections_json()
    if not data:
        return

    # Find target collection
    collection = find_collection(data, TARGET_COLLECTION)
    if not collection:
        print(f"❌ Collection not found: {TARGET_COLLECTION}")
        return

    print(f"✅ Found collection: {collection['name']}")
    print(f"   Patterns: {len(collection.get('patterns', []))}")

    # Render each garment
    for garment_name in GARMENT_SCENES.keys():
        render_garment(collection, garment_name)

    print("\n" + "="*70)
    print("🎉 RENDER COMPLETE!")
    print(f"📁 Output: {OUTPUT_ROOT}\\{TARGET_COLLECTION}-clo\\layers\\")
    print("="*70 + "\n")

# Run script
if __name__ == "__main__":
    try:
        print("🚀 SCRIPT STARTED...")
        main()
    except Exception as e:
        print(f"\n{'='*70}")
        print(f"❌ FATAL ERROR:")
        print(f"{'='*70}")
        print(f"{str(e)}")
        print(f"{'='*70}\n")
        import traceback
        traceback.print_exc()
