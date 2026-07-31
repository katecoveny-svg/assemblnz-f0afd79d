#!/usr/bin/env node
/**
 * patch-mosaic.mjs — the assembling-mosaic band, fleet-wide.
 *
 * Kate, 2 Aug 2026: "I love the assembling mosaic idea can we put all the
 * treatment to the others please." Same engine as the everyday-rewards
 * flagship: flat editorial tiles that start ghosted and ignite — but here as a
 * portable band, self-themed per demo (generator demos read their own --accent
 * tokens; hand-builts carry verified palettes), with an industry-true tileset
 * per concept. Assembles on scroll, pulses on click, parallax on pointer.
 * Idempotent via mz markers. Giltrap stays MONOCHROME (brand rule).
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const ROOT = '/Users/kateharland/assembl-web/research';

/* ── palettes: hand-built demos carry verified brand colours ─────────────── */
const INK = '#1d1a15', CREAM = '#EFE8D9', WHITE = '#FFFFFF';
const HAND = {
  'assembling-ryman-family':  { A:'#F06022', B:'#1A1917', L:'#FDF5EB' },
  'assembling-summerset':     { A:'#470A68', B:'#8B5CF6', L:'#EDE4F5' },
  'assembling-airnz-cine':    { A:'#00A0AF', B:'#080D1A', L:'#CFEDF0' },
  'assembling-contact-cine':  { A:'#E62A32', B:'#1A1917', L:'#FADDDE' },
  'assembling-woolworths-rewards': { A:'#fd6400', B:'#1E5B2A', L:'#FFE6D1' },
  'assembling-giltrap':       { A:'#FFFFFF', B:'#C9C9C9', L:'#6E6E6E', dark:true },
};

