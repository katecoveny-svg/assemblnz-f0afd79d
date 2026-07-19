/**
 * Turn the current studio state into a self-contained HTML file that
 * reproduces the same piece offline — the "download as code" export.
 */

import type { FamilyId } from './families';
import { PRESETS as LINE_PRESETS, type PresetId as LinePresetId } from './presets';
import { CHROME_PALETTES, CHROME_SHAPES, type ChromePalette, type ChromeShape } from './families/chrome';
import { FLOW_PALETTES } from './families/flow';
import { watermarkHtmlSnippet } from './watermark';

interface Args {
  family: FamilyId;
  presetId: string;
  values: Record<string, number>;
  seed: number;
  /** Full share URL back to the playground with these exact params. */
  shareUrl?: string;
}

const P5_CDN = 'https://cdn.jsdelivr.net/npm/p5@1.11.3/lib/p5.min.js';

function shellCode(title: string, body: string, ground: string, shareUrl?: string): string {
  const originComment = shareUrl
    ? `<!-- reproduce or remix this piece at ${shareUrl} -->`
    : '<!-- made with the assembl creative playground · assembl.co.nz/creative-playground -->';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${title}</title>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
${originComment}
<style>
  html, body { margin: 0; padding: 0; background: ${ground}; }
  body { display: grid; place-items: center; min-height: 100vh; }
  main { width: min(720px, 92vw); aspect-ratio: 0.92 / 1; position: relative; }
  canvas { display: block; width: 100% !important; height: 100% !important; }
</style>
</head>
<body>
<main id="stage"></main>
${watermarkHtmlSnippet(ground)}
${body}
</body>
</html>`;
}

function lineSnippet({ presetId, values, seed, shareUrl }: Args): string {
  const preset = LINE_PRESETS[presetId as LinePresetId] ?? LINE_PRESETS.bloom;
  const params = {
    preset: preset.id,
    shells: Math.round(values.shells ?? preset.shells),
    warp: values.warp ?? preset.warp,
    hue: preset.hue,
    tint: preset.tint,
    alpha: values.alpha ?? preset.alpha,
    stroke: values.stroke ?? preset.stroke,
    noise: values.noise ?? preset.noise,
    seed,
  };
  const palette = preset.palette;

  return shellCode(
    `assembl · ${preset.label}`,
    `<script src="${P5_CDN}"></script>
<script>
// assembl creative playground — Line / ${preset.label}
// deterministic per seed; edit PARAMS or PALETTE to remix.
const PARAMS = ${JSON.stringify(params, null, 2)};
const PALETTE = ${JSON.stringify(palette, null, 2)};

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }
function hexToRgb(h) { h = h.replace('#',''); return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]; }
function rgb2hex(r,g,b){const c=n=>Math.max(0,Math.min(255,Math.round(n))).toString(16).padStart(2,'0');return '#'+c(r)+c(g)+c(b);}
function lerpPalette(stops, t) {
  const c = Math.max(0, Math.min(1, t));
  const seg = stops.length - 1;
  const pos = c * seg;
  const i = Math.min(Math.floor(pos), seg - 1);
  const f = pos - i;
  const [r1,g1,b1] = hexToRgb(stops[i]);
  const [r2,g2,b2] = hexToRgb(stops[i+1]);
  return rgb2hex(r1+(r2-r1)*f, g1+(g2-g1)*f, b1+(b2-b1)*f);
}
function darken(hex, amt) { const [r,g,b]=hexToRgb(hex); return rgb2hex(r*(1-amt),g*(1-amt),b*(1-amt)); }
function makeNoise(seed) {
  const rand = mulberry32(seed);
  const N = 128;
  const grid = Array.from({length:N},()=>Array.from({length:N},()=>rand()));
  const smooth = t => t*t*(3-2*t);
  return (x,y) => {
    const xi=Math.floor(x), yi=Math.floor(y);
    const xf=x-xi, yf=y-yi;
    const g=(a,b)=>grid[((a%N)+N)%N][((b%N)+N)%N];
    const u=smooth(xf), v=smooth(yf);
    const a=g(xi,yi), b=g(xi+1,yi), c=g(xi,yi+1), d=g(xi+1,yi+1);
    return a + u*(b-a) + v*(c-a) + u*v*(a-b-c+d);
  };
}

