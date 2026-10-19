# Source handoff — what to send, and what it does and does not prove

Written 19 October 2026 in answer to the request for model code rather than
STLs, so a partner can change dimensions, compartments and clearances and
understand how the connections were intended to work.

## Are we using OpenSCAD?

Not as the main engine. The TURN parts library v0.3 is Python on manifold3d
(`tools/living-cad/cad/`, see its README); the AC-02 collection is CadQuery
(`tools/living-cad/ac02/source/`). OpenSCAD appeared only in the Argon
files, which were assessed and not adopted. From today OpenSCAD is in the
toolkit alongside those two, for dimension-driven objects, starting with
the drawer-fit family (`tools/living-cad/scad/drawer-fit/`, ADR-009).

## The package

`assembl-living-source-20261019.zip` holds source only (no STLs, no STEP):

| Path in the zip | What it is |
|---|---|
| `turn-v0.3/cad/*.py` | the TURN interface and every living and dayrally part as parametric Python; `lib.py` holds the interface constants (42 mm pitch, 8 mm board, Ø13 keyway, Ø22 chamber, 0.35 mm detents, locator nub, clamp) |
| `turn-v0.3/manifest.py`, `turn-v0.3/cad-manifest.json` | the manifest bridge and the current manifest with file hashes and fit-test scalars |
| `turn-v0.3/README.md`, `UPSTREAM-README-v0.3.md`, `test-kit/TEST-KIT.md` | how to rebuild, what the test kit is for |
| `turn-v0.3/research/*.md` | the design research behind the interface |
| `ac02/source/*.py`, `ac02/manifest.json`, `ac02/validation/`, `ac02/README.md` | the AC-02 collection's CadQuery builders, checks and manifest (TR-01 desk rail, wall candidate, new families) |
| `scad/drawer-fit/*.scad` | the OpenSCAD drawer-fit family |
| `docs/ASSEMBL-LIVING.md`, `AC02-RECONCILIATION-20261019.md`, `SOURCE-AND-LICENCE-REGISTER.md` | the canon, the reconciliation between the two libraries, and the licence record |

## How the connections are meant to work

- **TURN (v0.3, canonical).** A quarter-turn key: a Ø13 mm bore through an
  8 mm board on a 42 mm pitch, a Ø22 mm rear chamber the key's lugs turn
  into, 0.35 mm detents that click at the locked position, a locator nub
  on each accessory so it cannot rotate on the board, and a clamp value
  that sets the preload. `cad/lib.py` defines these; `cad/fit_test.py`
  checks them digitally; `cad/test_kit.py` prints eight specimens to tune
  `CLAMP`, `BUMP_H` and `DIMPLE_D` on a real printer.
- **AC-02 wall (candidate).** The same pitch, bore and chamber reconstructed
  in CadQuery, with a key that has no detents and zero preload plus two
  preload specimens. Not interchangeable with v0.3 keys until one is
  chosen on physical feel.
- **TR-01 desk rail (candidate).** Two dovetail rails 44 mm apart, 6 mm
  stems and 10 mm heads, with a fit coupon. Independent of TURN.
- **Drawer fit.** No connection at all: a tray drops into a measured
  drawer with a 1.5 mm clearance each side; dividers wedge with soft feet.

## What this does not prove

Nothing in the package has been printed by assembl. The digital checks
(watertight meshes, fit-test scalars, assembly intersection checks) are
recorded; print settings, retention, load, fatigue and fit on a real
printer are not. The first physical evidence will be the v0.3 test kit and
the AC-02 sample set, ordered together from one partner.

## Licence line to include when sending

> Source shared for evaluation. Copyright assembl, 2026. All rights
> reserved until a licence is chosen. No third-party CAD or fonts are
> redistributed. Nothing here is approved for manufacture or sale.
