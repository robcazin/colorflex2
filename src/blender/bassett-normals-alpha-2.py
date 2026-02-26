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

OUT_DIR = r"/Volumes/jobs-local-pc/bassett/passes"  # <-- mac path; change as needed

# Render size
WIDTH  = 2000
HEIGHT = 2000

# Wrap recipe
WRINKLE_FAC = 0.15   # 0.10..0.40 typical

# Depth direction: if closer should be lighter, set True
INVERT = True

# Auto-calibration percentiles for WRAP only (ignore outliers)
P_LOW  = 2.0
P_HIGH = 98.0

# Final output range (PSD-like displacement neutrality)
OUT_MIN = 0.20
OUT_MAX = 0.80

# Mask threshold
ALPHA_THRESH = 0.01

# Render settings
SAMPLES = 16

# Optional dither to reduce banding
DITHER = True
DITHER_AMOUNT = 0.002  # 0.001..0.004
# =========================


# ------------------------------------------------------------
# Utilities
# ------------------------------------------------------------
def ensure_white_emission_mat():
    mat = bpy.data.materials.get("EC_MATTE_WHITE")
    if mat:
        return mat
    mat = bpy.data.materials.new("EC_MATTE_WHITE")
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    em  = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (1, 1, 1, 1)
    em.inputs["Strength"].default_value = 1.0
    nt.links.new(em.outputs["Emission"], out.inputs["Surface"])
    
def ensure_emission_from_value_mat(name, build_fn):
    """
    build_fn(nt) should return a socket (float or color) feeding Emission Color.
    """
    mat = bpy.data.materials.get(name)
    if mat:
        return mat
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    nodes = nt.nodes
    links = nt.links

    out = nodes.new("ShaderNodeOutputMaterial")
    em  = nodes.new("ShaderNodeEmission")
    em.inputs["Strength"].default_value = 1.0
    links.new(em.outputs["Emission"], out.inputs["Surface"])

    val_socket = build_fn(nt)

    # If float socket, feed into RGB (it will auto-convert); else link color directly
    try:
        links.new(val_socket, em.inputs["Color"])
    except Exception:
        # float -> RGB via Combine RGB
        comb = nodes.new("ShaderNodeCombineRGB")
        links.new(val_socket, comb.inputs["R"])
        links.new(val_socket, comb.inputs["G"])
        links.new(val_socket, comb.inputs["B"])
        links.new(comb.outputs["Image"], em.inputs["Color"])

    return mat


def ensure_matte_white_emission_mat():
    def build(nt):
        nodes = nt.nodes
        rgb = nodes.new("ShaderNodeRGB")
        rgb.outputs[0].default_value = (1, 1, 1, 1)
        return rgb.outputs[0]
    return ensure_emission_from_value_mat("EC_MATTE_WHITE", build)


def ensure_incidence_mat():
    """
    incidence = clamp(dot(N, -Incoming), 0..1)
    """
    def build(nt):
        nodes = nt.nodes
        links = nt.links

        geo = nodes.new("ShaderNodeNewGeometry")
        vmath = nodes.new("ShaderNodeVectorMath"); vmath.operation = 'DOT_PRODUCT'
        inv = nodes.new("ShaderNodeVectorMath"); inv.operation = 'MULTIPLY'
        inv.inputs[1].default_value = (-1, -1, -1)

        clamp = nodes.new("ShaderNodeClamp")
        clamp.inputs["Min"].default_value = 0.0
        clamp.inputs["Max"].default_value = 1.0

        # -Incoming
        links.new(geo.outputs["Incoming"], inv.inputs[0])
        # dot(N, -Incoming)
        links.new(geo.outputs["Normal"], vmath.inputs[0])
        links.new(inv.outputs["Vector"], vmath.inputs[1])
        # clamp
        links.new(vmath.outputs["Value"], clamp.inputs["Value"])
        return clamp.outputs["Result"]
    return ensure_emission_from_value_mat("EC_INCIDENCE", build)


