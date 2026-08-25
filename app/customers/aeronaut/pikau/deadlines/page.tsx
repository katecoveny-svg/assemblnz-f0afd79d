import Link from 'next/link';
import type { Metadata } from 'next';
import { listEntries, listOpsEvents } from '@/lib/customs/store';
import { DEMO_NOW } from '@/lib/customs/demo';
import { formatNzDate, relativeDeadline, daysUntil } from '@/lib/customs/format';
import { Card, EntryStatusPill, PageHeader, Pill, SectionTitle } from '@/components/customs/ui';

export const metadata: Metadata = { title: 'Deadlines' };

export default async function DeadlinesPage() {
  const { entries } = await listEntries();
  const ops = await listOpsEvents();

  const withCutoff = entries
    .filter((e) => e.input.cutoffIso)
    .sort((a, b) => (a.input.cutoffIso! < b.input.cutoffIso! ? -1 : 1));

  const mpiPending = ops.filter((o) => o.kind === 'mpi_clearance' && o.status !== 'done');

  return (
    <div>
      <PageHeader
        eyebrow="Pīkau intelligence"
        title="Cut-off tracker"
        lead="Shipment ETA against the lodgement deadline against what's still missing. Anything red is at risk of holding at the border."
      />

      <div className="space-y-3">
        {withCutoff.map((e) => {
          const days = daysUntil(e.input.cutoffIso!, DEMO_NOW);
          const atRisk = e.plan.missingDocuments.length > 0 || e.plan.blockers.length > 0;
          const tone = days < 0 || (atRisk && days <= 2) ? 'hold' : days <= 2 ? 'warn' : 'ok';
          return (
            <Link key={e.id} href={`/customers/aeronaut/pikau/entries/${e.id}`}>
              <Card className={`transition hover:border-[color:var(--air-brass)] ${tone === 'hold' ? 'border-[color:var(--air-hold)]' : ''}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[color:var(--air-slate)]">{e.shipmentRef}</span>
                      <EntryStatusPill status={e.status} />
                    </div>
                    <p className="air-display mt-0.5 text-lg">{e.goods}</p>
                    <p className="text-sm text-[color:var(--air-slate)]">{e.importerName}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-[0.75rem] uppercase tracking-[0.1em] text-[color:var(--air-slate)]">ETA</p>
                      <p>{e.input.etaIso ? formatNzDate(e.input.etaIso) : '—'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[0.75rem] uppercase tracking-[0.1em] text-[color:var(--air-slate)]">Cut-off</p>
                      <p><Pill tone={tone}>{relativeDeadline(e.input.cutoffIso!, DEMO_NOW)}</Pill></p>
                    </div>
                    <div className="text-center">
                      <p className="text-[0.75rem] uppercase tracking-[0.1em] text-[color:var(--air-slate)]">Missing</p>
                      <p>{e.plan.missingDocuments.length === 0 ? <span className="text-[color:var(--air-ok)]">nothing</span> : <span className="text-[color:var(--air-warn)]">{e.plan.missingDocuments.length} doc{e.plan.missingDocuments.length === 1 ? '' : 's'}</span>}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {mpiPending.length > 0 && (
        <div className="mt-8">
          <SectionTitle>MPI biosecurity clearances pending</SectionTitle>
          <div className="space-y-2">
            {mpiPending.map((o) => (
              <Card key={o.id} mist className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-[color:var(--air-ink)]">{o.title}</p>
                  <p className="text-xs text-[color:var(--air-slate)]">{o.detail}</p>
                </div>
                <Pill tone="warn">pending</Pill>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
