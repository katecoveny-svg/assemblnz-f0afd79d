#!/usr/bin/env node
/**
 * rosewell-verify.mjs — acceptance for the five demo-retirement fixes.
 *   node rosewell-verify.mjs before <url> <shot>          — full-page evidence shot only
 *   node rosewell-verify.mjs after  <url> <shotPrefix>    — the full acceptance battery
 *
 * The battery: full-page shot · rendered-DOM greps (sponsored / joint-venture /
 * scratch / "tier 0" / the garbled string) · kicker sequence 01→09 · nav anchors
 * resolve · stats block directly above THE WORK, PREPARED · live phone runs,
 * stops at its one question, answers it (staged screenshots) · minutes counter
 * reaches its target · zero console errors.
 */
import puppeteer from 'puppeteer-core';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const [mode, url, prefix] = process.argv.slice(2);

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--disable-gpu-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars', '--allow-file-access-from-files'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1380, height: 940, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + String(e).slice(0, 140)));
page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text().slice(0, 140)); });

await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise((r) => setTimeout(r, 2000));

if (mode === 'before') {
  await page.screenshot({ path: prefix, fullPage: true });
  console.log(`  📸 before → ${prefix}`);
  await browser.close();
  process.exit(0);
}

let fails = 0;
const say = (ok, name, extra = '') => { console.log(`  ${ok ? '✓' : '✗ FAIL'}  ${name}${extra ? ' — ' + extra : ''}`); if (!ok) fails++; };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const until = async (expr, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await page.evaluate(expr)) return true; await wait(400); } return false; };

/* full-page after shot */
await page.screenshot({ path: `${prefix}-full.png`, fullPage: true });
console.log(`  📸 ${prefix}-full.png`);

/* rendered-DOM greps */
const counts = await page.evaluate(() => {
  const h = document.documentElement.innerHTML.toLowerCase();
  const c = (s) => h.split(s.toLowerCase()).length - 1;
  return {
    sponsored: c('sponsored'), jv: c('joint-venture'), scratch: c('scratch'),
    tier0: c('tier 0'), garbled: c('nobody wants to raise it first you'),
  };
});
say(counts.sponsored === 0, 'rendered DOM: zero "sponsored"', String(counts.sponsored));
say(counts.jv === 0, 'rendered DOM: zero "joint-venture"', String(counts.jv));
say(counts.scratch === 0, 'rendered DOM: zero "scratch"', String(counts.scratch));
say(counts.tier0 === 0, 'rendered DOM: zero "tier 0"', String(counts.tier0));
say(counts.garbled === 0, 'rendered DOM: zero garbled wait-label sentence', String(counts.garbled));

/* kicker sequence */
const kick = await page.evaluate(() =>
  [...document.querySelectorAll('.num.rise')].map((n) => (n.textContent.match(/^(\d\d)/) || [])[1]).filter(Boolean));
say(kick.join(',') === '01,02,03,04,05,06,07,08,09', 'section kickers strict 01→09', kick.join(','));

/* nav anchors resolve */
const anchors = await page.evaluate(() =>
  [...document.querySelectorAll('nav a[href^="#"]')].map((a) => {
    const id = a.getAttribute('href').slice(1);
    return { id, ok: !!document.getElementById(id) };
  }));
say(anchors.every((a) => a.ok), 'every nav anchor resolves', anchors.filter((a) => !a.ok).map((a) => '#' + a.id).join(',') || anchors.map((a) => '#' + a.id).join(' '));

/* stats block placement: last block of #map, and #map is immediately followed by #mirror */
const place = await page.evaluate(() => {
  const ev = document.querySelector('#map .mapEv');
  const map = document.getElementById('map');
  const mirror = document.getElementById('mirror');
  let n = map && map.nextElementSibling;
  while (n && n.tagName !== 'SECTION') n = n.nextElementSibling;
  return { inMap: !!ev, lastInWrap: !!ev && !ev.nextElementSibling, next: n ? n.id : '' };
});
say(place.inMap && place.lastInWrap && place.next === 'mirror',
  'stats block sits directly above THE WORK, PREPARED', JSON.stringify(place));

/* the live phone: autoplays, stops at its one question, answers it */
await page.evaluate(() => document.getElementById('wait-mount').scrollIntoView({ block: 'center' }));
say(await until(() => !!document.querySelector('.wp-screen'), 6000), 'phone mounted in #wait');
const asked = await until(() => { const s = document.querySelector('.wp-sheet'); return s && !s.hidden; }, 40000);
say(asked, 'phone stops to ask its one question');
if (asked) {
  await page.screenshot({ path: `${prefix}-phone-question.png` });
  console.log(`  📸 ${prefix}-phone-question.png`);
  await page.evaluate(() => document.querySelector('.wp-sheet-btn').click());
  say(await until(() => { const l = document.querySelector('.wp-learned'); return l && l.textContent.trim().length > 0; }, 8000),
    'answer acknowledged — the phone says what it learned');
  await wait(1200);
  await page.screenshot({ path: `${prefix}-phone-answered.png` });
  console.log(`  📸 ${prefix}-phone-answered.png`);
}

/* minutes counter */
await page.evaluate(() => document.getElementById('mcN').scrollIntoView({ block: 'center' }));
say(await until(() => document.getElementById('mcN').textContent === '38', 6000),
  'minutes-earned counter reaches 38', await page.evaluate(() => document.getElementById('mcN').textContent));
const mc = await page.$('.mcCard');
if (mc) {
  const b = await mc.boundingBox();
  const { sx, sy } = await page.evaluate(() => ({ sx: window.scrollX, sy: window.scrollY }));
  if (b) { await page.screenshot({ path: `${prefix}-counter.png`, clip: { x: b.x + sx - 20, y: Math.max(0, b.y + sy - 20), width: b.width + 40, height: b.height + 40 } }); console.log(`  📸 ${prefix}-counter.png`); }
}

say(errors.length === 0, 'zero console errors', errors.join(' | '));

await browser.close();
console.log(`  ── ${fails === 0 ? 'ALL GREEN' : fails + ' FAILURES'}`);
process.exit(fails ? 1 : 0);
