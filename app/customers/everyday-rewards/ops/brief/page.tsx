import styles from '../ops.module.css';
import { OpsTopbar } from '@/components/customers/everyday-rewards/ops-chrome';
import { CDMO_BRIEF, nzd } from '@/lib/customers/everyday-rewards/ops-data';

export default function BriefPage() {
  const b = CDMO_BRIEF;
  return (
    <>
      <OpsTopbar eyebrow="Partner Operations" title="CDMO daily brief" />
      <div className={styles.content}>
        <p className={styles.lead}>
          The overnight brief for {b.for} — {b.date}. Sponsor performance, points
          minted, redemption pulse, and compliance flags in one glance.
        </p>

        <div className={styles.card} style={{ borderLeft: '3px solid #fd6400' }}>
          <div className={styles.label}>Headline</div>
          <div style={{ fontFamily: 'var(--edr-display), Georgia, serif', fontSize: 22, color: '#22303c', marginTop: 6, lineHeight: 1.2 }}>
            {b.headline}
          </div>
        </div>

        <div className={`${styles.grid} ${styles.g3}`} style={{ marginTop: 14 }}>
          <div className={styles.card}>
            <div className={styles.label}>Revenue vs forecast</div>
            <div className={`${styles.kpi} ${styles.orange}`}>+{b.revenueVsForecast.deltaPct.toFixed(1)}%</div>
            <div className={styles.kpiSub}>{nzd(b.revenueVsForecast.mtd)} MTD · forecast {nzd(b.revenueVsForecast.forecast)}</div>
          </div>
          <div className={styles.card}>
            <div className={styles.label}>Loyalty treasury</div>
            <div className={styles.kpiSub} style={{ marginTop: 8 }}>{b.loyalty}</div>
          </div>
          <div className={styles.card}>
            <div className={styles.label}>Open compliance</div>
            <div className={styles.kpi}>{b.complianceFlags.length}</div>
            <div className={styles.kpiSub}>None blocking live inventory</div>
          </div>
        </div>

        <div className={`${styles.grid} ${styles.g2}`} style={{ marginTop: 14 }}>
          <div className={styles.card}>
            <div className={styles.label}>Overnight</div>
            <ul style={{ margin: '10px 0 0', paddingLeft: 18 }}>
              {b.overnight.map((o) => (
                <li key={o} className={styles.muted} style={{ marginBottom: 6 }}>{o}</li>
              ))}
            </ul>
          </div>
          <div className={styles.card}>
            <div className={styles.label}>Coming up</div>
            <ul style={{ margin: '10px 0 0', paddingLeft: 18 }}>
              {b.upcoming.map((u) => (
                <li key={u} className={styles.muted} style={{ marginBottom: 6 }}>{u}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.sectionTitle}>Compliance flags</div>
        <div className={styles.card}>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {b.complianceFlags.map((c) => (
              <li key={c} className={styles.muted} style={{ marginBottom: 6 }}>{c}</li>
            ))}
          </ul>
        </div>

        <p className={styles.muted} style={{ marginTop: 16 }}>
          Concept brief on mocked data — no live Everyday Rewards figures. Prepared
          for a pitch to {b.for}.
        </p>
      </div>
    </>
  );
}
