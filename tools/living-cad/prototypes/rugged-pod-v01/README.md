# Dayrally rugged pod RP01 · print-development prototypes

21 October 2026. **Editable CAD and digital fit evidence only. No physical samples, water rating, flotation rating, impact rating or mounting safety proof.** Start with the **standard** size. Mini, tall and long are parametric extensions, not validated physical products. Existing v0.3 designs, keys, mounts, catalogue, imagery, Shopify status and purchasing restrictions are unchanged.

## Open and print

- `generated/step/*-assembly.step`: assembled, named solids for CAD inspection. STEP is editable B-rep, not an original feature-history file. The gasket is shown FREE and intentionally overlaps the rim by 0.4 mm.
- `generated/step/*-{shell,lid,gasket,carrier,foam_deck}.step`: individual editable B-reps in assembly coordinates, millimetres.
- `generated/stl/`: individual print-oriented files, lowest surface at z=0, millimetres. Lid top faces the bed; gasket groove/lip face upward. **Do not print assembly STEP as one fused item.**
- `build.py`: true parameter source, CadQuery. Reuses the existing size table and reads TURN constants from `../../cad/lib.py`; checks against actual existing manifold keys and mounts.
- `generated/validation.json`: machine-generated geometric checks, volumes and limits.
- `PHYSICAL-TESTS.md`: print, assembly and test gates; all results pending.

Rebuild from the repository root:

```sh
python -m pip install -r tools/living-cad/prototypes/rugged-pod-v01/requirements.txt
python tools/living-cad/prototypes/rugged-pod-v01/build.py
```

The download preserves the `tools/living-cad/cad/` dependency layout. No API key or network service is required to build after installing dependencies. Fonts: DejaVu Sans for dimensional labels; install this font before rebuilding. Keep generated files out of the existing storefront manifest until physical review.

## Engineering decisions

The original `cad/dayrally2.py` pods use 2.2 mm walls, 2.4 mm floor, a 0.25 mm friction-lip clearance, two floor-penetrating keyways and a thumb notch. A lid gasket alone cannot close those floor penetrations. RP01 therefore makes the storage shell a separate continuous floor above an external carrier, keeping the existing TURN geometry below it.

| Feature | RP01 implemented geometry |
|---|---|
| Shell | Existing stadium planform: mini 92×60×26; standard 128×72×34; tall 128×72×58; long 176×72×34 mm. Heights are shell-only. |
| Walls / floor | 2.6 / 3.2 mm; four 2 mm wide, 1.4 mm high effective internal floor ribs; external bottom radius 1.2 mm. |
| Seal land | Local widened top rim: outer footprint +6 mm; land 5.6 mm wide. No thumb notch. |
| Lid | 4 mm plate with 3 mm inner locating lip; nominal 0.30 mm clearance per side. |
| Channel | 2.4 mm wide ×1.2 mm deep in lid underside, centred on original outline. |
| Gasket | Separate continuous TPU rectangular ring, 1.6 mm wide ×1.6 mm free height. Target 0.4 mm /25% squeeze at hard rim contact. |
| Squeeze space | Cross-section 2.56 mm² vs groove 2.88 mm²: nominal 88.9% fill. Width at volume-conserving rectangular compression is 2.133 mm; not a rubber simulation. |
| Compression | Four external M3 screw stations, not snap tabs. Hard rim and matching ears stop axial travel. No screw enters the cavity. |
| TURN | Same centres x=±21 mm, z=8..13 mm flange; Ø13 bore, 4 mm slots, r9.8 tips, Ø21 countersink at z13. Original key’s nominal 0.10 mm cone clamp retained. |
| External carrier | Separate 5 mm plate, four 14 mm high supports; shell underside at installed z27. Recessed screw heads remain above the mount face z8. |
| Eye | External 6 mm thick retrieval tab with Ø3.2 mm vertical hole. Not a rated tether anchor. |
| Foam option | Removable raised lattice deck, 6 mm above inner floor. Cut closed-cell foam around ribs/feet; deck itself is PETG, not buoyant foam. |
| Rulers | Lid centreline: 80 mm mini, 120 mm standard/tall, 170 mm long; 1 mm ticks, numbers every 10 mm, engraved 0.6 mm. Separate 150 mm ruler has 156×14×2 mm body. |

Rulers run on the lid's centreline because the stadium's curved ends do not provide the proposed long straight edge. Validate against a known steel rule after printing. The 150 mm ruler is not assumed to fit existing pen inserts. The proposed 35 cm base-plus-lid ruler is **not implemented** here: a positive registration joint, datum stop and measured assembled calibration are still needed. The v0.3 long pod now carries it (`docs/living/DAYRALLY-RULER.md`, 21 October) using the stadium apex itself as the datum; that approach is open to RP01 once its rim is proven. No legal fish-size/species claims are engraved.

