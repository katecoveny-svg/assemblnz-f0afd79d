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

function mount(accent, form, material, seed) {
  return `
<!-- ab:js:start -->
<script src="assembl-motion.js"></script>
<script src="assembl-cloud.js"></script>
<script src="assembl-mosaic.js"></script>
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
