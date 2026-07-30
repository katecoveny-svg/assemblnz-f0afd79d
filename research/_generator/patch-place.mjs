/**
 * patch-place.mjs — put the Pascal-authored place into the five hand-built
 * concept pages.
 *
 * Kate, 30 July 2026: "can we use the pascal function for the demos as well and
 * start building out tower woolworths and summerset and ryman with the pascal
 * wow and the others too".
 *
 * The seventeen generated demos get their place from build.mjs, which owns their
 * three.js scene. These five each carry a bespoke scene instead, so rather than
 * operating on five different renderers this injects a self-contained one: its
 * own canvas, its own camera, its own lights, namespaced pl*.
 *
 * WHY IT IS A SECTION AND NOT A BACKGROUND
 * A building behind the text is decoration. The lit room in each place is the
 * argument of the page: the lounge the water came through, the care wing on the
 * same site, the room whose dimensions decide whether her furniture fits. So the
 * place gets a section, a caption naming the lit room, and drag to orbit. A buyer
 * who turns it themselves believes it.
 *
 * IDEMPOTENT. Looks for `id="place"`.
 *
 * INSERTION RULES, same two traps as the other patchers:
 *   - CSS into the HEAD sheet: the LAST `</style>` BEFORE `</head>`.
 *   - Markup before the LAST `</body>`; the first one on the Woolworths build is
 *     inside a JS template literal.
 *
 * Run: node patch-place.mjs
 */
import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const RESEARCH = resolve(HERE, '..');
const PLACES = resolve(RESEARCH, '_pascal', 'places');
const THREE_SRC = resolve(RESEARCH, 'assembling-summerset', 'three.min.js');

const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const f = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const mix = (hex, target, amt) => '#' + [1, 3, 5].map((i) => {
  const a = parseInt(hex.slice(i, i + 2), 16), b = parseInt(target.slice(i, i + 2), 16);
  return Math.round(a + (b - a) * amt).toString(16).padStart(2, '0');
}).join('');

/**
 * One entry per hand-built page. `ground` says whether the page sits on paper or
 * on ink, because the wall material has to change: mirror-metal on a light
 * ground blows flat faces to white and the building disappears.
 */
const CLIENTS = [
  {
    dir: 'assembling-woolworths-rewards', project: 'assembling-woolworths-rewards',
    place: 'woolworths', accent: '#00713C', ground: 'paper',
    kick: 'The floor, and where the draft lands',
    title: 'Everything the concept drafts ends up in one 4.6-metre bay.',
    lede: 'A store floor authored as real architecture: the perimeter, six aisle runs, the chiller wall, and the collect bay lit in green. The draft basket the phone above builds has to physically arrive somewhere, and this is the somewhere. Drag it around.',
    litName: 'The collect bay',
    litSay: 'Roughly 4.6 by 4.4 metres. A drafted basket becomes a real pick, in a real bay, at a real store. Nothing about the concept works if that bay is already the bottleneck, which is the first thing a pilot would measure.',
  },
  {
    dir: 'assembling-ryman-family', project: 'assembling-ryman-family',
    place: 'ryman', accent: '#F06022', ground: 'paper',
    kick: 'The villa, in metres',
    title: 'Will her dining table fit? Nobody in this category answers that.',
    lede: 'One villa, authored from a floorplan as walls and slabs rather than drawn as a picture. The living room is lit and it measures 6.0 by 5.4 metres. That number is the question every family asks on the second visit and gets an eyebrow in response. Drag the plan around.',
    litName: 'The living room, 6.0 × 5.4 m',
    litSay: 'A two-seater and a three-seater, her sideboard, and turning room for a walker beside the chair. Villages publish floorplans as PDFs and let families guess. A measurable model answers it in one line, and the answer belongs in the information pack.',
  },
  {
    dir: 'assembling-summerset', project: 'assembling-summerset',
    place: 'summerset', accent: '#470A68', ground: 'paper',
    kick: 'The site, and the answer to the deepest fear',
    title: 'The care wing is on the same ground as her villa.',
    lede: 'Four villas, a community centre, and the care wing lit in purple. The shape carries the argument: the question “what if she gets worse and we have to move her again” is answered by a site plan, and a paragraph cannot do it. Drag it around and look at the distance.',
    litName: 'Care, same site',
    litSay: 'Summerset publishes that a health-driven transfer to a serviced apartment or care suite requires no additional upfront payment. Put that sentence next to this plan and the family can see what it means: she walks a path she already knows.',
  },
  {
    dir: 'assembling-giltrap', project: 'assembling-giltrap',
    place: 'giltrap', accent: '#3A3A3A', ground: 'ink',
    kick: 'The showroom, and the wait inside it',
    title: 'Four plinths, one glass frontage, and a delivery bay that decides the week.',
    lede: 'A showroom authored as real architecture. The delivery bay is lit, because the wait this concept is about happens there: between a car arriving on site and a customer being told it has. Drag it around.',
    litName: 'The delivery bay',
    litSay: 'Seven by five and a half metres, behind the service wall. Stock lands here and the marketing operation finds out later. The concept flips that order, and the campaign starts from what is physically on the floor.',
  },
  {
    dir: 'assembling-airnz-v1plus', project: 'assembling-airnz',
    place: 'airnz', accent: '#007A85', ground: 'ink',
    kick: 'The pier, and the gate that matters',
    title: 'Five gates. Only one of them is your connection.',
    lede: 'A pier authored as architecture, with your connecting gate lit. A disruption screen that names a gate is useful; a plan that shows you how far away it is, and whether you can walk it in the time you have, is the thing nobody builds. Drag it around.',
    litName: 'Your connection',
    litSay: 'Nine metres by five and a half, at the far end of the pier. Never Airpoints and never koru on this page: those are real names. What the concept adds is distance and time, drawn from the plan the airport already has.',
  },
];

