import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryOfficeJobsRepo } from '@/apps/do/shared/office-jobs';
const repo=new MemoryOfficeJobsRepo();let owner='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';let unavailable=false;
const durable=(detail:any)=>{if(unavailable)throw Error('storage unavailable');if(detail)detail.record.storage='database';return detail;};
vi.mock('@/apps/do/services/owner',()=>({doOwner:async()=>owner?{id:owner}:null,sameDoOrigin:(r:Request)=>r.headers.get('origin')===new URL(r.url).origin,privateDoHeaders:{'Cache-Control':'private,no-store'}}));
vi.mock('@/apps/do/shared/http',()=>({readDoJson:(r:Request)=>r.json(),admitDoRequest:()=>true}));
vi.mock('@/lib/agents/chat-rate-limit',()=>({chatClientIp:()=> 'fixture'}));
vi.mock('@/apps/do/services/office-jobs',()=>({getOwnerBuilderJob:async(o:string,id:string)=>durable(await repo.getJobDetail(o,id)),saveOwnerBuilderJob:async(i:any)=>durable(await repo.saveBuilderJob(i)),recordOwnerJobEvent:async(i:any)=>repo.recordEvent(i),recordOwnerReceipt:async(i:any)=>repo.recordReceipt(i)}));
import { POST } from './route';
const taskId='11111111-1111-4111-8111-111111111111';
const input={taskId,brief:'Review this writing for clarity',context:'We act in order to help due to the fact that time matters.',masterReference:'existing Library handover',consent:true};
const request=(body:any=input,origin='https://www.assembl.co.nz')=>new Request('https://www.assembl.co.nz/api/do/companion-specialist',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
beforeEach(()=>{repo.clear();owner='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';unavailable=false;});
describe('actual local Clear worker with controlled Office storage',()=>{
  it('executes real writing function and stores correlated acceptance/running/result evidence',async()=>{const response=await POST(request());expect(response.status).toBe(200);const body=await response.json();expect(body.receipt.evidence.result.rewritten).toBe('We act to help because time matters.');expect(body.receipt.evidence.worker).toBe('clear-local.v1');expect(body.receipt.jobId).toBe(taskId);const detail=(await repo.getJobDetail(owner,taskId))!;expect(detail.events.map(e=>e.kind)).toContain('specialist_running');expect(detail.events.map(e=>e.kind)).toContain('specialist_completed');const again=await(await POST(request())).json();expect(again.receipt.id).toBe(body.receipt.id);});
  it('rejects stale task reuse and cannot read another owner result',async()=>{await POST(request());expect((await POST(request({...input,context:'different source'}))).status).toBe(409);owner='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';expect(await repo.getJobDetail(owner,taskId)).toBeNull();expect((await POST(request())).status).not.toBe(200);});
  it('requires consent, same origin, signed-in owner and durable storage',async()=>{expect((await POST(request({...input,consent:false}))).status).toBe(400);expect((await POST(request(input,'https://other.invalid'))).status).toBe(403);owner='';expect((await POST(request())).status).toBe(401);owner='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';unavailable=true;expect((await POST(request())).status).toBe(503);});
});
