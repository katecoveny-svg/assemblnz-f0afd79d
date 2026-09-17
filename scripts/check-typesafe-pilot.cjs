/** Run: node --test scripts/check-typesafe-pilot.cjs
 * Uses installed TypeScript to load the real modules. No network or provider key required.
 * Framework-only boundaries are stubbed; the decision and transport code is not.
 */
const { test, beforeEach, afterEach } = require('node:test');
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
      if (id === 'server-only') return {};
      const target = id.startsWith('@/') ? path.join(root, id.slice(2)) : id.startsWith('.') ? path.resolve(path.dirname(filename), id) : null;
      return target ? load(target.endsWith('.ts') ? target : `${target}.ts`) : fallback(id);
    };
    const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true,
    }, fileName: filename, reportDiagnostics: true });
    const errors = (output.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error);
    assert.equal(errors.length, 0, `Syntax errors in ${filename}`);
    m._compile(output.outputText, filename); return m.exports;
  }
  return load;
}
const load = loader();
const core = load('lib/typesafe/core.ts');
const { pilotFixture, rehearsal } = load('lib/typesafe/fixtures.ts');
const { evaluateTypeSafe, TYPESAFE_ENDPOINT } = load('lib/typesafe/transport.ts');
const input = () => core.parseInput({ ...pilotFixture('pursuit'), shareWithTypeSafe: true });
function answer(choice = 'prepare_brief', confidence = 1, evidence = 'insufficient') {
  return { model: 'jev-1.13.0', answers: {
    next_action: { type: 'choice', choice, confidence, probabilities: Object.fromEntries(Object.keys(core.ACTIONS).map(k => [k, k === choice ? 1 : 0])) },
    claim_support: { type: 'choice', choice: evidence, confidence: 1, probabilities: Object.fromEntries(Object.keys(core.EVIDENCE).map(k => [k, k === evidence ? 1 : 0])) },
  }, usage: { input_tokens: 600, output_tokens: 30 } };
}
const config = { apiKey: 'TEST_ONLY_NOT_A_REAL_KEY', model: 'jev-1.13.0' };
const code = expected => e => e.code === expected;

