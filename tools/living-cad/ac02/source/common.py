"""Assembl CAD v0.2. Millimetres; native OpenCascade solids via CadQuery.
No font files or third-party model meshes are embedded in the new CAD source.
"""
from __future__ import annotations
import cadquery as cq
import numpy as np
import trimesh, math, json, hashlib, os, time
from pathlib import Path
from functools import lru_cache
ROOT=Path(os.environ.get('ASSEMBL_OUTPUT',Path(__file__).resolve().parent.parent))
for d in ('parts/step','parts/stl','assemblies/step','assemblies/glb','validation','previews'):(ROOT/d).mkdir(parents=True,exist_ok=True)
LABELS={'name':os.environ.get('ASSEMBL_NAME','JACK'),'pet_name':os.environ.get('ASSEMBL_PET_NAME','FRANKLIN'),'wall_label':os.environ.get('ASSEMBL_WALL_LABEL','ASSEMBL')}
for key,value in LABELS.items():
    if not value.strip() or len(value)>14 or any(ord(c)<32 for c in value):raise ValueError(f'{key} must be 1–14 printable characters')
COLORS={'chalk':'#F5F1EA','oat':'#D4C5AD','rose':'#B58B99','plum':'#54334B','ink':'#36383C','sage':'#8D9D84','tomato':'#E95037','butter':'#EFCF6B','teal':'#70AFAC','silver':'#A5A6A5'}

def box(w,d,h,c=(0,0,0)):
    return cq.Solid.makeBox(float(w),float(d),float(h),cq.Vector(c[0]-w/2,c[1]-d/2,c[2]))

def rr(w,d,h,r=3,z=0):
    assert w>2*r and d>2*r and h>0
    a,b=w/2,d/2;q=r/math.sqrt(2)
    p=cq.Workplane('XY').moveTo(-a+r,-b).lineTo(a-r,-b).threePointArc((a-r+q,-b+r-q),(a,-b+r)).lineTo(a,b-r).threePointArc((a-r+q,b-r+q),(a-r,b)).lineTo(-a+r,b).threePointArc((-a+r-q,b-r+q),(-a,b-r)).lineTo(-a,-b+r).threePointArc((-a+r-q,-b+r-q),(-a+r,-b)).close().extrude(h).val()
    return p.translate((0,0,z)) if z else p

def cyl(r,h,p=(0,0,0),d=(0,0,1)):
    return cq.Solid.makeCylinder(float(r),float(h),cq.Vector(*p),cq.Vector(*d))

def cone(r1,r2,h,p=(0,0,0),d=(0,0,1)):
    return cq.Solid.makeCone(float(r1),float(r2),float(h),cq.Vector(*p),cq.Vector(*d))

def union(*sh):
    sh=[s for s in sh if s is not None]
    return sh[0].fuse(*sh[1:]).clean() if len(sh)>1 else sh[0]

def cut(a,*b):return a.cut(*b).clean()

def poly_xy(pts,h,z=0):return cq.Workplane('XY').polyline(pts).close().extrude(h).val().translate((0,0,z))
def poly_yz(pts,length,x=0):return cq.Workplane('YZ').polyline(pts).close().extrude(length).val().translate((x,0,0))
def poly_xz(pts,thick,y=0):
    # XZ workplane normal is -Y; positive extrude goes into -Y.
    return cq.Workplane('XZ').polyline(pts).close().extrude(thick).val().translate((0,y+thick/2,0))
def tube_between(a,b,r,rounded=False):
    a=np.array(a,float);b=np.array(b,float);v=b-a;l=float(np.linalg.norm(v))
    s=cyl(r,l,tuple(a),tuple(v/l))
    if rounded:s=union(s,cq.Solid.makeSphere(r,cq.Vector(*a)),cq.Solid.makeSphere(r,cq.Vector(*b)))
    return s

def place(s,r=(0,0,0),t=(0,0,0)):
    for axis,angle in zip(((1,0,0),(0,1,0),(0,0,1)),r):
        if angle:s=s.rotate((0,0,0),axis,float(angle))
    return s.translate(tuple(float(v) for v in t))

def letters(text,size=8,depth=.65,maxwidth=100):
    if not text or len(text)>28:raise ValueError('Use 1–28 characters')
    s=cq.Workplane('XY').text(text,size,depth,font='DejaVu Sans',kind='bold',halign='center',valign='center',combine=False).val()
    if s.BoundingBox().xlen>maxwidth:s=s.scale(maxwidth/s.BoundingBox().xlen)
    return s

def engraved(body,text,size=8,depth=.6,at=(0,0,0),maxwidth=100):
    return cut(body,letters(text,size,depth+.1,maxwidth).translate(at))

def tray(w,d,h,wall=2.4,floor=2.4,r=8):
    assert w>2*wall+2 and d>2*wall+2 and h>floor
    return cut(rr(w,d,h,r),rr(w-2*wall,d-2*wall,h+1,max(.8,r-wall),floor))

def mesh(s):
    v,f=s.tessellate(.09,.14)
    m=trimesh.Trimesh(vertices=np.array([[p.x,p.y,p.z] for p in v]),faces=np.array(f),process=True)
    m.merge_vertices(digits_vertex=7);m.update_faces(m.nondegenerate_faces());m.update_faces(m.unique_faces());m.remove_unreferenced_vertices();return m

