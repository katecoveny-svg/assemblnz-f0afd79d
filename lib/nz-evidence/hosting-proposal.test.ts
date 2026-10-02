import { describe, expect, it, vi } from 'vitest';
import { HOSTING_PROPOSAL as P, checkedClaim, closedAdmission, inspectProposedRequest, operationalEvent, type DistributedAdmission } from '../../security-proposals/nz-plugin-hosting/policy';
const request = (url = 'https://nz-freight.assembl.co.nz/mcp', headers: Record<string, string> = {}, method = 'POST') => new Request(url, { method, headers: { 'Content-Type': 'application/json', ...headers } });
const invocation = { policy: P.version, invocationId: '11111111-1111-4111-8111-111111111111', domain: 'freight', kind: 'mcp' } as const;
describe('inactive public hosting contract', () => {
  it('allows only exact proposed HTTPS host/path, with same or absent Origin', () => {
    expect(inspectProposedRequest(request())).toEqual({ state: 'eligible', domain: 'freight' });
    expect(inspectProposedRequest(request('https://nz-rfi.assembl.co.nz/mcp', { Origin: 'https://nz-rfi.assembl.co.nz' }))).toEqual({ state: 'eligible', domain: 'architecture' });
    for (const u of ['http://nz-freight.assembl.co.nz/mcp', 'https://evil.invalid/mcp', 'https://nz-freight.assembl.co.nz/mcp?token=x', 'https://nz-freight.assembl.co.nz/mcp/', 'https://nz-freight.assembl.co.nz:444/mcp', 'https://nz-freight.assembl.co.nz/%6dcp']) expect(inspectProposedRequest(request(u)).state).toBe('denied');
    for (const Origin of ['null', 'https://chatgpt.com', 'https://evil.invalid', 'https://nz-rfi.assembl.co.nz']) expect(inspectProposedRequest(request(undefined, { Origin })).state).toBe('denied');
  });
  it('rejects private account/session headers and misleading JSON/length values', () => {
    for (const h of ([{ Authorization: 'fixture-only' }, { Cookie: 'fixture-only' }, { 'mcp-session-id': 'fixture-only' }, { 'Content-Type': 'application/json-evil' }, { 'Content-Length': '1048577' }, { 'Content-Length': '-1' }] as Record<string, string>[])) expect(inspectProposedRequest(request(undefined, h)).state).toBe('denied');
    for (const m of ['GET', 'OPTIONS', 'DELETE']) expect(inspectProposedRequest(request(undefined, {}, m))).toEqual({ state: 'denied', status: 405 });
    expect(inspectProposedRequest(request(undefined, { 'Content-Type': 'application/json; charset=utf-8' })).state).toBe('eligible');
  });
  it('default admission is closed, with no ambient provider or fallback', async () => {
    expect(await checkedClaim(invocation, 1000)).toEqual({ state: 'denied', reason: 'closed', retryAfterSeconds: 60 });
    await expect(closedAdmission.release({ id: invocation.invocationId, expiresAtMs: 2000, fence: 1 })).rejects.toThrow();
  });
  it('backend errors and malformed/expired/overlong leases never admit', async () => {
    const good = { state: 'admitted', lease: { id: invocation.invocationId, expiresAtMs: 21000, fence: 1 } } as const;
    for (const result of [undefined, { ...good, lease: { ...good.lease, expiresAtMs: 1000 } }, { ...good, lease: { ...good.lease, expiresAtMs: 21001 } }, { ...good, lease: { ...good.lease, fence: 0 } }, { state: 'denied', reason: 'limit', retryAfterSeconds: Infinity }]) {
      const store = { claim: async () => result, release: async () => {} } as unknown as DistributedAdmission;
      expect((await checkedClaim(invocation, 1000, store)).state).toBe('denied');
    }
    expect((await checkedClaim(invocation, 1000, { claim: async () => { throw new Error('private upstream body'); }, release: async () => {} })).state).toBe('denied');
  });
  it('returns unavailable on a hung backend without waiting for cancellation', async () => {
    vi.useFakeTimers();
    try {
      let signal: AbortSignal | undefined;
      const pending = checkedClaim(invocation, 1000, { claim: async (_r, s) => { signal = s; return new Promise(() => {}); }, release: async () => {} });
      await vi.advanceTimersByTimeAsync(P.admissionDeadlineMs + 1);
      expect(await pending).toEqual({ state: 'denied', reason: 'unavailable', retryAfterSeconds: 60 }); expect(signal?.aborted).toBe(true);
    } finally { vi.useRealTimers(); }
  });
  it('validates source parent linkage before touching backend and strips response extras', async () => {
    const claim = vi.fn(async () => ({ state: 'admitted', lease: { id: invocation.invocationId, expiresAtMs: 21000, fence: 1, secret: 'must not return' } }));
    const store = { claim, release: async () => {} } as DistributedAdmission;
    expect((await checkedClaim({ ...invocation, kind: 'source_load' }, 1000, store)).state).toBe('denied'); expect(claim).not.toHaveBeenCalled();
    expect(await checkedClaim(invocation, 1000, store)).toEqual({ state: 'admitted', lease: { id: invocation.invocationId, expiresAtMs: 21000, fence: 1 } });
  });
  it('fixed safe operational metrics reject bodies, errors, emails, raw URLs and IDs', () => {
    const safe = { domain: 'freight', status: 'stale', duration: 'under_1s', requestBytes: 10, responseBytes: 20 };
    expect(operationalEvent(safe).event).toBe('nz_plugin_request');
    for (const extra of [{ body: 'fictional document' }, { error: new Error() }, { email: 'fixture@example.invalid' }, { url: 'https://private.invalid' }, { requestId: 'CALLER-ID' }]) expect(() => operationalEvent({ ...safe, ...extra })).toThrow();
    expect(() => operationalEvent({ ...safe, responseBytes: P.resultBytes + 1 })).toThrow();
  });
});
