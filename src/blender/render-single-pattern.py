#!/usr/bin/env python3
"""
Render a single pattern for clothing mode
Usage: blender dress-fabric-ready2.blend --background --python render-single-pattern.py -- --collection=folksie --pattern="Folk Sketches" --garment=dress
"""

import bpy
import json
import os
import sys
import time
import math
from typing import Optional, Dict, Any, List

# Debug log file - Mac paths
DEBUG_LOG = "/Volumes/K3/jobs/saffron/colorFlex-shopify/render-debug.log"

def debug_log(msg: str):
    """Write to debug log file and print to console"""
    print(msg)
    with open(DEBUG_LOG, 'a') as f:
        f.write(msg + "\n")

print("--- SINGLE PATTERN RENDERER v1.0 ---")
# Clear debug log
open(DEBUG_LOG, 'w').close()
debug_log("=== RENDER DEBUG LOG ===\n")

# Parse command line arguments
target_collection = None
target_pattern = None
garment_name = "dress"
garment_object = "dress"
rotation_degrees = 0.0

for i, arg in enumerate(sys.argv):
    if arg.startswith("--collection="):
        target_collection = arg.split("=")[1]
    elif arg.startswith("--pattern="):
        target_pattern = arg.split("=")[1]
    elif arg.startswith("--garment="):
        garment_name = arg.split("=")[1]
    elif arg.startswith("--garment-object="):
        garment_object = arg.split("=")[1]
    elif arg.startswith("--rotation="):
        rotation_degrees = float(arg.split("=")[1])

if not target_collection or not target_pattern:
    print("❌ Error: Must specify --collection and --pattern")
    print("Example: --collection=folksie --pattern=\"Folk Sketches\" --garment=dress")
    sys.exit(1)

print(f"🎯 Collection: {target_collection}")
print(f"🎨 Pattern: {target_pattern}")
print(f"👗 Garment: {garment_name} (object: {garment_object})")
if rotation_degrees != 0:
    print(f"🔄 Rotation: {rotation_degrees}°")

CONFIG: Dict[str, Any] = {
    # Data - Mac paths
    "json_file_path": "/Volumes/K3/jobs/saffron/colorFlex-shopify/src/assets/collections.json",
    "output_root": "/Volumes/K3/jobs/saffron/colorFlex-shopify/data/collections",

    # Target
    "target_collection": target_collection,
    "target_pattern": target_pattern,
    "garment_name": garment_name,
    "rotation_degrees": rotation_degrees,

    # Scene setup
    "mockup_collection": "Clothing",
    "mannequin_collection": "Mannequin",
    "occlusion_collection": "occlusion",
    "mockup_object": garment_object,
    "target_material_standard": "M_StandardTile",
    "target_material_halfdrop": "M_HalfDropTile",
    "target_tex_node": "Image Texture",

    # Render settings
    "engine": "BLENDER_EEVEE_NEXT",
    "render_samples": 4,
    "transparent_background": True,

    # Multi-scale rendering (UV values: higher = smaller pattern = more repeats)
    "render_scales": [12, 6, 5, 4, 3],
    "scale_labels": ["0.5", "1.0", "1.25", "1.5", "2.0"],

    # Output
    "generate_manifest": True,
}

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
        # Go up two levels: src/assets -> src -> project root
        p = os.path.normpath(os.path.join(base_dir, "../..", p))
    return p

def _get_target_material_name_for_tiling(tiling_type: str) -> str:
    return (CONFIG["target_material_halfdrop"]
            if str(tiling_type).lower() == "half-drop"
            else CONFIG["target_material_standard"])

def _set_uv_scale(mat: bpy.types.Material, uv_scale: float, rotation_radians: float = 0.0):
    """Set UV scale and rotation on Mapping node"""
    if not mat.use_nodes:
        debug_log(f"      ⚠️  Material has no nodes for UV scale")
        return

    mapping_node = None
    for node in mat.node_tree.nodes:
        if node.type == 'MAPPING':
            mapping_node = node

            # Check if Mapping node is connected
            has_input = any(link for socket in node.inputs for link in socket.links)
            has_output = any(link for socket in node.outputs for link in socket.links)
            debug_log(f"      🔗 Mapping node connections: input={has_input}, output={has_output}")

            # Set scale and rotation
            node.inputs['Scale'].default_value = (uv_scale, uv_scale, uv_scale)
            if rotation_radians != 0:
                node.inputs['Rotation'].default_value = (0, 0, rotation_radians)
                debug_log(f"      🔄 Set rotation to {math.degrees(rotation_radians)}° on Mapping node")
                debug_log(f"      📊 Rotation value: {node.inputs['Rotation'].default_value}")
            return

    if not mapping_node:
        debug_log(f"      ⚠️  No Mapping node found in material {mat.name}")

