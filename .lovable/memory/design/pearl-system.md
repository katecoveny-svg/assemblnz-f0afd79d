---
name: Pearl Design System (Sitewide)
description: 2026-04-21 site-wide warm-pearl rebrief — sunlit not moonlit. Warm Pearl canvas + Linen alt + feathery 3D globes + R3F aurora data ribbons + Cormorant Garamond display + Inter body.
type: design
---

# Pearl System — WARM PEARL update 2026-04-21

The site moved from cool Icy Pearl (#FBFAF7) to **Warm Pearl (#FAF6EF) + Linen (#F4EFE6)** — sunlit, not moonlit. The brief is Apple launch × Kinfolk editorial × early-morning Aotearoa light on linen.

## Tagline lock
- **Brand line:** *Premium intelligence with a human heart.*
- **Foundation:** Time is the most valuable thing you own. Assembl gives it back.
- **One-sentence:** A platform of practical AI agents that finish the work — and give the time back. Efficient for value. Efficient for time.
- **Trust stack (locked, never reword):** Simulation-tested · Policy-governed · Human-in-the-loop
- **Campaign line (locked):** AI that reduces invisible load.

## Palette (HSL tokens in `src/index.css`)
| Role | Hex | HSL | Usage |
|---|---|---|---|
| Warm Pearl (canvas) | `#FAF6EF` | `39 47% 96%` | `--background`, body, dominant |
| Linen (alt canvas) | `#F4EFE6` | `38 30% 93%` | `--secondary`, subtle section break |
| Forest Ink (ink) | `#0F2A26` | `173 47% 11%` | `--foreground`, body, headlines — deep pounamu, never black |
| Pounamu (accent) | `#1F4D47` | `173 42% 21%` | `--primary`, italic emphasis, ribbon highlight |
| Sea Glass | `#C4D6D2` | `168 17% 80%` | `--accent`, ribbons, hairline dividers |
| Opal Shimmer | `#E8EEEC` | — | Globe outer feathering, soft washes |
| Harbour Ink | `#1B2A2E` | — | Optional deep closing section |

**Rule:** Never more than three colours on screen at once. Default = Warm Pearl + Deep Calm + Pounamu.

## Typography
- **Display:** Cormorant Garamond (300, 400, italic 400) — every headline. Italic pounamu = signature emotional moment.
- **Body:** Inter (400, 500) — body, UI, labels.
- **Eyebrows:** Inter 11px / `letter-spacing: 0.32em` / uppercase / pounamu.
- **Headlines:** 64–104px desktop, line-height 1.04–1.08, `letter-spacing: -0.018em`.
- **Body:** 17–18px, line-height 1.55.

## Signature visuals

### PearlGlobe (`src/components/pearl/PearlGlobe.tsx`)
react-three-fiber `meshPhysicalMaterial` (white, opaque) sphere wrapped in CSS radial halos + dense SVG feather plumes. **Two feather rings**: 36 short inner down-fluff + 24 long outer wisps with tip-puffs, for a "ball of feathery fluff" feel. Drift 22s slow / 16s med. NEVER bouncy. NEVER metallic.

Place 3–4 globes per page max. Hero = largest (~720px, behind-right). Section accents = 70–280px at 0.45–0.7 opacity.

### DataRibbons (`src/components/pearl/DataRibbons.tsx`) — NEW 2026-04-21
react-three-fiber `TubeGeometry` aurora ribbons. Per-frame curve mutation with sine waves + additive blending. Three intensities: `subtle` (1 ribbon), `soft` (2), `rich` (3, hero). 8–12s drift cycles. Pounamu + sea-glass tones. **One ribbon system per major section.** Atmospheric, never UI.

## Section rhythm
- Desktop: 160px padding top + bottom on every section.
- Mobile: 80px.
- Container: 1120px for grids, 680px for narrative.
- Fade-up on scroll: 800–900ms cubic-bezier(0.22,1,0.36,1), 80px viewport margin.

## Motion shell still active
Lenis smooth scroll + magnetic cursor (`<GlobalMotionShell />`) stay mounted globally. `data-magnetic` attribute on every CTA and kete card link.

## Files
- `src/index.css` — Warm Pearl tokens under `:root`, body bg, `.font-serif-display`, `.text-pounamu`, `.bg-warm-pearl`, `.bg-linen`, `.pearl-drift-*`, `.pearl-fade-up`.
- `src/components/pearl/PearlGlobe.tsx` — fluffy 60-feather globe.
- `src/components/pearl/DataRibbons.tsx` — R3F aurora ribbons.
- `src/pages/PearlIndex.tsx` — homepage at `/`. Sections: Hero · WhyAssembl · WhatAssemblIs · HowItWorks · KetesGrid · LiveCompliance · Tikanga · Pricing · Closing · PearlFooter.

## Forbidden
- Dark gradients, neon, dark-mode glassmorphism.
- Cool/grey pearl (we are warm/sunlit now).
- Stock photography, dashboard screenshots, product tours, emoji.
- Photography of people on homepage / ad creative (Kate appears only on About page).
- Te reo Māori as primary H1 (only as eyebrows / italic sublabels).
- Words: *productivity, faster, supercharge, revolutionary, 10x, enterprise-grade, trained on 50+ Acts, 100% accurate*.
- "Productivity" as hero word — prefer *presence, end, return, close, quiet*.
- "Faster" as hero verb — prefer *calm, finished, returned, quiet*.
- More than three colours on screen at once.