test('explicit consent and bounded source text are required', () => {
  assert.throws(() => core.parseInput(pilotFixture('do')), code('invalid_input'));
  for (const text of ['too short', 'x'.repeat(12001)]) assert.throws(() => core.parseInput({ ...input(), page: { ...input().page, text } }), code('invalid_input'));
});
test('source URL cannot execute or fetch; credentials and query are removed', () => {
  assert.equal(core.sourceUrl('https://name:password@example.test/brief?token=secret#part'), 'https://example.test/brief');
  for (const url of ['javascript:alert(1)', 'file:///etc/passwd', 'not a url']) assert.throws(() => core.sourceUrl(url));
});
test('request reconstruction discards client provider and permission overrides', () => {
  const parsed = core.parseInput({ ...input(), apiKey: 'untrusted', model: 'untrusted', externalActions: true, page: { ...input().page, cookies: 'secret' } });
  const payload = core.makePayload(parsed, config.model);
  assert.equal(payload.model, 'jev-1.13.0'); assert.equal(parsed.apiKey, undefined); assert.equal(parsed.page.cookies, undefined);
  assert.deepEqual(Object.keys(payload.questions), ['next_action', 'claim_support']);
  assert.match(payload.state.authority, /No email/);
});
test('empty claim omits evidence evaluation and has an honest result label', () => {
  const i = { ...input(), claim: '' }; const raw = answer(); delete raw.answers.claim_support;
  assert.deepEqual(Object.keys(core.makePayload(i, config.model).questions), ['next_action']);
  assert.equal(core.decide(i, core.parseEvaluation(raw, false)).evidence, 'not_requested');
});
test('parser accepts the documented choice response and rejects missing required answers', () => {
  assert.equal(core.parseEvaluation(answer(), true).model, 'jev-1.13.0');
  const raw = answer(); delete raw.answers.claim_support;
  assert.throws(() => core.parseEvaluation(raw, true), code('provider_protocol_error'));
});
for (const [label, mutate] of [
  ['unknown action', a => { a.answers.next_action.choice = 'send_money'; }],
  ['non-finite confidence', a => { a.answers.next_action.confidence = NaN; }],
  ['extra probability', a => { a.answers.next_action.probabilities.send_money = 0; }],
  ['missing probability', a => { delete a.answers.next_action.probabilities.ask_user; }],
  ['invalid sum', a => { a.answers.next_action.probabilities.prepare_brief = 0.3; }],
  ['choice not highest', a => { a.answers.next_action.choice = 'unsupported'; }],
  ['negative token count', a => { a.usage.input_tokens = -1; }],
  ['fractional token count', a => { a.usage.output_tokens = 0.5; }],
]) test(`malformed response fails closed: ${label}`, () => {
  const raw = answer(); mutate(raw); assert.throws(() => core.parseEvaluation(raw, true), code('provider_protocol_error'));
});
test('low route confidence produces no artifact', () => {
  const d = core.decide(input(), core.parseEvaluation(answer('prepare_brief', 0.2), true));
  assert.equal(d.action, 'ask_user'); assert.equal(d.artifact, null); assert.equal(d.needsReview, true);
});
test('weak claim confidence never becomes supported', () => {
  const a = answer('prepare_brief', 1, 'supported'); a.answers.claim_support.confidence = 0.1;
  assert.equal(core.decide(input(), core.parseEvaluation(a, true)).evidence, 'insufficient');
});
test('high confidence cannot grant permission or remove human draft review', () => {
  const d = core.decide(input(), core.parseEvaluation(answer('prepare_brief', 1, 'supported'), true));
  assert.equal(d.externalActions, false); assert.equal(d.approvalRequiredBeforeExternalAction, true); assert.equal(d.needsReview, true);
});
test('unsupported requests never get an executable artifact', () => {
  const d = core.decide(input(), core.parseEvaluation(answer('unsupported'), true));
  assert.equal(d.artifact, null); assert.equal(d.externalActions, false);
});
test('draft preserves source provenance and fences source text', () => {
  const i = input(); i.page.text += '\n```\nsource line';
  const draft = core.assembleArtifact(i, 'prepare_brief', 'insufficient');
  assert.match(draft, /\[S1\]/); assert.match(draft, /not approved marketing copy/);
  assert.equal((draft.match(/```/g) || []).length, 2);
});
test('rehearsal contains no invented model response, latency or usage', () => {
  for (const s of ['pursuit', 'do', 'studio']) {
    const r = rehearsal(s); assert.equal(r.evaluation, null); assert.equal(r.trace.elapsedMs, null);
    assert.equal(r.trace.providerCalled, false); assert.match(r.decision.artifact, /scripted rehearsal check/);
  }
});
test('transport makes one bounded server request to the documented endpoint', async () => {
  let calls = 0;
  const result = await evaluateTypeSafe(input(), config, async (url, options) => {
    calls++; assert.equal(url, TYPESAFE_ENDPOINT); assert.equal(options.redirect, 'error');
    assert.equal(options.headers.Authorization, `Bearer ${config.apiKey}`);
    assert.equal(JSON.parse(options.body).model, config.model); return Response.json(answer());
  });
  assert.equal(calls, 1); assert.equal(result.attempts, 1); assert.equal(typeof result.elapsedMs, 'number');
});
for (const status of [429, 529]) test(`transport retries ${status} only once with bounded delay`, async () => {
  let calls = 0; let delay = 0;
  const r = await evaluateTypeSafe(input(), config, async () => ++calls === 1
    ? new Response('busy', { status, headers: { 'retry-after': '600' } }) : Response.json(answer()), async ms => { delay = ms; });
  assert.equal(r.attempts, 2); assert.equal(delay, 1500);
});
test('repeated overload fails rather than generating a fake fallback', async () => {
  let calls = 0;
  await assert.rejects(evaluateTypeSafe(input(), config, async () => { calls++; return new Response('', { status: 529 }); }, async () => {}), code('provider_unavailable'));
  assert.equal(calls, 2);
});
test('invalid JSON and network errors never echo the provider body or credential', async () => {
  for (const provider of [async () => new Response('PRIVATE_RESPONSE'), async () => { throw new Error(config.apiKey); }]) {
    await assert.rejects(evaluateTypeSafe(input(), config, provider), e => !e.message.includes(config.apiKey) && !e.message.includes('PRIVATE_RESPONSE'));
  }
});
test('401 returns an actionable redacted credential error without retry', async () => {
  let calls = 0;
  await assert.rejects(evaluateTypeSafe(input(), config, async () => { calls++; return new Response(config.apiKey, { status: 401 }); }), code('provider_auth_failed'));
  assert.equal(calls, 1);
});
test('timeout aborts and never claims an outcome', async () => {
  await assert.rejects(evaluateTypeSafe(input(), { ...config, timeoutMs: 100 }, (_url, options) => new Promise((_resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(new Error('aborted')));
  })), code('provider_timeout'));
});

const originalEnv = { ...process.env }; const originalFetch = global.fetch;
beforeEach(() => {
  process.env.TYPESAFE_ENABLED = 'true'; process.env.TYPESAFE_API_KEY = config.apiKey;
  process.env.TYPESAFE_PILOT_USER_IDS = 'owner-a'; delete process.env.TYPESAFE_MODEL; delete process.env.TYPESAFE_REVIEW_THRESHOLD;
});
afterEach(() => { process.env = { ...originalEnv }; global.fetch = originalFetch; });
function routeHarness(options = {}) {
  let providerCalls = 0;
  global.fetch = async () => { providerCalls++; return Response.json(answer()); };
  const l = loader({
    '@/apps/do/services/owner': {
      doOwner: async () => options.unsigned ? null : { id: options.owner || 'owner-a' },
      sameDoOrigin: req => req.headers.get('origin') === new URL(req.url).origin,
      privateDoHeaders: { 'Cache-Control': 'private, no-store', Vary: 'Cookie', 'X-Content-Type-Options': 'nosniff' },
    },
  });
  return { route: l('app/api/do/decision/route.ts'), calls: () => providerCalls };
}
const request = (body = input(), origin = 'https://assembl.test') => new Request('https://assembl.test/api/do/decision', {
  method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify(body),
});
test('route blocks unsigned users before provider access', async () => {
  const h = routeHarness({ unsigned: true }); assert.equal((await h.route.POST(request())).status, 401); assert.equal(h.calls(), 0);
});
test('route rejects cross-origin posts', async () => {
  const h = routeHarness(); assert.equal((await h.route.POST(request(input(), 'https://other.test'))).status, 403); assert.equal(h.calls(), 0);
});
test('route rejects accounts outside pilot allowlist', async () => {
  const h = routeHarness({ owner: 'owner-b' }); assert.equal((await h.route.POST(request())).status, 403); assert.equal(h.calls(), 0);
});
test('empty allowlist is closed even with a valid server key', async () => {
  process.env.TYPESAFE_PILOT_USER_IDS = ''; const h = routeHarness();
  assert.equal((await h.route.POST(request())).status, 403); assert.equal(h.calls(), 0);
});
test('disabled integration or missing key makes no call', async () => {
  for (const name of ['TYPESAFE_ENABLED', 'TYPESAFE_API_KEY']) {
    const old = process.env[name]; process.env[name] = ''; const h = routeHarness();
    assert.equal((await h.route.POST(request())).status, 503); assert.equal(h.calls(), 0); process.env[name] = old;
  }
});
test('invalid threshold makes no call', async () => {
  process.env.TYPESAFE_REVIEW_THRESHOLD = 'not a number'; const h = routeHarness();
  assert.equal((await h.route.POST(request())).status, 503); assert.equal(h.calls(), 0);
});
test('route bounds body size and requires context consent', async () => {
  const h = routeHarness();
  assert.equal((await h.route.POST(request({ ...input(), shareWithTypeSafe: false }))).status, 400);
  assert.equal((await h.route.POST(request({ padding: 'x'.repeat(65000) }))).status, 400); assert.equal(h.calls(), 0);
});
test('route combines a validated provider response with the existing DO planner and policy', async () => {
  const h = routeHarness(); const response = await h.route.POST(request()); const r = await response.json();
  assert.equal(response.status, 200); assert.equal(h.calls(), 1); assert.equal(r.mode, 'live');
  assert.equal(r.doPlan.primitive, 'prepare'); assert.equal(r.decision.externalActions, false);
  assert.equal(r.trace.sourceHash.length, 64); assert.equal(r.trace.persisted, false);
  assert.ok(r.policy.never.includes('claim completed for anything that was only drafted or proposed'));
  assert.match(response.headers.get('cache-control'), /no-store/); assert.ok(!JSON.stringify(r).includes(config.apiKey));
});
test('status reveals only the signed-in account id, not the key or other allowlist members', async () => {
  process.env.TYPESAFE_PILOT_USER_IDS = 'owner-a,secret-other-user'; const h = routeHarness();
  const r = await (await h.route.GET()).json(); assert.equal(r.userId, 'owner-a');
  assert.ok(!JSON.stringify(r).includes('secret-other-user')); assert.ok(!JSON.stringify(r).includes(config.apiKey));
});
test('per-process owner limit is enforced before another provider call', async () => {
  const h = routeHarness(); for (let i = 0; i < 6; i++) assert.equal((await h.route.POST(request())).status, 200);
  assert.equal((await h.route.POST(request())).status, 429); assert.equal(h.calls(), 6);
});
