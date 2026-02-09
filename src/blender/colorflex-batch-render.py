# colorflex-batch-render.py
# 01.15.2026

import bpy
import json
import os
import sys
import time
from typing import Optional, Dict, Any, List

print("--- COLOR-FLEX BATCH RENDERER v2.4 (multi-scale + multi-scene) ---")

# Parse command line arguments
target_collection = "botanicals"  # Default fallback
garment_name = "dress"  # Default garment subdirectory (dress or pantsuit)
garment_object = "dress"  # Default garment object name in Blender

for arg in sys.argv:
    if arg.startswith("--collection="):
        target_collection = arg.split("=")[1]
    elif arg.startswith("--garment="):
        garment_name = arg.split("=")[1]
    elif arg.startswith("--garment-object="):
        garment_object = arg.split("=")[1]

print(f"🎯 Target collection: {target_collection}")
print(f"🎭 Garment: {garment_name} (object: {garment_object})")

CONFIG: Dict[str, Any] = {
    # Data
    "json_file_path": "/Volumes/K3/jobs/saffron/colorFlex-shopify/data/collections.json",
    "output_root": "/Volumes/K3/jobs/saffron/colorFlex-shopify/data/collections",  # Base directory for collection outputs

    # Target collection and garment (from command line)
    "target_collection": target_collection,
    "garment_name": garment_name,

    # Scene hookup (match these to your scene)
    "mockup_collection": "Clothing",         # contains the garment object(s)
    "mannequin_collection": "Mannequin",     # holdout
    "occlusion_collection": "occlusion",     # optional holdout (or set to a non-existent name)

    # Garment object and materials (from command line)
    "mockup_object": garment_object,         # the garment OBJECT name
    "target_material_standard": "M_StandardTile",
    "target_material_halfdrop": "M_HalfDropTile",
    "target_tex_node": "Image Texture",      # Image Texture node name inside those materials

    # Render
    "engine": "CYCLES",                      # or BLENDER_EEVEE
    "render_samples": 8,
    "transparent_background": True,          # mannequin holdout punches to alpha
    "max_layers": 50,

    # Multi-scale rendering (pattern sizes on garment)
    # Lower scale value = larger pattern on garment
    "render_scales": [1.0, 0.909, 0.833, 0.769],  # 1.0X, 1.1X, 1.2X, 1.3X pattern size
    "scale_labels": ["1.0", "1.1", "1.2", "1.3"],  # Human-readable labels

    # Behavior
    "skip_existing": True,
    "generate_manifest": True,

    # View layer management
    "view_layer_prefix": "VL_",
    "cleanup_old_view_layers": True,

    # Optional color management for emission passes (closer to texture look)
    "use_standard_view_transform": True,
}

# ----------------- helpers -----------------
def slugify(s: Optional[str]) -> str:
    return "" if not s else s.lower().replace(" ", "-")

def create_filename(pattern_name: str, label: str, idx: int, scale_label: str = "1.0") -> str:
    """Create filename with scale suffix for multi-scale rendering"""
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

# -------- materials & node swapping --------
def _get_target_material_name_for_tiling(tiling_type: str) -> str:
    return (CONFIG["target_material_halfdrop"]
            if str(tiling_type).lower() == "half-drop"
            else CONFIG["target_material_standard"])

def _set_uv_scale(mat: bpy.types.Material, uv_scale: float):
    """
    Set UV scale on material's Mapping node to control pattern size.
    Lower scale value = larger pattern on garment (fewer repeats).
    """
    if not mat.use_nodes:
        return

    nt = mat.node_tree

    # Find or create Mapping node between Texture Coordinate and Image Texture
    mapping_node = None
    tex_coord_node = None

    # Look for existing Mapping node
    for node in nt.nodes:
        if node.type == 'MAPPING':
            mapping_node = node
            break
        elif node.type == 'TEX_COORD':
            tex_coord_node = node

    # If no Mapping node exists, create one
    if not mapping_node:
        mapping_node = nt.nodes.new('ShaderNodeMapping')
        mapping_node.name = 'CF_Scale_Mapping'

        # Find Image Texture node to insert Mapping before it
        img_tex_node = None
        for node in nt.nodes:
            if node.type == 'TEX_IMAGE':
                img_tex_node = node
                break

        if img_tex_node:
            # Position Mapping node between Texture Coordinate and Image Texture
            if not tex_coord_node:
                tex_coord_node = nt.nodes.new('ShaderNodeTexCoord')
                tex_coord_node.location = (img_tex_node.location[0] - 400, img_tex_node.location[1])

            mapping_node.location = (img_tex_node.location[0] - 200, img_tex_node.location[1])

            # Connect: Texture Coordinate (UV) → Mapping → Image Texture
            nt.links.new(tex_coord_node.outputs['UV'], mapping_node.inputs['Vector'])
            nt.links.new(mapping_node.outputs['Vector'], img_tex_node.inputs['Vector'])

    # Set scale on all three axes (X, Y, Z)
    if hasattr(mapping_node, 'inputs') and 'Scale' in mapping_node.inputs:
        # Blender 2.81+ uses input sockets
        mapping_node.inputs['Scale'].default_value = (uv_scale, uv_scale, uv_scale)
    else:
        # Older Blender versions
        mapping_node.scale = (uv_scale, uv_scale, uv_scale)

    print(f"      📐 Set UV scale to {uv_scale:.3f} on '{mat.name}'")

