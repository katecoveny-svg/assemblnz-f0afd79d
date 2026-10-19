# assembl / living — the modular interiors system

**Status:** build candidate on `feat/assembl-living-turn-v0.3`; parts library v0.3 designed and digitally checked, nothing printed, nothing for sale  
**Owner:** Kate (product and design); parts library authored 17–19 October 2026, integrated into the repo 19 October  
**Surfaces:** `/living` (storefront), `/living/studio` (Space Studio), `/living/cad/v0.3/*` (served print files + manifest)  
**Code:** `tools/living-cad/` (parametric source, build, fit tests, test kit, launch files), `lib/living/` (typed system), `app/living/` (surfaces)

This is the canonical product document for Assembl Living. It supersedes the AL-02 peg interface merged on 17 October (ADR-007), which is retired by ADR-008.

## What it is

A modular interiors system that adapts to the person, their space and what they own. The customer photographs or describes a corner that is not working. Assembl helps design a beautiful, functional solution from compatible parts and, once a print partner has run the test kit and accepted the files, prints it to order.

> One design system. Different spaces. Endless combinations.

**dayrally** is the go-anywhere collection on the same key: pods, lids, inserts, mounts and the small things for riders, scooters, fishing, beach and school.

## The assembl TURN standard (v0.1, proposed, untested in print)

| Feature | Value |
|---|---|
| Grid pitch (boards and drawers) | 42.0 mm |
| Board | 8.0 mm thick: 4.0 standoff + 4.0 front plate |
| Keyway | Ø13.0 bore, two 4.0 mm lug slots on the vertical axis reaching r 9.8 |
| Chamber behind each keyway | Ø22.0, where the key's lugs turn |
| Detents | 0.35 mm dimples at 3 and 9 o'clock |
| Accessory flange | 5.0 mm, keyway plus 45° countersink (Ø13 → Ø21) |
| TURN key | Push in with the grip upright, quarter-turn to horizontal to lock |
| Locator nub | Ø12.4 × 3.0 mm, drops into a neighbouring keyway |

Rules: an accessory with two or more keys needs no nub. A single-key accessory has at least one nub, which stops it rotating and carries the shear load. Every part fits a 250 mm cube so any standard print farm can make it. The 4×4 board is 168 mm; boards butt edge to edge and the grid runs on across them.

## Five foundations and one collection

| Foundation | What it is | Products |
|---|---|---|
| `assembl / grid` | wall boards + keyed accessories | board 4×4, board 2×4, hook, rod cradles, shelf 2 / 3, bin, cup, lure garage, name plate, spare keys |
| `assembl / tile` | drawer trays sized to the drawer; cut-out trays with a pocket per item | made to measure, quoted per order |
| `assembl / stack` | printed joints and feet for 19 mm timber dowel | corner node, tee node, foot |
| `assembl / renter` | the same boards, no drilling | renter board (flat back for strips), over-door hangers, rail hangers |
| `assembl / light` | fluted pendant shade, LED only, shade only | fold shade |
| `dayrally` | pods, lids, inserts, mounts, add-ons, bike parts | 25 products, 10 kits |

Seven room kits (teen room starter, gear wall, vanity lab, desk reset, workshop wall, entry and pets, no-drill door wall) open in the Space Studio with an authored layout; their contents and proposed prices come from the launch catalogue.

## Parts library v0.3 (`tools/living-cad/`)

| Path | What it is |
|---|---|
| `cad/lib.py` | the parametric source: the standard and the grid, tile, stack and light parts |
| `cad/extras.py`, `cad/dayrally.py`, `cad/dayrally2.py` | cut-out trays, renter parts, part codes; dayrally v1 and v2 |
| `cad/build*.py`, `cad/test_kit.py`, `cad/fit_test*.py` | build the print files, the test kit and the digital fit tests |
| `manifest.py` | merges the build reports, fit tests, test kit and launch catalogue into `lib/living/cad-manifest.json`, and copies the served print files into `public/living/cad/v0.3/` |
| `launch/` | proposed prices with production-cost ceilings (`costing.csv`), the Shopify draft import (`shopify-products.csv`, every product a draft) and two unsent emails (print partner quote request; Energy Safety question on the shade) |
| `parts/` | build reports, fit-test results, test-kit instructions (`TEST-KIT.md`) |
| `research/` | materials and large-format notes behind the materials map |

The store catalogue page (`store/index.html`) that generated the launch CSVs was not in the archives; the CSVs are the record and `lib/living` is now the catalogue of truth. Rebuilding is reproducible here: the regenerated reports match the shipped ones byte for byte.

