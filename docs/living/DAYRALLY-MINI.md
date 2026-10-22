# TURN mini — the components library at gadget scale

**Status: designed and checked digitally on 20 October 2026. Nothing printed. Proposed.**
Source: `tools/living-cad/cad/dayrally_mini.py`. Build: `python3 tools/living-cad/cad/build_dayrally_mini.py`.
Fit checks: `python3 tools/living-cad/cad/fit_test_mini.py` → `tools/living-cad/parts/fit-tests-mini.json`.
Renders: `docs/living/renders/mini-*.png` (renders of the print files in the board's palette, not photographs).
Widgets: `/living/widget/lab-turn-mini`, `lab-mini-ride`, `lab-mini-explore` (lab, no price). Family `mini`, 18 print files.

## Why a second scale

Kate's boards (brief 11.8) draw a components library: 26 mm cubes in sun, tomato, black and cream that chain
on a "universal key". The TURN (`lib.py`) is a 42 mm grid with a 13 mm keyway, right for pods and boards and
too big for a cube that mounts an action cam. So TURN mini is the same standard scaled by **0.6**: the same
push-in, quarter-turn key, the same lugs under a plate, the same detent bumps. Every number is the full
standard times 0.6, so what the test-print kit teaches about clamp and clearance carries down.

| | full TURN | TURN mini |
|---|---|---|
| keyway bore | 13.0 | 7.8 |
| chamber behind the plate | 22.0 | 13.2 |
| plate / standoff | 4.0 / 4.0 | 2.4 / 2.4 |
| lug width | 3.4 | 2.0 |
| detent | 0.35 | 0.21 |
| pitch | 42 (board) | the cube, 26 |

**The universal key is double-ended.** Lugs, shank, a 1.0 mm disc, shank, lugs. Push one end into cube A and
turn it a quarter by the other end's lugs (they are the handle). Drop cube B over the exposed end and turn the
cube itself a quarter: a cube is square, so it is aligned either way. The disc sits half in a 0.5 mm recess on
each face, and the cubes touch. Checked: key in cube A 0 mm³, cube B face to face 0, key in cube B 0, and the
key unlocked (lugs along the slot) passes the keyway at 0.

## The library

| Part | File | What it is | Checked |
|---|---|---|---|
| universal key | `mini-universal-key` | the double key above, 0.6 g, prints lying flat | as above |
| end cap | `mini-end-cap` | a single key with a 13 mm flat head and a lanyard loop: closes a socket, a tie point, the handle to turn it | in a cube 0 |
| base mount | `mini-cube` | 26 mm cube, a socket in every face; the interior stays 16.4 mm solid | chambers behind adjacent faces never meet |
| angle joint | `mini-angle-joint` | a wedge with one socket in the base and one in a 45° face | — |
| flat mount | `mini-flat-mount` | 42 × 42 × 6 plate, socket, four countersunk 3.5 mm screw holes, or adhesive | — |
| tube clamp, bars / poles | `mini-tube-clamp`, `mini-pole-clamp` | the bar saddle at mini scale: a 120° V, two zip-tie channels, socket on top; 22–35 and 12–20 mm | 22, 31.8, 35 and 12, 16, 20 mm bars seat at 0 |
| action cam mount | `mini-cam-mount` | a cube with the three-finger action-camera fitting: 3.0 mm fingers, 3.35 gaps, 14.5 wide, Ø5.3 for an M5 thumb screw (bought) | a two-finger camera gauge 0; shifted 0.2 mm it touches (7.6 mm³) |
| helmet base | `mini-helmet-base` | 50 × 40 plate curved underneath to a 90 mm shell, socket on top, for a 3M VHB pad cut to the outline. Base, cube, cam mount: a helmet cam | on a 90 mm shell 0; cam mount on it through a key 0 |
| light mount | `mini-light-mount` | a cube with a C ring for a 22–26 mm torch, two band grooves | 25 mm torch 0; 26 mm 643 mm³ (the grip) |
| phone holder | `mini-phone-holder` | a cradle for a cased phone up to 80 × 160 with lips and two 20 mm strap slots for a silicone strap; socket on the back. On a tube clamp it is the iPhone bar mount in this system; the full-size `ride-phone-*` mount stays the spring-free one | 78 × 158 × 9 phone 0 |
| battery dock | `mini-battery-dock` | a sleeve for a power bank up to 70 × 15 mm section, open front with 5 mm lips, cable notch, two strap slots, socket on the back: the battery extender, on the bars or on the pod | 68 × 14 bank 0 |
| device holder | `mini-device-holder` | the same cradle at 62 × 92 for a GPS, a small bank, a speaker | 60 × 90 × 12 device 0 |
| photo tag | `mini-photo-tag` | 52 × 48 × 7 frame, a 40 × 30 print under four corner tabs, open behind, socket on the back, lanyard hole | photo 0 |
| collar mount (pet) | `mini-collar-mount` | slides onto a 20–25 mm collar, a bump stops it walking; a tag, a light or the cam locks on top | 25 × 4 webbing: bump only (49 mm³) |
| lantern hook (camp) | `mini-lantern-hook` | a J hook, 20 mm throat, with a socket; hangs from a pole clamp or a branch | — |
| keyed bar-end plug | `mini-bar-end` | the dayrally bar-end plug with a mini socket in its cap: a charm, a cube or a light locks into the bar end | end cap in it 0; plug in an 18.8 bar 753 mm³ (the designed press) |
| adapter | `mini-adapter` | two full TURN keys under a 70 × 36 flange, one mini socket on an 18 mm boss that clears the full key grips (17.3). A cube chain locks onto the bar saddle, a pod floor, the home dock or the Grid | on a Grid board 0; on the bar saddle 0; a cube on the boss clears the key grips 0 |

Not built from the board: the swivel and swipe joints (a rotating joint needs a detent ring and a pin, and a
first print of the plain key will tell whether a 0.6-scale detent holds before adding one), the panel (a
Grid-like plate of mini sockets is one line of code once the cube prints), and the mini case (the pod mini
with a socket in its floor is the honest version).

## Print notes

PETG everywhere; PLA for colour accents that stay indoors. Cubes and joints as is: the chambers behind the
side faces are 13 mm bridges. Clamps print V-up (face down in the pipeline). The light mount prints on its
side so the ring is a vertical cylinder (the ring is the cube's full width, so it starts on the bed); the helmet
base prints curve-up; the end cap prints lugs down like a key, its loop standing on the head with a teardrop hole;
the lantern hook's J is flush with the block's bed face. The key prints lying flat; print the
first key and the first cube together and tune `lib.CLAMP` and the detent before the rest, exactly as the
full-size test kit does.

## Lineage

The three-finger action-camera fitting is a de facto public standard (3 mm fingers, M5), not a licensed
design, recorded in the register. Cube-and-pin construction toys are a century old. The quarter-turn key,
the double key with its disc, the adapter and the one-system rule from the wall board to the collar are
assembl's.
