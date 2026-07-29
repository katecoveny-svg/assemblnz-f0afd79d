#!/usr/bin/env node
/**
 * patch-handbuilt.mjs — give the three hand-built demos the rest of the treatment.
 *
 * Woolworths, Ryman and Summerset predate the generator, so a rebuild does not
 * reach them. This injects the same three things the generated fleet got:
 *
 *   1. the six-moment wait map for that sector
 *   2. the scratch card, playable
 *   3. accept-the-pilot, with what a pilot actually asks of them
 *
 * These pages are already LIGHT, so the band is not the dark-page inversion the
 * seventeen use. It is a tinted surface with white cards and dark phone screens —
 * the contrast comes from the screens, not from flipping the page.
 *
 * Every class is `wm-` prefixed: these pages already own .card, .chip, .step and
 * .grid2, and a collision would silently restyle their existing sections.
 *
 * Idempotent — re-running is a no-op.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const RESEARCH = resolve(HERE, '..');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Mix two hex colours. Used to derive the band from the brand, not a second palette. */
const mix = (a, b, t) => '#' + [1, 3, 5].map((i) => {
  const x = parseInt(a.slice(i, i + 2), 16), y = parseInt(b.slice(i, i + 2), 16);
  return Math.round(x + (y - x) * t).toString(16).padStart(2, '0');
}).join('');

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const CLIENTS = [
  {
    /* Giltrap is MONOCHROME — black and white, with champagne as the only
       accent the page allows itself. The band therefore sits on warm grey
       rather than a brand tint, and the accent is the champagne already in use. */
    slug: 'giltrap', dir: 'assembling-giltrap', map: 'giltrap',
    accent: '#BFA37A', surface: '#F5F3EF', line: '#E4E0D8', ink: '#141414', muted: '#6F6B64',
    short: 'Giltrap',
    before: '<div class="narrow rise" style="margin-top:62px">',
    pilotScope: 'Two marques and one dealer principal, for six weeks. Live-inventory campaign ideas, the CI guard, and the meeting loop. Not media buying, and not the whole group.',
    pilotAccess: 'One scheduled stock export, your group brand guidelines and two distributor CI packs, and read-only Meta and GA4. No DMS write access, no customer data, no spend authority.',
    pilotScorecard: 'Drafts accepted without rewrite. Campaign ideas a dealer principal actually ran. Compliance flags a person agreed with. Time from a DP asking to the work landing. And the one that matters: would that dealer principal be annoyed if you switched it off?',
    acceptEg: 'e.g. different marques, a different dealer principal, a shorter window, no Meta or GA4 access at all\u2026',
  },
  {
    slug: 'ryman', dir: 'assembling-ryman', map: 'ryman',
    accent: '#F06022', surface: '#FDF5EB', line: '#E7E0D6', ink: '#191919', muted: '#7B736C',
    short: 'Ryman',
    before: '<section id="fit"',
    pilotScope: 'One village and one family journey, for six weeks — the guides moment and the first fortnight after someone moves in. Not the whole group, and nothing to do with care.',
    pilotAccess: 'Your already-published lifestyle and financial guides, and a named person in sales or resident experience. No resident data, no care records, no clinical systems, nothing that writes.',
    pilotScorecard: 'Drafts an adviser sends without rewriting them. Questions answered before a phone call was needed. Whether a family felt less alone in the decision. And the one that matters: would that adviser be annoyed if you switched it off?',
    acceptEg: 'e.g. a different village, a shorter window, a different approver, nothing near the first fortnight…',
  },
  {
    slug: 'summerset', dir: 'assembling-summerset', map: 'summerset',
    accent: '#470A68', surface: '#F6F2F7', line: '#E6DFEA', ink: '#1F1A24', muted: '#7A7280',
    short: 'Summerset',
    before: '<section id="fit"',
    pilotScope: 'One village and one decision journey, for six weeks — from the information pack through to the ninety days after moving in. Not the whole portfolio, and nothing to do with care.',
    pilotAccess: 'Your published information pack, the fee documents and the Summerset Sure terms, and a named person in sales. No resident data, no care records, nothing that writes.',
    pilotScorecard: 'Drafts an adviser sends without rewriting them. Questions a family got answered without waiting for a callback. Whether the ninety days felt supported rather than watched. And: would that adviser be annoyed if you switched it off?',
    acceptEg: 'e.g. a different village, a shorter window, start at the pack and stop at settlement, a different approver…',
  },
  {
    slug: 'woolworths', dir: 'assembling-woolworths-v1plus', map: 'woolworths',
    accent: '#00713C', surface: '#F4F6F1', line: '#E2E5DC', ink: '#1A1918', muted: '#6F7268',
    short: 'Woolworths',
    before: '<footer',
    pilotScope: 'One wait moment and one customer segment, for six weeks — the online delivery window. Not the whole loyalty stack, and nothing that touches the trolley.',
    pilotAccess: 'Read-only access to the wait events your app already emits, your Everyday Rewards points rules, and your brand and legal guidelines. No customer data leaves your environment and nothing writes to a points balance.',
    pilotScorecard: 'Drafts a CX lead ships without rewriting them. Whether the wait felt shorter to the people actually in it. Points issued that a named person approved. And: would that lead be annoyed if you switched it off?',
    acceptEg: 'e.g. a different wait moment, a shorter window, no points at all in round one, a different approver…',
  },
];

