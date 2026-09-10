"""Editable, illustrative transport assemblies. Metres, Z up, negative X is forward.
Not manufacturer CAD: exterior proportions are visual studies; internals are illustrative.
Blender 5.1/5.2. Run with --background --python FILE -- subaru|boat|plane OUTDIR.
"""
import bpy, math, json, sys, random
from pathlib import Path
from mathutils import Vector
random.seed(33)
PI=math.pi
parts=[]
groups={}

def material(name, color, metallic=0, rough=.3, alpha=1):
    m=bpy.data.materials.new(name); m.diffuse_color=(*color,alpha); m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,alpha)
    p.inputs['Metallic'].default_value=metallic;p.inputs['Roughness'].default_value=rough
    p.inputs['Alpha'].default_value=alpha
    if metallic>.2: p.inputs['Coat Weight'].default_value=.28;p.inputs['Coat Roughness'].default_value=.19
    return m

def setup():
    global blue,black,rubber,steel,chrome,paper,plum,rose,red,glass,lamp,deck,brass
    bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
    blue=material('WR blue pearl / bodywork',(.004,.027,.24),.48,.28)
    black=material('Graphite / trim',(.028,.036,.05),.3,.36)
    rubber=material('Tyre rubber',(.012,.015,.019),0,.76)
    steel=material('Satin aluminium',(.42,.46,.49),.8,.3)
    chrome=material('Polished metal',(.7,.75,.8),.93,.17)
    paper=material('Pearl white / painted alloy',(.7,.68,.64),.12,.35)
    plum=material('Deep plum / painted structure',(.04,.006,.026),.22,.38)
    rose=material('Dusty rose / container paint',(.2,.068,.086),.14,.48)
    red=material('Brake red',(.5,.022,.035),.4,.32)
    glass=material('Smoked optical glass',(.006,.018,.029),.08,.12,1)
    glass.node_tree.nodes.get('Principled BSDF').inputs['Transmission Weight'].default_value=.35
    lamp=material('Headlamp optics',(.75,.87,.91),.3,.14)
    deck=material('Deck graphite',(.16,.19,.2),.45,.48)
    brass=material('Warm machined bronze',(.42,.24,.1),.75,.25)
    scene=bpy.context.scene;scene.unit_settings.system='METRIC';scene.render.fps=24
    scene.frame_start=1;scene.frame_end=289

def mesh(name,verts,faces,mat,group,delta=(0,0,0),bevel=0,smooth=False):
    me=bpy.data.meshes.new(name+' geometry');me.from_pydata(verts,[],faces);me.update()
    center=sum((Vector(v) for v in verts),Vector())/len(verts)
    for v in me.vertices:v.co-=center
    o=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(o);o.location=center
    o.data.materials.append(mat)
    if smooth:
        for poly in me.polygons:poly.use_smooth=True
    if bevel:
        b=o.modifiers.new('Manufactured edge radius','BEVEL');b.width=bevel;b.segments=3
        n=o.modifiers.new('Weighted surface normals','WEIGHTED_NORMAL')
    o['assembly']=group;o['rest_m']=list(center);o['explode_m']=list(delta);o['component_id']=len(parts)+1
    parts.append(o);groups.setdefault(group,[]).append(o);return o

def box(name,loc,size,mat,group,delta=(0,0,0),bevel=.015):
    x,y,z=loc; a,b,c=[v/2 for v in size]
    vs=[(x+dx*a,y+dy*b,z+dz*c) for dz in (-1,1) for dy in (-1,1) for dx in (-1,1)]
    return mesh(name,vs,[(0,2,3,1),(4,5,7,6),(0,1,5,4),(2,6,7,3),(0,4,6,2),(1,3,7,5)],mat,group,delta,bevel)

