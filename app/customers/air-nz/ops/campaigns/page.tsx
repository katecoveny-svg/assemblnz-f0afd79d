import styles from '../ops.module.css';
import { OpsTopbar } from '@/components/customers/air-nz/ops-chrome';
import { CAMPAIGNS, sponsorById, nzd } from '@/lib/customers/air-nz/ops-data';

const WAIT_ROWS: { key: string; label: string }[] = [
  { key: 'booking', label: 'Booking flow' },
  { key: 'identity', label: 'Identity load' },
  { key: 'seat', label: 'Seat check-in' },
  { key: 'gate', label: 'Gate wait' },
  { key: 'ife', label: 'IFE unlock' },
  { key: 'baggage', label: 'Baggage carousel' },
];

const STATUS_BADGE: Record<string, string> = {
  running: styles.bLive,
  scheduled: styles.bOnboard,
  draft: styles.bPaused,
  ended: styles.bPaused,
};

export default function CampaignsPage() {
  return (
    <>
      <OpsTopbar eyebrow="Partner Operations" title="Campaign scheduler" />
      <div className={styles.content}>
        <p className={styles.lead}>
          Which sponsor holds which wait moment, on which route, day and passenger
          segment. Platinum holds first-look; gold fills next; silver takes
          remnant. Nothing overlaps a sponsor’s category exclusivity.
        </p>

        {/* Matrix — wait state × campaigns */}
        <div className={styles.card}>
          <div className={styles.label} style={{ marginBottom: 12 }}>Wait-state inventory</div>
          <div style={{ display: 'grid', gap: 10 }}>
            {WAIT_ROWS.map((w) => {
              const camps = CAMPAIGNS.filter((c) => c.waitState === w.key);
              return (
                <div key={w.key} style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 12, alignItems: 'center' }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{w.label}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {camps.length === 0 && <span className={styles.muted}>— unsold —</span>}
                    {camps.map((c) => {
                      const sp = sponsorById(c.sponsorId);
                      return (
                        <span key={c.id} className={styles.tier} style={{ gap: 8 }}>
                          <span className={styles.tierDot} style={{ background: c.status === 'running' ? '#2e7d5b' : c.status === 'scheduled' ? '#00b0b9' : '#8a8678' }} />
                          <strong style={{ fontWeight: 600 }}>{sp?.name}</strong>
                          <span className={styles.ledgerNote}>{c.route} · {c.days}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Full schedule */}
        <div className={styles.sectionTitle}>All campaigns</div>
        <div className={styles.card} style={{ padding: 6 }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Sponsor</th>
                <th>Wait moment</th>
                <th>Route</th>
                <th>Segment</th>
                <th>Days</th>
                <th className={styles.num}>CPM</th>
                <th className={styles.num}>Daily cap</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {CAMPAIGNS.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{sponsorById(c.sponsorId)?.name}</td>
                  <td>{c.waitLabel}</td>
                  <td>{c.route}</td>
                  <td className={styles.muted}>{c.segment}</td>
                  <td>{c.days}</td>
                  <td className={styles.num}>NZ${c.cpm}</td>
                  <td className={styles.num}>{c.dailyCap.toLocaleString('en-NZ')}</td>
                  <td><span className={`${styles.badge} ${STATUS_BADGE[c.status]}`}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.muted} style={{ marginTop: 12 }}>
          Segments are aggregate cohorts (minimum bucket 1,000) — never individual
          passengers. Targeting reads flight and journey context, not identity.
        </p>
      </div>
    </>
  );
}
