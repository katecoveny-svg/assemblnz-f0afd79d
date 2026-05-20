import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Car, Clock, ShieldCheck, TriangleAlert } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/supabase/service';
import { buildLoanCarSummary, resolveTenantForUser, type LoanCarRow } from '@/lib/arataki/loan-cars';
import { LoanCarsWorkspace } from './_components/LoanCarsWorkspace';

export const metadata: Metadata = {
  title: 'Loan cars · Arataki',
  description: 'assembl operator overlay for dealer loan car availability, returns, and handoffs.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type SearchParams = {
  tenantId?: string;
};

export default async function LoanCarsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { tenantId } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=${encodeURIComponent('/operator/arataki/loan-cars')}`);

  const service = getServiceClient();
  const tenant = await resolveTenantForUser(service, user.id, tenantId);

  const { data } = tenant
    ? await service
        .from('loan_cars')
        .select('id,user_id,tenant_id,make,model,rego,status,borrower_name,borrower_phone,return_date,expected_return_at,loan_started_at,linked_job_id,notes,created_at,updated_at')
        .eq('tenant_id', tenant.id)
        .order('expected_return_at', { ascending: true, nullsFirst: false })
    : { data: [] };

  const cars = (data ?? []) as LoanCarRow[];
  const summary = buildLoanCarSummary(cars);

  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] px-4 py-8 text-[color:var(--text-primary)] md:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="grid gap-7 border-b border-[rgba(61,66,80,0.12)] pb-7 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#2B6B57]">
              assembl · Arataki · Loan Car Warden
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-[clamp(3.2rem,7vw,6.4rem)] font-light leading-[0.9]">
              Loan car overlay.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#3D4250] md:text-lg">
              CSV-first view of courtesy vehicles, borrowers, expected returns, and operator-reviewed handoffs.
            </p>
          </div>
          <aside className="rounded-[8px] border border-[rgba(61,66,80,0.12)] bg-white/75 p-5 shadow-[0_10px_30px_rgba(61,66,80,0.06)]">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-1 h-5 w-5 text-[#2B6B57]" aria-hidden />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9D8C7D]">
                  Warden draft
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#3D4250]">{summary.wardenDraft}</p>
              </div>
            </div>
          </aside>
        </header>

        <section className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard icon={Car} label="Available" value={summary.available} />
          <MetricCard icon={Clock} label="On loan" value={summary.onLoan} />
          <MetricCard icon={TriangleAlert} label="Overdue" value={summary.overdue} tone={summary.overdue > 0 ? 'amber' : 'pounamu'} />
          <MetricCard icon={Clock} label="Due today" value={summary.dueToday} />
        </section>

        {tenant ? (
          <LoanCarsWorkspace cars={cars} tenant={tenant} summary={summary} />
        ) : (
          <section className="mt-8 rounded-[8px] border border-[rgba(217,168,90,0.38)] bg-[rgba(217,168,90,0.10)] p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9D8C7D]">
              Tenant required
            </p>
            <h2 className="mt-2 font-display text-3xl font-light">No dealership membership found.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#3D4250]">
              The overlay needs a tenant row before CSV imports can attach loan cars to a rooftop.
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
  tone = 'pounamu',
}: {
  icon: typeof Car;
  label: string;
  value: number;
  tone?: 'pounamu' | 'amber';
}) {
  const color = tone === 'amber' ? '#D9A85A' : '#2B6B57';
  return (
    <div className="rounded-[8px] border border-[rgba(61,66,80,0.12)] bg-white/70 p-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#9D8C7D]">{label}</span>
        <Icon className="h-4 w-4" style={{ color }} aria-hidden />
      </div>
      <p className="mt-3 font-mono text-3xl leading-none text-[#3D4250]">{value}</p>
    </div>
  );
}
