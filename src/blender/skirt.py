"""
skirted-table-build-and-render.py
==================================
Builds a round skirted table (0.5 m radius, 0.5 m skirt height, 8 box pleats),
positions a 30° camera, and renders two displacement pass images:

    <OUT_DIR>/uv_U_pass.png   — circumferential coordinate (0 = back, 0.5 = front)
    <OUT_DIR>/uv_V_pass.png   — radial + height coordinate (0 = table centre, 1 = hem)

Both are 16-bit grayscale PNGs with alpha = object mask.
Use them as displacement maps in Photoshop to warp a flat fabric scan onto the
rendered perspective view.  The U and V values are continuous across the seam
between the table top and the skirt.

Run from Blender's Scripting workspace (Blender 4.3+).
"""

import bpy
import bmesh
import math
import os
import numpy as np

# ═══════════════════════════════════════════════════════════════════════════════
# SETTINGS  — edit these to match your scene
# ═══════════════════════════════════════════════════════════════════════════════
RADIUS        = 0.5     # m — table / skirt radius
SKIRT_H       = 0.5     # m — skirt drop (table top to hem)
N_PLEATS      = 8       # number of box pleats
FOLD_DEPTH    = 0.03    # m — how far pleats fold inward toward table leg

# Camera
CAM_ELEVATION = 30.0    # degrees above horizontal  (30° → see top + skirt)
CAM_DISTANCE  = 2.5     # m from table centre
CAM_FOCAL_MM  = 85      # mm focal length

# Render
RENDER_W      = 2000
RENDER_H      = 2000
SAMPLES       = 64
OUT_DIR       = r"D:\jobs-local-pc\bassett\passes"

# Scene names
COLL_NAME     = "Table_Pleated"
LAYER_NAME    = "EC_UV_TABLE"
UV_AOV_NAME   = "UVCoords"     # R = U, G = V  (single colour AOV)
# ═══════════════════════════════════════════════════════════════════════════════


# ───────────────────────────────────────────────────────────────────────────────
# 1.  GEOMETRY
#
# The skirt is built as a ring of box-pleat profiles at three height levels.
# Per pleat, 4 unique profile vertices (the 5th = the next pleat's first):
#
#   v0  front-left    (r = RADIUS,          θ = centre − Δ/2)
#   v1  inner-fold-L  (r = RADIUS−FOLD_D,   θ = centre − Δ/4)
#   v2  back-centre   (r = RADIUS−FOLD_D,   θ = centre)
#   v3  inner-fold-R  (r = RADIUS−FOLD_D,   θ = centre + Δ/4)
#   v4  front-right   (r = RADIUS,          θ = centre + Δ/2)  ← = next v0
#
# The table top is a flat disk whose rim vertices share the same angles so
# they merge cleanly when the two meshes are joined.
#
# UVs baked into the mesh are only used for display; the render passes are
# driven by the procedural AOV material (Section 2), which computes UV from
# world-space position so values are guaranteed continuous at the seam.
# ───────────────────────────────────────────────────────────────────────────────

def _profile_angle_radius(pleat_i, sub_i):
    """Returns (angle, radius) for profile sub-vertex sub_i of pleat pleat_i."""
    Δ = 2 * math.pi / N_PLEATS
    centre = pleat_i * Δ
    angle_offsets = [-Δ/2, -Δ/4, 0.0, Δ/4]
    radii         = [RADIUS, RADIUS - FOLD_DEPTH, RADIUS - FOLD_DEPTH, RADIUS - FOLD_DEPTH]
    return centre + angle_offsets[sub_i], radii[sub_i]


def _profile_angles_for_top():
    """Returns the list of angles (length N_PLEATS*4) used for the skirt rim
    and table-top outer ring — ensures the seam vertices align."""
    return [_profile_angle_radius(pi, si)[0]
            for pi in range(N_PLEATS) for si in range(4)]


