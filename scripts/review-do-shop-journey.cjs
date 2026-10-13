/* Browser proof for the shop journey. No real Auth, retailer, provider or external action:
 * retailer links are only inspected, never followed, and the continuity route is a fixture. */
const assert = require('node:assert/strict');
const { mkdirSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.ASSEMBL_PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.ASSEMBL_REVIEW_ORIGIN || 'http://127.0.0.1:3147';
if (!['127.0.0.1', 'localhost'].includes(new URL(origin).hostname)) throw new Error('Local review origin required.');
const output = process.env.ASSEMBL_REVIEW_OUTPUT || path.resolve('output/playwright/do-shop-journey');
const checks = [];
const check = (label, condition) => { assert.ok(condition, label); checks.push(label); console.log('PASS ' + label); };

async function journey(browser, viewport, name, syncEnabled) {
  const context = await browser.newContext({ viewport });
  const kept = [];
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin !== new URL(origin).origin) return route.abort();
    if (url.pathname === '/api/do/continuity') {
      if (route.request().method() === 'GET') return route.fulfill({ status: syncEnabled ? 200 : 401, contentType: 'application/json', body: JSON.stringify(syncEnabled ? { tasks: [], access: { scope: 'personal', enabled: true, expiresAt: null }, durable: true, storage: 'database', workspaceKey: 'fixture-owner' } : { error: 'auth_required', durable: false }) });
      kept.push(route.request().postDataJSON());
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ task: { id: kept[0].id }, durable: true, storage: 'database', workspaceKey: 'fixture-owner' }) });
    }
    return route.continue();
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(`${name}: ${error.message}`));
  const shot = label => page.screenshot({ path: path.join(output, `${name}-${label}.jpg`), type: 'jpeg', quality: 70, fullPage: viewport.width < 500 });
  await page.goto(origin + '/do/shop');
  await page.getByLabel('Your brief').fill('Dinners for 4 for 3 nights, budget $120. We have rice. No nuts. Kids hate mushrooms.');
  await page.getByRole('button', { name: 'Plan the dinners' }).click();
  await page.getByText('3 nights, swap any you like').waitFor();
  check(`${name}: brief becomes a plan with the right people, nights and budget`, await page.getByText('4 people').isVisible() && await page.getByText('budget $120.00').isVisible());
  check(`${name}: unrecognised words are shown, not silently used`, await page.getByText('Not used: “Kids hate mushrooms”').isVisible());
  await shot('plan');
  const first = await page.locator('.shop-night strong').first().textContent();
  await page.getByRole('button', { name: 'Swap night 1' }).click();
  check(`${name}: swapping changes the dinner`, (await page.locator('.shop-night strong').first().textContent()) !== first);
  check(`${name}: pantry row pre-filled from “we have rice”`, (await page.getByLabel('Item 1 name').inputValue()) === 'Rice');
  await page.getByLabel('Item 1 quantity').fill('1000');
  await page.getByLabel('Confirm item 1').check();
  await page.getByRole('checkbox', { name: 'I reviewed my pantry' }).check();
  await page.getByText('By aisle, with a rough estimate').waitFor();
  const aisles = await page.locator('.shop-aisle h3').allTextContents();
  check(`${name}: list is grouped by aisle in store order`, aisles[0] === 'produce' && aisles.length >= 3);
  check(`${name}: rice is deducted from the list`, (await page.locator('.shop-aisle li', { hasText: 'Rice' }).count()) === 0);
  check(`${name}: estimate is compared against the budget`, await page.getByText(/against your \$120\.00 budget/).isVisible());
  await shot('list');
  const links = page.locator('.shop-links a');
  check(`${name}: handoff links open the retailer's own search in a new tab`, (await links.count()) > 3 && (await links.first().getAttribute('href')).startsWith('https://www.woolworths.co.nz/shop/searchproducts?search=') && (await links.first().getAttribute('target')) === '_blank');
  await page.getByLabel('Supermarket').selectOption('new-world');
  check(`${name}: switching supermarket switches every link`, (await links.first().getAttribute('href')).startsWith('https://www.newworld.co.nz/'));
  const keep = page.getByRole('button', { name: 'Keep as a DO task' });
  if (syncEnabled) { await keep.click(); await page.getByText('Kept as a DO task on your account.').waitFor(); check(`${name}: list is kept as a task through the continuity contract`, kept.length === 1 && kept[0].action === 'save' && kept[0].request.startsWith('Shopping list · New World')); }
  else check(`${name}: keeping is disabled when signed out, with a reason`, await keep.isDisabled());
  await page.getByRole('checkbox', { name: 'I checked the quantities, swaps and allergen flags' }).check();
  await page.getByRole('button', { name: 'Save a prepared receipt' }).click();
  await page.getByText('prepared · nothing ordered').waitFor();
  check(`${name}: receipt says prepared, never ordered`, await page.getByText('external action: none').isVisible());
  await shot('receipt');
  await page.getByLabel('Night 2 servings').fill('6');
  check(`${name}: a later edit invalidates the receipt`, (await page.getByText('prepared · nothing ordered').count()) === 0);
  check(`${name}: no horizontal overflow`, (await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) === 0);
  check(`${name}: no uncaught page errors`, errors.length === 0);
  await context.close();
}

async function main() {
  mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.ASSEMBL_CHROMIUM_PATH ? { executablePath: process.env.ASSEMBL_CHROMIUM_PATH } : {}) });
  try {
    await journey(browser, { width: 1440, height: 900 }, 'desktop', true);
    await journey(browser, { width: 375, height: 812 }, 'phone', false);
    writeFileSync(path.join(output, 'results.json'), JSON.stringify({ checkedAt: new Date().toISOString(), origin, realRetailer: false, hostedAuth: false, checks }, null, 2));
    console.log(`${checks.length} browser checks passed`);
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
