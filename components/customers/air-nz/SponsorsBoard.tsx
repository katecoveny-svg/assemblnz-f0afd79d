'use client';

import { Fragment, useState } from 'react';
import styles from '@/app/customers/air-nz/ops/ops.module.css';
import {
  SPONSORS,
  SPONSOR_TIERS,
  campaignsForSponsor,
  nzd,
  type SponsorTier,
} from '@/lib/customers/air-nz/ops-data';

const STATUS_BADGE: Record<string, string> = {
  live: styles.bLive,
  onboarding: styles.bOnboard,
  paused: styles.bPaused,
  review: styles.bReview,
};

function TierPill({ tier }: { tier: SponsorTier }) {
  const t = SPONSOR_TIERS[tier];
  return (
    <span className={styles.tier}>
      <span className={styles.tierDot} style={{ background: t.colour }} />
      {t.label}
    </span>
  );
}

export function SponsorsBoard() {
  const [filter, setFilter] = useState<'all' | SponsorTier>('all');
  const [open, setOpen] = useState<string>('bnz');

  const shown = SPONSORS.filter((s) => filter === 'all' || s.tier === filter);

  return (
    <>
      {/* Tier reference */}
      <div className={`${styles.grid} ${styles.g3}`}>
        {(Object.keys(SPONSOR_TIERS) as SponsorTier[]).map((k) => {
          const t = SPONSOR_TIERS[k];
          const count = SPONSORS.filter((s) => s.tier === k).length;
          return (
            <div className={styles.card} key={k}>
              <div className={styles.cardHead}>
                <TierPill tier={k} />
                <span className={styles.label}>{count} sponsor{count === 1 ? '' : 's'}</span>
              </div>
              <div className={styles.label}>CPM floor</div>
              <div className={styles.kpi} style={{ fontSize: 24 }}>NZ${t.cpmFloor}</div>
              <div className={styles.kpiSub}>{t.attribution}</div>
              <div className={styles.muted} style={{ marginTop: 8 }}>{t.waitStates}</div>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className={styles.tabs} style={{ marginTop: 20 }}>
        {(['all', 'platinum', 'gold', 'silver'] as const).map((f) => (
          <button
            key={f}
            className={`${styles.tab} ${filter === f ? styles.on : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All tiers' : SPONSOR_TIERS[f].label}
          </button>
        ))}
      </div>

      {/* Sponsor table */}
      <div className={styles.card} style={{ padding: 6 }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Sponsor</th>
              <th>Tier</th>
              <th>Status</th>
              <th className={styles.num}>Budget (mo)</th>
              <th className={styles.num}>Spent</th>
              <th>Creative</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {shown.map((s) => {
              const pct = s.monthlyBudget ? Math.min(1, s.spentThisMonth / s.monthlyBudget) : 0;
              const isOpen = open === s.id;
              return (
                <Fragment key={s.id}>
                  <tr>
                    <td style={{ fontWeight: 600 }}>{s.name}<div className={styles.ledgerNote}>{s.category}</div></td>
                    <td><TierPill tier={s.tier} /></td>
                    <td><span className={`${styles.badge} ${STATUS_BADGE[s.status]}`}>{s.status}</span></td>
                    <td className={styles.num}>{nzd(s.monthlyBudget)}</td>
                    <td className={styles.num}>
                      {nzd(s.spentThisMonth)}
                      <div className={styles.bar} style={{ marginTop: 5, width: 90, marginLeft: 'auto' }}>
                        <div className={styles.barFill} style={{ width: `${pct * 100}%` }} />
                      </div>
                    </td>
                    <td>
                      {s.creativeApproved}/{s.creativeAssets} approved
                    </td>
                    <td className={styles.num}>
                      <button className={styles.tab} style={{ padding: '5px 10px' }} onClick={() => setOpen(isOpen ? '' : s.id)}>
                        {isOpen ? 'Hide' : 'Manage'}
                      </button>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr>
                      <td colSpan={7} style={{ background: 'var(--anz-cool)' }}>
                        <div className={`${styles.grid} ${styles.g2}`} style={{ padding: '4px 0' }}>
                          <div>
                            <div className={styles.label}>Onboarding & assets</div>
                            <div className={styles.muted} style={{ marginTop: 6 }}>
                              Account manager: {s.accountManager}<br />
                              Campaign window: {s.windowStart} → {s.windowEnd}<br />
                              Creative: {s.creativeApproved} of {s.creativeAssets} approved
                              {s.creativeApproved < s.creativeAssets ? ' · pending Fair Trading review' : ' · all cleared'}
                            </div>
                            <div className={styles.label} style={{ marginTop: 10 }}>Targeting</div>
                            <div className={styles.muted} style={{ marginTop: 4 }}>{s.targeting}</div>
                          </div>
                          <div>
                            <div className={styles.label}>Tier attribution</div>
                            <div className={styles.muted} style={{ marginTop: 6 }}>
                              {SPONSOR_TIERS[s.tier].attribution} · {SPONSOR_TIERS[s.tier].waitStates}
                            </div>
                            <div className={styles.label} style={{ marginTop: 10 }}>Perks</div>
                            <ul style={{ margin: '4px 0 0', paddingLeft: 16 }}>
                              {SPONSOR_TIERS[s.tier].perks.map((p) => (
                                <li key={p} className={styles.muted}>{p}</li>
                              ))}
                            </ul>
                            <div className={styles.label} style={{ marginTop: 10 }}>Active campaigns</div>
                            <div className={styles.muted} style={{ marginTop: 4 }}>
                              {campaignsForSponsor(s.id).map((c) => `${c.waitLabel} · ${c.route}`).join(' · ') || 'None yet'}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
