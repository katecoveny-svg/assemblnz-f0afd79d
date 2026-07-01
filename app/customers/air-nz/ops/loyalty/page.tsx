import styles from '../ops.module.css';
import { OpsTopbar } from '@/components/customers/air-nz/ops-chrome';
import { LOYALTY_RECON, LOYALTY_BY_WAIT, nzd } from '@/lib/customers/air-nz/ops-data';

export default function LoyaltyPage() {
  const totalMoments = LOYALTY_BY_WAIT.reduce((s, x) => s + x.moments, 0);
  const totalMinted = LOYALTY_BY_WAIT.reduce((s, x) => s + x.apdMinted, 0);
  const balanced = LOYALTY_RECON.status === 'balanced';

  return (
    <>
      <OpsTopbar eyebrow="Partner Operations · Loyalty" title="Koru reconciliation" />
      <div className={styles.content}>
        <p className={styles.lead}>
          Airpoints Dollars minted per wait moment, reconciled against the Koru
          treasury. Every A$ credited to a member must trace to a paid, filled
          sponsor moment — no minting without matching revenue.
        </p>

        <div className={`${styles.grid} ${styles.g4}`}>
          <div className={styles.card}>
            <div className={styles.label}>Airpoints$ minted · MTD</div>
            <div className={`${styles.kpi} ${styles.teal}`}>{nzd(LOYALTY_RECON.airpointsMintedMtd)}</div>
          </div>
          <div className={styles.card}>
            <div className={styles.label}>Treasury expected</div>
            <div className={styles.kpi}>{nzd(LOYALTY_RECON.treasuryExpected)}</div>
          </div>
          <div className={styles.card}>
            <div className={styles.label}>Variance</div>
            <div className={styles.kpi} style={{ color: balanced ? '#2e7d5b' : '#d0342c' }}>
              {nzd(LOYALTY_RECON.variance)}
            </div>
            <div className={styles.kpiSub}>
              <span className={`${styles.badge} ${balanced ? styles.bPass : styles.bFlag}`}>
                {balanced ? 'balanced' : 'variance'}
              </span>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.label}>Unreconciled moments</div>
            <div className={styles.kpi}>{LOYALTY_RECON.unreconciledMoments}</div>
            <div className={styles.kpiSub}>Last run {LOYALTY_RECON.lastReconciled}</div>
          </div>
        </div>

        <div className={styles.sectionTitle}>Minting by wait moment · MTD</div>
        <div className={styles.card} style={{ padding: 6 }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Wait moment</th>
                <th className={styles.num}>Filled moments</th>
                <th className={styles.num}>Airpoints$ minted</th>
                <th className={styles.num}>Avg / moment</th>
              </tr>
            </thead>
            <tbody>
              {LOYALTY_BY_WAIT.map((w) => (
                <tr key={w.wait}>
                  <td style={{ fontWeight: 600 }}>{w.wait}</td>
                  <td className={styles.num}>{w.moments.toLocaleString('en-NZ')}</td>
                  <td className={styles.num} style={{ color: '#00b0b9', fontWeight: 600 }}>{nzd(w.apdMinted)}</td>
                  <td className={styles.num}>A${(w.apdMinted / w.moments).toFixed(3)}</td>
                </tr>
              ))}
              <tr>
                <td style={{ fontWeight: 700 }}>Total</td>
                <td className={styles.num} style={{ fontWeight: 700 }}>{totalMoments.toLocaleString('en-NZ')}</td>
                <td className={styles.num} style={{ fontWeight: 700 }}>{nzd(totalMinted)}</td>
                <td className={styles.num} style={{ fontWeight: 700 }}>A${(totalMinted / totalMoments).toFixed(3)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={styles.notice} style={{ marginTop: 16 }}>
          <strong>Demo tally only.</strong> No real Airpoints Dollars are minted
          and this does not connect to the live Koru treasury. In production this
          view reconciles the Dash ledger against Koru’s system of record nightly;
          a non-zero variance holds member credit until it clears.
        </div>
      </div>
    </>
  );
}
