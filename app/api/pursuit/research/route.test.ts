import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ policy: vi.fn(), usage: vi.fn(), reserve: vi.fn(), recover: vi.fn(), research: vi.fn(), direct:vi.fn(),sources:vi.fn(), complete: vi.fn(), fail: vi.fn() }));
vi.mock('@/lib/pursuit/public-store', () => ({ trialPolicy: mocks.policy, trialUsage: mocks.usage, reserveTrial: mocks.reserve, recoverTrial: mocks.recover, requestPrincipal: () => 'private-hash', storageConfigured: () => true, nextTrialReset: () => '2026-09-23T00:00:00.000Z', completeTrial: mocks.complete, failTrial: mocks.fail, countPublicTool: vi.fn(), noStore: { 'Cache-Control': 'no-store' } }));
vi.mock('@/lib/pursuit/public-research', () => ({ runPublicResearch: mocks.research }));
vi.mock('@/lib/pursuit/direct-sources',async importOriginal=>({...await importOriginal<typeof import('@/lib/pursuit/direct-sources')>(),retrieveDirectSources:mocks.sources}));
vi.mock('@/lib/pursuit/direct-source-brief',async importOriginal=>({...await importOriginal<typeof import('@/lib/pursuit/direct-source-brief')>(),runPublicDirectBrief:mocks.direct}));
import {DirectBriefFailure} from '@/lib/pursuit/direct-source-brief';
import { GET, POST } from './route';
const url = 'https://www.assembl.co.nz/api/pursuit/research';
const request = () => new Request(url, { method: 'POST', headers: { origin: 'https://www.assembl.co.nz', 'Content-Type': 'application/json' }, body: JSON.stringify({ requestId: '00000000-0000-4000-8000-000000000001', company: 'NZ Post', goal: 'Research public parcel delivery information.', consent: true }) });
beforeEach(() => {
  vi.clearAllMocks(); vi.stubEnv('ANTHROPIC_API_KEY', 'test-key');
  mocks.policy.mockResolvedValue({ enabled: true, client_daily_limit: 3, global_daily_limit: 20 });
  mocks.usage.mockResolvedValue({ client: 1, global: 4 });
});

describe('public research availability and allowance', () => {
  it('returns remaining counts and reset time without exposing request hashes', async () => {
    const response = await GET(new Request(url));
    const body = await response.json();
    expect(body.ready).toBe(true);
    expect(body.limits).toMatchObject({ clientRemaining: 2, globalRemaining: 16, resetsAt: '2026-09-23T00:00:00.000Z' });
    expect(JSON.stringify(body)).not.toContain('private-hash');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });
  it('distinguishes a used allowance from an unavailable provider', async () => {
    mocks.usage.mockResolvedValue({ client: 3, global: 8 });
    const result = await (await GET(new Request(url))).json();
    expect(result.ready).toBe(false);
    expect(result.providerConfigured).toBe(true);
    expect(result.message).toContain('network’s daily research allowance');
  });
  it('does not invent remaining counts when usage cannot be read', async () => {
    mocks.usage.mockResolvedValue(null);
    const result = await (await GET(new Request(url))).json();
    expect(result.limits.clientRemaining).toBeUndefined();
    expect(result.message).toContain('daily allowance applies');
  });
  it('preserves the atomic cap and gives a useful retry response', async () => {
    mocks.reserve.mockResolvedValue({ status: 'client_limit' });
    const response = await POST(request());
    expect(response.status).toBe(429);
    expect(response.headers.has('Retry-After')).toBe(true);
    expect((await response.json()).code).toBe('client_limit');
    expect(mocks.research).not.toHaveBeenCalled();
  });
  it('retains same-origin protection before consuming any allowance', async () => {
    const original = request(); original.headers.set('origin', 'https://elsewhere.example');
    expect((await POST(original)).status).toBe(403);
    expect(mocks.reserve).not.toHaveBeenCalled();
  });
});

