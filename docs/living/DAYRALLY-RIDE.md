# dayrally ride — the hero pod, grips, a watch cradle, a phone mount, a bottle cup and a crank stand

**Status: designed and checked digitally on 20 October 2026. Nothing printed, nothing ridden. Proposed.**
Source: `tools/living-cad/cad/dayrally_ride.py`. Build: `python3 tools/living-cad/cad/build_dayrally_ride.py`.
Fit checks: `python3 tools/living-cad/cad/fit_test_ride.py` → `tools/living-cad/parts/fit-tests-ride.json`.
Renders: `docs/living/renders/ride-*.png` (renders of the print files, not photographs).
Widget: `/living/widget/lab-dayrally-ride`, `lab-ride-grips`, `lab-ride-watch`, `lab-ride-phone`, `lab-ride-bottle`,
`lab-ride-stand` (lab, no price). Family `ride` in the manifest, 20 print files.

## What Kate asked for, and the one idea underneath

A watch mount like the one on MakerWorld, an iPhone mount, a cool drink bottle holder, bike gadgets that
double as something else (a bike stand), handle grips because they are what bikers print right now, a hardy
outdoor pod like the Janberry container, and a "really cool, funky pod" as the main part, because the lock
key is what carries through every component. And the font from the original dayrally board.

The one idea: **every piece is a TURN accessory.** Two keys 42 mm apart in its floor, the same as every pod,
so every piece locks onto the bar saddle, the frame saddle, the strap clip, the home dock and the Grid board at
home. That is what makes a bike gadget also a desk thing, and what makes the line one line instead of six
products. Nothing here is a copy of the MakerWorld references; they are listed in the register as what we
looked at.

## The ride pod (pod v3)

The board's pod, built: bento proportion, a lid that hinges open like a lunchbox, a latch button in the accent
colour, a lanyard loop, a name slate on the lid, `dayrally` inlaid in the lid, and the two-key TURN floor.

| | |
|---|---|
| Size | 128 × 84 × 54 mm closed (base 40 + lid 14), 16 mm corners; 2.4 mm walls and floor |
| Hinge | three knuckles on the base, two on the lid, 8 mm round, 0.4 mm gaps; a 2.9 mm printed pin (or a 3 mm steel rod) in a 3.5 mm bore, one from each end. Knuckle webs are hulls to the wall so the base prints without support and the lid prints face-down |
| Latch | a separate accent-colour tongue with a T-head that drops into a housing on the lid front from the top (lifting the lid pushes it deeper, never out); a 4.5 mm window in the tongue drops over a 1.4 mm rib with a 45° top on the base; pull the pad out and lift to open |
| Gasket | a TPU 95A ring, 2.4 × 1.6, in a 1.2 mm groove in the lid's underside; a 0.4 mm rib on the base rim presses into it. **Splash-proof is the claim; it is untested and it is not submersible.** The Janberry container is a screw-lid cylinder with a round O-ring, which is the honest way to seal; a hinged bento is sealed by compression and will be proven or not by the first print |
| Slate | 64 × 20 × 2 accent tab with the name raised 0.8 mm in Fredoka Bold; two 3 mm pegs press into the lid (0.08 mm interference). Prise it off with a nail to swap |
| Lid | `dayrally` inlaid 0.6 mm in the second colour below the slate; the lid's foot ring carries the groove and its inner face slopes 45° so it prints face-down; the inner lip is cut away for 16 mm beside the hinge so the lid swings |
| Core | a split insert with two pockets and finger scoops, above the key heads; any dayrally insert that fits the v0.3 standard pod cavity can be re-cut for this one |
| Mass | base 65 g, lid 45 g, core 40 g, latch 2.5, pins 0.5 each, gasket 1.8, slate 3 g: about 160 g in PETG with PLA accents |

Checked: lid on base 0 mm³; the lid swung open through 10° to 120° about the hinge axis, 0 mm³ at every step;
pin in both parts 0; latch in its housing 0, closed on the base 0, and when the lid is lifted 1 mm the window
hits the rib (8.4 mm³ of engagement, which is the hold); gasket in its groove 0 and compressed by the rib by
370 mm³ (the designed 0.4 + 0.4 mm); slate pegs press 2.6 mm³; core in the base 0; the pod on the bar saddle
and on the home dock 0.

## Grips

TPU 95A push-on grips for 22.2 mm bars: 130 long, 30 mm over the texture, a 36 mm flange at the inner end,
six ribs inside, 21.0 mm bore (1.2 mm interference on the diameter, to be tuned on the first print; spray
alcohol to fit). Two textures: **waves** (the lid pattern, as a 1.2 mm sinusoid along the grip) and **dots**
(six-millimetre dimples in a staggered ring). The existing bar-end plug closes them and its cap covers the
bore. One file is one grip: print two. 31 g each. The MakerWorld grip Kate saw is a straight ribbed TPU
grip; the Printables makers report TPU is less grippy than rubber and wants a collar or adhesive, which is
what the flange and the bar-end plug are for.

