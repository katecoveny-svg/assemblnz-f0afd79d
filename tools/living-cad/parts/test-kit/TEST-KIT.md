# assembl living — test-print kit

One small print run (about 165 g of plastic, 10 parts) that answers the fit questions before anything is sold. Print it with the same print partner, printer type and materials you plan to sell with. Fit depends on the printer, so results from a different printer don't count.

| File | Qty | Material | What it answers |
|---|---|---|---|
| 01-board-2x2.stl | 1 | PLA Matte | The board every other test part goes into. |
| 02-key-A-clamp-000.stl | 2 | PETG | Loosest key (1 notch on the grip). |
| 02-key-B-clamp-010.stl | 2 | PETG | Current design (2 notches). |
| 02-key-C-clamp-020.stl | 2 | PETG | Tightest key (3 notches). |
| 03-hook.stl | 1 | PLA Matte | Load and creep. |
| 04-over-door-hanger.stl | 1 | PETG | Does a door still close with it on? |
| 05-pocket-clearance.stl | 1 | PLA Matte | Cut-out tray clearance. Uses an NZ $2 coin and an AA battery. |
| 06-door-gap-gauge.stl | 1 | PLA Matte | Is there room above a door for the hanger? |

All parts are already in print orientation and need no supports.

## Tests, in order

**1. Key feel (10 minutes).** Put the hook on the board. Push each key in with the grip upright, then turn it to horizontal. Do this with A, B and C.

| Key | Goes in by hand? | Turns by hand? | Clicks at horizontal? | Hook wobbles when locked? |
|---|---|---|---|---|
| A (1 notch) | | | | |
| B (2 notches) | | | | |
| C (3 notches) | | | | |

Pick the loosest key that doesn't wobble. In `cad/lib.py`, set `CLAMP` to 0.00 for A, 0.10 for B or 0.20 for C, then run `python3 cad/build.py`. If even C wobbles, try 0.30. If none of them click, increase `BUMP_H` from 0.25 to 0.35.

**2. Ten turns.** Lock and unlock the chosen key ten times. It should still click and hold on the tenth turn. If it loosens, the bumps are wearing down: increase `BUMP_H` slightly or print the keys in PETG HF.

**3. Hook load (24 hours).** Screw the coupon to a wall offcut or stud. Hang a 2 kg bag on the hook and mark where the hook tip sits. After 24 hours, check that the tip hasn't dropped more than 1 mm and the key is still horizontal. Repeat at 4 kg, then publish half of the weight that passed as the load limit.

**4. Pocket clearance (2 minutes).** Drop a $2 coin and an AA battery into each column (0.6, 0.9, 1.2, 1.5 mm). Pick the tightest column where both drop in without pressing and lift out with the finger scoop. If that isn't 1.2, change `clearance=` in `cutout_tray()` in `cad/extras.py` to match.

**5. Door hanger (5 minutes).** Close a bedroom door and slide the gauge into the gap above it. If the 4 step fits, the hanger will fit. Hook the hanger over the door and close it: it should latch without force. Note the door's thickness: the hanger suits doors up to 35 mm.

## What to send back

Record the results in this file, or just send a photo of the filled-in table. The numbers go straight into `cad/lib.py` and `cad/extras.py`, and every part rebuilds from them.
