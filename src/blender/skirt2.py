"""
skirted-table-build-and-render.py  v3
======================================
Builds a round skirted table with 8 RELEASED BOX PLEATS whose profile
morphs with height:

   TOP  (z = SKIRT_H) :  fold is almost closed — a narrow pinched crease
   BOTTOM (z = 0)     :  fold fans wide open — deep curved scallop

Then renders two UV displacement pass PNGs from a 30° camera:
   uv_U_pass.png  — circumferential coordinate (0–1 around Z axis)
   uv_V_pass.png  — radial + drop coordinate   (0 = table centre, 1 = hem)

Blender 4.3+  |  run from Scripting workspace
"""

import bpy
import bmesh
import math
import os
import numpy as np

# ══════════════════════════════════════════════════════════════
#  USER SETTINGS
# ══════════════════════════════════════════════════════════════
RADIUS    = 0.5    # m  table radius
SKIRT_H   = 0.5    # m  skirt drop (table top → hem)
N_PLEATS  = 8

# Fold shape — how the crease opens from top to bottom
TOP_FOLD_HALF_DEG = 1.5    # half-angle of fold gap at top  (nearly closed)
BOT_FOLD_HALF_DEG = 12.0   # half-angle of fold gap at bottom (wide scallop)
TOP_FOLD_DEPTH    = 0.0    # m  flush at top — fabric kisses itself shut
BOT_FOLD_DEPTH    = 0.09   # m  deep recess at hem (the visible scallop)

# Fabric physics — panel bows slightly outward under gravity
PANEL_BULGE = 0.014   # m  max outward bow at bottom hem centre

# Mesh resolution
SAMP_PER_PLEAT = 32   # angular samples per pleat (total ring = N*this)
HEIGHT_SEGS    = 10   # vertical subdivisions (more = smoother profile change)
TOP_DISK_RINGS = 10   # radial rings on table top disk

# Camera
CAM_ELEVATION = 30.0   # degrees above horizontal
CAM_DISTANCE  = 2.4    # m from table centre
CAM_FOCAL_MM  = 85

# Render
RENDER_W = 2000
RENDER_H = 2000
SAMPLES  = 64
OUT_DIR  = r"D:\jobs-local-pc\bassett\passes"

# Internal names
COLL_NAME   = "Table_Pleated"
LAYER_NAME  = "EC_UV_TABLE"
UV_AOV_NAME = "UVCoords"
# ══════════════════════════════════════════════════════════════


def lerp(a, b, t):
    return a + (b - a) * t


# ──────────────────────────────────────────────────────────────
#  SECTION 1 — GEOMETRY
#
#  The key to matching the reference photo:
#  Each height level has its own pleat PROFILE computed by ring_profile(z).
#  At z = SKIRT_H (top): fold_half is tiny → crease nearly invisible →
#      the gap between panels is a hairline
#  At z = 0 (hem): fold_half is large → panels separate into wide arcs →
#      the characteristic scalloped silhouette
#
#  Within each ring, SAMP_PER_PLEAT * N_PLEATS evenly-spaced samples are
#  laid around the circle.  For each sample, get_radius() maps the local
#  angular position to a world-space radius using a smooth depth function
#  that creates the fold crease shape.
# ──────────────────────────────────────────────────────────────

