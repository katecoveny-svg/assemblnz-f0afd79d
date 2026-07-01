import Link from 'next/link';
import type { Metadata } from 'next';
import { listImporters } from '@/lib/customs/store';
import { Card, PageHeader, Pill } from '@/components/customs/ui';

export const metadata: Metadata = { title: 'Importers' };

export default async function ImportersPage() {
  const { importers } = await listImporters();

  return (
    <div>
      <PageHeader
        eyebrow="Pīkau intelligence"
        title="Importer profiles"
        lead="The client book — contact, importer client code, GST status, credit terms, standing preferences, common HS codes, and shipment history."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {importers.map((imp) => (
          <Link key={imp.id} href={`/customers/aeronaut/pikau/importers/${imp.id}`}>
            <Card className="h-full transition hover:border-[color:var(--air-brass)]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="air-display text-lg">{imp.name}</h2>
                  <p className="font-mono text-xs text-[color:var(--air-slate)]">{imp.clientCode}</p>
                </div>
                <Pill tone={imp.gstRegistered ? 'ok' : 'navy'}>{imp.gstRegistered ? 'GST reg.' : 'not GST reg.'}</Pill>
              </div>
              <p className="mt-2 text-sm text-[color:var(--air-slate)]">{imp.contacts[0]?.name} · {imp.contacts[0]?.role}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <Pill tone="brass">{imp.entriesThisYear} entries YTD</Pill>
                {imp.commonHsCodes.slice(0, 2).map((c) => (
                  <Pill key={c} tone="navy">{c}</Pill>
                ))}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
