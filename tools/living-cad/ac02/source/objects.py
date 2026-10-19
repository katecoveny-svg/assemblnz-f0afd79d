"""Original decorative and practical objects. No direct pet-food contact or electrical parts."""
from common import *
from desk import foot,rail

def planet_body():
    # Rounded revolution, with real open nursery-pot cavity. Three blind leg sockets.
    outline=cq.Workplane('XZ').moveTo(0,0).lineTo(35,0).spline([(45,7),(55,23),(59,42),(56,65),(49,86)],includeCurrent=True).lineTo(0,86).close().revolve(360,(0,0),(0,1)).val()
    outline=cut(outline,cyl(43.2,90,(0,0,16)))
    for a in(30,150,270):
        x,y=27*math.cos(math.radians(a)),27*math.sin(math.radians(a))
        outline=cut(outline,cyl(4.6,12,(x,y,-.1)))
    # Recessed orbital stripe, not reference crater holes.
    stripe=cut(cyl(61,1.6,(0,0,29)),cyl(55.2,2,(0,0,28.8)))
    return cut(outline,stripe)

def clock_body(shaft=3.6):
    s=cut(rr(86,86,23,13),rr(62,62,21,6,-.1),cyl(shaft/2,26,(0,0,-1)))
    # ticks are recessed (no fragile loose decorative pieces).
    ticks=[]
    for i in range(12):ticks.append(place(rr(2,7,.9,.8,22.2).translate((0,33,0)),(0,0,-i*30)))
    return cut(s,*ticks)
def hand(length,width=4):
    s=union(cyl(5,1.6),rr(width,length,1.6,min(1.5,width/2-.1)).translate((0,length/2-2,0)))
    return cut(s,cyl(1.9,3,(0,0,-.5)))

def shade():
    n=96;flutes=16;height=125.
    def wire(radius,z):
        pts=[((radius+2.1*math.cos(flutes*2*math.pi*i/n))*math.cos(2*math.pi*i/n),(radius+2.1*math.cos(flutes*2*math.pi*i/n))*math.sin(2*math.pi*i/n)) for i in range(n)]
        return cq.Workplane('XY').polyline(pts).close().val().translate((0,0,z))
    outer=cq.Solid.makeLoft([wire(88,0),wire(63,60),wire(36,125)],False)
    inner=cq.Solid.makeLoft([wire(85.4,-.1),wire(60.4,60),wire(33.4,125.1)],False)
    s=cut(outer,inner)
    cap=cut(cyl(35,3,(0,0,122)),cyl(21.4,5,(0,0,121)))
    return union(s,cap)

