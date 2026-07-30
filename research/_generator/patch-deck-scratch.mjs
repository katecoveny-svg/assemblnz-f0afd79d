/**
 * patch-deck-scratch.mjs — bring the hand-built concept pages up to the two
 * things Kate asked for on 30 July 2026:
 *
 *   "can you put the scratch on all and make it their brand colour also the six
 *    step wait i want these 3d glow and to pop from the page with visuals like
 *    they are on a phone i also like the thin rim around the phone screen and a
 *    phone they can click through be creative!"
 *
 * The generated fleet gets both from build.mjs. The six hand-built pages do not
 * go through the generator, so they get the same two modules injected here.
 *
 * WHAT IT INJECTS
 *   1. The wait deck — the six waits as six screens on one tilting phone with a
 *      hairline rim and a pool of the client's own colour behind it, clicked
 *      through rather than read across. Only where a waitmap exists.
 *   2. The scratch card — brand-coloured foil, derived from the client's accent
 *      rather than assembl's champagne, which is what made the one playable
 *      thing on the page look like it belonged to us instead of to them.
 *
 * The old flat six-card band (`.wm-grid`, injected by patch-handbuilt.mjs) is
 * hidden rather than deleted: it is the no-JS fallback, so a crawler or a
 * scripting-off reader still gets all six waits as text.
 *
 * IDEMPOTENT. Re-running is a no-op — it looks for `id="deck6"`.
 *
 * INSERTION RULES, learned the hard way and worth keeping:
 *   - CSS goes in the HEAD sheet: the LAST `</style>` BEFORE `</head>`. The
 *     Woolworths build has a stray trailing <style> after its first </body>.
 *   - Markup goes before the LAST `</body>`. The FIRST one on that page is
 *     inside a JS template literal for a printable document.
 *
 * Run: node patch-deck-scratch.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const RESEARCH = resolve(HERE, '..');

const esc = (t) =>
  String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
const js = (v) => JSON.stringify(v ?? null);

/** hex → 0..1 relative luminance, good enough to pick ink or paper against. */
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const f = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const mix = (hex, target, amt) => '#' + [1, 3, 5].map((i) => {
  const a = parseInt(hex.slice(i, i + 2), 16);
  const b = parseInt(target.slice(i, i + 2), 16);
  return Math.round(a + (b - a) * amt).toString(16).padStart(2, '0');
}).join('');

/**
 * The canonical build per lead — NOT the superseded ones. patch-handbuilt.mjs
 * still points at assembling-ryman and assembling-woolworths-v1plus, which is
 * how those two ended up on the old band while their replacements had nothing.
 */
const CLIENTS = [
  { slug: 'woolworths-rewards', dir: 'assembling-woolworths-rewards', project: 'assembling-woolworths-rewards',
    accent: '#00713C', map: null, // its wait is the bespoke live shop, not a six-band
    reward: ['+3 min', '120 pts', 'a straight answer', 'one less trip', '+5 min', 'the week planned'],
    rewardFor: 'minutes at the end of a Thursday' },

  { slug: 'ryman-family', dir: 'assembling-ryman-family', project: 'assembling-ryman-family',
    accent: '#F06022', map: null,
    /* Kate asked for the scratch on every demo. In retirement it cannot be a
       prize, so the reward is the thing a family actually wants back: reading
       they do not have to do, and answers nobody would give them. No points,
       no dollar values, nothing that reads as a game. */
    reward: ['12 min of reading', 'a straight answer', 'the clause, quoted', '9 min of reading', 'one less phone call', 'the number, in dollars'],
    rewardFor: 'minutes of a 42-page document you were going to read yourself' },

  { slug: 'summerset', dir: 'assembling-summerset', project: 'assembling-summerset',
    accent: '#470A68', map: 'summerset',
    reward: ['14 min of reading', 'the fee, in dollars', 'a straight answer', 'the clause, quoted', '8 min of reading', 'one less phone call'],
    rewardFor: 'minutes of a disclosure statement nobody hands you' },

  { slug: 'giltrap', dir: 'assembling-giltrap', project: 'assembling-giltrap',
    accent: '#000000', accentOverride: '#3A3A3A', map: 'giltrap',
    reward: ['+4 min', 'the brief, drafted', 'a straight answer', 'one less meeting', '+7 min', 'the stock list, ready'],
    rewardFor: 'minutes between the enquiry and the reply' },

  { slug: 'airnz', dir: 'assembling-airnz-v1plus', project: 'assembling-airnz',
    accent: '#007A85', map: 'airnz',
    /* Never Airpoints, never koru — those are real names and not ours to spend. */
    reward: ['+6 min', 'the connection, checked', 'a straight answer', 'one less queue', '+11 min', 'the next option, held'],
    rewardFor: 'minutes at a gate where the board just changed' },

  { slug: 'contact', dir: 'assembling-contact-cine', project: 'assembling-contact',
    accent: '#E62A32', map: 'contact',
    reward: ['+5 min', 'the bill, explained', 'a straight answer', 'one less call', '+9 min', 'the plan, worked out'],
    rewardFor: 'minutes between using the power and knowing the cost' },
];

