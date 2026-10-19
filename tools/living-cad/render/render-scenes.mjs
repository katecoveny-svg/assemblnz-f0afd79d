import { chromium } from 'playwright-core';
import fs from 'node:fs';
const scenes = JSON.parse(fs.readFileSync(new URL('./scenes.json', import.meta.url).pathname, 'utf8'));
const out = process.argv[2] || new URL('./out', import.meta.url).pathname;
fs.mkdirSync(out + '/alpha', { recursive: true });
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1600, height: 1200 } });
p.on('pageerror', e => console.log('pageerror', e.message));
p.on('console', m => { if (m.type() === 'error') console.log('console', m.text()); });
await p.goto('http://127.0.0.1:3113/tools/living-cad/render/render.html', { waitUntil: 'load' });
await p.waitForFunction(() => window.ready === true, null, { timeout: 60000 });
for (const [name, scene] of Object.entries(scenes)) {
  const t = Date.now();
  const url = await p.evaluate(([s]) => window.renderScene(s, false), [scene]);
  fs.writeFileSync(`${out}/${name}.png`, Buffer.from(url.split(',')[1], 'base64'));
  const url2 = await p.evaluate(([s]) => window.renderScene(s, true), [scene]);
  fs.writeFileSync(`${out}/alpha/${name}.png`, Buffer.from(url2.split(',')[1], 'base64'));
  console.log(name, Math.round((Date.now() - t) / 100) / 10 + 's');
}
await b.close();
