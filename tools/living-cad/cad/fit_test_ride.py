"""Digital fit checks for dayrally ride. Run: python3 cad/fit_test_ride.py"""
import os, sys, json, math
sys.path.insert(0, os.path.dirname(__file__))
import lib, dayrally_ride as r, dayrally as d1, dayrally2 as d2
from lib import M
FREDOKA = os.path.join(os.path.dirname(__file__), "..", "fonts", "Fredoka-Bold.ttf")
ov = lambda a, b: round((a ^ b).volume(), 3)
out = {}

keys = M.batch_boolean([lib.turn_key().translate([x, y, 0]) for (x, y) in r.KEYS], lib.m3d.OpType.Add)

# ---- pod
base = r.pod_base()
lid, _ = r.pod_lid(FREDOKA)
out["lid_on_base_clash_mm3"] = ov(base, lid)
rot = lambda m, deg: m.translate([0, -r.HINGE_Y, -r.HINGE_Z]).rotate([deg, 0, 0]).translate([0, r.HINGE_Y, r.HINGE_Z])
sweep = {str(a): ov(base, rot(lid, a)) for a in (10, 20, 30, 45, 60, 75, 90, 105, 120)}
out["lid_open_sweep_clash_mm3"] = sweep
out["lid_open_sweep_max_mm3"] = max(sweep.values())
pin = r.hinge_pin().rotate([0, 90, 0])                       # along +x, head at x = 0 side
pin_l = pin.translate([-r.POD_L / 2 + 12.0 - 2.0, r.HINGE_Y, r.HINGE_Z])   # (52 wide knuckle region begins at -52)
pin_l = r.hinge_pin().rotate([0, 90, 0])
# build: pin from z=-1.5..50 (+head 50..52) -> along x: x = -1.5..52 ; mirror so the head is at the outer end
pin_a = r.hinge_pin().rotate([0, -90, 0]).translate([-52.0 + 0.0, r.HINGE_Y, r.HINGE_Z])    # tip toward +x, head outside x=-52
pin_a = r.hinge_pin().rotate([0, 90, 0]).translate([-52.0 - 50.0, r.HINGE_Y, r.HINGE_Z])
# simpler: a plain pin gauge of the pin's diameter from x=-52 to -2
gauge = M.cylinder(50.0, r.PIN_D / 2, -1.0, 36).rotate([0, 90, 0]).translate([-52.0, r.HINGE_Y, r.HINGE_Z])
out["hinge_pin_in_base_clash_mm3"] = ov(base, gauge)
out["hinge_pin_in_lid_clash_mm3"] = ov(lid, gauge)
out["hinge_pin_radial_clearance_mm"] = r.PIN_CLR
lt = r.latch()
out["latch_in_lid_clash_mm3"] = ov(lid, lt)
out["latch_on_base_closed_clash_mm3"] = ov(base, lt)
out["latch_holds_when_lid_lifted_1mm_mm3"] = ov(base, lt.translate([0, 0, 1.0]))
g = r.gasket().translate([0, 0, r.ZT + r.GROOVE_D - r.GASKET_H])
out["gasket_in_lid_groove_clash_mm3"] = ov(lid, g)
out["gasket_compression_by_rib_mm3"] = ov(base, g)
sl, _ = r.slate("dayrally", FREDOKA)
out["slate_on_lid_body_clash_mm3"] = ov(lid - M.batch_boolean([lib.cyl_z(r.PEG_D / 2 + 1, r.ZT + r.LID_H - 3, r.ZT + r.LID_H + 1, cx=sx * r.PEG_X, seg=32) for sx in (-1, 1)], lib.m3d.OpType.Add), sl)
out["slate_peg_press_mm3"] = ov(lid, sl)
core = r.core_split()
out["core_in_base_clash_mm3"] = ov(base, core)
out["core_clears_lip_mm3"] = ov(lid, core)
out["pod_on_bar_saddle_clash_mm3"] = ov(d1.bar_saddle(), base)
out["pod_on_home_dock_clash_mm3"] = ov(d2.home_dock(), base)
out["pod_keys_in_floor_clash_mm3_designed_clamp"] = ov(base, keys)

# ---- grips
bar = M.cylinder(150.0, 11.1, -1.0, 96).translate([0, 0, -10])
gw = r.grip("waves")
out["grip_bar_interference_mm3"] = ov(gw, bar)
out["grip_bar_interference_on_dia_mm"] = round(22.2 - r.GRIP_ID, 2)
plug = d1.bar_end_plug().rotate([180, 0, 0]).translate([0, 0, r.GRIP_L + 4.2])
out["bar_end_plug_in_grip_clash_mm3"] = ov(gw, plug)
out["bar_end_plug_covers_bore"] = 24.0 > r.GRIP_ID

