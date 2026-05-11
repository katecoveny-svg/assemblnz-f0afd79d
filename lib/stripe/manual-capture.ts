/**
 * Manual-capture PaymentIntent flow — the canon-#34 implementation.
 *
 * No PaymentIntent EVER auto-charges. Every PI is created with
 * `capture_method: 'manual'`; the card is authorised but not captured
 * until a tenant member explicitly approves via /app/toro/inbox.
 *
 * Lifecycle:
 *   createManualCapturePaymentIntent  → PI in 'requires_capture' state
 *   captureApprovedPaymentIntent      → PI captured, money moves
 *   cancelPaymentIntent               → PI canceled, auth released
 *
 * Each function mirrors state into toro_payment_intents via the
 * service-role Supabase client. The webhook (payment_intent.*)
 * reconciles any out-of-band changes.
 */
import 'server-only';
import type Stripe from 'stripe';
import { getStripe } from './client';
import { getOrCreateCustomer } from './customer';
import { createServiceClient } from './supabase-service';
import { writeAuditRow } from './audit';

export interface CreateManualCapturePaymentIntentInput {
  tenantId: string;
  amountCents: number;
  description: string;
  draftId?: string | null;
  tenantSlug?: string;
  tenantName?: string;
  contactEmail?: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentRecord {
  id: string;
  tenant_id: string;
  draft_id: string | null;
  stripe_payment_intent_id: string;
  stripe_customer_id: string;
  amount_cents: number;
  currency: string;
  status: string;
  description: string | null;
  metadata: Record<string, unknown>;
  approved_by: string | null;
  approved_at: string | null;
  captured_at: string | null;
  audit_log_id: string | null;
  created_at: string;
  updated_at: string;
}

export async function createManualCapturePaymentIntent(
  input: CreateManualCapturePaymentIntentInput,
): Promise<PaymentIntentRecord> {
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
    throw new Error('createManualCapturePaymentIntent: amountCents must be a positive integer');
  }

  const customer = await getOrCreateCustomer({
    tenantId: input.tenantId,
    tenantSlug: input.tenantSlug,
    tenantName: input.tenantName,
    contactEmail: input.contactEmail,
  });

  const stripe = getStripe();
  const pi: Stripe.PaymentIntent = await stripe.paymentIntents.create({
    amount: input.amountCents,
    currency: 'nzd',
    customer: customer.stripe_customer_id,
    capture_method: 'manual',
    description: input.description,
    payment_method: customer.default_payment_method_id ?? undefined,
    confirm: customer.default_payment_method_id ? true : false,
    off_session: customer.default_payment_method_id ? true : false,
    metadata: {
      assembl_tenant_id: input.tenantId,
      assembl_draft_id: input.draftId ?? '',
      assembl_product: 'toro',
      ...(input.metadata ?? {}),
    },
  });

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('toro_payment_intents')
    .insert({
      tenant_id: input.tenantId,
      draft_id: input.draftId ?? null,
      stripe_payment_intent_id: pi.id,
      stripe_customer_id: customer.stripe_customer_id,
      amount_cents: input.amountCents,
      currency: 'nzd',
      status: pi.status,
      description: input.description,
      metadata: input.metadata ?? {},
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(
      `createManualCapturePaymentIntent: persist failed for ${pi.id} — ${error?.message ?? 'no row returned'}`,
    );
  }
  return data as PaymentIntentRecord;
}

export interface CaptureResult {
  paymentIntent: PaymentIntentRecord;
  stripe: Stripe.PaymentIntent;
}

export async function captureApprovedPaymentIntent(
  stripePaymentIntentId: string,
  approvedByUserId: string,
): Promise<CaptureResult> {
  if (!stripePaymentIntentId || !approvedByUserId) {
    throw new Error('captureApprovedPaymentIntent: both ids are required');
  }

  const stripe = getStripe();
  const captured = await stripe.paymentIntents.capture(stripePaymentIntentId);

  const supabase = createServiceClient();
  const auditLogId = await writeAuditRow({
    tenantId: extractMetadataTenantId(captured),
    action: 'toro.stripe.capture_approved',
    userId: approvedByUserId,
    tool_input: {
      stripe_payment_intent_id: stripePaymentIntentId,
      amount: captured.amount,
      currency: captured.currency,
    },
    tool_output: { status: captured.status },
  });

  const { data, error } = await supabase
    .from('toro_payment_intents')
    .update({
      status: captured.status,
      approved_by: approvedByUserId,
      approved_at: new Date().toISOString(),
      captured_at: new Date().toISOString(),
      audit_log_id: auditLogId,
    })
    .eq('stripe_payment_intent_id', stripePaymentIntentId)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(
      `captureApprovedPaymentIntent: persist failed for ${stripePaymentIntentId} — ${error?.message ?? 'no row returned'}`,
    );
  }

  return { paymentIntent: data as PaymentIntentRecord, stripe: captured };
}

export async function cancelPaymentIntent(
  stripePaymentIntentId: string,
  reason: 'requested_by_customer' | 'abandoned' | 'fraudulent' | 'duplicate' = 'requested_by_customer',
): Promise<PaymentIntentRecord> {
  const stripe = getStripe();
  const canceled = await stripe.paymentIntents.cancel(stripePaymentIntentId, {
    cancellation_reason: reason,
  });

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('toro_payment_intents')
    .update({ status: canceled.status })
    .eq('stripe_payment_intent_id', stripePaymentIntentId)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(
      `cancelPaymentIntent: persist failed for ${stripePaymentIntentId} — ${error?.message ?? 'no row returned'}`,
    );
  }
  return data as PaymentIntentRecord;
}

function extractMetadataTenantId(pi: Stripe.PaymentIntent): string {
  const id = pi.metadata?.assembl_tenant_id;
  if (typeof id === 'string' && id.length > 0) return id;
  throw new Error(`PaymentIntent ${pi.id} is missing assembl_tenant_id in metadata`);
}
