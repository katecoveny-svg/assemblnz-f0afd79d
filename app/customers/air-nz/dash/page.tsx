import Link from 'next/link';
import styles from './airnz.module.css';
import { AirNzHeader, ConceptTop, EarnPill } from '@/components/customers/air-nz/chrome';
import {
  DEMO_PERSONA,
  JOURNEY_TOTAL_EARN,
  JOURNEY_SPONSOR_COUNT,
  apd,
} from '@/lib/customers/air-nz/data';

const BASE = '/customers/air-nz/dash';

const NAV = [
  {
    href: `${BASE}/journey`,
    title: 'Trip journey',
    meta: 'Booking → baggage · one continuous earn',
  },
  {
    href: `${BASE}/wait-states`,
    title: 'Wait states',
    meta: 'Six un-monetised canvases, costed',
  },
  {
    href: `${BASE}/koru-partners`,
    title: 'All Koru Partners',
    meta: 'assembl as a native earn partner',
  },
  {
    href: `${BASE}/shairpoints`,
    title: 'Shairpoints™',
    meta: 'The whānau earn-pool story',
  },
  {
    href: `${BASE}/economics`,
    title: 'Unit economics',
    meta: 'Live-adjustable Y1 → Y3 model',
  },
];

export default function AirNzDashHome() {
  return (
    <>
      <AirNzHeader />
      <ConceptTop />

      <div className={styles.screenEyebrow}>Koru × assembl · pilot workspace</div>
      <h1 className={styles.screenTitle}>Kia ora, Kate.</h1>
      <p className={styles.screenSub}>
        This is what Dash looks like inside your app. Every wait state a passenger
        already gives Air New Zealand, turned into Airpoints Dollars in the wallet
        — in the moment. Advertiser pays, treasury keeps the majority share, the
        passenger earns.
      </p>

      <div className={styles.body}>
        {/* Koru moments widget */}
        <div className={styles.card}>
          <div className={styles.earnPanelTop}>
            <div>
              <div className={styles.statLabel}>Earned in the wait today</div>
              <div className={styles.balance}>
                <span className={styles.balanceTeal}>{apd(JOURNEY_TOTAL_EARN)}</span>
              </div>
            </div>
            <EarnPill />
          </div>
          <p className={styles.cardMeta}>
            {JOURNEY_SPONSOR_COUNT} sponsors funded today’s journey ·{' '}
            {DEMO_PERSONA.route} · {DEMO_PERSONA.flight}
          </p>
          <div style={{ marginTop: 14 }}>
            <Link href={`${BASE}/journey`} className={`${styles.btn} ${styles.btnTeal}`}>
              Walk the journey →
            </Link>
          </div>
        </div>

        {/* Koru balance card */}
        <div className={`${styles.card} ${styles.nested}`}>
          <div className={styles.statLabel}>Airpoints™ balance</div>
          <div className={styles.balance}>{apd(DEMO_PERSONA.balanceApd)}</div>
          <p className={styles.cardMeta}>
            {DEMO_PERSONA.tier} · Status Points S{DEMO_PERSONA.statusPoints} ·
            Shairpoints™ {apd(DEMO_PERSONA.shairpointsApd)}
          </p>
        </div>

        <div className={styles.statLabel} style={{ padding: '8px 0' }}>
          Explore the pilot
        </div>
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={styles.stageCard} style={{ marginBottom: 10 }}>
            <div className={styles.row} style={{ padding: 0, borderBottom: 0 }}>
              <div>
                <div className={styles.cardTitle}>{n.title}</div>
                <div className={styles.cardMeta}>{n.meta}</div>
              </div>
              <span className={styles.chevron}>›</span>
            </div>
          </Link>
        ))}

        <p
          className={styles.cardMeta}
          style={{ marginTop: 18, lineHeight: 1.6 }}
        >
          The advertiser paid the treasury. The treasury paid you. Air New Zealand
          kept its promise — nobody sold your attention twice. Every output stamps
          a Mana Receipt you can open at the end of the trip.
        </p>
      </div>
    </>
  );
}
