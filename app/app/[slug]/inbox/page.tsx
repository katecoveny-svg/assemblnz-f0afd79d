import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/supabase/service';
import { InboxExperience } from './InboxExperience';
import { toOperatorDraft, type OperatorDraftRow } from './model';

export const metadata: Metadata = {
  title: 'Operator inbox',
  description: 'Daily Industry Pack briefing inbox for operator draft review.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type Params = { slug: string };

type Tenant = {
  id: string;
  name: string;
  slug: string;
  kete_primary: string | null;
  metadata: Record<string, unknown> | null;
};

type OutcomeRow = {
  agent_code: string | null;
  request_summary: string | null;
  response_summary: string | null;
  created_at: string | null;
};

export default async function OperatorInboxPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const redirectTo = `/app/${slug}/inbox`;

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
    .select('id,name,slug,kete_primary,metadata')
    .eq('slug', slug)
    .maybeSingle();

  if (!tenant) notFound();
  const currentTenant = tenant as Tenant;

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

  const [{ data: draftRows }, { data: outcomes }] = await Promise.all([
    service
      .from('toro_drafts')
      .select(
        'id,status,draft_body,incoming_body,confidence,created_by_agent,contact_name,contact_identifier,source_metadata,extracted_actions,created_at',
      )
      .eq('tenant_id', currentTenant.id)
      .in('status', ['pending_approval', 'reviewing', 'send_failed'])
      .order('created_at', { ascending: false })
      .limit(80),
    service
      .from('audit_log')
      .select('agent_code,request_summary,response_summary,created_at')
      .eq('tenant_id', currentTenant.id)
      .order('created_at', { ascending: false })
      .limit(6),
  ]);

  const drafts = ((draftRows ?? []) as OperatorDraftRow[]).map(toOperatorDraft);
  const metadata = currentTenant.metadata ?? {};
  const weather =
    typeof metadata.weather_summary === 'string'
      ? metadata.weather_summary
      : 'Weather context will appear once the morning briefing runner has live data for this tenant.';
  const upcomingJobs = Array.isArray(metadata.upcoming_jobs)
    ? metadata.upcoming_jobs.filter(isString).slice(0, 5)
    : [];
  const recentOutcomes = ((outcomes ?? []) as OutcomeRow[])
    .map((row) => row.response_summary ?? row.request_summary)
    .filter(isString)
    .slice(0, 4);

  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] px-4 py-8 text-[color:var(--text-primary)] md:px-8 md:py-10">
      <div className="mx-auto max-w-[1500px]">
        <InboxExperience
          slug={slug}
          tenantName={currentTenant.name}
          dateLabel={new Date().toLocaleDateString('en-NZ', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
          drafts={drafts}
          briefing={{
            weather,
            upcomingJobs,
            recentOutcomes,
          }}
        />
      </div>
    </main>
  );
}

function isString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
