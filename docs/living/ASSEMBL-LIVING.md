# assembl / living — the modular interiors system

**Status:** modular system merged to main via #1616; shop consolidation in review; prototype parts, nothing for sale
**Owner:** Kate (product); engineering pack and Space Studio built 17 October 2026
**Surfaces:** `/living` (system overview), `/living/shop` (collection preview, pending consolidation release), `/living/studio` (Space Studio), `/living/cad/AL-02/*` (CAD pack)
**Code:** `lib/living/` (typed system), `app/living/` (surfaces), `tools/living-cad/build.py` (parametric CAD source)

This is the canonical product document for Assembl Living. It supersedes the chat-level plan it was built from. Dayrally remains the adventure-facing collection and is not redefined here.

## What it is

A modular interiors system that adapts to the person, their space and what they own. The customer photographs or describes a corner that is not working. Assembl helps design a beautiful, functional solution from compatible parts and, once a manufacturer accepts the files, makes it to measure.

> One design system. Different spaces. Endless combinations.

The aesthetic is Scandinavian and quiet: chalk, oat, soft stone, muted rose, deep plum, graphite. Simple architectural shapes, soft rounded edges, negative space. No neon, no canary.

## One interface, four foundations

Every part shares **interface IF-01** (proposed; prior-art check pending before any exclusivity claim):

| Parameter | Value |
|---|---|
| Grid pitch | 24 mm |
| Panel hole | Ø 6.4 mm |
| Accessory peg | Ø 6.0 mm × 8 mm, retaining lip behind the panel |
| Panel thickness | 4 mm, integrated 8 mm wall standoffs |
| Tile footprint | 96 mm (= 4 × pitch) |
| Tray wall | 2.4 mm |

| Foundation | What it is | Pack AL-02 parts |
|---|---|---|
| `assembl / grid` | wall panel + peg-mounted accessories | grid-panel-192, grid-hook-single, grid-ledge-96, grid-cup-48 |
| `assembl / tile` | trays on the 96 mm footprint, joined by clips | tile-tray-96x96, tile-tray-96x48, tile-clip |
| `assembl / stack` | freestanding riser whose bays are one tile footprint | stack-riser-192 |
| `assembl / rail` | hollow bar accepting the same grid pegs | rail-bar-192 |

The 192 mm panel (8 × 8 holes) is sized for common print beds: Ender-class 220 mm, Prusa MK4 250 × 210 mm, Bambu P1/X1/A1 256 mm. It will not fit 180 mm beds (Prusa Mini, A1 mini).

## Engineering pack AL-02

Source: `tools/living-cad/build.py` (CadQuery). Output: `public/living/cad/AL-02/` with a STEP (editable) and STL (printable) per part, plus `manifest.json`, which is also written to `lib/living/cad-manifest.json` so the catalogue reads real dimensions, mass, print plan and checksums.

Every part is checked on export: valid B-rep, exactly one solid, edge-manifold (watertight) STL. **That is a digital manufacturing check. It is not a physical strength, fit, tolerance or wall-mounting test.** All parts are light-duty prototypes with no published load rating. None is suitable for clothes rails, heavy shelving or anything safety-critical. Wall panels fix with screws and anchors suited to the wall; printed parts are not anchors.

The earlier "Engineering Pack AL-01" produced in a chat session is not in this repository. AL-02 re-derives the system from versioned source so every later revision is diffable. Part revisions are `AL-02.1`; a geometry change bumps the pack.

Re-generate after editing the source:

```sh
pip install cadquery
python3 tools/living-cad/build.py        # exports + manifest
python3 tools/living-cad/build.py --check  # validate only
pnpm exec vitest run lib/living           # catalogue must still match the manifest
```

## The typed product system (`lib/living/`)

