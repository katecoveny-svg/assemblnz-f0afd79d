import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn(), update: vi.fn(), eq: vi.fn() }));
vi.mock('@/lib/supabase/service', () => ({ getServiceClient: () => mocks }));
import { admitPersonalDoUsage } from '../personal-do-access';
const owner = '00000000-0000-4000-8000-000000000001', id = '00000000-0000-4000-8000-000000000002';
beforeEach(() => {
  vi.resetAllMocks();
  for (const [key, value] of Object.entries({ PERSONAL_DO_CONSUMER_ENABLED: 'true', PERSONAL_DO_COST_LIMITS_VERIFIED:'true', PERSONAL_DO_MAX_OUTPUT_TOKENS:'2000', PERSONAL_DO_MAX_INPUT_BYTES:'12000', PERSONAL_DO_PROVIDER_TARIFFS_JSON:JSON.stringify({astraInputUsdPerMillion:10,astraOutputUsdPerMillion:50,astraCacheReadUsdPerMillion:1,astraCacheWriteUsdPerMillion:12.5,typesafeInputUsdPerMillion:0.042,typesafeOutputUsdPerMillion:0,usdToNzd:2,typesafeMaxBillableTokensPerRequest:64000}), PERSONAL_DO_STRIPE_PRICE_ID: 'price_test', PERSONAL_DO_MONTHLY_AMOUNT_CENTS: '100', PERSONAL_DO_CURRENCY: 'nzd', PERSONAL_DO_TAX_TREATMENT: 'inclusive', PERSONAL_DO_STRIPE_AUTOMATIC_TAX: 'false', PERSONAL_DO_REQUESTS_PER_DAY: '5', PERSONAL_DO_REQUESTS_PER_MONTH: '30', PERSONAL_DO_MAX_REQUEST_PROVIDER_COST_CENTS: '200', PERSONAL_DO_MAX_MONTHLY_PROVIDER_COST_CENTS: '1000', PERSONAL_DO_GLOBAL_MONTHLY_PROVIDER_COST_CENTS: '10000' })) vi.stubEnv(key, value);
  mocks.rpc.mockResolvedValue({ data: 'admitted', error: null });
  mocks.from.mockReturnValue(mocks); mocks.update.mockReturnValue(mocks); mocks.eq.mockReturnValue(mocks);
  mocks.eq.mockImplementation((key: string) => key === 'status' ? Promise.resolve({ error: null }) : mocks);
});
afterEach(() => vi.unstubAllEnvs());
describe('durable consumer admission', () => {
  it('binds request and digest to authenticated owner and all configured budgets, without storing text', async () => {
    const reservation = await admitPersonalDoUsage(owner, { message: 'fictional private request' }, id);
    expect(mocks.rpc).toHaveBeenCalledWith('admit_personal_do_request', expect.objectContaining({ p_owner: owner, p_request: id, p_price: 'price_test', p_daily: 5, p_monthly: 30, p_reserve: 200, p_owner_budget: 1000, p_global_budget: 10000, p_digest: expect.stringMatching(/^[a-f0-9]{64}$/) }));
    expect(JSON.stringify(mocks.rpc.mock.calls)).not.toContain('fictional private');
    await reservation.finish(false);
    expect(mocks.update).toHaveBeenCalledWith({ status: 'failed', token_usage: null });
    expect(mocks.eq).toHaveBeenCalledWith('owner_id', owner);
    expect(mocks.eq).toHaveBeenCalledWith('request_id', id);
  });
  it('fails closed for missing config, database failure, duplicate/conflicting IDs and caps', async () => {
    vi.stubEnv('PERSONAL_DO_REQUESTS_PER_MONTH','');
    await expect(admitPersonalDoUsage(owner, {}, id)).rejects.toMatchObject({ status: 503 });
    expect(mocks.rpc).not.toHaveBeenCalled();
    vi.stubEnv('PERSONAL_DO_REQUESTS_PER_MONTH','30');
    for (const decision of ['already_pending','already_succeeded','already_failed','idempotency_conflict']) {
      mocks.rpc.mockResolvedValue({ data: decision, error: null });
      await expect(admitPersonalDoUsage(owner, {}, id)).rejects.toMatchObject({ status: 409 });
    }
    for (const decision of ['usage_limit','cost_limit','request_in_progress']) {
      mocks.rpc.mockResolvedValue({ data: decision, error: null });
      await expect(admitPersonalDoUsage(owner, {}, id)).rejects.toMatchObject({ status: 429 });
    }
    mocks.rpc.mockResolvedValue({ data: null, error: { message: 'internal' } });
    await expect(admitPersonalDoUsage(owner, {}, id)).rejects.toMatchObject({ code: 'usage_unavailable', status: 503 });
  });
  it('keeps a failed settlement visible rather than acknowledging success', async () => {
    const reservation = await admitPersonalDoUsage(owner, {}, id);
    mocks.eq.mockImplementation((key: string) => key === 'status' ? Promise.resolve({ error: {} }) : mocks);
    await expect(reservation.finish(true)).rejects.toMatchObject({ code: 'usage_settlement_failed' });
  });
});
