/* Repeatable UI proof. All account/provider data is fictional and intercepted. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.ASSEMBL_PLAYWRIGHT_MODULE || '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const origin = process.env.ASSEMBL_REVIEW_ORIGIN || 'http://127.0.0.1:3117';
const out = process.env.ASSEMBL_REVIEW_OUTPUT || '/tmp/assembl-personal-settings-review';
const checks = [];
const check = (label, condition) => { assert.ok(condition, label); checks.push(label); console.log('PASS ' + label); };
const defaults = { displayName: 'DO', avatar: 'bloom', tone: 'warm', responseLength: 'balanced', initiative: 'gentle', preferences: '', voiceName: 'Kore', onboardingCompleted: false, updatedAt: null };

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.ASSEMBL_CHROMIUM_PATH || '/usr/bin/chromium', headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    let profile = { ...defaults }, saved = false, failSave = false;
    const mutations = [];
    await page.route('**/api/**', route => route.fulfill({ status: 503, json: { error: 'Fictional test: provider unavailable' } }));
    await page.route('**/api/do/personal', route => route.fulfill({ json: { workspaceKey: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', responsibilities: [], runs: [], worker: { configured: true, lastSeenAt: new Date().toISOString() } } }));
    await page.route('**/api/do/live-token', route => route.fulfill({ json: { enabled: false, configured: false, signedIn: true, remaining: null, dailyLimit: 3, sessionSeconds: 300, model: 'test-fixture' } }));
    await page.route('**/api/do/personal/profile', route => {
      const request = route.request();
      if (request.method() === 'POST') {
        mutations.push(request.postDataJSON());
        if (failSave) return route.fulfill({ status: 503, json: { error: 'Fictional storage failure. Please retry.' } });
        const { consent, ...input } = request.postDataJSON();
        assert.equal(consent, true);
        profile = { ...input, updatedAt: new Date().toISOString() }; saved = true;
      }
      if (request.method() === 'DELETE') { mutations.push({ action: 'delete' }); profile = { ...defaults }; saved = false; }
      return route.fulfill({ json: { profile, saved } });
    });
    await page.goto(origin + '/do/personal', { waitUntil: 'networkidle', timeout: 120000 });
    await page.getByRole('button', { name: 'Make DO mine' }).waitFor();
    await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
    check('account settings render without a provider', await page.getByRole('button', { name: 'Make DO mine' }).isVisible());
    await page.getByRole('button', { name: 'Make DO mine' }).click();
    const dialog = page.getByRole('dialog', { name: 'Hello, your DO.' });
    check('onboarding is a real modal', await dialog.isVisible());
    await page.getByLabel('What shall we call your DO?').fill('Pip');
    await page.getByRole('button', { name: 'Pebble A steady presence' }).click();
    check('selected character has pressed state', await page.getByRole('button', { name: 'Pebble A steady presence' }).getAttribute('aria-pressed') === 'true');
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('button', { name: 'Straight to it The answer, then the next step.' }).click();
    await page.getByLabel('How much detail?').selectOption('brief');
    await page.getByLabel('When we’re talking').selectOption('on_request');
    await page.screenshot({ path: out + '/personal-style-desktop.png' });
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByLabel('Anything else about how you like to work?').fill('Fictional test: use New Zealand spelling.');
    await page.getByLabel('Your call voice').selectOption('Aoede');
    check('consent is not selected automatically', !(await page.getByRole('checkbox').isChecked()));
    check('save is blocked before consent', await page.getByRole('button', { name: 'Save my DO' }).isDisabled());
    await page.getByRole('checkbox').check();
    await page.getByLabel('Your call voice').selectOption('Kore');
    check('editing clears previous consent', !(await page.getByRole('checkbox').isChecked()));
    await page.setViewportSize({ width: 375, height: 812 });
    check('375px dialog has no horizontal overflow', await page.getByRole('dialog').evaluate(el => el.scrollWidth <= el.clientWidth));
    check('phone inputs use at least 16px', await page.getByLabel('Anything else about how you like to work?').evaluate(el => parseFloat(getComputedStyle(el).fontSize) >= 16));
    await page.screenshot({ path: out + '/personal-consent-mobile.png' });
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Save my DO' }).click();
    await page.getByRole('button', { name: 'Customise Pip' }).waitFor();
    check('one explicit save carries the correct settings', mutations.length === 1 && mutations[0].displayName === 'Pip' && mutations[0].tone === 'direct');
    await page.reload({ waitUntil: 'networkidle' });
    check('settings return after reload', await page.getByRole('heading', { name: 'Meet Pip.' }).isVisible());
    await page.screenshot({ path: out + '/personal-workspace-mobile.png', fullPage: true });
    await page.getByRole('button', { name: 'Customise Pip' }).click();
    await page.getByLabel('What shall we call your DO?').fill('Unsaved name');
    await page.getByRole('button', { name: 'Close customisation' }).click();
    check('closing discards edits', await page.getByRole('heading', { name: 'Meet Pip.' }).isVisible());
    await page.getByRole('button', { name: 'Customise Pip' }).click();
    check('reopening restores saved name', await page.getByLabel('What shall we call your DO?').inputValue() === 'Pip');
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    check('step back is internal, route remains stable', page.url().endsWith('/do/personal'));
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('checkbox').check(); failSave = true;
    await page.getByRole('button', { name: 'Save my DO' }).click();
    await page.getByText('Fictional storage failure. Please retry.').waitFor();
    check('save failure retains editable form', await page.getByRole('dialog').isVisible());
    await page.getByRole('button', { name: 'Close customisation' }).click();
    await page.getByRole('button', { name: 'Customise Pip' }).click();
    await page.getByRole('button', { name: 'Forget my preferences', exact: true }).click();
    await page.getByRole('button', { name: 'Keep them', exact: true }).click();
    check('cancel forget makes no deletion', !mutations.some(item => item.action === 'delete'));
    await page.getByRole('button', { name: 'Forget my preferences', exact: true }).click();
    await page.getByRole('button', { name: 'Remove saved preferences', exact: true }).click();
    await page.getByRole('button', { name: 'Make DO mine' }).waitFor();
    check('explicit forget returns to defaults', !saved && profile.displayName === 'DO');
    await page.setViewportSize({ width: 320, height: 640 });
    check('320px page fits', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    check('no runtime errors', errors.length === 0);
    fs.writeFileSync(out + '/results.json', JSON.stringify({ checks, errors, apiMode: 'Fictional intercepted fixtures; no provider/account proof', physicalDeviceTested: false }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
