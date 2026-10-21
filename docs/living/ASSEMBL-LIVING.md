# assembl / living — the modular interiors system

**Status:** build candidate on `feat/assembl-living-turn-v0.3`; parts library v0.3 designed and digitally checked, nothing printed, nothing for sale  
**Owner:** Kate (product and design); parts library authored 17–19 October 2026, integrated into the repo 19 October  
**Surfaces:** `/living` (storefront), `/living/studio` (Space Studio), `/living/cad/v0.3/*` (served print files + manifest)  
**Code:** `tools/living-cad/` (parametric source, build, fit tests, test kit, launch files), `lib/living/` (typed system), `app/living/` (surfaces)

This is the canonical product document for Assembl Living. It supersedes the AL-02 peg interface merged on 17 October (ADR-007), which is retired by ADR-008.

## What it is

A modular interiors system that adapts to the person, their space and what they own. The customer photographs or describes a corner that is not working. Assembl helps design a beautiful, functional solution from compatible parts and, once a print partner has run the test kit and accepted the files, prints it to order.

> **Living, assembl’d.** One design system. Different spaces. Endless combinations.

The landing page (`/living`) is the storefront in the dayrally look (brand system, "scope widened by Kate", 20 October): a sun hero with the `dayrally` wordmark, "one system. endless days.", one sentence, two pills and the honesty chip, beside the teen room starter assembling on a sun wall from the served print files (`app/living/HeroWall.tsx`, the studio's `Preview3D` with a `hero` camera, wheel zoom off and a `stage` colour; the alpha render of the same kit stands in before the geometry loads, without WebGL and under reduced motion). Then a scrolling row of eight doors (ride, scoot, fish, everyday, my room, my space, work, pets), a sun band, eight featured pieces as product cards with proposed prices, the kits row, a second band for the studio, and a deep plum foot with the facts (the dayrally dark is the assembl deep plum `#240B21` since 21 October). Alpha renders for the storefront live in `public/living/alpha/` (trimmed from `remotion/public/images/living/`). The wordplay rules are in the brand system (`assembl’d`); the quiet plum register remains in `living.css` for the studio until it gets the same pass.

**dayrally** is the go-anywhere collection on the same key: pods, lids, inserts, mounts and the small things for riders, scooters, fishing, beach and school. The ruler lid, the long pod's 35 cm fish ruler and the 15 cm ruler piece are in `DAYRALLY-RULER.md` (lab, 21 October).

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
3. **assemble your design** — the board on a paper wall in 3D, built from the served print files turned back into their installed frame (every board and accessory is its own STL, keyed to its cell); click a keyway to place, click a part to select, a placed part drops onto its key and quarter-turns to lock; a plan view (SVG on the real grid) as the alternative; board fields from one board to 2 × 2 and board + half, seven colourways for board and accessories, click-to-place or auto-place, alongside products, live parts list with SKUs. Since 20 October 2026; before that the plan view was the default and the 3D view was boxes.
4. **made for your space** — measurement method, width/height, door thickness and door-gap gauge for hangers, explicit confirmation; fit check; "assembling the kit" wait state; saved configuration with reorder codes, print files, mass and orientation per file, STL links where served, JSON download and on-device save.

Since 21 October the studio ships its own chrome (`app/living/LivingChrome.tsx`: a living header with four doors and
the plum foot) instead of the company nav, footer and DO assistant, which had sat over its controls; step one opens
beside the kit on the wall (`HeroWall`); and the rest of the room (`HomeRangeStrip`, from `lib/living/home-range.ts`)
stands under steps one and two: the AC-02 shelving, furniture and decor, each opening its prototype widget. The
storefront's "at home." section shows the same twelve views.

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
- `LAUNCH-OPERATIONS-20261019.md` — store name and domain, payments (Shopify Payments, not Stripe), NZ shipping rate card, print partner options and the two-stage print handoff. Read-only research; nothing changed in the store.
- `WIDGET-EMBED.md` — the per-product and per-kit customisation widget (`/living/widget/<handle>`, opt-in 3D from the served print files) and the Shopify embed loader (`/living/widget.js`): real manifest choices, honest estimates, line item properties into the store's own form. Built and tested; not yet embedded in the live store.
- `DESIGN-BRIEF-20261019.md` — the design brief for the widget, the Shopify shop page and the host page (tokens, type, states, motion, imagery, acceptance). `docs/living/renders/` holds studio renders of the v0.3 print files; `tools/living-cad/render/` regenerates them.
- `ARGON-FILES-20261019.md` — assessment of the NOMAD/Argon CAD files: sketches, not parts; the reel idea kept for a proper dayrally design.
- `COSTING-20261021.md` — the cost and price model for every product, kit and lab item: own-print and bureau bases, alone and in a basket, suggested shelf prices against the proposed ones. Estimates until the first print and a partner quote.
- `AC02-RECONCILIATION-20261019.md` — the AC-02 real-CAD collection (109 parts, 18 assembled views, CadQuery source) imported as digital prototypes beside the canonical TURN v0.3 library; TR-01 desk rail and new families as candidates; the widget shows them with no price and purchasing not enabled.
- `SOURCE-AND-LICENCE-REGISTER.md` — origin, licence and obligations for every design assembl owns, evaluates or ships; required before a part enters the manifest. `SOURCE-HANDOFF-20261019.md` — the evaluation source package and how the connections are meant to work. OpenSCAD drawer-fit family at `tools/living-cad/scad/drawer-fit/` (ADR-009).
- `FULFILMENT-API-AND-SCAD-REVIEW-20261019.md` — review of the forwarded "single API dropshipper" research (3DAPI the one candidate to verify) and its OpenSCAD sketches (sketches, not print files; the pinhole "dayrally cam" idea kept).
- `DAYRALLY-CAM.md` — the dayrally cam: a 120-film 6×6 pinhole camera (40 mm, f/143, red-window counting, rotary shutter on a patterned skin, TURN cradle) designed in the v0.3 pipeline and checked digitally; renders in `docs/living/renders/cam-*.png`; widget `lab-dayrally-cam`. Unprinted, no price.
- `DAYRALLY-ROD.md` — the dayrally rod (fixed-line, four sections that pack inside the grip, PETG-CF), the wharf reel and the TURN rod saddle, with the research behind the choices; widget `lab-dayrally-rod`, `lab-wharf-reel`. Unprinted, no price.
- `DAYRALLY-CAST.md` — the dayrally cast: a 1.03 m casting rod for a bought spinning reel, three hollow PPA-CF square sections printed flat that pack inside a 36 mm grip with a screw-lock reel seat; stress table at the design load; widget `lab-dayrally-cast`. Unprinted, no price. `FORWARDED-FISHING-KIT-REVIEW-20261020.md` reviews the forwarded OpenSCAD kit, ESP32-CAM housing and print-service list it answers.
- `DAYRALLY-RIDE.md` — the dayrally ride line: the hero pod v3 (hinged bento lid, accent latch, TPU gasket, lanyard loop, name slate, two-key TURN floor), TPU grips, an Apple Watch cradle that doubles as a charging dock, a phone mount with 45° self-centring channels and a ratchet slider, a bottle cup with 64 mm M5 slots that is a pen cup on the dock, and a crank stand that is a phone stand; the dayrally display font (Fredoka, OFL). Renders `docs/living/renders/ride-*.png`; widgets `lab-dayrally-ride`, `lab-ride-*`. Its 'On the bike' section covers the rack mount, rod quiver and top-tube saddle (family `rack`, `lab-ride-rack`) built from Kate's bike picture. Unprinted, no price.
- `DAYRALLY-MINI.md` — TURN mini (ADR-012): the TURN at 0.6 scale, a 26 mm cube with a socket in every face, a double-ended universal key, and the components library on it (angle joint, flat mount, tube and pole clamps, action cam mount with the three-finger fitting, helmet base, light mount, phone holder, battery dock, device holder, photo tag, collar mount, lantern hook, keyed bar end, mini-to-full adapter). Renders `mini-*.png`; widgets `lab-turn-mini`, `lab-mini-ride`, `lab-mini-explore`. Unprinted, no price. `DAYRALLY-RALLY-SERIES.md` — rally the dishound, the mascot, and the Shorts/TikTok series bible.
