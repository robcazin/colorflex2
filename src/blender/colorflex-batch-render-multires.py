# colorflex-batch-render.py
# 01.15.2026
# Multi-res collections: <collection>-clo / <collection>-fur
# New contract:
#   --collection=<design collection name>      (e.g. botanicals)
#   --piece=<output folder under layers/>      (e.g. Sofa-Kite)
#   --piece-object=<Blender object OR collection name> (e.g. Sofa-Kite collection)
# Back-compat (optional):
#   --garment=<output folder under layers/>
#   --garment-object=<Blender object name>


import bpy
import json
import os
import sys
import time
import tempfile
from pathlib import Path
from typing import Optional, Dict, Any, List

# Portabdetect data/relative to the repo root
from pathlib import Path
import os

SCRIPT_DIR = Path(__file__).resolve().parent

# If a sibling ../../data folder exists (Mac repo layout), use that
POSSIBLE_REPO_ROOT = SCRIPT_DIR.parents[2]  # .../colorFlex-shopify
if (POSSIBLE_REPO_ROOT / "data").exists():
    BASE_ROOT = POSSIBLE_REPO_ROOT
else:
    # Otherwise assume PC single-folder layout
    BASE_ROOT = SCRIPT_DIR


# ----------------- piece-object resolution -----------------
def find_collection_by_name(name: str):
    return bpy.data.collections.get(name)


def find_object_by_name(name: str):
    return bpy.data.objects.get(name)


def get_meshes_from_piece_object(piece_object_name: str) -> List[bpy.types.Object]:
    """
    piece_object_name can be:
      - a Collection name (preferred for furniture)
      - an Object name (parent/empty/mesh)
    Returns a list of mesh objects to render (empties/nulls ignored).
    """
    col = find_collection_by_name(piece_object_name)
    objs: List[bpy.types.Object] = []

    if col:
        try:
            # Blender 3.6+/4.x recursive
            objs = list(col.all_objects)
        except Exception:
            objs = list(col.objects)
    else:
        obj = find_object_by_name(piece_object_name)
        if not obj:
            return []
        objs = [obj] + list(obj.children_recursive)

    meshes = [o for o in objs if o and o.type == "MESH"]
    return meshes


def isolate_objects_for_render(keep_meshes):
    """
    Hide everything except:
      - keep_meshes
      - all cameras
      - all lights
    (Optionally: keep empties if your camera is parented.)
    """
    keep = set(keep_meshes)

    for obj in bpy.data.objects:
        if obj.type in {"CAMERA", "LIGHT"}:
            obj.hide_render = False
            obj.hide_viewport = False
            continue

        # OPTIONAL: keep empties (helps when camera is parented to an Empty)
        if obj.type == "EMPTY":
            obj.hide_render = False
            obj.hide_viewport = False
            continue

        if obj in keep:
            obj.hide_render = False
            obj.hide_viewport = False
        else:
            obj.hide_render = True
            obj.hide_viewport = True


# ----------------- CLI parse -----------------
print("--- COLOR-FLEX BATCH RENDERER v2.6 (multi-res collections: *-clo / *-fur) ---")

design_collection = "botanicals"
item_name = "Sofa-Kite"     # folder under layers/
item_object = "Sofa-Kite"   # Blender object OR collection name (for furniture you used collection)
collection_suffix: Optional[str] = None
mockup_type: Optional[str] = None

for arg in sys.argv:
    if arg.startswith("--collection="):
        design_collection = arg.split("=", 1)[1]

    elif arg.startswith("--piece="):
        item_name = arg.split("=", 1)[1]
        if collection_suffix is None:
            collection_suffix = "fur"
        if mockup_type is None:
            mockup_type = "furniture"

    elif arg.startswith("--piece-object="):
        item_object = arg.split("=", 1)[1]

    elif arg.startswith("--suffix="):
        collection_suffix = arg.split("=", 1)[1]

    # Back-compat
    elif arg.startswith("--garment="):
        item_name = arg.split("=", 1)[1]
        if collection_suffix is None:
            collection_suffix = "clo"
        if mockup_type is None:
            mockup_type = "clothing"

    elif arg.startswith("--garment-object="):
        item_object = arg.split("=", 1)[1]

if collection_suffix is None:
    collection_suffix = "fur"
if mockup_type is None:
    mockup_type = "furniture"

print(f"🎯 Design collection: {design_collection}")
print(f"🧩 Item folder: {item_name}")
print(f"🧱 Item object/collection: {item_object}")
print(f"🏷️  Mode: {mockup_type}  (suffix: {collection_suffix})")