const css = (c) => {
  const scr = mix(c.accent, '#0B0B0E', 0.78);
  const onAccent = lum(c.accent) > 0.42 ? '#101012' : '#FFFFFF';
  const bandTint = mix(c.accent, c.surface, 0.965);
  return `
/* ── the wait map, the scratch and the yes ───────────────────────────────
   Injected by _generator/patch-handbuilt.mjs. This page is already light, so
   the band is a tinted surface rather than the dark-page inversion the
   generated demos use — the contrast lives in the phone screens. All classes
   are wm- prefixed because this page already owns .card, .chip and .step. */
.wm-band{background:${bandTint};border-top:1px solid ${c.line};border-bottom:1px solid ${c.line};padding:76px 0 82px;margin:56px 0}
.wm-kick{font-size:10.5px;letter-spacing:.24em;text-transform:uppercase;font-weight:700;color:${c.accent};margin-bottom:16px;display:flex;align-items:center;gap:12px}
.wm-kick::before{content:"";width:30px;height:1px;background:${c.accent};opacity:.7}
.wm-h{font-size:clamp(29px,4.4vw,50px);font-weight:800;letter-spacing:-.03em;line-height:1.04;color:${c.ink};margin:0}
.wm-lede{margin-top:15px;font-size:clamp(16px,1.9vw,19px);color:${c.muted};font-weight:300;line-height:1.55;max-width:56ch}
.wm-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(266px,1fr));gap:18px;margin-top:42px}
.wm-card{background:#FFF;border:1px solid ${c.line};border-radius:18px;padding:19px;display:flex;flex-direction:column;box-shadow:0 20px 40px -34px rgba(0,0,0,.45)}
.wm-top{display:flex;gap:11px;align-items:flex-start;margin-bottom:14px}
.wm-n{flex:0 0 auto;font-size:10.5px;font-weight:800;letter-spacing:.1em;color:${onAccent};background:${c.accent};border-radius:6px;padding:4px 7px;margin-top:2px}
.wm-top b{display:block;font-size:15.5px;font-weight:700;color:${c.ink};line-height:1.22}
.wm-top i{display:block;font-style:normal;font-size:12px;color:${c.muted};margin-top:3px}
.wm-scr{background:linear-gradient(170deg,${scr} 0%,#0C0C0F 100%);border-radius:13px;padding:12px 13px 14px;color:#F2F2F0}
.wm-scr-top{display:flex;justify-content:space-between;align-items:center;font-size:9px;letter-spacing:.1em;color:rgba(255,255,255,.5);margin-bottom:10px}
.wm-dot{width:6px;height:6px;border-radius:50%;background:${c.accent};box-shadow:0 0 8px ${c.accent}}
.wm-scr-t{font-size:14px;font-weight:700;line-height:1.25;margin-bottom:7px}
.wm-line{font-size:11.5px;color:rgba(242,242,240,.72);font-weight:300;line-height:1.45;padding:3px 0 3px 12px;position:relative}
.wm-line::before{content:"";position:absolute;left:0;top:9px;width:5px;height:5px;border-radius:50%;background:${c.accent};opacity:.85}
.wm-chip{display:inline-block;margin-top:10px;font-size:10px;font-weight:700;letter-spacing:.05em;background:${c.accent};color:${onAccent};border-radius:999px;padding:5px 10px}
.wm-feels{margin-top:13px;font-size:10px;letter-spacing:.13em;text-transform:uppercase;font-weight:700;color:${mix(c.muted, '#FFFFFF', 0.25)}}
.wm-del{margin-top:7px;font-size:13px;color:${mix(c.ink, '#FFFFFF', 0.22)};font-weight:300;line-height:1.55;flex:1}
.wm-fund{margin-top:13px;padding-top:11px;border-top:1px solid ${c.line};font-size:11.5px;color:${c.muted};font-weight:300;line-height:1.5}
.wm-fund i{display:block;font-style:normal;font-size:9px;letter-spacing:.16em;text-transform:uppercase;font-weight:700;color:${c.accent};margin-bottom:4px}
.wm-how{display:grid;grid-template-columns:1fr 380px;gap:32px;margin-top:48px;align-items:start}
.wm-how h3{font-size:clamp(23px,3vw,32px);font-weight:800;letter-spacing:-.025em;color:${c.ink};margin:4px 0 0}
.wm-steps{list-style:none;counter-reset:wms;margin:20px 0 0;padding:0}
.wm-steps li{counter-increment:wms;padding:14px 0 14px 44px;border-bottom:1px solid ${c.line};position:relative}
.wm-steps li:last-child{border-bottom:none}
.wm-steps li::before{content:counter(wms,decimal-leading-zero);position:absolute;left:0;top:16px;font-size:10.5px;font-weight:800;letter-spacing:.1em;color:${c.accent}}
.wm-steps b{display:block;font-size:15.5px;font-weight:700;color:${c.ink};margin-bottom:3px}
.wm-steps span{font-size:13.5px;color:${c.muted};font-weight:300;line-height:1.55}
.wm-sc{background:#101012;border-radius:19px;padding:21px;color:#F2F2F0}
.wm-sc-k{font-size:9.5px;letter-spacing:.22em;text-transform:uppercase;font-weight:700;color:${c.accent};margin-bottom:13px}
.wm-stage{position:relative;height:188px;border-radius:13px;overflow:hidden;background:linear-gradient(160deg,${scr},#0A0A0C)}
.wm-win{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:16px}
.wm-win-k{font-size:9.5px;letter-spacing:.2em;text-transform:uppercase;color:rgba(242,242,240,.55);font-weight:700}
.wm-win-v{font-size:clamp(24px,4.6vw,36px);font-weight:800;letter-spacing:-.03em;color:${c.accent};margin:7px 0 5px;line-height:1;filter:brightness(1.6)}
.wm-win-s{font-size:11.5px;color:rgba(242,242,240,.62);font-weight:300;line-height:1.45;max-width:30ch}
.wm-coat{position:absolute;inset:0;width:100%;height:100%;cursor:grab;touch-action:none}
.wm-coat:active{cursor:grabbing}
.wm-note{font-size:11px;color:rgba(242,242,240,.5);font-weight:300;line-height:1.55;margin-top:13px}
.wm-again{margin-top:11px;background:transparent;border:1px solid rgba(242,242,240,.25);color:#F2F2F0;border-radius:999px;padding:8px 16px;font-size:11.5px;font-weight:700;font-family:inherit;cursor:pointer}
.wm-again:hover{border-color:${c.accent};color:${c.accent}}
@keyframes wmPop{0%{transform:scale(.9);opacity:0}60%{transform:scale(1.04)}100%{transform:scale(1);opacity:1}}
.wm-ev{margin-top:46px;border-left:3px solid ${c.accent};padding:3px 0 3px 20px;max-width:74ch}
.wm-ev b{font-weight:700;color:${c.ink}}
.wm-ev p{font-size:14px;color:${c.muted};font-weight:300;line-height:1.65;margin-top:8px}
.wm-ev i{font-style:normal;opacity:.8}
/* the yes */
.wm-needs{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:0 32px;margin-top:28px}
.wm-need{display:flex;gap:15px;padding:17px 0;border-bottom:1px solid ${c.line}}
.wm-need span{flex:0 0 auto;font-size:10.5px;font-weight:800;letter-spacing:.13em;color:${c.accent};margin-top:4px}
.wm-need h4{font-size:15.5px;font-weight:700;margin:0 0 4px;color:${c.ink}}
.wm-need p{font-size:13.5px;color:${c.muted};font-weight:300;line-height:1.55;margin:0}
.wm-accept{display:grid;grid-template-columns:1.35fr 1fr;gap:24px;margin-top:44px;border:1px solid ${c.accent};border-radius:21px;padding:30px;background:#FFF}
.wm-accept h3{font-size:clamp(25px,3.3vw,36px);font-weight:800;letter-spacing:-.027em;line-height:1.03;color:${c.ink};margin:0}
.wm-lbl{display:block;margin:20px 0 8px;font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;color:${c.ink}}
.wm-lbl small{text-transform:none;letter-spacing:0;color:${c.muted};font-weight:300;margin-left:6px}
.wm-accept textarea{width:100%;background:${bandTint};border:1px solid ${c.line};border-radius:13px;padding:13px 15px;font-size:14px;color:${c.ink};font-family:inherit;font-weight:300;line-height:1.55;resize:vertical}
.wm-accept textarea:focus{outline:none;border-color:${c.accent}}
.wm-row{display:flex;gap:11px;flex-wrap:wrap;margin-top:15px}
.wm-btn{border-radius:999px;padding:13px 24px;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;border:1px solid ${c.accent}}
.wm-btn.solid{background:${c.accent};color:${onAccent}}
.wm-btn.ghost{background:transparent;color:${c.accent}}
.wm-anote{font-size:11.5px;color:${c.muted};margin-top:12px;line-height:1.55}
.wm-yes{border:1px solid ${c.line};border-radius:15px;padding:20px;background:${bandTint};height:100%}
.wm-yes-k{font-size:9.5px;letter-spacing:.22em;text-transform:uppercase;color:${c.accent};font-weight:700;margin-bottom:12px}
.wm-yes ul{list-style:none;margin:0;padding:0}
.wm-yes li{font-size:13px;color:${c.muted};font-weight:300;line-height:1.5;padding:8px 0 8px 17px;position:relative;border-bottom:1px solid ${c.line}}
.wm-yes li:last-child{border-bottom:none}
.wm-yes li::before{content:"";position:absolute;left:0;top:15px;width:6px;height:6px;border-radius:50%;background:${c.accent}}
.wm-yes li b{color:${c.ink};font-weight:700}
.wm-yes-f{margin-top:14px;font-size:11px;color:${c.muted};line-height:1.55}
@media(max-width:900px){.wm-how,.wm-accept{grid-template-columns:1fr}}
</style>`;
};

