/**
 * Mārama Whenua — shared token map for every dashboard.
 *
 * One source of truth for the surface, text, border, shadow, status,
 * and per-kete accent palette. All values come from the locked
 * Mārama Whenua palette (light theme only — never dark).
 *
 * Usage:
 *   import { MARAMA, getKeteAccent } from "@/components/shared/marama/tokens";
 *   const accent = getKeteAccent("waihanga");
 *
 * Or via context:
 *   <MaramaKeteProvider kete="auaha">…</MaramaKeteProvider>
 */

export type KeteSlug =
  | "manaaki"
  | "waihanga"
  | "auaha"
  | "arataki"
  | "pikau"
  | "hoko"
  | "ako"
  | "toro"
  | "admin";

export interface KeteAccent {
  /** Solid accent — borders, icons, sidebar active rail */
  accent: string;
  /** Soft transparent accent — pill backgrounds, hover wash */
  accentSoft: string;
  /** Ring / focus halo */
  accentRing: string;
  /** Deep accent — icon strokes, accent text on light surfaces */
  accentDeep: string;
}

/**
 * Foundation — same for every kete (background, text, status, shadows).
 */
export const MARAMA = {
  // Background washes — light, warm, NEVER dark
  surface: "#F7F3EE",        // Mist
  surfaceRaised: "#FFFFFF",  // Card glass
  surfaceMuted: "#EEE7DE",   // Cloud

  // Text
  textPrimary: "#6F6158",    // Taupe Deep — body & headings
  textSecondary: "#8E8177",  // Taupe — captions, labels
  textMuted: "#A89E94",      // Taupe Light — meta

  // Borders & shadows (single source of truth)
  borderSoft: "rgba(142,129,119,0.14)",
  borderHover: "rgba(142,129,119,0.28)",
  shadowSoft: "0 8px 30px rgba(111,97,88,0.08)",
  shadowCard: "0 4px 20px rgba(111,97,88,0.06)",
  shadowHover: "0 12px 40px rgba(111,97,88,0.12)",

  // Standard CTA — Soft Gold (locked across all dashboards)
  cta: "#D9BC7A",
  ctaSoft: "rgba(217,188,122,0.18)",
  ctaDeep: "#B89B5C",

  // Status — warm, quiet, never neon
  ok: "#7FA88E",
  okSoft: "rgba(127,168,142,0.14)",
  warn: "#D6B07A",
  warnSoft: "rgba(214,176,122,0.16)",
  alert: "#C28A7A",
  alertSoft: "rgba(194,138,122,0.16)",
  info: "#9BB5B8",
  infoSoft: "rgba(155,181,184,0.16)",
} as const;

/**
 * Per-kete accent palette. Locked to brand guidelines v3.
 */
export const KETE_ACCENTS: Record<KeteSlug, KeteAccent> = {
  manaaki: {
    accent: "#E6D8C6",       // Warm Linen
    accentSoft: "rgba(230,216,198,0.18)",
    accentRing: "rgba(230,216,198,0.40)",
    accentDeep: "#B89E80",
  },
  waihanga: {
    accent: "#CBB8A4",       // Clay Sand
    accentSoft: "rgba(203,184,164,0.16)",
    accentRing: "rgba(203,184,164,0.40)",
    accentDeep: "#A89580",
  },
  auaha: {
    accent: "#C8DDD8",       // Pale Seafoam
    accentSoft: "rgba(200,221,216,0.20)",
    accentRing: "rgba(200,221,216,0.42)",
    accentDeep: "#7FA8A0",
  },
  arataki: {
    accent: "#D5C0C8",       // Dusky Rose
    accentSoft: "rgba(213,192,200,0.18)",
    accentRing: "rgba(213,192,200,0.40)",
    accentDeep: "#A88494",
  },
  pikau: {
    accent: "#B8C7B1",       // Soft Moss
    accentSoft: "rgba(184,199,177,0.18)",
    accentRing: "rgba(184,199,177,0.40)",
    accentDeep: "#7E947A",
  },
  hoko: {
    accent: "#D8C3C2",       // Blush Stone
    accentSoft: "rgba(216,195,194,0.18)",
    accentRing: "rgba(216,195,194,0.40)",
    accentDeep: "#A88787",
  },
  ako: {
    accent: "#C7D6C7",       // Soft Sage
    accentSoft: "rgba(199,214,199,0.18)",
    accentRing: "rgba(199,214,199,0.40)",
    accentDeep: "#809980",
  },
  toro: {
    accent: "#C7D9E8",       // Moonstone Blue
    accentSoft: "rgba(199,217,232,0.20)",
    accentRing: "rgba(199,217,232,0.42)",
    accentDeep: "#7395B5",
  },
  admin: {
    accent: "#D9BC7A",       // Soft Gold (admin = CTA gold)
    accentSoft: "rgba(217,188,122,0.18)",
    accentRing: "rgba(217,188,122,0.40)",
    accentDeep: "#B89B5C",
  },
};

export function getKeteAccent(kete: KeteSlug = "admin"): KeteAccent {
  return KETE_ACCENTS[kete] ?? KETE_ACCENTS.admin;
}

/**
 * Convenience: full token bundle for a given kete (foundation + accent).
 */
export function maramaTokens(kete: KeteSlug = "admin") {
  return { ...MARAMA, ...getKeteAccent(kete), kete };
}

export type MaramaTokens = ReturnType<typeof maramaTokens>;
