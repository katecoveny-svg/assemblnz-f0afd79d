"""
dayrally v2 — the full go-anywhere system on the TURN key.

Everything shares one interface: a pod's floor has two TURN keyways 42 mm apart (x = ±21),
so every pod size locks onto every mount, and onto any Grid board at home.

  pods     mini · standard · tall · long
  lids     plain · name · waves · dots · check · bolt · topo · stars   (pattern/name inlaid flush in a 2nd colour)
  inserts  per size: grids, and pocket layouts for beach, tech, cards, pens, earbuds
  mounts   strap clip (42) · duo strap (25) · belt clip (50) · bar saddle (22–35) · frame saddle (25–45)
           · carabiner loop · home dock
  add-ons  bag charms (6 shapes) · zip pulls · phone stand · spoke beads · chair hook · cable winder
"""
import math
import numpy as np
import manifold3d as m3d
import lib
import dayrally as d1
import extras as xx
from lib import M, CS, P, ext_z, ext_x, ext_y, cyl_z, rrect, circ, poly, round2d, flange_key_cut, board_socket_cut, text_cs, EPS

KEYS = d1.KEYS
Z0 = lib.FL_Z0
WALL, FLOOR = d1.WALL, d1.FLOOR
LID_H, LID_TOP, LIP_H, LIP_CLR = d1.LID_H, d1.LID_TOP, d1.LIP_H, d1.LIP_CLR
INLAY = 0.6
INS_Z0 = lib.FL_Z1 + 4.8                     # insert floor clears the key heads

SIZES = {   # outer length, width, base height
    "mini": (92.0, 60.0, 26.0),
    "standard": (128.0, 72.0, 34.0),
    "tall": (128.0, 72.0, 58.0),
    "long": (176.0, 72.0, 34.0),
}
stadium = d1.stadium


def dims(size):
    L, W, H = SIZES[size]
    return L, W, H, Z0 + H


# ---------------- pods ----------------
def pod_base(size="standard"):
    L, W, H, ZT = dims(size)
    outer = ext_z(stadium(L, W), Z0, ZT)
    inner = ext_z(stadium(L - 2 * WALL, W - 2 * WALL), Z0 + FLOOR, ZT + 1)
    b = outer - inner
    for (x, y) in KEYS:
        b = b + cyl_z(14.0, Z0 + FLOOR - EPS, lib.FL_Z1, cx=x, cy=y, seg=96)
    for (x, y) in KEYS:
        b = b - flange_key_cut(x, y)
    b = b - ext_y(rrect(26, 20, 6, 0, ZT + 4), W / 2 - 4, W / 2 + 2)          # thumb notch
    lug = ext_z(rrect(14, 16, 4, L / 2 + 4, 0), Z0, Z0 + 12)
    lug = lug - ext_y(circ(2.6, L / 2 + 6.5, Z0 + 6, seg=48), -10, 10)
    b = b + (lug - ext_z(stadium(L - 2 * WALL, W - 2 * WALL), Z0 + FLOOR, ZT + 1))
    return b


# ---------------- lid patterns (2D, centred on the lid top) ----------------
def _area(L, W, inset=7.0):
    return stadium(L - 2 * inset, W - 2 * inset)


def _band(xs, ys, t):
    """A band of thickness t along the polyline (xs, ys)."""
    up = [(x, y + t / 2) for x, y in zip(xs, ys)]
    dn = [(x, y - t / 2) for x, y in zip(xs[::-1], ys[::-1])]
    return poly(up + dn)


def _star(cx, cy, r, rot=0.0, k=0.45):
    pts = []
    for i in range(10):
        a = math.radians(rot + 90 + i * 36)
        rr = r if i % 2 == 0 else r * k
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    return poly(pts)