/* ── industry tilesets: 16 tiles [kind, bg, fg, variant?] ────────────────── */
/* A = accent, B = accent-2, L = lift/wash; K = ink, C = cream, W = white     */
function tilesFor(slug, P) {
  const { A, B, L } = P;
  const K = P.dark ? '#101010' : INK, C = P.dark ? '#2A2A2A' : CREAM, W = P.dark ? '#F2F2F2' : WHITE;
  const G = { q: ['quarter', A, 0, 1], q2: ['quarter', B, 0, 3], s: ['semi', L, A], d: ['dots', B, L],
    st: ['stripes', A, L], r: ['ringT', L, B], sp: ['sparkle', K, A], tk: ['tick', B, W], hl: ['hills', L, B] };
  const by = {
    insurance:  [['umbrella', C, A], ['house', B, W], ['moon', K, C], ['key', C, B], ['cloud', L, B], ['shield', A, W]],
    health:     [['crossmed', C, A], ['heart', A, W], ['shield', B, W], ['leaf', L, B], ['clock', C, B], ['teacup', B, L]],
    post:       [['parcel', C, A], ['van', A, W], ['envelope', B, W], ['house', L, B], ['clock', C, B], ['globe', B, L]],
    airline:    [['plane', B, W], ['globe', C, A], ['cloud', L, B], ['ticket', A, W], ['sun', K, A], ['case', C, B]],
    banking:    [['coin', C, A], ['card', B, W], ['chart', L, B], ['percent', A, W], ['clock', C, B], ['shield', B, L]],
    invest:     [['chart', B, W], ['coin', C, A], ['leaf', L, B], ['percent', A, W], ['clock', C, B], ['globe', B, L]],
    energy:     [['bolt', K, A], ['bulb', C, A], ['plug', B, W], ['house', L, B], ['sun', A, W], ['clock', C, B]],
    grocery:    [['apple', C, A], ['milk', K, W], ['egg', B, W], ['carrot', B, A], ['wheat', A, L], ['tomato', C, A]],
    retirement: [['house', A, W], ['tree', C, B], ['teacup', B, L], ['heart', L, A], ['envelope', C, B], ['sun', B, L]],
    property:   [['house', B, W], ['key', C, A], ['door', A, W], ['tag', L, B], ['chart', C, B], ['sun', B, L]],
    marketplace:[['tag', C, A], ['parcel', A, W], ['house', B, W], ['chart', L, B], ['heart', C, A], ['globe', B, L]],
    construction:[['crane', C, B], ['brick', A, W], ['house', B, W], ['tri', L, B], ['stripes', B, L], ['tick', A, W]],
    tax:        [['percent', A, W], ['receipt', C, B], ['coin', B, L], ['chart', L, B], ['clock', C, A], ['tick', B, W]],
    lending:    [['coin', C, A], ['clock', B, W], ['percent', A, W], ['card', L, B], ['chart', C, B], ['tick', B, L]],
    foodbag:    [['pot', B, W], ['carrot', C, A], ['tomato', L, A], ['parcel', A, W], ['leaf', C, B], ['wheat', B, L]],
    money:      [['coin', C, A], ['drop', B, W], ['flower', L, A], ['chart', A, W], ['percent', C, B], ['tick', B, L]],
    auto:       [['car', K, W], ['wheel', C, B], ['key', B, W], ['flag', L, B], ['stripes', B, L], ['road', K, C]],
  };
  const SECTOR = {
    'assembling-tower': 'insurance', 'assembling-aig': 'insurance', 'assembling-southern-cross': 'health',
    'assembling-nzpost': 'post', 'assembling-demo-airline': 'airline', 'assembling-airnz-cine': 'airline',
    'assembling-demo-banking': 'banking', 'assembling-sharesies': 'invest',
    'assembling-demo-energy': 'energy', 'assembling-contact-cine': 'energy', 'assembling-electrickiwi': 'energy',
    'assembling-demo-grocery': 'grocery', 'assembling-woolworths-rewards': 'grocery',
    'assembling-demo-retirement': 'retirement', 'assembling-ryman-family': 'retirement', 'assembling-summerset': 'retirement',
    'assembling-bayleys': 'property', 'assembling-raywhite': 'property', 'assembling-trademe': 'marketplace',
    'assembling-construction': 'construction', 'assembling-hnry': 'tax', 'assembling-instant-finance': 'lending',
    'assembling-myfoodbag': 'foodbag', 'assembling-nectar': 'money', 'assembling-giltrap': 'auto',
  };
  const icons = by[SECTOR[slug] || 'banking'];
  /* 16 slots: icons in the strong seats, geometry between */
  return [
    G.q, icons[0], G.s, icons[1], G.q2,
    icons[2], G.d, icons[3], G.sp, icons[4], G.st, icons[5],
    G.hl, G.r, G.tk, ['quarter', L, 0, 2],
  ];
}

/* ── the engine, injected per page (tiles + palette baked in) ────────────── */
const CSS = `
/* mz:start — the assembling mosaic band */
.mzBand{padding:36px 22px 26px;position:relative}
.mzIn{max-width:1080px;margin:0 auto}
.mzIn svg{display:block;width:min(660px,100%);height:auto;margin:0 auto;font-family:inherit}
.mzT{opacity:var(--mzDorm,.16);filter:saturate(.15) brightness(1.05);transform-box:fill-box;transform-origin:center;transform:scale(.94);
  transition:opacity .55s ease,filter .55s ease,transform .55s cubic-bezier(.2,.9,.3,1.25)}
.mzT.mzLit{opacity:1;filter:none;transform:none}
.mzT.mzPulse{animation:mzP .9s ease}
@keyframes mzP{0%{transform:scale(1)}35%{transform:scale(1.12)}100%{transform:scale(1)}}
.mzCap{text-align:center;margin-top:14px;font:700 10px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
  letter-spacing:.28em;text-transform:uppercase;color:var(--mzCapC,rgba(30,27,20,.55))}
.mzCap b{color:var(--mzCapB,inherit);font-weight:700}
@media (prefers-reduced-motion: reduce){.mzT{transition:none;animation:none}}
/* mz:end */`;

