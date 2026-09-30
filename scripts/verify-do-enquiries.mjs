// Browser interaction proof with clearly fictional API fixtures. No real send.
// Use the workspace's installed Playwright; no application dependency is added.
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
const require = createRequire(import.meta.url);
const root = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
const { chromium } = root ? require(`${root}/playwright`) : require('playwright');
// A managed workspace may isolate network/process namespaces between calls.
// Start the dev server and browser in the same invocation when requested.
const production = process.env.DO_TEST_PRODUCTION === 'true';
const dev = process.env.DO_TEST_START_SERVER === 'true' ? spawn(process.execPath, ['node_modules/next/dist/bin/next', ...(production ? ['start'] : ['dev', '--webpack']), '--hostname', '127.0.0.1', '--port', production ? '3001' : '3000'], { stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' } }) : null;
let devOutput = '';
if (dev) {
  dev.stdout.on('data', chunk => { devOutput += chunk; });
  dev.stderr.on('data', chunk => { devOutput += chunk; });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Dev server did not become ready: ${devOutput}`)), 30_000);
    const check = chunk => { if (String(chunk).includes('Ready in')) { clearTimeout(timer); resolve(); } };
    dev.stdout.on('data', check);
    dev.once('exit', code => { clearTimeout(timer); reject(new Error(`Dev server exited ${code}: ${devOutput}`)); });
  });
}
const browser = await chromium.launch({ headless: true, ...(process.env.DO_TEST_CHROMIUM ? { executablePath: process.env.DO_TEST_CHROMIUM } : {}) });
const context = await browser.newContext({ viewport: { width: 1440, height: 1050 }, reducedMotion: 'reduce' });
const page = await context.newPage();
page.setDefaultTimeout(20_000);
page.setDefaultNavigationTimeout(120_000);
const pageErrors = []; page.on('pageerror', e => pageErrors.push(e.message));
const origin = process.env.DO_TEST_ORIGIN ?? (production ? 'http://127.0.0.1:3001' : 'http://127.0.0.1:3000');
const output = 'docs/evidence/do-enquiries-20260930';
await mkdir(output, { recursive: true });
const owner = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const id = '11111111-1111-4111-8111-111111111111';
const revision = '22222222-2222-4222-8222-222222222222';
const jobs = [];
const calls = [];
try {
  await page.goto(`${origin}/do/enquiries`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('link', { name: 'Sign in to continue', exact: true }).waitFor({ timeout: 120_000 });
  console.log('Guest sign-in boundary rendered.');
  assert.match(await page.getByRole('link', { name: 'Sign in to continue', exact: true }).getAttribute('href'), /redirect=%2Fdo%2Fenquiries/);
  await page.screenshot({ path: `${output}/signed-out.png`, fullPage: true });
  await page.route('**/api/do/enquiries', async route => {
    const request = route.request();
    if (request.method() === 'POST') {
      const input = request.postDataJSON(); calls.push(input);
      assert.equal(request.headers()['x-do-workspace'], owner);
      if (input.action === 'receive') jobs.push({ ...input, id, owner_id: owner, parent_id: null, revision, subject: 'Your enquiry to assembl', body: 'Kia ora Aroha,\n\nThanks for getting in touch. What would a useful next step look like for you?\n\nThe assembl team', status: 'pending', received_at: '2026-09-30T03:00:00Z', approved_at: null, sent_at: null, answered_at: null, booked_at: null, provider_id: null, evidence: [{ kind: 'received', at: '2026-09-30T03:00:00Z', source: 'fictional_browser_fixture' }] });
      if (input.action === 'edit') { jobs[0].subject = input.subject; jobs[0].body = input.body; jobs[0].revision = '33333333-3333-4333-8333-333333333333'; }
      if (input.action === 'approve') {
        assert.equal(input.confirmSend, true); assert.equal(input.revision, jobs[0].revision);
        jobs[0].status = 'sent'; jobs[0].approved_at = '2026-09-30T03:01:00Z'; jobs[0].sent_at = '2026-09-30T03:01:01Z'; jobs[0].provider_id = 'fictional-browser-receipt';
        jobs[0].evidence.push({ kind: 'finish', at: '2026-09-30T03:01:01Z', source: 'fictional_browser_fixture', detail: 'Simulated provider acceptance for UI verification. No email sent.' });
      }
      if (input.action === 'answered') jobs[0].answered_at = '2026-09-30T03:03:00Z';
      return route.fulfill({ json: { job: jobs[0] } });
    }
    await route.fulfill({ json: { workspaceKey: owner, jobs, funnel: { received: jobs.length, approved: jobs.filter(j => j.approved_at).length, sent: jobs.filter(j => j.sent_at).length, answered: jobs.filter(j => j.answered_at).length, booked: 0 }, window: 'Fictional browser fixture · no live data', sendingReady: true, sender: 'front@assembl.co.nz', connection: null, workerLastSeen: null } });
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  console.log('Loaded fictional API fixture.');
  await page.getByLabel('Name', { exact: true }).fill('Aroha · fictional test');
  await page.getByLabel('Reply to', { exact: true }).fill('aroha@example.invalid');
  await page.getByLabel('The enquiry').fill('Can you help with our customer enquiry follow-up? Fictional browser test.');
  await page.getByRole('button', { name: 'Prepare a reply', exact: true }).click();
  await page.getByRole('button', { name: 'Approve & send email', exact: true }).waitFor();
  console.log('Fictional draft prepared.');
  assert.equal(await page.getByRole('button', { name: 'Approve & send email', exact: true }).isEnabled(), false);
  await page.getByLabel('Your reply', { exact: true }).fill('Kia ora Aroha,\n\nHere is the fictional reply reviewed for this browser test.\n\nThe assembl team');
  console.log('Edited the draft.');
  assert.equal(await page.getByRole('button', { name: 'Approve & send email', exact: true }).count(), 0);
  await page.getByRole('button', { name: 'Save changes for review', exact: true }).click();
  console.log('Saved the reviewed draft.');
  await page.getByRole('button', { name: 'Approve & send email', exact: true }).waitFor();
  await page.screenshot({ path: `${output}/desktop-review-fictional.png`, fullPage: true, animations: 'disabled' });
  await page.setViewportSize({ width: 375, height: 812 });
  const overflow = await page.evaluate(() => ({ viewport: window.innerWidth, width: document.documentElement.scrollWidth, elements: [...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > window.innerWidth + 1; }).map(e => ({ tag: e.tagName, className: String(e.className), right: e.getBoundingClientRect().right })).slice(0,12) }));
  assert.ok(overflow.width <= overflow.viewport, JSON.stringify(overflow));
  await page.getByLabel('I have checked the recipient and this reply. Send it now.').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${output}/mobile-review-fictional.png`, fullPage: true });
  await page.getByLabel('I have checked the recipient and this reply. Send it now.').check();
  await page.getByRole('button', { name: 'Approve & send email', exact: true }).click();
  await page.getByText('fictional-browser-receipt', { exact: true }).waitFor();
  assert.equal(calls.filter(c => c.action === 'approve').length, 1);
  assert.equal(await page.getByRole('button', { name: 'Approve & send email', exact: true }).count(), 0);
  await page.getByLabel('What confirms the outcome?').fill('Fictional reply reference 123');
  await page.getByRole('button', { name: 'Record reply', exact: true }).click();
  await page.getByRole('button', { name: 'Reply recorded', exact: true }).waitFor();
  await page.screenshot({ path: `${output}/mobile-evidence-fictional.png`, fullPage: true });
  assert.equal(await page.locator('[data-nextjs-dialog]').count(), 0);
  assert.deepEqual(pageErrors, []);
  await writeFile(`${output}/browser-check.json`, JSON.stringify({ result: 'passed', mode: 'fictional API fixtures; no external email', checks: ['real signed-out state and return link', 'mobile width 375 without overflow', 'draft edit invalidates review', 'explicit checkbox required', 'approval uses saved revision and current owner', 'one send request', 'provider receipt visible', 'outcome evidence and counter', 'no page errors'], calls: calls.map(c => c.action) }, null, 2));
  console.log('PASS: guest state and fictional desktop/mobile review, approval, receipt and outcome flow; no real email sent.');
} catch (error) {
  await page.screenshot({ path: `${output}/failed-browser-state.png`, fullPage: true }).catch(() => {});
  console.error((await page.locator('body').innerText().catch(() => '')).slice(0,3500));
  throw error;
} finally { await browser.close(); dev?.kill('SIGTERM'); if (dev) await writeFile('/tmp/assembl-enquiry-browser-server.log', devOutput); }
