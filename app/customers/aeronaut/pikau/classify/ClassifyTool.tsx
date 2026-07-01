'use client';

import { useMemo, useState } from 'react';
import { classifyGoods } from '@/lib/customs/classify';
import { checkFtaPreference } from '@/lib/customs/fta';
import { Card, CitationList, Pill, SectionTitle } from '@/components/customs/ui';

const EXAMPLES = [
  { label: 'LED downlights', desc: 'LED architectural downlights, recessed, aluminium body', origin: 'CN' },
  { label: 'Bottled wine', desc: 'Still red wine of fresh grapes, bottled 750ml, 14% abv', origin: 'IT' },
  { label: 'Milking plant', desc: 'Rotary milking platform and dairy machinery', origin: 'AU' },
  { label: 'Vintage car', desc: '1972 vintage grand touring motor car, petrol, personal import', origin: 'GB' },
];

export function ClassifyTool() {
  const [desc, setDesc] = useState(EXAMPLES[0].desc);
  const [origin, setOrigin] = useState(EXAMPLES[0].origin);
  const [hint, setHint] = useState('');
  const [submitted, setSubmitted] = useState(EXAMPLES[0].desc);
  const [submittedOrigin, setSubmittedOrigin] = useState(EXAMPLES[0].origin);
  const [submittedHint, setSubmittedHint] = useState('');

  const result = useMemo(
    () => (submitted.trim() ? classifyGoods(submitted, submittedHint || undefined) : null),
    [submitted, submittedHint],
  );
  const fta = useMemo(() => {
    if (!result) return null;
    const best = result.candidates[0];
    if (!best || best.suggestion) return null;
    return checkFtaPreference(best.hsCode, submittedOrigin, best.dutyRatePercent);
  }, [result, submittedOrigin]);

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      {/* Input */}
      <div>
        <Card>
          <SectionTitle>Describe the goods</SectionTitle>
          <label className="mb-1 block text-xs text-[color:var(--air-slate)]">What is it?</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-[color:var(--air-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[color:var(--air-brass)]"
          />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-[color:var(--air-slate)]">Origin (ISO-2)</label>
              <input
                value={origin}
                onChange={(e) => setOrigin(e.target.value.toUpperCase().slice(0, 2))}
                className="w-full rounded-lg border border-[color:var(--air-line)] bg-white px-3 py-2 text-sm uppercase outline-none focus:border-[color:var(--air-brass)]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[color:var(--air-slate)]">HS hint (optional)</label>
              <input
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                placeholder="e.g. 8434.10"
                className="w-full rounded-lg border border-[color:var(--air-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[color:var(--air-brass)]"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setSubmitted(desc);
              setSubmittedOrigin(origin);
              setSubmittedHint(hint);
            }}
            className="mt-4 w-full rounded-lg bg-[color:var(--air-navy)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[color:var(--air-navy-deep)]"
          >
            Classify
          </button>

          <div className="mt-4">
            <p className="mb-2 text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--air-slate)]">Try an example</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  type="button"
                  onClick={() => {
                    setDesc(ex.desc);
                    setOrigin(ex.origin);
                    setHint('');
                    setSubmitted(ex.desc);
                    setSubmittedOrigin(ex.origin);
                    setSubmittedHint('');
                  }}
                  className="rounded-full border border-[color:var(--air-line)] px-3 py-1 text-xs text-[color:var(--air-navy)] hover:border-[color:var(--air-brass)]"
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Output */}
      <div>
        {result ? (
          <>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="air-display text-xl">Three candidates</h2>
              {result.recommendRuling ? <Pill tone="warn">binding ruling recommended</Pill> : <Pill tone="ok">high-confidence match</Pill>}
            </div>
            <div className="space-y-3">
              {result.candidates.map((cand, i) => (
                <Card key={i} className={i === 0 ? 'border-[color:var(--air-brass)]' : ''}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="air-display text-lg text-[color:var(--air-navy)]">{cand.hsCode}</span>
                      <Pill tone={i === 0 ? 'brass' : 'navy'}>{i === 0 ? 'preferred' : i === 1 ? 'alternate' : 'long shot'}</Pill>
                    </div>
                    <div className="flex gap-1.5">
                      <Pill tone={cand.suggestion ? 'warn' : 'ok'}>{cand.suggestion ? 'suggestion' : 'reference'}</Pill>
                      <Pill tone="navy">{cand.confidence}</Pill>
                    </div>
                  </div>
                  <p className="mt-1.5 text-sm text-[color:var(--air-ink)]">{cand.headingText}</p>
                  <p className="mt-1 text-xs text-[color:var(--air-slate)]">
                    <strong className="text-[color:var(--air-brass-deep)]">{cand.griApplied.join(', ')}:</strong> {cand.griReasoning}
                  </p>
                  <p className="mt-1.5 text-xs text-[color:var(--air-slate)]">
                    Indicative duty {cand.dutyRatePercent}% · {cand.brokerNote}
                  </p>
                </Card>
              ))}
            </div>

            {result.recommendRuling ? (
              <Card mist className="mt-3">
                <p className="text-sm text-[color:var(--air-ink)]">
                  <strong className="text-[color:var(--air-brass-deep)]">Binding tariff ruling recommended.</strong> {result.rulingReason}
                </p>
              </Card>
            ) : null}

            {fta ? (
              <Card className="mt-3">
                <SectionTitle>FTA / preference — origin {fta.originCountry}</SectionTitle>
                {fta.eligible && fta.agreement ? (
                  <div className="text-sm">
                    <p>
                      <span className="font-semibold text-[color:var(--air-navy)]">{fta.agreement.agreement}</span> may apply:
                      general {fta.generalRatePercent}% → preferential {fta.preferentialRatePercent}%.
                    </p>
                    <p className="mt-1 text-xs text-[color:var(--air-slate)]">{fta.requirement}</p>
                    <p className="mt-1 text-xs text-[color:var(--air-slate)]">{fta.note}</p>
                  </div>
                ) : (
                  <p className="text-sm text-[color:var(--air-slate)]">{fta.note}</p>
                )}
              </Card>
            ) : null}

            <Card mist className="mt-3">
              <p className="mb-2 text-xs text-[color:var(--air-slate)]">{result.signOffLine}</p>
              <CitationList items={result.citations} />
            </Card>
          </>
        ) : (
          <Card><p className="text-sm text-[color:var(--air-slate)]">Enter a goods description and classify.</p></Card>
        )}
      </div>
    </div>
  );
}