def pattern_cs(style, L, W, name=None, font=None):
    A = _area(L, W)
    span = L + 20
    if style == "plain":
        return None
    if style == "name":
        if not (name and font):
            return None
        cs = text_cs(name, font, cap_height=min(20.0, W * 0.28), max_width=L - 40)
        return cs
    if style == "waves":
        xs = np.linspace(-span / 2, span / 2, 160)
        bands = []
        for k, y0 in enumerate(np.arange(-W / 2 + 6, W / 2 - 2, 11.0)):
            ys = y0 + 3.0 * np.sin(2 * np.pi * xs / 34.0 + k * 0.9)
            bands.append(_band(list(xs), list(ys), 3.6))
        cs = bands[0]
        for b in bands[1:]:
            cs = cs + b
        return cs ^ A
    if style == "dots":
        r, s = 3.4, 11.0
        Ai = _area(L, W, 7.0 + r + 0.8)
        out = None
        for j, y in enumerate(np.arange(-W / 2, W / 2 + s, s * 0.866)):
            for x in np.arange(-L / 2 + (s / 2 if j % 2 else 0), L / 2 + s, s):
                if (Ai ^ circ(0.05, x, y, seg=8)).area() > 0:
                    c = circ(r, x, y, seg=40)
                    out = c if out is None else out + c
        return out
    if style == "check":
        q = 9.0
        Ai = _area(L, W, 7.0)
        out = None
        for i, x in enumerate(np.arange(-L / 2, L / 2 + q, q)):
            for j, y in enumerate(np.arange(-W / 2, W / 2 + q, q)):
                if (i + j) % 2:
                    continue
                sq = CS.square([q, q], center=True).translate([x, y])
                if abs((sq ^ Ai).area() - q * q) < 1e-3:
                    out = sq if out is None else out + sq
        # neighbouring squares meet only at corners: grow by 0.15 so the inlay is one printable body per square chain
        return out.offset(0.15, m3d.JoinType.Miter).simplify(0.01) ^ A
    if style == "bolt":
        xs, ys, n = [], [], 7
        for i in range(n + 1):
            xs.append(-span / 2 + i * span / n)
            ys.append((W * 0.16) * (1 if i % 2 else -1))
        return _band(xs, ys, W * 0.2) ^ A
    if style == "topo":
        out = None
        for k in range(4):
            a, b = (L / 2 - 9) * (1 - k * 0.22), (W / 2 - 9) * (1 - k * 0.22)
            if a < 6 or b < 4:
                break
            th = np.linspace(0, 2 * np.pi, 180, endpoint=False)
            wob = 1 + 0.07 * np.sin(3 * th + k) + 0.04 * np.sin(5 * th + 2 * k)
            outer = poly([(a * np.cos(t) * w + k * 3.0, b * np.sin(t) * w) for t, w in zip(th, wob)])
            ring = outer - outer.offset(-1.7, m3d.JoinType.Round, circular_segments=24)
            out = ring if out is None else out + ring
        return out ^ A
    if style == "stars":
        rng = np.random.default_rng(7)
        Ai = _area(L, W, 8.0)
        out, placed = None, []
        tries = 0
        while tries < 600 and len(placed) < int(L * W / 650):
            tries += 1
            x, y = rng.uniform(-L / 2, L / 2), rng.uniform(-W / 2, W / 2)
            r = rng.uniform(4.5, 8.0)
            if any(math.hypot(x - px, y - py) < r + pr + 2.5 for px, py, pr in placed):
                continue
            st = _star(x, y, r, rot=rng.uniform(0, 72))
            if abs((st ^ Ai).area() - st.area()) > 1e-3:
                continue
            placed.append((x, y, r))
            out = st if out is None else out + st
        return out
    raise ValueError(style)


LID_STYLES = ["plain", "name", "waves", "dots", "check", "bolt", "topo", "stars"]


