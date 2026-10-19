"""Native solid reconstruction of the uploaded TURN proposal + original wall accessories.
The 42 mm pitch is retained. Keyway/cone reliefs are explicitly recorded below.
No compatibility or holding-load certification is implied by CAD.
"""
from common import *
P=42.;BORE=6.5;SHANK=6.2

def keyway(x,y,z,h):
    return union(cyl(6.5,h,(x,y,z)),rr(4,19.6,h,1.99,z).translate((x,y,0)))
def flange_cut(x,y):
    return union(keyway(x,y,7,8),cone(6.2,11.5,5.3,(x,y,8.7)))
def socket(x,y):
    return union(keyway(x,y,3.98,5.1),cyl(11,5,(x,y,-1)),cone(1.3,.585,.37,(x-8,y,3.98)),cone(1.3,.585,.37,(x+8,y,3.98)))
def board(nx=4,ny=4):
    s=rr(nx*42,ny*42,8,6).translate((nx*21,ny*21,0))
    return cut(s,*[socket((i+.5)*42,(j+.5)*42) for i in range(nx) for j in range(ny)])
def key(clamp=.0):
    # AC-02 has zero theoretical cone preload by default, unlike original .10 mm.
    s=union(cyl(6.2,7.3,(0,0,1.4)),rr(18.8,3.4,2.6,1.69,1.4),cone(6.2,10.5,4.3,(0,0,8.7-clamp)),cyl(10.5,1.4,(0,0,13-clamp)),rr(17,4.6,2.8,2.25,14.1-clamp))
    return s # no detent bump: tune sample before adding spring interference

def backplate(n=2,height=72,bottom=-55):
    w=(n-1)*42+36;cx=(n-1)*21
    s=rr(w,height,5,6,8).translate((cx,bottom+height/2,0))
    s=cut(s,*[flange_cut(i*42,0) for i in range(n)])
    if n==1:s=union(s,cyl(6.2,3.1,(0,-42,5)))
    return s
def wall_bin(n=2,depth=45,height=42):
    w=(n-1)*42+36;cx=(n-1)*21
    # Installed axis: X right, Y up, Z out from wall.
    shell=tray(w,depth,height,2.4,2.4,7)
    shell=place(shell,(-90,0,0),(cx,-height-15,8+depth/2))
    s=union(backplate(n,height+32,-height-15),shell)
    return s

def hook():
    fl=backplate(1,78,-60)
    body=union(fl,box(18,7,33,(0,-54,11)),box(18,20,7,(0,-47.5,38)))
    return cut(body,flange_cut(0,0))
def shelf(n=3):
    w=(n-1)*42+36;cx=(n-1)*21
    deck=rr(w,76,4,4).rotate((0,0,0),(1,0,0),-90).translate((cx,-45,46))
    lip=box(w,12,3,(cx,-39,82))
    # Triangular gussets in YZ; extruded across X.
    gus=[poly_yz([(-44,12),(-44,72),(-5,12)],4,x) for x in (-w/2+cx,cx+w/2-4)]
    return union(backplate(n,63,-45),deck,lip,*gus)
def cradle():
    s=hook();ring=cut(cyl(16,18,(-9,-35,39),(1,0,0)),cyl(12.4,20,(-10,-35,39),(1,0,0)),box(40,40,35,(0,-15,22)))
    return union(s,ring)

