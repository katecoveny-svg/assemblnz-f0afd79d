"""Editable architectural world for the scroll-led DO preview.
Blender 5: blender -b --python scripts/build-do-world.py -- /absolute/output
Generated materials are embedded in GLB; no downloaded textures or model assets.
"""
import bpy, math, sys
import numpy as np
from pathlib import Path
from mathutils import Vector
out=Path(sys.argv[sys.argv.index('--')+1]); out.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
np.random.seed(26)

def texture(name, kind, base):
    n=512
    y,x=np.mgrid[0:n,0:n]/n
    if kind=='wood':
        wave=np.sin(x*190+np.sin(y*7)*2+np.sin(x*32+y*3)*2)
        value=.85+.08*wave+.025*np.random.random((n,n))+.035*np.sin(x*650+y*5)
    else:
        value=.88+.045*np.sin(x*31+y*14)+.03*np.sin(x*97-y*21)+.02*np.random.random((n,n))
    rgba=np.ones((n,n,4),dtype=np.float32)
    for c in range(3): rgba[:,:,c]=np.clip(base[c]*value,0,1)
    image=bpy.data.images.new(name,width=n,height=n)
    image.pixels.foreach_set(rgba.ravel()); image.pack()
    return image

def material(name, color, rough=.5,metal=0,emit=0,pattern=None):
    m=bpy.data.materials.new(name); m.diffuse_color=(*color,1);m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1)
    p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal
    if emit:p.inputs['Emission Color'].default_value=(*color,1);p.inputs['Emission Strength'].default_value=emit
    if pattern:
        t=m.node_tree.nodes.new('ShaderNodeTexImage');t.image=texture(name+' grain',pattern,color)
        m.node_tree.links.new(t.outputs['Color'],p.inputs['Base Color'])
    return m
wood=material('Smoked walnut grain',(.25,.12,.085),.4,pattern='wood')
stone=material('Rose limestone',(.65,.52,.45),.44,pattern='stone')
plaster=material('Warm plum plaster',(.23,.12,.16),.82,pattern='stone')
brass=material('Brushed bronze',(.42,.23,.13),.28,.8)
linen=material('Warm linen',(.60,.43,.38),.9,pattern='stone')
rose=material('Muted rose wool',(.34,.11,.19),.9)
light=material('Rose opal light',(.95,.61,.49),.24,emit=5)
paper=material('Ivory paper',(.92,.83,.68),.8)
water=material('Harbour dusk',(.09,.07,.11),.18,.75)
horizon=material('Distant city silhouette',(.06,.045,.08),.9)
leaf=material('Plum botanical silhouette',(.16,.09,.12),.8)

def finish(o,name,mat,bevel=0):
    o.name=name;o.data.materials.append(mat)
    if bevel:
        m=o.modifiers.new('Crafted edge','BEVEL');m.width=bevel;m.segments=3
        bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=m.name)
    return o

def box(name,pos,size,mat,bevel=.03):
    bpy.ops.mesh.primitive_cube_add(size=1,location=pos);o=bpy.context.object;o.dimensions=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    return finish(o,name,mat,bevel)

def cyl(name,pos,radius,depth,mat):
    bpy.ops.mesh.primitive_cylinder_add(vertices=32,radius=radius,depth=depth,location=pos)
    return finish(bpy.context.object,name,mat,.025)

def tube(name,points,radius,mat):
    c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.bevel_depth=radius;c.bevel_resolution=3
    s=c.splines.new('POLY');s.points.add(len(points)-1)
    for p,v in zip(s.points,points):p.co=(*v,1)
    o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);o.data.materials.append(mat)
    return o

def area(name,pos,power,color,size,target):
    d=bpy.data.lights.new(name,'AREA');d.energy=power;d.color=color;d.shape='DISK';d.size=size
    o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);o.location=pos
    o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()

# Real room scale. Blender Y becomes -Z in glTF / Three.js.
box('Foundation', (0,10,-.35),(22,48,.7),plaster,.1)
box('Continuous limestone floor',(0,10,-.04),(21.8,47.8,.18),stone,.04)
for x in range(-10,12,2):
    box('Floor stone joint',(x,10,.055),(.012,47,.002),brass,0)
for y in range(-12,34,3):box('Floor transverse joint',(0,y,.055),(21.4,.012,.002),brass,0)
box('Sculpted ceiling',(0,10,5.6),(22,48,.3),plaster,.1)
# Two continuous, sinuous ceiling light coves and bronze companion rails.
for offset in [0,5]:
    points=[(offset+math.sin(i/22)*1.8,-13+i*.3,5.31) for i in range(158)]
    tube('Ceiling bronze cove',points,.14,brass)
    tube('Continuous rose light',[(x,y,z-.12) for x,y,z in points],.045,light)
# Curved walnut enclosure on the right; vertical fins catch raking light.
for i in range(156):
    y=-13+i*.3;x=9+math.sin(y*.18)*.8
    o=box('Walnut wall fin',(x,y,2.7),(.25,.16,5.4),wood,.025)
    o.rotation_euler.z=-math.cos(y*.18)*.14
# Slender harbour facade. Open glazing keeps the browser's distant view readable.
for i in range(19):
    y=-13+i*2.5
    box('Bronze window mullion',(-9,y,2.7),(.065,.065,5.4),brass,.008)
