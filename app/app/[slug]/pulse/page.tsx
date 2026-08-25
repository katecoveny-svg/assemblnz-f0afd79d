import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/supabase/service';
import { toBusinessPulseBrief } from '@/lib/business-pulse/run';
import { BusinessPulseWidget } from '@/components/app/BusinessPulseWidget';

export const metadata: Metadata = {
  title: 'Business Pulse',
  description: 'Weekly operator brief for the assembl command centre.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type Params = { slug: string };

type Tenant = {
  id: string;
  slug: string;
  name: string;
};

async function loadTenantForUser(slug: string): Promise<Tenant> {
  const redirectTo = `/app/${slug}/pulse`;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);

  const service = getServiceClient();
  const { data: tenant } = await service
    .from('tenants')
    .select('id,slug,name')
    .eq('slug', slug)
    .maybeSingle();
  if (!tenant) notFound();

  const [{ data: member }, { data: admin }] = await Promise.all([
    service
      .from('tenant_members')
      .select('role')
      .eq('tenant_id', (tenant as Tenant).id)
      .eq('user_id', user.id)
      .maybeSingle(),
    service.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle(),
  ]);
  if (!member && !admin) redirect('/app');
  return tenant as Tenant;
}

export default async function BusinessPulsePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const tenant = await loadTenantForUser(slug);
  const service = getServiceClient();
  const { data: latest } = await service
    .from('business_pulse_briefs')
    .select(
      'id,tenant_id,brief_date,drive_path,markdown,three_things,cash_position,pipeline_movement,weekly_commitments,pilot_health,tikanga_check_passed,privacy_check_passed,source_status,created_at',
    )
    .eq('tenant_id', tenant.id)
    .order('brief_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  const brief = latest ? toBusinessPulseBrief(latest as never, tenant) : null;

  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] px-5 py-10 text-[color:var(--text-primary)] md:px-10 md:py-14">
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/app/${tenant.slug}/inbox`}
          className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Back to inbox
        </Link>

        <header className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div>
            <p className="font-mono text-[12px] uppercase tracking-[0.24em] text-[color:var(--assembl-pounamu)]">
              ARATAKI · Business Pulse
            </p>
            <h1 className="mt-4 font-display text-[clamp(3rem,7vw,5.8rem)] font-light leading-[0.9]">
              Monday brief for {tenant.name}.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
              Xero, Stripe, calendar, pipeline, and pilot health collapsed into three priorities.
              Read-only by default; any send, pay, post, or reschedule waits for approval.
            </p>
          </div>
          <BusinessPulseWidget brief={brief} tenantSlug={tenant.slug} />
        </header>

        <section className="mt-8 rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/70 p-5 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                Markdown record
              </p>
              <h2 className="mt-2 font-display text-3xl font-light">
                {brief ? brief.drivePath : 'No Drive path yet'}
              </h2>
            </div>
            <FileText className="h-6 w-6 text-[color:var(--assembl-pounamu)]" aria-hidden />
          </div>

          {brief ? (
            <pre className="mt-5 max-h-[680px] overflow-auto whitespace-pre-wrap rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[color:var(--assembl-paper)] p-4 text-sm leading-relaxed">
              {brief.markdown}
            </pre>
          ) : (
            <p className="mt-5 text-sm leading-relaxed text-[color:var(--text-secondary)]">
              Trigger a manual run through the Business Pulse API or wait for Monday 07:00 NZT once
              this tenant has <code>metadata.business_pulse_enabled</code> set to true.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
