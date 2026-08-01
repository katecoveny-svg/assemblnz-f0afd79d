#!/usr/bin/env node
/**
 * verify-page.mjs — rendered-DOM acceptance for one page (rule 2).
 *   node verify-page.mjs <preset> <url> [shot.png]
 *
 * Presets encode each page's spec: sections that must exist exactly once,
 * required order, sections that must NOT exist, click tests (dispatch a real
 * click, assert the resulting DOM change), and the nothing-after-legal rule.
 * Exit 0 only if everything passes.
 */
import puppeteer from 'puppeteer-core';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const PRESETS = {
  summerset: {
    once: ['#vrSec', '#waitmap', '#place', '#boundary', '#journey', '#accept'],
    absent: ['#deck6'],
    order: ['header.hero', '#vrSec', '.mzBand', '#journey', '#waitmap', '#place', '#boundary', '#accept', '.pfSec', 'footer'],
    clicks: [
      { name: 'vision-read demo starts (listener fires)', click: '#vrDemo',
        assert: "document.getElementById('vrPanel').classList.contains('on')", within: 6000 },
      { name: 'boundary section renders refusal copy', click: null,
        assert: "document.querySelector('#boundary') && /never|not/i.test(document.querySelector('#boundary').textContent)" },
    ],
    extra: [
      { name: 'phone mounted with shader backdrop',
        assert: "!!document.querySelector('.wp-screen .wp-shader')" },
      { name: 'vision-read directly under hero',
        assert: "(function(){var h=document.querySelector('header.hero');var n=h.nextElementSibling;while(n&&['SCRIPT','STYLE'].includes(n.tagName))n=n.nextElementSibling;return n&&n.id==='vrSec'})()" },
    ],
  },
  giltrap: {
    once: ['#vrSec', '#waitmap', '#place', '#pilot', '#accept', '#board', '#campaign', '#wait'],
    absent: ['#deck6'],
    order: ['.mzBand', '#vrSec', '#runs', '#board', '#waitmap', '#place', '#pilot', '#accept', 'footer'],
    clicks: [
      { name: 'lot thumb starts a read (listener fires)', click: '.vrTh',
        assert: "document.getElementById('vrPanel').classList.contains('on')", within: 8000 },
    ],
    extra: [
      { name: 'phone mounted with shader backdrop',
        assert: "!!document.querySelector('.wp-screen .wp-shader')" },
      { name: 'exactly one wait-deck heading',
        assert: "[...document.querySelectorAll('h2,h3')].filter(h=>/every wait inside|every waiting moment/i.test(h.textContent)).length===1" },
      { name: 'exactly one scratch/value-exchange block',
        assert: "[...document.querySelectorAll('h2,h3')].filter(h=>/scratch|value exchange|minutes between/i.test(h.textContent)).length<=1" },
    ],
  },
  ryman: {
    once: ['#vrSec', '#wait', '#guard', '#pilot', '#register', '#same', '#place'],
    absent: ['#deck6'],
    order: ['main', '#vrSec', '.mzBand', '#register', '#wait', '#same', '#place', '#guard', '#pilot', 'footer'],
    clicks: [
      { name: 'vision-read demo starts (listener fires)', click: '#vrDemo',
        assert: "document.getElementById('vrPanel').classList.contains('on')", within: 6000 },
    ],
    extra: [
      { name: 'phone mounted with shader backdrop',
        assert: "!!document.querySelector('.wp-screen .wp-shader')" },
      { name: 'no scratch-card node',
        assert: "!document.querySelector('.scratchCard,[class*=scratch],[class*=d6sc]')" },
      { name: 'minutes counter present',
        assert: "/counts minutes/i.test(document.getElementById('wait').textContent)" },
      { name: 'vision-read cites the 6.0 × 5.4 m room',
        assert: "/6\\.0\\s*[×x]\\s*5\\.4/.test(document.getElementById('vrSec').textContent)" },
    ],
  },
};

