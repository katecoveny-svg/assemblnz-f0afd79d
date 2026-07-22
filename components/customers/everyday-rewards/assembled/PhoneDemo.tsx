'use client';

/**
 * The "great phone demo" — the whole concept story told inside the Everyday
 * Rewards app, as a five-screen sequence the reader steps through:
 *
 *   home (Double Points Week) → the wait, today → your week, ready to review
 *   → the draft basket → basket ready to review.
 *
 * Every screen reads the SAME `ScenarioRun` as the operations view and the rest
 * of the page (brief addition #3, "one shared run"). The basket, total, budget
 * and household size all come from `data`, so pulling a "change one thing"
 * lever above reassembles the phone too — nothing here is a hand-authored mock.
 *
 * Draft-only by construction: the shop is prepared, never bought. Motion is a
 * quiet settle (design canon §11); disabled under prefers-reduced-motion.
 */

import { useState } from 'react';
import type { ScenarioRun } from '@/lib/concepts/woolworths-assembled';
import { PhoneFrame } from '@/components/customers/everyday-rewards/PhoneFrame';
import { PHONE_DEMO_COPY as C } from '@/lib/concepts/everyday-rewards-copy';
import { JOURNEY_START_BALANCE, EDR_TENANT } from '@/lib/customers/everyday-rewards/config';
import styles from '@/app/customers/everyday-rewards/assembled/assembled.module.css';

const ORANGE = '#fd6400';
const ORANGE_DARK = '#c65100';
const ORANGE_LIGHT = '#ffe6d1';
const NAVY = '#22303c';
const CHARCOAL = '#3a474e';
const GREY = '#8a959c';

const SCREENS = ['home', 'wait', 'prompt', 'basket', 'review'] as const;
type Screen = (typeof SCREENS)[number];
const SCREEN_LABEL: Record<Screen, string> = {
  home: 'home',
  wait: 'the wait',
  prompt: 'your week',
  basket: 'draft basket',
  review: 'ready to review',
};

/** People in the household for this run (base 2 adults + 5 teens + guests). */
function peopleFor(data: ScenarioRun): number {
  return 2 + 5 + data.scenario.extraGuests;
}

export function PhoneDemo({ data }: { data: ScenarioRun }) {
  const [i, setI] = useState(0);
  const screen = SCREENS[i];
  const atEnd = i === SCREENS.length - 1;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <PhoneFrame width={360} balance={JOURNEY_START_BALANCE}>
          <div key={screen} className={styles.assemble} style={{ padding: '6px 20px 22px', minHeight: 470 }}>
            {screen === 'home' && <HomeScreen data={data} />}
            {screen === 'wait' && <WaitScreen />}
            {screen === 'prompt' && <PromptScreen data={data} onShow={() => setI(SCREENS.indexOf('basket'))} />}
            {screen === 'basket' && <BasketScreen data={data} />}
            {screen === 'review' && <ReviewScreen data={data} />}
          </div>
        </PhoneFrame>
      </div>

      {/* Stepper — quiet, editorial; the reader drives the story. */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 18 }}>
        <button
          type="button"
          className={styles.chip}
          onClick={() => setI((n) => Math.max(0, n - 1))}
          disabled={i === 0}
          style={{ opacity: i === 0 ? 0.4 : 1, padding: '8px 14px' }}
          aria-label="Previous screen"
        >
          ←
        </button>
        <div role="tablist" aria-label="Phone screens" style={{ display: 'flex', gap: 7 }}>
          {SCREENS.map((s, n) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={n === i}
              aria-label={SCREEN_LABEL[s]}
              onClick={() => setI(n)}
              style={{
                width: n === i ? 24 : 9,
                height: 9,
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                background: n === i ? ORANGE : 'rgba(34,48,60,0.18)',
                transition: 'width 200ms ease, background 200ms ease',
              }}
            />
          ))}
        </div>
        <button
          type="button"
          className={styles.chip}
          data-active={!atEnd}
          onClick={() => setI((n) => Math.min(SCREENS.length - 1, n + 1))}
          disabled={atEnd}
          style={{ opacity: atEnd ? 0.4 : 1, padding: '8px 14px' }}
          aria-label="Next screen"
        >
          →
        </button>
      </div>
      <div style={{ textAlign: 'center', fontSize: 11.5, color: GREY, marginTop: 10 }}>
        {SCREEN_LABEL[screen]} · {i + 1} / {SCREENS.length}
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: 'var(--edr-mono), monospace', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: GREY }}>
      {children}
    </div>
  );
}

