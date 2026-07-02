# pattern-assembl — brief

**Locked**: 2026-07-01 · **Author**: Kate Hudson · **Version**: v1

assembl's signature wallpaper pattern. Every pilot has its own — Happy Tails (tails + paws), Auckland Zoo (safari animals), Aironaut (freight icons). This is assembl's. It sits behind the OS chrome on `assembl.co.nz` at ~4% opacity, and it's the shared framework across every future pilot page in the assembl-chrome shell.

## The nine motifs

Each mark ties back to the locked concept: *assembl as a living navigation system for NZ businesses that reads signals, communicates clearly, routes work, filters noise, and moves mahi from intention to proof.*

| motif | what it is | why it's here |
|---|---|---|
| **maunga** | two- and three-peak silhouettes in fine ink line | grounded, purpose-built — echoes the papatūānuku metaphor on the hero landscape |
| **awa** | single and double flowing wave lines | signals in motion, flowing connections — the moana metaphor at pattern scale |
| **matariki clusters** | 3–5 abstract dot groups, some with soft connecting arcs | reading and connecting signals; deliberately non-literal so they never map to a real constellation |
| **connecting arc** | two dots joined by a thin curved line | routing work between people, systems, agents |
| **compass abstract** | fine four-point cross with a tiny centre ring | navigation — the assembl through-line |
| **signal-pulse ring** | centre dot with two concentric rings, outer ring soft | monitoring, listening, sonar ping — the read-signals half of the promise |
| **fern-frond curl** | small spiral tip, abstract (**not** a koru) | a whispered NZ hint without borrowing tapu iconography |
| **kōwhai bloom mark** | three tiny curved petals in a triangle | second NZ whisper — quiet, editorial, never central |
| **gold fleck** | single or paired 1.6–1.8 px warm gold dot | the sparse ornamental accent — same gold as the hero particulate landscape |

Nine motifs across ~35 marks per 600 × 600 tile. Roughly one mark per 110 px. Sparse by design.

## Colour and stroke

- **Ground**: warm paper white `#FBFAF6` (matches DIRECTION-LOCKED-2026-07-01)
- **Ink**: `#1A1918` — the same ink used everywhere else on the surface
- **Gold**: `#D9B87A` primary, `#EFC96A` secondary highlight — mirrors the hero palette
- **Stroke weight**: 1.2 pt for primary line, 1.0 pt for secondary wave, 0.6–0.7 pt for connecting arcs
- **Caps**: round · **Joins**: round

## Density and rhythm

- Tile size: **600 × 600 SVG**, rendered to **2400 × 2400 PNG** for raster fallback
- ~35 marks per tile → one every ~110 px average → deliberate whitespace between everything
- No row-band or grid rhythm. Motifs are scattered organically across four unequal quadrants.
- **Edge-crossers** (maunga at corner, awa on left edge, gold flecks and constellations on right) are drawn on **both sides** so the tile seams disappear when repeated. Tested at 3 × 3 — see `pattern-assembl-preview-tile-3x3.png`.

## Pairing rules

1. **Opacity floor: 4%.** This is a wallpaper wash, not a graphic layer. Anything above 6% starts competing with hero content. See the top panel of `pattern-assembl-in-context.png` for spec.
2. **Never in front of type.** The pattern sits behind everything — chrome, cards, headlines. If a surface has no type or hero art, opacity may lift to 6% but no higher.
3. **Warm-white ground only.** Do not composite over the darker `#F7F5EE` variant or any coloured surface. It's designed to breathe on `#FBFAF6`.
4. **Doesn't tile with pilot patterns.** On a customer pilot page, use *either* the pilot pattern (Happy Tails / Zoo / Aironaut) *or* pattern-assembl — never both stacked. Pilot pattern owns the customer surface; pattern-assembl owns the assembl-chrome shell (footer, cross-brand lockup, loading state, top nav bar background).
5. **No colour tint.** Never re-colourise the ink or gold. If a surface needs a different colour language, use a different asset.
6. **Motion**: static only. The particulate landscape is what moves. This pattern holds still — it's the paper the whole system is printed on.

## What was rejected

- No obvious constellation shapes (no Southern Cross, no Matariki-as-nine-stars). The clusters are deliberately abstract dot-groups so nothing reads as a specific sky map.
- No koru curl proper — the fern-frond mark is a spiral tip, not the closed koru form. This keeps assembl's own visual language distinct from Air NZ and from tapu iconography.
- No filled shapes anywhere. Everything is ink line or a solitary tiny dot.
- No literal "AI" imagery — no circuits, nodes, brains, neural glyphs. The motif language is landscape and navigation, not machinery.

## Files in this set

- `pattern-assembl.svg` — source vector, 600 × 600 tileable
- `pattern-assembl.png` — 2400 × 2400 raster fallback
- `pattern-assembl-preview-tile-3x3.png` — 3 × 3 seamlessness proof
- `pattern-assembl-in-context.png` — composited over the homepage hero at 4% (spec) and 12% (visibility reference)
- `pattern-assembl-brief.md` — this file

## Approval

Kate approves before this ships to `assembl.co.nz` or into any pilot chrome. Once locked, this file joins the DIRECTION-LOCKED-2026-07-01 canon.