def _swap_image_texture(mat: bpy.types.Material, new_image_path: str):
    """Swap image in Image Texture node"""
    if not mat.use_nodes:
        debug_log(f"      ⚠️  Material {mat.name} has no nodes!")
        return

    # Debug: List all texture nodes
    tex_nodes = [n for n in mat.node_tree.nodes if n.type == 'TEX_IMAGE']
    debug_log(f"      🔍 Found {len(tex_nodes)} texture nodes: {[n.name for n in tex_nodes]}")

    for node in mat.node_tree.nodes:
        if node.type == 'TEX_IMAGE' and node.name == CONFIG["target_tex_node"]:
            if os.path.exists(new_image_path):
                # Force reload: Remove existing image from cache if present
                img_name = os.path.basename(new_image_path)
                existing_img = bpy.data.images.get(img_name)
                if existing_img:
                    debug_log(f"      🔄 Removing cached image: {img_name}")
                    bpy.data.images.remove(existing_img)

                # Load fresh from disk
                img = bpy.data.images.load(new_image_path, check_existing=False)
                node.image = img

                # Set interpolation to Closest for sharp textures (no softness/blur)
                node.interpolation = 'Closest'

                debug_log(f"      ✓ Loaded fresh: {new_image_path}")
                debug_log(f"      📁 Full path: {new_image_path}")
                debug_log(f"      🎯 Assigned to node: {node.name}")
                debug_log(f"      🔪 Interpolation: Closest (sharp)")
            else:
                debug_log(f"      ⚠️  Missing: {new_image_path}")
            return

    # If we got here, the target node wasn't found
    debug_log(f"      ⚠️  Node '{CONFIG['target_tex_node']}' not found in material {mat.name}")

def cleanup_view_layers():
    """Remove all view layers except ViewLayer (default)"""
    sc = bpy.context.scene
    default_vl = sc.view_layers.get("ViewLayer")

    if not default_vl:
        # If no default, create one
        default_vl = sc.view_layers.new("ViewLayer")

    # Remove all other view layers
    to_remove = [vl for vl in sc.view_layers if vl != default_vl]
    for vl in to_remove:
        print(f"   Removing old view layer: {vl.name}")
        sc.view_layers.remove(vl)

    # With only one view layer remaining, it will automatically be active
    print(f"   ✓ Using view layer: {default_vl.name}")
    print(f"   ✓ Total view layers: {len(sc.view_layers)}")

