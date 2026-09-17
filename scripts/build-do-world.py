"""Editable Auckland harbour atelier for the scroll-led DO / homepage hero.

Blender 5.x (Kate Mac 5.1.1): 
  /Applications/Blender.app/Contents/MacOS/Blender -b --python scripts/build-do-world.py -- /absolute/output
Optional: --skip-render

Imagined Assembl studio overlooking a Waitematā-like harbour at dusk —
Rangitoto-inspired volcanic silhouette, waterfront CBD + sky landmark,
Harbour Bridge–inspired span, plum / dusty-rose grade.
Not a scan or mapped real property. Materials embed in GLB; no downloads.

Pipeline: editable .blend saved first (separate objects), then geometry is
batched by material for the browser Draco GLB (atelier.glb).
"""
import bpy, math, sys
import numpy as np
from pathlib import Path
from mathutils import Vector

out = Path(sys.argv[sys.argv.index('--') + 1])
out.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
np.random.seed(26)

# ——— Procedural textures (embedded; no external packs) ———

def texture(name, kind, base, n=512):
    y, x = np.mgrid[0:n, 0:n] / n
    if kind == 'wood':
        # Longitudinal walnut grain with soft pores.
        wave = np.sin(x * 220 + np.sin(y * 8) * 2.4 + np.sin(x * 40 + y * 4) * 1.8)
        pores = (np.random.random((n, n)) > 0.97).astype(np.float32) * 0.08
        value = 0.82 + 0.10 * wave + 0.03 * np.random.random((n, n)) + 0.04 * np.sin(x * 700 + y * 6) - pores
    elif kind == 'stone':
        # Limestone: soft veining + fine grit.
        vein = np.sin((x * 1.2 + y * 0.35) * 18 + np.sin(y * 40) * 2) * 0.06
        grit = 0.025 * np.random.random((n, n))
        value = 0.90 + vein + grit + 0.02 * np.sin(x * 55 - y * 33)
    elif kind == 'fabric':
        # Soft wool weave suggestion (seat backs).
        weave = 0.04 * np.sin(x * 180) * np.sin(y * 180) + 0.02 * np.sin(x * 40 + y * 40)
        value = 0.88 + weave + 0.02 * np.random.random((n, n))
    elif kind == 'water':
        ripple = (
            np.sin(x * 52 + y * 11) * 0.045
            + np.sin(x * 13 - y * 41) * 0.035
            + np.sin((x + y) * 95) * 0.018
        )
        value = 0.76 + 0.14 * ripple + 0.02 * np.random.random((n, n))
    else:
        value = 0.88 + 0.045 * np.sin(x * 31 + y * 14) + 0.03 * np.sin(x * 97 - y * 21) + 0.02 * np.random.random((n, n))
    rgba = np.ones((n, n, 4), dtype=np.float32)
    for c in range(3):
        rgba[:, :, c] = np.clip(base[c] * value, 0, 1)
    image = bpy.data.images.new(name, width=n, height=n)
    image.pixels.foreach_set(rgba.ravel())
    image.pack()
    return image


def material(name, color, rough=0.5, metal=0, emit=0, pattern=None, clearcoat=0, coat_rough=0.2):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Roughness'].default_value = rough
    p.inputs['Metallic'].default_value = metal
    # Blender 4+/5 Principled clearcoat slots (safe no-op if renamed).
    for key, val in (('Coat Weight', clearcoat), ('Coat Roughness', coat_rough),
                     ('Clearcoat', clearcoat), ('Clearcoat Roughness', coat_rough)):
        if key in p.inputs:
            p.inputs[key].default_value = val
    if emit:
        p.inputs['Emission Color'].default_value = (*color, 1)
        p.inputs['Emission Strength'].default_value = emit
    if pattern:
        t = m.node_tree.nodes.new('ShaderNodeTexImage')
        t.image = texture(name + ' grain', pattern, color)
        m.node_tree.links.new(t.outputs['Color'], p.inputs['Base Color'])
        # Soft UV so batched meshes still read grain at room scale.
        texcoord = m.node_tree.nodes.new('ShaderNodeTexCoord')
        mapping = m.node_tree.nodes.new('ShaderNodeMapping')
        mapping.inputs['Scale'].default_value = (2.4, 2.4, 2.4)
        m.node_tree.links.new(texcoord.outputs['Generated'], mapping.inputs['Vector'])
        m.node_tree.links.new(mapping.outputs['Vector'], t.inputs['Vector'])
    return m


