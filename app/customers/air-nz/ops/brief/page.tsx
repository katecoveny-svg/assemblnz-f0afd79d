import styles from '../ops.module.css';
import { OpsTopbar } from '@/components/customers/air-nz/ops-chrome';
import { CDO_BRIEF, nzd } from '@/lib/customers/air-nz/ops-data';

export default function BriefPage() {
  const b = CDO_BRIEF;
  return (
    <>
      <OpsTopbar eyebrow="Partner Operations" title="CDO daily brief" />
      <div className={styles.content}>
        <p className={styles.lead}>
          The overnight brief for {b.for}. Sponsor performance, upcoming
          campaigns, revenue against forecast, and any compliance flags — one
          screen, first thing.
        </p>

        {/* Headline */}
        <div className={styles.card} style={{ borderLeft: '3px solid #00b0b9' }}>
          <div className={styles.label}>{b.date}</div>
          <div className={styles.title} style={{ fontSize: 22, marginTop: 6 }}>{b.headline}</div>
        </div>

        <div className={`${styles.grid} ${styles.g3}`} style={{ marginTop: 14 }}>
          <div className={styles.card}>
            <div className={styles.label}>Revenue · MTD</div>
            <div className={styles.kpi}>{nzd(b.revenueVsForecast.mtd)}</div>
            <div className={`${styles.delta} ${styles.deltaUp}`} style={{ marginTop: 6 }}>
              +{b.revenueVsForecast.deltaPct.toFixed(1)}% vs forecast {nzd(b.revenueVsForecast.forecast)}
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.label}>Compliance flags</div>
            <div className={styles.kpi} style={{ color: b.complianceFlags.length ? '#e6a200' : '#2e7d5b' }}>
              {b.complianceFlags.length}
            </div>
            <div className={styles.kpiSub}>Open · none blocking live inventory</div>
          </div>
          <div className={styles.card}>
            <div className={styles.label}>Koru reconciliation</div>
            <div className={styles.kpi} style={{ fontSize: 20, color: '#2e7d5b' }}>Balanced</div>
            <div className={styles.kpiSub}>Zero variance overnight</div>
          </div>
        </div>

        <div className={`${styles.grid} ${styles.g2}`} style={{ marginTop: 14 }}>
          <div className={styles.card}>
            <div className={styles.label}>Overnight</div>
            <ul style={{ margin: '10px 0 0', paddingLeft: 18 }}>
              {b.overnight.map((o) => (
                <li key={o} className={styles.muted} style={{ marginBottom: 7 }}>{o}</li>
              ))}
            </ul>
          </div>
          <div className={styles.card}>
            <div className={styles.label}>Upcoming</div>
            <ul style={{ margin: '10px 0 0', paddingLeft: 18 }}>
              {b.upcoming.map((o) => (
                <li key={o} className={styles.muted} style={{ marginBottom: 7 }}>{o}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.card} style={{ marginTop: 14 }}>
          <div className={styles.label}>Compliance flags · detail</div>
          <ul style={{ margin: '10px 0 0', paddingLeft: 18 }}>
            {b.complianceFlags.map((c) => (
              <li key={c} className={styles.muted} style={{ marginBottom: 7 }}>{c}</li>
            ))}
          </ul>
          <div className={styles.notice} style={{ marginTop: 12 }}>{b.loyalty}</div>
        </div>

        <p className={styles.muted} style={{ marginTop: 16 }}>
          Generated <span className={styles.assemblMark}>assembl</span> × Koru ·
          concept · demo pending. In production this brief lands in Jeremy’s inbox
          at 06:00 NZT, built from the overnight sponsor, revenue and compliance
          data — never from individual passenger records.
        </p>
      </div>
    </>
  );
}
