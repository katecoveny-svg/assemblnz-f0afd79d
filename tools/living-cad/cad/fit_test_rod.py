"""Digital fit checks for the dayrally rod. Run: python3 cad/fit_test_rod.py"""
import os, sys, json, math
sys.path.insert(0, os.path.dirname(__file__))
import lib, dayrally_rod as r
from lib import M, ext_y, circ
ov = lambda a, b: round((a ^ b).volume(), 3)
out = {}
secs = [r.section(i) for i in range(3)] + [r.tip()]
# each section's spigot inside the socket of the section below: spigot bottom sits at the socket floor
for i in range(3):
    below, above = secs[i], secs[i + 1].translate([0, 0, r.SEC_L])
    out[f"joint_{i + 1}_clash_mm3"] = ov(below, above)
g, c, cap = r.grip(), r.collar(), r.butt_cap()
collar_in = c.translate([0, 0, r.GRIP_L - r.COLLAR_L])                        # flange sits on the grip top
out["collar_press_mm3"] = ov(g, collar_in)                                       # designed press: small positive
s1_in = secs[0].translate([0, 0, r.GRIP_L + 3.0])
out["s1_in_collar_clash_mm3"] = ov(collar_in, s1_in)
out["s1_touches_grip_mm3"] = ov(g, s1_in)
cap_in = cap.translate([0, 0, -3.0])
out["cap_press_mm3"] = ov(g, cap_in)
saddle = r.rod_saddle()
grip_in_saddle = g.rotate([90, 0, 0]).translate([0, r.GRIP_L / 2 - 20, lib.FL_Z1 + 8.0 + r.GRIP_OD / 2 + 0.3])
key = lib.turn_key()
out["saddle_keys_clear_mm3"] = ov(saddle, key.translate([-21, 0, 0]) + key.translate([21, 0, 0]))
out["grip_clears_keys_mm3"] = ov(grip_in_saddle, key.translate([-21, 0, 0]) + key.translate([21, 0, 0]))
out["saddle_grip_clash_mm3"] = ov(saddle, grip_in_saddle)
ok, placed = r.packing_check()
out["sections_pack_inside_grip"] = ok
out["assembled_length_mm"] = round(r.GRIP_L + 3.0 + 4 * r.SEC_L, 1)
print(json.dumps(out, indent=1))
json.dump(out, open(os.path.join(os.path.dirname(__file__), "..", "parts", "fit-tests-rod.json"), "w"), indent=2)
