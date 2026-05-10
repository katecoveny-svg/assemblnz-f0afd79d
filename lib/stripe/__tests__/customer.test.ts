import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('../client', () => ({
  getStripe: vi.fn(),
}));
vi.mock('../supabase-service', () => ({
  createServiceClient: vi.fn(),
}));

import { getOrCreateCustomer, loadCustomer, loadCustomerByStripeId } from '../customer';
import { getStripe } from '../client';
import { createServiceClient } from '../supabase-service';

const TENANT_ID = '00000000-0000-0000-0000-000000000001';
const STRIPE_CUSTOMER_ID = 'cus_test_123';

function makeQueryBuilder(rows: { data: unknown; error: unknown }) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue(rows),
    single: vi.fn().mockResolvedValue(rows),
  };
}

describe('getOrCreateCustomer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the existing tenant ↔ customer mapping without calling Stripe', async () => {
    const existingRow = {
      tenant_id: TENANT_ID,
      stripe_customer_id: STRIPE_CUSTOMER_ID,
      default_payment_method_id: null,
      default_payment_brand: null,
      default_payment_last4: null,
      subscription_id: null,
      subscription_status: null,
      subscription_current_period_end: null,
    };
    const builder = makeQueryBuilder({ data: existingRow, error: null });
    (createServiceClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn().mockReturnValue(builder),
    });

    const result = await getOrCreateCustomer({ tenantId: TENANT_ID });
    expect(result.stripe_customer_id).toBe(STRIPE_CUSTOMER_ID);
    expect(getStripe).not.toHaveBeenCalled();
  });

  it('creates a new Stripe customer + persists the mapping when missing', async () => {
    const insertBuilder = makeQueryBuilder({
      data: {
        tenant_id: TENANT_ID,
        stripe_customer_id: 'cus_test_new',
        default_payment_method_id: null,
        default_payment_brand: null,
        default_payment_last4: null,
        subscription_id: null,
        subscription_status: null,
        subscription_current_period_end: null,
      },
      error: null,
    });
    const lookupBuilder = makeQueryBuilder({ data: null, error: null });
    let call = 0;
    (createServiceClient as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      from: vi.fn().mockImplementation(() => {
        call += 1;
        return call === 1 ? lookupBuilder : insertBuilder;
      }),
    }));

    const stripeMock = {
      customers: {
        create: vi.fn().mockResolvedValue({ id: 'cus_test_new' }),
      },
    };
    (getStripe as unknown as ReturnType<typeof vi.fn>).mockReturnValue(stripeMock);

    const result = await getOrCreateCustomer({
      tenantId: TENANT_ID,
      tenantSlug: 'hudson-household',
      tenantName: 'Hudson household',
      contactEmail: 'kate@example.test',
    });

    expect(stripeMock.customers.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Hudson household',
        email: 'kate@example.test',
        metadata: expect.objectContaining({
          assembl_tenant_id: TENANT_ID,
          assembl_tenant_slug: 'hudson-household',
          assembl_product: 'toro',
        }),
      }),
    );
    expect(result.stripe_customer_id).toBe('cus_test_new');
  });
});

describe('loadCustomer / loadCustomerByStripeId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when the table is missing (42P01)', async () => {
    const builder = makeQueryBuilder({ data: null, error: { code: '42P01', message: 'relation "toro_stripe_customers" does not exist' } });
    (createServiceClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn().mockReturnValue(builder),
    });

    const result = await loadCustomer(TENANT_ID);
    expect(result).toBeNull();
  });

  it('throws on any other error', async () => {
    const builder = makeQueryBuilder({ data: null, error: { code: '42501', message: 'permission denied' } });
    (createServiceClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn().mockReturnValue(builder),
    });

    await expect(loadCustomer(TENANT_ID)).rejects.toThrowError(/permission denied/);
  });

  it('looks up by Stripe customer id', async () => {
    const row = {
      tenant_id: TENANT_ID,
      stripe_customer_id: STRIPE_CUSTOMER_ID,
      default_payment_method_id: null,
      default_payment_brand: null,
      default_payment_last4: null,
      subscription_id: null,
      subscription_status: null,
      subscription_current_period_end: null,
    };
    const builder = makeQueryBuilder({ data: row, error: null });
    (createServiceClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn().mockReturnValue(builder),
    });

    const result = await loadCustomerByStripeId(STRIPE_CUSTOMER_ID);
    expect(result?.tenant_id).toBe(TENANT_ID);
    expect(builder.eq).toHaveBeenCalledWith('stripe_customer_id', STRIPE_CUSTOMER_ID);
  });
});
