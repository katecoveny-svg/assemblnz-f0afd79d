# Argon files received 19 October 2026 — what they are, what they are worth

**Status: assessment. Nothing from these files has been added to the parts
library.**

Kate uploaded five files produced in a Google Gemini "Argon" session,
branded "NOMAD // MODULAR":

| File | What it is | Findings |
|---|---|---|
| `nomad_edc_parametric.scad` | OpenSCAD script: a 76 mm fluted capsule with four "print-in-place" pivoting petal trays, 0.35 mm clearances | Readable, parametric, sensible DFM comments (elephant-foot relief, 45° chamfers). The trays are plain cubes on pins; the mechanism is asserted, not designed. |
| `nomad_edc_printfarm.stl` | The capsule as ASCII STL | 4,928 triangles, **2 separate solids**, **56 non-manifold edges**, bounding box 85 × 136 × 70 mm with geometry below z = 0. Rendered: a fluted knob with rings and petal fragments floating beside it. Not printable as is. |
| `nomad_reel_parametric.py` | CadQuery script: a 76 mm "cast-pod" reel with a captive spool, crank pin and a 22.2 mm handlebar flex-clamp | The idea is good: a handline reel that keys onto a bar. The script unions the spool into the hub (no actual clearance survives a union), so it would print as one solid lump. |
| `nomad_reel_printfarm_1.stl` | The reel as ASCII STL | 4,168 triangles, **2 solids**, **32 non-manifold edges**, 73 × 108 × 149 mm. Rendered: a cylinder, a disc and a clamp intersecting and floating. Not printable as is. |
| `nomad_modular_cad_product_studio.html` | An 87 KB single-page "Print-Farm CAD Engineering Studio" on three.js 0.128 listing four concepts (Nordic-grid pegboard with compliant dovetails, cast-pod reel, iris capsule, a 1:12 Commencal with working suspension) | A concept storefront. No real geometry pipeline, no manifest, no part codes, a different brand name. |

## Verdict

Useful as **sketches**, not as parts.

- The TURN library already covers the pegboard idea with a tested interface
  (42 mm pitch, quarter-turn key, locator nub, digital fit tests, a
  test-print kit). The Argon pegboard uses a different, untested dovetail.
- The scripts show the right instincts (parameters for clearance, nozzle
  width, chamfers) and the same approach `tools/living-cad` already uses in
  manifold3d. They do not replace it.
- The two STLs fail the basic checks every part in the manifest passes
  (watertight, one body, sits on the bed). They should not be sent to a
  printer or loaded into the widget.

## What to keep

1. **The handline reel idea**, re-designed in `tools/living-cad` as a
   dayrally product: a spool that keys onto the TURN mount, a crank, a line
   guard, no print-in-place bearing. Print the spool and housing as separate
   parts with a real clearance, test with the kit, then add it to the
   manifest. Name it with the dayrally family, not NOMAD.
2. **The fluted shell** as a surface option for pods, if the test print
   shows the ribs resolve at 0.2 mm.
3. **The "miniature of a real bike" demand signal** (the 1:12 Commencal):
   licensing makes real bikes a problem; the dayrally bike parts (number
   plate, bar ends, spoke beads, saddles) are the on-brand answer.

## What to drop

- "Print-in-place" mechanisms until one has printed and worked.
- The NOMAD name and the "AI-engineered" framing; the brand says what a
  thing is and never claims intelligence.
- ASCII STLs; export binary from the pipeline, with the hash in the manifest.
