import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getImporter, listEntries, listInvoices } from '@/lib/customs/store';
import { formatMoney, formatNzDate } from '@/lib/customs/format';
import {
  BackLink,
  Card,
  EntryStatusPill,
  InvoiceStatusPill,
  PageHeader,
  Pill,
  SectionTitle,
} from '@/components/customs/ui';

export const metadata: Metadata = { title: 'Importer' };

export default async function ImporterDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const importer = await getImporter(id);
  if (!importer) notFound();

  const { entries } = await listEntries();
  const invoices = await listInvoices();
  const theirEntries = entries.filter((e) => e.importerId === id);
  const theirInvoices = invoices.filter((i) => i.importerId === id);

  return (
    <div className="mx-auto max-w-4xl">
      <BackLink href="/customers/aeronaut/pikau/importers">Importers</BackLink>
      <PageHeader
        eyebrow={`Client since ${formatNzDate(importer.since)}`}
        title={importer.name}
        lead={importer.notes}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <SectionTitle>Profile</SectionTitle>
          <dl className="space-y-1.5 text-sm">
            <Row label="Client code" value={importer.clientCode} mono />
            <Row label="NZBN" value={importer.nzbn ?? '—'} mono />
            <Row label="GST" value={importer.gstRegistered ? 'Registered' : 'Not registered'} />
            <Row label="Credit terms" value={importer.creditTerms} />
            <Row label="Entries YTD" value={String(importer.entriesThisYear)} />
          </dl>
          <div className="mt-4">
            <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--air-slate)]">Contacts</p>
            {importer.contacts.map((c) => (
              <p key={c.email} className="mt-1 text-sm">
                {c.name} · <span className="text-[color:var(--air-slate)]">{c.role}</span> · {c.email}
                {c.phone ? ` · ${c.phone}` : ''}
              </p>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle>Standing preferences</SectionTitle>
          {importer.standingPreferences.length ? (
            <ul className="list-disc space-y-1 pl-4 text-sm text-[color:var(--air-ink)]">
              {importer.standingPreferences.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[color:var(--air-slate)]">None recorded.</p>
          )}
          <div className="mt-4">
            <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--air-slate)]">Common HS codes</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {importer.commonHsCodes.length ? (
                importer.commonHsCodes.map((c) => <Pill key={c} tone="navy">{c}</Pill>)
              ) : (
                <span className="text-sm text-[color:var(--air-slate)]">—</span>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <SectionTitle>Shipment history</SectionTitle>
        <div className="space-y-2">
          {theirEntries.length ? (
            theirEntries.map((e) => (
              <Link key={e.id} href={`/customers/aeronaut/pikau/entries/${e.id}`}>
                <Card className="flex items-center justify-between gap-3 transition hover:border-[color:var(--air-brass)]">
                  <div>
                    <span className="font-mono text-xs text-[color:var(--air-slate)]">{e.shipmentRef}</span>
                    <p className="text-sm text-[color:var(--air-ink)]">{e.goods}</p>
                  </div>
                  <EntryStatusPill status={e.status} />
                </Card>
              </Link>
            ))
          ) : (
            <p className="text-sm text-[color:var(--air-slate)]">No entries yet.</p>
          )}
        </div>
      </div>

      {theirInvoices.length > 0 && (
        <div className="mt-6">
          <SectionTitle right={<Link href="/customers/aeronaut/pikau/finance" className="text-xs text-[color:var(--air-slate)] hover:text-[color:var(--air-navy)]">Finance →</Link>}>Invoices</SectionTitle>
          <div className="space-y-2">
            {theirInvoices.map((inv) => (
              <Card key={inv.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-[color:var(--air-ink)]">{inv.periodLabel} · {formatMoney(inv.totalNzd)}</p>
                  <p className="text-xs text-[color:var(--air-slate)]">Due {formatNzDate(inv.dueIso)}</p>
                </div>
                <InvoiceStatusPill status={inv.status} />
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[color:var(--air-slate)]">{label}</dt>
      <dd className={mono ? 'font-mono text-xs text-[color:var(--air-navy)]' : 'text-[color:var(--air-ink)]'}>{value}</dd>
    </div>
  );
}
