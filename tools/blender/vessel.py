"""
assembl vessel — Blender bpy build + render script.

Renders the canonical assembl stacked vessel in one of three brand variants:

    pounamu   (default) — green translucent glass + cream ceramic
    arataki              — karaka amber glass + cream ceramic
    toro                 — smoky charcoal glass + cream ceramic, bird-form top

Usage:

    # GUI: open Blender, drop this file into Text Editor, hit Run Script.
    # The variant defaults to "pounamu". Edit VARIANT below to change it.

    # Headless (recommended for batch + scripted output):
    blender --background --python tools/blender/vessel.py -- --variant pounamu
    blender --background --python tools/blender/vessel.py -- --variant arataki
    blender --background --python tools/blender/vessel.py -- --variant toro

    # Optional flags:
    #   --animate          render a 4-second turntable MP4 (else single PNG)
    #   --resolution 4K    [4K | 2K | 1080p]   default: 4K
    #   --output <path>    output file path     default: ./out/vessel-<variant>.<ext>

Outputs (default): ./out/vessel-pounamu.png at 3840x2160, Cycles, 256 samples.

Brand palette (Mārama Whenua canon):
    paper:    #FAF7F2
    pounamu:  #2B6B57
    karaka:   #D4842A   (Arataki amber)
    charcoal: #23211F   (Tōro)
    brass:    #C8A858

This is a parametric build — not a final-render asset. Use the output as
a starting point for a 3D artist who will refine geometry, materials, and
lighting. Or use it as-is for editorial stills if the look is close enough.
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector

# ─────────────────────────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────────────────────────

VARIANT = "pounamu"   # pounamu | arataki | toro
ANIMATE = False
RESOLUTION = "4K"     # 4K | 2K | 1080p
OUTPUT_PATH = None

# Parse CLI args after `--`. Validates that flags requiring a value have one
# rather than throwing IndexError when shell expansion produces an empty arg.
if "--" in sys.argv:
    cli = sys.argv[sys.argv.index("--") + 1:]
    i = 0
    while i < len(cli):
        arg = cli[i]
        if arg == "--animate":
            ANIMATE = True
            i += 1
            continue
        if arg in ("--variant", "--resolution", "--output"):
            if i + 1 >= len(cli):
                sys.stderr.write(f"[vessel] {arg} requires a value.\n")
                sys.exit(2)
            value = cli[i + 1]
            if arg == "--variant":      VARIANT = value
            elif arg == "--resolution": RESOLUTION = value
            elif arg == "--output":     OUTPUT_PATH = value
            i += 2
            continue
        i += 1

RES_MAP = {"4K": (3840, 2160), "2K": (2560, 1440), "1080p": (1920, 1080)}
RES_X, RES_Y = RES_MAP.get(RESOLUTION, RES_MAP["4K"])

# Brand palette → linear RGB tuples for Blender shading
def hex_to_linear(h):
    """Convert hex (#RRGGBB) to linear-RGB tuple Blender expects."""
    h = h.lstrip("#")
    srgb = [int(h[i:i+2], 16) / 255.0 for i in (0, 2, 4)]
    # sRGB → linear approximation (gamma 2.2)
    return tuple(((c + 0.055) / 1.055) ** 2.4 if c > 0.04045 else c / 12.92 for c in srgb)

PALETTE = {
    "paper":     hex_to_linear("#FAF7F2"),
    "pounamu":   hex_to_linear("#2B6B57"),
    "karaka":    hex_to_linear("#D4842A"),
    "charcoal":  hex_to_linear("#23211F"),
    "brass":     hex_to_linear("#C8A858"),
    "cream":     hex_to_linear("#F4EFE7"),
}

VARIANTS = {
    "pounamu":  {"glass_color": PALETTE["pounamu"],  "top_color": PALETTE["cream"],    "top_shape": "wave"},
    "arataki":  {"glass_color": PALETTE["karaka"],   "top_color": PALETTE["cream"],    "top_shape": "wave"},
    "toro":     {"glass_color": PALETTE["charcoal"], "top_color": PALETTE["charcoal"], "top_shape": "bird"},
}

if VARIANT not in VARIANTS:
    print(f"[vessel] Unknown variant '{VARIANT}'. Using 'pounamu'.")
    VARIANT = "pounamu"

CONFIG = VARIANTS[VARIANT]

# ─────────────────────────────────────────────────────────────────────────────
# SCENE RESET
# ─────────────────────────────────────────────────────────────────────────────

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete()
for material in list(bpy.data.materials):
    bpy.data.materials.remove(material)

scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.cycles.samples = 256
scene.cycles.use_denoising = True
scene.render.resolution_x = RES_X
scene.render.resolution_y = RES_Y
scene.render.film_transparent = False

# ─────────────────────────────────────────────────────────────────────────────
# MATERIALS
# ─────────────────────────────────────────────────────────────────────────────

def make_principled(name, base_color, metallic=0.0, roughness=0.5,
                    transmission=0.0, ior=1.45, alpha=1.0, subsurface=0.0):
    """Create a Principled BSDF material. Blender 4.x compatible."""
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf is None:
        return mat
    bsdf.inputs["Base Color"].default_value = (*base_color, 1.0)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    # Blender 4.x: Transmission moved to "Transmission Weight"
    for key in ("Transmission Weight", "Transmission"):
        if key in bsdf.inputs:
            bsdf.inputs[key].default_value = transmission
            break
    bsdf.inputs["IOR"].default_value = ior
    bsdf.inputs["Alpha"].default_value = alpha
    for key in ("Subsurface Weight", "Subsurface"):
        if key in bsdf.inputs:
            bsdf.inputs[key].default_value = subsurface
            break
    return mat

MAT_BRASS   = make_principled("brass",   PALETTE["brass"],  metallic=1.0, roughness=0.18)
MAT_CERAMIC = make_principled("ceramic", PALETTE["cream"],  metallic=0.0, roughness=0.42, subsurface=0.08)
MAT_GLASS   = make_principled("glass",   CONFIG["glass_color"], metallic=0.0,
                              roughness=0.05, transmission=0.95, ior=1.48, alpha=0.92)
MAT_TOP     = make_principled("top",     CONFIG["top_color"],
                              metallic=0.0,
                              roughness=0.4 if CONFIG["top_shape"] == "wave" else 0.32,
                              subsurface=0.08 if CONFIG["top_shape"] == "wave" else 0.0)

# ─────────────────────────────────────────────────────────────────────────────
# GEOMETRY
# ─────────────────────────────────────────────────────────────────────────────

def add_cylinder(name, radius, depth, location, material):
    bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=radius, depth=depth,
                                        location=location)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(material)
    return obj

