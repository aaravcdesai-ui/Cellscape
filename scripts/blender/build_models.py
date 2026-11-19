"""Build Cellscape's 3D specimen models in Blender and export them as GLB.

Run headless (no Blender window needed):

    blender -b --factory-startup --python scripts/blender/build_models.py -- plant animal

Options after "--":
    <specimen ...>   which models to build (default: all that have a builder)
    --out DIR        where to write <specimen>.glb (default: models/)
    --blend          also save an editable <specimen>.blend next to each GLB

Every structure is its own object, named after its id in specimens.js ("nucleus", "golgi",
"rough-er", ...). Sub-parts use "<id>_<detail>" names (e.g. "mitochondrion_cristae"), which
the site maps back to the structure. See models/README.md.

Coordinates are Blender's (Z up, the open cutaway faces -Y). The glTF exporter converts to Y up;
the site rescales each model to the size of its procedural counterpart, so units are arbitrary.
Everything is seeded, so rebuilding gives the same model.
"""

import math
import random
import sys
from pathlib import Path

import bmesh
import bpy
from mathutils import Matrix, Vector, noise

ROOT = Path(__file__).resolve().parents[2]


# ---------------------------------------------------------------------------------------------
# Scene, materials, objects


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    MATERIALS.clear()


def linear(rgb):
    """sRGB-ish design colours to Blender's linear colour space."""
    return tuple(c ** 2.2 for c in rgb)


MATERIALS = {}


def material(name, rgb, rough=0.55, coat=0.25, sheen=0.35, alpha=1.0):
    if name in MATERIALS:
        return MATERIALS[name]
    m = bpy.data.materials.new(name)
    if hasattr(m, "use_nodes") and not m.node_tree:
        m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*linear(rgb), 1.0)
    p.inputs["Roughness"].default_value = rough
    p.inputs["Coat Weight"].default_value = coat
    p.inputs["Coat Roughness"].default_value = 0.35
    p.inputs["Sheen Weight"].default_value = sheen
    p.inputs["Sheen Roughness"].default_value = 0.5
    if alpha < 1:
        p.inputs["Alpha"].default_value = alpha
        if hasattr(m, "surface_render_method"):
            m.surface_render_method = "BLENDED"
    MATERIALS[name] = m
    return m


def to_object(name, bm, mats, parent=None, smooth=True):
    """Turn a bmesh into a linked mesh object with one or more materials."""
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    for poly in mesh.polygons:
        poly.use_smooth = smooth
    for m in mats if isinstance(mats, (list, tuple)) else [mats]:
        mesh.materials.append(m)
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    if parent:
        obj.parent = parent
    return obj


def apply_modifiers(obj):
    depsgraph = bpy.context.evaluated_depsgraph_get()
    mesh = bpy.data.meshes.new_from_object(obj.evaluated_get(depsgraph))
    old = obj.data
    obj.modifiers.clear()
    obj.data = mesh
    bpy.data.meshes.remove(old)
    for poly in mesh.polygons:
        poly.use_smooth = True
    return obj


def solidify(obj, thickness, rim_material=None, offset=-1):
    """Give an open shell thickness; the cut edge (rim) can use a second material."""
    mod = obj.modifiers.new("solidify", "SOLIDIFY")
    mod.thickness = thickness
    mod.offset = offset
    mod.use_rim = True
    if rim_material:
        obj.data.materials.append(rim_material)
        mod.material_offset_rim = len(obj.data.materials) - 1
    return apply_modifiers(obj)


def bevel(obj, width, segments=4):
    mod = obj.modifiers.new("bevel", "BEVEL")
    mod.width = width
    mod.segments = segments
    mod.limit_method = "ANGLE"
    return apply_modifiers(obj)


# ---------------------------------------------------------------------------------------------
# Geometry helpers (bmesh)


def sphere(radius=1.0, segments=40, rings=28):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=segments, v_segments=rings, radius=radius)
    return bm


def ico(bm, center, radius, subdivisions=1):
    """Add a small icosphere into an existing bmesh (for many tiny particles in one object)."""
    bmesh.ops.create_icosphere(
        bm,
        subdivisions=subdivisions,
        radius=radius,
        matrix=Matrix.Translation(center),
    )