/* ── the two modules, as one injectable block ─────────────────────────────── */

function styleFor(c) {
  const accent = c.accentOverride || c.accent;
  const onAccent = lum(accent) > 0.42 ? '#101012' : '#FFFFFF';
  const mapInk = lum(accent) > 0.34 ? mix(accent, '#000000', 0.5) : accent;
  const scr = mix(accent, '#0B0B0E', 0.82);
  /* the on-screen accent, lifted where the brand colour is too dark to read on
     a near-black phone screen — Summerset's purple and Giltrap's charcoal both
     disappear otherwise. The glow pool outside the phone keeps the true colour. */
  const sa = lum(accent) < 0.14 ? mix(accent, '#FFFFFF', 0.58)
           : lum(accent) < 0.24 ? mix(accent, '#FFFFFF', 0.34) : accent;
  return `
/* ═══ THE WAIT DECK + THE BRAND-COLOURED SCRATCH ═══════════════════════════
   Injected by _generator/patch-deck-scratch.mjs. Kate, 30 July 2026. Namespaced
   under #deck6 so it cannot collide with anything this page already ships. */
#deck6{--d6a:${accent};--d6on:${onAccent};--d6ink:${mapInk};--d6scr:${scr};
  --d6rim:${mix(accent, '#000000', 0.42)}cc;--d6rim2:${mix(accent, '#FFFFFF', 0.30)};--d6sa:${sa};
  background:${mix(accent, '#FBFAF7', 0.955)};color:#141416;
  padding:86px 0 92px;position:relative;overflow:hidden}
#deck6 .d6wrap{max-width:1200px;margin:0 auto;padding:0 30px}
@media(min-width:1700px){#deck6 .d6wrap{max-width:min(82vw,1560px)}}
#deck6 .d6kick{font-size:10.5px;letter-spacing:.22em;text-transform:uppercase;font-weight:800;
  color:var(--d6ink);margin-bottom:16px}
#deck6 h2{font-size:clamp(28px,4vw,46px);font-weight:800;letter-spacing:-.03em;line-height:1.06;
  color:#101012;margin:0;max-width:22ch}
#deck6 .d6lede{margin-top:18px;font-size:clamp(15px,1.35vw,18px);line-height:1.62;color:#43434B;
  font-weight:300;max-width:62ch}

#deck6 .d6grid{display:grid;grid-template-columns:280px 1fr;gap:40px;margin-top:46px;align-items:start}
@media(max-width:980px){#deck6 .d6grid{grid-template-columns:1fr;gap:28px}}

#deck6 .d6rail{display:flex;flex-direction:column;gap:2px;position:relative}
#deck6 .d6rail::before{content:"";position:absolute;left:16px;top:22px;bottom:22px;width:1px;
  background:linear-gradient(180deg,transparent,rgba(0,0,0,.16) 12%,rgba(0,0,0,.16) 88%,transparent)}
#deck6 .d6r{display:flex;gap:14px;align-items:flex-start;background:transparent;border:0;
  padding:11px 12px 11px 0;text-align:left;cursor:pointer;font-family:inherit;position:relative;
  border-radius:12px;transition:background .3s}
#deck6 .d6r:hover{background:rgba(0,0,0,.035)}
#deck6 .d6rn{flex:0 0 auto;width:33px;height:33px;border-radius:50%;display:grid;place-items:center;
  font-size:11px;font-weight:900;background:#FFF;color:#8A8A93;border:1px solid rgba(0,0,0,.14);
  position:relative;z-index:2;transition:.36s cubic-bezier(.2,.7,.2,1)}
#deck6 .d6r b{display:block;font-size:14.5px;font-weight:700;color:#3C3C44;line-height:1.25;transition:color .3s}
#deck6 .d6r i{display:block;font-style:normal;font-size:11.5px;color:#8A8A93;margin-top:3px;line-height:1.4}
#deck6 .d6r.on .d6rn{background:var(--d6ink);color:#FFF;border-color:var(--d6ink);
  box-shadow:0 0 0 5px rgba(0,0,0,.05),0 8px 18px -8px var(--d6ink)}
#deck6 .d6r.on b{color:#101012}
#deck6 .d6r.done .d6rn{background:var(--d6ink);color:#FFF;border-color:var(--d6ink);opacity:.32}

#deck6 .d6stage{position:relative;padding:10px 0 0;perspective:1500px}
#deck6 .d6glow{position:absolute;left:50%;top:44%;width:min(560px,86%);height:340px;
  transform:translate(-50%,-50%);background:radial-gradient(ellipse at center,var(--d6a) 0%,transparent 68%);
  opacity:.24;filter:blur(48px);pointer-events:none;animation:d6pulse 6.5s ease-in-out infinite}
@keyframes d6pulse{0%,100%{opacity:.18;transform:translate(-50%,-50%) scale(1)}
  50%{opacity:.32;transform:translate(-50%,-50%) scale(1.07)}}

#deck6 .d6phone{position:relative;width:min(330px,82vw);margin:0 auto;transform-style:preserve-3d;
  transform:rotateY(var(--d6y,-13deg)) rotateX(var(--d6x,7deg));
  transition:transform .5s cubic-bezier(.2,.7,.2,1);animation:d6float 7s ease-in-out infinite}
@keyframes d6float{0%,100%{translate:0 0}50%{translate:0 -11px}}
#deck6 .d6phone.grab{transition:transform .12s linear;animation-play-state:paused}
#deck6 .d6shell{position:relative;border-radius:44px;padding:11px;
  background:linear-gradient(155deg,#3b3f45 0%,#14171a 46%,#2b2f33 74%,#0e1013 100%);
  box-shadow:0 2px 0 rgba(255,255,255,.14) inset,0 0 0 1px rgba(0,0,0,.7),
    0 0 0 2.5px var(--d6rim),0 44px 90px -30px rgba(0,0,0,.72),0 90px 130px -50px var(--d6a)}
/* the thin rim between body and glass — the machined edge */
#deck6 .d6rim{border-radius:34px;padding:1.5px;
  background:linear-gradient(160deg,var(--d6rim2),rgba(255,255,255,.06) 40%,var(--d6rim2))}
#deck6 .d6screen{border-radius:33px;overflow:hidden;min-height:452px;display:flex;flex-direction:column;
  cursor:pointer;position:relative;background:linear-gradient(172deg,var(--d6scr) 0%,#08080B 100%)}
#deck6 .d6screen::after{content:"";position:absolute;inset:0;pointer-events:none;border-radius:33px;
  background:linear-gradient(122deg,rgba(255,255,255,.09) 0%,transparent 34%,transparent 66%,rgba(255,255,255,.045) 100%)}
#deck6 .d6bar{display:flex;align-items:center;justify-content:space-between;padding:13px 20px 6px;
  font-size:10px;letter-spacing:.06em;color:rgba(242,242,240,.62);font-weight:500}
#deck6 .d6notch{width:52px;height:15px;border-radius:99px;background:#050507}
#deck6 .d6sig{display:flex;gap:2.5px;align-items:flex-end}
#deck6 .d6sig i{display:block;width:2.5px;background:rgba(242,242,240,.6);border-radius:1px}
#deck6 .d6sig i:nth-child(1){height:4px}#deck6 .d6sig i:nth-child(2){height:6px}
#deck6 .d6sig i:nth-child(3){height:8px}#deck6 .d6sig i:nth-child(4){height:10px}
#deck6 .d6body{flex:1;padding:20px 22px 14px;display:flex;flex-direction:column}
#deck6 .d6when{font-size:9.5px;letter-spacing:.19em;text-transform:uppercase;font-weight:800;
  color:var(--d6sa);margin-bottom:11px}
#deck6 .d6title{font-size:21px;font-weight:700;letter-spacing:-.02em;line-height:1.2;
  color:#F2F2F0;margin-bottom:16px}
#deck6 .d6line{font-size:13px;color:rgba(242,242,240,.8);font-weight:300;line-height:1.5;
  padding:7px 0 7px 16px;position:relative;opacity:0;animation:d6in .5s cubic-bezier(.2,.7,.2,1) forwards}
#deck6 .d6line::before{content:"";position:absolute;left:0;top:14px;width:5px;height:5px;border-radius:50%;
  background:var(--d6sa);box-shadow:0 0 8px var(--d6sa)}
@keyframes d6in{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:none}}
#deck6 .d6chip{align-self:flex-start;margin-top:20px;font-size:10.5px;font-weight:800;letter-spacing:.05em;
  background:var(--d6a);color:var(--d6on);border-radius:999px;padding:7px 14px;
  opacity:0;animation:d6in .5s cubic-bezier(.2,.7,.2,1) .34s forwards}
#deck6 .d6foot{margin-top:auto;padding-top:18px;border-top:1px solid rgba(242,242,240,.1);
  display:flex;align-items:center;gap:9px;font-size:10px;letter-spacing:.1em;text-transform:uppercase;
  font-weight:700;color:rgba(242,242,240,.42)}
#deck6 .d6foot span{width:5px;height:5px;border-radius:50%;background:var(--d6sa);flex:0 0 auto;
  box-shadow:0 0 7px var(--d6sa);animation:d6blink 2.6s ease-in-out infinite}
@keyframes d6blink{0%,100%{opacity:.35}50%{opacity:1}}
#deck6 .d6nav{display:flex;align-items:center;justify-content:space-between;padding:12px 18px 20px}
#deck6 .d6arrow{background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.16);color:#F2F2F0;
  width:36px;height:36px;border-radius:50%;font-size:15px;cursor:pointer;font-family:inherit;
  display:grid;place-items:center;transition:.25s;padding:0}
#deck6 .d6arrow:hover{background:var(--d6sa);border-color:var(--d6sa);color:#0B0B0E}
#deck6 .d6arrow[disabled]{opacity:.26;cursor:default}
#deck6 .d6dots{display:flex;gap:7px}
#deck6 .d6dot{width:7px;height:7px;border-radius:50%;background:rgba(242,242,240,.26);cursor:pointer;
  border:0;padding:0;transition:.3s}
#deck6 .d6dot.on{background:var(--d6sa);box-shadow:0 0 10px var(--d6sa);transform:scale(1.35)}
#deck6 .d6hint{position:absolute;left:50%;bottom:-38px;transform:translateX(-50%);white-space:nowrap;
  font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;font-weight:700;color:var(--d6ink);
  opacity:.72;animation:d6hint 2.4s ease-in-out infinite;pointer-events:none}
@keyframes d6hint{0%,100%{opacity:.34;transform:translateX(-50%) translateY(0)}
  50%{opacity:.85;transform:translateX(-50%) translateY(4px)}}
#deck6 .d6hint.gone{display:none}
#deck6 .d6cap{margin:58px auto 0;max-width:62ch;text-align:center}
#deck6 .d6feels{font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;font-weight:800;color:#8A8A93}
#deck6 .d6del{margin-top:9px;font-size:16px;color:#25252C;font-weight:300;line-height:1.62}
#deck6 .d6fund{margin-top:16px;padding-top:14px;border-top:1px solid rgba(0,0,0,.1);
  font-size:12.5px;color:#5E5E68;font-weight:300;line-height:1.5}
#deck6 .d6fund i{font-style:normal;font-size:9.5px;letter-spacing:.16em;text-transform:uppercase;
  font-weight:800;color:var(--d6ink);margin-right:8px}

/* the scratch, in their colour */
#deck6 .d6sc{background:#0D0D0F;border-radius:22px;padding:26px;margin-top:56px;
  max-width:520px;margin-left:auto;margin-right:auto}
#deck6 .d6sck{font-size:10px;letter-spacing:.22em;text-transform:uppercase;font-weight:800;
  color:var(--d6sa);margin-bottom:15px}
#deck6 .d6scStage{position:relative;height:200px;border-radius:15px;overflow:hidden;
  background:linear-gradient(160deg,var(--d6scr),#08080A)}
#deck6 .d6scWin{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;
  justify-content:center;text-align:center;padding:20px}
#deck6 .d6scK{font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:rgba(242,242,240,.55);font-weight:800}
#deck6 .d6scV{font-size:clamp(24px,4.4vw,36px);font-weight:900;letter-spacing:-.03em;color:var(--d6sa);
  margin:9px 0 7px;line-height:1.05}
#deck6 .d6scS{font-size:12px;color:rgba(242,242,240,.62);font-weight:300;line-height:1.45;max-width:32ch}
#deck6 .d6coat{position:absolute;inset:0;width:100%;height:100%;cursor:grab;touch-action:none}
#deck6 .d6coat:active{cursor:grabbing}
#deck6 .d6scNote{font-size:11.5px;color:rgba(242,242,240,.5);font-weight:300;line-height:1.55;margin-top:15px}
#deck6 .d6again{margin-top:13px;background:transparent;border:1px solid rgba(242,242,240,.25);
  color:#F2F2F0;border-radius:999px;padding:9px 18px;font-size:12px;font-weight:700;
  font-family:inherit;cursor:pointer}
#deck6 .d6again:hover{border-color:var(--d6a);color:var(--d6a)}
@keyframes d6pop{0%{transform:scale(.9);opacity:0}60%{transform:scale(1.04)}100%{transform:scale(1);opacity:1}}
@media(prefers-reduced-motion:reduce){
  #deck6 .d6phone,#deck6 .d6glow,#deck6 .d6hint{animation:none}
  #deck6 .d6phone{transform:none}
  #deck6 .d6line,#deck6 .d6chip{animation:none;opacity:1}
}
/* the flat six-card band this replaces stays in the DOM as the no-JS fallback,
   hidden only once the deck has actually mounted */
body.d6-live #waitmap .wm-grid{display:none}
`;
}

