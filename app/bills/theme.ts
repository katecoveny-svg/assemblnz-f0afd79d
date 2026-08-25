/**
 * assembl bills — visual identity, in ONE file.
 *
 * The plum canon, same as the rest of the site: warm paper #FFFDFB, chalk
 * #F5F1F2, plum ink #240B21, muted plum #654A4E, dusty rose #916A70 as the
 * ornament. Type is Instrument Sans with IBM Plex Mono for labels, figures and
 * timestamps — aliased off the root layout's variables rather than loaded again.
 *
 * Bills needs one thing the marketing pages do not: a reading of direction.
 * Money kept and money leaving have to be told apart at a glance, so two
 * functional signals sit inside the canon rather than beside it — the same
 * green the homepage uses for its live indicator, and the same warm red the
 * homepage phone uses when something has gone wrong. Neither is decoration;
 * both carry meaning a household needs.
 *
 * Everything downstream references these CSS vars, so swapping values here
 * re-skins every surface. `themeVars` mirrors them onto the layout root.
 */

export const BILLS = {
  // Surfaces (plum canon)
  paper: '#FFFDFB', // page base — canon paper
  bg2: '#F5F1F2', // secondary band — canon chalk
  surface: '#FFFFFF', // solid card
  surfaceAlt: '#F5F1F2', // inset panels — canon chalk
  line: 'rgba(36,11,33,0.18)', // canon hairline on paper

  // Ink (plum canon)
  ink: '#240B21', // primary text — canon plum
  muted: '#654A4E', // secondary — canon muted plum
  faint: 'rgba(36,11,33,0.55)', // captions

  // Money staying home — the same green as the homepage live indicator
  teal: '#2F6B4F',
  tealDeep: '#245740',
  tealSoft: 'rgba(47,107,79,0.10)',
  tealLine: 'rgba(47,107,79,0.28)',

  // Money leaving the wallet — the same warm red the phone uses for trouble
  coral: '#8E2F3A',
  coralDeep: '#74242D',
  coralSoft: 'rgba(142,47,58,0.10)',
  coralLine: 'rgba(142,47,58,0.28)',

  // Dusty rose — the canon accent, used sparingly
  gold: '#916A70',
  goldDeep: '#7A555B',
  goldSoft: 'rgba(145,106,112,0.14)',

  // Ochre alias (kept for existing refs) → rose accent
  ochre: '#916A70',
  ochreSoft: 'rgba(145,106,112,0.14)',

  positive: '#2F6B4F',
  positiveDeep: '#245740',

  // Brand chrome — plum, the canon ink. This is what buttons, badges, section
  // labels and headline highlights use. The green above is NOT brand: it means
  // money kept, and using it for chrome is what made bills read as a different
  // company from the rest of the site.
  brand: '#240B21',
  brandDeep: '#3A1435',
  brandSoft: 'rgba(36,11,33,0.06)',
  brandLine: 'rgba(36,11,33,0.18)',
} as const;

/**
 * Ordered palette for the category donut / multi-series charts.
 *
 * Built out from the canon: plum and rose lead, the two functional signals
 * follow, then muted supports that stay in the same warm range. Ordered so
 * neighbouring slices never share a hue family.
 */
export const CATEGORY_COLORS = [
  '#240B21', // plum
  '#916A70', // dusty rose
  '#2F6B4F', // pounamu — kept
  '#8E2F3A', // warm red
  '#654A4E', // muted plum
  '#4A6B8C', // steely navy
  '#B08D93', // pale rose
  '#8A6B4E', // bronze
] as const;

/** Soft editorial shadows (drop-shadow filter strings) — quiet, never neon. */
export const GLOW = {
  teal: 'drop-shadow(0 1px 2px rgba(47,107,79,.25))',
  coral: 'drop-shadow(0 1px 2px rgba(142,47,58,.25))',
  gold: 'drop-shadow(0 1px 2px rgba(145,106,112,.3))',
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
  // paper card surface + quiet shadow tokens
  '--b-glass': 'rgba(255,255,255,0.75)',
  '--b-glass-2': 'rgba(255,255,255,0.9)',
  '--b-glow-teal': '0 0 0 1px rgba(47,107,79,.18), 0 10px 30px -14px rgba(47,107,79,.25)',
  '--b-glow-coral': '0 0 0 1px rgba(142,47,58,.18), 0 10px 30px -14px rgba(142,47,58,.25)',
  '--b-glow-brand': '0 0 0 1px rgba(36,11,33,.14), 0 10px 30px -14px rgba(36,11,33,.24)',
  // Type comes from the root layout's canon variables — one load, one system.
  '--font-bills-display': 'var(--font-display)',
  '--font-bills-body': 'var(--font-body)',
  '--font-bills-mono': 'var(--font-mono)',
};

export const display = { fontFamily: 'var(--font-bills-display), system-ui, sans-serif' } as const;
export const body = { fontFamily: 'var(--font-bills-body), system-ui, sans-serif' } as const;
