import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('../client', () => ({ getStripe: vi.fn() }));
vi.mock('../customer', () => ({ getOrCreateCustomer: vi.fn() }));
vi.mock('../supabase-service', () => ({ createServiceClient: vi.fn() }));
vi.mock('../audit', () => ({ writeAuditRow: vi.fn() }));

import {
  cancelPaymentIntent,
  captureApprovedPaymentIntent,
  createManualCapturePaymentIntent,
} from '../manual-capture';
import { getStripe } from '../client';
import { getOrCreateCustomer } from '../customer';
import { createServiceClient } from '../supabase-service';
import { writeAuditRow } from '../audit';

const TENANT_ID = '00000000-0000-0000-0000-000000000001';
const USER_ID = '00000000-0000-0000-0000-000000000099';
const STRIPE_CUSTOMER_ID = 'cus_test_mc';

function makeQueryBuilder(rows: { data: unknown; error: unknown }) {
  return {
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(rows),
  };
}

describe('createManualCapturePaymentIntent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getOrCreateCustomer as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      tenant_id: TENANT_ID,
      stripe_customer_id: STRIPE_CUSTOMER_ID,
      default_payment_method_id: 'pm_test_default',
      default_payment_brand: 'visa',
      default_payment_last4: '4242',
      subscription_id: null,
      subscription_status: null,
      subscription_current_period_end: null,
    });
  });

  it('rejects non-positive amounts', async () => {
    await expect(
      createManualCapturePaymentIntent({
        tenantId: TENANT_ID,
        amountCents: 0,
        description: 'test',
      }),
    ).rejects.toThrowError(/positive integer/);
    await expect(
      createManualCapturePaymentIntent({
        tenantId: TENANT_ID,
        amountCents: 1.5 as unknown as number,
        description: 'test',
      }),
    ).rejects.toThrowError(/positive integer/);
  });

  it('creates a manual-capture PI and persists the row', async () => {
    const stripeMock = {
      paymentIntents: {
        create: vi.fn().mockResolvedValue({
          id: 'pi_test_123',
          status: 'requires_capture',
        }),
      },
    };
    (getStripe as unknown as ReturnType<typeof vi.fn>).mockReturnValue(stripeMock);

    const insertResult = {
      data: {
        id: 'row-uuid',
        tenant_id: TENANT_ID,
        draft_id: 'draft-1',
        stripe_payment_intent_id: 'pi_test_123',
        stripe_customer_id: STRIPE_CUSTOMER_ID,
        amount_cents: 4200,
        currency: 'nzd',
        status: 'requires_capture',
        description: 'Pak\'nSave Friday delivery',
        metadata: {},
        approved_by: null,
        approved_at: null,
        captured_at: null,
        audit_log_id: null,
        created_at: '2026-05-11T00:00:00Z',
        updated_at: '2026-05-11T00:00:00Z',
      },
      error: null,
    };
    const builder = makeQueryBuilder(insertResult);
    (createServiceClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn().mockReturnValue(builder),
    });

    const result = await createManualCapturePaymentIntent({
      tenantId: TENANT_ID,
      amountCents: 4200,
      description: "Pak'nSave Friday delivery",
      draftId: 'draft-1',
    });

    expect(result.stripe_payment_intent_id).toBe('pi_test_123');
    expect(result.status).toBe('requires_capture');
    expect(stripeMock.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 4200,
        currency: 'nzd',
        capture_method: 'manual',
        payment_method: 'pm_test_default',
        confirm: true,
        off_session: true,
        metadata: expect.objectContaining({
          assembl_tenant_id: TENANT_ID,
          assembl_draft_id: 'draft-1',
        }),
      }),
    );
  });
});

describe('captureApprovedPaymentIntent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (writeAuditRow as unknown as ReturnType<typeof vi.fn>).mockResolvedValue('audit-row-uuid');
  });

  it('captures via Stripe, writes audit, persists state', async () => {
    const stripeMock = {
      paymentIntents: {
        capture: vi.fn().mockResolvedValue({
          id: 'pi_test_123',
          status: 'succeeded',
          amount: 4200,
          currency: 'nzd',
          metadata: { assembl_tenant_id: TENANT_ID },
        }),
      },
    };
    (getStripe as unknown as ReturnType<typeof vi.fn>).mockReturnValue(stripeMock);

    const updateRow = {
      data: {
        id: 'row-uuid',
        tenant_id: TENANT_ID,
        draft_id: null,
        stripe_payment_intent_id: 'pi_test_123',
        stripe_customer_id: STRIPE_CUSTOMER_ID,
        amount_cents: 4200,
        currency: 'nzd',
        status: 'succeeded',
        description: null,
        metadata: {},
        approved_by: USER_ID,
        approved_at: '2026-05-11T00:00:00Z',
        captured_at: '2026-05-11T00:00:00Z',
        audit_log_id: 'audit-row-uuid',
        created_at: '2026-05-11T00:00:00Z',
        updated_at: '2026-05-11T00:00:00Z',
      },
      error: null,
    };
    const builder = makeQueryBuilder(updateRow);
    (createServiceClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn().mockReturnValue(builder),
    });

    const result = await captureApprovedPaymentIntent('pi_test_123', USER_ID);
    expect(result.paymentIntent.audit_log_id).toBe('audit-row-uuid');
    expect(writeAuditRow).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'toro.stripe.capture_approved',
        userId: USER_ID,
        tenantId: TENANT_ID,
      }),
    );
    expect(stripeMock.paymentIntents.capture).toHaveBeenCalledWith('pi_test_123');
  });

  it('throws when Stripe metadata is missing assembl_tenant_id', async () => {
    (getStripe as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      paymentIntents: {
        capture: vi.fn().mockResolvedValue({
          id: 'pi_test_404',
          status: 'succeeded',
          amount: 1,
          currency: 'nzd',
          metadata: {},
        }),
      },
    });

    await expect(captureApprovedPaymentIntent('pi_test_404', USER_ID)).rejects.toThrowError(
      /assembl_tenant_id/,
    );
  });
});

describe('cancelPaymentIntent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cancels via Stripe and updates the row', async () => {
    const stripeMock = {
      paymentIntents: {
        cancel: vi.fn().mockResolvedValue({
          id: 'pi_test_cancel',
          status: 'canceled',
        }),
      },
    };
    (getStripe as unknown as ReturnType<typeof vi.fn>).mockReturnValue(stripeMock);

    const builder = makeQueryBuilder({
      data: {
        id: 'row-uuid',
        tenant_id: TENANT_ID,
        draft_id: null,
        stripe_payment_intent_id: 'pi_test_cancel',
        stripe_customer_id: STRIPE_CUSTOMER_ID,
        amount_cents: 100,
        currency: 'nzd',
        status: 'canceled',
        description: null,
        metadata: {},
        approved_by: null,
        approved_at: null,
        captured_at: null,
        audit_log_id: null,
        created_at: '2026-05-11T00:00:00Z',
        updated_at: '2026-05-11T00:00:00Z',
      },
      error: null,
    });
    (createServiceClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn().mockReturnValue(builder),
    });

    const result = await cancelPaymentIntent('pi_test_cancel');
    expect(result.status).toBe('canceled');
    expect(stripeMock.paymentIntents.cancel).toHaveBeenCalledWith(
      'pi_test_cancel',
      expect.objectContaining({ cancellation_reason: 'requested_by_customer' }),
    );
  });
});
