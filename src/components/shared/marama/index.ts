/**
 * Shared Mārama design kit — use these primitives in every dashboard
 * (admin, kete, workflow) so the sidebar, borders, glass surfaces,
 * and accent colours stay consistent across the platform.
 *
 * Quick start:
 *
 *   import {
 *     MaramaShell, MaramaCard, MaramaStat, MaramaBadge, MaramaButton,
 *     MaramaKeteProvider, MARAMA, getKeteAccent,
 *   } from "@/components/shared/marama";
 *
 *   <MaramaShell kete="auaha" title="Creative" nav={[{items: [...]}]}>
 *     <MaramaCard title="Recent runs">…</MaramaCard>
 *   </MaramaShell>
 */
export {
  MARAMA,
  KETE_ACCENTS,
  getKeteAccent,
  maramaTokens,
} from "./tokens";
export type { KeteSlug, KeteAccent, MaramaTokens } from "./tokens";

export { MaramaKeteProvider, useMaramaTokens } from "./MaramaKeteContext";
export { MaramaShell } from "./MaramaShell";
export type { MaramaNavItem, MaramaNavGroup } from "./MaramaShell";
export { MaramaCard } from "./MaramaCard";
export { MaramaStat } from "./MaramaStat";
export { MaramaBadge } from "./MaramaBadge";
export { MaramaButton } from "./MaramaButton";
