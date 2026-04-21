---
name: Pearl Brand Alignment Shim
description: Sitewide CSS shim at the bottom of src/index.css that retargets legacy Lato/Plus Jakarta fonts and teal #3A7D6E/#4AA5A8 accents to Pearl tokens (Cormorant Garamond + Inter + Pounamu #1F4D47), so 300+ legacy pages inherit homepage branding without per-file rewrites.
type: design
---

# Pearl Brand Alignment Shim

## Why
The site has 314+ files using the legacy brand system (Lato + Plus Jakarta Sans + teal #3A7D6E/#4AA5A8 + #FAFBFC canvas + #3D4250 ink). The new homepage (PearlIndex) uses Pearl: Cormorant Garamond + Inter + Pounamu #1F4D47 + #FBFAF7 Icy Pearl + #0E1513 Deep Calm.

Rewriting every file manually is impractical. Instead, the bottom of `src/index.css` carries a **Pearl Alignment Shim** that retargets the legacy tokens at the CSS layer — every page inherits the Pearl branding without code changes.

## What it does
1. **Inline-style font remap** via `[style*="'Lato'"]` and `[style*="'Plus Jakarta Sans'"]` selectors → Cormorant Garamond / Inter.
2. **Tailwind font utilities** (`.font-syne`, `.font-outfit`, `.font-jakarta`, `.font-display`) → Inter or Cormorant.
3. **Tailwind arbitrary colour classes** (`.text-[#3A7D6E]`, `.bg-[#4AA5A8]`, etc.) → Pounamu #1F4D47.
4. **Whenua/neon legacy classes** (`.text-whenua-pounamu`, `.text-neon-*`) → Pounamu.
5. **Canvas/ink retargets** (`.bg-[#FAFBFC]` → #FBFAF7, `.text-[#3D4250]` → #0E1513).
6. **Legacy uppercase Lato wordmarks** (4-8px letter-spacing) → forced into Pearl eyebrow treatment (Inter, lowercase, 0.18em, muted clay #8B8479) so they don't read awkwardly in Cormorant.

## How to use
- Just write components — the shim catches them automatically.
- For NEW components, prefer Pearl tokens directly (`fontFamily: "'Cormorant Garamond', serif"`, `color: "#1F4D47"`, etc.) — see `mem://design/pearl-system`.
- BrandNav (`src/components/BrandNav.tsx`) and BrandFooter (`src/components/BrandFooter.tsx`) and `/how-it-works` are fully rewritten in Pearl tokens directly — they don't rely on the shim.
- The shim uses `!important` because it must override inline styles. This is intentional and correct for a brand-alignment layer.

## Limits
- Pure inline `style={{ color: "#3A7D6E" }}` cannot be overridden by attribute selectors when only the colour value is in the style string. Most legacy pages use the colour inside gradients/box-shadows, which the shim cannot rewrite. For high-visibility pages (Pricing, About, Hero CTAs), do a direct file edit.
- New visible-brand surfaces should be rewritten in Pearl tokens directly rather than relying on the shim.