function styleFor(c) {
  const a = c.accent;
  const paper = c.ground === 'paper';
  const bg = paper ? mix(a, '#FBFAF7', 0.955) : mix(a, '#0B0B0E', 0.9);
  const ink = paper ? '#141416' : '#F2F2F0';
  const ink2 = paper ? '#4A4A52' : 'rgba(242,242,240,.8)';
  const kick = paper ? (lum(a) > 0.34 ? mix(a, '#000000', 0.45) : a) : mix(a, '#FFFFFF', 0.4);
  return `
/* ═══ THE PLACE · authored in Pascal, injected by _generator/patch-place.mjs ═══
   Its own canvas, camera and lights, namespaced pl* so it cannot collide with
   whatever three.js scene this page already runs. Kate, 30 July 2026. */
#place{background:${bg};color:${ink};padding:88px 0 94px;position:relative;z-index:3;overflow:hidden}
#place .plWrap{max-width:1200px;margin:0 auto;padding:0 30px}
@media(min-width:1700px){#place .plWrap{max-width:min(82vw,1560px)}}
#place .plKick{font-size:10.5px;letter-spacing:.22em;text-transform:uppercase;font-weight:800;
  color:${kick};margin-bottom:16px}
#place h2{font-size:clamp(27px,3.7vw,44px);font-weight:800;letter-spacing:-.03em;line-height:1.07;
  color:${ink};margin:0;max-width:26ch}
#place .plLede{margin-top:18px;font-size:clamp(15px,1.35vw,17.5px);line-height:1.62;color:${ink2};
  font-weight:300;max-width:64ch}
#place .plGrid{display:grid;grid-template-columns:1.25fr .85fr;gap:38px;margin-top:44px;align-items:center}
@media(max-width:960px){#place .plGrid{grid-template-columns:1fr;gap:26px}}
#place .plStage{position:relative;border-radius:22px;overflow:hidden;aspect-ratio:16/11;
  background:radial-gradient(ellipse at 52% 44%,${mix(a, paper ? '#FFFFFF' : '#000000', 0.78)} 0%,${mix(a, paper ? '#FFFFFF' : '#000000', 0.93)} 68%);
  border:1px solid ${paper ? 'rgba(0,0,0,.09)' : 'rgba(242,242,240,.14)'};
  box-shadow:inset 0 1px 0 ${paper ? 'rgba(255,255,255,.7)' : 'rgba(255,255,255,.05)'};
  cursor:grab;touch-action:none}
#place .plStage:active{cursor:grabbing}
#place canvas.plCanvas{display:block;width:100%;height:100%}
#place .plHint{position:absolute;left:18px;bottom:16px;font-size:10.5px;letter-spacing:.14em;
  text-transform:uppercase;font-weight:700;color:${paper ? 'rgba(20,20,22,.45)' : 'rgba(242,242,240,.5)'};
  pointer-events:none;transition:opacity .4s}
#place .plHint.gone{opacity:0}
#place .plCard{border-left:3px solid ${a};padding:2px 0 2px 22px}
#place .plCardK{font-size:10px;letter-spacing:.2em;text-transform:uppercase;font-weight:800;color:${kick}}
#place .plCard b{display:block;font-size:clamp(19px,2.1vw,25px);font-weight:800;letter-spacing:-.025em;
  color:${ink};margin:9px 0 11px;line-height:1.18}
#place .plCard p{font-size:14.5px;line-height:1.66;color:${ink2};font-weight:300}
#place .plMeta{margin-top:22px;padding-top:16px;border-top:1px solid ${paper ? 'rgba(0,0,0,.1)' : 'rgba(242,242,240,.14)'};
  font-size:11.5px;line-height:1.62;color:${paper ? '#75757E' : 'rgba(242,242,240,.5)'}}
#place .plMeta b{color:${ink};font-weight:600}
`;
}

