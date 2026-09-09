'use client';

/**
 * One NZ–skinned loyalty phone — real app chrome, beat-synced wait→earn→evidence,
 * live agent chat on the wait beat. Not an abstract number board.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import {
  AGENT_CHIPS,
  DEMO_EARN,
  DEMO_RECEIPT_AT,
  nzd,
  WAIT_TRIGGERS,
} from '@/lib/loyalty/one-nz';

export type OnzBeat = 'wait' | 'earn' | 'evidence';
export type OnzTriggerId = (typeof WAIT_TRIGGERS)[number]['id'];

type Msg = { role: 'user' | 'assistant'; content: string };

type Props = {
  beat: OnzBeat;
  trigger: OnzTriggerId;
  household: boolean;
  earned: number;
  stamped: boolean;
  reduced?: boolean;
  onBeatRequest?: (beat: OnzBeat) => void;
  onHouseholdToggle?: () => void;
};

const STEPS: { id: OnzBeat; n: string; label: string }[] = [
  { id: 'wait', n: '01', label: 'wait' },
  { id: 'earn', n: '02', label: 'earn' },
  { id: 'evidence', n: '03', label: 'evidence' },
];

function replyFor(
  ask: string,
  triggerLabel: string,
): { text: string; beat?: OnzBeat } {
  const q = ask.toLowerCase();
  if (q.includes('mana') || q.includes('receipt') || q.includes('proof') || q.includes('evidence')) {
    return {
      beat: 'evidence',
      text: 'Your Mana Receipt records the wait, the Phone Dollars stamp, the opt-in, and the named human who reviews it.',
    };
  }
  if (q.includes('household') || q.includes('share') || q.includes('rebalance')) {
    return {
      beat: 'earn',
      text: 'Optional REBALANCE can share a slice of this wait\'s earn across the household plan. Opt-in, visible, reversible.',
    };
  }
  if (q.includes('earn') || q.includes('why') || q.includes('dollar') || q.includes('wallet')) {
    return {
      beat: 'earn',
      text: `While ${triggerLabel.toLowerCase()} is still running, Phone Dollars stamp into One Wallet. You pay $0 for the moment.`,
    };
  }
  if (q.includes('wait') || q.includes('esim') || q.includes('plan') || q.includes('hold')) {
    return {
      beat: 'wait',
      text: `We detected a real ${triggerLabel.toLowerCase()}. Earn starts when the wait starts.`,
    };
  }
  return {
    text: 'Ask about the wait, Phone Dollars, household share, or your Mana Receipt.',
  };
}

export function OneNzPhone({
  beat,
  trigger,
  household,
  earned,
  stamped,
  reduced = false,
  onBeatRequest,
  onHouseholdToggle,
}: Props) {
  const active = WAIT_TRIGGERS.find((t) => t.id === trigger)!;
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [clock, setClock] = useState('9:41');
  const [dwellPct, setDwellPct] = useState(reduced ? 72 : 8);
  const streamRef = useRef<HTMLDivElement | null>(null);
  const replyTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(`${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')}`);
    };
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (beat !== 'wait' || reduced) {
      setDwellPct(beat === 'wait' ? 72 : 100);
      return;
    }
    setDwellPct(8);
    const id = window.setInterval(() => {
      setDwellPct((p) => Math.min(92, p + 3.2));
    }, 180);
    return () => window.clearInterval(id);
  }, [beat, trigger, reduced]);

  useEffect(() => {
    const el = streamRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy, beat]);

  useEffect(() => {
    // Cancel any in-flight reply so a delayed callback cannot append after reset
    // or fire onBeatRequest for the previous trigger.
    if (replyTimerRef.current !== undefined) {
      window.clearTimeout(replyTimerRef.current);
      replyTimerRef.current = undefined;
    }
    setMessages([]);
    setDraft('');
    setBusy(false);
  }, [trigger]);

  useEffect(() => {
    return () => {
      if (replyTimerRef.current !== undefined) {
        window.clearTimeout(replyTimerRef.current);
        replyTimerRef.current = undefined;
      }
    };
  }, []);

  const send = useCallback(
    (raw: string) => {
      const clean = raw.trim();
      if (!clean || busy) return;
      if (replyTimerRef.current !== undefined) {
        window.clearTimeout(replyTimerRef.current);
        replyTimerRef.current = undefined;
      }
      setBusy(true);
      setDraft('');
      setMessages((m) => [...m, { role: 'user', content: clean }]);
      const { text, beat: next } = replyFor(clean, active.label);
      replyTimerRef.current = window.setTimeout(() => {
        replyTimerRef.current = undefined;
        if (next) onBeatRequest?.(next);
        setMessages((m) => [...m, { role: 'assistant', content: text }]);
        setBusy(false);
      }, reduced ? 0 : 420);
    },
    [busy, active.label, onBeatRequest, reduced],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(draft);
  };

  const lineEarn = household ? DEMO_EARN.stamp - DEMO_EARN.householdShare : DEMO_EARN.stamp;
  const houseEarn = household ? DEMO_EARN.householdShare : 0;

  return (
    <div className="onz-phone" data-beat={beat} aria-label="One NZ loyalty phone demo">
      <div className="onz-phone-glow" aria-hidden="true" />
      <div className="onz-phone-frame">
        <i className="onz-island" aria-hidden="true" />
        <span className="onz-status" aria-hidden="true">
          <em>{clock}</em>
          <span className="onz-status-icons">
            <i className="onz-sig" />
            <i className="onz-wifi" />
            <b className="onz-batt" />
          </span>
        </span>

        <div className="onz-screen">
          <header className="onz-client-stripe">
            <div>
              <strong>one.nz</strong>
              <span>Phone Dollars</span>
            </div>
            <em>how it works</em>
          </header>

          <ol className="onz-stepper" aria-label="Loyalty process">
            {STEPS.map((s) => (
              <li key={s.id} data-on={beat === s.id || undefined}>
                <span className="onz-step-n">{s.n}</span>
                <span className="onz-step-label">{s.label}</span>
              </li>
            ))}
          </ol>

          <div className="onz-phone-body" key={`${beat}-${trigger}`}>
            {beat === 'wait' && (
              <>
                <p className="onz-raw">
                  {active.label} in progress
                  <span>{active.dwell} dwell</span>
                </p>
                <div
                  className="onz-wait-ring"
                  style={{ ['--onz-dwell' as string]: `${dwellPct}%` }}
                  aria-hidden="true"
                >
                  <i />
                  <span>{Math.round(dwellPct)}%</span>
                </div>
                <p className="onz-accent-line">detect · activate · credit</p>
                <div className="onz-agent-card" aria-live="polite">
                  <header>
                    <span className="onz-agent-dot" aria-hidden="true" />
                    <strong>assembl agent</strong>
                    <em>live</em>
                  </header>
                  <p>
                    Phone Dollars stamp while this {active.label} finishes.
                  </p>
                </div>
              </>
            )}

            {beat === 'earn' && (
              <>
                <p className="onz-transform">Phone Dollars</p>
                <dl className="onz-kv">
                  <div>
                    <dt>wait</dt>
                    <dd>
                      {active.label} · {active.dwell}
                    </dd>
                  </div>
                  <div>
                    <dt>this wait</dt>
                    <dd>{nzd(earned)}</dd>
                  </div>
                  <div>
                    <dt>stamp</dt>
                    <dd className={stamped ? 'is-lit' : undefined}>
                      +{nzd(DEMO_EARN.stamp)} → One Wallet
                    </dd>
                  </div>
                  <div>
                    <dt>balance</dt>
                    <dd>{nzd(DEMO_EARN.balance)}</dd>
                  </div>
                </dl>
                <div className="onz-wallet-stamp" data-lit={stamped || undefined}>
                  <span>One Wallet</span>
                  <strong>+{nzd(lineEarn)}</strong>
                  {household ? <em>household +{nzd(houseEarn)}</em> : null}
                </div>
                {onHouseholdToggle ? (
                  <button
                    type="button"
                    className={`onz-phone-toggle ${household ? 'is-on' : ''}`}
                    aria-pressed={household}
                    onClick={onHouseholdToggle}
                  >
                    {household ? 'REBALANCE on' : 'REBALANCE off'}
                  </button>
                ) : null}
              </>
            )}

            {beat === 'evidence' && (
              <>
                <p className="onz-transform">Mana Receipt</p>
                <article className="onz-phone-receipt" aria-label="Mana Receipt">
                  <header>
                    <span>one.nz</span>
                    <strong>Mana Receipt</strong>
                  </header>
                  <dl>
                    <div>
                      <dt>moment</dt>
                      <dd>
                        {active.label} · {DEMO_RECEIPT_AT}
                      </dd>
                    </div>
                    <div>
                      <dt>earned</dt>
                      <dd>+{nzd(DEMO_EARN.stamp)} Phone Dollars</dd>
                    </div>
                    <div>
                      <dt>destination</dt>
                      <dd>One Wallet{household ? ' · household share' : ''}</dd>
                    </div>
                    <div>
                      <dt>permission</dt>
                      <dd>opted in · reversible</dd>
                    </div>
                    <div>
                      <dt>named human</dt>
                      <dd>Alex R. · loyalty operations</dd>
                    </div>
                  </dl>
                  <footer>This wait is recorded as it happened.</footer>
                </article>
              </>
            )}
          </div>

          {(beat === 'wait' || messages.length > 0) && (
            <>
              {messages.length > 0 && (
                <div className="onz-thread" ref={streamRef} aria-live="polite">
                  {messages.map((m, i) => (
                    <p key={i} className={`onz-msg onz-${m.role}`}>
                      {m.content}
                    </p>
                  ))}
                  {busy && (
                    <p className="onz-msg onz-assistant onz-typing" aria-label="Preparing a reply">
                      <span />
                      <span />
                      <span />
                    </p>
                  )}
                </div>
              )}

              {messages.length === 0 && !busy && beat === 'wait' && (
                <div className="onz-chips-row" role="group" aria-label="Ask the agent">
                  {AGENT_CHIPS.map((c) => (
                    <button key={c} type="button" className="onz-chip" onClick={() => send(c)}>
                      {c}
                    </button>
                  ))}
                </div>
              )}

              <form className="onz-composer" onSubmit={onSubmit}>
                <label className="sr-only" htmlFor="onz-ask">
                  Ask about this wait
                </label>
                <input
                  id="onz-ask"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Ask about wait · earn…"
                  maxLength={280}
                  autoComplete="off"
                  disabled={busy}
                />
                <button type="submit" disabled={busy || !draft.trim()} aria-label="Send">
                  <b aria-hidden="true">↑</b>
                </button>
              </form>
            </>
          )}

          <div className="onz-homebar" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
