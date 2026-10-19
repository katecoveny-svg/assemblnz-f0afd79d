"""
dayrally — the go-anywhere line of assembl living, on the same TURN key.

The pod's floor is a TURN accessory flange: two keyways 42 mm apart. So the same pod
locks onto a bar saddle, a strap clip, or any Grid board on the wall at home.
Key goes in from inside the pod (open the lid, push, quarter turn).

Installed frame for mounts and the pod: z points from the mount toward the pod.
Mount face at z = 8 (same as a board's front face).
"""
import math
import numpy as np
import manifold3d as m3d
import lib
from lib import M, CS, P, ext_z, ext_x, ext_y, cyl_z, rrect, circ, poly, round2d, flange_key_cut, board_socket_cut, text_cs, EPS

KEYS = [(-P / 2, 0.0), (P / 2, 0.0)]          # two keys along the pod's length


def stadium(L, W, cx=0.0, cy=0.0, seg=96):
    r = W / 2
    return rrect(L, W, r - 0.01, cx, cy, seg=seg)


# ---------------- pod ----------------
POD_L, POD_W, POD_H = 128.0, 72.0, 34.0       # base outer length, width, height (z 8 -> 42)
WALL, FLOOR = 2.2, 2.4
Z0 = lib.FL_Z0                                 # 8: pod underside sits on the mount face
ZT = Z0 + POD_H                                # 42: top rim of the base
LID_H, LID_TOP, LIP_H, LIP_CLR = 11.0, 2.4, 4.0, 0.25


def pod_base():
    outer = ext_z(stadium(POD_L, POD_W), Z0, ZT)
    inner = ext_z(stadium(POD_L - 2 * WALL, POD_W - 2 * WALL), Z0 + FLOOR, ZT + 1)
    b = outer - inner
    # key pads: the floor is a full 5 mm TURN flange where the keys pass
    for (x, y) in KEYS:
        b = b + cyl_z(14.0, Z0 + FLOOR - EPS, lib.FL_Z1, cx=x, cy=y, seg=96)
    for (x, y) in KEYS:
        b = b - flange_key_cut(x, y)
    # thumb notch in one long wall so the lid lifts off
    b = b - ext_y(rrect(26, 20, 6, 0, ZT + 4), POD_W / 2 - 4, POD_W / 2 + 2).rotate([0, 0, 0])
    # lanyard lug at the +x end
    lug = ext_z(rrect(14, 16, 4, POD_L / 2 + 4, 0), Z0, Z0 + 12)
    lug = lug - ext_y(circ(2.6, POD_L / 2 + 6.5, Z0 + 6, seg=48), -10, 10).rotate([0, 0, 0])
    # (ext_y draws in (x, z) and extrudes along y)
    b = b + (lug - ext_z(stadium(POD_L - 2 * WALL, POD_W - 2 * WALL), Z0 + FLOOR, ZT + 1))
    return b


def pod_lid(name=None, font=None):
    """Lid prints top-down. The name is inlaid flush in the top (first layers, second colour)."""
    z0, z1 = ZT, ZT + LID_H
    outer = ext_z(stadium(POD_L, POD_W), z0, z1)
    hollow = ext_z(stadium(POD_L - 2 * WALL, POD_W - 2 * WALL), z0 - 1, z1 - LID_TOP)
    lid = outer - hollow
    a_L, a_W = POD_L - 2 * WALL, POD_W - 2 * WALL                       # lid wall inner face
    b_L, b_W = a_L - 2 * LIP_CLR, a_W - 2 * LIP_CLR                     # lip outer face (fits inside the base)
    lip_i = stadium(b_L - 3.2, b_W - 3.2)
    lip = ext_z(stadium(b_L, b_W) - lip_i, z0 - LIP_H, z0 + 0.2)
    # near-vertical web joining the lip to the lid wall, so nothing overhangs when printed top-down
    web = M.batch_hull([ext_z(stadium(a_L + 0.6, a_W + 0.6, seg=91), z0 + 3.6, z0 + 3.62), ext_z(stadium(b_L - 0.4, b_W - 0.4, seg=91), z0 - 0.1, z0 - 0.08)])
    web = web - ext_z(stadium(b_L - 1.6, b_W - 1.6, seg=91), z0 - 1, z0 + 5)
    lid = lid + lip + web
    inlay = None
    if name and font:
        cs = text_cs(name, font, cap_height=20.0, max_width=POD_L - 40)
        inlay = ext_z(cs, z1 - 0.6, z1)
        lid = lid - ext_z(cs, z1 - 0.6, z1 + 1)
    return lid, inlay


