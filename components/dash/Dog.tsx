/**
 * Dog — the segmented dachshund mark.
 *
 * Geometry is LOCKED: ported verbatim from the design handoff
 * (`Dash Loader Component.html` #cdog / `dash-dog.svg`), viewBox 1040×470.
 * Do NOT redraw. Hardcoded sage fills are replaced with CSS custom
 * properties so `whitelabel` mode can tint the body to a customer's brand
 * colour without touching the path data:
 *   --dog-body   (sage body / legs / head / ears)
 *   --dog-groove (the darker segment seams)
 *   --dog-ink    (nose + eye)
 *
 * Animation lives in DashLoader.module.css and is driven by the
 * data-status / data-reduced attributes on the loader root, not here — this
 * component is purely presentational.
 */
import styles from './DashLoader.module.css';

export function Dog({ ariaHidden = true }: { ariaHidden?: boolean }) {
  return (
    <svg
      className={styles.dog}
      viewBox="0 0 1040 470"
      fill="none"
      aria-hidden={ariaHidden}
      focusable="false"
    >
      {/* ground shadow */}
      <ellipse cx="560" cy="432" rx="372" ry="20" fill="#1a2a1c" opacity="0.06" />
      {/* tail (wags on success) */}
      <path
        className={styles.tail}
        d="M206 250 C 158 252 128 228 120 190"
        stroke="var(--dog-body)"
        strokeWidth="26"
        strokeLinecap="round"
      />
      {/* legs */}
      <rect x="214" y="298" width="48" height="118" rx="22" fill="var(--dog-body)" />
      <rect x="650" y="298" width="48" height="118" rx="22" fill="var(--dog-body)" />
      {/* body base */}
      <rect x="185" y="206" width="548" height="128" rx="22" fill="var(--dog-body)" />
      {/* fill segments (forest, animated left→right) */}
      <g className={styles.segs}>
        <rect className={styles.seg} x="296" y="206" width="92.75" height="128" />
        <rect className={styles.seg} x="397.75" y="206" width="92.75" height="128" />
        <rect className={styles.seg} x="499.5" y="206" width="92.75" height="128" />
        <rect className={styles.seg} x="601.25" y="206" width="92.75" height="128" />
      </g>
      {/* segment seams */}
      <g fill="var(--dog-groove)">
        <rect x="388.75" y="206" width="9" height="128" />
        <rect x="490.5" y="206" width="9" height="128" />
        <rect x="592.25" y="206" width="9" height="128" />
      </g>
      {/* head + snout */}
      <rect x="712" y="156" width="150" height="178" rx="52" fill="var(--dog-body)" />
      <rect x="842" y="214" width="156" height="84" rx="34" fill="var(--dog-body)" />
      {/* ear (droops on error) */}
      <g className={styles.ear}>
        <path
          d="M768 166 C 732 168 714 204 718 250 C 720 290 740 320 776 322 C 812 320 822 290 822 248 C 822 202 804 166 768 166 Z"
          fill="var(--dog-body)"
          stroke="var(--d-surface)"
          strokeWidth="7"
        />
      </g>
      {/* nose + eye */}
      <rect x="962" y="222" width="38" height="48" rx="19" fill="var(--dog-ink)" />
      <circle cx="838" cy="200" r="13" fill="var(--dog-ink)" />
      {/* success check (gold) */}
      <g className={styles.check}>
        <circle cx="930" cy="150" r="40" fill="var(--d-gold)" />
        <path
          d="M912 150 l12 12 l22 -24"
          fill="none"
          stroke="var(--d-forest)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
