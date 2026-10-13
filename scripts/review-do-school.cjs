/* Fictional-only browser proof against the built app. Never connects a provider. */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require(process.env.ASSEMBL_PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.ASSEMBL_REVIEW_ORIGIN || 'http://localhost:3138';
const output = process.env.ASSEMBL_REVIEW_OUTPUT || 'output/playwright/do-school';
assert(['localhost', '127.0.0.1'].includes(new URL(origin).hostname), 'Local synthetic proof only');
async function main() {
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.ASSEMBL_CHROMIUM_PATH || undefined, headless: true });
  const report = { classification: 'Fictional school route proof; no live provider or account', origin, viewports: [], blockedNonlocal: [], errors: [] };
  let requestCount = 0;
  try {
    for (const width of [375, 320, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      const forbidden = [];
      await context.route('**/*', async route => {
        const request = route.request(), url = new URL(request.url());
        if (url.origin !== origin) { report.blockedNonlocal.push(url.origin); return route.abort(); }
        if (url.pathname === '/api/do/family/connection' && request.method() === 'GET') return route.fulfill({ json: { configured: false, signedIn: false, connected: false } });
        if (url.pathname.startsWith('/api/') && url.pathname !== '/api/do/family/school-preview') { forbidden.push(url.pathname); return route.abort(); }
        if (url.pathname === '/api/do/family/school-preview') {
          const payload = request.postDataJSON();
          assert(payload.senders.every(s => ['office@harbour.example', 'office@hill.example'].includes(s)));
          assert.deepEqual(Object.keys(payload).sort(), ['confirmed', 'days', 'scenario', 'senders']);
        }
        return route.continue();
      });
      const page = await context.newPage();
      page.on('pageerror', e => report.errors.push(e.message));
      await page.goto(`${origin}/do/family`, { waitUntil: 'networkidle' });
      const preview = page.getByRole('region', { name: 'What changed at school?' });
      await preview.getByText('Fictional preview', { exact: true }).waitFor();
      assert.match(await preview.locator('.school-boundary').innerText(), /separate live service.*Pipedream.*TypeSafe.*OpenAI/);
      assert.equal(await page.locator('.do-utility-dock').count(), 0);
      assert.equal(await page.locator('[data-do-companion]').count(), 0);
      // Simulate the real companion host surviving SPA navigation from another route.
      await page.evaluate(() => { const host = document.createElement('div'); host.dataset.doCompanion = ''; const root = host.attachShadow({ mode: 'open' }); root.innerHTML = '<button style="position:fixed;inset:0;z-index:2147483000">Prior route companion</button>'; document.body.append(host); });
      assert.equal(await page.locator('[data-do-companion]').evaluate(e => getComputedStyle(e).display), 'none');
      await preview.getByRole('checkbox', { name: /For this fictional example/ }).check();
      const compare = preview.getByRole('button', { name: 'Compare sample notices', exact: true });
      async function prepare(scenario) {
        // Exercise the real six-per-minute limiter without disabling it.
        if (requestCount && requestCount % 6 === 0) await new Promise(resolve => setTimeout(resolve, 60000));
        requestCount++;
        await preview.getByLabel('Sample notice').selectOption(scenario);
        const response = page.waitForResponse(r => r.url() === `${origin}/api/do/family/school-preview`);
        await compare.click();
        const res = await response; assert.equal(res.status(), 200);
        const data = await res.json(); assert.equal(data.synthetic, true); assert.equal(data.stored, false); assert.equal(data.externalActions, false);
        await preview.getByText(/items prepared for review/).waitFor();
        return data;
      }
      await prepare('revised');
      const agenda = preview.getByRole('region', { name: 'School and calendar agenda' });
      await agenda.getByText(/no scheduled job or notification/).waitFor();
      assert.match(await agenda.innerText(), /Possible calendar conflict/);
      assert(await agenda.getByRole('button', { name: 'Review calendar draft', exact: true }).first().isDisabled());
      await agenda.getByRole('button', { name: 'Review calendar draft', exact: true }).nth(1).click();
      await agenda.getByText('reviewed · no calendar write', { exact: true }).waitFor();
      await agenda.getByLabel('Agenda view').selectOption('1');
      await agenda.getByLabel('Agenda starting').selectOption('2026-10-20');
      await agenda.getByText(/Moved out of this agenda window/).waitFor();
      await agenda.getByLabel('Agenda view').selectOption('7');
      await agenda.getByLabel('Agenda starting').selectOption('2026-10-19');
      assert.match(await agenda.innerText(), /proposed · no calendar write/);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await agenda.screenshot({ path: path.join(output, `school-agenda-${width}.png`) });
      const exam = preview.locator('article').filter({ has: page.getByRole('heading', { name: 'Mathematics exam', exact: true }) });
      assert.match(await exam.innerText(), /20\/10\/2026/); assert.match(await exam.innerText(), /22\/10\/2026/);
      const review = exam.getByRole('button', { name: 'Mark draft reviewed' });
      await review.scrollIntoViewIfNeeded();
      // Hit-test the actual control, including any fixed/shadow-host overlays.
      assert(await review.evaluate(e => { const r = e.getBoundingClientRect(); return e.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)); }));
      await review.click(); await exam.getByText('Reviewed draft · no external action', { exact: true }).waitFor();
      // A source decision remounts dependent draft state, even within one briefing revision.
      assert.equal(await agenda.getByText('reviewed · no calendar write', { exact: true }).count(), 0);
      await agenda.getByRole('button', { name: 'Review calendar draft', exact: true }).nth(1).click();
      await agenda.getByText('reviewed · no calendar write', { exact: true }).waitFor();
      await preview.locator('article').nth(1).getByRole('button', { name: 'Dismiss proposal' }).click();
      await agenda.getByText('dismissed · no calendar write', { exact: true }).waitFor();
      assert.equal(await agenda.getByText('reviewed · no calendar write', { exact: true }).count(), 0);
      assert(await agenda.getByRole('button', { name: 'Review calendar draft', exact: true }).nth(1).isDisabled());
      await agenda.getByLabel('Agenda view').selectOption('1');
      await agenda.getByLabel('Agenda starting').selectOption('2026-10-21');
      await agenda.getByText('dismissed · no calendar write', { exact: true }).waitFor();
      assert(await agenda.getByRole('button', { name: 'Review calendar draft', exact: true }).first().isDisabled());

      await preview.getByLabel('Look back').selectOption('7');
      assert.equal(await preview.locator('article').count(), 0);
      await prepare('baseline-conflict');
      // Dismissal before calendar review is blocked too.
      await preview.locator('article').nth(1).getByRole('button', { name: 'Dismiss proposal' }).click();
      await agenda.getByText('dismissed · no calendar write', { exact: true }).waitFor();
      assert(await agenda.getByRole('button', { name: 'Review calendar draft', exact: true }).nth(1).isDisabled());
      assert.equal(await exam.getByRole('button', { name: 'Mark draft reviewed' }).isDisabled(), true);
      await exam.getByText('Inspect earlier and current source rows', { exact: true }).click();
      for (const [filename, date] of [['harbour-original', '20/10/2026'], ['harbour-prior-conflict', '21/10/2026']]) {
        const link = exam.locator(`.school-source-review a[href="/do/school-fixtures/${filename}.pdf#page=1"]`);
        await link.scrollIntoViewIfNeeded(); assert(await link.isVisible());
        assert.match(await link.locator('..').innerText(), new RegExp(date));
        const pdf = await context.request.get(`${origin}/do/school-fixtures/${filename}.pdf`);
        assert.equal(pdf.status(), 200); assert.equal((await pdf.body()).subarray(0, 4).toString(), '%PDF');
      }
      assert.equal(await exam.locator('.school-source-review a').count(), 3);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await exam.screenshot({ path: path.join(output, `baseline-evidence-${width}.png`) });
      await preview.scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(output, `baseline-conflict-${width}.png`), fullPage: true });
      if (width === 375) {
        for (const scenario of ['duplicate', 'conflict', 'missing', 'stale', 'unavailable']) {
          const data = await prepare(scenario);
          if (scenario === 'duplicate') assert.equal(data.brief.cards.length, 2);
          else if (scenario === 'unavailable') assert.match(data.brief.notices.join(), /unavailable/);
          else assert(await exam.getByRole('button', { name: 'Mark draft reviewed' }).isDisabled());
        }
        await page.reload({ waitUntil: 'networkidle' }); assert.equal(await preview.locator('article').count(), 0);
      }
      await preview.getByRole('button', { name: 'Clear preview' }).click(); assert.equal(await preview.locator('article').count(), 0);
      assert.deepEqual(forbidden, [], 'No live/model API may be requested');
      report.viewports.push({ width, baselineConflictSources: 2, currentSources: 1, approvalBlocked: true, agendaDailyWeekly: true, calendarClash: true, cancellationDraftReview: true, sourceDismissalInvalidatesCalendar: true, reviewDismissClear: true, inputInvalidation: true, noHorizontalOverflow: true, noShellOverlap: true });
      await context.close();
    }
    assert.deepEqual(report.errors, []);
    report.status = 'passed';
  } finally {
    await browser.close();
    await fs.writeFile(path.join(output, 'school-browser-results.json'), JSON.stringify(report, null, 2));
  }
  console.log(JSON.stringify(report, null, 2));
}
main().catch(e => { console.error(e); process.exitCode = 1; });