def ring_profile(z):
    """
    Returns a list of (angle_rad, radius_m) for one complete ring at height z.
    Total length = N_PLEATS * SAMP_PER_PLEAT, wraps cleanly.

    The top PLEAT_START fraction of the skirt is a PERFECT CYLINDER — r=RADIUS
    everywhere, no fold logic at all.  This guarantees no V notch at the rim
    regardless of any other parameter values.  Below that threshold the pleat
    profile blends in using ease-in³ so it is well-developed by mid-height
    and fully open at the hem.
    """
    PLEAT_START = 0.25   # top 25% is a pure cylinder

    # Fraction from top (0) to bottom (1)
    t_linear = 1.0 - (z / SKIRT_H)

    N = SAMP_PER_PLEAT * N_PLEATS

    # Pure cylinder above the pleat-start threshold
    if t_linear <= PLEAT_START:
        return [(i / N * 2 * math.pi, RADIUS) for i in range(N)]

    # Remap [PLEAT_START, 1.0] → [0, 1], ease-in³
    t_remapped = (t_linear - PLEAT_START) / (1.0 - PLEAT_START)
    t = t_remapped ** 3

    fold_half  = math.radians(lerp(TOP_FOLD_HALF_DEG, BOT_FOLD_HALF_DEG, t))
    fold_depth = lerp(0.0, BOT_FOLD_DEPTH, t)   # always 0 at pleat start

    delta   = 2 * math.pi / N_PLEATS
    profile = []

    for i in range(N):
        a              = (i / N) * 2 * math.pi
        local          = a % delta
        dist_from_fold = min(local, delta - local)

        if dist_from_fold < fold_half:
            # Fold region: smooth squared dip toward fold centre
            fold_t = 1.0 - (dist_from_fold / fold_half)
            r = RADIUS - fold_depth * (fold_t ** 2)
        else:
            # Panel region: gentle outward bow, grows toward hem
            panel_span = delta / 2.0 - fold_half
            panel_t    = ((dist_from_fold - fold_half) / panel_span
                          if panel_span > 1e-9 else 0.0)
            bulge = PANEL_BULGE * t_remapped * math.sin(panel_t * math.pi)
            r = RADIUS + bulge

        profile.append((a, r))

    return profile


def build_skirt():
    """Pleated skirt bmesh.  UV: U = circumferential 0→1, V = 0 (top) → 1 (hem)."""
    bm   = bmesh.new()
    uv_l = bm.loops.layers.uv.new("UVMap")

    Np = N_PLEATS * SAMP_PER_PLEAT

    # Generate all rings from top → bottom
    z_values = [SKIRT_H * (HEIGHT_SEGS - i) / HEIGHT_SEGS
                for i in range(HEIGHT_SEGS + 1)]

    bm_rings = []
    for z in z_values:
        profile = ring_profile(z)
        row = []
        for angle, r in profile:
            x = r * math.cos(angle)
            y = r * math.sin(angle)
            row.append(bm.verts.new((x, y, z)))
        bm_rings.append(row)

    # Stitch rings into quads
    for zi in range(HEIGHT_SEGS):
        top_row = bm_rings[zi]
        bot_row = bm_rings[zi + 1]
        V_top   = 1.0 - z_values[zi]     / SKIRT_H
        V_bot   = 1.0 - z_values[zi + 1] / SKIRT_H

        for vi in range(Np):
            vn = (vi + 1) % Np
            U_l = vi / Np
            U_r = (vi + 1) / Np

            face = bm.faces.new([bot_row[vi], bot_row[vn],
                                  top_row[vn], top_row[vi]])
            for loop, uv in zip(face.loops,
                                 [(U_l, V_bot), (U_r, V_bot),
                                  (U_r, V_top), (U_l, V_top)]):
                loop[uv_l].uv = uv

    bm.normal_update()
    return bm


