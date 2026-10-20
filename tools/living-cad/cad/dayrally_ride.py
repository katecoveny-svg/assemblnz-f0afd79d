"""
dayrally ride — the bike line on the TURN key, 20 October 2026. Proposed; nothing printed.

  ride pod     the hero pod: bento proportion, printed pin hinge, a latch button in the accent colour, a TPU
               gasket, a lanyard loop, a name slate on the lid, and the same two-key TURN floor as every pod
  grips        TPU handlebar grips for 22.2 mm bars, waves or dots, the existing bar-end plug closes them
  watch        a cradle for an Apple Watch (42/46/49 mm) whose band wraps the cradle; charger pocket underneath
  phone        a portrait phone mount: 45 degree corner channels centre any 64-82 mm phone, a ratchet slider
               takes 140-170 mm lengths, a thumb pawl releases it
  bottle       a bottle cup with diamond windows: TURN floor and 64 mm M5 slots, so it bolts to a frame boss,
               locks to a saddle, or sits on the Grid or the home dock as a pen cup
  stand        a crank stand (rest the pedal, lean the bike) that is a phone stand on the desk

Every mount is a TURN accessory: two keys 42 mm apart at (x = ±21, y = 0), flange z 8-13, like the pods.
Installed frame: z out of the mount face. All dimensions mm.
"""
import math
import numpy as np
import manifold3d as m3d
import lib
import dayrally as d1
from lib import M, CS, P, ext_z, ext_x, ext_y, cyl_z, rrect, circ, poly, round2d, flange_key_cut, text_cs, EPS

KEYS = d1.KEYS
Z0 = lib.FL_Z0            # 8: accessory underside sits on the mount face
ZF = lib.FL_Z1            # 13: top of a TURN flange
KEY_HEAD_Z = ZF + 2.8 + 0.3    # key grip top, with a little air


def flange_cs(Lx, Wy, r):
    return rrect(Lx, Wy, r)


def turn_floor(Lx, Wy, r=14.0, z1=ZF):
    """A plate z 8..z1 with two TURN keyways at ±21."""
    f = ext_z(rrect(Lx, Wy, r), Z0, z1)
    for (x, y) in KEYS:
        f = f - flange_key_cut(x, y)
    return f


def ext_x_yz(pts_yz, x0, x1):
    """A (y, z) profile extruded across x0..x1."""
    return ext_x(poly([(z, y) for (y, z) in pts_yz]), x0, x1)


# =====================================================================================
# ride pod (pod v3)
# =====================================================================================
POD_L, POD_W, POD_H = 128.0, 84.0, 40.0          # base outer, base height (z 8 -> 48)
POD_R = 16.0                                      # bento corner
WALL, FLOOR = 2.4, 2.4
ZT = Z0 + POD_H                                   # 48, rim
LID_H, LID_TOP = 14.0, 2.4
LIP_H, LIP_CLR, LIP_T = 4.0, 0.25, 1.6
HINGE_Y = -POD_W / 2 - 4.3                        # hinge axis (y, z): the knuckle clears the wall by 0.3
HINGE_Z = ZT - 4.0
KN_R, PIN_D, PIN_CLR = 4.0, 2.9, 0.3              # knuckle radius, pin, radial clearance -> bore 3.5
KN_GAP = 0.4
KNUCKLES_BASE = [(-52.0, -32.0), (-10.0, 10.0), (32.0, 52.0)]     # x spans
KNUCKLES_LID = [(-32.0 + KN_GAP, -10.0 - KN_GAP), (10.0 + KN_GAP, 32.0 - KN_GAP)]
LIP_HINGE_CUT = 16.0                              # no lip within this distance of the hinge wall
GASKET_W, GASKET_H, GROOVE_D = 2.4, 1.6, 1.2      # TPU gasket, groove in the lid underside
RIB_H = 0.4                                       # rib on the base rim pressing into the gasket
LATCH_W, LATCH_T = 26.0, 1.8
LATCH_DROP = 22.0                                 # tongue below the lid bottom
WIN_H = 4.5                                       # window height in the tongue (rib 3.0 + 1.5)
CATCH_W, CATCH_H, CATCH_P = 20.0, 3.0, 1.4        # catch rib on the base front wall: width, height, proud
CATCH_Z = ZT - 10.0                               # rib top
HOUSE_W, HOUSE_D, HOUSE_T = 32.0, 6.0, 1.6        # latch housing on the lid front: width, depth out from wall, wall
SLATE_L, SLATE_W, SLATE_T = 64.0, 20.0, 2.0
SLATE_R = 7.0
PEG_D, PEG_L, PEG_PRESS = 3.0, 1.8, 0.08          # pegs under the slate press into holes in the lid top
PEG_X = 22.0
LUG_HOLE = 5.2                                    # lanyard loop hole


def bento(L, W, cz0, cz1, r=POD_R):
    return ext_z(rrect(L, W, r, seg=64), cz0, cz1)


def _knuckle(x0, x1):
    return M.cylinder(x1 - x0, KN_R, -1.0, 48).rotate([0, 90, 0]).translate([x0, HINGE_Y, HINGE_Z])


def _knuckle_web(x0, x1, z_plate0, z_plate1):
    """Knuckle plus a hull to a thin plate on the wall's outer face (so the underside slopes, no support)."""
    plate = M.cube([x1 - x0, 0.8, z_plate1 - z_plate0], center=False).translate([x0, -POD_W / 2 - 0.2, z_plate0])
    return M.batch_hull([_knuckle(x0, x1), plate])


