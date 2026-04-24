/**
 * Canonical design tokens — public entry point.
 *
 * Usage:
 *   import { tokens, palette, getToken, getKeteAccent } from "@/design/tokens";
 *
 *   <div style={{ background: tokens.surface.raised, color: tokens.text.strong }} />
 *   const accent = getKeteAccent("waihanga").base;
 *   const muted  = getToken("text.muted");
 *
 * Single source of truth lives in `palette.ts` (TS) and `tokens.css`
 * (CSS variables, mounted via src/index.css).
 */
export {
  palette,
  tokens,
  keteAccents,
  getKeteAccent,
  getToken,
} from "./palette";
export type { KeteSlug, KeteAccent, PaletteKey, TokenPath } from "./palette";
