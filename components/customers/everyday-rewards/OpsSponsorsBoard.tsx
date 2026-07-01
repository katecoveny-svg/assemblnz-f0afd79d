'use client';

import { useState } from 'react';
import styles from '@/app/customers/everyday-rewards/ops/ops.module.css';
import {
  SPONSORS,
  SPONSOR_TIERS,
  nzd,
  type Sponsor,
} from '@/lib/customers/everyday-rewards/ops-data';

const STATUS_BADGE: Record<Sponsor['status'], string> = {
  live: styles.bLive,
  onboarding: styles.bOnboard,
  paused: styles.bPaused,
  review: styles.bReview,
};

const FILTERS = ['all', 'live', 'onboarding', 'review'] as const;

export function OpsSponsorsBoard() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all');
  const rows = SPONSORS.filter((s) => filter === 'all' || s.status === filter);

  return (
    <>
      <div className={styles.tabs}>
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`${styles.tab} ${filter === f ? styles.on : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All sponsors' : f[0].toUpperCase() + f.slice(1)}
            {' '}
            ({f === 'all' ? SPONSORS.length : SPONSORS.filter((s) => s.status === f).length})
          </button>
        ))}
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Sponsor</th>
              <th>Category</th>
              <th>Tier</th>
              <th>Status</th>
              <th className={styles.num}>Budget</th>
              <th className={styles.num}>Spent</th>
              <th className={styles.num}>Creative</th>
              <th>Window</th>
              <th>Account</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => {
              const tier = SPONSOR_TIERS[s.tier];
              return (
                <tr key={s.id}>
                  <td style={{ fontWeight: 700 }}>{s.name}</td>
                  <td>{s.category}</td>
                  <td>
                    <span className={styles.tier}>
                      <span className={styles.tierDot} style={{ background: tier.colour }} />
                      {tier.label}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${STATUS_BADGE[s.status]}`}>{s.status}</span>
                  </td>
                  <td className={styles.num}>{nzd(s.monthlyBudget)}</td>
                  <td className={styles.num}>{nzd(s.spentThisMonth)}</td>
                  <td className={styles.num}>
                    {s.creativeApproved}/{s.creativeAssets}
                  </td>
                  <td style={{ fontSize: 12 }}>
                    {s.windowStart.slice(5)} → {s.windowEnd.slice(5)}
                  </td>
                  <td style={{ fontSize: 12 }}>{s.accountManager}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className={styles.muted} style={{ marginTop: 10 }}>
        ASB precedent: banking category exclusivity held at platinum. Creative
        counts show approved / submitted — nothing goes live until Fair Trading +
        ASA review passes. Concept demo · mocked figures.
      </p>
    </>
  );
}
