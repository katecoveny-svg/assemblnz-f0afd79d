'use client';

import { useState } from 'react';
import { ASSEMBL_WARM_GREY } from '@/components/assembl/chrome';

/**
 * The four-click walkthrough for Kate's dad: watch one shipment go
 * quote → customs draft → landed-cost report → audit receipt without touching
 * anything. Every artefact shown is computed server-side by the REAL Pīkau
 * engines (lib/customs) on the demo shipment and passed in as props — this
 * overlay just walks through them.
 */

export type WalkthroughStep = {
  title: string;
  lead: string;
  rows: Array<{ label: string; value: string }>;
  footnote: string;
};

export function DadWalkthrough({
  steps,
  accent,
}: {
  steps: WalkthroughStep[];
  accent: string;
}) {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setI(0);
          setOpen(true);
        }}
        className="rounded-xl border border-black/10 bg-white px-5 py-3 text-left shadow-sm transition-shadow hover:shadow-md"
      >
        <span className="block text-sm font-semibold">
          Watch a shipment go end-to-end →
        </span>
        <span className="mt-0.5 block text-xs" style={{ color: ASSEMBL_WARM_GREY }}>
          Quote → customs draft → landed cost → audit receipt, in four clicks. Nothing to type.
        </span>
      </button>
    );
  }

  const step = steps[i];
  const last = i === steps.length - 1;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal
      aria-label="Shipment walkthrough"
    >
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl" style={{ backgroundColor: '#FBFAF6' }}>
        <div className="flex items-center justify-between">
          <span
            className="text-[10px] uppercase"
            style={{ letterSpacing: '0.16em', color: ASSEMBL_WARM_GREY }}
          >
            step {i + 1} of {steps.length}
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md px-2 py-1 text-xs hover:bg-black/5"
          >
            Close ✕
          </button>
        </div>

        <h3
          className="mt-3 text-2xl"
          style={{ fontFamily: "var(--font-display), 'Cormorant Garamond', Georgia, serif", fontWeight: 600 }}
        >
          {step.title}
        </h3>
        <p className="mt-1.5 text-sm" style={{ color: '#3E3C36' }}>
          {step.lead}
        </p>

        <dl className="mt-4 space-y-1.5 rounded-xl border border-black/5 bg-white p-4">
          {step.rows.map((r) => (
            <div key={r.label} className="flex items-baseline justify-between gap-4">
              <dt className="text-[11px] uppercase" style={{ letterSpacing: '0.08em', color: ASSEMBL_WARM_GREY }}>
                {r.label}
              </dt>
              <dd className="text-right font-mono text-[12px]">{r.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-[11px]" style={{ color: ASSEMBL_WARM_GREY }}>
          {step.footnote}
        </p>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex gap-1.5">
            {steps.map((_, d) => (
              <span
                key={d}
                aria-hidden
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: d <= i ? accent : '#D8D6CE' }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {i > 0 && (
              <button
                type="button"
                onClick={() => setI(i - 1)}
                className="rounded-xl border border-black/10 px-4 py-2 text-sm hover:bg-black/5"
              >
                back
              </button>
            )}
            <button
              type="button"
              onClick={() => (last ? setOpen(false) : setI(i + 1))}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: accent }}
            >
              {last ? 'done — all four, no lodgement' : 'next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
