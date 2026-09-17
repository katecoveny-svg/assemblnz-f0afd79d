"""Build a real Blender scene, glTF model and owned editorial renders.
Run: blender -b --python scripts/design/build_scandi_office.py
All dimensions are metres. glTF coordinates preserve the existing WorldScene
camera corridor: x -9..9, y 0..5, z 12..-35. No downloaded art or fonts.
"""
import bpy, math, random, json, os
from pathlib import Path
from mathutils import Vector
random.seed(180926)
ROOT=Path.cwd(); OUT=ROOT/'public/do/world/scandi-v1'; OUT.mkdir(parents=True,exist_ok=True)
EVIDENCE=ROOT/'visual-evidence/scandi'; EVIDENCE.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)

def rgba(hex):
    rgb=[int(hex[i:i+2],16)/255 for i in (1,3,5)]
    return tuple(c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4 for c in rgb)+(1,)

def mat(name,colour,rough=.5,metal=0):
    m=bpy.data.materials.new(name);m.diffuse_color=rgba(colour);m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=rgba(colour);p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal
    return m
paper=mat('Scandi limewash paper','#FFFDFB',.86)
chalk=mat('Scandi chalk mineral','#E8E4DE',.77)
oak=mat('Scandi pale oak','#CAB395',.46)
oakedge=mat('Scandi oak end grain','#B29877',.51)
plum=mat('Scandi canonical deep plum','#240B21',.4)
rose=mat('Scandi dusty rose fabric','#916A70',.86)
linen=mat('Scandi oat boucle','#D3C8B8',.96)
stone=mat('Scandi travertine','#D5C7B2',.75)
nickel=mat('Scandi brushed nickel','#A8AAA6',.25,.83)
frame=mat('Scandi charcoal window frames','#393B36',.32,.38)
leaf=mat('Scandi plant green','#455446',.84)
leaf2=mat('Scandi leaf highlight','#7D8970',.86)
ceramic=mat('Scandi warm ceramic','#F2EBDF',.33)
ink=mat('Scandi screen glass','#212C2F',.22,.22)
rug=mat('Scandi woven wool','#DCD4C8',.99)
sea=mat('Scandi Waitemata water','#729198',.2,.3)
hill=mat('Scandi distant island','#87968D',.99)
white=mat('Scandi milk globe','#FFF6E8',.38)
p=white.node_tree.nodes.get('Principled BSDF')
for key in ('Emission Color','Emission'):
    if key in p.inputs:p.inputs[key].default_value=rgba('#FFF6E8');break
if 'Emission Strength' in p.inputs:p.inputs['Emission Strength'].default_value=.3
# Subtle physical bump is used in the Cycles stills. The web model keeps a
# low-roughness, physically lit base material instead of exporting a fake bake.
for material,scale,strength in [(oak,8,.12),(linen,140,.18),(rose,130,.16),(paper,28,.06),(stone,20,.08),(rug,155,.1)]:
    nt=material.node_tree; noise=nt.nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=scale;noise.inputs['Detail'].default_value=2
    bump=nt.nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=strength;bump.inputs['Distance'].default_value=.006
    nt.links.new(noise.outputs['Fac'],bump.inputs['Height']);nt.links.new(bump.outputs['Normal'],nt.nodes.get('Principled BSDF').inputs['Normal'])

COL=bpy.data.collections.new('SCANDI_OFFICE');bpy.context.scene.collection.children.link(COL)
def move_col(o):
    for c in list(o.users_collection):c.objects.unlink(o)
    COL.objects.link(o)

def finish(o,name,material):
    o.name=name;move_col(o)
    if material:o.data.materials.append(material)
    return o

def box(name,loc,size,material,bevel=0,rot=0):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.dimensions=size;o.rotation_euler.z=rot
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        mod=o.modifiers.new('Soft manufactured edges','BEVEL');mod.width=bevel;mod.segments=3
        bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name)
        for p in o.data.polygons:p.use_smooth=True
        try: mod=o.modifiers.new('Weighted normals','WEIGHTED_NORMAL');bpy.ops.object.modifier_apply(modifier=mod.name)
        except RuntimeError:pass
    return finish(o,name,material)

def cylinder(name,loc,radius,depth,material,vertices=32):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=radius,depth=depth,location=loc);o=bpy.context.object
    for p in o.data.polygons:p.use_smooth=True
    mod=o.modifiers.new('Rounded edge','BEVEL');mod.width=min(.014,depth/6);mod.segments=2;bpy.ops.object.modifier_apply(modifier=mod.name)
    return finish(o,name,material)

def ellipsoid(name,loc,scale,material):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,radius=1,location=loc);o=bpy.context.object;o.scale=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    for p in o.data.polygons:p.use_smooth=True
    return finish(o,name,material)

