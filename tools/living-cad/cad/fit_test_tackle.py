"""Digital fit checks for the tackle pieces. Run: python3 cad/fit_test_tackle.py -> parts/fit-tests-tackle.json"""
import os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
import lib, dayrally as d1, dayrally2 as d2, dayrally_tackle as tk
from lib import M, CS, ext_z, ext_y, cyl_z, rrect, circ
ov = lambda a, b: round((a ^ b).volume(), 3)
out = {}
Z1 = lib.FL_Z1
# the packets in their cases: a box the packet's size, seated on the lip, must not cut the case; the keys fit under it
for size, (W, H, T) in tk.PACKS.items():
    case = tk.pack_case(size)
    Ly = H * 0.78
    packet = ext_z(rrect(W, H, 3.0, 0, -Ly / 2 + 1.6 + 2.0 + H / 2), Z1 + 3.6 + 0.3, Z1 + 3.6 + 0.3 + T)
    out[f"pack_{size}_vs_case_mm3"] = ov(packet, case)
    out[f"pack_{size}_proud_of_case_mm"] = round(H - Ly, 1)
    out[f"case_{size}_vs_keys_mm3"] = round(sum(ov(case, lib.turn_key().translate([x, y, 0])) for (x, y) in tk.KEYS), 3)
    out[f"case_{size}_vs_board_mm3"] = ov(case, lib.board(4, 4).translate([-2 * lib.P, -2 * lib.P, 0]))
rail = tk.pack_rail()
out["rail_vs_keys_mm3"] = round(sum(ov(rail, lib.turn_key().translate([x, y, 0])) for (x, y) in tk.KEYS), 3)
# the reel foot in the dock: plate in the slot, stem through the gap, 0 clash; a 2500 reel body hangs clear of the board
dock = tk.reel_dock()
f = tk.FOOT
plate = ext_z(rrect(f["length"], f["thick"], 0.5, 0, 18.0 + f["thick"] / 2), Z1 + 5.0, Z1 + 5.0 + f["width"])
stem = ext_z(rrect(f["stem_w"], 40.0, 1.0, 0, 18.0 - 20.0), Z1 + 5.0 + (f["width"] - f["stem_t"]) / 2, Z1 + 5.0 + (f["width"] + f["stem_t"]) / 2)
out["reel_foot_vs_dock_mm3"] = ov(plate + stem, dock)
out["dock_vs_keys_mm3"] = round(sum(ov(dock, lib.turn_key().translate([x, y, 0])) for (x, y) in tk.KEYS), 3)
out["dock_vs_board_mm3"] = ov(dock, lib.board(4, 4).translate([-2 * lib.P, -2 * lib.P, 0]))
# the knob: the shaft and two bearings sit in their seats with 0 clash; the inlay sits in the cap
knob, inlay = tk.reel_knob(name="MILA", font=tk.FONT)
bo, bw = tk.KNOB_BEARING
shaft = cyl_z(tk.KNOB_SHAFT / 2, -5, 26.0 - 3.0 - 0.5, seg=48)
bearings = cyl_z(bo / 2, 0, bw, seg=64) + cyl_z(bo / 2, 26.0 - 3.0 - bw, 26.0 - 3.0, seg=64)
out["knob_shaft_clash_mm3"] = ov(shaft, knob)
out["knob_bearings_clash_mm3"] = ov(bearings, knob)
out["knob_inlay_vs_knob_mm3"] = ov(inlay, knob)
# the universal saddle: a 22 and a 45 mm tube each sit in the V touching both faces; the strap channel passes a 20 × 2.4 strap
sad = tk.universal_saddle()
for d in (22.0, 31.8, 45.0):
    tube = ext_y(circ(d / 2, 0, -30.0 + 24.0 - (d / 2) / __import__("math").sin(__import__("math").radians(50)), seg=96), -40, 40)
    out[f"tube_{d:g}_vs_saddle_mm3"] = ov(tube, sad)
strap = __import__("lib").ext_x(rrect(20.0, 2.4, 0.5, -30.0 + 11.0, -12.0), -60, 60)
out["strap_in_channel_clash_mm3"] = ov(strap, sad)
# the pod on the saddle, like every mount
out["saddle_vs_pod_mm3"] = ov(sad, d2.pod_base("standard"))
json.dump(out, open(os.path.join(os.path.dirname(__file__), "..", "parts", "fit-tests-tackle.json"), "w"), indent=2)
for k, v in out.items():
    print(f"{k:40s} {v}")
