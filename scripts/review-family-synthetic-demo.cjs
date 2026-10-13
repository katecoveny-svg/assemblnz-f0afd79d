/** Local browser proof. Synthetic credentials/cookies only; every API and external request is blocked. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.ASSEMBL_PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.ASSEMBL_REVIEW_ORIGIN || 'http://127.0.0.1:3160';
if (!['localhost', '127.0.0.1'].includes(new URL(origin).hostname)) throw new Error('Local review required');
const out = 'output/playwright/family-synthetic-demo';
(async () => {
 fs.mkdirSync(out, { recursive: true });
 const browser = await chromium.launch({ headless: true, ...(process.env.ASSEMBL_CHROMIUM_PATH ? { executablePath: process.env.ASSEMBL_CHROMIUM_PATH } : { channel: 'chrome' }) });
 const checks = [], errors = [];
 try {
  const context = await browser.newContext({ httpCredentials: { username: 'synthetic-demo', password: 'synthetic-local-only' }, serviceWorkers: 'block', viewport: { width: 1280, height: 900 } });
  await context.route('**/*', route => { const url = new URL(route.request().url()); return url.origin !== origin || url.pathname.startsWith('/api/') || route.request().method() !== 'GET' ? route.abort() : route.continue(); });
  const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message));
  for (const value of ['0', '1', 'false', 'arbitrary']) {
   await context.addCookies([{ name: 'family_demo_mode', value, url: origin + '/customers/family' }]);
   for (const tab of ['week', 'rides', 'kitchen', 'money', 'inbox', 'genome']) {
    await page.goto(origin + '/customers/family/ops?tab=' + tab, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.getByRole('heading', { name: 'Example whānau' }).waitFor();
    assert.equal(await page.getByRole('heading', { name: /^Example (adult|child) [AB]$/ }).count(), 4);
    assert.equal(await page.locator('main form').count(), 0);
    checks.push(`Synthetic-only ${tab} with presentation cookie ${value}`);
   }
  }
  await page.screenshot({ path: out + '/desktop.png', fullPage: true });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({ path: out + '/mobile-375.png', fullPage: true });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)); checks.push('375px without horizontal overflow');
  assert.equal(errors.length, 0); checks.push('No page runtime errors');
  fs.writeFileSync(out + '/results.json', JSON.stringify({ checks, errors, syntheticOnly: true }, null, 2));
  console.log(`${checks.length} synthetic browser checks passed`);
  await context.close();
 } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