def transform(bm, scale=(1, 1, 1), rotate_z=0.0, rotate_x=0.0, translate=(0, 0, 0)):
    m = (
        Matrix.Translation(translate)
        @ Matrix.Rotation(rotate_z, 4, "Z")
        @ Matrix.Rotation(rotate_x, 4, "X")
        @ Matrix.Diagonal((*scale, 1))
    )
    bmesh.ops.transform(bm, matrix=m, verts=bm.verts)
    return bm


def lumpy(bm, amount, frequency, seed=0.0):
    """Organic surface: push vertices along their normals by smooth 3D noise."""
    bm.normal_update()
    offset = Vector((seed * 13.1, seed * 7.3, seed * 3.7))
    moves = [(v, v.normal.copy() * amount * noise.noise(v.co * frequency + offset)) for v in bm.verts]
    for v, move in moves:
        v.co += move
    return bm


def cut(bm, point, normal):
    """Slice away everything on the side the normal points to (a clean cutaway)."""
    geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
    bmesh.ops.bisect_plane(bm, geom=geom, plane_co=point, plane_no=normal, clear_outer=True)
    return bm


def tubes(name, paths, radius, mat, parent=None, flat=0.0, resolution=4):
    """Curves with a round (or flat, ribbon-like) profile, converted to a mesh."""
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.bevel_depth = radius
    curve.bevel_resolution = 2
    curve.resolution_u = resolution
    curve.extrude = flat
    curve.use_fill_caps = True
    for points in paths:
        spline = curve.splines.new("NURBS")
        spline.points.add(len(points) - 1)
        for i, p in enumerate(points):
            spline.points[i].co = (*p, 1.0)
        spline.use_endpoint_u = True
        spline.order_u = min(4, len(points))
    holder = bpy.data.objects.new(name + "_curve", curve)
    bpy.context.scene.collection.objects.link(holder)
    depsgraph = bpy.context.evaluated_depsgraph_get()
    mesh = bpy.data.meshes.new_from_object(holder.evaluated_get(depsgraph))
    bpy.data.objects.remove(holder)
    bpy.data.curves.remove(curve)
    for poly in mesh.polygons:
        poly.use_smooth = True
    mesh.materials.clear()
    mesh.materials.append(mat)
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    if parent:
        obj.parent = parent
    return obj


def wiggle(rng, start, end, steps, amount, z_amount=None):
    """A gently wandering path between two points."""
    start, end = Vector(start), Vector(end)
    out = []
    for i in range(steps):
        t = i / (steps - 1)
        p = start.lerp(end, t)
        if 0 < i < steps - 1:
            p += Vector((rng.uniform(-amount, amount), rng.uniform(-amount, amount),
                         rng.uniform(-1, 1) * (amount if z_amount is None else z_amount)))
        out.append(tuple(p))
    return out


def particles_on(obj, count, radius, rng, lift=0.0):
    """Points spread over an object's faces (area-weighted), pushed out along the normal."""
    mesh = obj.data
    mesh.calc_loop_triangles()
    tris = list(mesh.loop_triangles)
    weights = [t.area for t in tris]
    picks = rng.choices(tris, weights=weights, k=count)
    world = obj.matrix_world
    points = []
    for tri in picks:
        a, b, c = (mesh.vertices[i].co for i in tri.vertices)
        u, v = rng.random(), rng.random()
        if u + v > 1:
            u, v = 1 - u, 1 - v
        p = a + (b - a) * u + (c - a) * v + tri.normal * (radius * 0.6 + lift)
        points.append(world @ p)
    return points


# ---------------------------------------------------------------------------------------------
# Organelles


