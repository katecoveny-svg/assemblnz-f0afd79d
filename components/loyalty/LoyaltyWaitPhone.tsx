'use client';

/**
 * Real-device loyalty phone — Assembl homepage wait→earn.
 * Paper/chalk canvas, plum bezel, heather accent. No One NZ packaging.
 * Scroll advances the spine; chips + composer drive loyalty-wait replies locally
 * (always succeed — no FAQ /api dependency).
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { ASSEMBL_CANON } from '@/lib/loyalty/one-nz';

export type LoyaltyBeat = 'wait' | 'earn' | 'evidence';

const STEPS: { id: LoyaltyBeat; n: string; label: string }[] = [
  { id: 'wait', n: '01', label: 'wait' },
  { id: 'earn', n: '02', label: 'earn' },
  { id: 'evidence', n: '03', label: 'evidence' },
];

/** Loyalty-wait chips only — never generic “what is assembl” FAQ. */
const CHIPS = [
  'How does the wait earn?',
  'Show the Mana Receipt',
  'Who reviews the credit?',
] as const;

type Msg = { role: 'user' | 'assistant'; content: string };

type Props = {
  beat: LoyaltyBeat;
  /** Parent can jump beat when a chip asks for earn/evidence. */
  onBeatRequest?: (beat: LoyaltyBeat) => void;
  progress?: number;
  reduced?: boolean;
};

function creditForProgress(p: number): string {
  const amount = Math.min(2.75, Math.max(0, p * 2.75 * 1.15));
  return amount.toLocaleString('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    minimumFractionDigits: 2,
  });
}

/** Grounded loyalty-wait replies — Assembl-general, no client packaging. */
function replyFor(ask: string): { text: string; beat?: LoyaltyBeat } {
  const q = ask.toLowerCase();
  if (q.includes('mana') || q.includes('receipt') || q.includes('evidence') || q.includes('proof')) {
    return {
      beat: 'evidence',
      text: 'Mana Receipt locks the wait, the credit, permission, and the named human who reviews it — proof you can keep.',
    };
  }
  if (q.includes('review') || q.includes('human') || q.includes('who')) {
    return {
      beat: 'evidence',
      text: 'A named person in loyalty ops reviews before anything settles. Nothing sends without that human yes.',
    };
  }
  if (q.includes('earn') || q.includes('credit') || q.includes('stamp') || q.includes('wallet')) {
    return {
      beat: 'earn',
      text: 'While the wait is still happening, credit stamps into the wallet — permissioned, reversible, visible.',
    };
  }
  if (q.includes('wait') || q.includes('detect') || q.includes('hold') || q.includes('activat')) {
    return {
      beat: 'wait',
      text: 'We detect a real wait — hold, activation, review — and start the earn the moment it begins. No invented delay.',
    };
  }
  return {
    text: 'Ask about the wait, the earn, or the Mana Receipt — detect · activate · credit, with a named human on the record.',
  };
}