function sectionFor(c, boxes) {
  const walls = boxes.filter((b) => ['wall', 'shell', 'inner', 'villa', 'centre', 'care'].includes(b.k)).length;
  return `
<!-- ═══ THE PLACE · injected by _generator/patch-place.mjs ═══ -->
<section id="place"><div class="plWrap">
  <p class="plKick">${esc(c.kick)}</p>
  <h2>${esc(c.title)}</h2>
  <p class="plLede">${esc(c.lede)}</p>
  <div class="plGrid">
    <div class="plStage" id="plStage">
      <canvas class="plCanvas" id="plCanvas"></canvas>
      <span class="plHint" id="plHint">drag to turn it</span>
    </div>
    <div>
      <div class="plCard">
        <div class="plCardK">the part that matters</div>
        <b>${esc(c.litName)}</b>
        <p>${esc(c.litSay)}</p>
      </div>
      <p class="plMeta"><b>Where this geometry came from.</b> ${walls} walls and the floor plates were
      authored in the Pascal Editor&rsquo;s own schemas and measured in metres, not sketched. Pascal is
      MIT-licensed and open source. The same pipeline reads a real IFC file exported from Revit or
      ArchiCAD, which is what makes this a working method rather than an illustration.</p>
    </div>
  </div>
</div></section>
`;
}

function scriptFor(c, boxes) {
  const paper = c.ground === 'paper';
  return `
<script src="three.min.js"></script>
<script>
/* ═══ THE PLACE ════════════════════════════════════════════════════════════
   A self-contained renderer for the Pascal-authored building. Own scene, own
   camera, own lights, so nothing here touches whatever 3D this page already
   runs. Drag to orbit; it idles slowly until you do.

   Materials: matte on a light ground. Mirror metal on paper blows flat faces to
   white and the whole building vanishes, which is a trap this fleet has already
   fallen into once. */
(function place(){
  var BOXES=${JSON.stringify(boxes)};
  var ACCENT=${JSON.stringify(c.accent)}, PAPER=${paper ? 'true' : 'false'};
  var cv=document.getElementById('plCanvas'), stage=document.getElementById('plStage');
  if(!cv||!stage||typeof THREE==='undefined') return;

  var ren=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});
  ren.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
  var sc=new THREE.Scene();
  var cam=new THREE.PerspectiveCamera(34,1,0.1,200);

  sc.add(new THREE.HemisphereLight(PAPER?0xffffff:0x9fb0c4, PAPER?0xd8d4cc:0x0a0c10, PAPER?0.95:0.7));
  var key=new THREE.DirectionalLight(0xffffff, PAPER?1.05:1.7);
  key.position.set(5,9,6); sc.add(key);
  var fill=new THREE.DirectionalLight(new THREE.Color(ACCENT), PAPER?0.35:0.6);
  fill.position.set(-6,3,-4); sc.add(fill);

  var wallM=new THREE.MeshStandardMaterial({color:PAPER?0xEDEBE6:0xC2C7CE,
    metalness:0.05,roughness:PAPER?0.68:0.55,envMapIntensity:PAPER?0.8:1.1});
  var floorM=new THREE.MeshStandardMaterial({color:PAPER?0xDCD8D1:0x2E3238,
    metalness:0.03,roughness:0.82});
  /* The site ground needs its OWN value. On the village it was within a few
     percent of the wall colour, the key light blew both to white, and eight
     villas disappeared into the lawn. A darker ground makes the buildings read. */
  var groundM=new THREE.MeshStandardMaterial({color:PAPER?0xB8B2A8:0x1C2026,
    metalness:0.02,roughness:0.9});
  var fitM=new THREE.MeshStandardMaterial({color:PAPER?0xD2CEC6:0x828992,
    metalness:0.08,roughness:0.6});
  /* Emissive fights the key light and washes a saturated accent toward yellow,
     which is what happened to Ryman's orange. Keep the colour, drop the glow to
     a hint, and let the surface be lit rather than lighting itself. */
  var litM=new THREE.MeshStandardMaterial({color:new THREE.Color(ACCENT),
    emissive:new THREE.Color(ACCENT),emissiveIntensity:PAPER?0.10:0.34,
    metalness:0.02,roughness:0.55});
  var pick={wall:wallM,shell:wallM,inner:wallM,villa:wallM,centre:wallM,care:wallM,
    glass:fitM,aisle:fitM,chiller:fitM,checkout:fitM,dock:fitM,spine:fitM,bridge:fitM,
    plinth:fitM,floor:floorM,ground:groundM,slab:floorM,lit:litM};

  var g=new THREE.Group();
  for(var i=0;i<BOXES.length;i++){
    var b=BOXES[i];
    var m=new THREE.Mesh(new THREE.BoxGeometry(b.s[0],b.s[1],b.s[2]),
      b.lit?litM:(pick[b.k]||wallM));
    m.position.set(b.p[0],b.p[1],b.p[2]);
    m.rotation.y=b.ry||0;
    g.add(m);
  }
  sc.add(g);

  /* Look DOWN onto the plan. The walls stand in y and the plan lies in x/z, so a
     camera at eye level sees a fence. This sits above and swings around. */
  var yaw=-0.62, pitch=0.82, dist=7.4;
  function place3(){
    cam.position.set(
      Math.sin(yaw)*Math.cos(pitch)*dist,
      Math.sin(pitch)*dist,
      Math.cos(yaw)*Math.cos(pitch)*dist);
    cam.lookAt(0,0.5,0);
  }

  function fit(){
    var r=stage.getBoundingClientRect();
    if(!r.width) return;
    ren.setSize(r.width,r.height,false);
    cam.aspect=r.width/Math.max(1,r.height); cam.updateProjectionMatrix();
  }
  window.addEventListener('resize',fit); fit();

  /* drag to orbit */
  var drag=false, lx=0, ly=0, touched=false;
  var hint=document.getElementById('plHint');
  stage.addEventListener('pointerdown',function(e){
    drag=true; lx=e.clientX; ly=e.clientY;
    if(!touched){touched=true; if(hint) hint.classList.add('gone')}
  });
  window.addEventListener('pointerup',function(){drag=false});
  window.addEventListener('pointermove',function(e){
    if(!drag) return;
    yaw-=(e.clientX-lx)*0.007;
    pitch=Math.max(0.16,Math.min(1.44,pitch+(e.clientY-ly)*0.005));
    lx=e.clientX; ly=e.clientY;
  });

  var running=false;
  var io=new IntersectionObserver(function(es){
    es.forEach(function(en){ running=en.isIntersecting });
  },{threshold:0.05});
  io.observe(stage);

  var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  (function loop(){
    requestAnimationFrame(loop);
    if(!running) return;
    if(!drag && !reduce) yaw+=0.0016;
    place3();
    ren.render(sc,cam);
  })();
})();
</script>
`;
}