def add_brass_frame():
    """4 vertical posts + 4 horizontal rails forming a cube wireframe around
    the vessel base. Thin cylinders, brass material."""
    size = 0.9
    post_h = 0.45
    rail_r = 0.012
    frame = []
    # 4 vertical posts at the corners
    for sx in (-1, 1):
        for sy in (-1, 1):
            obj = add_cylinder(f"post-{sx}{sy}", rail_r, post_h,
                               (sx * size, sy * size, post_h / 2), MAT_BRASS)
            frame.append(obj)
    # 4 horizontal rails at the top, forming the upper square
    for ax in (-1, 1):
        # X-aligned rails (front/back)
        bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=rail_r,
                                            depth=size * 2,
                                            rotation=(0, math.pi / 2, 0),
                                            location=(0, ax * size, post_h))
        bpy.context.object.name = f"rail-x-{ax}"
        bpy.context.object.data.materials.append(MAT_BRASS)
        frame.append(bpy.context.object)
        # Y-aligned rails (left/right)
        bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=rail_r,
                                            depth=size * 2,
                                            rotation=(math.pi / 2, 0, 0),
                                            location=(ax * size, 0, post_h))
        bpy.context.object.name = f"rail-y-{ax}"
        bpy.context.object.data.materials.append(MAT_BRASS)
        frame.append(bpy.context.object)
    return frame

