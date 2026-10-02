import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ policy: vi.fn(), usage: vi.fn(), reserve: vi.fn(), recover: vi.fn(), research: vi.fn(), complete: vi.fn(), fail: vi.fn() }));
vi.mock('@/lib/pursuit/public-store', () => ({ trialPolicy: mocks.policy, trialUsage: mocks.usage, reserveTrial: mocks.reserve, recoverTrial: mocks.recover, requestPrincipal: () => 'private-hash', storageConfigured: () => true, nextTrialReset: () => '2026-09-23T00:00:00.000Z', completeTrial: mocks.complete, failTrial: mocks.fail, countPublicTool: vi.fn(), noStore: { 'Cache-Control': 'no-store' } }));
vi.mock('@/lib/pursuit/public-research', () => ({ runPublicResearch: mocks.research }));
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
