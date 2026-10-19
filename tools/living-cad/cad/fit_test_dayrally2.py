"""Digital fit tests for dayrally v2: every pod size on every mount and a Grid board; lids, inserts, keys."""
import json, os, sys, math
sys.path.insert(0, os.path.dirname(__file__))
import lib, dayrally2 as d, extras as xx
from lib import M, P
import manifold3d as m3d
ov = lambda a, b: round((a ^ b).volume(), 3)
keys = [lib.turn_key().translate([x, y, 0]) for (x, y) in d.KEYS]
board = lib.board(4, 2).translate([-2 * P, -0.5 * P, 0])
mounts = {k: f() for k, f in d.MOUNTS.items()}
r = {"pods": {}, "mounts_key_insert": {}, "pocket_walls_min_mm": {}}
for size in d.SIZES:
    base = d.pod_base(size)
    lid = d.pod_lid(size, "plain")[0]
    row = {"vs_board": ov(base, board), "lid_vs_base": ov(lid, base)}
    for k, m in mounts.items():
        row[f"vs_{k}"] = ov(base, m)
    for lay in d.INSERTS[size]:
        ins = d.insert(size, lay)[0]
        row[f"insert_{lay}"] = {"vs_base": ov(ins, base), "vs_keys": round(sum(ov(ins, k) for k in keys), 3), "vs_lid": ov(ins, lid)}
    r["pods"][size] = row
# keys go into every mount cleanly and are captured once turned
for k, m in mounts.items():
    open_k = lib.turn_key().rotate([0, 0, 90]).translate([d.KEYS[0][0], 0, 0])
    r["mounts_key_insert"][k] = {"insert_overlap": max(ov(open_k.translate([0, 0, dz]), m) for dz in (8, 4, 2, 0.5, 0)),
                                 "locked_overlap": ov(keys[0], m), "captured_pull_0p5": ov(keys[0].translate([0, 0, 0.5]), m) > 1}
# pocket walls: smallest distance from any pocket to the insert's outside, per pocket layout
for size, lays in d.INSERTS.items():
    Li, Wi, _ = d._ins_dims(size)
    outline = d.stadium(Li, Wi)
    for lay in lays:
        spec = {"beach": [("circle", 32, 32, -38, 0), ("circle", 19, 19, -9, 15), ("circle", 19, 19, -9, -15), ("rect", 42, 40, 28, 0)],
                "tech": [("rect", 54, 46, -22, 0), ("circle", 40, 40, 36, 0)], "earbuds": [("rect", 52, 42, 0, 0)],
                "cards": [("rect", 88, 3.6, 0, y) for y in (-18, -9, 0, 9, 18)],
                "pens": [(s, w, h, x, y) for (s, w, h, x, y, _) in d._slots_long(size)]}.get(lay)
        if not spec:
            continue
        lo, hi = 0.0, 6.0
        cs = None
        for (s, w, h, x, y) in spec:
            c = xx.item_cs({"shape": s, "w": w, "h": h}).translate([x, y])
            cs = c if cs is None else cs + c
        for _ in range(30):          # bisection: largest offset that stays inside the outline
            mid = (lo + hi) / 2
            grown = cs.offset(mid, m3d.JoinType.Round, circular_segments=32)
            (lo, hi) = (mid, hi) if (grown - outline).area() < 1e-4 else (lo, mid)
        r["pocket_walls_min_mm"][f"{size}-{lay}"] = round(lo, 2)
# chair hook snap: opening width vs tube
R = 24.0 / 2 + 0.3
hk = d.chair_hook(); tube = lambda dd: lib.cyl_z(dd / 2, -1, 20, seg=96)
r["chair_hook"] = {"inner_d_mm": round(2 * R, 1), "opening_mm": 20.0, "overlap_22mm_tube": ov(hk, tube(22)), "overlap_24mm_tube": ov(hk, tube(24)), "overlap_25mm_tube": ov(hk, tube(25))}
print(json.dumps(r, indent=1)[:6000])
json.dump(r, open(os.path.join(os.path.dirname(__file__), "..", "parts", "fit-tests-dayrally2.json"), "w"), indent=1)