def build_top():
    """
    Flat disk for the table top.
    Outer-ring angles are taken from ring_profile(SKIRT_H) so the rim
    vertices align precisely with the skirt's top edge.
    UV: U = circumferential, V = 0 (centre) → 0.5 (rim) — matches skirt V=0.5 at top.

    Wait — the skirt's V=0 is at the top (z=SKIRT_H), so the rim of the disk
    maps to V=0 (not 0.5). This means the seam is at V=0, shared with the
    skirt's top ring. The disk interior goes from V=-0.5 (centre) to V=0 (rim).
    We keep V ≥ 0 by mapping the disk centre to V=0 and the rim to V=0.5...

    Actually for the UV AOV material, the shader computes UV procedurally from
    world position, so the baked mesh UVs only affect viewport display.
    The key is that the seam verts overlap in 3D space after merge-by-distance.
    So we just need the angles to match — V mapping of the disk is secondary.
    """
    bm   = bmesh.new()
    uv_l = bm.loops.layers.uv.new("UVMap")

    # Outer ring angles from the top profile
    top_profile = ring_profile(SKIRT_H)
    Np = len(top_profile)

    # Build radial rings from centre outward
    rings = []

    # Centre vertex
    centre_vert = bm.verts.new((0, 0, SKIRT_H))
    rings.append([centre_vert] * Np)   # broadcast centre for quad building

    for ri in range(1, TOP_DISK_RINGS + 1):
        frac = ri / TOP_DISK_RINGS
        row  = []
        for angle, rim_r in top_profile:
            r = rim_r * frac
            row.append(bm.verts.new((r * math.cos(angle),
                                      r * math.sin(angle),
                                      SKIRT_H)))
        rings.append(row)

    # UV helper
    def disk_uv(x, y):
        r = math.sqrt(x * x + y * y)
        a = math.atan2(y, x)
        U = a / (2 * math.pi) + 0.5
        V = (r / RADIUS) * 0.5    # 0 at centre, 0.5 at rim (matches skirt top)
        return U, V

    def fix_u(U_ref, U):
        if abs(U - U_ref) > 0.5:
            U += 1.0 if U < U_ref else -1.0
        return U

    # Centre → first real ring: triangles
    for vi in range(Np):
        vn = (vi + 1) % Np
        vA = rings[1][vi]
        vB = rings[1][vn]
        face = bm.faces.new([centre_vert, vA, vB])
        UA, VA = disk_uv(vA.co.x, vA.co.y)
        UB, VB = disk_uv(vB.co.x, vB.co.y)
        UB     = fix_u(UA, UB)
        UC     = (UA + UB) * 0.5
        for loop, uv in zip(face.loops, [(UC, 0.0), (UA, VA), (UB, VB)]):
            loop[uv_l].uv = uv

    # Ring → ring: quads
    for ri in range(1, TOP_DISK_RINGS):
        inner = rings[ri]
        outer = rings[ri + 1]
        for vi in range(Np):
            vn = (vi + 1) % Np
            face = bm.faces.new([inner[vi], outer[vi], outer[vn], inner[vn]])
            UIL, VIL = disk_uv(inner[vi].co.x, inner[vi].co.y)
            UOL, VOL = disk_uv(outer[vi].co.x, outer[vi].co.y)
            UIR, VIR = disk_uv(inner[vn].co.x, inner[vn].co.y)
            UOR, VOR = disk_uv(outer[vn].co.x, outer[vn].co.y)
            UIR = fix_u(UIL, UIR)
            UOR = fix_u(UOL, UOR)
            for loop, uv in zip(face.loops,
                                 [(UIL, VIL), (UOL, VOL), (UOR, VOR), (UIR, VIR)]):
                loop[uv_l].uv = uv

    bm.normal_update()
    return bm


def create_table_object(scene):
    """Builds skirt + top, joins, welds seam, returns object."""
    coll = bpy.data.collections.get(COLL_NAME)
    if coll:
        for obj in list(coll.objects):
            bpy.data.objects.remove(obj, do_unlink=True)
        bpy.data.collections.remove(coll)

    coll = bpy.data.collections.new(COLL_NAME)
    scene.collection.children.link(coll)

    objs = []
    for fn, name in [(build_skirt, "Skirt"), (build_top, "TableTop")]:
        bm   = fn()
        mesh = bpy.data.meshes.new(name)
        bm.to_mesh(mesh)
        bm.free()
        obj = bpy.data.objects.new(name, mesh)
        coll.objects.link(obj)
        objs.append(obj)

    # Join
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objs:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    table = bpy.context.active_object
    table.name = COLL_NAME

    # Weld seam
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.remove_doubles(threshold=0.001)
    bpy.ops.mesh.normals_make_consistent(inside=False)
    bpy.ops.object.mode_set(mode='OBJECT')

    print(f"[TABLE] {len(table.data.vertices)} verts, "
          f"{len(table.data.polygons)} faces")
    return table