**Custom handles (20 October, latest).** Kate: "can we do custom handles for scooters? and bike grips?" The
grips fit 22.2 mm bars, which is bikes and most owned scooters (kick scooters, a Honey Whale); share scooters
have moulded grips and get nothing. Custom means the rider's name, in the dayrally way:

| Part | What it is | Checked |
|---|---|---|
| `ride-grip-name` (+ `-pattern`) | the plain grip with a 9 mm flat land along it and the name raised 0.8 mm on the land in Fredoka Bold, up to 8 letters. One TPU colour reads by touch; a second TPU colour on the pattern reads by eye. 31 g | same 1.2 mm interference on the bar as the textured grips; the text sits 0.08 mm proud of the grip's outside, so it does not catch |
| `ride-bar-end-plain` | the press-fit plug that closes the grips, 18 to 20 mm bar ends, cap face on the bed. 3 g | covers the grip bore 0 |
| `ride-bar-end-name` (+ `-pattern`) | the same plug with up to 5 letters raised 0.8 mm on its 24 mm cap. 3 g | the lettering stays 3.3 mm inside the cap edge |

Widget: the grips item (`lab-ride-grips`) gains the name option; `lab-bar-ends` offers plain or named. Render
`docs/living/renders/grips-name-sun.png` (sample names RALLY and MILA). The keyed bar end in TURN mini takes a
charm instead of a name. Lab items until printed; the first TPU print tunes `GRIP_ID`.

## Watch cradle

| | |
|---|---|
| Sizes | 42 (41/42 mm Series: 42 × 36 × 9.7), 46 (45/46 mm: 46 × 39 × 9.7), 49 (Ultra: 49 × 44 × 14.4). Pocket 0.6 mm over the case, 3.5 deep, 9.5 mm corners, a crown notch |
| How it holds | the watch sits face-up in the pocket and **its own band wraps the slab** under it: 60 × 14 mm with 3 mm rounded ends, through a 9 mm tunnel that clears the key heads (4.7 mm of air over them). A band loop of about 150 mm; the band's buckle does the tightening |
| Dock | a Ø27.8 pocket from underneath (0.05 mm press, cable slot) puts an Apple charging puck 1.2 mm under the watch, so the same cradle on the home dock or the Grid is a bedside dock. Measure the puck before printing (`PUCK_D`, `PUCK_T`) |
| Print | as is; the slab bridges 40 mm between its two walls and the puck pocket is a 28 mm circular bridge, both plain bridges, no supports |
| Mass | 29 to 31 g PETG |

Checked for each size: case in pocket 0 mm³; a 22 × 3 band gauge round the slab 0; the band over the key heads 0;
puck press 22.6 mm³ (designed); cradle on the bar saddle 0.

## Phone mount

Portrait, on two keys, no springs and no screws.

| | |
|---|---|
| Plate | 184 × 98 × 5 (the TURN flange is the plate), lightening windows, a rack and two dovetail slots |
| Centring | at each end a pair of **45° corner channels**: two parallel 45° surfaces 12.5 mm apart. A phone's bottom corners drop into the channels from the top and slide down until both touch, which centres any width from 64 to 82 mm and lifts it 3.5 to 12.5 mm; the upper surfaces hold the front face. Foam strips take up the slack between a 7 and an 11 mm phone |
| Length | the top channel is on a slider that enters two 6/3 mm dovetail slots from the plate's end (0.3 mm clearance) and ratchets on a 1.5 mm rack: push it toward the phone, it clicks; the pawl's vertical face meets the rack's. A thumb tab past the end wall lifts the pawl to release. 140 to 170 mm phones |
| Desk | the same plate on the home dock is a desk stand |
| Print | plate as is; the slider upside down (its bridge is a 53 mm span between the hooks, a plain bridge) |
| Mass | plate 61 g, slider 13 g PETG |

Checked with 64 × 140 × 7, 72 × 150 × 8.3 and 82 × 170 × 11 mm phones: in the plate channel 0, in the slider
channel 0, slider on the plate (in rack phase) 0, slider pushed 0.7 mm toward the open end 2.2 mm³ (the pawl
holds); slider entering the slots from the end 0; pawl lifted 1.2 mm clears the rack 0; the plate on the bar
saddle 0. The slider's channel sits 1.3 mm higher than the plate's (the bridge is between them), a tilt of
half a degree.

## Bottle cup

A cup, not a cage, because a cup prints standing with no overhang and takes a kid's abuse: 76 mm bore, 2.4 mm
walls, 105 tall, a 3 mm floor with three drain holes, two rows of **diamond windows** with 45° edges (so they
print clean standing up) and a thumb scoop at the front rim. Two ridges inside near the rim touch a 74 mm
bottle and hold a 76 mm one with 79 mm³ of interference. Behind it a 60 × 100 TURN spine with the two keys
**and the standard 64 mm M5 bottle-boss slots**, so it bolts to a frame boss like any cage, or locks to a frame
saddle, a bar saddle, the Grid or the home dock, where it is a pen cup. The cup floats 6 mm above the spine
on a central block so the key grips (which stand 4.3 mm proud of the flange) can be turned from the sides,
7.6 mm of air over them. 85 g PETG.