def beam(name,a,b,radius,material):
    a,b=Vector(a),Vector(b);o=cylinder(name,(a+b)/2,radius,(a-b).length,material,12);o.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler();return o

def curve(name,points,radius,material):
    data=bpy.data.curves.new(name,'CURVE');data.dimensions='3D';data.bevel_depth=radius;data.bevel_resolution=3
    s=data.splines.new('BEZIER');s.bezier_points.add(len(points)-1)
    for bp,co in zip(s.bezier_points,points):bp.co=co;bp.handle_left_type='AUTO';bp.handle_right_type='AUTO'
    o=bpy.data.objects.new(name,data);COL.objects.link(o);data.materials.append(material)
    return o

def plant(x,y,h=1.4):
    cylinder('Hand-thrown planter',(x,y,.23),.28,.46,stone)
    for i in range(7):
        a=i*2.4;z=.48+h*(.4+i*.085);tx=x+math.cos(a)*.36;ty=y+math.sin(a)*.36
        curve('Living foliage stem',[(x,y,.3),(x+.08,y,z*.7),(tx,ty,z)],.012,leaf)
        o=ellipsoid('Foliage leaf',(tx,ty,z),(.08,.28,.018),leaf2 if i%3==0 else leaf);o.rotation_euler=(.3,math.sin(a)*.55,a)

def cup(x,y,z):
    cylinder('Ceramic coffee cup',(x,y,z+.043),.039,.08,ceramic,20)
    cylinder('Coffee',(x,y,z+.084),.032,.002,oakedge,20)

def chair(x,y,angle=0,material=linen):
    def p(dx,dy,z):return (x+dx*math.cos(angle)-dy*math.sin(angle),y+dx*math.sin(angle)+dy*math.cos(angle),z)
    for dx in [-.21,.21]:
        for dy in [-.21,.21]:beam('Tapered oak chair leg',p(dx*1.15,dy*1.1,.04),p(dx,dy,.46),.026,oakedge)
    box('Upholstered chair seat',p(0,0,.48),(.55,.51,.09),material,.044,angle)
    box('Curved chair back',p(0,.23,.75),(.56,.085,.35),material,.039,angle)
    for dx in [-.25,.25]:curve('Bent oak arm',[p(dx,-.12,.61),p(dx,0,.65),p(dx,.2,.67)],.026,oak)

def laptop(x,y,z,angle=0):
    box('Laptop lower shell',(x,y,z+.013),(.33,.235,.024),nickel,.009,angle)
    top=box('Laptop display',(x,y+.106,z+.124),(.33,.011,.22),ink,.009,angle);top.rotation_euler.x=-.13
    box('Trackpad',(x,y-.038,z+.027),(.1,.058,.001),frame,.001,angle)

def sofa(x,y,angle=0):
    box('Linen sofa base',(x,y,.31),(2.65,.94,.4),linen,.14,angle)
    for dx in [-.85,0,.85]:box('Tailored sofa seat',(x+dx,y-.08,.53),(.83,.83,.18),linen,.08,angle)
    box('Linen sofa back',(x,y+.43,.82),(2.68,.23,.62),linen,.1,angle)
    for dx in [-1.25,1.25]:box('Linen sofa arm',(x+dx,y,.69),(.22,.9,.38),linen,.09,angle)
    for dx in [-.7,.7]:
        c=box('Dusty rose cushion',(x+dx,y+.21,.89),(.46,.17,.43),rose,.08);c.rotation_euler.y=dx*.08;c.rotation_euler.x=.14

# The existing fly-through has a clear central circulation strip all the way.
box('Mineral slab',(0,10.5,-.12),(18,51,.24),stone,.015)
# Jointed planks create real geometry in GLB, not a noisy render-only shader.
for i in range(40):
    x=-8.8+i*.45
    for j in range(12):
        y=-12.6+j*4.2+(i%2)*.8
        if y<34:box('Wide pale-oak floorboard',(x,y,.007),(.442,4.18,.018),oak if i%6 else oakedge,.003)
box('Gallery limewash wall',(9,10,2.45),(.22,50,4.9),paper,.018)
box('South wall',(0,-14,2.45),(18,.2,4.9),paper,.015)
box('North wall',(0,35.5,2.45),(18,.25,4.9),paper,.015)
# Ceiling has linear seams and slim exposed beams, not a purple light wash.
box('White acoustic ceiling',(0,10.5,5.03),(18,51,.15),paper,.015)
for y in range(-12,36,6):
    box('Ceiling structural rib',(0,y,4.88),(18,.09,.15),chalk,.014)
    box('Window reveal',(-8.82,y,2.43),(.1,.09,4.9),frame,.012)
    box('Glazing threshold',(-8.82,y,0.11),(.18,5.94,.12),stone,.01)
