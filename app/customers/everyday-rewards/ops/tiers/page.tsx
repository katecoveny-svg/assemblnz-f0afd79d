import styles from '../ops.module.css';
import { OpsTopbar } from '@/components/customers/everyday-rewards/ops-chrome';
import { SPONSOR_TIERS, EXCLUSION_RULES, nzd, type SponsorTier } from '@/lib/customers/everyday-rewards/ops-data';

const ORDER: SponsorTier[] = ['platinum', 'gold', 'silver'];

export default function TiersPage() {
  return (
    <>
      <OpsTopbar eyebrow="Partner Operations" title="Tiers & incentives" />
      <div className={styles.content}>
        <p className={styles.lead}>
          Partner tiers set the CPM floor, which wait moments a sponsor can buy,
          attribution priority, and exclusivity. Category-exclusion rules protect
          Woolworths own-brand and keep competing sponsors out of the same slot.
        </p>

        <div className={`${styles.grid} ${styles.g3}`}>
          {ORDER.map((key) => {
            const t = SPONSOR_TIERS[key];
            return (
              <div className={styles.card} key={key}>
                <div className={styles.cardHead}>
                  <span className={styles.tier}>
                    <span className={styles.tierDot} style={{ background: t.colour }} />
                    {t.label}
                  </span>
                  <span className={styles.label}>from {nzd(t.cpmFloor)} CPM</span>
                </div>
                <div className={styles.muted} style={{ marginBottom: 4 }}>
                  <strong>Attribution:</strong> {t.attribution}
                </div>
                <div className={styles.muted} style={{ marginBottom: 4 }}>
                  <strong>Wait moments:</strong> {t.waitMoments}
                </div>
                <div className={styles.muted} style={{ marginBottom: 10 }}>
                  <strong>Exclusivity:</strong> {t.exclusivity}
                </div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {t.perks.map((p) => (
                    <li key={p} className={styles.muted} style={{ marginBottom: 4 }}>{p}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className={styles.sectionTitle}>Category exclusion rules</div>
        <div className={`${styles.grid} ${styles.g2}`}>
          {EXCLUSION_RULES.map((r) => (
            <div className={styles.card} key={r.rule}>
              <div className={styles.cardTitle}>{r.rule}</div>
              <p className={styles.muted} style={{ marginTop: 6 }}>{r.detail}</p>
            </div>
          ))}
        </div>

        <div className={styles.notice} style={{ marginTop: 18 }}>
          Exclusivity windows and category locks are enforced at scheduling time —
          a sponsor can’t book a moment already held by a competing category. Concept
          model; no live inventory.
        </div>
      </div>
    </>
  );
}