# Craft materials — Assembl plum grade, not lilac wash / grape neon.
wood = material('Smoked walnut grain', (0.22, 0.105, 0.07), 0.28, pattern='wood', clearcoat=0.15, coat_rough=0.35)
stone = material('Rose limestone', (0.70, 0.58, 0.50), 0.30, pattern='stone', clearcoat=0.35, coat_rough=0.22)
plaster = material('Warm plum plaster', (0.18, 0.09, 0.12), 0.82, pattern='stone')
brass = material('Brushed bronze', (0.44, 0.25, 0.14), 0.22, 0.85, clearcoat=0.4, coat_rough=0.18)
linen = material('Warm linen', (0.64, 0.48, 0.42), 0.84, pattern='fabric')
rose = material('Muted rose wool', (0.32, 0.10, 0.17), 0.86, pattern='fabric')
felt = material('Acoustic plum felt', (0.16, 0.08, 0.11), 0.95)
light = material('Rose opal light', (0.97, 0.68, 0.54), 0.20, emit=4.8)
paper = material('Ivory paper', (0.93, 0.85, 0.72), 0.76)
graphite = material('Monitor graphite', (0.04, 0.035, 0.045), 0.35, 0.4)
water = material('Waitemata dusk water', (0.07, 0.10, 0.13), 0.08, 0.62, pattern='water', clearcoat=0.6, coat_rough=0.08)
city = material('Auckland waterfront mass', (0.05, 0.032, 0.05), 0.90)
volcanic = material('Volcanic island silhouette', (0.065, 0.05, 0.07), 0.93)
leaf = material('Pohutukawa botanical', (0.11, 0.075, 0.085), 0.76)
city_glow = material('Harbour city light', (0.99, 0.78, 0.55), 0.14, emit=12)


def finish(o, name, mat, bevel=0, smooth=False):
    o.name = name
    o.data.materials.append(mat)
    if bevel:
        mod = o.modifiers.new('Crafted edge', 'BEVEL')
        mod.width = bevel
        mod.segments = 4
        bpy.context.view_layer.objects.active = o
        bpy.ops.object.modifier_apply(modifier=mod.name)
    if smooth and o.type == 'MESH':
        for poly in o.data.polygons:
            poly.use_smooth = True
    return o


def box(name, pos, size, mat, bevel=0.03, smooth=False):
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos)
    o = bpy.context.object
    o.dimensions = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return finish(o, name, mat, bevel, smooth)


def cyl(name, pos, radius, depth, mat, verts=32, bevel=0.02, smooth=True):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=depth, location=pos)
    return finish(bpy.context.object, name, mat, bevel, smooth)


def tube(name, points, radius, mat):
    c = bpy.data.curves.new(name, 'CURVE')
    c.dimensions = '3D'
    c.bevel_depth = radius
    c.bevel_resolution = 4
    s = c.splines.new('POLY')
    s.points.add(len(points) - 1)
    for p, v in zip(s.points, points):
        p.co = (*v, 1)
    o = bpy.data.objects.new(name, c)
    bpy.context.collection.objects.link(o)
    o.data.materials.append(mat)
    return o


def area(name, pos, power, color, size, target):
    d = bpy.data.lights.new(name, 'AREA')
    d.energy = power
    d.color = color
    d.shape = 'DISK'
    d.size = size
    o = bpy.data.objects.new(name, d)
    bpy.context.collection.objects.link(o)
    o.location = pos
    o.rotation_euler = (Vector(target) - o.location).to_track_quat('-Z', 'Y').to_euler()