def pod_lid(size="standard", style="plain", name=None, font=None):
    """Prints top-down. Pattern or name is inlaid flush (first layers, second colour)."""
    L, W, H, ZT = dims(size)
    z0, z1 = ZT, ZT + LID_H
    outer = ext_z(stadium(L, W), z0, z1)
    lid = outer - ext_z(stadium(L - 2 * WALL, W - 2 * WALL), z0 - 1, z1 - LID_TOP)
    a_L, a_W = L - 2 * WALL, W - 2 * WALL
    b_L, b_W = a_L - 2 * LIP_CLR, a_W - 2 * LIP_CLR
    lip = ext_z(stadium(b_L, b_W) - stadium(b_L - 3.2, b_W - 3.2), z0 - LIP_H, z0 + 0.2)
    web = M.batch_hull([ext_z(stadium(a_L + 0.6, a_W + 0.6, seg=91), z0 + 3.6, z0 + 3.62),
                        ext_z(stadium(b_L - 0.4, b_W - 0.4, seg=91), z0 - 0.1, z0 - 0.08)])
    web = web - ext_z(stadium(b_L - 1.6, b_W - 1.6, seg=91), z0 - 1, z0 + 5)
    lid = lid + lip + web
    cs = pattern_cs(style, L, W, name, font)
    inlay = None
    if cs is not None and cs.area() > 1:
        inlay = ext_z(cs, z1 - INLAY, z1)
        lid = lid - ext_z(cs, z1 - INLAY, z1 + 1)
    return lid, inlay


# ---------------- inserts ----------------
def _ins_dims(size):
    L, W, H, ZT = dims(size)
    return L - 2 * WALL - 1.0, W - 2 * WALL - 1.0, ZT - LIP_H - 0.6 - INS_Z0      # max height clears the lid lip


def insert_grid(size, cols, rows, h=None):
    Li, Wi, hmax = _ins_dims(size)
    h = min(h or 14.0, hmax)
    z0 = INS_Z0
    t = ext_z(stadium(Li, Wi), z0, z0 + h) - ext_z(stadium(Li - 3.2, Wi - 3.2), z0 + 1.2, z0 + h + 1)
    clip = ext_z(stadium(Li - 1.6, Wi - 1.6), z0, z0 + h)
    iw, ih = Li - 3.2, Wi - 3.2
    for i in range(1, cols):
        t = t + (ext_z(rrect(1.2, Wi - 2, 0.2, -iw / 2 + i * iw / cols, 0), z0 + 1.2 - EPS, z0 + h - 2) ^ clip)
    for j in range(1, rows):
        t = t + (ext_z(rrect(Li - 2, 1.2, 0.2, 0, -ih / 2 + j * ih / rows).rotate(0.37), z0 + 1.2 - 0.013, z0 + h - 2.07) ^ clip)
    return t


def insert_pockets(size, pockets, h=None, scoops=True):
    """Solid tray with shaped pockets. pockets: (shape, w, h, x, y, depth)."""
    Li, Wi, hmax = _ins_dims(size)
    h = min(h or 14.0, hmax)
    z0, z1 = INS_Z0, INS_Z0 + min(h or 14.0, hmax)
    body = ext_z(stadium(Li, Wi), z0, z1)
    # hollow the underside to save plastic (0.0 to 2 mm from walls) — keep a 1.2 mm floor under each pocket
    cuts = []
    for (shape, w, hh, x, y, depth) in pockets:
        cs = xx.item_cs({"shape": shape, "w": w, "h": hh}).translate([x, y])
        dep = min(depth, z1 - z0 - 1.2)
        cuts.append(ext_z(cs, z1 - dep, z1 + 1))
        if scoops and shape != "slot":
            x0, y0, x1, y1 = cs.bounds()
            cuts.append(cyl_z(6.5, z1 - min(dep - 1.0, 8.0), z1 + 1, seg=53).rotate([0, 0, 2.3]).translate([x1 - 2.0 + 0.31, y, 0]))
    return body - M.batch_boolean(cuts, m3d.OpType.Add)


def _slots_long(size, n=4, w=11.0, gap=4.0, depth=11.0):
    Li, Wi, _ = _ins_dims(size)
    R = Wi / 2 - 2.2
    xc = Li / 2 - Wi / 2
    out = []
    total = n * w + (n - 1) * gap
    for k in range(n):
        y = -total / 2 + w / 2 + k * (w + gap)
        reach = math.sqrt(max(0.0, R ** 2 - (abs(y) + w / 2) ** 2))
        length = 2 * (xc + reach) - 3.0
        out.append(("stadium", length, w, 0.0, y, depth))
    return out


