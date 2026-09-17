"""Render the owned Scandi scene and export constant PBR web materials.
Procedural render materials stay in the editable Blender source. Export options
are checked against the installed operator rather than assumed across versions.
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
        supported = set(bpy.ops.export_scene.gltf.get_rna_type().properties.keys())
        options = dict(filepath=str(output), export_format='GLB',
            use_selection=True, export_apply=True,
            export_cameras=False, export_lights=False)
        if 'export_yup' in supported:
            options['export_yup'] = True
        missing = set(options) - supported
        if missing:
            raise RuntimeError('Required glTF options unsupported: ' + ', '.join(sorted(missing)))
        print('GLTF_EXPORT_OPTIONS', options)
        bpy.ops.export_scene.gltf(**options)
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
exec(compile(source, str(source_path), 'exec'), {'__name__': '__main__', 'export_web_model': export_web_model})
