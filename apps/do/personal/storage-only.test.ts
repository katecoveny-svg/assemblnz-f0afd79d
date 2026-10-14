import { beforeEach, afterEach, expect, it, vi } from 'vitest';
vi.mock('@/lib/supabase/service',()=>({getServiceClient:vi.fn()}));
vi.mock('@/lib/supabase/server',()=>({createClient:vi.fn()}));
import {getServiceClient} from '@/lib/supabase/service';
import {savePersonal,PersonalStorageConflict,personalStorageAvailable,personalWorkerConfigured,runPersonal} from './service';
const owner='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', id='11111111-1111-4111-8111-111111111111';
const input={action:'save' as const,id,title:'Fictional checklist',goal:'Review a fictional checklist',notes:'Synthetic example only',timezone:'Pacific/Auckland',localHour:7,consent:true as const,expectedRevision:0};
const rpc=vi.fn();
beforeEach(()=>{vi.resetAllMocks();vi.stubEnv('DO_PERSONAL_RESPONSIBILITY_STORAGE_ENABLED','true');vi.mocked(getServiceClient).mockReturnValue({rpc} as unknown as ReturnType<typeof getServiceClient>);rpc.mockImplementation(async(name)=>({data:name==='do_personal_storage_ready'?true:id,error:null}));});
afterEach(()=>vi.unstubAllEnvs());
it('saves through paused owner RPC without a provider or execution lease',async()=>{expect(await savePersonal(owner,input)).toBe(id);expect(rpc).toHaveBeenCalledWith('do_personal_save_paused',{p_owner:owner,p_id:id,p_title:input.title,p_goal:input.goal,p_notes:input.notes,p_timezone:input.timezone,p_hour:7,p_expected_revision:0});expect(rpc.mock.calls.map(c=>c[0])).toEqual(['do_personal_storage_ready','do_personal_save_paused']);expect(personalWorkerConfigured()).toBe(false);await expect(runPersonal(owner,id)).rejects.toThrow('renewed OpenAI');expect(rpc).toHaveBeenCalledTimes(2);});
it('carries reopened revision and rejects stale edits',async()=>{rpc.mockImplementation(async(name)=>name==='do_personal_storage_ready'?{data:true,error:null}:{data:null,error:{message:'responsibility_conflict'}});await expect(savePersonal(owner,{...input,id,expectedRevision:4})).rejects.toBeInstanceOf(PersonalStorageConflict);expect(rpc.mock.calls[1][1]).toMatchObject({p_owner:owner,p_id:id,p_expected_revision:4});});
it('fails closed with disabled flag, no owner, unenrolled owner or storage error',async()=>{vi.stubEnv('DO_PERSONAL_RESPONSIBILITY_STORAGE_ENABLED','false');expect(await personalStorageAvailable(owner)).toBe(false);expect(rpc).not.toHaveBeenCalled();vi.stubEnv('DO_PERSONAL_RESPONSIBILITY_STORAGE_ENABLED','true');await expect(savePersonal('',input)).rejects.toThrow('Owner required');rpc.mockResolvedValue({data:false,error:null});await expect(savePersonal(owner,input)).rejects.toThrow('unavailable');rpc.mockRejectedValue(new Error('Synthetic unavailable'));expect(await personalStorageAvailable(owner)).toBe(false);expect(rpc.mock.calls.every(c=>c[0]==='do_personal_storage_ready')).toBe(true);});
it('does not confirm an interrupted or malformed save',async()=>{rpc.mockImplementation(async(name)=>name==='do_personal_storage_ready'?{data:true,error:null}:{data:null,error:null});await expect(savePersonal(owner,input)).rejects.toThrow('No save was confirmed');});

