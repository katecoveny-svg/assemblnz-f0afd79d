#!/usr/bin/env node
/**
 * palette.mjs — read a site's REAL palette and type off its computed styles.
 *
 *   node palette.mjs https://example.co.nz [more urls...]
 *
 * Extracting brand colour from markup or a logo is guesswork, and guesswork is
 * exactly what `paletteConfidence:'low'` exists to flag. This counts every
 * element's computed background/text/border colour and reports the most-used
 * non-neutral ones, so the number that goes in clients.mjs is the number the
 * brand actually ships. Same for font-family.
 *
 * Neutrals (black, white, greys) are reported separately — they dominate every
 * site and drown out the brand colours if left in the same list.
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, readdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

const urls = process.argv.slice(2);
if (!urls.length) { console.error('usage: node palette.mjs <url> [url...]'); process.exit(1); }

function findChrome() {
  if (process.env.CHROME) return process.env.CHROME;
  for (const root of [`${process.env.HOME}/.cache/puppeteer/chrome-headless-shell`,
                      `${process.env.HOME}/Library/Caches/ms-playwright`]) {
    if (!existsSync(root)) continue;
    for (const d of readdirSync(root).sort().reverse()) {
      const p = resolve(root, d, 'chrome-headless-shell-mac-arm64', 'chrome-headless-shell');
      if (existsSync(p)) return p;
    }
  }
  return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
}

const port = 9300 + Math.floor((Date.now() / 1000) % 500);
const chrome = spawn(findChrome(), [
  `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(resolve(tmpdir(), 'pal-'))}`,
  '--headless=new', '--no-first-run', '--no-default-browser-check',
  '--window-size=1440,1000', 'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function socket() {
  for (let i = 0; i < 60; i++) {
    try {
      const tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      const p = tabs.find((t) => t.type === 'page');
      if (p?.webSocketDebuggerUrl) return p.webSocketDebuggerUrl;
    } catch { /* not up */ }
    await sleep(250);
  }
  throw new Error('no debugging socket');
}

const ws = new WebSocket(await socket());
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let id = 0; const pending = new Map();
ws.onmessage = (m) => { const msg = JSON.parse(m.data); if (pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); } };
const send = (method, params = {}) => { const n = ++id; return new Promise((r) => { pending.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); }); };

await send('Page.enable');
await send('Runtime.enable');

const PROBE = `(() => {
  const hex = (c) => {
    const m = c.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?\\)/);
    if (!m) return null;
    if (m[4] !== undefined && parseFloat(m[4]) < 0.5) return null;
    const [r,g,b] = [m[1],m[2],m[3]].map(Number);
    return { hex: '#' + [r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase(), r,g,b };
  };
  const neutral = ({r,g,b}) => (Math.max(r,g,b) - Math.min(r,g,b)) < 18;
  const brand = {}, neut = {};
  document.querySelectorAll('*').forEach(el => {
    const cs = getComputedStyle(el);
    for (const prop of ['backgroundColor','color','borderTopColor','fill']) {
      const h = hex(cs[prop] || '');
      if (!h) continue;
      const bucket = neutral(h) ? neut : brand;
      bucket[h.hex] = (bucket[h.hex] || 0) + 1;
    }
  });
  const top = (o, n) => Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,n);
  const fonts = {};
  document.querySelectorAll('h1,h2,h3,p,a,button,li,body').forEach(el => {
    const f = getComputedStyle(el).fontFamily; fonts[f] = (fonts[f]||0)+1;
  });
  return JSON.stringify({
    title: document.title,
    h1: (document.querySelector('h1')||{}).textContent?.trim().slice(0,120) || '',
    brand: top(brand, 10),
    neutral: top(neut, 4),
    fonts: top(fonts, 4),
  });
})()`;

for (const url of urls) {
  await send('Page.navigate', { url });
  await sleep(5000);
  const r = await send('Runtime.evaluate', { expression: PROBE, returnByValue: true, awaitPromise: false });
  const v = r.result?.result?.value;
  console.log(`\n════ ${url} ════`);
  if (!v) { console.log('  (probe failed)', JSON.stringify(r).slice(0, 200)); continue; }
  const d = JSON.parse(v);
  console.log(`  title: ${d.title}`);
  if (d.h1) console.log(`  h1:    ${d.h1}`);
  console.log(`  fonts: ${d.fonts.map(([f, n]) => `${f.split(',')[0]} (${n})`).join(' · ')}`);
  console.log(`  BRAND: ${d.brand.map(([h, n]) => `${h}×${n}`).join('  ')}`);
  console.log(`  neut:  ${d.neutral.map(([h, n]) => `${h}×${n}`).join('  ')}`);
}

ws.close(); chrome.kill(); process.exit(0);
