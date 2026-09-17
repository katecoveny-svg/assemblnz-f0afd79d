"""Editable Auckland harbour atelier for the scroll-led DO / homepage hero.

Blender 5: blender -b --python scripts/build-do-world.py -- /absolute/output
Optional: --skip-render

Imagined Assembl studio overlooking a Waitematā-like harbour at dusk —
Rangitoto-inspired volcanic silhouette, waterfront CBD lights, plum grade.
Not a scan or mapped real property. Materials embed in GLB; no downloads.
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
    elif kind=='water':
        ripple=np.sin(x*48+y*9)*.04+np.sin(x*11-y*37)*.03+np.sin((x+y)*90)*.015
        value=.78+.12*ripple+.02*np.random.random((n,n))
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

# Softer craft materials — closer R3F/ACES parity (Kate follow-up from world README).
wood=material('Smoked walnut grain',(.25,.12,.085),.32,pattern='wood')
stone=material('Rose limestone',(.68,.55,.48),.36,pattern='stone')
plaster=material('Warm plum plaster',(.20,.10,.14),.78,pattern='stone')
brass=material('Brushed bronze',(.42,.23,.13),.24,.82)
linen=material('Warm linen',(.62,.45,.40),.86,pattern='stone')
rose=material('Muted rose wool',(.34,.11,.19),.88)
# Cove emission kept restrained so the room grades plum, not flat lilac.
light=material('Rose opal light',(.97,.66,.52),.22,emit=5.2)
paper=material('Ivory paper',(.92,.83,.68),.78)
# Waitematā dusk water — teal-plum, not generic navy.
water=material('Waitemata dusk water',(.08,.10,.14),.12,.55,pattern='water')
# CBD massing — deep plum charcoal, reads against harbour fog.
city=material('Auckland waterfront mass',(.055,.035,.055),.88)
# Rangitoto-inspired volcanic silhouette.
volcanic=material('Volcanic island silhouette',(.07,.055,.075),.92)
# Pohutukawa-toned botanical (deep green with rose undertone).
leaf=material('Pohutukawa botanical',(.12,.08,.09),.78)
# Soft window-glow for distant city lights (warmer than cove lights).
city_glow=material('Harbour city light',(.99,.76,.52),.16,emit=14)

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

def cyl(name,pos,radius,depth,mat,verts=32):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts,radius=radius,depth=depth,location=pos)
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
# Slender harbour facade. Open glazing keeps the Waitematā view readable.
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
    box('Walnut collaborative table',(3.5,y,1.03),(5.5,2.2,.18),wood,.18)
    for x in [1.6,5.4]:cyl('Turned table pedestal',(x,y,.48),.38,.95,wood)
    # Soft monitor slabs + slim desk lamps — studio craft without clutter.
    for x in [2.0,5.0]:
        box('Desk monitor',(x,y-.85,1.55),(.72,.04,.42),brass,.01)
        box('Monitor glow',(x,y-.83,1.55),(.62,.01,.32),light,0)
        cyl('Desk lamp stem',(x+1.1,y+.7,1.35),.018,.55,brass,12)
        cyl('Desk lamp shade',(x+1.1,y+.7,1.68),.09,.06,brass,16)
        cyl('Desk lamp glow',(x+1.1,y+.7,1.62),.06,.02,light,12)
    for x in [1.5,3.4,5.3]:
        for side in [-1,1]:
            cy=y+side*1.65
            box('Upholstered seat',(x,cy,.52),(.86,.82,.16),linen,.15)
            box('Rounded chair back',(x,cy+side*.28,.98),(.82,.16,.72),rose,.12)
            for dx in [-.28,.28]:
                for dy in [-.22,.22]:cyl('Bronze chair foot',(x+dx,cy+dy,.22),.022,.44,brass,10)
        box('Selected paper',(x,y-.15,1.135),(.65,.48,.008),paper,.006)
        for j in range(4):box('Paper annotation',(x,y-.3+j*.07,1.141),(.42,.012,.002),brass,0)
    area('Table softbox',(3.5,y,4.9),420,(1,.64,.55),3.5,(3.5,y,0))
cyl('Presentation rug',(3,28,.065),3.6,.02,rose)
cyl('Presentation table',(3,28,.59),1.45,.14,wood)
cyl('Presentation pedestal',(3,28,.27),.8,.5,plaster)
for angle in [-.2,.75,1.7,2.7,3.7,4.7]:
    x=3+math.cos(angle)*2.65;y=28+math.sin(angle)*2.65
    seat=box('Salon lounge',(x,y,.52),(1.3,1.1,.42),linen,.22);seat.rotation_euler.z=angle
    back=box('Salon back',(x+math.cos(angle)*.42,y+math.sin(angle)*.42,1.02),(1.2,.22,.88),linen,.14);back.rotation_euler.z=angle-math.pi/2
# Pendant over salon — soft rose opal.
cyl('Salon pendant stem',(3,28,4.4),.02,1.6,brass,8)
cyl('Salon pendant shade',(3,28,3.55),.38,.12,brass,24)
cyl('Salon pendant glow',(3,28,3.48),.28,.04,light,16)

# Sculptural planters with pohutukawa-toned foliage.
for px,py in [(-7,-2),(7,8),(-7,19),(7,30)]:
    cyl('Stone planter',(px,py,.5),.48,1,stone)
    tube('Botanical stem',[(px,py,.7),(px+.1,py,1.6),(px-.1,py,2.8)],.035,wood)
    for i in range(9):
        a=i*2.4;z=1.3+i*.16;dx=math.cos(a)*.45;dy=math.sin(a)*.45
        tube('Botanical branch',[(px,py,z),(px+dx,py+dy,z+.25)],.012,wood)
        bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=6,location=(px+dx,py+dy,z+.25))
        o=bpy.context.object;o.scale=(.32,.13,.035);o.rotation_euler=(.3,.4,a);finish(o,'Botanical leaf',leaf)

# ——— Waitematā exterior (readable through open glazing) ———
# Brought closer + taller so harbour reads through R3F fog, not a plum void.
box('Waitemata water',(-34,10,-.35),(58,160,.18),water,0)
# Soft reflective sheen band near shore.
box('Nearshore glaze',(-18,10,-.18),(6,90,.04),water,0)

# Auckland waterfront CBD cluster — stepped towers, not US downtown grid.
# Positions: Blender Y along the facade length; X out over the harbour.
cbd=[
    # (x, y, width, depth, height) — taller core, lower waterfront sheds
    (-22, -8, 2.4, 2.2, 10.5),
    (-23.5, -4, 2.0, 1.8, 8.0),
    (-21.5, -1, 3.0, 2.4, 13.5),
    (-24, 2.5, 1.8, 1.6, 6.8),
    (-22.2, 5, 2.6, 2.2, 11.5),
    (-25, 8, 1.6, 1.4, 5.4),
    (-21.8, 11, 3.2, 2.6, 15.5),  # tall landmark tower
    (-23.2, 14.5, 2.2, 2.0, 9.5),
    (-22, 18, 2.8, 2.3, 12.2),
    (-24.5, 21, 1.7, 1.5, 6.2),
    (-21.5, 24, 2.5, 2.2, 10.0),
    (-23, 27.5, 2.1, 1.9, 8.5),
    (-22.4, 31, 2.7, 2.4, 11.0),
    (-25.2, 34, 1.5, 1.3, 4.8),
    (-21.0, 0.5, 1.4, 3.8, 3.6),  # low waterfront shed
    (-20.8, 16, 1.3, 4.2, 3.0),
]
for x,y,w,d,h in cbd:
    box('Waterfront tower',(x,y,h/2-0.6),(w,d,h),city,.04)
    # Warm office lights — large enough to read at dusk through the glazing.
    for z in np.arange(0.5, h-0.6, 0.95):
        for dy in np.linspace(-d*0.28, d*0.28, max(2, int(d*1.2))):
            box('Tower window',(x+w*0.52,y+dy,z-0.6),(.04,0.42,0.28),city_glow,0)
            # Side-facing lights for glancing views along the walk.
            box('Tower side light',(x+w*0.2,y+d*0.52,z-0.6),(.35,.04,.22),city_glow,0)

# Sky Tower–inspired slender landmark (illustrative, not a survey model).
cyl('Sky landmark shaft',(-21.2, 9.5, 8.5), .22, 18.5, city, 16)
cyl('Sky landmark pod',(-21.2, 9.5, 16.2), .55, 1.1, city, 20)
cyl('Sky landmark mast',(-21.2, 9.5, 19.5), .06, 5.5, brass, 10)
cyl('Sky landmark beacon',(-21.2, 9.5, 22.2), .08, .2, city_glow, 8)

# Secondary North Shore ridge — lower massing across the water.
for i in range(18):
    y=-20+i*3.2
    h=1.6+(i*5%9)*.45
    box('North shore ridge',(-42-(i%3)*1.4,y,h/2-0.5),(2.8,2.2,h),volcanic,.03)

# Rangitoto-inspired volcanic cone — broad silhouette across the harbour.
bpy.ops.mesh.primitive_cone_add(vertices=48,radius1=16,radius2=0.5,depth=8.5,location=(-50,8,2.8))
cone=bpy.context.object;cone.scale=(1.0,1.4,1.0)
bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
finish(cone,'Rangitoto silhouette',volcanic,.08)
# Secondary crater shoulder.
bpy.ops.mesh.primitive_uv_sphere_add(segments=28,ring_count=16,radius=6.2,location=(-46,18,0.4))
shoulder=bpy.context.object;shoulder.scale=(1.5,1.15,0.48)
bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
finish(shoulder,'Volcanic shoulder',volcanic)

# Soft ferry / pier lights on the near water — sparse, not a lightfield.
for fy,fz in [(-2,0.2),(6,0.18),(14,0.22),(22,0.16),(10,0.25)]:
    cyl('Harbour marker',(-14,fy,fz),.07,.12,city_glow,8)

# Harbour dusk washes — warmer, lower intensity so plum shadows keep contrast.
for py in range(-10,35,7):
    area('Harbour dusk wash',(-8,py,3.8),520,(.72,.48,.42),6,(2,py,1.2))
area('Entry fill',(-1,-10,4.5),640,(.95,.7,.55),4.5,(3,3,1))
area('City bounce',(-16,12,5.5),900,(.95,.62,.38),10,(0,12,2))

scene=bpy.context.scene
scene.world.use_nodes=True
bg=scene.world.node_tree.nodes['Background']
# Deep plum night — richer than lilac wash; warm harbour bias for the poster.
bg.inputs[0].default_value=(.09,.05,.08,1); bg.inputs[1].default_value=.35
# Eye-level arrival (~1.85 m), ~36mm — glance toward Waitematā glazing (matches R3F start).
bpy.ops.object.camera_add(location=(2.8,-10.5,1.85));camera=bpy.context.object
camera.name='Arrival camera'
camera.rotation_euler=(Vector((-6,4,1.6))-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.lens=36;scene.camera=camera
scene.render.engine='CYCLES';scene.cycles.samples=40;scene.cycles.use_denoising=True
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
bpy.ops.export_scene.gltf(
    filepath=str(out/'do-world.glb'),
    export_format='GLB',
    export_cameras=False,
    export_lights=False,
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
)
if '--skip-render' not in sys.argv:
    scene.render.image_settings.file_format='PNG'
    scene.render.filepath=str(out/'do-world-poster.png')
    bpy.ops.render.render(write_still=True)
print('DO_WORLD_COMPLETE',len(scene.objects),'objects')