def _ensure_material_on_object(obj: bpy.types.Object, mat_name: str) -> bpy.types.Material:
    """Ensure the object uses mat_name (reuse existing slot or assign)."""
    mat = bpy.data.materials.get(mat_name)
    if not mat:
        raise RuntimeError(f"Target material '{mat_name}' not found in .blend")

    # Already on the object?
    for i, slot in enumerate(obj.material_slots):
        if slot.material and slot.material.name == mat_name:
            obj.active_material_index = i
            obj.active_material = slot.material
            return slot.material

    # Assign it
    if not obj.material_slots:
        obj.data.materials.append(mat)
    else:
        obj.material_slots[0].material = mat
        obj.active_material_index = 0
    obj.active_material = mat
    return mat

def _find_image_node(mat: bpy.types.Material, node_name: str) -> bpy.types.Node:
    if not mat.use_nodes:
        raise RuntimeError(f"Material '{mat.name}' has no node tree")
    nt = mat.node_tree
    node = next((n for n in nt.nodes if n.type == "TEX_IMAGE" and n.name == node_name), None)
    if node:
        return node
    node = next((n for n in nt.nodes if n.type == "TEX_IMAGE"), None)
    if not node:
        raise RuntimeError(f"Material '{mat.name}' has no Image Texture node")
    print(f"⚠️  Target image node '{node_name}' not found in '{mat.name}'. Using '{node.name}' instead.")
    return node

def _set_image_on_node(node: bpy.types.Node, img_path: str):
    if not os.path.exists(img_path):
        raise FileNotFoundError(f"Layer image not found: {img_path}")

    # Remove old image from node if it exists
    if node.image:
        old_img = node.image
        node.image = None
        # Remove from Blender's data if no other users
        if old_img.users == 0:
            bpy.data.images.remove(old_img)

    # Force fresh load - never reuse cached images
    img = bpy.data.images.load(img_path, check_existing=False)
    node.image = img

    # Tag material for update
    mat = node.id_data
    if mat:
        mat.update_tag()

    print(f"      🖼️  Loaded: {os.path.basename(img_path)}")

# ------------- view layers / visibility -------------
def _collection_contains_type(layer_coll, types_set):
    coll = layer_coll.collection
    if not coll:
        return False
    for obj in coll.objects:
        if obj.type in types_set:
            return True
    return any(_collection_contains_type(child, types_set) for child in layer_coll.children)

def _configure_visibility(layer_coll: bpy.types.LayerCollection):
    coll = layer_coll.collection
    if not coll:
        return
    name = coll.name
    include = False
    holdout = False

    # Keep any collection that has Camera/Light
    if _collection_contains_type(layer_coll, {"CAMERA", "LIGHT"}):
        include = True
    elif name == CONFIG["mockup_collection"]:
        include = True
    elif name == CONFIG["mannequin_collection"]:
        include = True
        holdout = True
    elif name == CONFIG["occlusion_collection"]:
        include = True
        holdout = True

    layer_coll.exclude = not include
    layer_coll.holdout = holdout

    for child in layer_coll.children:
        _configure_visibility(child)

def cleanup_old_view_layers(prefix: str):
    sc = bpy.context.scene
    dead = [vl for vl in sc.view_layers if vl.name.startswith(prefix)]
    for vl in dead:
        sc.view_layers.remove(vl)
    if dead:
        print(f"🧹 Removed {len(dead)} old View Layers with prefix '{prefix}'")

def get_or_create_view_layer(vl_name: str) -> bpy.types.ViewLayer:
    sc = bpy.context.scene
    vl = sc.view_layers.get(vl_name) or sc.view_layers.new(vl_name)
    # No material_override — we keep your shader intact
    _configure_visibility(vl.layer_collection)
    return vl

