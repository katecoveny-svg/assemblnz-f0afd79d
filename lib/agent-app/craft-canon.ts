/**
 * Agent-app factory craft canon — Kate OVERRIDE (locked).
 *
 * Field = paper `#FFFDFB` (engineering sheet). Never a full-field dark plum wash.
 * Plum `#240B21` = accent only (lines, pins, CTAs, title-block ink).
 * Type = Instrument Sans + IBM Plex Mono (labels / evidence only).
 * Motion = Lenis + GSAP pin/scrub assemble (flat-lay → plan).
 *
 * Applies to every vertical that imports `components/agent-app/*`
 * (Arc, Forge, Ensemble, future). Do not introduce cream/orange Heron
 * leftovers, dark plum fields, mana/kete product labels, or AI-slop copy.
 */

export const AGENT_APP_CRAFT = {
  field: '#FFFDFB',
  chalk: '#F5F1F2',
  plum: '#240B21',
  muted: '#654A4E',
  rose: '#916A70',
  /** Forbidden full-field backgrounds (legacy Arc Heron-class dark wash). */
  bannedFieldHex: ['#1a0818', '#160812', '#1c0c19', '#1a0c18', '#0b1f3a'] as const,
  fonts: {
    sans: 'Instrument Sans',
    mono: 'IBM Plex Mono',
  },
  rootClass: 'aa-root',
  craftAttr: 'paper-blueprint',
} as const;

/** Customer-facing / preview-copy hard-fail patterns (case-insensitive). */
export const AGENT_APP_COPY_HARD_FAIL = [
  /\bmana\b/i,
  /\bkete\b/i,
  /\bheron\b/i,
  /\bbearplus\b/i,
  /\bquietly\b/i,
  /\bseamless(?:ly)?\b/i,
  /\beffortless(?:ly)?\b/i,
  /\bunlock\b/i,
  /\bempower\b/i,
  /\belevate\b/i,
  /\bsupercharge\b/i,
  /\brevolutioni[sz]e\b/i,
  /\bgame-changing\b/i,
  /\bcutting-edge\b/i,
  /\bharness the power\b/i,
  /\btake your business to the next level\b/i,
  /\bin today's fast-paced world\b/i,
  /\bin partnership with\b/i,
  /\bofficial partner\b/i,
  /(?<![a-z])AI(?![a-z])/i, // bare "AI"
] as const;
