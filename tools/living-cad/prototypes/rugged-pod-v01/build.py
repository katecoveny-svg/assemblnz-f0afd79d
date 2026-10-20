"""Dayrally RP01: editable CadQuery B-rep prototypes, mm; never a product rating.
Run from any directory: python build.py. Originals and storefront are untouched.
"""
from pathlib import Path
import sys, json, math, hashlib
import cadquery as cq
import trimesh
import numpy as np
ROOT=Path(__file__).resolve().parent
sys.path.insert(0,str(ROOT.parents[1]/'cad'))
import lib, dayrally2 as legacy, dayrally_scoot as scoot
OUT=ROOT/'generated'
# Existing size family; H remains shell height, NOT old installed overall height.
SIZES=dict(legacy.SIZES)
WALL=2.6; FLOOR=3.2; SHELL_Z=27.0; LID_T=4.0
GASKET_W=1.6; GASKET_H=1.6; GROOVE_W=2.4; GROOVE_D=1.2
LIP_CLEARANCE=0.30; BOLT_R=1.75; NUT_AF=5.8

def stadium(L,W,z,h):
    return cq.Workplane('XY').workplane(offset=z).slot2D(L,W).extrude(h)
def rr(L,W,r,z,h):
    return cq.Workplane('XY').workplane(offset=z).rect(L,W).extrude(h).edges('|Z').fillet(r)
def box(L,W,z,h,x=0,y=0):
    return cq.Workplane('XY').workplane(offset=z).center(x,y).rect(L,W).extrude(h)
def cyl(r,z,h,x=0,y=0):
    return cq.Workplane('XY').workplane(offset=z).center(x,y).circle(r).extrude(h)
def ring(L,W,t,z,h):
    return stadium(L+t,W+t,z,h).cut(stadium(L-t,W-t,z-0.01,h+0.02))
def nut(z,h,x,y):
    return cq.Workplane('XY').workplane(offset=z).center(x,y).polygon(6,NUT_AF/math.cos(math.pi/6)).extrude(h)
def ears(L,W,z,h):
    b=None
    for x,y in positions(L,W):
        # Root reaches inside straight side wall by 2 mm.
        a=box(12,16,z,h,x,math.copysign(W/2+6,y))
        b=a if b is None else b.union(a)
    return b

def positions(L,W):
    return [(sx*(L-W)/2, sy*(W/2+8)) for sx in (-1,1) for sy in (-1,1)]

def turn_cut(x):
    # Same lib.py standard: 13 bore, 4 mm round-ended slots to r9.8;
    # countersink begins at z8.7 with r6.2; 45 degree slope.
    c=cyl(lib.BORE_R,7,7,x)
    c=c.union(cq.Workplane('XY').workplane(offset=7).center(x,0).slot2D(2*lib.SLOT_END,lib.SLOT_W,90).extrude(7))
    cone=cq.Solid.makeCone(6.2,11.5,5.3,cq.Vector(x,0,8.7))
    return c.union(cq.Workplane(obj=cone))

def ruler_cuts(length,z,x0,y):
    cuts=[]
    for i in range(length+1):
        tick=6 if i%10==0 else (4 if i%5==0 else 2)
        cuts.append(box(0.45,tick,z,0.7,x0+i,y+tick/2).val())
    for i in range(0,length+1,10):
        cuts.append(cq.Workplane('XY').workplane(offset=z).text(str(i),2.8,0.7,font='DejaVu Sans',combine=False).translate((x0+i,y+8,0)).val())
    return cq.Compound.makeCompound(cuts)

