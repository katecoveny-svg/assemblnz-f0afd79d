"""Refine the authored 3D office with a licensed distant Auckland panorama.
The room and Franklin remain geometry. The photograph is an exterior backdrop only.
Requires the earlier owned .blend artifact at /tmp/franklin-source.
"""
import bpy, json, math, hashlib, urllib.request
from pathlib import Path
from mathutils import Vector
root=Path('/tmp/franklin-source');source=next(root.rglob('franklin-office.blend'))
bpy.ops.wm.open_mainfile(filepath=str(source))
S=bpy.context.scene
OUT=Path('public/do/world/franklin-v1');OUT.mkdir(parents=True,exist_ok=True)
EV=Path('visual-evidence/franklin-daylight');EV.mkdir(parents=True,exist_ok=True)
# Fixed, rights-checked public-domain image. No arbitrary URLs or model-generated assets.
url='https://upload.wikimedia.org/wikipedia/commons/c/c7/Auckland_skyline_from_Viaduct_Harbour.jpg'
request=urllib.request.Request(url,headers={'User-Agent':'AssemblSceneAuthoring/1.0 (owned architectural study; assembl.co.nz)'})
with urllib.request.urlopen(request,timeout=45) as response:
 data=response.read(8_000_001)
assert len(data)<=8_000_000,'Unexpected panorama size'
assert hashlib.sha1(data).hexdigest()=='fd17f9e4f0766e4a4564911e528990d5f51fbb1d','Source photograph differs from the reviewed version'
panorama=EV/'auckland-cc0-original.jpg';panorama.write_bytes(data)
image=bpy.data.images.load(str(panorama));image.scale(3072,1006);image.filepath_raw=str(OUT/'auckland-panorama.jpg');image.file_format='JPEG';image.save();image.pack()
for o in list(S.objects):
 if o.name.startswith(('Auckland skyline','Skyline ','Harbour plane')):bpy.data.objects.remove(o,do_unlink=True)
# A distant scenic backdrop, not a fake office image projected over the model.
mesh=bpy.data.meshes.new('Distant panorama plane')
mesh.from_pydata([(-55,60,-8.4),(55,60,-8.4),(55,60,27.62),(-55,60,27.62)],[],[(0,1,2,3)])
mesh.update();uv=mesh.uv_layers.new(name='UVMap')
for loop,value in zip(uv.data,[(0,0),(1,0),(1,1),(0,1)]):loop.uv=value
back=bpy.data.objects.new('Exterior.Auckland CC0 panorama',mesh);S.collection.objects.link(back)
mat=bpy.data.materials.new('Exterior archival Auckland panorama CC0');mat.use_nodes=True
nodes=mat.node_tree.nodes;nodes.clear();t=nodes.new('ShaderNodeTexImage');t.image=image
emit=nodes.new('ShaderNodeEmission');emit.inputs['Strength'].default_value=.7
out=nodes.new('ShaderNodeOutputMaterial');mat.node_tree.links.new(t.outputs['Color'],emit.inputs['Color']);mat.node_tree.links.new(emit.outputs[0],out.inputs['Surface']);mesh.materials.append(mat)
# Retain daylight neutrality and some modelling contrast rather than a white flood.
S.world.node_tree.nodes['Background'].inputs[1].default_value=.38
for o in S.objects:
 if o.type=='LIGHT' and o.data.type=='AREA':o.data.energy*=.82
S.cycles.samples=80;S.cycles.use_denoising=False;S.cycles.max_bounces=5
S.view_settings.exposure=.10
cam=S.camera;cam.animation_data_clear()
shots=[('hero-wide',(-4.8,-7.6,1.93),(1.0,1.3,1.13),1600,900,24),('hero-mobile',(-2.25,-7.2,1.95),(1.70,.5,.99),750,1100,25),('workroom',(-2.35,-4.2,1.78),(-.5,2.2,1.1),1440,900,24),('studio',(1.1,-3.8,1.7),(4.5,.55,.9),1440,900,25),('franklin-detail',(.10,-3.45,.80),(1.72,-1.57,.33),1200,800,49)]
for frame,loc,target in [(1,shots[0][1],shots[0][2]),(100,shots[2][1],shots[2][2]),(200,shots[3][1],shots[3][2])]:
 cam.location=loc;cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler();cam.keyframe_insert('location',frame=frame);cam.keyframe_insert('rotation_euler',frame=frame)
S.frame_set(1);bpy.ops.wm.save_as_mainfile(filepath=str(EV/'franklin-office.blend'))
bpy.ops.object.select_all(action='DESELECT')
for o in S.objects:
 if o.type=='MESH':o.select_set(True)
supported=set(bpy.ops.export_scene.gltf.get_rna_type().properties.keys());opts={'filepath':str(OUT/'office.glb'),'export_format':'GLB'}
for variants,value in [(('use_selection','export_selected'),True),(('export_apply','export_apply_modifiers'),True),(('export_yup',),True),(('export_cameras',),False),(('export_lights',),False),(('export_animations',),False)]:
 k=next((k for k in variants if k in supported),None)
 if k:opts[k]=value
bpy.ops.export_scene.gltf(**opts)
cam.animation_data_clear();S.render.resolution_percentage=100;S.render.image_settings.file_format='JPEG';S.render.image_settings.quality=92
for name,loc,target,w,h,lens in shots:
 cam.location=loc;cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=lens;S.render.resolution_x=w;S.render.resolution_y=h;S.render.filepath=str(OUT/(name+'.jpg'));bpy.ops.render.render(write_still=True)
manifest=json.loads((OUT/'scene-manifest.json').read_text());manifest.update(revision='daylight-panorama',bytes=(OUT/'office.glb').stat().st_size,meshCount=sum(o.type=='MESH' for o in S.objects),exterior={'author':'Chiara Coetzee','date':'2012-01-06','license':'CC0 1.0','source':'https://commons.wikimedia.org/wiki/File:Auckland_skyline_from_Viaduct_Harbour.jpg','usage':'Resized distant scenic backdrop only; not a current geographic survey or a photograph of this imagined office.'})
(OUT/'scene-manifest.json').write_text(json.dumps(manifest,indent=2))
(OUT/'CREDITS.md').write_text('# Exterior panorama\n\nAuckland skyline from Viaduct Harbour, Chiara Coetzee, 6 January 2012. CC0 1.0 public-domain dedication. Resized and used only as a distant backdrop in an original 3D office. The room and Franklin are authored geometry. This is not a current panorama or an actual office location.\n\nhttps://commons.wikimedia.org/wiki/File:Auckland_skyline_from_Viaduct_Harbour.jpg\nhttps://creativecommons.org/publicdomain/zero/1.0/\n\nOriginal SHA-1: fd17f9e4f0766e4a4564911e528990d5f51fbb1d\n')
print('DAYLIGHT_COMPLETE',manifest)
