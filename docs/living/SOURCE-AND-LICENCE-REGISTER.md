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
