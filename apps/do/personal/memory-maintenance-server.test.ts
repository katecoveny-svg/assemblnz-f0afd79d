import { beforeEach, afterEach, expect, it, vi } from 'vitest';
vi.mock('@/lib/supabase/service', () => ({ getServiceClient: vi.fn() }));
import { getServiceClient } from '@/lib/supabase/service';
import { getPersonalMemoryPurgeHealth, maintainPersonalMemory } from './memory-maintenance-server';
const rpc = vi.fn(); const abortSignal = vi.fn();
beforeEach(() => { vi.resetAllMocks(); vi.stubEnv('DO_PERSONAL_MEMORY_PURGE_ENABLED','true'); vi.mocked(getServiceClient).mockReturnValue({rpc} as unknown as ReturnType<typeof getServiceClient>); rpc.mockReturnValue({abortSignal}); abortSignal.mockResolvedValue({ data:0,error:null }); });
afterEach(() => vi.unstubAllEnvs());
it('inactive maintenance never reads storage', async () => {
 vi.stubEnv('DO_PERSONAL_MEMORY_PURGE_ENABLED','false');
 expect(await maintainPersonalMemory()).toEqual({configured:false}); expect(rpc).not.toHaveBeenCalled();
});
it('records aggregate confirmed counts with bounded abort signals', async () => {
 expect(await maintainPersonalMemory()).toMatchObject({ configured:true,outcome:{status:'completed',purged:0,batches:1} });
 expect(rpc).toHaveBeenCalledWith('do_personal_memory_expire_batch',{p_limit:100});
 expect(rpc).toHaveBeenCalledWith('do_personal_memory_record_maintenance',expect.objectContaining({p_status:'completed',p_purged:0}));
 expect(abortSignal.mock.calls.every(([signal])=>signal instanceof AbortSignal)).toBe(true);
});
it('an uncertain purge failure records failure and is never retried', async () => {
 abortSignal.mockResolvedValueOnce({data:null,error:{message:'timeout'}}).mockResolvedValueOnce({data:null,error:null});
 expect(await maintainPersonalMemory()).toMatchObject({outcome:{status:'failed',purged:0}});
 expect(rpc).toHaveBeenCalledTimes(2);
});
it('monitoring write failure cannot confirm healthy maintenance', async () => {
 abortSignal.mockResolvedValueOnce({data:0,error:null}).mockResolvedValueOnce({data:null,error:{message:'missing'}});
 await expect(maintainPersonalMemory()).rejects.toThrow('monitoring unavailable');
});
it('missing or malformed monitoring fails closed', async () => {
 abortSignal.mockResolvedValueOnce({data:null,error:{message:'missing'}});
 await expect(getPersonalMemoryPurgeHealth()).rejects.toThrow();
 abortSignal.mockResolvedValueOnce({data:{status:'always_on'},error:null});
 await expect(getPersonalMemoryPurgeHealth()).rejects.toThrow();
});
