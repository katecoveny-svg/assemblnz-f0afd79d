'use client';

import { useState } from 'react';
import { ArcMark } from '@/components/ops/toa/ArcHeroBand';

/**
 * ArcChatPanel — scripted concept chat, modelled on the other pilot demos.
 * Fully local: no network, no model call, nothing sends. The script shows the
 * register ARC works in — cites its clause, drafts instead of deciding, and
 * says so.
 */
type Msg = { from: 'you' | 'arc'; text: string };

const OPENERS: Array<{ q: string; a: string }> = [
  {
    q: 'Where is 16A at before lodgement?',
    a: 'Pre-check complete against AUP H4 and the Building Code Acceptable Solutions — three gaps, each cited to its clause. The blocker is the geotech PS1 for the sloped site (380 mm level difference); the 225 mm stormwater line also needs an engineer’s note under E1. The Te Aranga audit is drafted and held for review with mana whenua — that call is never mine. Sources: draft RC 12 May 2025 · pre-check 30 Apr 2026 (demo).',
  },
  {
    q: 'Draft the geotech chase for 16A',
    a: 'Drafted — third chase to Kohia Geotech for the PS1 and slope-stability statement. It names what lodgement is waiting on, quotes their 24 June reply (“this week”), and proposes a call if it can’t land by Friday. Firm, polite, specific — and it goes nowhere until you approve it.',
  },
  {
    q: 'What PS3s are missing for Matai Street Hall?',
    a: 'Two outstanding for CCC: Torrent Structural (retaining works — chase drafted) and passive fire is already in from Beacon. Drainage PS3 isn’t due until the contractor finishes week after next. I’ll re-check the CCC checklist when each one lands.',
  },
];

export function ArcChatPanel({
  greeting,
  openers = OPENERS,
}: {
  /** Override the first ARC bubble (e.g. the BIM-viewer hub greeting). */
  greeting?: string;
  openers?: Array<{ q: string; a: string }>;
}) {
  const [thread, setThread] = useState<Msg[]>([
    {
      from: 'arc',
      text:
        greeting ??
        'Mōrena, Nick. Ten drafts from the weekend are waiting for review. Ask about any project, consent or consultant — I’ll answer with sources, and nothing sends without you.',
    },
  ]);
  const [used, setUsed] = useState<number[]>([]);

  const ask = (i: number) => {
    const { q, a } = openers[i];
    setThread((t) => [...t, { from: 'you', text: q }, { from: 'arc', text: a }]);
    setUsed((u) => [...u, i]);
  };

  return (
    // Champagne ring — assembl chrome accent per DIRECTION-LOCKED (never green).
    <div className="flex flex-col rounded-2xl border border-[#bfa37a]/60 bg-[color:var(--brand-surface)]">
      <div className="flex items-center gap-3 border-b border-black/5 px-4 py-3">
        <ArcMark size={30} />
        <div>
          <p className="text-sm font-semibold text-[color:var(--brand-ink)]">ARC</p>
          <p className="text-[12px] text-[color:var(--brand-muted)]">
            concept demo · scripted · draft-only
          </p>
        </div>
      </div>

      <div className="flex max-h-80 flex-col gap-2 overflow-y-auto px-4 py-3">
        {thread.map((m, i) => (
          <div
            key={i}
            className={`max-w-[92%] rounded-xl px-3 py-2 text-[12px] leading-relaxed ${
              m.from === 'arc'
                ? 'self-start bg-[color:var(--brand-bg)] text-[color:var(--brand-ink)]'
                : 'self-end text-white'
            }`}
            style={m.from === 'you' ? { backgroundColor: 'var(--brand-accent)' } : undefined}
          >
            {m.text}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1.5 border-t border-black/5 px-4 py-3">
        {openers.map((o, i) =>
          used.includes(i) ? null : (
            <button
              key={o.q}
              type="button"
              onClick={() => ask(i)}
              className="rounded-lg border border-black/10 px-3 py-1.5 text-left text-[12px] text-[color:var(--brand-ink)] transition hover:border-[color:var(--brand-accent)]/50 hover:bg-black/[0.03]"
            >
              {o.q}
            </button>
          ),
        )}
        <p className="mt-1 text-[12px] text-[color:var(--brand-muted)]">
          trust score A · NZ Building Code, NZIA templates · last synced 4 min
          ago (demo)
        </p>
      </div>
    </div>
  );
}
