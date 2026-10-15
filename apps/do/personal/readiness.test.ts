import { beforeEach, describe, expect, it, vi } from 'vitest';
const db = vi.hoisted(() => ({ rpc: vi.fn(), abort: vi.fn() }));
vi.mock('@/lib/supabase/service', () => ({ getServiceClient: () => ({ rpc: db.rpc }) }));
import { persistenceReadiness } from './readiness';
const owner = { id: '11111111-1111-4111-8111-111111111111', externalId: 'do:user:11111111-1111-4111-8111-111111111111' };
const other = { id: '22222222-2222-4222-8222-222222222222', externalId: 'do:user:22222222-2222-4222-8222-222222222222' };
beforeEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); db.rpc.mockReturnValue({ abortSignal: db.abort }); db.abort.mockResolvedValue({ data: true, error: null }); });
describe('content-free persistence diagnostics', () => {
  it('does no database operation when activation is off', async () => {
    const responsibilityReady = vi.fn();
    expect(await persistenceReadiness(owner, new AbortController().signal, { enabled: () => false, responsibilityReady })).toMatchObject({ memory: 'activation_off', conversations: 'activation_off', responsibilities: 'activation_off', contentRead: false, writesPerformed: false, cleanupPerformed: false, saveReopenVerified: false });
    expect(responsibilityReady).not.toHaveBeenCalled(); expect(db.rpc).not.toHaveBeenCalled();
  });
  it.each([owner, other])('binds the only allowed SELECT-only RPC to owner $id', async current => {
    vi.stubEnv('DO_PERSONAL_RESPONSIBILITY_STORAGE_ENABLED', 'true');
    vi.stubEnv('DO_PERSONAL_MEMORY_ENABLED', 'true'); vi.stubEnv('DO_PERSONAL_CONVERSATIONS_ENABLED', 'true');
    const signal = new AbortController().signal;
    expect(await persistenceReadiness(current, signal)).toMatchObject({ ownerId: current.id, responsibilities: 'owner_ready', memory: 'configured_unverified', conversations: 'configured_unverified', saveReopenVerified: false });
    expect(db.rpc.mock.calls).toEqual([['do_personal_storage_ready', { p_owner: current.id }]]);
    expect(db.abort).toHaveBeenCalledWith(signal);
  });
  it('rejects invalid/conflicting owners before any DB operation', async () => {
    await expect(persistenceReadiness({ ...owner, externalId: other.externalId }, new AbortController().signal)).rejects.toThrow('owner_changed');
    expect(db.rpc).not.toHaveBeenCalled();
  });
  it.each([false, null])('keeps failed or unavailable readiness distinct: %s', async ready => {
    const result = await persistenceReadiness(owner, new AbortController().signal, { enabled: () => true, responsibilityReady: async () => ready });
    expect(result.responsibilities).toBe(ready === false ? 'owner_not_ready' : 'unavailable');
  });
  it('sanitises errors and rejects cancelled or late results', async () => {
    const ports = { enabled: () => true, responsibilityReady: vi.fn().mockRejectedValue(new Error('private detail')) };
    expect(JSON.stringify(await persistenceReadiness(owner, new AbortController().signal, ports))).not.toContain('private detail');
    const c = new AbortController(); ports.responsibilityReady.mockImplementation(async () => { c.abort(); return true; });
    await expect(persistenceReadiness(owner, c.signal, ports)).rejects.toThrow();
    ports.responsibilityReady.mockClear();
    await expect(persistenceReadiness(owner, c.signal, ports)).rejects.toThrow();
    expect(ports.responsibilityReady).not.toHaveBeenCalled();
  });
});