const mapSection = (c, wm) => `
<section id="waitmap" class="wm-band"><div class="wrap">
  <div class="wm-kick">Every waiting moment</div>
  <h2 class="wm-h">${esc(wm.title)}</h2>
  <p class="wm-lede">${esc(wm.lede)}</p>

  <div class="wm-grid">
    ${wm.moments.map((m, i) => `<div class="wm-card">
      <div class="wm-top"><span class="wm-n">${String(i + 1).padStart(2, '0')}</span><div><b>${esc(m.name)}</b><i>${esc(m.when)}</i></div></div>
      <div class="wm-scr">
        <div class="wm-scr-top"><span>9:41</span><span class="wm-dot"></span></div>
        <div class="wm-scr-t">${esc(m.screen.title)}</div>
        ${m.screen.lines.map((l) => `<div class="wm-line">${esc(l)}</div>`).join('')}
        <div class="wm-chip">${esc(m.screen.chip)}</div>
      </div>
      <div class="wm-feels">the wait feels like ${esc(m.feels)}</div>
      <p class="wm-del">${esc(m.delivered)}</p>
      <div class="wm-fund"><i>who funds it</i>${esc(m.funder)}</div>
    </div>`).join('\n    ')}
  </div>

  <div class="wm-how">
    <div>
      <div class="wm-kick">How the moment works</div>
      <h3>Four steps, every time.</h3>
      <ol class="wm-steps">
        <li><b>The signal</b><span>Something you already record says a person is now waiting, and roughly how long for.</span></li>
        <li><b>The prediction</b><span>How long this one will really take &mdash; not the average, this one.</span></li>
        <li><b>The value</b><span>Something worth their attention goes into that window: an answer, a credit, a thing prepared while they wait.</span></li>
        <li><b>The exchange</b><span>They get value. You get someone who stayed, and one optional answer you have always wanted.</span></li>
      </ol>
    </div>
    <div>
      <div class="wm-sc">
        <div class="wm-sc-k">the value exchange, playable</div>
        <div class="wm-stage">
          <div class="wm-win" id="wmWin">
            <div class="wm-win-k">you earned</div>
            <div class="wm-win-v" id="wmWinV">&mdash;</div>
            <div class="wm-win-s">for ${esc(wm.moments[0].feels)}, which you were going to lose anyway</div>
          </div>
          <canvas class="wm-coat" id="wmCoat"></canvas>
        </div>
        <p class="wm-note">This is the reward layer, running for real on this page. Drag to scratch it. Nothing is collected and nothing is sent &mdash; it is here so the idea is something you do, not something you read.</p>
        <button class="wm-again" id="wmAgain" type="button">scratch another</button>
      </div>
    </div>
  </div>

  <div class="wm-ev">
    <b>This is not a new idea &mdash; it is an unbuilt one.</b>
    <p>US retailers lose an estimated <b>$37.7 billion a year</b> to customers who abandon because of long queues, split roughly $15.8b to competitors and $21.9b abandoned outright <i>(Adyen with 451 Research)</i>. The New York State Department of Labor reported a <b>48% reduction in hang-ups</b> after introducing virtual queuing. Theme parks moving to virtual queues reported a <b>36% lift in per-capita spending</b>, because guests spent the wait somewhere that sold something. A Seattle-Tacoma Airport study found <b>63% of passengers</b> said they shopped or ate more because they saved time in the security queue.</p>
    <p><i>Every figure here carries its source, and overseas figures are shown as overseas figures. We have not found a published New Zealand equivalent and we will not invent one.</i></p>
  </div>
</div></section>
`;