## Crank stand

The dual-use piece Kate asked for. A hollow block 110 × 70 × 120 with three ribs and four rubber-foot
recesses, a 24 × 14 mm cradle slot across the top with a vertical front wall and a back wall leaning 15°.
Rest a pedal in it and lean the bike (a crank stand, as sold for display and trailhead parking). On the desk
the same slot leans a phone back 15°. A TURN flange in its flat back face locks it to the Grid at home. The
keys go in from the open underside. Prints upside down (the cradle on the bed, the open base at the top).
Checked: a 100 × 95 × 20 pedal body in the cradle 0 mm³; an 8.3 mm phone leaning in it 0; both keyways open
through the back. 134 g PETG. It has not held a bike; the first print tells whether the 2.4 mm shell with ribs
takes a leaning 12 kg bike without cracking (expect it to, PETG at this section; if not, 3.2 mm walls).

## On the bike, as the picture draws it (20 October, late)

Kate's picture (`docs/living/boards/dayrally-bike-20261020.jpg`): a white bike on a pontoon, a sun-yellow pod
with latches on the rear rack, two rods standing in a quiver on the rack, a yellow pod along the top tube, the
dayrally bottle in its cage, a yellow cam on the stem, a kid with a spinning rod, rally with the bone tag. The
pod, bottle cup, cam mount and bone tag exist above and in `DAYRALLY-MINI.md`; three mounts were missing.
Source `tools/living-cad/cad/dayrally_bike.py`, family `rack`, widget `lab-ride-rack`, renders
`docs/living/renders/bike-set-sun.png` and `bike-toptube-sun.png`.

| Part | What it is | Checked |
|---|---|---|
| `rack-mount` | a 150 x 100 TURN socket plate with four strap slots (two 25 mm straps round the rack platform), five ribs underneath to sit on round rails without rocking, lightening windows. The ride pod or the long pod locks on with its two keys. 89 g PETG, prints face down | ride pod on it 0 mm3, long pod 0, straps through the slots 0 |
| `rack-quiver` | two 40 mm tubes, 130 tall, 2.4 walls, drained floors, a back plate with two strap slots for a rack stay or the seat tube. The cast rod's 36 mm grip and the fixed-line rod's 32 mm grip stand in it packed. At home it hangs on a Grid hook by its upper slot: a full-size TURN flange on its back would put the key heads inside the tubes, so it does not pretend to have one. 102 g PETG, prints standing | both grips in the tubes 0; straps through the slots 0 |
| `rack-toptube-saddle` | the frame saddle with its V groove turned along the pod, so a pod lies along the top tube (25 to 45 mm tubes, zip ties). 24 g PETG | 25, 31.8 and 45 mm tubes seat at 0; pod mini on it 0; the ride pod on it 0 |

What the picture has that no part gives yet: the rack pod in the picture has a latch each side and ours has
one (a two-latch lid is a one-line change if the first print wants it); the rods in the picture are assembled
and the quiver takes them packed (the cast rod packs to 253 mm). Straps, zip ties and the rack are bought.

## The font

The board's wordmark is a heavy, soft, rounded geometric sans, all lowercase. The board is AI-generated, so
there is no exact font to buy. The closest licensed face is **Fredoka** (Milena Brandão and Hafontia, SIL Open
Font License 1.1, Google Fonts), at weight 700 for the wordmark and slates. It is now in
`tools/living-cad/fonts/` (variable file, a static Bold instance for the CAD text helper, the OFL text) and
in the brief and brand canon as the dayrally display face. Instrument Sans stays the company face everywhere
else; Fredoka is scoped to dayrally wordmarks, slates and display lines. Omnes, which the board most resembles
in spirit, is commercial (Adobe Fonts) and is not needed.

## First print

1. The pod base, lid, one slate and the latch in PETG and PLA; the gasket in TPU. Close it, open it a hundred
   times, hold it under a tap. Tune `PIN_CLR`, `LIP_CLR`, `PEG_PRESS`, `RIB_H`.
2. A grip in TPU 95A on a real bar; tune `GRIP_ID`.
3. The watch cradle for the watch in the house; measure the puck first.
4. The phone plate and slider; tune `FOOT_CLR` and `RAIL_CLR`.
5. The cup on a frame boss with two M5 bolts and a 74 mm bottle; the stand under a real bike.

## Lineage

Hinged bento boxes, crank stands, bottle cages with 64 mm bosses and band-wrapped watch cradles are
ordinary things; the TURN floor on every one of them, the 45° self-centring phone channels, the dovetail
ratchet slider, the latch that loads into its housing, and the cup that is also a pen cup are assembl's.
References are in `SOURCE-AND-LICENCE-REGISTER.md`; nothing is copied.
