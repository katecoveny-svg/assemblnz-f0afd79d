/* Two-device browser proof for the cross-device core, against a fictional API fixture.
 * A desktop context and a phone context share one in-memory store behind the memory
 * and continuity routes, so what one device saves the other reopens. No real Auth,
 * hosted database, provider or external action: the server contract itself is proved
 * separately by the route unit tests and the PGlite SQL harnesses. */
const assert = require('node:assert/strict');
const { mkdirSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.ASSEMBL_PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.ASSEMBL_REVIEW_ORIGIN || 'http://127.0.0.1:3147';
if (!['127.0.0.1', 'localhost'].includes(new URL(origin).hostname)) throw new Error('Local review origin required.');
const output = process.env.ASSEMBL_REVIEW_OUTPUT || path.resolve('output/playwright/do-cross-device');
const OWNER = 'fixture-owner-0000-4000-8000-000000000001';
const checks = [];
const check = (label, condition) => { assert.ok(condition, label); checks.push(label); console.log('PASS ' + label); };
const iso = (offset = 0) => new Date(Date.now() + offset).toISOString();

/** Fictional store shared by both devices. Mirrors the server contracts' CAS rules. */
function fixtureStore() {
  const memory = new Map(); const tasks = new Map(); const access = { personal: { enabled: false, expiresAt: null }, work: { enabled: false, expiresAt: null } };
  const json = (status, body) => ({ status, contentType: 'application/json', body: JSON.stringify(body) });
  return {
    memory(request) {
      if (request.method() === 'GET') return json(200, { records: [...memory.values()], storage: 'account', saved: true, notice: 'Fixture notice.' });
      const input = request.postDataJSON(); const current = memory.get(input.id) ?? null;
      if ((current?.revision ?? 0) !== input.expectedRevision) return json(409, { error: 'This record changed. Reload before editing.' });
      if (input.action === 'delete') { memory.delete(input.id); return json(200, { saved: true }); }
      if (input.action === 'save') {
        const record = { id: input.id, subject: 'self', kind: input.kind, text: input.text, source: 'owner_entered', observedAt: input.observedAt, retentionDays: input.retentionDays, active: input.active, revision: input.expectedRevision + 1, consentedAt: iso(), reviewedAt: iso(), updatedAt: iso(), expiresAt: iso(input.retentionDays * 86400000), noticeVersion: 1, use: 'owner_review_only' };
        memory.set(input.id, record); return json(200, { record, saved: true });
      }
      const record = { ...current, revision: current.revision + 1, updatedAt: iso(), ...(input.action === 'pause' ? { active: false } : { reviewedAt: iso() }) };
      memory.set(input.id, record); return json(200, { record, saved: true });
    },
    continuity(request) {
      const url = new URL(request.url());
      if (request.method() === 'GET') {
        const scope = url.searchParams.get('scope') || 'personal'; const id = url.searchParams.get('id');
        if (!access[scope].enabled) return json(200, { tasks: [], access: { scope, ...access[scope] }, durable: true, storage: 'database', workspaceKey: OWNER });
        const list = [...tasks.values()].filter(t => t.scope === scope && (!id || t.id === id));
        return json(200, { tasks: list, access: { scope, ...access[scope] }, durable: true, storage: 'database', workspaceKey: OWNER });
      }
      if (request.headers()['x-do-workspace'] !== OWNER) return json(409, { error: 'workspace_changed', durable: false });
      const input = request.postDataJSON();
      if (!access[input.scope].enabled) return json(503, { error: 'storage_unavailable', message: 'Save or reload could not be confirmed.', durable: false });
      const reply = task => json(200, { task, durable: true, storage: 'database', workspaceKey: OWNER });
      if (input.action === 'save') {
        const existing = tasks.get(input.id); if (existing) return reply(existing);
        const task = { id: input.id, ownerId: OWNER, scope: input.scope, request: input.request, context: input.context, revision: 1, status: 'waiting', consentVersion: 'do-continuity-v1', consentUntil: iso(86400000), expiresAt: iso(7 * 86400000), createdAt: iso(), updatedAt: iso(), result: null, executor: null };
        tasks.set(task.id, task); return reply(task);
      }
      const task = tasks.get(input.id);
      if (!task || task.scope !== input.scope) return json(404, { error: 'not_found', message: 'That task is not available in this scope.', durable: false });
      if (task.revision !== input.expectedRevision) return json(409, { error: 'conflict', message: 'This task changed. Reopen it before trying again.', durable: false });
      const next = { ...task, revision: task.revision + 1, updatedAt: iso() };
      if (input.action === 'prepare') Object.assign(next, { status: 'needs_review', executor: 'worksheet-v1', result: `Editable EA worksheet · no model called\n\nRequest\n${task.request}\n\nDraft\n[Write or edit your draft here.]` });
      else if (input.action === 'edit') next.result = input.result;
      else Object.assign(next, { status: input.action === 'cancel' ? 'cancelled' : 'revoked', context: [], result: null, consentUntil: iso() });
      tasks.set(task.id, next); return reply(next);
    },
    access(request) {
      if (request.headers()['x-do-workspace'] !== OWNER) return json(409, { error: 'workspace_changed', durable: false });
      const input = request.postDataJSON();
      access[input.scope] = { enabled: input.enable, expiresAt: input.enable ? iso(90 * 86400000) : null };
      return json(200, { access: { scope: input.scope, ...access[input.scope] }, durable: true, storage: 'database', workspaceKey: OWNER });
    },
  };
}

async function device(browser, store, viewport, name) {
  const context = await browser.newContext({ viewport });
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin !== new URL(origin).origin) return route.abort();
    if (url.pathname === '/api/do/personal/memory') return route.fulfill(store.memory(route.request()));
    if (url.pathname === '/api/do/continuity') return route.fulfill(store.continuity(route.request()));
    if (url.pathname === '/api/do/continuity/access') return route.fulfill(store.access(route.request()));
    return route.continue();
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(`${name}: ${error.message}`));
  return { page, errors, shot: label => page.screenshot({ path: path.join(output, `${name}-${label}.jpg`), type: 'jpeg', quality: 70, fullPage: viewport.width < 500 }) };
}