# ----------------- CONFIG -----------------
CONFIG: Dict[str, Any] = {
    "json_file_path": str(BASE_ROOT / "data" / "collections.json"),
    "output_root": str(BASE_ROOT / "data" / "collections"),

    "target_collection": design_collection,
    "piece_name": item_name,
    "collection_suffix": collection_suffix,

    # Scene hookup (you can leave these if your visibility system is already correct)
    "mockup_collection": "Clothing",
    "mannequin_collection": "Mannequin",
    "occlusion_collection": "occlusion",

    # Blender selector
    "mockup_object": item_object,  # object OR collection name

    # Materials
    "target_material_standard": "M_StandardTile",
    "target_material_halfdrop": "M_HalfDropTile",
    "target_tex_node": "Image Texture",

    # Render
    "engine": "CYCLES",
    "render_samples": 8,
    "transparent_background": True,
    "max_layers": 50,

    # Multi-scale
    "render_scales": [6, 5, 4, 3, 2],
    "scale_labels": ["0.5", "1.0", "1.25", "1.5", "2.0"],

    # Behavior
    "skip_existing": True,
    "generate_manifest": True,

    # View layer management
    "view_layer_prefix": "VL_",
    "cleanup_old_view_layers": True,

    "use_standard_view_transform": True,
}


# ----------------- helpers -----------------
def slugify(s: Optional[str]) -> str:
    return "" if not s else s.lower().replace(" ", "-")


def create_filename(pattern_name: str, label: str, idx: int, scale_label: str) -> str:
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
    if not mat.use_nodes:
        return
    nt = mat.node_tree

    mapping_node = None
    tex_coord_node = None

    for node in nt.nodes:
        if node.type == "MAPPING":
            mapping_node = node
        elif node.type == "TEX_COORD":
            tex_coord_node = node

    if mapping_node is None:
        mapping_node = nt.nodes.new("ShaderNodeMapping")
        mapping_node.name = "CF_Scale_Mapping"

        img_tex_node = next((n for n in nt.nodes if n.type == "TEX_IMAGE"), None)
        if img_tex_node:
            if tex_coord_node is None:
                tex_coord_node = nt.nodes.new("ShaderNodeTexCoord")
                tex_coord_node.location = (img_tex_node.location[0] - 400, img_tex_node.location[1])

            mapping_node.location = (img_tex_node.location[0] - 200, img_tex_node.location[1])

            try:
                nt.links.new(tex_coord_node.outputs["UV"], mapping_node.inputs["Vector"])
            except Exception:
                pass
            try:
                nt.links.new(mapping_node.outputs["Vector"], img_tex_node.inputs["Vector"])
            except Exception:
                pass

    try:
        mapping_node.inputs["Scale"].default_value = (uv_scale, uv_scale, uv_scale)
    except Exception:
        try:
            mapping_node.scale = (uv_scale, uv_scale, uv_scale)
        except Exception:
            pass

    print(f"      📐 Set UV scale to {uv_scale:.3f} on '{mat.name}'")


def _ensure_material_on_object(obj: bpy.types.Object, mat_name: str) -> bpy.types.Material:
    mat = bpy.data.materials.get(mat_name)
    if not mat:
        raise RuntimeError(f"Target material '{mat_name}' not found in .blend")

    # already present?
    for i, slot in enumerate(obj.material_slots):
        if slot.material and slot.material.name == mat_name:
            obj.active_material_index = i
            obj.active_material = slot.material
            return slot.material

    # assign it
    if not obj.material_slots:
        obj.data.materials.append(mat)
        obj.active_material_index = 0
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

    if node.image:
        old_img = node.image
        node.image = None
        if old_img.users == 0:
            bpy.data.images.remove(old_img)

    img = bpy.data.images.load(img_path, check_existing=False)
    node.image = img

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
    """
    Furniture-safe:
    - Do NOT exclude collections (prevents black renders).
    - Only mark mannequin/occlusion as holdout if present.
    """
    coll = layer_coll.collection
    if not coll:
        return

    name = coll.name

    # Never exclude anything in furniture mode
    layer_coll.exclude = False

    # Optional holdout behavior
    layer_coll.holdout = (name == CONFIG["mannequin_collection"] or name == CONFIG["occlusion_collection"])

    for child in layer_coll.children:
        _configure_visibility(child)

RENDER_VL_NAME = "CF_RENDER"

