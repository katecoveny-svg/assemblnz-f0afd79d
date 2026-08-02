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
  'assembl-cloud.js', 'assembl-mosaic.js', 'assembl-blueprint.js'];

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

/* ── the demonstrator modules · assembling-demonstrator skill, Aug 2026 ─────
   Five sections every demonstrator carries: the definition above the fold,
   the wait moment as before/while/after, the blueprint explainer, permission
   and proof, and the commercial outcome as a hypothesis. Paper ground on
   every one — the skill's register — so they read as the same document
   whatever the page's own studio does around them. */
.abDef{background:#FCFCFA;border-top:1px solid rgba(20,22,26,.08);
  border-bottom:1px solid rgba(20,22,26,.08);
  padding:clamp(30px,5vh,54px) clamp(22px,5vw,64px)}
.abDef__in{max-width:1240px;margin:0 auto;display:grid;gap:10px}
.abDef__in p{font:300 clamp(16px,1.6vw,19px)/1.6 -apple-system,BlinkMacSystemFont,system-ui,sans-serif;
  color:#3A3F46;max-width:74ch;margin:0}
.abDef__in b{font-weight:650;color:#14161A}

.abSec{background:#FCFCFA;padding:clamp(64px,11vh,130px) clamp(22px,5vw,64px)}
.abSec--rule{border-top:1px solid rgba(20,22,26,.08)}
.abSec__in{max-width:1240px;margin:0 auto}
.abSec__k{font:700 10px/1.4 -apple-system,system-ui,sans-serif;letter-spacing:.3em;
  text-transform:uppercase;color:var(--abA,#2F4F44);display:flex;align-items:center;gap:14px}
.abSec__k::after{content:"";flex:1;height:1px;background:rgba(20,22,26,.12);max-width:220px}
.abSec__h{font-family:"Instrument Serif",Georgia,serif;font-weight:400;
  font-size:clamp(28px,4vw,52px);line-height:1.08;letter-spacing:-.02em;
  color:#14161A;margin:20px 0 0;max-width:24ch}
.abSec__sf{font:300 15.5px/1.65 -apple-system,system-ui,sans-serif;color:#4A4F57;
  margin:16px 0 0;max-width:64ch}
.abSim{display:inline-block;font:700 9px/1 -apple-system,system-ui,sans-serif;
  letter-spacing:.18em;text-transform:uppercase;padding:5px 8px;border-radius:4px;
  border:1px solid rgba(20,22,26,.3);color:#4A4F57;margin-left:10px;vertical-align:middle}

.abBwa__dim{font:400 13px/1.6 -apple-system,system-ui,sans-serif;color:#6A6F76;
  margin:14px 0 0;padding-left:14px;border-left:2px solid var(--abA,#2F4F44)}
.abBwa__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;
  background:rgba(20,22,26,.1);border:1px solid rgba(20,22,26,.1);
  margin-top:clamp(30px,5vh,52px)}
@media(max-width:860px){.abBwa__grid{grid-template-columns:1fr}}
.abBwa__col{background:#FCFCFA;padding:clamp(22px,3vw,38px)}
.abBwa__col h3{font:700 10px/1.4 -apple-system,system-ui,sans-serif;letter-spacing:.26em;
  text-transform:uppercase;color:var(--abA,#2F4F44);margin:0 0 14px}
.abBwa__col p{font:300 15px/1.65 -apple-system,system-ui,sans-serif;color:#3A3F46;margin:0}

/* the blueprint — deep blue ink on paper, tokens from the skill */
.abBp{--bp-ink:#16305C;--bp-ink2:#3A5788;--bp-ink3:#7489B1;--bp-grid:#DDE4EF;
  --bp-accent:#A44A18}
.abBp__def{font:300 clamp(16px,1.7vw,20px)/1.6 -apple-system,system-ui,sans-serif;
  color:#3A3F46;max-width:56ch;margin:22px 0 0}
.abBp__board{display:grid;grid-template-columns:1fr 1fr;gap:clamp(24px,3.4vw,46px);
  margin-top:clamp(30px,5vh,52px)}
@media(max-width:900px){.abBp__board{grid-template-columns:1fr}}
.abBp__panel{margin:0}
.abBp__num{font:700 10px/1.4 -apple-system,system-ui,sans-serif;letter-spacing:.22em;
  text-transform:uppercase;color:var(--bp-ink2);margin:0 0 10px}
.abBp__panel figcaption{font:300 14px/1.6 -apple-system,system-ui,sans-serif;
  color:#4A4F57;margin-top:12px;max-width:52ch}
.abBp__svg{display:block;width:100%;height:auto;background:#FFF;
  border:1px solid var(--bp-grid);border-radius:10px;color:var(--bp-ink)}
.abBp__grid line{stroke:var(--bp-grid);stroke-width:.5}
.abBp__p{fill:none;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}
.abBp__p--ink{stroke:var(--bp-ink);stroke-width:1.5}
.abBp__p--thin{stroke:var(--bp-ink3);stroke-width:.75}
.abBp__p--accent{stroke:var(--bp-accent);stroke-width:1.5}
.abBp__p.is-dashed{stroke-dasharray:4 5!important;stroke-dashoffset:0!important}
.abBp__t{font:400 13px -apple-system,BlinkMacSystemFont,system-ui,sans-serif;
  letter-spacing:.02em;fill:var(--bp-ink)}
.abBp__t--small{font-size:11.5px}
.abBp__t--faint{fill:var(--bp-ink2);font-style:italic}
.abBp__t--accent{fill:var(--bp-accent);letter-spacing:.06em}
.abBp__p:not(.is-dashed){stroke-dasharray:var(--len);stroke-dashoffset:var(--len)}
.abBp__p.is-drawing{animation:abBpDraw .9s cubic-bezier(.16,.84,.44,1) both}
@keyframes abBpDraw{to{stroke-dashoffset:0}}
.abBp__t{opacity:0}
.abBp__t.is-drawing{animation:abBpFade .48s cubic-bezier(.22,.61,.36,1) both;animation-delay:inherit}
@keyframes abBpFade{to{opacity:1}}
.abBp__panel.is-complete .abBp__p{stroke-dashoffset:0}
.abBp__panel.is-complete .abBp__t{opacity:1}
@media(prefers-reduced-motion:reduce){
  .abBp__p{stroke-dashoffset:0!important}.abBp__t{opacity:1!important}}
.abBp__replay{margin-top:clamp(24px,4vh,40px);appearance:none;background:none;border:none;
  padding:0 0 2px;cursor:pointer;font:400 13px/1 -apple-system,system-ui,sans-serif;
  color:var(--bp-ink2);border-bottom:1px solid var(--bp-ink3)}
.abBp__replay:hover{color:var(--bp-ink);border-bottom-color:var(--bp-ink)}
.abBp__text{margin-top:clamp(28px,4vh,46px);border-top:1px solid rgba(20,22,26,.1);
  padding-top:clamp(20px,3vh,32px)}
.abBp__text>p{font:700 10px/1.4 -apple-system,system-ui,sans-serif;letter-spacing:.26em;
  text-transform:uppercase;color:#6A6F76;margin:0 0 14px}
.abBp__text ol{margin:0;padding-left:22px}
.abBp__text li{font:300 14.5px/1.65 -apple-system,system-ui,sans-serif;color:#3A3F46;
  margin-bottom:10px;max-width:66ch}
@media print{.abBp__p{stroke-dashoffset:0!important}.abBp__t{opacity:1!important}
  .abBp__replay{display:none}}

/* permission and proof — two cards, plain language */
.abPerm__grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;
  background:rgba(20,22,26,.1);border:1px solid rgba(20,22,26,.1);
  margin-top:clamp(30px,5vh,52px)}
@media(max-width:860px){.abPerm__grid{grid-template-columns:1fr}}
.abPerm__card{background:#FCFCFA;padding:clamp(24px,3.2vw,42px)}
.abPerm__l{font:700 10px/1.4 -apple-system,system-ui,sans-serif;letter-spacing:.26em;
  text-transform:uppercase;color:var(--abA,#2F4F44);margin:0 0 10px}
.abPerm__l:not(:first-child){margin-top:26px}
.abPerm__card p{font:300 15px/1.65 -apple-system,system-ui,sans-serif;color:#3A3F46;margin:0}
.abPerm__card ul{margin:0;padding-left:20px}
.abPerm__card li{font:300 14.5px/1.65 -apple-system,system-ui,sans-serif;color:#3A3F46;
  margin-bottom:6px}
.abPerm__chip{display:inline-block;font:700 11px/1 -apple-system,system-ui,sans-serif;
  letter-spacing:.14em;text-transform:uppercase;padding:8px 12px;border-radius:6px;
  border:1px solid var(--abA,#2F4F44);color:var(--abA,#2F4F44)}
.abPerm__ipp{margin-top:26px;padding:16px 18px;border-left:2px solid var(--abA,#2F4F44);
  background:rgba(20,22,26,.03);font:300 13.5px/1.65 -apple-system,system-ui,sans-serif;
  color:#3A3F46}
.abPerm__ipp b{font-weight:650;color:#14161A}

/* the commercial outcome — hypothesis, never a promised number */
.abOut__grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;
  background:rgba(20,22,26,.1);border:1px solid rgba(20,22,26,.1);
  margin-top:clamp(30px,5vh,52px)}
@media(max-width:860px){.abOut__grid{grid-template-columns:1fr}}
.abOut__card{background:#FCFCFA;padding:clamp(24px,3.2vw,42px)}
.abOut__card>span{font:700 10px/1.4 -apple-system,system-ui,sans-serif;letter-spacing:.26em;
  text-transform:uppercase;color:var(--abA,#2F4F44)}
.abOut__m{font-family:"Instrument Serif",Georgia,serif;font-weight:400;
  font-size:clamp(22px,2.6vw,32px);line-height:1.15;letter-spacing:-.01em;
  color:#14161A;margin:12px 0 12px}
.abOut__card p{font:300 14.5px/1.65 -apple-system,system-ui,sans-serif;color:#3A3F46;margin:0}
`;


/* ── the evidence, per industry ─────────────────────────────────────────────
   Each demo can carry its own verified figure set. RULES (non-negotiable):
   primary source, dated, country-flagged; overseas figures shown as overseas;
   never a figure that cannot be traced past a vendor blog; never invent a
   local number. A vertical with no researched set yet gets the shared four. */
const EV_SHARED = {
  kick: 'the evidence &middot; aotearoa and australia',
  head: 'The wait is not a soft problem. It is the most complained-about thing in the country.',
  foot: 'Every figure here is New Zealand or Australian, from a primary source, dated 2025 or 2026. <b>Where no local number exists we say so rather than borrowing an overseas one</b> &mdash; there is still no published NZ study of queue abandonment, contact-centre benchmarks, or the economics of waiting.',
  cards: [
    { to: '22', dur: 1700, em: 'million hours', flag: 'NZ',
      text: 'New Zealanders spent <b>22 million hours on hold</b> in 2025 &mdash; 8.7 hours each. Nearly half say slow service is reason enough to switch.',
      src: 'ServiceNow Customer Experience Report, March 2026' },
    { to: '9274', dur: 1900, em: '', flag: 'AU',
      text: '<b>Delay in claim handling</b> is the single most complained-about issue across the whole Australian financial system &mdash; ahead of misleading conduct and outright denial.',
      src: 'Australian Financial Complaints Authority, 2025 complaints data, February 2026' },
    { to: '58', dur: 1500, em: 'per cent', flag: 'AU',
      text: 'Offered a callback instead of holding, <b>58% took it</b>. People do not object to waiting. They object to waiting with nothing.',
      src: 'Services Australia Annual Report 2024&ndash;25, October 2025' },
    { to: '68.9', dur: 1600, em: 'per cent', flag: 'NZ',
      text: 'Of emergency department patients seen within six hours, against a <b>95% target</b>. One New Zealander in three waits longer than the country says they should.',
      src: 'Dept of the Prime Minister and Cabinet, Government Target 1, quarter to December 2025' },
  ],
};

/* per-demo overrides — researched and verified before they land here */
const EV_RETIREMENT = {
  kick: 'the evidence &middot; retirement, measured',
  head: 'The demand is certain. The wait between enquiry and answer is not.',
  foot: 'Every figure carries its source and its country, and overseas figures are flagged as overseas. <b>Where no local number exists we say so rather than inventing one</b> &mdash; there is still no published NZ study of enquiry response times in retirement living, or of what a family’s decision wait costs an operator.',
  cards: [
    EV_SHARED.cards[0],
    { to: '130', dur: 1600, em: 'a week', flag: 'NZ',
      text: 'Roughly <b>130 people move into a New Zealand retirement village every week</b>, and more than 53,000 live in one now. The enquiries behind those moves are happening today.',
      src: 'Retirement Villages Association, sector statistics, 2025' },
    EV_SHARED.cards[2],
    { to: '23000', dur: 1900, em: 'units short', flag: 'NZ',
      text: 'A projected shortfall of <b>more than 23,000 village units by 2048</b>, with the 75+ growth peak arriving from 2028. Every enquiry an operator answers slowly is one another operator answers first.',
      src: 'JLL, New Zealand Retirement Village Database review, 2025' },
  ],
};

const EV_INSURANCE = {
  kick: 'the evidence &middot; insurance, measured',
  head: 'Delay is the complaint.',
  foot: 'Every figure carries its source and its country, and overseas figures are flagged as overseas. <b>Where no local number exists we say so rather than inventing one</b> &mdash; there is still no published NZ insurer-level claim-time benchmark, and this page will not invent one.',
  cards: [ EV_SHARED.cards[1], EV_SHARED.cards[0], EV_SHARED.cards[2], EV_SHARED.cards[3] ],
};

const EV_CONSTRUCTION = {
  kick: 'the evidence &middot; consenting, measured',
  head: 'The consent clock is not the wait. The file is.',
  foot: 'Every figure carries its source and its country, and overseas figures are flagged as overseas. <b>Where no local number exists we say so rather than inventing one</b> &mdash; there is still no published NZ study of what a request-for-information cycle costs a build programme.',
  cards: [
    { to: '16', dur: 1500, em: 'working days', flag: 'NZ',
      text: 'Median elapsed time to a building consent &mdash; against a median statutory clock of <b>nine</b>. The difference is the file waiting on information a complete application would have carried.',
      src: 'MBIE Building Consent System Performance Monitoring, Q1 2026' },
    { to: '95.4', dur: 1700, em: 'per cent', flag: 'NZ',
      text: 'Of building consent applications were processed inside the statutory 20 working days. <b>The system is keeping its clock</b> &mdash; the wait that remains belongs to the file.',
      src: 'MBIE Building Consent System Performance Monitoring, Q4 2025' },
    EV_SHARED.cards[0],
    EV_SHARED.cards[2],
  ],
};

/* the agentic-arrival card, shared by retail-adjacent verticals */
const CARD_AI = { to: '393', dur: 1900, em: 'per cent', flag: 'US',
  text: '<b>AI-referred traffic to retail sites grew 393% in a year</b>, and it converts better than any other channel. The buyer&rsquo;s agent is already shopping.',
  src: 'Adobe Digital Insights, quarterly AI traffic report, April 2026' };

const EV_FIGURES = {
  'assembling-demo-retirement': EV_RETIREMENT,
  'assembling-ryman-family': EV_RETIREMENT,
  'assembling-summerset': EV_RETIREMENT,
  'assembling-tower': EV_INSURANCE,
  'assembling-southern-cross': EV_INSURANCE,
  'assembling-southbase': EV_CONSTRUCTION,
  'assembling-construction': EV_CONSTRUCTION,
  'assembling-nzpost': {
    kick: 'the evidence &middot; parcels, measured',
    head: 'Every parcel is somebody waiting.',
    foot: 'Every figure carries its source and its country, and overseas figures are flagged as overseas. <b>Where no local number exists we say so rather than inventing one</b> &mdash; there is still no published NZ study of what a &ldquo;where is it&rdquo; contact costs a carrier.',
    cards: [
      { to: '88', dur: 1600, em: 'million parcels', flag: 'NZ',
        text: 'Delivered by NZ Post in FY2025, up from 84 million the year before. Behind each one is somebody watching a tracking page.',
        src: 'NZ Post, annual results, FY2025' },
      CARD_AI,
      EV_SHARED.cards[0],
      EV_SHARED.cards[2],
    ],
  },
  'assembling-woolworths-rewards': {
    kick: 'the evidence &middot; the shop, measured',
    head: 'The shop already knows who is waiting.',
    foot: 'Every figure carries its source and its country, and overseas figures are flagged as overseas. <b>Where no local number exists we say so rather than inventing one</b> &mdash; there is still no published NZ study of what a queue or an out-of-stock wait costs a supermarket relationship.',
    cards: [
      { to: '73.2', dur: 1700, em: 'per cent', flag: 'AU',
        text: 'Of Woolworths Group sales carry an Everyday Rewards tag. <b>The relationship already exists</b> &mdash; what it earns a member during a wait is the open question.',
        src: 'Woolworths Group, F25 full-year results, August 2025' },
      { to: '1.8', dur: 1500, em: 'million', flag: 'NZ',
        text: 'Active Everyday Rewards members in New Zealand &mdash; scanning at the checkout, identifiable in the moment the wait happens.',
        src: 'Woolworths Group reporting, November 2024' },
      EV_SHARED.cards[0],
      EV_SHARED.cards[2],
    ],
  },
  'assembling-hnry': {
    kick: 'the evidence &middot; self-employment, measured',
    head: 'Four hundred thousand people do their admin alone.',
    foot: 'Every figure carries its source and its country, and overseas figures are flagged as overseas. <b>Where no local number exists we say so rather than inventing one</b> &mdash; there is still no published NZ study of the hours a sole trader spends on tax admin, or what deferring it costs.',
    cards: [
      { to: '420000', dur: 2000, em: 'self-employed', flag: 'NZ',
        text: 'More than <b>420,000 New Zealanders are self-employed</b> &mdash; tradies, contractors, creatives, carers. Every one of them is their own back office, after hours.',
        src: 'Stats NZ 2023 Census, via Te Ara Ahunga Ora Retirement Commission, 2025' },
      { to: '44', dur: 1500, em: 'per cent', flag: 'NZ',
        text: 'Of self-employed people actively contribute to KiwiSaver, against 78% of employees. <b>Deferred admin has a cost that compounds</b> &mdash; what waits after a long day tends to keep waiting.',
        src: 'Te Ara Ahunga Ora Retirement Commission, self-employment report, 2025' },
      EV_SHARED.cards[0],
      EV_SHARED.cards[2],
    ],
  },
  'assembling-airnz-cine': {
    kick: 'the evidence &middot; the day of travel, measured',
    head: 'One flight in five arrives late.',
    foot: 'Every figure carries its source and its country, and overseas figures are flagged as overseas. <b>Where no local number exists we say so rather than inventing one</b> &mdash; there is still no published NZ study of what a handled disruption is worth in loyalty against an unhandled one.',
    cards: [
      { to: '79.3', dur: 1600, em: 'per cent', flag: 'NZ',
        text: 'Of Air New Zealand arrivals were on time in 2025 &mdash; second in Asia Pacific, and improving. The other <b>one flight in five</b> is where the day of travel is won or lost.',
        src: 'Air New Zealand newsroom &middot; Cirium On-Time Performance Review, January 2026' },
      { to: '171216', dur: 2000, em: 'flights', flag: 'NZ',
        text: 'Flown across the network in 2025, with 97.22% of scheduled services operated. <b>Disruption is a daily operating condition, not an event</b> &mdash; the question is what the waiting customer gets.',
        src: 'Air New Zealand newsroom, January 2026' },
      EV_SHARED.cards[0],
      EV_SHARED.cards[2],
    ],
  },
  'assembling-contact-cine': {
    kick: 'the evidence &middot; energy, measured',
    head: 'The wait is why they switch.',
    foot: 'Every figure carries its source and its country, and overseas figures are flagged as overseas. <b>Where no local number exists we say so rather than inventing one</b> &mdash; there is still no published NZ study tying hold time to churn in energy retail.',
    cards: [
      { to: '409', dur: 1700, em: 'dollars a year', flag: 'NZ',
        text: 'The average saving a Powerswitch user found by switching. The cost of a wait handled badly is not the call &mdash; it is the customer who leaves at the end of it.',
        src: 'Consumer NZ, Powerswitch media release, February 2024' },
      { to: '6', dur: 1400, em: 'million dollars', flag: 'NZ',
        text: 'Saved collectively in one year by Powerswitch users who switched. The door out of an energy relationship is well signposted and well used.',
        src: 'Consumer NZ, Powerswitch media release, February 2024' },
      EV_SHARED.cards[0],
      EV_SHARED.cards[2],
    ],
  },
  'assembling-nectar': {
    kick: 'the evidence &middot; lending, measured',
    head: 'Lending got faster. Waiting did not.',
    foot: 'Every figure carries its source and its country, and overseas figures are flagged as overseas. <b>Where no local number exists we say so rather than inventing one</b> &mdash; there is still no published NZ study of online loan-application abandonment or the economics of waiting.',
    cards: [
      EV_SHARED.cards[0],
      { to: '13.5', dur: 1600, em: 'per cent', flag: 'NZ',
        text: 'Personal loan enquiries were up <b>13.5% year-on-year</b> in February 2026. The demand is already online &mdash; it arrives at all hours, and it does not queue politely.',
        src: 'Centrix Credit Indicator, February 2026' },
      EV_SHARED.cards[2],
      { to: '10.2', dur: 1600, em: 'per cent', flag: 'NZ',
        text: 'Personal loan arrears reached <b>10.2% in January 2026</b>, the highest in a decade. Careful lending is not optional &mdash; and careful does not have to mean slow.',
        src: 'Centrix Credit Indicator, January 2026' },
    ],
  },
  'assembling-giltrap': {
    kick: 'the evidence &middot; the wait, on the phone and online',
    head: 'The wait did not go away when it went online.',
    foot: 'Every figure carries its source and its country, and overseas figures are flagged as overseas. <b>Where no local number exists we say so rather than inventing one</b> &mdash; there is still no published NZ study of queue abandonment, agentic-commerce behaviour, or the economics of waiting.',
    cards: [
      EV_SHARED.cards[0],
      { to: '393', dur: 1900, em: 'per cent', flag: 'US',
        text: '<b>AI-referred traffic to retail sites grew 393% in a year</b>, and it converts better than any other channel. The buyer’s agent is already shopping &mdash; the lot has to be readable to it.',
        src: 'Adobe Digital Insights, quarterly AI traffic report, April 2026' },
      EV_SHARED.cards[2],
      { to: '47', dur: 1600, em: 'per cent', flag: 'US',
        text: 'Dealer investment in Performance Max rose <b>roughly 47% year-on-year</b> to April 2026, with reported conversions up 119%. The gains go to whoever feeds the platforms the freshest inventory signal.',
        src: 'Automotive-retail industry reporting, April 2026 &mdash; not a Giltrap figure' },
    ],
  },
};

/* ── the demonstrator data, per vertical ────────────────────────────────────
   The assembling-demonstrator skill's data contract, distilled for the fleet:
   the wait in the client's words, the before/while/after, the permission
   model with its named human, and the outcome as a hypothesis. Statutory
   facts from the skill's references/nz-verticals.md (researched August 2026);
   anything unverifiable carries sim:true and renders a visible badge.
   Voice: references/plain-language.md — read it before editing a word. */
const VERT = {
  'assembling-giltrap': {
    party: 'the dealer group',
    wait: { moment: 'the gap between an online enquiry and a human reply',
      dim: 'unmeasured — no NZ dealer group publishes its reply time', sim: true },
    bwa: {
      before: 'An enquiry lands in a shared inbox. It reaches a salesperson when somebody sees it, and the customer hears nothing until then.',
      while: 'The agent reads the stock file, checks the car is still on the lot, drafts the reply and the follow-up campaign — and stages all of it for a person.',
      after: 'The dealer principal approves. The customer hears back about the actual car, with its actual history, while they are still looking at it.' },
    perm: {
      consent: 'The customer asked about a car. That is the whole basis — the agent works that enquiry and nothing else.',
      reads: ['the group stock file, via the DMS', 'the vehicle’s own history and media', 'the enquiry as the customer wrote it'],
      authority: 'draft',
      stops: ['never sends anything a person has not approved', 'never changes a price or lists a vehicle', 'never contacts a customer on its own'],
      retention: 'Drafts live in the DMS like any other note. Deleting the enquiry deletes the work.',
      thirdParty: false, ipp3a: null },
    human: { role: 'the dealer principal', gate: 'before anything is published or sent', law: null },
    out: {
      p: { m: 'enquiries answered while the customer is still looking',
        mech: 'The reply is drafted from live stock the moment the enquiry lands, so the wait for a person is the wait for a yes — not for the work.' },
      s: { m: 'campaign freshness against the lot',
        mech: 'Campaigns assemble from what is actually in stock, so nothing advertises a car that sold on Tuesday.' } },
    bp: { waitLabel: 'the enquiry wait', humanRole: 'a dealer principal',
      youGet: ['the real car, answered', 'no repeating yourself', 'a name on the reply'],
      theyGet: ['fewer cold enquiries', 'the lot always readable', 'no stale campaigns'],
      captions: [
        'A customer asks about a car, and nothing happens until somebody opens the inbox.',
        'Some buyers keep scrolling. The ones who stay get asked the same questions twice.',
        'The agent drafts the reply and the campaign from live stock while the customer is still on the page.',
        'The customer hears back sooner; the group sells from a lot that is always current. A dealer principal signs everything.' ] },
  },
  'assembling-nectar': {
    party: 'the lender',
    wait: { moment: 'while your affordability assessment runs',
      dim: 'same-day funding for 97% of loans — Nectar’s own published marketing figure', sim: false },
    bwa: {
      before: 'An application form, then silence. If something is missing, the silence gets longer, and some people never find out why.',
      while: 'The agent asks the one question that would improve the answer, reads what you already connected — once — and assembles the file in the open.',
      after: 'A decision you can read, the same day, with every step it took visible — and a lending assessor’s name on it.' },
    perm: {
      consent: 'You connected your bank statements and asked for a loan. The agent works inside that, and tells you each time it reads.',
      reads: ['the application as you wrote it', 'bank transactions you connected', 'your credit file, with notice'],
      authority: 'act with approval',
      stops: ['never communicates a credit decision', 'never changes a rate or a fee', 'never reads beyond what you connected'],
      retention: 'Assessment working papers are kept as the CCCFA requires, and you can ask to see everything the file holds.',
      thirdParty: true,
      ipp3a: 'Your credit file comes from a credit reporting agency, not from you. The agent tells you when it is read, why, and what it changed — that is the Privacy Act 2020, IPP 3A, working as intended.' },
    human: { role: 'a lending assessor', gate: 'before any credit decision reaches you',
      law: 'CCCFA lender responsibility principles — administered by the FMA since 1 July 2026' },
    out: {
      p: { m: 'applications finished, not abandoned',
        mech: 'One question at the right moment replaces a form re-done in silence — there is less to walk away from.' },
      s: { m: 'the quality of the file at decision time',
        mech: 'Evidence is gathered once, in context, while the customer is still there to answer.' } },
    bp: { waitLabel: 'the assessment wait', humanRole: 'a lending assessor',
      youGet: ['a same-day answer', 'a decision you can read', 'one question, not a form'],
      theyGet: ['fewer abandoned files', 'no chasing by email', 'evidence gathered once'],
      captions: [
        'You apply, and the assessment runs somewhere you cannot see.',
        'Some applicants give up; the rest get chased for things the file should have caught.',
        'One short question in, a complete file out — assembled while you watch.',
        'You get a same-day decision you can read; the lender stops paying for rework. A lending assessor signs every decision.' ] },
  },
  'assembling-sharesies': {
    party: 'the platform',
    wait: { moment: 'the days a KiwiSaver transfer spends out of market',
      dim: 'Inland Revenue puts a provider transfer at about two weeks; Sharesies names its own window', sim: false },
    bwa: {
      before: 'You sign the form, your money leaves one provider, and for days it belongs to nobody. You find out it landed when you think to check.',
      while: 'The agent tracks each stage by name, confirms your PIR while there is still time to fix it, and prepares your first allocation for the day the money arrives.',
      after: 'The transfer lands into a plan you already approved — and the out-of-market window closes as short as the process allows.' },
    perm: {
      consent: 'You asked to move your KiwiSaver. The agent works that transfer only, and shows you each stage as it happens.',
      reads: ['the transfer’s stage, by name', 'your PIR, against Inland Revenue’s bands', 'the instruction you signed'],
      authority: 'draft',
      stops: ['never gives regulated financial advice — that needs a licensed financial advice provider', 'never picks a fund for you', 'never moves money without your instruction'],
      retention: 'The transfer record stays with your account. The tracking trail is yours to download.',
      thirdParty: true,
      ipp3a: 'Progress updates come from the ceding provider and Inland Revenue, not from you. When the agent learns something about your transfer from them, it tells you — Privacy Act 2020, IPP 3A.' },
    human: { role: 'you', gate: 'the transfer is yours to sign, and nothing moves without it', law: null },
    out: {
      p: { m: 'transfers completed without a “where is it” message',
        mech: 'Each stage is named and visible, so the silence that generates the contact never forms.' },
      s: { m: 'time from arrival to first investment',
        mech: 'The first allocation is prepared and approved before the money lands.' } },
    bp: { waitLabel: 'the transfer window', humanRole: 'you',
      youGet: ['every stage, named', 'your PIR checked in time', 'day-one investment'],
      theyGet: ['fewer status contacts', 'clean handovers', 'a customer who stayed'],
      captions: [
        'Your money leaves one provider and spends days belonging to nobody.',
        'The silence generates the support tickets, and a wrong PIR costs real money every year it goes unfixed.',
        'The agent names each stage, checks your PIR while there is time, and prepares day one.',
        'You arrive invested; the platform answers fewer “where is it” calls. You sign the transfer — nobody else.' ] },
  },
  'assembling-contact-cine': {
    party: 'the retailer',
    wait: { moment: 'the three to four days a switch takes to complete',
      dim: 'Electricity Authority — switching takes three to four days on average', sim: false },
    bwa: {
      before: 'You switch, and the days between retailers are silence broken only by a meter read you did not know was coming.',
      while: 'The agent walks the switch through its registry stages, checks the ICP details once, and sets the first bill up to explain itself before it exists.',
      after: 'The first bill arrives already explained, line by line — and if a wait earned a credit, it lands on the bill in plain words.' },
    perm: {
      consent: 'You asked to switch, or asked about your bill. The agent works inside your account and tells you what it touched.',
      reads: ['your ICP — the Installation Control Point — and its registry record', 'your plan and its rates', 'the meter reads behind each bill'],
      authority: 'act within limits',
      stops: ['never disconnects anyone — that decision belongs to a person, after every Consumer Care step', 'never changes your plan without your yes', 'never recommends prepay where anyone is medically dependent'],
      retention: 'Billing records keep their statutory life. The explanations are part of the bill, not a separate file about you.',
      thirdParty: false, ipp3a: null },
    human: { role: 'a credit and hardship specialist', gate: 'before any action on an unpaid account',
      law: 'Electricity Authority Consumer Care Obligations, mandatory since 1 April 2025 — including at least five separate contact attempts before disconnection is even considered' },
    out: {
      p: { m: 'contacts per bill',
        mech: 'A bill that explains itself does not generate the call.' },
      s: { m: 'payment plans completed',
        mech: 'The five Consumer Care contacts are orchestrated and evidenced, so the plan starts before the debt hardens.' } },
    bp: { waitLabel: 'the switch wait', humanRole: 'a credit specialist',
      youGet: ['a bill in plain words', 'credits, on the bill', 'no surprise meter read'],
      theyGet: ['fewer billing calls', 'evidenced compliance', 'a switch that sticks'],
      captions: [
        'You switch retailers, and for three or four days nothing tells you where it is up to.',
        'The first bill arrives unexplained, and the call centre pays for every question it raises.',
        'The agent walks the switch through, then builds the bill that answers its own questions.',
        'You read your bill instead of phoning about it; the retailer keeps evidence of every care step. A credit specialist owns every account decision.' ] },
  },
  'assembling-airnz-cine': {
    party: 'the airline',
    wait: { moment: 'the minutes after “your flight is disrupted” and before “here is your plan”',
      dim: 'Air New Zealand commits to notifying delays over 30 minutes within 30 minutes', sim: false },
    bwa: {
      before: 'The board changes, the queue forms, and everyone in it is waiting to ask one person the same question.',
      while: 'The agent assembles your options before you reach the counter — the next seats, your fare’s actual rules, what the Civil Aviation Act 2023 says this disruption owes you.',
      after: 'You choose from real options on your phone while the queue is still forming. Anything outside policy waits for a person to say yes.' },
    perm: {
      consent: 'You are booked on the disrupted flight. The agent works your booking and tells you what it prepared.',
      reads: ['your booking and its fare rules', 'live seat availability', 'the disruption’s cause and status'],
      authority: 'act within limits',
      stops: ['never rebooks outside fare rules without a person', 'never decides what a disruption legally owes you — it shows you the published position', 'never contacts anyone but you about your trip'],
      retention: 'Rebooking records live with the booking. The prepared options expire with the disruption.',
      thirdParty: false, ipp3a: null },
    human: { role: 'a customer care agent', gate: 'for anything outside the fare’s own rules',
      law: 'Civil Aviation Act 2023 — for delays within the airline’s control, damages can reach ten times the ticket price' },
    out: {
      p: { m: 'disruptions resolved without joining a queue',
        mech: 'The options arrive on the phone before the counter can form a line.' },
      s: { m: 'time from disruption to a confirmed plan',
        mech: 'The work happens during the announcement, not after the queue.' } },
    bp: { waitLabel: 'the disruption wait', humanRole: 'a care agent',
      youGet: ['options before the queue', 'your rights, published', 'a plan you chose'],
      theyGet: ['shorter queues', 'consistent answers', 'loyalty kept on bad days'],
      captions: [
        'The board changes, and a plane-load of people starts waiting for one counter.',
        'Every minute in that queue is a customer deciding how they feel about the airline.',
        'The agent prepares each traveller’s real options while the announcement is still echoing.',
        'You leave with a plan you chose; the airline keeps the day. A customer care agent approves anything outside the rules.' ] },
  },
  'assembling-hnry': {
    party: 'Hnry',
    wait: { moment: 'the days between sending an invoice and the money actually arriving',
      dim: 'unmeasured — no NZ study of sole-trader payment waits exists', sim: true },
    bwa: {
      before: 'You send the invoice, then carry it in your head — is it paid, is the tax put aside, is tonight the night you do the admin.',
      while: 'The agent watches for the payment, and the moment it lands the tax, ACC, KiwiSaver and student loan are calculated and put where they belong.',
      after: 'What reaches your account is already yours. The filing is prepared, and a Hnry accountant reviews it before anything goes to Inland Revenue.' },
    perm: {
      consent: 'You joined Hnry to have this handled. The agent works your invoices and payments, and shows its working on each one.',
      reads: ['the invoices you raise', 'payments as they arrive', 'the expenses you claim'],
      authority: 'act within limits',
      stops: ['never files without an accountant’s review', 'never touches money beyond the calculated deductions', 'never gives tax advice a person has not stood behind'],
      retention: 'Your records are kept for the seven years tax law expects, and they are yours to take.',
      thirdParty: false, ipp3a: null },
    human: { role: 'a Hnry accountant', gate: 'before anything is filed with Inland Revenue', law: null },
    out: {
      p: { m: 'admin hours returned to the trade',
        mech: 'The after-hours bookkeeping happens inside the payment wait instead of on Sunday night.' },
      s: { m: 'allocations made on payment day',
        mech: 'Tax and KiwiSaver are put aside the moment money lands, not when someone remembers.' } },
    bp: { waitLabel: 'the invoice wait', humanRole: 'a Hnry accountant',
      youGet: ['tax handled on arrival', 'Sunday nights back', 'a reviewed filing'],
      theyGet: ['clean records', 'fewer corrections', 'customers who stay'],
      captions: [
        'You send an invoice, and the admin it creates waits for your evening.',
        'Deferred admin compounds — the 44% KiwiSaver gap among the self-employed is what it looks like at scale.',
        'The moment the payment lands, the deductions are calculated and put where they belong.',
        'You keep your evening; the books stay clean. A Hnry accountant reviews before anything is filed.' ] },
  },
  'assembling-nzpost': {
    party: 'the carrier',
    wait: { moment: 'the hours between the depot scan and your door',
      dim: 'unmeasured — carriers publish delivery targets, not door-window accuracy', sim: true },
    bwa: {
      before: 'A tracking page that says “on board for delivery” from breakfast to dinner, and a “where is my parcel” call the carrier pays to answer.',
      while: 'The agent narrows the window as scans arrive, asks where to leave it if you are out, and rebooks the delivery the moment a miss becomes certain.',
      after: 'The parcel arrives inside a window you recognised, to the instruction you gave — or rebooked to a day you chose, before the card hit the letterbox.' },
    perm: {
      consent: 'You are the addressee. The agent works your parcel’s journey and nothing else about you.',
      reads: ['your parcel’s scan history', 'the delivery run it is on', 'the instruction you set'],
      authority: 'act within limits',
      stops: ['never leaves a parcel anywhere you did not name', 'never redirects without your instruction', 'never shares more than delivery status with the sender'],
      retention: 'Scan history keeps its operational life. Your instructions apply to this parcel unless you save them.',
      thirdParty: false, ipp3a: null },
    human: { role: 'you', gate: 'before any delivery instruction changes', law: null },
    out: {
      p: { m: 'first-attempt delivery success',
        mech: 'The instruction arrives before the van does, so fewer doors are knocked on emptiness.' },
      s: { m: '“where is it” contacts',
        mech: 'A narrowing window answers the question before it is asked.' } },
    bp: { waitLabel: 'the delivery wait', humanRole: 'you',
      youGet: ['a window, narrowing', 'your door, your rules', 'no card in the letterbox'],
      theyGet: ['fewer failed attempts', 'fewer status calls', 'vans that finish earlier'],
      captions: [
        '“On board for delivery” covers ten hours, and somebody is home for all of them.',
        'Every failed attempt is a second van, a card, a depot queue, and an annoyed customer.',
        'The agent narrows the window scan by scan and asks the one question that saves the attempt.',
        'You meet your parcel; the carrier saves the second run. Nothing about your delivery changes without you.' ] },
  },
  'assembling-woolworths-rewards': {
    party: 'the supermarket',
    wait: { moment: 'while your online shop is picked',
      dim: 'no NZ supermarket publishes picking times — the wait is real, a number here would be invented', sim: true },
    bwa: {
      before: 'You order, then wait to learn what was actually in stock. The substitutions arrive as a surprise at the door.',
      while: 'The agent flags each out-of-stock as the picker finds it, offers you the swap while there is still time to say no, and keeps your points attached to what you actually bought.',
      after: 'The box that arrives is the box you approved. The receipt matches, and your Everyday Rewards balance reflects the shop you really did.' },
    perm: {
      consent: 'You shopped online with your Everyday Rewards account. The agent works this order, with the preferences you have saved.',
      reads: ['your order and its picking status', 'stock at your store', 'your saved substitution preferences'],
      authority: 'act with approval',
      stops: ['never substitutes without your standing or in-the-moment yes', 'never charges more than the approved swap', 'never uses your basket beyond this order without asking'],
      retention: 'Order history stays in your account, where you can see and delete it.',
      thirdParty: false, ipp3a: null },
    human: { role: 'you', gate: 'before any substitution is charged', law: null },
    out: {
      p: { m: 'substitution acceptance',
        mech: 'A swap you approved in the moment is a swap you keep.' },
      s: { m: 'refund requests at the door',
        mech: 'Surprises are resolved during picking, not after delivery.' } },
    bp: { waitLabel: 'the picking wait', humanRole: 'you',
      youGet: ['the box you approved', 'a receipt that matches', 'points on the real shop'],
      theyGet: ['fewer refunds', 'fewer doorstep disputes', 'baskets that complete'],
      captions: [
        'Between checkout and doorstep, your shop is being decided without you.',
        'Every surprise substitution is a refund request, a support contact, or a smaller order next time.',
        'The agent brings each decision to you while the picker is still in the aisle.',
        'You get the shop you chose; the store stops paying for surprises. Substitutions are yours to approve — nobody else’s.' ] },
  },
  'assembling-southern-cross': {
    party: 'the insurer',
    wait: { moment: 'while your prior approval is assessed',
      dim: 'unpublished — health insurers do not publish approval turnaround times', sim: true },
    bwa: {
      before: 'The specialist says you need it, the insurer has to agree, and between those two sentences you wait with a diagnosis and a quote.',
      while: 'The agent assembles what the assessor will need — the policy terms that apply, the provider’s invoice detail, the questions only you can answer — before the file joins the queue.',
      after: 'The file arrives complete, so the assessment starts on arrival. The decision is a person’s, and it reaches you with its reasons attached.' },
    perm: {
      consent: 'You claimed under your policy. The agent works that claim and tells you each thing it gathers.',
      reads: ['your policy and its terms', 'the provider’s estimate or invoice', 'the claim as you submitted it'],
      authority: 'act with approval',
      stops: ['never approves or declines a claim', 'never contacts your specialist without your yes', 'never reads health information beyond this claim'],
      retention: 'Claims records keep their statutory life. Health information stays inside the claim that needed it.',
      thirdParty: true,
      ipp3a: 'Estimates and invoices come from your provider, not from you. When the agent receives one, it tells you what arrived and why — Privacy Act 2020, IPP 3A.' },
    human: { role: 'a claims assessor', gate: 'every approval and every decline',
      law: 'a licensed insurer’s fair conduct programme under CoFI, in force since 31 March 2025' },
    out: {
      p: { m: 'time from claim to decision',
        mech: 'The file is complete when it reaches the assessor, so the queue holds finished work, not questions.' },
      s: { m: 'follow-up requests per claim',
        mech: 'The questions are asked while the customer is present, not discovered in the queue.' } },
    bp: { waitLabel: 'the approval wait', humanRole: 'a claims assessor',
      youGet: ['a complete file, day one', 'a decision with reasons', 'no chasing your clinic'],
      theyGet: ['queues of finished work', 'fewer follow-ups', 'decisions that hold'],
      captions: [
        'Between the specialist’s letter and the insurer’s answer, you hold a diagnosis and a quote.',
        'An incomplete file waits twice — once in the queue, once for the question the queue discovers.',
        'The agent gathers what the assessor will need while the wait is still yours.',
        'You wait once, not twice; the insurer assesses finished files. A claims assessor makes every decision.' ] },
  },
  'assembling-tower': {
    party: 'the insurer',
    wait: { moment: 'the ten business days the Fair Insurance Code allows once your claim has all its information',
      dim: 'Fair Insurance Code 2020 — acknowledge in 5, decide in 10, update at least every 20 business days', sim: false },
    bwa: {
      before: 'You lodge the claim, and the clock you cannot see starts and stops every time something is missing.',
      while: 'The agent gets the file complete before the decision clock starts — photos, the repairer’s quote, your excess confirmed — and shows you which day the Code’s clock is actually on.',
      after: 'A decision inside the published cadence, from a named claims manager, with the timeline it took attached.' },
    perm: {
      consent: 'You claimed on your policy. The agent works that claim, and its clock is visible to you the whole way.',
      reads: ['your policy and excess', 'what you lodged, as you lodged it', 'quotes and reports as they arrive'],
      authority: 'act with approval',
      stops: ['never accepts or declines a claim', 'never appoints a repairer without your yes', 'never restarts the clock without telling you why'],
      retention: 'Claims files keep their statutory life, and the timeline stays readable after settlement.',
      thirdParty: true,
      ipp3a: 'Assessor reports and repairer quotes arrive from third parties, not from you. The agent tells you when they land and what they say — Privacy Act 2020, IPP 3A.' },
    human: { role: 'a claims manager', gate: 'before any decision is communicated',
      law: 'Fair Insurance Code 2020 — decide within 10 business days of complete information; a claim unsettled after 12 months is a reportable breach' },
    out: {
      p: { m: 'claims decided inside the Code’s ten days',
        mech: 'The file is complete before the clock starts, so the ten days hold a decision, not a hunt.' },
      s: { m: 'progress complaints',
        mech: 'A visible clock removes the question that becomes the complaint.' } },
    bp: { waitLabel: 'the claim wait', humanRole: 'a claims manager',
      youGet: ['a clock you can see', 'a complete file, once', 'a named decision'],
      theyGet: ['the Code kept, provably', 'fewer progress calls', 'clean files at decision'],
      captions: [
        'The Code gives the insurer ten business days — but only once the file is complete, and you cannot see which day it is on.',
        'Every missing photo stops a clock nobody told you had stopped.',
        'The agent completes the file first, then shows you the clock actually running.',
        'You see the day; the insurer keeps its Code, provably. A claims manager signs every decision.' ] },
  },
  'assembling-demo-retirement': {
    party: 'the village',
    wait: { moment: 'the 15 working days after you sign the Occupation Right Agreement',
      dim: 'Retirement Villages Act 2003, s 28(1)(a) — cancellation without reason inside 15 working days', sim: false },
    bwa: {
      before: 'A tour, a brochure, then a legal document — and a fortnight in which the biggest questions finally surface, after everyone has gone home.',
      while: 'The agent assembles the decision while the window is open: the money in plain words, the family’s questions gathered, the brief your lawyer will actually use.',
      after: 'You reach the independent lawyer the law requires with a one-page brief instead of a folder of loose ends — and the decision is made inside the window, not despite it.' },
    perm: {
      consent: 'You enquired, and you chose to be walked through the decision. The agent prepares; it never persuades.',
      reads: ['the Occupation Right Agreement you were given', 'the village’s published fees', 'the questions you and your whānau raise'],
      authority: 'draft',
      stops: ['never advises on the ORA — the law reserves that for your own lawyer', 'never contacts the village on your behalf without your yes', 'never treats silence as a decision'],
      retention: 'Your working file belongs to you and leaves with you, whichever way you decide.',
      thirdParty: false, ipp3a: null },
    human: { role: 'the independent lawyer you choose', gate: 'before signing means anything — the law requires their certificate',
      law: 'Retirement Villages Act 2003, s 27(3)–(6) — independent legal advice is mandatory and must be certified' },
    out: {
      p: { m: 'decisions settled inside the statutory window',
        mech: 'Families reach the lawyer prepared, so the 15 working days hold a decision instead of a scramble.' },
      s: { m: 'questions resolved before the lawyer’s clock',
        mech: 'The brief is assembled while the window is open, at conversation pace.' } },
    bp: { waitLabel: 'the 15 working days', humanRole: 'your own lawyer',
      youGet: ['the money, in plain words', 'your lawyer, briefed', 'a decision, not a drift'],
      theyGet: ['confident residents', 'fewer cancellations', 'shorter enquiry cycles'],
      captions: [
        'You sign, and the law gives you 15 working days to be sure.',
        'The window fills with everything except the answers — and some families let it close undecided.',
        'The agent turns the fortnight into preparation: the money explained, the questions gathered, the lawyer briefed.',
        'You decide with your eyes open; the village welcomes residents who stay decided. Your own lawyer certifies it — that is the law.' ] },
  },
  'assembling-ryman-family': {
    party: 'the village',
    wait: { moment: 'the 15 working days after the Occupation Right Agreement is signed',
      dim: 'Retirement Villages Act 2003, s 28(1)(a) — the cooling-off window is the family’s window too', sim: false },
    bwa: {
      before: 'Mum signed on Tuesday. By Friday the family group chat has forty messages and nobody is sure who asked the village what.',
      while: 'The agent gathers every question into one place, answers the ones the documents already answer — the 30% deferred management fee, in dollars — and routes the rest to the right person once.',
      after: 'One brief, shared with the whole family, taken to the independent lawyer the law requires. Everyone saw the same answers.' },
    perm: {
      consent: 'The resident chose to include their family. Everyone sees the same file; nobody sees more than the resident allowed.',
      reads: ['the ORA and its schedules', 'the village’s published fees', 'the family’s questions, gathered and deduplicated'],
      authority: 'draft',
      stops: ['never advises on the ORA', 'never answers for the village — it routes and records', 'never shares more than the resident allowed'],
      retention: 'The family file belongs to the resident and leaves with them.',
      thirdParty: false, ipp3a: null },
    human: { role: 'the independent lawyer', gate: 'their certificate is what makes the signature real',
      law: 'Retirement Villages Act 2003, s 27(3)–(6)' },
    out: {
      p: { m: 'families aligned before the lawyer’s meeting',
        mech: 'Forty scattered messages become one shared brief, so the meeting decides instead of discovers.' },
      s: { m: 'repeat questions to village staff',
        mech: 'Each question is answered once, visibly, for everyone allowed to see it.' } },
    bp: { waitLabel: 'the 15 working days', humanRole: 'the family’s lawyer',
      youGet: ['one shared brief', 'the DMF in dollars', 'every question, once'],
      theyGet: ['fewer repeat calls', 'aligned families', 'decisions that hold'],
      captions: [
        'The law holds the door open for 15 working days — and the whole family walks through it at once.',
        'Forty messages, three phone calls, and the same question asked four ways.',
        'The agent collects every question, answers what the documents answer, and routes the rest once.',
        'The family decides together, informed; the village answers each question once. The lawyer’s certificate makes it real.' ] },
  },
  'assembling-summerset': {
    party: 'the village',
    wait: { moment: 'the 15 working days after you sign, when the money questions surface',
      dim: 'Retirement Villages Act 2003, s 28(1)(a); Summerset’s deferred management fee is 25% over four years, published', sim: false },
    bwa: {
      before: 'A licence to occupy, a deferred management fee, a weekly fee — three phrases doing a lot of work in a document most people sign once in a lifetime.',
      while: 'The agent turns the numbers into sentences: 25% deferred over four years, in dollars, on your villa; what the weekly fee can and cannot rise by; the $3,000 deposit and who actually holds it.',
      after: 'You and your lawyer read the same plain-words sheet. The certificate the law requires gets signed over understanding, not over trust.' },
    perm: {
      consent: 'You asked to see the money in plain words. The agent explains the published terms; it never negotiates them.',
      reads: ['the ORA’s financial schedule', 'the village’s published fee structure', 'the worked examples you request'],
      authority: 'draft',
      stops: ['never advises whether to sign', 'never estimates resale or repayment timing — no statutory deadline exists today, and it says so', 'never rounds a number in its own favour'],
      retention: 'Your worked examples are yours, and they leave with you.',
      thirdParty: false, ipp3a: null },
    human: { role: 'the independent lawyer you choose', gate: 'the certificate under s 27 — mandatory, witnessed, yours',
      law: 'Retirement Villages Act 2003, s 27(3)–(6)' },
    out: {
      p: { m: 'residents who can explain their own ORA',
        mech: 'Money explained in dollars during the window becomes a decision that does not unravel later.' },
      s: { m: 'the exit conversation, had early',
        mech: 'Repayment on relicensing is explained before signing — the reform debate is public, and honesty now prevents grief later.' } },
    bp: { waitLabel: 'the 15 working days', humanRole: 'your own lawyer',
      youGet: ['the DMF in dollars', 'the weekly fee’s ceiling', 'the exit, explained'],
      theyGet: ['decisions that hold', 'fewer disputes later', 'trust that compounds'],
      captions: [
        'Fifteen working days to be sure about the biggest financial decision of the decade.',
        'Three defined terms carry the whole cost, and most people meet them for the first time in the document.',
        'The agent turns every defined term into dollars on your actual villa, while the window is open.',
        'You sign understanding the money; the village keeps a resident who stays sure. Your own lawyer certifies it.' ] },
  },
  'assembling-southbase': {
    party: 'the build team',
    wait: { moment: 'the working days a consent spends with council — and the file’s share of them',
      dim: 'MBIE — median 16 elapsed working days against a median statutory clock of nine, Q1 2026', sim: false },
    bwa: {
      before: 'The consent goes in, the programme holds its breath, and every request for information restarts a clock the client reads as delay.',
      while: 'The agent assembles the application complete before it leaves — every referenced document present, every condition from the last job checked — and answers each RFI the day it lands.',
      after: 'The consent comes back on the file’s best case, and the programme absorbs fact, not surprise.' },
    perm: {
      consent: 'The client engaged the builder. The agent works the project’s own documents and the council’s public requirements.',
      reads: ['the application and its references', 'the council’s published checklists', 'requests for information as they arrive'],
      authority: 'act with approval',
      stops: ['never lodges or responds without the project director’s approval', 'never commits the programme to a date the consent does not support', 'never speaks for the client to council'],
      retention: 'Project records keep the life the contract requires.',
      thirdParty: false, ipp3a: null },
    human: { role: 'the project director', gate: 'every lodgement and every RFI response',
      law: 'Building Act 2004 — the 20 working day statutory clock, which councils met 95.4% of the time in Q4 2025' },
    out: {
      p: { m: 'RFI cycles per consent',
        mech: 'A complete file first time removes the request that restarts the clock.' },
      s: { m: 'programme certainty at tender',
        mech: 'Consent durations become forecastable when the file’s share of the wait is engineered out.' } },
    bp: { waitLabel: 'the consent wait', humanRole: 'a project director',
      youGet: ['a date you can plan on', 'delay explained honestly', 'no surprise restarts'],
      theyGet: ['complete files, first time', 'RFIs answered same day', 'tenders priced on fact'],
      captions: [
        'The consent is with council, and the programme is waiting on the file.',
        'Each request for information restarts a clock the client experiences as the builder being slow.',
        'The agent lodges complete and answers each RFI the day it arrives.',
        'The client plans on dates that hold; the build team stops paying for restarts. The project director signs every response.' ] },
  },
  'assembling-construction': {
    party: 'the builder',
    wait: { moment: 'the working days between lodging and the letter back',
      dim: 'MBIE — 95.4% of building consents processed inside the statutory 20 working days, Q4 2025', sim: false },
    bwa: {
      before: 'The application goes in and the homeowner starts asking the builder a question the builder cannot answer: how long.',
      while: 'The agent tracks the consent’s actual stage, keeps the file answerable, and turns each council question around the day it arrives.',
      after: 'The consent arrives on its best case, and everyone watched it happen instead of wondering.' },
    perm: {
      consent: 'The homeowner engaged the builder for this job. The agent works this consent’s documents, visibly.',
      reads: ['the application as lodged', 'the council’s processing stage', 'questions as council raises them'],
      authority: 'act with approval',
      stops: ['never lodges or replies without the project lead', 'never promises a council date', 'never speaks to council as the homeowner — it prepares, the people sign'],
      retention: 'The consent file is the job’s record and stays with it.',
      thirdParty: false, ipp3a: null },
    human: { role: 'the project lead', gate: 'every lodgement and reply',
      law: 'Building Act 2004 — the 20 working day statutory clock' },
    out: {
      p: { m: 'consents granted without an information request',
        mech: 'The file leaves complete, so the clock runs instead of restarting.' },
      s: { m: '“how long” calls from the homeowner',
        mech: 'A visible stage answers the question the builder used to absorb.' } },
    bp: { waitLabel: 'the consent wait', humanRole: 'a project lead',
      youGet: ['a stage you can see', 'an honest timeline', 'a builder who builds'],
      theyGet: ['clocks that run', 'fewer status calls', 'jobs that start on time'],
      captions: [
        'Between lodging and the letter, the homeowner’s only update is the builder’s guess.',
        'Every information request adds weeks, and the builder wears the blame for the calendar.',
        'The agent keeps the file complete and everyone watching the same clock.',
        'The homeowner sees the real stage; the builder answers questions once. The project lead signs everything that moves.' ] },
  },
  'assembling-myfoodbag': {
    party: 'My Food Bag',
    wait: { moment: 'the days between Sunday’s cutoff and the box on the doorstep',
      dim: 'the window is real; its hours vary by region, so this page does not put a number on it', sim: true },
    bwa: {
      before: 'You choose meals on Sunday, and by Thursday the week has changed — someone is away, something came up, and the box no longer fits the week it was picked for.',
      while: 'The agent checks in once before packing: who is actually home, what is already in the fridge, whether to swap the slow meal for the fast one.',
      after: 'The box that arrives fits the week you are actually having — and nothing was swapped without your yes.' },
    perm: {
      consent: 'You subscribed and set your preferences. The agent asks before the box is packed; it never decides alone.',
      reads: ['your order and delivery day', 'your saved preferences', 'your answers to the one check-in'],
      authority: 'act with approval',
      stops: ['never changes an order without your yes', 'never adds items you did not approve', 'never assumes silence means yes — silence means the original order stands'],
      retention: 'Order history stays in your account, deletable by you.',
      thirdParty: false, ipp3a: null },
    human: { role: 'you', gate: 'before the box is packed', law: null },
    out: {
      p: { m: 'skipped weeks',
        mech: 'A box that adapts to the week is a box that does not get skipped.' },
      s: { m: 'meals binned uncooked',
        mech: 'The fast-week swap happens before packing, not in the compost.' } },
    bp: { waitLabel: 'the box wait', humanRole: 'you',
      youGet: ['a box that fits the week', 'one question, not a form', 'nothing swapped unasked'],
      theyGet: ['fewer skipped weeks', 'packing certainty', 'subscribers who stay'],
      captions: [
        'The week you ordered for and the week you are having are four days apart.',
        'Boxes that no longer fit get skipped — and skipped has a way of becoming cancelled.',
        'One check-in before packing lets the box adapt to the week.',
        'You cook the week you are actually in; the kitchen packs to certainty. The box changes only when you say so.' ] },
  },
  'assembling-demo-banking': {
    party: 'the bank',
    wait: { moment: 'while the lending decision is made — and after, when you ask why',
      dim: 'decision turnarounds are not published — this page does not invent one', sim: true },
    bwa: {
      before: 'The application disappears into the bank and comes back as yes or no. The reasons stay inside.',
      while: 'The agent assembles the decision file in the open — what was read, what was weighed, what a decline would need to change — while the assessment runs.',
      after: 'The answer arrives with its trace attached. A yes you can read, or a no that tells you what would make it a yes.' },
    perm: {
      consent: 'You applied, and you connected what the assessment needs. The agent shows you each thing it reads.',
      reads: ['your application', 'the accounts you connected', 'your credit file, with notice'],
      authority: 'act with approval',
      stops: ['never makes or communicates the decision', 'never reads accounts you did not connect', 'never buries a decline reason in policy language'],
      retention: 'Decision files are kept as the CCCFA requires, readable to you on request.',
      thirdParty: true,
      ipp3a: 'Your credit file comes from a credit reporting agency, not from you. You are told when it is read and what it contributed — Privacy Act 2020, IPP 3A.' },
    human: { role: 'a credit officer', gate: 'every decision, yes or no',
      law: 'CCCFA lender responsibility principles' },
    out: {
      p: { m: 'declined applicants who return',
        mech: 'A decline that names its reasons is an application that comes back qualified.' },
      s: { m: 'decision complaints',
        mech: 'A traced decision leaves nothing to dispute about how it was made.' } },
    bp: { waitLabel: 'the decision wait', humanRole: 'a credit officer',
      youGet: ['a decision with reasons', 'a path from no to yes', 'nothing read unseen'],
      theyGet: ['decisions that hold', 'fewer complaints', 'returns worth having'],
      captions: [
        'The application goes in, and the reasons never come out.',
        'An unexplained no costs the customer the answer and the bank the customer.',
        'The agent builds the decision file in the open while the assessment runs.',
        'You read the why; the bank stands behind a traceable decision. A credit officer signs every one.' ] },
  },
  'assembling-demo-grocery': {
    party: 'the grocer',
    wait: { moment: 'the gap between running out and writing it down',
      dim: 'household restocking has no published NZ numbers — everything here is illustrative', sim: true },
    bwa: {
      before: 'The list lives on the fridge, half-remembered, and the shop gets done from memory plus guesswork.',
      while: 'The agent keeps the list assembling all week from what the household actually uses, and has the shop ready when you are.',
      after: 'You approve a list that wrote itself honestly — and nothing is ordered until you do.' },
    perm: {
      consent: 'You opted the household in. The agent watches the pantry you told it to watch, and nothing else.',
      reads: ['the staples you flagged', 'your purchase history with the grocer', 'the list as it assembles'],
      authority: 'act with approval',
      stops: ['never orders without your approval', 'never adds a product you have not bought or flagged', 'never shares household patterns with anyone'],
      retention: 'The household file is yours — export it or delete it whole.',
      thirdParty: false, ipp3a: null },
    human: { role: 'you', gate: 'nothing is ordered until you approve the list', law: null },
    out: {
      p: { m: 'list-to-basket completion',
        mech: 'A list that assembled itself all week has nothing left to remember at the shop.' },
      s: { m: 'midweek top-up trips',
        mech: 'The forgotten item is the trip — a complete list removes it.' } },
    bp: { waitLabel: 'the list wait', humanRole: 'you',
      youGet: ['a list that writes itself', 'no forgotten staples', 'one approval, one shop'],
      theyGet: ['complete baskets', 'predictable demand', 'shoppers who return'],
      captions: [
        'Every household runs the same loop: run out, forget, remember at the wrong moment.',
        'The forgotten item becomes a second trip or a lost basket.',
        'The list assembles itself all week from what the household really uses.',
        'You shop from a complete list; the grocer sees the basket coming. Nothing is ordered until you say go.' ] },
  },
};

function evidence(accent, folder) {
  const ev = EV_FIGURES[folder] || EV_SHARED;
  const cards = ev.cards.map(c => `
      <div class="abEv__c">
        <div class="abEv__n"><span data-m="count" data-m-to="${c.to}" data-m-dur="${c.dur}">0</span>${c.em ? '<em>' + c.em + '</em>' : ''}</div>
        <p class="abEv__t">${c.text}</p>
        <div class="abEv__s"><span class="abEv__flag">${c.flag}</span>${c.src}</div>
      </div>`).join('');
  return `
<!-- ab:ev:start — the evidence, per industry -->
<section class="abEv" style="--abA:${accent}" aria-label="the evidence">
  <div class="abEv__in">
    <div class="abEv__k">${ev.kick}</div>
    <h2 class="abEv__h" data-m="type">${ev.head}</h2>
    <div class="abEv__grid">${cards}
    </div>
    <p class="abEv__foot">${ev.foot}</p>
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
      <!-- mStage__* aliases are load-bearing: assembl-motion's scrub() drives
           .mStage__step/.mStage__fill — without them the copy never advances -->
      <div class="abStage__step mStage__step on"><div class="abStage__n">Dispersed.</div>
        <div class="abStage__l">Everything the business already knows, in the places it already lives.</div></div>
      <div class="abStage__step mStage__step"><div class="abStage__n">Selected.</div>
        <div class="abStage__l">Only what this stage of this journey needs.</div></div>
      <div class="abStage__step mStage__step"><div class="abStage__n">Assembling.</div>
        <div class="abStage__l">The work happening in the open, named, while the customer watches.</div></div>
      <div class="abStage__step mStage__step"><div class="abStage__n">Held.</div>
        <div class="abStage__l">Complete, and waiting for a named person to say yes.</div></div>
    </div>
    <div class="abStage__rail"><div class="abStage__fill mStage__fill"></div></div>
  </div>
</section>
<section class="abMosBand" aria-hidden="true">
  <div class="abMosBand__in"><div class="abMosBand__host" id="abMos"></div></div>
</section>
<!-- ab:end -->
`;
}

/* ── the demonstrator modules, built from VERT ──────────────────────────────
   Definition above the fold; the wait as before/while/after; the blueprint
   explainer; permission and proof; the outcome as a hypothesis. Section
   heads are lower-case — the skill's register. */
function defBlock() {
  return `
<!-- ab:def:start — what assembl is, above the fold -->
<section class="abDef" aria-label="what assembl is">
  <div class="abDef__in">
    <p><b>assembl</b> designs and runs agentic customer journeys.</p>
    <p><b>assembling</b> is the wait-state layer: it turns a natural waiting moment into useful, permissioned, rewarded work that improves the customer&rsquo;s next step &mdash; while a named human stays in control.</p>
  </div>
</section>
<!-- ab:def:end -->
`;
}

function bwaBlock(v, accent) {
  const badge = v.wait.sim ? ' <span class="abSim">no published figure</span>' : '';
  return `
<!-- ab:bwa:start — the wait moment, before / while / after -->
<section class="abSec abSec--rule" style="--abA:${accent}" aria-label="the wait moment">
  <div class="abSec__in">
    <div class="abSec__k">the wait moment</div>
    <h2 class="abSec__h" data-m="type">${v.wait.moment}.</h2>
    <p class="abBwa__dim">${v.wait.dim}${badge}</p>
    <div class="abBwa__grid">
      <div class="abBwa__col" data-m="rise"><h3>before</h3><p>${v.bwa.before}</p></div>
      <div class="abBwa__col" data-m="rise"><h3>while</h3><p>${v.bwa.while}</p></div>
      <div class="abBwa__col" data-m="rise"><h3>after</h3><p>${v.bwa.after}</p></div>
    </div>
  </div>
</section>
<!-- ab:bwa:end -->
`;
}

function bpBlock(v, accent) {
  const steps = [
    `Every business makes people wait somewhere. Here it is ${v.wait.moment}.`,
    'Today that time produces nothing — some people give up, and the work still happens later, when it costs more.',
    'assembling fills it: one small question in, prepared work out, and something back for the customer.',
    `Who is better off: the customer gets ${v.bp.youGet.join(', ')}; ${v.party} gets ${v.bp.theyGet.join(', ')}.`,
    `${v.human.role.charAt(0).toUpperCase() + v.human.role.slice(1)} stays in charge — ${v.human.gate}.`,
  ].map(t => `<li>${t}</li>`).join('\n      ');
  return `
<!-- ab:bp:start — the blueprint explainer -->
<section class="abSec abSec--rule abBp" style="--abA:${accent}" aria-label="the idea, from scratch" id="abBp">
  <div class="abSec__in">
    <div class="abSec__k">the idea, from scratch</div>
    <h2 class="abSec__h" data-m="type">what a monetised wait state is</h2>
    <p class="abBp__def">A monetised wait state is a wait that pays for itself &mdash; the customer gets something useful out of it, and the business gets work done that would otherwise cost it money later.</p>
    <div class="abBp__board" data-bp-board></div>
    <button class="abBp__replay" type="button" data-bp-replay>draw it again</button>
    <div class="abBp__text">
      <p>the same thing, in words</p>
      <ol>
      ${steps}
      </ol>
    </div>
  </div>
</section>
<!-- ab:bp:end -->
`;
}

function permBlock(v, accent) {
  const reads = v.perm.reads.map(r => `<li>${r}</li>`).join('');
  const stops = v.perm.stops.map(r => `<li>${r}</li>`).join('');
  const ipp = v.perm.thirdParty && v.perm.ipp3a
    ? `<div class="abPerm__ipp"><b>Privacy Act 2020, IPP 3A.</b> ${v.perm.ipp3a}</div>` : '';
  const law = v.human.law ? ` ${v.human.law}.` : '';
  return `
<!-- ab:perm:start — permission and proof -->
<section class="abSec abSec--rule" style="--abA:${accent}" aria-label="permission and proof">
  <div class="abSec__in">
    <div class="abSec__k">permission and proof</div>
    <h2 class="abSec__h" data-m="type">what it may do, and where it stops</h2>
    <div class="abPerm__grid">
      <div class="abPerm__card" data-m="rise">
        <p class="abPerm__l">consent</p><p>${v.perm.consent}</p>
        <p class="abPerm__l">what it reads</p><ul>${reads}</ul>
        <p class="abPerm__l">retention</p><p>${v.perm.retention}</p>
        ${ipp}
      </div>
      <div class="abPerm__card" data-m="rise">
        <p class="abPerm__l">authority</p><p><span class="abPerm__chip">${v.perm.authority}</span></p>
        <p class="abPerm__l">it never</p><ul>${stops}</ul>
        <p class="abPerm__l">the human gate</p><p>${v.human.role.charAt(0).toUpperCase() + v.human.role.slice(1)}, ${v.human.gate}.${law}</p>
      </div>
    </div>
  </div>
</section>
<!-- ab:perm:end -->
`;
}

function outBlock(v, accent) {
  return `
<!-- ab:out:start — the commercial outcome, as a hypothesis -->
<section class="abSec abSec--rule" style="--abA:${accent}" aria-label="the commercial outcome">
  <div class="abSec__in">
    <div class="abSec__k">the commercial outcome</div>
    <h2 class="abSec__h" data-m="type">what it should move</h2>
    <p class="abSec__sf">Stated as a hypothesis and a mechanism. We are not going to put a number on it before we have run it.</p>
    <div class="abOut__grid">
      <div class="abOut__card" data-m="rise"><span>primary</span>
        <p class="abOut__m">${v.out.p.m}</p><p>${v.out.p.mech}</p></div>
      <div class="abOut__card" data-m="rise"><span>secondary</span>
        <p class="abOut__m">${v.out.s.m}</p><p>${v.out.s.mech}</p></div>
    </div>
  </div>
</section>
<!-- ab:out:end -->
`;
}

function mount(accent, form, material, seed, v) {
  const bpCfg = v ? JSON.stringify({
    waitLabel: v.bp.waitLabel, party: v.party, humanRole: v.bp.humanRole,
    youGet: v.bp.youGet, theyGet: v.bp.theyGet, captions: v.bp.captions,
  }) : 'null';
  return `
<!-- ab:js:start -->
<script src="assembl-motion.js"></script>
<script src="assembl-cloud.js"></script>
<script src="assembl-mosaic.js"></script>
<script src="assembl-blueprint.js"></script>
<script>
(function(){
  /* each mount isolated: a machine without WebGL still gets the mosaic,
     the step copy and the scrub rail — the page degrades, never dies */
  try{
    if(window.AssemblCloud) AssemblCloud.mount(document.getElementById('abCloud'),
      {form:'${form}',material:'${material}',colour:'${accent}',count:2600,mode:'scrub',stage:'.abStage',size:.052});
  }catch(e){}
  try{
    var c2=document.getElementById('abCloud2');
    if(window.AssemblCloud && c2) AssemblCloud.mount(c2,
      {form:'${form}',material:'${material}',colour:'${accent}',count:1800,mode:'auto',size:.045});
  }catch(e){}
  try{
    if(window.AssemblMosaic) AssemblMosaic.mount(document.getElementById('abMos'),
      {colour:'${accent}',ink:'#14161A',brass:'#BFA37A',seed:'${seed}',density:14,mode:'enter'});
  }catch(e){}
  try{
    var bp=document.getElementById('abBp'), bpCfg=${bpCfg};
    if(window.AssemblBlueprint && bp && bpCfg) AssemblBlueprint.mount(bp, bpCfg);
  }catch(e){}
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
  s = s.replace(/\n?<!-- ab:def:start[\s\S]*?<!-- ab:def:end -->\n?/g, '\n');
  s = s.replace(/\n?<!-- ab:bwa:start[\s\S]*?<!-- ab:bwa:end -->\n?/g, '\n');
  s = s.replace(/\n?<!-- ab:bp:start[\s\S]*?<!-- ab:bp:end -->\n?/g, '\n');
  s = s.replace(/\n?<!-- ab:perm:start[\s\S]*?<!-- ab:perm:end -->\n?/g, '\n');
  s = s.replace(/\n?<!-- ab:out:start[\s\S]*?<!-- ab:out:end -->\n?/g, '\n');
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
  s = s.replace(/<div class="(glass|card|cc|ev|pcell|tool|mom|pow|g)"(?![^>]*data-m)/g,
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
    s = s.replace(evM[0], evidence(accent, folder).trim());
  } else if (!s.includes('ab:ev:start')) {
    const anchor = s.lastIndexOf('<footer');
    if (anchor > -1) s = s.slice(0, anchor) + evidence(accent, folder).trim() + '\n' + s.slice(anchor);
  }

  /* 4d. the closing beat — the same form, fully assembled, before the ask.
     Three moments across a page reads as a journey; one reads as a widget. */
  if (!s.includes('ab:close:start')) {
    let closeAnchor = s.search(/<section[^>]*id="(pilot|accept)"/);
    /* pages without a pilot/accept section (the cine pages) close before the
       evidence band, or failing that before the footer — never nowhere */
    if (closeAnchor === -1) closeAnchor = s.indexOf('<!-- ab:ev:start');
    if (closeAnchor === -1) closeAnchor = s.lastIndexOf('<footer');
    if (closeAnchor > -1) {
      s = s.slice(0, closeAnchor) + `<!-- ab:close:start -->
<section class="abClose" style="--abA:${accent}" aria-hidden="true">
  <div class="abClose__art" id="abCloud2"></div>
</section>
<!-- ab:close:end -->
` + s.slice(closeAnchor);
    }
  }

  /* 4e. the demonstrator modules — assembling-demonstrator skill, Aug 2026.
     Definition sits above the fold, right after the page chrome; the wait
     moment follows the assembly stage; the explainer and the permission
     panel precede the evidence; the outcome follows it. Anchors are
     best-effort with honest fallbacks — the harness verifies placement. */
  const v = VERT[folder];
  if (v) {
    /* definition — after the page chrome (</header>, else the topbar </nav>),
       and never inside the ab block: if the assembly stage opens the body
       (the cine pages), the definition goes above it. Last resort: after the
       first section, which is the hero everywhere else. */
    let defA = s.indexOf('</header>');
    if (defA > -1) defA += '</header>'.length;
    else {
      const nav = s.indexOf('</nav>');
      const firstSec = s.indexOf('<section');
      if (nav > -1 && firstSec > -1 && nav < firstSec) defA = nav + '</nav>'.length;
      else {
        const ab = s.indexOf('<!-- ab:start');
        const sec = s.indexOf('</section>');
        if (ab > -1 && (sec === -1 || ab < sec)) defA = ab;
        else defA = sec > -1 ? sec + '</section>'.length : -1;
      }
    }
    if (defA > -1) s = s.slice(0, defA) + '\n' + defBlock().trim() + '\n' + s.slice(defA);

    /* the wait moment — straight after the assembly stage */
    const bwaA = s.indexOf('<!-- ab:end -->');
    if (bwaA > -1) {
      const p = bwaA + '<!-- ab:end -->'.length;
      s = s.slice(0, p) + '\n' + bwaBlock(v, accent).trim() + '\n' + s.slice(p);
    }

    /* explainer + permission — before the evidence; outcome — after it */
    let evA = s.indexOf('<!-- ab:ev:start');
    if (evA === -1) evA = s.lastIndexOf('<footer');
    if (evA > -1) {
      s = s.slice(0, evA) + bpBlock(v, accent).trim() + '\n' + permBlock(v, accent).trim() + '\n' + s.slice(evA);
    }
    let outA = s.indexOf('<!-- ab:ev:end -->');
    if (outA > -1) outA += '<!-- ab:ev:end -->'.length;
    else outA = s.lastIndexOf('<footer');
    if (outA > -1) s = s.slice(0, outA) + '\n' + outBlock(v, accent).trim() + '\n' + s.slice(outA);
  }

  /* 5. engines */
  if (!s.includes('three.min.js')) {
    s = s.replace('</body>', '<script src="three.min.js"></script>\n</body>');
  }
  s = s.replace('</body>', mount(accent, form, material, seed, v).trim() + '\n</body>');

  fs.writeFileSync(idx, s);
  done++;
  console.log(`✓ ${folder.padEnd(32)} ${form.padEnd(7)} ${material.padEnd(7)} ${accent}`);
}
console.log(`\n${done} demos updated${skipped.length ? '; skipped: ' + skipped.join(', ') : ''}`);
