#!/usr/bin/env bash
# Render a marque still from a converted car asset.
#
#   bash car-still.sh lambo ../assembling-giltrap
#
# Reads <name>.bin (+ <name>-tex.jpg if it is a mesh) out of the demo directory
# and writes <name>-side.png back into it: a three-quarter front view on a
# transparent background, lit by the same softbox the live page uses, so the
# still and the 3D scene look like the same car photographed twice.
#
# Needs the headless Chrome that ships with puppeteer. Everything else is in
# the demo directory already.

set -euo pipefail

NAME="${1:?usage: car-still.sh <name> <demo-dir> [--points]}"
DIR="$(cd "${2:?usage: car-still.sh <name> <demo-dir> [--points]}" && pwd)"
MODE="${3:-auto}"
PARTICLES="${4:-particles}"   # pass "solid" to keep the render as-is

CHROME="$(ls -d "$HOME"/.cache/puppeteer/chrome-headless-shell/*/chrome-headless-shell-*/chrome-headless-shell 2>/dev/null | head -1)"
[ -x "$CHROME" ] || { echo "no headless chrome under ~/.cache/puppeteer"; exit 1; }
[ -f "$DIR/$NAME.bin" ] || { echo "missing $DIR/$NAME.bin — run car-asset.py first"; exit 1; }

# A mesh .bin starts with two counts then six floats; a point .bin starts with
# one count. The vertex/index counts of a mesh are both non-zero, which a point
# cloud's second word (a float exponent) never is at that offset.
if [ "$MODE" = "auto" ]; then
  MODE=$(python3 - "$DIR/$NAME.bin" <<'PY'
import struct, sys
b = open(sys.argv[1], 'rb').read(8)
nv, ni = struct.unpack('<II', b)
print('mesh' if 0 < ni < 40_000_000 and nv > 0 else 'points')
PY
)
fi
echo "$NAME: rendering as $MODE"

WORK="$(mktemp -d)"
# Ask the OS for a free port rather than picking one: two runs back to back
# would otherwise collide, and the second silently screenshots the first
# server's 404 page instead of failing.
PORT="$(python3 -c 'import socket;s=socket.socket();s.bind(("",0));print(s.getsockname()[1]);s.close()')"
trap 'rm -rf "$WORK"; [ -n "${SRV:-}" ] && kill "$SRV" 2>/dev/null || true' EXIT
cp "$DIR/three.min.js" "$DIR/$NAME.bin" "$WORK/"
[ -f "$DIR/$NAME-tex.jpg" ] && cp "$DIR/$NAME-tex.jpg" "$WORK/"

cat > "$WORK/shot.html" <<HTML
<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;background:transparent}canvas{display:block}</style>
<canvas id="c" width="1800" height="1100"></canvas>
<script src="three.min.js"></script>
<script>
var NAME='$NAME', MODE='$MODE';
var r=new THREE.WebGLRenderer({canvas:document.getElementById('c'),antialias:true,alpha:true,preserveDrawingBuffer:true});
r.setPixelRatio(1);r.setSize(1800,1100,false);
if(THREE.SRGBColorSpace!==undefined)r.outputColorSpace=THREE.SRGBColorSpace;
var s=new THREE.Scene(),cam=new THREE.PerspectiveCamera(22,1800/1100,0.1,200);
var pmrem=new THREE.PMREMGenerator(r),env=new THREE.Scene();
env.background=new THREE.Color('#08080A');
function panel(w,h,x,y,z,rx,ry,col,pow){
  var m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),
    new THREE.MeshBasicMaterial({color:new THREE.Color(col).multiplyScalar(pow)}));
  m.position.set(x,y,z);m.rotation.set(rx,ry,0);env.add(m);}
panel(20,11,0,10,1,-Math.PI/2,0,'#FFFFFF',4.8);
panel(13,8,-10,2.6,3,0,Math.PI/2,'#FFF0DC',3.6);
panel(13,8,10,2.6,0,0,-Math.PI/2,'#E9F0F8',3.2);
panel(16,5,0,1.6,-10,0,0,'#BFA37A',2.4);
s.environment=pmrem.fromScene(env,0.02).texture;
s.add(new THREE.AmbientLight('#FFFFFF',0.20));