function buildShells(w, h) {
  const cx=w/2, cy=h/2, maxR=Math.min(w,h)*0.46;
  const noiseGlobal = makeNoise(PARAMS.seed);
  const shellCount = Math.max(3, Math.floor(PARAMS.shells));
  const shells = [];
  const points = 260;
  for (let i=0; i<shellCount; i++) {
    const t = shellCount===1?0:i/(shellCount-1);
    const eased = easeOutQuart(t);
    const baseR = maxR * (0.10 + 0.90*eased);
    const palT = 1 - Math.pow(1-t, 0.65);
    const fill = lerpPalette(PALETTE.stops, palT);
    const stroke = darken(fill, 0.22);
    const ramp = Math.pow(1-t, 1.55);
    const fillA = PARAMS.alpha * PALETTE.fillAlphaScale * (0.35 + 1.55*ramp);
    const strokeA = PARAMS.alpha * PALETTE.strokeAlphaScale * (1.15 + 0.9*ramp);
    const noiseShell = makeNoise(PARAMS.seed + i*977 + 31);
    const randShell = mulberry32(PARAMS.seed + i*613 + 7);
    const rot = (randShell()-0.5)*0.55;
    const sx = 1 + (randShell()-0.5)*0.22;
    const sy = (1 + (randShell()-0.5)*0.22) * 0.94;
    const dx = (randShell()-0.5)*baseR*0.08;
    const dy = (randShell()-0.5)*baseR*0.08;
    const scale = PARAMS.noise * (0.9 + 0.5*noiseGlobal(i*0.11,0));
    const warpF = PARAMS.warp * baseR * (0.22 + 0.55*Math.pow(t,0.6));
    const pts = [];
    for (let k=0; k<=points; k++) {
      const a = (k/points)*Math.PI*2 + rot;
      const nx=Math.cos(a)*scale, ny=Math.sin(a)*scale;
      const n1 = noiseShell(nx+12, ny+12);
      const n2 = noiseShell(nx*2.3+40, ny*2.3+40)*0.55;
      const warp = ((n1+n2)/1.55 - 0.5) * 2 * warpF;
      const r = baseR + warp;
      pts.push([cx+dx+r*Math.cos(a)*sx, cy+dy+r*Math.sin(a)*sy]);
    }
    shells.push({ fill, stroke, fillA, strokeA, pts });
  }
  return shells;
}

new p5((p) => {
  p.setup = () => {
    const el = document.getElementById('stage');
    const r = el.getBoundingClientRect();
    p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
    p.createCanvas(r.width, r.height).parent('stage');
    p.noLoop();
    render(p);
  };
  p.windowResized = () => {
    const el = document.getElementById('stage');
    const r = el.getBoundingClientRect();
    p.resizeCanvas(r.width, r.height);
    render(p);
  };
  p.draw = () => render(p);

  function render(p) {
    p.background(PALETTE.ground);
    p.strokeJoin(p.ROUND);
    const shells = buildShells(p.width, p.height);
    for (const s of shells) {
      const [fr,fg,fb] = hexToRgb(s.fill);
      const [sr,sg,sb] = hexToRgb(s.stroke);
      p.fill(fr,fg,fb, Math.round(s.fillA*255));
      p.stroke(sr,sg,sb, Math.round(s.strokeA*255));
      p.strokeWeight(PARAMS.stroke);
      p.beginShape();
      for (const [x,y] of s.pts) p.vertex(x,y);
      p.endShape(p.CLOSE);
    }
  }
});
</script>`,
    palette.ground,
    shareUrl,
  );
}

function chromeSnippet({ values, seed, shareUrl }: Args): string {
  const paletteIdx = Math.max(0, Math.min(CHROME_PALETTES.length - 1, Math.round(values.palette ?? 0)));
  const shapeIdx = Math.max(0, Math.min(CHROME_SHAPES.length - 1, Math.round(values.shape ?? 0)));
  const palette: ChromePalette = CHROME_PALETTES[paletteIdx].id;
  const shape: ChromeShape = CHROME_SHAPES[shapeIdx].id;
  const params = {
    shape,
    palette,
    ior: values.ior ?? 1.5,
    roughness: values.roughness ?? 0.05,
    dispersion: values.dispersion ?? 0.05,
    wobble: values.wobble ?? 0,
    spin: values.spin ?? 0.5,
    seed,
  };
  const paletteSpec = CHROME_PALETTES[paletteIdx];

  return shellCode(
    `assembl · Chrome ${paletteSpec.label} ${shape}`,
    `<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.184.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.184.0/examples/jsm/"
  }
}
</script>
<script type="module">
// assembl creative playground — Chrome / ${paletteSpec.label} ${shape}
// Vanilla three.js, no framework needed. Edit PARAMS or PALETTE to remix.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const PARAMS = ${JSON.stringify(params, null, 2)};
const PALETTE = ${JSON.stringify(paletteSpec, null, 2)};

