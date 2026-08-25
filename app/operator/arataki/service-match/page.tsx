import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { CalendarClock, Eye, Sparkles } from 'lucide-react';
import {
  buildServiceSalesMatch,
  findSalesConversation,
  resolveAratakiTenantForUser,
  summariseMatches,
  type SalesConversationRow,
  type ServiceAppointmentRow,
} from '@/lib/arataki/service-match';
import { createClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/supabase/service';
import { ServiceMatchWorkspace } from './_components/ServiceMatchWorkspace';

export const metadata: Metadata = {
  title: 'Service match · Arataki',
  description: 'assembl operator overlay for service-to-sales opportunities.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type SearchParams = {
  tenantId?: string;
};

export default async function ServiceMatchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { tenantId } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=${encodeURIComponent('/operator/arataki/service-match')}`);

  const service = getServiceClient();
  const tenant = await resolveAratakiTenantForUser(service, user.id, tenantId);
  const now = new Date();
  const until = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const [{ data: appointments }, { data: conversations }] = tenant
    ? await Promise.all([
        service
          .from('arataki_service_appointments')
          .select('*')
          .eq('tenant_id', tenant.id)
          .gte('appointment_at', now.toISOString())
          .lte('appointment_at', until.toISOString())
          .order('appointment_at', { ascending: true }),
        service.from('arataki_sales_conversations').select('*').eq('tenant_id', tenant.id),
      ])
    : [{ data: [] }, { data: [] }];

  const salesRows = (conversations ?? []) as SalesConversationRow[];
  const matches = ((appointments ?? []) as ServiceAppointmentRow[])
    .map((appointment) => buildServiceSalesMatch(appointment, findSalesConversation(appointment, salesRows), now))
    .sort((a, b) => b.score - a.score || new Date(a.appointment.appointment_at).getTime() - new Date(b.appointment.appointment_at).getTime());
  const visibleMatches = matches.filter((match) => match.tier !== 'routine');
  const summary = summariseMatches(matches);

  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] px-4 py-8 text-[#3D4250] md:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="grid gap-7 border-b border-[rgba(61,66,80,0.12)] pb-7 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
          <div>
            <p className="font-mono text-[12px] uppercase tracking-[0.24em] text-[#C79B1F]">
              assembl · Arataki · Service-to-Sales Matcher
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-[clamp(3rem,7vw,6rem)] font-light leading-[0.9] text-[color:var(--text-primary)]">
              Service match.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed md:text-lg">
              Customers coming in for service, scored for sales-floor timing before the appointment.
            </p>
          </div>
          <aside className="rounded-[8px] border border-[rgba(61,66,80,0.12)] bg-white/75 p-5 shadow-[0_10px_30px_rgba(61,66,80,0.06)]">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-1 h-5 w-5 text-[#C79B1F]" aria-hidden />
              <div>
                <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#9D8C7D]">
                  Matcher brief
                </p>
                <p className="mt-2 text-sm leading-relaxed">
                  {summary.strong > 0
                    ? `${summary.strong} strong opportunity${summary.strong === 1 ? '' : 'ies'} should be reviewed before the service desk opens.`
                    : 'No strong service-to-sales opportunities are showing yet. Import the service and sales CSVs to refresh the view.'}
                </p>
              </div>
            </div>
          </aside>
        </header>

        <section className="mt-7 grid gap-3 sm:grid-cols-3">
          <MetricCard icon={Sparkles} label="Strong" value={summary.strong} />
          <MetricCard icon={Eye} label="Watch" value={summary.watch} />
          <MetricCard icon={CalendarClock} label="Routine" value={summary.routine} />
        </section>

        {tenant ? (
          <ServiceMatchWorkspace tenant={tenant} matches={visibleMatches} />
        ) : (
          <section className="mt-8 rounded-[8px] border border-[rgba(217,168,90,0.38)] bg-[rgba(217,168,90,0.10)] p-5">
            <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#9D8C7D]">Tenant required</p>
            <h2 className="mt-2 font-display text-3xl font-light text-[color:var(--text-primary)]">No dealership membership found.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed">
              The overlay needs a tenant row before service and sales CSVs can be matched to a rooftop.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Sparkles;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[8px] border border-[rgba(61,66,80,0.12)] bg-white/70 p-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-[#9D8C7D]">{label}</span>
        <Icon className="h-4 w-4 text-[#C79B1F]" aria-hidden />
      </div>
      <p className="mt-3 font-mono text-3xl leading-none">{value}</p>
    </div>
  );
}
