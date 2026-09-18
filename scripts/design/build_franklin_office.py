"""Owned, editable Auckland-inspired office and Franklin geometry.
blender -b -t 4 --python-exit-code 1 --python scripts/design/build_franklin_office.py
No image-plane dog, remote assets, paid models, or changes to another authoring file.
Blender is Z-up; exported camera coordinates are x,z,-y for glTF Y-up.
"""
import bpy, math, random, json
import numpy as np
from pathlib import Path
from mathutils import Vector
R=random.Random(180918)
OUT=Path('public/do/world/franklin-v1');OUT.mkdir(parents=True,exist_ok=True)
EV=Path('visual-evidence/franklin');EV.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
S=bpy.context.scene

def rgb(h):
 c=[int(h[i:i+2],16)/255 for i in (1,3,5)]
 return tuple(v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in c)+(1,)
def material(name,hex,rough=.5,metal=0):
 m=bpy.data.materials.new(name);m.use_nodes=True;m.diffuse_color=rgb(hex)
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=rgb(hex);p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal
 return m
paper=material('Paper plaster','#FFFDFB',.83)
oak=material('Natural light oak','#BDA487',.55)
walnut=material('Smoked oak','#534139',.56)
chalk=material('Boucle chalk','#E6DFD3',.93)
stone=material('Travertine','#D8CAB8',.72)
rose=material('Dusty rose textile','#916A70',.88)
plum=material('DO deep plum 240B21','#240B21',.32,.15)
charcoal=material('Charcoal aluminium','#303130',.35,.35)
nickel=material('Satin nickel','#9D9D98',.24,.78)
leaf=material('Leaf green','#4D5E43',.77)
leaf2=material('Leaf sage','#70805A',.8)
ceramic=material('Warm ceramic','#D4C5AF',.3)
black=material('Franklin black brown coat','#231A16',.71)
tan=material('Franklin tan coat','#86603D',.78)
eye=material('Franklin eyes and nose','#100E0C',.22)
furLight=material('Franklin coat highlights','#433326',.78)
pupilLight=material('Eye catchlight','#FFFDFB',.12)
sea=material('Waitemata water','#80999C',.27,.25)
city=material('Distant city','#848E90',.65)
window=material('Distant glass','#8699A3',.4,.2)

# Embedded image textures survive GLB export, unlike Blender-only noise shaders.
def texture(m,name,kind,base,size=512):
 rng=np.random.default_rng(18+len(name));y,x=np.mgrid[:size,:size]/size
 noise=rng.random((size,size));coarse=np.sin(x*18+y*7)*np.cos(y*19-x*5)
 if kind=='oak':
  bend=x+.016*np.sin(y*12)+.006*np.sin(y*41)
  h=.5+.16*np.sin(bend*320)+.10*np.sin(bend*760+y*4)+.07*noise
 elif kind=='cloth':h=.52+.08*np.sin(x*920)*np.sin(y*940)+.22*(noise-.5)
 else:h=.56+.11*coarse+.1*(noise-.5)
 a=np.ones((size,size,4),dtype=np.float32)
 base=np.array([int(base[i:i+2],16)/255 for i in (1,3,5)])
 a[:,:,:3]=np.clip(base[None,None,:]*(.85+.28*h[:,:,None]),0,1)
 img=bpy.data.images.new(name,width=size,height=size);img.pixels.foreach_set(a.ravel());img.filepath_raw=str(EV/(name+'.png'));img.file_format='PNG';img.save();bpy.data.images.remove(img)
 img=bpy.data.images.load(str(EV/(name+'.png')));img.pack()
 nt=m.node_tree;t=nt.nodes.new('ShaderNodeTexImage');t.image=img;nt.links.new(t.outputs['Color'],nt.nodes.get('Principled BSDF').inputs['Base Color'])
 # Use a small exported tangent-space normal texture for tactile detail.
 gy,gx=np.gradient(h);n=np.stack([-gx*2.2,-gy*2.2,np.ones_like(h)],axis=-1);n/=np.linalg.norm(n,axis=-1,keepdims=True)
 a[:,:,:3]=n*.5+.5
 nm=bpy.data.images.new(name+' normal',width=size,height=size);nm.colorspace_settings.name='Non-Color';nm.pixels.foreach_set(a.ravel());nm.filepath_raw=str(EV/(name+'-normal.png'));nm.file_format='PNG';nm.save();nm.pack()
 t=nt.nodes.new('ShaderNodeTexImage');t.image=nm;normal=nt.nodes.new('ShaderNodeNormalMap');normal.inputs['Strength'].default_value=.3;nt.links.new(t.outputs['Color'],normal.inputs['Color']);nt.links.new(normal.outputs['Normal'],nt.nodes.get('Principled BSDF').inputs['Normal'])
