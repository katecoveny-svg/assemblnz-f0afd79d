"""Digital fit tests for the TURN standard: insert, turn, lock, and nub seating."""
import json, os, sys
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
import lib
from lib import M, P

board = lib.board(2, 2)
c = (0.5 * P, 0.5 * P)            # board cell used for the key
c2 = (0.5 * P, 1.5 * P)           # neighbour cell (for the nub)
hook = lib.hook().translate([c[0], c[1] - P, 0])       # hook key cell at (c), nub one cell lower -> use board cells (0.5P, 0.5P) & (0.5P, -0.5P)?
# place the hook so its key sits in the upper cell and nub in the lower cell of the board
hook = lib.hook().translate([0.5 * P, 0.5 * P, 0])     # key at y = 1.5P, nub at y = 0.5P
key_xy = (0.5 * P, 1.5 * P)
key_locked = lib.turn_key().translate([key_xy[0], key_xy[1], 0])
results = {}


def ov(a, b):
    return round((a ^ b).volume(), 4)


# 1. nub seats in its keyway, flange sits flat on the board face
results["hook_vs_board_overlap_mm3"] = ov(hook, board)
# 2. insertion: key turned to "open" (lugs vertical) slides in along -z without touching board or hook
sweep = []
for dz in np.arange(14.0, -0.01, -0.5):
    k = lib.turn_key().rotate([0, 0, 90]).translate([key_xy[0], key_xy[1], dz])
    sweep.append((round(float(dz), 1), ov(k, board), ov(k, hook)))
results["insertion_sweep"] = sweep
results["insertion_max_overlap_board_mm3"] = max(s[1] for s in sweep)
results["insertion_max_overlap_hook_mm3_excluding_seat"] = max(s[2] for s in sweep if s[0] > 0.2)
# 3. turning: overlap at each angle once seated (bumps ride the plate, cone clamp)
turn = []
for ang in range(90, -1, -15):
    k = lib.turn_key().rotate([0, 0, ang]).translate([key_xy[0], key_xy[1], 0])
    turn.append((ang, ov(k, board), ov(k, hook)))
results["turn_sweep_deg_board_hook"] = turn
# 4. locked: lugs behind the plate, bumps in dimples
results["locked_overlap_board_mm3"] = ov(key_locked, board)
results["locked_overlap_hook_mm3"] = ov(key_locked, hook)
# 5. pull-out check: in the locked angle the lugs overlap the plate if pulled forward 0.5 mm (i.e. they are captured)
results["locked_pull_0p5mm_overlap_board_mm3"] = ov(key_locked.translate([0, 0, 0.5]), board)
results["open_pull_0p5mm_overlap_board_mm3"] = ov(lib.turn_key().rotate([0, 0, 90]).translate([key_xy[0], key_xy[1], 0.5]), board)
# 6. shelf with two keys and the bin: flanges flat against the board
shelf = lib.shelf(2).translate([0.5 * P, 0.5 * P, 0])
results["shelf_vs_board_overlap_mm3"] = ov(shelf, board)
for k, v in results.items():
    if k not in ("insertion_sweep",):
        print(k, v)
json.dump(results, open(os.path.join(os.path.dirname(__file__), "..", "parts", "fit-tests.json"), "w"), indent=1)