def chair(x, y, yaw=0, facing=1):
    """Studio task chair — upholstered seat/back, slim bronze feet, soft arms."""
    seat = box('Task seat', (x, y, 0.48), (0.78, 0.72, 0.12), linen, 0.08, True)
    seat.rotation_euler.z = yaw
    back = box('Task back', (x - facing * 0.02, y + facing * 0.28, 0.95), (0.74, 0.12, 0.72), rose, 0.1, True)
    back.rotation_euler.z = yaw
    # Soft lumbar cushion.
    lumbar = box('Task lumbar', (x, y + facing * 0.22, 0.72), (0.62, 0.08, 0.22), rose, 0.06, True)
    lumbar.rotation_euler.z = yaw
    for dx in (-0.26, 0.26):
        for dy in (-0.22, 0.22):
            cyl('Chair foot', (x + dx, y + dy, 0.2), 0.018, 0.40, brass, 10)
    # Slim armrests.
    for dx in (-0.38, 0.38):
        box('Armrest', (x + dx, y + facing * 0.05, 0.68), (0.06, 0.42, 0.05), brass, 0.02)


# ——— Architecture (room scale; Blender Y → -Z in glTF / Three.js) ———

box('Foundation', (0, 10, -0.35), (22, 48, 0.7), plaster, 0.1)
box('Continuous limestone floor', (0, 10, -0.04), (21.8, 47.8, 0.18), stone, 0.04)
# Sparse joints — large slabs read more architectural, less tile grid.
for x in range(-9, 11, 3):
    box('Floor stone joint', (x, 10, 0.052), (0.01, 47, 0.002), brass, 0)
for y in range(-12, 34, 4):
    box('Floor transverse joint', (0, y, 0.052), (21.4, 0.01, 0.002), brass, 0)
box('Sculpted ceiling', (0, 10, 5.6), (22, 48, 0.3), plaster, 0.1)

# Continuous rose-opal cove lights with bronze companion rails.
for offset in (0, 5):
    points = [(offset + math.sin(i / 22) * 1.8, -13 + i * 0.3, 5.31) for i in range(158)]
    tube('Ceiling bronze cove', points, 0.13, brass)
    tube('Continuous rose light', [(x, y, z - 0.12) for x, y, z in points], 0.042, light)

# Curved walnut enclosure — vertical fins catch raking harbour light.
for i in range(156):
    y = -13 + i * 0.3
    x = 9 + math.sin(y * 0.18) * 0.8
    o = box('Walnut wall fin', (x, y, 2.7), (0.22, 0.14, 5.4), wood, 0.02)
    o.rotation_euler.z = -math.cos(y * 0.18) * 0.14

# Acoustic felt panels between fins (quiet craft, not clutter).
for i in range(12):
    y = -10 + i * 3.2
    box('Acoustic panel', (8.55, y, 2.4), (0.04, 1.6, 2.8), felt, 0.02)

# Harbour facade — bronze mullions + thin glazing so Waitematā reads.
for i in range(19):
    y = -13 + i * 2.5
    box('Bronze window mullion', (-9, y, 2.7), (0.06, 0.06, 5.4), brass, 0.008)
box('Window sill', (-9, 10, 0.2), (0.18, 47, 0.18), brass, 0.02)
box('Window head', (-9, 10, 5.3), (0.18, 47, 0.13), brass, 0.01)
# Open glazing — no solid glass plane (keeps Waitematā readable in Cycles + R3F).

# Portal ribs — parallax at room thresholds.
for y in (-8, 8, 23):
    points = [(6.9 * math.cos(t), y, 0.2 + 5.05 * math.sin(t)) for t in np.linspace(0, math.pi, 90)]
    tube('Walnut portal', points, 0.20, wood)
    tube('Inset portal light', [(x, yy + 0.12, z) for x, yy, z in points], 0.016, light)

# ——— Furniture: research table, workshop, presentation salon ———