function sectionFor(c, wm) {
  const heading = wm
    ? `<div class="d6kick">Every waiting moment</div>
     <h2>${esc(wm.title)}</h2>
     <p class="d6lede">${esc(wm.lede)}</p>`
    : `<div class="d6kick">The value exchange</div>
     <h2>Something worth their attention, in the window they were losing anyway.</h2>
     <p class="d6lede">Not a discount and not a spinner. The wait itself carries something back &mdash;
     and because it is playable rather than described, it is a thing you do on this page rather than a
     claim you have to take on trust.</p>`;

  const deck = wm ? `
    <div class="d6grid">
      <div class="d6rail" role="tablist" aria-label="The six waits">
        ${wm.moments.map((m, i) => `
        <button class="d6r${i === 0 ? ' on' : ''}" type="button" role="tab" data-i="${i}"
          aria-selected="${i === 0 ? 'true' : 'false'}">
          <span class="d6rn">${String(i + 1).padStart(2, '0')}</span>
          <span><b>${esc(m.name)}</b><i>${esc(m.when)}</i></span>
        </button>`).join('')}
      </div>
      <div class="d6stage">
        <div class="d6glow" aria-hidden="true"></div>
        <div class="d6phone" id="d6phone">
          <div class="d6shell"><div class="d6rim">
            <div class="d6screen" id="d6screen" role="button" tabindex="0"
              aria-label="The wait screens — click for the next moment">
              <div class="d6bar">
                <span>9:41</span><span class="d6notch" aria-hidden="true"></span>
                <span class="d6sig" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
              </div>
              <div class="d6body" id="d6body"></div>
              <div class="d6nav">
                <button class="d6arrow" id="d6prev" type="button" aria-label="Previous wait">&larr;</button>
                <div class="d6dots" id="d6dots"></div>
                <button class="d6arrow" id="d6next" type="button" aria-label="Next wait">&rarr;</button>
              </div>
            </div>
          </div></div>
          <div class="d6hint" id="d6hint">tap the screen &mdash; six waits</div>
        </div>
        <div class="d6cap" id="d6cap"></div>
      </div>
    </div>` : '';

  return `
<!-- ═══ THE WAIT DECK + THE SCRATCH · injected by patch-deck-scratch.mjs ═══ -->
<section id="deck6"><div class="d6wrap">
  ${heading}
  ${deck}
  <div class="d6sc">
    <div class="d6sck">the value exchange, playable</div>
    <div class="d6scStage">
      <div class="d6scWin" id="d6scWin">
        <div class="d6scK">you earned</div>
        <div class="d6scV" id="d6scV">&mdash;</div>
        <div class="d6scS">for the ${esc(c.rewardFor)}</div>
      </div>
      <canvas class="d6coat" id="d6coat"></canvas>
    </div>
    <p class="d6scNote">Running for real on this page. Drag to scratch it. Nothing is collected and
    nothing is sent &mdash; it is here so the idea is something you do rather than something you read.</p>
    <button class="d6again" id="d6again" type="button">scratch another</button>
  </div>
</div></section>
`;
}

