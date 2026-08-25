import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AddCardForm } from './AddCardForm';

export const metadata: Metadata = {
  title: 'Tōro billing',
  description:
    'Subscription, saved card, and spend history for your Tōro household. Every Tōro-initiated charge requires explicit human approval before the card is captured.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface PaymentIntentRow {
  id: string;
  amount_cents: number;
  currency: string;
  status: string;
  description: string | null;
  created_at: string;
  captured_at: string | null;
}

interface CustomerRow {
  stripe_customer_id: string;
  default_payment_brand: string | null;
  default_payment_last4: string | null;
  subscription_status: string | null;
  subscription_current_period_end: string | null;
}

export default async function ToroBillingPage({ params }: PageProps) {
  const { slug } = await params;

  const envConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  if (!envConfigured) {
    redirect(`/login?redirect=/app/toro/${slug}/billing`);
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    redirect(`/login?redirect=/app/toro/${slug}/billing`);
  }

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, slug, name')
    .eq('slug', slug)
    .maybeSingle();
  if (!tenant) notFound();
  const tenantId = (tenant as { id: string; slug: string; name: string }).id;
  const tenantName = (tenant as { id: string; slug: string; name: string }).name;

  const { data: membership } = await supabase
    .from('tenant_members')
    .select('role')
    .eq('tenant_id', tenantId)
    .eq('user_id', userData.user.id)
    .maybeSingle();
  if (!membership) notFound();

  const [{ data: customer }, { data: paymentRows }] = await Promise.all([
    supabase
      .from('toro_stripe_customers')
      .select(
        'stripe_customer_id, default_payment_brand, default_payment_last4, subscription_status, subscription_current_period_end',
      )
      .eq('tenant_id', tenantId)
      .maybeSingle(),
    supabase
      .from('toro_payment_intents')
      .select('id, amount_cents, currency, status, description, created_at, captured_at')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  const cust = (customer as CustomerRow | null) ?? null;
  const rows = (paymentRows as PaymentIntentRow[] | null) ?? [];

  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] px-6 py-12 md:px-10 md:py-16">
      <div className="mx-auto max-w-[920px]">
        <p className="font-mono text-[12px] lowercase tracking-[0.18em] text-[color:var(--text-secondary)]">
          assembl <span className="mx-1.5 text-[color:var(--assembl-gold-thread)]">·</span> tōro <span className="mx-1.5 text-[color:var(--assembl-gold-thread)]">·</span> {tenantName.toLowerCase()}
        </p>
        <h1
          className="mt-2 font-display leading-[0.95] tracking-tight text-[color:var(--text-primary)]"
          style={{ fontWeight: 300, fontSize: 'clamp(2.2rem, 5vw, 3.4rem)' }}
        >
          billing
        </h1>
        <p className="mt-3 max-w-2xl font-mono text-[12px] lowercase tracking-[0.15em] text-[color:var(--text-secondary)]">
          subscription · saved card · spend history · no auto-charge ever
        </p>

        <section className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
          <article className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-white px-5 py-5">
            <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              subscription
            </p>
            <p className="mt-2 font-display text-[28px] font-light leading-tight text-[color:var(--text-primary)]">
              {prettyStatus(cust?.subscription_status)}
            </p>
            <p className="mt-1.5 font-mono text-[12px] tracking-[0.04em] text-[color:var(--text-secondary)]">
              {cust?.subscription_current_period_end
                ? `renews ${formatDate(cust.subscription_current_period_end)}`
                : 'no active subscription'}
            </p>
            <p className="mt-3 font-mono text-[12px] tracking-[0.04em] text-[color:var(--text-secondary)]">
              tōro family plan · $29 NZD / month
            </p>
          </article>

          <article className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-white px-5 py-5">
            <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              saved card
            </p>
            <p className="mt-2 font-display text-[28px] font-light leading-tight text-[color:var(--text-primary)]">
              {cust?.default_payment_brand && cust.default_payment_last4
                ? `${prettyBrand(cust.default_payment_brand)} •••• ${cust.default_payment_last4}`
                : '— no card on file'}
            </p>
            <div className="mt-4">
              <AddCardForm slug={slug} />
            </div>
          </article>
        </section>

        <section className="mt-10">
          <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
            spend history
          </p>
          {rows.length === 0 ? (
            <div className="mt-3 rounded-[2px] border border-dashed border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-5 py-6 text-center">
              <p className="font-display text-[18px] font-light text-[color:var(--text-primary)]">
                no charges yet
              </p>
              <p className="mt-1 font-mono text-[12px] tracking-[0.04em] text-[color:var(--text-secondary)]">
                any Tōro-initiated payment will appear here once you approve it from the inbox.
              </p>
            </div>
          ) : (
            <table className="mt-3 w-full border-collapse rounded-[2px] border border-[color:var(--assembl-cloud)] bg-white text-left">
              <thead>
                <tr className="font-mono text-[12px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
                  <th className="px-4 py-3">created</th>
                  <th className="px-4 py-3">description</th>
                  <th className="px-4 py-3 text-right">amount</th>
                  <th className="px-4 py-3">status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-[color:var(--assembl-cloud)] text-[13px]">
                    <td className="px-4 py-3 font-mono text-[12px] text-[color:var(--text-secondary)]">
                      {formatDate(r.created_at)}
                    </td>
                    <td className="px-4 py-3 text-[color:var(--text-primary)]">
                      {r.description ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[12px] text-[color:var(--text-primary)]">
                      {formatAmount(r.amount_cents, r.currency)}
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] uppercase tracking-[0.12em]">
                      <span className={statusTone(r.status)}>{r.status.replace(/_/g, ' ')}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <footer className="mt-16 border-t border-[color:var(--assembl-cloud)] pt-4 text-right font-mono text-[12px] lowercase tracking-[0.12em] text-[color:var(--text-secondary)]">
          canon hard rule #34 · no auto-charge · capture only on explicit whānau approval
        </footer>
      </div>
    </main>
  );
}

function prettyStatus(s: string | null | undefined): string {
  if (!s) return '— not subscribed';
  return s.replace(/_/g, ' ');
}

function prettyBrand(b: string): string {
  return b.charAt(0).toUpperCase() + b.slice(1);
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-NZ', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function formatAmount(cents: number, currency: string): string {
  const formatter = new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  });
  return formatter.format(cents / 100);
}

function statusTone(status: string): string {
  if (status === 'succeeded') return 'text-emerald-700';
  if (status === 'failed' || status === 'canceled') return 'text-red-700';
  if (status === 'requires_capture' || status === 'requires_action') {
    return 'text-[color:var(--assembl-gold-thread)]';
  }
  return 'text-[color:var(--text-secondary)]';
}