def add_bowl():
    """Cream ceramic hemisphere sitting in the brass frame."""
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32,
                                         radius=0.72, location=(0, 0, 0.5))
    obj = bpy.context.object
    obj.name = "bowl"
    # Slice the top half off — keep bottom hemisphere
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:],
                            plane_co=(0, 0, 0.5), plane_no=(0, 0, 1),
                            clear_outer=True)
    bm.to_mesh(obj.data)
    bm.free()
    obj.data.materials.append(MAT_CERAMIC)
    # Subtle scale flatten so it reads as a wide shallow bowl
    obj.scale = (1.0, 1.0, 0.55)
    return obj

def add_glass_plate(z, radius, depth=0.025):
    """Flat translucent disc."""
    obj = add_cylinder(f"plate-{z:.2f}", radius, depth, (0, 0, z), MAT_GLASS)
    return obj

def add_glass_core(z):
    """Central translucent ceramic-style core — a flattened sphere with
    organic deformation."""
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24,
                                         radius=0.22, location=(0, 0, z))
    obj = bpy.context.object
    obj.name = f"core-{z:.2f}"
    obj.scale = (1.0, 1.0, 0.55)
    obj.data.materials.append(MAT_GLASS)
    return obj

def add_wave_top():
    """Cream ceramic wave/spoon shape on top — flattened torus rotated
    to read as a leaf or spoon."""
    bpy.ops.mesh.primitive_torus_add(major_radius=0.55, minor_radius=0.06,
                                     major_segments=64, minor_segments=12,
                                     location=(0, 0, 1.42))
    obj = bpy.context.object
    obj.name = "top-wave"
    obj.scale = (1.0, 0.42, 0.7)
    obj.rotation_euler = (math.radians(8), 0, 0)
    obj.data.materials.append(MAT_TOP)
    return obj

def add_bird_top():
    """Tōro charcoal bird form on top — stretched sculpted sphere."""
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24,
                                         radius=0.32, location=(0, 0, 1.40))
    obj = bpy.context.object
    obj.name = "top-bird"
    obj.scale = (1.6, 0.55, 0.45)
    obj.rotation_euler = (math.radians(10), 0, 0)
    obj.data.materials.append(MAT_TOP)
    # Add a slight beak — a small cone at one end
    bpy.ops.mesh.primitive_cone_add(radius1=0.05, radius2=0.0, depth=0.18,
                                    location=(0.50, 0, 1.40),
                                    rotation=(0, math.radians(90), 0))
    beak = bpy.context.object
    beak.name = "top-bird-beak"
    beak.data.materials.append(MAT_TOP)
    return obj

# Build the stack
add_brass_frame()
add_bowl()
# Mid stack — three discs and a core, alternating
add_glass_plate(z=0.75, radius=0.62)
add_glass_core(z=0.86)
add_glass_plate(z=1.00, radius=0.58)
add_glass_core(z=1.12)
add_glass_plate(z=1.25, radius=0.50)
# Top
if CONFIG["top_shape"] == "bird":
    add_bird_top()
else:
    add_wave_top()

# ─────────────────────────────────────────────────────────────────────────────
# WORLD + LIGHTING
# ─────────────────────────────────────────────────────────────────────────────

# Warm cream background — used as a soft env light
world = scene.world
world.use_nodes = True
bg = world.node_tree.nodes.get("Background")
if bg:
    bg.inputs["Color"].default_value = (*PALETTE["paper"], 1.0)
    bg.inputs["Strength"].default_value = 0.85

