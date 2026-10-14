import { describe, expect, it, vi } from 'vitest';
import { HOSTING_PROPOSAL as P, checkedClaim, closedAdmission, inspectProposedRequest, pluginAliasGate, operationalEvent, type DistributedAdmission } from '../../security-proposals/nz-plugin-hosting/policy';
const request = (url = 'https://nz-freight.assembl.co.nz/mcp', headers: Record<string, string> = {}, method = 'POST') => new Request(url, { method, headers: { 'Content-Type': 'application/json', ...headers } });
const invocation = { policy: P.version, invocationId: '11111111-1111-4111-8111-111111111111', domain: 'freight', kind: 'mcp' } as const;
describe('inactive public hosting contract', () => {
  it('allows only exact proposed HTTPS host/path, with same or absent Origin', () => {
    expect(inspectProposedRequest(request())).toEqual({ state: 'eligible', domain: 'freight' });
    expect(inspectProposedRequest(request('https://nz-rfi.assembl.co.nz/mcp', { Origin: 'https://nz-rfi.assembl.co.nz' }))).toEqual({ state: 'eligible', domain: 'architecture' });
    for (const u of ['http://nz-freight.assembl.co.nz/mcp', 'https://evil.invalid/mcp', 'https://nz-freight.assembl.co.nz/mcp?token=x', 'https://nz-freight.assembl.co.nz/mcp/', 'https://nz-freight.assembl.co.nz:444/mcp', 'https://nz-freight.assembl.co.nz/%6dcp']) expect(inspectProposedRequest(request(u)).state).toBe('denied');
    for (const Origin of ['null', 'https://chatgpt.com', 'https://evil.invalid', 'https://nz-rfi.assembl.co.nz']) expect(inspectProposedRequest(request(undefined, { Origin })).state).toBe('denied');
  });
  it('denies every non-allowlisted path on plugin aliases before ordinary app/auth', () => {
    for (const host of Object.values(P.hosts)) {
      for (const path of ['/', '/login', '/admin', '/api/mcp', '/api/do/personal', '/api/nz-plugins/freight/mcp', '/customers/x', '/_next/static/x.js', '/assets/private', '/favicon.ico', '/.well-known/other', '/privacy/', '/privacy?token=x', '/%70rivacy', '/mcp/../login']) expect(pluginAliasGate(request(`https://${host}${path}`)).state).toBe('denied');
      for (const path of [P.challengePath, '/privacy', '/terms', '/support']) for (const method of ['GET', 'HEAD']) expect(pluginAliasGate(request(`https://${host}${path}`, {}, method)).state).toBe('plugin_path');
      expect(pluginAliasGate(request(`https://${host}/mcp`)).state).toBe('plugin_path');
      expect(pluginAliasGate(request(`https://${host}/mcp`, { Host: 'assembl.co.nz' })).state).toBe('denied');
      expect(pluginAliasGate(request(`https://${host}./mcp`)).state).toBe('denied');
    }
    expect(pluginAliasGate(request('https://assembl.co.nz/api/mcp'))).toEqual({ state: 'ordinary_host' });
  });
  it('rejects private account/session headers and misleading JSON/length values', () => {
    for (const h of ([{ Authorization: 'fixture-only' }, { Cookie: 'fixture-only' }, { 'mcp-session-id': 'fixture-only' }, { 'Content-Type': 'application/json-evil' }, { 'Content-Length': '1048577' }, { 'Content-Length': '-1' }] as Record<string, string>[])) expect(inspectProposedRequest(request(undefined, h)).state).toBe('denied');
    for (const m of ['GET', 'OPTIONS', 'DELETE']) expect(inspectProposedRequest(request(undefined, {}, m))).toEqual({ state: 'denied', status: 405 });
    expect(inspectProposedRequest(request(undefined, { 'Content-Type': 'application/json; charset=utf-8' })).state).toBe('eligible');
  });
  it('default admission is closed, with no ambient provider or fallback', async () => {
    expect(await checkedClaim(invocation)).toEqual({ state: 'denied', reason: 'closed', retryAfterSeconds: 60 });
    await expect(closedAdmission.release({ id: invocation.invocationId, issuedAtMs: 1000, expiresAtMs: 21000, fence: 1 })).rejects.toThrow();
  });
  it('backend errors and malformed/expired/overlong leases never admit', async () => {
    const good = { state: 'admitted', databaseNowMs: 1000, lease: { id: invocation.invocationId, issuedAtMs: 1000, expiresAtMs: 21000, fence: 1 } } as const;
    for (const result of [undefined, { ...good, lease: { ...good.lease, expiresAtMs: 1000 } }, { ...good, lease: { ...good.lease, expiresAtMs: 21001 } }, { ...good, lease: { ...good.lease, fence: 0 } }, { state: 'denied', reason: 'limit', retryAfterSeconds: Infinity }]) {
      const store = { claim: async () => result, release: async () => {} } as unknown as DistributedAdmission;
      expect((await checkedClaim(invocation, store, () => 1000)).state).toBe('denied');
    }
    expect((await checkedClaim(invocation, { claim: async () => { throw new Error('private upstream body'); }, release: async () => {} })).state).toBe('denied');
  });
  it('uses database interval and monotonic transit bound, requiring the full execution lifetime', async () => {
    const check = async (issuedAtMs: number, databaseNowMs: number, expiresAtMs: number, elapsed: number) => {
      let now = 100; const store = { claim: async () => { now += elapsed; return { state: 'admitted', databaseNowMs, lease: { id: invocation.invocationId, issuedAtMs, expiresAtMs, fence: 1 } }; }, release: async () => {} } as DistributedAdmission;
      return checkedClaim(invocation, store, () => now);
    };
    expect((await check(1000, 1000, 21000, 500)).state).toBe('admitted'); // full lease minted after delayed issuance; wall clocks are irrelevant
    expect((await check(1000, 20500, 21000, 600)).state).toBe('denied'); // expired during RPC transit
    expect((await check(1000, 1000, 1001, 0)).state).toBe('denied');
    expect((await check(1000, 5000, 21000, 1000)).state).toBe('admitted'); // exactly15s remains
    expect((await check(1000, 5001, 21000, 1000)).state).toBe('denied');
    expect((await check(1000, 1000, 21000, -1)).state).toBe('denied'); // monotonic regression
    expect((await check(1001, 1000, 21001, 0)).state).toBe('denied'); // impossible issued/database ordering
    expect((await check(1000, 1000, 21001, 0)).state).toBe('denied'); // backend widened policy interval
  });
  it('returns unavailable on a hung backend without waiting for cancellation', async () => {
    vi.useFakeTimers();
    try {
      let signal: AbortSignal | undefined;
      const pending = checkedClaim(invocation, { claim: async (_r, s) => { signal = s; return new Promise(() => {}); }, release: async () => {} });
      await vi.advanceTimersByTimeAsync(P.admissionDeadlineMs + 1);
      expect(await pending).toEqual({ state: 'denied', reason: 'unavailable', retryAfterSeconds: 60 }); expect(signal?.aborted).toBe(true);
    } finally { vi.useRealTimers(); }
  });
  it('validates source parent linkage before touching backend and strips response extras', async () => {
    const claim = vi.fn(async () => ({ state: 'admitted', databaseNowMs: 1000, lease: { id: invocation.invocationId, issuedAtMs: 1000, expiresAtMs: 21000, fence: 1, secret: 'must not return' } }));
    const store = { claim, release: async () => {} } as DistributedAdmission;
    expect((await checkedClaim({ ...invocation, kind: 'source_load' }, store, () => 1000)).state).toBe('denied'); expect(claim).not.toHaveBeenCalled();
    expect(await checkedClaim(invocation, store, () => 1000)).toEqual({ state: 'admitted', databaseNowMs: 1000, lease: { id: invocation.invocationId, issuedAtMs: 1000, expiresAtMs: 21000, fence: 1 } });
  });
  it('fixed safe operational metrics reject bodies, errors, emails, raw URLs and IDs', () => {
    const safe = { domain: 'freight', status: 'stale', duration: 'under_1s', requestBytes: 10, responseBytes: 20 };
    expect(operationalEvent(safe).event).toBe('nz_plugin_request');
    for (const extra of [{ body: 'fictional document' }, { error: new Error() }, { email: 'fixture@example.invalid' }, { url: 'https://private.invalid' }, { requestId: 'CALLER-ID' }]) expect(() => operationalEvent({ ...safe, ...extra })).toThrow();
    expect(() => operationalEvent({ ...safe, responseBytes: P.resultBytes + 1 })).toThrow();
  });
});

