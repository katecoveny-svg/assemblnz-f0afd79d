import styles from '../ops.module.css';
import { OpsTopbar } from '@/components/customers/everyday-rewards/ops-chrome';
import { OpsLiabilityModel } from '@/components/customers/everyday-rewards/OpsLiabilityModel';
import { LIABILITY, REDEMPTION_FORECAST, revenueSplit, REVENUE_MTD, pts } from '@/lib/customers/everyday-rewards/ops-data';

export default function LiabilityPage() {
  const split = revenueSplit(REVENUE_MTD.grossAdRevenue);
  const maxRedeem = Math.max(...REDEMPTION_FORECAST.map((r) => r.voucher + r.travel));
  return (
    <>
      <OpsTopbar eyebrow="Partner Operations" title="Points liability" />
      <div className={styles.content}>
        <p className={styles.lead}>
          The treasury view: points minted this month, outstanding liability across
          the base, expected breakage, and the voucher-vs-travel redemption forecast.
          Every point minted through Dash is sponsor-funded, so the wait-moment
          liability is covered before it lands.
        </p>

        <div className={`${styles.grid} ${styles.g3}`}>
          <div className={styles.card}>
            <div className={styles.label}>Points minted · MTD (Dash)</div>
            <div className={styles.kpi}>{pts(split.pointsMinted)}</div>
            <div className={styles.kpiSub}>Sponsor-funded, 55% of gross</div>
          </div>
          <div className={styles.card}>
            <div className={styles.label}>Monthly mint vs redeem</div>
            <div className={styles.kpi}>{pts(LIABILITY.monthlyMintPts)}</div>
            <div className={styles.kpiSub}>{pts(LIABILITY.monthlyRedeemPts)} redeemed / mo</div>
          </div>
          <div className={styles.card}>
            <div className={styles.label}>Redemption mix</div>
            <div className={styles.kpi}>{(LIABILITY.redeemVoucherShare * 100).toFixed(0)}%</div>
            <div className={styles.kpiSub}>
              $15 voucher · {(LIABILITY.redeemTravelShare * 100).toFixed(0)}% travel reward
            </div>
          </div>
        </div>

        <div className={styles.sectionTitle}>Redemption forecast</div>
        <div className={styles.card}>
          <div className={styles.barChart}>
            {REDEMPTION_FORECAST.map((r) => {
              const total = r.voucher + r.travel;
              const h = (total / maxRedeem) * 100;
              const vShare = (r.voucher / total) * 100;
              return (
                <div className={styles.barCol} key={r.month}>
                  <span className={styles.barColVal}>{(total / 1000).toFixed(0)}k</span>
                  <div
                    className={styles.barColFill}
                    style={{
                      height: `${h}%`,
                      background: `linear-gradient(180deg, #fd6400 ${vShare}%, #22303c ${vShare}%)`,
                    }}
                    title={`${r.voucher.toLocaleString()} voucher · ${r.travel.toLocaleString()} travel`}
                  />
                  <span className={styles.barColLabel}>{r.month}</span>
                </div>
              );
            })}
          </div>
          <p className={styles.muted} style={{ marginTop: 10 }}>
            <span style={{ color: '#fd6400', fontWeight: 700 }}>■</span> $15 voucher
            {'   '}
            <span style={{ color: '#22303c', fontWeight: 700 }}>■</span> travel reward — redeemers per month.
          </p>
        </div>

        <div className={styles.sectionTitle}>Liability model</div>
        <OpsLiabilityModel />
      </div>
    </>
  );
}