def main():
    b=Build('wall')
    for nx,ny in [(2,2),(2,4),(4,4)]:b.add(f'wall-panel-{nx}x{ny}',board(nx,ny),f'{nx} x {ny} TURN wall panel, 42 mm pitch',rotate=(180,0,0),notes='Front face down; rear chambers may bridge. Wall screws and substrate-specific anchors are not printable parts. No load rating.')
    b.add('turn-key-clearance',key(),'Quarter-turn key; zero cone preload, no detent bumps',notes='AC-02 test-key variant: NOT identical to original v0.1 spring/preload geometry. Determine retention with coupons.')
    washer=cut(union(cyl(6.2,3.4,(0,0,4.6)),cyl(10,2.8,(0,0,8))),cyl(2.25,9,(0,0,3)),cone(2.25,4.75,2.5,(0,0,8.3)))
    b.add('wall-anchor-washer',washer,'Printed washer for a separately specified wall screw',notes='Screw and wall anchor excluded; no screw compatibility claim beyond nominal 4.5 mm through hole.')
    for n in (1,2,3):b.add(f'wall-pocket-{n}',wall_bin(n),f'{n}-station open pocket',rotate=(90,0,0),notes='Backplate sockets exposed above cavity; supports/slicing review required.')
    b.add('wall-key-hook',hook(),'Wide single-station wall hook',rotate=(0,90,0),notes='Single key and a locating peg on the cell below prevent rotation. Do not use to restrain a dog.')
    for n in (2,3):b.add(f'wall-ledge-{n}',shelf(n),f'{n}-station gusseted display ledge',rotate=(90,0,0),notes='No load capacity or wall installation validated.')
    b.add('wall-rod-cradle',cradle(),'Stationary fishing-rod display cradle',rotate=(0,90,0),notes='Use in pairs on a wall after testing. Not a riding rod carrier.')
    lure=wall_bin(3,54,65)
    divs=[box(2,54,49,(x,-47.5,11)) for x in (-4,19,42,65,88)]
    # Dividers fill only the pocket depth, below its mouth.
    lure=union(lure,*divs)
    b.add('wall-lure-pocket',lure,'Recessed lure organiser with separated bays',rotate=(90,0,0),notes='Divider geometry is original. Hooks still require a cover or hook guards; exposed hooks are not made child-safe by a deep tray.')
    npart=backplate(4,36,-18)
    npart=engraved(npart,LABELS['wall_label'],9,.7,(63,0,12.35),104)
    b.add('wall-name-panel',npart,'Recessed-letter name panel, sample ASSEMBL',rotate=(180,0,0),notes='Name generated as real subtractive solid geometry.')
    border=cut(rr(185,185,9,15).translate((84,84,0)),rr(168.8,168.8,11,6.4,-1).translate((84,84,0)))
    b.add('wall-decorative-border',border,'Rounded decorative frame for 4x4 panel',notes='Separate loose frame. 0.4 mm radial planar gap. Securement not validated; decorative only.')
    # Fit coupons permit 0 / .1 / .2 mm head preload trial as separate supplied keys.
    for pre in (.1,.2):b.add(f'turn-key-preload-{str(pre).replace(".","p")}',key(pre),f'Key coupon with {pre:.1f} mm theoretical axial cone preload',notes='Deliberate fit-test interference only; do not choose for sale without physical test.')
    acc=wall_bin(2).translate((21,105,0));k=key().translate((21,105,0));panel=board(4,4)
    b.overlap('pocket flange against native panel',acc,panel)
    b.overlap('key shank versus native panel in locked position',k,panel)
    b.overlap('key versus accessory zero-preload seat',k,acc)
    # Render wall vertically: intrinsic X,Y,Z -> X,-Z,Y, then centre height.
    comps=[('wall-panel-4x4','chalk',(0,0,0),(90,0,0)),('wall-decorative-border','plum',(0,0,0),(90,0,0))]
    for pid,col,x,y in [('wall-pocket-2','rose',21,147),('wall-pocket-1','sage',147,147),('wall-ledge-3','oat',21,63)]:
        comps.append((pid,col,(x,0,y),(90,0,0)))
        n=3 if 'ledge-3' in pid else 2 if 'pocket-2' in pid else 1
        for i in range(n):comps.append(('turn-key-clearance','plum',(x+42*i,0,y),(90,0,0)))
    b.asm('wall-station',comps,'Compact rounded modular wall station','Original interpretation of the wall-organiser reference; not a replica of Slate. Wall fasteners excluded.')
    b.finish()
if __name__=='__main__':main()
