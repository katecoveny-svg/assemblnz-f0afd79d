

## Goal

Bring the existing PearlIndex homepage in line with the Warm Pearl creative brief — warmer palette, the hero kete *nested inside* a cinematic interactive cloud with twinkling fairy lights, copy tightened to verbatim spec, and a few atmospheric accents added between sections. No new imagery generated. Existing `KeteFocus` + `HeroCloud` + `FeatherKete` components are reused as-is.

## What changes

### 1. Palette warm-up (`src/pages/PearlIndex.tsx`)
The local `PEARL` constant currently uses Icy Pearl (`#FBFAF7`) and a near-black ink (`#0E1513`). Update to brief-locked tokens:

| Token | From | To |
|---|---|---|
| `bg` | `#FBFAF7` | `#FAF6EF` (Warm Pearl) |
| `linen` | `#F3F4F2` | `#F4EFE6` (Linen) |
| `ink` | `#0E1513` | `#0F2A26` (Forest Ink — deep pounamu, never black) |
| `pounamu` | `#1F4D47` | unchanged |
| `seaGlass` | `#C4D6D2` | unchanged |
| `opal` | `#E8EEEC` | unchanged |

Body text rgba updated from `rgba(14,21,19,...)` → `rgba(15,42,38,...)` to match new ink.

### 2. Hero — kete nested IN the cloud
Currently `Hero()` renders `<KeteFocus>` alone in the top-right. The brief requires the kete *inside* a warm pearl cloud with fairy lights drifting through it.

- Import `HeroCloud` from `@/components/pearl/FluffyCloud` (already exists, already has cursor-follow + 14s breathing + scroll parallax + 70 candle-warm sparkles + golden-hour core).
- Wrap the hero visual in a stacked container (~880×880 desktop, 380×400 mobile) positioned top-right behind copy:
  - Layer 0: `<HeroCloud height={760} />` — the warm pearl cumulus that wraps the kete.
  - Layer 1: `<KeteFocus size={620} sparkles={48} rimSparkles={36} priority warmGlow />` centred on top of the cloud, so the kete sits *nested in mist*. Reduce kete size from current 820 → 620 so the cloud reads as wrapping it on all sides.
- Add a faint Aotearoa-shape SVG silhouette as a watermark layer between cloud and kete: hand-traced two-island path filled with `rgba(31,77,71,0.06)`, soft blur, ~280px wide, offset slightly off-centre. Pure decoration.

### 3. Hero copy fixes (verbatim from brief)
Current hero copy is off-spec. Replace:
- Eyebrow: `ASSEMBL · BUILT IN AOTEAROA` (currently empty zero-width space).
- H1: `Built for the way New Zealand actually works.` *italic pounamu second clause not needed — single sentence per brief.*
- Italic pull line: `Premium intelligence that understands what matters.` (already correct).
- Sub-H1: `NZ specialist AI agents and workflows that finish the work — and give you valuable time back. Every workflow produces a pack that can be filed or audited, and stays current as the law changes.`
- Primary CTA copy unchanged (`See what a quiet day looks like`).
- Top-right nav CTA (`BrandNav`) — leave alone, it's a separate component.

### 4. WhyAssembl section — switch to founder first-person voice
Current copy uses corporate "we know" plural. Brief uses founder "I know" singular. Replace the four lines and the belief block per the verbatim brief copy.

### 5. WhatAssemblIs — fix H2
Current H2 says "give you time back". Brief says "give the time back" (subtle, but it's locked copy). Update.

### 6. KetesGrid — fix lede
Current lede: `Eight packs. One quiet intelligence layer behind all of them.`  
Brief: `Eight ketes. One quiet intelligence layer behind all of them.` (kete vocabulary is locked; "pack" is reserved for evidence pack).
Also rename grid H2 to brief: `One kete per industry. One platform underneath.` (currently shows the hero H1 line by mistake).

### 7. Pricing tier labels — kete vocabulary
The TIERS constant says "1 industry pack / 2 industry packs / All 7 packs". Brief locks these to "1 KETE / 2 KETES / ALL 7 KETES" (uppercase sub-label). Update the `sub` strings only; prices stay.
Add the brief's footnote line under the grid: "Every paid tier includes the cross-cutting agents — HR (Aroha), security (Signal), monitoring (Sentinel). NZD, GST exclusive. 12% off annual with code ANNUAL12."

### 8. LiveCompliance — add trust stack
Append the locked trust stack under the sign-off line: `Simulation-tested · Policy-governed · Human-in-the-loop` (small Inter, wide letter-spacing, pounamu).

### 9. Closing section — second large warm cloud
Add a closing cloud behind the "The day you actually wanted." block. Reuse `<HeroCloud height={520} opacity={0.85} />` positioned behind the text, lower in the frame than the hero. The closing block also needs the four italic lines per brief (kitchen / guest / team member / evening) — verify these are present and pounamu italic.

### 10. Two small atmospheric wisps between sections
Brief asks for 2–3 smaller cloud wisps drifting next to section breaks. The page already has MiniCloud usage in WhyAssembl + WhatAssemblIs + a FairyLightStrand in HowItWorks/Pricing. Keep these. Add one more `MiniCloud` (size 180, opacity 0.35, drift slow) tucked top-right of the LiveCompliance section so the "gold nugget" reads atmospheric.

### 11. Memory update
Update `mem://design/pearl-system.md` Forest Ink line: confirm `#0F2A26` as the canonical ink (currently doc lists `#0E1513`). Add Core line to `mem://index.md`: *"Forest Ink #0F2A26 is the deepest text colour. No black anywhere."*

## What does NOT change
- No new image assets generated. The kete is `kete-white-master.png` (already used by `KeteFocus` + `FeatherKete`).
- `KeteFocus`, `HeroCloud`, `FluffyCloudScene`, `FairyLightStrand`, `FeatherKete`, `MiniCloud` components untouched — they already implement the spec (cursor-follow lag, 14s breathing, scroll parallax, candle-warm `#F8E9C4` sparkles, kete sway, rim sparkles).
- `BrandNav`, `BrandFooter`, routing, and all other pages untouched.
- No font changes — Cormorant Garamond + Inter already loaded.

## Files touched
- `src/pages/PearlIndex.tsx` — palette tokens, Hero composition + copy, WhyAssembl voice, WhatAssemblIs H2, KetesGrid H2 + lede, Pricing sub-labels + footnote, LiveCompliance trust stack + wisp, Closing cloud.
- `mem://design/pearl-system.md` — Forest Ink hex correction.
- `mem://index.md` — add Forest Ink core rule.

## Risk / notes
- The Aotearoa watermark is a hand-traced inline SVG path, not an image asset — keeps to the "no new imagery" rule.
- All copy changes are pure string swaps inside `PearlIndex.tsx`; no schema or component-prop changes.
- Existing `HeroCloud` + `KeteFocus` already include `prefers-reduced-motion` guards and pointer-event handling, so cursor-follow + sparkle response are wired the moment they're stacked.

