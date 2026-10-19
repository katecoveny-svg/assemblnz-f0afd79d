# AC-02 reconciliation — the real-CAD collection beside the TURN library

**Status: imported as digital prototypes. Unprinted, not approved for
manufacture, no price, not for sale.** 19 October 2026.

Kate delivered `assembl-living-dayrally-real-cad-v02.zip` (AC-02): 109 native
STEP solids with matching STLs, 18 assembled views as STEP and GLB, CadQuery
source, validation evidence, SHA-256 sums (all 323 verified on import), a
17-page manufacturing guide and a store integration handoff.

## What it is next to what we have

| | TURN v0.3 (`cad-manifest.json`) | AC-02 (`lib/living/ac02-manifest.json`) |
|---|---|---|
| Source | manifold3d pipeline in `tools/living-cad/` | CadQuery source in `tools/living-cad/ac02/source/` |
| Wall interface | **canonical TURN**: 42 mm pitch, 8 mm board, Ø13 keyway, Ø22 chamber, detents, locator nub, digital fit tests, test kit | **candidate** reconstruction of the v0.1 interface: same pitch, bore and chamber; keys with **no detents and zero preload**; two preload specimens; not a replacement |
| Desk | none | **TR-01** double-dovetail rail: two rails 44 mm apart, 6 mm stems, 10 mm heads; coupon included. A new foundation candidate. |
| New families | — | orbit planter, folded shade, manual clock (optional quartz shell), flat-pack shelf, tabletop and outfit valets (research), dayrally case with folding handle and 300 mm rule, three Dayrally Mini display bikes, pet walk kit |
| Personalisation | lettering parts (name plate, tags, lids) in a second colour | names **cut into native geometry** on rebuild (bike bases, wall label, name skin, pet tag), verified by a regeneration test |
| Store state | 57 drafts in Shopify; nothing published | not in Shopify; `purchase_enabled: false`, no variant mapping, by design |

Decision: **TURN v0.3 stays canonical** for the wall. AC-02 wall parts are
kept as a candidate study; the detent-free key must not be mixed with v0.3
boards in a kit. TR-01 and the new families are **additive** and enter the
widget as prototypes only.

## What was imported

- `tools/living-cad/ac02/`: manifest, storefront catalogue, bill of
  materials, SHA-256 sums, README, validation, CadQuery source, the handoff
  note and the 18 CAD preview images. The STEP and STL files (71 MB and
  20 MB) and the PDF guide stay in the archive; every part is identified by
  hash in the manifest, so a partner can verify what they receive.
- `public/living/cad/ac02/`: the 18 assembled GLBs (7 MB, metres, nodes
  named by part instance) and the preview images.
- `lib/living/ac02-manifest.json`: the slim manifest derived by
  `tools/living-cad/ac02/slim.py` (mass from solid volume at a candidate
  density, hashes, bounds, components and designed colours).

## How the widget shows them

Each assembled view is a **prototype** at `/living/widget/ac02-<id>`:

- one body colour and one accent (components whose designed colour differs
  from the majority colour are the accent), a name where a part carries
  rebuilt lettering, quantity;
- the CAD preview as delivered, and an opt-in assembled 3D view from the
  GLB, recoloured by role;
- print mass, time and material estimated from solid volume; **retail "to
  be quoted"**; the reference `AC02-<VIEW>-<COL>` instead of a part code;
- purchasing `not_enabled`, with the reason on the item, and a print sheet
  that points at the delivery archive by hash.

The embed loader will still write these as line item properties if a store
page ever hosted one. It should not: the index page and the item both say
so.

## Also received: AL-05 engineering release

`assembl-living-AL05-engineering-release.zip` is the earlier LINK-05 /
CURVE-05 exploratory set: eight CadQuery parts (a sliding-dovetail fit
coupon with three female clearances, two fluted cups, a desktop dock and a
160 mm pegboard tile), all watertight, all `experimental_only`. It is the
AL-05 library the repository already references in the SHOP-01 notes. It
predates the 42 mm TURN and AC-02, its tile is not on the TURN grid, and
its README says the slides are not a lock. Not imported; superseded.

## Next

1. Order the README's sample set from the chosen partner: wall 2×2 panel
   and key specimens, the TR-01 rail coupon, one mini bike, the case hinge
   and cap specimens. Pair it with the v0.3 test kit in the same order so
   the two key designs are compared on the same printer.
2. Decide the wall key: v0.3 detented TURN or the AC-02 clearance key, on
   physical feel. Retire the other.
3. If TR-01 passes the coupon, add it to `lib/living` as a foundation with
   its own fit check and move the desk family from prototype to product.
4. Keep every AC-02 view a prototype until step 1 is in hand.