def insert(size, layout):
    """Named layouts. Returns (manifold, label)."""
    if layout == "split":
        return insert_grid(size, 2, 1), "Split (2)"
    if layout == "everyday":
        return insert_grid(size, 3, 1), "Everyday (3)"
    if layout == "quad":
        return insert_grid(size, 2, 2), "Quad (4)"
    if layout == "tackle":
        c = {"mini": 2, "standard": 3, "tall": 3, "long": 4}[size]
        return insert_grid(size, c, 2), f"Tackle ({c * 2})"
    if layout == "tackle-deep":
        return insert_grid(size, 3, 2, h=24.0), "Deep tackle (6)"
    if layout == "deep-two":
        return insert_grid(size, 2, 1, h=40.0), "Deep two (bottles, sunscreen)"
    if layout == "beach":
        return insert_pockets(size, [("circle", 32, 32, -38, 0, 12), ("circle", 19, 19, -9, 15, 11), ("circle", 19, 19, -9, -15, 11),
                                     ("rect", 42, 40, 28, 0, 11)]), "Beach (stick, 2 balms, cards & keys)"
    if layout == "tech":
        return insert_pockets(size, [("rect", 54, 46, -22, 0, 12), ("circle", 40, 40, 36, 0, 12)]), "Tech (earbuds, cable)"
    if layout == "earbuds":
        return insert_pockets(size, [("rect", 52, 42, 0, 0, 9)]), "Earbuds"
    if layout == "cards":
        Li, Wi, hmax = _ins_dims(size)
        pk = [("rect", 88, 3.6, 0, y, 60) for y in (-18, -9, 0, 9, 18)]
        return insert_pockets(size, pk, h=40.0, scoops=False), "Cards (5 standing slots)"
    if layout == "pens":
        return insert_pockets(size, _slots_long(size), h=14.0, scoops=False), "Pens and pencils (4)"
    raise ValueError(layout)


INSERTS = {
    "mini": ["split", "quad", "earbuds"],
    "standard": ["everyday", "tackle", "beach", "tech", "split"],
    "tall": ["deep-two", "tackle-deep", "cards"],
    "long": ["pens", "tackle", "everyday"],
}


# ---------------- mounts ----------------
def _socket_body(Lx, Wy, depth, r=8.0):
    body = ext_z(rrect(Lx, Wy, r), -depth, lib.PLATE_Z1 - 0.8)
    body = M.batch_hull([body, ext_z(rrect(Lx - 1.6, Wy - 1.6, r - 0.8), lib.PLATE_Z1 - EPS, lib.PLATE_Z1)])
    for (x, y) in KEYS:
        body = body - board_socket_cut(x, y)
    return body


def strap_clip(strap_w=42.0, strap_t=4.5, Wy=36.0):
    depth = max(12.0, strap_t + 7.5)
    body = _socket_body(70.0, Wy, depth)
    tunnel = ext_y(rrect(strap_w, strap_t, 1.5, 0, -depth + 2.4 + strap_t / 2), -Wy, Wy)
    return body - tunnel


def duo_strap():
    return strap_clip(26.0, 3.6, Wy=32.0)


def belt_clip():
    return strap_clip(52.0, 5.2, Wy=40.0)


def frame_saddle():
    """For 25–45 mm tubes: scooter stems, seat posts, top tubes. Rubber strap or zip ties."""
    Lx, Wy, depth = 80.0, 34.0, 24.0
    body = _socket_body(Lx, Wy, depth)
    half = math.radians(60)
    gd = 16.0
    v = poly([(-gd * math.tan(half), -depth - 0.01), (gd * math.tan(half), -depth - 0.01), (0, -depth + gd)])
    body = body - ext_y(v, -Wy, Wy)
    for y in (-9.0, 9.0):
        body = body - ext_x(rrect(3.4, 7.0, 1.0, -14.0, y), -Lx, Lx)
    return body


def bar_saddle():
    return d1.bar_saddle()