def tube(name,a,b,r,mat,group,delta=(0,0,0),n=16):
    va,vb=Vector(a),Vector(b);axis=vb-va;basis=axis.normalized().cross(Vector((0,0,1)))
    if basis.length<.01:basis=axis.normalized().cross(Vector((0,1,0)))
    basis.normalize();other=axis.normalized().cross(basis)
    vs=[tuple(pos+r*(math.cos(i*2*PI/n)*basis+math.sin(i*2*PI/n)*other)) for pos in (va,vb) for i in range(n)]
    fs=[tuple(reversed(range(n))),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    return mesh(name,vs,fs,mat,group,delta,0,True)

def torus(name,loc,major,minor,mat,group,delta=(0,0,0),axis='Y',n=64,k=12):
    vs=[]
    for i in range(n):
        a=2*PI*i/n
        for j in range(k):
            b=2*PI*j/k;r=major+minor*math.cos(b)
            v=(r*math.cos(a),minor*math.sin(b),r*math.sin(a)) if axis=='Y' else (minor*math.sin(b),r*math.cos(a),r*math.sin(a))
            vs.append(tuple(Vector(loc)+Vector(v)))
    fs=[(i*k+j,((i+1)%n)*k+j,((i+1)%n)*k+(j+1)%k,i*k+(j+1)%k) for i in range(n) for j in range(k)]
    return mesh(name,vs,fs,mat,group,delta,0,True)

def panel(name,verts,mat,group,delta=(0,0,0),thickness=.018):
    o=mesh(name,verts,[tuple(range(len(verts)))],mat,group,delta)
    s=o.modifiers.new('Panel thickness','SOLIDIFY');s.thickness=thickness
    b=o.modifiers.new('Soft edge','BEVEL');b.width=.008;b.segments=2
    return o

def loft(name,sections,mat,group,delta=(0,0,0),n=48):
    # Cross sections: x, half-width, half-height, centre-z.
    vs=[(x,ry*math.cos(2*PI*j/n),z+rz*math.sin(2*PI*j/n)) for x,ry,rz,z in sections for j in range(n)]
    fs=[tuple(reversed(range(n))),tuple(range((len(sections)-1)*n,len(sections)*n))]
    fs += [(s*n+j,s*n+(j+1)%n,(s+1)*n+(j+1)%n,(s+1)*n+j) for s in range(len(sections)-1) for j in range(n)]
    return mesh(name,vs,fs,mat,group,delta,0,True)

def car():
    # Underbody, individual drivetrain components and cross members.
    box('Chassis floor',(.05,0,.4),(3.8,1.48,.12),black,'01 / Chassis',(0,0,-.35))
    for y in [-.54,.54]:box('Longitudinal chassis rail',(0,y,.34),(3.9,.08,.1),steel,'01 / Chassis',(0,0,-.35))
    for x in [-1.55,-.4,.6,1.5]:box('Cross member',(x,0,.35),(.08,1.48,.08),steel,'01 / Chassis',(0,0,-.35))
    for x in [-1.4,1.4]:
        tube('Axle',(x,-.88,.39),(x,.88,.39),.045,steel,'02 / Drivetrain',(0,0,.23))
        box('Differential',(x,0,.42),(.23,.27,.2),steel,'02 / Drivetrain',(0,0,.23))
    tube('Propeller shaft',(-1.45,0,.36),(1.45,0,.36),.043,chrome,'02 / Drivetrain',(0,0,.23))
    box('Boxer engine block',(-1.28,0,.67),(.62,.8,.33),steel,'02 / Drivetrain',(0,0,.38))
    for side in [-1,1]:
        box('Cylinder head',(-1.28,side*.43,.7),(.56,.14,.21),black,'02 / Drivetrain',(0,0,.38))
        for i in range(7):box('Cylinder cooling fin',(-1.54+i*.08,side*.43,.73),(.017,.16,.24),steel,'02 / Drivetrain',(0,0,.38),.003)
    box('Top intercooler',(-1.12,0,.92),(.44,.6,.07),black,'02 / Drivetrain',(0,0,.42))
    for i in range(18):box('Intercooler fin',(-1.32+i*.024,0,.965),(.009,.56,.025),steel,'02 / Drivetrain',(0,0,.42),.002)
    # Body sides have actual wheel-arch openings, with separately authored fenders/doors.
    for side in [-1,1]:
        for name,a,b,g in [('Front fender',-2.22,-.65,'03 / Front body'),('Front door',-.65,.38,'04 / Doors'),('Rear door',.38,1.2,'04 / Doors'),('Rear quarter',1.2,2.18,'05 / Rear body')]:
            delta=(0,side*(.5 if 'door' in name.lower() else .34),.25)
            vs=[]
            for i in range(25):
                x=a+(b-a)*i/24
                w=.89-.11*(abs(x)/2.3)**4;top=1.03-.1*(abs(x)/2.3)**5
                bottom=.33
                for axle in [-1.4,1.4]:
                    d=x-axle
                    if abs(d)<.415:bottom=max(bottom,.4+math.sqrt(.415**2-d*d))
                for q in range(4):
                    t=q/3;vs.append((x,side*(w+.017*math.sin(t*PI)),bottom+(top-bottom)*t))
            fs=[(i*4+j,(i+1)*4+j,(i+1)*4+j+1,i*4+j+1) for i in range(24) for j in range(3)]
            o=mesh(name+(' / left' if side<0 else ' / right'),vs,fs,blue,g,delta,0,True);s=o.modifiers.new('Body skin','SOLIDIFY');s.thickness=.025
        for x in [-.12,.96]:box('Door handle',(x,side*.9,1.0),(.15,.035,.035),blue,'04 / Doors',(0,side*.5,.25),.016)
        box('Side sill',(0,side*.84,.34),(2.0,.16,.1),black,'04 / Doors',(0,side*.5,.25),.02)
        for axle in [-1.4,1.4]:
            vs=[]
            for i in range(49):
                a=i*PI/48
                for r in [.415,.455]:vs.append((axle+r*math.cos(a),side*.909,.4+r*math.sin(a)))
            mesh('Wheel arch cladding',vs,[(i*2,i*2+1,i*2+3,i*2+2) for i in range(48)],black,'03 / Front body' if axle<0 else '05 / Rear body',(0,side*.34,.25),.006)
    # Broad curved bonnet, separate scoop, roof and boot panels.
    for name,a,b,z0,z1,w0,w1,g,d in [
        ('Bonnet',-2.15,-.72,1.0,1.08,.76,.83,'06 / Bonnet',(0,0,.92)),
        ('Roof',-.14,.91,1.47,1.45,.63,.64,'07 / Roof and glass',(0,0,1.45)),
        ('Boot lid',1.42,2.15,1.04,.99,.8,.76,'05 / Rear body',(.4,0,.57))]:
        vs=[]
        for i in range(15):
            t=i/14;x=a+(b-a)*t;w=w0+(w1-w0)*t
            for j in range(15):
                u=j/14*2-1;vs.append((x,u*w,z0+(z1-z0)*t+.035*(1-u*u)))
        fs=[(i*15+j,i*15+j+1,(i+1)*15+j+1,(i+1)*15+j) for i in range(14) for j in range(14)]
        o=mesh(name,vs,fs,blue,g,d,0,True);o.modifiers.new('Panel thickness','SOLIDIFY').thickness=.018
    panel('Bonnet scoop',[(-1.65,-.32,1.068),(-1.65,.32,1.068),(-1.15,.29,1.16),(-1.15,-.29,1.16)],blue,'06 / Bonnet',(0,0,.92),.035)
    box('Scoop intake',(-1.64,0,1.095),(.035,.56,.055),black,'06 / Bonnet',(0,0,.92),.012)
    panel('Front windscreen',[(-.76,-.79,1.075),(-.76,.79,1.075),(-.14,.625,1.47),(-.14,-.625,1.47)],glass,'07 / Roof and glass',(0,0,1.45))
    panel('Rear windscreen',[(.91,-.64,1.45),(.91,.64,1.45),(1.43,.8,1.055),(1.43,-.8,1.055)],glass,'07 / Roof and glass',(0,0,1.45))
    for side in [-1,1]:
        A=(-.71,side*.81,1.07);B=(-.1,side*.645,1.43);C=(.34,side*.65,1.43);D=(.34,side*.87,1.065)
        E=(.91,side*.655,1.42);F=(1.34,side*.805,1.065)
        panel('Front door glass',[A,B,C,D],glass,'04 / Doors',(0,side*.5,.25))
        panel('Rear door glass',[D,C,E,F],glass,'04 / Doors',(0,side*.5,.25))
        for a,b in [(A,B),(B,E),(E,F),(C,D)]:tube('Cabin pillar',a,b,.028,black,'07 / Roof and glass',(0,0,1.45))
        mirror=box('Wing mirror',(-.62,side*1.0,1.05),(.23,.19,.105),blue,'04 / Doors',(0,side*.5,.25),.05)
        panel('Mirror glass',[(-.49,side*.94,1.02),(-.49,side*1.08,1.02),(-.49,side*1.08,1.09),(-.49,side*.94,1.09)],chrome,'04 / Doors',(0,side*.5,.25))
    # Bumpers, grille, badge, real optical layers and tail lamps.
    box('Front bumper',(-2.18,0,.71),(.22,1.62,.63),blue,'03 / Front body',(-.65,0,.25),.095)
    panel('Hexagonal grille',[(-2.301,-.46,.84),(-2.301,-.55,.72),(-2.301,-.4,.6),(-2.301,.4,.6),(-2.301,.55,.72),(-2.301,.46,.84)],black,'03 / Front body',(-.65,0,.25))
    for row in range(4):
        for col in range(11):
            y=-.44+col*.088+(row%2)*.035;z=.645+row*.05
            if abs(y)<.48:tube('Grille lattice',(-2.318,y-.032,z-.02),(-2.318,y+.032,z+.02),.007,steel,'03 / Front body',(-.65,0,.25),8)
    badge=torus('Subaru grille badge bezel',(-2.333,0,.755),.065,.008,chrome,'03 / Front body',(-.65,0,.25),'X',48,8)
    badge.scale.y=1.4
    tube('Subaru badge blue enamel',(-2.331,0,.755),(-2.345,0,.755),.061,blue,'03 / Front body',(-.65,0,.25),48)
    for y,z,r in [(-.018,.77,.015),(.02,.79,.006),(.04,.765,.006),(.015,.742,.006),(-.005,.724,.006),(.043,.729,.006)]:
        panel('Six-star constellation',[(-2.35,y-r,z),(-2.35,y-r*.25,z+r*.25),(-2.35,y,z+r),(-2.35,y+r*.25,z+r*.25),(-2.35,y+r,z),(-2.35,y+r*.25,z-r*.25),(-2.35,y,z-r),(-2.35,y-r*.25,z-r*.25)],chrome,'03 / Front body',(-.65,0,.25),.002)
    for side in [-1,1]:
        v=[(-2.26,side*.46,.88),(-2.11,side*.82,.95),(-1.94,side*.86,1.0),(-2.2,side*.71,.84)]
        panel('Headlamp dark housing',v,black,'03 / Front body',(-.65,0,.25),.06)
        tube('LED running light',v[0],v[1],.018,lamp,'03 / Front body',(-.65,0,.25))
        tube('Projector lens',(-2.19,side*.68,.893),(-2.25,side*.68,.893),.045,lamp,'03 / Front body',(-.65,0,.25),32)
        box('Lower air intake',(-2.307,side*.63,.49),(.022,.24,.13),black,'03 / Front body',(-.65,0,.25),.04)
        box('Tail lamp',(2.204,side*.59,.9),(.045,.31,.105),red,'05 / Rear body',(.4,0,.57),.03)
    box('Front splitter',(-2.25,0,.33),(.27,1.66,.05),black,'03 / Front body',(-.65,0,.25),.018)
    box('Rear bumper',(2.16,0,.67),(.23,1.67,.68),blue,'05 / Rear body',(.4,0,.57),.09)
    for side in [-1,1]:
        for y in [side*.57,side*.72]:tube('Exhaust tip',(2.18,y,.4),(2.35,y,.4),.052,chrome,'05 / Rear body',(.4,0,.57),32)
    # Four detailed wheel assemblies. All small fasteners follow the parent wheel path.
    for ax,x in enumerate([-1.4,1.4]):
        for side in [-1,1]:
            y=side*.89;loc=(x,y,.39);d=(0,side*.84,.05);g=f'08 / Wheel {ax+1} {side}'
            torus('Tyre',loc,.278,.099,rubber,g,d,n=80,k=20)
            for band in [-.055,0,.055]:torus('Tread groove',(x,y+band,.39),.371,.005,black,g,d,n=80,k=5)
            for i in range(44):
                a=2*PI*i/44
                for band in [-.053,.053]:
                    p=Vector(loc)+Vector((.371*math.cos(a),band,.371*math.sin(a)))
                    o=box('Tread shoulder',p,(.028,.045,.012),black,g,d,.003);o.rotation_euler.y=-a+PI/2
            outer=y+side*.08
            torus('Alloy rim',(x,outer,.39),.238,.017,chrome,g,d)
            tube('Brake disc',(x,outer-side*.047,.39),(x,outer-side*.03,.39),.203,steel,g,d,64)
            for i in range(10):
                a=2*PI*i/10
                for offset in [-.022,.022]:
                    a2=a+offset
                    tube('Split alloy spoke',(x+.055*math.cos(a2),outer,.39+.055*math.sin(a2)),(x+.227*math.cos(a+.09),outer,.39+.227*math.sin(a+.09)),.014,black,g,d,8)
            tube('Hub',(x,outer-side*.01,.39),(x,outer+side*.018,.39),.068,black,g,d,32)
            for i in range(5):
                a=i*2*PI/5;tube('Wheel nut',(x+.045*math.cos(a),outer,.39+.045*math.sin(a)),(x+.045*math.cos(a),outer+side*.025,.39+.045*math.sin(a)),.009,chrome,g,d,6)
            box('Brake caliper',(x+.17,outer-side*.045,.46),(.075,.065,.17),red,g,d,.025)
            tube('Suspension strut',(x,side*.7,.45),(x,side*.6,.91),.035,chrome,'02 / Drivetrain',(0,0,.23))
    # A readable interior exposed in the assembly view.
    for x in [-.13,.77]:
        for side in [-1,1]:
            box('Seat cushion',(x,side*.38,.62),(.49,.49,.14),black,'09 / Interior',(0,0,.72),.075)
            o=box('Seat back',(x+.22,side*.38,.94),(.12,.49,.59),black,'09 / Interior',(0,0,.72),.07);o.rotation_euler.y=-.15
            box('Head restraint',(x+.24,side*.38,1.25),(.13,.24,.17),black,'09 / Interior',(0,0,.72),.06)
    box('Dashboard',(-.65,0,.94),(.29,1.42,.2),black,'09 / Interior',(0,0,.72),.055)
    torus('Right-hand-drive steering wheel',(-.35,.4,1.03),.14,.018,black,'09 / Interior',(0,0,.72),'X',48,10)

def ship():
    hull_sections=[(-5.1,.03,.15,.25),(-4.7,.5,.6,.57),(-3.8,1.05,.67,.67),(-2.6,1.14,.67,.67),(2.8,1.14,.67,.67),(4.25,.91,.64,.7),(4.6,.65,.45,.82)]
    loft('Coastal vessel hull',hull_sections,black,'01 / Hull',(0,0,-.6))
    loft('Antifouling lower hull',[(x,y*.96,z*.5,h-z*.46) for x,y,z,h in hull_sections],rose,'01 / Hull',(0,0,-.6))
    outline=[(-5.08,0,1.12),(-4.1,-.94,1.3),(-2.9,-1.13,1.32),(3.2,-1.13,1.32),(4.58,-.68,1.22),(4.58,.68,1.22),(3.2,1.13,1.32),(-2.9,1.13,1.32),(-4.1,.94,1.3)]
    panel('Main deck',outline,deck,'02 / Main deck',(0,0,.1),.09)
    for side in [-1,1]:
        for z in [1.4,1.55]:tube('Deck safety rail',(-3.8,side*1.08,z),(3.95,side*1.02,z),.012,paper,'02 / Main deck',(0,0,.1),8)
        for i in range(35):
            x=-3.7+i*.22;tube('Rail stanchion',(x,side*1.06,1.32),(x,side*1.06,1.55),.011,paper,'02 / Main deck',(0,0,.1),8)
    # Hatch covers rise before the containers; cargo remains a stable tiered grid.
    for bay,x in enumerate([-2.7,-.85,1.0]):
        box('Cargo hatch cover',(x,0,1.38),(1.7,1.94,.08),steel,'03 / Hatch covers',(0,0,.68),.025)
        for row,y in enumerate([-.66,0,.66]):
            for tier in range(3):
                g=f'04 / Cargo bay {bay+1} row {row+1} tier {tier+1}';delta=(0,(row-1)*.25,1.0+tier*.43+bay*.07)
                loc=(x,y,1.71+tier*.61);mat=[plum,rose,paper,black][(bay+row+tier)%4]
                box('Freight container',loc,(1.63,.62,.57),mat,g,delta,.018)
                for side in [-1,1]:
                    for rib in range(22):
                        box('Container corrugation',(x-.77+rib*.073,y+side*.318,loc[2]),(.017,.008,.5),mat,g,delta,.001)
                    for hinge in [-.2,.2]:tube('Container door bar',(x-.831,y+hinge,loc[2]-.24),(x-.831,y+hinge,loc[2]+.24),.009,steel,g,delta,6)
                for dx in [-.77,.77]:
                    for dy in [-.265,.265]:box('Twistlock corner',(x+dx,y+dy,loc[2]+.26),(.065,.065,.05),steel,g,delta,.007)
    # Layered bridge with glazing, navigation mast and lifeboats.
    for level in range(4):
        z=1.54+level*.37;g='05 / Bridge and navigation';d=(.3,0,1.35)
        box('Bridge deck',(3.33,0,z),(1.8,1.84,.32),paper,g,d,.025)
        box('Bridge balcony',(3.33,0,z+.18),(1.88,1.95,.035),paper,g,d,.01)
        for side in [-1,1]:
            for x in [2.66,3.0,3.34,3.68,4.0]:box('Bridge window',(x,side*.926,z+.03),(.15,.015,.13),glass,g,d,.012)
    for y in [-.72,-.42,-.12,.18,.48,.78]:box('Wheelhouse front window',(2.41,y,2.71),(.023,.23,.19),glass,g,(.3,0,1.35),.012)
    box('Exhaust funnel',(3.92,0,3.16),(.51,.58,.69),black,g,(.3,0,1.35),.035)
    tube('Navigation mast',(2.95,0,2.95),(2.95,0,4.32),.027,paper,g,(.3,0,1.35),12)
    for z in [3.3,3.62,3.9]:tube('Mast crossarm',(2.95,-.35,z),(2.95,.35,z),.012,paper,g,(.3,0,1.35),8)
    for side in [-1,1]:
        boat=loft('Rescue craft',[(3.2,.02,.03,2.1),(3.4,.13,.09,2.1),(3.95,.13,.09,2.1),(4.1,.02,.03,2.1)],rose,g,(.3,0,1.35),24);boat.location.y+=side*1.11;boat['rest_m']=list(boat.location)
    tube('Propeller shaft',(3.7,0,.31),(4.65,0,.31),.06,chrome,'06 / Propulsion',(.7,0,-.1))
    for i in range(5):
        a=i*2*PI/5
        o=box('Propeller blade',(4.64,.21*math.cos(a),.31+.21*math.sin(a)),(.035,.15,.38),brass,'06 / Propulsion',(.7,0,-.1),.05);o.rotation_euler.x=a+PI/2
    box('Rudder',(4.74,0,.44),(.29,.07,.65),black,'06 / Propulsion',(.7,0,-.1),.025)
    for side in [-1,1]:
        for x in [-4.15,-3.6]:
            tube('Mooring bollard',(x,side*.56,1.27),(x,side*.56,1.45),.045,steel,'02 / Main deck',(0,0,.1))
    tube('Foremast',(-4.23,0,1.25),(-4.23,0,2.1),.019,paper,'02 / Main deck',(0,0,.1))

def aircraft():
    sections=[(-5.5,.015,.02,1.35),(-5.35,.22,.23,1.38),(-4.9,.47,.43,1.44),(-4.1,.6,.62,1.5),(-3.4,.63,.66,1.5),(2.75,.63,.66,1.5),(3.8,.44,.45,1.54),(4.8,.18,.17,1.59),(5.3,.012,.025,1.62)]
    # Curved upper and lower fuselage shells are open at the division to expose ribs.
    for upper in [False,True]:
        vs=[];n=49
        for x,ry,rz,z in sections:
            for j in range(n):
                a=(0 if upper else PI)+j*PI/(n-1);vs.append((x,ry*math.cos(a),z+rz*math.sin(a)))
        fs=[(i*n+j,i*n+j+1,(i+1)*n+j+1,(i+1)*n+j) for i in range(len(sections)-1) for j in range(n-1)]
        name='Upper fuselage shell' if upper else 'Lower fuselage keel';g='05 / Fuselage skin' if upper else '01 / Fuselage keel';d=(0,0,1.6) if upper else (0,0,-.24)
        o=mesh(name,vs,fs,paper,g,d,0,True);o.modifiers.new('Airframe skin thickness','SOLIDIFY').thickness=.025
    # Ring frames and deck rails make the construction legible.
    for i in range(18):
        x=-3.55+i*.35;torus('Fuselage ring frame',(x,0,1.5),.607,.012,steel,'02 / Airframe',(0,0,.22),'X',64,8)
    for y in [-.42,.42]:tube('Cargo deck rail',(-3.75,y,1.16),(2.7,y,1.16),.024,steel,'02 / Airframe',(0,0,.22))
    box('Cargo deck',(-.55,0,1.16),(6.5,.96,.045),deck,'02 / Airframe',(0,0,.22),.015)
    for i in range(7):
        x=-3.3+i*.86;g=f'03 / Air cargo {i+1}';d=(0,0,.62+i*.055)
        box('Cargo pallet',(x,0,1.26),(.73,.83,.09),steel,g,d,.01)
        box('Cargo package',(x,0,1.51),(.69,.78,.4),rose if i%2 else plum,g,d,.025)
        for yy in [-.26,0,.26]:box('Cargo restraint',(x,yy,1.722),(.7,.012,.013),paper,g,d,.002)
    # Cockpit glazing is a separate optical assembly.
    def surface_point(x,a,side):
        for i in range(len(sections)-1):
            s,e=sections[i],sections[i+1]
            if s[0]<=x<=e[0]:
                t=(x-s[0])/(e[0]-s[0]);ry=s[1]+(e[1]-s[1])*t;rz=s[2]+(e[2]-s[2])*t;z=s[3]+(e[3]-s[3])*t
                return (x,side*(ry+.012)*math.cos(a),z+(rz+.012)*math.sin(a))
    for side in [-1,1]:
        for i in range(3):
            x=-4.94+i*.255
            panel('Cockpit glass',[surface_point(x,.45,side),surface_point(x+.215,.45,side),surface_point(x+.215,.93,side),surface_point(x,.93,side)],glass,'05 / Fuselage skin',(0,0,1.6),.01)
    # Airfoil panels have thickness and smooth camber; wings stay rigid as they separate.
    def wing(name,poly,mat,g,d,thick=.045):
        vs=[(x,y,z+dz) for dz in [-thick,thick] for x,y,z in poly];n=len(poly)
        fs=[tuple(reversed(range(n))),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
        return mesh(name,vs,fs,mat,g,d,.025,False)
    for side in [-1,1]:
        g=f'04 / Wing {side}';d=(0,side*1.1,.12)
        wing('Main swept wing',[(-1.65,side*.54,1.26),(.7,side*4.55,1.5),(1.32,side*4.65,1.5),(1.34,side*1.3,1.25),(1.55,side*.6,1.24)],steel,g,d)
        wing('Trailing edge flap',[(.44,side*1.27,1.255),(1.05,side*3.0,1.405),(1.3,side*3.0,1.40),(1.43,side*1.26,1.25)],deck,g,d,.028)
        wing('Winglet',[(.7,side*4.55,1.5),(1.3,side*4.64,1.5),(1.25,side*4.83,2.18),(.99,side*4.79,2.14)],plum,g,d,.023)
        tube('Wing leading-edge strip',(-1.65,side*.55,1.29),(.7,side*4.55,1.53),.026,chrome,g,d,12)
        for i in range(9):
            y=side*(1.1+i*.33);x=-1.38+i*.175;tube('Wing panel seam',(x,y,1.29+i*.018),(1.25,y,1.3+i*.018),.003,black,g,d,6)
        # Engine shell, lip, twenty-four fan blades and central cone.
        eg=f'06 / Engine {side}';ed=(-.15,side*1.25,-.52);ex=-1.25;ey=side*1.83;ez=.94
        nac=loft('Engine nacelle',[(ex-.6,.34,.34,ez),(ex-.46,.4,.4,ez),(ex+.15,.38,.38,ez),(ex+.64,.26,.26,ez)],paper,eg,ed);nac.location.y+=ey;nac['rest_m']=list(nac.location)
        # Open intake replaces cap face of the front ring.
        nac.data.polygons[0].material_index=0
        torus('Engine intake lip',(ex-.608,ey,ez),.327,.034,chrome,eg,ed,'X',64,12)
        tube('Fan shadow',(ex-.626,ey,ez),(ex-.634,ey,ez),.304,black,eg,ed,64)
        for j in range(24):
            a=2*PI*j/24
            poly=[(ex-.652,ey+.065*math.cos(a),ez+.065*math.sin(a)),(ex-.649,ey+.3*math.cos(a+.05),ez+.3*math.sin(a+.05)),(ex-.65,ey+.3*math.cos(a+.19),ez+.3*math.sin(a+.19)),(ex-.67,ey+.07*math.cos(a+.12),ez+.07*math.sin(a+.12))]
            panel('Turbofan blade',poly,steel,eg,ed,.007)
        tube('Fan spinner',(ex-.66,ey,ez),(ex-.76,ey,ez),.072,steel,eg,ed,32)
        wing('Engine pylon',[(-1.42,side*1.84,1.24),(-.52,side*1.84,1.48),(-.65,side*1.84,1.26),(-1.22,side*1.84,1.07)],paper,g,d,.06)
        tg='07 / Tail surfaces';td=(.45,0,.8)
        wing('Horizontal stabiliser',[(3.3,side*.38,1.59),(4.46,side*1.9,1.78),(4.96,side*1.91,1.78),(4.5,side*.28,1.56)],steel,tg,td,.035)
    wing('Vertical tail',[(2.78,0,1.98),(4.06,0,3.67),(4.66,0,3.71),(4.6,0,1.77)],plum,'07 / Tail surfaces',(.45,0,.8),.06)
    wing('Tail rudder',[(4.43,-.005,1.88),(4.5,-.005,3.57),(4.7,-.005,3.7),(4.62,-.005,1.82)],rose,'07 / Tail surfaces',(.45,0,.8),.063)
    for x in [-2.8,1.1]:
        panel('Cargo access door seam',[(x,-.62,1.25),(x+.7,-.62,1.25),(x+.7,-.52,1.89),(x,-.52,1.89)],paper,'05 / Fuselage skin',(0,0,1.6),.008)
        tube('Cargo door handle',(x+.57,-.635,1.5),(x+.67,-.635,1.5),.009,black,'05 / Fuselage skin',(0,0,1.6),8)

def animate():
    def ease(t):t=max(0,min(1,t));return t*t*(3-2*t)
    for obj in parts:
        rest=Vector(obj['rest_m']);delta=Vector(obj['explode_m']);group=int(obj['assembly'][:2]);phase=(group%5)*.15
        for frame in range(1,290,3):
            t=(frame-1)/24
            amount=ease((t-1.5-phase)/3.0) if t<6 else 1-ease((t-7+phase)/3.4)
            # Floating is a shared offset within each assembly. Endpoint poses are exact.
            float_delta=Vector((math.sin(t*PI/3+group)*.025,math.cos(t*PI/3+group)*.016,math.sin(t*PI/3)*.022))*amount
            obj.location=rest+delta*amount+float_delta;obj.keyframe_insert('location',frame=frame,group='Assembly story')
        for layer in obj.animation_data.action.layers:
            for strip in layer.strips:
                for bag in strip.channelbags:
                    for curve in bag.fcurves:
                        for key in curve.keyframe_points:key.interpolation='LINEAR'
    scene=bpy.context.scene
    for f,label in [(1,'ASSEMBLED'),(37,'OPEN'),(133,'FLOATING PARTS'),(169,'ASSEMBLE'),(253,'COMPLETE')]:scene.timeline_markers.new(label,frame=f)
    scene.frame_set(1)

def studio(kind):
    scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True
    try:
        prefs=bpy.context.preferences.addons['cycles'].preferences;prefs.compute_device_type='METAL';prefs.get_devices()
        for d in prefs.devices:d.use=d.type=='METAL'
        scene.cycles.device='GPU'
    except:pass
    if scene.world is None: scene.world=bpy.data.worlds.new('Studio ambient')
    scene.world.color=(.5,.5,.5)
    scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.72,.7,.66,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.28
    scene.render.resolution_x=1600;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
    scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast';scene.render.image_settings.file_format='PNG'
    scene.render.film_transparent=False
    floor=material('Studio / warm paper',(.86,.835,.8),0,.84)
    bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.2 if kind=='subaru' else -.75));ground=bpy.context.object;ground.name='STUDIO / floor';ground.data.materials.append(floor)
    scale=1 if kind=='subaru' else 2.2;target=Vector((0,0,1.2 if kind=='subaru' else 1.75))
    for name,loc,power,size in [('Key',(-3,-5,7),1400,5),('Fill',(1,4,5),950,5),('Rim',(4,-1,6),1800,4)]:
        data=bpy.data.lights.new('STUDIO / '+name,'AREA');data.energy=power*scale*scale;data.shape='DISK';data.size=size*scale
        ob=bpy.data.objects.new(data.name,data);scene.collection.objects.link(ob);ob.location=Vector(loc)*scale;ob.rotation_euler=(target-ob.location).to_track_quat('-Z','Y').to_euler()
    data=bpy.data.cameras.new('Assembly delivery camera');camera=bpy.data.objects.new('CAMERA / delivery',data);scene.collection.objects.link(camera)
    camera.location=Vector((-7,-8,5.2))*scale;camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler();data.type='ORTHO';data.ortho_scale=7.5 if kind=='subaru' else 17
    scene.camera=camera
    scene['description']='Illustrative transport assembly, not manufacturer CAD. Geometry, semantic components, portable materials and all animation tracks remain editable.'
    text=bpy.data.texts.new('START HERE');text.write(scene['description']+'\n12-second loop: assembled; separate; float; reassemble. Negative X is forward; metres, Z up.\n')

