import {describe,it,expect,vi,beforeEach} from 'vitest';
import {emptyOwnerHub,ownerWorkspaceEnabled,parseOwnerDraft} from './owner-policy';
import {newOwnerIdea} from './owner-idea';
const session=vi.hoisted(()=>({value:null as unknown}));
vi.mock('./owner-session',()=>({ownerSession:async()=>session.value}));
import {GET,POST} from '@/app/api/client-hub-migration/owner/route';
const id='11111111-1111-4111-8111-111111111111';
describe('new owner workspace boundary',()=>{
 beforeEach(()=>{session.value=null;});
 it('is off without flag, exact allowlist or non-anonymous verified user',()=>{
  expect(ownerWorkspaceEnabled(undefined,id,{id})).toBe(false);
  expect(ownerWorkspaceEnabled('1','another',{id})).toBe(false);
  expect(ownerWorkspaceEnabled('1',id,{id,is_anonymous:true})).toBe(false);
  expect(ownerWorkspaceEnabled('1',id,{id})).toBe(true);
 });
 it('starts without client records, selected concepts or checked sources and creates an owner-authored idea',()=>{
  const h=emptyOwnerHub();expect(h.sources).toEqual([]);expect(h.engine?.concepts).toEqual([]);expect(h.research).toBe('');expect(h.design.frame.artwork).toBeUndefined();
  expect(newOwnerIdea(h).origin).toBe('owner draft');
 });
 it('rejects identity injection and invalid revision instead of trusting browser ownership',()=>{
  expect(()=>parseOwnerDraft({owner_user_id:id,revision:0,payload:emptyOwnerHub()})).toThrow();
  expect(()=>parseOwnerDraft({id,revision:0,payload:emptyOwnerHub()})).toThrow();
  expect(parseOwnerDraft({revision:0,payload:emptyOwnerHub()}).payload).toEqual(emptyOwnerHub());
 });
 it('denies disabled/unauthenticated reads without exposing existence or caching',async()=>{
  const r=await GET(new Request('https://www.assembl.co.nz/api/client-hub-migration/owner?id='+id));
  expect(r.status).toBe(404);expect(r.headers.get('cache-control')).toBe('private, no-store');
 });
 it('rejects missing/cross origin before session storage work',async()=>{
  const r=await POST(new Request('https://www.assembl.co.nz/api/client-hub-migration/owner',{method:'POST',headers:{origin:'https://elsewhere.example','content-type':'application/json'},body:JSON.stringify({revision:0,payload:emptyOwnerHub()})}));expect(r.status).toBe(403);
 });
 it('uses current cookie identity and RPC revision; no owner selected from request',async()=>{
  const rpc=vi.fn(async()=>({data:[{id,revision:1,updated_at:new Date().toISOString(),payload:emptyOwnerHub()}],error:null}));
  session.value={userId:id,client:{rpc}};
  const r=await POST(new Request('https://www.assembl.co.nz/api/client-hub-migration/owner',{method:'POST',headers:{origin:'https://www.assembl.co.nz','content-type':'application/json'},body:JSON.stringify({revision:0,payload:emptyOwnerHub()})}));
  expect(r.status).toBe(200);expect(rpc).toHaveBeenCalledWith('studio_save_owner_draft',{p_id:null,p_revision:0,p_payload:emptyOwnerHub()});
 });
 it('returns conflict for unavailable/stale updates without inserting replacement rows',async()=>{
  session.value={userId:id,client:{rpc:async()=>({data:[],error:null})}};
  const r=await POST(new Request('https://www.assembl.co.nz/api/client-hub-migration/owner',{method:'POST',headers:{origin:'https://www.assembl.co.nz','content-type':'application/json'},body:JSON.stringify({id,revision:1,payload:emptyOwnerHub()})}));expect(r.status).toBe(409);
 });
 it.each([['P0001',409],['22023',400],['42501',404]])('maps database %s without returning database internals',async(code,status)=>{
  session.value={userId:id,client:{rpc:async()=>({data:null,error:{code,message:'PRIVATE_DB_SENTINEL'}})}};
  const r=await POST(new Request('https://www.assembl.co.nz/api/client-hub-migration/owner',{method:'POST',headers:{origin:'https://www.assembl.co.nz','content-type':'application/json'},body:JSON.stringify({revision:0,payload:emptyOwnerHub()})}));expect(r.status).toBe(status);expect(await r.text()).not.toContain('PRIVATE_DB_SENTINEL');
 });
 it('rejects null/missing schemaVersion and null revision before storage',()=>{
  for(const schemaVersion of [null,undefined,'1'])expect(()=>parseOwnerDraft({revision:0,payload:{...emptyOwnerHub(),schemaVersion}})).toThrow();
  expect(()=>parseOwnerDraft({revision:null,payload:emptyOwnerHub()})).toThrow();
 });
 it('bounds streamed bodies before storage',async()=>{
  const r=await POST(new Request('https://www.assembl.co.nz/api/client-hub-migration/owner',{method:'POST',headers:{origin:'https://www.assembl.co.nz','content-type':'application/json'},body:'x'.repeat(1800001)}));expect(r.status).toBe(413);
 });
});