texture(oak,'oak-grain','oak','#BDA487');texture(walnut,'smoked-grain','oak','#534139');texture(chalk,'boucle','cloth','#E6DFD3');texture(stone,'travertine','stone','#D8CAB8');texture(rose,'rose-weave','cloth','#916A70')

def finish(o,name,mat):
 o.name=name
 if mat:o.data.materials.append(mat)
 return o
def box(name,loc,size,mat,bevel=.015,rot=0):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.dimensions=size;o.rotation_euler.z=rot;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if bevel:
  b=o.modifiers.new('Manufactured edge','BEVEL');b.width=bevel;b.segments=3;bpy.ops.object.modifier_apply(modifier=b.name)
  try:w=o.modifiers.new('Weighted normals','WEIGHTED_NORMAL');bpy.ops.object.modifier_apply(modifier=w.name)
  except RuntimeError:pass
 return finish(o,name,mat)
def ball(name,loc,scale,mat,seg=24,rings=16):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=seg,ring_count=rings,radius=1,location=loc);o=bpy.context.object;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 for p in o.data.polygons:p.use_smooth=True
 return finish(o,name,mat)
def cyl(name,loc,r,depth,mat,vertices=32):
 bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=r,depth=depth,location=loc);o=bpy.context.object
 for p in o.data.polygons:p.use_smooth=True
 return finish(o,name,mat)
def beam(name,a,b,r,mat):
 a,b=Vector(a),Vector(b);o=cyl(name,(a+b)/2,r,(b-a).length,mat,12);o.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler();return o
def line(name,points,r,mat):
 d=bpy.data.curves.new(name,'CURVE');d.dimensions='3D';d.resolution_u=6;d.bevel_depth=r;d.bevel_resolution=2
 s=d.splines.new('BEZIER');s.bezier_points.add(len(points)-1)
 for v,p in zip(s.bezier_points,points):v.co=p;v.handle_left_type='AUTO';v.handle_right_type='AUTO'
 o=bpy.data.objects.new(name,d);S.collection.objects.link(o);d.materials.append(mat);return o

def chair(x,y,a=0,soft=chalk):
 def p(dx,dy,z):return(x+dx*math.cos(a)-dy*math.sin(a),y+dx*math.sin(a)+dy*math.cos(a),z)
 for dx in [-.23,.23]:
  for dy in [-.23,.23]:beam('Chair tapered leg',p(dx*1.12,dy*1.12,.025),p(dx,dy,.45),.026,walnut)
 box('Chair upholstered seat',p(0,0,.48),(.62,.56,.11),soft,.055,a)
 box('Chair upholstered back',p(0,.25,.76),(.64,.12,.42),soft,.056,a)
 for dx in [-.29,.29]:line('Chair bentwood arm',[p(dx,-.2,.62),p(dx,0,.68),p(dx,.2,.69)],.026,walnut)
def lounge(x,y,a=0):
 box('Lounge plinth',(x,y,.15),(.75,.69,.22),walnut,.09,a)
 box('Lounge boucle seat',(x,y,.40),(.99,.92,.33),chalk,.16,a)
 # Curved shell built from closely joined upholstered segments.
 for i in range(13):
  t=math.pi*.13+i/12*math.pi*.74+a
  ball('Lounge rounded back',(x+.47*math.cos(t),y+.41*math.sin(t),.7),(.18,.16,.41),chalk,16,12)
 box('Lounge cushion',(x-.02,y-.12,.62),(.57,.25,.18),rose,.08,a)