def carabiner_loop():
    """Flat mount with a loop at one end for a bought carabiner. Bag use only, not for climbing."""
    Lx, Wy, depth = 70.0, 34.0, 8.0
    body = _socket_body(Lx, Wy, depth)
    tab = ext_z(rrect(30.0, 24.0, 10.0, Lx / 2 + 9.0, 0) - rrect(14.0, 11.0, 5.0, Lx / 2 + 14.0, 0), -depth, -depth + 6.0)
    return body + tab


def home_dock():
    """Desk dock: a heavier base the pod locks onto at home. Four recesses for 10 mm rubber feet."""
    Lx, Wy, depth = 150.0, 96.0, 14.0
    body = _socket_body(Lx, Wy, depth, r=14.0)
    for sx in (-1, 1):
        for sy in (-1, 1):
            body = body - cyl_z(5.3, -depth - 1, -depth + 1.0, cx=sx * (Lx / 2 - 14), cy=sy * (Wy / 2 - 14), seg=48)
    return body


MOUNTS = {
    "strap-clip": strap_clip, "duo-strap": duo_strap, "belt-clip": belt_clip,
    "bar-saddle": bar_saddle, "frame-saddle": frame_saddle, "carabiner-loop": carabiner_loop, "home-dock": home_dock,
}


# ---------------- add-ons ----------------
def _outline(shape, s=46.0):
    if shape == "star":
        st = _star(0, 0, s / 2, k=0.5)
        return st.offset(-2.0, m3d.JoinType.Round, circular_segments=24).offset(2.0, m3d.JoinType.Round, circular_segments=24)
    if shape == "heart":
        th = np.linspace(0, 2 * np.pi, 200, endpoint=False)
        x = 16 * np.sin(th) ** 3
        y = 13 * np.cos(th) - 5 * np.cos(2 * th) - 2 * np.cos(3 * th) - np.cos(4 * th)
        k = s / 34.0
        return poly([(a * k, b * k + 2) for a, b in zip(x, y)])
    if shape == "bolt":
        pts = [(4, 24), (-12, -2), (-1, -2), (-6, -24), (13, 4), (2, 4), (9, 24)]
        k = s / 48.0
        return round2d(poly([(a * k, b * k) for a, b in pts]), r_convex=1.2, r_concave=0.6)
    if shape == "flower":
        c = circ(s * 0.16, seg=48)
        for i in range(6):
            a = i * math.pi / 3
            c = c + circ(s * 0.17, s * 0.28 * math.cos(a), s * 0.28 * math.sin(a), seg=48)
        return c
    if shape == "fish":
        th = np.linspace(0, 2 * np.pi, 120, endpoint=False)
        body = poly([(s * 0.32 * np.cos(t) + 4, s * 0.2 * np.sin(t)) for t in th])
        tail = poly([(-s * 0.18, 0), (-s * 0.44, s * 0.2), (-s * 0.4, 0), (-s * 0.44, -s * 0.2)])
        return round2d(body + tail, r_convex=0.8, r_concave=1.5)
    if shape == "wave":
        th = np.linspace(0, 2 * np.pi, 200, endpoint=False)
        r = s / 2 * (0.82 + 0.1 * np.sin(5 * th))
        return poly([(rr * np.cos(t), rr * np.sin(t)) for rr, t in zip(r, th)])
    raise ValueError(shape)


CHARMS = ["star", "heart", "bolt", "flower", "fish", "wave"]
HOLE = {"star": (0, 17), "heart": (0, 12), "bolt": (3, 16), "flower": (0, 12.9), "fish": (16, 0), "wave": (0, 15)}


