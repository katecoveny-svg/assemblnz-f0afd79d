'use client';

import { useState } from 'react';
import { ASSEMBL_WARM_GREY } from '@/components/assembl/chrome';
import { chaseCadence, chaseInvoices, chaseStats } from '@/lib/customers/aironaut/money-data';

/**
 * AR chase — three sample overdue invoices, each with a chase message
 * drafted in Aironaut's voice (same short-warm-direct shape as the
 * legacy subbie-chase function). Approve flips the row to "sent" locally;
 * nothing leaves the workspace — no live channel is wired.
 *
 * Styled to the dashboard tile language: rounded-2xl · border-black/10 ·
 * bg-white/85 · backdrop-blur · 10px uppercase labels.
 */
export function ARChasePanel({ accent }: { accent: string }) {
  const [openId, setOpenId] = useState<string | null>(chaseInvoices[0].id);
  const [sent, setSent] = useState<Record<string, boolean>>({});

  return (
    <div
      id="ar-chase"
      className="scroll-mt-8 rounded-2xl border border-black/10 bg-white/85 p-5 backdrop-blur-sm"
    >
      <p className="text-[10px] uppercase" style={{ letterSpacing: '0.16em', color: ASSEMBL_WARM_GREY }}>
        AR chase — 3 invoices due
      </p>

      <ul className="mt-3 space-y-2">
        {chaseInvoices.map((inv) => {
          const isOpen = openId === inv.id;
          const isSent = !!sent[inv.id];
          return (
            <li key={inv.id} className="overflow-hidden rounded-xl border border-black/10 bg-white">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : inv.id)}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition hover:bg-black/[0.02]"
                aria-expanded={isOpen}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {inv.customer}
                  </span>
                  <span className="block truncate text-[11px]" style={{ color: ASSEMBL_WARM_GREY }}>
                    {inv.id} · {inv.jobSummary}
                  </span>
                </span>
                <span className="text-right">
                  <span className="block text-sm font-semibold">{inv.amount}</span>
                  <span className="block text-[11px]" style={{ color: accent }}>
                    {inv.daysOverdue} days overdue
                  </span>
                </span>
                {isSent ? (
                  <span
                    className="ml-0.5 flex h-5 w-5 shrink-0 animate-[assembl-rise-in_0.35s_ease-out] items-center justify-center rounded-full"
                    style={{ backgroundColor: '#2E6B34' }}
                    aria-label="sent"
                  >
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
                      <path d="M2.5 6.5 5 9l4.5-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                ) : null}
              </button>

              {isOpen ? (
                <div className="border-t border-black/5 px-3 py-3">
                  <p className="text-[10px] uppercase" style={{ letterSpacing: '0.16em', color: ASSEMBL_WARM_GREY }}>
                    draft · {inv.cadenceStage}
                  </p>
                  <blockquote
                    className="mt-2 rounded-lg bg-black/[0.03] p-2.5 text-[13px] leading-relaxed"
                    style={{ borderLeft: '3px solid #BFA37A' }}
                  >
                    {inv.draft}
                  </blockquote>
                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1">
                      {(['Outlook email', 'WhatsApp', 'SMS'] as const).map((ch) => (
                        <span
                          key={ch}
                          className="rounded-full border px-2 py-0.5 text-[10px]"
                          style={
                            ch === inv.channel
                              ? { borderColor: '#0B1F3A', backgroundColor: '#0B1F3A', color: '#fff' }
                              : { borderColor: 'rgba(0,0,0,0.12)', color: ASSEMBL_WARM_GREY }
                          }
                        >
                          {ch}
                        </span>
                      ))}
                    </div>
                    {isSent ? (
                      <span
                        className="animate-[assembl-rise-in_0.35s_ease-out] text-[12px] font-semibold"
                        style={{ color: '#2E6B34' }}
                      >
                        Sent · {inv.channel}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSent((s) => ({ ...s, [inv.id]: true }))}
                        className="rounded-full px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-white transition hover:opacity-90 active:scale-95"
                        style={{ backgroundColor: accent }}
                      >
                        Approve and send
                      </button>
                    )}
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      {/* Cadence — how the chase escalates */}
      <p className="mt-3 text-[11px] leading-relaxed" style={{ color: ASSEMBL_WARM_GREY }}>
        {chaseCadence.map((c, i) => (
          <span key={c.day}>
            {i > 0 ? ' · ' : ''}
            <span className="font-semibold" style={{ color: '#3E3C36' }}>{c.day}:</span> {c.step}
          </span>
        ))}
      </p>
      <p className="mt-2 text-[11px]" style={{ color: ASSEMBL_WARM_GREY }}>
        {chaseStats}
      </p>
    </div>
  );
}