def build_skirt():
    """
    Creates the pleated skirt bmesh.
    UV layout (baked into mesh):
        U = vertex_sequence_index / (N_PLEATS * 4)   ← 0→1 around circumference
        V = 0.5 at top, 0.75 at mid, 1.0 at bottom
    """
    bm   = bmesh.new()
    uv_l = bm.loops.layers.uv.new("UVMap")

    Np = N_PLEATS * 4   # unique profile verts per ring

    z_levels = [SKIRT_H, SKIRT_H * 0.5, 0.0]
    V_levels  = [0.5,     0.75,           1.0]

    # Build vertex rings
    rings = []
    for z in z_levels:
        row = []
        for pi in range(N_PLEATS):
            for si in range(4):
                angle, r = _profile_angle_radius(pi, si)
                row.append(bm.verts.new((r * math.cos(angle),
                                         r * math.sin(angle), z)))
        rings.append(row)

    # Build quads between adjacent rings
    for zi in range(len(z_levels) - 1):
        Vt = V_levels[zi]
        Vb = V_levels[zi + 1]
        for pi in range(N_PLEATS):
            npi = (pi + 1) % N_PLEATS
            # Four profile edges per pleat
            edges = [
                (pi*4+0, pi*4+1),
                (pi*4+1, pi*4+2),
                (pi*4+2, pi*4+3),
                (pi*4+3, npi*4+0),   # last edge bridges to next pleat
            ]
            for edge_i, (a, b) in enumerate(edges):
                Ua = a / Np
                # Closing edge of final pleat: b wraps to 0, UV should be 1.0
                Ub = (b % Np) / Np
                if edge_i == 3 and pi == N_PLEATS - 1:
                    Ub = 1.0

                vBL = rings[zi + 1][a % Np]
                vBR = rings[zi + 1][b % Np]
                vTL = rings[zi    ][a % Np]
                vTR = rings[zi    ][b % Np]

                face = bm.faces.new([vBL, vBR, vTR, vTL])
                for loop, uv in zip(face.loops,
                                    [(Ua, Vb), (Ub, Vb), (Ub, Vt), (Ua, Vt)]):
                    loop[uv_l].uv = uv

    bm.normal_update()
    return bm


def build_top():
    """
    Creates the flat table-top disk at Z = SKIRT_H.
    Profile angles match the skirt's rim so seam vertices merge cleanly.
    UV layout (baked into mesh):
        U = atan2(y, x) / (2π) + 0.5
        V = (r / RADIUS) * 0.5   →  0.0 at centre, 0.5 at rim
    The V=0.5 rim matches the skirt's V=0.5 top ring.
    """
    bm   = bmesh.new()
    uv_l = bm.loops.layers.uv.new("UVMap")

    angles = _profile_angles_for_top()   # N_PLEATS*4 angles
    Np     = len(angles)
    N_RAD  = 10   # radial subdivisions (more = smoother UV on top surface)

    def vert_uv(x, y):
        r = math.sqrt(x * x + y * y)
        a = math.atan2(y, x)
        U = a / (2 * math.pi) + 0.5   # [0, 1]
        V = (r / RADIUS) * 0.5         # [0, 0.5]
        return U, V

    # Centre vertex
    centre = bm.verts.new((0, 0, SKIRT_H))

    # Build rings from centre outward
    rings = [[centre]]
    for ri in range(1, N_RAD + 1):
        r = RADIUS * ri / N_RAD
        ring = [bm.verts.new((r * math.cos(a), r * math.sin(a), SKIRT_H))
                for a in angles]
        rings.append(ring)

    # Helper: fix UV seam wrap-around within a face
    def fix_u_wrap(U_ref, U_other):
        if abs(U_other - U_ref) > 0.5:
            U_other += 1.0 if U_other < U_ref else -1.0
        return U_other

    # Centre → first ring: triangles
    first = rings[1]
    for vi in range(Np):
        vn = (vi + 1) % Np
        vA, vB = first[vi], first[vn]
        face = bm.faces.new([centre, vA, vB])

        UA, VA = vert_uv(vA.co.x, vA.co.y)
        UB, VB = vert_uv(vB.co.x, vB.co.y)
        UB     = fix_u_wrap(UA, UB)
        UC     = (UA + UB) * 0.5        # centre gets midpoint U

        for loop, uv in zip(face.loops, [(UC, 0.0), (UA, VA), (UB, VB)]):
            loop[uv_l].uv = uv

    # Ring → ring: quads
    for ri in range(1, N_RAD):
        inner = rings[ri]
        outer = rings[ri + 1]
        for vi in range(Np):
            vn = (vi + 1) % Np
            vIL, vIR = inner[vi], inner[vn]
            vOL, vOR = outer[vi], outer[vn]
            face = bm.faces.new([vIL, vOL, vOR, vIR])

            UIL, VIL = vert_uv(vIL.co.x, vIL.co.y)
            UIR, VIR = vert_uv(vIR.co.x, vIR.co.y)
            UOL, VOL = vert_uv(vOL.co.x, vOL.co.y)
            UOR, VOR = vert_uv(vOR.co.x, vOR.co.y)

            UIR = fix_u_wrap(UIL, UIR)
            UOR = fix_u_wrap(UOL, UOR)

            for loop, uv in zip(face.loops,
                                 [(UIL, VIL), (UOL, VOL), (UOR, VOR), (UIR, VIR)]):
                loop[uv_l].uv = uv

    bm.normal_update()
    return bm


