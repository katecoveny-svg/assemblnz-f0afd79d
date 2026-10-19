# dayrally rod and wharf reel — a packable fixed-line rod we can print

**Status: designed and checked digitally on 19 October 2026. Nothing printed, nothing fished. Proposed.**
Source: `tools/living-cad/cad/dayrally_rod.py`. Build: `python3 tools/living-cad/cad/build_dayrally_rod.py`.
Fit checks: `python3 tools/living-cad/cad/fit_test_rod.py` → `tools/living-cad/parts/fit-tests-rod.json`.
Renders: `docs/living/renders/rod-*.png`.

## What the research says

- A fully printed rod that people fish with exists: the Fish8r set on MakerWorld is a 600 mm, four-segment rod
  with a printed reel, rated by its designer to about 2 kg "depending on filament", with 4.8 stars from 205
  ratings. Its designer recommends fibre-reinforced filament. Its licence is not stated on the listing we could
  see; it is reference only, nothing copied.
- Another MakerWorld maker reports the material lesson plainly: PLA softened in summer heat, half of the
  unfilled PETG rods bent, and black PETG-CF held. They also found glued joints too loose and moved to a
  one-piece or socketed design.
- No bare telescopic blanks are sold in New Zealand that we could find; the cheapest usable bought option is a
  complete telescopic glass rod (Shimano Spectrum Plus 6 ft, NZD 49.99 at Marine Deals). If a customer wants a
  real casting rod, that is the honest answer and assembl should not pretend a printed tube is one.
- Tenkara (fixed-line, no reel, no guides) is a legitimate, century-old way to fish a short rod. It removes the
  two things printed rods do worst: reel seats and line guides.

So the assembl rod is a fixed-line rod, printed in carbon-fibre PETG, built so it packs into its own handle and
rides on the TURN like everything else in dayrally.

## The rod

| | |
|---|---|
| Assembled | 0.99 m: grip 230 + collar 3 + four 190 mm sections |
| Packed | 233 × 32 mm; the three tube sections and the tip lie inside the grip (packing checked: 14, 11, 8.6 and 6.2 mm circles fit in the 27 mm bore) |
| Sections | s1 14 → 12.4 mm, s2 11 → 9.6, s3 8.6 → 7.4, tip solid 6.2 → 3.0 |
| Joints | 28 mm solid spigots, tapered 0.25 mm, 0.15 mm clearance; a 3 mm shoulder on each. First print will tell whether 0.15 is right for CF filament |
| Grip | open PETG tube, finger flutes, two V notches at each end for the line, a hook-park slot. Collar presses into the top (four slits) and carries the s1 socket; butt cap presses into the bottom with a 1 mm lip and nail notches |
| Line | 1.5 to 2 m of 3 to 4 kg mono, loop-to-loop onto the printed ring at the tip |
| Mass | about 105 g (grip 51 g, sections 42 g, collar and cap 13 g) |
| Material | sections and tip in PETG-CF or PA-CF; grip, collar and cap in PETG |

What it is for: wharves, rock pools, estuaries, streams. Dabbling a bait or a fly a rod-length out, lifting
small fish. What it is not: a casting rod. Say so on the product page.

## The wharf reel

A 100 mm one-piece hand reel with a V groove (45° lower wall, 50° upper wall so it prints flat without
supports), a 46 mm hand hole, a line anchor hole through the core and a hook-park notch on the rim. Holds about
30 m of 0.4 mm mono. The classic hand reel kids use off wharves. 52 g in PETG. Hangs on a Grid hook. No hooks
supplied, as with the handline winder.

## The rod saddle

A TURN flange (60 × 84 mm, two keyways 42 mm apart) with two snap C-clips that take the packed grip across it,
8 mm above the key heads so the keys stay reachable. Two keys lock it to a strap clip, a bar saddle, a home dock
or a Grid board; the packed rod snaps in and out. 24 g PETG. Checked: 0 mm³ clash between the grip and the
saddle; the key heads clear the grip.

## Fit checks (digital)

From `fit-tests-rod.json`: three spigot joints at 0 mm³ clash with the designed clearance; collar press
101 mm³ and cap press 57 mm³ (the designed 0.05 mm radial interference); s1 seats in the collar; the sections
pack inside the grip; grip to saddle 0 mm³.

## Print notes

Everything prints upright or flat without supports. The sections are tall thin prints: a brim, slow outer
walls and a draft shield help. Print the joints first (s2 into s1) and adjust `SPIGOT_CLR` before the rest.

## Lineage

The nesting-in-the-grip idea is ours; spigot ferrules are how every multi-piece rod has joined for a century;
V-groove hand reels are the Cuban yo-yo in a printable section. Reference designs are listed in
`docs/living/SOURCE-AND-LICENCE-REGISTER.md`; nothing is copied.
