"""Author the DO harbour studio. Blender 5.x; no external assets or textures.

Run: blender -b --python scripts/build-do-office.py -- /absolute/output/directory
The editable .blend, browser .glb and poster are generated together.
This is an imagined studio, not a scan or representation of a real property.
"""
import bpy
import math
import random
import sys
from pathlib import Path
from mathutils import Vector

random.seed(18)
out = Path(sys.argv[sys.argv.index('--') + 1])
out.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def material(name, color, roughness=.5, metallic=0, emission=0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    shader = m.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*color, 1)
    shader.inputs['Roughness'].default_value = roughness
    shader.inputs['Metallic'].default_value = metallic
    if emission:
        shader.inputs['Emission Color'].default_value = (*color, 1)
        shader.inputs['Emission Strength'].default_value = emission
    return m

stone = material('Warm travertine', (.64, .50, .44), .74)
bone = material('Chalk plaster', (.84, .75, .67), .76)
edge = material('Deep plum powdercoat', (.052, .013, .047), .4, .28)
wood = material('Smoked walnut', (.14, .063, .052), .48)
brass = material('Brushed champagne', (.53, .29, .16), .29, .78)
rose = material('Rose wool upholstery', (.35, .13, .19), .85)
linen = material('Linen upholstery', (.62, .46, .41), .87)
dark = material('Screen graphite', (.021, .015, .026), .34)
screen = material('Screen rose light', (.32, .19, .28), .42, emission=.45)
light = material('Warm opal light', (.97, .64, .40), .26, emission=3)
glow = material('DO lilac light', (.78, .35, .65), .24, emission=4)
water = material('Harbour at dusk', (.075, .13, .16), .26, .48)
leaf = material('Muted pohutukawa foliage', (.055, .092, .077), .8)
glass = material('Architectural glass', (.22, .24, .27), .18, .52)
island = material('Distant volcanic horizon', (.075, .068, .104), .94)

def finish(obj, name, mat, bevel=0):
    obj.name = name
    obj.data.materials.append(mat)
    if bevel:
        mod = obj.modifiers.new('Soft crafted edges', 'BEVEL')
        mod.width = bevel
        mod.segments = 3
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return obj

def box(name, pos, size, mat, bevel=.035):
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos)
    obj = bpy.context.object
    obj.dimensions = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return finish(obj, name, mat, bevel)

def cylinder(name, pos, radius, depth, mat, vertices=32):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=pos)
    return finish(bpy.context.object, name, mat, .018)

def sphere(name, pos, scale, mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=1, location=pos)
    obj = bpy.context.object
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    finish(obj, name, mat)
    for poly in obj.data.polygons:
        poly.use_smooth = True
    return obj

def tube(name, points, radius, mat, cyclic=False):
    curve = bpy.data.curves.new(name, 'CURVE')
    curve.dimensions = '3D'
    curve.bevel_depth = radius
    curve.bevel_resolution = 3
    spl = curve.splines.new('POLY')
    spl.points.add(len(points)-1)
    for p, v in zip(spl.points, points):
        p.co = (*v, 1)
    spl.use_cyclic_u = cyclic
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    return obj

# Open architectural section, on a floating harbour-edge foundation.
box('Floating foundation', (0, 0, -.52), (18.6, 11.3, .78), edge, .24)
box('Stone edge reveal', (0, 0, -.17), (18.3, 11, .24), brass, .16)
box('Travertine floor', (0, 0, -.015), (18.2, 10.9, .22), stone, .16)
for x in range(-8, 10, 2):
    box('Stone joint', (x, 0, .098), (.013, 10.6, .009), linen, 0)
for y in [-4,-2,0,2,4]:
    box('Stone joint', (0,y,.098), (18,.013,.009), linen, 0)

# Walnut window frames and low glass balustrade give a clear harbour outlook.
box('Rear sill', (0, 4.65, .35), (18,.27,.6), wood)
box('Rear header', (0, 4.65, 3.75), (18,.3,.25), wood)
for x in [-8.7,-5.8,-2.9,0,2.9,5.8,8.7]:
    box('Window mullion', (x,4.65,2.02), (.09,.14,3.3), brass, .012)
box('Glazed parapet', (0,4.67,.96), (17.5,.035,.72), glass, .004)
for x in [-8.8,8.8]:
    box('Return wall', (x,2.6,1.8), (.24,4.2,3.6), bone, .06)
    for y in [1.0+i*.16 for i in range(24)]:
        box('Acoustic walnut batten', (x-(.16 if x>0 else -.16),y,1.85), (.10,.048,3.35), wood, .009)

