import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createVoiceLeaseService, type Ledger, type LeaseStore, type LeasePorts } from './service';
import { voiceLeaseRequest } from '@/apps/do/shared/voice-lease';
import { recordTrustedVoiceUsage } from './usage';
let state: Map<string, Ledger>, now: number, ports: LeasePorts, store: LeaseStore;
const revision = 'a'.repeat(64);
beforeEach(() => {
  state = new Map(); now = Date.parse('2026-10-14T22:00:00Z');
  store = { async transact(owner, change) {
    const draft = structuredClone(state.get(owner) ?? { quotes: [], leases: [] });
    const result = change(draft); state.set(owner, draft); return result;
  } };
  ports = { store, now: () => now,
    funding: vi.fn(async () => ({ enabled: true, revision: 'pilot-reviewed-v1', dailySeconds: 900 })),
    binding: vi.fn(async () => ({ revision, model: 'gemini-3.8-live', voiceName: 'Kore', config: { systemInstruction: 'server-only', sessionResumption: {}, contextWindowCompression: { slidingWindow: {} } } })),
    issue: vi.fn(async () => ({ token: 'fictional-token' })),
  };
});
async function quote(service = createVoiceLeaseService(ports), owner = 'alice', seconds: 300|600|900 = 300) {
  const result = await service.handle(owner, { action: 'quote', voiceRevision: revision, requestedSeconds: seconds });
  if (!('quote' in result)) throw new Error('missing quote');
  return result.quote;
}
async function start(service = createVoiceLeaseService(ports), owner = 'alice', seconds: 300|600|900 = 300) {
  const q = await quote(service, owner, seconds);
  const result = await service.handle(owner, { action: 'start', quoteId: q.quoteId, requestId: crypto.randomUUID(), consent: true });
  if (!('token' in result)) throw new Error('missing token');
  return result;
}
describe('logical voice lease admission and same-token resume', () => {
  it('reserves one reviewed fifteen-minute call, freezes config and never extends on resume', async () => {
    const service = createVoiceLeaseService(ports), before = now;
    const call = await start(service, 'alice', 900);
    expect(call.expiresAt).toBe(before + 900000);
    expect(call.config.sessionResumption).toEqual({});
    now += 600000;
    expect(await service.handle('alice', { action: 'resume', leaseId: call.leaseId })).toEqual({ resumeAllowed: true, leaseId: call.leaseId, expiresAt: before + 900000, reuseExistingToken: true });
    expect(ports.issue).toHaveBeenCalledTimes(1);
    now = before + 900000;
    await expect(service.handle('alice', { action: 'resume', leaseId: call.leaseId })).rejects.toMatchObject({ code: 'lease_unavailable' });
    await expect(start(service)).rejects.toMatchObject({ code: 'allowance_exhausted' });
  });
  it('quotes expose exact included funding/duration but not the system prompt', async () => {
    const q = await quote(undefined, 'alice', 600);
    expect(q).toMatchObject({ requestedSeconds: 600, funding: 'assembl_included', additionalChargeCents: 0, usageBasis: 'reserved_connection_seconds' });
    expect(JSON.stringify(q)).not.toContain('server-only');
  });
  it('isolates owners and prevents overlapping admissions or quote replay', async () => {
    const service = createVoiceLeaseService(ports), q = await quote(service);
    const request = { action: 'start' as const, quoteId: q.quoteId, requestId: crypto.randomUUID(), consent: true as const };
    const results = await Promise.allSettled([service.handle('alice', request), service.handle('alice', request)]);
    expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
    expect(ports.issue).toHaveBeenCalledTimes(1);
    const lease = state.get('alice')!.leases[0];
    await expect(service.handle('bob', { action: 'resume', leaseId: lease.id })).rejects.toMatchObject({ code: 'lease_unavailable' });
    await expect(service.handle('bob', { action: 'revoke', leaseId: lease.id })).rejects.toMatchObject({ code: 'lease_unavailable' });
    await expect(start(service)).rejects.toMatchObject({ code: 'call_already_active' });
    expect((await start(service, 'bob')).token).toBeTruthy();
  });
  it('requires a new quote after voice/funding change and rejects expired quotes', async () => {
    const service = createVoiceLeaseService(ports), q = await quote(service);
    now += 60000;
    await expect(service.handle('alice', { action: 'start', quoteId: q.quoteId, requestId: crypto.randomUUID(), consent: true })).rejects.toMatchObject({ code: 'quote_expired' });
    const fresh = await quote(service);
    vi.mocked(ports.funding).mockResolvedValue({ enabled: true, revision: 'v2', dailySeconds: 900 });
    await expect(service.handle('alice', { action: 'start', quoteId: fresh.quoteId, requestId: crypto.randomUUID(), consent: true })).rejects.toMatchObject({ code: 'review_changed' });
    expect(ports.issue).not.toHaveBeenCalled();
  });
  it('discards late tokens after revoke and retains the reservation', async () => {
    let deliver!: (v: { token: string }) => void;
    ports.issue = () => new Promise(resolve => { deliver = resolve; });
    const service = createVoiceLeaseService(ports), q = await quote(service);
    const pending = service.handle('alice', { action: 'start', quoteId: q.quoteId, requestId: crypto.randomUUID(), consent: true });
    await vi.waitFor(() => expect(deliver).toBeTypeOf('function'));
    const id = state.get('alice')!.leases[0].id;
    await service.handle('alice', { action: 'revoke', leaseId: id });
    deliver({ token: 'late-token' });
    await expect(pending).rejects.toMatchObject({ code: 'issuance_unavailable' });
    expect(state.get('alice')!.leases[0]).toMatchObject({ status: 'revoked', seconds: 300 });
  });
  it('does not credit ambiguous provider failures or accept a larger allowance', async () => {
    vi.mocked(ports.issue).mockRejectedValue(new Error('ambiguous timeout'));
    await expect(start(undefined, 'alice', 900)).rejects.toMatchObject({ code: 'issuance_unavailable' });
    expect(state.get('alice')!.leases[0]).toMatchObject({ status: 'failed', seconds: 900 });
    await expect(start()).rejects.toMatchObject({ code: 'allowance_exhausted' });
    vi.mocked(ports.funding).mockResolvedValue({ enabled: true, revision: 'v1', dailySeconds: 999999 });
    await expect(quote()).rejects.toMatchObject({ code: 'funding_unavailable' });
  });
  it('schema rejects client funding, usage credits, handles and missing consent', () => {
    expect(voiceLeaseRequest.safeParse({ action: 'quote', requestedSeconds: 900, voiceRevision: revision, dailySeconds: 9000 }).success).toBe(false);
    expect(voiceLeaseRequest.safeParse({ action: 'resume', leaseId: crypto.randomUUID(), handle: 'foreign' }).success).toBe(false);
    expect(voiceLeaseRequest.safeParse({ action: 'start', quoteId: crypto.randomUUID(), requestId: crypto.randomUUID() }).success).toBe(false);
    expect(voiceLeaseRequest.safeParse({ action: 'usage', credits: 100 }).success).toBe(false);
  });
  it('ingests only independently verified usage once, without refunding reservations', async () => {
    const call = await start();
    const receipt = { owner: 'alice', leaseId: call.leaseId, receiptId: 'provider-event-1', inputTokens: 100, outputTokens: 50 };
    const trusted = { verify: vi.fn(async () => receipt) };
    expect(await recordTrustedVoiceUsage(store, trusted, 'signed-export')).toEqual({ recorded: true });
    expect(await recordTrustedVoiceUsage(store, trusted, 'signed-export')).toEqual({ recorded: false });
    trusted.verify.mockResolvedValue({ ...receipt, inputTokens: 99 });
    await expect(recordTrustedVoiceUsage(store, trusted, '')).rejects.toMatchObject({ code: 'usage_conflict' });
    await expect(recordTrustedVoiceUsage(store, { verify: async () => { throw new Error('not verified'); } }, { usageMetadata: {} })).rejects.toThrow('not verified');
    expect(state.get('alice')!.leases[0].seconds).toBe(300);
  });
});