describe('same-ID recovery spends no provider call',()=>{
 it('returns a saved result before invoking research or completing another run',async()=>{
  const saved={mode:'live',trace:{id:'00000000-0000-4000-8000-000000000001'},draft:{title:'Saved result'}};
  mocks.reserve.mockResolvedValue({status:'replay',result:saved});
  expect(await (await POST(request())).json()).toEqual(saved);
  expect(mocks.research).not.toHaveBeenCalled();expect(mocks.complete).not.toHaveBeenCalled();expect(mocks.fail).not.toHaveBeenCalled();
 });
 for(const status of ['pending','failed'])it(`does not restart a ${status} request`,async()=>{
  mocks.reserve.mockResolvedValue({status});
  const response=await POST(request());expect(response.status).toBe(409);
  const body=await response.json();expect(body.code).toBe(status);expect(body.error).not.toContain('Start a new brief');
  expect(mocks.research).not.toHaveBeenCalled();expect(mocks.complete).not.toHaveBeenCalled();
 });
});

describe('server-enforced lookup-only recovery',()=>{
 function recovery(){const req=request();req.headers.set('x-pursuit-recovery','lookup-only');return req;}
 for(const status of ['not_found','pending','failed'])it(`lookup ${status} never reserves or starts research`,async()=>{
  mocks.recover.mockResolvedValue({status});
  expect((await POST(recovery())).status).toBe(409);
  expect(mocks.recover).toHaveBeenCalledTimes(1);expect(mocks.reserve).not.toHaveBeenCalled();expect(mocks.research).not.toHaveBeenCalled();expect(mocks.complete).not.toHaveBeenCalled();expect(mocks.fail).not.toHaveBeenCalled();
 });
 it('returns replay even when the provider key is unavailable',async()=>{
  vi.stubEnv('ANTHROPIC_API_KEY','');mocks.recover.mockResolvedValue({status:'replay',result:{mode:'live',saved:true}});
  expect(await (await POST(recovery())).json()).toEqual({mode:'live',saved:true});expect(mocks.reserve).not.toHaveBeenCalled();expect(mocks.research).not.toHaveBeenCalled();
 });
 it('cannot reserve after a stale availability response and rejected 429 admission',async()=>{
  mocks.reserve.mockResolvedValue({status:'client_limit'});expect((await POST(request())).status).toBe(429);
  mocks.reserve.mockClear();mocks.recover.mockResolvedValue({status:'not_found'});
  const res=await POST(recovery());expect((await res.json()).code).toBe('not_found');
  expect(mocks.reserve).not.toHaveBeenCalled();expect(mocks.research).not.toHaveBeenCalled();
 });
 it('cannot reserve a missing request after an aborted early submission',async()=>{
  const controller=new AbortController();controller.abort();
  const req=new Request(recovery(),{signal:controller.signal});mocks.recover.mockResolvedValue({status:'not_found'});
  expect((await POST(req)).status).toBe(409);expect(mocks.reserve).not.toHaveBeenCalled();expect(mocks.research).not.toHaveBeenCalled();
 });
 it('reports unknown status when lookup fails without changing any row',async()=>{
  mocks.recover.mockRejectedValue(new Error('storage_unavailable'));
  const res=await POST(recovery());expect((await res.json()).code).toBe('recovery_unavailable');
  expect(mocks.reserve).not.toHaveBeenCalled();expect(mocks.research).not.toHaveBeenCalled();expect(mocks.fail).not.toHaveBeenCalled();
 });
 it('rejects an unsupported recovery mode before accessing storage',async()=>{
  const req=request();req.headers.set('x-pursuit-recovery','retry');expect((await POST(req)).status).toBe(400);
  expect(mocks.reserve).not.toHaveBeenCalled();expect(mocks.recover).not.toHaveBeenCalled();
 });
});

