"""
ColorFlex Multi-Scale Clothing Render Script (Blender Interactive)

HOW TO USE:
1. Open Blender (any scene)
2. Go to Scripting workspace
3. Open this file in the Text Editor
4. Edit CONFIGURATION section below (set collection name, paths)
5. Click "Run Script" button
6. Watch console for progress

This script will:
- Render ONE collection with BOTH garments (dress, pantsuit)
- Generate 4 scale levels per pattern (1.0X, 1.1X, 1.2X, 1.3X)
- Save to: {output_root}/{collection}-clo/layers/{garment}/
"""

import bpy
import os
import sys
import json
from pathlib import Path
from typing import List, Dict, Any

# ============================================================================
# CONFIGURATION - EDIT THESE VALUES
# ============================================================================

# Collection to render (change this for each batch)
TARGET_COLLECTION = "botanicals"  # Change to: bombay, coordinates, etc.

# Output directory (WINDOWS PATH - change for your PC)
OUTPUT_ROOT = r"C:\ColorFlex\data\collections"  # Windows example
# OUTPUT_ROOT = r"D:\Projects\ColorFlex\data\collections"  # Alternative

# Airtable CSV path (exported from Airtable, WINDOWS PATH)
AIRTABLE_CSV = r"C:\ColorFlex\data\shopify-import.csv"  # Windows example

# Garment configurations (WINDOWS PATHS - update for your PC)
GARMENTS = [
    {
        "name": "dress",
        "blend_file": r"C:\Blender\Scenes\dress-fabric-ready2.blend",
        "object_name": "dress"
    },
    {
        "name": "pantsuit",
        "blend_file": r"C:\Blender\Scenes\dress-fabric-girl-base2.blend",
        "object_name": "winter2"
    }
]

# Scale configuration (UV scale values and labels)
RENDER_SCALES = [1.0, 0.909, 0.833, 0.769]  # UV scales
SCALE_LABELS = ["1.0", "1.1", "1.2", "1.3"]  # User-facing labels

# Render settings
RENDER_SAMPLES = 8
RESOLUTION_X = 600
RESOLUTION_Y = 800

# ============================================================================
# DO NOT EDIT BELOW THIS LINE
# ============================================================================

def slugify(text: str) -> str:
    """Convert text to URL-friendly slug"""
    return text.lower().replace(" ", "-").replace("'", "").replace("&", "")

def load_patterns_from_csv(csv_path: str, collection: str) -> List[Dict]:
    """Load pattern data from Airtable CSV export"""
    import csv

    patterns = []

    if not os.path.exists(csv_path):
        print(f"⚠️ CSV not found: {csv_path}")
        print(f"⚠️ Please export Airtable data to this location")
        return patterns

    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Check if this row belongs to target collection
            if row.get('Collection', '').lower() != collection.lower():
                continue

            pattern_name = row.get('Pattern Name', '')
            if not pattern_name:
                continue

            # Parse layers (assuming format: "Layer 1, Layer 2, Layer 3")
            layers_str = row.get('Layers', '')
            layer_labels = [l.strip() for l in layers_str.split(',') if l.strip()]

            # Parse layer files
            layer_files = []
            for i in range(1, 10):  # Support up to 9 layers
                layer_key = f'Layer {i} File'
                if layer_key in row and row[layer_key]:
                    layer_files.append(row[layer_key])

            if not layer_files:
                print(f"⚠️ No layer files for pattern: {pattern_name}")
                continue

            patterns.append({
                'name': pattern_name,
                'slug': slugify(pattern_name),
                'layer_labels': layer_labels,
                'layer_files': layer_files,
                'tiling_type': row.get('Tiling Type', 'straight').lower()
            })

    print(f"✅ Loaded {len(patterns)} patterns from CSV")
    return patterns

def set_uv_scale(material, uv_scale: float):
    """Set UV scale on material's Mapping node"""
    if not material or not material.use_nodes:
        return

    nodes = material.node_tree.nodes
    links = material.node_tree.links

    # Find or create Mapping node
    mapping = None
    for node in nodes:
        if node.type == 'MAPPING':
            mapping = node
            break

    if not mapping:
        mapping = nodes.new('ShaderNodeMapping')
        mapping.name = 'CF_Scale_Mapping'
        mapping.location = (-400, 0)

        # Connect to texture coordinate and image texture
        tex_coord = None
        for node in nodes:
            if node.type == 'TEX_COORD':
                tex_coord = node
                break

        if not tex_coord:
            tex_coord = nodes.new('ShaderNodeTexCoord')
            tex_coord.location = (-600, 0)

        # Find image texture node
        img_tex = None
        for node in nodes:
            if node.type == 'TEX_IMAGE':
                img_tex = node
                break

        if img_tex:
            links.new(tex_coord.outputs['UV'], mapping.inputs['Vector'])
            links.new(mapping.outputs['Vector'], img_tex.inputs['Vector'])

    # Set scale
    if hasattr(mapping, 'inputs') and 'Scale' in mapping.inputs:
        mapping.inputs['Scale'].default_value = (uv_scale, uv_scale, uv_scale)

    print(f"  ✅ UV scale set to {uv_scale}")

