"""Digital fit checks for the pocket range. Run: python3 cad/fit_test_pocket.py -> parts/fit-tests-pocket.json"""
import os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
import lib, dayrally2 as d2, dayrally_pocket as pk
from lib import M, CS, ext_z, ext_x, cyl_z, rrect, circ
ov = lambda a, b: round((a ^ b).volume(), 3)
out = {}
# ---- the wide pod: lids fit, inserts fit, keys and mounts take it ----
base = d2.pod_base("wide")
L, W, H, ZT = d2.dims("wide")
inner = ext_z(d2.stadium(L - 2 * d2.WALL, W - 2 * d2.WALL), d2.Z0 + d2.FLOOR, ZT + 20)
for style in ("plain", "name"):
    lid, _ = d2.pod_lid("wide", style, "MILA", pk.FONT)
    out[f"wide_lid_{style}_vs_base_mm3"] = ov(lid, base)
card_lid, _ = pk.card_lid("wide", "name", "MILA", pk.FONT)
out["wide_card_lid_vs_base_mm3"] = ov(card_lid, base)
for lay in ("emergency", "makeup", "open"):
    ins, _ = pk.wide_insert(lay)
    out[f"wide_insert_{lay}_outside_cavity_mm3"] = round((ins - inner).volume(), 3)
    out[f"wide_insert_{lay}_vs_base_mm3"] = ov(ins, base)
    out[f"wide_insert_{lay}_vs_card_lid_mm3"] = ov(ins, card_lid)
out["wide_base_vs_keys_mm3"] = round(sum(ov(base, lib.turn_key().translate([x, y, 0])) for (x, y) in d2.KEYS), 3)
for k, fn in d2.MOUNTS.items():
    out[f"wide_base_vs_{k}_mm3"] = ov(base, fn())
out["wide_base_vs_board_mm3"] = ov(base, lib.board(4, 2).translate([-2 * lib.P, -0.5 * lib.P, 0]))
# ---- what goes in the pockets: a box the item's size, sat on each pocket floor, must not cut the insert ----
def item_box(shape, w, h, x, y, depth, z1, item_t):
    depth = min(depth, 25.0 - 1.2)                                                  # insert_pockets keeps a 1.2 mm floor
    cs = __import__("extras").item_cs({"shape": shape, "w": w - 0.8, "h": h - 0.8}).translate([x, y])
    return ext_z(cs, z1 - depth + 0.05, z1 - depth + item_t)
emerg, _ = pk.wide_insert("emergency")
z1 = d2.INS_Z0 + 25.0
items = {"earbuds": ("rect", 62, 47, -54, 25, 24, 21.7), "power_bank": ("rect", 78, 40, 20, 25, 24, 25.0), "tampon_1": ("stadium", 88, 19, -41, -12, 12, 17.0),
         "tampon_2": ("stadium", 88, 19, -41, -34, 12, 17.0), "sanitiser": ("stadium", 80, 27, 44, -14, 16, 25.0), "patches": ("rect", 60, 16, 44, -38, 10, 4.0)}
for name, (shape, w, h, x, y, depth, t) in items.items():
    out[f"emergency_{name}_clash_mm3"] = ov(item_box(shape, w, h, x, y, depth, z1, t), emerg)
out["emergency_items_above_insert_top_mm"] = {n: round(max(0.0, t - min(depth, 23.8)), 1) for n, (shape, w, h, x, y, depth, t) in items.items()}
out["lid_headroom_over_insert_top_mm"] = round((ZT - z1) + d2.LID_H - d2.LID_TOP, 1)
# ---- the card in the card lid: slides between the rails, clears the insert ----
cw, ch, ct = pk.CARD
z_in = ZT + d2.LID_H - d2.LID_TOP
card = ext_z(rrect(cw, ch, 3.2), z_in - ct - 0.1, z_in - 0.1)
out["card_vs_wide_card_lid_mm3"] = ov(card, card_lid)
std_card_lid, _ = pk.card_lid("standard", "name", "MILA", pk.FONT)
Ls, Ws, Hs, ZTs = d2.dims("standard")
zs = ZTs + d2.LID_H - d2.LID_TOP
out["card_vs_standard_card_lid_mm3"] = ov(ext_z(rrect(cw, ch, 3.2), zs - ct - 0.1, zs - 0.1), std_card_lid)
out["standard_card_lid_vs_base_mm3"] = ov(std_card_lid, d2.pod_base("standard"))
mini_ins, _ = pk.std_insert("emergency")
out["standard_emergency_insert_vs_card_lid_mm3"] = ov(mini_ins, std_card_lid)
out["standard_emergency_insert_outside_cavity_mm3"] = round((mini_ins - ext_z(d2.stadium(Ls - 2 * d2.WALL, Ws - 2 * d2.WALL), d2.Z0 + d2.FLOOR, ZTs + 20)).volume(), 3)
# ---- lip tube in the sleeve, eraser in its sleeve, refill and plug in the pen, pencil in the topper ----
sleeve, _ = pk.lip_sleeve(name="MILA", font=pk.FONT)
tube = ext_z(rrect(118, 24, 4, 1.6 + 0.5 + 59, 0), 1.6 + 0.4, 1.6 + 0.4 + 23)      # the tube, pushed to the closed end
out["lip_tube_vs_sleeve_mm3"] = ov(tube, sleeve)
er, _ = pk.eraser_sleeve(name="MILA", font=pk.FONT)
block = ext_z(rrect(65, 23, 1.0, 1.6 + 32.5 + 1.0, 0), 1.6 + 0.3, 1.6 + 0.3 + 13)
out["eraser_vs_sleeve_mm3"] = ov(block, er)
pen, _ = pk.pen_body(name="MILA", font=pk.FONT)
Lr, Dr, Dt = pk.REFILL
refill = ext_x(circ(Dr / 2, seg=48), 4.0, 4.0 + Lr) + ext_x(circ(Dt / 2, seg=32), 4.0 + Lr, 4.0 + Lr + 6)
out["refill_vs_pen_mm3"] = ov(refill, pen)
plug = pk.pen_plug()
out["plug_spigot_interference_mm3"] = ov(plug.rotate([0, 0, 180]), pen)            # spigot into the bore from the back; the ribs are meant to bite: small positive
top = pk.pencil_topper("star")
pencil = cyl_z(7.0 / 2, -20, 13.5, seg=6)                                          # hex, 7.0 across flats-ish
out["pencil_vs_topper_mm3"] = ov(pencil, top)
out["pencil_corners_bite_mm3"] = ov(cyl_z(7.9 / 2, -20, 13.5, seg=6), top)
# ---- friend set: the halves do not overlap at the designed clearance ----
(l, _), (r, _) = pk.friend_set(("M", "K"), pk.FONT)
out["friend_halves_overlap_mm3"] = ov(l, r)
out["friend_halves_gap_mm"] = 0.35
# ---- the id code ----
cs, n = pk.qr_cs()
out["qr_modules"] = n
out["qr_dark_area_mm2"] = round(cs.area(), 1)
json.dump(out, open(os.path.join(os.path.dirname(__file__), "..", "parts", "fit-tests-pocket.json"), "w"), indent=2)
for k, v in out.items():
    print(f"{k:48s} {v}")
