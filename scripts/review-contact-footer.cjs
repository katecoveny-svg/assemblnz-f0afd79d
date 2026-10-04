const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
  });
  const origin = process.env.REVIEW_ORIGIN || 'https://www.assembl.co.nz';
  const output = process.env.REVIEW_OUTPUT || 'output/contact-footer';
  fs.mkdirSync(output, { recursive: true });
  const rows = [];
  try {
    for (const width of [320, 375, 1440]) {
      for (const route of ['/contact?product=system', '/about']) {
        const page = await browser.newPage({ viewport: { width, height: 667 } });
        await page.route('**/*', request => {
          const url = new URL(request.request().url());
          return request.request().method() !== 'GET' || url.pathname.startsWith('/api/')
            ? request.abort() : request.continue();
        });
        await page.goto(origin + route, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        assert.equal(await page.locator('header [data-glass-identity="assembl"]').count(), 1);
        await page.evaluate(() => scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
        await page.waitForTimeout(100);
        const links = await page.locator('footer a').evaluateAll(elements => elements.map(element => {
          const rect = element.getBoundingClientRect();
          const samples = [[.25, .5], [.5, .5], [.75, .5]];
          return {
            text: element.textContent,
            href: element.getAttribute('href'),
            height: rect.height,
            accessible: samples.every(([x, y]) => {
              const hit = document.elementFromPoint(rect.x + rect.width * x, rect.y + rect.height * y);
              return hit === element || element.contains(hit);
            }),
          };
        }));
        assert(links.some(link => link.href === '/legal/privacy'), 'Privacy link remains present');
        assert(links.every(link => link.height >= 44), 'Footer touch targets remain at least 44px');
        if (width <= 620) assert(links.every(link => link.accessible), JSON.stringify({ width, route, links }));
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
        const paddingBottom = await page.locator('footer').evaluate(element => getComputedStyle(element).paddingBottom);
        if (width === 1440) assert.equal(paddingBottom, '28px', 'Desktop footer spacing remains unchanged');
        await page.screenshot({ path: `${output}/${route.startsWith('/about') ? 'about' : 'contact'}-${width}.png` });
        await page.getByRole('button', { name: 'Ask DO', exact: true }).click();
        await page.getByRole('button', { name: 'Close DO', exact: true }).waitFor();
        await page.keyboard.press('Escape');
        assert.equal(await page.getByRole('button', { name: 'Ask DO', exact: true }).getAttribute('aria-expanded'), 'false');
        rows.push({ width, route, links, paddingBottom, widgetOpenAndEscapeClose: true });
        await page.close();
      }
    }
    fs.writeFileSync(`${output}/results.json`, JSON.stringify({ origin, rows }, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