def make(size):
    L,W,H=SIZES[size]; z=SHELL_Z; top=z+H
    # Separate continuous storage shell; no fastener penetrates the cavity.
    body=stadium(L,W,z,H).faces('<Z').edges().fillet(1.2).cut(stadium(L-2*WALL,W-2*WALL,z+FLOOR,H+1))
    body=body.union(ring(L+0.4,W+0.4,5.6,top-3,3)) # outer L+6, inner L-5.2
    body=body.union(ears(L,W,z,6)).union(ears(L,W,top-6,6))
    for x,y in positions(L,W):
        for zz in (z,top-6):
            body=body.cut(cyl(BOLT_R,zz-0.1,6.2,x,y))
        # Carrier screws enter from below; nuts accessible above lower ears.
        body=body.cut(nut(z+3.4,2.7,x,y))
        # Lid screws enter from above; nuts accessible below upper ears.
        body=body.cut(nut(top-6.1,2.7,x,y))
    # Four internal floor ribs, rounded ends; no holes in floor.
    for x in (-12,-4,4,12):
        body=body.union(rr(2, W-2*WALL,0.8,z+FLOOR-0.1,1.5).translate((x,0,0)))
    # Reinforced external retrieval eye: 3.2 mm bore, 6 mm thickness.
    lug=cyl(6,z+3,6,L/2+3).union(box(10,12,z+3,6,L/2-1))
    lug=lug.cut(cyl(1.6,z+2.9,6.2,L/2+4))
    # Clip any root material out of the storage cavity, preserving floor.
    lug=lug.cut(stadium(L-2*WALL,W-2*WALL,z+FLOOR,H+1))
    body=body.union(lug)
    lid=stadium(L+6,W+6,top,LID_T).union(ears(L,W,top,LID_T))
    lid=lid.cut(ring(L,W,GROOVE_W,top-0.01,GROOVE_D+0.01))
    lipL=L-2*WALL-2*LIP_CLEARANCE; lipW=W-2*WALL-2*LIP_CLEARANCE
    lip=stadium(lipL,lipW,top-3,3.1).cut(stadium(lipL-3.2,lipW-3.2,top-3.1,3.3))
    lid=lid.union(lip)
    for x,y in positions(L,W): lid=lid.cut(cyl(BOLT_R,top-0.1,LID_T+0.2,x,y))
    # Ruler on centreline: curved ends prevent long straight edge scales.
    length={'mini':80,'standard':120,'tall':120,'long':170}[size]
    lid=lid.cut(ruler_cuts(length,top+LID_T-0.6,-length/2,-6))
    gasket=ring(L,W,GASKET_W,top-(GASKET_H-GROOVE_D),GASKET_H)
    # External carrier, exact TURN pattern, with accessible lower screw heads.
    carrier=rr(L+28,W+28,10,8,5)
    for x in (-lib.P/2,lib.P/2): carrier=carrier.cut(turn_cut(x))
    for x,y in positions(L,W):
        carrier=carrier.union(cyl(5,12.9,SHELL_Z-12.9,x,y))
        carrier=carrier.cut(cyl(BOLT_R,7.9,SHELL_Z-7.8,x,y))
        carrier=carrier.cut(cyl(3.3,7.9,3.6,x,y)) # recessed socket head; no protrusion into mount
    # Removable floor spacer retains foam below cargo; open lattice is not a seal.
    innerL=L-2*WALL-1; innerW=W-2*WALL-1
    deck=stadium(innerL,innerW,z+FLOOR+6,1.6)
    for xx in range(-int((L-W)/2),int((L-W)/2)+1,12):
        deck=deck.cut(box(6,innerW-12,z+FLOOR+5.9,1.8,xx))
    for x in (-15,15):
        for y in (-innerW/2+3,innerW/2-3):
            deck=deck.union(cyl(2,z+FLOOR,6.1,x,y))
    return dict(shell=body,lid=lid,gasket=gasket,carrier=carrier,foam_deck=deck)

def mesh(shape):
    vs,fs=shape.val().tessellate(0.03,0.08)
    return trimesh.Trimesh(np.array([v.toTuple() for v in vs]),np.array(fs),process=True)
def as_man(shape):
    m=mesh(shape)
    return lib.M(lib.m3d.Mesh(np.asarray(m.vertices,dtype=np.float32),np.asarray(m.faces,dtype=np.uint32)))
def overlap(a,b):
    return max(0,a.intersect(b).val().Volume()) if a.intersect(b).vals() else 0.0

def export(name,part,flip=False):
    assert part.val().isValid(),name+' B-rep invalid'
    assert len(part.solids().vals())==1,name+' not one solid'
    cq.exporters.export(part,str(OUT/'step'/f'{name}.step'))
    p=part.rotate((0,0,0),(1,0,0),180) if flip else part
    bb=p.val().BoundingBox(); p=p.translate((0,0,-bb.zmin))
    cq.exporters.export(p,str(OUT/'stl'/f'{name}.stl'),tolerance=0.03,angularTolerance=0.08)
    tm=trimesh.load(OUT/'stl'/f'{name}.stl',force='mesh')
    assert tm.is_watertight and tm.is_winding_consistent and len(tm.split())==1,name+' mesh invalid'
    assert max(tm.extents)<250,name+' bed envelope'
    return dict(volume_mm3=round(part.val().Volume(),2),bounds_mm=tm.extents.round(3).tolist(),mesh_closed=True,single_solid=True)

