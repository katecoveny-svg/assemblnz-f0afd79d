# First-print order, 20 October 2026, refreshed 21 October: bike set, fish set, pegboard, rulers, test kit

**Status: order pack prepared; nothing ordered or paid. Every part is a first print, checked digitally only.**
**Kate's pick, 21 October: the lean first print** (`lean = yes` in `order.csv`): the test-print kit, the rulers set and the rod joints
(cast pins 1 and 2 with sections 2 and 3, fixed-line sections 2 and 3). 26 pieces, about 407 g, **about NZD 239** before a quote.
It answers the TURN clamp, the two-colour inlay, the 35 cm end-to-end registration and whether a printed spigot or pin fits, in one run.

Files: the STLs are served hashed from `https://www.assembl.co.nz/living/cad/v0.3/` (the manifest beside them carries the SHA-256 of each);
the same files are in the zip. Print notes per file are in `order.csv` and the design docs (`DAYRALLY-RIDE.md`, `DAYRALLY-MINI.md`,
`DAYRALLY-CAST.md`, `DAYRALLY-ROD.md`, `ASSEMBL-LIVING.md`).

| Set | Files | Est. grams | Est. cost NZD (bureau, before quote) |
|---|---|---|---|
| bike set | 32 | 584 | about 303 |
| fish set | 34 | 607 | about 371 |
| rulers | 9 | 197 | about 91 |
| pegboard | 18 | 265 | about 146 |
| test kit | 11 | 164 | about 90 |
| **lean first print** | 26 | 407 | **about 239** |
| **everything** | 104 | 1817 | **about 1001** |

Estimate basis: PETG/PLA NZD 0.28 per gram, PETG-CF 0.45, TPU 0.45, ASA 0.35, PA12-CF 0.75, PPA-CF 0.95, plus NZD 4 handling per file. A bureau quote replaces this.

## Where to order (LAUNCH-OPERATIONS-20261019.md section 5)

1. **3DPrintIt, Auckland** (first choice: local, PETG, batch-friendly, instant quote for suitable models; no API). Upload the zip, pick the material and colour per the CSV, ask for the carbon-fibre nylon sections as a separate quote.
2. **A Treatstock Auckland vendor** for the same pegboard files, to compare fit, finish and price.
3. The **PPA-CF rod sections** need a hardened nozzle, a dry box and an enclosure. If neither bureau runs PPA-CF, order those seven files in PA12-CF, and if not that, PETG-CF (softer; the doc says so). Everything else is ordinary PETG, ASA or TPU.

## What this order teaches (tune before the second print)

- The six TURN keys and the board: `CLAMP`, `BUMP_H`, `DIMPLE_D` in `lib.py` (the full-size clamp), and by the 0.6 factor the mini key.
- The ride pod: `PIN_CLR`, `LIP_CLR`, `PEG_PRESS`, `RIB_H`; whether the bento seal holds under a tap.
- The grips: `GRIP_ID` on a real bar. The cast rod: `PIN_CLR`, `THREAD_CLR`, and whether a pin survives a snag at 300 g drag.
- The mini joint: whether a 0.6-scale detent holds, which decides the swivel and swipe joints.
- The rulers (`DAYRALLY-RULER.md`): every scale against a steel rule at 0, 10 and 17 cm on the lid and 20, 30 and 35 on the base; whether a 1.0 mm inlay tick and a 0.6 mm raised rib print clean; whether the mm ticks on the 15 cm piece read; whether the two apexes register on a wet wharf.

## Not in this order, on purpose

- The pinhole camera (measure a real 120 spool first), the watch cradle (measure the charging puck first), the phone mount and slider (print after the key clamp is known).
- Bought parts to have ready: two 25 mm straps, zip ties, a 3 mm steel rod (optional hinge pin), M5 thumb screw, 4 mm screws and plugs for the board, a Shimano 1000-size reel, 4 to 6 lb mono, rod epoxy and thread, a 1/4 teaspoon of patience for the first key.