def _pin_bore(x0, x1):
    return M.cylinder(x1 - x0 + 2, PIN_D / 2 + PIN_CLR, -1.0, 36).rotate([0, 90, 0]).translate([x0 - 1, HINGE_Y, HINGE_Z])


def pod_base():
    b = bento(POD_L, POD_W, Z0, ZT) - bento(POD_L - 2 * WALL, POD_W - 2 * WALL, Z0 + FLOOR, ZT + 1, POD_R - WALL)
    for (x, y) in KEYS:
        b = b + cyl_z(14.0, Z0 + FLOOR - EPS, ZF, cx=x, cy=y, seg=96)
    for (x, y) in KEYS:
        b = b - flange_key_cut(x, y)
    # gasket rib on the rim (a shallow trapezoid ring)
    rib = ext_z(rrect(POD_L - WALL, POD_W - WALL, POD_R - WALL / 2, seg=64) - rrect(POD_L - WALL - 2 * 1.2, POD_W - WALL - 2 * 1.2, POD_R - WALL / 2 - 1.2, seg=64), ZT - EPS, ZT + RIB_H)
    b = b + rib
    # hinge knuckles on the back wall, joined to it by a web
    for (x0, x1) in KNUCKLES_BASE:
        b = b + _knuckle_web(x0, x1, HINGE_Z - KN_R - 8.0, ZT)
    b = b - _pin_bore(-POD_L / 2 - 2, POD_L / 2 + 2)
    # catch rib on the front wall (+y), 45 degree top so the tongue rides over it
    y0 = POD_W / 2
    catch = ext_x_yz([(y0 - 0.3, CATCH_Z - CATCH_H), (y0 + CATCH_P, CATCH_Z - CATCH_H), (y0 + CATCH_P, CATCH_Z - CATCH_P), (y0 - 0.3, CATCH_Z + 0.2)], -CATCH_W / 2, CATCH_W / 2)
    b = b + catch
    # lanyard loop at the +x end, a flat lug with a rounded hole, 45 degree underside
    lug = ext_z(rrect(16, 20, 5, POD_L / 2 + 5, 0), Z0, Z0 + 14) - ext_y(circ(LUG_HOLE / 2, POD_L / 2 + 8.5, Z0 + 7, seg=40), -12, 12)
    b = b + (lug - bento(POD_L - 2 * WALL, POD_W - 2 * WALL, Z0 + FLOOR, ZT + 1, POD_R - WALL))
    return b


def _lip_cs():
    a_L, a_W = POD_L - 2 * WALL, POD_W - 2 * WALL
    b_L, b_W = a_L - 2 * LIP_CLR, a_W - 2 * LIP_CLR
    return rrect(b_L, b_W, POD_R - WALL - LIP_CLR, seg=64) - rrect(b_L - 2 * LIP_T, b_W - 2 * LIP_T, POD_R - WALL - LIP_CLR - LIP_T, seg=64)


def pod_lid(font=None):
    """Cap on the rim with a short lip (cut away near the hinge), a gasket groove in its underside, hinge knuckles,
    a latch housing with a top-entry T-slot, two peg holes for the name slate, and 'dayrally' inlaid in the top."""
    z0, z1 = ZT, ZT + LID_H
    lid = bento(POD_L, POD_W, z0, z1) - bento(POD_L - 2 * WALL, POD_W - 2 * WALL, z0 - 1, z1 - LID_TOP, POD_R - WALL)
    lip = ext_z(_lip_cs(), z0 - LIP_H, z0 + 0.5)
    lip = lip - M.cube([POD_L + 4, LIP_HINGE_CUT, LIP_H + 2], center=False).translate([-POD_L / 2 - 2, -POD_W / 2 - 0.5, z0 - LIP_H - 1])
    lid = lid + lip
    # web joining lip to wall at the cap's underside (strength), then the gasket groove through the underside of the wall ring
    groove = ext_z(rrect(POD_L - WALL + 0.3, POD_W - WALL + 0.3, POD_R - WALL / 2, seg=64) - rrect(POD_L - WALL - 2 * GASKET_W - 0.3, POD_W - WALL - 2 * GASKET_W - 0.3, POD_R - WALL / 2 - GASKET_W, seg=64), z0 - 1, z0 + GROOVE_D)
    # the groove sits in a thickened wall foot: add a ring foot first so there is material around the groove
    # a foot ring under the wall carries the groove; its inner face slopes 45 degrees so it prints face-down
    inset0, fh = WALL + GASKET_W + 0.6, 3.6
    Li, Wi = POD_L - 2 * inset0, POD_W - 2 * inset0
    cavity = M.extrude(rrect(Li, Wi, POD_R - inset0, seg=64), fh, 0, 0.0, [(Li + 2 * (fh - 0.6)) / Li, (Wi + 2 * (fh - 0.6)) / Wi]).translate([0, 0, z0])
    foot = ext_z(rrect(POD_L, POD_W, POD_R, seg=64), z0, z0 + fh) - cavity
    lid = lid + foot - groove
    # hinge knuckles joined to the back wall of the cap
    base_env = M.cube([POD_L + 10, 30.0, z0 - (HINGE_Z - KN_R - 1)], center=False).translate([-POD_L / 2 - 5, -POD_W / 2 - 0.3, HINGE_Z - KN_R - 1])
    for (x0, x1) in KNUCKLES_LID:
        web = _knuckle_web(x0, x1, z0, z0 + 7.0) - base_env
        lid = lid + web
    lid = lid - _pin_bore(-POD_L / 2 - 2, POD_L / 2 + 2)
    # latch housing on the front wall: a box outside the wall with a T-slot entered from the top
    hy0 = POD_W / 2 - 0.4
    house = ext_z(rrect(HOUSE_W, HOUSE_D + 0.4, 2.0, 0, hy0 + (HOUSE_D + 0.4) / 2), z0, z1)
    slot_stem = M.cube([LATCH_W + 0.5, LATCH_T + 0.4, LID_H + 2], center=False).translate([-(LATCH_W + 0.5) / 2, POD_W / 2 + 0.6, z0 - 1])
    slot_head = M.cube([LATCH_W + 0.5, HOUSE_D - HOUSE_T - 0.6, LID_H - 2.0 + 1], center=False).translate([-(LATCH_W + 0.5) / 2, POD_W / 2 + 0.6, z0 + 2.0])
    lid = lid + house - slot_stem - slot_head
    # slate peg holes in the top (blind, from the top)
    for sx in (-1, 1):
        lid = lid - cyl_z(PEG_D / 2 - PEG_PRESS, z1 - PEG_L - 0.2, z1 + 1, cx=sx * PEG_X, cy=0, seg=32)
    # wordmark inlaid flush in the top, below the slate
    inlay = None
    if font:
        cs = text_cs("dayrally", font, cap_height=9.0, max_width=POD_L - 40).translate([0, -POD_W / 2 + 15.0])
        if cs.area() > 1:
            inlay = ext_z(cs, z1 - 0.6, z1)
            lid = lid - ext_z(cs, z1 - 0.6, z1 + 1)
    return lid, inlay


