import styles from './chrome.module.css';

/**
 * assembl chrome kit — DIRECTION-LOCKED-2026-07-01.
 *
 * The assembl-side layer that wraps every pilot surface: silvery-gold
 * particulate landscape, matariki dot-cluster ornament, tracked micro-labels,
 * lowercase wordmark. Customer brand stays primary; these pieces are the
 * quiet assembl signature around it.
 *
 * All server-safe (no hooks); motion lives in chrome.module.css and is
 * disabled wholesale under prefers-reduced-motion.
 */

export const ASSEMBL_PAPER = '#FBFAF6';
export const ASSEMBL_INK = '#1A1918';
export const ASSEMBL_WARM_GREY = '#5A5850';
export const ASSEMBL_CANARY = '#F5C64B';

/** The particulate mountain-and-wave landscape, as a decorative backdrop. */
export function ParticulateBackdrop({ className = '' }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- decorative SVG; next/image adds nothing
    <img
      src="/brand/assembl/particulate-landscape.svg"
      alt=""
      aria-hidden
      draggable={false}
      className={`${styles.backdrop} ${className}`}
    />
  );
}

// Radial matariki dot cluster — the bundle-card ornament from the locked
// reference. Deterministic geometry (fixed trig, no randomness) so server and
// client always agree.
const CLUSTER_DOTS: Array<{ x: number; y: number; r: number }> = (() => {
  const dots = [{ x: 14, y: 14, r: 1.6 }];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI * 2 * i) / 6 + 0.4;
    dots.push({ x: 14 + 5.5 * Math.cos(a), y: 14 + 5.5 * Math.sin(a), r: 1.1 });
  }
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI * 2 * i) / 10;
    dots.push({ x: 14 + 10.5 * Math.cos(a), y: 14 + 10.5 * Math.sin(a), r: 0.8 });
  }
  return dots;
})();

export function MatarikiCluster({
  size = 28,
  className = '',
  gold = false,
}: {
  size?: number;
  className?: string;
  gold?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden
      className={className}
    >
      {CLUSTER_DOTS.map((d, i) => (
        <circle
          key={i}
          cx={d.x.toFixed(2)}
          cy={d.y.toFixed(2)}
          r={d.r}
          fill={gold ? '#D9B87A' : '#B5B0A2'}
          className={styles.clusterDot}
        />
      ))}
    </svg>
  );
}

/** The locked footer motto, tracked per the micro-label spec. */
export function AssemblMotto({ className = '' }: { className?: string }) {
  return (
    <span
      className={className}
      style={{
        fontSize: 10,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: ASSEMBL_WARM_GREY,
      }}
    >
      Adaptive. Connected. Purpose-built.
    </span>
  );
}

/** Lowercase tracked wordmark. Always lowercase — never uppercase-transform this. */
export function AssemblWordmark({ className = '' }: { className?: string }) {
  return (
    <span
      className={`font-mono lowercase ${className}`}
      style={{ letterSpacing: '0.3em' }}
    >
      assembl
    </span>
  );
}

/** Hover-levitate helper class for cards (2–4px, 400ms, motion-safe). */
export const levitateClass = styles.levitate;
