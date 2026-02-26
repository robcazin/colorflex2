import bpy
import os
import numpy as np

# =========================
# USER SETTINGS
# =========================
WRAP_VIEW_LAYER_NAME  = "EC_WRAP"
MATTE_VIEW_LAYER_NAME = "EC_MATTE"

TARGET_COLLECTIONS = [
    ("Pillow",  11, "pillow1_disp.png"),
    ("Pillow2", 12, "pillow2_disp.png"),
    ("Pillow3", 13, "pillow3_disp.png"),
    ("Sofa",    20, "sofa_disp.png"),
]


OUT_DIR = r"/Volumes/K3/jobs/test"

# Use Depth or Mist
USE_MIST = False  # start with Depth; switch to True later if you prefer

# If USE_MIST:
MIST_START = 0.0
MIST_DEPTH = 8.0
MIST_FALLOFF = "QUADRATIC"

# Depth direction: if closer should be lighter, set True
INVERT = True

# Auto-calibration percentiles (ignore outliers)
P_LOW = 2.0
P_HIGH = 98.0

# Final output range (PSD-like displacement neutrality)
# 0.5 is "no shift"; widening makes stronger displacement
OUT_MIN = 0.20
OUT_MAX = 0.80

# Mask threshold (alpha > this counts as pillow)
ALPHA_THRESH = 0.01

# Render settings
SAMPLES = 16  # increase if noisy; 1–8 usually fine for depth
# =========================

def ensure_white_emission_mat():
    mat = bpy.data.materials.get("EC_MATTE_WHITE")
    if mat: return mat
    mat = bpy.data.materials.new("EC_MATTE_WHITE")
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    em  = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (1,1,1,1)
    em.inputs["Strength"].default_value = 1.0
    nt.links.new(em.outputs["Emission"], out.inputs["Surface"])
    return mat


def ensure_view_layer(scene, name):
    vl = scene.view_layers.get(name)
    if vl is None:
        vl = scene.view_layers.new(name=name)
    return vl


def find_layer_collection(layer_collection, name):
    if layer_collection.collection.name == name:
        return layer_collection
    for child in layer_collection.children:
        hit = find_layer_collection(child, name)
        if hit:
            return hit
    return None


def new_node(nodes, type_names):
    if isinstance(type_names, str):
        type_names = [type_names]
    for t in type_names:
        try:
            return nodes.new(t)
        except RuntimeError:
            pass
    raise RuntimeError(f"None of these node types exist: {type_names}")


def mark_holdouts_except_target_subtree(view_layer, target_collection_name):
    """
    Holdout everything except the target LayerCollection and ALL its descendants.
    This solves the common 'subcollection not included' issue.
    """
    root = view_layer.layer_collection
    target_lc = find_layer_collection(root, target_collection_name)
    if not target_lc:
        raise RuntimeError(f"Collection '{target_collection_name}' not found in view layer '{view_layer.name}'.")

    # collect target subtree layer_collections
    allowed = set()

    def collect_subtree(lc):
        allowed.add(lc)
        for ch in lc.children:
            collect_subtree(ch)

    collect_subtree(target_lc)

    # walk all layer collections and set holdout accordingly
    stack = [root]
    while stack:
        lc = stack.pop()
        lc.exclude = False
        if lc in allowed:
            lc.holdout = False
            lc.indirect_only = False
        else:
            lc.holdout = True
            lc.indirect_only = False
        stack.extend(list(lc.children))


def set_pass_index_for_collection(coll_name, index=1):
    coll = bpy.data.collections.get(coll_name)
    if not coll:
        raise RuntimeError(f"Collection '{coll_name}' not found.")

    meshes = [o for o in coll.all_objects if o.type == "MESH"]
    if not meshes:
        raise RuntimeError(f"Collection '{coll_name}' has no MESH objects (IDMask can’t work).")

    hidden = [o.name for o in meshes if o.hide_render]
    if hidden:
        print(f"[WARN] {coll_name}: enabling render visibility for: {hidden}")
        for o in meshes:
            o.hide_render = False

    for o in meshes:
        o.pass_index = index


