"""Digital fit checks for the dayrally cam. Run: python3 cad/fit_test_cam.py"""
import os, sys, json, math
sys.path.insert(0, os.path.dirname(__file__))
import lib, dayrally_cam as c
from lib import M, CS, ext_z, cyl_z, rrect, circ
ov = lambda a, b: round((a ^ b).volume(), 3)
out = {}
body = c.body()
back = c.back()
out["back_in_body_clash_mm3"] = ov(body, back)
knob = c.winder_knob().rotate([90, 0, 0]).translate([c.CHAMBER_X, c.HY + c.BOSS_H + 6.0, c.CHAMBER_Z])
pin = c.supply_pin().rotate([90, 0, 0]).translate([-c.CHAMBER_X, c.HY + c.BOSS_H + 5.0, c.CHAMBER_Z])
out["winder_in_body_clash_mm3"] = ov(body, knob)            # the three 0.05 ridges are a designed light press
out["supply_pin_in_body_clash_mm3"] = ov(body, pin)
skin, pat = c.skin("dots")
px, py = c.PIVOT
disc = c.shutter_disc().rotate([180, 0, 0]).translate([0, 0, c.Z_FRONT + c.SKIN_T + c.SHUT_T])     # bump down, pin into the skin
open_ = disc
closed = disc.translate([-px, -py, 0]).rotate([0, 0, c.CLOSED_DEG]).translate([px, py, 0])
body_front = body
out["disc_open_clash_mm3"] = ov(skin, open_)
out["disc_closed_clash_mm3"] = ov(skin, closed)
out["disc_pin_in_body_clash_mm3"] = ov(body_front, open_)
win = cyl_z(c.SKIN_WINDOW_D / 2, c.Z_FRONT + c.SKIN_T, c.Z_FRONT + c.SKIN_T + 1.0)
out["disc_closed_covers_window"] = ov(closed, win) > 100
out["disc_open_clears_window"] = ov(open_, cyl_z(c.SKIN_WINDOW_D / 2 + 0.4, c.Z_FRONT + c.SKIN_T, c.Z_FRONT + c.SKIN_T + 1.0)) == 0
cradle = c.cradle()
body_in_cradle = body.rotate([90, 0, 0]).translate([0, (c.Z_BACK + c.Z_FRONT) / 2, c.HY + lib.FL_Z1])
out["cradle_body_clash_mm3"] = ov(cradle, body_in_cradle)
# spools: tube 25.5 outside, 4.9 hole, 64.5 long, standing on the chamber floor
for name, x in (("supply", -c.CHAMBER_X), ("takeup", c.CHAMBER_X)):
    spool = c._cyl_y(12.75, x, c.CHAMBER_Z, -c.CHAMBER_L / 2, -c.CHAMBER_L / 2 + c.SPOOL_L) - c._cyl_y(c.SPOOL_HOLE_D / 2, x, c.CHAMBER_Z, -40, 40)
    out[f"{name}_spool_clash_mm3"] = ov(body, spool)
# drive blade and pin reach the spool end
spool_top = -c.CHAMBER_L / 2 + c.SPOOL_L
out["blade_depth_into_spool_mm"] = round(spool_top - knob.bounding_box()[1], 2)
out["supply_pin_depth_into_spool_mm"] = round(spool_top - pin.bounding_box()[1], 2)
out["knob_lift_to_clear_spool_mm"] = out["blade_depth_into_spool_mm"]
# film strip through the slot
film = ext_z(rrect(2 * c.SLOT_X - 1.0, c.FILM_W, 0.1), -0.45, -0.2)
out["film_in_slot_clash_mm3"] = ov(body, film)
# light cone: rays from the pinhole to the image corners and edges must not hit the body
hits = 0
for (gx, gy) in [(27, 27), (-27, 27), (27, -27), (-27, -27), (27, 0), (-27, 0), (0, 27), (0, -27), (0, 0)]:
    for t in [i / 20 for i in range(1, 20)]:
        px, py, pz = gx * t, gy * t, c.F - (c.F - 0.3) * t
        probe = M.cube([0.3, 0.3, 0.3], True).translate([px, py, pz])
        if ov(body, probe) > 0:
            hits += 1
out["light_cone_blocked_samples"] = hits
# red window tunnel reaches the backing paper
out["window_tunnel_open"] = ov(body, cyl_z(3.0, c.POCKET[2] + 0.5, -c.SLOT_GAP - 0.5)) == 0
# nut pocket is blind (does not break into a cavity): probe just above the bolt hole end
out["nut_pocket_blind"] = ov(body, M.cube([2, 2, 2], True).translate([0, -c.HY + c.NUT_T + 3.5 + 1.5, 20.0])) > 7.9
print(json.dumps(out, indent=1))
json.dump(out, open(os.path.join(os.path.dirname(__file__), "..", "parts", "fit-tests-cam.json"), "w"), indent=2)
