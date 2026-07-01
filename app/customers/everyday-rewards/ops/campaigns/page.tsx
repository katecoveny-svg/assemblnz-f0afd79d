import styles from '../ops.module.css';
import { OpsTopbar } from '@/components/customers/everyday-rewards/ops-chrome';
import { CAMPAIGNS, sponsorById, nzd } from '@/lib/customers/everyday-rewards/ops-data';

const STATUS_BADGE: Record<string, string> = {
  running: styles.bLive,
  scheduled: styles.bOnboard,
  draft: styles.bPaused,
  ended: styles.bPaused,
};

export default function CampaignsPage() {
  const totalDailyCap = CAMPAIGNS.reduce((n, c) => n + c.dailyCap, 0);
  return (
    <>
      <OpsTopbar eyebrow="Partner Operations" title="Earn scheduling" />
      <div className={styles.content}>
        <p className={styles.lead}>
          Which sponsor funds which points, on which wait moment, for which shopper
          cluster, on which days — with a daily impression cap so no moment is
          over-sold. {CAMPAIGNS.filter((c) => c.status === 'running').length} running
          across {(totalDailyCap / 1000).toFixed(0)}k daily capped moments.
        </p>

        <div className={styles.card}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Sponsor</th>
                <th>Wait moment</th>
                <th>Shopper cluster</th>
                <th>Days</th>
                <th className={styles.num}>CPM</th>
                <th className={styles.num}>Daily cap</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {CAMPAIGNS.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 700 }}>{sponsorById(c.sponsorId)?.name ?? c.sponsorId}</td>
                  <td>{c.waitMoment}</td>
                  <td>{c.cluster}</td>
                  <td>{c.days}</td>
                  <td className={styles.num}>{nzd(c.cpm)}</td>
                  <td className={styles.num}>{c.dailyCap.toLocaleString('en-NZ')}</td>
                  <td>
                    <span className={`${styles.badge} ${STATUS_BADGE[c.status]}`}>{c.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.notice} style={{ marginTop: 16 }}>
          Scheduling honours tier exclusivity and category-exclusion rules —
          e.g. only one dairy sponsor on offers-refresh while Woolworths Milk is on
          promotion. Points fund from the sponsor’s budget, minted into the shopper’s
          existing balance. Concept demo · mocked figures.
        </div>
      </div>
    </>
  );
}
