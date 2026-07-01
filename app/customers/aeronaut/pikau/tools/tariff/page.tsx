'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { HS_REFERENCE } from '@/lib/customs/hs-reference';
import { Card, PageHeader, Pill } from '@/components/customs/ui';

export default function TariffLookupPage() {
  const [q, setQ] = useState('');
  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return HS_REFERENCE;
    return HS_REFERENCE.filter(
      (e) =>
        e.hsCode.includes(term) ||
        e.headingText.toLowerCase().includes(term) ||
        e.keywords.some((k) => k.includes(term)),
    );
  }, [q]);

  return (
    <div>
      <PageHeader
        eyebrow="Tools"
        title="Tariff lookup"
        lead="Browse the curated Working Tariff reference lines used in this workspace. Real headings with duty rate and GRI notes. For goods outside the reference, use the HS classifier."
        action={
          <Link href="/customers/aeronaut/pikau/classify" className="rounded-lg border border-[color:var(--air-line)] px-4 py-2 text-sm text-[color:var(--air-navy)] hover:border-[color:var(--air-brass)]">
            Open classifier
          </Link>
        }
      />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search HS code, heading or keyword — e.g. wine, LED, 8434, milking"
        className="mb-4 w-full rounded-lg border border-[color:var(--air-line)] bg-white px-4 py-2.5 text-sm outline-none focus:border-[color:var(--air-brass)]"
      />
      <div className="space-y-3">
        {results.map((e) => (
          <Card key={e.hsCode}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="air-display text-lg text-[color:var(--air-navy)]">{e.hsCode}</span>
              <div className="flex gap-1.5">
                <Pill tone={e.dutyRatePercent === 0 ? 'ok' : 'warn'}>Duty {e.dutyRatePercent === 0 ? 'Free' : `${e.dutyRatePercent}%`}</Pill>
                <Pill tone="navy">{e.griApplied.join(', ')}</Pill>
              </div>
            </div>
            <p className="mt-1 text-sm text-[color:var(--air-ink)]">{e.headingText}</p>
            <p className="mt-1 text-xs text-[color:var(--air-slate)]">{e.chapterText} · {e.griReasoning}</p>
            {e.exciseNote ? <p className="mt-1 text-xs text-[color:var(--air-brass-deep)]">{e.exciseNote}</p> : null}
            {e.biosecurity ? <p className="mt-1 text-xs text-[color:var(--air-brass-deep)]">Biosecurity: {e.biosecurity}</p> : null}
          </Card>
        ))}
        {results.length === 0 ? (
          <Card mist><p className="text-sm text-[color:var(--air-slate)]">No reference line matches — classify from the goods description or seek a binding ruling.</p></Card>
        ) : null}
      </div>
    </div>
  );
}