def create_table_object(scene):
    """Builds skirt + top, joins them, welds the seam, returns the object."""
    # Remove existing table
    coll = bpy.data.collections.get(COLL_NAME)
    if coll:
        for obj in list(coll.objects):
            bpy.data.objects.remove(obj, do_unlink=True)
        bpy.data.collections.remove(coll)

    coll = bpy.data.collections.new(COLL_NAME)
    scene.collection.children.link(coll)

    objs = []
    for bm_fn, name in [(build_skirt, "Skirt"), (build_top, "TableTop")]:
        bm   = bm_fn()
        mesh = bpy.data.meshes.new(name)
        bm.to_mesh(mesh)
        bm.free()
        obj = bpy.data.objects.new(name, mesh)
        coll.objects.link(obj)
        objs.append(obj)

    # Join into one object
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objs:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    table = bpy.context.active_object
    table.name = COLL_NAME

    # Weld seam vertices (top rim == skirt top ring, within 0.5 mm)
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.remove_doubles(threshold=0.0005)
    bpy.ops.mesh.normals_make_consistent(inside=False)
    bpy.ops.object.mode_set(mode='OBJECT')

    print(f"[TABLE] Created '{COLL_NAME}' — "
          f"{len(table.data.vertices)} verts, "
          f"{len(table.data.polygons)} faces")
    return table


# ───────────────────────────────────────────────────────────────────────────────
# 2.  UV AOV MATERIAL
#
# Applied as a view-layer material override.  Computes UV from world-space
# position using shader nodes and writes it to a named AOV (R = U, G = V).
#
# U = circumferential angle:
#     atan2(pos.Y, pos.X) / (2π) + 0.5     → [0, 1] around Z axis
#     U = 0.5 lines up with the positive-X direction (front of table).
#
# V = radial / height coordinate:
#     Table top (Z ≈ SKIRT_H):  V = r / RADIUS × 0.5   → [0, 0.5]
#     Skirt     (Z < SKIRT_H):  V = 1 − Z / (2×SKIRT_H) → [0.5, 1.0]
#     The two formulas both evaluate to 0.5 at the seam (r=R, Z=SKIRT_H),
#     so the AOV is seamless even without per-vertex blending.
# ───────────────────────────────────────────────────────────────────────────────

