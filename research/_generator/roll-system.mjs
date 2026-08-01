/* roll-system.mjs — put the assembl visual + motion system on every demo.
 *
 * Kate, 1 August 2026. Materials agreed:
 *   brass  — retirement and insurance   (proof, receipts, the thing kept)
 *   chrome — motor and aviation         (manufactured, engineered)
 *   ink    — lending and energy         (liquid, dark, still resolving)
 *
 * WHAT IT DOES to each page, idempotently (safe to run twice):
 *   1. copies the five system files + three.min.js into the folder
 *   2. links assembl-system.css and assembl-motion.css
 *   3. puts .mGrain on <body>
 *   4. REPLACES the flat icon-mosaic band (mzBand) with an assembly band:
 *      the 3D form in that industry's material and the client's own colour,
 *      beside the generative mosaic seeded to that client
 *   5. loads the engines and mounts them
 *
 * It never touches the page's own copy, sections, agent, or boundary panel.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.argv[2] || '.');
const GEN = path.join(ROOT, '_generator');
const FILES = ['assembl-system.css', 'assembl-motion.css', 'assembl-motion.js',
  'assembl-cloud.js', 'assembl-mosaic.js'];

/* folder → [accent, form, material, seed, label] */
const DEMOS = {
  'assembling-demo-retirement': ['#3F6152', 'villa',  'brass',  'rosewell',        'the decision, assembling'],
  'assembling-ryman-family':    ['#F06022', 'villa',  'brass',  'ryman-family',    'the answer, assembling'],
  'assembling-summerset':       ['#470A68', 'villa',  'brass',  'summerset',       'the money, in plain words'],
  'assembling-giltrap':         ['#9E8049', 'car',    'chrome', 'giltrap-group',   'the lot, assembling'],
  'assembling-nectar':          ['#056268', 'ring',   'brass',  'nectar-money',    'the seven minutes'],
  'assembling-contact-cine':    ['#E62A32', 'leaf',   'ink',    'contact-energy',  'the bill, explaining itself'],
  'assembling-southern-cross':  ['#009ADE', 'shield', 'brass',  'southern-cross',  'the claim, assembling'],
  'assembling-sharesies':       ['#E50072', 'ledger', 'ink',    'sharesies',       'the transfer, assembling'],
  'assembling-hnry':            ['#272754', 'ledger', 'ink',    'hnry',            'the invoice, tracked'],
  'assembling-myfoodbag':       ['#77A222', 'basket', 'chrome', 'my-food-bag',     'the week, assembling'],
  'assembling-southbase':       ['#78BE37', 'tower',  'chrome', 'southbase',       'the build, in the open'],
  'assembling-construction':    ['#2E6E8E', 'tower',  'chrome', 'construction',    'the consent, assembling'],
  'assembling-airnz-cine':      ['#2D2A26', 'plane',  'chrome', 'air-nz',          'the disruption, handled'],
  'assembling-woolworths-rewards': ['#00713C', 'basket', 'brass', 'woolworths',    'the shop, assembling'],
  'assembling-demo-banking':    ['#1E2A38', 'ledger', 'ink',    'ledgerline',      'the decision, traced'],
  'assembling-demo-grocery':    ['#1F5133', 'basket', 'brass',  'fernmarket',      'the list, assembling'],
  'assembling-nzpost':          ['#0068FF', 'parcel', 'chrome', 'nz-post',         'the parcel, located'],
  'assembling-tower':           ['#FFCF03', 'shield', 'brass',  'tower-insurance', 'the claim, assembling'],
};

/* GROUND RULE, learned the hard way on Sharesies: dark liquid ink on a
   near-black box is invisible. Ink gets a paper ground; the metals get the
   dark studio that makes them read as metal. */
const GROUND = { ink: 'paper', chrome: 'dark', brass: 'dark', points: 'paper', brand: 'dark' };

