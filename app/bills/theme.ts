/**
 * Assembl Bills — visual identity, in ONE file.
 *
 * A calm, finance-adjacent palette, deliberately distinct from its siblings:
 *   • Alphassembl = navy + amber      • TOA = paper white + gold
 *   • Assembl Bills = warm paper + a considered muted teal + a warm coral
 *
 * Teal reads as "trusted, considered, NZ". Coral marks money leaving the wallet
 * (costs, price rises, hidden charges). Teal marks money staying in it (savings).
 *
 * If Kate provides her Perplexity preview screenshots, swap the six BILLS.*
 * accent values below and every surface updates — nothing else references raw
 * hex. `themeVars` mirrors these into CSS custom properties for the layout.
 */

export const BILLS = {
  // Surfaces
  paper: '#FBFAF6', // off-white page
  surface: '#FFFFFF', // cards
  surfaceAlt: '#F4F2EA', // inset panels / table stripes
  line: '#E7E3D6', // warm hairline

  // Ink
  ink: '#18211F', // deep near-black, faint green cast
  muted: '#5E6B67', // secondary text
  faint: '#8A938F', // captions, meta

  // Accent — muted teal
  teal: '#3E8A88',
  tealDeep: '#2E6A69', // text-on-paper strength
  tealSoft: '#ECF4F3', // tint background
  tealLine: '#CFE4E2',

  // Money leaving the wallet — warm coral
  coral: '#DE6E52',
  coralDeep: '#B8503A',
  coralSoft: '#FBECE6',

  // Muted ochre for cautions/alerts (NOT canary — deliberately desaturated)
  ochre: '#B8813C',
  ochreSoft: '#F6EEDE',

  // Positive = savings = teal family (kept as an alias for chart clarity)
  positive: '#3E8A88',
  positiveDeep: '#2E6A69',
} as const;

/** Ordered palette for category donut / multi-series charts. Teal-led, warm-accented. */
export const CATEGORY_COLORS = [
  '#3E8A88', // teal
  '#DE6E52', // coral
  '#5E8C7B', // sage
  '#B8813C', // ochre
  '#6E8FA6', // slate blue
  '#9C6F86', // mauve
  '#7A7D55', // olive
  '#C08A6A', // clay
] as const;

/** CSS custom properties for the /bills layout root. Inline-style scoped — no globals. */
export const themeVars: Record<string, string> = {
  '--b-paper': BILLS.paper,
  '--b-surface': BILLS.surface,
  '--b-surface-alt': BILLS.surfaceAlt,
  '--b-line': BILLS.line,
  '--b-ink': BILLS.ink,
  '--b-muted': BILLS.muted,
  '--b-faint': BILLS.faint,
  '--b-teal': BILLS.teal,
  '--b-teal-deep': BILLS.tealDeep,
  '--b-teal-soft': BILLS.tealSoft,
  '--b-teal-line': BILLS.tealLine,
  '--b-coral': BILLS.coral,
  '--b-coral-deep': BILLS.coralDeep,
  '--b-coral-soft': BILLS.coralSoft,
  '--b-ochre': BILLS.ochre,
  '--b-ochre-soft': BILLS.ochreSoft,
};

/** Convenience style fragments used across surfaces. */
export const display = { fontFamily: 'var(--font-bills-display), system-ui, sans-serif' } as const;
export const body = { fontFamily: 'var(--font-bills-body), system-ui, sans-serif' } as const;
