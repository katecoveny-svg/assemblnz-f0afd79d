/* Personal DO conversation proof. All account/model responses are fictional fixtures. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.ASSEMBL_PLAYWRIGHT_MODULE || '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const origin = process.env.ASSEMBL_REVIEW_ORIGIN || 'http://127.0.0.1:3117';
const out = process.env.ASSEMBL_REVIEW_OUTPUT || '/tmp/assembl-personal-assistant-review';
const checks = [];
const check = (name, condition) => { assert.ok(condition, name); checks.push(name); console.log('PASS ' + name); };
const profile = { displayName: 'Pip', avatar: 'bloom', tone: 'warm', responseLength: 'brief', initiative: 'gentle', preferences: 'Fictional test: plain New Zealand English.', voiceName: 'Kore', onboardingCompleted: true, updatedAt: '2026-09-30T03:00:00.000Z' };
const makeResult = message => ({
  id: 'fictional-assistant-result', createdAt: '2026-09-30T04:00:00.000Z', state: 'draft', reviewRequired: true, externalActions: false, persisted: false,
  reply: 'Here is a fictional draft to check. Nothing has been sent.', rationale: 'You asked for a short reply, so this keeps it simple.',
  evidence: [{ source: 'message', quote: message }], missingInformation: ['Confirm the recipient before using the draft.'],
  nextStep: { kind: 'review_draft', label: 'Your reply draft', draft: 'Thanks for the update. I’ll review the details and come back to you.' },
  reasoning: { provider: 'typesafe', model: 'jev-1.13.0', action: 'prepare', confidence: 0.91, threshold: 0.75, elapsedMs: 20, note: 'Fictional TypeSafe check. Not permission to send.' },
  generation: { provider: 'openai', requestedModel: 'gpt-6-astra', actualModel: 'gpt-6-astra', reasoningEffort: 'medium' },
});

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.ASSEMBL_CHROMIUM_PATH || '/usr/bin/chromium', headless: true });
  let page;
  try {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });
    page = await context.newPage(); page.setDefaultTimeout(15_000);
    const errors = [], posts = [];
    let responseMode = 'success', pendingRoute, resolvePending;
    const pendingStarted = new Promise(resolve => { resolvePending = resolve; });
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/api/**', route => route.fulfill({ status: 503, json: { error: 'Fictional unavailable fixture' } }));
    await page.route('**/api/do/personal', route => route.fulfill({ json: { workspaceKey: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', responsibilities: [], runs: [], worker: { configured: true, lastSeenAt: null } } }));
    await page.route('**/api/do/personal/profile', route => route.fulfill({ json: { profile, saved: true } }));
    await page.route('**/api/do/personal/assistant', async route => {
      if (route.request().method() === 'GET') return route.fulfill({ json: { signedIn: true, ready: true, reason: null, message: 'Fictional configured status; not a live provider check.', model: 'gpt-6-astra', externalActions: false } });
      const input = route.request().postDataJSON(); posts.push(input);
      if (responseMode === 'pending') { pendingRoute = route; resolvePending(); return; }
      if (responseMode === 'error') return route.fulfill({ status: 503, json: { error: 'astra_generation_failed', message: 'Fictional service interruption. Your note is still here.' } });
      return route.fulfill({ json: { result: makeResult(input.message) } });
    });
    await page.addInitScript(() => { window.__assistantClipboard = []; Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.__assistantClipboard.push(text); } } }); });
    await page.goto(origin + '/do/personal', { waitUntil: 'networkidle', timeout: 120_000 });
    const panel = page.getByRole('region', { name: 'Ask Pip', exact: true });
    const input = panel.locator('#personal-assistant-input');
    await input.fill('Fictional request: prepare a short reply.');
    check('primary composer needs no category', await input.isVisible() && !(await page.getByLabel('Kind of admin').isVisible()));
    check('typing does not call a provider', posts.length === 0);
    await panel.getByRole('button', { name: 'Start', exact: false }).click();
    const consent = panel.getByRole('checkbox', { name: /Share this message, added notes/ });
    check('named provider consent is initially unselected', !await consent.isChecked() && posts.length === 0);
    await consent.check();
    await input.fill('Fictional request: prepare a short and friendly reply.');
    check('editing the message clears consent', !await consent.isChecked());
    await consent.check();
    await panel.getByRole('button', { name: 'Ask DO', exact: false }).click();
    await panel.getByText('Here is a fictional draft to check. Nothing has been sent.', { exact: true }).waitFor();
    await page.waitForFunction(() => document.activeElement?.tagName === 'H3' && document.activeElement.textContent.includes('for your review'));
    check('reply receives keyboard focus', true);
    await page.evaluate(() => dispatchEvent(new Event('assembl:do-focus')));
    check('portable focus returns to the same composer', await input.evaluate(element => element === document.activeElement));
    check('one consented request carries no invented authority', posts.length === 1 && posts[0].consent === true && posts[0].history.length === 0 && posts[0].useSavedStyle === false);
    const draft = panel.locator('#personal-assistant-draft');
    // Fictional fixture diagnostics: preserve events and controlled-value writes even on failure.
    await page.evaluate(() => {
      window.__draftEvents = [];
      const record = (type, element, value) => {
        if (element.id !== 'personal-assistant-draft') return;
        window.__draftEvents.push({ type, value, disabled: element.disabled, at: performance.now() });
        if (window.__draftEvents.length > 100) window.__draftEvents.shift();
      };
      for (const type of ['beforeinput', 'input', 'change']) document.addEventListener(type, event => record(type, event.target, event.target.value), true);
      const descriptor = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
      Object.defineProperty(HTMLTextAreaElement.prototype, 'value', { ...descriptor, set(value) { record('controlled-value-write', this, value); descriptor.set.call(this, value); } });
    });
    await draft.fill('My reviewed fictional reply.');
    const editedValue = await draft.inputValue();
    check(`reply is editable before reuse (actual: ${JSON.stringify(editedValue)})`, editedValue === 'My reviewed fictional reply.');
    await panel.getByRole('button', { name: 'Copy draft', exact: true }).click();
    await panel.getByRole('button', { name: 'Copied', exact: true }).waitFor();
    check('copy uses only the edited draft', await page.evaluate(() => window.__assistantClipboard[0] === 'My reviewed fictional reply.'));
    await panel.getByText('Why this next step', { exact: false }).click();
    check('actual fixture model and TypeSafe source are reviewable', await panel.getByText(/Reply: gpt-6-astra/).isVisible() && await panel.getByText('Fictional TypeSafe check. Not permission to send.', { exact: false }).isVisible());
    check('375px conversation fits', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await panel.screenshot({ path: out + '/assistant-reviewed-mobile.png' });
    responseMode = 'error';
    await input.fill('Make my fictional reply even shorter.');
    await panel.getByRole('button', { name: 'Start', exact: false }).click(); await consent.check();
    await panel.getByRole('button', { name: 'Ask DO', exact: false }).click();
    await panel.getByText('Fictional service interruption. Your note is still here.', { exact: true }).waitFor();
    check('follow-up includes only the last visible exchange', posts[1].history.length === 2 && posts[1].history[1].text.includes('My reviewed fictional reply.'));
    check('failure retains the message and reviewed draft', await input.inputValue() === 'Make my fictional reply even shorter.' && await draft.inputValue() === 'My reviewed fictional reply.');
    responseMode = 'pending';
    await consent.check(); await panel.getByRole('button', { name: 'Ask DO', exact: false }).evaluate(button => { button.click(); button.click(); });
    await Promise.race([pendingStarted, new Promise((_, reject) => setTimeout(() => reject(new Error('Pending fixture request was not received')), 15000))]);
    check('repeated send clicks create one in-flight request', posts.length === 3 && Boolean(pendingRoute));
    await panel.getByRole('button', { name: 'Stop', exact: true }).waitFor();
    await panel.getByRole('button', { name: 'Stop', exact: true }).click();
    check('stop preserves input and clears consent', await input.inputValue() === 'Make my fictional reply even shorter.' && !await consent.isChecked());
    if (pendingRoute) await pendingRoute.fulfill({ json: { result: { ...makeResult('late'), reply: 'STALE RESULT MUST NOT RENDER' } } }).catch(() => {});
    check('cancelled response cannot replace the reviewed draft', await panel.getByText('STALE RESULT MUST NOT RENDER', { exact: true }).count() === 0);
    await panel.getByRole('button', { name: 'New', exact: false }).click();
    check('new conversation clears only this local exchange', await input.inputValue() === '' && await panel.locator('#personal-assistant-draft').count() === 0);
    check('no browser runtime errors', errors.length === 0);
    fs.writeFileSync(out + '/results.json', JSON.stringify({ checks, errors, fixtureOnly: true, liveProviderTested: false, realAccountTested: false }, null, 2));
  } finally {
    if (page) {
      const diagnostic = await page.evaluate(() => { const draft = document.getElementById('personal-assistant-draft'); return { events: window.__draftEvents ?? [], value: draft?.value ?? null, disabled: draft?.disabled ?? null, busy: document.querySelector('[aria-label="Ask Pip"]')?.getAttribute('aria-busy') ?? null }; }).catch(() => ({ unavailable: true }));
      fs.writeFileSync(out + '/draft-diagnostic.json', JSON.stringify(diagnostic, null, 2));
    }
    if (page) await page.screenshot({ path: out + '/final-state.png', fullPage: true }).catch(() => {});
    if (!fs.existsSync(out + '/results.json')) fs.writeFileSync(out + '/results.json', JSON.stringify({ checks, completed: false, fixtureOnly: true, liveProviderTested: false }, null, 2));
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