def setup_passes(view_layer, scene):
    scene.render.engine = "CYCLES"
    scene.cycles.samples = SAMPLES
    scene.render.film_transparent = True
    
    view_layer.use_pass_normal = True
    view_layer.use_pass_ambient_occlusion = True
    view_layer.use_pass_object_index = True
    view_layer.use_pass_z = True

    if USE_MIST:
        view_layer.use_pass_mist = True
        ws = scene.world
        if ws is None:
            ws = bpy.data.worlds.new("World")
            scene.world = ws
        ws.mist_settings.use_mist = True
        ws.mist_settings.start = MIST_START
        ws.mist_settings.depth = MIST_DEPTH
        ws.mist_settings.falloff = MIST_FALLOFF
        
        
def get_compositor_tree(scene):
    scene = bpy.context.scene
    scene.use_nodes = True

    # Newer/alternate API: compositor lives in a node GROUP on the scene
    if hasattr(scene, "compositing_node_group"):
        ng = scene.compositing_node_group
        if ng is None:
            # Create one if missing
            ng = bpy.data.node_groups.new("EC_Compositor", "CompositorNodeTree")
            scene.compositing_node_group = ng
        return ng

    # Classic API fallback
    if hasattr(scene, "node_tree") and scene.node_tree is not None:
        return scene.node_tree

    candidates = [a for a in dir(scene) if "node" in a.lower() or "compos" in a.lower()]
    raise RuntimeError(f"Couldn't locate compositor node tree on scene. Candidates: {candidates}")


def setup_compositor_for_viewer(scene, wrap_layer_name, matte_layer_name):

    # Always grab the real active scene directly
    scene = bpy.context.scene
    scene.use_nodes = True
    scene.render.use_compositing = True

    nt = get_compositor_tree(scene)
    nt.nodes.clear()
    nodes = nt.nodes
    links = nt.links

    def out_socket(node, wanted):
        for s in node.outputs:
            if s.name == wanted:
                return s
        raise KeyError(f'Output "{wanted}" not found. Available: {[o.name for o in node.outputs]}')

    # --- RenderLayers: WRAP ---
    rlw = nodes.new("CompositorNodeRLayers")
    rlw.location = (-900, 200)
    rlw.layer = wrap_layer_name

    # --- RenderLayers: MATTE ---
    rlm = nodes.new("CompositorNodeRLayers")
    rlm.location = (-900, -300)
    rlm.layer = matte_layer_name

    # -----------------------------
    # NORMAL → Separate Z
    # -----------------------------
    sep_xyz = new_node(nodes, ["CompositorNodeSepXYZ", "CompositorNodeSeparateXYZ"])
    sep_xyz.location = (-650, 350)
    links.new(out_socket(rlw, "Normal"), sep_xyz.inputs[0])
    normal_z = sep_xyz.outputs["Z"]

    # Map Normal.Z [-1..1] → [0..1]
    map_nz = nodes.new("CompositorNodeMapRange")
    map_nz.location = (-450, 350)
    map_nz.use_clamp = True
    map_nz.inputs["From Min"].default_value = -1.0
    map_nz.inputs["From Max"].default_value =  1.0
    map_nz.inputs["To Min"].default_value   =  0.0
    map_nz.inputs["To Max"].default_value   =  1.0
    links.new(normal_z, map_nz.inputs["Value"])

    # -----------------------------
    # PLANAR BOOST = 1 - Normal.Z
    # -----------------------------
    planar_inv = nodes.new("CompositorNodeInvert")
    planar_inv.location = (-250, 520)
    links.new(map_nz.outputs["Value"], planar_inv.inputs["Color"])

    # -----------------------------
    # AO (micro detail)
    # -----------------------------
    ao_inv = nodes.new("CompositorNodeInvert")
    ao_inv.location = (-450, 150)
    links.new(out_socket(rlw, "AO"), ao_inv.inputs["Color"])

    # -----------------------------
    # Blend macro + micro
    # -----------------------------
    mix = nodes.new("CompositorNodeMixRGB")
    mix.location = (-200, 250)
    mix.blend_type = "MULTIPLY"
    mix.inputs["Fac"].default_value = 0.15
    links.new(map_nz.outputs["Value"], mix.inputs[1])
    links.new(ao_inv.outputs["Color"], mix.inputs[2])

    wrap = mix.outputs["Image"]

    if INVERT:
        inv = nodes.new("CompositorNodeInvert")
        inv.location = (0, 250)
        links.new(wrap, inv.inputs["Color"])
        wrap = inv.outputs["Color"]

    # -----------------------------
    # AA Alpha from MATTE layer
    # -----------------------------
    matte_alpha = out_socket(rlm, "Alpha")

    # Wrap with alpha
    set_alpha_wrap = nodes.new("CompositorNodeSetAlpha")
    set_alpha_wrap.location = (200, 250)
    links.new(wrap, set_alpha_wrap.inputs["Image"])
    links.new(matte_alpha, set_alpha_wrap.inputs["Alpha"])

    viewer_wrap = nodes.new("CompositorNodeViewer")
    viewer_wrap.location = (450, 250)
    links.new(set_alpha_wrap.outputs["Image"], viewer_wrap.inputs["Image"])

    # -----------------------------
    # Planar boost with alpha
    # -----------------------------
    set_alpha_planar = nodes.new("CompositorNodeSetAlpha")
    set_alpha_planar.location = (200, 500)
    links.new(planar_inv.outputs["Color"], set_alpha_planar.inputs["Image"])
    links.new(matte_alpha, set_alpha_planar.inputs["Alpha"])

    viewer_planar = nodes.new("CompositorNodeViewer")
    viewer_planar.location = (450, 500)
    links.new(set_alpha_planar.outputs["Image"], viewer_planar.inputs["Image"])
    