def latch():
    """Accent-colour tongue: a T-head that drops into the lid housing, a window that catches the rib. Prints flat."""
    z1 = ZT + LID_H
    head = M.cube([LATCH_W, HOUSE_D - HOUSE_T - 0.6 - 0.4, LID_H - 2.0 - 0.4], center=False).translate([-LATCH_W / 2, POD_W / 2 + 0.6 + 0.2, ZT + 2.0 + 0.2])
    stem = M.cube([LATCH_W, LATCH_T, LID_H + LATCH_DROP], center=False).translate([-LATCH_W / 2, POD_W / 2 + 0.8, ZT - LATCH_DROP])
    t = head + stem
    # round the pad's bottom corners, then the window
    t = t - M.cube([LATCH_W + 2, LATCH_T + 2, 30], center=False).translate([-LATCH_W / 2 - 1, POD_W / 2 - 0.5, ZT - LATCH_DROP - 30])
    win_z0 = CATCH_Z - CATCH_H - 0.3            # window bottom edge 0.3 under the rib's flat underside
    win = M.cube([CATCH_W + 1.0, LATCH_T + 2, WIN_H], center=False).translate([-(CATCH_W + 1.0) / 2, POD_W / 2, win_z0])
    t = t - win
    # a pull pad below the window, 45 degree out, so a thumb can lever it
    pad = ext_x_yz([(POD_W / 2 + 0.8, ZT - LATCH_DROP + 0.0), (POD_W / 2 + 0.8 + LATCH_T + 2.0, ZT - LATCH_DROP + 2.0), (POD_W / 2 + 0.8 + LATCH_T + 2.0, ZT - LATCH_DROP + 5.0), (POD_W / 2 + 0.8, ZT - LATCH_DROP + 7.0)], -LATCH_W / 2, LATCH_W / 2)
    return t + pad


def hinge_pin():
    """Two per pod (one from each end), or a 3 mm steel rod. Prints lying flat."""
    L = 50.0
    pin = M.cylinder(L, PIN_D / 2, -1.0, 36)
    head = M.cylinder(2.0, 4.5, PIN_D / 2 + 0.6, 48).translate([0, 0, L])
    tip = M.cylinder(1.5, PIN_D / 2, PIN_D / 2 - 0.8, 36).translate([0, 0, -1.5])
    return pin + head + tip


def gasket():
    """TPU ring for the lid groove: 0.3 proud so the rib compresses it."""
    cs = rrect(POD_L - WALL, POD_W - WALL, POD_R - WALL / 2, seg=64) - rrect(POD_L - WALL - 2 * GASKET_W, POD_W - WALL - 2 * GASKET_W, POD_R - WALL / 2 - GASKET_W, seg=64)
    return ext_z(cs, 0, GASKET_H)


def slate(name="dayrally", font=None, cap=9.0):
    """Accent-colour name tab with the name raised 0.8; two pegs press into the lid."""
    z1 = ZT + LID_H
    s = ext_z(rrect(SLATE_L, SLATE_W, SLATE_R, seg=48), z1, z1 + SLATE_T)
    for sx in (-1, 1):
        s = s + cyl_z(PEG_D / 2, z1 - PEG_L, z1 + EPS, cx=sx * PEG_X, seg=32)
    txt = None
    if font and name:
        cs = text_cs(name, font, cap_height=cap, max_width=SLATE_L - 10)
        if cs.area() > 1:
            txt = ext_z(cs, z1 + SLATE_T - EPS, z1 + SLATE_T + 0.8)
    return s, txt


