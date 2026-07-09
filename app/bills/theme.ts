/**
 * assembl bills — visual identity, in ONE file.
 *
 * The master assembl look: warm paper, ink, champagne gold ornament, and
 * pounamu green as bills' working accent (money staying home is pounamu;
 * money leaving the wallet is warm terracotta). Editorial, light, quiet —
 * the same canon as the marketing site, not a separate cosmic identity.
 *
 * Everything downstream references these CSS vars, so swapping values here
 * re-skins every surface. `themeVars` mirrors them onto the layout root.
 */

export const BILLS = {
  // Surfaces (warm paper — assembl canon)
  paper: '#FBFAF6', // page base
  bg2: '#F7F5EE', // secondary band
  surface: '#FFFFFF', // solid card
  surfaceAlt: '#F7F5EE', // inset panels
  line: '#E7E4DA', // hairline on paper

  // Ink (assembl canon)
  ink: '#1A1918', // primary text
  muted: '#5A5850', // secondary
  faint: '#9A958A', // captions

  // Accent — pounamu green (money staying home)
  teal: '#2B6B57',
  tealDeep: '#1A4D3D',
  tealSoft: 'rgba(43,107,87,0.10)',
  tealLine: 'rgba(43,107,87,0.28)',

  // Money leaving the wallet — warm terracotta
  coral: '#B85C3E',
  coralDeep: '#9C4830',
  coralSoft: 'rgba(184,92,62,0.10)',
  coralLine: 'rgba(184,92,62,0.28)',

  // Champagne gold — ornament, used sparingly (assembl canon)
  gold: '#BFA37A',
  goldDeep: '#A98B5D',
  goldSoft: 'rgba(191,163,122,0.14)',

  // Ochre alias (kept for existing refs) → gold family
  ochre: '#BFA37A',
  ochreSoft: 'rgba(191,163,122,0.14)',

  positive: '#2B6B57',
  positiveDeep: '#1A4D3D',
} as const;

/** Ordered palette for the category donut / multi-series charts — ink-weighted on paper. */
export const CATEGORY_COLORS = [
  '#2B6B57', // pounamu
  '#B85C3E', // terracotta
  '#BFA37A', // champagne gold
  '#4A6B8C', // steely navy
  '#7A5FA8', // violet
  '#3E7D57', // leaf
  '#B05C7F', // rose
  '#8A6B4E', // bronze
] as const;

/** Soft editorial shadows (drop-shadow filter strings) — quiet, never neon. */
export const GLOW = {
  teal: 'drop-shadow(0 1px 2px rgba(43,107,87,.25))',
  coral: 'drop-shadow(0 1px 2px rgba(184,92,62,.25))',
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
  // paper card surface + quiet shadow tokens
  '--b-glass': 'rgba(255,255,255,0.75)',
  '--b-glass-2': 'rgba(255,255,255,0.9)',
  '--b-glow-teal': '0 0 0 1px rgba(43,107,87,.18), 0 10px 30px -14px rgba(43,107,87,.25)',
  '--b-glow-coral': '0 0 0 1px rgba(184,92,62,.18), 0 10px 30px -14px rgba(184,92,62,.25)',
};

export const display = { fontFamily: 'var(--font-bills-display), Georgia, serif' } as const;
export const body = { fontFamily: 'var(--font-bills-body), system-ui, sans-serif' } as const;
