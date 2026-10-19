# Review of the forwarded "world-class saltwater fishing kit" thread

**Status: review, 20 October 2026. What assembl built in answer to it is `DAYRALLY-CAST.md`.**

Kate forwarded a thread from another assistant: material advice (PA6-CF, then PPA-CF), an OpenSCAD file
described as "the complete, master file" for a casting rod, a spinning reel, a box and an insert, then an
ESP32-CAM housing and a list of print services. The material advice is mostly right; the code is not a
design. Below is what holds, what does not, and what we did instead.

## What holds

- **PA6-CF is the wrong nylon for salt water.** Nylon 6 drinks water. Bambu's own figures: normal PA6-CF
  bending modulus 4.9 GPa dry, 1.9 GPa after wet conditioning (a 61% drop); PPA-CF 9.9 dry, 9.6 wet (2.4%).
  Saturated absorption 3.8% against 1.3%. PA12-CF is the next best (Polymaker: longer chains, much lower
  moisture uptake). So: PPA-CF first, PA12-CF second, PA6-CF never for a rod. Sources: Bambu PPA-CF product
  page, Polymaker PA12-CF notes, Siraya Tech PAHT comparison (vendor data, directional).
- **The reel seat and the guides are the weak points of printed rods.** True, and the reason the assembl
  design takes a bought reel and gives the seat a real screw lock and a keyed hood.
- **Export 3MF, not STL, to print farms.** 3MF carries units and part names. Our pipeline exports STL today;
  adding 3MF is a one-line trimesh export and is on the list.
- **"Print the reel, buy the rod body" was the thread's first instinct** and it is the honest one for a kid
  who wants to cast. The thread then abandoned it for an all-printed rod on request. See the load numbers
  below for why that costs.

## What does not hold

**The OpenSCAD "master file".**

| Claim | What the code does |
|---|---|
| "Spinning reel (based on Shimano AX logic)" | Four cylinders and a 2 mm rod. No gear train, no rotor, no line roller, no spool oscillation, no anti-reverse, no bail that opens. The "drag" is an M3 bolt through a rubber washer. It cannot cast or retrieve. |
| "Male spigot / female socket" rod joints | The socket is cut at the same end as the spigot (both at `rod_sec_len - joint_len`), so the spigot is hollowed by its own socket. The sections cannot join. |
| "Print the rod sections vertically" | Puts every layer line across the bending axis, the weakest orientation for a rod. The same thread earlier said to print horizontally "to align the fibres". Both cannot be right; horizontal is. |
| "Reel seat" | A 14 mm hole for the rod and a 5 mm slot "for a zip tie or a small bolt". No foot pocket, no hood, no lock. |
| Box and insert | A Minkowski-rounded box unrelated to the dayrally pods and the TURN. The insert cuts a 70 × 50 hole "for the reel". |
| "World-class" | Nothing in the file was checked for fit, strength or printability. |

It is a sketch, and useful only as a list of parts to design. Nothing from it was used.

**The ESP32-CAM housing.** The lens opening is cut through the base (`translate([..., -1])`, the bottom
face), not the lid; the board's antenna, SD slot and the FTDI header have no room; the "GoPro fingers" are a
single 20 mm block with a slot, not the three-finger standard. If assembl wants an action cam in the dayrally
line, it is a separate design with the real module in hand. The film pinhole cam (`DAYRALLY-CAM.md`) stays
the camera in the kit.

**The print-service list.** RYSE 3D (UK), JLC3DP, Craftcloud/Rigid Prints, PREMSA (Mexico) are presented
with capabilities none of which were verified from this session. Record them as leads in
`FULFILMENT-API-AND-SCAD-REVIEW-20261019.md` terms: to confirm material lists, minimums and shipping to NZ
before any order. The NZ route (a local X1C-class printer with a hardened nozzle and a dry box, our own
spool of PPA-CF) is the right first print either way. 3DAPI remains the API-first NZ candidate for the
PLA and PETG parts.

## The load numbers that decide the design

A fishing rod is a cantilever. The bending moment at any point is the tip force times the distance to the
tip. For a printed solid tip of side `s` at distance `L` from the tip under tip force `F`:
`stress = 6 F L / s³` (square section). For a round section it is `32 F L / (π d³)`.

- A 3 mm round PPA-CF tip, 200 mm from the end, at 2.5 N: 189 MPa. PPA-CF breaks around 120 to 150 MPa.
  So a printed rod cannot have a glass-thin tip.
- A reel drag set to 1 kg puts about 10 N on the tip. No printed rod in this family survives that with a
  usable tip. The design load is 2.5 N and the drag must be set to 300 g or less.
- Spigot pins carry the full moment at the joint. A pin half the section's size fails first; the pins must
  fill the bore (0.7 of the side and more), which is why the sections are hollow squares with the bore as
  the socket.

These numbers are computed in `dayrally_cast.py` (`stress_table`) from the actual geometry and printed into
the manifest. They are why the assembl design is three hollow square sections printed flat, with the honest
line that a bought glass blank on the same printed grip is stronger.

## What assembl did instead

`DAYRALLY-CAST.md`: a 1.07 m three-section casting rod in PPA-CF that packs inside its 36 mm grip, a
screw-lock reel seat sized to a standard spinning reel foot with the hood riding a true printed thread, guides
and a tip top, every clearance checked digitally, a stress table at 2.5 N and 5 N, and the bought-blank option
on the same grip. The reel is bought. A printed reel is a later, separate decision and would be a spincast, not
a spinning reel, because a spincast has no bail, no rotor balance and no oscillation to get wrong.