def create_uv_aov_material():
    name = "EC_UV_PASS"
    old  = bpy.data.materials.get(name)
    if old:
        bpy.data.materials.remove(old, do_unlink=True)

    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt    = mat.node_tree
    nt.nodes.clear()
    nodes = nt.nodes
    links = nt.links

    def n(type_, loc):
        nd = nodes.new(type_)
        nd.location = loc
        return nd

    # World position
    geo = n("ShaderNodeNewGeometry", (-1100, 0))
    sep = n("ShaderNodeSeparateXYZ", (-850, 0))
    links.new(geo.outputs["Position"], sep.inputs["Vector"])
    Px, Py, Pz = sep.outputs["X"], sep.outputs["Y"], sep.outputs["Z"]

    # ── U = atan2(Y, X) / (2π) + 0.5 ─────────────────────────────────────
    at2 = n("ShaderNodeMath", (-600, 200))
    at2.operation = 'ARCTAN2'
    links.new(Py, at2.inputs[0])
    links.new(Px, at2.inputs[1])

    d2p = n("ShaderNodeMath", (-350, 200))
    d2p.operation = 'DIVIDE'
    d2p.inputs[1].default_value = 2.0 * math.pi
    links.new(at2.outputs[0], d2p.inputs[0])

    u_add = n("ShaderNodeMath", (-100, 200))
    u_add.operation = 'ADD'
    u_add.inputs[1].default_value = 0.5
    links.new(d2p.outputs[0], u_add.inputs[0])
    U = u_add.outputs[0]   # range guaranteed [0, 1] (atan2 is in [-π, π])

    # ── V_skirt = 1 − Z / (2 × SKIRT_H)  →  0.5 at top, 1.0 at hem ──────
    dz = n("ShaderNodeMath", (-600, 0))
    dz.operation = 'DIVIDE'
    dz.inputs[1].default_value = 2.0 * SKIRT_H
    links.new(Pz, dz.inputs[0])

    vs = n("ShaderNodeMath", (-350, 0))
    vs.operation = 'SUBTRACT'
    vs.inputs[0].default_value = 1.0
    links.new(dz.outputs[0], vs.inputs[1])
    V_skirt = vs.outputs[0]

    # ── V_top = sqrt(X²+Y²) / RADIUS × 0.5  →  0.0 at centre, 0.5 at rim ─
    sqx = n("ShaderNodeMath", (-600, -200))
    sqx.operation = 'MULTIPLY'
    links.new(Px, sqx.inputs[0]); links.new(Px, sqx.inputs[1])

    sqy = n("ShaderNodeMath", (-600, -320))
    sqy.operation = 'MULTIPLY'
    links.new(Py, sqy.inputs[0]); links.new(Py, sqy.inputs[1])

    add_sq = n("ShaderNodeMath", (-350, -260))
    add_sq.operation = 'ADD'
    links.new(sqx.outputs[0], add_sq.inputs[0])
    links.new(sqy.outputs[0], add_sq.inputs[1])

    sqr = n("ShaderNodeMath", (-100, -260))
    sqr.operation = 'SQRT'
    links.new(add_sq.outputs[0], sqr.inputs[0])

    vt_scale = n("ShaderNodeMath", (150, -260))
    vt_scale.operation = 'MULTIPLY'
    vt_scale.inputs[1].default_value = 0.5 / RADIUS   # divide by R then ×0.5
    links.new(sqr.outputs[0], vt_scale.inputs[0])
    V_top = vt_scale.outputs[0]

    # ── Select V_top vs V_skirt based on Z position ────────────────────────
    # is_top = 1 when Z > SKIRT_H - ε  (the flat top surface)
    # V = V_skirt + is_top × (V_top − V_skirt)
    is_top = n("ShaderNodeMath", (-100, -50))
    is_top.operation = 'GREATER_THAN'
    is_top.inputs[1].default_value = SKIRT_H - 0.005
    links.new(Pz, is_top.inputs[0])

    v_diff = n("ShaderNodeMath", (150, -100))
    v_diff.operation = 'SUBTRACT'
    links.new(V_top,   v_diff.inputs[0])
    links.new(V_skirt, v_diff.inputs[1])

    v_sel = n("ShaderNodeMath", (400, -100))
    v_sel.operation = 'MULTIPLY'
    links.new(is_top.outputs[0], v_sel.inputs[0])
    links.new(v_diff.outputs[0], v_sel.inputs[1])

    v_final = n("ShaderNodeMath", (650, -100))
    v_final.operation = 'ADD'
    links.new(V_skirt,         v_final.inputs[0])
    links.new(v_sel.outputs[0], v_final.inputs[1])
    V = v_final.outputs[0]

    # ── Pack into colour: R=U, G=V, B=0 ───────────────────────────────────
    comb = n("ShaderNodeCombineColor", (900, 100))
    try:
        comb.mode = 'RGB'
    except Exception:
        pass
    links.new(U, comb.inputs[0])   # Red   = U
    links.new(V, comb.inputs[1])   # Green = V
    # Blue stays 0

    # ── AOV output ─────────────────────────────────────────────────────────
    aov = n("ShaderNodeOutputAOV", (1150, 100))
    try:
        aov.aov_name = UV_AOV_NAME   # Blender 3.6+
    except AttributeError:
        aov.name = UV_AOV_NAME       # older builds
    links.new(comb.outputs["Color"], aov.inputs["Color"])

    # ── Surface: white emission so alpha = object coverage ─────────────────
    emit = n("ShaderNodeEmission", (900, -150))
    emit.inputs["Color"].default_value    = (1, 1, 1, 1)
    emit.inputs["Strength"].default_value = 1.0

    mat_out = n("ShaderNodeOutputMaterial", (1150, -150))
    links.new(emit.outputs[0], mat_out.inputs["Surface"])

    return mat