def nucleus(center, radius, rng, cut_normal, palette):
    """Cut-open nucleus: double envelope with pores, chromatin threads and a nucleolus."""
    c = Vector(center)
    n = Vector(cut_normal).normalized()
    bm = lumpy(sphere(radius, 56, 40), radius * 0.025, 2.2 / radius, seed=1)
    transform(bm, translate=c)
    cut(bm, c + n * radius * 0.12, n)
    shell = to_object("nucleus", bm, material("nucleus", palette["nucleus"], rough=0.5))
    solidify(shell, radius * 0.09, material("nucleus_inner", palette["nucleus_inner"], rough=0.7))

    # Inner nucleoplasm surface, slightly inside, so the cut shows a filled interior.
    bm = lumpy(sphere(radius * 0.86, 48, 32), radius * 0.02, 3 / radius, seed=2)
    transform(bm, translate=c)
    cut(bm, c + n * radius * 0.05, n)
    to_object("nucleus_nucleoplasm", bm, material("nucleoplasm", palette["nucleoplasm"], rough=0.8, coat=0.05))

    # Pores: small rings of bumps on the outer envelope (not on the cut face).
    bm = bmesh.new()
    placed = 0
    while placed < 34:
        d = Vector((rng.gauss(0, 1), rng.gauss(0, 1), rng.gauss(0, 1))).normalized()
        if d.dot(n) > -0.05:
            continue
        ico(bm, c + d * radius * 1.01, radius * 0.055, 2)
        placed += 1
    to_object("nucleus_pores", bm, material("nuclear_pore", palette["pore"], rough=0.45))

    # Chromatin: tangled threads inside.
    paths = []
    for _ in range(16):
        a = Vector((rng.gauss(0, 1), rng.gauss(0, 1), rng.gauss(0, 1))).normalized() * radius * 0.6
        b = Vector((rng.gauss(0, 1), rng.gauss(0, 1), rng.gauss(0, 1))).normalized() * radius * 0.6
        paths.append(wiggle(rng, c + a, c + b, 7, radius * 0.22))
    tubes("nucleus_chromatin", paths, radius * 0.022, material("chromatin", palette["chromatin"], rough=0.6))

    bm = lumpy(sphere(radius * 0.3, 32, 24), radius * 0.03, 6 / radius, seed=3)
    transform(bm, translate=c + Vector((radius * 0.12, radius * 0.05, -radius * 0.08)))
    to_object("nucleolus", bm, material("nucleolus", palette["nucleolus"], rough=0.65))


def mitochondrion(index, center, length, angle, palette, rng):
    """Bean-shaped organelle cut open lengthways to show folded cristae."""
    c = Vector(center)
    w, h = length * 0.44, length * 0.34
    name = f"mitochondrion.{index:03d}"
    bm = lumpy(sphere(1, 40, 24), 0.03, 2.5, seed=10 + index)
    transform(bm, scale=(length / 2, w / 2, h / 2), rotate_z=angle, translate=c)
    cut(bm, c + Vector((0, 0, h * 0.12)), Vector((0, 0, 1)))
    outer = to_object(name, bm, material("mitochondrion", palette["mito"], rough=0.45))
    solidify(outer, w * 0.07, material("mito_rim", palette["mito_rim"]))

    # Matrix floor and cristae: wavy plates across the width.
    bm = bmesh.new()
    folds = max(5, int(length * 6))
    for i in range(folds):
        x = -length * 0.38 + i * (length * 0.76) / (folds - 1)
        span = (w / 2) * math.sqrt(max(0.0, 1 - (x / (length / 2)) ** 2)) * 0.82
        plate = bmesh.new()
        bmesh.ops.create_grid(plate, x_segments=2, y_segments=10, size=0.5)
        for v in plate.verts:
            y = v.co.y * 2 * span
            v.co = Vector((x + math.sin(y * 9 + i) * w * 0.05, y, -h * 0.12 + (v.co.x + 0.5) * h * 0.42))
        tmp = bpy.data.meshes.new("tmp")
        plate.to_mesh(tmp)
        plate.free()
        bm.from_mesh(tmp)
        bpy.data.meshes.remove(tmp)
    transform(bm, rotate_z=angle, translate=c)
    cristae = to_object(f"mitochondrion_cristae.{index:03d}", bm, material("cristae", palette["cristae"], rough=0.5))
    solidify(cristae, w * 0.035, offset=0)
    cristae.parent = outer


