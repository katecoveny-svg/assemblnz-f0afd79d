import 'server-only';
import { getStripe } from '@/lib/stripe/client';
import { getServiceClient } from '@/lib/supabase/service';
import { enabledPersonalDoPlan } from './personal-do-plan';

export async function personalDoStripePlan() {
  const plan = enabledPersonalDoPlan();
  if (!plan || !process.env.PERSONAL_DO_STRIPE_WEBHOOK_SECRET?.trim() || process.env.TYPESAFE_ENABLED !== 'true' || !process.env.TYPESAFE_API_KEY?.trim() || !process.env.OPENAI_API_KEY?.trim()) throw new Error('Consumer configuration incomplete');
  const stripe = getStripe();
  const price = await stripe.prices.retrieve(plan.priceId);
  if (!price.active || price.currency !== plan.currency || price.unit_amount !== plan.monthlyAmountCents ||
    price.type !== 'recurring' || price.recurring?.interval !== 'month' || price.recurring.interval_count !== 1 ||
    price.tax_behavior !== plan.taxTreatment || price.billing_scheme !== 'per_unit' || price.transform_quantity ||
    price.recurring.usage_type !== 'licensed') throw new Error('Consumer price does not match approved configuration');
  return { plan, stripe };
}

export async function personalDoCustomer(ownerId: string, create = false): Promise<string | null> {
  const db = getServiceClient();
  const { data, error } = await db.from('personal_do_billing_accounts').select('stripe_customer_id').eq('owner_id', ownerId).maybeSingle();
  if (error) throw new Error('Consumer customer lookup failed');
  if (data) return data.stripe_customer_id;
  if (!create) return null;
  const customer = await getStripe().customers.create({ metadata: { personal_do_owner: ownerId } }, { idempotencyKey: `personal-do-owner:${ownerId}` });
  const { error: insertError } = await db.from('personal_do_billing_accounts').upsert({ owner_id: ownerId, stripe_customer_id: customer.id }, { onConflict: 'owner_id', ignoreDuplicates: true });
  if (insertError) throw new Error('Consumer customer mapping failed');
  const mapped = await personalDoCustomer(ownerId);
  if (mapped !== customer.id) throw new Error('Consumer customer mapping conflict');
  return mapped;
}
