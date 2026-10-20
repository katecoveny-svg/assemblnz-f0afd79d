# dayrally cast — a casting rod we can print, for a real spinning reel

**Status: designed and checked digitally on 20 October 2026. Nothing printed, nothing cast. Proposed.**
Source: `tools/living-cad/cad/dayrally_cast.py`. Build: `python3 tools/living-cad/cad/build_dayrally_cast.py`.
Fit checks: `python3 tools/living-cad/cad/fit_test_cast.py` → `tools/living-cad/parts/fit-tests-cast.json`.
Renders: `docs/living/renders/cast-*.png`. Widget: `/living/widget/lab-dayrally-cast` (lab, no price).
What it answers: `FORWARDED-FISHING-KIT-REVIEW-20261020.md`.

## The ask, and the honest shape of the answer

Kate's son fishes with a spinning reel and casts. The fixed-line rod in `DAYRALLY-ROD.md` does not cast. The
forwarded thread offered an all-printed rod *and* an all-printed spinning reel in nylon carbon fibre. A
spinning reel is steel gears, a rotor, a line roller, an oscillating spool, anti-reverse and a drag stack:
the one part of a casting outfit that printing cannot do honestly at kit price. So the reel is **bought**
(a Shimano 1000-size spinning reel, about NZD 50 to 80 in New Zealand) and assembl prints everything a
reel needs to live on: the rod, the grip the rod packs into, and a real screw-lock reel seat.

The rod is honest about load. Every number below comes from the geometry in the source file.

## What it is

| | |
|---|---|
| Assembled | 0.91 m: grip 250 mm + collar + three 220 mm sections; every part fits a 250 mm bed |
| Packed | 253 × 36 mm; the three sections pack inside the grip bore (packing checked) |
| Sections | three 220 mm hollow square bars, 1.8 mm walls, printed flat: 12.0 → 10.6, 10.6 → 8.8, 8.8 → 3.6 mm; the tip section is solid over its last 90 mm |
| Joints | square spigot pins that fill the bore (6.8 and 5.0 mm), 60 mm long, epoxied half into the lower section; 0.2 mm clearance; the first 32 mm of every socket is constant so the pin never meets the taper |
| Reel seat | screw-lock: fixed hood at the top of the bed, keyed sliding hood that rides the thread crests, lock nut on a printed 36 × 3 mm thread cut into the grip wall with 50° flanks; takes feet from 55 to 66 mm long, 13.5 wide, 3.6 thick at the ends |
| Guides | three single-foot running guides (7, 5.5, 4.4 mm rings) plus a tip top with a 4 mm ring; epoxy and whip, as on any built rod |
| Line | 4 to 6 lb mono |
| Mass | sections about 17 + 15 + 8 g, pins 3 g, grip 71 g, hood and nut 12 g, collar and cap 14 g: about 140 g without the reel |
| Material | sections, pins, tip top, guides: **PPA-CF** (PA12-CF second). Grip, hood, nut, collar, cap: ASA or PETG-CF |

## Why these choices

**Printed flat, not upright.** A rod bends. Flat printing puts the layer lines and the carbon fibres along
the rod, so the bend loads the fibres. An upright tube has every layer line across the bend and fails at a
layer. The forwarded file prints its sections upright; it also says to print them horizontally; horizontal is
right.

**Square, not round.** A square bar prints flat with no overhang, its bore is a square socket that keeps a
wall all round, and the square pin that fills it is the biggest pin the section allows. The first two passes
of this design (round D-sections, then four solid squares) were checked and failed on their own numbers: a
D-section socket keeps no wall, a pin at half the section overloads, and four 230 mm solid sections do not
pack in a grip a child can hold.

**Hollow.** Walls of 1.8 mm keep 84% of the solid bar's stiffness at 40% of the mass, and the top wall of a
7 mm bore bridges cleanly when printed flat.