def get_render_view_layer() -> bpy.types.ViewLayer:
    """
    Use ONE view layer for the entire run. Creating hundreds/thousands of view layers
    will slow Blender to a crawl over time.
    """
    sc = bpy.context.scene
    vl = sc.view_layers.get(RENDER_VL_NAME)
    if not vl:
        vl = sc.view_layers.new(RENDER_VL_NAME)
        _configure_visibility(vl.layer_collection)  # uses your furniture-safe visibility
    return vl

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
    _configure_visibility(vl.layer_collection)
    return vl
CONFIG["engine"] = "EEVEE"     # or "CYCLES"
CONFIG["render_samples"] = 32          # Eevee: TAA samples, Cycles: path samples
CONFIG["crisp_filter"] = True
CONFIG["filter_size"] = 0.5
CONFIG["use_standard_view_transform"] = True


# ----------------- render settings -----------------
def apply_render_settings(scene):
    desired = str(CONFIG.get("engine", "EEVEE")).upper()

    # What engines does THIS Blender build support?
    enum_items = scene.render.bl_rna.properties["engine"].enum_items
    allowed = {e.identifier for e in enum_items}

    def pick_eevee_id():
        # prefer modern id when present
        if "BLENDER_EEVEE_NEXT" in allowed:
            return "BLENDER_EEVEE_NEXT"
        if "BLENDER_EEVEE" in allowed:
            return "BLENDER_EEVEE"
        return None

    if desired in {"EEVEE", "BLENDER_EEVEE", "EEVEE_NEXT", "BLENDER_EEVEE_NEXT"}:
        eevee_id = pick_eevee_id()
        if not eevee_id:
            raise RuntimeError(f"No Eevee engine enum found. Available: {sorted(allowed)}")
        engine_id = eevee_id
    else:
        engine_id = "CYCLES"

    scene.render.engine = engine_id
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = bool(CONFIG.get("transparent_background", True))

    # Crisp filtering (works in Eevee + Cycles)
    if CONFIG.get("crisp_filter", False) and hasattr(scene.render, "filter_size"):
        scene.render.filter_size = float(CONFIG.get("filter_size", 0.5))

    samples = int(CONFIG.get("render_samples", 32))

    if engine_id == "CYCLES" and hasattr(scene, "cycles"):
        scene.cycles.samples = samples
        scene.cycles.use_denoising = False
    else:
        # Eevee AA samples
        if hasattr(scene.eevee, "taa_render_samples"):
            scene.eevee.taa_render_samples = samples

        # Disable softening extras (guarded)
        ee = scene.eevee
        for attr in ("use_bloom", "use_motion_blur", "use_ssr"):
            if hasattr(ee, attr):
                try:
                    setattr(ee, attr, False)
                except Exception:
                    pass

    print(
        "RENDER ENGINE:", scene.render.engine,
        "| FILTER:", getattr(scene.render, "filter_size", None),
        "| EEVEE SAMPLES:", getattr(scene.eevee, "taa_render_samples", None),
        "| AVAILABLE:", sorted(list(allowed))[:10], ("..." if len(allowed) > 10 else "")
    )

def render_layer_to_file(scene, view_layer_name, output_path, filename_wo_ext):
    import shutil
    import glob
    import time as _time

    original_fp = scene.render.filepath
    original_nodes = scene.use_nodes
    scene.use_nodes = False
    scene.render.image_settings.file_format = "PNG"

    timestamp = str(int(time.time() * 1000))
    temp_base = os.path.join(tempfile.gettempdir(), f"blender_render_{timestamp}")
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

print("ACTIVE CAMERA:", bpy.context.scene.camera.name if bpy.context.scene.camera else None,
      "hide_render=", bpy.context.scene.camera.hide_render if bpy.context.scene.camera else None)

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