function scriptFor(c, wm) {
  const accent = c.accentOverride || c.accent;
  const foil = [mix(accent, '#000000', 0.30), mix(accent, '#FFFFFF', 0.52), mix(accent, '#000000', 0.10)];
  const foilInk = lum(accent) > 0.42 ? '#141410' : '#FFFFFF';
  return `
<script>
/* ═══ THE WAIT DECK + THE BRAND SCRATCH ═══════════════════════════════════
   Injected by _generator/patch-deck-scratch.mjs — the same two modules the
   generated fleet gets from build.mjs, namespaced d6* for these hand-built
   pages. Kate, 30 July 2026. */
(function(){
  var WAITS=${wm ? js(wm.moments) : 'null'};
  var FOIL=${js(foil)}, FOILINK=${js(foilInk)};
  var REWARDS=${js(c.reward)};
  function esc(t){var d=document.createElement('div');d.textContent=t==null?'':String(t);return d.innerHTML}

  /* ── the deck ─────────────────────────────────────────────────────────── */
  if(WAITS && WAITS.length){
    var body=document.getElementById('d6body'), cap=document.getElementById('d6cap'),
        dots=document.getElementById('d6dots'), screen=document.getElementById('d6screen'),
        phone=document.getElementById('d6phone'), hint=document.getElementById('d6hint'),
        prev=document.getElementById('d6prev'), next=document.getElementById('d6next'),
        rail=[].slice.call(document.querySelectorAll('#deck6 .d6r'));
    if(body && screen){
      /* only hide the flat fallback band once the deck is genuinely running */
      document.body.classList.add('d6-live');
      var i=0, touched=false;
      dots.innerHTML=WAITS.map(function(m,n){
        return '<button class="d6dot'+(n?'':' on')+'" type="button" data-i="'+n+'" aria-label="Wait '+(n+1)+'"></button>';
      }).join('');

      function render(){
        var m=WAITS[i];
        body.innerHTML='<div class="d6when">'+esc(m.when)+'</div>'+
          '<div class="d6title">'+esc(m.screen.title)+'</div>'+
          '<div>'+m.screen.lines.map(function(l,n){
            return '<div class="d6line" style="animation-delay:'+(0.06+n*0.09).toFixed(2)+'s">'+esc(l)+'</div>';
          }).join('')+'</div>'+
          '<div class="d6chip">'+esc(m.screen.chip)+'</div>'+
          '<div class="d6foot"><span></span>drafted \\u00b7 held for a person</div>';
        cap.innerHTML='<div class="d6feels">the wait feels like '+esc(m.feels)+'</div>'+
          '<p class="d6del">'+esc(m.delivered)+'</p>'+
          '<div class="d6fund"><i>who funds it</i>'+esc(m.funder)+'</div>';
        rail.forEach(function(b,n){
          b.classList.toggle('on',n===i); b.classList.toggle('done',n<i);
          b.setAttribute('aria-selected', n===i?'true':'false');
        });
        [].forEach.call(dots.children,function(d,n){d.classList.toggle('on',n===i)});
        prev.disabled=i===0; next.disabled=i===WAITS.length-1;
      }
      function go(n,human){
        i=(n+WAITS.length)%WAITS.length;
        if(human&&!touched){touched=true;hint.classList.add('gone')}
        render();
      }
      screen.addEventListener('click',function(e){
        if(e.target.closest('.d6arrow, .d6dot')) return;
        go(i+1>=WAITS.length?0:i+1,true);
      });
      screen.addEventListener('keydown',function(e){
        if(e.key==='Enter'||e.key===' '){e.preventDefault();go(i+1>=WAITS.length?0:i+1,true)}
        if(e.key==='ArrowRight'){e.preventDefault();go(i+1,true)}
        if(e.key==='ArrowLeft'){e.preventDefault();go(i-1,true)}
      });
      prev.addEventListener('click',function(e){e.stopPropagation();go(i-1,true)});
      next.addEventListener('click',function(e){e.stopPropagation();go(i+1,true)});
      [].forEach.call(dots.children,function(d){
        d.addEventListener('click',function(e){e.stopPropagation();go(+d.dataset.i,true)});
      });
      rail.forEach(function(b){b.addEventListener('click',function(){go(+b.dataset.i,true)})});

      /* the tilt reads off the STAGE, so the phone does not run from the cursor */
      var stage=phone.closest('.d6stage');
      if(stage && matchMedia('(hover:hover)').matches && !matchMedia('(prefers-reduced-motion:reduce)').matches){
        stage.addEventListener('pointermove',function(e){
          var r=stage.getBoundingClientRect();
          var px=(e.clientX-r.left)/r.width-.5, py=(e.clientY-r.top)/r.height-.5;
          phone.classList.add('grab');
          phone.style.setProperty('--d6y',(-13+px*22).toFixed(2)+'deg');
          phone.style.setProperty('--d6x',(7-py*14).toFixed(2)+'deg');
        });
        stage.addEventListener('pointerleave',function(){
          phone.classList.remove('grab');
          phone.style.removeProperty('--d6y'); phone.style.removeProperty('--d6x');
        });
      }
      render();
    }
  }

  /* ── the scratch, in their own colour ─────────────────────────────────── */
  var cv=document.getElementById('d6coat'); if(!cv) return;
  var win=document.getElementById('d6scWin'), val=document.getElementById('d6scV'),
      again=document.getElementById('d6again');
  var ctx=cv.getContext('2d'), W=0,H=0,dpr=1, revealed=false, drawing=false;
  function fit(){
    var r=cv.getBoundingClientRect(); dpr=Math.min(2,window.devicePixelRatio||1);
    W=r.width; H=r.height; cv.width=Math.max(1,W*dpr); cv.height=Math.max(1,H*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0); coat();
  }
  function coat(){
    ctx.globalCompositeOperation='source-over'; ctx.clearRect(0,0,W,H);
    var g=ctx.createLinearGradient(0,0,W,H);
    g.addColorStop(0,FOIL[0]); g.addColorStop(.5,FOIL[1]); g.addColorStop(1,FOIL[2]);
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='rgba(0,0,0,.07)';
    for(var x=-14;x<W;x+=26) ctx.fillRect(x,0,13,H);
    ctx.fillStyle=FOILINK; ctx.textAlign='center';
    ctx.font='700 13px system-ui,sans-serif'; ctx.fillText('SCRATCH TO REVEAL',W/2,H/2-3);
    ctx.font='300 12px system-ui,sans-serif'; ctx.fillText('drag across the panel',W/2,H/2+17);
    ctx.globalCompositeOperation='destination-out';
  }
  function at(e){var r=cv.getBoundingClientRect();var t=e.touches&&e.touches[0]?e.touches[0]:e;
    return [t.clientX-r.left,t.clientY-r.top]}
  function rub(e){
    if(!drawing||revealed) return;
    var p=at(e); ctx.beginPath(); ctx.arc(p[0],p[1],23,0,Math.PI*2); ctx.fill(); check();
    if(e.cancelable) e.preventDefault();
  }
  function check(){
    var d=ctx.getImageData(0,0,cv.width,cv.height).data, clear=0, total=0;
    for(var i2=3;i2<d.length;i2+=4*64){total++; if(d[i2]<40) clear++}
    if(total && clear/total>0.46) reveal();
  }
  function reveal(){
    revealed=true; cv.style.transition='opacity .5s ease'; cv.style.opacity='0';
    cv.style.pointerEvents='none'; win.style.animation='d6pop .5s cubic-bezier(.22,.61,.36,1) both';
  }
  function reset(){
    revealed=false; drawing=false;
    val.textContent=REWARDS[Math.floor(Math.random()*REWARDS.length)];
    cv.style.transition='none'; cv.style.opacity='1'; cv.style.pointerEvents='auto';
    win.style.animation='none'; coat();
  }
  cv.addEventListener('pointerdown',function(e){drawing=true;rub(e)});
  window.addEventListener('pointerup',function(){drawing=false});
  cv.addEventListener('pointermove',rub,{passive:false});
  if(again) again.addEventListener('click',reset);
  window.addEventListener('resize',function(){if(!revealed) fit()});
  val.textContent=REWARDS[Math.floor(Math.random()*REWARDS.length)];
  fit();
})();
</script>
`;
}