function bandHtml(dark) {
  const capC = dark ? 'rgba(255,255,255,.55)' : 'rgba(30,27,20,.55)';
  return `
<!-- mz:start -->
<section class="mzBand" aria-hidden="true" style="--mzDorm:${dark ? '.12' : '.16'};--mzCapC:${capC}">
  <div class="mzIn"><div id="mzHost"></div>
  <div class="mzCap">watch it assemble &middot; <b>every piece connected</b></div></div>
</section>
<!-- mz:end -->`;
}

function engineJs(tiles) {
  return `
<script>/* mz:start — the assembling mosaic */
(function(){
var host=document.getElementById('mzHost'); if(!host) return;
var NS='http://www.w3.org/2000/svg';
function el(t,a){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);return e}
var U=84;
function rect(g,c){g.appendChild(el('rect',{width:U,height:U,rx:16,fill:c}))}
var KIND={
quarter:function(g,c1,c2,v){g.appendChild(el('path',{d:'M0 0 H84 A84 84 0 0 1 0 84 Z',fill:c1,transform:'rotate('+(90*(v||0))+' 42 42)'}))},
semi:function(g,c1,c2){rect(g,c1);g.appendChild(el('path',{d:'M12 62 A30 30 0 0 1 72 62 Z',fill:c2}))},
dots:function(g,c1,c2){rect(g,c1);for(var y=0;y<3;y++)for(var x=0;x<3;x++)g.appendChild(el('circle',{cx:21+x*21,cy:21+y*21,r:6,fill:c2}))},
stripes:function(g,c1,c2){rect(g,c1);for(var i=0;i<3;i++)g.appendChild(el('rect',{x:14,y:19+i*17,width:56,height:9,rx:4.5,fill:c2}))},
ringT:function(g,c1,c2){rect(g,c1);g.appendChild(el('circle',{cx:42,cy:42,r:21,fill:'none',stroke:c2,'stroke-width':10}))},
tri:function(g,c1,c2){rect(g,c1);g.appendChild(el('path',{d:'M42 15 L73 66 H11 Z',fill:c2}))},
sparkle:function(g,c1,c2){rect(g,c1);g.appendChild(el('path',{d:'M42 6 C46 27 57 38 78 42 C57 46 46 57 42 78 C38 57 27 46 6 42 C27 38 38 27 42 6 Z',fill:c2}))},
hills:function(g,c1,c2){rect(g,c1);g.appendChild(el('path',{d:'M4 74 A26 26 0 0 1 56 74 Z',fill:c2}));g.appendChild(el('path',{d:'M40 74 A20 20 0 0 1 80 74 Z',fill:c2,opacity:.55}))},
tick:function(g,c1,c2){rect(g,c1);g.appendChild(el('path',{d:'M22 44 L37 59 L63 27',stroke:c2,'stroke-width':11,fill:'none','stroke-linecap':'round','stroke-linejoin':'round'}))},
umbrella:function(g,c1,c2){rect(g,c1);g.appendChild(el('path',{d:'M12 42 A30 30 0 0 1 72 42 Z',fill:c2}));g.appendChild(el('path',{d:'M42 42 V64 a7 7 0 0 1 -14 0',stroke:c2,'stroke-width':6,fill:'none','stroke-linecap':'round'}))},
house:function(g,c1,c2){rect(g,c1);g.appendChild(el('path',{d:'M20 44 L42 24 L64 44 V66 H20 Z',fill:c2}));g.appendChild(el('rect',{x:37,y:50,width:10,height:16,fill:c1}))},
moon:function(g,c1,c2){rect(g,c1);g.appendChild(el('path',{d:'M52 16 A26 26 0 1 0 68 58 A21 21 0 0 1 52 16 Z',fill:c2}))},
key:function(g,c1,c2){rect(g,c1);g.appendChild(el('circle',{cx:32,cy:34,r:12,fill:'none',stroke:c2,'stroke-width':8}));g.appendChild(el('path',{d:'M40 42 L60 62 M52 54 L60 46',stroke:c2,'stroke-width':8,'stroke-linecap':'round'}))},
cloud:function(g,c1,c2){rect(g,c1);g.appendChild(el('circle',{cx:32,cy:46,r:13,fill:c2}));g.appendChild(el('circle',{cx:48,cy:40,r:16,fill:c2}));g.appendChild(el('rect',{x:20,y:46,width:44,height:13,rx:6.5,fill:c2}))},
shield:function(g,c1,c2){rect(g,c1);g.appendChild(el('path',{d:'M42 16 L64 24 V44 C64 56 54 64 42 68 C30 64 20 56 20 44 V24 Z',fill:c2}))},
crossmed:function(g,c1,c2){rect(g,c1);g.appendChild(el('path',{d:'M34 18 H50 V34 H66 V50 H50 V66 H34 V50 H18 V34 H34 Z',fill:c2}))},
heart:function(g,c1,c2){rect(g,c1);g.appendChild(el('path',{d:'M42 64 C20 50 16 34 26 26 C33 21 40 24 42 30 C44 24 51 21 58 26 C68 34 64 50 42 64 Z',fill:c2}))},
leaf:function(g,c1,c2){rect(g,c1);g.appendChild(el('path',{d:'M22 62 C22 34 40 20 64 20 C64 48 46 62 22 62 Z',fill:c2}));g.appendChild(el('path',{d:'M26 58 L58 26',stroke:c1,'stroke-width':4}))},
clock:function(g,c1,c2){rect(g,c1);g.appendChild(el('circle',{cx:42,cy:42,r:22,fill:'none',stroke:c2,'stroke-width':7}));g.appendChild(el('path',{d:'M42 30 V42 L52 48',stroke:c2,'stroke-width':6,fill:'none','stroke-linecap':'round'}))},
teacup:function(g,c1,c2){rect(g,c1);g.appendChild(el('path',{d:'M20 34 H56 V48 A16 16 0 0 1 24 48 Z',fill:c2}));g.appendChild(el('path',{d:'M56 36 h8 a6 6 0 0 1 0 14 h-6',stroke:c2,'stroke-width':5,fill:'none'}))},
parcel:function(g,c1,c2){rect(g,c1);g.appendChild(el('rect',{x:20,y:26,width:44,height:36,rx:5,fill:c2}));g.appendChild(el('rect',{x:38,y:26,width:8,height:36,fill:c1,opacity:.55}))},
van:function(g,c1,c2){rect(g,c1);g.appendChild(el('path',{d:'M16 34 H46 V54 H16 Z M46 40 H60 L66 48 V54 H46 Z',fill:c2}));g.appendChild(el('circle',{cx:28,cy:57,r:6,fill:c1,stroke:c2,'stroke-width':4}));g.appendChild(el('circle',{cx:54,cy:57,r:6,fill:c1,stroke:c2,'stroke-width':4}))},
envelope:function(g,c1,c2){rect(g,c1);g.appendChild(el('rect',{x:18,y:28,width:48,height:32,rx:5,fill:c2}));g.appendChild(el('path',{d:'M20 32 L42 48 L64 32',stroke:c1,'stroke-width':4,fill:'none'}))},
globe:function(g,c1,c2){rect(g,c1);g.appendChild(el('circle',{cx:42,cy:42,r:22,fill:'none',stroke:c2,'stroke-width':6}));g.appendChild(el('ellipse',{cx:42,cy:42,rx:10,ry:22,fill:'none',stroke:c2,'stroke-width':4}));g.appendChild(el('path',{d:'M20 42 H64',stroke:c2,'stroke-width':4}))},
plane:function(g,c1,c2){rect(g,c1);g.appendChild(el('path',{d:'M14 50 L70 22 L54 52 L44 48 L34 62 L32 50 Z',fill:c2}))},
sun:function(g,c1,c2){rect(g,c1);g.appendChild(el('circle',{cx:42,cy:42,r:14,fill:c2}));for(var i=0;i<8;i++){var a=i*Math.PI/4;g.appendChild(el('path',{d:'M'+(42+Math.cos(a)*21)+' '+(42+Math.sin(a)*21)+' L'+(42+Math.cos(a)*28)+' '+(42+Math.sin(a)*28),stroke:c2,'stroke-width':5,'stroke-linecap':'round'}))}},
ticket:function(g,c1,c2){rect(g,c1);g.appendChild(el('path',{d:'M18 32 H66 V40 a6 6 0 0 0 0 12 V60 H18 V52 a6 6 0 0 0 0 -12 Z',fill:c2}));g.appendChild(el('path',{d:'M50 32 V60',stroke:c1,'stroke-width':3,'stroke-dasharray':'4 5'}))},
case:function(g,c1,c2){rect(g,c1);g.appendChild(el('rect',{x:20,y:32,width:44,height:30,rx:6,fill:c2}));g.appendChild(el('path',{d:'M34 32 V26 a4 4 0 0 1 4 -4 h8 a4 4 0 0 1 4 4 V32',stroke:c2,'stroke-width':5,fill:'none'}))},
coin:function(g,c1,c2){rect(g,c1);g.appendChild(el('circle',{cx:42,cy:42,r:21,fill:c2}));var t=el('text',{x:42,y:53,'text-anchor':'middle','font-size':30,'font-weight':800,fill:c1});t.textContent='$';g.appendChild(t)},
card:function(g,c1,c2){rect(g,c1);g.appendChild(el('rect',{x:16,y:28,width:52,height:32,rx:6,fill:c2}));g.appendChild(el('rect',{x:16,y:36,width:52,height:7,fill:c1,opacity:.6}))},
chart:function(g,c1,c2){rect(g,c1);[[20,46,16],[36,36,26],[52,24,38]].forEach(function(b){g.appendChild(el('rect',{x:b[0],y:b[1]+18,width:12,height:b[2],rx:3,fill:c2}))})},
percent:function(g,c1,c2){rect(g,c1);g.appendChild(el('circle',{cx:30,cy:30,r:8,fill:'none',stroke:c2,'stroke-width':6}));g.appendChild(el('circle',{cx:54,cy:54,r:8,fill:'none',stroke:c2,'stroke-width':6}));g.appendChild(el('path',{d:'M24 60 L60 24',stroke:c2,'stroke-width':6,'stroke-linecap':'round'}))},
receipt:function(g,c1,c2){rect(g,c1);g.appendChild(el('path',{d:'M24 16 H60 V60 L54 66 L48 60 L42 66 L36 60 L30 66 L24 60 Z',fill:c2}));[26,36,46].forEach(function(y){g.appendChild(el('rect',{x:30,y:y,width:24,height:4,rx:2,fill:c1,opacity:.6}))})},
bolt:function(g,c1,c2){rect(g,c1);g.appendChild(el('path',{d:'M46 14 L24 46 H38 L34 70 L60 36 H44 Z',fill:c2}))},
bulb:function(g,c1,c2){rect(g,c1);g.appendChild(el('circle',{cx:42,cy:38,r:16,fill:c2}));g.appendChild(el('rect',{x:35,y:54,width:14,height:12,rx:4,fill:c2}))},
plug:function(g,c1,c2){rect(g,c1);g.appendChild(el('rect',{x:28,y:30,width:28,height:22,rx:6,fill:c2}));g.appendChild(el('path',{d:'M34 30 V18 M50 30 V18',stroke:c2,'stroke-width':6,'stroke-linecap':'round'}));g.appendChild(el('path',{d:'M42 52 V66',stroke:c2,'stroke-width':6,'stroke-linecap':'round'}))},
tree:function(g,c1,c2){rect(g,c1);g.appendChild(el('circle',{cx:42,cy:36,r:17,fill:c2}));g.appendChild(el('rect',{x:38,y:48,width:8,height:18,rx:3,fill:c2}))},
door:function(g,c1,c2){rect(g,c1);g.appendChild(el('rect',{x:26,y:20,width:32,height:46,rx:5,fill:c2}));g.appendChild(el('circle',{cx:51,cy:44,r:3.5,fill:c1}))},
tag:function(g,c1,c2){rect(g,c1);g.appendChild(el('path',{d:'M24 24 H46 L64 42 L46 60 H24 Z',fill:c2,transform:'rotate(-8 42 42)'}));g.appendChild(el('circle',{cx:33,cy:33,r:4,fill:c1}))},
crane:function(g,c1,c2){rect(g,c1);g.appendChild(el('path',{d:'M26 66 V22 H60 M60 22 V32 M40 22 V30',stroke:c2,'stroke-width':6,fill:'none','stroke-linecap':'round'}));g.appendChild(el('rect',{x:54,y:36,width:12,height:10,rx:2,fill:c2}))},
brick:function(g,c1,c2){rect(g,c1);[[18,26],[46,26],[32,40],[18,54],[46,54]].forEach(function(p){g.appendChild(el('rect',{x:p[0],y:p[1],width:22,height:11,rx:2.5,fill:c2}))})},
pot:function(g,c1,c2){rect(g,c1);g.appendChild(el('path',{d:'M22 36 H62 V48 A18 14 0 0 1 22 48 Z',fill:c2}));g.appendChild(el('path',{d:'M16 36 h52 M30 28 c4 -6 20 -6 24 0',stroke:c2,'stroke-width':5,fill:'none','stroke-linecap':'round'}))},
drop:function(g,c1,c2){rect(g,c1);g.appendChild(el('path',{d:'M42 14 C52 30 60 40 60 50 A18 18 0 0 1 24 50 C24 40 32 30 42 14 Z',fill:c2}))},
flower:function(g,c1,c2){rect(g,c1);for(var i=0;i<5;i++){var a=i*2*Math.PI/5-Math.PI/2;g.appendChild(el('circle',{cx:42+Math.cos(a)*13,cy:42+Math.sin(a)*13,r:9,fill:c2}))}g.appendChild(el('circle',{cx:42,cy:42,r:7,fill:c1}))},
car:function(g,c1,c2){rect(g,c1);g.appendChild(el('path',{d:'M14 52 L20 40 C24 32 32 28 42 28 C52 28 60 32 66 40 L70 52 V58 H14 Z',fill:c2}));g.appendChild(el('circle',{cx:28,cy:58,r:7,fill:c1,stroke:c2,'stroke-width':4}));g.appendChild(el('circle',{cx:56,cy:58,r:7,fill:c1,stroke:c2,'stroke-width':4}))},
wheel:function(g,c1,c2){rect(g,c1);g.appendChild(el('circle',{cx:42,cy:42,r:22,fill:'none',stroke:c2,'stroke-width':9}));g.appendChild(el('circle',{cx:42,cy:42,r:5,fill:c2}));for(var i=0;i<5;i++){var a=i*2*Math.PI/5;g.appendChild(el('path',{d:'M42 42 L'+(42+Math.cos(a)*16)+' '+(42+Math.sin(a)*16),stroke:c2,'stroke-width':4}))}},
flag:function(g,c1,c2){rect(g,c1);g.appendChild(el('path',{d:'M26 66 V18',stroke:c2,'stroke-width':6,'stroke-linecap':'round'}));g.appendChild(el('path',{d:'M30 20 H60 L52 30 L60 40 H30 Z',fill:c2}))},
road:function(g,c1,c2){rect(g,c1);g.appendChild(el('path',{d:'M20 70 L36 14 M64 70 L48 14',stroke:c2,'stroke-width':6,'stroke-linecap':'round'}));g.appendChild(el('path',{d:'M42 62 V50 M42 40 V28',stroke:c2,'stroke-width':5,'stroke-dasharray':'8 8'}))},
apple:function(g,c1,c2){rect(g,c1);g.appendChild(el('circle',{cx:42,cy:49,r:21,fill:c2}));g.appendChild(el('rect',{x:40,y:19,width:4,height:11,rx:2,fill:c2}));g.appendChild(el('ellipse',{cx:53,cy:24,rx:9,ry:4.5,fill:c2,opacity:.7,transform:'rotate(-28 53 24)'}))},
milk:function(g,c1,c2){rect(g,c1);g.appendChild(el('path',{d:'M28 34 L35 19 H49 L56 34 V64 A5 5 0 0 1 51 69 H33 A5 5 0 0 1 28 64 Z',fill:c2}))},
egg:function(g,c1,c2){rect(g,c1);g.appendChild(el('ellipse',{cx:42,cy:38,rx:15,ry:19,fill:c2}));g.appendChild(el('path',{d:'M20 50 A22 20 0 0 0 64 50 Z',fill:c2,opacity:.55}))},
carrot:function(g,c1,c2){rect(g,c1);g.appendChild(el('path',{d:'M42 74 L29 30 H55 Z',fill:c2}));g.appendChild(el('path',{d:'M34 24 L42 12 M42 26 L42 10 M50 24 L42 12',stroke:c2,'stroke-width':5,'stroke-linecap':'round',fill:'none',opacity:.75}))},
wheat:function(g,c1,c2){rect(g,c1);g.appendChild(el('rect',{x:40,y:14,width:4,height:57,rx:2,fill:c2}));[24,38,52].forEach(function(y){g.appendChild(el('path',{d:'M42 '+y+' L28 '+(y-9),stroke:c2,'stroke-width':7,'stroke-linecap':'round'}));g.appendChild(el('path',{d:'M42 '+y+' L56 '+(y-9),stroke:c2,'stroke-width':7,'stroke-linecap':'round'}))})},
tomato:function(g,c1,c2){rect(g,c1);g.appendChild(el('circle',{cx:42,cy:47,r:20,fill:c2}));g.appendChild(el('path',{d:'M42 20 L37 30 M42 20 L42 31 M42 20 L47 30',stroke:c2,'stroke-width':5,'stroke-linecap':'round',fill:'none',opacity:.7}))}
};
var SLOTS=[[1,0],[2,0],[3,0],[4,0],[5,0],[0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[1,2],[2,2],[4,2],[5,2]];
var TILES=__TILES__;
var svg=el('svg',{viewBox:'0 0 678 302','aria-hidden':'true'});
var layer=el('g',{}); svg.appendChild(layer);
var tiles=[];
SLOTS.forEach(function(s,i){
  var t=TILES[i]; if(!t) return;
  var pos=el('g',{transform:'translate('+(s[0]*94+10)+' '+(s[1]*94+10)+')'});
  var g=el('g',{'class':'mzT'});
  (KIND[t[0]]||KIND.quarter)(g,t[1],t[2],t[3]);
  pos.appendChild(g); layer.appendChild(pos); tiles.push(g);
});
host.appendChild(svg);
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var started=false;
function ignite(){
  if(started) return; started=true;
  if(reduce){ tiles.forEach(function(t){t.classList.add('mzLit')}); return; }
  var order=tiles.map(function(t,i){return i}).sort(function(a,b){
    return Math.abs(a-tiles.length/2)-Math.abs(b-tiles.length/2)});
  order.slice(0,6).forEach(function(i,k){ setTimeout(function(){tiles[i].classList.add('mzLit')},250+k*140); });
  var next=6, iv=setInterval(function(){
    if(next>=order.length){clearInterval(iv);return;}
    tiles[order[next++]].classList.add('mzLit');
  },1500);
}
if('IntersectionObserver' in window){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){ignite();io.disconnect();}})},{threshold:.25});
  io.observe(host);
  setTimeout(ignite,9000);
}else ignite();
document.addEventListener('click',function(){
  if(reduce) return;
  var lit=tiles.filter(function(t){return t.classList.contains('mzLit')});
  if(!lit.length) return;
  var t=lit[Math.floor(Math.random()*lit.length)];
  t.classList.remove('mzPulse'); requestAnimationFrame(function(){t.classList.add('mzPulse')});
  setTimeout(function(){t.classList.remove('mzPulse')},950);
});
var band=host.closest('.mzBand'),bx=0,by=0,px=0,py=0;
if(band){ /* dark pages get the light caption + fainter ghosts, computed not guessed */
  var bgc=(getComputedStyle(document.body).backgroundColor||'').match(/\\d+/g);
  if(bgc&&bgc.length>=3){
    var lum=(bgc[0]*.299+bgc[1]*.587+bgc[2]*.114)/255;
    if(lum<.45){band.style.setProperty('--mzCapC','rgba(255,255,255,.6)');
      band.style.setProperty('--mzDorm','.12');}
  }
}
if(band&&!reduce){
  band.addEventListener('pointermove',function(e){var r=band.getBoundingClientRect();
    bx=((e.clientX-r.left)/r.width-.5)*10; by=((e.clientY-r.top)/r.height-.5)*6;});
  band.addEventListener('pointerleave',function(){bx=0;by=0});
  (function drift(){requestAnimationFrame(drift);px+=(bx-px)*.07;py+=(by-py)*.07;
    layer.setAttribute('transform','translate('+px.toFixed(2)+' '+py.toFixed(2)+')');})();
}
})();/* mz:end */</script>`;
}

