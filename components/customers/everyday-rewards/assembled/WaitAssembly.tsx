'use client';

/**
 * The wait, assembled — the centrepiece (design constitution §17: the wait is
 * the feature). Instead of a spinner, an ordinary in-app wait becomes visibly
 * productive: the household is understood, meals are matched, duplicates are
 * merged, effort is checked, swaps are prepared, the shop is organised — each
 * step taking shape one at a time while the basket assembles inside the phone,
 * confidence rises, and points accrue. It resolves into an approval-ready shop
 * and a small proof line — nothing is ordered.
 *
 * The choreography is the journey's real wait-stage steps
 * (everydayAssembledJourney.waitStateModules); the basket, total and proof come
 * from the shared run. Motion communicates work (§11), and collapses to an
 * instant, fully-assembled result under prefers-reduced-motion (§23).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ScenarioRun } from '@/lib/concepts/woolworths-assembled';
import { everydayAssembledJourney } from '@/lib/journey/journeys/everyday-assembled';
import { PhoneFrame } from '@/components/customers/everyday-rewards/PhoneFrame';
import { JOURNEY_START_BALANCE } from '@/lib/customers/everyday-rewards/config';
import styles from '@/app/customers/everyday-rewards/assembled/assembled.module.css';

const ORANGE = '#fd6400';
const ORANGE_DARK = '#c65100';
const NAVY = '#22303c';
const CHARCOAL = '#3a474e';
const GREY = '#8a959c';

const STEPS = everydayAssembledJourney.waitStateModules[0]?.steps ?? [];
const POINTS = 12;
const STEP_MS = 780;

type Phase = 'ready' | 'assembling' | 'done';

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function WaitAssembly({ data }: { data: ScenarioRun }) {
  const { plan, run } = data;
  const [phase, setPhase] = useState<Phase>('ready');
  const [step, setStep] = useState(0); // how many steps have taken shape
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = () => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  };

  // A change to the run (a lever moved) returns the scene to rest so it can
  // re-assemble against the new week.
  useEffect(() => {
    clear();
    setPhase('ready');
    setStep(0);
  }, [run.id]);

  useEffect(() => clear, []);

  const assemble = useCallback(() => {
    clear();
    if (prefersReducedMotion()) {
      setStep(STEPS.length);
      setPhase('done');
      return;
    }
    setPhase('assembling');
    setStep(0);
    timer.current = setInterval(() => {
      setStep((s) => {
        const next = s + 1;
        if (next >= STEPS.length) {
          clear();
          setPhase('done');
        }
        return next;
      });
    }, STEP_MS);
  }, []);

  const reset = () => {
    clear();
    setPhase('ready');
    setStep(0);
  };

  const progress = STEPS.length ? Math.min(1, step / STEPS.length) : 1;
  const confidence = phase === 'done' ? 96 : Math.round(progress * 92);
  const points = Math.round(progress * POINTS);
  const itemsShown = phase === 'done' ? plan.basket.length : Math.round(progress * plan.basket.length);

  return (
    <div className={styles.stage}>
      {/* the phone — the customer's surface */}
      <div className={styles.stagePhone}>
        <PhoneFrame width={330} balance={JOURNEY_START_BALANCE}>
          <div style={{ padding: '4px 20px 20px', minHeight: 452, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: 'var(--edr-mono), monospace', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: GREY }}>
              weekly online shop · planning
            </div>

            {phase === 'ready' ? (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', gap: 14 }}>
                  <div style={{ fontFamily: 'var(--edr-mono), monospace', fontSize: 40, fontWeight: 700, color: 'rgba(34,48,60,0.22)' }}>00:00</div>
                  <p style={{ fontSize: 13.5, color: GREY, margin: 0, maxWidth: 210, lineHeight: 1.5 }}>
                    Browsing, adding, searching — and the app returns no assembled value.
                  </p>
                </div>
                <button type="button" onClick={assemble} style={primaryBtn}>
                  Assemble my week
                </button>
                <div style={{ textAlign: 'center', fontSize: 12, color: GREY, marginTop: 8 }}>optional · rewarded · about 40 sec</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ fontFamily: 'var(--edr-display), Georgia, serif', fontWeight: 600, fontSize: 21, color: NAVY, margin: '6px 0 2px', lineHeight: 1.15 }}>
                  {phase === 'done' ? 'Your week, ready to review.' : 'Assembling your week…'}
                </h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '8px 0 12px' }}>
                  <span style={{ fontSize: 26, fontWeight: 700, color: NAVY, fontVariantNumeric: 'tabular-nums' }}>
                    ${plan.estimatedTotalNzd.toFixed(2)}
                  </span>
                  <span style={{ fontSize: 12, color: plan.withinBudget ? GREY : '#bd161c' }}>
                    {plan.budgetCeilingNzd != null ? (plan.withinBudget ? `within your $${plan.budgetCeilingNzd}` : `$${plan.overBudgetByNzd.toFixed(0)} over`) : 'indicative'}
                  </span>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
                  {plan.basket.slice(0, Math.max(1, itemsShown)).map((it) => (
                    <div key={it.sku} className={styles.assemble} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: CHARCOAL, padding: '5px 0', borderBottom: '1px solid rgba(34,48,60,0.06)' }}>
                      <span>{it.quantity}× {it.name}</span>
                      <span style={{ fontVariantNumeric: 'tabular-nums' }}>${it.lineTotalNzd.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {phase === 'done' ? (
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button type="button" style={{ ...primaryBtn, flex: 1, marginTop: 0 }}>Approve</button>
                    <button type="button" style={secondaryBtn}>Edit</button>
                    <button type="button" style={secondaryBtn}>Skip</button>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: GREY, textAlign: 'center', marginTop: 10 }}>nothing is ordered — preparing for your review</div>
                )}
              </div>
            )}
          </div>
        </PhoneFrame>
      </div>

      {/* the work, taking shape beside the phone */}
      <div className={styles.stageWork}>
        {phase === 'ready' ? (
          <div className={styles.assemble}>
            <p style={{ fontSize: 16.5, lineHeight: 1.6, color: CHARCOAL, maxWidth: 420, margin: 0 }}>
              Today this wait returns nothing. Press <strong style={{ color: NAVY }}>assemble</strong> and
              watch it become a prepared shop — you approve before anything is bought.
            </p>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', gap: 28, marginBottom: 22, flexWrap: 'wrap' }}>
              <Meter label="confidence" value={`${confidence}%`} fill={confidence / 100} />
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: ORANGE_DARK, fontVariantNumeric: 'tabular-nums' }}>+{points}</div>
                <div style={{ fontSize: 12, color: GREY, marginTop: 2 }}>points for the wait</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: NAVY, fontVariantNumeric: 'tabular-nums' }}>{Math.min(step, STEPS.length)}/{STEPS.length}</div>
                <div style={{ fontSize: 12, color: GREY, marginTop: 2 }}>steps assembled</div>
              </div>
            </div>

            <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {STEPS.map((s, i) => {
                const state = i < step ? 'done' : i === step && phase === 'assembling' ? 'active' : 'pending';
                return (
                  <li
                    key={s.id}
                    className={state !== 'pending' ? styles.assemble : undefined}
                    style={{
                      display: 'flex',
                      gap: 14,
                      alignItems: 'baseline',
                      padding: '11px 0',
                      borderBottom: '1px solid rgba(34,48,60,0.07)',
                      opacity: state === 'pending' ? 0.32 : 1,
                      transition: 'opacity 300ms ease',
                    }}
                  >
                    <span aria-hidden style={{ color: state === 'done' ? '#2e7d32' : state === 'active' ? ORANGE : 'rgba(34,48,60,0.3)', fontSize: 15, width: 16 }}>
                      {state === 'done' ? '✓' : state === 'active' ? '◐' : '○'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, color: NAVY, fontWeight: state === 'pending' ? 400 : 600 }}>{s.label}</div>
                      <div style={{ fontSize: 13, color: GREY, marginTop: 2 }}>{s.detail}</div>
                    </div>
                    <span style={{ fontFamily: 'var(--edr-mono), monospace', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: GREY }}>{s.agentRoleId}</span>
                  </li>
                );
              })}
            </ol>

            {phase === 'done' ? (
              <div className={styles.assemble} style={{ marginTop: 20, padding: '16px 18px', borderRadius: 14, border: '1px solid rgba(34,48,60,0.12)', background: '#fbfaf7' }}>
                <div style={{ fontFamily: 'var(--edr-mono), monospace', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: ORANGE_DARK, marginBottom: 8 }}>proof</div>
                <p style={{ fontSize: 14.5, lineHeight: 1.55, color: CHARCOAL, margin: 0 }}>
                  {run.verifications.filter((v) => v.status === 'passed').length}/{run.verifications.length} checks passed ·
                  {' '}{[...new Set(run.timeline.map((e) => e.agentId).filter(Boolean))].length} agents acted · run {run.id}
                </p>
                <button type="button" onClick={reset} style={{ ...secondaryBtn, marginTop: 14, width: 'auto', padding: '9px 16px' }}>
                  watch it assemble again
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

function Meter({ label, value, fill }: { label: string; value: string; fill: number }) {
  return (
    <div style={{ minWidth: 150 }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: NAVY, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <div style={{ fontSize: 12, color: GREY, margin: '2px 0 8px' }}>{label}</div>
      <div style={{ height: 4, borderRadius: 2, background: 'rgba(34,48,60,0.1)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.round(fill * 100)}%`, background: ORANGE, transition: 'width 500ms cubic-bezier(0.22,0.61,0.36,1)' }} />
      </div>
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  width: '100%',
  marginTop: 12,
  padding: '13px 16px',
  borderRadius: 14,
  border: 'none',
  background: ORANGE,
  color: '#fff',
  fontWeight: 700,
  fontSize: 15,
  cursor: 'pointer',
};

const secondaryBtn: React.CSSProperties = {
  flex: 1,
  padding: '13px 12px',
  borderRadius: 14,
  border: '1.5px solid rgba(34,48,60,0.16)',
  background: '#fff',
  color: NAVY,
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
};