def render_and_get_viewer_pixels(scene, tag=""):
    print(f"[RENDER START] {tag}")
    bpy.ops.render.render(write_still=False)
    print(f"[RENDER DONE]  {tag}")

    viewer_img = bpy.data.images.get("Viewer Node")
    if viewer_img is None:
        raise RuntimeError("Viewer Node image not found. Compositor may not have executed.")

    w, h = viewer_img.size
    print(f"[VIEWER] {tag} size = {w}x{h}")
    px = np.array(viewer_img.pixels[:], dtype=np.float32).reshape((h, w, 4))
    return px


def remap_inside_mask(px_rgba):
    rgb = px_rgba[:, :, 0]  # grayscale already
    a = px_rgba[:, :, 3]

    mask = a > ALPHA_THRESH
    if not np.any(mask):
        raise RuntimeError("Mask is empty (alpha threshold removed everything). Check render visibility / holdout isolation / film_transparent.")

    vals = rgb[mask]
    lo = np.percentile(vals, P_LOW)
    hi = np.percentile(vals, P_HIGH)
    if abs(hi - lo) < 1e-8:
        # fallback: no variation
        out = np.full_like(rgb, 0.5, dtype=np.float32)
        out_a = a
        return out, out_a, lo, hi

    # normalize only inside mask
    n = (rgb - lo) / (hi - lo)
    n = np.clip(n, 0.0, 1.0)

    # map to output band
    mapped = OUT_MIN + n * (OUT_MAX - OUT_MIN)

    # outside mask: neutral gray
    out = np.full_like(rgb, 0.5, dtype=np.float32)
    out[mask] = mapped[mask]

    return out, a, lo, hi