def load_image_on_material(material, image_path: str):
    """Load image onto material's image texture node"""
    if not material or not material.use_nodes:
        return False

    # Load image
    if image_path in bpy.data.images:
        img = bpy.data.images[image_path]
        bpy.data.images.remove(img)

    img = bpy.data.images.load(image_path, check_existing=False)

    # Find image texture node
    for node in material.node_tree.nodes:
        if node.type == 'TEX_IMAGE':
            node.image = img
            print(f"  ✅ Loaded: {os.path.basename(image_path)}")
            return True

    print(f"  ⚠️ No image texture node found in material")
    return False

def render_collection(collection_name: str, garment_config: Dict):
    """Render one collection with one garment at all scales"""

    garment_name = garment_config['name']
    blend_file = garment_config['blend_file']
    object_name = garment_config['object_name']

    print(f"\n{'='*70}")
    print(f"🎭 GARMENT: {garment_name}")
    print(f"📁 Blend file: {blend_file}")
    print(f"🎯 Object: {object_name}")
    print(f"{'='*70}\n")

    # Load garment blend file
    if not os.path.exists(blend_file):
        print(f"❌ Blend file not found: {blend_file}")
        return

    bpy.ops.wm.open_mainfile(filepath=blend_file)
    print(f"✅ Loaded blend file")

    # Find garment object
    if object_name not in bpy.data.objects:
        print(f"❌ Object '{object_name}' not found in scene")
        return

    garment_obj = bpy.data.objects[object_name]
    print(f"✅ Found garment object: {object_name}")

    # Get material
    if not garment_obj.material_slots or not garment_obj.material_slots[0].material:
        print(f"❌ No material on garment object")
        return

    material = garment_obj.material_slots[0].material
    print(f"✅ Got material: {material.name}")

    # Setup render settings
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = RENDER_SAMPLES
    scene.render.resolution_x = RESOLUTION_X
    scene.render.resolution_y = RESOLUTION_Y
    scene.render.image_settings.file_format = 'PNG'

    # Load patterns
    patterns = load_patterns_from_csv(AIRTABLE_CSV, collection_name)
    if not patterns:
        print(f"❌ No patterns found for collection: {collection_name}")
        return

    # Create output directory
    output_dir = os.path.join(OUTPUT_ROOT, f"{collection_name}-clo", "layers", garment_name)
    os.makedirs(output_dir, exist_ok=True)
    print(f"✅ Output directory: {output_dir}\n")

    # Render each pattern
    total = len(patterns)
    for p_idx, pattern in enumerate(patterns, 1):
        pattern_name = pattern['name']
        pattern_slug = pattern['slug']
        layer_files = pattern['layer_files']

        print(f"\n[{p_idx}/{total}] Pattern: {pattern_name}")
        print(f"  Layers: {len(layer_files)}")

        # Render each layer at each scale
        for layer_idx, layer_file in enumerate(layer_files, 1):
            layer_label = pattern['layer_labels'][layer_idx-1] if layer_idx-1 < len(pattern['layer_labels']) else f"Layer {layer_idx}"
            layer_label_slug = slugify(layer_label)

            print(f"\n  Layer {layer_idx}/{len(layer_files)}: {layer_label}")

            # Check if layer file exists (assuming local path or URL)
            # For now, assuming files are in a layers directory
            layer_path = os.path.join(OUTPUT_ROOT.replace("collections", "collections"),
                                     collection_name, "layers", layer_file)

            if not os.path.exists(layer_path):
                print(f"    ⚠️ Layer file not found: {layer_path}")
                continue

            # Load image onto material
            if not load_image_on_material(material, layer_path):
                continue

            # Render at each scale
            for scale, scale_label in zip(RENDER_SCALES, SCALE_LABELS):
                print(f"    Scale {scale_label}X (UV {scale})...")

                # Set UV scale
                set_uv_scale(material, scale)

                # Update viewport
                bpy.context.view_layer.update()

                # Render
                output_filename = f"{pattern_slug}_{layer_label_slug}_layer-{layer_idx}_scale-{scale_label}.png"
                output_path = os.path.join(output_dir, output_filename)
                scene.render.filepath = output_path

                bpy.ops.render.render(write_still=True)

                print(f"      ✅ Saved: {output_filename}")

    print(f"\n{'='*70}")
    print(f"✅ COLLECTION COMPLETE: {collection_name}/{garment_name}")
    print(f"{'='*70}\n")

# ============================================================================
# MAIN EXECUTION
# ============================================================================

def main():
    print("\n" + "="*70)
    print("🎨 COLORFLEX MULTI-SCALE CLOTHING RENDERER")
    print("="*70)
    print(f"Collection: {TARGET_COLLECTION}")
    print(f"Garments: {len(GARMENTS)}")
    print(f"Scales: {SCALE_LABELS}")
    print(f"Output: {OUTPUT_ROOT}")
    print("="*70 + "\n")

    # Render each garment
    for garment in GARMENTS:
        render_collection(TARGET_COLLECTION, garment)

    print("\n" + "="*70)
    print("🎉 ALL GARMENTS COMPLETE!")
    print("="*70 + "\n")

# Run when script is executed
if __name__ == "__main__":
    main()