const acceptSection = (c) => `
<section id="accept" class="wm-band"><div class="wrap">
  <div class="wm-kick">Before you decide</div>
  <h2 class="wm-h">What a pilot actually asks of you.</h2>
  <p class="wm-lede">Written out in full, because the honest version is short and most of it is your time, not your money.</p>

  <div class="wm-needs">
    <div class="wm-need"><span>01</span><div><h4>One named person</h4><p>The approver. Every draft stops with them and nothing reaches a customer until they say so. About two hours a week, reading drafts rather than managing a project.</p></div></div>
    <div class="wm-need"><span>02</span><div><h4>One situation, not the business</h4><p>${esc(c.pilotScope)}</p></div></div>
    <div class="wm-need"><span>03</span><div><h4>Read-only access, nothing that writes</h4><p>${esc(c.pilotAccess)}</p></div></div>
    <div class="wm-need"><span>04</span><div><h4>Your actual rules</h4><p>The policies, limits and words the drafts are held against. Every rule shown on this page is a placeholder standing in for yours. An afternoon with whoever owns them is usually enough.</p></div></div>
    <div class="wm-need"><span>05</span><div><h4>Six weeks, then a real decision</h4><p>Scored on: ${esc(c.pilotScorecard)} Fail any line of that and we change the design or stop. You keep everything drafted either way.</p></div></div>
    <div class="wm-need"><span>06</span><div><h4>A fixed fee, agreed in writing first</h4><p>No number is published on this page, because it depends on which situation you pick. Whatever it is, it is agreed before any work starts and it does not move.</p></div></div>
  </div>

  <div class="wm-accept">
    <div>
      <div class="wm-kick">The straight yes</div>
      <h3>Run the pilot.</h3>
      <p class="wm-lede" style="margin-top:11px">Say yes to the six weeks above, and add anything you would change first. Nothing here is fixed &mdash; most pilots move a line or two before they start, and the notes below are how that happens.</p>
      <label class="wm-lbl" for="wmAdjust">Anything you would adjust? <small>optional</small></label>
      <textarea id="wmAdjust" rows="4" placeholder="${esc(c.acceptEg)}"></textarea>
      <div class="wm-row">
        <button class="wm-btn solid" type="button" onclick="wmAccept()">Accept the pilot &rarr;</button>
        <button class="wm-btn ghost" type="button" id="wmCopyBtn" onclick="wmCopy()">Copy it instead</button>
      </div>
      <p class="wm-anote" id="wmANote">Opens your mail app to assembl@assembl.co.nz with your notes in it. Nothing is collected by this page.</p>
    </div>
    <div>
      <div class="wm-yes">
        <div class="wm-yes-k">You would be accepting</div>
        <ul>
          <li><b>Six weeks</b>, one situation, scored against a written line</li>
          <li><b>Read-only</b> access, nothing production</li>
          <li><b>A named approver</b> &mdash; nothing sends without them</li>
          <li><b>A fixed fee</b>, agreed in writing before anything starts</li>
          <li><b>Stop any time.</b> You keep what was drafted</li>
        </ul>
        <div class="wm-yes-f">This is a concept page. Accepting it starts a conversation and a written scope &mdash; not a charge, and not an obligation.</div>
      </div>
    </div>
  </div>
</div></section>
`;

