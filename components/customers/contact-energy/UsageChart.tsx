import { USAGE_MONTHS } from '@/lib/customers/contact-energy/data';
import styles from '@/app/customers/contact-energy/contact.module.css';

/**
 * 12-month usage bars (demo) — pure SVG, no chart library. Billed kWh in
 * Contact red; the Good Nights free-window kWh stacked on top in soft grey
 * so the plan's value is visible at a glance. Gold marks nothing here —
 * gold belongs to the earn layer only.
 */

const W = 560;
const H = 180;
const PAD = 24;

export function UsageChart() {
  const max = Math.max(...USAGE_MONTHS.map((m) => m.kwh));
  const bw = (W - PAD * 2) / USAGE_MONTHS.length;

  return (
    <figure className={styles.usageFigure}>
      <svg viewBox={`0 0 ${W} ${H + 26}`} className={styles.usageSvg} role="img" aria-label="12 months of demo electricity usage">
        {USAGE_MONTHS.map((m, i) => {
          const x = PAD + i * bw + bw * 0.18;
          const w = bw * 0.64;
          const hTotal = (m.kwh / max) * H;
          const hFree = (m.freeKwh / max) * H;
          const yTotal = H - hTotal;
          const isCurrent = i === USAGE_MONTHS.length - 1;
          return (
            <g key={m.month}>
              {/* free-window slice on top */}
              <rect x={x} y={yTotal} width={w} height={hFree} rx={3} className={styles.usageBarFree} />
              {/* billed usage below */}
              <rect
                x={x}
                y={yTotal + hFree}
                width={w}
                height={hTotal - hFree}
                rx={3}
                className={isCurrent ? styles.usageBarCurrent : styles.usageBar}
              />
              <text x={x + w / 2} y={H + 16} textAnchor="middle" className={styles.usageLabel}>
                {m.month}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className={styles.usageCaption}>
        <span className={styles.usageKeyBilled} aria-hidden /> billed
        <span className={styles.usageKeyFree} aria-hidden /> Good Nights free hours
        <span className={styles.usageDemoTag}>(demo)</span>
      </figcaption>
    </figure>
  );
}