def plant(x,y,h=2):
 cyl('Ceramic planter',(x,y,.25),.29,.5,ceramic,32)
 for i in range(12):
  a=i*2.399;t=.7+h*i/14;tx=x+math.cos(a)*(.2+i*.014);ty=y+math.sin(a)*(.2+i*.014)
  line('Plant stem',[(x,y,.4),(x+.05,y,t*.8),(tx,ty,t)],.009,walnut)
  o=ball('Plant leaf',(tx,ty,t),(.095,.26,.014),leaf if i%3 else leaf2,14,8);o.rotation_euler=(.4,.3,a)
def laptop(x,y):
 box('Laptop base',(x,y,.809),(.37,.25,.018),nickel,.007)
 box('Laptop trackpad',(x,y-.035,.82),(.10,.065,.001),charcoal,.002)
 o=box('Laptop display frame',(x,y+.115,.94),(.37,.015,.25),charcoal,.008);o.rotation_euler.x=-.11
 o=box('Laptop paper screen',(x,y+.106,.941),(.345,.002,.223),paper,.003);o.rotation_euler.x=-.11
 for j in range(4):box('Screen document line',(x-.03,y+.086,.99-j*.025),(.21-j*.02,.002,.007),rose,0)
def cup(x,y,z):
 cyl('Coffee cup',(x,y,z+.055),.044,.10,ceramic,24);cyl('Coffee surface',(x,y,z+.106),.037,.002,walnut,24)
 line('Cup handle',[(x+.038,y,z+.085),(x+.08,y,z+.064),(x+.038,y,z+.035)],.009,ceramic)

# Compact believable office, rather than the previous 50-metre corridor.
box('Floor slab',(0,0,-.12),(14,14,.23),stone,.015)
for ix in range(28):
 for iy in range(4):box('Oak floor plank',(-6.75+ix*.5,-5.24+iy*3.5+(ix%2)*.08,.009),(.492,3.48,.028),oak,.002)
box('Ceiling',(0,0,3.32),(14,14,.17),paper,.012)
box('Left smoked oak wall',(-7,0,1.62),(.16,14,3.25),walnut,.01)
for j in range(49):box('Slatted acoustic lining',(-6.88,-6.4+j*.255,1.62),(.09,.034,3.24),walnut,.004)
box('Right plaster wall',(7,0,1.62),(.16,14,3.25),paper,.01)
for x in [-6.9,-4.6,-2.3,0,2.3,4.6,6.9]:box('Window mullion',(x,6,1.65),(.045,.07,3.3),charcoal,.008)
for z in [.06,3.22]:box('Window head and sill',(0,6,z),(14,.14,.1),charcoal,.009)
# Clear glazing apertures avoid needless transparent overdraw.
for y in [-4,0,4]:
 box('Ceiling shadow joint',(0,y,3.22),(13.9,.018,.015),charcoal,.001)
box('Low window cabinet',(-3,5.55,.42),(6.2,.65,.81),oak,.024)
for x in [-5.6,-4.55,-3.5,-2.45,-1.4,-.35]:box('Cabinet reveal',(x,5.216,.42),(.009,.005,.75),walnut,.001)
# Main working desk, with open circulation between the camera and Franklin.
box('Rounded oak communal desk',(-1,2,.75),(4.7,1.5,.085),oak,.04)
for x in [-2.75,.75]:box('Oak desk pedestal',(x,2,.36),(.40,1.20,.72),oak,.025)
for x in [-2.5,-.8,.7]:
 chair(x,3.11,0);chair(x,.91,math.pi)
 laptop(x,2.25);cup(x+.47,1.64,.795)
 box('Paper brief',(x-.44,1.86,.802),(.27,.34,.006),paper,.002,rot=.1)