def chloroplast(index, center, length, angle, palette):
    """Lens-shaped chloroplast, top sliced off to show grana stacks and stroma lamellae."""
    c = Vector(center)
    w, h = length * 0.5, length * 0.3
    name = f"chloroplast.{index:03d}"
    bm = lumpy(sphere(1, 40, 24), 0.025, 2.2, seed=20 + index)
    transform(bm, scale=(length / 2, w / 2, h / 2), rotate_z=angle, translate=c)
    cut(bm, c + Vector((0, 0, h * 0.18)), Vector((0, 0, 1)))
    outer = to_object(name, bm, material("chloroplast", palette["chloro"], rough=0.5))
    solidify(outer, w * 0.06, material("chloro_rim", palette["chloro_rim"]))

    # Grana: stacks of thylakoid discs.
    bm = bmesh.new()
    spots = [(-0.28, -0.12), (-0.05, 0.16), (0.2, -0.1), (0.36, 0.14), (-0.42, 0.15)]
    for sx, sy in spots:
        base = Vector((sx * length, sy * w, -h * 0.25))
        for k in range(5):
            disc = bmesh.new()
            bmesh.ops.create_cone(disc, cap_ends=True, segments=20, radius1=w * 0.16, radius2=w * 0.16, depth=h * 0.07)
            bmesh.ops.translate(disc, vec=base + Vector((0, 0, k * h * 0.09)), verts=disc.verts)
            tmp = bpy.data.meshes.new("tmp")
            disc.to_mesh(tmp)
            disc.free()
            bm.from_mesh(tmp)
            bpy.data.meshes.remove(tmp)
    transform(bm, rotate_z=angle, translate=c)
    grana = to_object(f"chloroplast_grana.{index:03d}", bm, material("grana", palette["grana"], rough=0.4, coat=0.4))
    grana.parent = outer

    # Stroma lamellae: thin connecting sheets between stacks.
    paths = [[(sx * length, sy * w, -h * 0.12) for sx, sy in spots[i:i + 2]] for i in range(len(spots) - 1)]
    lam = tubes(f"chloroplast_lamellae.{index:03d}", [[tuple(Vector(p)) for p in path] for path in paths],
                h * 0.012, material("lamellae", palette["grana"]), flat=h * 0.08)
    lam.matrix_world = Matrix.Translation(c) @ Matrix.Rotation(angle, 4, "Z")
    lam.parent = outer
    lam.matrix_parent_inverse = outer.matrix_world.inverted()


def rough_er(center, radii, angles, base_z, height, palette, rng):
    """Stacked, gently rippled sheets curving around the nucleus, studded with ribosomes."""
    c = Vector(center)
    paths = []
    for r in radii:
        pts = []
        for i in range(12):
            a = math.radians(angles[0] + (angles[1] - angles[0]) * i / 11)
            rr = r + 0.06 * math.sin(i * 1.7 + r * 5)
            pts.append((c.x + math.cos(a) * rr, c.y + math.sin(a) * rr, base_z + 0.05 * math.sin(i * 1.3 + r)))
        paths.append(pts)
    er = tubes("rough-er", paths, 0.035, material("rough_er", palette["rer"], rough=0.45), flat=height / 2)
    points = particles_on(er, 420, 0.028, rng)
    bm = bmesh.new()
    for p in points:
        ico(bm, p, 0.028, 1)
    to_object("rough-er_ribosomes", bm, material("er_ribosome", palette["ribosome"], rough=0.5))
    return er


def smooth_er(center, spread, palette, rng, count=12):
    c = Vector(center)
    paths = []
    for _ in range(count):
        a = c + Vector((rng.uniform(-spread, spread), rng.uniform(-spread * 0.6, spread * 0.6), rng.uniform(-0.1, 0.15)))
        b = c + Vector((rng.uniform(-spread, spread), rng.uniform(-spread * 0.6, spread * 0.6), rng.uniform(-0.1, 0.15)))
        paths.append(wiggle(rng, a, b, 6, spread * 0.3, z_amount=0.08))
    tubes("smooth-er", paths, 0.07, material("smooth_er", palette["ser"], rough=0.35, coat=0.5))