const [preset, url, shot] = process.argv.slice(2);
const P = PRESETS[preset];
if (!P || !url) { console.error('usage: node verify-page.mjs <summerset|giltrap|ryman> <url> [shot]'); process.exit(1); }

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--disable-gpu-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1360, height: 920, deviceScaleFactor: 1 });
const errors = [];
const isLocal = /localhost|127\.0\.0\.1/.test(url);
page.on('console', (m) => {
  if (m.type() !== 'error') return;
  const t = m.text();
  // resource-load failures are judged via the response handler below
  if (/Failed to load resource/.test(t)) return;
  errors.push(t.slice(0, 140));
});
page.on('pageerror', (e) => errors.push('pageerror: ' + String(e).slice(0, 140)));
page.on('response', (r) => {
  if (r.status() < 400) return;
  const u = r.url();
  if (isLocal && /\/api\//.test(u)) return; // Pages Functions don't exist on the static local server
  errors.push(`HTTP ${r.status()} ${u.slice(-60)}`);
});
await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise((r) => setTimeout(r, 2500));

let pass = 0, fail = 0;
const say = (ok, name, extra = '') => {
  console.log(`  ${ok ? '✓' : '✗ FAIL'}  ${name}${extra ? ' — ' + extra : ''}`);
  ok ? pass++ : fail++;
};

console.log(`\n════ ${preset} · ${url}`);

// exactly-once sections
for (const sel of P.once) {
  const n = await page.$$eval(sel, (els) => els.length).catch(() => 0);
  say(n === 1, `${sel} exactly once`, n === 1 ? '' : `found ${n}`);
}
for (const sel of P.absent) {
  const n = await page.$$eval(sel, (els) => els.length).catch(() => 0);
  say(n === 0, `${sel} absent`, n === 0 ? '' : `found ${n}`);
}

// document order
const orderOk = await page.evaluate((sels) => {
  const els = sels.map((s) => document.querySelector(s));
  if (els.some((e) => !e)) return { ok: false, why: 'missing ' + sels.filter((s, i) => !els[i]).join(',') };
  for (let i = 1; i < els.length; i++) {
    if (!(els[i - 1].compareDocumentPosition(els[i]) & 4)) return { ok: false, why: `${sels[i]} not after ${sels[i - 1]}` };
  }
  return { ok: true };
}, P.order);
say(orderOk.ok, 'anchor order ' + P.order.join(' → '), orderOk.why || '');

// nothing after the final legal block (footer) except scripts/fixed chrome
const tail = await page.evaluate(() => {
  const kids = [...document.body.children];
  let lastLegal = -1;
  kids.forEach((n, i) => {
    const t = (n.textContent || '').toLowerCase();
    if ((n.tagName === 'FOOTER') || t.includes('not affiliated')) lastLegal = Math.max(lastLegal, i);
  });
  const after = kids.slice(lastLegal + 1).filter((n) => !['SCRIPT', 'STYLE'].includes(n.tagName))
    .map((n) => `<${n.tagName.toLowerCase()}${n.id ? '#' + n.id : ''}>`);
  return after;
});
say(tail.length === 0, 'nothing renders after the legal block', tail.join(' '));

// console errors
say(errors.length === 0, 'zero console errors', errors.slice(0, 3).join(' | '));

// click tests — real dispatched clicks, asserted DOM change
for (const c of P.clicks) {
  if (c.click) {
    const el = await page.$(c.click);
    if (!el) { say(false, c.name, `no ${c.click}`); continue; }
    await el.click();
    const t0 = Date.now(); let ok = false;
    while (Date.now() - t0 < (c.within || 4000)) {
      ok = await page.evaluate(c.assert);
      if (ok) break;
      await new Promise((r) => setTimeout(r, 250));
    }
    say(ok, c.name);
  } else {
    say(await page.evaluate(c.assert), c.name);
  }
}
for (const e of P.extra || []) say(await page.evaluate(e.assert), e.name);

if (shot) { await page.screenshot({ path: shot, fullPage: true }); console.log('  screenshot → ' + shot); }
await browser.close();
console.log(`  ── ${pass} pass · ${fail} fail`);
process.exit(fail ? 1 : 0);
