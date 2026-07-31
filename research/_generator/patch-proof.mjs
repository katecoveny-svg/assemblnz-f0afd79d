#!/usr/bin/env node
/**
 * patch-proof.mjs — the two NEW pieces of standard furniture from Kate's
 * 1 Aug 2026 demo-framework doc, applied to the keeper demos:
 *
 *   1. The regulatory-spine pane — the clause, quoted, with the trace that
 *      satisfies it (Step 3, "new additions to the standard kit").
 *   2. The proof-metrics footer — the 3–4 numbers a 90-day pilot would
 *      measure: one conversion, one cost, one experience, one value (Step 4).
 *   3. Retirement pages only: the reform clock — the RV Amendment package
 *      repayment countdown (announced 4 Dec 2025; labelled announced-not-law
 *      per the credibility rules and the doc's own ⚠️).
 *
 * Flat editorial register, self-contained, idempotent via pf markers.
 * Inserted before <section id="pilot"> (the accept-the-pilot furniture) where
 * present, else before the footer.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const ROOT = '/Users/kateharland/assembl-web/research';

const PAGES = [
  {
    dir: 'assembling-nectar', A: '#056268',
    clauseK: 'the regulatory spine · CCCFA → FMA',
    clause: 'Lender responsibilities under the Credit Contracts and Consumer Finance Act 2003 — and from 1 July 2026, consumer-credit supervision sits with the FMA.',
    trace: 'Every affordability inquiry, every decision and every refusal on this page is timestamped into the receipt. The journey is built to be shown to the regulator whole.',
    metrics: [
      ['application abandonment', 'conversion'],
      ['“where is my application” contacts deflected', 'cost'],
      ['applicant effort score', 'experience'],
      ['time-to-money', 'value'],
    ],
  },
  {
    dir: 'assembling-sharesies', A: '#E50072',
    clauseK: 'the regulatory spine · FMC Act 2013',
    clause: 'Financial advice is regulated under the Financial Markets Conduct Act 2013. This journey explains process — it never advises, never predicts the market, never estimates what the out-of-market window will do.',
    trace: 'Each explanation carries its source (the published help-centre window it quotes), and every refusal is logged. The trace shows a regulator exactly where the advice line was held.',
    metrics: [
      ['transfer abandonment', 'conversion'],
      ['“where is my transfer” contacts deflected', 'cost'],
      ['transfer NPS', 'experience'],
      ['time-to-first-investment after arrival', 'value'],
    ],
  },
  {
    dir: 'assembling-myfoodbag', A: '#77A222',
    clauseK: 'the regulatory spine · Privacy Act 2020',
    clause: 'Collection limits under the Privacy Act 2020 (IPP 1 and IPP 4): this journey never infers a health condition from what a household orders. Health-aware journeys are opt-in, stated in plain words, or they do not exist.',
    trace: 'Every question the journey asks is logged with its purpose. The trace shows what was asked, what was never asked, and why.',
    metrics: [
      ['skip-to-cancel conversion', 'conversion'],
      ['weeks-to-churn', 'cost'],
      ['reactivation rate', 'experience'],
      ['order frequency', 'value'],
    ],
  },
  {
    dir: 'assembling-ryman-family', A: '#F06022', reform: true,
    clauseK: 'the regulatory spine · RV Amendment package',
    clause: 'The Retirement Villages Act amendment package (announced 4 December 2025) mandates capital repayment within 12 months of vacating, interest accruing from month 6, weekly fees stopping immediately, and plain-language ORAs.',
    trace: 'The journey timestamps every stage from vacate to repayment. The family sees the clock; the operator proves compliance with it — the same trace serves both.',
    metrics: [
      ['enquiry-to-tour conversion', 'conversion'],
      ['status contacts deflected', 'cost'],
      ['family effort score', 'experience'],
      ['days-to-settle', 'value'],
    ],
  },
  {
    dir: 'assembling-summerset', A: '#470A68', reform: true,
    clauseK: 'the regulatory spine · RV Amendment package',
    clause: 'The Retirement Villages Act amendment package (announced 4 December 2025) mandates capital repayment within 12 months of vacating, interest accruing from month 6, weekly fees stopping immediately, and plain-language ORAs.',
    trace: 'The journey timestamps every stage from vacate to repayment. The family sees the clock; the operator proves compliance with it — the same trace serves both.',
    metrics: [
      ['enquiry-to-tour conversion', 'conversion'],
      ['status contacts deflected', 'cost'],
      ['family effort score', 'experience'],
      ['days-to-settle', 'value'],
    ],
  },
  {
    dir: 'assembling-woolworths-rewards', A: '#fd6400',
    clauseK: 'the regulatory spine · Fair Trading Act 1986',
    clause: 'Substitution and price claims sit under the Fair Trading Act 1986. A promise made at order is kept or declared — substitutions are surfaced before the box lands, never discovered at the door.',
    trace: 'Every price lock, substitution and answer is receipted with its timestamp. The trace is the difference between a promise and a hope.',
    metrics: [
      ['order completion', 'conversion'],
      ['substitution and “where is my order” contacts deflected', 'cost'],
      ['substitution acceptance rate', 'experience'],
      ['basket size', 'value'],
    ],
  },
  {
    dir: 'assembling-southbase', A: '#78BE37',
    clauseK: 'the regulatory spine · CCA 2002',
    clause: 'The Construction Contracts Act 2002 gives payment claims, certification and adjudication their statutory clock — the journey is traceable because the law already makes it so.',
    trace: 'Every claim event, decision and consent status on the client view carries its timestamp and its author. The client sees the fortnight; the record satisfies the contract.',
    metrics: [
      ['client-decision latency', 'conversion'],
      ['status-enquiry volume', 'cost'],
      ['sponsor effort score', 'experience'],
      ['PCG-prep hours saved', 'value'],
    ],
  },
  {
    dir: 'assembling-everyday-rewards', A: '#fd6400',
    clauseK: 'the regulatory spine · Privacy Act 2020',
    clause: 'The one-question exchange collects from the person, with purpose stated, under the Privacy Act 2020 (IPP 2 and IPP 3) — answered or declined, the draft still finishes.',
    trace: 'The Mana receipt lists every question asked, every answer given, and every point it earned. Decline appears on the receipt too — as a refusal honoured.',
    metrics: [
      ['draft-to-signed completion', 'conversion'],
      ['“where is my order” contacts deflected', 'cost'],
      ['question answer rate', 'experience'],
      ['basket size and repeat rate', 'value'],
    ],
  },
];

const CSS = `
/* pf:start — proof furniture: regulatory spine + pilot metrics */
.pfSec{padding:34px 22px;position:relative}
.pfIn{max-width:1080px;margin:0 auto;display:grid;grid-template-columns:1.15fr .85fr;gap:16px}
@media(max-width:860px){.pfIn{grid-template-columns:1fr}}
.pfCard{background:var(--pfCard,#fff);border:1.5px solid var(--pfLine,rgba(30,27,20,.12));border-radius:20px;padding:18px 20px}
.pfK{font:800 10px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;letter-spacing:.22em;
  text-transform:uppercase;color:var(--pfA);margin-bottom:9px}
.pfQ{font:600 13.5px/1.6 -apple-system,sans-serif;color:var(--pfInk,#221f18);border-left:3px solid var(--pfA);
  padding-left:13px;margin:0 0 10px}
.pfT{font:500 12px/1.65 -apple-system,sans-serif;color:var(--pfInk,#221f18);opacity:.75;margin:0}
.pfMets{display:grid;grid-template-columns:1fr 1fr;gap:9px}
.pfM{border:1.5px solid var(--pfLine,rgba(30,27,20,.12));border-radius:14px;padding:11px 13px}
.pfM b{display:block;font:700 12px/1.35 -apple-system,sans-serif;color:var(--pfInk,#221f18)}
.pfM span{display:block;font:800 8.5px -apple-system,sans-serif;letter-spacing:.18em;text-transform:uppercase;
  color:var(--pfA);margin-top:5px}
.pfNote{grid-column:1 / -1;font:600 10.5px -apple-system,sans-serif;letter-spacing:.06em;color:var(--pfInk,#221f18);
  opacity:.55;text-align:center;margin:2px 0 0}
/* the reform clock — retirement pages only */
.pfClock{grid-column:1 / -1;background:var(--pfCard,#fff);border:1.5px solid var(--pfLine,rgba(30,27,20,.12));
  border-radius:20px;padding:18px 20px}
.pfBar{position:relative;height:10px;border-radius:6px;background:var(--pfLine,rgba(30,27,20,.12));margin:22px 6px 8px}
.pfBar i{position:absolute;top:0;bottom:0;left:0;width:50%;border-radius:6px;background:var(--pfA);opacity:.28}
.pfBar em{position:absolute;top:0;bottom:0;left:50%;width:50%;border-radius:0 6px 6px 0;background:var(--pfA)}
.pfStops{display:flex;justify-content:space-between;margin:0 6px}
.pfStop{flex:1;font:600 11px/1.5 -apple-system,sans-serif;color:var(--pfInk,#221f18)}
.pfStop b{display:block;font:800 12.5px -apple-system,sans-serif;color:var(--pfA)}
.pfStop:nth-child(2){text-align:center}
.pfStop:last-child{text-align:right}
/* pf:end */`;

function block(p) {
  const dark = false;
  const mets = p.metrics.map(([m, k]) => `<div class="pfM"><b>${m}</b><span>${k} metric</span></div>`).join('');
  const clock = p.reform ? `
    <div class="pfClock">
      <div class="pfK">the reform clock &middot; repayment, legislated</div>
      <p class="pfQ">From the day a resident vacates: weekly fees stop immediately &middot; interest accrues to the resident from month 6 &middot; capital repaid by month 12.</p>
      <div class="pfBar"><i></i><em></em></div>
      <div class="pfStops">
        <div class="pfStop"><b>Day 0 — vacate</b>weekly fees stop</div>
        <div class="pfStop"><b>Month 6</b>interest starts accruing</div>
        <div class="pfStop"><b>Month 12</b>capital repaid</div>
      </div>
      <p class="pfT" style="margin-top:12px">The family sees this clock; the operator proves compliance with it. Announced policy (4 December 2025, per MinterEllison&rsquo;s summary) &mdash; not yet law; introduction imminent. Nothing here is legal advice.</p>
    </div>` : '';
  return `
<!-- pf:start -->
<section class="pfSec" aria-label="Regulatory spine and pilot metrics" style="--pfA:${p.A}">
  <div class="pfIn">
    <div class="pfCard">
      <div class="pfK">${p.clauseK}</div>
      <p class="pfQ">${p.clause}</p>
      <p class="pfT">${p.trace}</p>
    </div>
    <div class="pfCard">
      <div class="pfK">what a 90-day pilot would measure</div>
      <div class="pfMets">${mets}</div>
    </div>${clock}
    <p class="pfNote">simulated journey &middot; illustrative concept &middot; the numbers above are the pilot&rsquo;s to earn, not ours to claim</p>
  </div>
</section>
<!-- pf:end -->`;
}

let n = 0;
for (const p of PAGES) {
  const f = `${ROOT}/${p.dir}/index.html`;
  if (!existsSync(f)) { console.log('SKIP', p.dir); continue; }
  let s = readFileSync(f, 'utf8');
  s = s.replace(/\n?\/\* pf:start[\s\S]*?pf:end \*\//g, '')
       .replace(/\n?<!-- pf:start -->[\s\S]*?<!-- pf:end -->/g, '');
  const style = s.lastIndexOf('</style>');
  if (style === -1) { console.log('SKIP (no style)', p.dir); continue; }
  s = s.slice(0, style) + CSS + '\n' + s.slice(style);
  const b = block(p);
  const pilot = s.search(/<section[^>]*id="pilot"/);
  if (pilot !== -1) s = s.slice(0, pilot) + b + '\n' + s.slice(pilot);
  else {
    const foot = s.search(/<footer/);
    const at = foot !== -1 ? foot : s.lastIndexOf('</body>');
    s = s.slice(0, at) + b + '\n' + s.slice(at);
  }
  writeFileSync(f, s);
  console.log('proof →', p.dir, p.reform ? '(+ reform clock)' : '');
  n++;
}
console.log(`\n${n}/${PAGES.length} patched`);
