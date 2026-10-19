/** Mount the actual component with synthetic offers. No app/provider/network access. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const { build } = createRequire(require.resolve('tsx'))('esbuild');
const { chromium } = require(process.env.ASSEMBL_PLAYWRIGHT_MODULE || 'playwright');
const output = 'output/playwright/do-travel-selection';
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const bundle = await build({ entryPoints: ['test/fixtures/do-travel-selection/main.tsx'], bundle: true, write: false,
    outfile: 'fixture.js', jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' } });
  const assets = new Map(bundle.outputFiles.map(file => ['/' + path.basename(file.path), file.text]));
  const browser = await chromium.launch({ headless: true, ...(process.env.ASSEMBL_CHROMIUM_PATH ? { executablePath: process.env.ASSEMBL_CHROMIUM_PATH } : {}) });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block' });
  const errors = [], external = [], checks = [];
  const check = (label, value) => { assert.ok(value, label); checks.push(label); console.log('PASS ' + label); };
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin !== 'https://fixture.invalid') { external.push(url.href); return route.abort(); }
    if (url.pathname === '/') return route.fulfill({ contentType: 'text/html', body: '<div id="root"></div><link rel="stylesheet" href="/fixture.css"><script src="/fixture.js"></script>' });
    if (assets.has(url.pathname)) return route.fulfill({ contentType: url.pathname.endsWith('.css') ? 'text/css' : 'application/javascript', body: assets.get(url.pathname) });
    return route.abort();
  });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto('https://fixture.invalid');
    const choose = page.getByRole('button', { name: 'Choose for review' });
    const confirm = page.getByRole('button', { name: 'Confirm search selection' });
    const retained = page.getByLabel('Retained receipt');
    const review = async () => {
      await choose.click();
      await page.getByRole('checkbox', { name: /I reviewed the price evidence/ }).check();
      await confirm.click();
      await page.getByRole('status').filter({ hasText: 'Selection reviewed for this open page' }).waitFor();
    };
    await review();
    check('Detached receipt remains retained after confirmation', await retained.textContent() === 'search_selection: 240.00');
    check('Repeated confirmation is disabled', await confirm.isDisabled());
    await page.getByRole('button', { name: 'Fixture: change price' }).click();
    await page.waitForFunction(() => document.querySelector('output')?.textContent === 'none');
    check('Changed price clears prior review', await confirm.count() === 0);
    await review();
    check('New price needs and retains a fresh review', await retained.textContent() === 'search_selection: 999.00');
    for (const width of [1440, 375]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.screenshot({ path: `${output}/selection-${width}.png`, fullPage: true });
    }
    await page.getByRole('button', { name: 'Fixture: expire offer' }).click();
    await page.waitForFunction(() => document.querySelector('output')?.textContent === 'none');
    check('Expired result clears review and cannot be chosen', await choose.isDisabled());
    check('No external requests or browser errors', external.length === 0 && errors.length === 0);
    fs.writeFileSync(`${output}/proof.json`, JSON.stringify({ checks, external, errors }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