# ----------------- render settings -----------------
def apply_render_settings(scene):
    scene.render.engine = CONFIG.get("engine", "CYCLES")
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = bool(CONFIG.get("transparent_background", True))
    samples = int(CONFIG.get("render_samples", 8))
    if scene.render.engine == "CYCLES":
        scene.cycles.samples = samples
        scene.cycles.use_denoising = False
    else:
        scene.eevee.taa_render_samples = samples

    if CONFIG.get("use_standard_view_transform", False):
        try:
            scene.view_settings.view_transform = 'Standard'
            scene.view_settings.look = 'None'
            scene.view_settings.exposure = 0.0
            scene.view_settings.gamma = 1.0
        except Exception:
            pass

def render_layer_to_file(scene, view_layer_name, output_path, filename_wo_ext):
    import shutil, glob, time as _time
    original_fp = scene.render.filepath
    original_nodes = scene.use_nodes
    scene.use_nodes = False
    scene.render.image_settings.file_format = "PNG"

    timestamp = str(int(time.time() * 1000))
    temp_base = f"/tmp/blender_render_{timestamp}"
    scene.render.filepath = temp_base
    ensure_dir(output_path)

    vl = scene.view_layers[view_layer_name]
    with bpy.context.temp_override(view_layer=vl):
        bpy.ops.render.render(write_still=True)

    pattern = temp_base + "*.png"
    timeout, t = 5.0, 0.0
    temp_files = []
    while t < timeout:
        temp_files = glob.glob(pattern)
        if temp_files:
            break
        _time.sleep(0.1)
        t += 0.1

    scene.render.filepath = original_fp
    scene.use_nodes = original_nodes

    if not temp_files:
        print(f"      ❌ Rendered file not found after {timeout}s")
        return False

    final_path = os.path.join(output_path, filename_wo_ext + ".png")
    try:
        shutil.move(temp_files[0], final_path)
        print(f"      ✅ Saved: {os.path.basename(final_path)}")
        return True
    except Exception as e:
        print(f"      ❌ Error saving file: {e}")
        return False

# ----------------- JSON + render loop -----------------
def load_patterns() -> Optional[List[Dict[str, Any]]]:
    try:
        with open(CONFIG["json_file_path"], "r") as f:
            data = json.load(f)
    except Exception as e:
        print(f"❌ JSON load error: {e}")
        return None

    col = None
    if data.get("name") == CONFIG["target_collection"]:
        col = data
    else:
        for c in data.get("collections", []):
            if c.get("name") == CONFIG["target_collection"]:
                col = c
                break

    if not col:
        print(f"❌ Collection '{CONFIG['target_collection']}' not found in JSON")
        return None

    pats = col.get("patterns", [])
    print(f"✅ Found {len(pats)} patterns in '{CONFIG['target_collection']}'")
    return pats