def render_pattern(pattern_data: dict, collection_name: str):
    """Render a single pattern at all scales"""

    pattern_name = pattern_data.get("name", "Unknown")
    layers = pattern_data.get("layers", [])
    layer_labels = pattern_data.get("layerLabels", [])
    tiling_type = pattern_data.get("tilingType", "standard")

    if not layers:
        print(f"❌ Pattern has no layers: {pattern_name}")
        return

    print(f"\n🎨 Rendering: {pattern_name} ({len(layers)} layers)")

    # Clean up old view layers to prevent rendering multiple scenes
    cleanup_view_layers()

    # CRITICAL: Disable compositor to prevent image override
    scene = bpy.context.scene
    if scene.use_nodes:
        debug_log(f"   ⚠️  Scene has compositor nodes enabled - DISABLING")
        scene.use_nodes = False

    # Output directory
    output_dir = os.path.join(
        CONFIG["output_root"],
        f"{collection_name}-clo",
        "layers",
        CONFIG["garment_name"]
    )
    ensure_dir(output_dir)

    # Select correct material
    mat_name = _get_target_material_name_for_tiling(tiling_type)
    mat = bpy.data.materials.get(mat_name)
    if not mat:
        debug_log(f"❌ Material not found: {mat_name}")
        debug_log(f"   Available materials: {list(bpy.data.materials.keys())}")
        return

    debug_log(f"   Using material: {mat_name}")
    debug_log(f"   Material has nodes: {mat.use_nodes}")

    # Debug: Check material node setup
    if mat.use_nodes:
        node_types = [n.type for n in mat.node_tree.nodes]
        debug_log(f"   📋 Material nodes: {node_types}")

        # Find Texture Coordinate node if it exists
        for node in mat.node_tree.nodes:
            if node.type == 'TEX_COORD':
                # Check what it's connected to
                for output in node.outputs:
                    if output.links:
                        for link in output.links:
                            debug_log(f"   🔌 TexCoord.{output.name} → {link.to_node.type}.{link.to_socket.name}")

        # Check Mapping node connections in detail
        for node in mat.node_tree.nodes:
            if node.type == 'MAPPING':
                debug_log(f"   🗺️  Mapping node details:")
                for inp in node.inputs:
                    if inp.links:
                        for link in inp.links:
                            debug_log(f"      Input: {link.from_node.type}.{link.from_socket.name} → {inp.name}")
                for out in node.outputs:
                    if out.links:
                        for link in out.links:
                            debug_log(f"      Output: {out.name} → {link.to_node.type}.{link.to_socket.name}")

    # Assign material to garment
    obj = bpy.data.objects.get(CONFIG["mockup_object"])
    if not obj:
        debug_log(f"❌ Garment object not found: {CONFIG['mockup_object']}")
        return

    if obj.data.materials:
        obj.data.materials[0] = mat
        debug_log(f"   ✓ Assigned {mat_name} to {obj.name} (replaced slot 0)")
    else:
        obj.data.materials.append(mat)
        debug_log(f"   ✓ Assigned {mat_name} to {obj.name} (added to slot 0)")

    debug_log(f"   📦 Object {obj.name} now has {len(obj.data.materials)} materials")

    # Convert rotation to radians
    rotation_radians = math.radians(CONFIG["rotation_degrees"])

    # Render each scale
    for uv_scale, scale_label in zip(CONFIG["render_scales"], CONFIG["scale_labels"]):
        debug_log(f"\n   📐 Scale {scale_label} (UV={uv_scale}, rotation={CONFIG['rotation_degrees']}°)")
        _set_uv_scale(mat, uv_scale, rotation_radians)

        # Force dependency graph update
        bpy.context.view_layer.update()
        debug_log(f"      ↻ Dependency graph updated")

        # Render each layer
        for idx, layer_entry in enumerate(layers, start=1):
            layer_path = resolve_layer_path(layer_entry)
            if not layer_path:
                continue

            # Use layerLabels array if available, otherwise fall back to layer-N
            if layer_labels and (idx - 1) < len(layer_labels):
                layer_label = layer_labels[idx - 1]
            else:
                layer_label = layer_entry.get("label", f"layer-{idx}")

            # Swap texture
            _swap_image_texture(mat, layer_path)

            # CRITICAL: Force complete update after texture swap
            bpy.context.view_layer.update()
            mat.node_tree.update_tag()  # Force material node tree update
            debug_log(f"      ↻ Forced material update after texture swap")

            # Output filename
            filename = create_filename(pattern_name, layer_label, idx, scale_label)
            output_path = os.path.join(output_dir, f"{filename}.png")

            # Render
            bpy.context.scene.render.filepath = output_path
            debug_log(f"      🎬 Rendering to: {filename}.png")
            bpy.ops.render.render(write_still=True)

            debug_log(f"      ✅ {filename}.png")

    print(f"\n✅ Pattern complete: {pattern_name}")

def main():
    # Load collections.json
    print(f"\n📖 Loading: {CONFIG['json_file_path']}")

    with open(CONFIG["json_file_path"], 'r') as f:
        data = json.load(f)

    # Find collection
    collection = None
    for coll in data.get("collections", []):
        if coll.get("name") == CONFIG["target_collection"]:
            collection = coll
            break

    if not collection:
        print(f"❌ Collection not found: {CONFIG['target_collection']}")
        sys.exit(1)

    # Find pattern
    pattern = None
    for pat in collection.get("patterns", []):
        if pat.get("name") == CONFIG["target_pattern"]:
            pattern = pat
            break

    if not pattern:
        print(f"❌ Pattern not found: {CONFIG['target_pattern']}")
        print(f"   Available patterns in {CONFIG['target_collection']}:")
        for pat in collection.get("patterns", []):
            print(f"   - {pat.get('name')}")
        sys.exit(1)

    # Render the pattern
    render_pattern(pattern, CONFIG["target_collection"])

    print("\n🎉 Render complete!")

if __name__ == "__main__":
    main()
