import Link from 'next/link';
import type { Metadata } from 'next';
import { listOpsEvents } from '@/lib/customs/store';
import { formatNzDate, formatNzDateTime } from '@/lib/customs/format';
import { Card, PageHeader, Pill } from '@/components/customs/ui';
import type { OpsEventKind } from '@/lib/customs/types';

export const metadata: Metadata = { title: 'Ops calendar' };

const KIND_LABEL: Record<OpsEventKind, string> = {
  vessel_eta: 'ETA',
  lodgement_cutoff: 'Cut-off',
  mpi_clearance: 'MPI clearance',
  container_release: 'Container release',
  delivery: 'Delivery',
};

export default async function CalendarPage() {
  const events = (await listOpsEvents()).slice().sort((a, b) => a.whenIso.localeCompare(b.whenIso));

  // Group by day.
  const byDay = new Map<string, typeof events>();
  for (const e of events) {
    const day = e.whenIso.slice(0, 10);
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)!.push(e);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Ops & event calendar"
        lead="Vessel ETAs, lodgement cut-offs, MPI biosecurity clearances and container releases — the week at the border, tied to each entry."
      />
      <div className="space-y-6">
        {[...byDay.entries()].map(([day, dayEvents]) => (
          <div key={day}>
            <h2 className="air-display mb-2 text-lg">{formatNzDate(day)}</h2>
            <div className="space-y-2">
              {dayEvents.map((e) => (
                <Card key={e.id} className={`flex flex-wrap items-center justify-between gap-3 ${e.status === 'at_risk' ? 'border-[color:var(--air-hold)]' : ''}`}>
                  <div className="flex items-center gap-3">
                    <Pill tone={e.kind === 'lodgement_cutoff' ? 'brass' : 'navy'}>{KIND_LABEL[e.kind]}</Pill>
                    <div>
                      {e.entryId ? (
                        <Link href={`/customers/aeronaut/pikau/entries/${e.entryId}`} className="text-sm font-medium text-[color:var(--air-ink)] hover:underline">
                          {e.title}
                        </Link>
                      ) : (
                        <span className="text-sm font-medium text-[color:var(--air-ink)]">{e.title}</span>
                      )}
                      <p className="text-xs text-[color:var(--air-slate)]">{e.detail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[color:var(--air-slate)]">{formatNzDateTime(e.whenIso)}</span>
                    <Pill tone={e.status === 'at_risk' ? 'hold' : e.status === 'confirmed' ? 'ok' : 'warn'}>{e.status.replace('_', ' ')}</Pill>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