def ensure_planar_boost_mat():
    """
    planar = 1 - incidence
    """
    def build(nt):
        nodes = nt.nodes
        links = nt.links

        inc = ensure_incidence_mat()
        # We can't directly reference another material's nodes; rebuild incidence here:
        geo = nodes.new("ShaderNodeNewGeometry")
        inv = nodes.new("ShaderNodeVectorMath"); inv.operation = 'MULTIPLY'
        inv.inputs[1].default_value = (-1, -1, -1)
        dot = nodes.new("ShaderNodeVectorMath"); dot.operation = 'DOT_PRODUCT'
        clamp = nodes.new("ShaderNodeClamp")
        clamp.inputs["Min"].default_value = 0.0
        clamp.inputs["Max"].default_value = 1.0
        links.new(geo.outputs["Incoming"], inv.inputs[0])
        links.new(geo.outputs["Normal"], dot.inputs[0])
        links.new(inv.outputs["Vector"], dot.inputs[1])
        links.new(dot.outputs["Value"], clamp.inputs["Value"])

        one = nodes.new("ShaderNodeValue"); one.outputs[0].default_value = 1.0
        sub = nodes.new("ShaderNodeMath"); sub.operation = 'SUBTRACT'
        links.new(one.outputs[0], sub.inputs[0])
        links.new(clamp.outputs["Result"], sub.inputs[1])
        return sub.outputs["Value"]
    return ensure_emission_from_value_mat("EC_PLANAR", build)


def ensure_wrap_disp_mat(wrinkle_fac=0.15, invert=True):
    """
    wrap = incidence * lerp(1, AO_inv, wrinkle_fac)
    AO_inv from Ambient Occlusion node (Cycles)
    """
    def build(nt):
        nodes = nt.nodes
        links = nt.links

        # incidence = clamp(dot(N, -Incoming),0..1)
        geo = nodes.new("ShaderNodeNewGeometry")
        invv = nodes.new("ShaderNodeVectorMath"); invv.operation = 'MULTIPLY'
        invv.inputs[1].default_value = (-1, -1, -1)
        dot = nodes.new("ShaderNodeVectorMath"); dot.operation = 'DOT_PRODUCT'
        clamp = nodes.new("ShaderNodeClamp")
        clamp.inputs["Min"].default_value = 0.0
        clamp.inputs["Max"].default_value = 1.0
        links.new(geo.outputs["Incoming"], invv.inputs[0])
        links.new(geo.outputs["Normal"], dot.inputs[0])
        links.new(invv.outputs["Vector"], dot.inputs[1])
        links.new(dot.outputs["Value"], clamp.inputs["Value"])
        incidence = clamp.outputs["Result"]

        # AO
        ao = nodes.new("ShaderNodeAmbientOcclusion")
        ao.inputs["Distance"].default_value = 0.2  # tune for scale
        ao_col = ao.outputs["Color"]

        # AO_inv = 1 - AO
        inv = nodes.new("ShaderNodeInvert")
        links.new(ao_col, inv.inputs["Color"])
        ao_inv = inv.outputs["Color"]

        # convert AO_inv color -> value (use R)
        sep = nodes.new("ShaderNodeSeparateColor")
        sep.mode = 'RGB'  # IMPORTANT
        links.new(ao_inv, sep.inputs["Color"])
        ao_v = sep.outputs["Red"]

        # lerp = (1 - fac) + fac * ao_v
        facv = nodes.new("ShaderNodeValue"); facv.outputs[0].default_value = wrinkle_fac
        one  = nodes.new("ShaderNodeValue"); one.outputs[0].default_value  = 1.0

        mul = nodes.new("ShaderNodeMath"); mul.operation = 'MULTIPLY'
        links.new(facv.outputs[0], mul.inputs[0])
        links.new(ao_v, mul.inputs[1])

        one_minus = nodes.new("ShaderNodeMath"); one_minus.operation = 'SUBTRACT'
        links.new(one.outputs[0], one_minus.inputs[0])
        links.new(facv.outputs[0], one_minus.inputs[1])

        add = nodes.new("ShaderNodeMath"); add.operation = 'ADD'
        links.new(one_minus.outputs[0], add.inputs[0])
        links.new(mul.outputs[0], add.inputs[1])

        # wrap = incidence * lerp
        wrapm = nodes.new("ShaderNodeMath"); wrapm.operation = 'MULTIPLY'
        links.new(incidence, wrapm.inputs[0])
        links.new(add.outputs[0], wrapm.inputs[1])

        out = wrapm.outputs[0]

        if invert:
            invm = nodes.new("ShaderNodeMath"); invm.operation = 'SUBTRACT'
            links.new(one.outputs[0], invm.inputs[0])
            links.new(out, invm.inputs[1])
            out = invm.outputs[0]

        return out

    return ensure_emission_from_value_mat("EC_WRAP_DISP", build)
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


