const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async () => {
  const origin = process.env.REVIEW_ORIGIN || 'http://127.0.0.1:3120';
  const output = process.env.REVIEW_OUTPUT || '/tmp/assembl-contact-audit-20261027/proof';
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
  const rows = [];
  try {
    for (const width of [320, 375, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      const requests = [];
      await context.route('**/*', route => {
        const request = route.request(), url = new URL(request.url());
        if (request.method() !== 'GET' || url.pathname.startsWith('/api/')) { requests.push({ method: request.method(), path: url.pathname }); return route.abort(); }
        return route.continue();
      });
      const page = await context.newPage();
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      await page.goto(origin + '/contact?product=studio', { waitUntil: 'networkidle' });
      assert.equal(await page.title(), 'Contact assembl | Discuss your project');
      assert.equal(await page.locator('h1').innerText().then(text => text.replace(/\s+/g, ' ')), 'Bring us the work.');
      assert.equal(await page.getByRole('radio', { name: 'Website or experience', exact: true }).isChecked(), true);
      await page.getByRole('link', { name: 'Tell us about it', exact: true }).click();
      await page.waitForFunction(() => Math.abs(document.querySelector('#project-brief').getBoundingClientRect().top - 24) < 8);
      // Required-field validation must keep the visitor on the brief, without submitting.
      await page.getByRole('button', { name: 'Review email draft', exact: true }).click();
      assert.equal(await page.locator('#email-preview').count(), 0);
      await page.locator('#message').fill('A fictional workshop website. Māori & symbols stay in the draft.');
      await page.locator('#name').fill('Fictional visitor');
      await page.locator('#email').fill('visitor@example.invalid');
      await page.locator('#business').fill('Fictional workshop');
      await page.getByRole('button', { name: 'Review email draft', exact: true }).click();
      await page.waitForFunction(() => document.activeElement?.id === 'draft-heading');
      const href = await page.getByRole('link', { name: 'Open email draft', exact: true }).getAttribute('href');
      const mail = new URL(href);
      assert.equal(mail.pathname, 'assembl@assembl.co.nz');
      assert.deepEqual([...mail.searchParams.keys()], ['subject', 'body']);
      assert(mail.searchParams.get('body').includes('Māori & symbols'));
      assert.equal(await page.locator('#email-preview').inputValue(), mail.searchParams.get('body'));
      // Do not activate mailto or send an enquiry. Inspect the exact local handoff.
      await page.getByRole('button', { name: 'Edit brief', exact: true }).click();
      await page.waitForFunction(() => document.activeElement?.id === 'name');
      assert.equal(await page.locator('#business').inputValue(), 'Fictional workshop');
      await page.getByRole('radio', { name: 'An idea to explore', exact: true }).check();
      await page.getByRole('button', { name: 'Review email draft', exact: true }).click();
      assert((await page.getByRole('link', { name: 'Open email draft', exact: true }).getAttribute('href')).includes('An%20idea%20to%20explore'));
      await page.getByRole('button', { name: 'Guide', exact: true }).click();
      assert(await page.getByText('Prepared company guide · not a live AI answer', { exact: true }).isVisible());
      assert.equal(await page.locator('#site-do-workspace form, #site-do-workspace input, #site-do-workspace textarea').count(), 0);
      await page.keyboard.press('Escape');
      await page.locator('#site-do-workspace').waitFor({ state: 'detached' });
      assert.equal(await page.locator('a[href^="/do"],a[href^="/pursuit"],a[href^="/creative-studio"]').count(), 0);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
      assert.deepEqual(requests, [], 'Contact form and prepared guide make no API/submission request');
      assert.deepEqual(errors, []);
      await page.screenshot({ path: `${output}/contact-${width}.png`, fullPage: true });
      rows.push({ width, validation: true, draftEncoding: true, editRetained: true, guide: 'prepared only', overflow: false, requests });
      await context.close();
    }
    const staticContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
    const staticPage = await staticContext.newPage(); await staticPage.goto(origin + '/contact');
    assert(await staticPage.getByRole('button', { name: 'Review email draft', exact: true }).isDisabled());
    await staticPage.screenshot({ path: `${output}/no-js.png`, fullPage: true });
    assert(await staticPage.locator('noscript p').isVisible());
    assert.equal(await staticPage.locator('a[href="mailto:assembl@assembl.co.nz"]').count(), 2);
    await staticContext.close();
    const legal = await browser.newPage({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });
    for (const path of ['/legal/terms', '/legal/privacy', '/legal/disclaimer', '/legal/meta-data-deletion']) {
      await legal.goto(origin + path, { waitUntil: 'networkidle' });
      assert(await legal.locator('h1').isVisible());
      assert.equal(await legal.locator('header a[href="/lab"]').count(), 1);
      assert.equal(await legal.locator('header a[href^="/do"],footer a[href^="/do"],header a[href^="/pursuit"],footer a[href^="/creative-studio"]').count(), 0);
      assert.equal(await legal.getByRole('button', { name: 'Guide', exact: true }).count(), 1);
      assert.equal(await legal.evaluate(() => document.documentElement.scrollWidth), 375);
      rows.push({ path, renders: true, publicNavigation: true });
    }
    fs.writeFileSync(`${output}/results.json`, JSON.stringify({ origin, rows, noJavaScriptSafe: true, noMailSent: true }, null, 2));
    console.log(JSON.stringify({ passed: rows.length + 1, output }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
