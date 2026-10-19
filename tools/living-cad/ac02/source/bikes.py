"""DAYRALLY MINI: original display-scale bikes. Not rideable, not licensed replicas.
Fixed frame and decorative shock; separately printed wheels, fork, cockpit, saddle,
cranks, axles and base. The package does not claim a functioning suspension or drive.
"""
from common import *

MODELS={
 'flow':dict(rear=(-65,0,26),front=(69,0,26),bb=(-10,0,25),seat=(-25,0,66),lower=(51,0,63),upper=(42,0,82),radius=25.5,front_radius=25.5,color='tomato',fork='butter',twin=False),
 'drop':dict(rear=(-71,0,29),front=(79,0,29),bb=(-12,0,27),seat=(-25,0,71),lower=(60,0,70),upper=(50,0,92),radius=28,front_radius=28,color='silver',fork='tomato',twin=True),
 'ridge':dict(rear=(-67,0,26),front=(74,0,28),bb=(-10,0,26),seat=(-24,0,71),lower=(56,0,67),upper=(46,0,87),radius=25.5,front_radius=27.5,color='teal',fork='ink',twin=False),
}

def vec(x):return np.array(x,float)
def lerp(a,b,t):return tuple(vec(a)+(vec(b)-vec(a))*t)
def wheel(radius,spokes=8):
    # Canonical wheel plane XY, rotation axis Z. Body centred z=0.
    tire=cut(cyl(radius,11,(0,0,-5.5)),cyl(radius-4,13,(0,0,-6.5)))
    rim=cut(cyl(radius-3.7,7,(0,0,-3.5)),cyl(radius-6.3,9,(0,0,-4.5)))
    arms=[]
    for i in range(spokes):
        a=2*math.pi*i/spokes
        arms.append(tube_between((0,0,0),((radius-5)*math.cos(a),(radius-5)*math.sin(a),0),2.0,True))
    tread=[]
    for i in range(28):
        for z in (-4,1):
            sh=box(3.4,2.1,3.6,(0,radius-.35,z))
            tread.append(place(sh,(0,0,i*360/28+(4 if z>0 else 0))))
    body=union(tire,rim,cyl(5.8,14,(0,0,-7)),*arms,*tread)
    return cut(body,cyl(2.0,18,(0,0,-9)))

def frame(m):
    R,F,B,S,L,U=[m[k] for k in('rear','front','bb','seat','lower','upper')]
    sh=[tube_between(B,L,4.1,True),tube_between(S,U,3.6,True),tube_between(B,S,3.5,True),tube_between(L,U,5.8)]
    for yy in(-11,11):
        ra=(R[0],yy,R[2]); yoke=(B[0]-8,yy,B[2]);ss=(S[0],yy,S[2]-4)
        sh += [tube_between(yoke,ra,2.7,True),tube_between(ss,ra,2.6,True),tube_between(B,yoke,3.3,True),tube_between(S,ss,3.1,True),cyl(6.1,4,(R[0],yy-2,R[2]),(0,1,0))]
    # Monolithic visual shock connected at actual tube centre lines; bands are NOT a spring.
    p=lerp(B,S,.64);q=lerp(B,L,.43);v=vec(q)-vec(p);u=v/np.linalg.norm(v)
    sh += [tube_between(p,q,2.4,True)]
    for t in np.linspace(.23,.75,6):sh.append(cyl(4.0,1.1,tuple(vec(p)+t*v),tuple(u)))
    # Integrated post; saddle plugs into its end. Bottom-bracket hub with axle bore.
    post_top=(S[0]-3,0,S[2]+16)
    sh += [tube_between(S,post_top,2.6,True),box(4,4,5,(post_top[0],0,post_top[2])),cyl(6,20,(B[0],-10,B[2]),(0,1,0))]
    result=union(*sh)
    d=vec(U)-vec(L);u=d/np.linalg.norm(d)
    result=cut(result,tube_between(tuple(vec(L)-12*u),tuple(vec(U)+12*u),2.4),cyl(2,34,(R[0],-17,R[2]),(0,1,0)),cyl(2.2,32,(B[0],-16,B[2]),(0,1,0)))
    return result,post_top

