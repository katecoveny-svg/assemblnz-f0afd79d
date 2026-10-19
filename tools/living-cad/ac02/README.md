# assembl / living + dayrally
## AC-02 — real geometry, unprinted prototypes

This is a CAD delivery, not a mock-up or a manufacturing order. It contains **109 separate part designs** as native **STEP solids and STL meshes**, plus **18 assembled STEP/GLB views**, editable CadQuery/Python source, CAD-derived preview images and a manufacturing handoff.

The miniature bikes are **small display models**, not rideable bicycles. The reference pictures informed the direction, but these are new interpretations, not replicas of Commençal, Yeti, Edgy, Slate or another creator's products. The renders show the geometry in this package, not the earlier AI-generated product images.

## Start here

Open `START_HERE.html` for the visual catalogue after extracting the ZIP. Read `docs/assembly-and-manufacturing-guide.pdf` before sending files to a printer. Individual STEP and STL files are in `parts/`. Colour-separated assembled views are in `assemblies/`. The named model meshes in each GLB are derived from the same solids as the downloadable CAD.

A printing partner can quote or sample these files. You do not have to own a printer. There is **no payment, supplier connection, order dispatch or automatic Shopify installation** inside the package.

## Collections

| Group | Distinct part files | What it includes |
|---|---:|---|
| Wall / TURN candidate | 17 | 42 mm-pitch panel tiles, native quarter-turn keys, test variants, frame, pockets, ledges, stationary rod cradle, recessed lure storage and name panel. |
| Desk / TR-01 / vanity | 20 | Double-dovetail rail segments, connector, fit coupon, stops, cups, tray, phone rest, note slot, cosmetic wells, cable comb, desk-edge perch, wedges, fitted trays and ribbed three-lobe organisers. |
| Objects / pets / light | 17 | Rounded planter with removable legs, catch tray, folded lampshade, manual clock and optional quartz casing, bag-roll pod, cap, accessory clip, name tag and bowl surround. |
| Small storage / valet | 14 | Flat-pack three-tier small shelf, alignment pins, printed column segments, sleeves, floor hub, legs, shoulder hub and arms, catch tray and stop collar. |
| Dayrally kit | 15 | Case, lid, folding handle, pins and caps, removable tray, line spool, leader card, personalisation panel, three folding-rule links and a 100 mm calibration bar. |
| Dayrally Mini | 26 | FLOW / park, DROP / downhill and RIDGE / enduro display bikes, shared wheel/axle parts, distinct frames, forks, cockpits, saddles, cranks and engraved bases. |

An assembled view can use several copies of a part. Open and closed case views are **views of one product**, not two kits to purchase. The assembly manifests record quantities by instance; aggregate only the view you intend to manufacture. The closed case is the more complete assembly bill of materials.

## File formats and dimensions

- **STEP:** native solid boundary geometry in millimetres. The files were reopened and checked for solid count, valid geometry and positive volume. STEP does not preserve the original procedural feature history; the Python source does.
- **STL:** individual print-oriented, bed-normalised meshes in millimetres. All supplied individual parts fit within a 250 mm cube, but that alone does not prove that a particular supplier can manufacture them.
- **GLB:** named, coloured assembly meshes in metres for web previews. Multiply by 1,000 only when a millimetre-based viewer requires it. Never apply a viewport/explode transform to the manufacturing file.
- **Source:** `source/` contains the actual parameterised geometry builders, checks and CAD-only rendering code.
- **Manifest:** `manifest.json` and `storefront-catalogue.json` bind a part to its revision, file paths, file hashes and release status. `bill-of-materials.json` lists every assembly component.

An STL orientation is a starting orientation, not a claim of support-free printing. Hollow parts, small bike details, projecting lugs and the spool flange need a slicer and support review. Do not send an assembled STEP or an exploded-view mesh to a printer as one fused print unless that is the deliberately selected design.

## Existing library and physical interfaces

The incoming `assembl-living-parts-v0.1.zip` is preserved outside this delivery, unchanged. Its proposed TURN geometry uses a **42 mm pitch**, an 8 mm board, a 13 mm bore and 22 mm rear chamber. AC-02 reconstructs corresponding wall solids in native CAD and adds new parts. It **does not silently replace another older 24 mm interface** elsewhere in the storefront.

