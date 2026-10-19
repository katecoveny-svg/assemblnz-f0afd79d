"""All-printed flat-pack small shelving and modular outfit-valet studies.
Not full wardrobes, seats, climbing structures or load-rated furniture.
"""
from common import *

def side_frame():
    s=place(rr(132,190,8,18),(90,0,90),(0,0,95))
    # Native extruded frame plane YZ; establish exact box-like outer coordinates.
    s=poly_yz([(-66,0),(66,0),(66,177),(58,190),(-58,190),(-66,177)],8,0)
    openings=[poly_yz([(-53,z0),(53,z0),(53,z1),(-53,z1)],10,-1) for z0,z1 in ((33,86),(106,159))]
    s=cut(s,*openings)
    for level in(23,96,169):
        # Insert from inner side. 0.3 mm nominal floor/ceiling and .6 mm lateral clearance.
        s=cut(s,box(6.4,120,5.8,(2.2,0,level)))
        for y in(-43,43):s=cut(s,cyl(1.8,42,(2.8,y,level-10)))
    return s

def shelf_panel():
    s=rr(225.6,118,5.2,4)
    # Extra central ribs end before the pockets in side frames.
    ribs=[box(207,3.2,6,(0,y,-5.95)) for y in(-42,0,42)]
    s=union(s,*ribs)
    holes=[cyl(1.8,16,(x,y,-7)) for x in(-110.8,110.8) for y in(-43,43)]
    return cut(s,*holes)

def column(length=160):
    s=rr(34,34,length,5)
    s=cut(s,rr(24,24,length+2,3,-1),rr(26.6,26.6,31,3,-1),rr(26.6,26.6,31,3,length-30))
    for z in(15,length-15):s=cut(s,cyl(2.2,40,(-20,0,z),(1,0,0)))
    return s

def joiner():
    s=cut(rr(26,26,60,2.7),rr(18,18,62,1.5,-1))
    s=union(s,cut(rr(34,34,2,4,29),rr(18,18,4,1.5,28)))
    for z in(14,46):s=cut(s,cyl(2.2,32,(-16,0,z),(1,0,0)))
    return s

