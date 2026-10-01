/** Built public pages with fictional drafting responses. No live account/provider/permission tested. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.ASSEMBL_PLAYWRIGHT_MODULE || '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const origin = process.env.ASSEMBL_REVIEW_ORIGIN || 'http://127.0.0.1:3117';
const out = process.env.ASSEMBL_REVIEW_OUTPUT || '/tmp/personal-do-proof/site-assistant';
const checks = [], errors = [];
const check = (name, pass) => { assert.ok(pass, name); checks.push(name); console.log('PASS ' + name); };
const result = message => ({ id: 'fictional-site-draft', createdAt: '2026-10-01T00:00:00Z', state: 'draft', reviewRequired: true, externalActions: false, persisted: false, reply: 'A fictional EA draft for review. Nothing was sent.', rationale: 'You asked to prepare a reply.', evidence: [{ source: 'message', quote: message }], missingInformation: [], nextStep: { kind: 'review_draft', label: 'Review your reply', draft: 'Fictional reply to edit.' }, reasoning: { provider: 'typesafe', model: 'jev-1.13.0', action: 'prepare', confidence: 0.9, threshold: 0.75, elapsedMs: 1, note: 'Fictional request check.' }, generation: { provider: 'openai', requestedModel: 'gpt-6-astra', actualModel: 'gpt-6-astra', reasoningEffort: 'medium' } });
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.ASSEMBL_CHROMIUM_PATH || '/usr/bin/chromium', headless: true });
  try {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage(); page.setDefaultTimeout(15000);
    page.on('pageerror', error => errors.push(error.message)); page.on('dialog', dialog => dialog.accept());
    // Auth remains unavailable. A mocked API response is interaction proof, never sign-in proof.
    await page.route('**/auth/v1/**', route => route.fulfill({ status: 401, json: { error: 'Fictional signed-out fixture' } }));
    let ready = false, pending = false, pendingRoute, resolvePending;
    const posts = [];
    await page.route('**/api/do/personal/assistant', async route => {
      if (route.request().method() === 'GET') return route.fulfill({ json: { ready, signedIn: ready, reason: ready ? null : 'sign_in_required', message: ready ? 'Fictional drafting fixture, not a live session.' : 'Sign in before drafting.' } });
      const input = route.request().postDataJSON(); posts.push(input);
      if (pending) { pendingRoute = route; resolvePending(); return; }
      return route.fulfill({ json: { result: result(input.message) } });
    });
    for (const width of [1440, 375]) {
      await page.setViewportSize({ width, height: width === 375 ? 812 : 1000 });
      ready = false; await page.goto(origin + '/contact', { waitUntil: 'networkidle' });
      const trigger = page.locator('button[aria-controls="site-do-workspace"]');
      await trigger.click();
      const workspace = page.getByRole('region', { name: 'DO drafting workspace', exact: true });
      const panel = workspace.getByRole('region', { name: 'Ask DO', exact: true });
      check(`canonical DO identity at ${width}`, await workspace.getByRole('link', { name: 'DO by assembl, home', exact: true }).getAttribute('href') === '/do');
      check(`ordinary sign-in returns to public page at ${width}`, await workspace.getByRole('link', { name: 'Sign in to DO', exact: true }).getAttribute('href') === '/login?redirect=%2Fcontact');
      await panel.getByText('Sign in before drafting.', { exact: true }).waitFor();
      const input = panel.locator('#personal-assistant-input'); await input.fill('Fictional EA request.');
      check(`signed-out drafting fails closed at ${width}`, await panel.getByRole('button', { name: 'Start', exact: false }).isDisabled());
      ready = true; await page.reload({ waitUntil: 'networkidle' }); await trigger.click();
      await input.fill('Fictional request: prepare an EA reply.');
      const count = posts.length;
      await panel.getByRole('button', { name: 'Start', exact: true }).click();
      const consent = panel.getByRole('checkbox', { name: /Share this message, added notes/ });
      check(`named provider consent remains unselected at ${width}`, !await consent.isChecked() && posts.length === count);
      await consent.check(); await panel.getByRole('button', { name: 'Ask DO', exact: true }).click();
      const draft = panel.locator('#personal-assistant-draft'); await draft.fill('My edited fictional EA reply.');
      check(`editable reviewed draft at ${width}`, await draft.inputValue() === 'My edited fictional EA reply.');
      check(`no page or client context sent at ${width}`, posts.at(-1).context === '' && posts.at(-1).history.length === 0);
      check(`public widget fits ${width}`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: out + `/site-do-${width}.png`, animations: 'disabled', timeout: 60000 });
      pending = true; const started = new Promise(resolve => { resolvePending = resolve; });
      await input.fill('Fictional follow-up.'); await panel.getByRole('button', { name: 'Start', exact: true }).click(); await consent.check();
      await panel.getByRole('button', { name: 'Ask DO', exact: true }).click();
      await Promise.race([started, new Promise((_, reject) => setTimeout(() => reject(new Error('Pending fixture not received')), 15000))]);
      await panel.getByRole('button', { name: 'Stop', exact: true }).click();
      check(`Stop preserves the edited draft at ${width}`, await draft.inputValue() === 'My edited fictional EA reply.');
      if (pendingRoute) await pendingRoute.fulfill({ json: { result: { ...result('late'), reply: 'STALE FIXTURE' } } }).catch(() => {});
      pending = false;
      await page.goto(origin + '/pricing', { waitUntil: 'networkidle' }); await trigger.click();
      check(`public route change clears exchange at ${width}`, await panel.locator('#personal-assistant-draft').count() === 0 && await panel.locator('#personal-assistant-input').inputValue() === '');
      await page.goto(origin + '/do', { waitUntil: 'networkidle' });
      check(`DO route has no duplicate public widget at ${width}`, await trigger.count() === 0);
    }
    check('no public widget runtime errors', errors.length === 0);
    fs.writeFileSync(out + '/results.json', JSON.stringify({ checks, errors, fixtureOnly: true, realAccountTested: false, liveProviderTested: false, accountReset: 'Separately proved with isolated mocked auth component harness; not a real account switch.' }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); fs.writeFileSync(out + '/failure.json', JSON.stringify({ checks, errors, error: String(error) }, null, 2)); process.exitCode = 1; });
