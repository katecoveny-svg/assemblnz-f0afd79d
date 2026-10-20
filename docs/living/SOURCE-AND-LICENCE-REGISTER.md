# Source and licence register — assembl / living CAD

Every design assembl builds on, evaluates or ships is recorded here with
its origin, licence and what the licence obliges. A part does not enter
the manifest until its row exists. Added 19 October 2026.

## Our own sources

| Source | Where | Engine | Licence | Status |
|---|---|---|---|---|
| assembl TURN parts library v0.3 | `tools/living-cad/cad/` | Python, manifold3d, trimesh, fonttools | **No licence declared.** Authored for assembl; all rights reserved by default until Kate chooses a licence. | designed and digitally checked; nothing printed |
| AC-02 real-CAD collection | `tools/living-cad/ac02/source/` | Python, CadQuery 2.8 | No licence declared; delivered to assembl 19 Oct 2026. Its README states no third-party CAD or fonts are redistributed. | digital prototypes; nothing printed |
| drawer fit | `tools/living-cad/scad/drawer-fit/` | OpenSCAD, no libraries | No licence declared; authored for assembl. | proposed; not rendered in the sandbox |
| AL-05 / LINK-05 / CURVE-05 | archive only | CadQuery | No licence declared | superseded, not imported |
| NOMAD / Argon files | archive only | OpenSCAD and CadQuery | None stated; generated output | sketches, not parts |

Before sending any of these outside assembl, decide the licence. Sharing
for evaluation is fine with the "all rights reserved, evaluation only"
line in `SOURCE-HANDOFF-20261019.md`.

## External sources under evaluation

Candidates only. None is adopted, printed or integrated. Licence texts must
be read in full at adoption time; the obligations below are the headline.

| Source | Use for assembl | Licence | Obligations if adopted | Decision |
|---|---|---|---|---|
| Gridfinity Rebuilt (OpenSCAD) | reference for how a mature storage system handles bins, baseplates, lips and stacking | MIT; records upstream Gridfinity attribution | keep the MIT notice and the Gridfinity attribution if any code is reused | **study only.** Kate's direction (19 Oct): assembl designs its own, more stylish storage variation rather than copying Gridfinity. Read it to learn the tolerances and stacking logic; write our own geometry (drawer fit is the start). Compatibility with Gridfinity is a separate, optional, tested claim. |
| BOSL2 (OpenSCAD library) | clips, hinges, dovetails, rounded containers, threads for original parts | BSD-2-Clause | keep the copyright notice and disclaimer with distributed source | first candidate as the general OpenSCAD toolkit |
| wbu modular drawer organiser | custom drawer divisions | CC BY 4.0 (checked on GitHub, the Thingiverse page did not load) | credit the author, link the licence, say what changed | relevant to drawer fit; compare with our own tray before adopting |
| Gridfinity Extended | dividers, lids, trays, item holders | GPL-3.0 | distributing adapted source means the adaptation is GPL-3.0; selling prints is unaffected, distributing code is | use only with a deliberate decision; keep separate from MIT/BSD code |
| Parametric Honeycomb Storage Wall | utility and craft wall panels | repository says CC BY 4.0 and names an upstream remix | verify the attribution chain to the original before adopting anything | hold until the chain is verified |
| Iteration3D (build123d) | a worked example of measurement-driven generation | engine open source; **models carry their own licences**: one storage box allows commercial use with attribution (download is STL, not source); one tube connector forbids commercial use, redistribution and derivatives | treat every model separately; never assume the engine's licence covers a model | study the workflow; do not reuse models |

### Added 19 October (evening): camera and rod references

