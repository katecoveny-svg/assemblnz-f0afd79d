"""Render the owned Scandi scene and export constant PBR web materials.
Procedural materials stay in the editable source. Inspect exporter options
instead of assuming names across Blender packages. Keep CPU denoising off
on the distro build which does not include OpenImageDenoiser.
"""
from pathlib import Path
import bpy


def export_web_model(output):
    originals = []
    replacements = {}
    try:
        for obj in bpy.context.selected_objects:
            if obj.type != 'MESH':
                continue
            for slot in obj.material_slots:
                old = slot.material
                if old is None:
                    continue
                if old not in replacements:
                    new = bpy.data.materials.new(old.name + ' web PBR')
                    new.use_nodes = True
                    new.diffuse_color = old.diffuse_color[:]
                    src = old.node_tree.nodes.get('Principled BSDF') if old.use_nodes else None
                    dst = new.node_tree.nodes.get('Principled BSDF')
                    for key in ('Base Color', 'Roughness', 'Metallic', 'Alpha', 'Emission Color', 'Emission Strength'):
                        if src and key in src.inputs and key in dst.inputs:
                            value = src.inputs[key].default_value
                            dst.inputs[key].default_value = value[:] if hasattr(value, '__len__') else value
                    replacements[old] = new
                originals.append((slot, old))
                slot.material = replacements[old]
        properties = bpy.ops.export_scene.gltf.get_rna_type().properties
        supported = set(properties.keys())
        print('GLTF_SUPPORTED', sorted(supported))
        formats = [item.identifier for item in properties['export_format'].enum_items]
        print('GLTF_FORMATS', formats)
        if 'GLB' not in formats:
            raise RuntimeError('Installed exporter does not provide GLB: ' + ', '.join(formats))
        options = dict(filepath=str(output), export_format='GLB')
        selection = next((key for key in ('use_selection', 'export_selected') if key in supported), None)
        if selection is None:
            raise RuntimeError('Installed exporter has no selected-object option')
        options[selection] = True
        modifiers = next((key for key in ('export_apply', 'export_apply_modifiers') if key in supported), None)
        if modifiers:
            options[modifiers] = True
        for key, value in [('export_yup', True), ('export_cameras', False), ('export_lights', False)]:
            if key in supported:
                options[key] = value
        print('GLTF_EXPORT_OPTIONS', options)
        bpy.ops.export_scene.gltf(**options)
        if not output.is_file() or output.stat().st_size < 1024:
            raise RuntimeError('GLB export did not produce a valid-size asset')
    finally:
        for slot, original in originals:
            slot.material = original
        for replacement in replacements.values():
            bpy.data.materials.remove(replacement)

source_path = Path('scripts/design/build_scandi_office.py')
source = source_path.read_text()
call = "bpy.ops.export_scene.gltf(filepath=str(OUT/'scandi-office.glb'),export_format='GLB',use_selection=True,export_apply=True,export_yup=True,export_cameras=False,export_lights=False)"
if source.count(call) != 1:
    raise RuntimeError('Authoring entry point changed; review export adapter before running')
source = source.replace(call, "export_web_model(OUT/'scandi-office.glb')")
source = source.replace('scene.cycles.use_denoising=True', 'scene.cycles.use_denoising=False').replace('scene.cycles.samples=24', 'scene.cycles.samples=64')
exec(compile(source, str(source_path), 'exec'), {'__name__': '__main__', 'export_web_model': export_web_model})
