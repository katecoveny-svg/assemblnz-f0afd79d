# dayrally pods — the engineering brief (20 October 2026)

**Status:** proposal; nothing here is built. The four plain pods (mini, standard, tall, long) exist in v0.3 as friction-lid boxes in PLA Matte.
**Companion:** the full product briefs, one per catalogue item, live in the Claude Doc "dayrally & assembl / living — product briefs" (20 October). This file keeps the durable engineering part in the repo.

Kate's ask: "think clever out of the box engineering design: run tough, watertight, floats, attach to scooter", and "a basic ruler".

## What exists

| Pod | Outside, with lid | Base height | Inserts | Lid styles | Price |
|---|---|---|---|---|---|
| mini | 92 × 60 × 37 mm | 26 mm | split, quad, earbuds | plain, name, dots, waves | NZ$26 |
| standard | 128 × 72 × 45 mm | 34 mm | everyday, tackle, beach, tech, split | plain, name, dots, waves | NZ$34 |
| tall | 128 × 72 × 69 mm | 58 mm | deep two, deep tackle, cards | plain, name | NZ$42 |
| long | 176 × 72 × 45 mm | 34 mm | pens, tackle, everyday | plain, name | NZ$44 |

PLA Matte, wall 2.2 mm, floor 2.4 mm, lid lip clearance 0.25 mm, no seal. The floor is a TURN flange (two keys 42 mm apart); the key goes in from inside.

## Run tough

PETG for outdoor pods; wall 2.6 mm; four ribs under the floor between the key pads; 3 mm radius on the base's bottom edge; lug eye 3 mm. Prove: 1.5 m onto concrete, ten drops, lid on, 100 g inside; no crack, lid stays on. Colour fades over a summer in sun; say so.

## Watertight

The friction lip is not a seal. Use the ride pod's method (`DAYRALLY-RIDE.md`): TPU 95A O-ring cord 1.6 mm in a groove on the underside of the lid's web, a 0.4 mm rib on the base rim pressing into it, and two side latches (printed cantilever tabs on the base's long walls over hooks on the lid) because a gasket needs compression. Claim: splash-proof and float-and-retrieve, about IP64, never submersible. Prove: 30 cm under for one minute with a tissue inside.

## Floats

A sealed pod floats on the air inside it. From the CAD volumes at 1.24 g/cm³ (PLA), lid closed:

| Pod | Displaces | Pod mass with insert and keys | Spare buoyancy |
|---|---|---|---|
| mini | 176 g | about 70 g | about 100 g |
| standard | 365 g | about 120 g | about 240 g |
| tall | 559 g | about 145 g | about 410 g |
| long | 520 g | about 155 g | about 360 g |

Every pod floats sealed and sinks once flooded: the plastic is heavier than water, so the float is the seal. A bright lid and a 2 m float line on the lanyard lug make the float useful; a closed-cell foam strip under the insert (about 20 g of lift per 20 cm³) makes a pod float even open, and the tall pod has the room.

## On the scooter

The stem saddle (`DAYRALLY-RIDE.md`, "On the scooter") straps to a 32 to 60 mm stem with one 25 mm strap, no tools, off in a minute, and carries two TURN sockets along the stem; the mini or standard pod locks on upright, the quiver takes the packed rod. A stem-mounted pod wants the PETG build and the float line. Stem sizes on a Flamingo, a Lime and a Honey Whale are not measured; measure on the day.

## A ruler

1. **Ruler lid style:** a 0.6 mm flush inlay along one long edge of the lid, mm ticks and cm numbers in the second colour, 12 cm on the standard and 17 cm on the long. One new pattern in the lid code.
2. **A 15 cm ruler piece** (150 × 11 × 2 mm) that lives in a long-pod pen slot, for the school kit.
3. **The 35 cm fish ruler:** mark the long pod's base wall 0 to 17 cm (raised, prints with the base) and its lid 17 to 35 cm (inlay); lay the lid end to end with the base. 35 cm covers kahawai and most legal minimums a child will meet; the lid says so.

## Build order

1. Ruler lid style (half a day). 2. The 35 cm fish ruler on the long pod (one day). 3. Sealed lid for the four pods: gasket groove and rib, two latches, PETG at 2.6 mm, floor ribs, radii, lug eye (two days), then a sample print, the drop test and the dunk test before any pod is called splash-proof or a float. 4. The 15 cm ruler piece (half a day). 5. Float line: bought, not printed. 6. Scooter set on real stems.

**21 October:** 1, 2 and 4 are built in v0.3 as lab items (`DAYRALLY-RULER.md`): the ruler lid on all four sizes, the long pod's fish ruler with the stadium apex as the datum, and the 15 cm piece. 3 is Kate's RP01 rugged pod prototype (`tools/living-cad/prototypes/rugged-pod-v01/`, four screws, a flat TPU gasket, a separate TURN carrier), which keeps its own centreline lid rulers. Nothing printed; every scale to be checked against a steel rule.

Unsure until someone holds one: every clearance, the seal, the load a mount takes, and whether PLA Matte survives a summer in a car.