**The thread is real.** A flat tooth twisted into a helix (the first pass) makes a paper-thin fin, not a
thread; the fit test passed it because there was nothing to hit. The thread is now the radial profile of one
turn swept per pitch; the nut in phase sits with 0 mm³ clash and half a pitch out of phase clashes by 344
mm³, which is the sanity check a thread should pass.

**The grip prints on its back.** Lying on the flat along its key-groove side, the fixed hood faces up and
needs no support; the bore's upper side is a 10.8 mm flat chord (a bridge), and the reel bed above it keeps
a 2.8 mm wall. It fits a 250 mm bed, which is the pack's rule for every print file.

## Loads, stated

A rod is a cantilever: the bending moment anywhere is the tip force times the distance to the tip. PPA-CF
breaks around 120 to 150 MPa along the fibres. Design tip load **2.5 N**, about 250 g lifted straight at
the tip. **Set the reel drag to 300 g or less.** A 1 kg drag puts about 10 N on the tip and no rod in this
family survives it with a usable tip.

| Where | Lever (mm) | Stress at 2.5 N (MPa) | at 5 N (MPa) |
|---|---|---|---|
| section 1 base, 12 mm square | 660 | 7.5 | 15 |
| pin 1, 6.8 mm square | 440 | 21 | 42 |
| section 2 base, 10.6 mm | 440 | 7 | 14 |
| pin 2, 5.0 mm square | 220 | 26 | 53 |
| section 3 base, 8.8 mm | 220 | 5.5 | 11 |
| solid tip, 80 mm from the end, 5.5 mm | 80 | 7 | 14 |

The pins are the limit, as they are on every spigot-ferrule rod. At 5 N the worst pin is at 53 MPa, inside
the material with margin; the first print will tell what the printed strength really is.

**Stiffness, honestly.** Against an E-glass tube of the same outside size, the PPA-CF square bar is about
half as stiff (section 1: 16 × 10⁶ N·mm² against 29 × 10⁶). It will feel soft and it will cast a 5 to 10 g
rig a kid's distance. **A bought glass or carbon blank is stronger and lighter**, and the same printed grip
takes one: bore the collar to the blank's butt instead of the square pin. That is the option to offer a
teenager who outgrows this rod.

## Salt water

- PA6-CF drinks water and goes soft (Bambu: modulus 4.9 GPa dry to 1.9 GPa wet). PPA-CF holds (9.9 to 9.6).
  PA12-CF is the second choice. The forwarded thread is right about this.
- Thin epoxy rod finish on the sections and pins after printing, as rod builders do over thread wraps.
- Rinse in fresh water and dry after salt. Store packed with the cap off.
- The grip and seat parts in ASA: UV and salt stable, prints on any enclosed printer.

## Fit checks (digital)

From `fit-tests-cast.json`: pins in their lower and upper sockets 0 mm³; sections to sections 0; section 1
over the collar pin 0; collar and cap presses at the designed 0.05 mm radial interference; reel foot gauges
of 55, 62 and 66 mm each seat under the fixed hood with 0 clash, the sliding hood clears the grip and the
foot, the nut threads in phase with 0 clash and sits within the thread for every foot length, with 1 to 3 mm
of nut travel left to the hood.

## First print

1. Pins and sections 2 and 3 in PPA-CF (hardened nozzle, dry box, enclosure), flat, 4 walls, 100% infill.
   Check the pin fit; adjust `PIN_CLR` from the print.
2. Grip, hood and nut in ASA. Thread the nut; adjust `THREAD_CLR`.
3. Fit a real 1000-size reel. Then section 1, guides, tip top; epoxy, whip, finish.
4. Fish it with the drag at 300 g. The number that matters is how it bends and whether a pin survives a
   snag.

## Lineage

Spigot ferrules and screw-lock seats are how every multi-piece rod has been built for a century; square
printed bars, bore-filling square pins and a thread cut into a printed grip are assembl's. The forwarded
sketches are reviewed, not used (`SOURCE-AND-LICENCE-REGISTER.md`).