const BAND_CSS = `
/* ── the assembly stage · assembl system ───────────────────────────────────
   Kate, 1 Aug 2026: "i want the scroll factor like the motion lab". So this is
   the lab's pinned stage, not a band that sits there: the section is tall, the
   view pins, and the form assembles under the reader's own scrolling. */
.abStage{position:relative;height:300vh;background:#FCFCFA}
.abStage__pin{position:sticky;top:0;height:100vh;overflow:hidden;
  display:grid;grid-template-columns:1fr;align-items:center}
.abStage__art{position:absolute;inset:0;z-index:1}
.abStage__pin::after{content:"";position:absolute;inset:0;z-index:2;pointer-events:none}
.abStage--dark .abStage__pin::after{background:radial-gradient(ellipse 70% 46% at 50% 50%,rgba(8,9,12,.72) 0%,transparent 72%)}
.abStage--paper .abStage__pin::after{background:radial-gradient(ellipse 70% 46% at 50% 50%,rgba(252,252,250,.78) 0%,transparent 72%)}
.abStage__art--dark{background:radial-gradient(ellipse 92% 74% at 50% 40%,#16181D 0%,#0A0B0E 100%)}
.abStage__art--paper{background:#FCFCFA}
.abStage__copy{position:absolute;inset:0;z-index:3;display:grid;place-items:center;
  text-align:center;pointer-events:none}
.abStage__step{grid-area:1/1;max-width:820px;padding:0 26px;
  opacity:0;transition:opacity .5s cubic-bezier(.16,.84,.28,1)}
.abStage__step.on{opacity:1}
.abStage__n{font-family:"Instrument Serif",Georgia,serif;font-weight:400;
  font-size:clamp(34px,6vw,84px);line-height:1;letter-spacing:-.02em}
.abStage__l{font:300 15px/1.6 -apple-system,BlinkMacSystemFont,system-ui,sans-serif;
  margin-top:14px}
.abStage--dark .abStage__n{color:#F6F7F8}
.abStage--dark .abStage__l{color:rgba(246,247,248,.7)}
.abStage--paper .abStage__n{color:#14161A}
.abStage--paper .abStage__l{color:#4A4F57}
.abStage__rail{position:absolute;left:0;right:0;bottom:0;height:1px;background:rgba(128,128,136,.22)}
.abStage__fill{height:100%;width:0;background:var(--abA,#2F4F44);transition:width .18s linear}
.abStage__cap{position:absolute;left:0;right:0;bottom:22px;text-align:center;
  font:700 9.5px/1.4 -apple-system,system-ui,sans-serif;letter-spacing:.26em;
  text-transform:uppercase;color:rgba(128,128,136,.75)}

/* the pattern, on its own quiet band under the stage */
.abMosBand{background:#FCFCFA;padding:clamp(40px,7vh,92px) clamp(22px,5vw,64px)}
.abMosBand__in{max-width:1240px;margin:0 auto}
.abMosBand__host{position:relative;height:clamp(180px,28vh,300px);border-radius:20px;
  overflow:hidden;background:#fff;border:1px solid rgba(20,22,26,.09)}
.abMosBand__cap{max-width:1240px;margin:14px auto 0;
  font:700 9.5px/1.4 -apple-system,system-ui,sans-serif;letter-spacing:.26em;
  text-transform:uppercase;color:#989CA2}

/* ── the evidence · verified Aotearoa and Australia figures ────────────────
   Kate, 1 Aug 2026: "find more relevant figures for NZ and AUS". The page used
   to carry four US numbers in a grey paragraph. These are the ANZ replacements,
   each from a primary source dated 2024-2026, set at a size that says the
   number IS the argument. */
.abEv{background:#0A0B0E;color:#F6F7F8;padding:clamp(70px,13vh,150px) clamp(22px,5vw,64px);
  position:relative;overflow:hidden}
.abEv__in{max-width:1240px;margin:0 auto;position:relative;z-index:2}
.abEv__k{font:700 10px/1.4 -apple-system,system-ui,sans-serif;letter-spacing:.3em;
  text-transform:uppercase;color:var(--abA,#BFA37A);display:flex;align-items:center;gap:14px}
.abEv__k::after{content:"";flex:1;height:1px;background:rgba(246,247,248,.16);max-width:220px}
.abEv__h{font-family:"Instrument Serif",Georgia,serif;font-weight:400;
  font-size:clamp(30px,4.6vw,62px);line-height:1.04;letter-spacing:-.02em;
  margin:22px 0 clamp(38px,6vh,72px);max-width:19ch}
.abEv__grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;
  background:rgba(246,247,248,.13);border:1px solid rgba(246,247,248,.13)}
@media(max-width:860px){.abEv__grid{grid-template-columns:1fr}}
.abEv__c{background:#0A0B0E;padding:clamp(26px,3.4vw,44px)}
.abEv__n{font-family:"Instrument Serif",Georgia,serif;font-weight:400;
  font-size:clamp(50px,7.4vw,112px);line-height:.9;letter-spacing:-.035em;
  color:#F6F7F8;font-variant-numeric:tabular-nums;display:flex;align-items:baseline;gap:4px}
.abEv__n em{font-style:normal;font-size:.42em;letter-spacing:-.01em;color:var(--abA,#BFA37A)}
.abEv__t{font:300 16px/1.55 -apple-system,system-ui,sans-serif;color:rgba(246,247,248,.86);
  margin-top:20px;max-width:34ch}
.abEv__t b{color:#F6F7F8;font-weight:600}
.abEv__s{font:400 11.5px/1.5 -apple-system,system-ui,sans-serif;color:rgba(246,247,248,.44);
  margin-top:16px;padding-top:14px;border-top:1px solid rgba(246,247,248,.13)}
.abEv__flag{display:inline-block;font:700 9px/1 -apple-system,system-ui,sans-serif;
  letter-spacing:.18em;padding:5px 8px;border:1px solid rgba(246,247,248,.28);
  border-radius:4px;margin-right:10px;color:rgba(246,247,248,.72);vertical-align:middle}
.abEv__foot{margin-top:clamp(28px,4vh,52px);font:300 13.5px/1.7 -apple-system,system-ui,sans-serif;
  color:rgba(246,247,248,.55);max-width:76ch}
.abEv__foot b{color:rgba(246,247,248,.86);font-weight:600}

/* the closing beat — the form, resolved, just before the ask */
.abClose{position:relative;height:clamp(280px,46vh,460px);overflow:hidden;
  background:radial-gradient(ellipse 92% 74% at 50% 45%,#16181D 0%,#0A0B0E 100%)}
.abClose__art{position:absolute;inset:0}
`;


