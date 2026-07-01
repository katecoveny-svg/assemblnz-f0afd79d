import type { Metadata } from 'next';
import { listEntries, listImporters, listInvoices } from '@/lib/customs/store';
import { formatMoney } from '@/lib/customs/format';
import { Card, PageHeader, StatTile } from '@/components/customs/ui';

export const metadata: Metadata = { title: 'Reports' };

export default async function ReportsPage() {
  const [{ entries }, invoices, { importers }] = await Promise.all([listEntries(), listInvoices(), listImporters()]);

  const customsValue = entries.reduce((s, e) => s + e.plan.duty.customsValueNzd, 0);
  const dutyGst = entries.reduce((s, e) => s + e.plan.duty.estimatedBorderChargesNzd, 0);
  const brokerage = invoices.reduce((s, i) => s + i.brokerageFeeNzd, 0);

  // By importer.
  const byImporter = importers
    .map((imp) => {
      const theirs = entries.filter((e) => e.importerId === imp.id);
      return {
        name: imp.name,
        count: theirs.length,
        value: theirs.reduce((s, e) => s + e.plan.duty.customsValueNzd, 0),
      };
    })
    .filter((r) => r.count > 0)
    .sort((a, b) => b.value - a.value);
  const maxValue = Math.max(1, ...byImporter.map((r) => r.value));

  // By status.
  const statuses: { label: string; n: number }[] = [
    { label: 'Ready for broker', n: entries.filter((e) => e.status === 'ready_for_broker_review').length },
    { label: 'Missing info', n: entries.filter((e) => e.status === 'missing_information').length },
    { label: 'Held — compliance', n: entries.filter((e) => e.status === 'hold_for_compliance').length },
  ];

  return (
    <div>
      <PageHeader eyebrow="Operations" title="Reports" lead="Throughput, value cleared, duty & GST processed, and the brokerage revenue behind it — computed live from the entries book." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Entries (period)" value={entries.length} />
        <StatTile label="Customs value cleared" value={formatMoney(customsValue)} tone="ok" />
        <StatTile label="Duty + GST processed" value={formatMoney(dutyGst)} />
        <StatTile label="Brokerage revenue" value={formatMoney(brokerage)} tone="ok" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="air-display mb-3 text-lg">Value by importer</h2>
          <div className="space-y-3">
            {byImporter.map((r) => (
              <div key={r.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[color:var(--air-ink)]">{r.name}</span>
                  <span className="text-[color:var(--air-slate)]">{formatMoney(r.value)} · {r.count}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-[color:var(--air-line)]">
                  <div className="h-full bg-[color:var(--air-brass)]" style={{ width: `${(r.value / maxValue) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="air-display mb-3 text-lg">Entries by status</h2>
          <div className="space-y-3">
            {statuses.map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-sm text-[color:var(--air-ink)]">{s.label}</span>
                <span className="air-display text-2xl text-[color:var(--air-navy)]">{s.n}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-[color:var(--air-slate)]">Report exports (PDF/CSV) connect to the same figures — stubbed in the pilot.</p>
        </Card>
      </div>
    </div>
  );
}
