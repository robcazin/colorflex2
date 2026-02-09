"""
ColorFlex Clothing Batch Renderer - Blender GUI Version
========================================================

INSTRUCTIONS:
1. Open this file in Blender's Text Editor (Scripting workspace)
2. Update the CONFIG section below for your PC
3. Click "Run Script" button or press Alt+P

This will render the selected collections with progress printed to console.
"""

import bpy
import json
import os
import sys
from typing import Optional, Dict, Any, List

# ═══════════════════════════════════════════════════════════════════════════
# 🔧 CONFIGURATION - EDIT THESE VALUES FOR YOUR PC
# ═══════════════════════════════════════════════════════════════════════════

CONFIG: Dict[str, Any] = {
    # ────────── FILE PATHS (Update for PC) ──────────
    # Mac example: "/Volumes/K3/jobs/saffron/colorFlex-shopify/data/collections.json"
    # PC example:  "D:/Projects/colorFlex-shopify/data/collections.json"
    "json_file_path": "/Volumes/K3/jobs/saffron/colorFlex-shopify/data/collections.json",

    # Mac example: "/Volumes/K3/jobs/saffron/colorFlex-shopify/data/collections"
    # PC example:  "D:/Projects/colorFlex-shopify/data/collections"
    "output_root": "/Volumes/K3/jobs/saffron/colorFlex-shopify/data/collections",

    # ────────── COLLECTIONS TO RENDER ──────────
    # Comment out (#) collections you DON'T want to render tonight
    "target_collections": [
        "botanicals",
        "bombay",
        # "coordinates",
        # "cottage-sketch-book",
        # "coverlets",
        # "english-cottage",
        # "farmhouse",
        # "folksie",
        # "geometry",
        # "ikats",
        # "new-orleans",
        # "silk-road",
        # "traditions",
    ],

    # ────────── GARMENTS TO RENDER ──────────
    # Both garments by default - comment out if you only want one
    "target_garments": [
        {"name": "dress", "object": "dress"},
        {"name": "pantsuit", "object": "winter2"},
    ],

    # ────────── SCENE SETTINGS ──────────
    "mockup_collection": "Clothing",
    "mannequin_collection": "Mannequin",
    "occlusion_collection": "occlusion",

    # ────────── MATERIALS ──────────
    "target_material_standard": "M_StandardTile",
    "target_material_halfdrop": "M_HalfDropTile",
    "target_tex_node": "Image Texture",

    # ────────── RENDER SETTINGS ──────────
    "engine": "CYCLES",
    "render_samples": 8,  # Lower to 4 for 2X speed
    "transparent_background": True,

    # ────────── MULTI-SCALE SETTINGS ──────────
    # UV scales: 12=0.5X, 6=normal, 5=1.25X larger, 4=1.5X larger, 3=2X larger
    "render_scales": [12, 6, 5, 4, 3],
    "scale_labels": ["0.5", "1.0", "1.25", "1.5", "2.0"],

    # ────────── BEHAVIOR ──────────
    "skip_existing": True,  # Skip files that already exist
    "generate_manifest": True,
    "max_layers": 50,

    # ────────── VIEW LAYER MANAGEMENT ──────────
    "view_layer_prefix": "VL_",
    "cleanup_old_view_layers": True,
    "use_standard_view_transform": True,
}

# ═══════════════════════════════════════════════════════════════════════════
# 🚀 RENDER CODE - DO NOT EDIT BELOW THIS LINE
# ═══════════════════════════════════════════════════════════════════════════

print("\n" + "="*70)
print("🎨 ColorFlex Clothing Batch Renderer v2.5")
print("="*70)

# Helper functions
def slugify(s: Optional[str]) -> str:
    return "" if not s else s.lower().replace(" ", "-")

def create_filename(pattern_name: str, label: str, idx: int, scale_label: str = "1.0") -> str:
    return f"{slugify(pattern_name)}_{slugify(label)}_layer-{idx}_scale-{scale_label}"

def ensure_dir(path: str):
    os.makedirs(path, exist_ok=True)

def resolve_layer_path(layer_entry) -> Optional[str]:
    p = layer_entry.get("path", layer_entry) if isinstance(layer_entry, dict) else layer_entry
    if not p:
        return None
    if not os.path.isabs(p):
        base_dir = os.path.dirname(CONFIG["json_file_path"])
        p = os.path.normpath(os.path.join(base_dir, "..", p))
    return p

def _get_target_material_name_for_tiling(tiling_type: str) -> str:
    return (CONFIG["target_material_halfdrop"]
            if str(tiling_type).lower() == "half-drop"
            else CONFIG["target_material_standard"])

def _set_uv_scale(mat: bpy.types.Material, uv_scale: float):
    """Set UV scale on material's Mapping node"""
    if not mat.node_tree:
        return
    for node in mat.node_tree.nodes:
        if node.type == 'MAPPING':
            node.inputs['Scale'].default_value = (uv_scale, uv_scale, uv_scale)
            print(f"  🔧 Set UV scale to {uv_scale}")
            bpy.context.view_layer.update()
            return

def _swap_texture(mat: bpy.types.Material, image_path: str):
    """Swap the texture in the material"""
    if not mat.node_tree:
        return False
    for node in mat.node_tree.nodes:
        if node.type == 'TEX_IMAGE' and CONFIG["target_tex_node"] in node.name:
            if os.path.exists(image_path):
                img = bpy.data.images.load(image_path, check_existing=True)
                node.image = img

                # Set interpolation to Closest for sharp textures (no softness/blur)
                node.interpolation = 'Closest'

                bpy.context.view_layer.update()
                return True
    return False