for y in (0, 15):
    # Table top with thicker crafted edge.
    box('Walnut collaborative table', (3.5, y, 1.05), (5.6, 2.15, 0.14), wood, 0.12, True)
    box('Table apron', (3.5, y, 0.92), (5.2, 1.85, 0.06), wood, 0.04)
    for x in (1.55, 5.45):
        cyl('Turned table pedestal', (x, y, 0.46), 0.32, 0.88, wood, 28)
        cyl('Pedestal foot', (x, y, 0.06), 0.42, 0.08, brass, 24)
    for x in (2.0, 5.0):
        # Monitor: graphite slab + soft rose content glow (not live-agent theatre).
        box('Desk monitor', (x, y - 0.88, 1.52), (0.78, 0.035, 0.46), graphite, 0.008)
        box('Monitor glow', (x, y - 0.86, 1.52), (0.68, 0.008, 0.36), light, 0)
        box('Monitor stand', (x, y - 0.82, 1.18), (0.18, 0.12, 0.08), brass, 0.02)
        cyl('Desk lamp stem', (x + 1.15, y + 0.65, 1.32), 0.016, 0.52, brass, 12)
        cyl('Desk lamp shade', (x + 1.15, y + 0.65, 1.64), 0.10, 0.055, brass, 20)
        cyl('Desk lamp glow', (x + 1.15, y + 0.65, 1.58), 0.065, 0.02, light, 12)
    for x in (1.5, 3.4, 5.3):
        chair(x, y - 1.55, yaw=0, facing=-1)
        chair(x, y + 1.55, yaw=math.pi, facing=1)
        box('Selected paper', (x, y - 0.12, 1.14), (0.58, 0.42, 0.006), paper, 0.004)
        for j in range(3):
            box('Paper annotation', (x - 0.05, y - 0.22 + j * 0.07, 1.145), (0.36, 0.01, 0.002), brass, 0)
    area('Table softbox', (3.5, y, 4.85), 380, (1, 0.66, 0.55), 3.2, (3.5, y, 0))

# Low bookshelf / research ledge at Find (near entry).
for bx in (5.5, 6.4):
    box('Research shelf', (bx, -4, 1.2), (0.55, 2.4, 0.06), wood, 0.04)
    for i in range(7):
        h = 0.22 + (i * 3 % 5) * 0.04
        box('Shelf volume', (bx + (0.08 if i % 2 else -0.08), -4.8 + i * 0.32, 0.95 + h / 2), (0.28, 0.12, h), (paper if i % 3 else felt), 0.01)

# Presentation salon.
cyl('Presentation rug', (3, 28, 0.055), 3.7, 0.018, rose, 48)
cyl('Presentation table', (3, 28, 0.58), 1.4, 0.12, wood, 40, 0.04)
cyl('Presentation pedestal', (3, 28, 0.26), 0.78, 0.48, plaster, 32)
for angle in (-0.2, 0.75, 1.7, 2.7, 3.7, 4.7):
    x = 3 + math.cos(angle) * 2.7
    y = 28 + math.sin(angle) * 2.7
    seat = box('Salon lounge', (x, y, 0.48), (1.25, 1.05, 0.38), linen, 0.18, True)
    seat.rotation_euler.z = angle
    cushion = box('Salon seat cushion', (x, y, 0.68), (1.1, 0.9, 0.1), rose, 0.08, True)
    cushion.rotation_euler.z = angle
    back = box(
        'Salon back',
        (x + math.cos(angle) * 0.4, y + math.sin(angle) * 0.4, 1.0),
        (1.15, 0.18, 0.82),
        linen,
        0.12,
        True,
    )
    back.rotation_euler.z = angle - math.pi / 2
cyl('Salon pendant stem', (3, 28, 4.35), 0.018, 1.5, brass, 8)
cyl('Salon pendant shade', (3, 28, 3.52), 0.42, 0.11, brass, 28)
cyl('Salon pendant glow', (3, 28, 3.45), 0.30, 0.035, light, 20)