# Lounge and material library at right.
ball('Oval wool rug',(3,-.9,.035),(3.0,2.38,.028),chalk,64,24)
lounge(4.5,1.0,-.10);lounge(5.0,-1.5,.3)
cyl('Travertine coffee table',(3.5,-.05,.39),.74,.09,stone,64)
for dx in [-.35,.35]:cyl('Table cylindrical foot',(3.5+dx,-.05,.20),.18,.34,stone,32)
box('Book plum cover',(3.38,-.10,.455),(.38,.30,.025),plum,.003,-.12);cup(3.8,.15,.44)
box('Material shelf back',(6.83,2.6,1.45),(.18,4.1,2.35),oak,.01)
for z in [.40,1.05,1.72,2.40]:
 box('Material shelf',(6.5,2.6,z),(.72,4.1,.045),oak,.014)
 for j in range(7):box('Studio material book',(6.40,1.1+j*.29,z+.15),(.32,.045+.01*(j%3),.26),[plum,paper,rose,walnut][j%4],.004,rot=.03*(j%3))
for x,y,h in [(-5.7,4.9,2.35),(5.8,5.1,2.2),(-5.8,-2.7,2.35),(6.2,-4.1,2.2)]:plant(x,y,h)
# Restrained linen curtains at the window sides.
for x in [-6.5,6.4]:
 for j in range(7):cyl('Linen curtain fold',(x+j*.07,5.82,1.63),.044,3.18,chalk,12)
# Elliptical pendant over workbench, thin dark metal, soft luminous lower strip.
lamp=material('Warm pendant diffuser','#FFF5E4',.38)
p=lamp.node_tree.nodes.get('Principled BSDF')
for k in ['Emission Color','Emission']:
 if k in p.inputs:p.inputs[k].default_value=rgb('#FFF5E4');break
if 'Emission Strength' in p.inputs:p.inputs['Emission Strength'].default_value=2
for x in [-2.2,.2]:beam('Pendant suspension',(x,2,3.25),(x,2,2.53),.006,charcoal)
pts=[(-1+2.35*math.cos(t*math.tau/48),2+.51*math.sin(t*math.tau/48),2.52) for t in range(49)]
line('Elliptical pendant metal',pts,.028,charcoal)
line('Elliptical pendant diffuser',[(x,y,z-.025) for x,y,z in pts],.013,lamp)
# Distant harbour/skyline is original architectural interpretation, not a site survey.
box('Harbour plane',(0,29,-.22),(110,43,.1),sea,0)
for i in range(36):
 x=-24+i*1.45;y=37+R.uniform(-3,5);w=R.uniform(.6,1.2);h=R.uniform(1.5,5.2)
 box('Auckland skyline building',(x,y,h/2-.5),(w,R.uniform(.7,1.4),h),city if i%3 else window,.02)
 for z in np.arange(.2,h-.3,.52):box('Skyline floor band',(x,y-.74,z),(w+.01,.013,.035),charcoal,0)
# An interpretable slender skyline needle, not a labelled geographic reconstruction.
cyl('Skyline tower shaft',(2.4,35,3.6),.12,7.0,city,24)
cyl('Skyline observation level',(2.4,35,5.62),.36,.24,city,32)
cyl('Skyline observation glass',(2.4,35,5.83),.27,.22,window,32)
cyl('Skyline tower spire',(2.4,35,7.1),.028,1.8,city,12)

# Franklin: true mesh geometry with an elongated body, short paws and feathered ears.
F=Vector((1.90,-1.55,.055));parts=[]
def dog(name,p,scale,m=black):
 o=ball('Franklin.'+name,F+Vector(p),scale,m,32,20);parts.append(o);return o
