#!/usr/bin/env node
/**
 * verify.mjs — the standard verification pass (Prompt 5), run headless
 * against the three LIVE URLs. Prints a full pass/fail table. Exit 0 only
 * when every row is green.
 *
 *   node verify.mjs [summersetUrl giltrapUrl rymanUrl]
 *
 * Per page: injected sections exactly once in anchor order · nothing after
 * the final legal block · zero console errors and zero failed requests on
 * load · the live agent panel opens and returns a grounded response · the
 * boundary panel renders its refusal copy (and any switches toggle) ·
 * page-specific asserts · simulated/illustrative labelling present.
 */
import puppeteer from 'puppeteer-core';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const [uS, uG, uR] = process.argv.slice(2);

const PAGES = [
  {
    name: 'summerset',
    url: uS || 'https://assembling-summerset.pages.dev/',
    freshMark: 'visionread.js',
    once: ['#vrSec', '#waitmap', '#place', '#boundary', '#journey', '#accept'],
    order: ['header.hero', '#vrSec', '.mzBand', '#journey', '#waitmap', '#place', '#boundary', '#accept', '.pfSec', 'footer'],
    boundarySel: '#boundary',
    agentOpen: '#agentbtn', agentInput: '#chat input, #chat textarea', agentSend: '#chat button[onclick*="send" i], #chat .send, #chat button',
    labelled: ['#vrSec', '.pfSec', '#waitmap'],
    specific: [
      { name: 'reform-clock section present', expr: "!!document.querySelector('.pfClock')" },
      { name: 'no room dimension anywhere in vision-read', expr: "!/\\d+(?:\\.\\d+)?\\s*m?\\s*[×xX]\\s*\\d+(?:\\.\\d+)?\\s*m\\b/.test(document.getElementById('vrSec').textContent)" },
    ],
    poisonFallback: true,
  },
  {
    name: 'giltrap',
    url: uG || 'https://assembling-giltrap.pages.dev/',
    freshMark: 'visionread.js',
    once: ['#vrSec', '#waitmap', '#place', '#pilot', '#accept', '#board'],
    order: ['.mzBand', '#vrSec', '#runs', '#board', '#waitmap', '#place', '#pilot', '#accept', 'footer'],
    boundarySel: '#pilot',
    agentOpen: '#agentbtn', agentInput: '#chat input, #chat textarea', agentSend: '#chat button',
    labelled: ['#vrSec', '#board', '#waitmap'],
    specific: [
      { name: 'board never empty (seed rows present)', expr: "document.querySelectorAll('#opsBody tr').length>=5" },
    ],
    lotImages: ['lot-tasman.jpg', 'lot-lbx.jpg', 'lot-discovery.jpg', 'lot-macan.jpg', 'car-wide.png'],
    queueE2E: true,
  },
  {
    name: 'ryman',
    url: uR || 'https://assembling-ryman-family.pages.dev/',
    freshMark: 'visionread.js',
    once: ['#vrSec', '#wait', '#guard', '#pilot', '#register', '#same', '#place'],
    order: ['main', '#vrSec', '.mzBand', '#register', '#wait', '#same', '#place', '#guard', '#pilot', 'footer'],
    boundarySel: '#guard',
    agentOpen: '#askbtn', agentInput: '#chat input, #chat textarea', agentSend: '#chat button',
    labelled: ['#vrSec', '.pfSec', '#wait'],
    specific: [
      { name: 'no scratch-card node', expr: "!document.querySelector('.scratchCard,[class*=scratch],[class*=d6sc]')" },
      { name: 'minutes counter present', expr: "/counts minutes/i.test(document.getElementById('wait').textContent)" },
      { name: 'vision-read cites 6.0 × 5.4 m', expr: "/6\\.0\\s*[×x]\\s*5\\.4/.test(document.getElementById('vrSec').textContent)" },
    ],
  },
];

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--disable-gpu-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafeswiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars'],
});

const table = [];
const row = (page, check, ok, note = '') => { table.push({ page, check, ok, note }); };

