// Local/preview regression proof. No checkout, manufacturing or external submissions.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async () => {
  const browser = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: ['--enable-unsafe-swiftshader'] });
  const origin = process.env.REVIEW_ORIGIN || 'http://127.0.0.1:3000';
  const output = process.env.REVIEW_OUTPUT || 'output/playwright/living-configurator';
  fs.mkdirSync(output, { recursive: true });
  const results = [];
  try {
    for (const width of [320, 375, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 812 } });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.route('**/*', route => ['GET', 'HEAD'].includes(route.request().method()) ? route.continue() : route.abort());
      await page.goto(`${origin}/living/configurator-preview`, { waitUntil: 'networkidle' });
      assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex, nofollow');
      await page.getByRole('combobox').nth(1).selectOption('grid');
      await page.getByRole('textbox', { name: 'your name' }).fill('Preview check');
      await page.getByRole('spinbutton').nth(0).fill('480');
      await page.getByRole('spinbutton').nth(1).fill('320');
      const controls = page.locator('.workbench input,.workbench select,.workbench button');
      for (const control of await controls.all()) {
        await control.scrollIntoViewIfNeeded();
        const box = await control.boundingBox();
        assert(box && box.x >= -1 && box.x + box.width <= width + 1, 'Configurator control clips horizontally');
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
      const pending = page.waitForEvent('download');
      await page.getByRole('button', { name: 'download concept ↗' }).click();
      const download = await pending;
      const exported = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
      assert.equal(exported.product, 'grid'); assert.equal(exported.label, 'Preview check');
      assert.equal(exported.width_mm, '480'); assert.equal(exported.depth_mm, '320');
      assert.equal(exported.status, 'concept-only'); assert.equal(exported.approved_for_manufacture, false);
      await page.locator('.workbench').scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${output}/workbench-${width}.png` });
      assert.deepEqual(errors, []);
      results.push({ width, overflow: false, controlsInViewport: true, exportVerified: true, errors });
      await page.close();
    }
    fs.writeFileSync(`${output}/results.json`, JSON.stringify(results, null, 2));
    console.log(JSON.stringify(results, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
