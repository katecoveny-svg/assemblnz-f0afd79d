/**
 * Canonical design tokens — public entry point.
 *
 * Colours / surfaces:
 *   import { tokens, palette, getToken, getKeteAccent } from "@/design/tokens";
 *
 * Typography:
 *   import { typography, typeStyle } from "@/design/tokens";
 *   import { AgentCode, RoleText, Tagline, AgentName, MetaLabel }
 *     from "@/design/tokens/AgentTypography";
 *
 *   <AgentCode>ASM-008</AgentCode>
 *   <RoleText>Privacy Copilot</RoleText>
 *   <Tagline>Drafts your IPP 3A notice in plain English.</Tagline>
 *
 * Single source of truth lives in `palette.ts` + `typography.ts` (TS)
 * and `tokens.css` + `typography.css` (CSS variables, mounted via
 * src/index.css).
 */
export {
  palette,
  tokens,
  keteAccents,
  getKeteAccent,
  getToken,
} from "./palette";
export type { KeteSlug, KeteAccent, PaletteKey, TokenPath } from "./palette";

export {
  typography,
  typeStyle,
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
} from "./typography";
export type { TypeRole, TypeRoleName } from "./typography";