def pod_insert(cols=3, rows=2, h=14.0):
    """Drop-in tray. Sits on four feet above the key heads."""
    L, W = POD_L - 2 * WALL - 1.0, POD_W - 2 * WALL - 1.0
    z0 = lib.FL_Z1 + 4.8          # floor of the tray clears the key heads (they stand 4.3 mm proud)
    outer = ext_z(stadium(L, W), z0, z0 + h)
    t = outer - ext_z(stadium(L - 3.2, W - 3.2), z0 + 1.2, z0 + h + 1)
    iw = L - 3.2
    for i in range(1, cols):
        x = -iw / 2 + i * iw / cols
        t = t + ext_z(rrect(1.2, W - 2, 0.2, x, 0), z0 + 1.2 - EPS, z0 + h - 2) ^ ext_z(stadium(L - 1.6, W - 1.6), z0, z0 + h)
    for j in range(1, rows):
        y = -(W - 3.2) / 2 + j * (W - 3.2) / rows
        t = t + ext_z(rrect(L - 2, 1.2, 0.2, 0, y), z0 + 1.2 - EPS, z0 + h - 2) ^ ext_z(stadium(L - 1.6, W - 1.6), z0, z0 + h)
    return t


# ---------------- mounts (female TURN sockets, like a board) ----------------
def bar_saddle(bar_min=22.0, bar_max=35.0):
    """Sits on handlebars 22-35 mm. Two zip ties or a rubber strap through the channels."""
    Lx, Wy = 70.0, 32.0
    depth = 20.0
    body = ext_z(rrect(Lx, Wy, 8), -depth, lib.PLATE_Z1 - 0.8)
    body = M.batch_hull([body, ext_z(rrect(Lx - 1.6, Wy - 1.6, 7.2), lib.PLATE_Z1 - EPS, lib.PLATE_Z1)])
    for (x, y) in KEYS:
        body = body - board_socket_cut(x, y)
    # 120 degree V groove along y (the bar's direction), bottom of the saddle
    half = math.radians(60)
    gd = 14.0
    v = poly([(-gd * math.tan(half), -depth - 0.01), (gd * math.tan(half), -depth - 0.01), (0, -depth + gd)])
    groove = ext_y(v.scale([1, 1]), -Wy, Wy)
    # ext_y draws in (x, z): our poly is (x, z) already
    body = body - groove
    # zip-tie channels across x
    for y in (-8.5, 8.5):
        body = body - _channel_x(y, -11.0, Lx)
    return body


def _channel_x(y, z, L):
    # rectangle 6 (y) x 3.4 (z) running along x, rounded
    cs = rrect(3.4, 6.0, 1.0, z, y)          # drawn in (z, y) for ext_x
    return ext_x(cs, -L, L)


def strap_clip(strap_w=42.0, strap_t=4.5):
    Lx, Wy = 70.0, 36.0
    depth = 12.0
    body = ext_z(rrect(Lx, Wy, 8), -depth, lib.PLATE_Z1 - 0.8)
    body = M.batch_hull([body, ext_z(rrect(Lx - 1.6, Wy - 1.6, 7.2), lib.PLATE_Z1 - EPS, lib.PLATE_Z1)])
    for (x, y) in KEYS:
        body = body - board_socket_cut(x, y)
    # strap tunnel along y, under the sockets
    tunnel = ext_y(rrect(strap_w, strap_t, 1.5, 0, -depth + 2.4 + strap_t / 2), -Wy, Wy)
    body = body - tunnel
    return body