for (const P of PAGES) {
  // fresh-build gate: retry apex until the deployed marker is served (colo lag)
  let page, tries = 0, fresh = false;
  while (tries++ < 8) {
    page = await browser.newPage();
    await page.setViewport({ width: 1360, height: 920 });
    P.errors = [];
    page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) P.errors.push(m.text().slice(0, 100)); });
    page.on('pageerror', (e) => P.errors.push('pageerror: ' + String(e).slice(0, 100)));
    P.failedReqs = [];
    page.on('response', (r) => { if (r.status() >= 400) P.failedReqs.push(`${r.status()} ${r.url().slice(-50)}`); });
    await page.goto(P.url + '?v=' + Date.now(), { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise((r) => setTimeout(r, 2200));
    fresh = await page.evaluate((mark) => document.documentElement.outerHTML.includes(mark), P.freshMark);
    if (fresh) break;
    await page.close();
    await new Promise((r) => setTimeout(r, 6000));
  }
  row(P.name, 'live URL serves the current build', fresh, fresh ? '' : 'stale after retries');
  if (!fresh) continue;

  // 1 — sections once, in order
  for (const sel of P.once) {
    const n = await page.$$eval(sel, (e) => e.length).catch(() => 0);
    row(P.name, `${sel} ×1`, n === 1, n === 1 ? '' : `found ${n}`);
  }
  const ord = await page.evaluate((sels) => {
    const els = sels.map((s) => document.querySelector(s));
    if (els.some((e) => !e)) return 'missing';
    for (let i = 1; i < els.length; i++) if (!(els[i - 1].compareDocumentPosition(els[i]) & 4)) return sels[i];
    return true;
  }, P.order);
  row(P.name, 'anchor order', ord === true, ord === true ? '' : String(ord));

  // 2 — nothing after legal
  const after = await page.evaluate(() => {
    const kids = [...document.body.children];
    let last = -1;
    kids.forEach((n, i) => { if (n.tagName === 'FOOTER' || (n.textContent || '').toLowerCase().includes('not affiliated')) last = Math.max(last, i); });
    return kids.slice(last + 1).filter((n) => !['SCRIPT', 'STYLE'].includes(n.tagName)).length;
  });
  row(P.name, 'nothing after legal block', after === 0, after ? `${after} nodes` : '');

  // 3 — zero console errors + zero failed requests
  row(P.name, 'zero console errors', P.errors.length === 0, P.errors.slice(0, 2).join(' | '));
  row(P.name, 'zero failed requests', P.failedReqs.length === 0, P.failedReqs.slice(0, 2).join(' | '));

  // 4 — live agent responds grounded (suggestion button if present, else type)
  let agentOk = false, agentNote = '';
  try {
    await page.click(P.agentOpen);
    await new Promise((r) => setTimeout(r, 900));
    const base = await page.evaluate(() => (document.getElementById('chat').textContent || '').length);
    const sugg = await page.$('#chat #sugg button, #sugg button');
    if (sugg) { await sugg.click(); }
    else {
      const input = await page.$(P.agentInput);
      if (!input) { agentNote = 'no input'; }
      else { await input.type('What does this concept refuse to do?'); await page.keyboard.press('Enter'); }
    }
    const t0 = Date.now();
    while (Date.now() - t0 < 35000) {
      const grown = await page.evaluate((b) => {
        const msgs = document.getElementById('msgs');
        if (msgs) return (msgs.textContent || '').trim().length > 40;
        return (document.getElementById('chat').textContent || '').length > b + 60;
      }, base);
      if (grown) { agentOk = true; break; }
      await new Promise((r) => setTimeout(r, 900));
    }
  } catch (e) { agentNote = String(e).slice(0, 60); }
  row(P.name, 'live agent opens + responds', agentOk, agentNote);

  // 5 — boundary renders refusal copy; any switches toggle
  const bOk = await page.evaluate((sel) => {
    const b = document.querySelector(sel);
    if (!b) return false;
    return /never|refus|does not|will not|must never/i.test(b.textContent);
  }, P.boundarySel);
  row(P.name, 'boundary renders refusal copy', bOk);
  const swOk = await page.evaluate((sel) => {
    const b = document.querySelector(sel);
    const sw = b ? b.querySelector('input[type=checkbox],[role=switch],.switch,button.toggle') : null;
    if (!sw) return 'none';
    const before = sw.checked !== undefined ? sw.checked : sw.getAttribute('aria-checked');
    sw.click();
    const afterV = sw.checked !== undefined ? sw.checked : sw.getAttribute('aria-checked');
    return before !== afterV;
  }, P.boundarySel);
  row(P.name, 'boundary switches toggle', swOk === true || swOk === 'none', swOk === 'none' ? 'static panel (no switches shipped)' : '');

  // 6 — page-specific
  for (const sp of P.specific || []) row(P.name, sp.name, await page.evaluate(sp.expr));

  if (P.lotImages) {
    const bad = [];
    for (const img of P.lotImages) {
      const st = await page.evaluate(async (u) => { const r = await fetch(u, { method: 'HEAD' }).catch(() => null); return r ? r.status : 0; }, img);
      if (st !== 200) bad.push(`${img}:${st}`);
    }
    row(P.name, 'all lot images load', bad.length === 0, bad.join(','));
  }

  // 7 — simulated/illustrative labelling
  for (const sel of P.labelled) {
    const ok = await page.evaluate((s) => {
      const n = document.querySelector(s);
      return n && /simulat|illustrat|independent concept|fictional|demonstration/i.test(n.textContent);
    }, sel);
    row(P.name, `label present in ${sel}`, ok);
  }

  await page.close();

  // giltrap queue e2e (canned forced) in its own page
  if (P.queueE2E) {
    const p2 = await browser.newPage();
    await p2.setViewport({ width: 1360, height: 920 });
    await p2.setRequestInterception(true);
    p2.on('request', (r) => (/\/api\/lot/.test(r.url()) ? r.abort() : r.continue()));
    await p2.goto(P.url, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise((r) => setTimeout(r, 2000));
    let e2e = false;
    const waitFor = async (expr, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await p2.evaluate(expr)) return true; await new Promise((r) => setTimeout(r, 350)); } return false; };
    const clickC = async (sel) => { await p2.evaluate((q) => { const el = document.querySelector(q); if (el) el.scrollIntoView({ block: 'center' }); }, sel); await new Promise((r) => setTimeout(r, 450)); await p2.click(sel); };
    try {
      await p2.evaluate(() => document.getElementById('vrSec').scrollIntoView());
      await waitFor("document.querySelectorAll('.vrTh').length>0", 8000);
      await new Promise((r) => setTimeout(r, 800));
      await p2.click('.vrTh');
      await waitFor("!!document.querySelector('#vrOut [data-vr-action=queue]')", 25000);
      await clickC('[data-vr-action=queue]');
      await waitFor("document.getElementById('vrQN').textContent==='1'", 5000);
      await clickC('[data-vr-action=guard]');
      await waitFor("/guard: pass|held ·/.test(document.querySelector('#vrQList .vrQItem span').textContent)", 6000);
      await clickC('[data-vr-action=sign]');
      await waitFor("/signed \\d/.test(document.querySelector('#vrQList .vrQItem span').textContent)", 6000);
      e2e = await p2.evaluate(() =>
        document.getElementById('vrQN').textContent === '1' &&
        /guard: pass|held ·/.test(document.querySelector('#vrQList .vrQItem span').textContent) &&
        /signed \d/.test(document.querySelector('#vrQList .vrQItem span').textContent) &&
        document.querySelector('#opsBody tr.vrOpsRow') !== null);
    } catch (e) {}
    row(P.name, 'signing-queue click-through end to end', e2e);
    await p2.close();
  }

  // summerset poisoned-fallback against the live endpoint's fallback path
  if (P.poisonFallback) {
    const p3 = await browser.newPage();
    await p3.setViewport({ width: 1360, height: 920 });
    await p3.setRequestInterception(true);
    p3.on('request', (r) => (/\/api\/room/.test(r.url()) ? r.abort() : r.continue()));
    await p3.evaluateOnNewDocument(() => {
      let cfg;
      Object.defineProperty(window, 'VR_CONFIG', {
        configurable: true,
        set(v) { try { v.noRoomDims = true; if (v.canned && v.canned.estimate) v.canned.estimate.what_i_saw = 'POISON 4.2 m × 3.8 m room'; } catch (e) {} cfg = v; },
        get() { return cfg; },
      });
    });
    await p3.goto(P.url, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise((r) => setTimeout(r, 1800));
    await p3.click('#vrDemo');
    await new Promise((r) => setTimeout(r, 11000));
    const dims = await p3.evaluate(() => (document.getElementById('vrOut').textContent.match(/\d+(?:\.\d+)?\s*m?\s*[×xX]\s*\d+(?:\.\d+)?\s*m\b/g) || []).length);
    row(P.name, 'poisoned fallback emits no room dimension', dims === 0, dims ? `${dims} leaked` : '');
    await p3.close();
  }
}

await browser.close();

// the table
const w1 = Math.max(...table.map((r) => r.page.length));
const w2 = Math.max(...table.map((r) => r.check.length));
let fails = 0;
console.log('\n' + '─'.repeat(w1 + w2 + 14));
for (const r of table) {
  if (!r.ok) fails++;
  console.log(`${r.page.padEnd(w1)}  ${r.check.padEnd(w2)}  ${r.ok ? '✓ pass' : '✗ FAIL'}${r.note ? '  ' + r.note : ''}`);
}
console.log('─'.repeat(w1 + w2 + 14));
console.log(`${table.length} checks · ${table.length - fails} pass · ${fails} fail`);
process.exit(fails ? 1 : 0);
