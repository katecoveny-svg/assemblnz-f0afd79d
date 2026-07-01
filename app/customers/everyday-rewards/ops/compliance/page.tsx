import styles from '../ops.module.css';
import { OpsTopbar } from '@/components/customers/everyday-rewards/ops-chrome';
import { COMPLIANCE_CHECKS, IPP3A_NOTICE } from '@/lib/customers/everyday-rewards/ops-data';

function flagClass(v: 'pass' | 'flag' | 'review' | 'shown' | 'pending') {
  if (v === 'pass' || v === 'shown') return styles.bPass;
  if (v === 'flag') return styles.bFlag;
  return styles.bReview;
}

export default function CompliancePage() {
  return (
    <>
      <OpsTopbar eyebrow="Partner Operations" title="Compliance" />
      <div className={styles.content}>
        <p className={styles.lead}>
          Every sponsored moment clears three gates before it goes live: a Fair
          Trading Act check on the sponsor’s claim, an ASA (Advertising Standards)
          review of the creative, and a Privacy Act 2020 IPP 3A automated-decision
          notice shown to the shopper.
        </p>

        <div className={styles.card}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Touchpoint</th>
                <th>Sponsor</th>
                <th>Fair Trading</th>
                <th>ASA</th>
                <th>IPP 3A notice</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {COMPLIANCE_CHECKS.map((c) => (
                <tr key={c.touchpoint}>
                  <td style={{ fontWeight: 700 }}>{c.touchpoint}</td>
                  <td>{c.sponsor}</td>
                  <td><span className={`${styles.badge} ${flagClass(c.fairTrading)}`}>{c.fairTrading}</span></td>
                  <td><span className={`${styles.badge} ${flagClass(c.asa)}`}>{c.asa}</span></td>
                  <td><span className={`${styles.badge} ${flagClass(c.ipp3aNotice)}`}>{c.ipp3aNotice}</span></td>
                  <td className={styles.muted} style={{ maxWidth: 280 }}>{c.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.sectionTitle}>The IPP 3A notice shown in-app</div>
        <div className={styles.notice}>{IPP3A_NOTICE}</div>

        <p className={styles.muted} style={{ marginTop: 14 }}>
          Anything not fully <strong>pass / shown</strong> is held out of live
          inventory until resolved. Targeting is aggregate-cohort only, so IPP 3A is
          satisfied by construction — selection never uses shopper identity. Concept
          demo · no live enforcement.
        </p>
      </div>
    </>
  );
}
