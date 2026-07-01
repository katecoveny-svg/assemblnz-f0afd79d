'use client';

import { useState } from 'react';
import { compareFreight, FREIGHT_EXAMPLE, type FreightQuote } from '@/lib/customs/freight';
import { INCOTERMS_2020, type Incoterm2020 } from '@/lib/customs/types';
import { formatMoney } from '@/lib/customs/format';
import { Card, PageHeader, Pill, SectionTitle } from '@/components/customs/ui';

export default function FreightPage() {
  const [quotes, setQuotes] = useState<FreightQuote[]>(FREIGHT_EXAMPLE);
  const [incoterm, setIncoterm] = useState<Incoterm2020>('CIF');
  const result = compareFreight(quotes, incoterm);

  const update = (i: number, patch: Partial<FreightQuote>) =>
    setQuotes(quotes.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));

  return (
    <div>
      <PageHeader eyebrow="Tools" title="Freight quote comparison" lead="Line up carrier quotes side by side — cheapest, fastest, and the Incoterms 2020 insurance gaps to watch." />
      <div className="mb-4 flex items-center gap-3">
        <span className="text-sm text-[color:var(--air-slate)]">Incoterm</span>
        <select value={incoterm} onChange={(e) => setIncoterm(e.target.value as Incoterm2020)} className="rounded-lg border border-[color:var(--air-line)] bg-white px-3 py-1.5 text-sm">
          {INCOTERMS_2020.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button type="button" onClick={() => setQuotes([...quotes, { carrier: '', amountNzd: 0, transitDays: 0, includesInsurance: false }])} className="rounded-lg border border-[color:var(--air-line)] px-3 py-1.5 text-xs text-[color:var(--air-navy)]">+ Add quote</button>
      </div>

      <div className="overflow-hidden air-card mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[color:var(--air-line)] bg-[color:var(--air-mist)] text-left text-[0.66rem] uppercase tracking-[0.1em] text-[color:var(--air-slate)]">
              <th className="px-3 py-2">Carrier</th><th className="px-3 py-2">Amount</th><th className="px-3 py-2">Transit (days)</th><th className="px-3 py-2">Insurance</th><th className="px-3 py-2">Flags</th>
            </tr>
          </thead>
          <tbody>
            {result.quotes.map((q, i) => (
              <tr key={i} className="border-b border-[color:var(--air-line-soft)] last:border-0">
                <td className="px-3 py-2"><input value={q.carrier} onChange={(e) => update(i, { carrier: e.target.value })} className="w-full rounded border border-[color:var(--air-line)] bg-white px-2 py-1 text-sm" /></td>
                <td className="px-3 py-2"><input type="number" value={q.amountNzd} onChange={(e) => update(i, { amountNzd: Number(e.target.value) })} className="w-24 rounded border border-[color:var(--air-line)] bg-white px-2 py-1 text-right text-sm" /></td>
                <td className="px-3 py-2"><input type="number" value={q.transitDays} onChange={(e) => update(i, { transitDays: Number(e.target.value) })} className="w-16 rounded border border-[color:var(--air-line)] bg-white px-2 py-1 text-right text-sm" /></td>
                <td className="px-3 py-2"><input type="checkbox" checked={q.includesInsurance} onChange={(e) => update(i, { includesInsurance: e.target.checked })} /></td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    {q.cheapest ? <Pill tone="ok">cheapest</Pill> : null}
                    {q.fastest ? <Pill tone="brass">fastest</Pill> : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card mist><p className="text-xs text-[color:var(--air-slate)]">Cheapest</p><p className="air-display text-lg">{result.cheapest ?? '—'}</p></Card>
        <Card mist><p className="text-xs text-[color:var(--air-slate)]">Fastest</p><p className="air-display text-lg">{result.fastest ?? '—'}</p></Card>
        <Card mist><p className="text-xs text-[color:var(--air-slate)]">Spread cheapest→dearest</p><p className="air-display text-lg">{formatMoney(result.savingsNzd)}</p></Card>
      </div>

      {result.flags.length > 0 ? (
        <Card className="mt-4">
          <SectionTitle>Flags</SectionTitle>
          <ul className="list-disc space-y-1 pl-4 text-sm text-[color:var(--air-warn)]">{result.flags.map((f, i) => <li key={i}>{f}</li>)}</ul>
        </Card>
      ) : null}
    </div>
  );
}
