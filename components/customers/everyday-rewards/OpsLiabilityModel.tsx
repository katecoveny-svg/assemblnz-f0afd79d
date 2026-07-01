'use client';

import { useState } from 'react';
import styles from '@/app/customers/everyday-rewards/ops/ops.module.css';
import { LIABILITY, liabilityModel, nzd, pts } from '@/lib/customers/everyday-rewards/ops-data';

export function OpsLiabilityModel() {
  const [breakage, setBreakage] = useState(LIABILITY.breakageRate);
  const m = liabilityModel(LIABILITY.outstandingPoints, breakage);

  return (
    <div className={styles.card}>
      <div className={styles.label}>◊ redemption forecast · adjust breakage</div>
      <div className={styles.rangeRow} style={{ marginTop: 12 }}>
        <span>Expected breakage (points never redeemed)</span>
        <span className={styles.rangeVal}>{(breakage * 100).toFixed(0)}%</span>
      </div>
      <input
        className={styles.range}
        type="range"
        min={0.05}
        max={0.3}
        step={0.01}
        value={breakage}
        onChange={(e) => setBreakage(Number(e.target.value))}
      />
      <div className={`${styles.grid} ${styles.g3}`} style={{ marginTop: 16 }}>
        <div>
          <div className={styles.label}>Outstanding points</div>
          <div className={styles.kpi}>{pts(LIABILITY.outstandingPoints)}</div>
          <div className={styles.kpiSub}>Across the member base</div>
        </div>
        <div>
          <div className={styles.label}>Forecast liability</div>
          <div className={`${styles.kpi} ${styles.orange}`}>{nzd(m.liabilityNzd)}</div>
          <div className={styles.kpiSub}>{pts(m.expectedRedeem)} expected to redeem</div>
        </div>
        <div>
          <div className={styles.label}>Breakage gain</div>
          <div className={styles.kpi}>{nzd(m.breakageGainNzd)}</div>
          <div className={styles.kpiSub}>Never-redeemed value</div>
        </div>
      </div>
      <p className={styles.muted} style={{ marginTop: 14 }}>
        Liability valued at 2,000 points = $15 ($0.0075/pt). Concept model on
        mocked balances — not Everyday Rewards treasury data.
      </p>
    </div>
  );
}
