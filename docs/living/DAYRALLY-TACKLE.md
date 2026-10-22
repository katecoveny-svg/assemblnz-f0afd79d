# dayrally tackle — packs on the wall, the reel on its foot, a mount for any bike

**Status: designed and checked digitally on 21 October 2026. Nothing printed. The packet sizes, the reel foot and
the knob shaft are to be measured on the real things before the first print.** Lab items; no price, not listed.
Source: `tools/living-cad/cad/dayrally_tackle.py`. Build: `python3 tools/living-cad/cad/build_dayrally_tackle.py`
(10 files, `tk-*`). Fit checks: `python3 tools/living-cad/cad/fit_test_tackle.py` →
`tools/living-cad/parts/fit-tests-tackle.json`. Renders: `docs/living/renders/tackle-*.png`. Widgets:
`/living/widget/lab-pack-case`, `lab-pack-rail`, `lab-reel-dock`, `lab-reel-knob`, `lab-spool-band`,
`lab-universal-saddle`. Costs and first prices: `COSTING-20261021.md` (re-run with these items).

Kate, with two photos of her son's gear (Daiwa Bait Junkie Jerkshad 5" and 7" packs; a Shimano Nasci 2500HG box):
"we should make softbait cases that can still show the softbaits through the front but hang or attach to the
pegboards … they should be able to make custom add ons for their reels and how much of an actual reel could be 3d
printed? … i want the bike mounts and kits to be able to attach to any model of bike too."

## What the sizes are from

A research pass (web, 21 October; the sandbox could not open the manufacturer pages, so these are from search
snippets of the cited listings) found that **no maker publishes packet outer sizes**. The nearest published bags
are Berkley Gulp 2.5" (about 176 × 115 × 18 mm) and Z-Man MinnowZ 3" (about 146 × 89 mm) and DieZel 4" (about
180 × 123 × 10 mm). The Daiwa 5" lure is 124 mm and the 7" is 170–172 mm, so the 7" packet is at least 200 mm
tall. The cases are sized to **92 × 175 × 12 (5") and 105 × 235 × 14 (7")** from the photos' proportions and the
lure lengths; the first print measures the real packets and the two numbers in `PACKS` change if needed.

The Shimano Nasci FC 2500HG: 240 g, 6.2:1, 91 cm per turn, 9 kg drag, 5+1 bearings (four retailers agree). Its
handle knob is the common Shimano "Type A" (Daiwa "Type S"): **a 4 mm shaft with two 4 × 7 × 2.5 mm bearings**,
the size every aftermarket knob maker (Gomexus, Hedgehog Studio, Livre) sells for. Nobody publishes the spool
diameter or the foot plate; the reel-stand makers class the 2500 body at 42 mm. The dock is drawn to a **60 × 17 ×
3.2 mm foot plate on a 14 × 8 mm stem** and the band to a 47 mm spool lip; both are to be measured with calipers
on the reel before printing. The drag knob is an OEM spare (RD21805), so it is not redrawn.

Bikes and scooters have standards, which is why one saddle can be universal: handlebar grip area 22.2 mm; stem
clamps 25.4, 26.0, 31.8 and 35 mm; seat posts 25.4, 27.2, 30.9, 31.6 and 34.9 mm; steel top tubes 25.4–28.6 mm
and carbon or alloy ones 34–35 mm (not round); down tubes 28.6 to 45 mm and more; stunt scooter bars 31.8 and
34.9 mm; e-scooter bars 20–32 mm; kids' bars 19–22.2 mm at the grip. Every "fits any bike" mount on the market
does it the same way: a cradle plus a stretchy strap or O-rings (Quad Lock 25–40 mm, Peak Design 22–35 mm, Fidlock
uni 28–62 mm, Knog O-rings 22–32+ mm, Voile straps for anything). So does ours.

## The pieces

| file | what | print | g | checked |
|---|---|---|---|---|
| `tk-pack-case-5` | keyed frame for a 5" packet, open front window, 78 % of the packet covered, the top proud for the fingers | flange-down, 97 × 137 × 24 | 70 | packet 0 mm³ clash, 38.5 mm proud; keys 37.562 mm³ (the designed cone clamp); board 0 |
| `tk-pack-case-7` | the same for a 7" packet | flange-down, 110 × 183 × 26 | 103 | packet 0; 51.7 mm proud; keys 37.562; board 0 |
| `tk-pack-rail` | three pegs on a keyed bar, 42 mm apart, lips on the pegs; packets hang by their hole | flange-down, 138 × 26 × 28 | 16 | keys 37.562 |
| `tk-reel-dock` | a block on the flange with a horizontal slot in its face for the foot plate, a gap below for the stem; the reel hangs under it; keys turn from the front through open pockets | flange-down, 84 × 62 × 27 | 42 | foot 0 mm³; keys 37.562; board 0 |
| `tk-reel-knob` (+ inlay) | fluted T knob, Ø22 × 26, Ø4.6 bore with two Ø7 bearing seats, the owner's name inlaid in the cap | standing on the shaft end | 4 | shaft 0, bearings 0, inlay 0 |
| `tk-spool-band` | TPU 95A band for a 47 mm spool lip with a tab that traps the line end | flat | 2 | — |
| `tk-universal-saddle` | V cradle (50° half-angle) on the TURN socket body, two 20 mm strap channels | flange-down, 84 × 44 × 38 | 38 | tubes 22, 31.8 and 45 mm 0 mm³; strap in channel 0; pod on it 0 |
| `tk-ladder-strap` | TPU 95A ladder, 240 × 20 × 2.4, teeth every 8 mm, a root slot for the buckle pin | flat | 13 | — |
| `tk-strap-buckle` | PETG catch with a pin bar; the ladder locks on the tooth | as is | 2 | — |

