/**
 * assembl bills — visual identity, in ONE file.
 *
 * The dash look: warm cream and white, champagne gold, ink. Kate's call — the
 * plum canon is right for the marketing site, but bills is a consumer app that
 * has to stop a thumb, and the dash palette is the one that does it. The
 * values are dash's own (app/assembling/dash-kit.css), not an approximation,
 * so the two stay in step.
 *
 * Bills needs one thing dash does not: a reading of direction. Money kept and
 * money leaving have to be told apart at a glance, so two functional signals
 * sit alongside the palette — a deep pine for a saving, a warm rust for a cost.
 * Neither is decoration; both carry meaning a household needs.
 *
 * Everything downstream references these CSS vars, so swapping values here
 * re-skins every surface. `themeVars` mirrors them onto the layout root.
 */

export const BILLS = {
  // Surfaces (plum canon)
  paper: '#FFF7EC', // page base — dash cream
  bg2: '#FFFDF5', // secondary band — the palest cream
  surface: '#FFFFFF', // solid card
  surfaceAlt: '#FFFDF5', // inset panels
  line: '#EFEADC', // dash hairline

  // Ink (plum canon)
  ink: '#3A3832', // primary text — dash ink
  muted: '#56544B', // secondary
  faint: '#8A8678', // captions

  // Money staying home — the same green as the homepage live indicator
  teal: '#2E6146',
  tealDeep: '#234B36',
  tealSoft: 'rgba(46,97,70,0.10)',
  tealLine: 'rgba(46,97,70,0.28)',

  // Money leaving the wallet — the same warm red the phone uses for trouble
  coral: '#B4562E',
  coralDeep: '#93421F',
  coralSoft: 'rgba(180,86,46,0.10)',
  coralLine: 'rgba(180,86,46,0.28)',

  // Dusty rose — the canon accent, used sparingly
  gold: '#BFA37A',
  goldDeep: '#8A6A2E',
  goldSoft: 'rgba(191,163,122,0.18)',

  // Ochre alias (kept for existing refs) → rose accent
  ochre: '#BFA37A',
  ochreSoft: 'rgba(191,163,122,0.18)',

  positive: '#2E6146',
  positiveDeep: '#234B36',

  /** dash hi-vis — the one colour allowed to shout, for the headline figure */
  hivis: '#E4CFA1',
  hivisDeep: '#8A6A2E',

  // Brand chrome — plum, the canon ink. This is what buttons, badges, section
  // labels and headline highlights use. The green above is NOT brand: it means
  // money kept, and using it for chrome is what made bills read as a different
  // company from the rest of the site.
  brand: '#3A3832',
  brandDeep: '#2A2823',
  brandSoft: 'rgba(58,56,50,0.06)',
  brandLine: '#EFEADC',
} as const;

/**
 * Ordered palette for the category donut / multi-series charts.
 *
 * Built out from the canon: plum and rose lead, the two functional signals
 * follow, then muted supports that stay in the same warm range. Ordered so
 * neighbouring slices never share a hue family.
 */
export const CATEGORY_COLORS = [
  '#3A3832', // dash ink
  '#BFA37A', // champagne gold
  '#2E6146', // pine
  '#B4562E', // rust
  '#8A6A2E', // deep gold
  '#4A6B8C', // steely navy
  '#BDB592', // sage
  '#56544B', // warm grey
] as const;

/** Soft editorial shadows (drop-shadow filter strings) — quiet, never neon. */
export const GLOW = {
  teal: 'drop-shadow(0 1px 2px rgba(46,97,70,.25))',
  coral: 'drop-shadow(0 1px 2px rgba(180,86,46,.25))',
  gold: 'drop-shadow(0 1px 2px rgba(191,163,122,.3))',
} as const;

/** CSS custom properties for the /bills layout root. Inline-style scoped. */
export const themeVars: Record<string, string> = {
  '--b-paper': BILLS.paper,
  '--b-bg2': BILLS.bg2,
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
  '--b-coral-line': BILLS.coralLine,
  '--b-gold': BILLS.gold,
  '--b-gold-deep': BILLS.goldDeep,
  '--b-ochre': BILLS.ochre,
  '--b-ochre-soft': BILLS.ochreSoft,
  '--b-brand': BILLS.brand,
  '--b-brand-deep': BILLS.brandDeep,
  '--b-brand-soft': BILLS.brandSoft,
  '--b-brand-line': BILLS.brandLine,
  '--b-hivis': BILLS.hivis,
  '--b-hivis-deep': BILLS.hivisDeep,
  // paper card surface + quiet shadow tokens
  '--b-glass': 'rgba(255,255,255,0.75)',
  '--b-glass-2': 'rgba(255,255,255,0.9)',
  '--b-glow-teal': '0 0 0 1px rgba(46,97,70,.18), 0 10px 30px -14px rgba(46,97,70,.25)',
  '--b-glow-coral': '0 0 0 1px rgba(180,86,46,.18), 0 10px 30px -14px rgba(180,86,46,.25)',
  '--b-glow-brand': '0 0 0 1px rgba(58,56,50,.14), 0 10px 30px -14px rgba(58,56,50,.24)',
  // Type comes from the root layout's canon variables — one load, one system.
  '--font-bills-display': 'var(--font-display)',
  '--font-bills-body': 'var(--font-body)',
  '--font-bills-mono': 'var(--font-mono)',
};

export const display = { fontFamily: 'var(--font-bills-display), system-ui, sans-serif' } as const;
export const body = { fontFamily: 'var(--font-bills-body), system-ui, sans-serif' } as const;