def save_rgba_png(gray, alpha, path):
    h, w = gray.shape

    # dither BEFORE packing
    noise = (np.random.rand(h, w) - 0.5) * 0.002
    gray = np.clip(gray + noise, 0.0, 1.0)

    out_rgba = np.zeros((h, w, 4), dtype=np.float32)
    out_rgba[:, :, 0] = gray
    out_rgba[:, :, 1] = gray
    out_rgba[:, :, 2] = gray
    out_rgba[:, :, 3] = alpha

    # Blender prefers forward slashes
    path = os.path.abspath(path).replace("\\", "/")
    out_dir = os.path.dirname(path)
    os.makedirs(out_dir, exist_ok=True)

    # Ensure 16-bit PNG
    scene = bpy.context.scene
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'
    scene.render.image_settings.color_depth = '16'

    print("[SAVE] ->", path)

    # float_buffer=True helps keep precision while writing
    img = bpy.data.images.new(
        name="EC_DISP_OUT",
        width=w,
        height=h,
        alpha=True,
        float_buffer=True
    )
    img.filepath_raw = path
    img.file_format = "PNG"

    img.pixels = out_rgba.ravel()
    img.update()
    img.save()

    bpy.data.images.remove(img, do_unlink=True)
    print("[SAVED OK]", path)


def main():
    scene = bpy.context.scene
    os.makedirs(OUT_DIR, exist_ok=True)
    
    scene.render.resolution_x = 2000
    scene.render.resolution_y = 2000
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = True
    scene.render.use_persistent_data = True  # speeds up repeated renders sometimes

    print("OUT_DIR =", OUT_DIR, "exists:", os.path.isdir(OUT_DIR))

    # Ensure both view layers
    wrap_vl  = ensure_view_layer(scene, WRAP_VIEW_LAYER_NAME)
    matte_vl = ensure_view_layer(scene, MATTE_VIEW_LAYER_NAME)

    # Important for AA alpha
    scene.render.film_transparent = True

    # Force matte to be a clean silhouette (optional but recommended)
    matte_vl.material_override = ensure_white_emission_mat()

    original_vl = bpy.context.window.view_layer
    
#    for coll_name, pass_index, out_file in TARGET_COLLECTIONS:
#        print("\n---")
#        print("Processing:", coll_name)
#        
#        set_pass_index_for_collection(coll_name, index=pass_index)


#        coll = bpy.data.collections.get(coll_name)
#        if not coll:
#            print("Collection NOT FOUND in bpy.data.collections")
#            continue

#        print("Objects:", [o.name for o in coll.all_objects])

#        lc = find_layer_collection(vl.layer_collection, coll_name)
#        if not lc:
#            print("Collection NOT FOUND in view layer tree")
#            continue


    for coll_name, pass_index, out_file in TARGET_COLLECTIONS:
        print(f"\n=== Processing {coll_name} ===")

        mark_holdouts_except_target_subtree(wrap_vl,  coll_name)
        mark_holdouts_except_target_subtree(matte_vl, coll_name)

        set_pass_index_for_collection(coll_name, index=pass_index)
        setup_passes(wrap_vl, scene)

        setup_compositor_for_viewer(scene,
                                     WRAP_VIEW_LAYER_NAME,
                                     MATTE_VIEW_LAYER_NAME)

        bpy.context.window.view_layer = wrap_vl

        # --- WRAP MAP ---
        px_wrap = render_and_get_viewer_pixels(scene, tag=coll_name+"_wrap")
        gray_wrap, alpha_wrap, lo, hi = remap_inside_mask(px_wrap)

        wrap_path = os.path.join(OUT_DIR, out_file)
        save_rgba_png(gray_wrap, alpha_wrap, wrap_path)

        # --- PLANAR MAP ---
        px_planar = render_and_get_viewer_pixels(scene, tag=coll_name+"_planar")
        gray_planar, alpha_planar, lo2, hi2 = remap_inside_mask(px_planar)

        planar_path = os.path.join(
            OUT_DIR,
            out_file.replace("_disp", "_planar")
        )

        save_rgba_png(gray_planar, alpha_planar, planar_path)

        print(f"Saved wrap + planar for {coll_name}")


        bpy.context.window.view_layer = original_vl
        print("\nDone.")


if __name__ == "__main__":
    main()