var obj=null,tex=null,texReady=(MODE!=='mesh');
if(MODE==='mesh'){
  tex=new THREE.TextureLoader().load(NAME+'-tex.jpg',function(t){
    if(THREE.SRGBColorSpace!==undefined)t.colorSpace=THREE.SRGBColorSpace;
    t.flipY=false;t.needsUpdate=true;texReady=true;go();});
}
fetch(NAME+'.bin').then(function(x){return x.arrayBuffer()}).then(function(buf){
  var dv=new DataView(buf),g=new THREE.BufferGeometry();
  if(MODE==='mesh'){
    var nv=dv.getUint32(0,true),ni=dv.getUint32(4,true);
    var lo=[dv.getFloat32(8,true),dv.getFloat32(12,true),dv.getFloat32(16,true)];
    var rg=[dv.getFloat32(20,true),dv.getFloat32(24,true),dv.getFloat32(28,true)];
    var pO=32,uO=pO+nv*6,iO=uO+nv*4;
    var Q=new Int16Array(buf,pO,nv*3),U=new Uint16Array(buf,uO,nv*2),I=new Uint32Array(buf,iO,ni);
    var pos=new Float32Array(nv*3),uv=new Float32Array(nv*2);
    for(var i=0;i<nv;i++){
      pos[i*3]=lo[0]+(Q[i*3]/32767)*rg[0];
      pos[i*3+1]=lo[1]+(Q[i*3+1]/32767)*rg[1];
      pos[i*3+2]=lo[2]+(Q[i*3+2]/32767)*rg[2];
      uv[i*2]=U[i*2]/65535;uv[i*2+1]=U[i*2+1]/65535;}
    g.setAttribute('position',new THREE.BufferAttribute(pos,3));
    g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
    g.setIndex(new THREE.BufferAttribute(I,1));g.computeVertexNormals();
    obj=new THREE.Mesh(g,new THREE.MeshStandardMaterial({map:tex,metalness:0.30,roughness:0.40,envMapIntensity:1.5,side:THREE.DoubleSide}));
  }else{
    var n=dv.getUint32(0,true);
    var lo2=[dv.getFloat32(4,true),dv.getFloat32(8,true),dv.getFloat32(12,true)];
    var rg2=[dv.getFloat32(16,true),dv.getFloat32(20,true),dv.getFloat32(24,true)];
    var q=new Int16Array(buf,28,n*3),col=new Uint8Array(buf,28+n*6,n*3);
    var p2=new Float32Array(n*3),c2=new Float32Array(n*3);
    for(var j=0;j<n;j++){
      p2[j*3]=lo2[0]+(q[j*3]/32767)*rg2[0];
      p2[j*3+1]=lo2[1]+(q[j*3+1]/32767)*rg2[1];
      p2[j*3+2]=lo2[2]+(q[j*3+2]/32767)*rg2[2];
      c2[j*3]=col[j*3]/255;c2[j*3+1]=col[j*3+1]/255;c2[j*3+2]=col[j*3+2]/255;}
    g.setAttribute('position',new THREE.BufferAttribute(p2,3));
    g.setAttribute('color',new THREE.BufferAttribute(c2,3));
    g.computeBoundingBox();var bb0=g.boundingBox;
    var span=Math.max(bb0.max.x-bb0.min.x,bb0.max.y-bb0.min.y,bb0.max.z-bb0.min.z);
    obj=new THREE.Points(g,new THREE.PointsMaterial({size:span*0.009,vertexColors:true,sizeAttenuation:true}));
  }
  g.computeBoundingBox();
  var b=g.boundingBox,ctr=b.getCenter(new THREE.Vector3());
  obj.position.set(-ctr.x,-ctr.y,-ctr.z);
  var holder=new THREE.Group();holder.add(obj);s.add(holder);
  window.__box=[b.max.x-b.min.x,b.max.y-b.min.y,b.max.z-b.min.z];
  go();});
function go(){
  if(!obj||!texReady)return;
  var d=Math.max.apply(null,window.__box)*2.35;
  cam.position.set(d*0.80,d*0.30,d*0.62);cam.lookAt(0,0,0);
  r.render(s,cam);document.title='READY';}
