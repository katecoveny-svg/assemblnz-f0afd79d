"""Digital fit checks for the bike set. Run: python3 cad/fit_test_bike.py"""
import os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
import lib, dayrally_bike as bk, dayrally_ride as r, dayrally2 as d2, dayrally_cast as c, dayrally_rod as rod
from lib import M
ov = lambda a, b: round((a ^ b).volume(), 3)
out = {}
rm = bk.rack_mount()
keys = M.batch_boolean([lib.turn_key().translate([x, y, 0]) for (x, y) in bk.KEYS], lib.m3d.OpType.Add)
out["ride_pod_on_rack_mount_clash_mm3"] = ov(rm, r.pod_base())
out["long_pod_on_rack_mount_clash_mm3"] = ov(rm, d2.pod_base("long"))
out["keys_in_rack_mount_clash_mm3_designed_clamp"] = ov(rm, keys)
for sx in (-1, 1):
    for sy in (-1, 1):
        out[f"strap_slot_{sx}_{sy}_clash_mm3"] = ov(rm, lib.ext_z(lib.rrect(bk.STRAP_T, bk.STRAP_W, 1.2), -20, 20).translate([sx * (150.0 / 2 - 14.0), sy * (100.0 / 2 - 22.0), 0]))
q = bk.rack_quiver()
cast_grip = M.cylinder(250.0, c.GRIP_OD / 2, -1.0, 96).translate([-23.0, 0, 3.3])
rod_grip = M.cylinder(230.0, rod.GRIP_OD / 2, -1.0, 96).translate([23.0, 0, 3.3])
out["cast_grip_36_in_quiver_clash_mm3"] = ov(q, cast_grip)
out["rod_grip_32_in_quiver_clash_mm3"] = ov(q, rod_grip)
for z in (22.0, 130.0 - 22.0):
    out[f"quiver_strap_slot_{int(z)}_clash_mm3"] = ov(q, lib.ext_x(lib.rrect(bk.STRAP_W, bk.STRAP_T, 1.0, z, -22.4 - 1.5), -50, 50))
ts = bk.toptube_saddle()
for d in (25.0, 31.8, 45.0):
    tube = M.cylinder(120.0, d / 2, -1.0, 96).rotate([0, 90, 0]).translate([-60.0, 0, -24.0 + 16.0 - (d / 2) / 0.8660254])
    out[f"toptube_{d}_in_saddle_clash_mm3"] = ov(ts, tube)
out["pod_mini_on_toptube_saddle_clash_mm3"] = ov(ts, d2.pod_base("mini"))
out["ride_pod_on_toptube_saddle_clash_mm3"] = ov(ts, r.pod_base())
json.dump(out, open(os.path.join(os.path.dirname(__file__), "..", "parts", "fit-tests-bike.json"), "w"), indent=2)
for k, v in out.items():
    print(f"{k:48s} {v}")