# Thin roof fins frame the space without obscuring the dollhouse view.
for x in [-8.65,-2.95,2.95,8.65]:
    box('Roof fin', (x,2.3,3.8), (.16,4.7,.19), wood)
for x in [-5.7,0,5.7]:
    box('Floating studio light', (x,2.7,3.3), (3.5,.09,.075), light, .025)
    for px in [x-1.2,x+1.2]:
        cylinder('Light suspension', (px,2.7,3.55), .012, .5, brass, 8)

def desk(x,y,reverse=False):
    box('Walnut work surface', (x,y,1.03), (2.05,.95,.10), wood, .06)
    for side in [-.77,.77]:
        box('Tapered desk trestle', (x+side,y,.54), (.09,.72,.9), brass, .023)
    box('Monitor foot', (x,y+.17,1.12), (.38,.28,.04), edge)
    box('Monitor stem', (x,y+.25,1.29), (.07,.07,.36), brass)
    box('Monitor bezel', (x,y+.22,1.61), (.92,.052,.53), dark, .035)
    box('Monitor display', (x,y+.189,1.61), (.82,.009,.43), screen, .025)
    for row in range(3):
        box('Onscreen typography', (x-.12,y+.18,1.70-row*.075), (.42-row*.065,.006,.012), linen, .003)
    box('Keyboard', (x,y-.23,1.106), (.59,.19,.025), edge, .02)
    box('Notebook', (x+.70,y-.15,1.11), (.27,.36,.035), bone, .006)
    cylinder('Cup', (x-.73,y+.13,1.20), .072,.18,bone)
    cylinder('Cup contents', (x-.73,y+.13,1.292), .056,.003,wood)
    # Upholstered chair with shell, arms, polished swivel base and five casters.
    cy=y-1.07
    box('Chair seat', (x,cy,.59), (.66,.66,.18), rose,.11)
    box('Chair back', (x,cy-.25,.99), (.64,.15,.72), rose,.07)
    cylinder('Chair stem', (x,cy,.30),.065,.47,brass)
    for angle in range(0,360,72):
        a=math.radians(angle)
        tube('Chair spoke',[(x,cy,.18),(x+.38*math.cos(a),cy+.38*math.sin(a),.13)],.028,brass)
        sphere('Castor',(x+.38*math.cos(a),cy+.38*math.sin(a),.11),(.055,.055,.06),edge)
    for side in [-.38,.38]:
        box('Chair arm', (x+side,cy,.81), (.06,.47,.07), wood)

for x in [-6.9,-4.55,-1.18,1.18,4.55,6.9]:
    desk(x,2.4)

# Three work islands: furnished, distinct, and separate from live task markers.
for x in [-5.7,0,5.7]:
    box('Woven work rug',(x,1.30,.114),(4.7,3.9,.028),rose if x==0 else linen,.14)
    tube('Inlaid wayfinding',[(x-2.1,-.5,.115),(x+2.1,-.5,.115)],.014,glow)

def sofa(x,y,width,mat):
    box('Lounge plinth',(x,y,.25),(width,1.04,.30),wood,.12)
    box('Upholstered sofa',(x,y,.50),(width,1.1,.34),mat,.16)
    box('Sofa back',(x,y+.40,.92),(width,.25,.70),mat,.12)
    for side in [-1,1]:
        box('Sofa arm',(x+side*(width/2-.1),y,.74),(.23,1.1,.41),mat,.10)
    for n in range(max(1,round(width))):
        box('Seat cushion',(x-width/2+.48+n*.88,y-.08,.71),(.8,.76,.11),mat,.06)

sofa(-5.7,-2.5,3.2,linen)
cylinder('Round lounge table',(-5.7,-3.65,.56),.70,.08,wood)
cylinder('Table pedestal',(-5.7,-3.65,.30),.24,.5,brass)
box('Art book',(-5.8,-3.64,.62),(.35,.42,.04),bone,.008)
sofa(5.4,-2.25,2.65,rose)
cylinder('Creative table',(5.4,-3.45,.60),.72,.09,bone)
cylinder('Creative table support',(5.4,-3.45,.35),.31,.5,wood)
for i in range(3):
    cylinder('Ceramic sample',(5.05+i*.27,-3.4,.69),.08,.13,rose if i%2 else brass)

# A central luminous D, part of the architecture rather than a pretend worker.
cylinder('DO sculpture plinth',(0,-2.9,.25),1.12,.29,edge,64)
cylinder('Plinth rim',(0,-2.9,.41),1.10,.025,brass,64)
points=[(-.58,-2.9,.65),(-.58,-2.9,2.43),(-.15,-2.9,2.43)]
points += [(-.15+.96*math.sin(t),-2.9,1.54+.89*math.cos(t)) for t in [i*math.pi/48 for i in range(49)]]
points += [(-.58,-2.9,.65)]
tube('Dimensional D',points,.105,glow)
sphere('DO central dot',(-.12,-2.9,1.54),(.17,.17,.17),glow)