def deliver(kind,out):
    out=Path(out);out.mkdir(parents=True,exist_ok=True);scene=bpy.context.scene
    animate();studio(kind);scene.frame_set(1)
    bpy.ops.wm.save_as_mainfile(filepath=str(out/f'{kind}-assembly.blend'))
    bpy.ops.object.select_all(action='DESELECT')
    for o in parts:o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(out/f'{kind}-assembly.glb'),export_format='GLB',use_selection=True,export_apply=True,export_draco_mesh_compression_enable=True,export_draco_mesh_compression_level=6,export_animations=True,export_animation_mode='SCENE',export_anim_scene_split_object=False,export_frame_range=True,export_force_sampling=True,export_frame_step=3,export_extras=True,export_cameras=False,export_lights=False)
    for frame,name in [(1,'assembled'),(145,'exploded')]:
        scene.frame_set(frame);scene.render.filepath=str(out/f'{kind}-{name}.png');bpy.ops.render.render(write_still=True)
    bounds=[]
    for frame in [1,145,289]:
        scene.frame_set(frame);bounds.append({'frame':frame,'centres':{o.name:list(o.location) for o in parts}})
    record={'kind':kind,'objects':len(parts),'groups':list(groups),'duration_seconds':12,'animated_objects':sum(bool(o.animation_data) for o in parts),'loop_max_drift':max((Vector(bounds[0]['centres'][o.name])-Vector(bounds[2]['centres'][o.name])).length for o in parts),'description':scene['description']}
    (out/f'{kind}-verification.json').write_text(json.dumps(record,indent=2))
    print('TRANSPORT_READY',json.dumps(record),flush=True)

if __name__=='__main__':
    args=sys.argv[sys.argv.index('--')+1:];kind=args[0];out=args[1];setup()
    {'subaru':car,'boat':ship,'plane':aircraft}[kind]();deliver(kind,out)
