'use client';

import { useState, type ReactNode } from 'react';
import { ASSEMBL_WARM_GREY } from '@/components/assembl/chrome';

/**
 * BackendTabs — the "behind the scenes" transparency section on every pilot
 * page: the agent's brain (redacted prompt + knowledge sources + model),
 * today's activity (seeded demo feed), the last Mana Receipts, and the draft
 * queue. Everything shown is either real configuration or data tagged demo.
 */

export type BackendBrain = {
  model: string;
  fallbackNote: string;
  temperatureNote: string;
  promptExcerpt: string;
  sources: Array<{ label: string; tier: 'A' | 'B' | 'C'; note: string }>;
};

export type BackendActivityEvent = { at: string; kind: string; note: string };

export type BackendReceipt = {
  id: string;
  createdAt: string;
  citations: Array<{ source: string; ref?: string }>;
  receiptHash: string;
  prevHash: string | null;
  hitlStatus?: string;
};

export type BackendDraft = { channel: string; audience: string; preview: string };

const TABS = ["the agent's brain", "today's activity", 'mana receipts', 'draft queue'] as const;

function MicroLabel({ children }: { children: ReactNode }) {
  return (
    <span
      className="text-[12px] uppercase"
      style={{ letterSpacing: '0.16em', color: ASSEMBL_WARM_GREY }}
    >
      {children}
    </span>
  );
}

export function BackendTabs({
  brain,
  activity,
  receipts,
  drafts,
  receiptsTabLabel,
}: {
  brain: BackendBrain;
  activity: BackendActivityEvent[];
  receipts: BackendReceipt[];
  drafts: BackendDraft[];
  /** Display override for the receipts tab — English-led tenants (e.g.
   *  aironaut) pass 'audit receipts'; default stays 'mana receipts'. */
  receiptsTabLabel?: string;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>(TABS[0]);
  const tabLabel = (t: (typeof TABS)[number]) =>
    t === 'mana receipts' && receiptsTabLabel ? receiptsTabLabel : t;

  return (
    <div className="rounded-2xl border border-black/10 bg-white/85 shadow-sm backdrop-blur-sm">
      <div className="flex flex-wrap gap-1 border-b border-black/5 px-3 pt-3">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-t-lg px-3 py-2 text-[12px] transition-colors ${
              tab === t ? 'bg-black/5 font-semibold' : 'hover:bg-black/[0.03]'
            }`}
          >
            {tabLabel(t)}
          </button>
        ))}
      </div>

      <div className="px-5 py-5 text-sm">
        {tab === "the agent's brain" && (
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <MicroLabel>system prompt · redacted</MicroLabel>
              <pre className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg bg-black/[0.04] p-3 font-mono text-[12px] leading-relaxed">
                {brain.promptExcerpt}
              </pre>
              <p className="mt-3 text-xs" style={{ color: ASSEMBL_WARM_GREY }}>
                model: <span className="font-mono">{brain.model}</span> · {brain.fallbackNote} ·{' '}
                {brain.temperatureNote}
              </p>
            </div>
            <div>
              <MicroLabel>knowledge sources it reads</MicroLabel>
              <ul className="mt-2 space-y-2">
                {brain.sources.map((s) => (
                  <li key={s.label} className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-black/5 text-[12px] font-bold">
                      {s.tier}
                    </span>
                    <span>
                      <span className="text-[13px]">{s.label}</span>
                      <span className="block text-[12px]" style={{ color: ASSEMBL_WARM_GREY }}>
                        {s.note}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === "today's activity" && (
          <div>
            <MicroLabel>seeded demo feed · every row tagged demo</MicroLabel>
            <ul className="mt-3 space-y-2.5">
              {activity.map((a, i) => (
                <li key={i} className="flex items-baseline gap-3">
                  <span className="w-12 shrink-0 font-mono text-[12px]" style={{ color: ASSEMBL_WARM_GREY }}>
                    {a.at}
                  </span>
                  <span className="w-20 shrink-0 rounded-full bg-black/5 px-2 py-0.5 text-center text-[12px] uppercase" style={{ letterSpacing: '0.08em' }}>
                    {a.kind}
                  </span>
                  <span className="text-[13px]">{a.note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === 'mana receipts' && (
          <div>
            <MicroLabel>last {receipts.length} receipts · tamper-evident hash chain</MicroLabel>
            <ul className="mt-3 space-y-3">
              {receipts.map((r) => (
                <li key={r.id} className="rounded-xl border border-black/5 bg-white p-3">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-mono text-xs font-semibold">{r.id}</span>
                    <span className="text-[12px]" style={{ color: ASSEMBL_WARM_GREY }}>
                      {r.createdAt}
                    </span>
                    {r.hitlStatus ? (
                      <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[12px] uppercase tracking-wider text-amber-900">
                        {r.hitlStatus.replace(/_/g, ' ')}
                      </span>
                    ) : null}
                  </div>
                  {r.citations.length > 0 && (
                    <p className="mt-1.5 text-[12px]" style={{ color: '#3E3C36' }}>
                      cites: {r.citations.map((c) => `${c.source}${c.ref ? ` (${c.ref})` : ''}`).join(' · ')}
                    </p>
                  )}
                  <p className="mt-1.5 break-all font-mono text-[12px]" style={{ color: ASSEMBL_WARM_GREY }}>
                    {r.receiptHash}
                    {r.prevHash ? ` ← ${r.prevHash.slice(0, 24)}…` : ' · chain head'}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === 'draft queue' && (
          <div>
            <MicroLabel>awaiting owner approval · send_mode=draft</MicroLabel>
            {drafts.length === 0 ? (
              <p className="mt-3 text-[13px]" style={{ color: ASSEMBL_WARM_GREY }}>
                Nothing waiting — the queue is clear.
              </p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {drafts.map((d, i) => (
                  <li key={i} className="rounded-xl border border-black/5 bg-white p-3">
                    <div className="flex items-baseline gap-2">
                      <span className="rounded-full bg-black/5 px-2 py-0.5 text-[12px] uppercase" style={{ letterSpacing: '0.08em' }}>
                        {d.channel}
                      </span>
                      <span className="text-[12px]" style={{ color: ASSEMBL_WARM_GREY }}>
                        {d.audience}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[13px]">{d.preview}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