def render_pattern(pattern_data) -> bool:
    name = pattern_data.get("name", "Unknown")
    slug = slugify(name)

    collection_name = CONFIG["target_collection"]
    piece_name = CONFIG["piece_name"]
    suffix = CONFIG.get("collection_suffix", "fur")

    out_dir = os.path.join(CONFIG["output_root"], f"{collection_name}-{suffix}", "layers", piece_name)
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

    piece_object_name = CONFIG["mockup_object"]
    render_meshes = get_meshes_from_piece_object(piece_object_name)

    if not render_meshes:
        print(f"  ❌ Piece object/collection '{piece_object_name}' not found OR contains no mesh objects")
        return False

    isolate_objects_for_render(render_meshes)

    no_mats = [o.name for o in render_meshes if not o.material_slots]
    none_mats = [o.name for o in render_meshes if o.material_slots and all((s.material is None) for s in o.material_slots)]
    if no_mats or none_mats:
        print(f"  ⚠️  Meshes with no usable materials (will be handled by assigning target material): "
              f"{len(no_mats) + len(none_mats)}")

    print(f"  ✅ Using {len(render_meshes)} mesh(es) from '{piece_object_name}' (empties/nulls ignored)")

    render_scales = CONFIG.get("render_scales", [1.0])
    scale_labels = CONFIG.get("scale_labels", ["1.0"])

    all_scales_data: Dict[str, List[Dict[str, Any]]] = {}

    for uv_scale, scale_label in zip(render_scales, scale_labels):
        print(f"\n  🔄 Rendering scale {scale_label}X (UV scale: {uv_scale:.3f})")
        rendered_layers: List[Dict[str, Any]] = []

        for i, layer in enumerate(layers[: CONFIG["max_layers"]]):
            path = resolve_layer_path(layer)
            if not path:
                continue

            label = labels[i] if i < len(labels) else f"Layer_{i+1}"
            print(f"    Layer {i+1}/{len(layers)}: {label}")

            # Material choice
            mat_name = _get_target_material_name_for_tiling(tiling_type)

            # Ensure material exists on meshes and collect unique mats
            touched_mats = set()
            for obj in render_meshes:
                try:
                    mat = _ensure_material_on_object(obj, mat_name)
                    touched_mats.add(mat)
                except Exception as e:
                    print(f"    ⚠️  Skipping material ensure on '{obj.name}': {e}")

            if not touched_mats:
                print(f"    ❌ No materials could be prepared on any mesh in '{piece_object_name}'")
                continue

            # Apply UV scale + swap image
            for mat in touched_mats:
                _set_uv_scale(mat, float(uv_scale))
                try:
                    tex_node = _find_image_node(mat, CONFIG["target_tex_node"])
                    _set_image_on_node(tex_node, path)
                except Exception as e:
                    print(f"    ❌ Couldn't set image on material '{mat.name}': {e}")

            print(f"      🎯 Set image on {len(touched_mats)} material(s) for this layer")

            # Force updates
            bpy.context.view_layer.update()
            depsgraph = bpy.context.evaluated_depsgraph_get()
            depsgraph.update()
            scene.update_tag()

            # Render
            vl = get_render_view_layer()

            fname = create_filename(name, label, i + 1, scale_label)
            final_png = os.path.join(out_dir, fname + ".png")
            if CONFIG.get("skip_existing", True) and os.path.exists(final_png):
                print(f"      ⏭️  Exists, skipping: {os.path.basename(final_png)}")
                rendered_layers.append({
                    "index": i + 1,
                    "label": label,
                    "filename": fname + ".png"
                })
                continue


            ok = render_layer_to_file(scene, vl.name, out_dir, fname)
            if ok:
                rendered_layers.append({"index": i + 1, "label": label, "filename": fname + ".png"})

        all_scales_data[scale_label] = rendered_layers

    # Manifest
    if CONFIG["generate_manifest"] and any(all_scales_data.values()):
        manifest = {
            "mockup_type": mockup_type,
            "item": CONFIG["piece_name"],
            "item_object": CONFIG["mockup_object"],
            "pattern": name,
            "pattern_slug": slug,
            "collection": CONFIG["target_collection"],
            "tiling_type": tiling_type,
            "style": f"{CONFIG['target_collection']}-{collection_suffix}",
            "scales": all_scales_data,
            "available_scales": CONFIG["scale_labels"],
            "render_date": time.strftime("%Y-%m-%d %H:%M:%S"),
        }
        with open(os.path.join(out_dir, f"manifest_{slug}.json"), "w") as f:
            json.dump(manifest, f, indent=2)
        print(f"    📋 Saved manifest with {len(all_scales_data)} scales")

    return True


def main():
    start = time.time()
    print(f"Starting batch render for '{CONFIG['target_collection']}' → node-swap pipeline ({mockup_type})")
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

    elapsed = int(time.time() - start)
    print("\n" + "=" * 60)
    print(f"✅ COMPLETE — {len(rendered)}/{len(patterns)} patterns")
    print(f"⏱️  {elapsed//60}m {elapsed%60}s elapsed")

    suffix = CONFIG.get("collection_suffix", "fur")
    out_root = os.path.join(
        CONFIG["output_root"],
        f"{CONFIG['target_collection']}-{suffix}",
        "layers",
        CONFIG["piece_name"],
    )
    print(f"📁 Output: {out_root}")


if __name__ == "__main__":
    main()
