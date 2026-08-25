import type { Metadata } from 'next';
import { listCompliance } from '@/lib/customs/store';
import { formatNzDate, relativeDeadline } from '@/lib/customs/format';
import { DEMO_NOW } from '@/lib/customs/demo';
import { Card, ComplianceStatusPill, PageHeader } from '@/components/customs/ui';

export const metadata: Metadata = { title: 'Compliance' };

const ORDER = { overdue: 0, due_soon: 1, upcoming: 2, done: 3 } as const;

export default async function CompliancePage() {
  const events = (await listCompliance()).slice().sort((a, b) => ORDER[a.status] - ORDER[b.status] || a.dueIso.localeCompare(b.dueIso));

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Compliance calendar"
        lead="TSW/declarant credentials, GST returns, broker licence renewals, importer profile reviews, staff CPD, and the 7-year record-retention clock — each with the rule behind it."
      />
      <div className="space-y-3">
        {events.map((e) => (
          <Card key={e.id} className={e.status === 'overdue' ? 'border-[color:var(--air-hold)]' : ''}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <ComplianceStatusPill status={e.status} />
                  <span className="font-medium text-[color:var(--air-ink)]">{e.title}</span>
                </div>
                <p className="mt-1 text-sm text-[color:var(--air-slate)]">{e.detail}</p>
                {e.citation ? (
                  <p className="mt-1 text-[0.75rem] text-[color:var(--air-brass-deep)]">
                    {e.citation.source}{e.citation.ref ? ` — ${e.citation.ref}` : ''}
                  </p>
                ) : null}
              </div>
              <div className="text-right">
                <p className="text-sm text-[color:var(--air-ink)]">{formatNzDate(e.dueIso)}</p>
                <p className="text-xs text-[color:var(--air-slate)]">{relativeDeadline(e.dueIso, DEMO_NOW)}</p>
                <p className="mt-1 text-xs text-[color:var(--air-slate)]">{e.owner}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
