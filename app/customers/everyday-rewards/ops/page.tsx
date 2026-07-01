import Link from 'next/link';
import styles from './ops.module.css';
import { OpsTopbar } from '@/components/customers/everyday-rewards/ops-chrome';
import { getBrandConfig } from '@/lib/brand/configs';
import { BrandThemeProvider } from '@/lib/brand/BrandThemeProvider';
import { Brand3DHero } from '@/components/ops/Brand3DHero';
import {
  SPONSORS,
  CAMPAIGNS,
  REVENUE_MTD,
  REVENUE_FORECAST_JUL,
  revenueSplit,
  RECON,
  COMPLIANCE_CHECKS,
  CDMO_BRIEF,
  nzd,
  pts,
} from '@/lib/customers/everyday-rewards/ops-data';

const OPS = '/customers/everyday-rewards/ops';

const brand = getBrandConfig('everyday-rewards');

export default function OpsOverview() {
  const split = revenueSplit(REVENUE_MTD.grossAdRevenue);
  const live = SPONSORS.filter((s) => s.status === 'live').length;
  const running = CAMPAIGNS.filter((c) => c.status === 'running').length;
  const openFlags = COMPLIANCE_CHECKS.filter(
    (c) => c.fairTrading !== 'pass' || c.asa !== 'pass' || c.ipp3aNotice !== 'shown',
  ).length;
  const deltaPct = CDMO_BRIEF.revenueVsForecast.deltaPct;

  const kpis = [
    { label: 'Gross attribution · MTD', value: nzd(split.gross), sub: `${(REVENUE_MTD.fillRate * 100).toFixed(0)}% fill · ${(REVENUE_MTD.sponsoredMoments / 1e6).toFixed(1)}M moments`, orange: false },
    { label: 'Points minted to shoppers', value: pts(split.pointsMinted), sub: `${nzd(split.toShopper)} value · 55% of gross`, orange: true },
    { label: 'Net to Everyday Rewards', value: nzd(split.toEdr), sub: 'Treasury 30% of gross', orange: false },
    { label: 'vs July forecast', value: `+${deltaPct.toFixed(1)}%`, sub: `Forecast ${nzd(REVENUE_FORECAST_JUL)}`, orange: false },
  ];

  const links = [
    { href: `${OPS}/sponsors`, title: 'Sponsors', meta: `${live} live · ${SPONSORS.length} total` },
    { href: `${OPS}/tiers`, title: 'Tiers & incentives', meta: 'Platinum · gold · silver' },
    { href: `${OPS}/campaigns`, title: 'Earn scheduling', meta: `${running} running · ${CAMPAIGNS.length} total` },
    { href: `${OPS}/reconciliation`, title: 'Reconciliation', meta: RECON.status === 'balanced' ? 'Balanced' : 'Variance' },
    { href: `${OPS}/liability`, title: 'Points liability', meta: 'Treasury · breakage · forecast' },
    { href: `${OPS}/analytics`, title: 'Segment analytics', meta: 'Aggregate cohorts · no PII' },
    { href: `${OPS}/compliance`, title: 'Compliance', meta: `${openFlags} open items` },
    { href: `${OPS}/comms`, title: 'Comms drafting', meta: 'Sponsor · shopper · blog' },
  ];

  return (
    <>
      <OpsTopbar eyebrow="Partner Operations · Dash on Everyday Rewards" title="Overview" />
      <div className={styles.content}>
        {brand ? (
          // Signature r-leaf orbit 3D hero — reduced-motion users get the
          // static SVG fallback inside Brand3DHero. BrandThemeProvider scopes
          // the --brand-* palette vars this console's own CSS module doesn't
          // set.
          <BrandThemeProvider config={brand}>
            <Brand3DHero config={brand} />
          </BrandThemeProvider>
        ) : null}
        <p className={styles.lead}>
          The back-of-house console the Everyday Rewards team would use to run a
          Dash wait-moment partnership — sponsors and tiers, earn scheduling,
          sponsor-funded points reconciliation, the points-liability treasury,
          shopper-segment analytics, compliance, and comms. Everything here is a
          concept demo on mocked data; no live Everyday Rewards or points systems
          are touched, and no real points are minted.
        </p>

        <div className={`${styles.grid} ${styles.g4}`}>
          {kpis.map((k) => (
            <div className={styles.card} key={k.label}>
              <div className={styles.label}>{k.label}</div>
              <div className={`${styles.kpi} ${k.orange ? styles.orange : ''}`}>{k.value}</div>
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
              {CDMO_BRIEF.overnight.map((o) => (
                <li key={o} className={styles.muted} style={{ marginBottom: 6 }}>{o}</li>
              ))}
            </ul>
          </div>
          <div className={styles.card}>
            <div className={styles.label}>Compliance flags</div>
            <ul style={{ margin: '10px 0 0', paddingLeft: 18 }}>
              {CDMO_BRIEF.complianceFlags.map((c) => (
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
