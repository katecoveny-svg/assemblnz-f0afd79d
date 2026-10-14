import { beforeEach, afterEach, expect, it, vi } from 'vitest';
vi.mock('@/lib/supabase/service', () => ({ getServiceClient: vi.fn() }));
import { getServiceClient } from '@/lib/supabase/service';
import { loadPersonalMemory, mutatePersonalMemory, MemoryConflict } from './memory-service';
import { nextMemoryRecord } from './memory';
const owner = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const input = { action: 'save' as const, id: '11111111-1111-4111-8111-111111111111', expectedRevision: 0, subject: 'self' as const, kind: 'routine' as const, text: 'Fictional project morning review.', source: 'owner_entered' as const, observedAt: '2026-01-01T00:00:00Z', retentionDays: 7 as const, active: true, consent: true as const, noticeVersion: 1 as const, selfOnly: true as const, nonSensitive: true as const };
const db = { from: vi.fn(), rpc: vi.fn() };
const query = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn(), then: vi.fn() };
beforeEach(() => {
 vi.resetAllMocks(); vi.stubEnv('DO_PERSONAL_MEMORY_ENABLED', 'true');
 vi.mocked(getServiceClient).mockReturnValue(db as unknown as ReturnType<typeof getServiceClient>);
 db.from.mockReturnValue(query); query.select.mockReturnValue(query); query.eq.mockReturnValue(query);
 query.maybeSingle.mockResolvedValue({ data: null, error: null });
 query.then.mockImplementation((resolve) => resolve({ data: [], error: null }));
 db.rpc.mockResolvedValue({ data: true, error: null });
});
afterEach(() => vi.unstubAllEnvs());
it('fails closed before DB access when disabled or owner missing', async () => {
 await expect(loadPersonalMemory('')).rejects.toThrow();
 vi.stubEnv('DO_PERSONAL_MEMORY_ENABLED', 'false');
 await expect(mutatePersonalMemory(owner, input)).rejects.toThrow();
 expect(getServiceClient).not.toHaveBeenCalled();
});
it('binds both read and CAS write to the verified owner', async () => {
 const record = await mutatePersonalMemory(owner, input);
 expect(query.eq).toHaveBeenCalledWith('owner_id', owner);
 expect(query.eq).toHaveBeenCalledWith('id', input.id);
 expect(db.rpc).toHaveBeenCalledWith('do_personal_memory_change', { p_owner: owner, p_id: input.id, p_expected_revision: 0, p_record: record });
});
it('rejects storage failure and concurrent CAS conflict without confirming save', async () => {
 query.maybeSingle.mockResolvedValueOnce({ data: null, error: { message: 'missing' } });
 await expect(mutatePersonalMemory(owner, input)).rejects.toThrow('storage unavailable');
 db.rpc.mockResolvedValue({ data: false, error: { message: 'memory_conflict' } });
 await expect(mutatePersonalMemory(owner, input)).rejects.toBeInstanceOf(MemoryConflict);
});
it('never resurrects a deleted record ID after restart or delayed retry', async () => {
 query.maybeSingle.mockResolvedValue({ data: JSON.parse(JSON.stringify({ record: null, revision: 2 })), error: null });
 await expect(mutatePersonalMemory(owner, input)).rejects.toBeInstanceOf(MemoryConflict);
 expect(db.rpc).not.toHaveBeenCalled();
});
it('purges only this owner and excludes expired records even if purge is delayed', async () => {
 const expired = nextMemoryRecord(input, null, '2026-01-01T00:00:00Z');
 query.then.mockImplementation(resolve => resolve({ data: [{ record: expired }, { record: null }], error: null }));
 expect(await loadPersonalMemory(owner)).toEqual([]);
 expect(db.rpc).toHaveBeenCalledWith('do_personal_memory_purge', { p_owner: owner });
 expect(query.eq).toHaveBeenCalledWith('owner_id', owner);
});
it('fails closed if retention cleanup is unavailable', async () => {
 db.rpc.mockResolvedValue({ data: null, error: { message: 'missing RPC' } });
 await expect(loadPersonalMemory(owner)).rejects.toThrow('storage unavailable');
 expect(db.from).not.toHaveBeenCalled();
});