def render_pattern(collection_name: str, garment_name: str, garment_object: str, pattern_data: dict):
    """Render a single pattern with all scales"""
    pattern_name = pattern_data.get("name", "unknown")
    layers = pattern_data.get("layers", [])

    if not layers:
        print(f"  ⏭️  Skipping {pattern_name} (no layers)")
        return

    print(f"\n📐 Pattern: {pattern_name} ({len(layers)} layers)")

    # Get garment object
    obj = bpy.data.objects.get(garment_object)
    if not obj:
        print(f"  ❌ Garment object '{garment_object}' not found!")
        return

    # Get material
    tiling_type = pattern_data.get("tilingType", "standard")
    mat_name = _get_target_material_name_for_tiling(tiling_type)
    mat = bpy.data.materials.get(mat_name)
    if not mat:
        print(f"  ❌ Material '{mat_name}' not found!")
        return

    # Ensure object uses this material
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)

    # Setup output directory
    out_dir = os.path.join(
        CONFIG["output_root"],
        f"{collection_name}-clo",
        "layers",
        garment_name
    )
    ensure_dir(out_dir)

    # Render each layer at each scale
    for scale_idx, uv_scale in enumerate(CONFIG["render_scales"]):
        scale_label = CONFIG["scale_labels"][scale_idx]

        print(f"\n  🎯 Scale {scale_label}X (UV={uv_scale})")
        _set_uv_scale(mat, uv_scale)

        for layer_idx, layer_entry in enumerate(layers, start=1):
            layer_path = resolve_layer_path(layer_entry)
            if not layer_path or not os.path.exists(layer_path):
                print(f"    ⚠️  Layer {layer_idx} not found: {layer_path}")
                continue

            # Swap texture
            if not _swap_texture(mat, layer_path):
                print(f"    ❌ Failed to swap texture: {layer_path}")
                continue

            # Generate output filename
            layer_label = pattern_data.get("layerLabels", [])[layer_idx - 1] if layer_idx <= len(pattern_data.get("layerLabels", [])) else f"layer-{layer_idx}"
            filename = create_filename(pattern_name, layer_label, layer_idx, scale_label)
            output_path = os.path.join(out_dir, f"{filename}.png")

            # Skip if exists
            if CONFIG["skip_existing"] and os.path.exists(output_path):
                print(f"    ⏭️  Skip: {filename}.png (exists)")
                continue

            # Render
            print(f"    🎬 Rendering: {filename}.png")
            bpy.context.scene.render.filepath = output_path
            bpy.ops.render.render(write_still=True)
            print(f"    ✅ Saved: {filename}.png")

    print(f"  ✅ Pattern '{pattern_name}' complete!")

# Main execution
def main():
    print(f"\n📁 Loading collections from: {CONFIG['json_file_path']}")

    if not os.path.exists(CONFIG["json_file_path"]):
        print(f"❌ ERROR: collections.json not found at {CONFIG['json_file_path']}")
        print("Please update the 'json_file_path' in CONFIG section")
        return

    with open(CONFIG["json_file_path"], 'r') as f:
        data = json.load(f)

    collections = data.get("collections", [])

    # Setup render engine
    bpy.context.scene.render.engine = CONFIG["engine"]
    bpy.context.scene.cycles.samples = CONFIG["render_samples"]
    bpy.context.scene.render.film_transparent = CONFIG["transparent_background"]

    print(f"\n🎬 Render Settings:")
    print(f"  Engine: {CONFIG['engine']}")
    print(f"  Samples: {CONFIG['render_samples']}")
    print(f"  Transparent: {CONFIG['transparent_background']}")

    # Calculate total work
    total_patterns = 0
    for target_coll in CONFIG["target_collections"]:
        for coll in collections:
            if coll.get("name", "").split('.')[0] == target_coll:
                total_patterns += len(coll.get("patterns", []))

    total_renders = total_patterns * len(CONFIG["target_garments"]) * len(CONFIG["render_scales"])

    print(f"\n📊 Render Plan:")
    print(f"  Collections: {len(CONFIG['target_collections'])}")
    print(f"  Garments: {len(CONFIG['target_garments'])}")
    print(f"  Scales: {len(CONFIG['render_scales'])}")
    print(f"  Total patterns: {total_patterns}")
    print(f"  Estimated renders: ~{total_renders} files")
    print(f"\n{'='*70}")
    print("🚀 STARTING RENDER...")
    print(f"{'='*70}\n")

    # Render each collection × garment
    current = 0
    for target_coll in CONFIG["target_collections"]:
        print(f"\n{'━'*70}")
        print(f"📁 COLLECTION: {target_coll}")
        print(f"{'━'*70}")

        # Find collection in data
        coll_data = None
        for coll in collections:
            if coll.get("name", "").split('.')[0] == target_coll:
                coll_data = coll
                break

        if not coll_data:
            print(f"  ⚠️  Collection '{target_coll}' not found in collections.json")
            continue

        patterns = coll_data.get("patterns", [])
        print(f"  Found {len(patterns)} patterns")

        for garment_info in CONFIG["target_garments"]:
            garment_name = garment_info["name"]
            garment_object = garment_info["object"]

            print(f"\n  🎭 Garment: {garment_name} (object: {garment_object})")

            for pattern in patterns:
                current += 1
                render_pattern(target_coll, garment_name, garment_object, pattern)

    print(f"\n{'='*70}")
    print("🎉 RENDER COMPLETE!")
    print(f"{'='*70}")
    print(f"✅ Output: {CONFIG['output_root']}")
    print(f"{'='*70}\n")

# Run the renderer
if __name__ == "__main__":
    main()
