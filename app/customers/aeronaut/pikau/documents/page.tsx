import Link from 'next/link';
import type { Metadata } from 'next';
import { listDocuments } from '@/lib/customs/store';
import { DOCUMENT_LABELS } from '@/lib/customs/types';
import { formatNzDate } from '@/lib/customs/format';
import { Card, PageHeader, Pill } from '@/components/customs/ui';

export const metadata: Metadata = { title: 'Documents' };

export default async function DocumentsPage() {
  const docs = await listDocuments();
  const verified = docs.filter((d) => d.status === 'verified').length;
  const requested = docs.filter((d) => d.status === 'requested').length;

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Documents register"
        lead="Every commercial invoice, packing list, transport document, certificate of origin and permit — held against its entry, with a clear trail of what's still being chased."
      />
      <div className="mb-4 flex gap-2 text-xs">
        <Pill tone="ok">{verified} verified</Pill>
        <Pill tone="warn">{requested} requested</Pill>
      </div>
      <div className="overflow-hidden air-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[color:var(--air-line)] bg-[color:var(--air-mist)] text-left text-[0.75rem] uppercase tracking-[0.1em] text-[color:var(--air-slate)]">
              <th className="px-4 py-2.5">Document</th>
              <th className="hidden px-4 py-2.5 sm:table-cell">Type</th>
              <th className="px-4 py-2.5">Entry</th>
              <th className="hidden px-4 py-2.5 md:table-cell">Added</th>
              <th className="px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id} className="border-b border-[color:var(--air-line-soft)] last:border-0">
                <td className="px-4 py-2.5 font-mono text-xs text-[color:var(--air-ink)]">{d.filename}<span className="ml-2 text-[color:var(--air-slate)]">{d.sizeLabel}</span></td>
                <td className="hidden px-4 py-2.5 sm:table-cell">{DOCUMENT_LABELS[d.type]}</td>
                <td className="px-4 py-2.5">
                  {d.entryId ? (
                    <Link href={`/customers/aeronaut/pikau/entries/${d.entryId}`} className="text-[color:var(--air-navy)] hover:underline">{d.entryId.replace('ent_', '')}</Link>
                  ) : '—'}
                </td>
                <td className="hidden px-4 py-2.5 md:table-cell text-xs text-[color:var(--air-slate)]">{formatNzDate(d.addedIso)}</td>
                <td className="px-4 py-2.5"><Pill tone={d.status === 'verified' ? 'ok' : d.status === 'requested' ? 'warn' : 'navy'}>{d.status}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Card mist className="mt-4"><p className="text-xs text-[color:var(--air-slate)]">Records retained 7 years per Customs and Excise Act 2018 s.405. Upload is stubbed in the pilot — the register shows the document state tracked per entry.</p></Card>
    </div>
  );
}
