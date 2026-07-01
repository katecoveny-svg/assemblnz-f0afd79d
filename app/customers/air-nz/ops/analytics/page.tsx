import styles from '../ops.module.css';
import { OpsTopbar } from '@/components/customers/air-nz/ops-chrome';
import {
  ROUTE_PERFORMANCE,
  TIME_OF_DAY,
  BOOKING_CLASS,
  SEGMENT_NOTE,
  apd,
} from '@/lib/customers/air-nz/ops-data';

export default function AnalyticsPage() {
  const maxIdx = Math.max(...TIME_OF_DAY.map((t) => t.index));
  return (
    <>
      <OpsTopbar eyebrow="Partner Operations" title="Segment analytics" />
      <div className={styles.content}>
        <p className={styles.lead}>
          Which routes, times and booking classes convert best — so inventory can
          be priced and campaigns targeted well. Everything here is aggregate.
        </p>

        <div className={styles.notice} style={{ marginBottom: 18 }}>
          <strong>Privacy by construction.</strong> {SEGMENT_NOTE}
        </div>

        {/* Routes */}
        <div className={styles.card} style={{ padding: 6 }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Route</th>
                <th className={styles.num}>Opt-in</th>
                <th className={styles.num}>Engagement</th>
                <th className={styles.num}>A$ / passenger</th>
                <th className={styles.num}>Fill</th>
              </tr>
            </thead>
            <tbody>
              {[...ROUTE_PERFORMANCE].sort((a, b) => b.apdPerPax - a.apdPerPax).map((r) => (
                <tr key={r.route}>
                  <td style={{ fontWeight: 600 }}>{r.route}</td>
                  <td className={styles.num}>{Math.round(r.optIn * 100)}%</td>
                  <td className={styles.num}>{(r.ctr * 100).toFixed(1)}%</td>
                  <td className={styles.num} style={{ color: '#00b0b9', fontWeight: 600 }}>{apd(r.apdPerPax)}</td>
                  <td className={styles.num}>{Math.round(r.fill * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={`${styles.grid} ${styles.g2}`} style={{ marginTop: 14 }}>
          {/* Time of day */}
          <div className={styles.card}>
            <div className={styles.label} style={{ marginBottom: 8 }}>Engagement index by time of day</div>
            <div className={styles.barChart}>
              {TIME_OF_DAY.map((t) => (
                <div key={t.band} className={styles.barCol}>
                  <span className={styles.barColVal}>{t.index}</span>
                  <div className={styles.barColFill} style={{ height: `${(t.index / maxIdx) * 100}%` }} />
                  <span className={styles.barColLabel} style={{ textAlign: 'center' }}>{t.band.split(' ')[0]}</span>
                </div>
              ))}
            </div>
            <p className={styles.muted} style={{ marginTop: 12 }}>
              Index vs 100 = average. Early and evening banks over-index — the
              dead-time at the gate is longest then.
            </p>
          </div>

          {/* Booking class */}
          <div className={styles.card}>
            <div className={styles.label} style={{ marginBottom: 8 }}>Opt-in by booking class</div>
            {BOOKING_CLASS.map((b) => (
              <div key={b.cls} style={{ margin: '12px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>{b.cls}</span>
                  <span style={{ color: '#00b0b9', fontWeight: 600 }}>{Math.round(b.optIn * 100)}%</span>
                </div>
                <div className={styles.bar} style={{ marginTop: 5 }}>
                  <div className={styles.barFill} style={{ width: `${b.optIn * 100 * 2}%` }} />
                </div>
                <div className={styles.ledgerNote} style={{ marginTop: 3 }}>{b.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