def golgi(center, size, angle, palette, rng):
    """A stack of curved, flattened cisternae with swollen rims, plus budding vesicles."""
    c = Vector(center)
    bm = bmesh.new()
    for k in range(6):
        plate = sphere(1, 36, 14)
        s = 1 - abs(k - 2.5) * 0.08
        for v in plate.verts:
            x, y, z = v.co
            v.co = Vector((x * size * s, y * size * 0.38 * s, z * size * 0.055 + (x * x) * size * 0.22))
        bmesh.ops.translate(plate, vec=Vector((0, 0, k * size * 0.13)), verts=plate.verts)
        tmp = bpy.data.meshes.new("tmp")
        plate.to_mesh(tmp)
        plate.free()
        bm.from_mesh(tmp)
        bpy.data.meshes.remove(tmp)
    transform(bm, rotate_z=angle, translate=c)
    to_object("golgi", bm, material("golgi", palette["golgi"], rough=0.45, coat=0.4))
    bm = bmesh.new()
    for _ in range(14):
        side = rng.choice((-1, 1))
        p = Vector((side * size * rng.uniform(1.0, 1.35), rng.uniform(-0.3, 0.3) * size, rng.uniform(0.1, 0.8) * size))
        ico(bm, Matrix.Translation(c) @ Matrix.Rotation(angle, 4, "Z") @ p, size * rng.uniform(0.07, 0.11), 2)
    to_object("vesicle", bm, material("vesicle", palette["vesicle"], rough=0.3, coat=0.6))


def scatter(name, points, radius, mat, subdivisions=1):
    bm = bmesh.new()
    for p, r in points:
        ico(bm, p, r if r else radius, subdivisions)
    return to_object(name, bm, mat)


# ---------------------------------------------------------------------------------------------
# Specimens


PLANT = {
    "wall": (0.36, 0.56, 0.2), "wall_rim": (0.55, 0.7, 0.3), "membrane": (0.86, 0.72, 0.34),
    "cytosol": (0.84, 0.82, 0.62), "vacuole": (0.58, 0.78, 0.88), "nucleus": (0.5, 0.29, 0.66),
    "nucleus_inner": (0.63, 0.42, 0.76), "nucleoplasm": (0.55, 0.36, 0.68), "pore": (0.72, 0.52, 0.82),
    "chromatin": (0.4, 0.2, 0.55), "nucleolus": (0.42, 0.16, 0.42), "mito": (0.86, 0.47, 0.2),
    "mito_rim": (0.95, 0.66, 0.38), "cristae": (0.96, 0.62, 0.32), "chloro": (0.34, 0.56, 0.17),
    "chloro_rim": (0.55, 0.74, 0.3), "grana": (0.47, 0.72, 0.18), "rer": (0.36, 0.47, 0.8),
    "ribosome": (0.62, 0.45, 0.72), "ser": (0.47, 0.63, 0.88), "golgi": (0.92, 0.47, 0.4),
    "vesicle": (0.86, 0.76, 0.84), "peroxisome": (0.6, 0.76, 0.52), "cytoskeleton": (0.86, 0.72, 0.32),
}


