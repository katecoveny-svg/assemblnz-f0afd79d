import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { redirect, notFound } from 'next/navigation';
import { Check, Inbox, MailCheck, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/supabase/service';
import { completeOnboardingAction, saveThresholdsAction, verifyAliasAction } from './actions';
import { OAuthButtons } from './OAuthButtons';

export const metadata: Metadata = {
  title: 'Onboarding',
  description: 'Finish tenant onboarding before entering the assembl inbox.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type Params = { slug: string };

type Tenant = {
  id: string;
  name: string;
  slug: string;
  kete_primary: string | null;
  onboarding_complete: boolean | null;
  metadata: Record<string, unknown> | null;
};

type Connection = {
  provider: string;
  status: string;
  connected_at: string | null;
};

type Alias = {
  alias_email: string;
  status: string;
};

export default async function TenantOnboardingPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const redirectTo = `/app/${slug}/onboarding`;

  const envConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  if (!envConfigured) redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);

  const service = getServiceClient();
  const { data: tenant } = await service
    .from('tenants')
    .select('id,name,slug,kete_primary,onboarding_complete,metadata')
    .eq('slug', slug)
    .maybeSingle();

  if (!tenant) notFound();
  const currentTenant = tenant as Tenant;
  if (currentTenant.onboarding_complete) redirect(`/app/${slug}/inbox`);

  const [{ data: member }, { data: admin }] = await Promise.all([
    service
      .from('tenant_members')
      .select('role')
      .eq('tenant_id', currentTenant.id)
      .eq('user_id', user.id)
      .maybeSingle(),
    service.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle(),
  ]);

  if (!member && !admin) redirect('/app');

  const [{ data: aliases }, { data: connections }] = await Promise.all([
    service
      .from('tenant_email_aliases')
      .select('alias_email,status')
      .eq('tenant_id', currentTenant.id)
      .eq('purpose', 'ops')
      .limit(1),
    service
      .from('tenant_tool_connections')
      .select('provider,status,connected_at')
      .eq('tenant_id', currentTenant.id),
  ]);

  const alias = ((aliases ?? []) as Alias[])[0];
  const connectionByProvider = new Map(
    ((connections ?? []) as Connection[]).map((connection) => [connection.provider, connection]),
  );
  const thresholds = (currentTenant.metadata?.approval_thresholds ?? {}) as {
    auto_confirm_enabled?: boolean;
    min_confidence?: number;
  };

  async function verifyAliasFormAction() {
    'use server';
    await verifyAliasAction(slug);
  }

  async function saveThresholdsFormAction(formData: FormData) {
    'use server';
    await saveThresholdsAction(slug, formData);
  }

  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] px-5 py-10 text-[color:var(--text-primary)] md:px-10 md:py-14">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="font-mono text-[12px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
              {currentTenant.slug} · onboarding
            </p>
            <h1 className="mt-4 font-display text-[clamp(3rem,7vw,5.8rem)] font-light leading-[0.9]">
              Bring the fleet online.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
              Confirm the inbound alias, connect the operating tools, set the
              first approval posture, then head to your draft inbox.
            </p>
          </div>
          <div className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/65 px-5 py-4">
            <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              Kete
            </p>
            <p className="mt-1 font-display text-3xl font-light leading-none">
              {currentTenant.kete_primary ?? 'industry-pack'}
            </p>
          </div>
        </header>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_340px]">
          <section className="space-y-4">
            <OnboardingStep
              number="01"
              title="Confirm inbound email alias"
              status={alias?.status === 'verified' ? 'complete' : 'pending'}
              icon={<MailCheck className="h-5 w-5" aria-hidden />}
            >
              <p className="text-sm leading-relaxed text-[color:var(--text-body)]">
                Forward any sample operational email to{' '}
                <span className="font-mono text-[color:var(--assembl-pounamu)]">
                  {alias?.alias_email ?? `ops-${slug}@assembl.email`}
                </span>
                , then mark the alias verified here.
              </p>
              <form action={verifyAliasFormAction} className="mt-4">
                <button type="submit" className="btn-ghost inline-flex h-10 items-center justify-center px-5">
                  I forwarded a sample
                </button>
              </form>
            </OnboardingStep>

            <OnboardingStep
              number="02"
              title="Stripe subscription"
              status={connectionByProvider.get('stripe')?.status === 'connected' ? 'complete' : 'pending'}
              icon={<ShieldCheck className="h-5 w-5" aria-hidden />}
            >
              <p className="text-sm leading-relaxed text-[color:var(--text-body)]">
                Stripe checkout is already complete for this tenant. The pack
                will stay active while the subscription is current.
              </p>
            </OnboardingStep>

            <OnboardingStep
              number="03"
              title="Connect Xero and Google Workspace"
              status={
                connectionByProvider.get('xero')?.status === 'connected' &&
                connectionByProvider.get('google')?.status === 'connected'
                  ? 'complete'
                  : 'pending'
              }
              icon={<Check className="h-5 w-5" aria-hidden />}
            >
              <div className="grid gap-4 md:grid-cols-[1fr_260px]">
                <div className="space-y-2 text-sm text-[color:var(--text-body)]">
                  <StatusLine label="Xero" status={connectionByProvider.get('xero')?.status ?? 'pending'} />
                  <StatusLine
                    label="Google Workspace"
                    status={connectionByProvider.get('google')?.status ?? 'pending'}
                  />
                </div>
                <OAuthButtons tenantId={currentTenant.id} slug={slug} />
              </div>
            </OnboardingStep>

            <OnboardingStep
              number="04"
              title="Set approval thresholds"
              status={thresholds.min_confidence ? 'complete' : 'pending'}
              icon={<Check className="h-5 w-5" aria-hidden />}
            >
              <form action={saveThresholdsFormAction} className="mt-2 grid gap-4 md:grid-cols-[1fr_180px]">
                <label className="flex items-center gap-3 rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[color:var(--assembl-paper)] px-4 py-3 text-sm">
                  <input
                    type="checkbox"
                    name="autoConfirm"
                    defaultChecked={thresholds.auto_confirm_enabled ?? false}
                    className="h-4 w-4 accent-[color:var(--assembl-pounamu)]"
                  />
                  Auto-confirm above confidence threshold
                </label>
                <label>
                  <span className="font-mono text-[12px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
                    Confidence
                  </span>
                  <input
                    type="number"
                    min="0.5"
                    max="0.99"
                    step="0.01"
                    name="confidence"
                    defaultValue={thresholds.min_confidence ?? 0.86}
                    className="mt-2 w-full rounded-[8px] border border-[rgba(35,33,31,0.14)] bg-white px-3 py-2 text-sm outline-none focus:border-[color:var(--assembl-pounamu)]"
                  />
                </label>
                <button type="submit" className="btn-ghost h-10 px-5 md:col-span-2 md:w-fit">
                  Save thresholds
                </button>
              </form>
            </OnboardingStep>
          </section>

          <aside className="h-fit rounded-[8px] border border-[rgba(43,107,87,0.22)] bg-[rgba(43,107,87,0.08)] p-6">
            <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--assembl-pounamu)]">
              Ready when you are
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-body)]">
              The inbox already has the welcome briefing draft queued. You can
              enter now and come back to finish connections as needed.
            </p>
            <form action={completeOnboardingAction.bind(null, slug)} className="mt-6">
              <button type="submit" className="cta-primary inline-flex h-11 w-full items-center justify-center px-6">
                Take me to my inbox
                <Inbox className="ml-2 h-4 w-4" aria-hidden />
              </button>
            </form>
          </aside>
        </div>
      </div>
    </main>
  );
}

