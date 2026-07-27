'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import './wait-state.css';

/**
 * The wait — on a phone, because that is where it happens.
 *
 * A spinner is the one moment a business has someone's whole attention and
 * spends it on nothing. This is what we put there instead: the specialists
 * working in the open, a credit ticking up for the person waiting, and one
 * optional question going back the other way. Tap through it.
 *
 * Deliberately almost wordless. The screen shows, it does not explain.
 *
 * No real company names — this is assembl's own site, and a named sponsor
 * would assert a commercial relationship that does not exist. The credit comes
 * from the business running the journey.
 */

type Ask = { q: string; options: [string, string]; learn: [string, string] };
type Step = { agent: string; doing: string; credit?: number; ask?: Ask };
type Scenario = { id: string; label: string; app: string; unit: [string, string]; redeem: string; steps: Step[] };

const SCENARIOS: Scenario[] = [
  {
    id: 'power',
    label: 'Power',
    app: 'Why is my bill up?',
    unit: ['$', ''],
    redeem: 'off your next bill',
    steps: [
      { agent: 'Meter', doing: 'Thirty days of use', credit: 0.15 },
      { agent: 'Weather', doing: 'Against the cold snap', credit: 0.2 },
      {
        agent: 'Ask', doing: 'One question',
        ask: {
          q: 'Anyone moved in this month?',
          options: ['Yes', 'No'],
          learn: ['household grew', 'weather, not people'],
        },
      },
      { agent: 'Tariff', doing: 'Better plan for this pattern', credit: 0.25 },
      { agent: 'Draft', doing: 'Ready for a person', credit: 0.3 },
    ],
  },
  {
    id: 'shop',
    label: 'Groceries',
    app: 'A week of meals',
    unit: ['', ' pts'],
    redeem: 'toward free delivery',
    steps: [
      { agent: 'Basket', doing: 'What you actually buy', credit: 60 },
      { agent: 'Stock', doing: 'On the shelf near you', credit: 40 },
      {
        agent: 'Ask', doing: 'One question',
        ask: {
          q: 'Anyone avoiding anything?',
          options: ['Gluten-free', 'Nothing'],
          learn: ['one gluten-free eater', 'no restrictions'],
        },
      },
      { agent: 'Balance', doing: 'Five meals to budget', credit: 90 },
      { agent: 'Draft', doing: 'Ready for a person', credit: 110 },
    ],
  },
  {
    id: 'claim',
    label: 'A claim',
    app: 'Storm damage',
    unit: ['$', ''],
    redeem: 'off your excess',
    steps: [
      { agent: 'Policy', doing: 'What this covers', credit: 0.4 },
      { agent: 'Photos', doing: 'Sorted and matched', credit: 0.35 },
      {
        agent: 'Ask', doing: 'One question',
        ask: {
          q: 'Liveable tonight?',
          options: ['No', 'Yes'],
          learn: ['needs somewhere tonight', 'repair queue, not urgent'],
        },
      },
      { agent: 'Assess', doing: 'Numbers against schedule', credit: 0.5 },
      { agent: 'Draft', doing: 'Ready for a person', credit: 0.45 },
    ],
  },
];

const BEAT = 1150;

