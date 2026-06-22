/**
 * Stripe Connect helpers — Express account onboarding for agent payout
 * recipients (Dash publishers + future agent creators).
 *
 * Flow:
 *   1. getOrCreateConnectAccount(userId) → ensures an Express account exists for
 *      the user and a row in agent_payout_accounts mirroring it.
 *   2. createAccountLink(accountId, ...) → a one-time hosted onboarding URL the
 *      user is redirected to (Stripe collects KYC, bank details, etc.).
 *   3. The account.updated webhook mirrors capability flags back into
 *      agent_payout_accounts as the user completes onboarding.
 *
 * Server-only. The Stripe Connect account is created on the platform account
 * selected by STRIPE_SECRET_KEY (acct_1TCqv7PXAX9ohARR in production).
 */
import 'server-only';
import type Stripe from 'stripe';
import { getStripe } from './client';
import { createServiceClient } from './supabase-service';

export interface PayoutAccountRow {
  user_id: string;
  stripe_account_id: string;
  account_type: string;
  country: string;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  onboarding_status: 'pending' | 'onboarding' | 'active' | 'restricted';
}

/** Read the caller's existing payout account row, if any. */
export async function loadPayoutAccountByUserId(
  userId: string,
): Promise<PayoutAccountRow | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('agent_payout_accounts')
    .select(
      'user_id, stripe_account_id, account_type, country, charges_enabled, payouts_enabled, details_submitted, onboarding_status',
    )
    .eq('user_id', userId)
    .maybeSingle();
  if (error || !data) return null;
  return data as PayoutAccountRow;
}

export async function loadPayoutAccountByStripeId(
  stripeAccountId: string,
): Promise<PayoutAccountRow | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('agent_payout_accounts')
    .select(
      'user_id, stripe_account_id, account_type, country, charges_enabled, payouts_enabled, details_submitted, onboarding_status',
    )
    .eq('stripe_account_id', stripeAccountId)
    .maybeSingle();
  if (error || !data) return null;
  return data as PayoutAccountRow;
}

/**
 * Ensure the user has a Stripe Express account + a mirroring row. Idempotent:
 * if a row already exists we return its account id; otherwise we create a fresh
 * NZ Express account and persist it. Returns the Stripe account id.
 */
export async function getOrCreateConnectAccount(
  userId: string,
  email?: string,
): Promise<string> {
  const existing = await loadPayoutAccountByUserId(userId);
  if (existing?.stripe_account_id) return existing.stripe_account_id;

  const stripe = getStripe();
  const account = await stripe.accounts.create({
    type: 'express',
    country: 'NZ',
    email,
    business_type: 'company',
    capabilities: {
      transfers: { requested: true },
    },
    metadata: { assembl_user_id: userId },
  });

  const supabase = createServiceClient();
  await supabase.from('agent_payout_accounts').upsert(
    {
      user_id: userId,
      stripe_account_id: account.id,
      account_type: 'express',
      country: 'NZ',
      charges_enabled: account.charges_enabled ?? false,
      payouts_enabled: account.payouts_enabled ?? false,
      details_submitted: account.details_submitted ?? false,
      onboarding_status: deriveOnboardingStatus(account),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id', ignoreDuplicates: false },
  );

  return account.id;
}

/**
 * Create a one-time Account Link the user is redirected to in order to complete
 * (or resume) Express onboarding. `origin` is the absolute site origin used to
 * build the return/refresh URLs.
 */
export async function createAccountLink(
  accountId: string,
  origin: string,
): Promise<string> {
  const stripe = getStripe();
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/onboarding/connect?refresh=1`,
    return_url: `${origin}/onboarding/connect?done=1`,
    type: 'account_onboarding',
  });
  return link.url;
}

/**
 * Map a Stripe account's capability flags to our lifecycle status.
 *   - active     : payouts enabled and details submitted (fully onboarded)
 *   - restricted : details submitted but Stripe still lists requirements
 *   - onboarding : account created, details not yet submitted
 *   - pending    : nothing started
 */
export function deriveOnboardingStatus(
  account: Pick<Stripe.Account, 'charges_enabled' | 'payouts_enabled' | 'details_submitted' | 'requirements'>,
): PayoutAccountRow['onboarding_status'] {
  const payouts = account.payouts_enabled ?? false;
  const submitted = account.details_submitted ?? false;
  const dueNow = account.requirements?.currently_due ?? [];
  const pastDue = account.requirements?.past_due ?? [];

  if (payouts && submitted) return 'active';
  if (submitted && (dueNow.length > 0 || pastDue.length > 0)) return 'restricted';
  if (submitted) return 'restricted';
  return 'onboarding';
}

/**
 * Mirror a Stripe account's current capability flags into agent_payout_accounts.
 * Called by the account.updated webhook. No-ops cleanly (warns) if the table or
 * matching row is absent.
 */
export async function syncAccountStatus(account: Stripe.Account): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from('agent_payout_accounts')
    .update({
      charges_enabled: account.charges_enabled ?? false,
      payouts_enabled: account.payouts_enabled ?? false,
      details_submitted: account.details_submitted ?? false,
      onboarding_status: deriveOnboardingStatus(account),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_account_id', account.id);

  if (error) {
    // eslint-disable-next-line no-console
    console.warn(`syncAccountStatus: ${error.message} (account ${account.id})`);
  }
}
