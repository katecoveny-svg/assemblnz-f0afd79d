#!/usr/bin/env node
/**
 * wire-test.mjs — the Giltrap lot-read → signing queue → board → guard
 * click-through (Prompt 3 acceptance). Rendered browser, real clicks,
 * screenshot at every step.
 *
 *   node wire-test.mjs <url> <prefix> [--force-canned]
 *
 * --force-canned aborts /api/lot at the network layer so the canned mirror
 * plays; without it the live API runs (30 s window, then fallback).
 */
import puppeteer from 'puppeteer-core';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const [url, prefix, flag] = process.argv.slice(2);
const forceCanned = flag === '--force-canned';

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--disable-gpu-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1380, height: 940, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text().slice(0, 120)); });
page.on('pageerror', (e) => errors.push('pageerror: ' + String(e).slice(0, 120)));

if (forceCanned) {
  await page.setRequestInterception(true);
  page.on('request', (r) => (/\/api\/lot/.test(r.url()) ? r.abort() : r.continue()));
}

await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise((r) => setTimeout(r, 2500));

let step = 0, fails = 0;
const shot = async (name) => {
  await page.screenshot({ path: `${prefix}-${++step}-${name}.png` });
  console.log(`  📸 step ${step}: ${name}`);
};
const check = async (name, expr, within = 4000) => {
  const t0 = Date.now(); let ok = false;
  while (Date.now() - t0 < within) { ok = await page.evaluate(expr); if (ok) break; await new Promise((r) => setTimeout(r, 300)); }
  console.log(`  ${ok ? '✓' : '✗ FAIL'}  ${name}`);
  if (!ok) fails++;
  return ok;
};

console.log(`\n════ wire test · ${forceCanned ? 'CANNED (api aborted)' : 'LIVE API'} · ${url}`);

// 1 — pick "the ute"
await page.evaluate(() => { const el = document.getElementById('vrSec'); el.scrollIntoView(); });
await new Promise((r) => setTimeout(r, 600));
await page.click('.vrTh');
await check('read starts (panel on)', "document.getElementById('vrPanel').classList.contains('on')", 8000);
await shot('read-started');

// 2 — read completes with a draftable card carrying the hold action
await check('drafted card renders with hold-for-signing action',
  "!!document.querySelector('#vrOut [data-vr-action=queue]')", forceCanned ? 20000 : 45000);
await page.evaluate(() => document.querySelector('#vrOut').scrollIntoView());
await new Promise((r) => setTimeout(r, 400));
await shot('draft-card');

// 3 — hold for signing → queue counter 1 → board row appears
await page.click('[data-vr-action=queue]');
await check('queue counter reads 1', "document.getElementById('vrQN').textContent==='1'");
await check('board shows the lot-read row above the seed',
  "(function(){var r=document.querySelector('#opsBody tr'); return r&&r.classList.contains('vrOpsRow')&&/lot-read/.test(r.textContent)})()");
await page.evaluate(() => document.getElementById('vrQ').scrollIntoView());
await new Promise((r) => setTimeout(r, 400));
await shot('queued');
await page.evaluate(() => document.getElementById('board').scrollIntoView());
await new Promise((r) => setTimeout(r, 400));
await shot('board-row');

// 4 — run the guard → row annotated
await page.click('[data-vr-action=guard], #vrGuardGo');
await check('queue row annotated by the guard',
  "/guard: pass|held ·/.test(document.querySelector('#vrQList .vrQItem span').textContent)");
await check('board row annotated by the guard',
  "/guard: pass|held ·/.test(document.querySelector('#opsBody tr.vrOpsRow td:last-child').textContent)");
await page.evaluate(() => document.getElementById('vrQ').scrollIntoView());
await new Promise((r) => setTimeout(r, 400));
await shot('guard-annotated');

// 5 — sign the draft
await page.click('[data-vr-action=sign]');
await check('row signed with timestamp',
  "/signed \\d/.test(document.querySelector('#vrQList .vrQItem span').textContent)");
await shot('signed');

console.log(errors.length ? `  CONSOLE ERRORS: ${errors.join(' | ')}` : '  console: clean');
if (errors.length) fails++;
await browser.close();
console.log(`  ── ${fails === 0 ? 'ALL GREEN' : fails + ' FAILURES'}`);
process.exit(fails ? 1 : 0);