describe('bounded direct-source route and recovery',()=>{
 const budget={model:'claude-haiku-4-5-20251001',currency:'USD' as const,maxUsd:1/1.15,calls:1,reservedUpperUsd:.212,searchAdmitted:false as const,assumedTaxRate:.15,grossUpperUsd:.2438};
 const receipt={requestId:'00000000-0000-4000-8000-000000000001',stage:'draft' as const,providerCalls:1,webSearches:0,budget};
 function directRequest(extra:Record<string,unknown>={},recovery=false){return new Request(url,{method:'POST',headers:{origin:'https://www.assembl.co.nz','Content-Type':'application/json',...(recovery?{'X-Pursuit-Recovery':'lookup-only'}:{})},body:JSON.stringify({requestId:receipt.requestId,company:'assembl.co.nz',goal:'Fictional consultancy proposes human-reviewed adoption work.',consent:true,sourceMode:'direct_source_brief',...extra})});}
 it('routes explicit scoped input through existing reservation and saves its result',async()=>{
  const result={mode:'direct_source_brief',trace:{id:receipt.requestId,budget,providerCalls:1},draft:{title:'Scoped result'}};mocks.reserve.mockResolvedValue({status:'reserved'});mocks.direct.mockResolvedValue(result);
  expect(await(await POST(directRequest())).json()).toEqual(result);expect(mocks.direct).toHaveBeenCalledOnce();expect(mocks.research).not.toHaveBeenCalled();expect(mocks.complete).toHaveBeenCalledWith(receipt.requestId,'private-hash',result);
 });
 for(const extra of [{company:'NZ Post'},{useTypeSafe:true},{workflow:'website_outreach'}])it('rejects unsupported scoped target/tools/workflow before admission',async()=>{
  expect((await POST(directRequest(extra))).status).toBe(400);expect(mocks.reserve).not.toHaveBeenCalled();expect(mocks.direct).not.toHaveBeenCalled();
 });
 it('returns saved scoped results via lookup only without another provider call',async()=>{
  const saved={mode:'direct_source_brief',trace:{webSearches:0,budget}};mocks.recover.mockResolvedValue({status:'replay',result:saved});
  expect(await(await POST(directRequest({},true))).json()).toEqual(saved);expect(mocks.reserve).not.toHaveBeenCalled();expect(mocks.direct).not.toHaveBeenCalled();expect(mocks.research).not.toHaveBeenCalled();
 });
 it('retains a safe admission receipt on paid-attempt failure',async()=>{
  mocks.reserve.mockResolvedValue({status:'reserved'});mocks.direct.mockRejectedValue(new DirectBriefFailure('direct_brief_failed',receipt));
  const res=await POST(directRequest());expect(res.status).toBe(503);expect(await res.json()).toMatchObject({code:'direct_brief_failed',receipt});expect(mocks.fail).toHaveBeenCalledWith(receipt.requestId,'private-hash','direct_brief_failed',receipt);
 });
 it('retains successful inference reservation if saving the result fails',async()=>{
  mocks.reserve.mockResolvedValue({status:'reserved'});mocks.direct.mockResolvedValue({mode:'direct_source_brief',trace:{budget,providerCalls:1}});mocks.complete.mockRejectedValueOnce(new Error('receipt_not_saved'));
  const response=await(await POST(directRequest())).json();expect(response).toMatchObject({code:'receipt_not_saved',receipt:{stage:'validation',providerCalls:1,budget}});
 });
});

it('offers a zero-inference native source diagnostic without reserving or exposing full content',async()=>{
 mocks.sources.mockResolvedValue([{state:'unavailable',url:'https://www.assembl.co.nz/',reason:'source_unavailable',checkedAt:new Date().toISOString()}]);
 const response=await(await GET(new Request(url+'?checkDirectSources=1'))).json();expect(response).toMatchObject({sourcesReady:false,providerCalls:0,webSearches:0,billingAccountTotalVerified:false});expect(mocks.reserve).not.toHaveBeenCalled();expect(mocks.research).not.toHaveBeenCalled();expect(mocks.direct).not.toHaveBeenCalled();expect(mocks.policy).not.toHaveBeenCalled();
});
