import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { loadKpiSnapshot, type KpiSnapshot } from '@/lib/evidence/kpis';
import { CitationCoverageBar, ReversalSpark } from './Charts';
import { RefreshButton } from './RefreshButton';

export const metadata: Metadata = {
  title: 'Evidence Ledger metrics',
  description:
    'Six brutally simple KPIs for the Evidence Ledger: time to first completed case, citation coverage, approval coverage, reversal rate, cycle-time reduction, NRR by cohort.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function MetricsPage() {
  const envConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  if (!envConfigured) {
    redirect('/login?redirect=/app/admin/metrics');
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    redirect('/login?redirect=/app/admin/metrics');
  }

  const { snapshot, source, error } = await loadKpiSnapshot();

  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] px-6 py-12 md:px-10 md:py-16">
      <div className="mx-auto max-w-[1100px]">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[12px] lowercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              assembl <span className="mx-1.5 text-[color:var(--assembl-gold-thread)]">·</span> evidence ledger
            </p>
            <h1
              className="mt-2 font-display leading-[0.95] tracking-tight text-[color:var(--text-primary)]"
              style={{ fontWeight: 300, fontSize: 'clamp(2.2rem, 5vw, 3.4rem)' }}
            >
              metrics
            </h1>
            <p className="mt-3 max-w-2xl font-mono text-[12px] lowercase tracking-[0.15em] text-[color:var(--text-secondary)]">
              brutally simple · six KPIs · tenant-wide · no per-vertical breakdown yet
            </p>
          </div>
          <RefreshButton />
        </header>

        {source === 'mock' ? (
          <div className="mt-7 rounded-[2px] border border-dashed border-[color:var(--assembl-gold-thread)] bg-white px-5 py-4">
            <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-[color:var(--assembl-gold-thread)]">
              scaffold mode
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-[color:var(--text-primary)]">
              kpi_evidence_summary view not deployed yet — showing illustrative
              numbers. The dashboard wires through to live data the moment the
              migration applies.
            </p>
          </div>
        ) : null}
        {error ? (
          <div className="mt-7 rounded-[2px] border border-[color:#b3261e]/30 bg-white px-5 py-4">
            <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-[color:#b3261e]">
              query error
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-[color:var(--text-primary)]">
              {error}
            </p>
          </div>
        ) : null}

        {snapshot ? <KpiGrid snapshot={snapshot} /> : null}
        {snapshot ? (
          <section className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            <ChartCard title="High-risk coverage" subtitle="outputs cited · actions approved">
              <CitationCoverageBar snapshot={snapshot} />
            </ChartCard>
            <ChartCard title="30-day output volume" subtitle="all outputs · reversed within 7 days">
              <ReversalSpark snapshot={snapshot} />
            </ChartCard>
          </section>
        ) : null}

        <footer className="mt-16 border-t border-[color:var(--assembl-cloud)] pt-4 text-right font-mono text-[12px] lowercase tracking-[0.12em] text-[color:var(--text-secondary)]">
          {snapshot
            ? `last computed ${formatDate(snapshot.computed_at)}`
            : 'no snapshot available'}
        </footer>
      </div>
    </main>
  );
}

function KpiGrid({ snapshot }: { snapshot: KpiSnapshot }) {
  const cards: Array<{
    label: string;
    value: string;
    hint: string;
  }> = [
    {
      label: 'time to first completed case',
      value: formatMinutes(snapshot.time_to_first_completed_case_minutes),
      hint: 'median · last 30 days',
    },
    {
      label: 'citation coverage',
      value: formatPct(snapshot.citation_coverage_pct),
      hint: 'high-risk outputs with ≥1 citation',
    },
    {
      label: 'approval coverage',
      value: formatPct(snapshot.approval_coverage_pct),
      hint: 'high-risk actions with approval (target 100%)',
    },
    {
      label: 'reversal rate',
      value: formatPct(snapshot.action_reversal_rate_pct),
      hint: 'agent outputs reversed by human within 7 days',
    },
    {
      label: 'cycle-time reduction',
      value: formatPct(snapshot.cycle_time_reduction_pct),
      hint: 'vs baseline · captured at pilot start',
    },
    {
      label: 'net revenue retention',
      value: formatPct(snapshot.nrr_by_cohort_pct),
      hint: 'by feature cohort · billing roll-up pending',
    },
  ];
  return (
    <section className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => (
        <article
          key={c.label}
          className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-white px-5 py-5"
        >
          <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
            {c.label}
          </p>
          <p className="mt-2 font-display text-[32px] font-light leading-tight text-[color:var(--text-primary)]">
            {c.value}
          </p>
          <p className="mt-1.5 font-mono text-[12px] tracking-[0.04em] text-[color:var(--text-secondary)]">
            {c.hint}
          </p>
        </article>
      ))}
    </section>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-white px-5 py-5">
      <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
        {title}
      </p>
      <p className="mt-1 font-mono text-[12px] tracking-[0.04em] text-[color:var(--text-secondary)]">
        {subtitle}
      </p>
      <div className="mt-3">{children}</div>
    </article>
  );
}

function formatPct(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  return `${v.toFixed(1)}%`;
}

function formatMinutes(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  if (v < 60) return `${Math.round(v)} min`;
  const h = Math.floor(v / 60);
  const m = Math.round(v - h * 60);
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-NZ', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}
