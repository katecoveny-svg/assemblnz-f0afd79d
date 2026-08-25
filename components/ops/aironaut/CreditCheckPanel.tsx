'use client';

import { useEffect, useRef, useState } from 'react';
import { ASSEMBL_WARM_GREY } from '@/components/assembl/chrome';
import {
  creditCheckSamples,
  creditCheckSteps,
  type CreditCheckResult,
} from '@/lib/customers/aironaut/money-data';

const VERDICT = {
  green: { dot: '#2E6B34', label: 'good to trade' },
  amber: { dot: '#C8622A', label: 'trade with care' },
  red: { dot: '#8F2D2D', label: 'protect yourself first' },
} as const;

/**
 * New customer check — paste an NZBN or company name, get a traffic-light
 * terms recommendation in about 30 seconds. Sample lookups only: the three
 * suggestion chips return worked examples; any other input returns the
 * amber example so the flow always completes. No live bureau is wired.
 */
export function CreditCheckPanel({ accent }: { accent: string }) {
  const [query, setQuery] = useState('');
  const [running, setRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState<CreditCheckResult | null>(null);
  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(
    () => () => {
      timersRef.current.forEach(clearTimeout);
    },
    [],
  );

  const run = (name?: string) => {
    const q = (name ?? query).trim();
    if (!q || running) return;
    if (name) setQuery(name);
    setResult(null);
    setRunning(true);
    setStepIndex(0);

    const match =
      creditCheckSamples.find((s) =>
        q.toLowerCase().includes(s.company.toLowerCase().split(' ')[0]),
      ) ?? creditCheckSamples[0];

    creditCheckSteps.forEach((_, i) => {
      timersRef.current.push(setTimeout(() => setStepIndex(i + 1), (i + 1) * 550));
    });
    timersRef.current.push(
      setTimeout(() => {
        setRunning(false);
        setResult(match);
      }, creditCheckSteps.length * 550 + 400),
    );
  };

  return (
    <div className="rounded-2xl border border-black/10 bg-white/85 p-5 backdrop-blur-sm">
      <p className="text-[12px] uppercase" style={{ letterSpacing: '0.16em', color: ASSEMBL_WARM_GREY }}>
        New customer check — 30 seconds
      </p>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: '#3E3C36' }}>
        Before anyone gets deferred terms: Companies Office, credit bureau,
        IRD tax-debt register, court filings — one answer.
      </p>

      <div className="mt-3 flex items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') run();
          }}
          placeholder="Paste an NZBN or company name"
          className="min-w-0 flex-1 rounded-full border border-black/10 bg-white px-3 py-1.5 text-[13px] outline-none placeholder:text-black/35 focus:border-black/30"
          aria-label="NZBN or company name"
        />
        <button
          type="button"
          onClick={() => run()}
          disabled={running}
          className="shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-white transition hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: accent }}
        >
          Run check
        </button>
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        {creditCheckSamples.map((s) => (
          <button
            key={s.company}
            type="button"
            onClick={() => run(s.company)}
            className="rounded-full border border-black/10 bg-white px-2 py-0.5 text-[12px] transition hover:border-black/30"
            style={{ color: ASSEMBL_WARM_GREY }}
          >
            {s.company}
          </button>
        ))}
      </div>

      {running ? (
        <ol className="mt-3 space-y-1" aria-live="polite">
          {creditCheckSteps.map((step, i) => (
            <li key={step} className="flex items-center gap-2 text-[12px]">
              {i < stepIndex ? (
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full" style={{ backgroundColor: '#2E6B34' }}>
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path d="M2.5 6.5 5 9l4.5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              ) : (
                <span
                  className="h-3.5 w-3.5 rounded-full border"
                  style={{ borderColor: i === stepIndex ? '#BFA37A' : 'rgba(0,0,0,0.15)' }}
                />
              )}
              <span style={{ color: i < stepIndex ? '#3E3C36' : ASSEMBL_WARM_GREY }}>{step}</span>
            </li>
          ))}
        </ol>
      ) : null}

      {result ? (
        <div className="mt-3 animate-[assembl-rise-in_0.35s_ease-out] rounded-xl border border-black/10 bg-white p-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: VERDICT[result.verdict].dot }} aria-hidden />
            <p className="text-sm font-semibold">{result.recommendation}</p>
          </div>
          <p className="mt-1 text-[12px]" style={{ color: ASSEMBL_WARM_GREY }}>
            {result.company} · NZBN {result.nzbn} · sample lookup · {VERDICT[result.verdict].label}
          </p>
          <ul className="mt-2 space-y-1">
            {result.reasons.map((r) => (
              <li key={r} className="flex gap-1.5 text-[13px] leading-relaxed" style={{ color: '#3E3C36' }}>
                <span aria-hidden style={{ color: ASSEMBL_WARM_GREY }}>·</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
