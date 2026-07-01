'use client';

import { useState } from 'react';
import { checkFtaPreference, FTA_AGREEMENTS } from '@/lib/customs/fta';
import { Card, CitationList, PageHeader, Pill, SectionTitle } from '@/components/customs/ui';

export default function FtaPage() {
  const [hs, setHs] = useState('2204.21.00');
  const [origin, setOrigin] = useState('AU');
  const [rate, setRate] = useState(5);
  const result = checkFtaPreference(hs, origin, rate);

  return (
    <div>
      <PageHeader eyebrow="Tools" title="FTA preference check" lead="Given an HS code and origin, see whether a preferential duty rate may be claimed under one of New Zealand's free trade agreements, the rule of origin, and the evidence a broker needs on file." />
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card>
          <SectionTitle>Inputs</SectionTitle>
          <label className="mb-1 block text-xs text-[color:var(--air-slate)]">HS code</label>
          <input value={hs} onChange={(e) => setHs(e.target.value)} className="mb-3 w-full rounded-lg border border-[color:var(--air-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[color:var(--air-brass)]" />
          <label className="mb-1 block text-xs text-[color:var(--air-slate)]">Origin (ISO-2)</label>
          <input value={origin} onChange={(e) => setOrigin(e.target.value.toUpperCase().slice(0, 2))} className="mb-3 w-full rounded-lg border border-[color:var(--air-line)] bg-white px-3 py-2 text-sm uppercase outline-none focus:border-[color:var(--air-brass)]" />
          <label className="mb-1 block text-xs text-[color:var(--air-slate)]">General duty rate (%)</label>
          <input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full rounded-lg border border-[color:var(--air-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[color:var(--air-brass)]" />
        </Card>
        <div>
          <Card className={result.eligible ? 'border-[color:var(--air-brass)]' : ''}>
            <div className="flex items-center justify-between">
              <SectionTitle>Result</SectionTitle>
              <Pill tone={result.eligible ? 'ok' : 'navy'}>{result.eligible ? 'FTA available' : 'no FTA for origin'}</Pill>
            </div>
            {result.eligible && result.agreement ? (
              <>
                <p className="text-sm text-[color:var(--air-ink)]"><span className="font-semibold text-[color:var(--air-navy)]">{result.agreement.agreement}</span>: general {result.generalRatePercent}% → preferential {result.preferentialRatePercent}%.</p>
                <p className="mt-1 text-sm text-[color:var(--air-slate)]">{result.requirement}</p>
                <p className="mt-1 text-sm text-[color:var(--air-slate)]">{result.note}</p>
                <div className="mt-3"><CitationList items={[result.agreement.citation]} /></div>
              </>
            ) : (
              <p className="text-sm text-[color:var(--air-slate)]">{result.note}</p>
            )}
          </Card>

          <div className="mt-4">
            <SectionTitle>Agreements covered</SectionTitle>
            <div className="grid gap-2 sm:grid-cols-2">
              {FTA_AGREEMENTS.map((a) => (
                <Card key={a.country} className="text-sm">
                  <p className="font-semibold text-[color:var(--air-navy)]">{a.countryName} — {a.agreement}</p>
                  <p className="mt-0.5 text-xs text-[color:var(--air-slate)]">{a.ruleOfOrigin}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