def core_split():
    """Insert: two pockets, finger scoops. Sits above the key heads."""
    L, W = POD_L - 2 * WALL - 1.0, POD_W - 2 * WALL - 1.0
    z0 = ZF + 3.6
    h = ZT - LIP_H - 0.6 - z0
    r = POD_R - WALL - 0.5
    t = ext_z(rrect(L, W, r, seg=64), z0, z0 + h)
    for sx in (-1, 1):
        t = t - ext_z(rrect(L / 2 - 2.4, W - 2.4, r - 1.2, sx * (L / 4 + 0.2), 0, seg=48), z0 + 1.4, z0 + h + 1)
        t = t - ext_y(circ(9.0, sx * (L / 4 + 0.2), z0 + h + 3, seg=48), -W, W)
    return t


# =====================================================================================
# grips
# =====================================================================================
GRIP_L, GRIP_OD, GRIP_ID = 130.0, 30.0, 21.0      # bar 22.2: 1.2 interference on the diameter, tune GRIP_ID on the print
GRIP_FLANGE_D, GRIP_FLANGE_T = 36.0, 4.0


def grip(style="waves"):
    z = np.linspace(0, GRIP_L, 521)
    if style == "waves":
        r = GRIP_OD / 2 + 1.2 * np.sin(2 * np.pi * z / 16.0)
        r[z < 6] = GRIP_OD / 2
        r[z > GRIP_L - 6] = GRIP_OD / 2
    else:
        r = np.full_like(z, GRIP_OD / 2)
    pts = [(0, 0)] + [(float(rr), float(zz)) for rr, zz in zip(r, z)] + [(0, GRIP_L)]
    g = M.revolve(poly(pts), 96)
    g = g + M.cylinder(GRIP_FLANGE_T, GRIP_FLANGE_D / 2, GRIP_OD / 2 + 0.2, 96)
    g = g - M.cylinder(GRIP_L + 2, GRIP_ID / 2, -1.0, 96).translate([0, 0, -1])
    # six shallow ribs inside to bite the bar
    for i in range(6):
        g = g + M.cube([1.6, 1.6, GRIP_L - 12], center=False).translate([GRIP_ID / 2 - 0.6, -0.8, 6]).rotate([0, 0, i * 60])
    if style == "dots":
        for row, zz in enumerate(np.arange(12.0, GRIP_L - 8, 8.0)):
            for k in range(8):
                a = math.radians(k * 45 + (22.5 if row % 2 else 0))
                g = g - M.sphere(3.0, 32).translate([(GRIP_OD / 2 + 1.6) * math.cos(a), (GRIP_OD / 2 + 1.6) * math.sin(a), float(zz)])
    return g


LAND_W, TEXT_H = 9.0, 7.0                          # flat land along the grip for the name; Fredoka cap height


def grip_name(name="RALLY", font=None):
    """A plain grip with a flat land along it and the rider's name raised 0.8 mm on the land, in Fredoka Bold. One
    colour of TPU reads by touch; a second TPU colour on the pattern reads by eye. Up to 8 letters."""
    g = grip("plain")
    R = GRIP_OD / 2
    cut_x = R - 0.7                                   # a 0.7 mm flat gives a 9 mm wide land
    txt = None
    if font and name:
        cs = text_cs(name, font, cap_height=TEXT_H, max_width=GRIP_L - 30)
        if cs.area() > 1:
            x0, y0, x1, y1 = cs.bounds()
            land_len = (x1 - x0) + 10.0
            land = M.cube([R + 2 - cut_x, LAND_W, land_len], center=False).translate([cut_x, -LAND_W / 2, GRIP_L / 2 - land_len / 2])
            g = g - land
            raised = ext_z(cs, 0, 0.8).rotate([0, 90, 0]).translate([cut_x - EPS, 0, GRIP_L / 2 + (x0 + x1) / 2])
            raised = raised ^ M.cube([2.0, LAND_W, land_len], center=False).translate([cut_x - 1.0, -LAND_W / 2, GRIP_L / 2 - land_len / 2])
            txt = raised
    return g, txt


def bar_end_plain(bar_id=18.8):
    """The press-fit bar-end plug, cap face up at z = 0 (the same plug the Scoot and Ride kits use), in the ride family
    so the custom handles are one set."""
    return d1.bar_end_plug(bar_id=bar_id, cap_d=24.0).rotate([180, 0, 0])


def bar_end_name(name="MILA", font=None, bar_id=18.8):
    """The bar-end plug with the name raised 0.8 mm on its 24 mm cap, in Fredoka Bold. Up to 5 letters."""
    plug = bar_end_plain(bar_id)
    txt = None
    if font and name:
        cs = text_cs(name, font, cap_height=5.2, max_width=19.0)
        if cs.area() > 1:
            txt = ext_z(cs, -EPS, 0.8)
    return plug, txt


# =====================================================================================
# watch cradle
# =====================================================================================
WATCH = {"42": (42.0, 36.0, 9.7), "46": (46.0, 39.0, 9.7), "49": (49.0, 44.0, 14.4)}    # case h (along the band), w, depth
SLAB_X, SLAB_T = 60.0, 14.0                       # band wraps this slab along x; slab thickness
TUNNEL_H = 9.0                                    # band passes under the slab, over the key heads (17.3)
POCKET_D, POCKET_CLR = 3.5, 0.6
BAND_W = 26.0                                     # band slot through the pocket ends
PUCK_D, PUCK_T = 27.8, 5.5                        # Apple charging puck (VERIFY on the puck in hand); pocket leaves 1.2 under the watch
POST_W = 7.0