/* ── run ──────────────────────────────────────────────────────────────────── */
let done = 0;
for (const c of CLIENTS) {
  const path = resolve(RESEARCH, c.dir, 'index.html');
  if (!existsSync(path)) { console.log(`  ${c.slug}: no ${c.dir}/index.html — skipped`); continue; }
  let h = readFileSync(path, 'utf8');
  if (h.includes('id="deck6"')) { console.log(`  ${c.slug}: already patched`); continue; }

  let wm = null;
  if (c.map) {
    const f = resolve(HERE, 'waitmaps', `${c.map}.mjs`);
    if (existsSync(f)) wm = (await import(`file://${f}`)).default;
    else console.log(`  ${c.slug}: ⚠️  no waitmap ${c.map}.mjs — scratch only`);
  }

  /* CSS into the HEAD sheet — the last </style> BEFORE </head>, never the last
     in the file (the Woolworths build has a stray trailing sheet). */
  const headEnd = h.indexOf('</head>');
  const si = h.lastIndexOf('</style>', headEnd);
  if (si === -1) { console.log(`  ${c.slug}: ✗ no <style> in <head> — skipped`); continue; }
  h = h.slice(0, si) + styleFor(c) + h.slice(si);

  /* markup + script before the LAST </body> — the first is inside a JS
     template literal on at least one of these pages. */
  const bi = h.lastIndexOf('</body>');
  if (bi === -1) { console.log(`  ${c.slug}: ✗ no </body> — skipped`); continue; }
  h = h.slice(0, bi) + sectionFor(c, wm) + scriptFor(c, wm) + h.slice(bi);

  writeFileSync(path, h);
  console.log(`  ✓ ${c.slug.padEnd(20)} ${wm ? 'deck (6 waits) + scratch' : 'scratch only'}  ${c.accentOverride || c.accent}  → ${c.project}`);
  done++;
}
console.log(`\npatched ${done} of ${CLIENTS.length}`);