const script = (c) => `
<script>
/* The value exchange, playable, plus the yes. Injected by patch-handbuilt.mjs. */
(function(){
  var cv=document.getElementById('wmCoat'); if(!cv) return;
  var win=document.getElementById('wmWin'), val=document.getElementById('wmWinV'), again=document.getElementById('wmAgain');
  var REWARDS=['+3 min','2 credits','a straight answer','one less call','+5 min','the thing prepared'];
  var ctx=cv.getContext('2d'), W=0,H=0,dpr=1, revealed=false, drawing=false;
  function fit(){
    var r=cv.getBoundingClientRect(); dpr=Math.min(2,window.devicePixelRatio||1);
    W=r.width; H=r.height; cv.width=Math.max(1,W*dpr); cv.height=Math.max(1,H*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0); coat();
  }
  function coat(){
    ctx.globalCompositeOperation='source-over'; ctx.clearRect(0,0,W,H);
    var g=ctx.createLinearGradient(0,0,W,H);
    g.addColorStop(0,'#C9B48C'); g.addColorStop(.5,'#EBDDBE'); g.addColorStop(1,'#B39A6E');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='rgba(58,56,50,.07)';
    for(var x=-14;x<W;x+=26) ctx.fillRect(x,0,13,H);
    ctx.fillStyle='#3A3832'; ctx.textAlign='center';
    ctx.font='700 13px system-ui,sans-serif'; ctx.fillText('SCRATCH TO REVEAL',W/2,H/2-3);
    ctx.font='300 12px system-ui,sans-serif'; ctx.fillText('drag across the panel',W/2,H/2+17);
    ctx.globalCompositeOperation='destination-out';
  }
  function at(e){var r=cv.getBoundingClientRect();var t=e.touches&&e.touches[0]?e.touches[0]:e;return [t.clientX-r.left,t.clientY-r.top]}
  function rub(e){
    if(!drawing||revealed) return;
    var p=at(e); ctx.beginPath(); ctx.arc(p[0],p[1],23,0,Math.PI*2); ctx.fill(); check();
    if(e.cancelable) e.preventDefault();
  }
  function check(){
    var d=ctx.getImageData(0,0,cv.width,cv.height).data, clear=0, total=0;
    for(var i=3;i<d.length;i+=4*64){total++; if(d[i]<40) clear++}
    if(total&&clear/total>0.46) reveal();
  }
  function reveal(){
    revealed=true; cv.style.transition='opacity .5s ease'; cv.style.opacity='0'; cv.style.pointerEvents='none';
    win.style.animation='wmPop .5s cubic-bezier(.22,.61,.36,1) both';
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

function wmBody(){
  var n=(document.getElementById('wmAdjust').value||'').trim();
  return 'Yes \\u2014 run the ${c.short} pilot.\\n\\n'+
    'What I am accepting, as written on the concept page:\\n'+
    '- Six weeks, one situation: ${c.pilotScope.replace(/'/g, "\\\\'")}\\n'+
    '- Read-only access: ${c.pilotAccess.replace(/'/g, "\\\\'")}\\n'+
    '- Scored on: ${c.pilotScorecard.replace(/'/g, "\\\\'")}\\n'+
    '- A named approver \\u2014 nothing sends without them\\n'+
    '- A fixed fee, agreed in writing before any work starts\\n\\n'+
    'What I would adjust first:\\n'+(n||'(nothing \\u2014 start as written)')+'\\n\\n'+
    'My name and role:\\n\\n\\nBest way to reach me:\\n\\n';
}
function wmAccept(){
  location.href='mailto:assembl@assembl.co.nz?subject='+encodeURIComponent('Yes \\u2014 run the ${c.short} pilot')+'&body='+encodeURIComponent(wmBody());
  document.getElementById('wmANote').textContent='Your mail app should be opening. If it did not, use \\u201cCopy it instead\\u201d and paste it into an email to assembl@assembl.co.nz.';
}
function wmCopy(){
  var t=wmBody(), done=function(){
    document.getElementById('wmCopyBtn').textContent='Copied \\u2713';
    document.getElementById('wmANote').textContent='Copied. Paste it into an email to assembl@assembl.co.nz \\u2014 that is the whole next step.';
  };
  function fb(v,ok){
    var a=document.createElement('textarea'); a.value=v; a.style.position='fixed'; a.style.opacity='0';
    document.body.appendChild(a); a.select();
    try{document.execCommand('copy');ok()}catch(e){
      document.getElementById('wmANote').textContent='Copying was blocked \\u2014 email assembl@assembl.co.nz and we will send the scope.';
    }
    a.remove();
  }
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(done,function(){fb(t,done)})}
  else{fb(t,done)}
}
</script>
`;

