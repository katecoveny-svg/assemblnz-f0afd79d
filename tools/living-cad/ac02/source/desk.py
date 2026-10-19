"""Original desk rail, perch and fitted organisers. New TR-01 interface, separate from TURN."""
from common import *

# Two longitudinal dovetail rails, 44 mm centre spacing. Fit is deliberately a sample coupon target.
def rail(length=210):
    s=rr(length,70,5,5)
    ribs=[poly_yz([(y-3,4.95),(y+3,4.95),(y+5,10),(y-5,10)],length,-length/2) for y in (-22,22)]
    s=union(s,*ribs)
    holes=[cyl(1.75,12,(x,y,-1)) for x in (-length/2+7,length/2-7) for y in (-22,22)]
    # underside dowel sockets for alignment joiner
    holes += [cyl(2.2,4.0,(x,y,-.1)) for x in (-length/2+10,length/2-10) for y in (-14,14)]
    return cut(s,*holes)
def foot(w=84):
    s=rr(w,62,9,4)
    for y in (-22,22):
        s=cut(s,poly_yz([(y-3.4,-1),(y+3.4,-1),(y+3.4,0),(y+5.4,5.4),(y-5.4,5.4),(y-3.4,0)],w+2,-w/2-1))
    return s

def main():
    b=Build('desk')
    for length in (84,210,240):b.add(f'rail-{length}',rail(length),f'TR-01 twin-dovetail desk rail {length} mm',notes='TR-01 is a proposed sliding desktop connection, not the wall TURN interface. Supports under the dovetail shoulders may be required.',params={'length_mm':length,'rail_centres_mm':44,'head_width_mm':10,'stem_width_mm':6})
    join=union(rr(30,44,3,3),*[cyl(2,3.7,(x,y,2.95)) for x in (-10,10) for y in(-14,14)])
    b.add('rail-alignment-joiner',join,'Underside peg plate aligning two rail segments',notes='Geometric alignment only, not a structural beam joint.')
    b.add('rail-end-stop-pin',pin(3.1,10,8,1.8),'Removable headed stop peg',notes='Insert shaft down through rail-end holes; caps block a module from sliding off. Loose-fit retention needs testing.')
    b.add('rail-fit-coupon',foot(24),'24 mm long sliding-fit coupon',notes='Print before any full organiser. Female base opening 6.8 mm; head opening 10.8 mm; nominal radial difference 0.4 mm.')
    module_tray=union(foot(84),tray(84,62,23,2.4,2.4,6).translate((0,0,8.95)))
    b.add('rail-catch-tray',module_tray,'Slide-on catchall tray',notes='Do not change socket dimensions when resizing the useful tray area.')
    cup=union(foot(42),tray(40,48,69,2.4,2.4,9).translate((0,0,8.95)))
    b.add('rail-pen-cup',cup,'Slide-on rounded brush and pen cup',notes='External rib option belongs only on nonmating walls.')
    wells=union(foot(84),rr(80,58,30,6,8.95))
    wells=cut(wells,*[cyl(7.5,32,(x,y,11.4)) for x in(-27,-9,9,27) for y in(-17,1,19)])
    b.add('rail-vanity-wells',wells,'Twelve-well cosmetic tube organiser',notes='15 mm nominal wells are for existing containers, not poured cosmetics.',params={'tube_diameter_mm':15})
    phone=union(foot(84),rr(80,24,9,4,8.9).translate((0,9,0)),box(76,4,16,(0,-17,8.9)),place(rr(78,55,5,5),(72,0,0),(0,19,33)))
    # Rear support meets the base using two supporting fins.
    phone=union(phone,poly_yz([(8,11),(28,11),(9,60)],6,-36),poly_yz([(8,11),(28,11),(9,60)],6,30))
    b.add('rail-phone-rest',phone,'Angled phone rest with open charging-cable gap',notes='Test stability and device fit; no riding use. Supports under tilted surfaces required.')
    note=union(foot(84),rr(80,18,39,3,8.95).translate((0,9,0)))
    note=cut(note,box(72,2.2,35,(0,9,15)))
    b.add('rail-note-slot',note,'Slot for a paper card or sticky-note backing',notes='2.2 mm paper-card slot. Paper not supplied.')
    comb=union(foot(42),rr(38,13,23,4,8.95).translate((0,0,0)))
    for x in(-12,0,12):comb=cut(comb,cyl(3.3,17,(x,-8,26),(0,1,0)),box(3,17,11,(x,0,26)))
    b.add('rail-cable-comb',comb,'Three open cable channels on a rail foot',notes='Cable retention and strain relief not rated. Avoid cutting or pinching a cable.')
    # Low rail foot for attaching clock or creative objects; mounting interface is 2 x 4.4 mm bores.
    dock=union(foot(84),box(76,10,15,(0,14,8.95)))
    dock=cut(dock,*[cyl(2.2,18,(x,5,17),(0,1,0)) for x in(-28,28)])
    b.add('rail-object-dock',dock,'Two-pin accessory dock for original future modules',notes='No claimed compatibility with third-party rails.')
    # Desk-edge fixed-gap U clamps integrated into a small tray.
    edge=tray(168,66,24,2.4,2.4,9).translate((0,-34,1))
    desk=25.;gap=desk+2.5
    for x in(-54,54):
        clamp=union(box(22,42,4,(x,17,0)),box(22,6,gap+8,(x,-3,-gap-4)),box(22,42,4,(x,17,-gap-4)))
        edge=union(edge,clamp)
    b.add('desk-edge-perch-25',edge,'Front-of-desk pocket with two fixed-gap 25 mm desk clips',rotate=(0,90,0),notes='For a 25 mm unobstructed desk edge only, with printed wedges. Design not load-tested. Do not assume universal clamp fit.',params={'desk_thickness_mm':25,'free_gap_mm':27.5})
    wedge=poly_yz([(0,0),(34,0),(34,3.2),(0,.8)],20,-10)
    wedge=union(wedge,box(24,3,6,(0,35.5,0)))
    b.add('desk-edge-wedge',wedge,'Tapered removable wedge for fixed-gap desk clamp',notes='Use to tune clamping after checking the surface. No anti-slip or surface-protection claim.')
    # Fitted rectangular drawers: real open cavities and dividers.
    for w,d,h,c,rw in ((84,84,30,1,1),(168,84,38,2,1),(240,180,42,3,2)):
        s=tray(w,d,h,2.4,2.4,7)
        for i in range(1,c):s=union(s,box(1.8,d-4.6,h-5,( -w/2+2.4+i*(w-4.8)/c,0,2.35)))
        for j in range(1,rw):s=union(s,box(w-4.6,1.8,h-5,(0,-d/2+2.4+j*(d-4.8)/rw,2.35)))
        b.add(f'drawer-tray-{w}x{d}',s,f'{w} x {d} fitted organiser with {c*rw} compartments',material='Matte PLA or PETG candidate',notes='Outer size, not required drawer size. Leave clearance for drawer taper and opening.',params={'outer_width_mm':w,'outer_depth_mm':d,'height_mm':h,'clearance_customer_to_confirm':True})
    # Original linked circular-lobe tray: shared foot is NOT used, decorative collection only.
    centres=[(-32,-7),(0,8),(32,-7)]
    for h in(24,55):
        s=union(*[cyl(26,h,(x,y,0)) for x,y in centres])
        s=cut(s,*[cyl(22.8,h,(x,y,2.6)) for x,y in centres])
        # Six small outward ribs per visible lobe, fuse only where touching body.
        ribs=[]
        for x,y in centres:
            for a in range(0,360,30):
                px=x+25.2*math.cos(math.radians(a));py=y+25.2*math.sin(math.radians(a));ribs.append(cyl(1.25,h-.6,(px,py,.3)))
        s=union(s,*ribs)
        b.add(f'swell-organiser-{h}',s,f'Original three-lobe ribbed organiser {h} mm high',material='Matte PLA candidate',notes='Original outline, not copied from reference. Reference geometry is not embedded.')
    b.overlap('TR-01 female foot versus male rail',foot(84).translate((0,0,5.2)),rail())
    b.overlap('TR-01 end joiner pegs versus rail underside',join.translate((105,0,-3)),rail())
    b.asm('desk-rail-set',[('rail-240','oat',(0,0,0),(0,0,0)),('rail-pen-cup','rose',(-85,0,5.2),(0,0,0)),('rail-catch-tray','chalk',(-19,0,5.2),(0,0,0)),('rail-note-slot','butter',(67,0,5.2),(0,0,0))], 'Original sliding desk-organisation set','Three modules on the longer 240 mm rail, clear of the end-stop positions. Test fit coupons before full modules.')
    # alternative set whose modules and stops all fit within end stops
    b.asm('desk-rail-compact',[('rail-210','oat',(0,0,0),(0,0,0)),('rail-pen-cup','rose',(-63,0,5.2),(0,0,0)),('rail-catch-tray','chalk',(2,0,5.2),(0,0,0)),('rail-cable-comb','sage',(66,0,5.2),(0,0,0))], 'Compact rail set with clear end-stop positions')
    b.asm('desk-edge-perch',[('desk-edge-perch-25','sage',(0,0,33),(0,0,0)),('desk-edge-wedge','oat',(-54,6,5.5),(0,0,0)),('desk-edge-wedge','oat',(54,6,5.5),(0,0,0))], 'Fixed-gap desk-edge perch, desk not included','Upper desk plane is z=33. Wedges occupy nominal underside clearance; proof of friction not supplied.')
    b.asm('vanity-organisers',[('drawer-tray-168x84','chalk',(-52,0,0),(0,0,0)),('swell-organiser-55','rose',(112,0,0),(0,0,0)),('swell-organiser-24','sage',(-10,100,0),(0,0,0))], 'Fitted and sculptural vanity organisers')
    b.finish()
if __name__=='__main__':main()
