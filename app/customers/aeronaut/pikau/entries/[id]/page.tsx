import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getEntry } from '@/lib/customs/store';
import { DOCUMENT_LABELS } from '@/lib/customs/types';
import { formatMoney, formatNzDate, relativeDeadline } from '@/lib/customs/format';
import { DEMO_NOW } from '@/lib/customs/demo';
import {
  BackLink,
  Card,
  CitationList,
  EntryStatusPill,
  Pill,
  SectionTitle,
} from '@/components/customs/ui';

export const metadata: Metadata = { title: 'Entry' };

export default async function EntryDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { entry } = await getEntry(id);
  if (!entry) notFound();

  const { plan, input } = entry;

  return (
    <div className="mx-auto max-w-4xl">
      <BackLink href="/customers/aeronaut/pikau/entries">Entries queue</BackLink>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-[color:var(--air-slate)]">{entry.shipmentRef}</span>
            <EntryStatusPill status={entry.status} />
          </div>
          <h1 className="air-display mt-1 text-3xl">{entry.goods}</h1>
          <p className="text-sm text-[color:var(--air-slate)]">
            {entry.importerName} · {entry.supplierName} · {input.originCountry} → NZ · Incoterm {input.incoterm}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--air-slate)]">Readiness</p>
          <p className="air-display text-4xl" style={{ color: plan.readinessScore >= 80 ? 'var(--air-ok)' : plan.readinessScore >= 50 ? 'var(--air-warn)' : 'var(--air-hold)' }}>
            {plan.readinessScore}
          </p>
        </div>
      </div>

      <p className="mt-3 rounded-lg bg-[color:var(--air-mist)] p-3 text-sm text-[color:var(--air-ink)]">{plan.summary}</p>

      {/* Duty breakdown */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <SectionTitle>Duty & import GST</SectionTitle>
          <dl className="space-y-1.5 text-sm">
            <Row label="Goods value" value={formatMoney(plan.duty.goodsValueNzd)} />
            <Row label="Freight" value={formatMoney(plan.duty.freightNzd)} />
            <Row label="Insurance" value={formatMoney(plan.duty.insuranceNzd)} />
            <Row label="Customs value (CIF)" value={formatMoney(plan.duty.customsValueNzd)} strong />
            <div className="my-2 border-t border-[color:var(--air-line-soft)]" />
            <Row label={`Duty @ ${plan.duty.dutyRatePercent}%`} value={formatMoney(plan.duty.estimatedDutyNzd)} />
            <Row label="Import GST @ 15%" value={formatMoney(plan.duty.estimatedGstNzd)} />
            <Row label="Transaction fees + levy" value={formatMoney(plan.duty.transactionFeesNzd)} />
            <Row label="Border charges" value={formatMoney(plan.duty.estimatedBorderChargesNzd)} strong />
            <div className="my-2 border-t border-[color:var(--air-line-soft)]" />
            <Row label="Indicative landed cost" value={formatMoney(plan.duty.estimatedLandedCostNzd)} strong />
          </dl>
          {plan.duty.belowDeMinimis ? (
            <p className="mt-3 text-xs text-[color:var(--air-slate)]">Customs value is at or below the NZ$1,000 de minimis — duty/GST generally not collected. Broker confirms.</p>
          ) : (
            <p className="mt-3 text-xs text-[color:var(--air-slate)]">Indicative only. Duty depends on confirmed classification + any concession; the broker sets the final figure at lodgement.</p>
          )}
        </Card>

        <Card>
          <SectionTitle>Documents</SectionTitle>
          <ul className="space-y-2 text-sm">
            {plan.requiredDocuments.map((doc) => {
              const held = input.documentsHeld.includes(doc);
              return (
                <li key={doc} className="flex items-center justify-between gap-2">
                  <span className={held ? 'text-[color:var(--air-ink)]' : 'text-[color:var(--air-slate)]'}>
                    {DOCUMENT_LABELS[doc]}
                  </span>
                  <Pill tone={held ? 'ok' : 'warn'}>{held ? 'held' : 'missing'}</Pill>
                </li>
              );
            })}
          </ul>
          <div className="mt-4">
            <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--air-slate)]">Shipment</p>
            <p className="mt-1 text-sm text-[color:var(--air-slate)]">
              {input.packages ?? '—'} packages · {input.grossWeightKg ?? '—'} kg gross
              {input.etaIso ? ` · ETA ${formatNzDate(input.etaIso)}` : ''}
              {input.cutoffIso ? ` · cut-off ${relativeDeadline(input.cutoffIso, DEMO_NOW)}` : ''}
            </p>
          </div>
        </Card>
      </div>

      {/* HS lines */}
      <div className="mt-6">
        <SectionTitle right={<Link href="/customers/aeronaut/pikau/classify" className="text-xs text-[color:var(--air-slate)] hover:text-[color:var(--air-navy)]">Open classifier →</Link>}>
          HS lines
        </SectionTitle>
        <div className="overflow-hidden air-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[color:var(--air-line)] bg-[color:var(--air-mist)] text-left text-[0.66rem] uppercase tracking-[0.1em] text-[color:var(--air-slate)]">
                <th className="px-4 py-2.5">Line</th>
                <th className="px-4 py-2.5">Qty</th>
                <th className="px-4 py-2.5">Value</th>
                <th className="px-4 py-2.5">Origin</th>
                <th className="px-4 py-2.5">HS code</th>
              </tr>
            </thead>
            <tbody>
              {input.lines.map((line, i) => (
                <tr key={i} className="border-b border-[color:var(--air-line-soft)] last:border-0">
                  <td className="px-4 py-2.5">{line.description}</td>
                  <td className="px-4 py-2.5">{line.quantity.toLocaleString('en-NZ')}</td>
                  <td className="px-4 py-2.5">{formatMoney(line.lineValueNzd)}</td>
                  <td className="px-4 py-2.5">{line.countryOfOrigin}</td>
                  <td className="px-4 py-2.5">
                    {line.unclassified ? (
                      <Pill tone="warn">unclassified</Pill>
                    ) : (
                      <span className="font-mono text-xs text-[color:var(--air-navy)]">{line.hsCode}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Blockers & warnings */}
      {(plan.blockers.length > 0 || plan.warnings.length > 0) && (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {plan.blockers.length > 0 && (
            <Card>
              <SectionTitle>Blockers</SectionTitle>
              <ul className="space-y-3">
                {plan.blockers.map((b) => (
                  <li key={b.code}>
                    <div className="flex items-center gap-2">
                      <Pill tone="hold">must fix</Pill>
                      <span className="font-medium text-[color:var(--air-ink)]">{b.title}</span>
                    </div>
                    <p className="mt-1 text-xs text-[color:var(--air-slate)]">{b.detail}</p>
                    {b.citation ? (
                      <p className="mt-1 text-[0.68rem] text-[color:var(--air-brass-deep)]">
                        {b.citation.source}{b.citation.ref ? ` — ${b.citation.ref}` : ''}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {plan.warnings.length > 0 && (
            <Card>
              <SectionTitle>Warnings</SectionTitle>
              <ul className="space-y-3">
                {plan.warnings.map((w) => (
                  <li key={w.code}>
                    <div className="flex items-center gap-2">
                      <Pill tone="warn">review</Pill>
                      <span className="font-medium text-[color:var(--air-ink)]">{w.title}</span>
                    </div>
                    <p className="mt-1 text-xs text-[color:var(--air-slate)]">{w.detail}</p>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {/* Captured classifications */}
      {entry.classifications.length > 0 && (
        <div className="mt-6">
          <SectionTitle>Classification decisions captured</SectionTitle>
          {entry.classifications.map((c, ci) => (
            <Card key={ci} className="mb-3">
              <p className="mb-2 text-sm text-[color:var(--air-slate)]">Goods: {c.goodsDescription}</p>
              <div className="space-y-2">
                {c.candidates.map((cand, i) => (
                  <div key={i} className="rounded-lg border border-[color:var(--air-line-soft)] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm font-semibold text-[color:var(--air-navy)]">{cand.hsCode}</span>
                      <div className="flex gap-1.5">
                        <Pill tone={cand.suggestion ? 'warn' : 'ok'}>{cand.suggestion ? 'suggestion' : 'reference'}</Pill>
                        <Pill tone="navy">{cand.griApplied.join(', ')}</Pill>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-[color:var(--air-ink)]">{cand.headingText}</p>
                    <p className="mt-1 text-[0.72rem] text-[color:var(--air-slate)]">{cand.griReasoning}</p>
                  </div>
                ))}
              </div>
              {c.recommendRuling ? (
                <p className="mt-3 rounded-lg bg-[color:rgba(201,163,78,0.1)] p-2 text-xs text-[color:var(--air-brass-deep)]">
                  Recommend a binding tariff ruling — {c.rulingReason}
                </p>
              ) : null}
            </Card>
          ))}
        </div>
      )}

      {/* Next actions + receipt */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <SectionTitle>Next actions</SectionTitle>
          <ol className="list-decimal space-y-1.5 pl-4 text-sm text-[color:var(--air-ink)]">
            {plan.nextActions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ol>
        </Card>
        <Card mist>
          <SectionTitle>Basis & citations</SectionTitle>
          <CitationList items={plan.citations} />
          <Link
            href={`/customers/aeronaut/pikau/audit#${entry.id}`}
            className="mt-3 inline-block text-xs font-semibold text-[color:var(--air-navy)] hover:underline"
          >
            View the Mana Receipt for this entry →
          </Link>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[color:var(--air-slate)]">{label}</dt>
      <dd className={strong ? 'font-semibold text-[color:var(--air-navy)]' : 'text-[color:var(--air-ink)]'}>{value}</dd>
    </div>
  );
}
