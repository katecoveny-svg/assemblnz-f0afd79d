import Link from 'next/link';
import styles from './ops.module.css';
import { OpsTopbar } from '@/components/customers/air-nz/ops-chrome';
import {
  SPONSORS,
  CAMPAIGNS,
  REVENUE_MTD,
  REVENUE_FORECAST_JUL,
  revenueSplit,
  LOYALTY_RECON,
  COMPLIANCE_CHECKS,
  CDO_BRIEF,
  nzd,
} from '@/lib/customers/air-nz/ops-data';

const OPS = '/customers/air-nz/ops';

export default function OpsOverview() {
  const split = revenueSplit(REVENUE_MTD.grossAdRevenue);
  const live = SPONSORS.filter((s) => s.status === 'live').length;
  const running = CAMPAIGNS.filter((c) => c.status === 'running').length;
  const openFlags = COMPLIANCE_CHECKS.filter(
    (c) => c.fairTrading !== 'pass' || c.ipp3aNotice !== 'shown',
  ).length;
  const deltaPct = CDO_BRIEF.revenueVsForecast.deltaPct;

  const kpis = [
    { label: 'Gross ad revenue · MTD', value: nzd(split.gross), sub: `${(REVENUE_MTD.fillRate * 100).toFixed(0)}% fill · ${(REVENUE_MTD.paidImpressions / 1e6).toFixed(2)}M paid`, teal: false },
    { label: 'Net to Air New Zealand', value: nzd(split.koruNet + split.airpointsLiability), sub: `Treasury 55% of gross`, teal: false },
    { label: 'Airpoints$ to members', value: nzd(split.airpointsLiability), sub: 'Credited in the wait', teal: true },
    { label: 'vs July forecast', value: `+${deltaPct.toFixed(1)}%`, sub: `Forecast ${nzd(REVENUE_FORECAST_JUL)}`, teal: false },
  ];

  const links = [
    { href: `${OPS}/sponsors`, title: 'Sponsors', meta: `${live} live · ${SPONSORS.length} total` },
    { href: `${OPS}/campaigns`, title: 'Campaigns', meta: `${running} running · ${CAMPAIGNS.length} scheduled` },
    { href: `${OPS}/revenue`, title: 'Revenue split', meta: 'Gross → treasury → net' },
    { href: `${OPS}/analytics`, title: 'Segment analytics', meta: 'Aggregate cohorts · no PII' },
    { href: `${OPS}/compliance`, title: 'Compliance', meta: `${openFlags} open items` },
    { href: `${OPS}/comms`, title: 'Comms drafting', meta: 'Partner · board · sponsor' },
    { href: `${OPS}/loyalty`, title: 'Koru reconciliation', meta: LOYALTY_RECON.status === 'balanced' ? 'Balanced' : 'Variance' },
    { href: `${OPS}/brief`, title: 'CDO daily brief', meta: "Jeremy O'Brien" },
  ];

  return (
    <>
      <OpsTopbar eyebrow="Partner Operations · Dash on Air New Zealand" title="Overview" />
      <div className={styles.content}>
        <p className={styles.lead}>
          The back-of-house console the Air New Zealand team would use to run a
          Dash partnership — sponsors, campaigns, the revenue split, passenger
          analytics, compliance, comms, and Koru reconciliation. Everything here
          is a concept demo on mocked data; no live Air NZ or Airpoints systems
          are touched.
        </p>

        <div className={`${styles.grid} ${styles.g4}`}>
          {kpis.map((k) => (
            <div className={styles.card} key={k.label}>
              <div className={styles.label}>{k.label}</div>
              <div className={`${styles.kpi} ${k.teal ? styles.teal : ''}`}>{k.value}</div>
              <div className={styles.kpiSub}>{k.sub}</div>
            </div>
          ))}
        </div>

        <div className={styles.sectionTitle}>Jump in</div>
        <div className={`${styles.grid} ${styles.g4}`}>
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={styles.card} style={{ textDecoration: 'none' }}>
              <div className={styles.cardTitle}>{l.title}</div>
              <div className={styles.kpiSub}>{l.meta}</div>
              <div className={styles.eyebrow} style={{ marginTop: 12 }}>Open →</div>
            </Link>
          ))}
        </div>

        <div className={styles.sectionTitle}>Today, at a glance</div>
        <div className={`${styles.grid} ${styles.g2}`}>
          <div className={styles.card}>
            <div className={styles.label}>Overnight</div>
            <ul style={{ margin: '10px 0 0', paddingLeft: 18 }}>
              {CDO_BRIEF.overnight.map((o) => (
                <li key={o} className={styles.muted} style={{ marginBottom: 6 }}>{o}</li>
              ))}
            </ul>
          </div>
          <div className={styles.card}>
            <div className={styles.label}>Compliance flags</div>
            <ul style={{ margin: '10px 0 0', paddingLeft: 18 }}>
              {CDO_BRIEF.complianceFlags.map((c) => (
                <li key={c} className={styles.muted} style={{ marginBottom: 6 }}>{c}</li>
              ))}
            </ul>
            <div style={{ marginTop: 12 }}>
              <Link href={`${OPS}/compliance`} className={`${styles.btn} ${styles.btnGhost}`}>
                Review compliance →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