def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def norm(s):
    b=s.BoundingBox();off=(-.5*(b.xmin+b.xmax),-.5*(b.ymin+b.ymax),-b.zmin)
    return s.translate(off),off

def pin(diameter,length,head=7,head_h=1.8):
    # Shaft along +Z from z=0, head at its bottom. A separate cap may be specified.
    return union(cyl(head/2,head_h),cyl(diameter/2,length+.05,(0,0,head_h-.05)))

class Build:
    def __init__(self,group):self.group=group;self.parts={};self.assemblies=[];self.checks=[]
    def add(self,id,s,description,material='PETG candidate',rotate=(0,0,0),notes='',params=None,expect_solids=1):
        if id in self.parts:raise ValueError(id)
        if not s.isValid():raise RuntimeError(f'Invalid BREP: {id}')
        s=s.clean();n=len(s.Solids())
        if n!=expect_solids:raise RuntimeError(f'{id}: expected {expect_solids} solid, got {n}')
        p,off=norm(place(s,rotate));b=p.BoundingBox()
        if max(b.xlen,b.ylen,b.zlen)>250.001:raise RuntimeError(f'{id} does not fit 250 mm envelope')
        sp=ROOT/'parts/step'/f'{id}.step';st=ROOT/'parts/stl'/f'{id}.stl'
        cq.exporters.export(p,str(sp));m=mesh(p)
        if not m.is_watertight or not m.is_winding_consistent:raise RuntimeError(f'Nonwatertight mesh: {id}')
        m.export(st)
        imported=cq.importers.importStep(str(sp)).val()
        imp_solids=len(imported.Solids());valid=imported.isValid()
        dv=abs(imported.Volume()-p.Volume())/max(1,p.Volume())
        if not valid or imp_solids!=n or dv>1e-6:raise RuntimeError(f'STEP readback failed: {id}')
        rec={'id':id,'group':self.group,'description':description,'revision':'AC-02','release':'digital_prototype','approved_for_manufacture':False,'material_candidate':material,'units':'mm','print_bbox_mm':[round(b.xlen,3),round(b.ylen,3),round(b.zlen,3)],'solid_volume_mm3':round(p.Volume(),3),'solid_count':n,'step_readback_valid':valid,'step_readback_volume_relative_error':dv,'mesh_watertight':bool(m.is_watertight),'mesh_winding_consistent':bool(m.is_winding_consistent),'mesh_connected_components':len(m.split(only_watertight=False)),'triangle_count':len(m.faces),'step':str(sp.relative_to(ROOT)),'stl':str(st.relative_to(ROOT)),'step_sha256':sha(sp),'stl_sha256':sha(st),'print_rotation_xyz_deg':list(rotate),'print_translation_mm':list(off),'notes':notes,'parameters':params or {}}
        self.parts[id]={'shape':s,'record':rec}
        print(f'{id:32s} {rec["print_bbox_mm"]} solids={n} faces={len(m.faces)}',flush=True)
        return id
    def asm(self,id,components,description,notes='',explode=1):
        # components: (part id, colour name, xyz translation, xyz rotations [, label])
        ass=cq.Assembly(name=id);scene=trimesh.Scene();records=[]
        for i,c in enumerate(components):
            pid,color,t,r=c[:4];label=c[4] if len(c)>4 else f'{pid}__{i+1}'
            sh=place(self.parts[pid]['shape'],r,t);hx=COLORS.get(color,color);rgb=tuple(int(hx[k:k+2],16)/255 for k in (1,3,5))
            ass.add(sh,name=label,color=cq.Color(*rgb));m=mesh(sh);m.apply_scale(.001)
            m.visual=trimesh.visual.TextureVisuals(material=trimesh.visual.material.PBRMaterial(baseColorFactor=[int(v*255) for v in rgb]+[255],metallicFactor=0,roughnessFactor=.65))
            scene.add_geometry(m,node_name=label,geom_name=label)
            records.append({'part_id':pid,'instance':label,'colour':hx,'translation_mm':list(t),'rotation_xyz_deg':list(r)})
        path=ROOT/'assemblies/step'/f'{id}.step';ass.export(str(path))
        scene.export(str(ROOT/'assemblies/glb'/f'{id}.glb'))
        bounds=scene.bounds*1000;rec={'id':id,'description':description,'notes':notes,'components':records,'bounds_mm':bounds.tolist(),'part_instances':len(records),'step':f'assemblies/step/{id}.step','glb':f'assemblies/glb/{id}.glb','glb_units':'metres','revision':'AC-02','release':'digital_prototype','approved_for_manufacture':False}
        self.assemblies.append(rec);print('ASSEMBLY',id,len(records),flush=True)
    def overlap(self,name,a,b,limit=.001,interpretation='Nominal geometric clearance only'):
        try:v=a.intersect(b).Volume()
        except Exception as e:
            self.checks.append({'name':name,'passed':False,'error':str(e)});return None
        rec={'name':name,'intersection_volume_mm3':round(v,6),'limit_mm3':limit,'passed':v<=limit,'interpretation':interpretation}
        self.checks.append(rec);print('CHECK',rec,flush=True);return v
    def finish(self):
        (ROOT/'validation'/f'{self.group}.json').write_text(json.dumps({'group':self.group,'cadquery_version':cq.__version__,'parts':[v['record'] for v in self.parts.values()],'assemblies':self.assemblies,'checks':self.checks},indent=2))