# ──────────────────────────────────────────────────────────────
#  SECTION 2 — UV AOV MATERIAL
#
#  Applied as material override.  Computes UV from world-space
#  geometry so values are seamless across the top/skirt join:
#
#    U = atan2(Y, X) / 2π + 0.5   →  [0,1] around Z axis
#    V = r/R × 0.5                 →  [0, 0.5]  on disk
#      = 1 − Z / (2H)              →  [0.5, 1]  on skirt
#      Both = 0.5 at the seam (r=R, z=H) ✓
# ──────────────────────────────────────────────────────────────

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

    def nd(type_, loc):
        n = nodes.new(type_)
        n.location = loc
        return n

    geo = nd("ShaderNodeNewGeometry", (-1100, 0))
    sep = nd("ShaderNodeSeparateXYZ", (-850, 0))
    links.new(geo.outputs["Position"], sep.inputs["Vector"])
    Px, Py, Pz = sep.outputs["X"], sep.outputs["Y"], sep.outputs["Z"]

    # U = atan2(Y, X) / 2π + 0.5
    at2 = nd("ShaderNodeMath", (-600, 200))
    at2.operation = 'ARCTAN2'
    links.new(Py, at2.inputs[0])
    links.new(Px, at2.inputs[1])

    div = nd("ShaderNodeMath", (-380, 200))
    div.operation = 'DIVIDE'
    div.inputs[1].default_value = 2.0 * math.pi
    links.new(at2.outputs[0], div.inputs[0])

    u_add = nd("ShaderNodeMath", (-160, 200))
    u_add.operation = 'ADD'
    u_add.inputs[1].default_value = 0.5
    links.new(div.outputs[0], u_add.inputs[0])
    U = u_add.outputs[0]

    # V_skirt = 1 − Z / (2H)   →  0.5 at top, 1.0 at hem
    dz = nd("ShaderNodeMath", (-600, 0))
    dz.operation = 'DIVIDE'
    dz.inputs[1].default_value = 2.0 * SKIRT_H
    links.new(Pz, dz.inputs[0])

    vs = nd("ShaderNodeMath", (-380, 0))
    vs.operation = 'SUBTRACT'
    vs.inputs[0].default_value = 1.0
    links.new(dz.outputs[0], vs.inputs[1])
    V_skirt = vs.outputs[0]

    # V_top = sqrt(X²+Y²) / R × 0.5   →  0.0 at centre, 0.5 at rim
    sqx = nd("ShaderNodeMath", (-600, -200))
    sqx.operation = 'MULTIPLY'
    links.new(Px, sqx.inputs[0]); links.new(Px, sqx.inputs[1])

    sqy = nd("ShaderNodeMath", (-600, -320))
    sqy.operation = 'MULTIPLY'
    links.new(Py, sqy.inputs[0]); links.new(Py, sqy.inputs[1])

    add2 = nd("ShaderNodeMath", (-380, -260))
    add2.operation = 'ADD'
    links.new(sqx.outputs[0], add2.inputs[0])
    links.new(sqy.outputs[0], add2.inputs[1])

    sqr = nd("ShaderNodeMath", (-160, -260))
    sqr.operation = 'SQRT'
    links.new(add2.outputs[0], sqr.inputs[0])

    vts = nd("ShaderNodeMath", (60, -260))
    vts.operation = 'MULTIPLY'
    vts.inputs[1].default_value = 0.5 / RADIUS
    links.new(sqr.outputs[0], vts.inputs[0])
    V_top = vts.outputs[0]

    # Select V_top when on table top surface (Z ≈ SKIRT_H)
    is_top = nd("ShaderNodeMath", (-160, -50))
    is_top.operation = 'GREATER_THAN'
    is_top.inputs[1].default_value = SKIRT_H - 0.003
    links.new(Pz, is_top.inputs[0])

    vdiff = nd("ShaderNodeMath", (60, -100))
    vdiff.operation = 'SUBTRACT'
    links.new(V_top, vdiff.inputs[0])
    links.new(V_skirt, vdiff.inputs[1])

    vsel = nd("ShaderNodeMath", (280, -100))
    vsel.operation = 'MULTIPLY'
    links.new(is_top.outputs[0], vsel.inputs[0])
    links.new(vdiff.outputs[0], vsel.inputs[1])

    vfin = nd("ShaderNodeMath", (500, -100))
    vfin.operation = 'ADD'
    links.new(V_skirt, vfin.inputs[0])
    links.new(vsel.outputs[0], vfin.inputs[1])
    V = vfin.outputs[0]

    # Pack R=U, G=V into colour AOV
    comb = nd("ShaderNodeCombineColor", (720, 100))
    try:
        comb.mode = 'RGB'
    except Exception:
        pass
    links.new(U, comb.inputs[0])
    links.new(V, comb.inputs[1])

    aov = nd("ShaderNodeOutputAOV", (950, 100))
    try:
        aov.aov_name = UV_AOV_NAME
    except AttributeError:
        aov.name = UV_AOV_NAME
    links.new(comb.outputs["Color"], aov.inputs["Color"])

    # White emission surface → alpha = object silhouette
    em  = nd("ShaderNodeEmission", (720, -150))
    em.inputs["Color"].default_value    = (1, 1, 1, 1)
    em.inputs["Strength"].default_value = 1.0
    out = nd("ShaderNodeOutputMaterial", (950, -150))
    links.new(em.outputs[0], out.inputs["Surface"])

    return mat


