import type { Metadata } from 'next';
import { getImporter, listInvoices } from '@/lib/customs/store';
import { formatMoney, formatNzDate } from '@/lib/customs/format';
import { Card, InvoiceStatusPill, PageHeader, Pill, SectionTitle, StatTile } from '@/components/customs/ui';

export const metadata: Metadata = { title: 'Finance' };

export default async function FinancePage() {
  const invoices = await listInvoices();
  const importerNames = new Map<string, string>();
  for (const inv of invoices) {
    if (!importerNames.has(inv.importerId)) {
      const imp = await getImporter(inv.importerId);
      importerNames.set(inv.importerId, imp?.name ?? inv.importerId);
    }
  }

  const outstanding = invoices.filter((i) => i.status !== 'paid').reduce((s, i) => s + i.totalNzd, 0);
  const brokerageMonth = invoices.reduce((s, i) => s + i.brokerageFeeNzd, 0);
  const drafts = invoices.filter((i) => i.status === 'draft').length;

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Finance & invoicing"
        lead="Monthly invoices per importer — brokerage fee plus pass-through disbursements (duty, GST, levies). Raised into Xero, like Kate's own books."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Outstanding" value={formatMoney(outstanding)} tone="warn" />
        <StatTile label="Brokerage (period)" value={formatMoney(brokerageMonth)} tone="ok" />
        <StatTile label="Draft invoices" value={drafts} />
        <StatTile label="Awaiting Xero" value={invoices.filter((i) => i.status === 'awaiting_xero_sync').length} tone="warn" />
      </div>

      <div className="mt-6 space-y-3">
        {invoices.map((inv) => (
          <Card key={inv.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[color:var(--air-ink)]">{importerNames.get(inv.importerId)}</span>
                  <InvoiceStatusPill status={inv.status} />
                  {inv.xeroInvoiceId ? <Pill tone="navy">{inv.xeroInvoiceId}</Pill> : null}
                </div>
                <p className="text-xs text-[color:var(--air-slate)]">
                  {inv.periodLabel} · issued {formatNzDate(inv.issuedIso)} · due {formatNzDate(inv.dueIso)}
                </p>
              </div>
              <div className="text-right">
                <p className="air-display text-2xl">{formatMoney(inv.totalNzd)}</p>
                <p className="text-xs text-[color:var(--air-slate)]">
                  fee {formatMoney(inv.brokerageFeeNzd)} + GST {formatMoney(inv.gstNzd)}
                  {inv.disbursementsNzd > 0 ? ` + disb. ${formatMoney(inv.disbursementsNzd)}` : ''}
                </p>
              </div>
            </div>
            <ul className="mt-3 space-y-1 border-t border-[color:var(--air-line-soft)] pt-3 text-xs text-[color:var(--air-slate)]">
              {inv.lines.map((l, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span>{l.description}{l.disbursement ? ' · disbursement' : ''}</span>
                  <span>{formatMoney(l.amountNzd)}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <Card mist className="mt-6">
        <p className="text-xs text-[color:var(--air-slate)]">
          <strong className="text-[color:var(--air-navy)]">Xero AR integration.</strong> Each invoice maps to a Xero accounts-receivable invoice via the existing Xero connector; disbursements post as separate line items so on-charged duty/GST stays clearly pass-through. Pilot mode raises drafts only — nothing is sent from Xero until Aironaut connects their org.
        </p>
      </Card>
    </div>
  );
}