def mark_holdouts_except_target_subtree(view_layer, target_collection_name):
    """
    Holdout everything except the target LayerCollection and ALL its descendants.
    """
    root = view_layer.layer_collection
    target_lc = find_layer_collection(root, target_collection_name)
    if not target_lc:
        raise RuntimeError(f"Collection '{target_collection_name}' not found in view layer '{view_layer.name}'.")

    allowed = set()

    def collect_subtree(lc):
        allowed.add(lc)
        for ch in lc.children:
            collect_subtree(ch)

    collect_subtree(target_lc)

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
    """
    We keep this mainly to ensure render visibility + for future ID-mask uses.
    """
    coll = bpy.data.collections.get(coll_name)
    if not coll:
        raise RuntimeError(f"Collection '{coll_name}' not found.")

    meshes = [o for o in coll.all_objects if o.type == "MESH"]
    if not meshes:
        raise RuntimeError(f"Collection '{coll_name}' has no MESH objects.")

    hidden = [o.name for o in meshes if o.hide_render]
    if hidden:
        print(f"[WARN] {coll_name}: enabling render visibility for: {hidden}")
        for o in meshes:
            o.hide_render = False

    for o in meshes:
        o.pass_index = index


def setup_render(scene):
    scene.render.engine = "CYCLES"
    scene.cycles.samples = SAMPLES
    scene.render.film_transparent = True
    scene.render.use_persistent_data = True
    scene.render.resolution_x = WIDTH
    scene.render.resolution_y = HEIGHT
    scene.render.resolution_percentage = 100


def setup_passes_for_wrap(view_layer, scene):
    """
    We need Normal + AO for the wrap recipe.
    """
    setup_render(scene)

    view_layer.use_pass_normal = True
    view_layer.use_pass_ambient_occlusion = True
    view_layer.use_pass_z = False
    view_layer.use_pass_object_index = False


def get_render_result_arrays(pass_names_normal=("Normal",), pass_names_ao=("AO", "Ambient Occlusion")):
    """
    Works across Blender variants where Render Result may not have .views.
    Returns: (w,h, normal_rgba, ao_rgba, alpha_from_combined)
    """
    rr = bpy.data.images.get("Render Result")
    if rr is None:
        raise RuntimeError("Render Result not found. Did render run?")

    w, h = rr.size

    # Combined RGBA (for alpha)
    comb = np.array(rr.pixels[:], dtype=np.float32).reshape((h, w, 4))
    alpha = comb[:, :, 3].copy()

    # --- Find a "layer" object that exposes passes ---
    layer = None

    # Newer style sometimes: rr.layers
    if hasattr(rr, "layers") and rr.layers:
        layer = rr.layers[0]

    # Older/other builds: rr.render_layers
    elif hasattr(rr, "render_layers") and rr.render_layers:
        layer = rr.render_layers[0]

    if layer is None:
        raise RuntimeError("Couldn't find Render Result layers/render_layers to access passes.")

    # Pass lookup helper
    def pass_rect_any(names):
        # In some builds passes behave like a dict; in others it's a collection
        passes = getattr(layer, "passes", None)
        if passes is None:
            raise RuntimeError("Layer has no .passes attribute.")

        # Try dict-like first
        for nm in names:
            try:
                p = passes[nm]
                rect = np.array(p.rect, dtype=np.float32).reshape((h, w, 4))
                return rect, nm
            except Exception:
                pass

        # Try iterating collection
        available = []
        for p in passes:
            pname = getattr(p, "name", "")
            available.append(pname)
            if pname in names:
                rect = np.array(p.rect, dtype=np.float32).reshape((h, w, 4))
                return rect, pname

        raise KeyError(f"Pass not found. Tried {names}. Available: {available}")

    normal, normal_name = pass_rect_any(pass_names_normal)
    ao, ao_name         = pass_rect_any(pass_names_ao)

    # Uncomment if you want a sanity print:
    # print("Using passes:", normal_name, ao_name)

    return w, h, normal, ao, alpha


def remap_inside_mask(px_rgba):
    """
    px_rgba: (H,W,4) float, grayscale already in RGB, alpha in A.
    remaps grayscale only inside mask to OUT_MIN..OUT_MAX using percentiles.
    """
    rgb = px_rgba[:, :, 0]
    a = px_rgba[:, :, 3]

    mask = a > ALPHA_THRESH
    if not np.any(mask):
        raise RuntimeError("Mask is empty (alpha threshold removed everything).")

    vals = rgb[mask]
    lo = np.percentile(vals, P_LOW)
    hi = np.percentile(vals, P_HIGH)

    if abs(hi - lo) < 1e-8:
        out = np.full_like(rgb, 0.5, dtype=np.float32)
        return out, a, lo, hi

    n = (rgb - lo) / (hi - lo)
    n = np.clip(n, 0.0, 1.0)
    mapped = OUT_MIN + n * (OUT_MAX - OUT_MIN)

    out = np.full_like(rgb, 0.5, dtype=np.float32)
    out[mask] = mapped[mask]
    return out, a, lo, hi