# ---- watch
keys = M.batch_boolean([lib.turn_key().translate([x, y, 0]) for (x, y) in r.KEYS], lib.m3d.OpType.Add)
for size in r.WATCH:
    c = r.watch_cradle(size)
    out[f"watch_{size}_case_in_pocket_clash_mm3"] = ov(c, r.watch_case(size))
    out[f"watch_{size}_band_round_slab_clash_mm3"] = ov(c, r.watch_band())
    out[f"watch_{size}_band_over_keys_clash_mm3"] = ov(keys, r.watch_band())
    out[f"watch_{size}_keys_in_cradle_clash_mm3_designed_clamp"] = ov(c, keys)
    puck = lib.cyl_z(r.PUCK_D / 2, r.ZF + r.TUNNEL_H - 0.0, r.ZF + r.TUNNEL_H + r.PUCK_T, seg=96)
    out[f"watch_{size}_puck_press_mm3"] = ov(c, puck)
    out[f"watch_{size}_on_bar_saddle_clash_mm3"] = ov(d1.bar_saddle(), c)

# ---- phone
plate = r.phone_plate()
for (w, L, t) in ((64.0, 140.0, 7.0), (72.0, 150.0, 8.3), (82.0, 170.0, 11.0)):
    x_end = r.PH_X0 + r.END_T + 0.3 + L + 0.3
    tooth_x = x_end - 10.0
    k = math.ceil((tooth_x - r.RACK_X[0]) / r.RACK_PITCH)
    x_end = r.RACK_X[0] + k * r.RACK_PITCH + 10.0                # next rack position: in phase
    sl_ = r.phone_slider(x_end)
    ph = r.phone_block(w, L, t, x_end)
    tag = f"phone_{int(w)}x{int(L)}x{t}"
    out[f"{tag}_slider_x_end"] = round(x_end, 2)
    out[f"{tag}_in_plate_channel_clash_mm3"] = ov(plate, ph)
    out[f"{tag}_in_slider_channel_clash_mm3"] = ov(sl_, ph)
    out[f"{tag}_slider_on_plate_clash_mm3"] = ov(plate, sl_)
    out[f"{tag}_pawl_holds_shift_0.7_mm3"] = ov(plate, sl_.translate([0.7, 0, 0]))
    out[f"{tag}_top_gap_mm"] = round(x_end - (r.PH_X0 + r.END_T + 0.3 + L), 2)
out["phone_keys_in_plate_clash_mm3_designed_clamp"] = ov(plate, keys)
sl_ = r.phone_slider(75.0)
out["phone_slider_enters_slots_from_end_clash_mm3"] = ov(plate, sl_.translate([40.0, 0, 0]))
out["phone_slider_lifted_pawl_release_clash_mm3"] = ov(plate, (sl_ ^ M.cube([400, 30, 10], center=True).translate([0, r.RACK_Y, r.ZF + 2])).translate([0, 0, 1.2]))
out["phone_plate_on_bar_saddle_clash_mm3"] = ov(d1.bar_saddle(), plate)

# ---- bottle
cup = r.bottle_cup()
out["bottle_74_in_cup_clash_mm3_ridges_only"] = ov(cup, r.bottle(74.0))
out["bottle_76_in_cup_clash_mm3"] = ov(cup, r.bottle(76.0))
out["bottle_cup_keys_clash_mm3_designed_clamp"] = ov(cup, keys)
out["bottle_cup_air_over_key_heads_mm"] = round((r.ZF + r.CUP_ID / 2 + r.CUP_WALL + r.CUP_LIFT) - math.sqrt((r.CUP_ID / 2 + r.CUP_WALL) ** 2 - 21.0 ** 2) - 17.3, 1)
out["bottle_cup_on_frame_saddle_clash_mm3"] = ov(d2.frame_saddle(), cup)
out["bottle_cup_on_home_dock_clash_mm3"] = ov(d2.home_dock(), cup)
m5 = M.batch_boolean([M.cylinder(30, 2.5, -1.0, 32).translate([0, sy * r.M5_SPACING / 2, 0]) for sy in (-1, 1)], lib.m3d.OpType.Add)
out["bottle_m5_bolts_pass_mm3"] = ov(cup, m5)

# ---- stand
st = r.stand()
out["stand_pedal_in_cradle_clash_mm3"] = ov(st, r.pedal_block())
out["stand_phone_in_cradle_clash_mm3"] = ov(st, r.phone_in_stand())
probe = M.batch_boolean([M.cylinder(12.0, 6.0, -1.0, 36).rotate([-90, 0, 0]).translate([x, -r.ST_D0 / 2 - 2, r.ST_H / 2]) for (x, y) in r.KEYS], lib.m3d.OpType.Add)
out["stand_keyways_open_through_back_mm3"] = ov(st, probe)
out["stand_fits_250"] = max(r.ST_W, r.ST_D0, r.ST_H) <= 250

json.dump(out, open(os.path.join(os.path.dirname(__file__), "..", "parts", "fit-tests-ride.json"), "w"), indent=2)
for k, v in out.items():
    print(f"{k:48s} {v}")
