"""Digital fit checks for the ruler parts. Run: python3 cad/fit_test_ruler.py"""
import os, sys, json, math
sys.path.insert(0, os.path.dirname(__file__))
import lib, dayrally2 as d2, dayrally_ruler as ru
from lib import M, CS, ext_z
ov = lambda a, b: round((a ^ b).volume(), 3)
out = {}
L, W, H, ZT = d2.dims("long")
fish = ru.fish_base("long")
plain = d2.pod_base("long")
# the marks only add material on the outside of the -y wall: nothing inside, nothing on the rim, nothing on the +y side
out["fish_base_adds_mm3"] = round(fish.volume() - plain.volume(), 1)
out["fish_base_removes_mm3"] = ov(plain - fish, plain)
inside = ext_z(d2.stadium(L - 2 * d2.WALL, W - 2 * d2.WALL), d2.Z0 + d2.FLOOR, ZT + 1)
out["marks_inside_cavity_mm3"] = ov(fish - plain, inside)
out["marks_above_rim_mm3"] = round((fish - plain).trim_by_plane([0, 0, 1], ZT - 0.01).volume(), 3)
out["marks_on_plus_y_side_mm3"] = round((fish - plain).trim_by_plane([0, 1, 0], 0.0).volume(), 3)
x0, y0, z0, x1, y1, z1 = fish.bounding_box()
out["marks_stand_proud_mm"] = round(-W / 2 - y0, 2)
# the lid still fits the marked base, every mount and the board still take it, the keys still go in
lid_plain = d2.pod_lid("long", "plain")[0]
lid_ruler, inlay = d2.pod_lid("long", "ruler")
out["ruler_lid_vs_fish_base"] = ov(lid_ruler, fish)
out["plain_lid_vs_fish_base"] = ov(lid_plain, fish)
out["ruler_inlay_vs_lid"] = ov(inlay, lid_ruler)
out["ruler_inlay_bodies"] = len(inlay.decompose())
out["ruler_inlay_mm3"] = round(inlay.volume(), 1)
for k, fn in d2.MOUNTS.items():
    out[f"fish_base_vs_{k}"] = ov(fish, fn())
out["fish_base_vs_board"] = ov(fish, lib.board(4, 2).translate([-2 * lib.P, -0.5 * lib.P, 0]))
out["fish_base_vs_keys"] = round(sum(ov(fish, lib.turn_key().translate([x, y, 0])) for (x, y) in d2.KEYS), 3)
# the datum: lid and base end to end; the lid's far apex and the base's near apex meet at one x
lx0, _, _, lx1, _, _ = lid_ruler.bounding_box()
out["lid_length_mm"] = round(lx1 - lx0, 3)
out["scale_total_cm"] = round((lx1 - lx0) * 2 / 10, 2)
out["sideways_slop_error_mm"] = {str(d): round(W - math.sqrt(W ** 2 - d ** 2), 2) for d in (5, 10, 15)}
# ruler lids for every size: inlay inside the lid top, one body per tick and number, nothing off the edge
for size in d2.SIZES:
    lid, inl = d2.pod_lid(size, "ruler")
    Ls, Ws, Hs, ZTs = d2.dims(size)
    top = ext_z(d2.stadium(Ls, Ws), ZTs + d2.LID_H - d2.INLAY - 0.01, ZTs + d2.LID_H + 0.01)
    out[f"ruler_lid_{size}"] = {"inlay_mm3": round(inl.volume(), 1), "inlay_outside_top_mm3": round((inl - top).volume(), 3), "bodies": len(inl.decompose()),
                                "scale_cm": round(Ls / 10, 1)}
# the 15 cm ruler in the long pod's pens insert: one of the two middle slots, 157 mm long; and under the lid
ins = d2.insert("long", "pens")[0]
r150 = ru.ruler_150()
slots = d2._slots_long("long")
mid = slots[1]                       # (shape, length, width, x, y, depth)
seat = r150.translate([mid[3], mid[4], d2.INS_Z0 + 14.0 - mid[5]])
out["ruler_150_in_middle_slot_clash_mm3"] = ov(seat, ins)
out["ruler_150_in_outer_slot_clash_mm3"] = ov(r150.translate([slots[0][3], slots[0][4], d2.INS_Z0 + 14.0 - slots[0][5]]), ins)
out["ruler_150_under_lid_clash_mm3"] = ov(seat, lid_plain)
out["ruler_150_slot_lengths_mm"] = [round(s[1], 1) for s in slots]
json.dump(out, open(os.path.join(os.path.dirname(__file__), "..", "parts", "fit-tests-ruler.json"), "w"), indent=2)
for k, v in out.items():
    print(f"{k:40s} {v}")
