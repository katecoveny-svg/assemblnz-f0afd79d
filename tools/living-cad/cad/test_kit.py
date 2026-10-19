"""assembl living test-print kit: one small print run that answers the fit questions
before anything is sold. Writes parts/test-kit/*.stl and parts/test-kit/kit-report.json.

Run: python3 cad/test_kit.py
"""
import json, os, shutil, sys
sys.path.insert(0, os.path.dirname(__file__))
import manifold3d as m3d
import lib, extras as x
from lib import M, CS, ext_z, cyl_z, rrect, circ, text_cs

HERE = os.path.dirname(__file__)
OUT = os.path.join(HERE, "..", "parts", "test-kit")
FONT = os.path.join(HERE, "..", "fonts", "InstrumentSans-SemiBold.ttf")
os.makedirs(OUT, exist_ok=True)
PRINT = {"face_down": [180, 0, 0], "as_is": [0, 0, 0], "on_side": [0, 90, 0], "on_bottom": [90, 0, 0]}
report = []


def emit(slug, name, man, how, material, qty, check):
    p = man.rotate(PRINT[how])
    x0, y0, z0, x1, y1, z1 = p.bounding_box()
    p = p.translate([-(x0 + x1) / 2, -(y0 + y1) / 2, -z0])
    tm = lib.to_trimesh(p)
    tm.export(os.path.join(OUT, f"{slug}.stl"))
    report.append({"file": f"{slug}.stl", "name": name, "material": material, "qty": qty,
                   "print_bbox_mm": [round(x1 - x0, 1), round(y1 - y0, 1), round(z1 - z0, 1)],
                   "est_grams_pla": round(lib.est_grams(man), 1), "watertight": bool(tm.is_watertight),
                   "check": check})


def deboss(text, cx, cy, top, cap=4.0, depth=0.6):
    return ext_z(text_cs(text, FONT, cap_height=cap).translate([cx, cy]), top - depth, top + 1)


# 1. a 2x2 board coupon: same keyways as the real boards, a quarter of the plastic
emit("01-board-2x2", "Board coupon 2×2", lib.board(2, 2), "face_down", "PLA Matte", 1,
     "Four keyways. Every key and the hook go into this.")

# 2. keys at three clamp settings. Notches on the grip end opposite the orientation dot: 1, 2 or 3.
def key_variant(clamp, notches):
    old = lib.CLAMP
    lib.CLAMP = clamp
    try:
        k = lib.turn_key()
    finally:
        lib.CLAMP = old
    top = k.bounding_box()[5]
    cuts = [cyl_z(0.7, top - 0.6, top + 1, cx=-6.6 + i * 1.9, seg=20).rotate([0, 0, 0.9]) for i in range(notches)]
    return k - M.batch_boolean(cuts, m3d.OpType.Add)

for clamp, n, label in [(0.00, 1, "A"), (0.10, 2, "B"), (0.20, 3, "C")]:
    emit(f"02-key-{label}-clamp-{int(clamp * 100):03d}", f"TURN key {label} (clamp {clamp:.2f} mm, {n} notch{'es' if n > 1 else ''})",
         key_variant(clamp, n), "as_is", "PETG", 2,
         f"Push in upright, turn to horizontal. Note: turns by hand? clicks? wobbles? {label} is the {['loosest', 'current design', 'tightest'][n - 1]}.")

# 3. the real hook and the over-door hanger, unchanged
emit("03-hook", "Hook", lib.hook(), "on_side", "PLA Matte", 1, "Hang a 2 kg bag from it for 24 h on the coupon; check for creep or the key turning.")
emit("04-over-door-hanger", "Over-door hanger", x.over_door_hanger(), "on_side", "PETG", 1,
     "Hook over your real door, close the door, check it still latches.")

# 5. pocket clearance coupon: NZ $2 coin (26.5 mm) and AA battery (14.5 x 50.5 mm) at four clearances
CLEAR = [0.6, 0.9, 1.2, 1.5]
H, FLOOR, MARGIN, GAP, COLW = 12.0, 2.0, 10.0, 8.0, 34.0
coin = {"shape": "circle", "w": 26.5}
aa = {"shape": "stadium", "w": 14.5, "h": 50.5}
W = 2 * MARGIN + len(CLEAR) * COLW + (len(CLEAR) - 1) * GAP
y_lab, y_aa, y_coin = MARGIN + 4, MARGIN + 12 + 50.5 / 2 + 1.5, MARGIN + 12 + 53.5 + GAP + 29.5 / 2
D = y_coin + 29.5 / 2 + MARGIN
blk = ext_z(rrect(W, D, 6, W / 2, D / 2), 0, H)
cuts = []
for i, c in enumerate(CLEAR):
    cx = MARGIN + COLW / 2 + i * (COLW + GAP)
    for it, cy, depth in [(coin, y_coin, 2.5), (aa, y_aa, 9.0)]:
        cs = x.item_cs(it).offset(c, m3d.JoinType.Round, circular_segments=48).simplify(0.02).translate([cx, cy])
        cuts.append(ext_z(cs, H - depth, H + 1))
        x0, y0, x1, y1 = cs.bounds()
        cuts.append(cyl_z(7.0, H - min(depth - 0.8, 6.0), H + 1, seg=53).rotate([0, 0, 2.3]).translate([x1 - 1.0 + 0.37, cy, 0]))
    cuts.append(deboss(f"{c:.1f}", cx, y_lab, H, cap=4.2))
blk = blk - M.batch_boolean(cuts, m3d.OpType.Add)
emit("05-pocket-clearance", f"Pocket clearance coupon ({W:.0f} × {D:.0f} mm)", blk, "as_is", "PLA Matte", 1,
     "Drop a $2 coin and an AA battery in each column. Pick the tightest column where both drop in and lift out easily: that's the clearance for cut-out trays.")

# 6. door gap gauge: steps 2-6 mm. The over-door hanger needs the 4 mm step to slide into the gap above the closed door.
steps = [2, 3, 4, 5, 6]
L, Wg = 22.0, 24.0
g = M.batch_boolean([ext_z(rrect(L + 0.02, Wg, 0.6 if i else 3, i * L + L / 2, Wg / 2), 0, float(t)) for i, t in enumerate(steps)], m3d.OpType.Add)
g = g - M.batch_boolean([deboss(str(t), i * L + L / 2, Wg / 2, float(t), cap=7.0) for i, t in enumerate(steps)], m3d.OpType.Add)
emit("06-door-gap-gauge", "Door gap gauge (2–6 mm)", g, "as_is", "PLA Matte", 1,
     "Close the door and slide the gauge into the gap above it. If the 4 step fits, the over-door hanger will too.")

json.dump(report, open(os.path.join(OUT, "kit-report.json"), "w"), indent=2, ensure_ascii=False)
tot = sum(r["est_grams_pla"] * r["qty"] for r in report)
for r in report:
    print(f'{r["file"]:34s} x{r["qty"]}  {r["print_bbox_mm"]}  {r["est_grams_pla"]:6.1f} g  watertight={r["watertight"]}')
print(f"total ≈ {tot:.0f} g")
