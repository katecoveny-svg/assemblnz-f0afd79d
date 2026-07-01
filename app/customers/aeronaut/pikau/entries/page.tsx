import Link from 'next/link';
import type { Metadata } from 'next';
import { listEntries } from '@/lib/customs/store';
import { DEMO_NOW } from '@/lib/customs/demo';
import { formatMoney, relativeDeadline } from '@/lib/customs/format';
import { Card, EntryStatusPill, PageHeader } from '@/components/customs/ui';

export const metadata: Metadata = { title: 'Entries' };

export default async function EntriesQueue() {
  const { entries, source } = await listEntries();

  return (
    <div>
      <PageHeader
        eyebrow="Pīkau intelligence"
        title="Customs entries queue"
        lead="Import entry drafts built from the commercial invoice and packing list. Each shows the importer, HS lines, calculated duty + import GST, permit flags, the missing-document checklist, and whether it's ready for the broker to lodge."
      />

      {source === 'demo' ? (
        <p className="mb-4 text-xs text-[color:var(--air-slate)]">Showing demo data — connect the tenant tables to see live entries.</p>
      ) : null}

      <div className="overflow-hidden air-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[color:var(--air-line)] bg-[color:var(--air-mist)] text-left text-[0.68rem] uppercase tracking-[0.1em] text-[color:var(--air-slate)]">
              <th className="px-4 py-3">Shipment</th>
              <th className="px-4 py-3">Importer / goods</th>
              <th className="hidden px-4 py-3 md:table-cell">Customs value</th>
              <th className="hidden px-4 py-3 sm:table-cell">Duty + GST</th>
              <th className="px-4 py-3">Status</th>
              <th className="hidden px-4 py-3 lg:table-cell">Cut-off</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-b border-[color:var(--air-line-soft)] last:border-0 hover:bg-[color:var(--air-mist)]">
                <td className="px-4 py-3 align-top">
                  <Link href={`/customers/aeronaut/pikau/entries/${e.id}`} className="font-mono text-xs font-semibold text-[color:var(--air-navy)] hover:underline">
                    {e.shipmentRef}
                  </Link>
                  <p className="mt-0.5 text-[0.68rem] text-[color:var(--air-slate)]">{e.originCountry} → NZ</p>
                </td>
                <td className="px-4 py-3 align-top">
                  <Link href={`/customers/aeronaut/pikau/entries/${e.id}`} className="font-medium text-[color:var(--air-ink)] hover:underline">
                    {e.goods}
                  </Link>
                  <p className="text-[0.72rem] text-[color:var(--air-slate)]">{e.importerName}</p>
                </td>
                <td className="hidden px-4 py-3 align-top md:table-cell">{formatMoney(e.plan.duty.customsValueNzd)}</td>
                <td className="hidden px-4 py-3 align-top sm:table-cell">
                  {e.plan.duty.belowDeMinimis ? (
                    <span className="text-xs text-[color:var(--air-slate)]">under de minimis</span>
                  ) : (
                    formatMoney(e.plan.duty.estimatedBorderChargesNzd)
                  )}
                </td>
                <td className="px-4 py-3 align-top"><EntryStatusPill status={e.status} /></td>
                <td className="hidden px-4 py-3 align-top lg:table-cell">
                  {e.input.cutoffIso ? (
                    <span className="text-xs text-[color:var(--air-slate)]">{relativeDeadline(e.input.cutoffIso, DEMO_NOW)}</span>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Card mist className="mt-4">
        <p className="text-xs text-[color:var(--air-slate)]">
          <strong className="text-[color:var(--air-navy)]">Draft-only.</strong> Pīkau prepares the entry; a licensed customs broker reviews and lodges it in the Trade Single Window. Nothing here is submitted to the New Zealand Customs Service.
        </p>
      </Card>
    </div>
  );
}
