'use server';

/**
 * Server actions for the Stripe Connect onboarding flow (/onboarding/connect).
 *
 * startConnectOnboarding ensures the signed-in user has a Stripe Express account
 * (NZ), then redirects them to a one-time hosted Stripe onboarding link. When
 * they finish, Stripe returns them to /onboarding/connect?done=1 and the
 * account.updated webhook mirrors their capability flags into
 * agent_payout_accounts.
 */

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getOrCreateConnectAccount, createAccountLink } from '@/lib/stripe/connect';

async function resolveOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const proto = h.get('x-forwarded-proto') ?? 'https';
  if (host) return `${proto}://${host}`;
  // Last resort for local dev when headers are absent.
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://assembl.co.nz';
}

export async function startConnectOnboarding(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/onboarding/connect');
  }

  const accountId = await getOrCreateConnectAccount(user.id, user.email ?? undefined);
  const origin = await resolveOrigin();
  const url = await createAccountLink(accountId, origin);

  // Hand off to Stripe's hosted onboarding. redirect() throws, so this is the
  // last statement.
  redirect(url);
}