# ---------------- bike ----------------
def number_plate(number="27", name="JAYDEN", font=None, W=170.0, H=124.0, t=3.0):
    """Moto-style plate, zip-tied to the bars. Lettering is a second-colour body, raised 1.2 mm."""
    outline = round2d(rrect(W, H, 18), r_convex=0)
    plate = ext_z(outline, 0, t)
    rim = ext_z(rrect(W - 0.6, H - 0.6, 17.7) - rrect(W - 5, H - 5, 15.5), t - 0.2, t + 1.4)
    plate = plate + rim
    for x in (-42, 42):
        for dx in (-7, 7):
            plate = plate - ext_z(rrect(2.6, 6.0, 1.2, x + dx, H / 2 - 13), -1, t + 3)
    text = None
    if font:
        num = text_cs(number, font, cap_height=56.0, max_width=W - 34).translate([0, 6])
        nm = text_cs(name, font, cap_height=12.0, max_width=W - 50).translate([0, -H / 2 + 20])
        text = ext_z(num + nm, t - 0.4, t + 1.2)
    return plate, text


def tyre_lever(L=112.0, width=18.0):
    """Side profile extruded across the width; prints on its side, no supports."""
    pts = [(0, 0.0), (L - 22, 0.0), (L - 8, 1.2), (L, 4.2), (L - 1.5, 5.6), (L - 10, 3.4), (L - 24, 3.8), (16, 5.8), (6, 5.8)]
    prof = poly(pts)
    # spoke hook at the heel: a U that opens toward the tip
    hook = poly([(0, 0), (6, 0), (6, -12), (14, -12), (14, -8), (17, -8), (17, -16.5), (2, -16.5), (0, -14.5)])
    prof = round2d(prof + hook, r_convex=0.8, r_concave=1.0)
    # ext_x draws in (z, y): treat profile x -> z (length), y -> y (thickness)
    body = ext_x(prof, -width / 2, width / 2)
    return body


def bar_end_plug(bar_id=18.8, cap_d=24.0):
    """Press-fit bar end. Four slits let the plug flex into 18-20 mm bar ends."""
    r = bar_id / 2
    prof = poly([(0, 0), (cap_d / 2 - 1.0, 0), (cap_d / 2, 1.0), (cap_d / 2, 4.2), (r - 0.2, 4.2), (r - 0.2, 6.0),
                 (r + 0.45, 8.0), (r - 0.1, 10.0), (r + 0.45, 12.0), (r - 0.1, 14.0), (r - 0.6, 19.5), (0, 19.5)])
    b = M.revolve(prof, 96)
    b = b - cyl_z(r - 2.4, 6.0, 25, seg=72)
    for a in (0, 90):
        b = b - M.cube([1.8, 2 * r + 4, 14], center=True).translate([0, 0, 13.6]).rotate([0, 0, a])
    return b


# ---------------- fish + everyday ----------------
def handline_winder(L=128.0, W=56.0, t=5.0):
    cs = round2d(rrect(L, W, 10) - rrect(L - 30, W - 22, 8) , r_convex=1.0)
    for sx in (-1, 1):
        cs = cs - poly([(sx * L / 2 + sx * 1, -9), (sx * (L / 2 - 9), 0), (sx * L / 2 + sx * 1, 9)])
    return ext_z(cs, 0, t)


def bag_tag(name="MILA", font=None, L=64.0, W=28.0, t=4.0):
    tag = ext_z(rrect(L, W, 12) - circ(4.0, L / 2 - 9, 0, seg=48), 0, t)
    inlay = None
    if font:
        # the name sits on the bed side (the smooth show face), so it is mirrored to read correctly from that side
        cs = text_cs(name, font, cap_height=11.0, max_width=L - 26).scale([-1, 1]).translate([-6, 0])
        inlay = ext_z(cs, 0, 0.6)
        tag = tag - ext_z(cs, -1, 0.6)
    return tag, inlay
