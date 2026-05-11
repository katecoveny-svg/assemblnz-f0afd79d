/**
 * Stripe SetupIntent — first-time card collection.
 *
 * Used by the billing UI's "Add/update card" CTA. Creates a SetupIntent
 * scoped to the tenant's Stripe Customer; the front-end Stripe Elements
 * form completes it with the user's card details. On success the
 * webhook (`setup_intent.succeeded`) records the resulting payment
 * method id on toro_stripe_customers.default_payment_method_id.
 */
import 'server-only';
import type Stripe from 'stripe';
import { getStripe } from './client';
import { getOrCreateCustomer } from './customer';

export interface CreateSetupIntentInput {
  tenantId: string;
  tenantSlug?: string;
  tenantName?: string;
  contactEmail?: string;
}

export interface SetupIntentResult {
  clientSecret: string;
  setupIntentId: string;
  customerId: string;
}

export async function createSetupIntent(
  input: CreateSetupIntentInput,
): Promise<SetupIntentResult> {
  const customer = await getOrCreateCustomer(input);
  const stripe = getStripe();

  const setupIntent: Stripe.SetupIntent = await stripe.setupIntents.create({
    customer: customer.stripe_customer_id,
    usage: 'off_session',
    payment_method_types: ['card'],
    metadata: {
      assembl_tenant_id: input.tenantId,
      assembl_product: 'toro',
    },
  });

  if (!setupIntent.client_secret) {
    throw new Error('createSetupIntent: Stripe returned no client_secret');
  }

  return {
    clientSecret: setupIntent.client_secret,
    setupIntentId: setupIntent.id,
    customerId: customer.stripe_customer_id,
  };
}
