# drawer fit — OpenSCAD source

The first assembl product family written in OpenSCAD: a tray and a free
divider sized to a measured drawer. Dimension-driven objects suit OpenSCAD;
the TURN parts and the dayrally pieces stay in the manifold3d pipeline
(`../../cad/`) and the AC-02 collection in CadQuery (`../../ac02/source/`).
OpenSCAD is used alongside those, not instead of them (ADR-009).

**Status: proposed, unprinted, not for sale.** No OpenSCAD binary is in the
build sandbox, so these files have not been rendered or mesh-checked here.
Render locally, then run the usual checks before anything reaches the
manifest.

## Files

| File | What it makes | Parameters a customer would set |
|---|---|---|
| `drawer_tray.scad` | a drop-in tray with a grid of compartments and a label recess; splits itself into bed-sized pieces | drawer width, depth, height; columns, rows |
| `drawer_divider.scad` | a free divider with soft end feet, optional cross notches | span, height, notch pitch |

Maker parameters (wall, floor, clearance, corner radius, printer bed) are
exposed too, under their own headings, so the OpenSCAD customiser groups
them separately.

## Render

```sh
openscad -o tray.stl -D drawer_width=300 -D drawer_depth=400 -D drawer_height=60 -D columns=3 -D rows=2 drawer_tray.scad
openscad -o divider.stl -D span=400 -D drawer_height=60 drawer_divider.scad
```

Then check the mesh the same way the pipeline does (watertight, one body,
fits the bed) before printing one tray at a small size, for example
150 × 200 × 40 mm with 2 × 2 compartments, to confirm `clearance` and
`wall` on the chosen printer.

## Dependencies and licence

None. Both files use only OpenSCAD primitives, so nothing third-party is
redistributed. If a later part adopts BOSL2 (BSD-2-Clause) or Gridfinity
Rebuilt (MIT), record it in `docs/living/SOURCE-AND-LICENCE-REGISTER.md`
with the notice obligations before the part is built.

## What this family is for

A customer measures one drawer, the widget takes width, depth and height,
and the tray and dividers come out fitted, in one of the living colours,
with a label recess for the printed label. Gridfinity compatibility is a
separate decision: a 42 mm grid pitch on the TURN wall does not make a
Gridfinity bin fit an assembl tray, and nothing here claims it does.
