import styles from './DashLoader.module.css';

/**
 * Mark — the loader's assembling bar.
 *
 * Replaces the segmented dachshund as the default loader mark. Kate, 29 July
 * 2026, reviewing the demos: "the assembling page is also wrong and still shows
 * a dog." The dachshund was a mascot from an earlier product and it no longer
 * says anything true about what is happening while someone waits.
 *
 * This does. Four parts fill in sequence and dock into a core that orbits — the
 * same story the rest of the brand tells, and literally what the loader is
 * reporting: specialist agents finishing one at a time, work assembling into a
 * whole that a person then approves.
 *
 * Keeps the Dog's exact contract so nothing downstream has to change:
 *   · viewBox 1040×470, so `.dogWrap` sizing and every existing layout hold
 *   · four `.seg` rects, because the wave animation targets them by
 *     `nth-of-type` — four, in order, or the stagger breaks
 *   · `--dog-body` / `--dog-groove` / `--dog-ink`, so whitelabel mode still
 *     tints the mark to a customer's colour without touching path data
 *
 * Presentational only. Animation lives in DashLoader.module.css, driven by
 * data-status on the loader root.
 */
export function Mark({ ariaHidden = true }: { ariaHidden?: boolean }) {
  return (
    <svg
      className={styles.dog}
      viewBox="0 0 1040 470"
      fill="none"
      aria-hidden={ariaHidden}
      focusable="false"
    >
      {/* ground shadow — same weight the dog cast, so the mark sits, not floats */}
      <ellipse cx="520" cy="432" rx="360" ry="18" fill="#1a2a1c" opacity="0.06" />

      {/* the bar: four parts waiting to be filled */}
      <rect x="120" y="206" width="596" height="128" rx="26" fill="var(--dog-body)" />

      {/* fill segments, left→right — the stagger is in the CSS, not here */}
      <g className={styles.segs}>
        <rect className={styles.seg} x="132" y="206" width="140" height="128" />
        <rect className={styles.seg} x="281" y="206" width="140" height="128" />
        <rect className={styles.seg} x="430" y="206" width="140" height="128" />
        <rect className={styles.seg} x="579" y="206" width="125" height="128" />
      </g>

      {/* seams between the parts */}
      <g fill="var(--dog-groove)">
        <rect x="272" y="206" width="9" height="128" />
        <rect x="421" y="206" width="9" height="128" />
        <rect x="570" y="206" width="9" height="128" />
      </g>

      {/* the docking line — where the assembled work travels to */}
      <path
        className={styles.tail}
        d="M716 270 C 762 270 786 270 812 270"
        stroke="var(--dog-groove)"
        strokeWidth="10"
        strokeLinecap="round"
        opacity="0.55"
      />

      {/* the core it assembles into: rings behind, core, ring in front —
          the mark's own depth trick, the reason it reads as an orbit */}
      <g>
        <path
          d="M 736 270 A 140 78 0 0 1 1016 270"
          stroke="var(--dog-groove)"
          strokeWidth="11"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="876" cy="270" r="62" fill="var(--dog-body)" />
        <circle cx="876" cy="270" r="30" fill="var(--dog-ink)" opacity="0.9" />
        <path
          d="M 736 270 A 140 78 0 0 0 1016 270"
          stroke="var(--dog-ink)"
          strokeWidth="13"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