/* ── patch one file ──────────────────────────────────────────────────────── */
function accentOf(s, name, fb) {
  const m = s.match(new RegExp('--' + name + '\\s*:\\s*([^;\\}]+)'));
  return m ? m[1].trim() : fb;
}
function patch(dir) {
  const f = `${ROOT}/${dir}/index.html`;
  if (!existsSync(f)) { console.log('SKIP (no file)', dir); return false; }
  let s = readFileSync(f, 'utf8');
  s = s.replace(/\n?\/\* mz:start[\s\S]*?mz:end \*\//g, '')
       .replace(/\n?<!-- mz:start -->[\s\S]*?<!-- mz:end -->/g, '')
       .replace(/\n?<script>\/\* mz:start[\s\S]*?mz:end \*\/<\/script>/g, '');
  const P = HAND[dir] || {
    A: accentOf(s, 'accent', '#fd6400'),
    B: accentOf(s, 'accent-2', '#1d1a15'),
    L: accentOf(s, 'accent-lift', '#EFE8D9'),
  };
  const tiles = tilesFor(dir, P);
  /* CSS into the last </style> */
  const style = s.lastIndexOf('</style>');
  if (style === -1) { console.log('SKIP (no style)', dir); return false; }
  s = s.slice(0, style) + CSS + '\n' + s.slice(style);
  /* band after first </header>, else after last sp4 block, else after body */
  const band = bandHtml(!!P.dark);
  const h = s.indexOf('</header>');
  if (h !== -1) s = s.slice(0, h + 9) + band + s.slice(h + 9);
  else {
    const sp = s.lastIndexOf('<!-- sp4:end -->');
    if (sp !== -1) { const e = sp + '<!-- sp4:end -->'.length; s = s.slice(0, e) + band + s.slice(e); }
    else { const b = s.match(/<body[^>]*>/); const e = s.indexOf(b[0]) + b[0].length; s = s.slice(0, e) + band + s.slice(e); }
  }
  /* engine before </body> */
  const js = engineJs().replace('__TILES__', JSON.stringify(tiles));
  s = s.slice(0, s.lastIndexOf('</body>')) + js + '\n' + s.slice(s.lastIndexOf('</body>'));
  writeFileSync(f, s);
  console.log('mosaic →', dir, P.dark ? '(dark mono)' : `(${P.A})`);
  return true;
}

const FLEET = [
  'assembling-ryman-family', 'assembling-summerset', 'assembling-airnz-cine', 'assembling-contact-cine',
  'assembling-aig', 'assembling-bayleys', 'assembling-construction', 'assembling-demo-airline',
  'assembling-demo-banking', 'assembling-demo-energy', 'assembling-demo-grocery', 'assembling-demo-retirement',
  'assembling-electrickiwi', 'assembling-hnry', 'assembling-instant-finance', 'assembling-myfoodbag',
  'assembling-nectar', 'assembling-nzpost', 'assembling-raywhite', 'assembling-sharesies',
  'assembling-southern-cross', 'assembling-tower', 'assembling-trademe', 'assembling-woolworths-rewards',
  'assembling-giltrap',
];
let n = 0;
for (const d of FLEET) if (patch(d)) n++;
console.log(`\n${n}/${FLEET.length} patched`);
