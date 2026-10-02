import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {recoverTrial} from './public-store';
beforeEach(()=>{vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL','https://storage.example');vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY','test-only');});
afterEach(()=>vi.unstubAllGlobals());
describe('read-only recovery storage query',()=>{
 it('uses only GET and matches request, principal and frozen input, including missing rows',async()=>{
  const fetcher=vi.fn<typeof fetch>(async()=>Response.json([]));vi.stubGlobal('fetch',fetcher);
  expect(await recoverTrial('request-id','owner-hash','input-hash')).toEqual({status:'not_found'});
  expect(fetcher).toHaveBeenCalledTimes(1);
  const [url,init]=fetcher.mock.calls[0];expect(init?.method).toBe('GET');expect(init?.body).toBeUndefined();
  const params=new URL(String(url)).searchParams;expect(params.get('id')).toBe('eq.request-id');expect(params.get('principal_hash')).toBe('eq.owner-hash');expect(params.get('input_hash')).toBe('eq.input-hash');expect(params.get('select')).toBe('state,result');expect(String(url)).not.toContain('/rpc/');
 });
 for(const state of ['pending','failed'])it(`returns only status for ${state} rows`,async()=>{
  vi.stubGlobal('fetch',vi.fn(async()=>Response.json([{state,result:null}])));expect(await recoverTrial('id','owner','hash')).toEqual({status:state});
 });
 it('only returns a saved complete result',async()=>{
  const result={mode:'live',draft:{title:'Saved result'}};vi.stubGlobal('fetch',vi.fn(async()=>Response.json([{state:'complete',result}])));
  expect(await recoverTrial('id','owner','hash')).toEqual({status:'replay',result});
 });
});