The pack cases and the rail key to any Grid board, the pod mounts' flange face, and the gear-wall kits the same way
every dayrally accessory does: two TURN keys, a quarter turn. The case shows the packet through the front; the
packet slides in from the top and sits on the bottom lip. The rail is for the packs with a hang hole and takes
three at 42 mm (one per board column).

## The universal saddle: how a kit attaches to any bike

The saddle is the pod mounts' TURN socket body with a V cradle underneath instead of a clamp. A V seats any round
tube from 22 to 45 mm on two lines, so the same print fits a kid's 22.2 mm bar, a 31.8 mm stem or scooter bar, a
27.2 or 31.6 mm seat post and a 35 to 45 mm top or down tube; a non-round tube still seats on the V's two faces.
Two straps through the channels pull it down; the kit (any pod, the rod quiver, the bottle holder) locks to the
socket with its keys. Three strap options, all the same 20 mm channel:

| strap | fits | where to get |
|---|---|---|
| our ladder strap + buckle (in the kit) | 22–45 mm tube, up to about 180 mm around | printed, TPU 95A and PETG |
| Voile strap 15" / 20" (nylon or alu buckle, 19 mm wide) | anything up to 130–435 mm around | NZ: Bicycle Junction, Ground Effect; AU: Off Course, A$15–20 |
| two 7.6 mm zip ties | anything, single use | any hardware store |

What this replaces: the ride pod's bar clamp (31.8 only), the scoot stem saddle (32–60 mm) and the seat-post mount
stay for the bikes they fit; the universal saddle is the answer when the customer does not know their size.

## What of a reel can be printed, honestly

| prints well | why |
|---|---|
| handle knob (on the stock shaft and bearings) | cosmetic and ergonomic; the metal shaft and the two bearings carry the load; this is what the aftermarket sells |
| spool band and line clip | TPU, no load |
| reel dock, foot cover, reel stand | sits around the reel, not inside it |
| handle-end caps and drag-knob caps | cosmetic covers over the metal parts; the drag knob itself is an OEM spare |
| hard case, pouch frame, wall and rod-locker holders | printed reel holders already sell at US$3–7 |

| does not print | why |
|---|---|
| body and rotor | alignment of the shaft and gears to 0.02 mm; printed plastic creeps and flexes |
| gears, pinion, oscillation | tooth loads and wear; sintered or machined brass and zinc |
| drag washers and bearings | friction material and hardened steel |
| bail arm, line roller | spring loads, line wear |
| main shaft | 4–5 mm steel under bending load |

So "custom add-ons for their reels" is a real range (knob, band, dock, caps, case, in the owner's colours with the
name) and "a 3D-printed reel" is not, beyond a toy. The knob is the first to print because it is the one the
market has already proven, and the one that needs the fewest measurements.

## The widget

`lab-pack-case` (size 5" or 7"), `lab-pack-rail`, `lab-reel-dock`, `lab-reel-knob` (name), `lab-spool-band` and
`lab-universal-saddle` (saddle, two straps, two buckles). The wall pieces take two keys each. Assembled views
(brief §11.24) are next for the three wall pieces (keyed to a board with a packet in the case) and the saddle on
a bar with a pod on it; the renders `tackle-wall`, `tackle-knob` and `tackle-universal` are the hero shots until
then, and the packet, reel and tube in them are stand-in props, not print files.

## What the first print should tell

1. The two packets' outer sizes and the hang hole; the 5" and 7" case windows and lips against them.
2. The Nasci's foot plate length, width and thickness and the stem; whether the dock's slot holds the reel's 240 g
   with the rod seat angle and whether the keys clear the reel body.
3. The knob shaft and bearing sizes on the reel; the bore's fit on the two bearings (press, not slide) and the
   shoulder's clearance.
4. The spool lip diameter and whether the TPU band stays on at 95A.
5. The V on a 22.2 mm bar, a 31.8 mm stem and a 45 mm down tube with the ladder strap; whether the buckle holds a
   loaded pod on a gravel path.

## Lineage

`dayrally2` (pods, mounts, `_socket_body`), `dayrally_pocket` (inlay helpers), `grid` (board, keys, flange),
`dayrally_scoot` (stem saddle, strap channels). Research sources are listed in the brief §11.25.
