import { beforeEach, expect, it, vi } from 'vitest';
vi.mock('@/lib/supabase/service', () => ({ getServiceClient: vi.fn() }));
import { getServiceClient } from '@/lib/supabase/service';
import { loadCloudChecklists, saveCloudChecklists, ChecklistConflict } from './cloud-service';
const db = { from: vi.fn(), rpc: vi.fn() };
const query = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn() };
const owner = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
beforeEach(() => { vi.resetAllMocks(); vi.mocked(getServiceClient).mockReturnValue(db as unknown as ReturnType<typeof getServiceClient>); db.from.mockReturnValue(query); query.select.mockReturnValue(query); query.eq.mockReturnValue(query); });
it('always filters reads by the verified owner and only returns a default for an absent row', async () => {
 query.maybeSingle.mockResolvedValue({ data: null, error: null });
 expect(await loadCloudChecklists(owner)).toEqual({ plans: [], revision: 0, savedAt: null });
 expect(query.eq).toHaveBeenCalledWith('owner_id', owner);
 query.maybeSingle.mockResolvedValue({ data: null, error: { message: 'unavailable' } });
 await expect(loadCloudChecklists(owner)).rejects.toThrow();
});
it('uses the atomic RPC for save and distinguishes revision conflicts', async () => {
 const input = { plans: [], expectedRevision: 4, consent: true as const };
 db.rpc.mockResolvedValue({ data: { plans: [], revision: 5, savedAt: '2026-09-30T00:00:00Z' }, error: null });
 expect((await saveCloudChecklists(owner, input)).revision).toBe(5);
 expect(db.rpc).toHaveBeenCalledWith('do_personal_save_checklists', { p_owner: owner, p_plans: [], p_expected_revision: 4 });
 db.rpc.mockResolvedValue({ data: null, error: { message: 'checklist_conflict' } });
 await expect(saveCloudChecklists(owner, input)).rejects.toBeInstanceOf(ChecklistConflict);
 db.rpc.mockResolvedValue({ data: { plans: 'invalid' }, error: null });
 await expect(saveCloudChecklists(owner, input)).rejects.toThrow();
});