it.each(['true','false'])('reads only cookie-RLS-visible responsibilities with collection=%s and failed cleanup, retaining legacy rows',async flag=>{
 vi.stubEnv('DO_PERSONAL_RESPONSIBILITY_STORAGE_ENABLED',flag);vi.stubEnv('DO_PERSONAL_RESPONSIBILITY_PURGE_ENABLED','false');
 const {personalState}=await import('./service');const {createClient}=await import('@/lib/supabase/server');
 const legacy={id,notes:'Synthetic legacy retained'},live={id:'22222222-2222-4222-8222-222222222222',notes:'Synthetic unexpired pilot'};
 // Model the installed policy result, not a PostgreSQL execution claim.
 const tasks={select:vi.fn().mockReturnThis(),eq:vi.fn().mockReturnThis(),order:vi.fn().mockResolvedValue({data:[legacy,live],error:null})};
 const runs={select:vi.fn().mockReturnThis(),eq:vi.fn().mockReturnThis(),order:vi.fn().mockReturnThis(),limit:vi.fn().mockResolvedValue({data:[],error:null})};
 const worker={select:vi.fn().mockReturnThis(),eq:vi.fn().mockReturnThis(),single:vi.fn().mockResolvedValue({data:{last_seen_at:null},error:null})};
 const from=vi.fn().mockImplementation(name=>{if(name!=='do_personal_worker')throw new Error('Service-role body read would expose expired synthetic notes');return worker;});
 rpc.mockResolvedValue({data:false,error:{message:'Synthetic cleanup failure'}});
 vi.mocked(getServiceClient).mockReturnValue({rpc,from} as unknown as ReturnType<typeof getServiceClient>);
 const ownerFrom=vi.fn().mockImplementation(name=>name==='do_personal_responsibilities'?tasks:runs);
 vi.mocked(createClient).mockResolvedValue({from:ownerFrom} as unknown as Awaited<ReturnType<typeof createClient>>);
 const state=await personalState(owner);expect(state.responsibilities).toEqual([legacy,live]);expect(state.storage?.available).toBe(false);
 expect(ownerFrom).toHaveBeenCalledWith('do_personal_responsibilities');expect(tasks.eq).toHaveBeenCalledWith('owner_id',owner);expect(from.mock.calls.map(c=>c[0])).toEqual(['do_personal_worker']);
 if(flag==='false')expect(rpc).not.toHaveBeenCalled();
});
it('legacy-only pre-proposal schema reads do not request new columns, RPCs or a service fallback',async()=>{
 vi.stubEnv('DO_PERSONAL_RESPONSIBILITY_STORAGE_ENABLED','false');const {personalState}=await import('./service');const {createClient}=await import('@/lib/supabase/server');
 const tasks={select:vi.fn().mockReturnThis(),eq:vi.fn().mockReturnThis(),order:vi.fn().mockResolvedValue({data:[{id,notes:'Synthetic legacy only'}],error:null})};
 const runs={select:vi.fn().mockReturnThis(),eq:vi.fn().mockReturnThis(),order:vi.fn().mockReturnThis(),limit:vi.fn().mockResolvedValue({data:[],error:null})};
 const worker={select:vi.fn().mockReturnThis(),eq:vi.fn().mockReturnThis(),single:vi.fn().mockResolvedValue({data:{last_seen_at:null},error:null})};
 vi.mocked(getServiceClient).mockReturnValue({rpc,from:vi.fn().mockReturnValue(worker)} as unknown as ReturnType<typeof getServiceClient>);
 vi.mocked(createClient).mockResolvedValue({from:vi.fn().mockImplementation(name=>name==='do_personal_responsibilities'?tasks:runs)} as unknown as Awaited<ReturnType<typeof createClient>>);
 expect((await personalState(owner)).responsibilities).toEqual([{id,notes:'Synthetic legacy only'}]);expect(tasks.select.mock.calls[0][0]).not.toContain('storage_body_expires_at');expect(rpc).not.toHaveBeenCalled();
});
it('independent cleanup remains off without its flag and records confirmed bounded cleanup',async()=>{
 const {maintainPersonalResponsibilityStorage}=await import('./service');expect(await maintainPersonalResponsibilityStorage()).toEqual({configured:false});expect(rpc).not.toHaveBeenCalled();
 vi.stubEnv('DO_PERSONAL_RESPONSIBILITY_PURGE_ENABLED','true');rpc.mockImplementation(name=>({abortSignal:async()=>({data:name==='do_personal_storage_expire_batch'?0:true,error:null})}));
 const result=await maintainPersonalResponsibilityStorage();expect(result.configured).toBe(true);expect(rpc.mock.calls.map(c=>c[0])).toEqual(['do_personal_storage_expire_batch','do_personal_storage_record_maintenance']);expect(rpc.mock.calls[0][1]).toEqual({p_limit:100});
});
