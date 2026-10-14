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
  check(name + ': watch goes through the reviewed Ask DO entry and forbids switching', watch.startsWith('/do/ask?q=Watch+my+electricity') && new URLSearchParams(watch.slice(watch.indexOf('?'))).get('q').includes('Do not switch, cancel or contact anyone.'));
  await page.screenshot({ path: path.join(output, name + '-what-you-pay.png'), fullPage: false });
  await power.getByRole('button', { name: 'Hunt for a better deal' }).click();
  await power.getByText('Fixture Energy · Flat').waitFor();
  const hunted = await power.innerText();
  check(name + ': cheaper offers are ranked by possible saving with source and verification date', hunted.indexOf('Fixture Energy') < hunted.indexOf('Older Co') && hunted.includes('source fixture.example') && hunted.includes('Advertised price, not a quote'));
  check(name + ': the stale offer is flagged and the dearer offer is not offered', hunted.includes('older than 45 days, check before acting') && !hunted.includes('Dearer Co'));
  check(name + ': possible saving is capped wording, not a promise', hunted.includes('Possible saving of up to') && !/guaranteed|will save/i.test(hunted));
  await page.screenshot({ path: path.join(output, name + '-hunt.png'), fullPage: false });
  await page.fill('input[aria-label="Minimum monthly difference in NZD"]', '80');
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

  // Solar outlook under the electricity card: an estimate with versioned assumptions, never a quote.
  await page.goto(origin + '/do/bills', { waitUntil: 'networkidle' });
  const powerAgain = page.locator('article', { hasText: 'Example Power' }).first();
  await powerAgain.getByText('Consider solar?').click();
  const solar = await powerAgain.innerText();
  check(name + ': solar outlook shows size, cost, saving and payback ranges with assumptions and no promise', /\d(\.\d)? kW/.test(solar) && /installed cost/i.test(solar) && /possible saving a year/i.test(solar) && solar.includes('assumptions 2026-10-14') && !/guaranteed|will save/i.test(solar));
  await page.screenshot({ path: path.join(output, name + '-solar.png'), fullPage: false });

  // A bill from an email: read in the page, figures prefilled, nothing marked checked or paid.
  await page.getByRole('button', { name: 'Start with my own bills' }).click();
  await page.getByText('Add a bill from an email').click();
  await page.fill('input[name=emailFrom]', 'Contact Energy <noreply@contact.example>');
  await page.fill('input[name=emailSubject]', 'Your Contact Energy bill is ready');
  await page.fill('textarea[name=emailText]', 'Account number: 12345678\nBilling period: 1 September 2026 to 30 September 2026\nYou used 612 kWh this period.\nTotal amount due: $224.50\nDue date: 20 October 2026\nView your bill: https://contact.example/bills/abc123');
  await page.getByRole('button', { name: 'Read the bill' }).click();
  await page.getByText('READ FROM THE EMAIL · HIGH CONFIDENCE · NOT YET CHECKED').waitFor();
  const readingText = await page.locator('text=READ FROM THE EMAIL').locator('..').innerText();
  check(name + ': the email reading names the provider, total, due date, period and usage without account numbers or links', readingText.includes('Contact Energy') && readingText.includes('224.50') && readingText.includes('2026-10-20') && readingText.includes('612 kWh') && !/12345678|https?:|abc123/.test(readingText));
  await page.getByRole('button', { name: 'Use these figures in the form' }).click();
  check(name + ': the checked-bill form is prefilled but still needs the reference and the checked tick', await page.locator('input[name=payee]').inputValue() === 'Contact Energy' && await page.locator('input[name=amount]').inputValue() === '224.50' && await page.locator('input[name=dueOn]').inputValue() === '2026-10-20' && await page.locator('input[name=reference]').inputValue() === '' && !(await page.locator('input[name=checked]').isChecked()));
  await page.screenshot({ path: path.join(output, name + '-email-bill.png'), fullPage: false });

  // Fuel watch: weekly figure from a fixture, the person's own tank, a plain answer and no purchase.
  await page.route('**/api/do/fuel', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ checkedAt: new Date().toISOString(), publishedDate: new Date(Date.now() - 86_400_000).toISOString().slice(0, 10), source: 'mbie_weekly', prices: { '91': 2.85, '95': 3.05, diesel: 2.4 } }) }));
  await page.goto(origin + '/do/fuel', { waitUntil: 'networkidle' });
  await page.getByText('MBIE weekly national average · published').waitFor();
  check(name + ': fuel watch gives an answer with the price source and date', ['Fill up today', 'Top up now', 'Wait', 'No price yet'].some(label => page.getByRole('heading', { name: label })) && (await page.locator('#main-content').innerText()).includes('91 $2.85'));
  await page.fill('input[name=price]', '2.69');
  await page.getByRole('button', { name: 'Add this price' }).click();
  await page.getByText('Pump price I saw · Regular 91', { exact: true }).waitFor();
  const fuelText = await page.locator('#main-content').innerText();
  check(name + ': a recorded pump price is used ahead of the national average', fuelText.includes('$2.69/L'));
  check(name + ': fuel watch asks DO to watch without buying, and has no buy control', (await page.getByRole('link', { name: 'Ask DO to watch fuel' }).getAttribute('href')).startsWith('/do/ask?q=Watch+Regular+91') && !/\b(buy|purchase) now\b/i.test(fuelText));
  const fuelOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(name + ': fuel watch has no horizontal overflow', fuelOverflow <= 1);
  await page.screenshot({ path: path.join(output, name + '-fuel.png'), fullPage: false });
  if (errors.length) console.error('ERRORS', JSON.stringify(errors, null, 2));
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
