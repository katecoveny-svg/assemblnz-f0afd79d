/* Fictional browser fixture only. No real Auth, provider or external action. */
const assert = require('node:assert/strict');
const { mkdirSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.ASSEMBL_PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.ASSEMBL_REVIEW_ORIGIN || 'http://127.0.0.1:3147';
if (!['127.0.0.1', 'localhost'].includes(new URL(origin).hostname)) throw new Error('Local review origin required.');
const output = process.env.ASSEMBL_REVIEW_OUTPUT || path.resolve('output/playwright/continuity-browser');
const checks = [];
const check = (label, condition) => { assert.ok(condition, label); checks.push(label); };
const selected = 'Fictional selected note: check the final picnic notice.';
async function save(page, request) {
  await page.getByLabel('Paste your request').fill(request);
  await page.getByLabel('Optional context').fill(selected);
  await page.getByRole('checkbox', { name: 'Include these notes in this task' }).check();
  await page.getByRole('checkbox').last().check();
  await page.getByRole('button', { name: 'Save one task', exact: true }).click();
  await page.getByRole('button', { name: 'Prepare editable worksheet', exact: true }).waitFor();
}
async function main() {
  mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.ASSEMBL_CHROMIUM_PATH ? { executablePath: process.env.ASSEMBL_CHROMIUM_PATH } : {}) });
  try {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
    // Fixture pages have no account credentials. Deny any remote request and use
    // explicit inactive API fixtures for reconnect checks, never hosted services.
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.origin !== new URL(origin).origin) return route.abort();
      if (url.pathname === '/api/do/continuity') return route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ durable: false, message: 'Cross-device storage is awaiting review.' }) });
      return route.continue();
    });
    let page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin + '/do/continue?fixture=1');
    await save(page, 'Prepare a fictional EA picnic follow-up.');
    const url = page.url();
    const id = new URL(url).searchParams.get('task');
    check('Save confirms one stable fixture task ID', Boolean(id));
    await page.getByRole('button', { name: 'Prepare editable worksheet', exact: true }).click();
    await page.getByLabel('Editable result').waitFor();
    check('Preparation is explicitly inert', (await page.getByLabel('Editable result').inputValue()).includes('no model called'));
    const edited = 'Hi Sam — please confirm the fictional pickup time before I make plans.';
    await page.getByLabel('Editable result').fill(edited);
    await page.getByRole('button', { name: 'Save edited result', exact: true }).click();
    await page.getByRole('status').filter({ hasText: 'ready to review' }).waitFor();
    check('Edited result keeps the same stable ID', new URL(page.url()).searchParams.get('task') === id);
    check('Phone layout has no horizontal overflow', await page.evaluate(() => innerWidth === document.documentElement.scrollWidth));
    await page.screenshot({ path: path.join(output, 'phone-result.png'), fullPage: true });
    await page.reload(); await page.getByLabel('Editable result').waitFor();
    check('Fresh reload retains edited result', await page.getByLabel('Editable result').inputValue() === edited);
    await page.close(); page = await context.newPage(); await page.goto(url); await page.getByLabel('Editable result').waitFor();
    check('Closed tab reopens same fixture and result', await page.getByLabel('Editable result').inputValue() === edited);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({ path: path.join(output, 'desktop-result.png'), fullPage: true });
    // Simulate a separate fixture client deleting the authoritative row. A
    // subsequent refresh must clear the previously displayed request/result.
    const retainedFixture = await page.evaluate(() => localStorage.getItem('assembl:do:continuity:fictional:v1'));
    await page.evaluate(() => localStorage.setItem('assembl:do:continuity:fictional:v1', '[]'));
    await page.getByRole('button', { name: 'Reopen / retry connection', exact: true }).click();
    await page.getByLabel('Paste your request').waitFor();
    check('Refresh after authoritative fixture deletion clears stale task/result', await page.getByLabel('Editable result').count() === 0 && await page.getByText('Prepare a fictional EA picnic follow-up.', { exact: true }).count() === 0);
    await page.evaluate(value => localStorage.setItem('assembl:do:continuity:fictional:v1', value), retainedFixture);
    await page.getByRole('button', { name: 'Work', exact: true }).click();
    await page.getByLabel('Paste your request').waitFor();
    check('Scope switch clears selected context and consent', await page.getByLabel('Optional context').inputValue() === '' && !(await page.getByRole('checkbox').last().isChecked()));
    await page.goto(url); await page.getByRole('button', { name: 'Revoke context permission', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Revoke context permission', exact: true }).click();
    await page.getByRole('status').filter({ hasText: 'permission revoked' }).waitFor();
    check('Revocation clears selected context and result', await page.getByText(selected, { exact: true }).count() === 0 && await page.getByLabel('Editable result').count() === 0);
    await page.getByRole('button', { name: 'New request', exact: true }).click();
    await save(page, 'Prepare a fictional cancellation test.');
    await page.getByRole('button', { name: 'Cancel task', exact: true }).click();
    await page.getByRole('status').filter({ hasText: 'cancelled' }).waitFor();
    check('Cancellation clears selected context', await page.getByText(selected, { exact: true }).count() === 0);
    await page.getByRole('button', { name: 'Leave fixture', exact: true }).click();
    await page.getByLabel('Paste your request').fill('Prepare a fictional offline retry test.');
    await page.getByRole('checkbox').last().check();
    await context.setOffline(true);
    await page.getByRole('button', { name: 'Save one task', exact: true }).click();
    check('Offline request is not submitted', (await page.getByRole('status').innerText()).includes('nothing submitted'));
    await context.setOffline(false);
    await page.getByRole('button', { name: 'Save one task', exact: true }).click();
    await page.getByRole('status').filter({ hasText: 'No new save confirmed' }).waitFor();
    check('Inactive transport retry preserves unsaved request', await page.getByLabel('Paste your request').inputValue() === 'Prepare a fictional offline retry test.');
    const denied = await browser.newContext();
    await denied.addInitScript(() => { Storage.prototype.setItem = function () { throw new DOMException('Storage unavailable', 'QuotaExceededError'); }; });
    const deniedPage = await denied.newPage(); await deniedPage.goto(origin + '/do/continue?fixture=1');
    await deniedPage.getByLabel('Paste your request').fill('Prepare a fictional storage failure test.');
    await deniedPage.getByRole('checkbox').last().check(); await deniedPage.getByRole('button', { name: 'Save one task', exact: true }).click();
    await deniedPage.getByRole('status').filter({ hasText: 'No new save confirmed' }).waitFor();
    check('Unavailable storage has no false saved ID', !new URL(deniedPage.url()).searchParams.has('task'));
    await denied.close();
    const expiry = await browser.newContext(); const expiryPage = await expiry.newPage(); const start = Date.now();
    await expiryPage.clock.install({ time: start }); await expiryPage.goto(origin + '/do/continue?fixture=1');
    await save(expiryPage, 'Prepare a fictional consent expiry test.');
    await expiryPage.clock.setSystemTime(start + 25 * 60 * 60 * 1000);
    await expiryPage.getByRole('button', { name: /Prepare a fictional consent expiry test/ }).click();
    await expiryPage.getByText('Permission expired', { exact: true }).first().waitFor();
    check('Reopen of expired cached task reads current storage and clears preparation', await expiryPage.getByText(selected, { exact: true }).count() === 0 && await expiryPage.getByRole('button', { name: 'Prepare editable worksheet', exact: true }).count() === 0);
    await expiry.close();
    check('Fixture flow has no application exceptions', errors.length === 0);
    const result = { passed: true, checkedAt: new Date().toISOString(), realCrossDeviceProven: false, authentication: 'none; fictional local fixture and inactive API response', checks };
    writeFileSync(path.join(output, 'results.json'), JSON.stringify(result, null, 2)); console.log(JSON.stringify(result, null, 2));
    await context.close();
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
