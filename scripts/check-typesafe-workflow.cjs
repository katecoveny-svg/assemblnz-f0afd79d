/** Real new workflow + route code; established auth, provider and quota boundaries are test doubles.
 * No network, secrets or database writes. Run: node --test scripts/check-typesafe-workflow.cjs
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
function loader(stubs = {}) {
  const cache = new Map();
  function load(filename) {
    filename = path.resolve(root, filename);
    if (cache.has(filename)) return cache.get(filename).exports;
    const m = new Module(filename, module); cache.set(filename, m);
    m.filename = filename; m.paths = Module._nodeModulePaths(path.dirname(filename));
    const fallback = m.require.bind(m);
    m.require = id => {
      if (Object.hasOwn(stubs, id)) return stubs[id];
      const target = id.startsWith('@/') ? path.join(root, id.slice(2)) : id.startsWith('.') ? path.resolve(path.dirname(filename), id) : null;
      return target ? load(target.endsWith('.ts') ? target : `${target}.ts`) : fallback(id);
    };
    const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
      fileName: filename, reportDiagnostics: true,
    });
    assert.equal((output.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error).length, 0);
    m._compile(output.outputText, filename); return m.exports;
  }
  return load;
}
const flow = loader()('lib/typesafe/workflow.ts');
const input = () => ({ surface: 'do', intent: 'Prepare a brief from this source.', page: { title: 'Fictional example', url: '', text: 'A fictional retailer wants a draft-only collection assistant. No results measured.' }, claim: 'Conversion grew 30%.', shareWithTypeSafe: true });
const pilot = (action = 'prepare_brief') => ({ mode: 'live', decision: { action, evidence: 'insufficient' }, evaluation: { model: 'jev-1.13.0' }, trace: { providerCalled: true } });
const draft = () => ({ version: 1, id: 'draft-test', task: 'brief', title: 'Draft', text: 'MODEL TEST DOUBLE', createdAt: '2026-09-18T00:00:00Z', status: 'draft', evidence: { method: 'model', model: 'configured-test-model', outputHash: 'test-hash' } });
function dependencies(options = {}) {
  const counts = { reserved: 0, prepared: 0, released: 0 };
  let preparedInput;
  return { counts, input: () => preparedInput, deps: {
    reserve: async () => { counts.reserved++; if (options.reserveFail) throw Error('PRIVATE_DB_DETAIL'); if (options.onReserve) options.onReserve(); return { release: async () => { counts.released++; if (options.releaseFail) throw Error('PRIVATE_QUOTA_DETAIL'); } }; },
    prepare: async i => { counts.prepared++; preparedInput = i; if (options.prepareFail) throw Error('PRIVATE_PROVIDER_SECRET'); return draft(); },
  } };
}
test('DO provider consent is explicit, not truthy or inferred', () => {
  for (const raw of [null, [], {}, { shareWithDo: false }, { shareWithDo: 'true' }, { shareWithDo: 1 }]) assert.throws(() => flow.requireDoWorkflowConsent(raw));
  assert.doesNotThrow(() => flow.requireDoWorkflowConsent({ shareWithDo: true }));
});
for (const [action, task] of [['prepare_brief', 'brief'], ['studio_handoff', 'plan'], ['extract_facts', 'extract']]) test(`maps ${action} into existing DO ${task}`, () => {
  const prepared = flow.preparationForDecision(input(), pilot(action));
  assert.equal(prepared.task, task); assert.equal(prepared.source, input().page.text); assert.equal(prepared.brief, input().intent);
  assert.equal(prepared.consent, true); assert.equal(prepared.claim, undefined);
});
for (const action of ['ask_user', 'unsupported', 'send_money']) test(`does not generate for ${action}`, async () => {
  const d = dependencies(); const r = await flow.runDoWorkflow(input(), pilot(action), d.deps);
  assert.equal(r.state, 'needs_input'); assert.deepEqual(d.counts, { reserved: 0, prepared: 0, released: 0 });
});
test('rehearsal and fabricated non-provider results do not enter the model lane', () => {
  const p = pilot();
  assert.equal(flow.preparationForDecision(input(), { ...p, mode: 'rehearsal' }), null);
  assert.equal(flow.preparationForDecision(input(), { ...p, evaluation: null }), null);
  assert.equal(flow.preparationForDecision(input(), { ...p, trace: { providerCalled: false } }), null);
  assert.equal(flow.preparationForDecision({ ...input(), shareWithTypeSafe: false }, p), null);
});
test('preserves the full user instruction while bounding source title to the established contract', () => {
  const i = input(); i.intent = 'x'.repeat(2000); i.page.title = 't'.repeat(200);
  const prepared = flow.preparationForDecision(i, pilot());
  assert.equal(prepared.brief.length, 2000); assert.equal(prepared.sourceTitle.length, 160);
});
test('successful DO preparation consumes one reservation and remains an unverified unsaved draft', async () => {
  const d = dependencies(); const r = await flow.runDoWorkflow(input(), pilot(), d.deps);
  assert.equal(r.state, 'prepared'); assert.equal(r.draft.id, 'draft-test');
  assert.equal(r.persisted, false); assert.equal(r.externalActions, false); assert.equal(r.reviewRequired, true); assert.equal(r.generatedDraftVerified, false);
  assert.deepEqual(d.counts, { reserved: 1, prepared: 1, released: 0 });
});
test('reservation failure does not call the drafting service', async () => {
  const d = dependencies({ reserveFail: true }); const r = await flow.runDoWorkflow(input(), pilot(), d.deps);
  assert.equal(r.state, 'failed'); assert.equal(d.counts.prepared, 0); assert.ok(!JSON.stringify(r).includes('PRIVATE'));
});
test('generation failure releases allowance once and retains no invented draft', async () => {
  const d = dependencies({ prepareFail: true }); const r = await flow.runDoWorkflow(input(), pilot(), d.deps);
  assert.equal(r.state, 'failed'); assert.equal(r.draft, null); assert.equal(d.counts.released, 1); assert.ok(!JSON.stringify(r).includes('PRIVATE'));
});
test('a release failure cannot leak database or provider information', async () => {
  const d = dependencies({ prepareFail: true, releaseFail: true }); const r = await flow.runDoWorkflow(input(), pilot(), d.deps);
  assert.equal(r.state, 'failed'); assert.ok(!JSON.stringify(r).includes('PRIVATE'));
});
test('pre-cancelled work neither reserves nor generates', async () => {
  const d = dependencies(); const c = new AbortController(); c.abort();
  const r = await flow.runDoWorkflow(input(), pilot(), d.deps, c.signal);
  assert.equal(r.state, 'cancelled'); assert.equal(d.counts.reserved, 0);
});
test('cancellation after reservation releases it without generation', async () => {
  const c = new AbortController(); const d = dependencies({ onReserve: () => c.abort() });
  const r = await flow.runDoWorkflow(input(), pilot(), d.deps, c.signal);
  assert.equal(r.state, 'cancelled'); assert.equal(d.counts.released, 1); assert.equal(d.counts.prepared, 0);
});

class PilotError extends Error { constructor(code, status, message) { super(message); this.code = code; this.status = status; } }
function routeHarness(options = {}) {
  const d = dependencies(options); let providerCalls = 0; let actor;
  const read = loader({
    '@/apps/do/services/owner': { doOwner: async () => options.unsigned ? null : { id: 'verified-owner' }, sameDoOrigin: r => r.headers.get('origin') === new URL(r.url).origin, privateDoHeaders: { 'Cache-Control': 'private, no-store' } },
    '@/apps/do/shared/http': { readDoJson: r => r.json(), admitDoRequest: key => { assert.equal(key, 'typesafe:verified-owner'); return !options.localRate; } },
    '@/apps/do/shared/trial': { reserveDoTrial: async (_ip, context) => { assert.equal(context.signedInOwnerId, 'verified-owner'); return d.deps.reserve(); } },
    '@/apps/do/shared/preparation-server': { prepareDoDraft: d.deps.prepare },
    '@/lib/agents/chat-rate-limit': { chatClientIp: () => 'test-ip', checkChatRateLimit: async (_ip, slug) => { assert.equal(slug, 'do-preparation'); return { allowed: !options.durableRate }; } },
    '@/lib/typesafe/core': { PilotError, parseInput: raw => { if (raw.shareWithTypeSafe !== true) throw new PilotError('invalid_input', 400, 'Consent required'); return input(); } },
    '@/lib/typesafe/pilot': { requirePilot: () => { if (options.unlisted) throw new PilotError('pilot_access_required', 403, 'Not allowlisted'); }, runPilot: async (_input, id) => { actor = id; providerCalls++; if (options.providerFail) throw new PilotError('provider_unavailable', 502, 'Provider unavailable'); return pilot(options.action); } },
  });
  return { route: read('app/api/do/decision/prepare/route.ts'), d, providerCalls: () => providerCalls, actor: () => actor };
}
const request = (body = { ...input(), shareWithDo: true }, origin = 'https://assembl.test') => new Request('https://assembl.test/api/do/decision/prepare', { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify(body) });
for (const [name, options, status] of [['unsigned', { unsigned: true }, 401], ['unlisted', { unlisted: true }, 403], ['owner rate limited', { localRate: true }, 429], ['durable rate limited', { durableRate: true }, 429]]) test(`HTTP blocks ${name} before model access`, async () => {
  const h = routeHarness(options); assert.equal((await h.route.POST(request())).status, status); assert.equal(h.providerCalls(), 0); assert.equal(h.d.counts.reserved, 0);
});
test('HTTP rejects foreign origins, including arbitrary extension origins', async () => {
  const h = routeHarness();
  for (const origin of ['https://other.test', 'chrome-extension://' + 'a'.repeat(32)]) assert.equal((await h.route.POST(request(undefined, origin))).status, 403);
  assert.equal(h.providerCalls(), 0);
});
test('HTTP requires both TypeSafe and DO provider consent', async () => {
  const h = routeHarness();
  assert.equal((await h.route.POST(request(input()))).status, 400);
  assert.equal((await h.route.POST(request({ ...input(), shareWithTypeSafe: false, shareWithDo: true }))).status, 400);
  assert.equal(h.providerCalls(), 0);
});
test('HTTP rejects invalid JSON before provider access', async () => {
  const h = routeHarness(); const r = new Request('https://assembl.test/api/do/decision/prepare', { method: 'POST', headers: { origin: 'https://assembl.test', 'content-type': 'application/json' }, body: '{' });
  assert.equal((await h.route.POST(r)).status, 400); assert.equal(h.providerCalls(), 0);
});
test('provider failure cannot fall back to a fabricated workflow outcome', async () => {
  const h = routeHarness({ providerFail: true }); assert.equal((await h.route.POST(request())).status, 502); assert.equal(h.d.counts.prepared, 0);
});
test('HTTP uses authenticated owner and server decision, not client-posted replacements', async () => {
  const h = routeHarness(); const response = await h.route.POST(request({ ...input(), shareWithDo: true, ownerId: 'someone-else', decision: { action: 'send_money' }, draft: { text: 'FAKE' } }));
  const r = await response.json(); assert.equal(response.status, 200); assert.equal(h.actor(), 'verified-owner'); assert.equal(h.providerCalls(), 1);
  assert.equal(r.workflow.state, 'prepared'); assert.equal(r.workflow.draft.id, 'draft-test'); assert.equal(r.workflow.persisted, false); assert.equal(r.workflow.externalActions, false);
  assert.match(response.headers.get('cache-control'), /no-store/);
});
test('HTTP retains the TypeSafe judgement when DO fails', async () => {
  const h = routeHarness({ prepareFail: true }); const r = await (await h.route.POST(request())).json();
  assert.equal(r.mode, 'live'); assert.equal(r.workflow.state, 'failed'); assert.equal(r.workflow.draft, null); assert.equal(h.d.counts.released, 1);
});
test('HTTP consumes no drafting allowance when TypeSafe asks for clarification', async () => {
  const h = routeHarness({ action: 'ask_user' }); const r = await (await h.route.POST(request())).json();
  assert.equal(r.workflow.state, 'needs_input'); assert.equal(h.d.counts.reserved, 0);
});
test('UI contains separate opt-in consent and never calls the new bridge during rehearsal', () => {
  const ui = fs.readFileSync(path.join(root, 'components/do/TypeSafePilot.tsx'), 'utf8');
  assert.ok(ui.includes('shareWithDo: true')); assert.ok(ui.includes("if (mode === 'rehearsal') { setResult(rehearsal(surface)); return; }"));
  assert.ok(ui.includes('setWithDo(false)')); assert.ok(ui.includes('generatedDraftVerified: false'));
});