const stage = document.getElementById('stage');
const w = stage.clientWidth;
const h = stage.clientHeight;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, w/h, 0.1, 100);
camera.position.set(0, 0, 4.2);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
renderer.setSize(w, h);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
stage.appendChild(renderer.domElement);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

scene.add(new THREE.AmbientLight(0xffffff, 0.55));
const l1 = new THREE.DirectionalLight(0xffffff, 1.4); l1.position.set(3,4,3); scene.add(l1);
const l2 = new THREE.DirectionalLight(0xE7F0FF, 0.9); l2.position.set(-4,2,-3); scene.add(l2);
const l3 = new THREE.DirectionalLight(0xFFF3E7, 0.5); l3.position.set(0,-3,2); scene.add(l3);

function makeGeometry(shape) {
  switch (shape) {
    case 'sphere':
    case 'wobble':      return new THREE.SphereGeometry(1.2, 128, 128);
    case 'icosahedron': return new THREE.IcosahedronGeometry(1.3, 1);
    case 'cube':        return new THREE.BoxGeometry(1.7, 1.7, 1.7, 24, 24, 24);
    case 'torus-knot':  return new THREE.TorusKnotGeometry(0.95, 0.32, 200, 32);
    default:            return new THREE.TorusGeometry(1.1, 0.45, 128, 256);
  }
}

const geo = makeGeometry(PARAMS.shape);
const basePositions = new Float32Array(geo.attributes.position.array);
const mat = new THREE.MeshPhysicalMaterial({
  color: PALETTE.color,
  metalness: PALETTE.metalness,
  roughness: PARAMS.roughness,
  ior: PARAMS.ior,
  iridescence: PALETTE.iridescence,
  iridescenceIOR: 1.3,
  iridescenceThicknessRange: [100, 400 + PARAMS.dispersion * 4000],
  clearcoat: PALETTE.clearcoat,
  clearcoatRoughness: PARAMS.roughness,
  envMapIntensity: PALETTE.envIntensity,
});
const mesh = new THREE.Mesh(geo, mat);
const seedRot = ((PARAMS.seed * 9301 + 49297) % 233280) / 233280;
mesh.rotation.set(seedRot * Math.PI, seedRot * Math.PI * 1.3, 0);
mesh.scale.setScalar(PARAMS.shape === 'cube' ? 0.85 : PARAMS.shape === 'icosahedron' ? 0.95 : 1);
scene.add(mesh);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.enablePan = false;

