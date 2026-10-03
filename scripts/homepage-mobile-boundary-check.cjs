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
          const geometry = await page.evaluate(() => {
            const h1 = document.querySelector('h1');
            const frame = h1.closest('section').querySelector('header').parentElement;
            const rect = element => { const r = element.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, left: r.left, right: r.right }; };
            const visible = element => element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden';
            const disclosure = [...frame.querySelectorAll('p')].find(element => element.textContent.includes('Illustrative workspace tour'));
            return {
              h1: [...h1.querySelectorAll('span')].map(span => span.textContent.trim()).join(' '), frame: rect(frame), overflow: document.documentElement.scrollWidth > innerWidth,
              targets: [frame.querySelector('a[href="/contact?product=system"]'), disclosure, ...frame.querySelectorAll('[aria-label="Choose a scene chapter"] button')].filter(visible).map(element => ({ text: element.textContent, ...rect(element) })),
              video: Boolean(document.querySelector('video')),
            };
          });
          Object.assign(record, geometry, { stage: 'geometry' });
          persist();
          assert.equal(geometry.h1, 'Assemble useful work.');
          assert.equal(geometry.overflow, false);
          assert.equal(geometry.video, false);
          for (const target of geometry.targets) {
            assert(target.top >= geometry.frame.top - 1 && target.bottom <= geometry.frame.bottom + 1, `${width}x${height} ${reducedMotion}: clipped ${target.text}`);
            assert(target.left >= -1 && target.right <= width + 1, `${width}x${height}: horizontal clipping`);
            if (width <= 650 && reducedMotion === 'no-preference') assert(target.bottom <= height + 1, `${width}x${height}: target below first viewport`);
          }
          record.geometryPassed = true;
          record.stage = 'pause-scene';
          persist();
          console.log(`GEOMETRY PASS ${label}`);
          // Measure normal-motion geometry first, then use the existing visual audit's
          // keyboard pause so software WebGL does not starve pointer actionability checks.
          const pause = page.getByRole('button', { name: 'Pause scene motion', exact: true });
          if (await pause.count() && await pause.isEnabled()) {
            await pause.focus();
            await pause.press('Enter');
            const resume = page.getByRole('button', { name: 'Resume scene motion', exact: true });
            await resume.waitFor({ state: 'visible' });
            assert.equal(await resume.getAttribute('aria-pressed'), 'true');
            await page.waitForTimeout(400);
            record.scenePaused = true;
          }
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
