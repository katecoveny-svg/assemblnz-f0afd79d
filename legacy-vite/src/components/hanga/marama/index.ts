/**
 * Legacy WAIHANGA-only Mārama exports.
 *
 * The full design system has moved to `@/components/shared/marama`,
 * which supports every kete via `<MaramaShell kete="…" />` or
 * `<MaramaKeteProvider kete="…">`.
 *
 * This module re-exports the shared primitives so existing imports
 * (`@/components/hanga/marama`) keep working unchanged. New code should
 * import from `@/components/shared/marama`.
 */
export {
  MaramaShell,
  MaramaCard,
  MaramaStat,
  MaramaBadge,
  MaramaButton,
  MaramaKeteProvider,
  useMaramaTokens,
  MARAMA,
  getKeteAccent,
  maramaTokens,
} from "@/components/shared/marama";

export type {
  KeteSlug,
  KeteAccent,
  MaramaTokens,
  MaramaNavItem,
  MaramaNavGroup,
} from "@/components/shared/marama";

// Backwards-compat token alias — WAIHANGA pages historically imported
// this name directly. New code should prefer `maramaTokens("waihanga")`.
import { maramaTokens } from "@/components/shared/marama";
export const MARAMA_WAIHANGA = maramaTokens("waihanga");