body=dog('long torso',(.22,0,.24),(.53,.175,.205))
dog('chest',(-.22,0,.29),(.235,.19,.235))
dog('neck',(-.38,0,.40),(.15,.13,.20))
dog('head',(-.48,0,.51),(.19,.129,.162))
dog('long muzzle',(-.669,-.005,.465),(.162,.078,.071),tan)
dog('muzzle top',(-.663,-.003,.490),(.148,.073,.041))
dog('nose',(-.81,-.003,.476),(.046,.055,.038),eye)
for side in [-1,1]:
 dog('short front leg',(-.26,side*.132,.14),(.071,.058,.115),tan)
 dog('front paw',(-.43,side*.145,.061),(.13,.065,.055),tan)
 dog('hind thigh',(.52,side*.111,.17),(.18,.081,.13))
 dog('hind paw',(.60,side*.151,.064),(.135,.059,.05),tan)
 ear=dog('long ear',(-.36,side*.124,.363),(.135,.047,.214));ear.rotation_euler.y=-.22;ear.rotation_euler.x=side*.13
 dog('tan eyebrow',(-.548,side*.105,.563),(.049,.022,.024),tan)
 dog('eye',(-.572,side*.107,.537),(.023,.015,.018),eye)
 dog('eye light',(-.58,side*.119,.542),(.005,.003,.005),pupilLight)
 for k in range(3):dog('paw toe',(-.525+k*.015,side*.14+(k-1)*.032,.058),(.024,.017,.018),tan)
line('Franklin.feathered tail',[F+Vector(p) for p in [(.64,.03,.25),(.90,.06,.23),(1.07,.14,.11),(1.19,.21,.065)]],.038,black)
# Combined tapered fur ribbons: fine geometry visible in silhouettes, one draw call per colour.
def coat_fibres(name,mat,n,cent,axes,length):
 verts=[];faces=[];cx,cy,cz=cent;ax,ay,az=axes
 for i in range(n):
  theta=R.uniform(0,math.tau);u=R.uniform(-.95,.95);v=math.sqrt(1-u*u)
  p=F+Vector((cx+ax*u,cy+ay*v*math.cos(theta),cz+az*v*math.sin(theta)))
  if p.z<F.z+.08:continue
  normal=Vector((u/ax,v*math.cos(theta)/ay,v*math.sin(theta)/az)).normalized()
  direction=(Vector((.45,0,-.8))+normal*.3).normalized();width=R.uniform(.0015,.003)
  side=direction.cross(normal)
  if side.length<.01:side=Vector((0,1,0))
  side.normalize();start=len(verts);l=length*R.uniform(.55,1.2)
  for j in range(4):
   f=j/3;c=p+direction*l*f+normal*.009*math.sin(f*math.pi);ww=width*(1-f)+.0002
   verts.extend([c+side*ww,c-side*ww])
  for j in range(3):faces.append((start+j*2,start+j*2+1,start+j*2+3,start+j*2+2))
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update();o=bpy.data.objects.new('Franklin.'+name,mesh);S.collection.objects.link(o);mesh.materials.append(mat)
coat_fibres('silky body coat',black,2000,(.18,0,.27),(.58,.176,.20),.085)
coat_fibres('coat fine highlights',furLight,450,(.18,0,.27),(.58,.177,.20),.065)
for side in [-1,1]:coat_fibres('ear feathering '+str(side),black,400,(-.35,side*.124,.36),(.13,.048,.21),.13)
coat_fibres('chest feathering',tan,170,(-.30,-.015,.24),(.14,.15,.15),.08)
# Convert authored curves to exportable meshes before saving the real Blender source.
for o in list(S.objects):
 if o.type=='CURVE':
  bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.convert(target='MESH')
# Bake a clean UV projection onto objects missing UVs (fur uses a solid material).
for o in S.objects:
 if o.type=='MESH' and not o.data.uv_layers:
  uv=o.data.uv_layers.new(name='UVMap')
  for poly in o.data.polygons:
   for li in poly.loop_indices:
    co=o.data.vertices[o.data.loops[li].vertex_index].co;uv.data[li].uv=(co.x*.5,co.y*.5)

