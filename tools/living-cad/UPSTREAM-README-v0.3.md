# assembl living — parts library v0.3

Original designs, generated from code. Every part fits a 250 mm cube, so any standard Bambu print farm can make it.

**Status:** designed and checked digitally. Nothing has been printed yet. Treat clearances, clamp and detent values as starting points to tune on a first test print.

## What's in this folder

| Folder | What it is |
|---|---|
| `parts/stl/` | Print files, already in print orientation (no supports needed except where noted). |
| `parts/parts-report.json` | Size, estimated PLA grams, watertight check and unsupported-area check for every part. |
| `parts/fit-tests.json` | Digital fit tests for the TURN key, board and accessories. |
| `cad/lib.py` | The parametric source. Change a number, rebuild every part. |
| `cad/build.py` | Rebuilds every STL and preview file. Run `python3 cad/build.py`. |
| `cad/fit_test.py` | Re-runs the fit tests. |
| `cad/dayrally.py`, `cad/build_dayrally.py` | dayrally and bike parts; `build_dayrally.py` rebuilds everything. |
| `cad/extras.py`, `cad/build_extras.py` | v0.2: cut-out trays, renter parts, part codes. |
| `cad/club_plates.py` | One plate and one lettering file per rider from a CSV: `python3 cad/club_plates.py riders.csv out/ "Club name"`. |
| `render/` | Blender scripts that render the product and room images (`pip install bpy`). |
| `research/` | Notes from the large-format and materials research. |

Needs Python 3 with `manifold3d`, `trimesh`, `numpy` and `fonttools` (`pip install manifold3d trimesh numpy fonttools`). The Instrument Sans font for name plates is in `fonts/`.

## The assembl TURN standard (v0.1, proposed)

| Feature | Value |
|---|---|
| Grid pitch (wall boards and drawers) | 42.0 mm |
| Board | 8.0 mm thick: 4.0 standoff + 4.0 front plate |
| Keyway | Ø13.0 bore, two 4.0 mm lug slots on the vertical axis reaching r 9.8 |
| Chamber behind each keyway | Ø22.0, where the key's lugs turn |
| Detents | 0.35 mm dimples at 3 and 9 o'clock |
| Accessory flange | 5.0 mm, keyway plus 45° countersink (Ø13 → Ø21) |
| TURN key | Push in with the grip upright, quarter-turn to horizontal to lock |
| Locator nub | Ø12.4 × 3.0 mm, drops into a neighbouring keyway |

Rules: an accessory with two or more keys needs no nub. A single-key accessory has at least one nub, which stops it rotating and carries the shear load.

## Fit-test results (digital)

- Key slides in and out with the grip upright: 0 mm³ contact with board or accessory at every depth.
- Turning: the bumps ride the plate between 15° and 75°, then drop into the detent at 0°. That is the click.
- Locked key is captured (it overlaps the plate if pulled 0.5 mm forward); an open key lifts straight out.
- Key cone clamps the accessory with a designed 0.10 mm interference.
- Hook nub, shelf and board flanges sit flat with 0 mm³ overlap.
- Dowel joints: 19 mm dowels in every socket never touch each other.

## Parts

| Part | Print size (mm) | Est. PLA | Material to use |
|---|---|---|---|
| Grid board 4×4 | 168 × 168 × 8 | 97 g | PLA Matte |
| Grid board 2×4 | 84 × 168 × 8 | 49 g | PLA Matte |
| TURN key | 21 × 21 × 16 | 2 g | PETG (holds its grip better than PLA) |
| Anchor washer | 20 × 20 × 6 | 1 g | PETG |
| Hook | 51 × 73 × 26 | 13 g | PLA Matte |
| Rod cradle | 58 × 73 × 26 | 12 g | PETG or ASA |
| Shelf 2 / 3 wide | 76 / 118 × 84 × 56 | 38 / 55 g | PLA Matte |
| Bin 2 wide | 76 × 50 × 76 | 40 g | PLA Matte |
| Cup | 40 × 43 × 104 | 30 g | PLA Matte, PETG for vanity |
| Lure garage | 118 × 46 × 104 | 143 g | PETG or ASA |
| Name plate + lettering | 168 × 40 × 5 | 21 g | PLA Matte, two colours |
| Drawer trays (samples) | up to 240 × 180 × 50 | 38–181 g | PLA Matte |
| Dowel joint, corner / tee | 50 × 50 × 72 / 72 × 50 × 72 | 31 / 39 g | PETG. Small overhang near the base: use a brim, supports optional |
| Dowel foot | Ø28 × 30 | 7 g | PETG |
| Fold pendant shade | Ø217 × 171 | 191 g | Translucent PETG, LED only |

Gram figures are estimates (0.9 mm shell, 15% infill). The print partner's slicer gives the real figure.

## dayrally and bike (v0.1, same TURN key)

The dayrally pod's floor is a TURN flange: two keyways 42 mm apart. The same pod locks onto the bar saddle, the strap clip, or any Grid board at home. The keys go in from inside the pod.

