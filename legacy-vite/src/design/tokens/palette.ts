/**
 * Assembl Canonical Color Palette
 * ────────────────────────────────────────────────────────────
 * SINGLE SOURCE OF TRUTH for every colour in the platform.
 *
 * Update colours HERE and they propagate everywhere that imports
 * from `@/design/tokens` (TS surfaces) or reads the matching CSS
 * variable defined in `tokens.css` (CSS / Tailwind / shadcn).
 *
 * Naming convention (locked 2026-04-24)
 * ───────────────────────────────────────
 *   • Neutrals are named after their warm-earth character:
 *     mist, cloud, sand, taupe, charcoal.
 *   • Accent uses goldLeaf (NEVER call it "gold" — there is one accent).
 *   • Status uses moss / honey / clay / haze (warm, never neon).
 *   • Per-kete accents keep their kete slug (waihanga, manaaki, …).
 *   • NEON IS BANNED. Do not add neon hues here.
 *
 * Hex values come from the Mārama Whenua palette (Brand Guidelines v3,
 * locked April 2026). Light theme only.
 */

/* ══════════════════════════════════════════════════════════════
   1. RAW PALETTE — pure colour values, no semantic meaning yet.
   ══════════════════════════════════════════════════════════════ */
export const palette = {
  // ── Neutrals (warm earth) ────────────────────────────────────
  mist:           "#F7F3EE", // background wash
  cloud:          "#EEE7DE", // raised surface / chip
  sand:           "#D8C8B4", // muted divider
  taupe:          "#9D8C7D", // headings, secondary icons
  taupeDeep:      "#6F6158", // body text
  taupeLight:     "#A89E94", // meta text
  charcoal:       "#3D4250", // strongest text (NEVER pure black)
  white:          "#FFFFFF", // pure surface

  // ── Single accent (CTAs, focus rings, active rail) ───────────
  goldLeaf:       "#D9BC7A", // Soft Gold — the ONLY accent
  goldLeafDeep:   "#B89B5C",

  // ── Status (warm, quiet — NEVER neon) ────────────────────────
  moss:           "#7FA88E", // success / ok
  honey:          "#D6B07A", // warn / caution
  clay:           "#C28A7A", // alert / error
  haze:           "#9BB5B8", // info / neutral signal

  // ── Per-kete accents (locked Brand Guidelines v3) ────────────
  keteManaaki:    "#E6D8C6", // Hospitality — Warm Linen
  keteWaihanga:   "#CBB8A4", // Construction — Clay Sand
  keteAuaha:      "#C8DDD8", // Creative — Pale Seafoam
  keteArataki:    "#D5C0C8", // Automotive — Dusky Rose
  keteHoko:       "#D8C3C2", // Retail — Blush Stone
  keteAko:        "#C7D6C7", // Early Childhood — Soft Sage
  keteToro:       "#C7D9E8", // Family — Moonstone Blue
  kotePikau:      "#B8C7B1", // (typo-safe duplicate, see ketePikau)
  ketePikau:      "#B8C7B1", // Freight & Customs — Soft Moss
} as const;

export type PaletteKey = keyof typeof palette;

/* ══════════════════════════════════════════════════════════════
   2. SEMANTIC TOKENS — meaning-first names. Components import
      these, never the raw palette keys above.
   ══════════════════════════════════════════════════════════════ */