/* ── run ──────────────────────────────────────────────────────────────────── */
let done = 0;
for (const c of CLIENTS) {
  const path = resolve(RESEARCH, c.dir, 'index.html');
  if (!existsSync(path)) { console.log(`  ${c.dir}: no index.html`); continue; }
  let h = readFileSync(path, 'utf8');
  if (h.includes('id="place"')) { console.log(`  ${c.dir}: already patched`); continue; }

  const bf = resolve(PLACES, `${c.place}.boxes.json`);
  if (!existsSync(bf)) { console.log(`  ${c.dir}: no place ${c.place}.boxes.json`); continue; }
  const boxes = JSON.parse(readFileSync(bf, 'utf8'));

  /* three.js has to be beside the page. Two of these five did not ship it. */
  const three = resolve(RESEARCH, c.dir, 'three.min.js');
  if (!existsSync(three)) { copyFileSync(THREE_SRC, three); }

  const headEnd = h.indexOf('</head>');
  const si = h.lastIndexOf('</style>', headEnd);
  if (si === -1) { console.log(`  ${c.dir}: no <style> in <head>`); continue; }
  h = h.slice(0, si) + styleFor(c) + h.slice(si);

  const bi = h.lastIndexOf('</body>');
  if (bi === -1) { console.log(`  ${c.dir}: no </body>`); continue; }
  h = h.slice(0, bi) + sectionFor(c, boxes) + scriptFor(c, boxes) + h.slice(bi);

  writeFileSync(path, h);
  const lit = boxes.filter((b) => b.lit).length;
  console.log(`  ✓ ${c.dir.padEnd(32)} ${c.place.padEnd(11)} ${String(boxes.length).padStart(3)} boxes, ` +
    `${lit} lit, ${c.ground}  → ${c.project}`);
  done++;
}
console.log(`\npatched ${done} of ${CLIENTS.length}`);