def watch_cradle(size="42"):
    h, w, dep = WATCH[size]
    slab_w = max(54.0, w + 14.0)
    fl = turn_floor(max(70.0, SLAB_X + 4), slab_w + 4, 14.0)
    zs0 = ZF + TUNNEL_H
    slab = ext_z(rrect(SLAB_X, slab_w, 7.0, seg=48), zs0, zs0 + SLAB_T) ^ ext_y(rrect(SLAB_X, SLAB_T, 3.0, 0, zs0 + SLAB_T / 2, seg=32), -slab_w / 2 - 1, slab_w / 2 + 1)
    posts = None
    for sy in (-1, 1):
        p = ext_z(rrect(SLAB_X, POST_W, 2.5, 0, sy * (slab_w / 2 - POST_W / 2), seg=24), ZF - EPS, zs0 + EPS)
        posts = p if posts is None else posts + p
    body = fl + slab + posts
    zt = zs0 + SLAB_T
    # the pocket (case height along x, the band direction), a crown notch on +y, the band groove along x through the pocket ends
    pocket = ext_z(rrect(h + POCKET_CLR, w + POCKET_CLR, 9.5, seg=48), zt - POCKET_D, zt + 1)
    crown = ext_z(rrect(16.0, 8.0, 2.0, 0, (w + POCKET_CLR) / 2 + 1.5), zt - POCKET_D, zt + 1)
    band = M.cube([SLAB_X + 2, BAND_W, POCKET_D + 1], center=True).translate([0, 0, zt - POCKET_D / 2 + 0.5])
    body = body - pocket - crown - band
    # charger puck pocket from underneath, its face 1.2 under the pocket floor; cable slot to -y
    puck_deep = SLAB_T - POCKET_D - 1.2
    body = body - cyl_z(PUCK_D / 2 - 0.05, zs0 - 1, zs0 + puck_deep, seg=96)
    body = body - M.cube([5.0, slab_w / 2 + 2, PUCK_T + 1], center=False).translate([-2.5, -slab_w / 2 - 1, zs0 - 1])
    return body


def watch_case(size="42"):
    h, w, dep = WATCH[size]
    zt = ZF + TUNNEL_H + SLAB_T
    return ext_z(rrect(h, w, 9.0, seg=48), zt - POCKET_D, zt - POCKET_D + dep)


def watch_band():
    """A 22 x 3 band wrapped round the slab along x (digital gauge)."""
    zs0 = ZF + TUNNEL_H
    cz = zs0 + SLAB_T / 2
    ring = rrect(SLAB_X + 6.4, SLAB_T + 6.4, 6.2, 0, cz) - rrect(SLAB_X + 0.4, SLAB_T + 0.4, 3.2, 0, cz)
    return ext_y(ring, -11.0, 11.0)


# =====================================================================================
# phone mount
# =====================================================================================
PH_L, PH_W = 184.0, 98.0                          # plate
PH_X0 = -84.0
PHONE_W = (64.0, 82.0)
PHONE_LEN = (140.0, 170.0)
PHONE_T = (7.0, 11.0)
CH_H = 12.5                                       # channel height between the two 45 degree surfaces (phone + pad)
CH_Y0 = 28.5                                      # ramps start at |y| = 28.5: a 64 mm phone lifts 3.5, clear of the pawl
CH_LEN = 10.0                                     # channel length along x
END_T = 2.4
RACK_PITCH, RACK_H, RACK_W = 1.5, 1.0, 12.0
RACK_Y = 18.0                                     # rack lane sits between the key heads (|y| < 10.5) and the channels (|y| > 28)
RACK_X = (10.0, 84.0)
SLIDER_RANGE = (59.0, 89.0)                       # slider end-wall x for 140..170 mm phones (= PH_X0 + END_T + 0.3 + L + 0.3)
RAIL_Y = 43.0                                     # dovetail slots along x at y = ±43, open at the +x end
SLOT_X0 = 40.0
SLOT_BOTTOM_W, SLOT_TOP_W, SLOT_Z0, SLOT_FLARE_Z = 6.0, 3.0, 9.6, 11.5
FOOT_CLR = 0.3
RAIL_CLR = 0.3


def _channel(x0, x1, sign, dz=0.0):
    """Two 45 degree hook channels (one each side) as (y, z) profiles extruded along x, with an end wall at x0 (sign < 0) or x1."""
    zb = ZF + dz
    y0 = CH_Y0
    top = zb + 19.0 + CH_H + 2.0
    parts = []
    for sy in (-1, 1):
        wedge = poly([(y0 - 2.0, zb - 1.0 + dz * 0), (y0 + 20.0, zb - 1.0), (y0 + 20.0, top), (y0 + 12.0, top), (y0 - 2.0, zb + CH_H + 4.0)])
        chan = poly([(y0 - 6.0, zb - 7.0), (y0 + 24.0, zb + 23.0), (y0 + 24.0 - CH_H, zb + 23.0 + CH_H), (y0 - 6.0 - CH_H, zb - 7.0 + CH_H)])
        cs = (wedge - chan).scale([sy, 1])
        pts = cs.to_polygons()
        m = None
        for ring in pts:
            e = ext_x_yz([(float(a), float(b)) for a, b in ring], x0, x1)
            m = e if m is None else m + e
        parts.append(m)
    body = parts[0] + parts[1]
    xe = x0 if sign < 0 else x1 - END_T
    wall = M.cube([END_T, 2 * (y0 + 20.0), top - (zb - 1.0)], center=False).translate([xe, -(y0 + 20.0), zb - 1.0])
    wall = wall - M.cube([END_T + 2, 2 * (y0 - 4.0), 40], center=False).translate([xe - 1, -(y0 - 4.0), zb + 18.0])    # open the middle (buttons, port)
    return body + wall


