'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LEDGER, SETTINGS, WEEKLY_TREND, nzd } from '@/lib/customers/contact-energy/data';
import styles from '@/app/customers/contact-energy/contact.module.css';

/**
 * The Assembling credit ledger — balance, weekly trend, all 47 fictional
 * transactions, and the consent controls (pause / categories / block).
 * Everything labelled demo; no real credits exist.
 */

export function TrendChart() {
  const W = 520;
  const H = 120;
  const max = Math.max(...WEEKLY_TREND.map((w) => w.earned));
  const step = W / (WEEKLY_TREND.length - 1);
  const pts = WEEKLY_TREND.map((w, i) => `${i * step},${H - (w.earned / max) * (H - 16)}`).join(' ');

  return (
    <figure className={styles.trendFigure}>
      <svg viewBox={`-8 -8 ${W + 16} ${H + 34}`} className={styles.trendSvg} role="img" aria-label="Eight weeks of demo Assembling credits">
        <polyline points={pts} className={styles.trendLine} fill="none" />
        {WEEKLY_TREND.map((w, i) => {
          const x = i * step;
          const y = H - (w.earned / max) * (H - 16);
          return (
            <g key={w.week}>
              <circle cx={x} cy={y} r={3.4} className={styles.trendDot} />
              <text x={x} y={H + 20} textAnchor="middle" className={styles.usageLabel}>
                {w.week}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className={styles.usageCaption}>
        weekly credits earned <span className={styles.usageDemoTag}>(demo)</span>
      </figcaption>
    </figure>
  );
}

export function LedgerTable() {
  const [showAll, setShowAll] = useState(false);
  const rows = showAll ? LEDGER : LEDGER.slice(0, 12);

  return (
    <div className={styles.ledgerWrap}>
      <table className={styles.ledgerTable}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Loading moment</th>
            <th>Partner</th>
            <th className={styles.tdNum}>Watched</th>
            <th className={styles.tdNum}>Credit</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((e) => (
            <tr key={e.id}>
              <td>{e.date}</td>
              <td>{e.context}</td>
              <td>{e.partner}</td>
              <td className={styles.tdNum}>{e.seconds}s</td>
              <td className={`${styles.tdNum} ${styles.tdGold}`}>+{nzd(e.credit)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!showAll && (
        <button type="button" className={styles.ghostBtn} onClick={() => setShowAll(true)}>
          Show all {LEDGER.length} entries
        </button>
      )}
    </div>
  );
}

export function SettingsPanel() {
  const [paused, setPaused] = useState(false);
  return (
    <div className={styles.settingsPanel}>
      {SETTINGS.map((s) => {
        const isPause = s.key === 'pause';
        const on = isPause ? paused : s.enabled;
        return (
          <div key={s.key} className={styles.settingRow}>
            <div>
              <div className={styles.settingLabel}>{s.label}</div>
              <div className={styles.settingDetail}>{s.detail}</div>
            </div>
            <button
              type="button"
              className={`${styles.toggle} ${on ? styles.toggleOn : ''}`}
              aria-pressed={on}
              aria-label={s.label}
              onClick={() => (isPause ? setPaused((p) => !p) : undefined)}
            >
              <span className={styles.toggleKnob} />
            </button>
          </div>
        );
      })}
      {paused && (
        <p className={styles.settingPausedNote}>
          Assembling paused — loading moments show plain spinners and nothing is earned. (Demo toggle.)
        </p>
      )}
      <p className={styles.settingFine}>
        Consent model: opt-in at signup, one-tap pause, per-category and per-partner blocks. In a live
        deployment every offer is reviewed by Contact Energy before it can appear.{' '}
        <Link href="/customers/contact-energy" className={styles.inlineLink}>
          Back to the demo home
        </Link>
      </p>
    </div>
  );
}
