/**
 * Assembl Design Tokens — canonical source
 * ----------------------------------------
 * Locked palette and UI tokens (2026-04-22). Industry accents map 1:1
 * to the eight active kete. All colors stay in HEX here so this file
 * can be consumed by JS surfaces (charts, Remotion, edge-rendered PDFs).
 *
 * For Tailwind / CSS use the matching HSL variables in `index.css`.
 */

export const ASSEMBL_TOKENS = {
  core: {
    colors: {
      "assembl-mist": "#F7F3EE",
      "assembl-cloud": "#EEE7DE",
      "assembl-sand": "#D8C8B4",
      "assembl-taupe": "#9D8C7D",
      "assembl-taupe-deep": "#6F6158",
      "assembl-sage-mist": "#C9D8D0",
      "assembl-soft-gold": "#D9BC7A",
    },
    text: {
      "text-primary": "#6F6158",
      "text-secondary": "#8E8177",
      "text-body": "#5F554F",
      "border-soft": "rgba(142,129,119,0.14)",
      "shadow-soft": "0 8px 30px rgba(111,97,88,0.08)",
    },
    radius: {
      "radius-card": "24px",
      "radius-chip": "16px",
      "radius-pill": "999px",
    },
    fonts: {
      display: "Cormorant Garamond, serif",
      body: "Inter, sans-serif",
      mono: "IBM Plex Mono, monospace",
    },
  },
  industries: {
    "PIKAU-01":   { name: "Freight & Customs",  accent_name: "Soft Moss",      accent_hex: "#B8C7B1" },
    "HOKO-02":    { name: "Retail",             accent_name: "Blush Stone",    accent_hex: "#D8C3C2" },
    "AKO-03":     { name: "Early Childhood",    accent_name: "Soft Sage",      accent_hex: "#C7D6C7" },
    "TORO-04":    { name: "Family",             accent_name: "Moonstone Blue", accent_hex: "#C7D9E8" },
    "MANAAKI-05": { name: "Hospitality",        accent_name: "Warm Linen",     accent_hex: "#E6D8C6" },
    "WAIHANGA-06":{ name: "Construction",       accent_name: "Clay Sand",      accent_hex: "#CBB8A4" },
    "ARATAKI-07": { name: "Automotive & Fleet", accent_name: "Dusky Rose",     accent_hex: "#D5C0C8" },
    "AUAHA-08":   { name: "Creative",           accent_name: "Pale Seafoam",   accent_hex: "#C8DDD8" },
  },
  ui: {
    theme: "light",
    card_padding: "24px",
    button_style: "rounded-pill",
    surface_style: "soft glass",
    recommended_cta_examples: [
      "See what a quiet day looks like",
      "Request access",
      "Open pack",
      "View activity",
    ],
  },
} as const;

export type IndustryCode = keyof typeof ASSEMBL_TOKENS.industries;

/** Look up the accent hex for an industry code. */
export const industryAccent = (code: IndustryCode): string =>
  ASSEMBL_TOKENS.industries[code].accent_hex;

/** Lowercase slug → industry code (e.g. "manaaki" → "MANAAKI-05"). */
export const industryBySlug = (slug: string): IndustryCode | undefined => {
  const target = slug.toLowerCase();
  return (Object.keys(ASSEMBL_TOKENS.industries) as IndustryCode[])
    .find((k) => k.split("-")[0].toLowerCase() === target);
};