- `system.ts` — zod schemas: foundations, spaces, colourways, aesthetics, parts, kits, `SpaceDesign`, `SavedConfiguration`.
- `catalogue.ts` — nine parts with commercial data (spaces, cues, indicative NZD band, minimum quantity) joined to the CAD manifest.
- `spaces.ts` — six storefront doors: my room, my space, work & create, store & organise, pets & everyday, plants & objects.
- `kits.ts` — seven indicative kits: setup wall, get-ready wall, maker wall, tackle wall, quiet desk, vanity drawer, entry rail.
- `recommend.ts` — deterministic "understand" and "three ways to improve it" (minimal / system / expressive). Code, not a model.
- `design.ts` — placement validation (bounds, overlap, mountability), bill of materials with minimum quantities, bundled indicative price, fit check, saved configuration, future Shopify cart-line adapter.
- `journey.ts` + `genome.ts` — `space, assembled` as a `CustomerJourney` configuration with a genome slice, status `draft`.

Tests: `lib/living/living.test.ts`, `app/living/studio/studio-state.test.ts`.

## Space Studio (`/living/studio`)

Four steps, mapped to the journey stages:

1. **show us your space** — space, surface, what would make it better, optional photo, starting aesthetic, what to keep. The photo is shown back to the customer and never read; the copy says so.
2. **three ways to improve it** — the understanding assembles on screen, then minimal / system / expressive proposals with real-size previews and indicative bands. Curated kits for that door sit below.
3. **assemble your design** — SVG composer drawn in millimetres on the real interface, on-demand 3D preview, panel field 1×1 to 2×2, colourways, accessories by click-to-place or auto-place, alongside parts with steppers, live parts list and bundled band, buildability check.
4. **made for your space** — measurement method (tape, A4 reference, phone depth scan), width/height, explicit confirmation; fit check with notes; "assembling the kit" wait state from the journey's wait module; saved configuration with CAD revisions, checksums, print plan, STL/STEP links, JSON download and on-device save.

Purchasing is labelled `not_enabled` everywhere a price appears. The saved configuration carries `purchasing.status = 'not_enabled'` and the reason.

## Honesty boundaries

- `prototype` parts, `indicative` kits, `proposed` recommendations and configurations.
- Photo understanding: `not_available`. Fit is decided only by customer-confirmed dimensions.
- No load ratings. Light objects only.
- No Shopify products exist for this line and none are created by this build. The cart-line adapter is typed so nothing improvises it later.
- The `space, assembled` journey is a draft configuration; it is not seeded into the journey repository and does not run through the shared runtime yet (see decision ADR-007).

## Commercial model (unchanged from the plan, unquoted)

Starter systems, accessory expansion packs, made-to-measure upgrades. Indicative bands: panel NZ$39–59, accessories NZ$9–29, kits roughly NZ$69–99 once bundled. Accessories ship bundled in one print-and-ship order; a single NZ$9 hook with separate fulfilment is not offered.

## Roadmap

1. Print and test the first samples: real dimensions, peg fit and lip retention, clip tolerance, finish.
2. Refine IF-01 into a reliable connection every approved accessory can use; bump to AL-03.
3. First sellable starter kit: panel, several accessories, optional personalisation.
4. Manufacturer quotation against `manifest.json`; replace indicative bands with quoted prices in `catalogue.ts`.
5. Enable Shopify purchasing from the saved configuration only after acceptance of files, pricing and fulfilment.
6. Generalise the journey runtime's genome-context selector so `space, assembled` runs through the shared runtime and Proof.
7. Photo understanding as an assistive, labelled step, never a substitute for confirmed measurements.

## Storefront consolidation — 20 October 2026 NZDT

`/living/shop` reuses the latest editorial store on #1615 (including #1617 and
#1619). The canonical engineering system remains `lib/living/` and AL-02. The
shop's grid, tile and stack entries reference those parts; all other entries are
concepts without released CAD. Browser selections cannot grant manufacturing
approval. Studio links start canonical layouts, explicitly without transferring
shop personalisation or claiming the layouts are identical to concept sets.

Shop kit JSON and Space Studio configurations remain distinct formats: the former
records styling intent, the latter contains a measured BOM and versioned CAD links.
Neither authorises an order. Shop import only accepts its own items format.

See `STOREFRONT-CONSOLIDATION-20261020.md` for the overlap map, verification and
release gates. The earlier configurator and experimental AL-03/AL-05 notes remain
on #1615's branch; they are not promoted to canonical manufacturing evidence.