| Part | Print size (mm) | Est. PLA | Material to use |
|---|---|---|---|
| Pod base | 139 × 72 × 34 | 45 g | PLA Matte (PETG for outdoor use) |
| Pod lid, name inlaid flush | 128 × 72 × 15 | 32 g | PLA Matte, two colours; prints top-down |
| Pod inserts, tackle (6) / everyday (3) | 121 × 65 × 14 | 16–18 g | PLA Matte |
| Bar saddle, 22–35 mm bars | 70 × 32 × 28 | 20 g | PETG; two zip ties or a rubber strap |
| Strap clip, straps up to 42 mm | 70 × 36 × 20 | 20 g | PETG |
| Number plate + lettering | 170 × 124 × 4 | 59 g | PETG, two colours |
| Tyre lever | 111 × 22 × 18 | 8 g | PETG or PA |
| Bar-end plug, 18–20 mm bar ends | Ø24 × 20 | 3 g | PETG |
| Handline winder | 128 × 56 × 5 | 13 g | PETG |
| Bag tag, name inlaid | 64 × 28 × 4 | 5 g | PLA Matte, two colours |

Digital fit tests (`parts/fit-tests-dayrally.json`): pod sits flat on the saddle, strap clip and a board with 0 mm³ overlap; lid, insert and keys never touch; the key slides in cleanly and is captured once turned.

Not designed: a printed bottle cage (load-critical, needs real testing first) and anything with magnets.

## dayrally v2 (same TURN key)

Every pod has two keyways 42 mm apart in its floor, so **every size fits every mount** and any Grid board. Source: `cad/dayrally2.py`; build with `python3 cad/build_dayrally2.py` (print files in `parts/stl/dr2-*`, report in `parts/parts-report-dayrally2.json`); fit tests in `cad/fit_test_dayrally2.py`.

| Family | Options |
|---|---|
| Pods | mini 92 × 60, standard 128 × 72, tall 128 × 72 (twice as deep), long 176 × 72 |
| Lids | plain, name, waves, dots, check, bolt, topo, stars. Pattern or name inlaid flush, 0.6 mm, second colour |
| Inserts | mini: split, quad, earbuds · standard: everyday, tackle, beach, tech, split · tall: deep two, deep tackle, cards standing · long: pens, tackle, everyday |
| Mounts | strap clip (42 mm), duo strap (25 mm), belt clip (50 mm), bar saddle (22–35 mm), frame saddle (25–45 mm tubes), carabiner loop, home dock |
| Extras | bag charms (star, heart, bolt, flower, fish, wave), zip pulls, phone stand, spoke beads, chair hooks, cable winders, plus the bag tag, winder, number plate, levers and bar ends |
| Colours | 12 colours and 10 named colourways (pod, lid, pattern, insert) |

Fit tests (`parts/fit-tests-dayrally2.json`): all four pods sit on all seven mounts and a Grid board with 0 mm³ overlap; lids, inserts and keys never collide; keys slide into every mount and are captured when turned; smallest pocket wall 3.4 mm; chair hook snaps onto 22–25 mm tubes (snug at 25). Lid patterns other than the sample are generated at order time, like cut-out trays.

## v0.2 additions

| Part | Print size (mm) | Est. PLA | Notes |
|---|---|---|---|
| Cut-out tray (example: vanity) | 240 × 190 × 24 | 280 g | Made per order by `cutout_tray(items)`. Each pocket is the item outline plus 1.2 mm, with a Ø18 finger scoop. Max 245 mm front to back; bigger sets split into two trays. |
| Over-door hanger | 52 × 46 × 30 | 11 g | PETG. Keys into a board's top row. Doors up to 35 mm; needs a 4 mm gap above the door. |
| Wardrobe-rail hanger | 51 × 46 × 30 | 10 g | PETG. Rails up to 32 mm. |
| Renter board 4×4 | 168 × 168 × 8 | 96 g | Flat back with 0.4 mm lanes showing where removable strips go; reorder code debossed on the back. |

**Part codes.** Every part can carry a short reorder code on a hidden face, e.g. `AL-B44R-OAT-S` (part, colour, check letter). The check letter is `ALPH[sum((i+1)·char) mod 32]` over `PART-COL`, using an alphabet without 0, O, 1 or I. The store page uses the same sum, so a mistyped code is caught.

Fit tests (`parts/fit-tests-renter.json`): both hangers sit in the board with 0 mm³ overlap; the rail hanger clears a 32 mm rail; the door hanger touches a square-edged 35 mm door by 7.8 mm³ at the inside corner fillet only (real door tops are rounded).

## Test-print kit and launch files

`parts/test-kit/` holds a 10-part, ~165 g print run that tunes the key clamp, the cut-out pocket clearance and the door-hanger gap before anything is sold. Instructions and a results table are in `parts/test-kit/TEST-KIT.md`; rebuild with `python3 cad/test_kit.py`.

`launch/` holds the production-cost ceilings (`costing.csv`), draft emails for the print partner and Energy Safety (`emails.md`, not sent), and a Shopify product import file (`shopify-products.csv`, every product as a draft; rebuild with `python3 launch/make_shopify_csv.py`).

## Before selling

1. Print the fit-test set (a 2×4 board, two keys, a hook) and tune `CLAMP`, `BUMP_H` and `DIMPLE_D` in `cad/lib.py`.
2. Load-test the shelf, hook and bin on a real wall, then publish conservative limits.
3. Get written answers from the print partner on maximum part size, colours (matte and wood colours are usually custom orders), and NZ delivery times.
4. Lampshades: sell the shade only, LED only. Ask Energy Safety before bundling any electrical parts.
5. Cut-out trays: print the example tray and check the 1.2 mm clearance with real items before offering it.
6. Renter mode: test the over-door hanger on a real door and publish the gap it needs; test adhesive strips with the strip maker's weight limits.
7. Glow and colour-change filaments: confirm which ones the print partner stocks before offering those finishes.