def phone_plate():
    pl = ext_z(rrect(PH_L, PH_W, 12.0, PH_X0 + PH_L / 2, 0, seg=64), Z0, ZF)
    for (x, y) in KEYS:
        pl = pl - flange_key_cut(x, y)
    # lightening windows, away from the keys and the rack
    for cx in (-60.0, 40.0):
        pl = pl - ext_z(rrect(22.0, 16.0, 6.0, cx, -24.0), Z0 - 1, ZF + 1)
    # bottom channel at the -x end
    pl = pl + _channel(PH_X0, PH_X0 + CH_LEN + END_T, -1).__add__(M.cube([CH_LEN + END_T, 2 * (CH_Y0 + 20.0), 1.0], center=False).translate([PH_X0, -(CH_Y0 + 20.0), ZF - 0.5]))
    # rack along the centre line: sawtooth with the vertical face toward +x (slider pushes toward -x, holds against +x)
    teeth = None
    x = RACK_X[0]
    while x + RACK_PITCH <= RACK_X[1]:
        t = poly([(x, ZF - EPS), (x + RACK_PITCH, ZF - EPS), (x + RACK_PITCH, ZF + RACK_H)])      # (x, z): slope up toward +x, drop at +x
        tm = ext_y(t, RACK_Y - RACK_W / 2, RACK_Y + RACK_W / 2)
        teeth = tm if teeth is None else teeth + tm
        x += RACK_PITCH
    pl = pl + teeth
    # dovetail slots for the slider's feet, open at the +x end so the slider enters from the end
    for sy in (-1, 1):
        pl = pl - ext_x_yz([(sy * RAIL_Y - SLOT_BOTTOM_W / 2, SLOT_Z0), (sy * RAIL_Y + SLOT_BOTTOM_W / 2, SLOT_Z0), (sy * RAIL_Y + SLOT_BOTTOM_W / 2, SLOT_FLARE_Z),
                             (sy * RAIL_Y + SLOT_TOP_W / 2, ZF), (sy * RAIL_Y + SLOT_TOP_W / 2, ZF + 1), (sy * RAIL_Y - SLOT_TOP_W / 2, ZF + 1), (sy * RAIL_Y - SLOT_TOP_W / 2, ZF), (sy * RAIL_Y - SLOT_BOTTOM_W / 2, SLOT_FLARE_Z)],
                            SLOT_X0, PH_X0 + PH_L + 2)
    return pl


def phone_slider(x_end=SLIDER_RANGE[0]):
    """Top carriage: a bridge on the plate with dovetail feet in the slots, the top channel, and a pawl tongue
    anchored at the bridge's -x edge that runs out past the end wall to a thumb tab. Prints upside down."""
    x0 = x_end - 2.0 - CH_LEN
    bx0, bx1 = x0 - 2.0, x_end + END_T + 2.0
    body = _channel(x0, x_end + END_T, +1, dz=RAIL_CLR + 1.0)
    br = M.cube([bx1 - bx0, PH_W - 2.0, 2.4], center=False).translate([bx0, -(PH_W - 2.0) / 2, ZF + RAIL_CLR])
    body = body + br
    # dovetail feet (0.3 clearance to the slot)
    fw_b, fw_t = SLOT_BOTTOM_W - 2 * FOOT_CLR, SLOT_TOP_W - 2 * FOOT_CLR
    for sy in (-1, 1):
        y = sy * RAIL_Y
        foot = ext_x_yz([(y - fw_b / 2, SLOT_Z0 + FOOT_CLR), (y + fw_b / 2, SLOT_Z0 + FOOT_CLR), (y + fw_b / 2, SLOT_FLARE_Z - FOOT_CLR), (y + fw_t / 2, ZF + 0.0),
                         (y + fw_t / 2, ZF + RAIL_CLR + 0.5), (y - fw_t / 2, ZF + RAIL_CLR + 0.5), (y - fw_t / 2, ZF + 0.0), (y - fw_b / 2, SLOT_FLARE_Z - FOOT_CLR)], bx0, bx1)
        body = body + foot
    # pawl lane through the bridge and the end wall, leaving the first 3 mm of the bridge solid as the anchor
    lane = M.cube([bx1 - bx0, RACK_W + 3.0, 3.6], center=False).translate([bx0 + 3.0, RACK_Y - (RACK_W + 3.0) / 2, ZF - 0.1])
    low = M.cube([bx1 - bx0 + 2, RACK_W + 3.0, RACK_H + RAIL_CLR + 0.1], center=False).translate([bx0 - 1.0, RACK_Y - (RACK_W + 3.0) / 2, ZF - 0.1])   # the anchor clears the rack teeth
    body = body - lane - low
    tongue = M.cube([bx1 - bx0 + 7.0, RACK_W - 1.0, 1.4], center=False).translate([bx0 + 1.0, RACK_Y - (RACK_W - 1.0) / 2, ZF + RAIL_CLR + 1.0])
    tx = x0 + 2.0
    tooth = ext_y(poly([(tx, ZF + RAIL_CLR + 1.0 + EPS), (tx, ZF + 0.05), (tx + RACK_PITCH - 0.3, ZF + RAIL_CLR + 1.0 + EPS)]), RACK_Y - (RACK_W - 1.0) / 2, RACK_Y + (RACK_W - 1.0) / 2)
    tab = M.cube([8.0, RACK_W + 6.0, 1.4], center=False).translate([bx1 + 0.5, RACK_Y - (RACK_W + 6.0) / 2, ZF + RAIL_CLR + 1.0])
    return body + tongue + tooth + tab