# Planters + pohutukawa-toned foliage (sculptural, not botanical scan).
for px, py in ((-7, -2), (7, 8), (-7, 19), (7, 30)):
    cyl('Stone planter', (px, py, 0.42), 0.46, 0.84, stone, 28, 0.04)
    tube('Botanical stem', [(px, py, 0.7), (px + 0.08, py, 1.7), (px - 0.08, py, 2.9)], 0.03, wood)
    for i in range(8):
        a = i * 2.4
        z = 1.3 + i * 0.16
        dx = math.cos(a) * 0.45
        dy = math.sin(a) * 0.45
        tube('Botanical branch', [(px, py, z), (px + dx, py + dy, z + 0.2)], 0.01, wood)
        bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=6, location=(px + dx, py + dy, z + 0.2))
        o = bpy.context.object
        o.scale = (0.26, 0.11, 0.035)
        o.rotation_euler = (0.35, 0.45, a)
        finish(o, 'Botanical leaf', leaf, smooth=True)

# ——— Waitematā exterior ———

box('Waitemata water', (-32, 10, -0.4), (54, 160, 0.2), water, 0)
box('Nearshore glaze', (-16, 10, -0.2), (5, 90, 0.035), water, 0)

cbd = [
    (-20, -8, 2.6, 2.3, 11.0),
    (-21.5, -4, 2.1, 1.9, 8.4),
    (-19.5, -1, 3.1, 2.5, 14.0),
    (-22, 2.5, 1.9, 1.7, 7.0),
    (-20.2, 5, 2.7, 2.3, 12.0),
    (-23, 8, 1.7, 1.5, 5.6),
    (-19.8, 11, 3.3, 2.7, 16.0),
    (-21.2, 14.5, 2.3, 2.1, 9.8),
    (-20, 18, 2.9, 2.4, 12.5),
    (-22.5, 21, 1.8, 1.6, 6.4),
    (-19.5, 24, 2.6, 2.3, 10.5),
    (-21, 27.5, 2.2, 2.0, 8.8),
    (-20.4, 31, 2.8, 2.5, 11.5),
    (-23.2, 34, 1.6, 1.4, 5.0),
    (-19.0, 0.5, 1.5, 4.0, 3.4),
    (-18.8, 16, 1.4, 4.3, 2.9),
]
for x, y, w, d, h in cbd:
    box('Waterfront tower', (x, y, h / 2 - 0.5), (w, d, h), city, 0.035)
    # Warm windows — denser mid-band, sparser crown (reads like occupied floors).
    for z in np.arange(0.55, h - 0.7, 1.25):
        cols = max(2, int(d))
        for dy in np.linspace(-d * 0.28, d * 0.28, cols):
            if (int(z * 10) + int(dy * 20)) % 4 == 0:
                continue
            box('Tower window', (x + w * 0.52, y + dy, z - 0.5), (0.035, 0.36, 0.24), city_glow, 0)

# Sky Tower–inspired landmark (illustrative).
cyl('Sky landmark shaft', (-19.4, 9.2, 9.0), 0.20, 19.5, city, 18)
cyl('Sky landmark pod', (-19.4, 9.2, 17.0), 0.58, 1.15, city, 24)
cyl('Sky landmark mast', (-19.4, 9.2, 20.5), 0.055, 5.8, brass, 10)
cyl('Sky landmark beacon', (-19.4, 9.2, 23.4), 0.09, 0.22, city_glow, 8)

# Harbour Bridge–inspired span (sparse silhouette — budget-conscious).
for i, t in enumerate(np.linspace(0, 1, 14)):
    bx = -15.5
    by = -6 + t * 28
    arch_z = 1.2 + 3.8 * math.sin(t * math.pi)
    box('Bridge deck', (bx, by, 1.15), (0.5, 1.8, 0.16), city, 0.02)
    if 0.1 < t < 0.9 and i % 2 == 0:
        box('Bridge arch', (bx, by, arch_z), (0.1, 0.4, 0.2), city, 0.02)

# North Shore ridge + Rangitoto-inspired massing.
for i in range(18):
    y = -20 + i * 3.2
    h = 1.8 + (i * 5 % 9) * 0.5
    box('North shore ridge', (-40 - (i % 3) * 1.5, y, h / 2 - 0.4), (3.0, 2.3, h), volcanic, 0.03)