### Deliberate departures from PR #1648

- Four screws replace two unproven cantilever latches for a controllable first compression experiment. A tool-free latch is a later iteration after closure-force and creep measurements.
- A flat rectangular gasket and widened rim replace 1.6 mm cord/0.4 mm rib; avoiding an excessively narrow sealing land is the hypothesis to test.
- The 1.2 mm bottom fillet replaces the proposed 3 mm radius to preserve the nominal thin sidewall/floor junction.
- Separate carrier prevents TURN holes crossing the seal boundary. It increases size, mass and mount offset. Overall installed height above mount face is **H+23 mm**, excluding screw heads; this is not interchangeable with old pod/lid height.
- Existing inserts/lids do not carry compatibility approval. The shell floor, ribs and lid lip have changed; only the supplied foam deck is geometrically checked inside RP01.
- No `IP64`, splash-proof or float-and-retrieve claim is adopted from the brief. A short dunk is an exploratory test, not an IP assessment.

### Nominal tolerances are hypotheses

The free gasket intentionally interferes with the rim. No hard PETG part should overlap another. TURN cone interference is inherited and separately measured. A ±0.10 mm error in both gasket height and groove depth gives about **13–35%** squeeze; print and measure before choosing gasket thickness. Combined inward fit errors can consume the 0.30 mm lip clearance. M3 bores are Ø3.5 mm and nut pockets are 5.8 mm across flats; verify actual screws/nuts and tune on the printer. Never force a warped lid down with the screws.

## Assembly / hardware per pod

1. Print shell, lid and carrier in PETG; gasket in TPU 95A. Foam deck is optional PETG. Bright lid is for visibility only.
2. Buy four M3×12 socket screws, four flat washers approximately 0.5 mm thick, four M3 hex nuts for lid compression; four M3×25 socket screws and four M3 hex nuts for the carrier. Lower screw heads must be ≤Ø5.5×3 mm to fit the Ø6.6×3.5 mm counterbores; no lower washer is modelled. Stainless preferred; verify dimensions/corrosion suitability with supplier. Hardware gauges check screws only, not thread engagement performance.
3. Seat the four upper nuts in the underside pockets of the shell’s top ears, and lower nuts in the top pockets of its bottom ears. Hold nuts with a tool while starting threads; press-fit retention is not proven.
4. **Insert both existing TURN keys into the carrier before attaching the shell.** Full axial key insertion after assembly is not established; the gap is for rotation/tool access, not finger-clearance assurance.
5. Attach carrier with M3×25 screws from recessed underside. Verify bolts do not bottom out, strip, protrude below mounting face, or prevent seating. Recesses may need bridge cleanup; inspect before assembly.
6. Fit gasket into clean lid channel without stretch/twist. Close lid; use M3×12 screws with washers on top. Bring down gradually in a diagonal sequence until the hard stops just meet. Record torque but do not assume a safe torque rating. Stop for visible bowing, whitening or extrusion of gasket.
7. Mount on a bench-held existing saddle, rotate keys from open to locked with a thin tool through side openings. If access is inadequate, remove shell; do not enlarge load-bearing parts ad hoc.
8. Fit tested closed-cell foam below deck if desired. Preserve key access outside and continuous sealing surfaces inside. Fit a separately sourced float/tether only after eye and retrieval tests.

Nominal hard-body STEP and screw-gauge fit does not establish finger access, slicer success, tolerance-stack fit, creep, screw preload or shock strength.

## Provenance and scope

Inspected main commit `110a82f6961501ed87e8f2bdae47ecaff212c11c` (PR #1647 merged), PR #1648 open/documentation-only at inspection; proposal head `0b8a2e6bebae2b07190f43d02cc0994e92fa30d3`. Source paths: `cad/lib.py`, `cad/dayrally.py`, `cad/dayrally2.py`, `cad/dayrally_scoot.py`, and existing fit tests. Prototype creates a CadQuery B-rep export path while reusing the current interface parameters and checking original geometry. This directory is deliberately outside the shipping CAD manifest.

Material reading, reviewed 21 October 2026: [Prusa PETG guide](https://help.prusa3d.com/article/petg_2059), [flexible material guide](https://help.prusa3d.com/article/flexible-materials_2057), [closable watertight-print experiments](https://blog.prusa3d.com/watertight-3d-printing-part-2_53638/). These support material/process selection, not performance of RP01.
