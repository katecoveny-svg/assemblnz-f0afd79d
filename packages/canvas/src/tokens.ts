/**
 * @assembl/canvas — design tokens.
 *
 * Every value here is VERBATIM from the locked visual canon:
 * `public/brand/direction/DIRECTION-LOCKED-2026-07-01.md`.
 * Aligned with the pilot-chrome kit in `components/assembl/chrome.tsx`
 * (PR #644) — do not fork divergent values.
 *
 * This module is plain data (no React, no directives) so it is safe to
 * import from React Server Components via `@assembl/canvas/tokens`.
 */

export const palette = {
  /** warm paper white — the background of every surface */
  paper: '#ffffff',
  /** deeper paper — secondary background / subtle panels */
  paperDeep: '#f7f9f8',
  /** particulate silver — light dots and strokes */
  silver: '#D8D6CE',
  /** particulate warm-grey silver — denser dots */
  silverDeep: '#B5B0A2',
  /** particulate cream mid-tone (from the shipped landscape asset) */
  cream: '#C9C5BA',
  /** cool blue undertone inside the particulate art */
  blueUndertone: '#8DA0B8',
  /** warm champagne gold flecks — sparse, ornamental */
  gold: '#BFA37A',
  /** soft gold — secondary flecks and the constellation lines */
  goldSoft: '#D9B87A',
  /** ink text */
  ink: '#313c42',
  /** warm champagne gold accent — the tiny period after "advantage." and CTA emphasis */
  accentGold: '#b8964f',
  /** steely navy — cool structural accent inside the art */
  navy: '#4A6B8C',
  /** bronze / tan — deep warm accent */
  bronze: '#8A6B4E',
  /** warm grey body copy */
  bodyGrey: '#68766f',
  /** hairline borders on paper (aligned with PR #644 chrome) */
  hairline: '#e8ecea',
} as const;

/**
 * The current assembl canon — plum, dusty rose, chalk.
 *
 * This is the palette the homepage ships (app/active-journey-home.css) and the
 * one the rest of the site is migrating onto. `palette` above is the earlier
 * champagne/navy system and is kept only so existing consumers keep rendering
 * while they move across; new work should read from here.
 *
 * Typography is Instrument Sans for display and body, IBM Plex Mono for labels,
 * evidence and timestamps — already wired in app/layout.tsx as --font-display,
 * --font-body and --font-mono, so components should use those variables rather
 * than naming a family.
 */
export const canon = {
  /** warm paper — the ground of every light surface */
  paper: '#FFFDFB',
  /** chalk — panels, message grounds, type on plum */
  chalk: '#F5F1F2',
  /** plum — ink on paper, and the ground of every dark surface */
  plum: '#240B21',
  /** muted plum — body copy, secondary type */
  plumMuted: '#654A4E',
  /** dusty rose — the accent, used sparingly */
  rose: '#916A70',
  /** hairline on paper */
  hairline: 'rgba(36, 11, 33, 0.18)',
  /** hairline on plum */
  hairlineInverse: 'rgba(255, 255, 255, 0.15)',
} as const;

export const typography = {
  /** Display + headings: Cormorant Garamond, lowercase, tracked slightly loose, weight 400–500. */
  display: {
    fontFamily: "var(--font-display, 'Cormorant Garamond'), Georgia, serif",
    fontWeight: 500,
    fontWeightMin: 400,
    fontWeightMax: 500,
    textTransform: 'lowercase',
    letterSpacing: '0.01em',
  },
  /** Body: Inter or similar quiet grotesk — small, warm grey. */
  body: {
    fontFamily: "var(--font-sans, Inter), system-ui, -apple-system, sans-serif",
    color: palette.bodyGrey,
    fontSize: '15px',
    lineHeight: 1.55,
  },
  /** Micro / labels: uppercase, tracked 0.16em. The ONLY uppercase on-brand. */
  micro: {
    fontFamily: "var(--font-sans, Inter), system-ui, -apple-system, sans-serif",
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    fontSize: '12px',
  },
  /** Mono micro labels: Space Mono, uppercase, tracked 0.16em (the loader label). */
  mono: {
    fontFamily:
      "var(--font-mono, 'Space Mono'), ui-monospace, 'SFMono-Regular', Menlo, monospace",
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    fontSize: '12px',
  },
} as const;

export const motionTokens = {
  /** Particulate landscape drifts slowly (5–10% opacity shift, 60s cycle). */
  drift: {
    durationS: 60,
    opacityMax: 1,
    opacityMin: 0.9,
    ease: 'easeInOut',
  },
  /** Constellation dots pulse softly (1.5s ease, 40% opacity range). */
  pulse: {
    durationS: 1.5,
    opacityMin: 0.5,
    opacityMax: 0.9,
    ease: 'easeInOut',
  },
  /** Bundle cards levitate on hover (2–4px translate-y, 400ms ease). */
  levitate: {
    translateYPx: -3,
    rangePx: [2, 4],
    durationMs: 400,
    ease: 'easeOut',
  },
} as const;

/** The footer motto — Living Business OS direction (Kate, 2026-07-11). */
export const motto = 'Less admin. More mahi.';

export const tokens = {
  palette,
  canon,
  typography,
  motion: motionTokens,
  motto,
} as const;

export type CanvasTokens = typeof tokens;
