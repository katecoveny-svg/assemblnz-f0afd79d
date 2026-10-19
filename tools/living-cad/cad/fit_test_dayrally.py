import os, sys, json
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
import lib, dayrally as d
from lib import M, P
ov = lambda a, b: round((a ^ b).volume(), 4)
base, lid, ins = d.pod_base(), d.pod_lid()[0], d.pod_insert(3, 2)
saddle, clip = d.bar_saddle(), d.strap_clip()
board = lib.board(4, 2).translate([-2 * P, -0.5 * P, 0])     # cell centres at x = -63,-21,21,63 ; y = 0, 42
keys = [lib.turn_key().translate([x, y, 0]) for (x, y) in d.KEYS]
r = {}
r["pod_vs_saddle_mm3"] = ov(base, saddle)
r["pod_vs_strap_clip_mm3"] = ov(base, clip)
r["pod_vs_board_mm3"] = ov(base, board)
r["lid_vs_base_mm3"] = ov(lid, base)
r["insert_vs_base_mm3"] = ov(ins, base)
r["insert_vs_keys_mm3"] = round(sum(ov(ins, k) for k in keys), 4)
r["lid_vs_insert_mm3"] = ov(lid, ins)
sweep = []
for dz in np.arange(14.0, -0.01, -1.0):
    k = lib.turn_key().rotate([0, 0, 90]).translate([d.KEYS[0][0], 0, dz])
    sweep.append((round(float(dz), 1), ov(k, saddle), ov(k, base)))
r["key_insert_max_vs_saddle_mm3"] = max(s[1] for s in sweep)
r["key_insert_max_vs_pod_mm3_above_seat"] = max(s[2] for s in sweep if s[0] > 0.2)
r["key_locked_vs_saddle_mm3"] = ov(keys[0], saddle)
r["key_locked_vs_pod_clamp_mm3"] = ov(keys[0], base)
r["key_locked_pull_0p5_vs_saddle_mm3"] = ov(keys[0].translate([0, 0, 0.5]), saddle)
for k, v in r.items():
    print(k, v)
json.dump(r, open(os.path.join(os.path.dirname(__file__), "..", "parts", "fit-tests-dayrally.json"), "w"), indent=1)