const clock = new THREE.Clock();
function tick() {
  const dt = clock.getDelta();
  mesh.rotation.y += dt * 0.35 * PARAMS.spin;
  mesh.rotation.x += dt * 0.12 * PARAMS.spin;

  if (PARAMS.wobble > 0.01) {
    const pos = geo.attributes.position;
    const arr = pos.array;
    const t = clock.getElapsedTime();
    const amp = PARAMS.wobble * 0.18;
    for (let i = 0; i < pos.count; i++) {
      const bx = basePositions[i*3], by = basePositions[i*3+1], bz = basePositions[i*3+2];
      const wv = Math.sin(bx*3.1+t*1.5) * Math.cos(by*2.6+t*1.1) * Math.sin(bz*2.2+t*0.9);
      const s = 1 + wv * amp;
      arr[i*3] = bx*s; arr[i*3+1] = by*s; arr[i*3+2] = bz*s;
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  }

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

window.addEventListener('resize', () => {
  const w = stage.clientWidth, h = stage.clientHeight;
  camera.aspect = w/h; camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});
</script>`,
    paletteSpec.ground,
    shareUrl,
  );
}

function flowSnippet({ presetId, values, seed, shareUrl }: Args): string {
  const palette = FLOW_PALETTES[presetId] ?? FLOW_PALETTES.silk;
  const params = {
    preset: presetId,
    particles: Math.round(values.particles ?? 800),
    speed: values.speed ?? 0.9,
    noise: values.noise ?? 1.1,
    alpha: values.alpha ?? 0.06,
    stroke: values.stroke ?? 1.0,
    life: Math.round(values.life ?? 220),
    seed,
  };

  return shellCode(
    `assembl · Flow ${presetId}`,
    `<script src="${P5_CDN}"></script>
<script>
// assembl creative playground — Flow / ${presetId}
// Particles drift through a p5 curl-noise field. Runs entirely in your browser.
const PARAMS = ${JSON.stringify(params, null, 2)};
const PALETTE = ${JSON.stringify(palette, null, 2)};

function hexToRgb(h){h=h.replace('#','');return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];}

new p5((p) => {
  let particles = [];
  const noiseScale = 0.0028;
  let w = 0, h = 0;

  function respawnAll() {
    const t = Math.max(20, Math.round(PARAMS.particles));
    particles = Array.from({length: t}, () => ({
      x: Math.random()*w, y: Math.random()*h,
      age: Math.random()*PARAMS.life,
      maxAge: PARAMS.life * (0.6 + Math.random()*0.8),
      colorIndex: Math.floor(Math.random()*PALETTE.stops.length),
    }));
  }

  p.setup = () => {
    const el = document.getElementById('stage');
    const r = el.getBoundingClientRect();
    w = r.width; h = r.height;
    p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
    p.createCanvas(w, h).parent('stage');
    p.noiseSeed(PARAMS.seed);
    p.background(PALETTE.ground);
    p.strokeCap(p.ROUND);
    p.noFill();
    respawnAll();
  };
  p.windowResized = () => {
    const el = document.getElementById('stage');
    const r = el.getBoundingClientRect();
    w = r.width; h = r.height;
    p.resizeCanvas(w, h);
    p.background(PALETTE.ground);
    respawnAll();
  };
  p.draw = () => {
    const [gr,gg,gb] = hexToRgb(PALETTE.ground);
    p.noStroke(); p.fill(gr,gg,gb, 6); p.rect(0,0,w,h);
    p.strokeWeight(PARAMS.stroke);
    for (const q of particles) {
      const nx = q.x*noiseScale*PARAMS.noise, ny = q.y*noiseScale*PARAMS.noise;
      const angle = p.noise(nx, ny, q.colorIndex*0.5) * Math.PI * 4;
      const px = q.x, py = q.y;
      q.x += Math.cos(angle) * PARAMS.speed * 1.4;
      q.y += Math.sin(angle) * PARAMS.speed * 1.4;
      q.age += 1;
      const [r,g,b] = hexToRgb(PALETTE.stops[q.colorIndex % PALETTE.stops.length]);
      p.stroke(r,g,b, PARAMS.alpha*255);
      p.line(px, py, q.x, q.y);
      if (q.age > q.maxAge || q.x < -20 || q.x > w+20 || q.y < -20 || q.y > h+20) {
        q.x = Math.random()*w; q.y = Math.random()*h; q.age = 0;
        q.maxAge = PARAMS.life * (0.6 + Math.random()*0.8);
      }
    }
  };
});
</script>`,
    palette.ground,
    shareUrl,
  );
}

export function buildCodeSnippet(args: Args): string {
  switch (args.family) {
    case 'line':   return lineSnippet(args);
    case 'chrome': return chromeSnippet(args);
    case 'flow':   return flowSnippet(args);
  }
}