`turn-key-clearance` is intentionally not an exact copy of the old spring key: it has **zero nominal cone preload and no detent bumps**. The 0.1 / 0.2 mm preload keys are fit specimens, not released parts. The new **TR-01 desk rail** is a different interface: two rails 44 mm apart, 6 mm stems, 10 mm heads, with sample female clearances. Cross-collection compatibility is only promised when a specific adapter is designed and physically tested.

Do not rescale a whole part to change capacity: that changes shafts, slots, measurement marks and mating surfaces. Resize useful cavities through the source functions, keep interface geometry fixed, and regenerate all related files and checks.

## Rebuild and genuinely personalise

The build was exercised in Python with CadQuery 2.8.0, NumPy and trimesh. Rendering additionally uses VTK and Pillow. No font files are shipped; geometric lettering uses a locally installed DejaVu Sans font.

Install the CAD dependencies in your own development environment, then run from the extracted directory:

```sh
python source/build_all.py --name MILA --pet-name FRANKLIN --out ./mila-prototype
```

Or rebuild only the miniature bikes:

```sh
python source/build_all.py --group bikes --name MILA --out ./mila-mini-bikes
```

The output directory must be new/empty, so an older revision is not accidentally overwritten. Names can be 1–14 printable characters. Individual source functions also expose drawer dimensions, rail length, column length and clearances. These are engineering inputs, **not unrestricted customer-facing sliders**. Rebuilding does not grant approval to manufacture or sell.

## What has actually been checked

`validation/` records digital evidence, including native solid validity, STEP readback, solid volumes, individual mesh checks, maximum part envelopes, selected mating checks and a readback-based pairwise intersection check for the supplied assembled poses. A separate personalisation test regenerated the three miniature-bike bases with MILA instead of JACK and checked that real solid geometry changed.

These checks do **not** establish reliable print settings, fatigue life, safe loads, drop resistance, chemical compatibility, thermal performance, waterproofness, regulatory compliance or safe use around children. No physical samples were printed in this work. Materials are only candidates. Pin/cap retention is deliberately unresolved pending samples; several caps are small-clearance/slit specimens, not a proven press fit.

## Critical boundaries

**Mini bikes:** fixed frames and decorative shock details; no functioning suspension or chain drive. Separate wheel and steering parts have nominal clearances, not measured rolling performance. Small parts; not assessed as a child-safe toy. Not rideable or for actual bike repair.

**Dayrally case:** real hinge, skirt and latch shapes are included, but catch deflection, pin retention, fatigue, safe carrying load and sealing are untested. The folding rule has a nominal 0–300 mm scale, recessed pivots and no positive straight-lock. Confirm print scale and straightness; do not rely on it for legal catch sizing until validated.

**Valet and shelf:** lightweight small-storage studies. No seating, climbing, child-protection, heavy-book or full-wardrobe rating. The tall all-printed valet is an **R&D assembly only**; stability, creep, joint retention and anchorage must be developed before real use. Never substitute a person's weight for a controlled load test.

**Wall products:** wall screws and substrate-specific anchors are conventional parts and are not included. The decorative border has no proven retention method. Stationary rod cradles are not scooter/bike transport mounts.

**Pets:** no chew toys, restraint hardware or printed food-contact bowl. Bag rolls, feeding bowls and leads are separate items. The tag and clip are accessories, not load-bearing pet hardware.

**Clock and shade:** the fully printed dial has manually positioned hands; it does not keep time. The optional quartz shell requires a separately selected movement. The shade includes no electrical parts. An LED label or material data sheet alone is not a finished-product thermal/safety assessment.

## Practical sample order

Start with the wall 2x2 panel and key specimens, the TR-01 rail coupon, one mini bike, and the case hinge/cap specimens. Agree the exact material, orientation, layer settings, supports, post-processing, assembly and packaging with one print/fulfilment partner. Inspect samples, revise the CAD if necessary, then qualify larger kits. The supplier's sliced quote, not solid volume alone, establishes cost.

## Rights and handoff

No downloaded third-party product CAD or font files are redistributed here. The user-supplied library informed the proposed interface. Third-party product names and images remain inspiration references, not evidence of a licence or endorsement. Independent design/patent/commercial-rights review has not been performed.

`docs/STORE-INTEGRATION-HANDOFF.md` gives the implementation handoff. Nothing was dispatched to another GPT workspace, installed in Shopify or released for purchase by creating this package.