| Source | Licence | Status | Notes |
|---|---|---|---|
| Make P6*6 pinhole camera (Thingiverse, Todd Schlemmer) | CC (non-commercial, share-alike as published) | study only | 6×6 printed 120 camera; confirms the format and the pinhole-disc approach. Nothing copied. |
| terraPin family (Schlaboratory) | CC as published; sales closed, files on Thingiverse | study only | Red-window frame indexing on a printed 120 body. Nothing copied. |
| Lord Rayleigh pinhole optimum, `d = 1.9 √(λ f)` | physics, public | used | `dayrally_cam.py` computes 0.28 mm for 40 mm at 550 nm. |
| Fish8r complete fishing set (MakerWorld, 4 segments, printed reel) | not stated on the listing we could read | reference only | Evidence that a printed rod in CF filament fishes; 4.8★ from 205 ratings. Nothing copied. |
| MakerWorld single-piece PETG-CF rod (maker report) | not stated | reference only | Material lesson: PLA softens, unfilled PETG creeps, PETG-CF holds. |
| Apple Watch Handlebar Mount, Limitless Labs (MakerWorld 2449695) | MakerWorld Exclusive License; commercial use via the designer's paid membership | reference only | Kate's pointer for the watch mount. Looked at the idea (watch on a bar clamp, band round the mount); the assembl cradle is a different object on the TURN. Nothing copied, nothing printed. |
| Outdoor Container, Robust and Waterproof, JANBERRY DESIGN (MakerWorld 1232711; mini 1259797; 2.0 1716697) | Standard Digital File License on the 2.0; the mini and 2.0 listings say commercial use needs the designer's membership; the original's licence field not read | reference only | Kate's pointer for a hardy outdoor pod. A screw-lid cylinder with an O-ring. The assembl ride pod is a hinged bento with a TPU gasket, a different mechanism, and does not claim waterproof. |
| Mountain Bike Handle Grip, rattierp (MakerWorld, from Kate's screenshot) | not found by search; licence unknown | reference only | Straight ribbed TPU grip, two parts. Printables makers report TPU grips want a collar or adhesive. Not opened; nothing copied. |
| Orbit Reel 180, Hand Fishing System, jakadels (MakerWorld, from Kate's screenshot) | Featured/Exclusive; membership required to print and sell, per the listing | study only | 180 mm hand reel with bearings, stoppers and a line guide. Not opened; nothing copied. A future assembl hand reel would be its own geometry on the wharf reel's lineage. |
| dayrally boards (Kate's AI-generated concept boards: the first set from 20 October described in brief 11.6; the second, `docs/living/boards/dayrally-look-20261020.jpg`, in 11.8; four more in 11.9; the bike picture `docs/living/boards/dayrally-bike-20261020.jpg` and the rally line board in 11.10) | Kate's own material; AI-generated imagery, no third-party design | canon for dayrally look and voice | Concept art, not photographs or products. Describe as concept visualisations wherever shown. Nothing in them is a measured part; the parts come from `tools/living-cad/cad/`. |
| Three-finger action-camera mount fitting (GoPro-style: 3 mm fingers, ~3.35 mm gaps, M5 thumb screw) | de facto public standard used by every action-camera accessory maker; dimensions measured from the fitting's common use, no licensed specification | adopted as an interface in `mini-cam-mount` and `mini-helmet-base` | Interface compatibility only; no GoPro part, drawing or trademark is used. Call it "action-camera fitting", not "GoPro mount", on product pages. |
| rally the dishound (Kate's AI-generated mascot illustrations on the boards) | Kate's own material; AI-generated | canon for the mascot; series bible `DAYRALLY-RALLY-SERIES.md` | Illustration, labelled as such until a real dog has worn a real part. The helmet, glasses and bike in the images are generic; no brand marks are reproduced. |
| Fredoka (Milena Brandão, Hafontia; Google Fonts) | SIL Open Font License 1.1 (`tools/living-cad/fonts/Fredoka-OFL.txt`) | adopted for dayrally display text | The closest licensed face to the AI-generated dayrally wordmark. Variable file plus a static Bold instance in `tools/living-cad/fonts/`. OFL: may be embedded, modified and redistributed; not sold on its own; reserved-name rules apply to renamed versions. |
| Tenkara fixed-line method; spigot ferrules; Cuban yo-yo hand reel | traditional, no owner | used as ideas | The rod is fixed-line, joined by spigots, with a V-groove hand reel. All geometry is ours. |
| assembl dayrally cam, rod, wharf reel, saddle, cradle (`dayrally_cam.py`, `dayrally_rod.py`) | assembl, licence not yet chosen (see Rules) | ours | Designed in the manifold3d pipeline on the TURN standard; checked digitally; unprinted. |

### Added 20 October: casting rod

| Source | Licence | Status | Notes |
|---|---|---|---|
| Forwarded OpenSCAD "master file" (rod, reel, box) and ESP32-CAM housing | unknown, from another assistant | not used | Sketches: see `FORWARDED-FISHING-KIT-REVIEW-20261020.md`. Nothing copied. |
| Bambu Lab PPA-CF and PA6-CF data; Polymaker PA12-CF notes | vendor data | used as numbers | Wet/dry bending modulus and absorption figures quoted in `DAYRALLY-CAST.md`. |
| Screw-lock spinning reel seat (Fuji DPS / CRB style: fixed hood, sliding hood, lock nut) | industry-standard mechanism, no owner | used as an idea | Our geometry: keyed hood riding a printed 36 × 3 thread cut into the grip. |
| assembl dayrally cast (`dayrally_cast.py`) | assembl, licence not yet chosen | ours | Hollow square sections printed flat, square spigot pins, stress table from the geometry. Unprinted. |

| "Ultimate Modular Hobby Toolbox – Customizable" (MakerWorld, ADay) | not checked | reference only | Stackable lattice crate with clip latches; Kate likes the form. Nothing copied; licence to check before any study. |
| dayrally concept board (Kate's, 18 October) | assembl's own concept art | canon for the dayrally register | Described in `DESIGN-BRIEF-20261019.md` §11.6. The pod it shows (hinged bento lid, latch, lanyard, name slate) is the next CAD build, pod v3. |

## Rules

1. Record the origin link, licence, version or commit, and the date checked.
2. Keep every notice the licence asks for in the source tree, next to the
   adapted file.
3. CC BY work gets a credit line in the product's print sheet and page.
4. GPL code lives in its own directory and never mixes into MIT, BSD or
   assembl-owned files.
5. A marketplace listing (Thingiverse, Printables, MakerWorld) is not the
   source; follow it back to the repository and record that.
6. Sharing a grid dimension is not compatibility. Gridfinity and TURN both
   use 42 mm; fit between them is a separate, tested claim.
7. Nothing in this register is a statement of exclusive rights. Design and
   patent review has not been performed on any of these.
