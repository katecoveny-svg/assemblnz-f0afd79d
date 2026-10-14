import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const m = vi.hoisted(() => ({ constructEvent: vi.fn(), retrieve: vi.fn(), rpc: vi.fn(), maybeSingle: vi.fn() }));
vi.mock('@/lib/stripe/client', () => ({ STRIPE_WEBHOOK_TOLERANCE_SECONDS: 300, getStripe: () => ({ webhooks: { constructEvent: m.constructEvent }, subscriptions: { retrieve: m.retrieve } }) }));
vi.mock('@/lib/supabase/service', () => ({ getServiceClient: () => ({ from: () => ({ select: () => ({ eq: () => ({ maybeSingle: m.maybeSingle }) }) }), rpc: m.rpc }) }));
import { POST } from './route';
const req = () => new Request('https://www.assembl.co.nz/api/do/billing/webhook', { method: 'POST', headers: { 'stripe-signature':'signed' }, body:'{}' });
beforeEach(() => {
  vi.resetAllMocks();
  for (const [key, value] of Object.entries({ PERSONAL_DO_CONSUMER_ENABLED: 'true', PERSONAL_DO_COST_LIMITS_VERIFIED:'true', PERSONAL_DO_MAX_OUTPUT_TOKENS:'2000', PERSONAL_DO_MAX_INPUT_BYTES:'12000', PERSONAL_DO_PROVIDER_TARIFFS_JSON:JSON.stringify({astraInputUsdPerMillion:10,astraOutputUsdPerMillion:50,astraCacheReadUsdPerMillion:1,astraCacheWriteUsdPerMillion:12.5,typesafeInputUsdPerMillion:0.042,typesafeOutputUsdPerMillion:0,usdToNzd:2,typesafeMaxBillableTokensPerRequest:64000}), PERSONAL_DO_STRIPE_WEBHOOK_SECRET:'test_only', PERSONAL_DO_STRIPE_PRICE_ID:'price_test', PERSONAL_DO_MONTHLY_AMOUNT_CENTS:'100', PERSONAL_DO_CURRENCY:'nzd', PERSONAL_DO_TAX_TREATMENT:'inclusive', PERSONAL_DO_STRIPE_AUTOMATIC_TAX:'false', PERSONAL_DO_REQUESTS_PER_DAY:'5', PERSONAL_DO_REQUESTS_PER_MONTH:'30', PERSONAL_DO_MAX_REQUEST_PROVIDER_COST_CENTS:'200', PERSONAL_DO_MAX_MONTHLY_PROVIDER_COST_CENTS:'1000', PERSONAL_DO_GLOBAL_MONTHLY_PROVIDER_COST_CENTS:'10000' })) vi.stubEnv(key,value);
  m.constructEvent.mockReturnValue({ id:'evt_test',type:'customer.subscription.updated',created:10,data:{object:{id:'sub_test',status:'active'}} });
  m.retrieve.mockResolvedValue({ id:'sub_test',customer:'cus_test',status:'canceled',cancel_at_period_end:false,items:{data:[{price:{id:'price_test'},quantity:1,current_period_end:2000000000}]} });
  m.maybeSingle.mockResolvedValue({ data:null,error:null }); m.rpc.mockResolvedValue({ error:null });
});
afterEach(() => vi.unstubAllEnvs());
describe('dedicated consumer webhook', () => {
  it('never acknowledges failed subscription/receipt writes; redelivery converges to authoritative cancelled state', async () => {
    m.rpc.mockResolvedValueOnce({ error:{message:'unavailable'} });
    expect((await POST(req())).status).toBe(503);
    expect((await POST(req())).status).toBe(200);
    expect(m.rpc).toHaveBeenLastCalledWith('sync_personal_do_subscription',expect.objectContaining({p_event:'evt_test',p_customer:'cus_test',p_status:'canceled',p_event_created:10}));
  });
  it('acknowledges a durable duplicate without repeating side effects', async () => {
    m.maybeSingle.mockResolvedValue({data:{event_id:'evt_test'},error:null});
    expect((await POST(req())).status).toBe(200); expect(m.retrieve).not.toHaveBeenCalled(); expect(m.rpc).not.toHaveBeenCalled();
  });
  it('fails closed for absent configuration, invalid signature and unavailable receipt lookup', async () => {
    vi.stubEnv('PERSONAL_DO_CONSUMER_ENABLED','false'); expect((await POST(req())).status).toBe(503); expect(m.constructEvent).not.toHaveBeenCalled();
    vi.stubEnv('PERSONAL_DO_CONSUMER_ENABLED','true'); m.constructEvent.mockImplementationOnce(()=>{throw new Error('bad');}); expect((await POST(req())).status).toBe(400);
    m.maybeSingle.mockResolvedValue({data:null,error:{}}); expect((await POST(req())).status).toBe(503); expect(m.rpc).not.toHaveBeenCalled();
  });
});