function HomeScreen({ data }: { data: ScenarioRun }) {
  const s = C.screens.home;
  const toReward = Math.max(0, EDR_TENANT.voucherThreshold - (JOURNEY_START_BALANCE % EDR_TENANT.voucherThreshold));
  return (
    <div>
      <Tag>{s.tag}</Tag>
      <h3 style={{ fontFamily: 'var(--edr-display), Georgia, serif', fontWeight: 600, fontSize: 24, color: NAVY, margin: '8px 0 2px' }}>
        {s.greeting} 🤗
      </h3>
      <p style={{ fontSize: 12.5, color: GREY, margin: '0 0 16px' }}>
        {toReward.toLocaleString('en-NZ')} {s.toReward}
      </p>

      <div style={{ background: NAVY, color: '#fff', borderRadius: 16, padding: '16px 18px', marginBottom: 14 }}>
        <div style={{ fontFamily: 'var(--edr-mono), monospace', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: ORANGE_LIGHT }}>
          {s.hookDates}
        </div>
        <div style={{ fontFamily: 'var(--edr-display), Georgia, serif', fontSize: 22, fontWeight: 600, marginTop: 4 }}>
          {s.hook}
        </div>
      </div>

      <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: GREY, marginBottom: 8 }}>
        {s.boosts}
      </div>
      {['Frooze Balls · limit 3', 'Puhoi milk 2L', 'Barilla range'].map((b, n) => (
        <div key={b} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderTop: n === 0 ? 'none' : '1px solid rgba(34,48,60,0.07)' }}>
          <span style={{ fontSize: 13.5, color: CHARCOAL }}>{b}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: ORANGE_DARK }}>+120 pts</span>
        </div>
      ))}
    </div>
  );
}

function WaitScreen() {
  const s = C.screens.wait;
  return (
    <div>
      <Tag>{s.tag}</Tag>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 380, textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--edr-mono), monospace', fontSize: 44, fontWeight: 700, color: 'rgba(34,48,60,0.25)', letterSpacing: '0.04em' }}>
          00:00
        </div>
        <p style={{ fontSize: 14, color: GREY, margin: '14px 0 0', maxWidth: 220 }}>{s.state}</p>
        <div style={{ marginTop: 26, padding: '10px 16px', borderRadius: 999, border: '1px dashed rgba(34,48,60,0.2)', fontFamily: 'var(--edr-mono), monospace', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: GREY }}>
          {s.nothing}
        </div>
        <p style={{ fontSize: 12.5, color: GREY, margin: '22px 0 0', fontStyle: 'italic' }}>{s.ends}</p>
      </div>
    </div>
  );
}

function PromptScreen({ data, onShow }: { data: ScenarioRun; onShow: () => void }) {
  const s = C.screens.prompt;
  const people = peopleFor(data);
  const dietary = data.scenario.glutenFree ? 2 : 1;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 440 }}>
      <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 8, padding: '5px 12px', borderRadius: 999, background: ORANGE_LIGHT, color: ORANGE_DARK, fontSize: 11.5, fontWeight: 700, marginBottom: 18 }}>
        {s.badge} · +12 pts
      </div>
      <h3 style={{ fontFamily: 'var(--edr-display), Georgia, serif', fontWeight: 600, fontSize: 26, color: NAVY, margin: '0 0 12px', lineHeight: 1.15 }}>
        {s.title}
      </h3>
      <p style={{ fontSize: 14.5, lineHeight: 1.6, color: CHARCOAL, margin: 0 }}>{s.body}</p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '18px 0 0' }}>
        {[`${people} people`, '3 preferred brands', `${dietary} dietary`].map((chip) => (
          <span key={chip} style={{ fontSize: 12, padding: '5px 11px', borderRadius: 999, border: '1px solid rgba(34,48,60,0.14)', color: CHARCOAL }}>
            {chip}
          </span>
        ))}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 24 }}>
        <button
          type="button"
          onClick={onShow}
          style={{ width: '100%', padding: '13px 16px', borderRadius: 14, border: 'none', background: ORANGE, color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
        >
          {s.cta}
        </button>
        <div style={{ textAlign: 'center', fontSize: 11, color: GREY, marginTop: 8 }}>{s.foot}</div>
      </div>
    </div>
  );
}