bpy.ops.mesh.primitive_cone_add(vertices=56, radius1=17, radius2=0.45, depth=9.0, location=(-48, 8, 3.0))
cone = bpy.context.object
cone.scale = (1.05, 1.45, 1.0)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
finish(cone, 'Rangitoto silhouette', volcanic, 0.1, True)
bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=18, radius=6.5, location=(-44, 18, 0.5))
shoulder = bpy.context.object
shoulder.scale = (1.55, 1.2, 0.5)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
finish(shoulder, 'Volcanic shoulder', volcanic, smooth=True)

# Sparse harbour markers / ferry lights.
for fy, fz in ((-2, 0.22), (6, 0.2), (14, 0.24), (22, 0.18), (10, 0.26), (18, 0.2)):
    cyl('Harbour marker', (-12.5, fy, fz), 0.06, 0.1, city_glow, 8)

# Soft ferry hull silhouette on the water.
box('Ferry hull', (-13.5, 4, 0.35), (1.8, 4.2, 0.55), city, 0.06)
box('Ferry cabin glow', (-13.2, 4, 0.75), (0.9, 2.8, 0.35), city_glow, 0)

# Area lights for poster / Cycles (R3F uses its own Spatial C grade).
for py in range(-10, 35, 7):
    area('Harbour dusk wash', (-8, py, 3.6), 480, (0.70, 0.46, 0.40), 5.5, (2, py, 1.2))
area('Entry fill', (-1, -10, 4.4), 560, (0.95, 0.70, 0.55), 4.0, (3, 3, 1))
area('City bounce', (-15, 12, 5.2), 820, (0.95, 0.62, 0.38), 9, (0, 12, 2))

# ——— Export ———

scene = bpy.context.scene
scene.world.use_nodes = True
bg = scene.world.node_tree.nodes['Background']
bg.inputs[0].default_value = (0.08, 0.045, 0.07, 1)
bg.inputs[1].default_value = 0.32

# Eye-level arrival (~1.85 m), ~36mm — glance toward Waitematā glazing.
bpy.ops.object.camera_add(location=(2.6, -10.2, 1.85))
camera = bpy.context.object
camera.name = 'Arrival camera'
camera.rotation_euler = (Vector((-7, 3.5, 1.55)) - camera.location).to_track_quat('-Z', 'Y').to_euler()
camera.data.lens = 36
scene.camera = camera
scene.render.engine = 'CYCLES'
scene.cycles.samples = 48
scene.cycles.use_denoising = True
scene.render.resolution_x = 1600
scene.render.resolution_y = 1000
scene.render.resolution_percentage = 100
scene.view_settings.view_transform = 'AgX'

for o in list(scene.objects):
    if o.type == 'CURVE':
        bpy.ops.object.select_all(action='DESELECT')
        o.select_set(True)
        bpy.context.view_layer.objects.active = o
        bpy.ops.object.convert(target='MESH')

# Editable file keeps separate architecture / furniture objects.
bpy.ops.wm.save_as_mainfile(filepath=str(out / 'do-world.blend'))

# Browser export: batch by material to keep draw calls low.
for mat in list(bpy.data.materials):
    group = [
        o for o in scene.objects
        if o.type == 'MESH' and len(o.data.materials) == 1 and o.data.materials[0] == mat
    ]
    if len(group) > 1:
        bpy.ops.object.select_all(action='DESELECT')
        for o in group:
            o.select_set(True)
        bpy.context.view_layer.objects.active = group[0]
        bpy.ops.object.join()
        group[0].name = 'Batched ' + mat.name

bpy.ops.export_scene.gltf(
    filepath=str(out / 'do-world.glb'),
    export_format='GLB',
    export_cameras=False,
    export_lights=False,
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
)
if '--skip-render' not in sys.argv:
    scene.render.image_settings.file_format = 'PNG'
    scene.render.filepath = str(out / 'do-world-poster.png')
    bpy.ops.render.render(write_still=True)
print('DO_WORLD_COMPLETE', len(scene.objects), 'objects')
