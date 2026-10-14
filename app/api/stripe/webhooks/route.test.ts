import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({ constructEvent: vi.fn(), from: vi.fn(), writeAuditRow: vi.fn(), syncAccountStatus: vi.fn(), loadCustomerByStripeId: vi.fn() }));
vi.mock('@/lib/stripe/client', () => ({ getStripe: () => ({ webhooks: { constructEvent: mocks.constructEvent } }) }));
vi.mock('@/lib/stripe/supabase-service', () => ({ createServiceClient: () => ({ from: mocks.from }) }));
vi.mock('@/lib/stripe/audit', () => ({ writeAuditRow: mocks.writeAuditRow }));
vi.mock('@/lib/stripe/connect', () => ({ syncAccountStatus: mocks.syncAccountStatus }));
vi.mock('@/lib/stripe/customer', () => ({ loadCustomerByStripeId: mocks.loadCustomerByStripeId }));
vi.mock('@/lib/billing/agent-pricing', () => ({ ALL_ACCESS_SLUG: '*', isAgentPlan: () => true, planForPriceId: () => 'everyday' }));
vi.mock('@/lib/billing/tiers', () => ({ tierForPriceId: () => 'solo' }));

import { POST as marketplace } from './route';
import { POST as subscriptions } from '../../stripe-webhook/route';

const request = () => new Request('https://assembl.co.nz/api/stripe/webhooks', { method: 'POST', headers: { 'stripe-signature': 'test' }, body: '{}' }) as NextRequest;
describe('durable webhook acknowledgement', () => {
  beforeEach(() => {
    vi.clearAllMocks(); vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'test-secret');
    mocks.writeAuditRow.mockResolvedValue('audit');
    mocks.loadCustomerByStripeId.mockResolvedValue({ tenant_id: 'owner' });
  });
  it('rejects invalid signatures before domain writes', async () => {
    mocks.constructEvent.mockImplementation(() => { throw new Error('invalid'); });
    expect((await marketplace(request())).status).toBe(401);
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it('does not acknowledge an event whose required audit was lost', async () => {
    mocks.constructEvent.mockReturnValue({ id: 'evt', type: 'ignored', data: { object: {} } });
    mocks.writeAuditRow.mockResolvedValue(null);
    expect((await marketplace(request())).status).toBe(503);
    expect((await subscriptions(request())).status).toBe(503);
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it('retries failed marketplace entitlement writes, including a missing table', async () => {
    mocks.constructEvent.mockReturnValue({ id: 'evt', type: 'checkout.session.completed', data: { object: { metadata: { user_id: 'owner', plan: 'everyday', agent_slugs: 'do' }, subscription: 'sub' } } });
    const upsert = vi.fn().mockResolvedValue({ error: { code: '42P01', message: 'missing table' } });
    mocks.from.mockReturnValue({ upsert });
    expect((await marketplace(request())).status).toBe(503);
    upsert.mockResolvedValue({ error: null });
    expect((await marketplace(request())).status).toBe(200);
    expect(upsert).toHaveBeenCalledTimes(2);
  });
  it('retries self-serve entitlement failure and safely applies redelivery', async () => {
    mocks.constructEvent.mockReturnValue({ id: 'evt', type: 'customer.subscription.updated', data: { object: { id: 'sub', customer: 'cus', status: 'active', items: { data: [{ price: { id: 'price' }, current_period_end: 2000000000 }] } } } });
    const upsert = vi.fn().mockResolvedValue({ error: { message: 'database offline' } });
    const eq = vi.fn().mockResolvedValue({ error: null });
    mocks.from.mockReturnValue({ update: () => ({ eq }), upsert });
    expect((await subscriptions(request())).status).toBe(503);
    upsert.mockResolvedValue({ error: null });
    expect((await subscriptions(request())).status).toBe(200);
    expect(upsert).toHaveBeenLastCalledWith(expect.objectContaining({ stripe_subscription_id: 'sub', tier: 'solo' }), { onConflict: 'stripe_subscription_id', ignoreDuplicates: false });
  });
  it('retries cancellation persistence failure', async () => {
    mocks.constructEvent.mockReturnValue({ id: 'evt', type: 'customer.subscription.deleted', data: { object: { id: 'sub', customer: 'cus' } } });
    mocks.from.mockImplementation((table: string) => ({ update: () => ({ eq: async () => ({ error: table === 'subscriptions' ? { message: 'offline' } : null }) }) }));
    expect((await subscriptions(request())).status).toBe(503);
  });
});
