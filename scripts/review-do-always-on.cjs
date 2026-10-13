/* Browser proof for Personal DO wake-ups. Fictional intercepted API fixtures only: no account,
 * database, provider or worker is touched. The real executor is covered by worksheet.test.ts and
 * the database contract by scripts/test-do-wakeups-sql.cjs. */
const assert = require('node:assert/strict');
const { mkdirSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.ASSEMBL_PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.ASSEMBL_REVIEW_ORIGIN || 'http://127.0.0.1:3147';
if (!['127.0.0.1', 'localhost'].includes(new URL(origin).hostname)) throw new Error('Local review origin required.');
const output = process.env.ASSEMBL_REVIEW_OUTPUT || path.resolve('output/playwright/do-always-on');
const checks = [];
const check = (label, condition) => { assert.ok(condition, label); checks.push(label); console.log('PASS ' + label); };
const owner = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', id = '11111111-1111-4111-8111-111111111111';

async function journey(browser, viewport, name) {
  const context = await browser.newContext({ viewport, hasTouch: viewport.width < 500, serviceWorkers: 'block' });
  const now = new Date(), week = new Date(Date.now() + 7 * 864e5).toISOString(), soon = new Date(Date.now() + 36e5).toISOString();
  const state = { workspaceKey: owner, storage: { available: true }, wakeups: { enabled: true }, worker: { configured: true, mode: 'worksheet', lastSeenAt: now.toISOString() }, runs: [],
    responsibilities: [{ id, title: 'Prepare my day', goal: 'Prepare a short daily brief from my notes.', notes: 'Fictional fixture: proposal due Friday. Waiting on Sam for the quote.', timezone: 'Pacific/Auckland', local_hour: 7, active: false, consent_until: '-infinity', next_run_at: 'infinity', revision: 1, updated_at: now.toISOString(), cadence: 'daily', weekday: null, run_once_at: null }] };
  const posts = [], runs = [];
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin !== new URL(origin).origin) return route.abort();
    const json = body => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    if (url.pathname === '/api/do/personal') {
      if (route.request().method() === 'GET') return json(state);
      const p = route.request().postDataJSON(); posts.push(p);
      const item = state.responsibilities[0];
      if (p.action === 'schedule') { Object.assign(item, { cadence: p.cadence, weekday: p.weekday ?? null, local_hour: p.localHour, timezone: p.timezone, run_once_at: p.runOnceAt ?? null, active: true, consent_until: week, next_run_at: p.cadence === 'manual' ? 'infinity' : p.cadence === 'once' ? p.runOnceAt : soon }); return json({ schedule: { id, revision: item.revision, cadence: p.cadence, active: true, consentUntil: week, nextRunAt: item.next_run_at } }); }
      if (p.action === 'pause') { item.active = false; item.revision++; }
      return json({ ok: true });
    }
    if (url.pathname === '/api/do/personal/run') {
      const p = route.request().postDataJSON(); runs.push(p);
      state.runs.unshift({ id: `2222222${runs.length}-2222-4222-8222-222222222222`, responsibility_id: id, revision: state.responsibilities[0].revision, status: 'needs_review', trigger: p.note ? 'message' : 'manual', note: p.note ?? null, output: `Fictional fixture worksheet · DO woke up ${p.note ? 'for your note' : 'because you asked'} · no model called\n\nThis week\n- Fictional fixture: proposal due Friday.\n\nWaiting on someone else\n- Waiting on Sam for the quote.`, evidence: { method: 'worksheet', model: null, provider: 'none', trigger: p.note ? 'message' : 'manual', note: p.note ?? null, notesUpdatedAt: now.toISOString(), externalAction: 'none' }, started_at: new Date().toISOString(), finished_at: new Date().toISOString() });
      return json({ claimed: true, published: true });
    }
    return route.continue();
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(`${name}: ${error.message}`));
  const shot = label => page.screenshot({ path: path.join(output, `${name}-${label}.jpg`), type: 'jpeg', quality: 70, fullPage: true });
  await page.goto(origin + '/do/personal', { waitUntil: 'networkidle' });
  await page.getByText('Ongoing responsibilities', { exact: true }).click();
  check(`${name}: a saved responsibility starts with wake-ups off`, await page.getByText('Wake-ups off', { exact: true }).isVisible());
  const wake = page.getByRole('button', { name: 'Wake DO now for Prepare my day' });
  check(`${name}: DO cannot be woken while wake-ups are off`, await wake.isDisabled());
  await page.getByRole('button', { name: 'Turn wake-ups on', exact: true }).click();
  const form = page.getByRole('form', { name: 'Wake-ups for Prepare my day' });
  await form.getByLabel('How often').selectOption('weekly');
  check(`${name}: weekly asks for a day`, await form.getByLabel('Which day').isVisible());
  await form.getByLabel('Which day').selectOption('5');
  await form.getByLabel('At what hour').selectOption('7');
  const submit = form.getByRole('button', { name: 'Turn wake-ups on' });
  check(`${name}: wake-ups need their own consent`, await submit.isDisabled());
  await shot('schedule-form');
  await form.getByRole('checkbox').check();
  await submit.click();
  await page.getByText('Every Friday at 07:00 (Pacific/Auckland)', { exact: true }).waitFor();
  const schedule = posts.find(p => p.action === 'schedule');
  check(`${name}: the schedule is sent as a separate consented request with the reopened revision`, schedule && schedule.cadence === 'weekly' && schedule.weekday === 5 && schedule.localHour === 7 && schedule.consent === true && schedule.expectedRevision === 1 && !('runOnceAt' in schedule));
  check(`${name}: the next wake-up and permission end are shown`, await page.getByText(/Next .*Permission until/).isVisible());
  check(`${name}: no notes were re-sent by scheduling`, !('notes' in schedule));
  await shot('scheduled');
  await wake.click();
  await page.getByText('DRAFT · REVIEW NEEDED', { exact: true }).waitFor();
  check(`${name}: waking DO now sends only the id`, runs.length === 1 && runs[0].id === id && !('note' in runs[0]));
  check(`${name}: the draft says why DO woke up and that no model was called`, await page.getByText('Woke up because you asked · worksheet, no model called', { exact: true }).isVisible());
  check(`${name}: sharing stays blocked until review`, await page.getByRole('button', { name: 'Share reviewed draft' }).first().isDisabled());
  await page.getByLabel('Wake DO with a note').fill('Focus on the quote from Sam');
  await page.getByRole('button', { name: 'Send the note' }).click();
  await page.getByText('Woke up for your note · “Focus on the quote from Sam” · worksheet, no model called', { exact: true }).waitFor();
  check(`${name}: a note wakes DO with the note attached`, runs.length === 2 && runs[1].note === 'Focus on the quote from Sam');
  await shot('drafts');
  await page.getByRole('button', { name: 'Change wake-ups', exact: true }).click();
  await form.getByLabel('How often').selectOption('once');
  check(`${name}: a one-off wake-up asks for a local moment`, await form.getByLabel('When (your local time)').isVisible() && !(await form.getByLabel('Which day').isVisible()));
  await form.getByLabel('When (your local time)').fill('2026-10-15T16:00');
  await form.getByRole('checkbox').check();
  await form.getByRole('button', { name: 'Update wake-ups' }).click();
  await page.getByText(/^Once, /).waitFor();
  const once = posts.filter(p => p.action === 'schedule').at(-1);
  check(`${name}: the one-off moment is sent as an instant in the owner's zone`, once.cadence === 'once' && once.runOnceAt === '2026-10-15T03:00:00.000Z' && !('weekday' in once));
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await page.getByText('Wake-ups off', { exact: true }).waitFor();
  check(`${name}: pausing turns wake-ups off and disables waking`, await wake.isDisabled());
  check(`${name}: no horizontal overflow`, (await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) === 0);
  check(`${name}: no uncaught page errors`, errors.length === 0);
  await context.close();
}

async function main() {
  mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.ASSEMBL_CHROMIUM_PATH ? { executablePath: process.env.ASSEMBL_CHROMIUM_PATH } : {}) });
  try {
    await journey(browser, { width: 1440, height: 900 }, 'desktop');
    await journey(browser, { width: 375, height: 812 }, 'phone');
    writeFileSync(path.join(output, 'results.json'), JSON.stringify({ checkedAt: new Date().toISOString(), origin, apiMode: 'fictional intercepted fixtures', hostedAuth: false, worker: false, checks }, null, 2));
    console.log(`${checks.length} browser checks passed`);
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