describe('all-attempt admission and log bounds', () => {
  it('caps rejected backend calls before RPC and rejects architecture in freight-first stage', async () => {
    const { boundedAdmissionCaller } = await import('../../security-proposals/nz-plugin-hosting/rejection-bounds');
    const claim = vi.fn(async () => ({ state: 'denied', reason: 'limit', retryAfterSeconds: 60 } as const));
    const caller = boundedAdmissionCaller({ claim, release: async () => {} }, () => 100);
    for (let i = 0; i < 1000; i++) await caller(invocation);
    expect(claim).toHaveBeenCalledTimes(60);
    expect((await caller({ ...invocation, domain: 'architecture' })).state).toBe('denied'); expect(claim).toHaveBeenCalledTimes(60);
  });
  it('bounds hung concurrent backend calls before timeout', async () => {
    const { boundedAdmissionCaller } = await import('../../security-proposals/nz-plugin-hosting/rejection-bounds');
    vi.useFakeTimers();
    try {
      const claim = vi.fn(async () => new Promise<never>(() => {}));
      const caller = boundedAdmissionCaller({ claim, release: async () => {} }, () => 100);
      const first = Array.from({ length: 4 }, () => caller(invocation));
      expect((await caller(invocation)).state).toBe('denied'); expect(claim).toHaveBeenCalledTimes(4);
      await vi.advanceTimersByTimeAsync(1001); expect((await Promise.all(first)).every(r => r.state === 'denied')).toBe(true);
    } finally { vi.useRealTimers(); }
  });
  it('bounds log-slot attempts and emits no body-bearing diagnostics on denied/uncertain backend', async () => {
    const { rejectionSummary } = await import('../../security-proposals/nz-plugin-hosting/rejection-bounds');
    let now = 100; const summary = rejectionSummary(() => now);
    const denied = vi.fn(async () => false);
    for (let i = 0; i < 10000; i++) { summary.add('denied'); expect(await summary.take({ claimGlobalLogSlot: denied })).toBe(null); }
    expect(denied).toHaveBeenCalledTimes(1);
    now += 60000;
    expect(await summary.take({ claimGlobalLogSlot: async () => { throw new Error('private diagnostic'); } })).toBe(null);
    now += 60000;
    expect(await summary.take({ claimGlobalLogSlot: async () => true })).toEqual({ event: 'nz_freight_rejections', denied: 10000, unavailable: 0 });
    expect(await summary.take({ claimGlobalLogSlot: async () => true })).toBe(null);
  });
});