def fork(m):
    F,L,U=map(vec,(m['front'],m['lower'],m['upper']));axis=(U-L)/np.linalg.norm(U-L)
    crown=L-axis*9
    sh=[tube_between(tuple(crown),tuple(U+axis*(16 if m['twin'] else 10)),1.9)]
    for yy in(-11,11):
        top=crown+vec((0,yy,0));foot=F+vec((0,yy,0))
        sh += [tube_between(tuple(crown),tuple(top),3.0,True),tube_between(tuple(top),tuple(foot),3.0,True),cyl(6,4,(F[0],yy-2,F[2]),(0,1,0))]
    # Both sides are bridged above the tire, not through it.
    bridge=F+vec((-12,0,m['front_radius']+7))
    sh += [tube_between(tuple(bridge+vec((0,-11,0))),tuple(bridge+vec((0,11,0))),2.5,True)]
    # Link the bridge to both fork legs to ensure a single connected solid.
    for yy in(-11,11):
        p=crown+vec((0,yy,0));foot=F+vec((0,yy,0));q=p+(foot-p)*.35
        sh.append(tube_between(tuple(bridge+vec((0,yy,0))),tuple(q),2.5,True))
    if m['twin']:
        upperc=U+axis*8
        # Twin-stanchion crown extends above/around the head tube. Head bore unchanged.
        for yy in(-11,11):
            sh += [tube_between(tuple(crown+vec((0,yy,0))),tuple(upperc+vec((0,yy,0))),2.5,True),tube_between(tuple(upperc+vec((0,yy,0))),tuple(upperc),2.6,True)]
    result=union(*sh)
    return cut(result,cyl(2,34,(F[0],-17,F[2]),(0,1,0)))

def cockpit(m):
    L,U=map(vec,(m['lower'],m['upper']));d=(U-L)/np.linalg.norm(U-L)
    c=U+d*(11 if m['twin'] else 5.5)
    hub=tube_between(tuple(c),tuple(c+d*6),4.6)
    end=c+d*5+vec((9,0,1))
    sh=[hub,tube_between(tuple(c+d*4),tuple(end),2.6,True),tube_between(tuple(end+vec((0,-24,2))),tuple(end+vec((0,24,2))),1.9,True),tube_between(tuple(end),tuple(end+vec((0,0,2))),2.5,True)]
    for yy in (-25,18):sh.append(cyl(2.6,7,(end[0],end[1]+yy,end[2]+2),(0,1,0)))
    s=union(*sh)
    return cut(s,tube_between(tuple(c-d),tuple(c+d*12),2.3))

def saddle(post):
    x,y,z=post
    s=rr(21,12,5,4).translate((x-1,y,z+2))
    return cut(s,box(4.7,4.7,5.5,(x,y,z)))

