# dayrally ruler — a scale on the lid, a 35 cm fish ruler from the long pod, a 15 cm ruler piece

**Status: designed and checked digitally on 21 October 2026. Nothing printed, nothing measured against a steel rule. Lab items; no price, not listed.**
Source: `tools/living-cad/cad/dayrally_ruler.py` and the `ruler` lid style in `tools/living-cad/cad/dayrally2.py`.
Build: `python3 tools/living-cad/cad/build_dayrally2.py && python3 tools/living-cad/cad/build_dayrally_ruler.py`.
Fit checks: `python3 tools/living-cad/cad/fit_test_ruler.py` → `tools/living-cad/parts/fit-tests-ruler.json`.
Renders: `docs/living/renders/ruler-fish-sky.png`, `ruler-15-pens.png`. Widgets: `/living/widget/lab-fish-ruler`, `/living/widget/lab-ruler-15`; the `ruler` lid is a lid choice on every pod widget.
What it answers: items 1, 2 and 4 of the build order in `DAYRALLY-PODS-BRIEF-20261020.md` ("a basic ruler"). Item 3, the sealed lid, is Kate's RP01 prototype.

## The ruler lid

One more lid style beside plain, name, waves, dots, check, bolt, topo and stars. A 0.6 mm flush inlay in the
second colour, printed as the first layers like every other pattern: half-centimetre ticks (1.0 × 3 mm) and
centimetre ticks (1.2 × 6 mm) on a baseline 12 mm from the lid's centreline, the centimetre numbers above them in
Fredoka Bold at 4.5 mm cap height, and "cm" at the far end.

**0 is the lid's own end.** The scale starts at the apex of the stadium, so a lid laid against the thing you are
measuring reads from that thing, not from a mark 5 mm in. The first tick is at 5 mm, the last 5 mm before the
far end, because the lid top narrows to a point there.

| Lid | Reads to | Inlay bodies | Inlay |
|---|---|---|---|
| mini | 9.2 cm | 29 | 107 mm³ |
| standard, tall | 12.8 cm | 43 | 164 mm³ |
| long | 17.6 cm | 86 | 359 mm³ |

The ticks sit on the centreline band rather than along the long edge because the stadium's straight edge is only
104 mm long on the long pod; a scale along the edge would curve away for its last 36 mm at each end. Reading from
above, a tick 12 mm in from the edge is as true as one on the edge. The scale reads to the half centimetre, not the
millimetre: a 0.6 mm two-colour inlay needs features a 0.4 mm nozzle can lay as two lines, and millimetre ticks at
1 mm pitch would leave 0.2 mm of lid between them. The 15 cm piece carries the millimetres.

The long lid also carries one line of inlay text: **LID + BASE, END TO END: 35 CM**.

## The fish ruler

The long pod is the fish ruler. Nothing is added to the kit.

- **Lid: 0 to 17.6 cm**, the ruler lid above.
- **Base: 17.6 to 35.2 cm**, raised marks on the outer wall of the base, on the long side without the thumb
  notch. Centimetre ribs 1.4 mm wide and 10 mm tall, half-centimetre ribs 1.0 × 6 mm, standing 0.6 mm proud,
  and the numbers 19 to 34 below them in Fredoka Bold at 5 mm, raised the same 0.6 mm. They print with the base
  in the base's colour; no second colour, no inlay, no support (the 0.6 mm underside of a rib is a bridge the
  width of a nozzle).
- **The datum is the stadium's own end.** Open the pod. Lay the lid on the wharf, scale up, and the base beside it
  with its marked wall towards you, the lid's far end touching the base's near end. Both ends are 36 mm radius
  arcs, so pushing them together along the line registers them on their apexes, and sliding sideways costs almost
  nothing: 5 mm of sideways slop reads 0.17 mm short, 10 mm reads 0.7 mm short, 15 mm reads 1.6 mm short
  (`fit-tests-ruler.json`, `sideways_slop_error_mm`). That is why there is no registration tab or stop: two
  convex ends are self-registering, and a tab would need its own tolerance.
- The fish lies along the two. 35.2 cm total, read to the half centimetre.

Why 18 and 35 are ribs without numbers: the 18 cm mark falls 4 mm from the base's end, where the wall is 63°
from flat, and the 35 cm mark 2 mm from the other end at 71°; a number projected onto a wall that steep stretches
to twice its width. The ribs are there and read true from above; the numbers run from 19 to 34, where the wall is
within 45° of flat (`fish_base`, `dayrally_ruler.py`).

**No legal sizes are marked.** Minimum legal sizes in New Zealand differ by area and species and change; the ruler
measures, the regulations decide, and the product page should say so and point at the current MPI rules.

### Fit checks (digital)

From `fit-tests-ruler.json`: the marks add 566 mm³ and remove nothing from the base; nothing inside the cavity,
nothing above the rim, nothing on the notch side; the plain lid and the ruler lid both fit the marked base at
0 mm³; every mount, the Grid board and the two keys take the marked base exactly as they take the plain one (the
keys' 37.6 mm³ is the designed cone clamp, the same as the plain base); the ruler inlay sits inside the lid top
on every size with 0 mm³ outside it. The lid is 176.0 mm end to end, so lid plus base is 35.2 cm.

## The 15 cm ruler piece

150 × 10 × 2 mm, 1.5 mm corner radii, 3.6 g. Millimetre ticks engraved 0.4 mm into the top (2 mm every
millimetre, 3 mm at the half centimetre, 4.5 mm at the centimetre with the number above, Fredoka Bold at
2.8 mm). 0 is the left end of the ruler. It lives in one of the long pod's two middle pen slots, which are
157.5 mm long: 0 mm³ clash in a middle slot, 431 mm³ in an outer slot (those are 128 mm long; it does not fit
there), 0 mm³ against the closed lid.

The millimetre ticks are at the limit of a 0.4 mm nozzle: 0.5 mm grooves with 0.5 mm of top surface between them.
The first print decides whether they read; if not, the fallback is half-centimetre ticks like the lid.

## Render

`ruler-fish-sky`: the long pod open, lid and base end to end, a 31 cm fish-shaped stand-in lying along them. The
fish is a plain solid built in `tools/living-cad/render/props.py` (no species, no legal size), a prop for the
picture only. `ruler-15-pens`: the pens insert with the 15 cm ruler in a middle slot beside two pencils. The
flipped lid inlays in these scenes carry a `z` of 14.4 (the lid file is 15 mm tall with its lip) and the pocket's
own y offset, because the renderer recentres every mesh on its bounding box (render README).

## What the first print should tell

1. The scale against a steel rule, at 0, 10 and 17 cm on the lid and 20, 30 and 35 on the base: PLA shrinks
   about 0.3% and the slicer may compensate; a long scale shows it.
2. Whether a 0.6 mm inlay tick 1.0 mm wide prints clean as a two-colour swap, or needs 1.2 mm.
3. Whether 0.6 mm raised ribs on the base wall survive handling and a drop; whether 0.6 mm raised numbers at 5 mm
   read.
4. Whether the two apexes register as drawn when a child pushes them together on a wet wharf.
5. Whether the millimetre ticks on the 15 cm piece read.

## Lineage

Rulers on lids are everywhere; a two-part box whose halves end to end make a longer rule, registered on their own
rounded ends, is assembl's. The RP01 rugged pod keeps centreline lid rulers of its own and is not changed here.
