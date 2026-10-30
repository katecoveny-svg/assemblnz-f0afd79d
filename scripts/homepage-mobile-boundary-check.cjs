/* Run against a local candidate. No provider submissions or dependency installs. */
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
  const browser = await (process.env.PROOF_BROWSER === 'webkit' ? webkit : chromium).launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: ['--enable-unsafe-swiftshader'] });
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
        const guideRequests = [];
        page.on('request', request => { if (request.url().includes('/api/home/agent')) guideRequests.push(request.url()); });
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
          await page.locator('.clear-home').waitFor();
          await page.evaluate(() => document.fonts.ready);
          const geometry = await page.evaluate(() => {
            const header = document.querySelector('.clear-home header');
            if (!header) throw new Error('Missing homepage header');
            const visible = el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden' && getComputedStyle(el).display !== 'none';
            return {
              h1: document.querySelector('h1')?.innerText.replace(/\s+/g, ' ').trim(),
              overflow: document.documentElement.scrollWidth > innerWidth,
              targets: [...header.querySelectorAll('a,button')].filter(visible).map(el => ({ text: el.textContent, ...el.getBoundingClientRect().toJSON() })),
              planes: document.querySelectorAll('.assembly-plane').length,
              video: Boolean(document.querySelector('[data-coastal-video]')),
            };
          });
          Object.assign(record, geometry, { stage: 'geometry' }); persist();
          assert.equal(geometry.h1, 'Make the next step worth waiting for.');
          assert.equal(geometry.overflow, false);
          assert.equal(geometry.planes, 7);
          assert.equal(geometry.video, false, 'No legacy video runtime');
          for (const target of geometry.targets) {
            assert(target.left >= -1 && target.right <= width + 1, `clipped header target: ${target.text}`);
            assert(target.top >= 0 && target.bottom <= height + 1, `header target outside viewport: ${target.text}`);
            assert(target.height >= 44, `undersized touch target: ${target.text}`);
          }
          const pause = page.getByRole('button', {name: /Pause motion|Play motion|Motion reduced/});
          if (reducedMotion === 'reduce') {
            assert(await pause.isDisabled());
          } else {
            await pause.click();
            assert.equal(await pause.getAttribute('aria-pressed'), 'true');
            const before = await page.locator('.assembly-stage').evaluate(el => el.style.getPropertyValue('--assembly'));
            await page.waitForTimeout(150);
            assert.equal(await page.locator('.assembly-stage').evaluate(el => el.style.getPropertyValue('--assembly')), before);
            await page.getByRole('slider', {name:'Assembly progress'}).press('End');
            assert.equal(await page.locator('.assembly-stage').evaluate(el => el.style.getPropertyValue('--assembly')), '1');
          }
          for (const href of ['/ai-ready','/contact','/pursuit','/do','/studio','/lab']) {
            assert(await page.locator(`.clear-home a[href="${href}"]`).count() > 0);
          }
          record.geometryPassed = true;
          await page.screenshot({ path: path.join(path.dirname(output), `${label}.png`) });
          record.stage = 'open-widget';
          persist();
          const trigger = page.locator('button[aria-controls="site-do-workspace"]');
          await trigger.click();
          await page.locator('#site-do-workspace').waitFor({ state: 'visible' });
          assert.equal(await trigger.getAttribute('aria-expanded'), 'true');
          const panel = page.locator('#site-do-workspace');
          assert.equal(await panel.locator('a[href^="/do"]').count(), 0);
          assert(await panel.getByRole('region', { name: 'Prepared company guide' }).isVisible());
          assert.equal(await panel.locator('form, textarea, input[type="checkbox"]').count(), 0);
          await panel.getByText('What can this guide actually do?', { exact: true }).click();
          assert(await panel.getByText(/It cannot access your account/).isVisible());
          assert.equal(await panel.getByRole('link', { name: /Speak|Talk/ }).count(), 0);

          record.stage = 'close-widget';
          persist();
          const close = page.getByRole('button', { name: 'Close DO', exact: true });
          await close.click();
          await page.locator('#site-do-workspace').waitFor({ state: 'detached' });
          assert.equal(await trigger.getAttribute('aria-expanded'), 'false');
          assert(await trigger.evaluate(element => document.activeElement === element));
          assert.deepEqual(guideRequests, [], 'Prepared guidance must not call a model endpoint');
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
