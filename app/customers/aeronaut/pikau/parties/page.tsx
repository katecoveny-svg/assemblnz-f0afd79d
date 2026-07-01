import type { Metadata } from 'next';
import { listParties } from '@/lib/customs/store';
import { Card, PageHeader, Pill } from '@/components/customs/ui';
import type { PartyKind } from '@/lib/customs/types';

export const metadata: Metadata = { title: 'Suppliers & carriers' };

const KIND_LABEL: Record<PartyKind, string> = {
  supplier: 'Supplier',
  shipping_line: 'Shipping line',
  airline: 'Airline',
  freight_forwarder: 'Freight forwarder',
  transport: 'Transport / cartage',
  mpi_transitional_facility: 'MPI transitional facility',
};

export default async function PartiesPage() {
  const parties = await listParties();
  const groups = Object.keys(KIND_LABEL) as PartyKind[];

  return (
    <div>
      <PageHeader eyebrow="Operations" title="Suppliers & carriers" lead="The trade network behind every shipment — overseas suppliers, shipping lines and airlines, cartage, and the transitional facility for MPI inspection." />
      {groups.map((kind) => {
        const rows = parties.filter((p) => p.kind === kind);
        if (rows.length === 0) return null;
        return (
          <div key={kind} className="mb-6">
            <h2 className="air-display mb-2 text-lg">{KIND_LABEL[kind]}</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {rows.map((p) => (
                <Card key={p.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-[color:var(--air-ink)]">{p.name}</p>
                      <p className="text-xs text-[color:var(--air-slate)]">{p.contact}{p.email ? ` · ${p.email}` : ''}{p.phone ? ` · ${p.phone}` : ''}</p>
                    </div>
                    <Pill tone="navy">{p.country}</Pill>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {p.lanes.map((l) => <Pill key={l} tone="brass">{l}</Pill>)}
                  </div>
                  {p.notes ? <p className="mt-2 text-xs text-[color:var(--air-slate)]">{p.notes}</p> : null}
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