it('closed dispatcher never invokes ordinary app/auth on plugin hosts, including static paths', async () => {
  const { closedHostDispatcher } = await import('../../security-proposals/nz-plugin-hosting/policy');
  const ordinary = vi.fn(async () => new Response('ordinary app'));
  for (const path of ['/mcp', '/login', '/api/do/personal', '/_next/static/x', '/support', P.challengePath]) {
    const response = await closedHostDispatcher(request(`https://${P.hosts.freight}${path}`), ordinary);
    expect([404, 405, 503]).toContain(response.status); expect(await response.text()).toBe('');
  }
  expect(ordinary).not.toHaveBeenCalled();
  expect(await (await closedHostDispatcher(request('https://assembl.co.nz/api/mcp'), ordinary)).text()).toBe('ordinary app');
  expect(ordinary).toHaveBeenCalledTimes(1);
});

it('hung log authority is aborted after one second and emits nothing', async () => {
  const { rejectionSummary } = await import('../../security-proposals/nz-plugin-hosting/rejection-bounds');
  vi.useFakeTimers();
  try {
    let signal: AbortSignal | undefined;
    const summary = rejectionSummary(() => 100);
    const pending = summary.take({ claimGlobalLogSlot: async (s) => { signal = s; return new Promise<boolean>(() => {}); } });
    await vi.advanceTimersByTimeAsync(1001);
    expect(await pending).toBe(null); expect(signal?.aborted).toBe(true);
  } finally { vi.useRealTimers(); }
});