function OnboardingStep({
  number,
  title,
  status,
  icon,
  children,
}: {
  number: string;
  title: string;
  status: 'pending' | 'complete';
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <article className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/65 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(43,107,87,0.22)] bg-[color:var(--assembl-pounamu-paper)] text-[color:var(--assembl-pounamu)]">
            {icon}
          </div>
          <div>
            <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              {number}
            </p>
            <h2 className="mt-1 font-display text-3xl font-light leading-none">{title}</h2>
          </div>
        </div>
        <StatusPill status={status} />
      </div>
      <div className="mt-5 pl-0 md:pl-[60px]">{children}</div>
    </article>
  );
}

function StatusLine({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center justify-between rounded-[8px] border border-[rgba(35,33,31,0.08)] bg-[color:var(--assembl-paper)] px-4 py-3">
      <span>{label}</span>
      <StatusPill status={status === 'connected' ? 'complete' : 'pending'} label={status} />
    </div>
  );
}

function StatusPill({
  status,
  label,
}: {
  status: 'pending' | 'complete';
  label?: string;
}) {
  return (
    <span
      className={[
        'rounded-full border px-3 py-1 font-mono text-[12px] uppercase tracking-[0.16em]',
        status === 'complete'
          ? 'border-[rgba(43,107,87,0.28)] bg-[rgba(43,107,87,0.10)] text-[color:var(--assembl-pounamu)]'
          : 'border-[rgba(212,168,83,0.45)] bg-[rgba(212,168,83,0.10)] text-[#7A5C1E]',
      ].join(' ')}
    >
      {label ?? status}
    </span>
  );
}