function BasketScreen({ data }: { data: ScenarioRun }) {
  const s = C.screens.basket;
  const { plan } = data;
  const overBudget = !plan.withinBudget;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Tag>{s.tag}</Tag>
        <span style={{ fontFamily: 'var(--edr-mono), monospace', fontSize: 10, color: GREY }}>32 {s.returned}</span>
      </div>
      <div style={{ maxHeight: 300, overflowY: 'auto', margin: '12px 0 0', paddingRight: 4 }}>
        {plan.basket.slice(0, 12).map((it) => (
          <div key={it.sku} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: CHARCOAL, padding: '7px 0', borderBottom: '1px solid rgba(34,48,60,0.06)' }}>
            <span>
              {it.quantity}× {it.name}
              {!it.available ? <em style={{ color: '#bd161c' }}> · was out of stock</em> : null}
            </span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>${it.lineTotalNzd.toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 14, paddingTop: 12, borderTop: '2px solid rgba(34,48,60,0.12)' }}>
        <span style={{ fontSize: 12.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: GREY }}>{s.totalLabel}</span>
        <span style={{ fontSize: 26, fontWeight: 700, color: NAVY, fontVariantNumeric: 'tabular-nums' }}>
          ${plan.estimatedTotalNzd.toFixed(2)}
        </span>
      </div>
      <div style={{ fontSize: 12, color: overBudget ? '#bd161c' : GREY, textAlign: 'right', marginTop: 4 }}>
        {plan.budgetCeilingNzd != null
          ? overBudget
            ? `$${plan.overBudgetByNzd.toFixed(0)} over your $${plan.budgetCeilingNzd}`
            : `within your $${plan.budgetCeilingNzd}`
          : 'indicative total'}
      </div>
    </div>
  );
}

function ReviewScreen({ data }: { data: ScenarioRun }) {
  const s = C.screens.review;
  const { plan } = data;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 440 }}>
      <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 8, padding: '5px 12px', borderRadius: 999, background: ORANGE_LIGHT, color: ORANGE_DARK, fontSize: 11, fontWeight: 700, marginBottom: 18 }}>
        {s.badge}
      </div>
      <h3 style={{ fontFamily: 'var(--edr-display), Georgia, serif', fontWeight: 600, fontSize: 26, color: NAVY, margin: '0 0 10px', lineHeight: 1.15 }}>
        {s.title}
      </h3>
      <p style={{ fontSize: 14.5, lineHeight: 1.6, color: CHARCOAL, margin: 0 }}>{s.body}</p>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '20px 0 0' }}>
        <span style={{ fontSize: 34, fontWeight: 700, color: NAVY, fontVariantNumeric: 'tabular-nums' }}>
          ${plan.estimatedTotalNzd.toFixed(2)}
        </span>
        <span style={{ fontSize: 13, color: GREY }}>{plan.basket.length} items</span>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 'auto', paddingTop: 24 }}>
        <button type="button" style={{ flex: 1, padding: '13px 12px', borderRadius: 14, border: 'none', background: ORANGE, color: '#fff', fontWeight: 700, fontSize: 14.5, cursor: 'pointer' }}>
          Approve
        </button>
        <button type="button" style={{ flex: 1, padding: '13px 12px', borderRadius: 14, border: '1.5px solid rgba(34,48,60,0.16)', background: '#fff', color: NAVY, fontWeight: 700, fontSize: 14.5, cursor: 'pointer' }}>
          Edit
        </button>
        <button type="button" style={{ flex: 1, padding: '13px 12px', borderRadius: 14, border: '1.5px solid rgba(34,48,60,0.16)', background: '#fff', color: GREY, fontWeight: 700, fontSize: 14.5, cursor: 'pointer' }}>
          Skip
        </button>
      </div>
      <div style={{ textAlign: 'center', fontSize: 11, color: GREY, marginTop: 10 }}>
        nothing is ordered until you approve
      </div>
    </div>
  );
}