# Key light — soft area, slightly warm
bpy.ops.object.light_add(type="AREA", location=(2.2, -2.0, 3.0))
key = bpy.context.object
key.data.energy = 900
key.data.size = 2.5
key.data.color = (1.0, 0.96, 0.90)
key.rotation_euler = (math.radians(40), math.radians(20), math.radians(40))

# Fill — cooler, lower intensity
bpy.ops.object.light_add(type="AREA", location=(-2.6, -1.2, 1.8))
fill = bpy.context.object
fill.data.energy = 280
fill.data.size = 2.0
fill.data.color = (0.92, 0.96, 1.0)
fill.rotation_euler = (math.radians(70), 0, math.radians(-30))

# Rim — from behind the vessel for edge separation
bpy.ops.object.light_add(type="AREA", location=(0.5, 2.6, 1.6))
rim = bpy.context.object
rim.data.energy = 380
rim.data.size = 1.6
rim.data.color = (1.0, 0.93, 0.85)
rim.rotation_euler = (math.radians(80), 0, math.radians(180))

# ─────────────────────────────────────────────────────────────────────────────
# CAMERA
# ─────────────────────────────────────────────────────────────────────────────

bpy.ops.object.camera_add(location=(3.6, -3.6, 1.6))
cam = bpy.context.object
cam.name = "cam-main"
cam.data.lens = 65
# Aim at the middle of the stack
target = Vector((0, 0, 0.95))
direction = target - cam.location
cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
scene.camera = cam

# ─────────────────────────────────────────────────────────────────────────────
# RENDER
# ─────────────────────────────────────────────────────────────────────────────

os.makedirs("out", exist_ok=True)

if ANIMATE:
    # 4-second turntable at 24 fps — 96 frames
    scene.frame_start = 1
    scene.frame_end = 96
    # Position the camera straight out along +X so the turntable orbits
    # cleanly around the vessel centre. Recompute the rotation so the
    # camera looks at the same target after the move — otherwise the
    # original off-axis aim from `cam.rotation_euler = ...` above would
    # carry over and the orbit would be off-centre.
    cam.location = (4.0, 0.0, 1.6)
    direction = target - Vector(cam.location)
    cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    # Add an empty at the vessel centre and parent the camera to it,
    # then rotate the empty for a turntable.
    bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0, 0, 0.95))
    pivot = bpy.context.object
    pivot.name = "turntable-pivot"
    cam.parent = pivot
    # Preserve the camera's world transform when parenting. Without this,
    # the pivot's (0, 0, 0.95) offset gets applied to the camera, lifting
    # it by 0.95 in Z and breaking the orbit aim. matrix_parent_inverse
    # is the Pythonic equivalent of "Set Parent (Keep Transform)".
    cam.matrix_parent_inverse = pivot.matrix_world.inverted()
    pivot.rotation_euler = (0, 0, 0)
    pivot.keyframe_insert(data_path="rotation_euler", frame=1)
    pivot.rotation_euler = (0, 0, math.radians(360))
    pivot.keyframe_insert(data_path="rotation_euler", frame=96)
    for fc in pivot.animation_data.action.fcurves:
        for kp in fc.keyframe_points:
            kp.interpolation = "LINEAR"
    scene.render.image_settings.file_format = "FFMPEG"
    scene.render.ffmpeg.format = "MPEG4"
    scene.render.ffmpeg.codec = "H264"
    scene.render.ffmpeg.constant_rate_factor = "HIGH"
    scene.render.fps = 24
    out_default = f"./out/vessel-{VARIANT}.mp4"
else:
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    out_default = f"./out/vessel-{VARIANT}.png"

scene.render.filepath = OUTPUT_PATH or out_default

print(f"[vessel] Rendering variant={VARIANT} animate={ANIMATE} res={RES_X}x{RES_Y} -> {scene.render.filepath}")

if ANIMATE:
    bpy.ops.render.render(animation=True)
else:
    bpy.ops.render.render(write_still=True)

print(f"[vessel] Done: {scene.render.filepath}")