def build():
    for d in ('step','stl'): (OUT/d).mkdir(parents=True,exist_ok=True)
    report={'status':'digital geometry only; no physical testing','parameters':dict(wall=WALL,floor=FLOOR,groove_width=GROOVE_W,groove_depth=GROOVE_D,gasket_width=GASKET_W,gasket_height=GASKET_H,nominal_squeeze_percent=25,lip_side_clearance=LIP_CLEARANCE),'sizes':{}}
    for size in SIZES:
        print('Building',size,flush=True)
        parts=make(size); L,W,H=SIZES[size]; top=SHELL_Z+H
        row={'parts':{k:export(f'{size}-{k}',p,k=='lid') for k,p in parts.items()}}
        assembly=cq.Assembly(name=f'RP01-{size}')
        for k,p in parts.items(): assembly.add(p,name=k)
        assembly.save(str(OUT/'step'/f'{size}-assembly.step'))
        row['checks_mm3']={}
        # Nominal purchased hardware gauges; actual supplier dimensions need checking.
        for x,y in positions(L,W):
            lower=cyl(1.5,11.5,25,x,y).union(cyl(2.75,8.5,3,x,y))
            upper=cyl(1.5,top-7.5,12,x,y).union(cyl(3,top+4.5,3,x,y))
            for label,hw in [('carrier_screw',lower),('lid_screw',upper)]:
                v=sum(overlap(hw,parts[k]) for k in ('shell','lid','carrier'))
                assert v<1e-4,(size,label,x,y,v)
                row['checks_mm3'][f'{label}_{x}_{y}']=round(v,6)

        for a,b in [('shell','lid'),('shell','carrier'),('lid','carrier'),('foam_deck','shell'),('foam_deck','lid'),('gasket','lid')]:
            v=overlap(parts[a],parts[b]); row['checks_mm3'][a+'__'+b]=round(v,6); assert v<1e-4,(size,a,b,v)
        # Free gasket intentionally intrudes 0.4 mm into rim; deformation not simulated.
        row['gasket_free_vs_rim_mm3']=round(overlap(parts['gasket'],parts['shell']),3)
        assert row['gasket_free_vs_rim_mm3']>1
        # Compressed envelope expands width to conserve cross-section area.
        compressed=ring(L,W,GASKET_W*GASKET_H/GROOVE_D,top,GROOVE_D)
        row['compressed_gasket_vs_lid_mm3']=round(overlap(compressed,parts['lid']),6)
        assert row['compressed_gasket_vs_lid_mm3']<1e-4
        # Real existing key/mount mesh tested against new B-rep tessellation.
        car=as_man(parts['carrier']); sh=as_man(parts['shell'])
        key=lib.turn_key()
        row['turn']={}
        for x in (-21,21):
            for angle in (0,15,30,45,60,75,90):
                k=key.rotate([0,0,angle]).translate([x,0,0])
                v=(car^k).volume(); sv=(sh^k).volume()
                row['turn'][f'x{x}_angle{angle}']={'carrier_overlap_mm3':round(v,4),'shell_overlap_mm3':round(sv,4)}
                # Inherited 0.10 mm cone clamp is deliberate, bounded, not zero-clearance.
                assert v<30 and sv<0.001,(size,x,angle,v,sv)
        row['turn_insertion']={}
        for x in (-21,21):
            for dz in (8,4,2,0.5):
                k=key.rotate([0,0,90]).translate([x,0,dz])
                v=(car^k).volume()
                row['turn_insertion'][f'x{x}_raise{dz}']=round(v,6)
                assert v<0.001,(size,'preinsert',x,dz,v)
        old=legacy.pod_base(size)
        old_clamp=sum((old^key.translate([x,0,0])).volume() for x in (-21,21))
        new_clamp=sum((car^key.translate([x,0,0])).volume() for x in (-21,21))
        row['turn_clamp_comparison_mm3']={'old':round(old_clamp,4),'new':round(new_clamp,4)}
        assert abs(new_clamp-old_clamp)<1.0,(size,'clamp drift',old_clamp,new_clamp)
        row['mount_overlap_mm3']={}
        for name,mount in [('scooter',scoot.stem_saddle()),('frame',legacy.frame_saddle()),('bar',legacy.bar_saddle())]:
            v=(car^mount).volume()+(sh^mount).volume()
            row['mount_overlap_mm3'][name]=round(v,5); assert v<0.001
        # Full floor still present after all operations.
        floor_gauge=stadium(L-2*WALL-0.1,W-2*WALL-0.1,SHELL_Z+0.1,FLOOR-0.2)
        missing=floor_gauge.cut(parts['shell']).val().Volume()
        row['missing_floor_mm3']=round(missing,6); assert missing<1e-4
        row['closed_shell_envelope_mm']=[L+6,W+6,H+LID_T]
        # Ideal sealed simple stadium at original footprint; NOT total assembly buoyancy or payload rating.
        row['sealed_body_reference_displacement_g']=round(((L-W)*W+math.pi*(W/2)**2)*(H+LID_T)/1000,1)
        row['solid_petg_mass_g_at_1p27']=round(sum(parts[k].val().Volume() for k in ('shell','lid','carrier','foam_deck'))/1000*1.27,1)
        report['sizes'][size]=row
    # Independent 150 mm ruler: extra margins, usable marked range is 0..150.
    ruler=rr(156,14,1,0,2).cut(ruler_cuts(150,1.4,-75,-5))
    report['ruler150']=export('ruler-150',ruler)
    (OUT/'validation.json').write_text(json.dumps(report,indent=2)+'\n')
    print('PASS: all sizes and ruler exported',flush=True)
if __name__=='__main__': build()