def build_plant():
    rng = random.Random(7)
    pal = PLANT
    # Cell wall: an open, rounded box with thickness; the plasma membrane lines it inside.
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1)
    top = [f for f in bm.faces if f.calc_center_median().z > 0.4]
    bmesh.ops.delete(bm, geom=top, context="FACES")
    transform(bm, scale=(8.2, 6.2, 1.15), translate=(0, 0, -0.62))
    wall = to_object("wall", bm, material("wall", pal["wall"], rough=0.7, coat=0.1, sheen=0.5))
    bevel(wall, 0.4, 5)
    solidify(wall, 0.24, material("wall_rim", pal["wall_rim"], rough=0.7))
    bm = bmesh.new()
    bm.from_mesh(wall.data)
    lumpy(bm, 0.025, 1.8, seed=4)
    bm.to_mesh(wall.data)
    bm.free()

    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1)
    top = [f for f in bm.faces if f.calc_center_median().z > 0.4]
    bmesh.ops.delete(bm, geom=top, context="FACES")
    transform(bm, scale=(7.7, 5.7, 1.0), translate=(0, 0, -0.66))
    membrane = to_object("membrane", bm, material("membrane", pal["membrane"], rough=0.4, coat=0.5))
    bevel(membrane, 0.34, 5)
    solidify(membrane, 0.035)

    # Cytosol: the lumpy floor of cytoplasm the organelles sit in.
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=90, y_segments=70, size=0.5)
    transform(bm, scale=(7.55, 5.55, 1), translate=(0, 0, -0.86))
    for v in bm.verts:
        v.co.z += 0.05 * noise.noise(v.co * 1.6) + 0.015 * noise.noise(v.co * 7)
    floor = to_object("cytosol", bm, material("cytosol", pal["cytosol"], rough=0.75, coat=0.15))
    solidify(floor, 0.12)

    # Central vacuole: large, glossy and slightly translucent.
    bm = lumpy(sphere(1, 64, 40), 0.03, 1.4, seed=5)
    transform(bm, scale=(2.05, 1.45, 0.52), translate=(0.8, 0.0, -0.45))
    to_object("vacuole", bm, material("vacuole", pal["vacuole"], rough=0.12, coat=0.8, sheen=0.1, alpha=0.82))

    nucleus((-2.25, 1.3, -0.3), 1.05, rng, (0.25, -1, 0.95), pal)
    rough_er((-2.25, 1.3), (1.25, 1.43, 1.61, 1.79), (-115, 20), -0.62, 0.42, pal, rng)
    smooth_er((-0.4, 2.2, -0.55), 0.75, pal, rng)
    golgi((-2.6, -1.35, -0.74), 0.75, math.radians(25), pal, rng)

    for i, (x, y, a) in enumerate([(3.05, 1.65, 70), (3.05, -1.5, 110), (0.25, -2.25, 0), (1.45, 2.3, 8), (-1.0, -2.3, 168)]):
        chloroplast(i + 1, (x, y, -0.6), 1.42, math.radians(a), pal)
    for i, (x, y, a) in enumerate([(2.05, -2.15, 18), (3.35, 0.1, 92), (-3.25, 0.15, 75)]):
        mitochondrion(i + 1, (x, y, -0.64), 1.15, math.radians(a), pal, rng)

    scatter("peroxisome", [(Vector((1.95, 1.15, -0.62)), 0.17), (Vector((-0.6, 1.75, -0.66)), 0.14)], 0,
            material("peroxisome", pal["peroxisome"], rough=0.45), 3)
    free = []
    while len(free) < 160:
        p = Vector((rng.uniform(-3.6, 3.6), rng.uniform(-2.6, 2.6), -0.74))
        if ((p.x - 0.8) / 2.1) ** 2 + (p.y / 1.5) ** 2 < 1:
            continue
        free.append((p, 0.026))
    scatter("ribosomes", free, 0.026, material("ribosome", pal["ribosome"], rough=0.5))
    paths = [wiggle(rng, (rng.uniform(-3.6, -2), rng.uniform(-2.5, 2.5), -0.72),
                    (rng.uniform(2, 3.6), rng.uniform(-2.5, 2.5), -0.72), 8, 0.4, z_amount=0.03) for _ in range(9)]
    tubes("cytoskeleton", paths, 0.014, material("cytoskeleton", pal["cytoskeleton"], rough=0.4))


ANIMAL = {
    "membrane": (0.7, 0.62, 0.8), "membrane_rim": (0.84, 0.76, 0.9), "cytosol": (0.6, 0.68, 0.84),
    "nucleus": (0.5, 0.29, 0.68), "nucleus_inner": (0.63, 0.42, 0.78), "nucleoplasm": (0.55, 0.36, 0.7),
    "pore": (0.72, 0.52, 0.84), "chromatin": (0.4, 0.2, 0.56), "nucleolus": (0.4, 0.15, 0.44),
    "mito": (0.86, 0.47, 0.2), "mito_rim": (0.95, 0.66, 0.38), "cristae": (0.96, 0.62, 0.32),
    "rer": (0.34, 0.45, 0.8), "ribosome": (0.64, 0.46, 0.76), "ser": (0.47, 0.65, 0.9),
    "golgi": (0.92, 0.47, 0.4), "vesicle": (0.86, 0.8, 0.86), "lysosome": (0.66, 0.5, 0.78),
    "lysosome_contents": (0.52, 0.36, 0.66), "peroxisome": (0.62, 0.78, 0.56),
    "centriole": (0.86, 0.72, 0.36), "cytoskeleton": (0.86, 0.72, 0.36),
}


