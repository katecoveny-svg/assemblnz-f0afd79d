"""Run in Blender with the original assembl watch open.

blender --background assembl-watch.blend --python watch_assembly_story.py -- OUTPUT_DIRECTORY
Retains every independent mesh and its packed materials. Only animation changes.
"""
import bpy
import math
import sys
from pathlib import Path
from mathutils import Vector

out = Path(sys.argv[sys.argv.index('--') + 1])
out.mkdir(parents=True, exist_ok=True)
scene = bpy.context.scene
scene.frame_set(1)
parts = [o for o in scene.objects if o.get('is_watch_component')]
assert len(parts) == 1025
assert len({o.data.as_pointer() for o in parts}) == 1025

def ease(t):
    t = max(0, min(1, t))
    return t * t * (3 - 2 * t)

# The mechanism seats first. Dial, individual hands and optical glass close last.
closing = {'06': 0, '05': .3, '01': .7, '03': 1.3, '04': 1.8, '02': 2.25}
opening = {'02': 0, '04': .4, '03': .8, '01': 1.4, '05': 1.7, '06': 2.2}
scene.render.fps = 24
scene.frame_start = 1
scene.frame_end = 433

for obj in parts:
    rest = obj.location.copy()
    delta = Vector(obj['explosion_delta_mm']) * .001
    group = obj['assembly'][:2]
    phase = int(group) * .83
    obj.animation_data_clear()
    for frame in range(1, 434, 3):
        t = (frame - 1) / 24
        amount = 1 - ease((t - 2.4 - closing[group]) / 3.1) if t < 10 else ease((t - 10 - opening[group]) / 3.1)
        wave = t * math.tau / 18
        # Shared float phase keeps the tiny parts of each physical assembly readable.
        floating = Vector((math.sin(wave + phase) * .0018,
                           math.cos(wave + phase) * .0012,
                           math.sin(wave * 2 + phase) * .002)) * amount
        obj.location = rest + delta * amount + floating
        obj.keyframe_insert('location', frame=frame, group='Floating assembly')
    obj.animation_data.action.name = 'Floating assembly / ' + obj['component_id']
    for layer in obj.animation_data.action.layers:
        for strip in layer.strips:
            for bag in strip.channelbags:
                for curve in bag.fcurves:
                    for key in curve.keyframe_points:
                        key.interpolation = 'LINEAR'

scene.timeline_markers.clear()
for frame, name in [(1, 'FLOATING PARTS'), (59, 'MECHANISM FIRST'), (137, 'DIAL AND HANDS'),
                    (187, 'GLASS CLOSES LAST'), (241, 'OPEN THE CONSTRUCTION'), (370, 'FLOATING HOLD')]:
    scene.timeline_markers.new(name, frame=frame)
camera = scene.camera
camera.data.animation_data_clear()
camera.animation_data_clear()
camera.location = (.145, -.225, .285)
for frame in range(1, 434, 3):
    t = (frame - 1) / 24
    amount = 1 - ease((t - 2.4) / 5.4) if t < 10 else ease((t - 10) / 5.4)
    camera.data.ortho_scale = .115 + .11 * amount
    camera.data.keyframe_insert('ortho_scale', frame=frame)
    camera.rotation_euler = (Vector((-.008 * amount, 0, .073 + .016 * amount)) - camera.location).to_track_quat('-Z', 'Y').to_euler()
    camera.keyframe_insert('rotation_euler', frame=frame)
scene['homepage_animation'] = '18-second loop: floating parts; mechanism, casing, dial, hands and glass assemble; hold; separate; float. All 1,025 meshes remain editable.'
notes = bpy.data.texts.get('START HERE') or bpy.data.texts.new('START HERE')
notes.clear()
notes.write(scene['homepage_animation'] + '\n\nOriginal packed rose gold, chrome and glass materials retained. The homepage plays the loop on landing and follows the reader on scroll. The watch is a visual metaphor, separate from the live agent service.\n')
scene.frame_set(1)
bpy.ops.wm.save_as_mainfile(filepath=str(out / 'watch-assembly-story.blend'))
bpy.ops.object.select_all(action='DESELECT')
for obj in parts + [bpy.data.objects['WATCH / master transform']]:
    obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(out / 'watch-assembly-story.glb'), export_format='GLB',
    use_selection=True, export_apply=True, export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6, export_animations=True, export_animation_mode='SCENE',
    export_anim_scene_split_object=False, export_frame_range=True, export_force_sampling=True,
    export_frame_step=3, export_optimize_animation_size=True, export_extras=True,
    export_cameras=False, export_lights=False, export_image_format='JPEG', export_jpeg_quality=90,
    export_yup=True, export_materials='EXPORT')
print('WATCH_STORY_READY: 1025 meshes, 18-second loop', flush=True)
