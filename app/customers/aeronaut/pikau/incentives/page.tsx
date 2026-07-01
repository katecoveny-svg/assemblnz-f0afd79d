import type { Metadata } from 'next';
import { listIncentives } from '@/lib/customs/store';
import { formatMoney } from '@/lib/customs/format';
import { Card, PageHeader, Pill, SectionTitle } from '@/components/customs/ui';

export const metadata: Metadata = { title: 'Incentives' };

export default async function IncentivesPage() {
  const rows = (await listIncentives()).slice().sort((a, b) => b.bonusNzd - a.bonusNzd);
  const pool = rows.reduce((s, r) => s + r.bonusNzd, 0);

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Staff incentives"
        lead="Entry-throughput bonuses, error-free-month streaks and CPD milestones — a simple, transparent way to recognise the work that keeps entries clean and on time."
      />
      <div className="mb-4">
        <SectionTitle right={<Pill tone="brass">Pool {formatMoney(pool)}</Pill>}>This quarter</SectionTitle>
      </div>
      <div className="space-y-3">
        {rows.map((r, i) => (
          <Card key={r.staffId}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="air-display text-2xl text-[color:var(--air-brass-deep)]">#{i + 1}</span>
                <div>
                  <p className="font-medium text-[color:var(--air-ink)]">{r.staffName}</p>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs">
                    <Pill tone="navy">{r.entriesThroughput} entries</Pill>
                    <Pill tone="ok">{r.errorFreeMonths} error-free months</Pill>
                    <Pill tone={r.cpdOnTrack ? 'ok' : 'warn'}>CPD {r.cpdOnTrack ? 'on track' : 'behind'}</Pill>
                  </div>
                </div>
              </div>
              <p className="air-display text-2xl">{formatMoney(r.bonusNzd)}</p>
            </div>
          </Card>
        ))}
      </div>
      <Card mist className="mt-6">
        <p className="text-xs text-[color:var(--air-slate)]">
          Bonuses are indicative and illustrative in the pilot. Throughput and error-free streaks are computed from entry history; CPD ties to the compliance calendar.
        </p>
      </Card>
    </div>
  );
}
