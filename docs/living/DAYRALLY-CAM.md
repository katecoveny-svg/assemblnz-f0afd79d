# dayrally cam — a 120-film pinhole camera that works

**Status: designed and checked digitally on 19 October 2026. Nothing printed, nothing exposed. Proposed.**
Source: `tools/living-cad/cad/dayrally_cam.py`. Build: `python3 tools/living-cad/cad/build_dayrally_cam.py`.
Fit checks: `python3 tools/living-cad/cad/fit_test_cam.py` → `tools/living-cad/parts/fit-tests-cam.json`.
Renders: `docs/living/renders/cam-*.png` (renders of the print files, not photographs).

## What it is

A box camera for 120 roll film, 6×6 format, with a 40 mm pinhole. Twelve square negatives a roll, developed by any
lab that handles 120 (in New Zealand that is the same labs that do 35 mm, with a day or two more turnaround). It
belongs to dayrally: it clips into a TURN cradle, so it rides a bag strap, a bike bar or the Grid wall exactly
like a pod, and its front skin takes the same dots, waves and name patterns as the pod lids.

The design decisions that make it work rather than look like a camera:

| Decision | Why |
|---|---|
| 120 film, red-window counting | No sprockets, no rewind, no frame counter mechanism. The backing paper carries the numbers; you wind until the next one shows. Twelve frames of 6×6 on one roll. |
| 40 mm "focal length", 54 mm square image | Wide (68° across, 87° on the diagonal) and forgiving. Depth of field is everything from a hand's width to the horizon. |
| 0.28 mm pinhole, f/143 | Rayleigh's optimum for 40 mm at 550 nm: `d = 1.9 √(λ f)`. The hole is a 10 mm disc of drink-can aluminium or 0.05 mm brass shim pierced with a #10 needle and sanded back; it glues into a recess on the inside of the front wall. Printers cannot make a clean 0.28 mm hole; this is how every working printed pinhole does it. |
| Pinhole seat bore opens from 3 mm to 9 mm toward the front | So the body never vignettes the corners (the corner ray leaves at 44.7°; the bore clears 57°). |
| 1.0 mm film slot behind the gate, ridged far wall | The film and its backing paper run through a slot between the gate frame and a row of 50° ridges, so the body prints without supports and the paper rides on ridge tips, not a sagging bridge. No pressure plate on the door, so the door is a plain plate. |
| Guide bars at the slot ends | 5 mm bars, top face level with the film plane, so the film bends over a radius into each spool chamber instead of a printed edge. |
| Drop-on back with a lip-in-groove labyrinth and four snap clips | Light has to go around a 2.8 mm lip sitting in a 3 mm groove. The clips are 16 mm PETG cantilevers that hook into a groove on the top and bottom faces. |
| Winder knob with a skirt over a boss | The knob's skirt drops over a 4 mm boss around the bore: a light trap that still lets the knob lift 6 mm for loading. The drive blade is narrower than the bore so the knob comes straight out. The supply side has the same knob with a plain pin. |
| Rotating shutter disc on the front skin | One split pin, a 13 mm hole that lines up with the window when open, a bump that clicks into two detents. Nothing to lose, nothing to slide out. A felt washer sits in a recess under the disc. |
| 1/4"-20 nut trapped in the base | For a tripod or a clamp. Exposures are seconds; the camera needs to sit still. |
| Body prints front face down | Every cavity opens upward or slopes inside 45°; the bores through the thick top and bottom walls are teardrops. |

## Parts

All in the `cam-*` print files (`tools/living-cad/parts/stl/`, served from `public/living/cad/v0.3/`).

| Part | Print | PLA est. | Note |
|---|---|---|---|
| cam-body | front face down, no supports | 182 g | ink PLA Matte; paint or flock the cone matte black |
| cam-back | inner face up | 30 g | red window disc glues into the recess inside |
| cam-skin-{plain,dots,waves,name} + -pattern | outer face up; pattern is the second colour | 27 + 2 g | glues to the body front; carries the shutter pivot and detents |
| cam-shutter-disc | flat, bump up | 3 g | split pin into the skin |
| cam-winder-knob, cam-supply-pin | head down | 3.5 + 3 g | lift to load |
| cam-window-cover | flat | 1 g | split pin into the back, or an M3 screw |
| cam-cradle | flat | 26 g | TURN flange, two keys, clips to the body ends |

Not printed: pinhole disc, red window disc (12 mm, from red lighting gel or red PETG), one 1/4"-20 nut, two
TURN keys for the cradle (any key in the kit), optional felt washer and black flock. Body 130 × 80 × 81 mm with
the skin and back on. Roughly 275 g of filament for a camera with one skin.

## Loading and shooting

1. Open the back (squeeze the clips). Pull both knobs up.
2. Drop the empty take-up spool into the right chamber and a fresh roll into the left, both onto their floor
   pins. Thread the backing-paper leader across the slot (it is a 1 mm gap between two bars; the paper is stiff
   enough to push through) and into the take-up spool's slot. Push both knobs down; the blade enters the spool.
3. Close the back. Open the red window cover, wind until the first "1" of the middle row shows, close the cover.
4. Shutter closed, camera on a tripod or a wall. Turn the disc open, count, turn it closed. Wind to the next
   number.

Starting exposures at f/143, before reciprocity correction (HP5 and similar need about double past one
second; check the film's data sheet):

| Light | ISO 400 | ISO 100 |
|---|---|---|
| bright sun | 0.2 s | 0.8 s |
| hazy sun | 0.4 s | 1.6 s |
| overcast | 1.6 s | 6.4 s |
| open shade | 3.2 s | 13 s |
| indoors by a window | about 100 s | about 7 min |

## Fit checks (digital)

From `fit-tests-cam.json`: back plate to body 0 mm³ clash, lip in groove with 0.2 mm each side; both spools
clear the chambers; winder blade enters the take-up spool 4.3 mm and the supply pin 4.5 mm; knobs lift clear;
the film strip clears the slot; 171 sample points on the rays from the pinhole to the frame corners and edges
are all in free air; the red window tunnel reaches the backing paper; the nut pocket is blind; the shutter disc
covers the window closed and clears it open in both detents with 0 mm³ clash; the cradle clips the body with
0 mm³ clash.

## Verify before the first print

The spool numbers are from references, not from a spool in hand. Measure a real 120 spool and backing paper
and set these in `dayrally_cam.py` before printing: `SPOOL_L` (flange to flange, assumed 64.5), `SPOOL_HOLE_D`
(end hole, assumed 4.9), `SPOOL_SLOT_W` and `SPOOL_SLOT_L` (drive slot, assumed 1.8 × 9), `FILM_W` (assumed
61.5). Then the first print is the test: body, back and one skin in ink; load a roll of cheap film; shoot it in
the sun; look for fog along the back edges (labyrinth), the top (knobs) and the shutter (felt).

## Lineage

Printed 120 pinhole cameras exist and work (the Make P6*6 and the terraPin family, both CC licences and
reference only; see `docs/living/SOURCE-AND-LICENCE-REGISTER.md`). This camera is assembl's own geometry on the
same physics, built for the dayrally kit: the slot-and-ridge film path, the skirted knobs, the rotary shutter on
a patterned skin and the TURN cradle are the parts that are ours.