it('noncooperative backend retains all four slots after timeout until real settlement', async () => {
  const { boundedAdmissionCaller } = await import('../../security-proposals/nz-plugin-hosting/rejection-bounds');
  vi.useFakeTimers();
  try {
    const finish: Array<(value: { state: 'denied'; reason: 'limit'; retryAfterSeconds: number }) => void> = [];
    const claim = vi.fn(() => new Promise<{ state: 'denied'; reason: 'limit'; retryAfterSeconds: number }>(resolve => finish.push(resolve)));
    const caller = boundedAdmissionCaller({ claim, release: async () => {} }, () => 100);
    const first = Array.from({ length: 4 }, () => caller(invocation));
    await vi.advanceTimersByTimeAsync(1001); await Promise.all(first);
    for (let i = 0; i < 8; i++) expect((await caller(invocation)).state).toBe('denied');
    expect(claim).toHaveBeenCalledTimes(4);
    finish[0]({ state: 'denied', reason: 'limit', retryAfterSeconds: 60 });
    await vi.advanceTimersByTimeAsync(0);
    const next = caller(invocation); expect(claim).toHaveBeenCalledTimes(5);
    finish[4]({ state: 'denied', reason: 'limit', retryAfterSeconds: 60 }); await next;
    for (const resolve of finish.slice(1, 4)) resolve({ state: 'denied', reason: 'limit', retryAfterSeconds: 60 });
  } finally { vi.useRealTimers(); }
});
it('noncooperative log authority retains its slot across minute windows', async () => {
  const { rejectionSummary } = await import('../../security-proposals/nz-plugin-hosting/rejection-bounds');
  vi.useFakeTimers();
  try {
    let now = 100;
    const claim = vi.fn(async () => new Promise<boolean>(() => {}));
    const summary = rejectionSummary(() => now);
    const first = summary.take({ claimGlobalLogSlot: claim });
    await vi.advanceTimersByTimeAsync(1001); expect(await first).toBe(null);
    now += 60000; expect(await summary.take({ claimGlobalLogSlot: claim })).toBe(null);
    expect(claim).toHaveBeenCalledTimes(1);
  } finally { vi.useRealTimers(); }
});

it('source issuance never outlives its parent and rechecks fresh post-lock time', async () => {
  const { proposedChildInterval } = await import('../../security-proposals/nz-plugin-hosting/policy');
  expect(proposedChildInterval(1000, 17000)).toEqual({ issuedAtMs: 1000, expiresAtMs: 17000 });
  expect(proposedChildInterval(2001, 17000)).toBe(null); // lock wait consumed minimum lifetime
  expect(proposedChildInterval(17000, 17000)).toBe(null);
  expect(proposedChildInterval(1000, 50000)).toEqual({ issuedAtMs: 1000, expiresAtMs: 21000 });
  expect(proposedChildInterval(2000, 17000)).toEqual({ issuedAtMs: 2000, expiresAtMs: 17000 });
});

it('separate freight entry is closed on every eligible route and denies every other host/path', async () => {
  const { closedFreightEntry, freightProjectProposal } = await import('../../security-proposals/nz-plugin-hosting/freight-entry');
  expect(freightProjectProposal.releaseEnabled).toBe(false); expect(freightProjectProposal.backendEnabled).toBe(false);
  for (const path of ['/mcp','/privacy','/terms','/support',P.challengePath]) {
    const response=await closedFreightEntry(new Request('https://'+P.hosts.freight+path,{method:path==='/mcp'?'POST':'GET'}));
    expect(response.status).toBe(503); expect(await response.text()).toBe('');
  }
  for (const url of ['https://assembl.co.nz/mcp','https://'+P.hosts.architecture+'/mcp','https://'+P.hosts.freight+'/_next/static/x','https://'+P.hosts.freight+'/api/mcp']) expect((await closedFreightEntry(new Request(url))).status).toBe(404);
});