box('Window sill',(-9,10,.2),(.18,47,.18),brass,.02)
box('Window head',(-9,10,5.3),(.18,47,.13),brass,.01)
# Foreground portal ribs create parallax at the entrance and between rooms.
for y in [-8,8,23]:
    points=[(6.9*math.cos(t),y,.2+5.05*math.sin(t)) for t in np.linspace(0,math.pi,90)]
    tube('Walnut portal',points,.22,wood)
    tube('Inset portal light',[(x,yy+.12,z) for x,yy,z in points],.018,light)

# Distinct research table, central workshop and circular presentation salon.
for index,y in enumerate([0,15]):
    box('Walnut collaborative table',(3.5,y,1.03),(5.5,2.2,.18),wood,.16)
    for x in [1.6,5.4]:cyl('Turned table pedestal',(x,y,.48),.38,.95,wood)
    for x in [1.5,3.4,5.3]:
        for side in [-1,1]:
            cy=y+side*1.65
            box('Upholstered seat',(x,cy,.52),(.86,.82,.19),linen,.13)
            box('Rounded chair back',(x,cy+side*.32,.94),(.86,.19,.75),rose,.09)
            for dx in [-.3,.3]:
                for dy in [-.24,.24]:cyl('Bronze chair foot',(x+dx,cy+dy,.25),.026,.5,brass)
        box('Selected paper',(x,y-.15,1.135),(.65,.48,.008),paper,.006)
        for j in range(4):box('Paper annotation',(x,y-.3+j*.07,1.141),(.42,.012,.002),brass,0)
    area('Table softbox',(3.5,y,4.9),550,(1,.64,.55),4,(3.5,y,0))
cyl('Presentation rug',(3,28,.065),3.6,.02,rose)
cyl('Presentation table',(3,28,.59),1.45,.14,wood)
cyl('Presentation pedestal',(3,28,.27),.8,.5,plaster)
for angle in [-.2,.75,1.7,2.7,3.7,4.7]:
    x=3+math.cos(angle)*2.65;y=28+math.sin(angle)*2.65
    seat=box('Salon lounge',(x,y,.52),(1.3,1.1,.45),linen,.19);seat.rotation_euler.z=angle
    back=box('Salon back',(x+math.cos(angle)*.42,y+math.sin(angle)*.42,1),(1.2,.25,.85),linen,.12);back.rotation_euler.z=angle-math.pi/2
# Sculptural planters, branching stems and restrained foliage.
for px,py in [(-7,-2),(7,8),(-7,19),(7,30)]:
    cyl('Stone planter',(px,py,.5),.48,1,stone)
    tube('Botanical stem',[(px,py,.7),(px+.1,py,1.6),(px-.1,py,2.8)],.035,wood)
    for i in range(9):
        a=i*2.4;z=1.3+i*.16;dx=math.cos(a)*.45;dy=math.sin(a)*.45
        tube('Botanical branch',[(px,py,z),(px+dx,py+dy,z+.25)],.012,wood)
        bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=6,location=(px+dx,py+dy,z+.25))
        o=bpy.context.object;o.scale=(.32,.13,.035);o.rotation_euler=(.3,.4,a);finish(o,'Botanical leaf',leaf)
# Harbour terrace and distant fictional skyline. No claim of a mapped real property.
box('Harbour water',(-65,10,-.25),(110,180,.12),water,0)
for i in range(55):
    y=-60+i*2.6;h=.8+(i*7%17)*.24
    box('Distant city',(-52-(i%5)*2,y,h/2-1),(1.5,1.4,h),horizon,.02)
    for z in np.arange(.3,h-.3,.65):
        box('Distant window',(-51.2-(i%5)*2,y,z-1),(.015,.55,.13),light,0)
for py in range(-10,35,8):area('Harbour dusk wash',(-7,py,4),650,(.8,.57,.64),6,(1,py,1))
area('Entry fill',(-1,-10,4.5),800,(1,.7,.57),5,(3,3,1))

scene=bpy.context.scene
scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.19,.11,.16,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.5
bpy.ops.object.camera_add(location=(-3,-9,2.15));camera=bpy.context.object;camera.name='Arrival camera';camera.rotation_euler=(Vector((2,4,2.05))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.lens=24;scene.camera=camera
scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=True
scene.render.resolution_x=1600;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX'
# Convert curves so all architectural detail exports consistently.
for o in list(scene.objects):
    if o.type=='CURVE':
        bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.convert(target='MESH')
bpy.ops.wm.save_as_mainfile(filepath=str(out/'do-world.blend'))
# Keep the editable file above as separate objects; batch static render geometry
# by material for the browser to avoid hundreds of individual draw calls.
for mat in list(bpy.data.materials):
    group=[o for o in scene.objects if o.type=='MESH' and len(o.data.materials)==1 and o.data.materials[0]==mat]
    if len(group)>1:
        bpy.ops.object.select_all(action='DESELECT')
        for o in group:o.select_set(True)
        bpy.context.view_layer.objects.active=group[0]
        bpy.ops.object.join();group[0].name='Batched '+mat.name
bpy.ops.export_scene.gltf(filepath=str(out/'do-world.glb'),export_format='GLB',export_cameras=False,export_lights=False,export_draco_mesh_compression_enable=True,export_draco_mesh_compression_level=6)
if '--skip-render' not in sys.argv:
    scene.render.image_settings.file_format='PNG';scene.render.filepath=str(out/'do-world-poster.png');bpy.ops.render.render(write_still=True)
print('DO_WORLD_COMPLETE',len(scene.objects),'objects')