def plant(x,y,scale=1):
    cylinder('Hand-thrown planter',(x,y,.32*scale),.30*scale,.57*scale,bone)
    cylinder('Soil',(x,y,.61*scale),.26*scale,.025,wood)
    for i in range(11):
        ang=i*2.399
        tip=(x+math.cos(ang)*.41*scale,y+math.sin(ang)*.41*scale,(1.0+random.random()*.75)*scale)
        tube('Botanical stem',[(x,y,.58*scale),tip],.012*scale,wood)
        obj=sphere('Botanical leaf',tip,(.14*scale,.36*scale,.047*scale),leaf)
        obj.rotation_euler=(random.random()*.7,random.random()*.6,ang)
for x,y,sc in [(-8,3.5,1.2),(8,3.5,1.2),(-8,-3.8,.95),(8,-3.8,.95),(-2.8,-2.1,.85),(2.8,-2.1,.85)]:
    plant(x,y,sc)

# Harbour backdrop: water, boardwalk, distant low volcanic landform.
box('Harbour water',(0,11,-.59),(45,20,.15),water,.12)
for y in [6.2+i*.18 for i in range(7)]:
    box('Boardwalk plank',(0,y,-.32),(18.2,.13,.06),wood,.015)
for i in range(45):
    x=random.uniform(-19,19);y=random.uniform(8,19)
    box('Evening water glint',(x,y,-.508),(random.uniform(.2,2),.023,.008),brass if i%7==0 else glass,.009)
# A low island silhouette is deliberately conceptual, not a geographic model.
verts=[(-18,19,-.6),(-18,19,.05),(-8,19,.22),(-4,19,.8),(0,19,1.7),(2.5,19,2.05),(5,19,1.5),(9,19,.65),(18,19,.15),(18,19,-.6)]
mesh=bpy.data.meshes.new('Harbour horizon');mesh.from_pydata(verts,[],[list(range(len(verts)))]);mesh.materials.append(island)
obj=bpy.data.objects.new('Imagined harbour horizon',mesh);bpy.context.collection.objects.link(obj)

scene=bpy.context.scene
scene.render.engine='CYCLES'
scene.cycles.samples=48
scene.cycles.use_denoising=True
scene.world.color=(.16,.095,.14)
def area(name,location,power,color,size,target):
    bpy.ops.object.light_add(type='AREA',location=location)
    obj=bpy.context.object;obj.name=name;obj.data.energy=power;obj.data.color=color;obj.data.shape='DISK';obj.data.size=size
    obj.rotation_euler=(Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()
area('Late harbour sun',(-10,6,12),2400,(1,.65,.43),8,(0,0,0))
area('Soft studio fill',(3,-9,12),1800,(.77,.65,1),10,(0,0,0))
area('Window sky',(0,9,9),1900,(.74,.84,1),11,(0,0,0))
bpy.ops.object.camera_add(location=(19,-25,19))
camera=bpy.context.object;camera.name='Office architectural view';camera.rotation_euler=(Vector((0,1.3,.4))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=25
scene.camera=camera
scene.render.resolution_x=1500;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.filepath=str(out/'office-poster.png')
scene.view_settings.view_transform='AgX'
bpy.ops.wm.save_as_mainfile(filepath=str(out/'do-harbour-studio.blend'))
bpy.ops.render.render(write_still=True)
# Apply curves and merge static geometry by material for a small browser scene.
bpy.ops.object.select_all(action='DESELECT')
for obj in list(scene.objects):
    if obj.type=='CURVE':
        obj.select_set(True);bpy.context.view_layer.objects.active=obj;bpy.ops.object.convert(target='MESH');obj.select_set(False)
for mat in bpy.data.materials:
    group=[obj for obj in scene.objects if obj.type=='MESH' and len(obj.data.materials)==1 and obj.data.materials[0]==mat]
    if len(group)>1:
        bpy.ops.object.select_all(action='DESELECT')
        for obj in group:obj.select_set(True)
        bpy.context.view_layer.objects.active=group[0];bpy.ops.object.join();group[0].name=mat.name
bpy.ops.object.select_all(action='DESELECT')
for obj in scene.objects:
    if obj.type=='MESH':obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(out/'harbour-studio.glb'),export_format='GLB',use_selection=True,export_cameras=False,export_lights=False,export_apply=True,export_draco_mesh_compression_enable=True,export_draco_mesh_compression_level=6)
print('DO Office artifacts written to',out)