```sh
pip install manifold3d trimesh numpy fonttools
cd tools/living-cad
python3 cad/build.py && python3 cad/build_extras.py && python3 cad/build_dayrally.py && python3 cad/build_dayrally2.py && python3 cad/test_kit.py
python3 cad/fit_test.py && python3 cad/fit_test_dayrally.py && python3 cad/fit_test_dayrally2.py
cd ../.. && python3 tools/living-cad/manifest.py && pnpm exec vitest run lib/living
```

Generated meshes under `tools/living-cad/parts/stl`, `glb` and `store/` are ignored; the 23 grid, tile, stack and renter print files the storefront serves (5 MB) plus the test kit are committed under `public/living/cad/v0.3/`. Dayrally, bike and the shade are rebuilt on demand.

## Validation, honestly

Every print file is checked as a watertight single solid inside a 250 mm cube, with its unsupported overhang area reported. The digital fit tests show the key sliding in and out with zero contact, the bumps riding the plate between 15° and 75° and dropping into the detent, the locked key captured and the open key free, and every pod sitting on every mount and any board with zero overlap. **None of this is a physical test.** Clamp (`CLAMP`), detent (`BUMP_H`, `DIMPLE_D`) and pocket clearance are starting points that the test-print kit tunes on the partner's printers.

## The typed product system (`lib/living/`)

- `system.ts` — zod schemas for the manifest, products with configurator semantics, fields, kits, `SpaceDesign`, `SavedConfiguration`.
- `catalogue.ts` — the manifest joined to footprints on the 42 mm grid, mounts, spaces and cues; part codes with the check letter; dayrally and the test kit exposed.
- `spaces.ts`, `kits.ts` — six doors and seven authored kit layouts (tested against the launch catalogue lines and prices).
- `recommend.ts` — deterministic understanding and three proposals. Code, not a model.
- `design.ts` — placement validation, bill of materials (boards from the field, pairs from placements), proposed pricing, fit check (walls, and door thickness + gap for hangers), saved configuration with SKUs and print-file checksums, typed-only Shopify cart lines.
- `journey.ts`, `genome.ts` — `space, assembled` as a `CustomerJourney` configuration (status `draft`, not seeded; see ADR-007/008).

## Space Studio (`/living/studio`)

1. **show us your space** — space, surface (wall, door, wardrobe, desk, drawer, vanity), what would make it better, optional photo (shown back, never read), aesthetic, what to keep, a name for the plate.
2. **three ways to improve it** — the understanding assembles on screen, then minimal / system / expressive proposals with real-size previews and proposed prices; room kits for that door below.
3. **assemble your design** — SVG composer on the real grid with keyways, on-demand 3D preview, board fields from one board to 2 × 2 and board + half, seven colourways for board and accessories, click-to-place or auto-place, alongside products, live parts list with SKUs.
4. **made for your space** — measurement method, width/height, door thickness and door-gap gauge for hangers, explicit confirmation; fit check; "assembling the kit" wait state; saved configuration with reorder codes, print files, mass and orientation per file, STL links where served, JSON download and on-device save.

## Honesty boundaries

- Nothing has been printed. Prices are proposed and pre-quote; made-to-measure trays are quoted per order.
- Photo understanding: `not_available`. Fit is decided only by customer-confirmed numbers.
- No load limits until the hook load test has run. Light things only on hangers. Shade sold alone, LED only.
- No Shopify products exist for this line; the launch CSV imports every product as a draft and has not been imported. Purchasing is `not_enabled` in every saved configuration.
- The `space, assembled` journey is a draft configuration and does not run through the shared runtime yet.

## Before selling (from the parts library, unchanged)

1. Print the test kit with the print partner and tune `CLAMP`, `BUMP_H` and `DIMPLE_D` in `cad/lib.py`.
2. Load-test the shelf, hook and bin on a real wall, then publish conservative limits.
3. Get written answers from the print partner on maximum part size, colours and NZ delivery times (draft in `launch/emails.md`).
4. Lampshades: sell the shade only, LED only. Ask Energy Safety before bundling any electrical parts.
5. Cut-out trays: print the example tray and check the 1.2 mm clearance with real items.
6. Renter mode: test the over-door hanger on a real door and publish the gap it needs.
7. Confirm which glow and colour-change filaments the print partner stocks before offering those finishes.

## Related proposals

- `HOSPITALITY-PROPOSAL-20261019.md` — assembl / stay (holiday homes, Airbnb, motels): naming, laundry and caddy-supply feasibility, fulfilment recommendation and the Shop DO connection. Proposed only.
- `SUPPLIER-PARTNERS-BY-SPACE-20261019.md` — partner suppliers grouped by space, the three fulfilment lanes (assembl-made, partner dropship via Shopify Collective NZ, partner wholesale assembl-packed) and service actions. Proposed only.