function evidence(accent) {
  return `
<!-- ab:ev:start — the evidence, ANZ -->
<section class="abEv" style="--abA:${accent}" aria-label="the evidence">
  <div class="abEv__in">
    <div class="abEv__k">the evidence &middot; aotearoa and australia</div>
    <h2 class="abEv__h" data-m="type">The wait is not a soft problem. It is the most complained-about thing in the country.</h2>
    <div class="abEv__grid">
      <div class="abEv__c">
        <div class="abEv__n"><span data-m="count" data-m-to="22" data-m-dur="1700">0</span><em>million hours</em></div>
        <p class="abEv__t">New Zealanders spent <b>22 million hours on hold</b> in 2025 &mdash; 8.7 hours each. Nearly half say slow service is reason enough to switch.</p>
        <div class="abEv__s"><span class="abEv__flag">NZ</span>ServiceNow Customer Experience Report, March 2026</div>
      </div>
      <div class="abEv__c">
        <div class="abEv__n"><span data-m="count" data-m-to="9274" data-m-dur="1900">0</span></div>
        <p class="abEv__t"><b>Delay in claim handling</b> is the single most complained-about issue across the whole Australian financial system &mdash; ahead of misleading conduct and outright denial.</p>
        <div class="abEv__s"><span class="abEv__flag">AU</span>Australian Financial Complaints Authority, 2025 complaints data, February 2026</div>
      </div>
      <div class="abEv__c">
        <div class="abEv__n"><span data-m="count" data-m-to="58" data-m-dur="1500">0</span><em>per cent</em></div>
        <p class="abEv__t">Offered a callback instead of holding, <b>58% took it</b>. People do not object to waiting. They object to waiting with nothing.</p>
        <div class="abEv__s"><span class="abEv__flag">AU</span>Services Australia Annual Report 2024&ndash;25, October 2025</div>
      </div>
      <div class="abEv__c">
        <div class="abEv__n"><span data-m="count" data-m-to="68.9" data-m-dur="1600">0</span><em>per cent</em></div>
        <p class="abEv__t">Of emergency department patients seen within six hours, against a <b>95% target</b>. One New Zealander in three waits longer than the country says they should.</p>
        <div class="abEv__s"><span class="abEv__flag">NZ</span>Dept of the Prime Minister and Cabinet, Government Target 1, quarter to December 2025</div>
      </div>
    </div>
    <p class="abEv__foot">Every figure here is New Zealand or Australian, from a primary source, dated 2025 or 2026. <b>Where no local number exists we say so rather than borrowing an overseas one</b> &mdash; there is still no published NZ study of queue abandonment, contact-centre benchmarks, or the economics of waiting.</p>
  </div>
</section>
<!-- ab:ev:end -->
`;
}