async function main() {
  mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.ASSEMBL_CHROMIUM_PATH ? { executablePath: process.env.ASSEMBL_CHROMIUM_PATH } : {}) });
  try {
    const store = fixtureStore();
    const desktop = await device(browser, store, { width: 1440, height: 900 }, 'desktop');
    const phone = await device(browser, store, { width: 375, height: 812 }, 'phone');

    // Memory: write on desktop, read and change on phone, see it on desktop, stale edit refused.
    await desktop.page.goto(origin + '/do/memory');
    await desktop.page.getByLabel('The note, in your words').fill('Fictional: I prefer plain, short replies.');
    await desktop.page.getByRole('checkbox').check();
    await desktop.page.getByRole('button', { name: 'Save note' }).click();
    await desktop.page.getByText('Note saved to your account.').waitFor();
    check('Desktop saves a memory note to the account', await desktop.page.getByText('Fictional: I prefer plain, short replies.').isVisible());
    await desktop.shot('memory-saved');
    await phone.page.goto(origin + '/do/memory');
    await phone.page.getByText('Fictional: I prefer plain, short replies.').waitFor();
    check('Phone sees the note the desktop saved', true);
    await phone.page.getByRole('button', { name: 'Edit' }).click();
    await phone.page.getByLabel('The note, in your words').fill('Fictional: I prefer plain, short replies, edited on the phone.');
    await phone.page.getByRole('checkbox').check();
    await phone.page.getByRole('button', { name: 'Save changes' }).click();
    await phone.page.getByText('Note updated on your account.').waitFor();
    await phone.shot('memory-edited');
    check('Phone edits the note at the current revision', await phone.page.getByText('rev 2').isVisible());
    await desktop.page.getByRole('button', { name: 'Edit' }).click();
    await desktop.page.getByRole('checkbox').check();
    await desktop.page.getByRole('button', { name: 'Save changes' }).click();
    await desktop.page.getByText('This note changed on another device.').waitFor();
    check('Desktop stale edit is refused and the latest version reloads', await desktop.page.getByText('edited on the phone').isVisible());
    await desktop.shot('memory-conflict');
    await desktop.page.getByRole('button', { name: 'Cancel' }).click();
    await desktop.page.getByRole('button', { name: 'Pause' }).click();
    await desktop.page.getByText('Note paused.').waitFor();
    await phone.page.reload(); await phone.page.getByText('paused', { exact: true }).waitFor();
    check('Phone sees the pause the desktop made', true);
    phone.page.once('dialog', dialog => dialog.accept());
    await phone.page.getByRole('button', { name: 'Delete' }).click();
    await phone.page.getByText('Note deleted everywhere.').waitFor();
    await desktop.page.reload(); await desktop.page.getByText('No notes yet').waitFor();
    check('Phone delete empties the desktop list', true);

    // Continuity: sync switch, save and prepare on desktop, reopen and edit on phone.
    await desktop.page.goto(origin + '/do/continue');
    await desktop.page.getByRole('button', { name: 'Sync off' }).waitFor();
    check('Desktop shows sync off and no task content before consent', await desktop.page.getByText('Cross-device sync is off for this scope.').isVisible());
    await desktop.shot('continue-sync-off');
    await desktop.page.getByRole('button', { name: 'Sync off' }).click();
    await desktop.page.getByRole('button', { name: 'Sync on' }).waitFor();
    await desktop.page.getByLabel('Paste your request').fill('Prepare a fictional follow-up about the school picnic pickup.');
    await desktop.page.getByRole('checkbox').last().check();
    await desktop.page.getByRole('button', { name: 'Save one task', exact: true }).click();
    await desktop.page.getByRole('button', { name: 'Prepare editable worksheet', exact: true }).click();
    await desktop.page.getByLabel('Editable result').waitFor();
    check('Desktop saves and prepares a task with sync on', (await desktop.page.getByLabel('Editable result').inputValue()).includes('no model called'));
    await desktop.shot('continue-prepared');
    await phone.page.goto(origin + '/do/continue');
    await phone.page.getByRole('button', { name: 'Sync on' }).waitFor();
    await phone.page.getByRole('button', { name: /Prepare a fictional follow-up/ }).click();
    await phone.page.getByLabel('Editable result').waitFor();
    check('Phone reopens the desktop task from the account', true);
    await phone.page.getByLabel('Editable result').fill('Hi Sam, please confirm the fictional pickup time before Friday.');
    await phone.page.getByRole('button', { name: 'Save edited result' }).click();
    await phone.page.getByText('Last confirmed revision shown.').waitFor();
    await phone.shot('continue-edited');
    await desktop.page.getByRole('button', { name: 'Reopen / retry connection' }).click();
    await desktop.page.getByRole('button', { name: /Prepare a fictional follow-up/ }).click();
    await desktop.page.getByLabel('Editable result').waitFor();
    check('Desktop reopens the phone edit', (await desktop.page.getByLabel('Editable result').inputValue()).includes('confirm the fictional pickup time'));
    await phone.page.getByRole('button', { name: 'Sync on' }).click();
    await phone.page.getByRole('button', { name: 'Sync off' }).waitFor();
    await desktop.page.getByRole('button', { name: 'Reopen / retry connection' }).click();
    await desktop.page.getByRole('button', { name: 'Sync off' }).waitFor();
    check('Turning sync off on the phone closes it on the desktop too', await desktop.page.getByText('Cross-device sync is off for this scope.').isVisible());
    await desktop.shot('continue-sync-off-again');

    for (const d of [desktop, phone]) check(`No uncaught page errors on ${d === desktop ? 'desktop' : 'phone'}`, d.errors.length === 0);
    const result = { checkedAt: new Date().toISOString(), origin, storage: 'fictional in-memory API fixture shared by two browser contexts', realCrossDeviceProven: false, hostedAuth: false, checks };
    writeFileSync(path.join(output, 'results.json'), JSON.stringify(result, null, 2));
    console.log(`${checks.length} browser checks passed`);
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
