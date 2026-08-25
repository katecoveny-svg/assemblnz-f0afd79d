import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { resolveTenantIdForUser } from '@/lib/billing/tenant-context';
import { getActiveSubscription } from '@/lib/billing/subscription';
import { getSelfServeTier, SELF_SERVE_POSTURE } from '@/lib/billing/tiers';
import { ManageBillingButton } from '@/components/billing/ManageBillingButton';

export const metadata: Metadata = {
  title: 'Billing',
  description: 'Your assembl plan and billing.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('en-NZ', { dateStyle: 'medium' }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/app/billing');

  const tenantId = await resolveTenantIdForUser(user.id);
  const subscription = tenantId ? await getActiveSubscription(tenantId) : null;
  const tier = subscription ? getSelfServeTier(subscription.tier === 'team' ? 'team' : 'solo') : null;

  return (
    <main className="bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      <section className="container py-20 lg:py-28">
        <div className="mx-auto max-w-2xl">
          <p className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">Billing</p>
          <h1 className="mt-5 font-display text-display-lg font-light">Your plan</h1>

          {subscription && tier ? (
            <div className="mt-8 rounded-[8px] border border-[color:var(--assembl-pounamu)] bg-white/70 p-8 shadow-card">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-display text-display-md font-light">{tier.name}</h2>
                <span className="rounded-full border border-[rgba(43,107,87,0.24)] bg-[#E8EFE9] px-3 py-1 font-mono text-[12px] uppercase tracking-[0.12em] text-[#2B6B57]">
                  {subscription.status}
                </span>
              </div>
              <p className="mt-2 text-body-md text-[color:var(--text-body)]">
                NZ${tier.monthlyNzd}/month · {tier.summary}
              </p>
              <p className="mt-4 text-body-sm text-[color:var(--text-secondary)]">
                {subscription.cancelAtPeriodEnd
                  ? `Cancels at the end of the current period — access until ${formatDate(subscription.currentPeriodEnd)}.`
                  : `Renews ${formatDate(subscription.currentPeriodEnd)}.`}
              </p>
              <div className="mt-6">
                <ManageBillingButton />
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white/55 p-8">
              <h2 className="font-display text-display-md font-light">You’re on the free tier</h2>
              <p className="mt-3 text-body-md text-[color:var(--text-body)]">
                The free SPARK tools are yours to use. To turn a workflow on for real work,
                pick a self-serve plan — Solo or Team, no sales call.
              </p>
              <Link href="/pricing" className="cta-primary mt-6 inline-flex h-12 items-center justify-center px-6">
                See plans
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </div>
          )}

          <p className="mt-6 flex items-start gap-2 text-body-sm text-[color:var(--text-secondary)]">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--assembl-pounamu)]" aria-hidden />
            {SELF_SERVE_POSTURE}
          </p>
        </div>
      </section>
    </main>
  );
}
