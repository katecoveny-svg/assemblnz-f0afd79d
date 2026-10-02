/* Actual Next-route check. Never submits a prompt or opens a native email app. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const origin = process.env.AUDIT_REVIEW_ORIGIN || 'http://127.0.0.1:3000';
const out = process.env.AUDIT_REVIEW_OUT || 'output/playwright/public-audit';
const marker = 'FICTIONAL_AUDIT_BOUNDARY_71c39_ā🙂';
const report = { origin, mode: process.env.AUDIT_REVIEW_MODE || 'production', marker, cases: [], requests: [], errors: [], blocked: [] };
function leaked(text) {
  const variants = [marker, encodeURIComponent(marker), Buffer.from(marker).toString('base64'), 'FICTIONAL_AUDIT_BOUNDARY_71c39'];
  let decoded = text; try { decoded = decodeURIComponent(text); } catch {}
  return variants.some(value => text.includes(value) || decoded.includes(value));
}
async function context(browser, options) {
  const ctx = await browser.newContext(options);
  ctx.on('request', request => {
    const entry = { url: request.url(), method: request.method(), body: request.postData() || '' };
    report.requests.push(entry);
    if (leaked(entry.url) || leaked(entry.body)) report.errors.push('Answer marker in network request');
  });
  await ctx.route('**/*', route => {
    const req = route.request();
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method()) || /^mailto:/.test(req.url()) || /\/api\/do\/personal\/assistant/.test(req.url()) && req.method() !== 'GET') {
      report.blocked.push({ url: req.url(), method: req.method(), body: req.postData() || '' }); return route.abort();
    }
    return route.continue();
  });
  ctx.on('page', page => page.on('pageerror', error => report.errors.push(error.message)));
  return ctx;
}
async function disabledBoundary(page) {
  assert(await page.getByRole('button', { name: 'prepare my audit outline ↗', exact: true }).isDisabled());
  await page.getByText('Add the task you want to understand', { exact: true }).click();
  assert(await page.getByRole('textbox', { name: 'One recurring task', exact: true }).isDisabled());
  await page.keyboard.press('Enter');
  assert.equal(new URL(page.url()).search, '');
  assert.equal(await page.locator('.audit-shell form').count(), 0);
}
(async () => {
  await fs.mkdir(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE || undefined, headless: true });
  try {
    const noJS = await context(browser, { javaScriptEnabled: false, viewport: { width: 320, height: 900 } });
    const staticPage = await noJS.newPage();
    assert.equal((await staticPage.goto(origin + '/contact/audit')).status(), 200);
    await disabledBoundary(staticPage);
    assert(await staticPage.locator('noscript').isVisible());
    await staticPage.screenshot({ path: path.join(out, 'no-js.png'), fullPage: true });
    report.cases.push('actual server route: no-JS disabled controls and safe Enter'); await noJS.close();
    const delayed = await context(browser, { viewport: { width: 375, height: 900 } });
    let release; const gate = new Promise(resolve => { release = resolve; });
    await delayed.route('**/*.js*', async route => { await gate; await route.continue(); });
    const delayedPage = await delayed.newPage();
    await delayedPage.goto(origin + '/contact/audit', { waitUntil: 'commit' });
    await disabledBoundary(delayedPage);
    await delayedPage.screenshot({ path: path.join(out, 'delayed-hydration.png'), fullPage: true });
    release(); await delayedPage.waitForFunction(() => !document.querySelector('.audit-shell input[maxlength="300"]').disabled);
    report.cases.push('actual server route: withheld JS safe Enter, then hydration'); await delayed.close();
    for (const width of [1440, 375, 320]) {
      const ctx = await context(browser, { viewport: { width, height: 1000 }, reducedMotion: width === 320 ? 'reduce' : 'no-preference', acceptDownloads: true });
      const page = await ctx.newPage();
      assert.equal((await page.goto(origin + '/contact/audit')).status(), 200);
      assert.equal(await page.title(), 'Business audit | assembl');
      for (const selector of ['link[rel="canonical"]', 'meta[property="og:url"]']) {
        assert.equal(await page.locator(selector).getAttribute(selector.startsWith('link') ? 'href' : 'content'), 'https://www.assembl.co.nz/contact/audit');
      }
      assert.equal(await page.locator('meta[property="og:title"]').getAttribute('content'), 'Business audit | assembl');
      assert.equal(await page.locator('meta[name="twitter:title"]').getAttribute('content'), 'Business audit | assembl');
      assert.match(await page.locator('meta[name="robots"]').getAttribute('content'), /noindex.*nofollow/);
      assert.equal(await page.locator('meta[name="referrer"]').getAttribute('content'), 'no-referrer');
      assert.equal(await page.locator('.audit-header').count(), 0);
      assert.equal(await page.getByRole('navigation', { name: 'Primary', exact: true }).count(), 1);
      await page.getByText('Add the task you want to understand', { exact: true }).click();
      const answer = page.getByRole('textbox', { name: 'One recurring task', exact: true });
      await answer.fill(marker); await answer.press('Enter'); assert.equal(new URL(page.url()).search, '');
      await page.getByRole('radio', { name: 'Repeated admin', exact: true }).focus(); await page.keyboard.press('Space');
      await page.getByRole('checkbox', { name: 'Prepare a local snapshot from these answers. Nothing is submitted or saved on a server.', exact: true }).check();
      await page.getByRole('button', { name: 'prepare my audit outline ↗', exact: true }).focus(); await page.keyboard.press('Enter');
      const step = page.getByRole('textbox', { name: 'Suggested step 1', exact: true });
      await step.fill(marker + ' edited step');
      const downloadPending = page.waitForEvent('download');
      await page.getByRole('button', { name: 'download my outline', exact: true }).click();
      const download = await downloadPending; assert.equal(download.suggestedFilename(), 'assembl-diagnostic-outline.json');
      const saved = path.join(out, `outline-${width}.json`); await download.saveAs(saved);
      const data = JSON.parse(await fs.readFile(saved, 'utf8')); assert.equal(data.answers.task, marker); assert.equal(data.steps[0], marker + ' edited step');
      assert.equal(await page.getByRole('region', { name: 'Review email draft' }).count(), 0);
      await page.getByRole('button', { name: 'enquire about an audit', exact: true }).click();
      const open = page.getByRole('button', { name: 'Open email draft', exact: true }); assert(await open.isDisabled());
      const review = page.getByRole('checkbox', { name: 'I reviewed this exact brief and want to open it in my email app.', exact: true });
      await review.check(); assert(!(await open.isDisabled()));
      await step.fill(' '); assert.equal(await open.count(), 0); assert(await page.getByRole('button', { name: 'download my outline', exact: true }).isDisabled());
      await step.fill(marker + ' revised'); assert(await open.isDisabled()); await review.check(); assert(!(await open.isDisabled()));
      assert((await page.locator('.audit-email-preview').innerText()).includes(marker + ' revised'));
      // Do not click Open email draft: unit tests prove exact mailto encoding and admission.
      await page.getByRole('button', { name: 'Ask DO', exact: true }).focus(); await page.keyboard.press('Enter');
      assert(await page.getByRole('region', { name: 'DO drafting workspace', exact: true }).isVisible());
      assert(!(await page.getByRole('region', { name: 'DO drafting workspace', exact: true }).innerText()).includes(marker));
      await page.getByRole('button', { name: 'Close DO', exact: true }).click();
      assert(await page.getByRole('button', { name: 'Ask DO', exact: true }).evaluate(node => node === document.activeElement));
      assert.equal(await page.locator('.audit-shell').getByRole('combobox').count(), 0);
      assert(!/owner workspace|export exact private draft/i.test(await page.locator('.audit-shell').innerText()));
      await page.screenshot({ path: path.join(out, `audit-${width}.png`), fullPage: true });
      const overflow = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth, elements: [...document.querySelectorAll('body *')].map(node => ({ tag: node.tagName, cls: node.className, right: node.getBoundingClientRect().right, text: node.textContent?.slice(0,80) })).filter(node => node.right > innerWidth + 1) }));
      assert(overflow.scroll <= width + 1, JSON.stringify(overflow));
      const storage = await page.evaluate(() => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage }, cookie: document.cookie }));
      assert(!leaked(storage));
      await page.screenshot({ path: path.join(out, `audit-${width}.png`), fullPage: true });
      await page.reload(); await page.getByText('Add the task you want to understand', { exact: true }).click(); assert.equal(await answer.inputValue(), '');
      report.cases.push(`actual route ${width}: metadata, keyboard, download before contact, exact review invalidation, widget auth/availability, storage, refresh`);
      await ctx.close();
    }
    assert(report.requests.some(request => request.url.includes('/api/do/personal/assistant') && request.method === 'GET'), 'Inherited assistant availability path was not exercised');
    assert.equal(report.blocked.length, 0, 'Unexpected outbound mutation attempted');
    assert.equal(report.errors.length, 0, report.errors.join('; '));
    report.passed = true;
  } catch (error) { report.passed = false; report.failure = error.stack; process.exitCode = 1; }
  finally { await browser.close(); await fs.writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2)); console.log(JSON.stringify({ passed: report.passed, cases: report.cases, requests: report.requests.length, blocked: report.blocked.length, errors: report.errors, failure: report.failure })); }
})();
