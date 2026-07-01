import styles from '../ops.module.css';
import { OpsTopbar } from '@/components/customers/air-nz/ops-chrome';
import { COMPLIANCE_CHECKS, IPP3A_NOTICE } from '@/lib/customers/air-nz/ops-data';

const FT_BADGE: Record<string, string> = {
  pass: styles.bPass,
  flag: styles.bFlag,
  review: styles.bReview,
};

export default function CompliancePage() {
  const flags = COMPLIANCE_CHECKS.filter((c) => c.fairTrading === 'flag').length;
  const reviews = COMPLIANCE_CHECKS.filter((c) => c.fairTrading === 'review').length;
  const noticesPending = COMPLIANCE_CHECKS.filter((c) => c.ipp3aNotice === 'pending').length;

  return (
    <>
      <OpsTopbar eyebrow="Partner Operations · Legal" title="Compliance" />
      <div className={styles.content}>
        <p className={styles.lead}>
          Two automated gates on every sponsored touchpoint: a Privacy Act 2020
          IPP 3A automated-decision notice, and a Fair Trading Act 1986 check on
          the sponsor creative. Nothing goes live until both clear.
        </p>

        <div className={`${styles.grid} ${styles.g3}`}>
          <div className={styles.card}>
            <div className={styles.label}>Fair Trading — flags</div>
            <div className={styles.kpi} style={{ color: flags ? '#d0342c' : '#2e7d5b' }}>{flags}</div>
            <div className={styles.kpiSub}>Blocking claims to fix or remove</div>
          </div>
          <div className={styles.card}>
            <div className={styles.label}>Awaiting review</div>
            <div className={styles.kpi}>{reviews}</div>
            <div className={styles.kpiSub}>Assets in the review queue</div>
          </div>
          <div className={styles.card}>
            <div className={styles.label}>IPP 3A notices pending</div>
            <div className={styles.kpi}>{noticesPending}</div>
            <div className={styles.kpiSub}>Touchpoints not yet notice-wired</div>
          </div>
        </div>

        <div className={styles.notice} style={{ margin: '18px 0' }}>
          <strong>IPP 3A automated-decision notice (shown to the passenger):</strong>
          <div style={{ marginTop: 6 }}>“{IPP3A_NOTICE}”</div>
        </div>

        <div className={styles.card} style={{ padding: 6 }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Touchpoint</th>
                <th>Sponsor</th>
                <th>IPP 3A notice</th>
                <th>Fair Trading</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {COMPLIANCE_CHECKS.map((c) => (
                <tr key={c.touchpoint}>
                  <td style={{ fontWeight: 600 }}>{c.touchpoint}</td>
                  <td>{c.sponsor}</td>
                  <td>
                    <span className={`${styles.badge} ${c.ipp3aNotice === 'shown' ? styles.bPass : styles.bReview}`}>
                      {c.ipp3aNotice}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${FT_BADGE[c.fairTrading]}`}>{c.fairTrading}</span>
                  </td>
                  <td className={styles.muted}>{c.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className={styles.muted} style={{ marginTop: 14 }}>
          Targeting never uses individual passenger data — selection reads
          aggregate flight and journey context only, so the IPP 3A notice is about
          transparency of the automated choice, not profiling. Fair Trading review
          checks each claim for substantiation and clear sponsor identification
          before an asset can be scheduled.
        </p>
      </div>
    </>
  );
}