</script>
HTML

python3 -m http.server "$PORT" --directory "$WORK" >/dev/null 2>&1 &
SRV=$!
sleep 2

"$CHROME" --headless --no-sandbox --enable-unsafe-swiftshader --use-angle=swiftshader \
  --hide-scrollbars --default-background-color=00000000 --window-size=1800,1100 \
  --virtual-time-budget=14000 --screenshot="$WORK/raw.png" \
  "http://localhost:$PORT/shot.html" 2>/dev/null

python3 - "$WORK/raw.png" "$DIR/$NAME-side.png" "$PARTICLES" <<'PY'
from PIL import Image, ImageDraw
import colorsys, sys
src, dst, mode = sys.argv[1], sys.argv[2], sys.argv[3]
im = Image.open(src).convert('RGBA')
bb = im.getbbox()
if not bb:
    raise SystemExit('nothing rendered — check that the .bin loaded')
# A served error page is opaque white end to end; a car on transparent is not.
opaque = sum(1 for a in im.getchannel('A').getdata() if a > 250)
if opaque > 0.94 * im.width * im.height:
    raise SystemExit('the page rendered opaque — that is an error page, not a car')
im = im.crop(bb)

# Photogrammetry turns glass green. Nothing on a car body is green, so pull the
# saturation out of anything that is and drop it dark, which is what glass does.
px = im.load()
for y in range(im.height):
    for x in range(im.width):
        r, g, b, a = px[x, y]
        if not a:
            continue
        h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
        if 0.20 < h < 0.54 and s > 0.12:
            rr, gg, bb2 = colorsys.hsv_to_rgb(h, s * 0.10, v * 0.66)
            px[x, y] = (int(rr * 255), int(gg * 255), int(bb2 * 255), a)

if mode == 'particles':
    # A solid photogrammetry mesh reads as a cheap 3D model; the same car as
    # points reads as a scan, which is the look the whole page is in. Sampling
    # the finished render rather than the geometry means a mesh and a Gaussian
    # splat come out matching, and it costs one pass over the pixels.
    import random
    rnd = random.Random(7)                      # deterministic: reruns match
    # The dot must be smaller than the gap or the points merge back into a
    # solid — which is what happened first time on a light-coloured car while
    # a black one looked sparse. Fixed spacing, fixed dot, so density is the
    # same whatever colour the car is.
    step = max(3, round(min(im.width, im.height) / 190))
    dot = max(1, round(step * 0.30))
    src_px = im.load()
    out = Image.new('RGBA', im.size, (0, 0, 0, 0))
    dr = ImageDraw.Draw(out)
    for y in range(0, im.height, step):
        for x in range(0, im.width, step):
            jx = x + rnd.randint(-step // 2, step // 2)
            jy = y + rnd.randint(-step // 2, step // 2)
            if not (0 <= jx < im.width and 0 <= jy < im.height):
                continue
            r, g, b, a = src_px[jx, jy]
            if a < 40:
                continue
            lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255
            if lum < 0.020:                     # only true black stays empty
                continue
            # lift toward champagne so a black car still reads on a dark page
            k = 0.44 + 0.56 * lum
            c = (min(255, int(58 + r * 0.55 + 150 * k)),
                 min(255, int(50 + g * 0.55 + 135 * k)),
                 min(255, int(38 + b * 0.55 + 106 * k)),
                 int(150 + 105 * lum))
            dr.ellipse([jx - dot, jy - dot, jx + dot, jy + dot], fill=c)
    im = out

pad = int(im.width * 0.06)
out = Image.new('RGBA', (im.width + pad * 2, im.height + pad * 2), (0, 0, 0, 0))
out.paste(im, (pad, pad))
out.thumbnail((1200, 1200), Image.LANCZOS)
out.save(dst)
print(f'  wrote {dst}  {out.size[0]}x{out.size[1]}')
PY

echo "$NAME-side.png ready. Add scan:'$NAME-side.png' to the marque's CI row,"
echo "and its alt text to SCAN_ALT in index.html."