# ───────────────────────────────────────────────────────────────────────────────
# 3.  CAMERA
# ───────────────────────────────────────────────────────────────────────────────

def setup_camera(scene):
    """
    Places a camera looking at the table centre from 30° above horizontal.
    Camera sits on the +Y side by default; adjust CAM_ELEVATION to taste.
    """
    cam_data = bpy.data.cameras.new("TableCam")
    cam_data.lens     = CAM_FOCAL_MM
    cam_data.clip_end = 50.0

    cam_obj = bpy.data.objects.new("TableCam", cam_data)
    scene.collection.objects.link(cam_obj)

    elev_rad = math.radians(CAM_ELEVATION)
    # Camera position: orbit on the Y axis, elevated by elevation angle
    cx = 0.0
    cy = -CAM_DISTANCE * math.cos(elev_rad)
    cz =  CAM_DISTANCE * math.sin(elev_rad) + SKIRT_H * 0.5  # aim at table mid

    cam_obj.location = (cx, cy, cz)

    # Point at the table centre (slightly above base)
    target = (0, 0, SKIRT_H * 0.4)
    dx = target[0] - cx
    dy = target[1] - cy
    dz = target[2] - cz
    dist_h = math.sqrt(dx*dx + dy*dy)

    cam_obj.rotation_euler = (
        math.atan2(-dz, dist_h) + math.pi / 2,   # pitch (X)
        0.0,                                        # roll (Y)
        math.atan2(dx, -dy),                        # yaw (Z)
    )

    scene.camera = cam_obj
    print(f"[CAMERA] elevation={CAM_ELEVATION}°  distance={CAM_DISTANCE}m  "
          f"pos=({cx:.2f}, {cy:.2f}, {cz:.2f})")
    return cam_obj


# ───────────────────────────────────────────────────────────────────────────────
# 4.  VIEW LAYER + AOV REGISTRATION
# ───────────────────────────────────────────────────────────────────────────────

def setup_view_layer(scene, uv_mat):
    """Creates (or reuses) a dedicated view layer for the UV pass."""
    vl = scene.view_layers.get(LAYER_NAME)
    if vl is None:
        vl = scene.view_layers.new(LAYER_NAME)
    vl.use = True

    # Remove stale AOVs with the same name, then register fresh
    to_remove = [a for a in vl.aovs if a.name == UV_AOV_NAME]
    for a in to_remove:
        vl.aovs.remove(a)

    aov = vl.aovs.add()
    aov.name = UV_AOV_NAME
    aov.type = 'COLOR'

    # Apply the UV material as an override (replaces all object materials)
    vl.material_override = uv_mat

    # Make sure the table collection is visible in this layer
    table_lc = None
    stack = [vl.layer_collection]
    while stack:
        lc = stack.pop()
        if lc.collection.name == COLL_NAME:
            table_lc = lc
            break
        stack.extend(lc.children)

    if table_lc:
        table_lc.exclude      = False
        table_lc.holdout      = False
        table_lc.indirect_only = False
        print(f"[LAYER] '{COLL_NAME}' visible in '{LAYER_NAME}'")
    else:
        print(f"[WARN]  '{COLL_NAME}' not found in layer collection tree")

    return vl


# ───────────────────────────────────────────────────────────────────────────────
# 5.  COMPOSITOR — routes AOV to File Output
# ───────────────────────────────────────────────────────────────────────────────

