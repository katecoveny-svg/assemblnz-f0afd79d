/* Run against a local candidate. No provider submissions or dependency installs. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: ['--enable-unsafe-swiftshader'] });
  const results = [];
  const output = process.env.HOMEPAGE_RESULTS || 'visual-evidence/homepage-copy/boundary-results.json';
  fs.mkdirSync(path.dirname(output), { recursive: true });
  const persist = () => fs.writeFileSync(output, JSON.stringify(results, null, 2));
  try {
    for (const [width, height] of [[320, 667], [375, 667], [375, 720], [375, 721], [375, 812], [390, 844], [1440, 900]]) {
      for (const reducedMotion of ['no-preference', 'reduce']) {
        const context = await browser.newContext({ viewport: { width, height }, reducedMotion });
        const page = await context.newPage();
        const errors = [];
        const record = { width, height, reducedMotion, status: 'running', stage: 'navigate', errors };
        const label = `${width}x${height}-${reducedMotion}`;
        results.push(record);
        persist();
        console.log(`START ${label}`);
        try {
          page.on('pageerror', error => errors.push(error.message));
          await page.route('**/*', route => route.request().method() === 'GET' ? route.continue() : route.abort());
          await page.goto(process.env.HOMEPAGE_URL || 'http://127.0.0.1:3013', { waitUntil: 'networkidle' });
          await page.waitForTimeout(1000);
          await page.locator('.direction-4c').waitFor();
          await page.evaluate(() => document.fonts.ready);
          const geometry = await page.evaluate(() => {
            const header = document.querySelector('.direction-4c header');
            if (!header) throw new Error('Missing coastal homepage header');
            const visible = el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden' && getComputedStyle(el).display !== 'none';
            return {
              h1: document.querySelector('h1')?.textContent.trim(),
              overflow: document.documentElement.scrollWidth > innerWidth,
              targets: [...header.querySelectorAll('a,button')].filter(visible).map(el => ({ text: el.textContent, ...el.getBoundingClientRect().toJSON() })),
              posterLoaded: document.querySelector('.clear-coastal-poster')?.naturalWidth > 0,
              video: Boolean(document.querySelector('[data-coastal-video]')),
            };
          });
          Object.assign(record, geometry, { stage: 'geometry' }); persist();
          assert.equal(geometry.h1, 'assembl. Useful work.');
          assert.equal(geometry.overflow, false);
          assert.equal(geometry.posterLoaded, true);
          assert.equal(geometry.video, true, 'approved coastal footage remains mounted');
          for (const target of geometry.targets) {
            assert(target.left >= -1 && target.right <= width + 1, `clipped header target: ${target.text}`);
            assert(target.top >= 0 && target.bottom <= height + 1, `header target outside viewport: ${target.text}`);
            assert(target.height >= 44, `undersized touch target: ${target.text}`);
          }
          const pause = page.locator('[data-pause]');
          if (reducedMotion === 'reduce') {
            await page.getByRole('button', { name: 'Motion reduced', exact: true }).waitFor();
            assert(await pause.isDisabled());
            assert(await page.locator('[data-coastal-video]').evaluate(v => v.paused));
          } else {
            await page.waitForFunction(() => document.querySelector('.direction-4c').hasAttribute('data-ready'));
            await pause.focus(); await pause.press('Enter');
            assert.equal(await pause.getAttribute('aria-pressed'), 'true');
            assert(await page.locator('[data-coastal-video]').evaluate(v => v.paused));
          }
          for (const href of ['/do?tool=write', '/do?tool=talk', '/do']) {
            const link = page.locator(`#try a[href="${href}"]`);
            await link.scrollIntoViewIfNeeded(); await link.click({ trial: true });
          }
          record.geometryPassed = true;
          await page.screenshot({ path: path.join(path.dirname(output), `${label}.png`) });
          record.stage = 'open-widget';
          persist();
          const trigger = page.getByRole('button', { name: 'Ask DO', exact: true });
          await trigger.click();
          await page.locator('#site-do-workspace').waitFor({ state: 'visible' });
          assert.equal(await trigger.getAttribute('aria-expanded'), 'true');
          record.stage = 'close-widget';
          persist();
          const close = page.getByRole('button', { name: 'Close DO', exact: true });
          await close.click();
          await page.locator('#site-do-workspace').waitFor({ state: 'detached' });
          assert.equal(await trigger.getAttribute('aria-expanded'), 'false');
          assert(await trigger.evaluate(element => document.activeElement === element));
          assert.deepEqual(errors, []);
          record.status = 'passed';
          record.stage = 'complete';
          console.log(`PASS ${label}`);
        } catch (error) {
          record.status = 'failed';
          record.error = String(error);
          record.failureScreenshot = path.join(path.dirname(output), `failure-${label}.png`);
          persist();
          try { await page.screenshot({ path: record.failureScreenshot, timeout: 15000 }); }
          catch (screenshotError) { record.screenshotError = String(screenshotError); }
          console.error(`FAIL ${label} at ${record.stage}: ${error}`);
          throw error;
        } finally {
          persist();
          await context.close();
        }
      }
    }
    assert.equal(results.filter(record => record.status === 'passed').length, 14);
    console.log(JSON.stringify(results, null, 2));
  } finally {
    persist();
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
