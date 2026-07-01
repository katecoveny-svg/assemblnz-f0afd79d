import styles from '../ops.module.css';
import { OpsTopbar } from '@/components/customers/everyday-rewards/ops-chrome';
import { SEGMENTS, EARN_BY_MOMENT, SEGMENT_NOTE, pct } from '@/lib/customers/everyday-rewards/ops-data';

export default function AnalyticsPage() {
  const maxPts = Math.max(...EARN_BY_MOMENT.map((m) => m.pts));
  return (
    <>
      <OpsTopbar eyebrow="Partner Operations" title="Segment analytics" />
      <div className={styles.content}>
        <div className={styles.notice} style={{ marginBottom: 18 }}>
          {SEGMENT_NOTE}
        </div>

        <div className={styles.sectionTitle}>Earn rate + redemption by shopper cluster</div>
        <div className={styles.card}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Cluster</th>
                <th className={styles.num}>Share of base</th>
                <th className={styles.num}>Earn rate / wk</th>
                <th className={styles.num}>Opt-in</th>
                <th className={styles.num}>→ Voucher</th>
                <th className={styles.num}>→ Travel</th>
              </tr>
            </thead>
            <tbody>
              {SEGMENTS.map((s) => (
                <tr key={s.cluster}>
                  <td style={{ fontWeight: 700 }}>{s.cluster}</td>
                  <td className={styles.num}>{pct(s.share)}</td>
                  <td className={styles.num}>{s.earnRatePtsWk} pts</td>
                  <td className={styles.num}>{pct(s.optIn)}</td>
                  <td className={styles.num}>{pct(s.voucherConv)}</td>
                  <td className={styles.num}>{pct(s.travelConv)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.sectionTitle}>Points earned per wait moment</div>
        <div className={styles.card}>
          <div className={styles.barChart}>
            {EARN_BY_MOMENT.map((m) => (
              <div className={styles.barCol} key={m.moment}>
                <span className={styles.barColVal}>{m.pts}</span>
                <div className={styles.barColFill} style={{ height: `${(m.pts / maxPts) * 100}%` }} />
                <span className={styles.barColLabel}>{m.moment}</span>
              </div>
            ))}
          </div>
          <p className={styles.muted} style={{ marginTop: 10 }}>
            Average points minted per moment. Checkout-scan earns most (longest real
            wait); offers-refresh fills most often. All figures aggregate — never
            tied to an individual shopper.
          </p>
        </div>
      </div>
    </>
  );
}
