const { openPersonalEntry } = require('./personal-entry-helpers.cjs');
/** Synthetic owner/race/limit proof. Every API and external origin is intercepted. No live providers or records. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.ASSEMBL_PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.ASSEMBL_REVIEW_ORIGIN || 'http://127.0.0.1:3159';
if (!['localhost', '127.0.0.1'].includes(new URL(origin).hostname)) throw new Error('Local origin required');
const out = process.env.ASSEMBL_REVIEW_OUTPUT || 'output/playwright/do-account-hardening';
const A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const id = '11111111-1111-4111-8111-111111111111';
const now = new Date().toISOString(), future = new Date(Date.now() + 86400000).toISOString();
const note = owner => ({ id, subject: 'self', kind: 'preference', text: `Synthetic ${owner === A ? 'A' : 'B'} note`, source: 'owner_entered', observedAt: now, retentionDays: 30, active: true, revision: 1, consentedAt: now, reviewedAt: now, updatedAt: now, expiresAt: future, noticeVersion: 1, use: 'owner_review_only' });
const turns = Array.from({ length: 40 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', text: `Synthetic turn ${i}`, at: now, draft: null, label: null }));
const conversation = { id, title: 'Synthetic kept conversation', turns: turns.slice(0, 38), revision: 1, createdAt: now, updatedAt: now, expiresAt: future, noticeVersion: 1, use: 'owner_review_only' };
const checks = [], errors = [], posts = [];
function check(name, value) { assert.ok(value, name); checks.push(name); console.log('PASS ' + name); }
(async () => {
 fs.mkdirSync(out, { recursive: true });
 const browser = await chromium.launch({ headless: true, ...(process.env.ASSEMBL_CHROMIUM_PATH ? { executablePath: process.env.ASSEMBL_CHROMIUM_PATH } : { channel: 'chrome' }) });
 try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block' });
  let owner = A, holdGet = false, heldGets = [], holdPost = false, heldPosts = [], gets = 0;
  const item = { id, title: 'Synthetic responsibility', goal: 'Prepare from synthetic notes', notes: 'Synthetic source one', timezone: 'Pacific/Auckland', local_hour: 7, active: false, consent_until: future, next_run_at: future, revision: 1, updated_at: now, cadence: 'daily', weekday: null, run_once_at: null };
  const memory = ownerId => ({ records: [note(ownerId)], storage: 'account', saved: true, workspaceKey: ownerId });
  await context.route('**/*', async route => {
   const req = route.request(), url = new URL(req.url());
   if (url.origin !== origin) return route.abort();
   const json = (body, status = 200) => route.fulfill({ status, json: body });
   if (url.pathname === '/synthetic-second-tab') return route.fulfill({ contentType: 'text/html', body: '<title>Synthetic second tab</title>' });
   if (url.pathname === '/api/do/personal/memory') {
    if (req.method() === 'GET') { gets++; const body = memory(owner); if (holdGet) { heldGets.push(() => json(body).catch(() => {})); return; } return json(body); }
    posts.push({ path: url.pathname, owner: req.headers()['x-do-workspace'], body: req.postDataJSON() });
    if (req.headers()['x-do-workspace'] !== owner) return json({ workspaceChanged: true }, 409);
    const body = { saved: true, workspaceKey: owner, record: note(owner) };
    if (holdPost) { heldPosts.push(() => json(body).catch(() => {})); return; }
    return json(body);
   }
   if (url.pathname === '/api/do/personal/conversations') {
    if (req.method() === 'GET') return json({ records: [conversation], storage: 'account', workspaceKey: owner });
    const body = req.postDataJSON(); posts.push({ path: url.pathname, body });
    Object.assign(conversation, { turns: body.turns, revision: conversation.revision + 1 });
    return json({ record: conversation, saved: true, workspaceKey: owner });
   }
   if (url.pathname === '/api/do/personal/assistant') {
    if (req.method() === 'GET') return json({ ready: true, signedIn: true, message: 'Synthetic ready' });
    posts.push({ path: url.pathname });
    return json({ result: { id, reply: 'Synthetic reply', rationale: 'Synthetic fixture', evidence: [], missingInformation: [], nextStep: { kind: 'answer_question', label: 'Synthetic next question', draft: null }, reasoning: { model: 'fixture', note: 'Synthetic only' }, state: 'needs_input', externalActions: false, reviewRequired: true } });
   }
   if (url.pathname === '/api/do/personal') return json({ workspaceKey: owner, responsibilities: [item], runs: [], storage: { available: true }, wakeups: { enabled: true }, worker: { configured: true, mode: 'worksheet', lastSeenAt: now } });
   if (url.pathname === '/api/do/session') return json({ workspaceKey: owner });
   if (url.pathname.startsWith('/api/')) return json({ error: 'Synthetic unavailable' }, 503);
   return route.continue();
  });
  const page = await context.newPage(); page.setDefaultTimeout(20000); page.on('pageerror', e => errors.push(e.message));
  const until = async fn => { for (let i = 0; i < 200; i++) { if (fn()) return; await new Promise(resolve => setTimeout(resolve, 25)); } throw new Error('Fixture condition timed out'); };
  const focus = () => page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await page.goto(origin + '/do/memory');
  await page.getByText('Synthetic A note', { exact: true }).waitFor();
  await page.locator('#memory-text').fill('Synthetic A unsaved draft');
  await page.getByRole('checkbox').check();
  const second = await context.newPage(); await second.goto(origin + '/synthetic-second-tab');
  owner = B;
  await second.evaluate(ownerId => {
   const channel = new BroadcastChannel('sb-synthetic-auth-token');
   channel.postMessage({ event: 'SIGNED_IN', session: { user: { id: ownerId } } });
   setTimeout(() => channel.close(), 100);
  }, B);
  await page.getByText('Synthetic B note', { exact: true }).waitFor();
  check('Another-tab auth event removes A records and draft without focus', !(await page.getByText('Synthetic A note', { exact: true }).count()) && await page.locator('#memory-text').inputValue() === '' && !(await page.getByRole('checkbox').isChecked()));
  check('Account switch never silently saves the A draft', posts.length === 0);
  await page.locator('#memory-text').fill('Synthetic B draft'); await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Save note', exact: true }).click();
  await page.getByText('Note saved to your account.', { exact: true }).waitFor();
  check('New B draft carries verified expected owner', posts.at(-1).owner === B && posts.at(-1).body.text === 'Synthetic B draft');
  // A response held across a newer B owner read must never restore A.
  owner = A; await focus(); await page.getByText('Synthetic A note', { exact: true }).waitFor();
  holdGet = true; const before = gets; await focus(); await until(() => gets > before);
  check('Uncertain identity hides old records and editor', await page.locator('#memory-text').count() === 0 && await page.getByText('Synthetic A note', { exact: true }).count() === 0);
  owner = B; holdGet = false; await focus(); await page.getByText('Synthetic B note', { exact: true }).waitFor();
  await Promise.all(heldGets.splice(0).map(release => release()));
  check('Stale A GET cannot replace newer B state', await page.getByText('Synthetic A note', { exact: true }).count() === 0);
  // A late successful mutation response cannot clear a new owner's draft or publish A success.
  owner = A; await focus(); await page.getByText('Synthetic A note', { exact: true }).waitFor();
  holdPost = true; await page.locator('#memory-text').fill('Synthetic pending A'); await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Save note', exact: true }).click(); await until(() => heldPosts.length === 1);
  owner = B; await focus(); await page.getByText('Synthetic B note', { exact: true }).waitFor();
  await page.locator('#memory-text').fill('Synthetic new B draft');
  holdPost = false; await Promise.all(heldPosts.splice(0).map(release => release()));
  check('Stale A POST cannot clear B draft or report success', await page.locator('#memory-text').inputValue() === 'Synthetic new B draft' && await page.getByText('Note saved to your account.', { exact: true }).count() === 0);
  // Missed auth signal: server rejects A expectation after cookie owner switches.
  owner = A; await focus(); await page.getByText('Synthetic A note', { exact: true }).waitFor();
  await page.locator('#memory-text').fill('Synthetic stale A draft'); await page.getByRole('checkbox').check(); owner = B;
  await page.getByRole('button', { name: 'Save note', exact: true }).click(); await page.getByText('Synthetic B note', { exact: true }).waitFor();
  check('Workspace-conflict response clears stale A draft before B can save', await page.locator('#memory-text').inputValue() === '' && posts.at(-1).owner === A);
  await page.screenshot({ path: out + '/memory-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({ path: out + '/memory-375.png', fullPage: true });
  check('Memory fits 375px', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.setViewportSize({ width: 1280, height: 900 }); await page.goto(origin + '/do'); await openPersonalEntry(page);
  await page.getByRole('button', { name: /Synthetic kept conversation/ }).click();
  await openPersonalEntry(page);
  await page.locator('#personal-assistant-input').fill('Synthetic next message');
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await page.getByRole('checkbox', { name: /Share this message/ }).check();
  await page.getByRole('button', { name: 'Ask DO', exact: true }).click();
  await page.getByText(/This conversation has reached its 40-message limit/).waitFor();
  const kept = posts.find(p => p.path === '/api/do/personal/conversations');
  check('38→40 appends without changing any earlier turn', kept.body.turns.length === 40 && JSON.stringify(kept.body.turns.slice(0, 38)) === JSON.stringify(turns.slice(0, 38)));
  const providerCount = posts.filter(p => p.path === '/api/do/personal/assistant').length;
  await page.locator('#personal-assistant-input').fill('Synthetic over-limit message');
  check('40-turn boundary blocks another provider request', await page.getByRole('button', { name: 'Start', exact: true }).isDisabled());
  await page.locator('#personal-assistant-input').evaluate(el => el.form.requestSubmit());
  check('Submit guard prevents programmatic over-limit send', posts.filter(p => p.path === '/api/do/personal/assistant').length === providerCount);
  await page.setViewportSize({ width: 375, height: 812 }); await page.getByRole('button', { name: 'Start a new conversation', exact: true }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: out + '/conversation-limit-375.png', fullPage: true });
  check('Conversation limit fits 375px', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.getByRole('button', { name: 'Start a new conversation', exact: true }).click();
  check('Explicit new conversation leaves stored 40-turn record intact', conversation.turns.length === 40);
  await page.getByRole('button', { name: /Synthetic kept conversation/ }).click();
  await page.getByText(/This conversation has reached its 40-message limit/).waitFor();
  check('Reopened full conversation exposes a new-conversation action', await page.getByRole('button', { name: 'Start a new conversation', exact: true }).isVisible());
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.getByText('Ongoing responsibilities', { exact: true }).click();
  await page.getByRole('button', { name: 'Turn wake-ups on', exact: true }).click();
  const form = page.getByRole('form', { name: 'Wake-ups for Synthetic responsibility' });
  for (const [field, value] of Object.entries({ revision: 2, notes: 'Synthetic changed source', goal: 'Synthetic changed goal', active: true, consent_until: new Date(Date.now() + 2 * 86400000).toISOString(), next_run_at: new Date(Date.now() + 3600000).toISOString(), run_once_at: future, local_hour: 9, timezone: 'Pacific/Chatham' })) {
   await form.getByRole('checkbox').check(); item[field] = value; await focus();
   await form.getByRole('checkbox').waitFor();
   for (let i = 0; i < 100 && await form.getByRole('checkbox').isChecked(); i++) await new Promise(resolve => setTimeout(resolve, 25));
   check(`Wake-up consent resets after ${field} changes`, !(await form.getByRole('checkbox').isChecked()));
  }
  await page.setViewportSize({ width: 375, height: 812 }); await form.scrollIntoViewIfNeeded();
  await page.screenshot({ path: out + '/wakeup-consent-375.png', fullPage: true });
  check('Wake-up form fits 375px', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  check('No page runtime errors', errors.length === 0);
  fs.writeFileSync(out + '/results.json', JSON.stringify({ checks, errors, syntheticOnly: true, liveAuthOrStorageProven: false }, null, 2));
  await context.close();
 } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
