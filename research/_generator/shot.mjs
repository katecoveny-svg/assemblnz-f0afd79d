#!/usr/bin/env node
/**
 * shot.mjs — screenshot a concept demo at a named section.
 *
 * The demos pin a full-screen WebGL canvas at z-index 0, and that defeats both
 * the Preview pane's rasteriser and headless Chrome's own scrolled capture: you
 * get a black frame with a bit of chrome floating in it. So this drives Chrome
 * over CDP and, instead of scrolling, pulls the target section to the top of the
 * document with a negative margin — the same trick the homepage's ?jump= hook
 * uses. The canvas never moves, so it never has to recomposite.
 *
 *   node shot.mjs <url> <out.png> [sectionSelector] [width] [height]
 *
 * Requires a chrome-headless-shell from the puppeteer/playwright cache; pass one
 * explicitly with CHROME=/path/to/binary if the auto-pick is wrong.
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

const [url, out, sel = null, w = '1440', h = '1000'] = process.argv.slice(2);
if (!url || !out) {
  console.error('usage: node shot.mjs <url> <out.png> [sectionSelector] [w] [h]');
  process.exit(1);
}

function findChrome() {
  if (process.env.CHROME) return process.env.CHROME;
  const roots = [
    `${process.env.HOME}/.cache/puppeteer/chrome-headless-shell`,
    `${process.env.HOME}/Library/Caches/ms-playwright`,
  ];
  for (const root of roots) {
    if (!existsSync(root)) continue;
    const dirs = readdirSync(root).sort().reverse();
    for (const d of dirs) {
      const p = resolve(root, d, 'chrome-headless-shell-mac-arm64', 'chrome-headless-shell');
      if (existsSync(p)) return p;
    }
  }
  return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
}

const CHROME = findChrome();
const profile = mkdtempSync(resolve(tmpdir(), 'shot-'));
const port = 9500 + Math.floor((Date.now() / 1000) % 400);

const chrome = spawn(CHROME, [
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  '--headless=new',
  '--hide-scrollbars',
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-gpu-sandbox',
  '--use-gl=angle',
  '--use-angle=swiftshader',
  '--enable-unsafe-swiftshader',
  `--window-size=${w},${h}`,
  'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function cdp() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const tabs = await res.json();
      const page = tabs.find((t) => t.type === 'page');
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch { /* not up yet */ }
    await sleep(250);
  }
  throw new Error('chrome did not expose a debugging socket');
}

const wsUrl = await cdp();
const { WebSocket } = globalThis;
const ws = new WebSocket(wsUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });

let id = 0;
const pending = new Map();
ws.onmessage = (m) => {
  const msg = JSON.parse(m.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
};
function send(method, params = {}) {
  const n = ++id;
  return new Promise((r) => { pending.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
}

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: +w, height: +h, deviceScaleFactor: 2, mobile: false,
});
await send('Page.navigate', { url });
await sleep(4200); // WebGL init + the reveal observers

/* Reveal everything, then HOIST the target section to the top instead of
   scrolling to it — scrolling is what breaks the capture. */
const hoist = sel ? `
  document.querySelectorAll('.rise,.sec,.card').forEach(function(e){e.classList.add('risen')});
  var t=document.querySelector(${JSON.stringify(sel)});
  if(t){
    var y=t.getBoundingClientRect().top+window.pageYOffset;
    document.body.style.marginTop=(-y+40)+'px';
  }
  'hoisted:'+(t?'yes':'no');
` : `document.querySelectorAll('.rise,.sec,.card').forEach(function(e){e.classList.add('risen')});'revealed'`;

const r = await send('Runtime.evaluate', { expression: `(function(){${hoist}})()`, returnByValue: true });
await sleep(1400);

const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
if (!shot.result?.data) { console.error('capture failed', JSON.stringify(shot).slice(0, 400)); process.exit(1); }
writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
console.log(`✓ ${out}  ${r.result?.result?.value ?? ''}`);

ws.close();
chrome.kill();
process.exit(0);