def phone_block(w, L, t, x_end):
    """A phone of w x L x t sitting in the channels: the channels lift it by (w/2 - CH_Y0) on the 45 degree ramps."""
    lift = max(0.0, w / 2 - CH_Y0)
    return M.cube([L, w, t], center=False).translate([PH_X0 + END_T + 0.3, -w / 2, ZF + 0.5 + lift])


# =====================================================================================
# bottle cup
# =====================================================================================
CUP_ID, CUP_WALL, CUP_H, CUP_FLOOR = 76.0, 2.4, 105.0, 3.0
CUP_Y0 = -50.0
SPINE_W, SPINE_H = 60.0, 100.0
M5_SPACING, M5_SLOT = 64.0, (5.6, 10.0)
BUMP_P = 1.0
CUP_LIFT = 6.0                                    # air under the cup's belly: the key grips (to z 17.3) are turned from the sides


def bottle_cup():
    R = CUP_ID / 2 + CUP_WALL
    cz = ZF + R + CUP_LIFT                            # cup axis height
    outer = M.cylinder(CUP_H, R, -1.0, 128).rotate([-90, 0, 0]).translate([0, CUP_Y0, cz])
    inner = M.cylinder(CUP_H, CUP_ID / 2, -1.0, 128).rotate([-90, 0, 0]).translate([0, CUP_Y0 + CUP_FLOOR, cz])
    spine = turn_floor(SPINE_W, SPINE_H, 12.0)
    block = M.cube([16.0, SPINE_H - 8, cz - ZF + 1], center=False).translate([-8.0, -(SPINE_H - 8) / 2, ZF - EPS])
    body = outer + spine + block - inner
    # M5 slots at 64 mm through the spine (y = ±32), clear of the keys
    for sy in (-1, 1):
        body = body - ext_z(rrect(M5_SLOT[0], M5_SLOT[1], M5_SLOT[0] / 2 - 0.01, 0, sy * M5_SPACING / 2), Z0 - 1, cz)
    # drain holes in the floor
    for a in (90, 210, 330):
        body = body - M.cylinder(CUP_FLOOR + 2, 4.0, -1.0, 32).rotate([-90, 0, 0]).translate([22 * math.cos(math.radians(a)), CUP_Y0 - 1, cz + 22 * math.sin(math.radians(a))])
    # diamond windows, 45 degree edges, two staggered rows, none through the spine side (the back is -z)
    dia = round2d(poly([(0, -13.0), (11.0, 0), (0, 13.0), (-11.0, 0)]), r_convex=1.5)
    for row, yc in enumerate((CUP_Y0 + 32.0, CUP_Y0 + 66.0)):
        for k in range(6):
            ang = k * 60 + (30 if row % 2 else 0)
            if abs(((ang + 180) % 360) - 180) > 130:        # within 50 degrees of the back: skip
                continue
            c = M.extrude(dia, R + 4).rotate([0, ang, 0]).translate([0, yc, cz])
            body = body - c
    # thumb scoop at the front rim
    body = body - M.sphere(18.0, 64).translate([0, CUP_Y0 + CUP_H + 10, cz + R])
    # two retaining ridges inside near the rim, 55 degrees either side of the front
    for sgn in (-1, 1):
        ridge = M.cube([2.0, 20.0, BUMP_P + 0.5], center=True).translate([0, CUP_Y0 + CUP_H - 16, CUP_ID / 2 - BUMP_P / 2 + 0.25])
        body = body + ridge.rotate([0, sgn * 55, 0]).translate([0, 0, cz])
    return body


def bottle(dia=74.0, L=200.0):
    R = CUP_ID / 2 + CUP_WALL
    cz = ZF + R + CUP_LIFT
    return M.cylinder(L, dia / 2, -1.0, 128).rotate([-90, 0, 0]).translate([0, CUP_Y0 + CUP_FLOOR + 0.2, cz])


# =====================================================================================
# stand (crank stand / phone stand)
# =====================================================================================
ST_W, ST_D0, ST_D1, ST_H = 110.0, 70.0, 44.0, 120.0     # width, depth at the ground, depth at the top, height
ST_WALL = 2.4
CRADLE_W, CRADLE_D, CRADLE_LEAN = 24.0, 14.0, 15.0        # slot width, depth, back-wall lean (deg) for a phone