export const tokens = {
  surface: {
    page:      palette.mist,
    raised:    palette.white,
    sunken:    palette.cloud,
    overlay:   "rgba(247,243,238,0.86)",
  },
  text: {
    strong:    palette.charcoal,    // titles you want to read first
    primary:   palette.taupeDeep,   // body
    secondary: palette.taupe,       // labels
    muted:     palette.taupeLight,  // captions, meta
    onAccent:  palette.charcoal,    // text sitting on goldLeaf
  },
  border: {
    soft:    "rgba(142,129,119,0.14)",
    hover:   "rgba(142,129,119,0.28)",
    accent:  "rgba(217,188,122,0.40)",
  },
  shadow: {
    soft:  "0 8px 30px rgba(111,97,88,0.08)",
    card:  "0 4px 20px rgba(111,97,88,0.06)",
    lift:  "0 12px 40px rgba(111,97,88,0.12)",
  },
  accent: {
    base:    palette.goldLeaf,
    deep:    palette.goldLeafDeep,
    soft:    "rgba(217,188,122,0.18)",
    ring:    "rgba(217,188,122,0.40)",
  },
  status: {
    ok:        palette.moss,
    okSoft:    "rgba(127,168,142,0.14)",
    warn:      palette.honey,
    warnSoft:  "rgba(214,176,122,0.16)",
    alert:     palette.clay,
    alertSoft: "rgba(194,138,122,0.16)",
    info:      palette.haze,
    infoSoft:  "rgba(155,181,184,0.16)",
  },
  radius: {
    card:  "24px",
    chip:  "16px",
    pill:  "999px",
  },
  font: {
    display: "Cormorant Garamond, serif",
    body:    "Inter, sans-serif",
    mono:    "IBM Plex Mono, monospace",
  },
} as const;

/* ══════════════════════════════════════════════════════════════
   3. KETE ACCENTS — per-vertical accent strip. Use getKeteAccent().
   ══════════════════════════════════════════════════════════════ */
export type KeteSlug =
  | "manaaki" | "waihanga" | "auaha" | "arataki"
  | "pikau"   | "hoko"     | "ako"   | "toro" | "admin";

export interface KeteAccent {
  base: string;   // accent fill / chip
  deep: string;   // icon strokes / accent text
  soft: string;   // wash backgrounds
  ring: string;   // focus halo
}

const accentSoft = (hex: string, alpha = 0.18) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

export const keteAccents: Record<KeteSlug, KeteAccent> = {
  manaaki:  { base: palette.keteManaaki,  deep: "#B89E80", soft: accentSoft(palette.keteManaaki),  ring: accentSoft(palette.keteManaaki, 0.40) },
  waihanga: { base: palette.keteWaihanga, deep: "#A89580", soft: accentSoft(palette.keteWaihanga), ring: accentSoft(palette.keteWaihanga, 0.40) },
  auaha:    { base: palette.keteAuaha,    deep: "#7FA8A0", soft: accentSoft(palette.keteAuaha, 0.20), ring: accentSoft(palette.keteAuaha, 0.42) },
  arataki:  { base: palette.keteArataki,  deep: "#A88494", soft: accentSoft(palette.keteArataki),  ring: accentSoft(palette.keteArataki, 0.40) },
  pikau:    { base: palette.ketePikau,    deep: "#7E947A", soft: accentSoft(palette.ketePikau),    ring: accentSoft(palette.ketePikau, 0.40) },
  hoko:     { base: palette.keteHoko,     deep: "#A88787", soft: accentSoft(palette.keteHoko),     ring: accentSoft(palette.keteHoko, 0.40) },
  ako:      { base: palette.keteAko,      deep: "#809980", soft: accentSoft(palette.keteAko),      ring: accentSoft(palette.keteAko, 0.40) },
  toro:     { base: palette.keteToro,     deep: "#7395B5", soft: accentSoft(palette.keteToro, 0.20), ring: accentSoft(palette.keteToro, 0.42) },
  admin:    { base: palette.goldLeaf,     deep: palette.goldLeafDeep, soft: accentSoft(palette.goldLeaf), ring: accentSoft(palette.goldLeaf, 0.40) },
};

export const getKeteAccent = (kete: KeteSlug = "admin"): KeteAccent =>
  keteAccents[kete] ?? keteAccents.admin;

/* ══════════════════════════════════════════════════════════════
   4. TOKEN HELPER — dot-path lookup so components stay readable.
      Example:  getToken("text.strong")  →  "#3D4250"
   ══════════════════════════════════════════════════════════════ */
type DotPath<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends object
    ? DotPath<T[K], `${P}${K}.`>
    : `${P}${K}`;
}[keyof T & string];

export type TokenPath = DotPath<typeof tokens>;

export function getToken(path: TokenPath): string {
  return path.split(".").reduce<unknown>(
    (acc, key) => (acc as Record<string, unknown>)?.[key],
    tokens,
  ) as string;
}