function band(label, ground, accent) {
  return `
<!-- ab:start — the assembly stage, assembl system -->
<section class="abStage abStage--${ground}" data-m-scrub aria-label="${label}" style="--abA:${accent}">
  <div class="abStage__pin">
    <div class="abStage__art abStage__art--${ground}" id="abCloud"></div>
    <div class="abStage__copy">
      <div class="abStage__step on"><div class="abStage__n">Dispersed.</div>
        <div class="abStage__l">Everything the business already knows, in the places it already lives.</div></div>
      <div class="abStage__step"><div class="abStage__n">Selected.</div>
        <div class="abStage__l">Only what this stage of this journey needs.</div></div>
      <div class="abStage__step"><div class="abStage__n">Assembling.</div>
        <div class="abStage__l">The work happening in the open, named, while the customer watches.</div></div>
      <div class="abStage__step"><div class="abStage__n">Held.</div>
        <div class="abStage__l">Complete, and waiting for a named person to say yes.</div></div>
    </div>
    <div class="abStage__rail"><div class="abStage__fill"></div></div>
  </div>
</section>
<section class="abMosBand" aria-hidden="true">
  <div class="abMosBand__in"><div class="abMosBand__host" id="abMos"></div></div>
</section>
<!-- ab:end -->
`;
}

function mount(accent, form, material, seed) {
  return `
<!-- ab:js:start -->
<script src="assembl-motion.js"></script>
<script src="assembl-cloud.js"></script>
<script src="assembl-mosaic.js"></script>
<script>
(function(){
  if(window.AssemblCloud) AssemblCloud.mount(document.getElementById('abCloud'),
    {form:'${form}',material:'${material}',colour:'${accent}',count:2600,mode:'scrub',stage:'.abStage',size:.052});
  var c2=document.getElementById('abCloud2');
  if(window.AssemblCloud && c2) AssemblCloud.mount(c2,
    {form:'${form}',material:'${material}',colour:'${accent}',count:1800,mode:'auto',size:.045});
  if(window.AssemblMosaic) AssemblMosaic.mount(document.getElementById('abMos'),
    {colour:'${accent}',ink:'#14161A',brass:'#BFA37A',seed:'${seed}',density:14,mode:'enter'});
})();
</script>
<!-- ab:js:end -->
`;
}