def main():
    b=Build('storage')
    s=side_frame();panel=shelf_panel()
    b.add('shelf-side-frame',s,'Flat-pack side frame for three small shelves',rotate=(0,-90,0),notes='Print flat on side. Small storage prototype only; assembled stability, long-term deflection, shelf retention and loads untested.')
    b.add('shelf-panel',panel,'Ribbed 225.6 x 118 mm shelf panel',rotate=(180,0,0),notes='Place broad face on build plate. Integrated underside ribs are not evidence of a particular load capacity.')
    p=pin(3.1,13,6,1.8)
    b.add('shelf-lock-pin',p,'Headed side-frame/shelf alignment pin',notes='Friction retention requires testing. These are not safety-rated fasteners.')
    b.add('shelf-lock-pin-long',pin(3.1,28,6,1.8),'Long headed top-shelf pin',notes='For the deeper top crossbar only. Sample retention required.')
    comps=[('shelf-side-frame','oat',(108,0,0),(0,0,0)),('shelf-side-frame','oat',(-108,0,0),(0,0,180))]
    for z in(23.3,96.3,169.3):
        comps.append(('shelf-panel','chalk',(0,0,z),(0,0,0)))
        for x in(-110.8,110.8):
            for y in(-43,43):comps.append(('shelf-lock-pin-long' if z>160 else 'shelf-lock-pin','rose',(x,y,192 if z>160 else 108 if z>90 else 35),(180,0,0)))
    b.asm('small-flatpack-shelf',comps,'Small all-printed three-tier shelf','Approximate outer size 232 x 132 x 190 mm. Assembly is not a full-size wardrobe or furniture safety approval.')
    b.overlap('right side-frame vs top panel',s.translate((108,0,0)),panel.translate((0,0,169.3)))
    b.overlap('left side-frame vs top panel',place(s,(0,0,180),(-108,0,0)),panel.translate((0,0,169.3)))
    # A hollow printed column and overlap sleeve, not timber disguised as filament.
    col=column();jo=joiner()
    b.add('valet-column-160',col,'160 mm hollow square column segment',notes='Socket ends are 26.6 mm; sleeve 26 mm. This is a segmented polymer beam, not wood or continuous-fibre reinforcement.')
    b.add('valet-column-joiner',jo,'Two-ended column sleeve with 2 mm spacing shoulder',notes='Alignment and transfer of load require physical validation. Pin bores align at 15 mm from each column end.')
    b.add('valet-joint-pin',pin(3.8,35,8,2),'Printed column cross pin',notes='3.8 mm pin in 4.4 mm bore, with a separate cap for retention.')
    b.add('valet-joint-cap',cut(cyl(4.4,4),cyl(2.0,6,(0,0,-1))),'Loose push cap for a column joint pin',notes='Tune fit by sample. No rated structural retention.')
    # Broad cross base, each foot slot faces outward. Four identical detachable legs.
    hub=cut(rr(78,78,36,14),rr(34.6,34.6,33,5.3,4))
    for a in(0,90,180,270):hub=cut(hub,place(box(20,20.6,14.6,(30.7,0,3)),(0,0,a)))
    b.add('valet-base-hub',hub,'Four-arm base hub with column socket',notes='No floor anchorage is included. Tall assembly requires overturning and fatigue testing before use.')
    leg=union(rr(168,30,17,10).translate((102,0,0)),box(18.1,20,14,(9.05,0,3.2)))
    b.add('valet-base-leg',leg,'Detachable outward base leg with rectangular tenon',notes='Four identical parts. Tapers are deliberately kept flat for printing; nominal .3 mm socket clearance.')
    # Original asymmetric end-of-day valet arms, not the pictured hanger reproduction.
    hubtop=union(rr(48,36,27,7),rr(26,26,28,2.7,-27.9))
    for a in(0,180):hubtop=cut(hubtop,place(box(29,18.6,14.6,(21,0,7)),(0,0,a)))
    b.add('valet-shoulder-hub',hubtop,'Top collar and twin arm sockets',notes='Fit/top stability prototype; not a hanger capacity certification.')
    arm=poly_xz([(0,7.3),(31,7.3),(58,-1),(152,-31),(166,-29),(168,-20),(60,18),(31,21.3),(0,21.3)],18,0)
    # arm tongue is exactly 18 x 14 x 31; bulk starts beyond connector mouth.
    b.add('valet-shoulder-arm',arm,'Detachable gently sloping valet shoulder arm',rotate=(90,0,0),notes='Two mirrored pieces for outfit laydown. Original silhouette; no timber parts. Do not use prior to load/tipping assessment.')
    dish=union(tray(112,92,18,2.4,2.4,12).translate((0,0,0)),cut(rr(44,44,24,8,-12),rr(34.8,34.8,26,5.4,-13)))
    # Tray should have open collar through floor to allow sliding down a column.
    dish=cut(dish,rr(34.8,34.8,40,5.4,-13))
    b.add('valet-pocket-tray',dish,'Square-column slide-on catchall tray',notes='Collar requires a separate stop sleeve. It is not a pressure clamp.')
    stop=cut(rr(43,43,8,7),rr(34.6,34.6,10,5.3,-1))
    stop=cut(stop,cyl(2.2,48,(-24,0,4),(1,0,0)))
    b.add('valet-tray-stop',stop,'Cross-pinned catchall tray stop collar',notes='Requires a matching 4.4 mm column hole; only the existing segment-end holes are currently provided.')
    b.overlap('column sleeve into upper end',jo.translate((0,0,131)),col)
    b.overlap('column sleeve into next segment',jo.translate((0,0,131)),col.translate((0,0,162)))
    # Maximum research assembly supplied digitally, but expressly not cleared for use with clothing.
    for n,label in((1,'tabletop-valet'),(5,'outfit-valet-research')):
        c=[('valet-base-hub','chalk',(0,0,0),(0,0,0))]
        for a in(0,90,180,270):c.append(('valet-base-leg','oat',(21*math.cos(math.radians(a)),21*math.sin(math.radians(a)),0),(0,0,a)))
        for i in range(n):
            c.append(('valet-column-160','oat',(0,0,4+162*i),(0,0,0)))
            if i<n-1:c.append(('valet-column-joiner','rose',(0,0,135+162*i),(0,0,0)))
        top=4+162*(n-1)+160
        c+=[('valet-shoulder-hub','rose',(0,0,top),(0,0,0)),('valet-shoulder-arm','butter',(10,0,top),(0,0,0)),('valet-shoulder-arm','butter',(-10,0,top),(0,0,180))]
        b.asm(label,c,('Low display valet' if n==1 else 'All-printed tall valet research assembly'),'All structural components printed; nominal geometry only. No weight rating. Not a climbing aid, child furnishing or released clothes stand. Joint retention/tipping must be redesigned or verified with physical samples.')
    b.finish()
if __name__=='__main__':main()
