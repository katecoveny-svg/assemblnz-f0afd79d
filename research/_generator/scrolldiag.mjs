import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

const [url, outPrefix] = process.argv.slice(2);
function findChrome() {
  if (process.env.CHROME) return process.env.CHROME;
  const roots = [`${process.env.HOME}/.cache/puppeteer/chrome-headless-shell`, `${process.env.HOME}/Library/Caches/ms-playwright`];
  for (const root of roots) {
    if (!existsSync(root)) continue;
    for (const d of readdirSync(root).sort().reverse()) {
      const p = resolve(root, d, 'chrome-headless-shell-mac-arm64', 'chrome-headless-shell');
      if (existsSync(p)) return p;
    }
  }
  throw new Error('no chrome-headless-shell found');
}
const chrome = findChrome();
const port = 9333 + Math.floor(Math.random() * 400);
const proc = spawn(chrome, [`--remote-debugging-port=${port}`, '--headless', '--disable-gpu-sandbox', '--no-sandbox', `--window-size=1440,900`, 'about:blank'], { stdio: 'ignore' });
const wait = (ms) => new Promise(r => setTimeout(r, ms));
await wait(1200);
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = list[0].webSocketDebuggerUrl;
let send, id = 0, pending = new Map();
const sock = new WebSocket(ws);
await new Promise((r, j) => { sock.onopen = r; sock.onerror = j; });
sock.onmessage = (m) => { const d = JSON.parse(m.data); if (pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
send = (method, params = {}) => new Promise(res => { const i = ++id; pending.set(i, res); sock.send(JSON.stringify({ id: i, method, params })); });
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url });
await wait(5000);
const evl = async (expr) => (await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result?.result?.value;
const diag = await evl(`(async () => {
  const se = document.scrollingElement;
  se.scrollTop = 1000; const immediate = se.scrollTop;
  await new Promise(r => requestAnimationFrame(r));
  const afterRaf = se.scrollTop;
  await new Promise(r => setTimeout(r, 600));
  const later = se.scrollTop;
  return JSON.stringify({ immediate, afterRaf, later, max: se.scrollHeight - se.clientHeight, shrmH: document.querySelector('.shrm')?.getBoundingClientRect().height, builderTop: document.querySelector('#builder')?.offsetTop });
})()`);
console.log('DIAG', diag);
const d = JSON.parse(diag);
// screenshot 1: end of gallery region (just before builder)
await evl(`document.scrollingElement.scrollTop = Math.round((document.querySelector('.shrm')?.offsetHeight ?? 3000) * 0.35); 'ok'`);
await wait(900);
let shot = await send('Page.captureScreenshot', { format: 'png' });
writeFileSync(`${outPrefix}-boundary.png`, Buffer.from(shot.result.data, 'base64'));
// screenshot 2: builder hero
await evl(`document.scrollingElement.scrollTop = Math.round((document.querySelector('.shrm')?.offsetHeight ?? 3000) * 0.8); 'ok'`);
await wait(900);
shot = await send('Page.captureScreenshot', { format: 'png' });
writeFileSync(`${outPrefix}-builderhero.png`, Buffer.from(shot.result.data, 'base64'));
const final = await evl(`document.scrollingElement.scrollTop`);
console.log('finalScroll', final);
proc.kill();