world=bpy.data.worlds.new('Neutral daylight');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.68,.77,.87,1);world.node_tree.nodes['Background'].inputs[1].default_value=.55;S.world=world
bpy.ops.object.light_add(type='SUN',location=(-8,10,12));sun=bpy.context.object;sun.name='Daylight';sun.rotation_euler=(math.radians(27),math.radians(-23),math.radians(-22));sun.data.energy=2.0;sun.data.angle=.07
for loc,power,size in [((0,5.9,2.6),950,7),((-4,-3,2.9),330,5),((4,-1,2.8),150,4)]:
 bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.rotation_euler=(Vector((0,0,.4))-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add();cam=bpy.context.object;cam.name='Fly-through camera';S.camera=cam;cam.data.lens=25;cam.data.clip_end=180
S.render.engine='CYCLES';S.cycles.samples=72;S.cycles.use_denoising=False;S.cycles.max_bounces=5
S.render.resolution_percentage=100;S.render.image_settings.file_format='JPEG';S.render.image_settings.quality=91
try:S.view_settings.view_transform='AgX'
except TypeError:S.view_settings.view_transform='Filmic'
S.view_settings.exposure=.25
shots=[('hero-wide',(-4.8,-7.6,1.93),(1.0,1.3,1.13),1600,900,24),('hero-mobile',(-2.25,-7.2,1.95),(1.70,.5,.99),750,1100,25),('workroom',(-2.35,-4.2,1.78),(-.5,2.2,1.1),1440,900,24),('studio',(1.1,-3.8,1.7),(4.5,.55,.9),1440,900,25),('franklin-detail',(.10,-3.45,.80),(1.72,-1.57,.33),1200,800,49)]
# A real authored camera action is also saved in the .blend.
for frame,loc,target in [(1,shots[0][1],shots[0][2]),(100,shots[2][1],shots[2][2]),(200,shots[3][1],shots[3][2])]:
 cam.location=loc;cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler();cam.keyframe_insert('location',frame=frame);cam.keyframe_insert('rotation_euler',frame=frame)
S.frame_start=1;S.frame_end=200;S.frame_set(1)
bpy.ops.wm.save_as_mainfile(filepath=str(EV/'franklin-office.blend'))
# Export exactly the scene geometry with embedded textures. Runtime supplies lighting/camera.
bpy.ops.object.select_all(action='DESELECT')
for o in S.objects:
 if o.type=='MESH':o.select_set(True)
props=bpy.ops.export_scene.gltf.get_rna_type().properties;supported=set(props.keys())
opts={'filepath':str(OUT/'office.glb'),'export_format':'GLB'}
for options,value in [(('use_selection','export_selected'),True),(('export_apply','export_apply_modifiers'),True),(('export_yup',),True),(('export_cameras',),False),(('export_lights',),False),(('export_animations',),False)]:
 key=next((k for k in options if k in supported),None)
 if key:opts[key]=value
bpy.ops.export_scene.gltf(**opts)
cam.animation_data_clear()
for name,loc,target,w,h,lens in shots:
 cam.location=loc;cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=lens;S.render.resolution_x=w;S.render.resolution_y=h;S.render.filepath=str(OUT/(name+'.jpg'));bpy.ops.render.render(write_still=True)
manifest={'version':'franklin-v1','generator':'Blender '+bpy.app.version_string,'geometry':'Owned office and black-and-tan long-haired dachshund. No photographic cutout.','interpretation':'Imagined Auckland-inspired office, not a photograph or geographic survey.','model':'/do/world/franklin-v1/office.glb','poster':'/do/world/franklin-v1/hero-wide.jpg','mobilePoster':'/do/world/franklin-v1/hero-mobile.jpg','blenderSourceArtifact':'franklin-office.blend','franklinMeshCount':sum(o.name.startswith('Franklin.') and o.type=='MESH' for o in S.objects),'meshCount':sum(o.type=='MESH' for o in S.objects),'bytes':(OUT/'office.glb').stat().st_size,'camera':{'positions':[[v[0],v[2],-v[1]] for v in [shots[0][1],shots[2][1],shots[3][1]]],'targets':[[v[0],v[2],-v[1]] for v in [shots[0][2],shots[2][2],shots[3][2]]]},'palette':['#240B21','#916A70','#FFFDFB','#F5F1F2'],'status':'render candidate; inspect before public promotion'}
(OUT/'scene-manifest.json').write_text(json.dumps(manifest,indent=2));print('FRANKLIN_COMPLETE',json.dumps(manifest))
