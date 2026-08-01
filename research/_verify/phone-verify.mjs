#!/usr/bin/env node
/**
 * phone-verify.mjs — rendered check that a demo's wait-phone is premium:
 *   node phone-verify.mjs <url> <shot.png>
 *
 *   ✓ WaitPhone global present            ✓ shader CSS + .wp-shader layer in DOM
 *   ✓ phone screen rendered               ✓ autoplay: content advances on view
 *   ✓ zero page errors                    📸 screenshot clipped to the device
 */
import puppeteer from 'puppeteer-core';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const [url, shot] = process.argv.slice(2);

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--disable-gpu-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1360, height: 920, deviceScaleFactor: 2 });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e).slice(0, 140)));
page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text().slice(0, 140)); });

let fails = 0;
const say = (ok, name, extra = '') => { console.log(`  ${ok ? '✓' : '✗ FAIL'}  ${name}${extra ? ' — ' + extra : ''}`); if (!ok) fails++; };

await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise((r) => setTimeout(r, 1500));

say(await page.evaluate(() => !!window.WaitPhone), 'WaitPhone engine loaded');
say(await page.evaluate(() => !!document.getElementById('wp-shader-css')), 'shader CSS installed');
say(await page.evaluate(() => !!document.querySelector('.wp-screen')), 'phone screen rendered');
say(await page.evaluate(() => !!document.querySelector('.wp-screen>.wp-shader')), 'shader layer behind the screen');

// autoplay: bring the phone into view, content must advance without a tap
const before = await page.evaluate(() => {
  const s = document.querySelector('.wp-screen');
  s.scrollIntoView({ block: 'center' });
  return s.textContent;
});
let moved = false;
const t0 = Date.now();
while (Date.now() - t0 < 9000) {
  await new Promise((r) => setTimeout(r, 700));
  moved = await page.evaluate((b) => document.querySelector('.wp-screen').textContent !== b, before);
  if (moved) break;
}
say(moved, 'autoplay on view — screen advances untapped');

say(errors.length === 0, 'zero page errors', errors.join(' | '));

if (shot) {
  await new Promise((r) => setTimeout(r, 1200));
  const el = await page.$('.wp-screen');
  const box = el && await el.boundingBox();
  const { sx, sy } = await page.evaluate(() => ({ sx: window.scrollX, sy: window.scrollY }));
  if (box) await page.screenshot({ path: shot, clip: { x: Math.max(0, box.x + sx - 40), y: Math.max(0, box.y + sy - 60), width: Math.min(box.width + 80, 1360), height: Math.min(box.height + 120, 920) } });
  else await page.screenshot({ path: shot });
  console.log(`  📸 ${shot}`);
}
await browser.close();
console.log(`  ── ${fails === 0 ? 'ALL GREEN' : fails + ' FAILURES'}`);
process.exit(fails ? 1 : 0);
