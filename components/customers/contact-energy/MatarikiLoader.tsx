'use client';

import styles from '@/app/customers/contact-energy/contact.module.css';

/**
 * The Assembling loader — a matariki dot cluster in champagne gold.
 * Nine dots in the star-cluster arrangement, pulsing in sequence. This is the
 * assembl earn-layer signature; it never uses Contact red.
 */

// Positions echo the Matariki cluster (viewBox 0..48), sized by prominence.
const STARS: Array<{ x: number; y: number; r: number; delay: number }> = [
  { x: 24, y: 10, r: 2.6, delay: 0 },
  { x: 33, y: 15, r: 2.0, delay: 0.18 },
  { x: 38, y: 24, r: 2.3, delay: 0.36 },
  { x: 31, y: 32, r: 1.7, delay: 0.54 },
  { x: 22, y: 36, r: 2.1, delay: 0.72 },
  { x: 13, y: 30, r: 1.6, delay: 0.9 },
  { x: 10, y: 20, r: 2.4, delay: 1.08 },
  { x: 17, y: 14, r: 1.5, delay: 1.26 },
  { x: 24, y: 23, r: 1.9, delay: 1.44 },
];

export function MatarikiLoader({ size = 56 }: { size?: number }) {
  return (
    <svg
      className={styles.matariki}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label="Loading"
    >
      {STARS.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          className={styles.matarikiStar}
          style={{ animationDelay: `${s.delay}s` }}
        />
      ))}
    </svg>
  );
}
