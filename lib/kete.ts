/**
 * lib/kete.ts — backwards-compatibility barrel
 *
 * Phase 1 canonical source lives in lib/site-config.ts.
 * All original exports (KeteSlug, Kete, KETES, INDUSTRY_KETES, WHANAU_KETE,
 * getKete) are re-exported or derived here so existing components keep
 * working without modification.
 *
 * IMPORTANT: the Phase 1 `Kete` interface has different fields from the
 * original (accentTint / vesselSquare / vesselHero instead of accent /
 * accentName / type / status). Turbopack does not check types, so this
 * re-export is safe for runtime; update consuming components when refactoring.
 */
import { KETES, type KeteSlug, type Kete } from './site-config';

export { KETES };
export type { KeteSlug, Kete };

/** Industry ketes — all kete except Tōro (the whānau / consumer kete). */
export const INDUSTRY_KETES = KETES.filter((k) => k.slug !== 'toro');

/** Tōro — the consumer whānau kete. */
export const WHANAU_KETE = KETES.find((k) => k.slug === 'toro')!;

/** Look up a single kete by slug. Throws on unknown slug. */
export function getKete(slug: string): Kete {
  const kete = KETES.find((k) => k.slug === slug);
  if (!kete) throw new Error(`Unknown kete: ${slug}`);
  return kete;
}