# ──────────────────────────────────────────────────────────────
#  SECTION 3 — CAMERA
# ──────────────────────────────────────────────────────────────

def setup_camera(scene):
    for old in [o for o in scene.collection.all_objects
                if o.type == 'CAMERA' and o.name == "TableCam"]:
        bpy.data.objects.remove(old, do_unlink=True)

    cam_data       = bpy.data.cameras.new("TableCam")
    cam_data.lens  = CAM_FOCAL_MM
    cam_data.clip_end = 50.0

    cam_obj = bpy.data.objects.new("TableCam", cam_data)
    scene.collection.objects.link(cam_obj)

    e   = math.radians(CAM_ELEVATION)
    cx  = 0.0
    cy  = -CAM_DISTANCE * math.cos(e)
    cz  =  CAM_DISTANCE * math.sin(e) + SKIRT_H * 0.4
    cam_obj.location = (cx, cy, cz)

    tx, ty, tz = 0.0, 0.0, SKIRT_H * 0.35
    dx, dy, dz = tx - cx, ty - cy, tz - cz
    cam_obj.rotation_euler = (
        math.atan2(-dz, math.sqrt(dx*dx + dy*dy)) + math.pi / 2,
        0.0,
        math.atan2(dx, -dy),
    )
    scene.camera = cam_obj
    print(f"[CAM] elev={CAM_ELEVATION}°  pos=({cx:.2f}, {cy:.2f}, {cz:.2f})")
    return cam_obj


# ──────────────────────────────────────────────────────────────
#  SECTION 4 — VIEW LAYER + AOV
# ──────────────────────────────────────────────────────────────

def setup_view_layer(scene, uv_mat):
    vl = scene.view_layers.get(LAYER_NAME)
    if vl is None:
        vl = scene.view_layers.new(LAYER_NAME)
    vl.use = True

    for a in [a for a in vl.aovs if a.name == UV_AOV_NAME]:
        vl.aovs.remove(a)
    aov      = vl.aovs.add()
    aov.name = UV_AOV_NAME
    aov.type = 'COLOR'

    vl.material_override = uv_mat

    stack = [vl.layer_collection]
    while stack:
        lc = stack.pop()
        if lc.collection.name == COLL_NAME:
            lc.exclude = lc.holdout = lc.indirect_only = False
            print(f"[LAYER] '{COLL_NAME}' visible in '{LAYER_NAME}'")
            break
        stack.extend(lc.children)

    return vl


# ──────────────────────────────────────────────────────────────
#  SECTION 5 — COMPOSITOR
# ──────────────────────────────────────────────────────────────

