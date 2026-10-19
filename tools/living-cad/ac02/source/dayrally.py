"""DAYRALLY fixed-size sample kit. Printed case, lid, handle, pins, tray and useful inserts.
No fishing hooks, line, magnets or metal components are claimed to be printable.
"""
from common import *

HY,HZ=55.0,39.

def case():
    s=tray(160,96,40,2.6,2.6,12)
    ears=[cyl(5.4,18,(x,HY,HZ),(1,0,0)) for x in(-67,49)]
    s=union(s,*ears,*[box(18,9,7,(x,50.5,32)) for x in(-58,58)],box(20,4,3,(0,-49,32)))
    return cut(s,cyl(1.95,140,(-70,HY,HZ),(1,0,0)))

def lid():
    top=rr(160,96,4,12,40.5)
    skirt=cut(rr(153.8,89.8,5.1,8.9,35.45),rr(150.2,86.2,7,7.1,34.9))
    central=cyl(5.4,92,(-46,HY,HZ),(1,0,0))
    brace=box(92,12,4,(0,50,40.5))
    # Fully printed cantilever catch. It has clearance when closed but deliberate undercut on lift.
    latch=union(box(20,8.4,4,(0,-49.2,40.5)),box(20,2,10.4,(0,-52.4,30.3)),box(20,5.2,1.2,(0,-50.8,30.3)))
    fixed=[]
    for x in(-62,56):fixed +=[cyl(5,6,(x,0,49.5),(1,0,0)),box(6,9,6,(x+3,0,44))]
    s=union(top,skirt,central,brace,latch,*fixed)
    s=cut(s,cyl(1.95,99,(-49,HY,HZ),(1,0,0)),cyl(1.95,132,(-66,0,49.5),(1,0,0)))
    return engraved(s,'DAYRALLY',13,.8,(0,-17,43.75),108)

def handle():
    pts=[(-54,49.5),(-54,78),(54,78),(54,49.5),(48,49.5),(48,71.5),(-48,71.5),(-48,49.5)]
    sh=poly_xz(pts,6,0)
    sh=union(sh,cyl(4.7,6,(-54,0,49.5),(1,0,0)),cyl(4.7,6,(48,0,49.5),(1,0,0)))
    return cut(sh,cyl(1.95,115,(-57,0,49.5),(1,0,0)))

def insert():
    s=tray(147,83,25,2.4,2.4,8)
    s=union(s,box(2.0,78.4,20,(-6,0,2.35)),box(77.0,1.8,20,(32.1,0,2.35)))
    # Access scoops in side walls are deliberate, not an enclosure for loose hooks.
    for x in(-73.5,73.5):s=cut(s,cyl(7,7,(x,0,20)))
    return s

def linecard():
    s=rr(63,25,2.8,5)
    for x in(-24,-8,8,24):
        for y in(-12.5,12.5):s=cut(s,cyl(1.5,5,(x,y,-1)))
    return s

def folding_rule(index):
    s=rr(100,26,4,5).translate((50,0,0))
    if index<2:s=union(s,cyl(6,4,(100,0,0)))
    if index>0:s=union(s,cyl(6,4,(0,0,0)))
    bores=[]
    if index<2:bores += [cyl(1.9,6,(100,0,-1)),cyl(3.4,3.4,(100,0,-.1))]
    if index>0:bores += [cyl(1.9,6,(0,0,-1)),cyl(3.4,2.0,(0,0,2.2))]
    s=cut(s,*bores) if bores else s
    marks=[]
    for i in range(0,101):
        if i==0 and index==0:continue
        h=6.8 if i%10==0 else 4.5 if i%5==0 else 2.5
        marks.append(box(.6,h,.6,(i,-13+h/2,3.5)))
    s=cut(s,*marks)
    for i in(20,40,60,80):s=engraved(s,str(index*100+i),3.6,.4,(i,6,3.65),13)
    return s

