'use client';

/**
 * #9 — One genuine live signal. Most of the concept is simulated, but this
 * connects one real source: the current Auckland temperature (Open-Meteo, no
 * key, read-only). It is labelled honestly in three tiers so the real input is
 * never confused with the modelled response:
 *
 *   live signal      — the real measured value
 *   illustrative     — the simulated household context it feeds
 *   assembl response — what the journey would do with it
 *
 * If the live source can't be reached, it says so plainly rather than faking a
 * number — credibility over cleverness.
 */

import { useEffect, useState } from 'react';
import { Eyebrow, DisplayHeading } from '@/components/customers/everyday-rewards/ui';
import styles from '@/app/customers/everyday-rewards/assembled/assembled.module.css';

const NAVY = '#22303c';
const CHARCOAL = '#3a474e';
const GREY = '#8a959c';
const ORANGE = '#fd6400';
const ORANGE_DARK = '#c65100';

// Auckland CBD.
const URL =
  'https://api.open-meteo.com/v1/forecast?latitude=-36.85&longitude=174.76&current=temperature_2m';

type State =
  | { kind: 'loading' }
  | { kind: 'ok'; tempC: number }
  | { kind: 'unavailable' };

export function LiveSignal() {
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    let live = true;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    fetch(URL, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('bad status'))))
      .then((j: { current?: { temperature_2m?: number } }) => {
        const t = j.current?.temperature_2m;
        if (live) {
          if (typeof t === 'number') setState({ kind: 'ok', tempC: Math.round(t) });
          else setState({ kind: 'unavailable' });
        }
      })
      .catch(() => {
        if (live) setState({ kind: 'unavailable' });
      })
      .finally(() => clearTimeout(timer));
    return () => {
      live = false;
      ctrl.abort();
      clearTimeout(timer);
    };
  }, []);

  const cold = state.kind === 'ok' && state.tempC <= 14;
  const response =
    state.kind === 'ok'
      ? cold
        ? 'A cold week nudges the prepared shop toward warm, low-effort dinners — soups, pasta bakes — and a heating-cost note for the household budget.'
        : 'A mild week keeps the prepared shop as planned — lighter dinners, no weather-driven changes.'
      : 'When the live signal is available, the prepared shop leans toward warm or lighter dinners to match the week ahead.';

  return (
    <div>
      <Eyebrow>One live signal · everything else is simulated</Eyebrow>
      <DisplayHeading size={30}>Real weather, feeding a modelled journey</DisplayHeading>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: CHARCOAL, maxWidth: 620, margin: '12px 0 24px' }}>
        One genuine input, clearly separated from the simulated context and the modelled response —
        so you can always tell what is real.
      </p>

      <div className={styles.grid2} style={{ maxWidth: 900, gap: 16 }}>
        <Tier label="live signal" accent>
          <div style={{ fontSize: 13, color: GREY, marginBottom: 6 }}>Auckland temperature</div>
          {state.kind === 'loading' ? (
            <div style={{ fontSize: 22, color: GREY }}>reading…</div>
          ) : state.kind === 'ok' ? (
            <div className={styles.assemble} style={{ fontSize: 40, fontWeight: 700, color: NAVY, fontVariantNumeric: 'tabular-nums' }}>
              {state.tempC}°C
            </div>
          ) : (
            <div style={{ fontSize: 15, color: GREY, lineHeight: 1.5 }}>
              live source unavailable right now — not faking a number.
            </div>
          )}
          <div style={{ fontSize: 11, color: GREY, marginTop: 8 }}>Open-Meteo · read-only · no key</div>
        </Tier>

        <Tier label="illustrative context">
          <div style={{ fontSize: 13, color: GREY, marginBottom: 6 }}>household energy + meals profile</div>
          <p style={{ fontSize: 14.5, lineHeight: 1.55, color: CHARCOAL, margin: 0 }}>
            Simulated for the concept: a Grey Lynn household of four, weekday dinners, heating on in
            the evening.
          </p>
        </Tier>
      </div>

      <div style={{ marginTop: 16, padding: '16px 18px', borderRadius: 14, border: `1.5px solid ${ORANGE}`, background: '#fff', maxWidth: 900 }}>
        <div style={{ fontFamily: 'var(--edr-mono), monospace', fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: ORANGE_DARK, marginBottom: 8 }}>
          assembl response
        </div>
        <p style={{ fontSize: 14.5, lineHeight: 1.6, color: CHARCOAL, margin: 0 }}>{response}</p>
      </div>
    </div>
  );
}

function Tier({ label, children, accent }: { label: string; children: React.ReactNode; accent?: boolean }) {
  return (
    <div style={{ padding: '16px 18px', borderRadius: 14, border: '1px solid rgba(34,48,60,0.12)', background: accent ? '#fbfaf7' : '#fff' }}>
      <div style={{ fontFamily: 'var(--edr-mono), monospace', fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: accent ? ORANGE_DARK : GREY, marginBottom: 10 }}>
        {label}
      </div>
      {children}
    </div>
  );
}
