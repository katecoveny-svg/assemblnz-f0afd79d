import styles from '../airnz.module.css';
import { AirNzHeader, ConceptTop, EarnPill } from '@/components/customers/air-nz/chrome';
import { apd } from '@/lib/customers/air-nz/data';

const BASE = '/customers/air-nz/dash';

const WHANAU = [
  { name: 'Kate', tier: 'Koru Gold', earned: 4.2 },
  { name: 'Tama', tier: 'Koru Silver', earned: 2.85 },
  { name: 'Aroha', tier: 'Airpoints™ member', earned: 1.6 },
  { name: 'Nan', tier: 'Airpoints™ member', earned: 0.95 },
];

export default function AirNzShairpointsPage() {
  const pool = WHANAU.reduce((s, x) => s + x.earned, 0);
  return (
    <>
      <AirNzHeader back={BASE} />
      <ConceptTop />
      <div className={styles.screenEyebrow}>Koru › Shairpoints™</div>
      <h1 className={styles.screenTitle}>Shared across the whānau</h1>
      <p className={styles.screenSub}>
        Shairpoints™ already lets a Koru household share Airpoints Dollars. Dash
        pools what everyone earns in the wait — the family earn-pool, tied to
        Hearth.
      </p>

      <div className={styles.body}>
        <div className={styles.card}>
          <div className={styles.earnPanelTop}>
            <div>
              <div className={styles.statLabel}>Whānau pool · earned in the wait today</div>
              <div className={styles.balance}>
                <span className={styles.balanceTeal}>{apd(pool)}</span>
              </div>
            </div>
            <EarnPill />
          </div>
          <p className={styles.cardMeta}>
            Four members · pooled into one Shairpoints™ balance
          </p>
        </div>

        {WHANAU.map((m) => (
          <div key={m.name} className={styles.row} style={{ padding: '14px 0' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span
                aria-hidden
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  background: '#f5f5f6',
                  border: '1px solid #eaeaea',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  color: '#6b6e71',
                  fontSize: 13,
                }}
              >
                {m.name.slice(0, 1)}
              </span>
              <div>
                <div className={styles.cardTitle} style={{ fontSize: 14 }}>
                  {m.name}
                </div>
                <div className={styles.cardMeta}>{m.tier}</div>
              </div>
            </div>
            <span style={{ color: '#00b0b9', fontWeight: 600 }}>+{apd(m.earned)}</span>
          </div>
        ))}

        <div className={`${styles.card} ${styles.nested}`} style={{ marginTop: 16 }}>
          <div className={styles.statLabel}>The story hook</div>
          <p className={styles.earnLine} style={{ marginTop: 6 }}>
            One family, one earn-pool. The kid’s tablet loading the seat map, Nan
            waiting at the gate, the teenager unlocking IFE — every wait feeds the
            same whānau balance. Airpoints™ × Hearth: the household that earns
            together while it travels together.
          </p>
          <div className={styles.poweredBy} style={{ marginTop: 12 }}>
            Powered by <span className={styles.a}>assembl</span> × Koru
          </div>
        </div>
      </div>
    </>
  );
}