export function WaitState() {
  const [sid, setSid] = useState(SCENARIOS[0]!.id);
  const [at, setAt] = useState(-1);
  const [done, setDone] = useState<number[]>([]);
  const [credit, setCredit] = useState(0);
  const [answer, setAnswer] = useState<0 | 1 | null>(null);
  const [skipped, setSkipped] = useState(false);
  const [finished, setFinished] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sc = SCENARIOS.find((s) => s.id === sid)!;
  const running = at >= 0 && !finished;
  const pending = running ? sc.steps[at] : undefined;
  /** The question genuinely holds the line — it is a question, not a tick. */
  const asking = Boolean(pending?.ask) && answer === null && !skipped;

  const clear = () => { if (timer.current) clearTimeout(timer.current); timer.current = null; };
  useEffect(() => clear, []);

  const reset = useCallback((next?: string) => {
    clear();
    setAt(-1); setDone([]); setCredit(0);
    setAnswer(null); setSkipped(false); setFinished(false);
    if (next) setSid(next);
  }, []);

  useEffect(() => {
    if (at < 0 || finished || asking) return;
    clear();
    timer.current = setTimeout(() => {
      const step = sc.steps[at]!;
      setDone((d) => (d.includes(at) ? d : [...d, at]));
      if (step.credit) setCredit((c) => c + step.credit!);
      if (at + 1 >= sc.steps.length) { setFinished(true); setAt(sc.steps.length); }
      else setAt(at + 1);
    }, BEAT);
    return clear;
  }, [at, finished, asking, sc]);

  const pct = Math.round((done.length / sc.steps.length) * 100);
  const money = (n: number) =>
    `${sc.unit[0]}${sc.unit[0] === '$' ? n.toFixed(2) : Math.round(n)}${sc.unit[1]}`;
  const askStep = sc.steps.find((s) => s.ask);
  const learned = askStep?.ask && answer !== null ? askStep.ask.learn[answer] : null;

  return (
    <div className="wsp">
      <div className="wsp-phone">
        <div className="wsp-glare" aria-hidden="true" />
        <div className="wsp-screen">
          <div className="wsp-status" aria-hidden="true">
            <span>9:41</span><span className="wsp-brand">assembl</span><span>▮▮▮</span>
          </div>

          <div className="wsp-app">{sc.app}</div>
          <div className="wsp-loyal">the wait pays loyalty</div>

          {/* The spinner. It is the whole idea, so it is the biggest thing here. */}
          <div className={`wsp-ring${running ? ' spin' : ''}${finished ? ' done' : ''}`}>
            <svg viewBox="0 0 120 120" aria-hidden="true">
              <circle className="wsp-track" cx="60" cy="60" r="52" />
              <circle
                className="wsp-arc" cx="60" cy="60" r="52"
                strokeDasharray={2 * Math.PI * 52}
                strokeDashoffset={2 * Math.PI * 52 * (1 - pct / 100)}
              />
            </svg>
            <div className="wsp-mid">
              <div className="wsp-credit">{credit > 0 ? money(credit) : money(0)}</div>
              <div className="wsp-credit-l">{finished ? 'yours to keep' : 'in your wallet'}</div>
            </div>
          </div>

          <ol className="wsp-steps">
            {sc.steps.map((s, i) => {
              const isDone = done.includes(i);
              const isNow = i === at && !finished;
              return (
                <li key={i} className={`wsp-step${isDone ? ' done' : ''}${isNow ? ' now' : ''}`}>
                  <span className="wsp-dot" aria-hidden="true" />
                  <span className="wsp-who">{s.agent}</span>
                  <span className="wsp-doing">{s.doing}</span>
                  {s.credit && <span className="wsp-earn">+{money(s.credit)}</span>}
                </li>
              );
            })}
          </ol>

          {finished && (
            <div className="wsp-redeem">
              <b>{money(credit)}</b> in your loyalty wallet — {sc.redeem}
            </div>
          )}
          {learned && (
            <div className="wsp-learned">
              they told you: <b>{learned}</b>
            </div>
          )}
          {skipped && !learned && <div className="wsp-learned muted">they said no. fine.</div>}

          {at < 0 && (
            <button type="button" className="wsp-go" onClick={() => setAt(0)}>tap to wait</button>
          )}
          {finished && (
            <button type="button" className="wsp-go ghost" onClick={() => reset()}>again ↺</button>
          )}

          {/* the one question, as a bottom sheet — where a phone would put it */}
          {asking && pending?.ask && (
            <div className="wsp-sheet" aria-live="polite">
              <div className="wsp-sheet-q">{pending.ask.q}</div>
              <div className="wsp-sheet-row">
                {pending.ask.options.map((o, i) => (
                  <button key={o} type="button" className="wsp-sheet-btn"
                    onClick={() => setAnswer(i as 0 | 1)}>{o}</button>
                ))}
              </div>
              <button type="button" className="wsp-sheet-skip" onClick={() => setSkipped(true)}>
                rather not
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="wsp-pick" role="group" aria-label="Choose a wait">
        {SCENARIOS.map((s) => (
          <button key={s.id} type="button" className={`wsp-tab${s.id === sid ? ' on' : ''}`}
            onClick={() => reset(s.id)}>{s.label}</button>
        ))}
      </div>
    </div>
  );
}
