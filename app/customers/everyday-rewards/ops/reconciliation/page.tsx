import styles from '../ops.module.css';
import { OpsTopbar } from '@/components/customers/everyday-rewards/ops-chrome';
import { POINTS_BATCHES, RECON, nzd, pts } from '@/lib/customers/everyday-rewards/ops-data';

export default function ReconciliationPage() {
  return (
    <>
      <OpsTopbar eyebrow="Partner Operations" title="Points reconciliation" />
      <div className={styles.content}>
        <p className={styles.lead}>
          Every points batch minted in a wait moment is funded by a named sponsor.
          This is the treasury flow: sponsor spend → points minted → shopper
          balance, reconciled daily against the funding ledger so the liability
          always has money behind it.
        </p>

        <div className={`${styles.grid} ${styles.g4}`}>
          <div className={styles.card}>
            <div className={styles.label}>Points minted · MTD</div>
            <div className={styles.kpi}>{pts(RECON.pointsMintedMtd)}</div>
          </div>
          <div className={styles.card}>
            <div className={styles.label}>Treasury funded · MTD</div>
            <div className={styles.kpi}>{pts(RECON.treasuryFundedMtd)}</div>
          </div>
          <div className={styles.card}>
            <div className={styles.label}>Variance</div>
            <div className={`${styles.kpi} ${RECON.variancePts === 0 ? '' : styles.orange}`}>
              {RECON.variancePts} pts
            </div>
            <div className={styles.kpiSub}>
              <span className={`${styles.badge} ${RECON.status === 'balanced' ? styles.bPass : styles.bFlag}`}>
                {RECON.status}
              </span>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.label}>Unreconciled moments</div>
            <div className={styles.kpi}>{RECON.unreconciledMoments.toLocaleString('en-NZ')}</div>
            <div className={styles.kpiSub}>Last run {RECON.lastReconciled}</div>
          </div>
        </div>

        <div className={styles.sectionTitle}>Today’s points batches</div>
        <div className={styles.card}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Batch</th>
                <th>Sponsor</th>
                <th>Wait moment</th>
                <th className={styles.num}>Moments</th>
                <th className={styles.num}>Points minted</th>
                <th className={styles.num}>Funded</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {POINTS_BATCHES.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontFamily: 'var(--edr-mono), monospace', fontSize: 12 }}>{b.id}</td>
                  <td style={{ fontWeight: 700 }}>{b.sponsor}</td>
                  <td>{b.waitMoment}</td>
                  <td className={styles.num}>{b.moments.toLocaleString('en-NZ')}</td>
                  <td className={styles.num}>{pts(b.pointsMinted)}</td>
                  <td className={styles.num}>{nzd(b.fundedNzd)}</td>
                  <td>
                    <span className={`${styles.badge} ${b.status === 'reconciled' ? styles.bPass : styles.bReview}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.notice} style={{ marginTop: 16 }}>
          One Sanitarium batch is pending funding confirmation — points are held,
          not minted, until the sponsor invoice clears. No points are minted without
          a funded batch behind them. Concept demo · mocked figures.
        </div>
      </div>
    </>
  );
}