def setup_compositor(scene, tmp_dir):
    """
    Builds the compositor:
      RenderLayers[EC_UV_TABLE] → UVCoords AOV socket
        → separate R (U) and G (V) channels
        → two File Output nodes (one per channel)
    Also wires the Composite output so Blender actually runs the compositor.
    """
    scene.use_nodes = True
    scene.render.use_compositing = True
    nt = scene.node_tree
    nt.nodes.clear()
    nodes = nt.nodes
    links = nt.links

    rl = nodes.new("CompositorNodeRLayers")
    rl.layer    = LAYER_NAME
    rl.location = (-600, 0)

    # The AOV appears as a socket named UV_AOV_NAME on the RenderLayers node
    # after the view layer AOV is registered.
    def find_out(node, name):
        for s in node.outputs:
            if s.name == name:
                return s
        names = [s.name for s in node.outputs]
        raise KeyError(f"Socket '{name}' not found on RenderLayers. "
                       f"Available: {names}\n"
                       f"Make sure the view layer AOV is registered before "
                       f"the compositor is built.")

    uv_color = find_out(rl, UV_AOV_NAME)   # RGB colour socket (R=U, G=V)
    alpha    = find_out(rl, "Alpha")        # object coverage mask

    # Separate R (U) and G (V) from the colour AOV
    sep = nodes.new("CompositorNodeSeparateColor")
    sep.location = (-300, 0)
    try:
        sep.mode = 'RGB'
    except Exception:
        pass
    links.new(uv_color, sep.inputs[0])

    def make_gray_rgba(value_socket, alpha_socket, label, x):
        """Combine a single-channel value with alpha into RGBA for File Output."""
        comb = nodes.new("CompositorNodeCombineColor")
        comb.location = (x, 100)
        try:
            comb.mode = 'RGB'
        except Exception:
            pass
        links.new(value_socket, comb.inputs[0])
        links.new(value_socket, comb.inputs[1])
        links.new(value_socket, comb.inputs[2])

        set_a = nodes.new("CompositorNodeSetAlpha")
        set_a.location = (x + 250, 100)
        links.new(comb.outputs[0], set_a.inputs[0])
        links.new(alpha_socket,    set_a.inputs[1])

        fout = nodes.new("CompositorNodeOutputFile")
        fout.location  = (x + 500, 100)
        fout.base_path = tmp_dir.replace("\\", "/")
        fout.format.file_format  = 'OPEN_EXR'
        fout.format.color_mode   = 'RGBA'
        fout.format.color_depth  = '32'
        fout.file_slots[0].path  = label   # Blender appends frame number

        links.new(set_a.outputs[0], fout.inputs[0])
        return set_a.outputs[0]

    rgba_U = make_gray_rgba(sep.outputs["Red"],   alpha, "uv_U", 0)
    rgba_V = make_gray_rgba(sep.outputs["Green"], alpha, "uv_V", 0)
    rgba_V.node.location.y = -250

    # Composite node (required to trigger compositor execution in scripted renders)
    comp = nodes.new("CompositorNodeComposite")
    comp.location = (800, 0)
    links.new(rgba_U, comp.inputs[0])


# ───────────────────────────────────────────────────────────────────────────────
# 6.  RENDER + SAVE
# ───────────────────────────────────────────────────────────────────────────────

def get_frame_path(directory, stem, scene):
    """Returns the exact path Blender's File Output node writes to."""
    frame = str(scene.frame_current).zfill(4)
    return os.path.join(directory, f"{stem}{frame}.exr")


