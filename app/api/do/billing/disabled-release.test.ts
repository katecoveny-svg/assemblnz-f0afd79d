import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
const calls = vi.hoisted(() => ({ stripe: vi.fn(), database: vi.fn() }));
vi.mock('@/apps/do/services/owner', () => ({
  doOwner: async () => ({ id: '00000000-0000-4000-8000-000000000001' }),
  privateDoHeaders: { 'Cache-Control': 'private, no-store' },
  sameDoOrigin: (request: Request) => request.headers.get('origin') === new URL(request.url).origin,
}));
vi.mock('@/lib/stripe/client', () => ({ getStripe: calls.stripe, STRIPE_WEBHOOK_TOLERANCE_SECONDS: 300 }));
vi.mock('@/lib/supabase/service', () => ({ getServiceClient: calls.database }));
import { POST as checkout } from './checkout/route';
import { POST as portal } from './portal/route';
import { POST as webhook } from './webhook/route';
import PersonalDoBilling from '@/app/do/billing/page';
import { personalDoPlan } from '@/lib/billing/personal-do-plan';

beforeEach(() => {
  vi.resetAllMocks();
  // Complete fictional configuration proves the rollout flag itself is the boundary.
  for (const [key, value] of Object.entries({
    PERSONAL_DO_COST_LIMITS_VERIFIED: 'true', PERSONAL_DO_MAX_OUTPUT_TOKENS: '2000', PERSONAL_DO_MAX_INPUT_BYTES: '12000',
    PERSONAL_DO_PROVIDER_TARIFFS_JSON: JSON.stringify({ astraInputUsdPerMillion: 10, astraOutputUsdPerMillion: 50, astraCacheReadUsdPerMillion: 1, astraCacheWriteUsdPerMillion: 12.5, typesafeInputUsdPerMillion: 0.042, typesafeOutputUsdPerMillion: 0, usdToNzd: 2, typesafeMaxBillableTokensPerRequest: 64000 }),
    PERSONAL_DO_STRIPE_PRICE_ID: 'price_fictional_only', PERSONAL_DO_STRIPE_WEBHOOK_SECRET: 'fictional_only',
    PERSONAL_DO_MONTHLY_AMOUNT_CENTS: '100', PERSONAL_DO_CURRENCY: 'nzd', PERSONAL_DO_TAX_TREATMENT: 'inclusive', PERSONAL_DO_STRIPE_AUTOMATIC_TAX: 'false',
    PERSONAL_DO_REQUESTS_PER_DAY: '5', PERSONAL_DO_REQUESTS_PER_MONTH: '30', PERSONAL_DO_MAX_REQUEST_PROVIDER_COST_CENTS: '200',
    PERSONAL_DO_MAX_MONTHLY_PROVIDER_COST_CENTS: '1000', PERSONAL_DO_GLOBAL_MONTHLY_PROVIDER_COST_CENTS: '10000',
    TYPESAFE_ENABLED: 'true', TYPESAFE_API_KEY: 'fictional_only', OPENAI_API_KEY: 'fictional_only',
  })) vi.stubEnv(key, value);
  calls.stripe.mockImplementation(() => { throw new Error('Stripe must not be reached'); });
  calls.database.mockImplementation(() => { throw new Error('Consumer database must not be reached'); });
});
afterEach(() => vi.unstubAllEnvs());
const request = (path: string) => new Request(`https://www.assembl.co.nz/api/do/billing/${path}`, { method: 'POST', headers: { origin: 'https://www.assembl.co.nz' }, body: '{}' });

describe('migration-independent disabled consumer release', () => {
  it.each([undefined, 'false'])('keeps checkout, portal, webhook and billing page unavailable without consumer schema when flag is %s', async flag => {
    vi.stubEnv('PERSONAL_DO_CONSUMER_ENABLED', flag);
    expect(personalDoPlan(process.env)).not.toBeNull();
    for (const [path, handler] of [['checkout', checkout], ['portal', portal], ['webhook', webhook]] as const) {
      const response = await handler(request(path));
      expect(response.status).toBe(503);
      expect(response.headers.get('cache-control')).toContain('no-store');
    }
    const html = renderToStaticMarkup(await PersonalDoBilling());
    expect(html).toContain('Personal DO subscriptions are not available yet.');
    expect(html).not.toContain('Continue to secure checkout');
    expect(calls.stripe).not.toHaveBeenCalled();
    expect(calls.database).not.toHaveBeenCalled();
  });
});