def render_pattern(pattern_data):
    name = pattern_data.get("name", "Unknown")
    slug = slugify(name)


    # Output: <output_root>/<collection>-clo/layers/<garment>
    collection_name = CONFIG["target_collection"]
    garment_name = CONFIG["garment_name"]
    out_dir = os.path.join(CONFIG["output_root"], f"{collection_name}-clo", "layers", garment_name)
    ensure_dir(out_dir)
    print(f"  📁 Output: {out_dir}")

    layers = pattern_data.get("layers", [])
    labels = pattern_data.get("layerLabels", [])
    tiling_type = pattern_data.get("tilingType", "standard")

    if not layers:
        print(f"  ⚠️  No layers found for '{name}'")
        return False

    scene = bpy.context.scene
    apply_render_settings(scene)

    # Garment object
    garment = bpy.data.objects.get(CONFIG["mockup_object"])
    if not garment:
        print(f"  ❌ Garment object '{CONFIG['mockup_object']}' not found")
        return False

    # Get scale configurations
    render_scales = CONFIG.get("render_scales", [1.0])
    scale_labels = CONFIG.get("scale_labels", ["1.0"])

    # Track all rendered layers across all scales
    all_scales_data = {}

    # OUTER LOOP: Iterate through scales
    for uv_scale, scale_label in zip(render_scales, scale_labels):
        print(f"\n  🔄 Rendering scale {scale_label}X (UV scale: {uv_scale:.3f})")
        rendered_layers = []

        # INNER LOOP: Iterate through layers
        for i, layer in enumerate(layers[: CONFIG["max_layers"]]):
            # Resolve file path for this layer
            path = resolve_layer_path(layer)
            if not path:
                continue
            label = labels[i] if i < len(labels) else f"Layer_{i+1}"
            print(f"    Layer {i+1}/{len(layers)}: {label}")

            # 1) Choose correct material for tiling type
            mat_name = _get_target_material_name_for_tiling(tiling_type)
            try:
                mat = _ensure_material_on_object(garment, mat_name)
            except Exception as e:
                print(f"    ❌ {e}")
                continue

            # 2) Set UV scale for this render (controls pattern size)
            _set_uv_scale(mat, uv_scale)

            # 3) Swap the image on the designated Image Texture node
            try:
                tex_node = _find_image_node(mat, CONFIG["target_tex_node"])
                _set_image_on_node(tex_node, path)
                print(f"      🎯 Set image on '{mat.name}' → node '{tex_node.name}'")
            except Exception as e:
                print(f"    ❌ Couldn't set image: {e}")
                continue

            # 4) Force complete dependency graph update
            bpy.context.view_layer.update()
            depsgraph = bpy.context.evaluated_depsgraph_get()
            depsgraph.update()
            scene.update_tag()

            # 5) Prepare View Layer and render
            vl_name = f"{CONFIG['view_layer_prefix']}{slug}_{i+1:02d}_s{scale_label}"
            vl = get_or_create_view_layer(vl_name)
            fname = create_filename(name, label, i + 1, scale_label)

            ok = render_layer_to_file(scene, vl.name, out_dir, fname)
            if ok:
                rendered_layers.append({"index": i + 1, "label": label, "filename": fname + ".png"})

        # Store this scale's data
        all_scales_data[scale_label] = rendered_layers

    # Manifest with multi-scale data
    if CONFIG["generate_manifest"] and all_scales_data:
        manifest = {
            "mockup_type": "clothing",
            "garment": CONFIG["garment_name"],
            "garment_object": CONFIG["mockup_object"],
            "pattern": name,
            "pattern_slug": slug,
            "collection": CONFIG["target_collection"],
            "tiling_type": tiling_type,
            "style": f"{CONFIG['target_collection']}-clothing",
            "scales": all_scales_data,  # Multi-scale layer data
            "available_scales": scale_labels,
            "render_date": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        with open(os.path.join(out_dir, f"manifest_{slug}.json"), "w") as f:
            json.dump(manifest, f, indent=2)
        print(f"    📋 Saved manifest with {len(all_scales_data)} scales")

    return True

def create_summary(rendered, total):
    summary = {
        "mockupType": "clothing",
        "collections": {
            CONFIG["target_collection"]: {
                "displayName": CONFIG["target_collection"].title(),
                "patternsRendered": [p["slug"] for p in rendered],
                "patternDetails": rendered,
                "totalPatterns": total,
                "successCount": len(rendered),
                "lastUpdated": time.strftime("%Y-%m-%d %H:%M:%S")
            }
        },
        "renderSettings": {
            "engine": CONFIG["engine"],
            "samples": CONFIG["render_samples"],
            "maxLayers": CONFIG["max_layers"],
            "transparent": CONFIG["transparent_background"]
        },
        "lastUpdated": time.strftime("%Y-%m-%d %H:%M:%S")
    }

#    path = os.path.join(CONFIG["output_root"], "layers", "summary.json")
#    ensure_dir(os.path.dirname(path))
#    with open(path, "w") as f:
#        json.dump(summary, f, indent=2)
#    print(f"📋 Saved summary to: {path}")

def main():
    start = time.time()
    print(f"Starting batch render for '{CONFIG['target_collection']}' → node-swap pipeline")
    print("-" * 60)

    if CONFIG.get("cleanup_old_view_layers", True):
        cleanup_old_view_layers(CONFIG["view_layer_prefix"])

    patterns = load_patterns()
    if not patterns:
        return

    sc = bpy.context.scene
    apply_render_settings(sc)

    rendered = []
    for i, pat in enumerate(patterns):
        print(f"\n[{i+1}/{len(patterns)}] Rendering '{pat.get('name','Unknown')}' …")
        try:
            if render_pattern(pat):
                rendered.append({"name": pat.get("name"), "slug": slugify(pat.get("name"))})
        except Exception as e:
            print(f"  ❌ Error rendering '{pat.get('name')}': {e}")

    if rendered:
        create_summary(rendered, len(patterns))

    elapsed = int(time.time() - start)
    print("\n" + "=" * 60)
    print(f"✅ COMPLETE — {len(rendered)}/{len(patterns)} patterns")
    print(f"⏱️  {elapsed//60}m {elapsed%60}s elapsed")
    print(f"📁 Output: {os.path.join(CONFIG['output_root'], 'patterns')}")

if __name__ == "__main__":
    main()