# Open glazing uses clear apertures in GLB to avoid overdraw and dim interiors.
box('Harbour window head',(-8.82,10.5,4.89),(.19,51,.12),frame,.012)
for y in [-9,3,15,27]:
    box('Linen curtain stack',(-8.38,y,2.38),(.18,.48,4.63),linen,.045)
    for n in range(6):cylinder('Curtain pleat',(-8.28,y-.21+n*.078,2.38),.047,4.59,linen,12)
# Walnut-free light oak shelves define rooms, without placing walls across path.
for y in [7.5,22]:
    for i in range(35):box('Oak screen slat',(4.6+i*.12,y,2.06),(.045,.13,4.1),oak,.007)
for y in [-5,12,29]:
    box('Long oak credenza',(7.9,y,.58),(1.12,5.4,1.12),oak,.018)
    for j in range(6):box('Drawer shadow reveal',(7.324,y-2.25+j*.9,.57),(.005,.006,1.03),oakedge)
    for j in range(3):
        for k in range(4):box('Books on credenza',(7.6,y-1.1+j*.85,1.17+k*.032),(.33,.24,.025),[paper,rose,oakedge][k%3],.003,k*.08)
    plant(7.75,y+2.1,1.0)
# Pursuit: shared worktable beside the view.
for y in [-3,1.3]:
    box('Oak worktable',( -5.6,y,.745),(3.9,1.28,.065),oak,.032)
    for x in [-7.05,-4.15]:box('Worktable trestle',(x,y,.365),(.075,.97,.70),oak,.014)
    for x in [-6.65,-4.65]:
        chair(x,y-.96,math.pi,linen);chair(x,y+.96,0,linen)
        laptop(x,y,.783);cup(x+.42,y-.28,.78)
        box('Open brief',(x-.44,y-.03,.787),(.27,.35,.006),paper,.003)
plant(-7.7,-9,1.8)
# DO: review table, screen and evidence board.
box('Travertine review table',(4.65,13.5,.76),(4.15,1.5,.08),stone,.07)
for x in [3.25,6.05]:box('Review table foot',(x,13.5,.37),(.35,1.0,.70),oak,.04)
for x in [3.25,4.65,6.05]:
    chair(x,12.25,math.pi,linen);chair(x,14.75,0,linen);cup(x,13.15,.802)
box('Shared review display',(7.30,17.8,1.92),(.09,2.7,1.52),ink,.035)
for y in [17.0,17.8,18.6]:box('Display evidence panel',(7.237,y,1.95),(.006,.6,.97),[paper,rose,chalk][int(y*10)%3],.018)
# Studio: lounge, sculptural stone coffee table, materials library.
box('Woven lounge rug',(4.2,28,.023),(7.0,7.8,.023),rug,.08)
sofa(4.3,30)
for x in [1.6,6.7]:chair(x,25.6,math.pi,rose)
cylinder('Sculptural table top',(4.2,27.6,.43),1.0,.09,stone,64)
cylinder('Sculptural table base',(4.2,27.6,.21),.42,.38,stone,40)
box('Editorial book',(4.0,27.55,.491),(.4,.3,.037),plum,.007,-.15);cup(4.57,27.5,.48)
plant(-7.7,27,2.1);plant(7.8,33,1.7)
# Large original wall reliefs; no stock artwork or invented client identities.
for y in [-2,12,29]:
    box('Oak art frame',(8.82,y,2.70),(.07,2.65,1.90),oak,.014)
    box('Paper artwork',(8.775,y,2.70),(.006,2.51,1.77),paper)
    for i in range(23):
        a=i*.46
        ellipsoid('Assembl collective relief',(8.73,y+math.cos(a)*(.15+i*.032),2.7+math.sin(a)*(.12+i*.025)),(.02,.055,.055),plum if i%4 else rose)
# Pendants: actual luminaire geometry at appropriate scale.
for x,y in [(-5.6,-3),(-5.6,1.3),(4.65,13.5),(4.2,27.6)]:
    beam('Pendant cable',(x,y,4.93),(x,y,3.25),.009,frame)
    ellipsoid('Opal globe',(x,y,3.14),(.23,.23,.20),white)
    cylinder('Pendant oak cap',(x,y,3.34),.075,.06,oak)
# Auckland-inspired context, intentionally an architectural concept not a survey.
box('Waitemata harbour',(-92,28,-1.0),(165,310,.09),sea)
for k in range(26):
    x=-20-random.random()*20;y=-42+random.random()*16;h=random.uniform(2,10)
    box('Wynyard low-rise silhouette',(x,y,h/2-1),(random.uniform(1.8,3.4),random.uniform(2,4),h),chalk,.06)