let done = 0, skipped = [];
for (const [folder, cfg] of Object.entries(DEMOS)) {
  const dir = path.join(ROOT, folder);
  const idx = path.join(dir, 'index.html');
  if (!fs.existsSync(idx)) { skipped.push(folder + ' (no index)'); continue; }
  const [accent, form, material, seed, label] = cfg;

  for (const f of FILES) fs.copyFileSync(path.join(GEN, f), path.join(dir, f));
  if (!fs.existsSync(path.join(dir, 'three.min.js'))) {
    fs.copyFileSync(path.join(ROOT, 'assembling-nectar', 'three.min.js'),
      path.join(dir, 'three.min.js'));
  }

  let s = fs.readFileSync(idx, 'utf8');

  /* idempotent: strip any previous run */
  s = s.replace(/\n?<!-- ab:start[\s\S]*?<!-- ab:end -->\n?/g, '\n');
  s = s.replace(/\n?<!-- ab:js:start[\s\S]*?<!-- ab:js:end -->\n?/g, '\n');
  s = s.replace(/\n?<!-- ab:auto:start[\s\S]*?<!-- ab:auto:end -->\n?/g, '\n');
  s = s.replace(/\n?<!-- ab:ev:start[\s\S]*?<!-- ab:ev:end -->\n?/g, '\n');
  s = s.replace(/\n?<!-- ab:close:start[\s\S]*?<!-- ab:close:end -->\n?/g, '\n');
  s = s.replace(/\n?<link rel="stylesheet" href="assembl-rhythm\.css">\n?/g, '\n');
  s = s.replace(/ data-ab-rhythm/g, '');
  s = s.replace(/ data-m="(?:type|rise)"/g, '');
  s = s.replace(/\n?\/\* ab:css:start \*\/[\s\S]*?\/\* ab:css:end \*\/\n?/g, '\n');

  /* 1. stylesheets */
  if (!s.includes('assembl-system.css')) {
    s = s.replace('</head>',
      '<link rel="stylesheet" href="assembl-system.css">\n' +
      '<link rel="stylesheet" href="assembl-motion.css">\n' +
      '<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">\n</head>');
  } else if (!s.includes('assembl-motion.css')) {
    s = s.replace('<link rel="stylesheet" href="assembl-system.css">',
      '<link rel="stylesheet" href="assembl-system.css">\n<link rel="stylesheet" href="assembl-motion.css">');
  }

  /* 2. band css */
  const lastStyle = s.lastIndexOf('</style>');
  if (lastStyle > -1) {
    s = s.slice(0, lastStyle) + '\n/* ab:css:start */' + BAND_CSS + '/* ab:css:end */\n' + s.slice(lastStyle);
  }

  /* 3. grain */
  if (!/<body[^>]*class="[^"]*mGrain/.test(s)) {
    s = s.replace(/<body(\s|>)/, (m, t) => '<body class="mGrain"' + (t === '>' ? '>' : ' '));
    s = s.replace('<body class="mGrain" class="', '<body class="mGrain ');
  }

  /* 4. replace the flat icon band with the assembly band */
  const mzA = s.indexOf('<!-- mz:start -->');
  const mzB = s.indexOf('<!-- mz:end -->');
  if (mzA > -1 && mzB > mzA) {
    s = s.slice(0, mzA) + band(label, GROUND[material] || 'dark', accent).trim() + s.slice(mzB + '<!-- mz:end -->'.length);
  } else {
    const h = s.indexOf('</header>');
    const anchor = h > -1 ? h + '</header>'.length : s.indexOf('<body') + 6;
    s = s.slice(0, anchor) + '\n' + band(label, GROUND[material] || 'dark', accent).trim() + s.slice(anchor);
  }

  /* 4b. the motion primitives, on the page's OWN content.
     Kate, 1 Aug 2026: "the whole second half of the page is still just flat
     text". It was — the band had motion and nothing else did. Headings
     assemble, ledes and cards rise. Attributes only: no copy is touched, and
     with JS off every word renders exactly as authored. */
  s = s.replace(/<(h1|h2)(?![^>]*data-m)([^>]*)>/g, '<$1 data-m="type"$2>');
  s = s.replace(/<h3(?![^>]*data-m)([^>]*)>/g, '<h3 data-m="rise"$1>');
  s = s.replace(/<p class="(lede|secS|kicker|sub|labP|wm-lede|wm-del|mapLede|dkDel|fin|spIdea|pfT|hero-sub|sT|st)"(?![^>]*data-m)/g,
    '<p class="$1" data-m="rise"');
  s = s.replace(/<div class="(glass|card|cc|ev|pcell|tool|mom|pow)"(?![^>]*data-m)/g,
    '<div class="$1" data-m="rise"');
  /* the vision-read section, if the page has one, opens itself on arrival —
     an empty frame under a heading that says "watch a lounge being read" is
     the page failing its own promise. */
  if (s.includes('id="vrDemo"') && !s.includes('ab:auto:start')) {
    s = s.replace('</body>', `<!-- ab:auto:start -->
<script>
(function(){
  var b=document.getElementById('vrDemo'), sec=document.getElementById('vrSec');
  if(!b||!sec||matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  var done=false;
  new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting&&!done){done=true;setTimeout(function(){b.click()},420);} });
  },{threshold:.35}).observe(sec);
})();
</script>
<!-- ab:auto:end -->
</body>`);
  }

  /* 4c. the evidence — replace the grey US paragraph with the ANZ spread */
  /* the old US paragraph ships under two class names across the fleet */
  const evM = s.match(/<div class="(mapEv|wm-ev|ev)[^"]*">[\s\S]*?This is not a new idea[\s\S]*?<\/div>\s*<\/div>/);
  if (evM) {
    s = s.replace(evM[0], evidence(accent).trim());
  } else if (!s.includes('ab:ev:start')) {
    const anchor = s.lastIndexOf('<footer');
    if (anchor > -1) s = s.slice(0, anchor) + evidence(accent).trim() + '\n' + s.slice(anchor);
  }

  /* 4d. the closing beat — the same form, fully assembled, before the ask.
     Three moments across a page reads as a journey; one reads as a widget. */
  if (!s.includes('ab:close:start')) {
    const closeAnchor = s.search(/<section[^>]*id="(pilot|accept)"/);
    if (closeAnchor > -1) {
      s = s.slice(0, closeAnchor) + `<!-- ab:close:start -->
<section class="abClose" style="--abA:${accent}" aria-hidden="true">
  <div class="abClose__art" id="abCloud2"></div>
</section>
<!-- ab:close:end -->
` + s.slice(closeAnchor);
    }
  }

  /* 5. engines */
  if (!s.includes('three.min.js')) {
    s = s.replace('</body>', '<script src="three.min.js"></script>\n</body>');
  }
  s = s.replace('</body>', mount(accent, form, material, seed).trim() + '\n</body>');

  fs.writeFileSync(idx, s);
  done++;
  console.log(`✓ ${folder.padEnd(32)} ${form.padEnd(7)} ${material.padEnd(7)} ${accent}`);
}
console.log(`\n${done} demos updated${skipped.length ? '; skipped: ' + skipped.join(', ') : ''}`);
