"""Digital fit checks for the scooter parts. Run: python3 cad/fit_test_scoot.py"""
import os, sys, json, math
sys.path.insert(0, os.path.dirname(__file__))
import lib, dayrally_scoot as sc, dayrally2 as d2, dayrally_ride as r, dayrally_cast as c, dayrally_rod as rod
from lib import M
ov = lambda a, b: round((a ^ b).volume(), 3)
out = {}
ss = sc.stem_saddle()
depth, gd = 34.0, 20.0
for d in (32.0, 40.0, 48.0, 60.0):
    # a round stem along x, seated on the two faces of the 120 degree V: centre (d/2)/sin60 above the apex
    zc = -depth + gd - (d / 2) / math.sin(math.radians(60))
    stem = M.cylinder(200.0, d / 2, d / 2, 128).rotate([0, 90, 0]).translate([-100.0, 0, zc])
    out[f"stem_{int(d)}_in_saddle_clash_mm3"] = ov(ss, stem)
for x in (-32.0, 32.0):
    out[f"strap_through_saddle_{int(x)}_clash_mm3"] = ov(ss, sc.strap_gauge().translate([x, 0, -depth + gd - 2.0]))
keys = M.batch_boolean([lib.turn_key().translate([x, y, 0]) for (x, y) in sc.KEYS], lib.m3d.OpType.Add)
out["keys_in_saddle_sockets_clash_mm3_designed_clamp"] = ov(ss, keys)
out["pod_mini_on_saddle_clash_mm3"] = ov(ss, d2.pod_base("mini"))
out["ride_pod_on_saddle_clash_mm3"] = ov(ss, r.pod_base())
q = sc.quiver()
out["quiver_on_saddle_clash_mm3"] = ov(ss, q)
out["keys_through_quiver_flange_clash_mm3_designed_clamp"] = ov(q, keys)
zc = lib.FL_Z1 + 8.0 + sc.BORE / 2 + 2.4
for name, od in (("cast_grip_36", c.GRIP_OD), ("rod_grip_32", rod.GRIP_OD)):
    grip = M.cylinder(230.0, od / 2, od / 2, 96).rotate([0, 90, 0]).translate([sc.QH / 2 - 3.0 - 230.0 - 0.3, 0, zc])   # butt on the floor at +x
    out[f"{name}_in_quiver_clash_mm3"] = ov(q, grip)
json.dump(out, open(os.path.join(os.path.dirname(__file__), "..", "parts", "fit-tests-scoot.json"), "w"), indent=2)
for k, v in out.items():
    print(f"{k:52s} {v}")