def render_and_save_passes(scene, vl, tmp_dir):
    os.makedirs(tmp_dir, exist_ok=True)
    os.makedirs(OUT_DIR,  exist_ok=True)

    prev_vl     = bpy.context.window.view_layer
    prev_single = scene.render.use_single_layer

    bpy.context.window.view_layer    = vl
    scene.render.use_single_layer    = True

    u_path = get_frame_path(tmp_dir, "uv_U", scene)
    v_path = get_frame_path(tmp_dir, "uv_V", scene)

    for p in [u_path, v_path]:
        if os.path.exists(p):
            os.remove(p)

    print("[RENDER] Starting UV pass render …")
    bpy.ops.render.render(write_still=False)
    print("[RENDER] Done.")

    scene.render.use_single_layer = prev_single
    bpy.context.window.view_layer = prev_vl

    results = {}
    for tag, exr_path, out_name in [
        ("U", u_path, "uv_U_pass.png"),
        ("V", v_path, "uv_V_pass.png"),
    ]:
        if not os.path.exists(exr_path):
            d = os.path.dirname(exr_path)
            print(f"[ERROR] {tag} EXR not found: {exr_path}")
            print(f"        Files in dir: {os.listdir(d) if os.path.isdir(d) else 'dir missing'}")
            continue

        # Load EXR
        img_name = f"EC_UV_{tag}"
        old = bpy.data.images.get(img_name)
        if old:
            bpy.data.images.remove(old, do_unlink=True)
        img = bpy.data.images.load(exr_path)
        img.name = img_name

        w, h = img.size
        px = np.array(img.pixels[:], dtype=np.float32).reshape((h, w, 4))
        bpy.data.images.remove(img, do_unlink=True)
        os.remove(exr_path)

        gray  = px[:, :, 0]    # R channel holds the coordinate value
        alpha = px[:, :, 3]

        print(f"  [{tag}] size={w}×{h}  "
              f"value: min={gray.min():.4f} max={gray.max():.4f} mean={gray.mean():.4f}  "
              f"alpha: min={alpha.min():.4f} max={alpha.max():.4f}")

        # Save 16-bit RGBA PNG
        out_rgba          = np.zeros((h, w, 4), dtype=np.float32)
        out_rgba[:, :, 0] = gray
        out_rgba[:, :, 1] = gray
        out_rgba[:, :, 2] = gray
        out_rgba[:, :, 3] = alpha

        out_path = os.path.join(OUT_DIR, out_name).replace("\\", "/")

        sc = bpy.context.scene
        sc.render.image_settings.file_format = 'PNG'
        sc.render.image_settings.color_mode  = 'RGBA'
        sc.render.image_settings.color_depth = '16'

        tmp_img = bpy.data.images.new(f"EC_SAVE_{tag}", width=w, height=h,
                                       alpha=True, float_buffer=True)
        tmp_img.filepath_raw = out_path
        tmp_img.file_format  = "PNG"
        tmp_img.pixels       = out_rgba.ravel()
        tmp_img.update()
        tmp_img.save()
        bpy.data.images.remove(tmp_img, do_unlink=True)
        print(f"  [{tag}] Saved → {out_path}")
        results[tag] = out_path

    return results


# ───────────────────────────────────────────────────────────────────────────────
# MAIN
# ───────────────────────────────────────────────────────────────────────────────

def main():
    scene = bpy.context.scene

    # Render settings
    scene.render.engine            = "CYCLES"
    scene.cycles.samples           = SAMPLES
    scene.render.film_transparent  = True
    scene.render.resolution_x      = RENDER_W
    scene.render.resolution_y      = RENDER_H
    scene.render.resolution_percentage = 100

    tmp_dir = os.path.join(OUT_DIR, "_tmp_uv")

    # ── Step 1: Build table ────────────────────────────────────────────────
    print("\n── Building table geometry ──────────────────────────────────────")
    table = create_table_object(scene)

    # ── Step 2: UV AOV material ────────────────────────────────────────────
    print("\n── Creating UV AOV material ─────────────────────────────────────")
    uv_mat = create_uv_aov_material()

    # ── Step 3: Camera ────────────────────────────────────────────────────
    print("\n── Positioning camera ───────────────────────────────────────────")
    setup_camera(scene)

    # ── Step 4: View layer + AOV ──────────────────────────────────────────
    print("\n── Setting up view layer ────────────────────────────────────────")
    vl = setup_view_layer(scene, uv_mat)

    # ── Step 5: Compositor ────────────────────────────────────────────────
    print("\n── Building compositor ──────────────────────────────────────────")
    setup_compositor(scene, tmp_dir)

    # ── Step 6: Render ────────────────────────────────────────────────────
    print(f"\n── Rendering (samples={SAMPLES}, {RENDER_W}×{RENDER_H}) ────────")
    results = render_and_save_passes(scene, vl, tmp_dir)

    # Clean up temp dir
    try:
        os.rmdir(tmp_dir)
    except OSError:
        pass

    print(f"\n{'='*60}")
    print("  DONE")
    for tag, path in results.items():
        print(f"  {tag}: {path}")
    print(f"{'='*60}\n")
    print("PHOTOSHOP WORKFLOW:")
    print("  1. Open your flat fabric scan")
    print("  2. Filter → Distort → Displace")
    print("     Horizontal: uv_U_pass.png")
    print("     Vertical:   uv_V_pass.png")
    print("  3. Scale the displacement to taste (start with 5–15 px)")
    print("  4. The texture wraps to the table geometry with correct perspective")


if __name__ == "__main__":
    main()