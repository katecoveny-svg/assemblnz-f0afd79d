/**
 * Kete colour helpers — single accessor for the brand-locked feather kete palette.
 *
 * The canonical hex values live in `src/design/assemblTokens.ts` (consumed by
 * Remotion / PDF rendering) and `src/components/live-widgets/kete-accents.ts`
 * (consumed by React surfaces). This module is the **only** path React
 * components should use to fetch a kete's accent / ink / wash colour, so we
 * stop drifting between five different definitions.
 */

import { KETE_ACCENTS, type KeteAccent } from "@/components/live-widgets/kete-accents";

const FALLBACK: KeteAccent = KETE_ACCENTS.platform;

/** Resolve a kete slug (case-insensitive, te reo or English) to its accent triple. */
export function getKeteAccent(slug: string | undefined | null): KeteAccent {
  if (!slug) return FALLBACK;
  const key = slug.toLowerCase().replace(/[^a-z]/g, "") as keyof typeof KETE_ACCENTS;
  return KETE_ACCENTS[key] ?? FALLBACK;
}

/** Just the accent hex (e.g. for inline `style={{ color }}`). */
export const keteAccentHex = (slug: string): string => getKeteAccent(slug).accentHex;

/** Just the ink hex (darker accent for icon strokes / micro-text). */
export const keteInkHex = (slug: string): string => getKeteAccent(slug).inkHex;

/** Just the wash hex (very light tint for card surfaces). */
export const keteWashHex = (slug: string): string => getKeteAccent(slug).washHex;

/**
 * Convert a hex colour to a comma-separated `r, g, b` string suitable for
 * inline `rgba(${rgb}, 0.18)` usage. Replaces the three inline copies
 * previously living in KeteCard.tsx, LivePacksHero.tsx, and HeroNext.tsx.
 */
export function hexToRgb(hex: string): string {
  const cleaned = hex.replace("#", "");
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

/** Convenience — accent colour as `rgba(...)` with caller-supplied alpha. */
export const keteAccentRgba = (slug: string, alpha: number): string =>
  `rgba(${hexToRgb(getKeteAccent(slug).accentHex)}, ${alpha})`;