def centriole(bm, center, axis_matrix, length=0.46, radius=0.15):
    """Nine microtubule triplets arranged in a short barrel."""
    for i in range(9):
        a = i * 2 * math.pi / 9
        for k in range(3):
            r = radius + k * 0.035
            offset = Vector((math.cos(a + k * 0.12) * r, math.sin(a + k * 0.12) * r, 0))
            rod = bmesh.new()
            bmesh.ops.create_cone(rod, cap_ends=True, segments=8, radius1=0.017, radius2=0.017, depth=length)
            bmesh.ops.transform(rod, matrix=Matrix.Translation(center) @ axis_matrix @ Matrix.Translation(offset), verts=rod.verts)
            tmp = bpy.data.meshes.new("tmp")
            rod.to_mesh(tmp)
            rod.free()
            bm.from_mesh(tmp)
            bpy.data.meshes.remove(tmp)


def build_animal():
    rng = random.Random(11)
    pal = ANIMAL
    # Plasma membrane: a shallow bowl with a soft, wavy rim (the top of the cell cut away).
    bm = sphere(1, 96, 48)
    for v in bm.verts:
        a = math.atan2(v.co.y, v.co.x)
        v.co *= 1 + 0.035 * math.sin(a * 9) + 0.02 * math.sin(a * 5 + 1)
    transform(bm, scale=(4.2, 3.2, 1.25), translate=(0, 0, -0.3))
    lumpy(bm, 0.035, 1.3, seed=30)
    cut(bm, Vector((0, 0, 0.02)), Vector((0, 0, 1)))
    membrane = to_object("membrane", bm, material("membrane", pal["membrane"], rough=0.35, coat=0.6, sheen=0.5))
    solidify(membrane, 0.13, material("membrane_rim", pal["membrane_rim"], rough=0.4, coat=0.5))

    # Cytosol: the floor of cytoplasm, an ellipse meeting the membrane.
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=100, y_segments=76, size=0.5)
    transform(bm, scale=(8.1, 6.1, 1), translate=(0, 0, -0.6))
    outside = [v for v in bm.verts if (v.co.x / 3.72) ** 2 + (v.co.y / 2.78) ** 2 > 1]
    bmesh.ops.delete(bm, geom=outside, context="VERTS")
    for v in bm.verts:
        v.co.z += 0.05 * noise.noise(v.co * 1.5) + 0.015 * noise.noise(v.co * 7)
    floor = to_object("cytosol", bm, material("cytosol", pal["cytosol"], rough=0.7, coat=0.2))
    solidify(floor, 0.1)

    nucleus((-1.65, 0.75, -0.25), 1.2, rng, (0.25, -1, 0.95), pal)
    rough_er((-1.65, 0.75), (1.42, 1.6, 1.78, 1.96), (-105, 15), -0.5, 0.44, pal, rng)
    smooth_er((1.35, 1.45, -0.42), 0.8, pal, rng, count=14)
    golgi((0.7, -1.05, -0.58), 0.85, math.radians(-12), pal, rng)

    # Centrosome: two centrioles at right angles, near the nucleus.
    bm = bmesh.new()
    c = Vector((0.05, 1.9, -0.25))
    centriole(bm, c, Matrix.Rotation(math.radians(90), 4, "Y"))
    centriole(bm, c + Vector((0.34, -0.1, 0.0)), Matrix.Identity(4))
    to_object("centrosome", bm, material("centriole", pal["centriole"], rough=0.4, coat=0.3))

    for i, (x, y, a) in enumerate([(2.75, 0.2, 80), (2.2, 2.0, 20), (-1.6, -2.0, 15), (2.35, -1.75, 150)]):
        mitochondrion(i + 1, (x, y, -0.5), 1.2, math.radians(a), pal, rng)

    # Lysosomes: membrane spheres packed with granular contents.
    for i, (x, y, r) in enumerate([(-3.25, -0.15, 0.3), (3.3, -0.8, 0.26), (-0.55, -2.35, 0.24)]):
        bm = lumpy(sphere(r, 32, 22), r * 0.05, 4 / r, seed=40 + i)
        transform(bm, translate=(x, y, -0.45))
        cut(bm, Vector((x, y, -0.45 + r * 0.25)), Vector((0, 0, 1)))
        shell = to_object(f"lysosome.{i + 1:03d}", bm, material("lysosome", pal["lysosome"], rough=0.35, coat=0.6))
        solidify(shell, r * 0.1)
        grains = []
        while len(grains) < 22:
            p = Vector((rng.uniform(-r, r), rng.uniform(-r, r), rng.uniform(-r, r * 0.2))) * 0.72
            if p.length < r * 0.72:
                grains.append((Vector((x, y, -0.45)) + p, r * 0.13))
        scatter(f"lysosome_contents.{i + 1:03d}", grains, 0, material("lysosome_contents", pal["lysosome_contents"]), 1)

    scatter("peroxisome", [(Vector((-0.5, -1.0, -0.47)), 0.2), (Vector((3.0, 1.15, -0.47)), 0.17)], 0,
            material("peroxisome", pal["peroxisome"], rough=0.45), 3)
    scatter("vesicle", [(Vector((rng.uniform(-3.2, 3.2), rng.uniform(-2.4, 2.4), -0.5)), rng.uniform(0.07, 0.12))
                        for _ in range(10)], 0, material("vesicle", pal["vesicle"], rough=0.3, coat=0.6), 2)
    free = []
    while len(free) < 200:
        p = Vector((rng.uniform(-3.8, 3.8), rng.uniform(-2.8, 2.8), -0.53))
        if (p.x / 3.8) ** 2 + (p.y / 2.8) ** 2 < 1:
            free.append((p, 0.026))
    scatter("ribosomes", free, 0.026, material("ribosome", pal["ribosome"], rough=0.5))
    # Cytoskeleton: filaments radiating from the centrosome plus a few long ones.
    paths = []
    for _ in range(12):
        a = rng.uniform(0, 2 * math.pi)
        end = (math.cos(a) * 3.6, math.sin(a) * 2.6, -0.52)
        paths.append(wiggle(rng, (c.x, c.y, -0.45), end, 7, 0.3, z_amount=0.04))
    tubes("cytoskeleton", paths, 0.014, material("cytoskeleton", pal["cytoskeleton"], rough=0.4))