def main():
    b=Build('mini-bikes')
    # Common printed axle, and removable slit caps. Never use actual bike components.
    axle=union(cyl(3.4,1.8,(0,-16,0),(0,1,0)),cyl(1.7,32,(0,-14.3,0),(0,1,0)))
    cap=cut(cyl(3.3,2.7,(0,0,0),(0,1,0)),cyl(1.78,3.5,(0,-.3,0),(0,1,0)),box(1,3.6,3.2,(2.8,1.35,-1.6)))
    b.add('mini-wheel-axle',axle,'Common wheel axle with head',rotate=(90,0,0),notes='All printed; check axial play and cap retention before handling. Not a full-size bike part.')
    b.add('mini-wheel-cap',cap,'Slit axle cap, sample 3.56 mm bore',rotate=(90,0,0),notes='Nominal small-clearance cap; may be too loose in a given material. Alternative interference needs physical sampling.')
    wheelcache={}
    for R in sorted(set([m['radius'] for m in MODELS.values()]+[m['front_radius'] for m in MODELS.values()])):
        keyid='mini-wheel-'+str(R).replace('.','p');wheelcache[R]=keyid
        b.add(keyid,wheel(R),f'Integrated miniature tire, rim, spokes and hub, radius {R} mm',notes='Two-colour effects require print planning; tire, rim and spokes are one rigid solid. Face-down print with support review under tread.',rotate=(0,0,0))
    for name,m in MODELS.items():
        fr,post=frame(m);fo=fork(m);co=cockpit(m);sa=saddle(post)
        b.add(f'mini-{name}-frame',fr,f'Dayrally {name.upper()} original fixed frame',rotate=(90,0,0),notes='Display-scale original geometry. Static decorative shock. Supports required beneath rear stays and post; no suspension or driveline function.')
        b.add(f'mini-{name}-fork',fo,f'{name.upper()} fork with steerer',rotate=(90,0,0),notes='Slit-cap and cockpit fit require a sample; bridge should clear tire. No spring travel.')
        b.add(f'mini-{name}-cockpit',co,f'{name.upper()} handlebar and stem',rotate=(90,0,0),notes='Small grip and stem features: slice/support carefully. Cosmetic display component.')
        b.add(f'mini-{name}-saddle',sa,f'{name.upper()} plug-on saddle',notes='Nominal seatpost socket 4.7 mm square; support/fit check.')
        B=m['bb']
        # Right crank has the through shaft; left crank has a separate 4.5 mm socket.
        right=union(cyl(1.8,26,(B[0],-13,B[2]),(0,1,0)),tube_between((B[0],13,B[2]),(B[0]+6,13,B[2]-13),2.2,True),rr(9,8,3,2).translate((B[0]+6,15,B[2]-14.5)))
        left=union(cyl(3.5,5,(B[0],-16,B[2]),(0,1,0)),tube_between((B[0],-14,B[2]),(B[0]-6,-14,B[2]+13),2.2,True),rr(9,8,3,2).translate((B[0]-6,-16,B[2]+11.5)))
        left=cut(left,cyl(2.0,4,(B[0],-14.5,B[2]),(0,1,0)))
        b.add(f'mini-{name}-crank-r',right,f'{name.upper()} crank with integral shaft',rotate=(90,0,0),notes='No chain drive. Keep cranks aligned outboard of frame.')
        b.add(f'mini-{name}-crank-l',left,f'{name.upper()} socket crank',rotate=(90,0,0),notes='Requires sample fit with integral 3.6 mm shaft.')
        # Base: tire pockets at exact axle spacing, shallow, no claim to capture wheel permanently.
        R,F=m['rear'],m['front'];length=F[0]-R[0]+52;cx=(R[0]+F[0])/2
        base=rr(length,58,7,12).translate((cx,0,0))
        for centre in (R,F):base=cut(base,rr(38,13.6,6,3,2.2).translate((centre[0],0,0)))
        base=engraved(base,LABELS['name']+' / '+name.upper(),8,.8,(cx,-19,6.25),length-24)
        b.add(f'mini-{name}-display-base',base,f'{name.upper()} named display base',material='Matte PLA candidate',notes='Text is recessed geometry. Tire pockets nominal 13.6 mm wide; soft fit, not a latch.')
        dz=max(2.2+wheel(m['radius']).BoundingBox().ymax-R[2],2.2+wheel(m['front_radius']).BoundingBox().ymax-F[2])
        comps=[(f'mini-{name}-display-base','chalk',(0,0,0),(0,0,0)),(f'mini-{name}-frame',m['color'],(0,0,dz),(0,0,0)),(f'mini-{name}-fork',m['fork'],(0,0,dz),(0,0,0)),(f'mini-{name}-cockpit','ink',(0,0,dz),(0,0,0)),(f'mini-{name}-saddle','ink',(0,0,dz),(0,0,0)),(f'mini-{name}-crank-r','ink',(0,0,dz),(0,0,0)),(f'mini-{name}-crank-l','ink',(0,0,dz),(0,0,0))]
        for j,(p,r) in enumerate(((R,m['radius']),(F,m['front_radius']))):
            comps += [(wheelcache[r],'ink',(p[0],0,p[2]+dz),(90,0,0)),('mini-wheel-axle','ink',(p[0],0,p[2]+dz),(0,0,0)),('mini-wheel-cap',m['fork'],(p[0],14.6,p[2]+dz),(0,0,0))]
        b.asm(f'dayrally-mini-{name}',comps,f'DAYRALLY MINI {name.upper()} - original display bike','Approximately 1:10 visual scale, not a dimensional replica. Assembled miniature, not a rideable bicycle. Small parts; not evaluated as a child toy.')
        wr=place(wheel(m['radius']),(90,0,0),m['rear']);wf=place(wheel(m['front_radius']),(90,0,0),m['front'])
        b.overlap(name+': rear wheel vs fixed frame',wr,fr)
        b.overlap(name+': front wheel vs fork',wf,fo)
        b.overlap(name+': frame vs fork',fr,fo)
        b.overlap(name+': frame vs saddle',fr,sa)
        b.overlap(name+': steerer vs cockpit socket',fo,co)
    b.finish()
if __name__=='__main__':main()
