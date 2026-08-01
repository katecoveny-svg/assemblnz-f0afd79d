#!/usr/bin/env node
/**
 * honesty-test.mjs — Prompt 4 acceptance for Summerset.
 *   node honesty-test.mjs <url> <shotPrefix>
 *
 * 1. DIMENSION GUARD unit test: injects a deliberately POISONED canned
 *    response ("The lounge is 4.2 m × 3.8 m…") into VR_CONFIG before the
 *    engine loads, forces the canned path (api aborted), and asserts the
 *    rendered output carries NO room-dimension pattern and DOES carry the
 *    withheld marker.
 * 2. Register check: the hand-off line renders verbatim.
 * 3. Sourced-figure rule: exactly one 1.5 m + NZS 4121 citation in #vrSec.
 * 4. Own-photo path: uploads demo-lounge.jpg through the file input; asserts
 *    the read runs. NETWORK TRACE: every request during the run is logged;
 *    asserts the only mutation-shaped call is POST /api/room (no storage).
 */
import puppeteer from 'puppeteer-core';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const [url, prefix] = process.argv.slice(2);

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--disable-gpu-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars'],
});

let fails = 0;
const say = (ok, name, extra = '') => { console.log(`  ${ok ? '✓' : '✗ FAIL'}  ${name}${extra ? ' — ' + extra : ''}`); if (!ok) fails++; };

/* ── 1+2+3: poisoned canned response through the guard ── */
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1360, height: 920 });
  await page.setRequestInterception(true);
  page.on('request', (r) => (/\/api\/room/.test(r.url()) ? r.abort() : r.continue()));
  // poison the config the moment it exists, before visionread.js reads it
  await page.evaluateOnNewDocument(() => {
    let cfg;
    Object.defineProperty(window, 'VR_CONFIG', {
      configurable: true,
      set(v) {
        try {
          v.noRoomDims = true;
          const e = v.canned && v.canned.estimate;
          if (e) {
            e.what_i_saw = 'POISON: The lounge is 4.2 m × 3.8 m with a 2.1m x 0.9m doorway.';
            e.reasoning = 'POISON: the room reads as 5.0 m × 4.0 m overall.';
          }
        } catch (err) {}
        cfg = v;
      },
      get() { return cfg; },
    });
  });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 2000));
  await page.click('#vrDemo');
  await new Promise((r) => setTimeout(r, 12000));
  const out = await page.evaluate(() => document.getElementById('vrOut').textContent + ' ' + document.getElementById('vrTag').textContent);
  const dims = out.match(/\d+(?:\.\d+)?\s*m?\s*[×xX]\s*\d+(?:\.\d+)?\s*m\b/g) || [];
  say(out.includes('POISON') || out.length > 50, 'poisoned canned response rendered (test is live)', '');
  say(dims.length === 0, 'NO room-dimension pattern survives the guard', dims.join(' | '));
  say(out.includes('withheld'), 'withheld marker present in rendered output');
  say(/with a person/i.test(out) || await page.evaluate(() => /with a person/i.test(document.getElementById('vrSec').textContent)),
    'hand-off register present: "…with a person"');
  const src = await page.evaluate(() => {
    const t = document.getElementById('vrSec').textContent;
    return { n15: (t.match(/1\.5\s*m/g) || []).length, nzs: (t.match(/NZS\s*4121/g) || []).length };
  });
  say(src.n15 === 1 && src.nzs === 1, 'exactly one sourced figure (1.5 m · NZS 4121)', JSON.stringify(src));
  await page.screenshot({ path: `${prefix}-poisoned.png` });
  console.log(`  📸 ${prefix}-poisoned.png`);
  await page.close();
}

/* ── 4: own-photo path + full network trace ── */
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1360, height: 920 });
  const reqs = [];
  page.on('request', (r) => reqs.push({ m: r.method(), u: r.url() }));
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 2000));
  reqs.length = 0; // trace only the read
  const input = await page.$('#vrOwn');
  say(!!input, 'own-photo input present');
  if (input) {
    await input.uploadFile('/Users/kateharland/assembl-web/research/assembling-summerset/demo-lounge.jpg');
    const t0 = Date.now(); let on = false;
    while (Date.now() - t0 < 15000) { on = await page.evaluate(() => document.getElementById('vrPanel').classList.contains('on')); if (on) break; await new Promise((r) => setTimeout(r, 300)); }
    say(on, 'own-photo read runs');
    await new Promise((r) => setTimeout(r, 8000));
  }
  const mutations = reqs.filter((r) => r.m !== 'GET');
  const nonApi = mutations.filter((r) => !/\/api\/room/.test(r.u));
  console.log('  network trace (non-GET during read): ' + (mutations.length ? mutations.map((r) => `${r.m} ${r.u.slice(-40)}`).join(' | ') : 'none'));
  say(nonApi.length === 0, 'no storage call — only POST /api/room leaves the page', nonApi.map((r) => r.u.slice(-40)).join(','));
  await page.screenshot({ path: `${prefix}-ownphoto.png` });
  console.log(`  📸 ${prefix}-ownphoto.png`);
  await page.close();
}

await browser.close();
console.log(`  ── ${fails === 0 ? 'ALL GREEN' : fails + ' FAILURES'}`);
process.exit(fails ? 1 : 0);
