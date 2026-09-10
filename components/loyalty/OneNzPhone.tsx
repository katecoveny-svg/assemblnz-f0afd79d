'use client';

/**
 * One NZ–skinned loyalty phone — Wait→Earn→Evidence with One Wallet chrome.
 * Inside-phone greens echo the real app; Assembl page accent stays #007C92.
 * Independent concept — not a partnership claim or offerwall clone.
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

function replyFor(
  ask: string,
  triggerLabel: string,
): { text: string; beat?: OnzBeat } {
  const q = ask.toLowerCase();
  if (q.includes('mana') || q.includes('receipt') || q.includes('proof') || q.includes('evidence')) {
    return {
      beat: 'evidence',
      text: 'Your Evidence receipt locks the wait, the Phone Dollars stamp, permission, and the named human who reviews it.',
    };
  }
  if (q.includes('household') || q.includes('share') || q.includes('rebalance')) {
    return {
      beat: 'earn',
      text: 'Optional REBALANCE can share a slice of this wait\'s earn across the household plan — permissioned and reversible.',
    };
  }
  if (q.includes('earn') || q.includes('why') || q.includes('dollar') || q.includes('wallet')) {
    return {
      beat: 'earn',
      text: `While ${triggerLabel} is still running, Phone Dollars stamp into One Wallet. You pay $0 for the moment.`,
    };
  }
  if (q.includes('wait') || q.includes('esim') || q.includes('plan') || q.includes('hold')) {
    return {
      beat: 'wait',
      text: `We detected a real ${triggerLabel}. The earn starts the moment the wait does — nothing invented.`,
    };
  }
  return {
    text: 'Ask about the wait, Phone Dollars, household share, or your Evidence receipt.',
  };
}

function PhoneNav({ active }: { active: 'accounts' | 'wallet' | 'help' }) {
  return (
    <nav className="onz-app-nav" aria-label="One NZ app navigation (demo)">
      <span data-on={active === 'accounts' || undefined}>
        <i className="onz-nav-ico onz-nav-accounts" aria-hidden="true" />
        Accounts
      </span>
      <span data-on={active === 'wallet' || undefined}>
        <i className="onz-nav-ico onz-nav-wallet" aria-hidden="true" />
        One Wallet
      </span>
      <span data-on={active === 'help' || undefined}>
        <i className="onz-nav-ico onz-nav-help" aria-hidden="true" />
        Need help?
      </span>
    </nav>
  );
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
    <div
      className="onz-phone"
      data-beat={beat}
      data-chrome={beat === 'earn' ? 'dark' : 'light'}
      aria-label="One NZ loyalty phone demo"
    >
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
          <div className="onz-phone-body" key={`${beat}-${trigger}`}>
            {beat === 'wait' && (
              <div className="onz-wait-stage">
                <div
                  className="onz-orb"
                  style={{ ['--onz-dwell' as string]: `${dwellPct}%` }}
                  data-reduced={reduced || undefined}
                  aria-hidden="true"
                >
                  <i className="onz-orb-halo" />
                  <i className="onz-orb-mid" />
                  <i className="onz-orb-core" />
                </div>
                <p className="onz-orb-dwell">{Math.round(dwellPct)}% through wait</p>
                <p className="onz-wait-title">{active.label} in progress</p>
                <p className="onz-wait-dwell">{active.dwell} dwell · detect · activate · credit</p>
                <div className="onz-wait-note" aria-live="polite">
                  <header>
                    <span className="onz-orb-mini" aria-hidden="true" />
                    <strong>While you wait</strong>
                    <em>live</em>
                  </header>
                  <p>
                    Phone Dollars start earning the moment this {active.label} does. Ask below if
                    you want the proof trail.
                  </p>
                </div>
              </div>
            )}

            {beat === 'earn' && (
              <div className="onz-wallet-stage">
                <header className="onz-wallet-top">
                  <span className="onz-wallet-back" aria-hidden="true">
                    ←
                  </span>
                  <strong>One Wallet</strong>
                  <span className="onz-wallet-spacer" aria-hidden="true" />
                </header>
                <div className="onz-wallet-activity" aria-hidden="true">
                  View activity
                  <span>›</span>
                </div>
                <div className="onz-wallet-tabs" role="tablist" aria-label="One Wallet tabs">
                  <span role="tab" aria-selected="true" data-on>
                    Earn
                  </span>
                  <span role="tab" aria-selected="false">
                    Redeem
                  </span>
                </div>
                <div className="onz-wallet-copy">
                  <h3>Earn Phone Dollars</h3>
                  <p>Useful micro-action during this wait stamps credit into One Wallet.</p>
                </div>
                <div className="onz-wallet-stamp-card" data-lit={stamped || undefined}>
                  <span className="onz-stamp-kicker">This wait · {active.label}</span>
                  <strong className={stamped ? 'is-lit' : undefined}>
                    +{nzd(DEMO_EARN.stamp)}
                  </strong>
                  <em>{stamped ? 'Stamped into One Wallet' : 'Stamping into One Wallet…'}</em>
                  <dl className="onz-stamp-meta">
                    <div>
                      <dt>Moment value</dt>
                      <dd>{nzd(earned || DEMO_EARN.thisWait)}</dd>
                    </div>
                    <div>
                      <dt>Balance</dt>
                      <dd>{nzd(DEMO_EARN.balance)}</dd>
                    </div>
                    <div>
                      <dt>This line</dt>
                      <dd>{nzd(lineEarn)}</dd>
                    </div>
                    {household ? (
                      <div>
                        <dt>Household</dt>
                        <dd>+{nzd(houseEarn)}</dd>
                      </div>
                    ) : null}
                  </dl>
                </div>
                {onHouseholdToggle ? (
                  <button
                    type="button"
                    className={`onz-wallet-toggle ${household ? 'is-on' : ''}`}
                    aria-pressed={household}
                    onClick={onHouseholdToggle}
                  >
                    <span>REBALANCE</span>
                    <em>{household ? 'On · share with household' : 'Off · keep on this line'}</em>
                  </button>
                ) : null}
              </div>
            )}

            {beat === 'evidence' && (
              <div className="onz-evidence-stage">
                <header className="onz-evidence-top">
                  <span className="onz-wallet-back" aria-hidden="true">
                    ←
                  </span>
                  <strong>Evidence receipt</strong>
                  <span className="onz-wallet-spacer" aria-hidden="true" />
                </header>
                <p className="onz-evidence-lede">
                  Your wait, recorded properly — permissioned and named.
                </p>
                <article className="onz-phone-receipt" aria-label="Evidence receipt">
                  <header>
                    <span>one.nz</span>
                    <strong>Evidence receipt</strong>
                  </header>
                  <dl>
                    <div>
                      <dt>Moment</dt>
                      <dd>
                        {active.label} · {DEMO_RECEIPT_AT}
                      </dd>
                    </div>
                    <div>
                      <dt>Earned</dt>
                      <dd>+{nzd(DEMO_EARN.stamp)} Phone Dollars</dd>
                    </div>
                    <div>
                      <dt>Destination</dt>
                      <dd>One Wallet{household ? ' · household share' : ''}</dd>
                    </div>
                    <div>
                      <dt>Permission</dt>
                      <dd>Opted in · reversible</dd>
                    </div>
                    <div>
                      <dt>Named human</dt>
                      <dd>Alex R. · loyalty operations</dd>
                    </div>
                  </dl>
                  <footer>Proof you can keep.</footer>
                </article>
              </div>
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
                <div className="onz-chips-row" role="group" aria-label="Ask about this wait">
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

          <PhoneNav active={beat === 'wait' ? 'help' : 'wallet'} />
          <div className="onz-homebar" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
