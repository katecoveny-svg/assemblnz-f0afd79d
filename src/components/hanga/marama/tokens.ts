/**
 * Mārama Whenua tokens scoped for the WAIHANGA construction kete.
 * All values map back to the locked palette in src/index.css and
 * src/design/assemblTokens.ts. No dark-theme hex codes allowed here.
 */

export const MARAMA_WAIHANGA = {
  // Background washes — light, warm, NEVER dark
  surface: "#F7F3EE",        // Mist
  surfaceRaised: "#FFFFFF",  // Card glass
  surfaceMuted: "#EEE7DE",   // Cloud

  // Text
  textPrimary: "#6F6158",    // Taupe Deep — body & headings
  textSecondary: "#8E8177",  // Taupe — captions, labels
  textMuted: "#A89E94",      // Taupe Light — meta

  // Borders & shadows
  borderSoft: "rgba(142,129,119,0.14)",
  borderHover: "rgba(142,129,119,0.28)",
  shadowSoft: "0 8px 30px rgba(111,97,88,0.08)",
  shadowCard: "0 4px 20px rgba(111,97,88,0.06)",
  shadowHover: "0 12px 40px rgba(111,97,88,0.12)",

  // Industry accent (Clay Sand — locked for WAIHANGA)
  accent: "#CBB8A4",
  accentSoft: "rgba(203,184,164,0.16)",
  accentRing: "rgba(203,184,164,0.40)",
  accentDeep: "#A89580",

  // CTA
  cta: "#D9BC7A",            // Soft Gold
  ctaSoft: "rgba(217,188,122,0.18)",
  ctaDeep: "#B89B5C",

  // Status (kept warm and quiet — no neon)
  ok: "#7FA88E",             // Sage
  okSoft: "rgba(127,168,142,0.14)",
  warn: "#D6B07A",           // Soft amber
  warnSoft: "rgba(214,176,122,0.16)",
  alert: "#C28A7A",          // Warm clay red
  alertSoft: "rgba(194,138,122,0.16)",
  info: "#9BB5B8",           // Cool sage mist
  infoSoft: "rgba(155,181,184,0.16)",
} as const;

export type MaramaToken = typeof MARAMA_WAIHANGA;
