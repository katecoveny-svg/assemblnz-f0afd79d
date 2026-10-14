/* Browser proof for the preemptive Bills layer: what you pay, hunt for a better deal, the
 * sourced-research prefill and the Ask DO watch handoff, on desktop and a 375px phone.
 * The public offers route is answered by a fictional fixture so the proof is reproducible
 * and no price book, account, provider or external action is involved. */
const assert = require('node:assert/strict');
const { mkdirSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.ASSEMBL_PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.ASSEMBL_REVIEW_ORIGIN || 'http://127.0.0.1:3149';
if (!['127.0.0.1', 'localhost'].includes(new URL(origin).hostname)) throw new Error('Local review origin required.');
const output = process.env.ASSEMBL_REVIEW_OUTPUT || path.resolve('output/playwright/do-bills-preemptive');
const checks = [];
const check = (label, condition) => { assert.ok(condition, label); checks.push(label); console.log('PASS ' + label); };
const verified = new Date(Date.now() - 2 * 86_400_000).toISOString();
const stale = new Date(Date.now() - 90 * 86_400_000).toISOString();
const offers = category => ({
  category, live: true, lastVerified: verified, offers: [
    { id: 'fx-1', category, provider: 'Fixture Energy', planName: 'Flat', monthlyCost: 150, features: ['No fixed term', 'Prompt-pay pricing'], eligibilityNotes: 'Supply-address quote required.', sourceUrl: 'https://fixture.example/plans', sourceHost: 'fixture.example', lastVerified: verified, trustTier: 'A' },
    { id: 'fx-2', category, provider: 'Older Co', planName: 'Saver', monthlyCost: 200, features: [], eligibilityNotes: null, sourceUrl: 'https://older.example/plans', sourceHost: 'older.example', lastVerified: stale, trustTier: 'B' },
    { id: 'fx-3', category, provider: 'Dearer Co', planName: 'Premium', monthlyCost: 260, features: [], eligibilityNotes: null, sourceUrl: 'https://dearer.example/plans', sourceHost: 'dearer.example', lastVerified: verified, trustTier: 'A' },
  ],
});

async function device(browser, name, viewport) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 2, isMobile: viewport.width < 500, hasTouch: viewport.width < 500 });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.route('**/api/do/bills/offers*', route => {
    const category = new URL(route.request().url()).searchParams.get('category');
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(offers(category)) });
  });
  await page.goto(origin + '/do/bills', { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: 'What you pay' }).waitFor();
  check(name + ': what you pay is shown with the fictional yearly total', await page.getByText('a year across 3 services').isVisible());
  const power = page.locator('article', { hasText: 'Example Power' }).first();
  check(name + ': electricity card shows the monthly equivalent and the unmatched-provider label', (await power.innerText()).includes('224.50') && (await power.innerText()).includes('PROVIDER NOT MATCHED'));
  check(name + ': research link carries only the category and a rounded monthly figure', await power.getByRole('link', { name: /Research with sources/ }).getAttribute('href') === '/do/bills/compare?category=electricity&monthly=224.50');
  const watch = await power.getByRole('link', { name: 'Ask DO to watch this' }).getAttribute('href');
  check(name + ': watch goes through the reviewed Ask DO entry and forbids switching', watch.startsWith('/do/ask?q=Watch+my+electricity') && decodeURIComponent(watch).includes('Do not switch'));
  await page.screenshot({ path: path.join(output, name + '-what-you-pay.png'), fullPage: false });
  await power.getByRole('button', { name: 'Hunt for a better deal' }).click();
  await power.getByText('Fixture Energy · Flat').waitFor();
  const hunted = await power.innerText();
  check(name + ': cheaper offers are ranked by possible saving with source and verification date', hunted.indexOf('Fixture Energy') < hunted.indexOf('Older Co') && hunted.includes('source fixture.example') && hunted.includes('Advertised price, not a quote'));
  check(name + ': the stale offer is flagged and the dearer offer is not offered', hunted.includes('older than 45 days, check before acting') && !hunted.includes('Dearer Co'));
  check(name + ': possible saving is capped wording, not a promise', hunted.includes('Possible saving of up to') && !/guaranteed|will save/i.test(hunted));
  await page.screenshot({ path: path.join(output, name + '-hunt.png'), fullPage: false });
  await page.fill('input[aria-label="Minimum monthly difference in NZD"]', '60');
  await power.getByRole('button', { name: 'Check again' }).click();
  await power.getByText(/No advertised offer in the price book is at least/).waitFor();
  check(name + ': the person’s own threshold removes smaller differences', !(await power.innerText()).includes('Fixture Energy · Flat'));
  const noSwitch = await page.locator('button, a').evaluateAll(nodes => nodes.map(node => node.textContent.trim()).filter(text => /^(switch|cancel|pay)/i.test(text)));
  check(name + ': no switch, cancel or pay control exists', noSwitch.length === 0);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(name + ': no horizontal overflow', overflow <= 1);
  await page.getByRole('link', { name: /Research with sources/ }).first().click();
  await page.waitForURL(/\/do\/bills\/compare\?category=electricity&monthly=224\.50/);
  await page.getByText('Could this').waitFor();
  check(name + ': the research page is prefilled from the card', await page.locator('select').first().inputValue() === 'electricity' && await page.locator('input[type=number]').first().inputValue() === '224.50');
  await page.screenshot({ path: path.join(output, name + '-research-prefilled.png'), fullPage: false });
  check(name + ': no page or console errors', errors.length === 0);
  await context.close();
}

(async () => {
  mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.ASSEMBL_CHROMIUM_PATH || undefined });
  try {
    await device(browser, 'desktop', { width: 1366, height: 900 });
    await device(browser, 'phone', { width: 375, height: 812 });
  } finally { await browser.close(); }
  writeFileSync(path.join(output, 'checks.json'), JSON.stringify({ origin, at: new Date().toISOString(), checks }, null, 2));
  console.log(checks.length + ' checks passed');
})().catch(error => { console.error(error); process.exit(1); });