def save_rgba_png(gray, alpha, path):
    """
    gray: (H,W) float 0..1
    alpha:(H,W) float 0..1
    Writes 16-bit PNG, float buffer.
    """
    h, w = gray.shape

    if DITHER:
        noise = (np.random.rand(h, w) - 0.5) * DITHER_AMOUNT
        gray = np.clip(gray + noise, 0.0, 1.0)

    out_rgba = np.zeros((h, w, 4), dtype=np.float32)
    out_rgba[:, :, 0] = gray
    out_rgba[:, :, 1] = gray
    out_rgba[:, :, 2] = gray
    out_rgba[:, :, 3] = alpha

    path = os.path.abspath(path).replace("\\", "/")
    os.makedirs(os.path.dirname(path), exist_ok=True)

    scene = bpy.context.scene
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'
    scene.render.image_settings.color_depth = '16'

    print("[SAVE] ->", path)

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


# ------------------------------------------------------------
# Main
# ------------------------------------------------------------
def main():
    scene = bpy.context.scene
    os.makedirs(OUT_DIR, exist_ok=True)

    wrap_vl  = ensure_view_layer(scene, WRAP_VIEW_LAYER_NAME)
    matte_vl = ensure_view_layer(scene, MATTE_VIEW_LAYER_NAME)

    original_vl = bpy.context.window.view_layer

    for coll_name, pass_index, out_file in TARGET_COLLECTIONS:
        print("\n==============================")
        print(f"Processing: {coll_name}  (mask index {pass_index})")

        # isolate target collection in BOTH layers
        mark_holdouts_except_target_subtree(wrap_vl,  coll_name)
        mark_holdouts_except_target_subtree(matte_vl, coll_name)

        set_pass_index_for_collection(coll_name, index=pass_index)  # keeps visibility sane

        # ---------- MATTE render (AA alpha) ----------
        matte_vl.material_override = ensure_matte_white_emission_mat()
        bpy.context.window.view_layer = matte_vl
        bpy.ops.render.render(write_still=False)

        rr = bpy.data.images["Render Result"]
        w, h = rr.size
        alpha = np.array(rr.pixels[:], dtype=np.float32).reshape((h, w, 4))[:, :, 3].copy()

        # ---------- WRAP render (grayscale wrap in RGB) ----------
        wrap_vl.material_override = ensure_wrap_disp_mat(wrinkle_fac=WRINKLE_FAC, invert=INVERT)
        bpy.context.window.view_layer = wrap_vl
        bpy.ops.render.render(write_still=False)

        rr = bpy.data.images["Render Result"]
        wrap_rgb = np.array(rr.pixels[:], dtype=np.float32).reshape((h, w, 4))[:, :, 0].copy()  # R channel

        # remap wrap inside alpha (your neutral band)
        px_wrap = np.dstack([wrap_rgb, wrap_rgb, wrap_rgb, alpha]).astype(np.float32)
        gray_wrap, alpha_out, lo, hi = remap_inside_mask(px_wrap)

        wrap_path = os.path.join(OUT_DIR, out_file)
        save_rgba_png(gray_wrap, alpha_out, wrap_path)
        print(f"Saved: {wrap_path}")
        print(f"Auto range inside mask (WRAP): lo={lo:.6f}, hi={hi:.6f}  (P{P_LOW}/P{P_HIGH})")

        # ---------- PLANAR render (planar boost) ----------
        wrap_vl.material_override = ensure_planar_boost_mat()
        bpy.context.window.view_layer = wrap_vl
        bpy.ops.render.render(write_still=False)

        rr = bpy.data.images["Render Result"]
        planar = np.array(rr.pixels[:], dtype=np.float32).reshape((h, w, 4))[:, :, 0].copy()

        # map planar into your output band (no percentile remap)
        planar_mapped = OUT_MIN + np.clip(planar, 0.0, 1.0) * (OUT_MAX - OUT_MIN)
        planar_path = os.path.join(OUT_DIR, out_file.replace("_disp", "_planar"))
        save_rgba_png(planar_mapped, alpha_out, planar_path)
        print(f"Saved: {planar_path}")

        # cleanup overrides (important!)
        matte_vl.material_override = None
        wrap_vl.material_override = None

    bpy.context.window.view_layer = original_vl
    print("\nDone.")


if __name__ == "__main__":
    main()