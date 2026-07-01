'use client';

import { useState } from 'react';
import { computeLandedCost, LANDED_COST_DEFAULTS, type LandedCostInput } from '@/lib/customs/landed-cost';
import { formatMoney } from '@/lib/customs/format';
import { Card, PageHeader, SectionTitle } from '@/components/customs/ui';

const FIELDS: { key: keyof LandedCostInput; label: string }[] = [
  { key: 'fobNzd', label: 'Goods value / FOB (NZD)' },
  { key: 'freightNzd', label: 'Freight (NZD)' },
  { key: 'insuranceNzd', label: 'Insurance (NZD)' },
  { key: 'dutyRatePercent', label: 'Duty rate (%)' },
  { key: 'processingFeeNzd', label: 'Import Entry Transaction Fee (NZD)' },
  { key: 'biosecurityLevyNzd', label: 'Biosecurity levy (NZD)' },
  { key: 'otherFeesNzd', label: 'Other fees (NZD)' },
];

export default function LandedCostPage() {
  const [input, setInput] = useState<LandedCostInput>(LANDED_COST_DEFAULTS);
  const result = computeLandedCost(input);

  return (
    <div>
      <PageHeader
        eyebrow="Tools"
        title="Landed-cost calculator"
        lead="Build the true cost to the importer's door: CIF customs value, duty, 15% import GST, and fees. Indicative — the broker confirms the rate and any concession."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle>Inputs</SectionTitle>
          <div className="space-y-3">
            {FIELDS.map((f) => (
              <label key={f.key} className="flex items-center justify-between gap-3">
                <span className="text-sm text-[color:var(--air-slate)]">{f.label}</span>
                <input
                  type="number"
                  value={input[f.key]}
                  onChange={(e) => setInput({ ...input, [f.key]: Number(e.target.value) })}
                  className="w-32 rounded-lg border border-[color:var(--air-line)] bg-white px-3 py-1.5 text-right text-sm outline-none focus:border-[color:var(--air-brass)]"
                />
              </label>
            ))}
          </div>
        </Card>
        <Card mist>
          <SectionTitle>Landed cost</SectionTitle>
          <dl className="space-y-2 text-sm">
            <Row label="Customs value (CIF)" value={formatMoney(result.customsValueNzd)} />
            <Row label={`Duty @ ${input.dutyRatePercent}%`} value={formatMoney(result.dutyNzd)} />
            <Row label="Import GST @ 15%" value={formatMoney(result.gstNzd)} />
            <Row label="Fees & levies" value={formatMoney(result.feesNzd)} />
            <div className="my-2 border-t border-[color:var(--air-line)]" />
            <div className="flex items-center justify-between">
              <dt className="air-display text-lg">Total landed</dt>
              <dd className="air-display text-2xl text-[color:var(--air-navy)]">{formatMoney(result.totalLandedNzd)}</dd>
            </div>
            <p className="text-xs text-[color:var(--air-slate)]">≈ {result.upliftPercent}% over goods value.</p>
          </dl>
        </Card>
      </div>
      <p className="mt-4 text-xs text-[color:var(--air-slate)]">All figures indicative. Excise-equivalent duty on alcohol/tobacco and concessions are confirmed by the licensed broker.</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[color:var(--air-slate)]">{label}</dt>
      <dd className="text-[color:var(--air-ink)]">{value}</dd>
    </div>
  );
}
