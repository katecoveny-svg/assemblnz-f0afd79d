/**
 * Stripe Customer ↔ tenant mapping.
 *
 * One Stripe Customer per Tōro tenant, mirrored in toro_stripe_customers.
 * Idempotent: getOrCreateCustomer is safe to call on every request — it
 * does a single DB lookup first, only calls Stripe + INSERTs when no
 * mapping exists.
 */
import 'server-only';
import type Stripe from 'stripe';
import { getStripe } from './client';
import { createServiceClient } from './supabase-service';

export interface TenantCustomerRecord {
  tenant_id: string;
  stripe_customer_id: string;
  default_payment_method_id: string | null;
  default_payment_brand: string | null;
  default_payment_last4: string | null;
  subscription_id: string | null;
  subscription_status: string | null;
  subscription_current_period_end: string | null;
}

export interface GetOrCreateCustomerInput {
  tenantId: string;
  tenantSlug?: string;
  tenantName?: string;
  contactEmail?: string;
}

/**
 * Idempotent lookup-or-create for the tenant's Stripe Customer.
 * Returns the toro_stripe_customers row.
 */
export async function getOrCreateCustomer(
  input: GetOrCreateCustomerInput,
): Promise<TenantCustomerRecord> {
  const supabase = createServiceClient();
  const existing = await loadCustomer(input.tenantId);
  if (existing) return existing;

  const stripe = getStripe();
  const customer: Stripe.Customer = await stripe.customers.create({
    name: input.tenantName ?? input.tenantSlug ?? `tenant_${input.tenantId.slice(0, 8)}`,
    email: input.contactEmail,
    metadata: {
      assembl_tenant_id: input.tenantId,
      assembl_tenant_slug: input.tenantSlug ?? '',
      assembl_product: 'toro',
    },
  });

  const { data, error } = await supabase
    .from('toro_stripe_customers')
    .upsert(
      { tenant_id: input.tenantId, stripe_customer_id: customer.id },
      { onConflict: 'tenant_id', ignoreDuplicates: false },
    )
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(
      `getOrCreateCustomer: failed to persist Stripe customer ${customer.id} — ${error?.message ?? 'no row returned'}`,
    );
  }
  return data as TenantCustomerRecord;
}

export async function loadCustomer(
  tenantId: string,
): Promise<TenantCustomerRecord | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('toro_stripe_customers')
    .select('*')
    .eq('tenant_id', tenantId)
    .maybeSingle();

  if (error) {
    if (isMissingTable(error)) return null;
    throw new Error(`loadCustomer: ${error.message}`);
  }
  return (data as TenantCustomerRecord | null) ?? null;
}

export async function loadCustomerByStripeId(
  stripeCustomerId: string,
): Promise<TenantCustomerRecord | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('toro_stripe_customers')
    .select('*')
    .eq('stripe_customer_id', stripeCustomerId)
    .maybeSingle();

  if (error) {
    if (isMissingTable(error)) return null;
    throw new Error(`loadCustomerByStripeId: ${error.message}`);
  }
  return (data as TenantCustomerRecord | null) ?? null;
}

function isMissingTable(error: { code?: string; message?: string }): boolean {
  if (error.code === '42P01') return true;
  const m = (error.message ?? '').toLowerCase();
  return m.includes('does not exist') || m.includes('could not find the table');
}