# Distant volcanic island is low and broad, not a steep pyramid.
for i in range(11):
    x=-120+i*1.5;y=65+(i-5)*8
    ellipsoid('Distant volcanic island',(x,y,-1.15),(6,10,max(.6,4.2-abs(i-5)*.62)),hill)
# Stylised harbour bridge at a distance; no claimed exact geographic replication.
for i in range(20):
    y=-5+i*4;h=2.6+3.0*math.sin(i/19*math.pi)
    box('Harbour bridge deck',(-80,y,h),(.8,4.2,.25),hill)
    if i%3==0:box('Harbour bridge pier',(-80,y,h/2-1),(.9,.9,h+2),hill)

# Render rig is excluded from the GLB. Runtime lighting remains WorldScene's.
world=bpy.data.worlds.new('Auckland overcast daylight');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.65,.76,.85,1);world.node_tree.nodes['Background'].inputs[1].default_value=.42;bpy.context.scene.world=world

def area(name,loc,energy,size,target,colour=(1,.94,.86)):
    d=bpy.data.lights.new(name,'AREA');d.energy=energy;d.shape='DISK';d.size=size;d.color=colour
    o=bpy.data.objects.new(name,d);bpy.context.scene.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
for y in [-6,8,23,33]:area('Harbour daylight',(-10.3,y,3.8),1700,7,(1,y,1),(1,.96,.9))
for y in [-5,12,29]:area('Ceiling bounce',(2,y,4.6),320,5,(2,y,0))
sun=bpy.data.lights.new('Late morning sun','SUN');sun.energy=1.5;sun.angle=math.radians(8);so=bpy.data.objects.new('Late morning sun',sun);bpy.context.scene.collection.objects.link(so);so.rotation_euler=(.65,-.6,-.4)
camdata=bpy.data.cameras.new('Editorial camera');cam=bpy.data.objects.new('Editorial camera',camdata);bpy.context.scene.collection.objects.link(cam);bpy.context.scene.camera=cam;camdata.lens=25;camdata.clip_end=500
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True;scene.cycles.max_bounces=5
scene.render.resolution_x=1400;scene.render.resolution_y=900;scene.render.resolution_percentage=100
try:scene.view_settings.view_transform='AgX'
except TypeError:scene.view_settings.view_transform='Filmic'
scene.view_settings.exposure=.6
# Single mesh per material reduces draw calls without changing the scene shape.
bpy.ops.object.select_all(action='DESELECT')
for o in list(COL.objects):
    if o.type=='CURVE':
        o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.convert(target='MESH');o.select_set(False)
for material in list(bpy.data.materials):
    objs=[o for o in COL.objects if o.type=='MESH' and len(o.data.materials)==1 and o.data.materials[0]==material]
    if len(objs)>1:
        bpy.ops.object.select_all(action='DESELECT')
        for o in objs:o.select_set(True)
        bpy.context.view_layer.objects.active=objs[0];bpy.ops.object.join();bpy.context.object.name=material.name+' mesh'
bpy.ops.object.select_all(action='DESELECT')
for o in COL.objects:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(OUT/'scandi-office.glb'),export_format='GLB',use_selection=True,export_apply=True,export_yup=True,export_cameras=False,export_lights=False)
# Save editable source in evidence (not a binary document in the main source tree).
bpy.ops.wm.save_as_mainfile(filepath=str(EVIDENCE/'scandi-office.blend'))
for name,position,target,lens in [
 ('harbour-workroom',(1.8,-10.2,1.75),(-4.8,1.8,1.4),24),
 ('review-room',(-1.8,7.8,1.72),(4.5,15.0,1.35),26),
 ('studio-lounge',(-2.4,22.2,1.7),(4.3,29.3,1.12),26),
]:
    cam.location=position;cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler();camdata.lens=lens
    scene.render.image_settings.file_format='JPEG';scene.render.image_settings.quality=91;scene.render.filepath=str(OUT/(name+'.jpg'));bpy.ops.render.render(write_still=True)
objects=[o for o in COL.objects if o.type=='MESH'];triangles=sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in objects)
report={'generator':'Blender '+bpy.app.version_string,'concept':'Original Scandinavian Auckland harbour office; not a photograph of an existing office','objects':len(objects),'triangles':triangles,'glb_bytes':(OUT/'scandi-office.glb').stat().st_size,'palette':{'plum':'#240B21','rose':'#916A70','paper':'#FFFDFB'},'camera_contract':'x -9..9, y vertical 0..5, z 12..-35; centre corridor clear','outputs':[p.name for p in OUT.iterdir()]}
(OUT/'scene-manifest.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
if report['glb_bytes']>12000000:raise RuntimeError('GLB exceeds the 12 MB authoring review budget; do not publish')
