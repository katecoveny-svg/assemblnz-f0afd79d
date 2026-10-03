/* Run against a local candidate. No provider submissions or dependency installs. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: ['--enable-unsafe-swiftshader'] });
  const results = [];
  try {
    for (const [width, height] of [[320, 667], [375, 667], [375, 720], [375, 721], [375, 812], [390, 844], [1440, 900]]) {
      for (const reducedMotion of ['no-preference', 'reduce']) {
        const context = await browser.newContext({ viewport: { width, height }, reducedMotion });
        const page = await context.newPage();
        const errors = [];
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
        assert.equal(geometry.h1, 'Assemble useful work.');
        assert.equal(geometry.overflow, false);
        assert.equal(geometry.video, false);
        for (const target of geometry.targets) {
          assert(target.top >= geometry.frame.top - 1 && target.bottom <= geometry.frame.bottom + 1, `${width}x${height} ${reducedMotion}: clipped ${target.text}`);
          assert(target.left >= -1 && target.right <= width + 1, `${width}x${height}: horizontal clipping`);
          if (width <= 650 && reducedMotion === 'no-preference') assert(target.bottom <= height + 1, `${width}x${height}: target below first viewport`);
        }
        await page.getByRole('button', { name: 'Ask DO', exact: true }).click();
        assert(await page.locator('#site-do-workspace').isVisible());
        await page.getByRole('button', { name: 'Close DO', exact: true }).click();
        assert.equal(await page.locator('#site-do-workspace').count(), 0);
        assert.deepEqual(errors, []);
        results.push({ width, height, reducedMotion, ...geometry, errors });
        await context.close();
      }
    }
    if (process.env.HOMEPAGE_RESULTS) fs.writeFileSync(process.env.HOMEPAGE_RESULTS, JSON.stringify(results, null, 2));
    console.log(JSON.stringify(results, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