def ensure_compositor_tree(scene):
    """
    Robustly initialise scene.node_tree for Blender 4.3+.

    In 4.3 the attribute does not exist at all until the compositor is
    initialised — reading it directly raises AttributeError.  Use getattr
    with a None default throughout so we never touch the attribute until
    we know it exists.
    """
    scene.use_nodes = True
    scene.render.use_compositing = True

    # Helper that never raises AttributeError
    def get_nt():
        return getattr(scene, 'node_tree', None)

    if get_nt() is not None:
        return get_nt()

    # Nudge the depsgraph — sometimes enough to trigger tree creation
    try:
        bpy.context.evaluated_depsgraph_get()
    except Exception:
        pass

    if get_nt() is not None:
        return get_nt()

    # Flip a SpaceNodeEditor to CompositorNodeTree context.
    # This is the most reliable trigger in 4.3.
    for window in bpy.context.window_manager.windows:
        for area in window.screen.areas:
            if area.type == 'NODE_EDITOR':
                for space in area.spaces:
                    if space.type == 'NODE_EDITOR':
                        prev = space.tree_type
                        space.tree_type = 'CompositorNodeTree'
                        space.tree_type = prev
                        break

    if get_nt() is not None:
        return get_nt()

    # Last resort: open a temporary compositor area via screen override
    try:
        for window in bpy.context.window_manager.windows:
            for area in window.screen.areas:
                with bpy.context.temp_override(window=window, area=area):
                    area.type = 'NODE_EDITOR'
                    for space in area.spaces:
                        if space.type == 'NODE_EDITOR':
                            space.tree_type = 'CompositorNodeTree'
                    break
    except Exception:
        pass

    if get_nt() is not None:
        return get_nt()

    # Absolute last resort: use bpy.ops with a compositor context override
    try:
        for window in bpy.context.window_manager.windows:
            for area in window.screen.areas:
                if area.type == 'NODE_EDITOR':
                    with bpy.context.temp_override(
                            window=window, area=area, scene=scene):
                        bpy.ops.node.new_node_tree(
                            type='CompositorNodeTree', name="Compositor")
    except Exception:
        pass

    nt = get_nt()
    if nt is not None:
        return nt

    raise RuntimeError(
        "Could not initialise scene.node_tree.\n"
        "Workaround: in the Scripting workspace, split off a panel, "
        "change it to Node Editor, click the dropdown and select "
        "'Compositor' once, then re-run the script."
    )


def setup_compositor(scene, tmp_dir):
    nt    = ensure_compositor_tree(scene)
    nt.nodes.clear()
    nodes = nt.nodes
    links = nt.links

    rl          = nodes.new("CompositorNodeRLayers")
    rl.layer    = LAYER_NAME
    rl.location = (-700, 0)

    def find_out(node, name):
        for s in node.outputs:
            if s.name == name:
                return s
        raise KeyError(f"Socket '{name}' not found. "
                       f"Available: {[s.name for s in node.outputs]}")

    uv_sock = find_out(rl, UV_AOV_NAME)
    a_sock  = find_out(rl, "Alpha")

    sep          = nodes.new("CompositorNodeSeparateColor")
    sep.location = (-400, 0)
    try:
        sep.mode = 'RGB'
    except Exception:
        pass
    links.new(uv_sock, sep.inputs[0])

    def channel_to_file(value_sock, alpha_sock, stem, x, y):
        comb = nodes.new("CompositorNodeCombineColor")
        comb.location = (x, y)
        try:
            comb.mode = 'RGB'
        except Exception:
            pass
        links.new(value_sock, comb.inputs[0])
        links.new(value_sock, comb.inputs[1])
        links.new(value_sock, comb.inputs[2])

        sa = nodes.new("CompositorNodeSetAlpha")
        sa.location = (x + 240, y)
        links.new(comb.outputs[0], sa.inputs[0])
        links.new(alpha_sock,      sa.inputs[1])

        fo = nodes.new("CompositorNodeOutputFile")
        fo.location  = (x + 480, y)
        fo.base_path = tmp_dir.replace("\\", "/")
        fo.format.file_format = 'OPEN_EXR'
        fo.format.color_mode  = 'RGBA'
        fo.format.color_depth = '32'
        fo.file_slots[0].path = stem   # Blender appends frame number

        links.new(sa.outputs[0], fo.inputs[0])
        return sa.outputs[0]

    rgba_U = channel_to_file(sep.outputs["Red"],   a_sock, "uv_U",  0,    200)
    rgba_V = channel_to_file(sep.outputs["Green"], a_sock, "uv_V",  0,   -200)

    comp          = nodes.new("CompositorNodeComposite")
    comp.location = (800, 200)
    links.new(rgba_U, comp.inputs[0])


# ──────────────────────────────────────────────────────────────
#  SECTION 6 — RENDER + SAVE
# ──────────────────────────────────────────────────────────────

def frame_path(directory, stem, scene):
    return os.path.join(directory, f"{stem}{str(scene.frame_current).zfill(4)}.exr")


