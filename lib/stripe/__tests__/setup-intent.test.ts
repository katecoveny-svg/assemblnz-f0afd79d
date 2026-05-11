import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('../client', () => ({ getStripe: vi.fn() }));
vi.mock('../customer', () => ({ getOrCreateCustomer: vi.fn() }));

import { createSetupIntent } from '../setup-intent';
import { getStripe } from '../client';
import { getOrCreateCustomer } from '../customer';

const TENANT_ID = '00000000-0000-0000-0000-000000000001';
const STRIPE_CUSTOMER_ID = 'cus_test_si';

describe('createSetupIntent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getOrCreateCustomer as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      tenant_id: TENANT_ID,
      stripe_customer_id: STRIPE_CUSTOMER_ID,
      default_payment_method_id: null,
      default_payment_brand: null,
      default_payment_last4: null,
      subscription_id: null,
      subscription_status: null,
      subscription_current_period_end: null,
    });
  });

  it('returns a client_secret usable by Stripe Elements', async () => {
    const stripeMock = {
      setupIntents: {
        create: vi.fn().mockResolvedValue({
          id: 'seti_test_123',
          client_secret: 'seti_test_123_secret_xyz',
        }),
      },
    };
    (getStripe as unknown as ReturnType<typeof vi.fn>).mockReturnValue(stripeMock);

    const result = await createSetupIntent({ tenantId: TENANT_ID });
    expect(result.clientSecret).toBe('seti_test_123_secret_xyz');
    expect(result.setupIntentId).toBe('seti_test_123');
    expect(result.customerId).toBe(STRIPE_CUSTOMER_ID);
    expect(stripeMock.setupIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: STRIPE_CUSTOMER_ID,
        usage: 'off_session',
        payment_method_types: ['card'],
      }),
    );
  });

  it('throws when Stripe returns no client_secret', async () => {
    (getStripe as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      setupIntents: {
        create: vi.fn().mockResolvedValue({ id: 'seti_test_123', client_secret: null }),
      },
    });

    await expect(createSetupIntent({ tenantId: TENANT_ID })).rejects.toThrowError(
      /no client_secret/,
    );
  });
});
