/**
 * Assembl Bills — visual identity, in ONE file.
 *
 * A dark "cosmic-fintech" identity in the assembl family: deep space base,
 * glass surfaces, multi-layer glow. Teal (pounamu) is Bills' signature accent —
 * kept teal-led so it stays distinct from the gold-led master brand — with a
 * warm coral for money leaving the wallet and a whisper of kōwhai gold for
 * premium highlights. Money staying home glows teal; money leaving glows coral.
 *
 * Everything downstream references these CSS vars, so swapping values here
 * re-skins every surface. `themeVars` mirrors them onto the layout root.
 */

export const BILLS = {
  // Surfaces (deep space)
  paper: '#080A12', // page base
  bg2: '#0C0F1A', // secondary band
  surface: '#111623', // solid card fallback (glass layered on top in components)
  surfaceAlt: '#161C2C', // inset panels
  line: 'rgba(255,255,255,0.09)', // hairline on dark

  // Ink (light on dark)
  ink: '#EEF2F8', // primary text
  muted: '#9BA8BD', // secondary
  faint: '#64748B', // captions

  // Accent — pounamu teal, brightened for glow on dark
  teal: '#5AADA0',
  tealDeep: '#3A7D6E',
  tealSoft: 'rgba(90,173,160,0.13)',
  tealLine: 'rgba(90,173,160,0.32)',

  // Money leaving the wallet — warm coral
  coral: '#F2825E',
  coralDeep: '#E0674A',
  coralSoft: 'rgba(242,130,94,0.13)',
  coralLine: 'rgba(242,130,94,0.30)',

  // Kōwhai gold — premium accent, used sparingly
  gold: '#E9C46A',
  goldDeep: '#D4A843',
  goldSoft: 'rgba(233,196,106,0.12)',

  // Ochre alias (kept for existing refs) → gold family
  ochre: '#E9C46A',
  ochreSoft: 'rgba(233,196,106,0.12)',

  positive: '#5AADA0',
  positiveDeep: '#3A7D6E',
} as const;

/** Ordered palette for the category donut / multi-series charts — luminous on dark. */
export const CATEGORY_COLORS = [
  '#5AADA0', // teal
  '#F2825E', // coral
  '#E9C46A', // gold
  '#7FB2C8', // sky
  '#A98BD6', // violet
  '#6FCF97', // mint
  '#E58FB0', // rose
  '#C0A16A', // clay
] as const;

/** Multi-layer glow presets (drop-shadow filter strings) — the assembl POP move. */
export const GLOW = {
  teal: 'drop-shadow(0 0 8px rgba(90,173,160,.55)) drop-shadow(0 0 26px rgba(90,173,160,.28))',
  coral: 'drop-shadow(0 0 8px rgba(242,130,94,.55)) drop-shadow(0 0 26px rgba(242,130,94,.28))',
  gold: 'drop-shadow(0 0 8px rgba(233,196,106,.55)) drop-shadow(0 0 26px rgba(212,168,67,.28))',
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
  // glass surface + glow tokens
  '--b-glass': 'rgba(255,255,255,0.035)',
  '--b-glass-2': 'rgba(255,255,255,0.06)',
  '--b-glow-teal': '0 0 0 1px rgba(90,173,160,.25), 0 8px 40px -12px rgba(90,173,160,.35)',
  '--b-glow-coral': '0 0 0 1px rgba(242,130,94,.25), 0 8px 40px -12px rgba(242,130,94,.35)',
};

export const display = { fontFamily: 'var(--font-bills-display), system-ui, sans-serif' } as const;
export const body = { fontFamily: 'var(--font-bills-body), system-ui, sans-serif' } as const;