def main():
    b=Build('objects')
    body=planet_body()
    b.add('orbit-planter-shell',body,'Original rounded nursery-pot sleeve with orbital groove',material='Matte PLA / PETG candidate',notes='Decorative sleeve for removable nursery pot, nominal cavity 86.4 mm. No water containment claim. Not a copy of the crater planter.')
    leg=union(cone(8,5.8,28),cyl(4.2,11.4,(0,0,27.95)))
    b.add('orbit-planter-leg',leg,'Tapered plug-in planter leg',notes='Three identical legs; nominal socket/peg diameters 9.2/8.4 mm. Fit and stability tests required.')
    saucer=tray(136,136,10,2.4,2.4,22)
    b.add('orbit-catch-tray',saucer,'Separate rounded catch-tray concept',notes='Not tested watertight; use an existing nursery-pot saucer if needed.')
    comps=[('orbit-planter-shell','ink',(0,0,28),(0,0,0))]
    for a in(30,150,270):comps.append(('orbit-planter-leg','ink',(27*math.cos(math.radians(a)),27*math.sin(math.radians(a)),0),(0,0,0)))
    b.asm('orbit-planter',comps,'Original space-age inspired planter sleeve','Pot, soil, plant and waterproof insert are not included. Leg retention and top-heavy tipping need testing.')
    b.overlap('planter leg pegs versus shell',leg.translate((27*math.cos(math.pi/6),27*math.sin(math.pi/6),0)),body.translate((0,0,28)))
    b.add('pleat-shade',shade(),'Original 16-fold open lampshade with nominal 42.8 mm collar',material='Grade not yet qualified',notes='Shade only; no cord, lamp holder or bulb. LED use alone does not certify safety. Fitting, clearance, heat exposure and ignition must be assessed; not a released luminaire.')
    b.asm('pleat-shade-study',[('pleat-shade','chalk',(0,0,0),(0,0,0))],'Printed pleated shade geometry','No light source installed or represented as working.')
    # Clock study: default fully printed manual hands; movement-ready shell also supplied.
    b.add('manual-clock-body',clock_body(),'All-printed manual clock/routine dial body',rotate=(180,0,0),notes='No timekeeping. Manual hands demonstrate times or routines.')
    b.add('quartz-clock-shell',clock_body(8.4),'Optional clock casing for a separately sourced movement',rotate=(180,0,0),notes='Rear cavity 62 x 62 x 20.9 mm; nominal shaft hole 8.4 mm. No promise of compatibility with an unselected movement; not a fully printed working clock.')
    back=union(rr(85.4,85.4,2.4,12.7),rr(61.4,61.4,3,5.7,2.35))
    # small thumb notch: pull off rather than pretend this is a secure snap latch
    back=cut(back,cyl(6,6,(42,0,-1)))
    b.add('clock-back-cover',back,'Loose slip-fit rear cover',notes='0.3 mm per-side tongue clearance. Requires physical retention development.')
    b.add('clock-hour-hand',hand(23,5),'Manual hour hand')
    b.add('clock-minute-hand',hand(31,3.8),'Manual minute hand')
    spindle=union(cyl(4.8,2),cyl(1.6,11,(0,0,1.95)))
    b.add('clock-hand-pin',spindle,'Headed spindle for manual hands',notes='Press friction/retention must be tuned. No automatic motion.')
    dock=union(foot(84),rr(86,36,6,6,8.95),box(74,3,15,(0,14.7,14.9)),box(74,3,12,(0,-14.7,14.9)))
    b.add('clock-rail-cradle',dock,'Original cradle holding the clock study on TR-01',notes='Clock rests in the 26.4 mm-wide slot, front/back wall positions need sample seating check.')
    b.add('clock-rail-168',rail(168),'TR-01 rail for manual desk clock')
    # body initially XY plate with display toward +Z, rotate to face -Y.
    z=63.4;y=10.3
    comps=[('clock-rail-168','oat',(0,0,0),(0,0,0)),('clock-rail-cradle','oat',(0,0,5.2),(0,0,0)),('manual-clock-body','butter',(0,y,z),(90,0,0)),('clock-back-cover','butter',(0,y+2.4,z),(90,0,0)),('clock-hour-hand','plum',(0,y-23.4,z),(90,-55,0)),('clock-minute-hand','plum',(0,y-25.4,z),(90,45,0)),('clock-hand-pin','plum',(0,y-29.4,z),(-90,0,0))]
    b.asm('manual-rail-clock',comps,'All-printed manual desktop time / routine display','Hands are manually set. The assembled position is a styling layout; confirm cradle contact in a printed sample.')
    # Walk pod: removable slip cap. Printed bags themselves are not supplied.
    pod=cut(cyl(19,65),cyl(15,67,(0,0,2.6)))
    slot=rr(23,8,10,3).rotate((0,0,0),(1,0,0),90).translate((0,-13,30))
    pod=cut(pod,slot)
    eye=cut(rr(18,14,5,6,57).translate((0,22,0)),cyl(3.3,8,(0,24,55)))
    pod=union(pod,eye)
    b.add('walk-bag-pod',pod,'Refillable bag-roll dispenser with accessory eye',notes='For standard bags the customer supplies. Eye is for small accessories, not leash restraint. Slot fit and tear edge require smoothing/testing.')
    cap=union(cyl(19,3),cut(cyl(14.6,7,(0,0,2.9)),cyl(12.2,8,(0,0,2.8))))
    b.add('walk-pod-cap',cap,'Slip-on bag-pod refill cap',notes='0.4 mm radial clearance; friction retention not verified. No water sealing claim.')
    clip=cut(rr(36,62,6,16),rr(25,49,8,11,-1))
    clip=cut(clip,box(12,2.0,9,(16,16,-1)))
    b.add('rally-flex-clip',clip,'One-piece printed light-accessory clip with flexible gate',material='PETG or tough nylon candidate',notes='Not for climbing, lifting, child protection, securing a rider or animal restraint. Gate fatigue and impact untested.')
    tag=cut(rr(66,27,3.2,9),cyl(2.3,5,(-25,0,-1)))
    tag=engraved(tag,LABELS['pet_name'],6,.6,(5,0,2.65),43)
    b.add('pet-name-tag',tag,'Recessed-letter pet accessory tag, sample FRANKLIN',notes='Tag is not restraint hardware. No split ring included; test abrasion and all attachment parts.')
    bowl=cut(cyl(63,25),cyl(54,28,(0,0,-1)))
    bowl=union(bowl,cut(cyl(63,3),cyl(49,5,(0,0,-1))))
    b.add('pet-bowl-surround',bowl,'Surround supporting an existing removable bowl',notes='Opening 108 mm with lower locating ledge 98 mm. Measure the selected bowl; no printed food-contact surface is intended. Not a veterinary height recommendation.')
    b.asm('pet-walk-kit',[('walk-bag-pod','rose',(0,0,0),(0,0,0)),('walk-pod-cap','chalk',(0,0,68),(180,0,0)),('rally-flex-clip','plum',(60,0,0),(0,0,0)),('pet-name-tag','butter',(65,50,0),(0,0,0))],'Practical printed walking-accessory study','Bags, leash, fastening ring and animal not included.')
    b.finish()
if __name__=='__main__':main()
