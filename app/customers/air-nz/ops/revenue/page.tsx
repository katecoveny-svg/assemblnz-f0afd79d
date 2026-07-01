import styles from '../ops.module.css';
import { OpsTopbar } from '@/components/customers/air-nz/ops-chrome';
import {
  REVENUE_MTD,
  REVENUE_TREND,
  revenueSplit,
  SPONSORS,
  nzd,
} from '@/lib/customers/air-nz/ops-data';

export default function RevenuePage() {
  const s = revenueSplit(REVENUE_MTD.grossAdRevenue);
  const maxTrend = Math.max(...REVENUE_TREND.map((t) => t.gross));

  const ledger = [
    { name: 'Gross ad revenue', note: `${(REVENUE_MTD.paidImpressions / 1e6).toFixed(2)}M paid impressions · ${(REVENUE_MTD.fillRate * 100).toFixed(0)}% fill`, val: s.gross, strong: true },
    { name: 'Koru treasury share (55%)', note: 'Air New Zealand side of the split', val: s.treasury },
    { name: '— Airpoints$ liability to members', note: '60% of treasury, credited in the wait', val: s.airpointsLiability, teal: true },
    { name: '— Koru retained margin', note: '40% of treasury, net to Air New Zealand', val: s.koruNet },
    { name: 'assembl share (45%)', note: 'Funds the network, receipts, measurement', val: s.assemblShare },
  ];

  return (
    <>
      <OpsTopbar eyebrow="Partner Operations · Finance" title="Revenue split" />
      <div className={styles.content}>
        <p className={styles.lead}>
          The split Air New Zealand finance needs: gross ad revenue, the Koru
          treasury share, the Airpoints Dollars liability credited to members, the
          margin Air New Zealand retains, and the assembl share. Canon is fixed —
          55% treasury (60% of it to members), 45% assembl.
        </p>

        <div className={`${styles.grid} ${styles.g4}`}>
          <div className={styles.card}>
            <div className={styles.label}>Gross · MTD</div>
            <div className={styles.kpi}>{nzd(s.gross)}</div>
          </div>
          <div className={styles.card}>
            <div className={styles.label}>Net to Air New Zealand</div>
            <div className={styles.kpi}>{nzd(s.koruNet + s.airpointsLiability)}</div>
            <div className={styles.kpiSub}>Treasury share (incl. member credit)</div>
          </div>
          <div className={styles.card}>
            <div className={styles.label}>Airpoints$ liability</div>
            <div className={`${styles.kpi} ${styles.teal}`}>{nzd(s.airpointsLiability)}</div>
            <div className={styles.kpiSub}>Owed to members as Airpoints Dollars</div>
          </div>
          <div className={styles.card}>
            <div className={styles.label}>assembl share</div>
            <div className={styles.kpi}>{nzd(s.assemblShare)}</div>
          </div>
        </div>

        <div className={`${styles.grid} ${styles.g2}`} style={{ marginTop: 14 }}>
          {/* Ledger */}
          <div className={styles.card}>
            <div className={styles.label} style={{ marginBottom: 4 }}>Split ledger · month to date</div>
            {ledger.map((l) => (
              <div key={l.name} className={`${styles.ledgerRow} ${l.strong ? styles.total : ''}`}>
                <div>
                  <div className={styles.ledgerName} style={l.strong ? { fontWeight: 700 } : undefined}>{l.name}</div>
                  <div className={styles.ledgerNote}>{l.note}</div>
                </div>
                <div className={styles.ledgerVal} style={l.teal ? { color: '#00b0b9' } : undefined}>{nzd(l.val)}</div>
              </div>
            ))}
          </div>

          {/* Trend */}
          <div className={styles.card}>
            <div className={styles.label} style={{ marginBottom: 8 }}>Gross revenue · last 6 months</div>
            <div className={styles.barChart}>
              {REVENUE_TREND.map((t) => (
                <div key={t.month} className={styles.barCol}>
                  <span className={styles.barColVal}>{Math.round(t.gross / 1000)}k</span>
                  <div className={styles.barColFill} style={{ height: `${(t.gross / maxTrend) * 100}%` }} />
                  <span className={styles.barColLabel}>{t.month}</span>
                </div>
              ))}
            </div>
            <p className={styles.muted} style={{ marginTop: 12 }}>
              Boring on purpose. The pilot proves the mechanic; the model runs when
              the other wait states open in Year 2–3.
            </p>
          </div>
        </div>

        {/* By sponsor */}
        <div className={styles.sectionTitle}>Spend by sponsor · MTD</div>
        <div className={styles.card} style={{ padding: 6 }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Sponsor</th>
                <th>Tier</th>
                <th className={styles.num}>Budget</th>
                <th className={styles.num}>Spent</th>
                <th className={styles.num}>Pacing</th>
              </tr>
            </thead>
            <tbody>
              {[...SPONSORS].sort((a, b) => b.spentThisMonth - a.spentThisMonth).map((sp) => (
                <tr key={sp.id}>
                  <td style={{ fontWeight: 600 }}>{sp.name}</td>
                  <td style={{ textTransform: 'capitalize' }}>{sp.tier}</td>
                  <td className={styles.num}>{nzd(sp.monthlyBudget)}</td>
                  <td className={styles.num}>{nzd(sp.spentThisMonth)}</td>
                  <td className={styles.num}>{sp.monthlyBudget ? `${Math.round((sp.spentThisMonth / sp.monthlyBudget) * 100)}%` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