def stand():
    """Ground at z = 0, cradle on top. The back face (y = -ST_D0/2) is flat and carries the TURN flange; the front tapers."""
    yc_top = -ST_D0 / 2 + ST_D1 / 2
    outer = M.batch_hull([ext_z(rrect(ST_W, ST_D0, 10.0, 0, 0), 0, 0.02), ext_z(rrect(ST_W, ST_D1, 8.0, 0, yc_top), ST_H - 0.02, ST_H)])
    inner = M.batch_hull([ext_z(rrect(ST_W - 2 * ST_WALL, ST_D0 - 2 * ST_WALL, 8.0, 0, 0), -1, -0.98),
                          ext_z(rrect(ST_W - 2 * ST_WALL, ST_D1 - 2 * ST_WALL, 6.0, 0, yc_top), ST_H - 6.0 - 0.02, ST_H - 6.0)])
    s = outer - inner
    for x in (-36.0, 0.0, 36.0):                      # ribs so the shell takes a leaning bike
        s = s + (M.cube([ST_WALL, ST_D0, ST_H - 6.0], center=False).translate([x - ST_WALL / 2, -ST_D0 / 2, 0]) ^ outer)
    # cradle slot in the top: 24 wide, back wall leaning 15 degrees, front wall vertical; takes a pedal body or a phone
    lean = math.tan(math.radians(CRADLE_LEAN)) * CRADLE_D
    yc = yc_top
    s = s - ext_x_yz([(yc - CRADLE_W / 2 - lean, ST_H - CRADLE_D), (yc + CRADLE_W / 2, ST_H - CRADLE_D), (yc + CRADLE_W / 2, ST_H + 1), (yc - CRADLE_W / 2, ST_H + 1)], -ST_W / 2 - 1, ST_W / 2 + 1)
    for sx in (-1, 1):                                 # rubber-foot recesses in the ground face
        for sy in (-1, 1):
            s = s - cyl_z(5.3, -1, 1.0, cx=sx * (ST_W / 2 - 12), cy=sy * (ST_D0 / 2 - 12), seg=48)
    # TURN flange in the back wall: installed +z -> +y (into the stand), key heads sit inside; the keys go in from the open underside
    place = lambda m: m.rotate([-90, 0, 0]).translate([0, -ST_D0 / 2 - Z0, ST_H / 2])
    s = s + place(turn_floor(60.0, 60.0, 12.0) + ext_z(rrect(60.0, 60.0, 12.0), Z0, ZF))
    for (x, y) in KEYS:
        s = s - place(flange_key_cut(x, y))
    return s


def pedal_block(L=100.0, W=95.0, T=20.0):
    """A pedal body standing on edge in the cradle (its 20 mm thickness across the 24 mm slot)."""
    yc = -ST_D0 / 2 + ST_D1 / 2
    return M.cube([L, T, W], center=True).translate([0, yc + 1.0, ST_H - CRADLE_D + W / 2 + 0.5])


def phone_in_stand(t=8.3, w=72.0, L=150.0):
    """A phone leaning on the slot's 15 degree back wall."""
    yc = -ST_D0 / 2 + ST_D1 / 2
    ph = M.cube([w, t, L], center=False).translate([-w / 2, 0, 0])
    lift = t * math.sin(math.radians(CRADLE_LEAN)) + 0.3
    return ph.rotate([-CRADLE_LEAN, 0, 0]).translate([0, yc - CRADLE_W / 2 - math.tan(math.radians(CRADLE_LEAN)) * (CRADLE_D - lift) + 0.3, ST_H - CRADLE_D + lift])


# =====================================================================================
PARTS = {
    "ride-pod-base": ("ride pod, base", pod_base, "as_is", "ride", "Bento pod on the TURN floor. Hinge knuckles and catch rib printed in."),
    "ride-latch": ("ride pod, latch button", latch, "on_bottom", "ride", "Accent colour. Drops into the lid housing from the top; the window catches the rib."),
    "ride-hinge-pin": ("ride pod, hinge pin", hinge_pin, "on_side", "ride", "Two per pod, or a 3 mm steel rod."),
    "ride-gasket": ("ride pod, gasket", gasket, "as_is", "ride", "TPU 95A. Splash-proof, not submersible."),
    "ride-core-split": ("ride pod, core, split", core_split, "as_is", "ride", "Two pockets, finger scoops."),
    "ride-grip-waves": ("grip, waves", lambda: grip("waves"), "as_is", "ride", "TPU 95A, 22.2 mm bars. Push on with a little spray of alcohol; close with the bar-end plug."),
    "ride-grip-dots": ("grip, dots", lambda: grip("dots"), "as_is", "ride", "TPU 95A, 22.2 mm bars."),
    "ride-watch-42": ("watch cradle, 41/42 mm", lambda: watch_cradle("42"), "as_is", "ride", "The slab bridges 40 mm between its walls (a bridge, no supports). Band wraps the slab; charger puck pocket underneath."),
    "ride-watch-46": ("watch cradle, 45/46 mm", lambda: watch_cradle("46"), "as_is", "ride", "Band wraps the slab; charger puck pocket underneath."),
    "ride-watch-49": ("watch cradle, 49 mm Ultra", lambda: watch_cradle("49"), "as_is", "ride", "Band wraps the slab; charger puck pocket underneath."),
    "ride-phone-plate": ("phone mount, plate", phone_plate, "as_is", "ride", "Two keys; 45 degree channels centre 64-82 mm phones; rack for the slider."),
    "ride-phone-slider": ("phone mount, slider", lambda: phone_slider(SLIDER_RANGE[0]), "face_down", "ride", "Prints upside down (the bridge is a 53 mm span between the hooks). Push toward the phone to ratchet; lift the tab to release."),
    "ride-bottle-cup": ("bottle cup", bottle_cup, "on_bottom", "ride", "TURN floor and 64 mm M5 slots. Pen cup on the home dock."),
    "ride-stand": ("crank stand / phone stand", stand, "face_down", "ride", "Rest a pedal in the cradle and lean the bike. A phone leans in the same slot on the desk."),
}