export function LoyaltyWaitPhone({
  beat,
  onBeatRequest,
  progress = 0,
  reduced = false,
}: Props) {
  const earned = reduced || beat !== 'wait' ? '$2.75' : creditForProgress(progress);
  const stamped = beat === 'evidence' || (reduced && beat !== 'wait');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const streamRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = streamRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy, beat]);

  const send = useCallback(
    (raw: string) => {
      const clean = raw.trim();
      if (!clean || busy) return;
      setBusy(true);
      setDraft('');
      setMessages((m) => [...m, { role: 'user', content: clean }]);
      const { text, beat: next } = replyFor(clean);
      window.setTimeout(() => {
        if (next) onBeatRequest?.(next);
        setMessages((m) => [...m, { role: 'assistant', content: text }]);
        setBusy(false);
      }, reduced ? 0 : 420);
    },
    [busy, onBeatRequest, reduced],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(draft);
  };

  return (
    <div
      className="lwp"
      data-beat={beat}
      style={
        {
          '--lwp-plum': ASSEMBL_CANON.plum,
          '--lwp-mulberry': ASSEMBL_CANON.mulberry,
          '--lwp-heather': ASSEMBL_CANON.heather,
          '--lwp-chalk': ASSEMBL_CANON.chalk,
          '--lwp-paper': ASSEMBL_CANON.paper,
        } as CSSProperties
      }
    >
      <div className="lwp-bezel" aria-hidden="true">
        <i className="lwp-island" />
        <span className="lwp-status">
          <em>9:41</em>
          <b />
        </span>
      </div>

      <div className="lwp-screen">
        <header className="lwp-appbar">
          <strong>assembl</strong>
          <span>loyalty wait</span>
        </header>

        <ol className="lwp-stepper" aria-label="Wait to evidence">
          {STEPS.map((s) => (
            <li key={s.id} data-on={beat === s.id || undefined}>
              <span className="lwp-step-n">{s.n}</span>
              <span className="lwp-step-label">{s.label}</span>
            </li>
          ))}
        </ol>

        <div className="lwp-body" key={beat}>
          {beat === 'wait' && (
            <>
              <p className="lwp-kicker">real wait detected</p>
              <h3>Hold / activation in progress</h3>
              <div className="lwp-pulse" aria-hidden="true">
                <i />
              </div>
              <p className="lwp-spine">detect · activate · credit</p>
              <p className="lwp-note">The wait is the earn event — credit starts now.</p>
            </>
          )}

          {beat === 'earn' && (
            <>
              <p className="lwp-kicker">credit landing</p>
              <h3>Earned while you wait</h3>
              <dl className="lwp-kv">
                <div>
                  <dt>this wait</dt>
                  <dd>{earned}</dd>
                </div>
                <div>
                  <dt>stamp</dt>
                  <dd className={stamped ? 'is-lit' : undefined}>+$0.45 → wallet</dd>
                </div>
                <div>
                  <dt>spine</dt>
                  <dd>wait → earn → evidence</dd>
                </div>
              </dl>
              <p className="lwp-note">Permissioned. Reversible. Named human reviews.</p>
            </>
          )}

          {beat === 'evidence' && (
            <>
              <p className="lwp-kicker">mana receipt</p>
              <h3>Proof you can keep</h3>
              <article className="lwp-receipt" aria-label="Mana Receipt">
                <header>
                  <span>assembl</span>
                  <strong>Mana Receipt</strong>
                </header>
                <dl>
                  <div>
                    <dt>moment</dt>
                    <dd>1 Sep 2026, 8:14pm</dd>
                  </div>
                  <div>
                    <dt>earned</dt>
                    <dd>+$0.45 credit</dd>
                  </div>
                  <div>
                    <dt>permission</dt>
                    <dd>opted in · reversible</dd>
                  </div>
                  <div>
                    <dt>named human</dt>
                    <dd>Alex R. · loyalty ops</dd>
                  </div>
                </dl>
              </article>
              <p className="lwp-note">your wait, recorded properly.</p>
            </>
          )}
        </div>

        {messages.length > 0 && (
          <div className="lwp-thread" ref={streamRef} aria-live="polite">
            {messages.map((m, i) => (
              <p key={i} className={`lwp-msg lwp-${m.role}`}>
                {m.content}
              </p>
            ))}
            {busy && (
              <p className="lwp-msg lwp-assistant lwp-typing" aria-label="Preparing a reply">
                <span />
                <span />
                <span />
              </p>
            )}
          </div>
        )}

        {messages.length === 0 && !busy && (
          <div className="lwp-chips" role="group" aria-label="Loyalty wait questions">
            {CHIPS.map((c) => (
              <button key={c} type="button" className="lwp-chip" onClick={() => send(c)}>
                {c}
              </button>
            ))}
          </div>
        )}

        <form className="lwp-composer" onSubmit={onSubmit}>
          <label className="sr-only" htmlFor="lwp-ask">
            Ask about the loyalty wait
          </label>
          <input
            id="lwp-ask"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask about wait → earn…"
            maxLength={280}
            autoComplete="off"
            disabled={busy}
          />
          <button type="submit" disabled={busy || !draft.trim()} aria-label="Send">
            <b aria-hidden="true">↑</b>
          </button>
        </form>

        <div className="lwp-homebar" aria-hidden="true" />
      </div>
    </div>
  );
}
