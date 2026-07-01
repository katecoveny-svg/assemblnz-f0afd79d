'use client';

/**
 * Live-adjustable unit-economics calculator. Inputs from the pitch's 05-economics
 * model (public Air NZ figures + assembl canon). Drag the sliders → Y1 gross,
 * Koru treasury share, and Airpoints Dollars to members recompute live. The Y3
 * all-wait-states model is shown for context. Figures are the pitch model — a
 * demo, not Air NZ actuals.
 */

import { useState } from 'react';
import {
  ECONOMICS_INPUTS,
  computeEconomics,
  Y3_WAIT_STATES,
  Y3_TOTAL_GROSS,
  nzd,
} from '@/lib/customers/air-nz/data';
import styles from '@/app/customers/air-nz/dash/airnz.module.css';

export function EconomicsCalculator() {
  const [optIn, setOptIn] = useState<number>(ECONOMICS_INPUTS.optInRate);
  const [units, setUnits] = useState<number>(ECONOMICS_INPUTS.unitsPerPax);
  const [fill, setFill] = useState<number>(ECONOMICS_INPUTS.fillRate);
  const [cpm, setCpm] = useState<number>(ECONOMICS_INPUTS.baseCpm);

  const r = computeEconomics({
    ...ECONOMICS_INPUTS,
    optInRate: optIn,
    unitsPerPax: units,
    fillRate: fill,
    baseCpm: cpm,
  });

  return (
    <div className={styles.body}>
      {/* Headline outputs */}
      <div className={styles.card}>
        <div className={styles.statLabel}>Year 1 · domestic gate · gross revenue</div>
        <div className={styles.bigStat}>{nzd(r.gross)}</div>
        <div className={styles.ecoGrid} style={{ marginTop: 14 }}>
          <div className={`${styles.card} ${styles.nested}`} style={{ margin: 0 }}>
            <div className={styles.statLabel}>Koru treasury (55%)</div>
            <div className={styles.cardTitle} style={{ fontSize: 20, marginTop: 4 }}>
              {nzd(r.treasury)}
            </div>
          </div>
          <div className={`${styles.card} ${styles.nested}`} style={{ margin: 0 }}>
            <div className={styles.statLabel}>Airpoints$ to members</div>
            <div
              className={styles.cardTitle}
              style={{ fontSize: 20, marginTop: 4, color: '#00b0b9' }}
            >
              {nzd(r.toMembers)}
            </div>
          </div>
          <div className={`${styles.card} ${styles.nested}`} style={{ margin: 0 }}>
            <div className={styles.statLabel}>Koru retained margin</div>
            <div className={styles.cardTitle} style={{ fontSize: 18, marginTop: 4 }}>
              {nzd(r.koruRetained)}
            </div>
          </div>
          <div className={`${styles.card} ${styles.nested}`} style={{ margin: 0 }}>
            <div className={styles.statLabel}>assembl share (45%)</div>
            <div className={styles.cardTitle} style={{ fontSize: 18, marginTop: 4 }}>
              {nzd(r.assemblShare)}
            </div>
          </div>
        </div>
      </div>

      {/* Sliders */}
      <div className={styles.card}>
        <div className={styles.statLabel} style={{ marginBottom: 6 }}>
          Adjust the assumptions
        </div>

        <Slider
          label="Opt-in rate"
          value={optIn}
          min={0.15}
          max={0.6}
          step={0.01}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={setOptIn}
        />
        <Slider
          label="Attention units / passenger"
          value={units}
          min={0.8}
          max={2.5}
          step={0.1}
          format={(v) => v.toFixed(1)}
          onChange={setUnits}
        />
        <Slider
          label="Fill rate"
          value={fill}
          min={0.4}
          max={0.95}
          step={0.01}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={setFill}
        />
        <Slider
          label="Effective CPM"
          value={cpm}
          min={25}
          max={65}
          step={1}
          format={(v) => `NZ$${v}`}
          onChange={setCpm}
        />

        <p className={styles.cardMeta} style={{ marginTop: 10 }}>
          Reached at gate: {Math.round(r.reached).toLocaleString('en-NZ')} · opt-in{' '}
          {Math.round(r.optIn).toLocaleString('en-NZ')} · paid units{' '}
          {Math.round(r.paidUnits).toLocaleString('en-NZ')}
        </p>
      </div>

      {/* Y3 model */}
      <div className={styles.card}>
        <div className={styles.statLabel}>Year 3 · all four wait states, both fleets</div>
        {Y3_WAIT_STATES.map((w) => (
          <div key={w.name} className={styles.receiptRow} style={{ paddingLeft: 0, paddingRight: 0 }}>
            <span>
              {w.name}{' '}
              <span style={{ color: '#6b6e71' }}>· {w.units} units · CPM NZ${w.cpm}</span>
            </span>
            <span style={{ fontWeight: 600 }}>{nzd(w.gross)}</span>
          </div>
        ))}
        <div className={styles.receiptTotal} style={{ marginTop: 4, borderRadius: 8 }}>
          <span>Total Y3 gross</span>
          <span>{nzd(Y3_TOTAL_GROSS)}</span>
        </div>
        <p className={styles.cardMeta} style={{ marginTop: 10 }}>
          Roughly 7× Year 1. Nothing here is a hockey stick — the numbers are
          boring on purpose. Figures are the pitch model (05-economics.xlsx), not
          Air NZ actuals.
        </p>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div className={styles.field}>
      <label>
        {label} <span>{format(value)}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
      />
    </div>
  );
}
