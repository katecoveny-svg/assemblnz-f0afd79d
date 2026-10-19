"""
assembl living v0.2 extras:
  - cut-out trays: a pocket shaped for each thing you own
  - renter mode: over-door hanger, wardrobe-rail hanger, strip-ready board back
  - part codes: a short reorder code debossed on a hidden face
"""
import math
import numpy as np
import manifold3d as m3d
import lib
from lib import M, CS, P, ext_z, ext_x, cyl_z, rrect, circ, poly, round2d, finish_accessory, flange, text_cs, EPS


# ---------------- cut-out trays ----------------
def item_cs(it):
    """it: dict(shape=circle|rect|stadium|polygon, w, h (mm), points=[(x,y)...] for polygon), centred on origin."""
    s = it["shape"]
    if s == "circle":
        return circ(it["w"] / 2, seg=96)
    if s == "rect":
        return rrect(it["w"], it["h"], min(3.0, it["w"] / 4, it["h"] / 4))
    if s == "stadium":
        return rrect(it["w"], it["h"], min(it["w"], it["h"]) / 2 - 0.01)
    if s == "polygon":
        return poly([tuple(p) for p in it["points"]])
    raise ValueError(s)


def pack(items, W, margin=10.0, gap=8.0, clearance=1.2):
    """Shelf packing, tallest first. Returns placements and the tray depth (front-back) it needs."""
    sized = []
    for i, it in enumerate(items):
        cs = item_cs(it).offset(clearance, m3d.JoinType.Round, circular_segments=48).simplify(0.02)
        x0, y0, x1, y1 = cs.bounds()
        rot = False
        if (x1 - x0) > W - 2 * margin and (y1 - y0) <= W - 2 * margin:
            cs = cs.rotate(90); x0, y0, x1, y1 = cs.bounds(); rot = True
        sized.append((i, cs, x1 - x0, y1 - y0, rot))
    sized.sort(key=lambda t: -t[3])
    x, y, row_h, places = margin, margin, 0.0, []
    for (i, cs, w, h, rot) in sized:
        if x + w > W - margin + 1e-6:
            x, y, row_h = margin, y + row_h + gap, 0.0
        x0, y0, _, _ = cs.bounds()
        places.append({"i": i, "cs": cs.translate([x - x0, y - y0]), "rot": rot, "x": x + w / 2, "y": y + h / 2})
        x += w + gap
        row_h = max(row_h, h)
    return places, y + row_h + margin


def cutout_tray(items, W=240.0, H=24.0, floor=2.0, clearance=1.2, max_D=245.0):
    """A block tray with a pocket for each item (depth per item) and a finger scoop on each pocket."""
    places, D = pack(items, W, clearance=clearance)
    D = max(60.0, D)
    if D > max_D:
        raise ValueError(f"needs {D:.0f} mm front-to-back; split into two trays")
    t = ext_z(rrect(W, D, 6, W / 2, D / 2), 0, H)
    cuts = []
    for pl in places:
        it = items[pl["i"]]
        depth = min(it.get("depth", 15.0), H - floor)
        cuts.append(ext_z(pl["cs"], H - depth, H + 1))
        # finger scoop across the pocket's long side
        r = 9.0
        x0, y0, x1, y1 = pl["cs"].bounds()
        cuts.append(cyl_z(r, H - min(depth - 1.5, 12.0), H + 1, seg=53).rotate([0, 0, 2.3]).translate([(x0 + x1) / 2 + 0.37, y1 - 1.5, 0]))
    t = t - M.batch_boolean(cuts, m3d.OpType.Add)
    return t, D, places


# ---------------- renter mode ----------------
def over_door_hanger(door_t=35.0, width=30.0, bar=3.2, drop=46.0):
    """Hooks a Grid board over the top of a door. Key in the board's top row. Needs a 4 mm gap above the door."""
    key = (0.0, 0.0)
    top = 21.0 + 4.0                      # board top edge (21 mm above the top row) + 4 mm
    fl = flange(-width / 2, width / 2, -16, top + bar, r=5)
    # profile in (z, y): bar over the board and the door, then a leg down the back of the door
    zb = -door_t - 0.6
    prof = (CS.square([lib.FL_Z1 - zb + bar, bar], center=False).translate([zb - bar, top]) +
            CS.square([bar, drop], center=False).translate([zb - bar, top + bar - drop]))
    prof = round2d(prof, r_convex=1.2, r_concave=2.0)
    body = fl + ext_x(prof, -width / 2, width / 2)
    return finish_accessory(body, keys=[key])


def rail_hanger(rail_d=32.0, width=30.0):
    """Hooks a Grid board onto a wardrobe rail up to 32 mm: same shape as the door hanger, thicker bar."""
    return over_door_hanger(door_t=rail_d + 1.0, width=width, bar=4.5, drop=24.0)


def board_renter(cols=4, rows=4, code=None, font=None):
    """Board with a flat back (no lightening pockets) so removable adhesive strips have room,
    plus four shallow lanes that show where the strips go."""
    W, H = cols * P, rows * P
    base = ext_z(rrect(W, H, 6.0, W / 2, H / 2), 0, lib.PLATE_Z1 - 0.8)
    top = ext_z(rrect(W - 1.6, H - 1.6, 5.2, W / 2, H / 2), lib.PLATE_Z1 - EPS, lib.PLATE_Z1)
    b = M.batch_hull([base, top])
    cuts = []
    for i in range(cols):
        for j in range(rows):
            cuts.append(lib.board_socket_cut((i + 0.5) * P, (j + 0.5) * P))
    for i in range(1, cols, 2 if cols > 2 else 1):
        cuts.append(ext_z(rrect(20.0, H - 30, 2.0, i * P, H / 2), -1, 0.4))     # 0.4 mm strip lanes on the back
    b = b - M.batch_boolean(cuts, m3d.OpType.Add)
    if code and font:
        b = b - code_deboss(code, font, W / 2, H - 5.5)
    return b


# ---------------- part codes ----------------
ALPH = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def check_char(s):
    return ALPH[sum((i + 1) * ord(c) for i, c in enumerate(s)) % len(ALPH)]


def part_code(sku_short, colour_short, extra=""):
    body = f"{sku_short}-{colour_short}{('-' + extra) if extra else ''}"
    return f"AL-{body}-{check_char(body)}"


def code_deboss(code, font, x, y, depth=0.4, cap=3.2):
    """Deboss a code into the back face (z = 0) of a part, mirrored so it reads from behind."""
    cs = text_cs(code, font, cap_height=cap).scale([-1, 1]).translate([x, y])
    return ext_z(cs, -1, depth)