def render_and_save(scene, vl, tmp_dir):
    os.makedirs(tmp_dir, exist_ok=True)
    os.makedirs(OUT_DIR,  exist_ok=True)

    prev_vl     = bpy.context.window.view_layer
    prev_single = scene.render.use_single_layer

    bpy.context.window.view_layer = vl
    scene.render.use_single_layer = True

    for stem in ("uv_U", "uv_V"):
        p = frame_path(tmp_dir, stem, scene)
        if os.path.exists(p):
            os.remove(p)

    print(f"[RENDER] {RENDER_W}×{RENDER_H}  samples={SAMPLES} …")
    bpy.ops.render.render(write_still=False)
    print("[RENDER] Done.")

    scene.render.use_single_layer = prev_single
    bpy.context.window.view_layer = prev_vl

    results = {}
    for tag, stem, out_name in [
        ("U", "uv_U", "uv_U_pass.png"),
        ("V", "uv_V", "uv_V_pass.png"),
    ]:
        exr_path = frame_path(tmp_dir, stem, scene)
        if not os.path.exists(exr_path):
            d = os.path.dirname(exr_path)
            print(f"[ERROR] {tag} EXR missing: {exr_path}")
            print(f"  Dir contents: {os.listdir(d) if os.path.isdir(d) else 'MISSING'}")
            continue

        iname = f"EC_UV_{tag}"
        old   = bpy.data.images.get(iname)
        if old:
            bpy.data.images.remove(old, do_unlink=True)
        img = bpy.data.images.load(exr_path)
        img.name = iname
        w, h = img.size
        px = np.array(img.pixels[:], dtype=np.float32).reshape((h, w, 4))
        bpy.data.images.remove(img, do_unlink=True)
        os.remove(exr_path)

        gray  = px[:, :, 0]
        alpha = px[:, :, 3]
        print(f"  [{tag}] {w}×{h}  value {gray.min():.3f}–{gray.max():.3f}  "
              f"alpha {alpha.min():.3f}–{alpha.max():.3f}")

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

        tmp_img = bpy.data.images.new(f"EC_SAVE_{tag}", w, h,
                                       alpha=True, float_buffer=True)
        tmp_img.filepath_raw = out_path
        tmp_img.file_format  = "PNG"
        tmp_img.pixels       = out_rgba.ravel()
        tmp_img.update()
        tmp_img.save()
        bpy.data.images.remove(tmp_img, do_unlink=True)
        print(f"  [{tag}] → {out_path}")
        results[tag] = out_path

    return results


# ──────────────────────────────────────────────────────────────
#  MAIN
# ──────────────────────────────────────────────────────────────

def main():
    scene = bpy.context.scene

    scene.render.engine              = "CYCLES"
    scene.cycles.samples             = SAMPLES
    scene.render.film_transparent    = True
    scene.render.resolution_x        = RENDER_W
    scene.render.resolution_y        = RENDER_H
    scene.render.resolution_percentage = 100

    tmp_dir = os.path.join(OUT_DIR, "_tmp_uv")

    print("\n── 1  Building geometry ─────────────────────────────────")
    create_table_object(scene)

    print("\n── 2  Creating UV AOV material ──────────────────────────")
    uv_mat = create_uv_aov_material()

    print("\n── 3  Positioning camera ────────────────────────────────")
    setup_camera(scene)

    print("\n── 4  Setting up view layer ─────────────────────────────")
    vl = setup_view_layer(scene, uv_mat)

    print("\n── 5  Building compositor ───────────────────────────────")
    setup_compositor(scene, tmp_dir)

    print("\n── 6  Rendering ─────────────────────────────────────────")
    results = render_and_save(scene, vl, tmp_dir)

    try:
        os.rmdir(tmp_dir)
    except OSError:
        pass

    print("\n" + "═" * 55)
    print("  DONE")
    for tag, path in results.items():
        print(f"  {tag} pass → {path}")
    print("═" * 55)
    print("""
PHOTOSHOP WORKFLOW
──────────────────
1. Smart Object → your fabric scan (repeat-tiled to fill canvas)
2. Filter → Distort → Displace
     Horizontal scale:  uv_U_pass.png   (start at 8–15 px)
     Vertical scale:    uv_V_pass.png   (start at 8–15 px)
     Stretch to fit / Repeat
3. Add the alpha channel as a layer mask
4. The stripe will warp continuously from table top to hem,
   perspective-correct, with no seam at the edge.
""")


if __name__ == "__main__":
    main()