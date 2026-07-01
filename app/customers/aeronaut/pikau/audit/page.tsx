import Link from 'next/link';
import type { Metadata } from 'next';
import { listEntries } from '@/lib/customs/store';
import { buildReceiptChain } from '@/lib/customs/receipt';
import { formatNzDateTime } from '@/lib/customs/format';
import { Card, PageHeader, Pill, SectionTitle } from '@/components/customs/ui';

export const metadata: Metadata = { title: 'Audit & receipts' };

export default async function AuditPage() {
  const { entries } = await listEntries();
  const chain = buildReceiptChain(entries);
  const byReceiptId = new Map(chain.map((r) => [r.id, r]));

  return (
    <div>
      <PageHeader
        eyebrow="Pīkau intelligence · assembl Mana Receipts"
        title="Audit-ready evidence"
        lead="Every entry carries a Mana Receipt: the HS code and the GRI that drove it, the statutes applied, the human-in-the-loop sign-off, and a tamper-evident hash chained to the entry before it. Defensible to Customs on a s.354 audit; records held 7 years (s.405)."
      />

      <Card mist className="mb-6">
        <p className="text-xs text-[color:var(--air-slate)]">
          Hash chain of {chain.length} receipts. Each <code className="font-mono">receipt_hash</code> incorporates the previous one, so any edit to an earlier entry breaks every hash after it. Signatures are unsigned in the pilot (no production key) — the chain still demonstrates integrity end-to-end.
        </p>
      </Card>

      <div className="space-y-5">
        {entries.map((entry) => {
          const receipt = byReceiptId.get(entry.receiptId);
          if (!receipt) return null;
          return (
            <div key={entry.id} id={entry.id} className="scroll-mt-24">
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[color:var(--air-slate)]">{entry.shipmentRef}</span>
                      <Pill tone={receipt.hitl.status === 'reviewed' ? 'ok' : 'warn'}>
                        {receipt.hitl.status === 'reviewed' ? 'broker reviewed' : 'pending broker review'}
                      </Pill>
                    </div>
                    <h2 className="air-display mt-0.5 text-lg">{entry.goods}</h2>
                    <p className="text-sm text-[color:var(--air-slate)]">{entry.importerName}</p>
                  </div>
                  <Link href={`/customers/aeronaut/pikau/entries/${entry.id}`} className="text-xs text-[color:var(--air-slate)] hover:text-[color:var(--air-navy)]">
                    Open entry →
                  </Link>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <SectionTitle>Citations</SectionTitle>
                    <ul className="space-y-2 text-xs">
                      {receipt.citations.map((c, i) => (
                        <li key={i} className="border-l-2 border-[color:var(--air-brass)] pl-3">
                          {c.type === 'hs_code' ? (
                            <>
                              <span className="font-mono font-semibold text-[color:var(--air-navy)]">{String(c.code)}</span>
                              {c.gir ? <span className="text-[color:var(--air-brass-deep)]"> · {String(c.gir)}</span> : null}
                              {c.note ? <span className="block text-[color:var(--air-slate)]">{String(c.note)}</span> : null}
                            </>
                          ) : c.type === 'statute' ? (
                            <>
                              <span className="font-semibold text-[color:var(--air-navy)]">{String(c.act)}</span>
                              {c.section ? <span className="text-[color:var(--air-slate)]"> — {String(c.section)}</span> : null}
                              {c.note ? <span className="block text-[color:var(--air-slate)]">{String(c.note)}</span> : null}
                            </>
                          ) : (
                            <span className="text-[color:var(--air-slate)]">{c.note ? String(c.note) : c.type}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <SectionTitle>Integrity</SectionTitle>
                    <dl className="space-y-1 text-[0.7rem]">
                      <HashRow label="Receipt" value={receipt.receipt_hash} />
                      <HashRow label="Prev" value={receipt.prev_hash ?? 'genesis (first in chain)'} />
                      <HashRow label="Input" value={receipt.input_hash} />
                      <HashRow label="Output" value={receipt.output_hash} />
                      <div className="flex justify-between pt-1">
                        <dt className="text-[color:var(--air-slate)]">Issued</dt>
                        <dd className="text-[color:var(--air-ink)]">{formatNzDateTime(receipt.created_at)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-[color:var(--air-slate)]">Issuer</dt>
                        <dd className="text-[color:var(--air-ink)]">{receipt.issuer} · {receipt.agent}</dd>
                      </div>
                    </dl>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Pill tone="ok">tikanga gate ✓</Pill>
                      <Pill tone="ok">truth gate ✓</Pill>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HashRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[color:var(--air-slate)]">{label}</dt>
      <dd className="truncate font-mono text-[color:var(--air-navy)]" title={value}>
        {value.length > 26 ? `${value.slice(0, 26)}…` : value}
      </dd>
    </div>
  );
}