BUILDERS = {"plant": build_plant, "animal": build_animal}


# ---------------------------------------------------------------------------------------------
# Export


def export(kind, out_dir, save_blend):
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / f"{kind}.glb"
    bpy.ops.export_scene.gltf(
        filepath=str(path),
        export_format="GLB",
        export_apply=True,
        export_yup=True,
        export_extras=True,
        export_cameras=False,
        export_lights=False,
        export_animations=False,
        export_texcoords=False,
        export_vertex_color="NONE",
    )
    if save_blend:
        bpy.ops.wm.save_as_mainfile(filepath=str(out_dir / f"{kind}.blend"))
    tris = 0
    for obj in bpy.context.scene.objects:
        if obj.type == "MESH":
            obj.data.calc_loop_triangles()
            tris += len(obj.data.loop_triangles)
    print(f"BUILT {kind}: {path} ({path.stat().st_size // 1024} KB, {tris} triangles, "
          f"{sum(1 for o in bpy.context.scene.objects if o.type == 'MESH')} objects)")


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    out_dir = ROOT / "models"
    save_blend = "--blend" in argv
    if "--out" in argv:
        out_dir = Path(argv[argv.index("--out") + 1]).resolve()
    kinds = [a for a in argv if a in BUILDERS] or list(BUILDERS)
    for kind in kinds:
        reset_scene()
        BUILDERS[kind]()
        export(kind, out_dir, save_blend)


main()