let changed = 0;
for (const c of CLIENTS) {
  const path = resolve(RESEARCH, c.dir, 'index.html');
  let h = readFileSync(path, 'utf8');
  if (h.includes('id="waitmap"')) { console.log(`  ${c.slug}: already patched`); continue; }

  const wm = (await import(`file://${resolve(HERE, 'waitmaps', `${c.map}.mjs`)}`)).default;

  /* CSS must land in the HEAD sheet. The Woolworths build carries TWO </body>
     tags and a trailing <style> after the first one — appending to the last
     sheet put the rules in that stray tail, where they are at the mercy of how
     a parser recovers. Take the last </style> that still precedes </head>. */
  const headEnd = h.indexOf('</head>');
  if (headEnd < 0) throw new Error(`${c.slug}: no </head>`);
  const si = h.lastIndexOf('</style>', headEnd);
  if (si < 0) throw new Error(`${c.slug}: no </style> inside <head>`);
  h = h.slice(0, si) + css(c) + h.slice(si + '</style>'.length);

  // the map goes where the journey turns into detail; the yes goes last
  const anchor = h.indexOf(c.before);
  if (anchor < 0) throw new Error(`${c.slug}: anchor ${c.before} not found`);
  h = h.slice(0, anchor) + mapSection(c, wm) + '\n' + h.slice(anchor);

  const fi = h.lastIndexOf('<footer');
  if (fi < 0) throw new Error(`${c.slug}: no <footer`);
  h = h.slice(0, fi) + acceptSection(c) + '\n' + h.slice(fi);

  /* Script before the LAST </body>. The FIRST one on the Woolworths page is not
     a tag at all — it is inside a JS template literal for the printable document
     the page can open in a new window. Inserting there splits that string and
     takes the whole script block down with it. */
  const bi = h.lastIndexOf('</body>');
  if (bi < 0) throw new Error(`${c.slug}: no </body>`);
  h = h.slice(0, bi) + script(c) + h.slice(bi);

  writeFileSync(path, h);
  console.log(`  ${c.slug}: wait map (${wm.moments.length}) + scratch + accept injected`);
  changed++;
}
console.log(`done — ${changed} page(s) changed`);