def bag_charm(shape="star", initials=None, font=None, t=4.0):
    cs = _outline(shape)
    hx, hy = HOLE[shape]
    ring = circ(4.6, hx, hy, seg=48)
    cs = cs + ring
    body = ext_z(cs - circ(2.3, hx, hy, seg=40), 0, t)
    inlay = None
    if initials and font:
        room = cs.offset(-1.5, m3d.JoinType.Round, circular_segments=16)
        for cap in ((9.0, 7.5, 6.5) if len(initials) <= 2 else (7.0, 6.0)):     # largest initials that fit whole
            tc = text_cs(initials, font, cap_height=cap, max_width=24).scale([-1, 1]).translate([0, -2 if shape != "fish" else 0])
            clipped = tc ^ room
            if clipped.area() > 0.97 * tc.area():
                inlay = ext_z(clipped, 0, INLAY)
                body = body - ext_z(clipped, -1, INLAY)
                break
    return body, inlay


def zip_pull(initials="M", font=None, L=34.0, W=13.0, t=3.2):
    cs = rrect(L, W, W / 2 - 0.01) - rrect(8.0, 4.0, 1.9, -L / 2 + 7.5, 0)
    body = ext_z(cs, 0, t)
    inlay = None
    if font and initials:
        tc = text_cs(initials, font, cap_height=7.0, max_width=L - 18).scale([-1, 1]).translate([4.0, 0])
        inlay = ext_z(tc, 0, INLAY)
        body = body - ext_z(tc, -1, INLAY)
    return body, inlay


def phone_stand(width=70.0):
    """Side profile extruded across the width. Phone leans at about 65 degrees. Prints on its side."""
    pts = [(0, 0), (84, 0), (84, 5), (60, 5), (34, 60), (29, 58), (52, 5), (20, 5), (20, 16), (13, 16), (13, 5), (0, 5)]
    prof = round2d(poly(pts), r_convex=1.5, r_concave=1.5)
    body = ext_x(prof.rotate(0), -width / 2, width / 2)
    # cable notch through the front lip
    body = body - M.cube([16.0, 30.0, 30.0], center=True).translate([0, 14.0, 10.0])
    return body


def spoke_bead(L=16.0, D=12.0, spoke=2.1):
    b = cyl_z(D / 2, 0, L, seg=48) - cyl_z(spoke / 2 + 0.15, -1, L + 1, seg=24)
    b = b - M.cube([spoke * 0.8, D, L + 2], center=True).translate([0, D / 2, L / 2])       # snap slot
    return b


def chair_hook(tube=24.0, width=14.0, opening=20.0):
    """Snaps onto 22–25 mm beach-chair and railing tubes; J hook for a towel or bag. Opening ~83% of the tube."""
    R = tube / 2 + 0.3
    t = 3.6
    ring = circ(R + t, seg=96) - circ(R, seg=96)
    half = math.asin(min(0.95, (opening / 2) / R))                                # chord at the inner radius = opening
    far = (R + t + 3) / math.cos(half)                                         # wedge reaches past the outside of the ring
    gap = poly([(0, 0), (far * math.cos(half), -far * math.sin(half)), (far * math.cos(half), far * math.sin(half))])
    c = ring - gap.rotate(90)
    hook = poly([(-t / 2, -R - t + 0.5), (t / 2, -R - t + 0.5), (t / 2, -R - 34), (-t / 2, -R - 34)])
    jx = rrect(22, t, t / 2 - 0.01, 9.2, -R - 34 + t / 2)
    up = rrect(t, 14, t / 2 - 0.01, 18.4, -R - 34 + 7)
    prof = round2d(c + hook + jx + up, r_convex=0.6, r_concave=1.2)
    return ext_z(prof, 0, width)


def cable_winder(L=64.0, W=26.0, t=3.0):
    cs = poly([(-L / 2, -W / 2), (-L / 2 + 10, -W / 2), (-7, -5), (7, -5), (L / 2 - 10, -W / 2), (L / 2, -W / 2),
               (L / 2, W / 2), (L / 2 - 10, W / 2), (7, 5), (-7, 5), (-L / 2 + 10, W / 2), (-L / 2, W / 2)])
    cs = round2d(cs, r_convex=2.0, r_concave=1.5)
    cs = cs - rrect(9, 2.4, 1.0, -L / 2 + 6, 0) - rrect(9, 2.4, 1.0, L / 2 - 6, 0)
    return ext_z(cs, 0, t)