def main():
    b=Build('dayrally')
    ca,li,ha,ins=case(),lid(),handle(),insert()
    b.add('rally-case',ca,'Rounded 160 x 96 mm storage case with hinge ears',notes='Fixed-size sample. Open case is printable upright; hinge tunnels may need support/reaming. Not sealed or load-rated.')
    b.add('rally-lid',li,'Printed lid, skirt, hinge and integrated flex catch',rotate=(180,0,0),notes='Real hinge and latch geometry. Snap deflection, fatigue and closure need sample testing. Support around hinge ears; no waterproof claim.')
    b.add('rally-folding-handle',ha,'Folding U handle with two pin eyes',rotate=(90,0,0),notes='Handle is a separate solid, not a flexible rendering. No lifting rating.')
    hinge=union(cyl(3.3,1.8,(-69.3,0,0),(1,0,0)),cyl(1.65,137,(-67.6,0,0),(1,0,0)))
    b.add('rally-hinge-pin',hinge,'Long removable printed case-hinge pin',rotate=(0,-90,0),notes='Print as a slender upright pin with brim or on its side with support. Test actual pin/hole clearances.')
    short=union(cyl(3.2,1.7,(-1.7,0,0),(1,0,0)),cyl(1.65,16.7,(-.05,0,0),(1,0,0)))
    b.add('rally-handle-pin',short,'Printed handle-pivot pin',rotate=(0,-90,0),notes='Two pins and caps; no load rating.')
    cap=cut(cyl(3.2,3.2,(0,0,0),(1,0,0)),cyl(1.7,4,(-.4,0,0),(1,0,0)),box(5,2,1.0,(1.6,2.9,-.5)))
    b.add('rally-pin-cap',cap,'Slit printed retaining-cap prototype',rotate=(0,-90,0),notes='3.4 mm bore / 3.3 mm pin. Nominal loose/slit fit may not retain: tune physical sample. All-printed retention is not yet approved.')
    b.add('rally-removable-tray',ins,'Removable spool bay and two leader/tackle bays',notes='147 x 83 x 25 mm. Compartments do not make sharp hooks safe; use appropriate hook guards.')
    b.add('rally-leader-card',linecard(),'Notched reusable leader-winding card',notes='No line or hook included. File sharp printing edges smooth before winding fine line.')
    spool=union(cyl(29,2.8),cyl(13,14.4,(0,0,2.7)),cyl(29,2.8,(0,0,17)))
    spool=cut(spool,cyl(3.2,22,(0,0,-1)))
    b.add('rally-line-spool',spool,'Plain handline / spare-line spool',notes='No gear reduction, drag or casting mechanism. Top flange needs support in the chosen orientation. Fishing line is a separate product.')
    b.add('rally-name-skin',engraved(rr(98,24,2.6,8),LABELS['name'],10,.7,(0,0,1.95),80),'Optional personalised loose name panel',material='Matte PLA candidate',notes='No claimed snap connection to case. A skin interface remains a separate development item; this supplied panel is a sample badge.')
    for i in range(3):b.add(f'rally-rule-link-{i+1}',folding_rule(i),f'100 mm interval rule link {i+1}',notes='Three sequential links form nominal 0–300 mm scale. Printed marks must be calibrated. Hinges do not lock straight; align against a straightedge. Not approved for regulatory fish sizing.')
    rulepin=pin(3.2,8.9,6.5,1.6)
    b.add('rally-rule-pin',rulepin,'Printed folding-rule pivot',notes='Pivot axes spaced exactly 100 mm in the CAD. Retention and planar alignment require a printed test.')
    cal=engraved(box(100,15,4),'100 mm',5,.5,(0,0,3.55),75)
    b.add('calibration-100mm',cal,'Independent 100 mm calibration bar',material='Same material and process as intended ruler',notes='Measure end-to-end after cooling. It is a shrinkage coupon, not a certified calibration instrument.')
    comps=[('rally-case','tomato',(0,0,0),(0,0,0)),('rally-lid','butter',(0,0,0),(0,0,0)),('rally-folding-handle','tomato',(0,0,0),(0,0,0)),('rally-removable-tray','chalk',(0,0,3),(0,0,0)),('rally-hinge-pin','ink',(0,HY,HZ),(0,0,0)),('rally-pin-cap','tomato',(67.4,HY,HZ),(0,0,0))]
    for x,r in((-62,(0,0,0)),(62,(0,0,180))):comps.append(('rally-handle-pin','ink',(x,0,49.5),r))
    comps += [('rally-pin-cap','tomato',(-47.8,0,49.5),(0,0,0)),('rally-pin-cap','tomato',(47.8,0,49.5),(0,0,180))]
    b.asm('dayrally-case-closed',comps,'All-printed Dayrally sample case, lid and folding handle','Designed as separate print-and-assemble components. Fastener retention, latch stiffness and carrying capacity untested.')
    # Actual hinge-axis transform opens the lid; the case itself is not deformed.
    angle=-110
    def hinge_open(shape):return shape.rotate((0,HY,HZ),(1,HY,HZ),angle)
    # Add uniquely named open assembly solids to the assembly dictionary without exporting duplicate print parts.
    # Build.asm works from original parts with explicit global transforms below.
    th=math.radians(angle);R=np.array([[1,0,0],[0,math.cos(th),-math.sin(th)],[0,math.sin(th),math.cos(th)]])
    pivot=np.array([0,HY,HZ]);T=tuple(pivot-R@pivot)
    op=[c for c in comps if c[0] not in('rally-lid','rally-folding-handle','rally-handle-pin') and not (c[0]=='rally-pin-cap' and c[2][1]==0)]
    op += [('rally-lid','butter',T,(angle,0,0)),('rally-folding-handle','tomato',T,(angle,0,0)),('rally-line-spool','tomato',(-38,0,5.6),(0,0,0)),('rally-leader-card','butter',(31,-20,5.6),(0,0,0))]
    b.asm('dayrally-case-open',op,'Dayrally case opened around its modelled hinge axis','Shown open without the small handle pins; printable pin files remain supplied.')
    rulecomps=[(f'rally-rule-link-{i+1}',('chalk','butter','chalk')[i],(100*i,0,4.4*i),(0,0,0)) for i in range(3)]
    for j in (0,1):
        rulecomps += [('rally-rule-pin','plum',(100*(j+1),0,8.2+4.4*j),(180,0,0)),('rally-pin-cap','plum',(100*(j+1),0,.1+4.4*j),(0,-90,0))]
    b.asm('rally-rule-300mm',rulecomps,'Nominal 300 mm folding-rule geometry','Deployed layout only; no automatic registration from an ordinary photo. Check graduations and straightness against a known reference.')
    b.overlap('case vs closed lid',ca,li)
    b.overlap('case cavity vs removable tray',ca,ins.translate((0,0,3)))
    b.overlap('lid vs handle at upright position',li,ha)
    b.overlap('case hinge bore vs shaft',ca,hinge.translate((0,HY,HZ)))
    b.overlap('open lid vs case',ca,hinge_open(li))
    b.finish()
if __name__=='__main__':main()
