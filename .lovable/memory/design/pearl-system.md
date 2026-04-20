---
name: Pearl Design System (Sitewide)
description: 2026-04-20 site-wide rebrand to icy pearl canvas + feathery 3D pounamu globes + Cormorant Garamond display + Inter body. Replaces all prior teal/ice/Lato systems.
type: design
---

# Pearl System — locked 2026-04-20

The site moved from the ice-and-teal /next aesthetic to a calmer, more emotional pearl world inspired by Apple Vision Pro, Arc, Stripe Atlas, Linear, and Cereal magazine.

## Tagline lock
- **Brand line:** *Premium intelligence with a human heart.*
- **Foundation:** Time is the most valuable thing you own. Assembl gives it back.
- **Founder belief:** AI should give people time back — to think, to be present, for what matters.

## Palette (HSL tokens in `src/index.css`)
| Role | Hex | HSL | Usage |
|---|---|---|---|
| Icy Pearl (canvas) | `#FBFAF7` | `44 30% 98%` | `--background`, body, dominant |
| Moonstone (alt) | `#F3F4F2` | `80 8% 95%` | `--secondary`, subtle section break |
| Deep Calm (ink) | `#0E1513` | `168 30% 7%` | `--foreground`, body, headlines |
| Pounamu (accent) | `#1F4D47` | `173 42% 21%` | `--primary`, italic emphasis, links, globe inner glow |
| Sea Glass | `#C4D6D2` | `168 17% 80%` | `--accent`, hairline dividers |
| Opal Shimmer | `#E8EEEC` | — | Globe outer feathering, soft washes |
| Harbour Ink | `#1B2A2E` | — | Optional deep closing section |

**Rule:** Never more than three colours on screen at once. Default = Pearl + Deep Calm + Pounamu.

## Typography
- **Display:** Cormorant Garamond (300, 400, italic 400) — every headline. Italic pounamu = signature emotional moment.
- **Body:** Inter (400, 500) — body, UI, labels.
- **Eyebrows:** Inter 11px / `letter-spacing: 0.32em` / uppercase / pounamu.
- **Headlines:** 64–104px desktop, line-height 1.04, `letter-spacing: -0.018em`.
- **Body:** 17–18px, line-height 1.55.
- Lato + Plus Jakarta Sans remain loaded for legacy components but are deprecated for new work.

## The signature visual: PearlGlobe
`src/components/pearl/PearlGlobe.tsx` — react-three-fiber sphere with `MeshTransmissionMaterial`, wrapped in CSS radial halos for the feathery white-fade. Drift animation is 22s ease-in-out (slow) or 16s (med). NEVER bouncy. NEVER metallic.

Place 3–4 globes per page max, varying in size. Hero = largest (~720px, behind-right). Section accents = 70–280px at 0.45–0.7 opacity.

## Section rhythm
- Desktop: 160px padding top + bottom on every section.
- Mobile: 80px.
- Container: 1120px for grids, 680px for narrative.
- Fade-up on scroll: 800ms cubic-bezier(0.22,1,0.36,1), 80px viewport margin.

## Motion shell still active
Lenis smooth scroll + magnetic cursor (`<GlobalMotionShell />`) stay mounted globally. `data-magnetic` attribute on every CTA and kete card link.

## What was retired
- WaterGlassBackground canvas (deleted from `App.tsx` mount).
- Old `--background: #FAFBFC` ice + `--primary: #3A7D6E` teal.
- Lato 200 italic display in NextHero (NextHero is being phased out in favour of PearlIndex sections).

## Files
- `src/index.css` — Pearl tokens under `:root`, body font + bg, `.font-serif-display`, `.text-pounamu`, `.pearl-drift-*`, `.pearl-fade-up`.
- `src/components/pearl/PearlGlobe.tsx` — the globe.
- `src/pages/PearlIndex.tsx` — homepage, mounted at `/` (replaces old `Index.tsx`, kept on disk for reference).
- `src/App.tsx` — `Index` import now points at `PearlIndex`.

## Forbidden
- Dark gradients, neon, dark-mode glassmorphism.
- Stock photography, dashboard screenshots, product tours, emoji.
- Te reo Māori as primary H1 (only as eyebrows / italic sublabels).
- Words: *productivity, faster, supercharge, revolutionary, 10x, enterprise-grade, trained on 50+ Acts, 100% accurate*.
- More than three colours on screen at once.
