"""
assembl living — CAD library
assembl TURN connection standard, v0.1 (proposed, untested in print)

Installed frame (how a part sits on the wall), millimetres:
  x = right, y = up, z = out from the wall. The wall is z = 0.

The standard
  Grid pitch ............ 42.0 mm (same pitch as the drawer system)
  Board ................. 8.0 mm thick: 4.0 standoff (z 0-4) + 4.0 front plate (z 4-8)
  Keyway (front plate) .. bore 13.0, two lug slots 4.0 wide on the vertical axis, reaching r 9.8
  Chamber (standoff) .... 22.0 bore behind every keyway; the key's lugs turn here
  Detents ............... 0.35 mm dimples at 3 and 9 o'clock on the plate's back face
  Accessory flange ...... 5.0 thick (z 8-13); keyway + 45 degree countersink (13.0 -> 21.0)
  TURN key .............. push in vertical, quarter-turn to horizontal = locked
  Locator nub ........... 12.4 x 3.0 spigot that drops into a neighbouring keyway (stops a
                          single-key accessory rotating and carries shear load)
Rules
  * Any accessory with 2+ keys needs no nub. A single-key accessory needs at least one nub.
  * Grip bar vertical = open. Grip bar horizontal = locked.
"""
import math
import numpy as np
import manifold3d as m3d
from manifold3d import Manifold as M, CrossSection as CS

P = 42.0                # grid pitch
SEG = 72                # circle segments for small round features
EPS = 0.02

# keyway
BORE_R = 6.5
SLOT_W = 4.0
SLOT_END = 9.8          # outer radius of the slot
CHAMBER_R = 11.0
PLATE_Z0, PLATE_Z1 = 4.0, 8.0
DIMPLE_R, DIMPLE_D, DIMPLE_AT = 1.3, 0.35, 8.0
# key
SHANK_R = 6.2
LUG_W = 3.4
LUG_TIP = 9.4
LUG_Z0 = 1.4
BUMP_R, BUMP_H = 1.0, 0.25
CLAMP = 0.10            # designed cone interference (axial), tune on the fit-test coupon
# accessory flange
FL_Z0, FL_Z1 = 8.0, 13.0
CSK_Z0, CSK_R0 = 9.0, BORE_R            # countersink: r 6.5 at z 9 -> r 10.5 at z 13 (45 deg)


# ---------- 2D helpers ----------
def rrect(w, h, r, cx=0.0, cy=0.0, seg=48):
    r = max(0.01, min(r, w / 2 - 0.01, h / 2 - 0.01))
    cs = CS.square([w - 2 * r, h - 2 * r], center=True).offset(r, m3d.JoinType.Round, circular_segments=seg)
    return cs.translate([cx, cy])


def circ(r, cx=0.0, cy=0.0, seg=SEG):
    return CS.circle(r, seg).translate([cx, cy])


def poly(pts):
    """Polygon from points in either winding order (CrossSection needs counter-clockwise)."""
    a = sum(pts[i][0] * pts[(i + 1) % len(pts)][1] - pts[(i + 1) % len(pts)][0] * pts[i][1] for i in range(len(pts)))
    if a < 0:
        pts = list(reversed(pts))
    return CS([pts])


def round2d(cs, r_convex=0.0, r_concave=0.0):
    if r_concave:
        cs = cs.offset(r_concave, m3d.JoinType.Round, circular_segments=32).offset(-r_concave, m3d.JoinType.Round, circular_segments=32)
    if r_convex:
        cs = cs.offset(-r_convex, m3d.JoinType.Round, circular_segments=32).offset(r_convex, m3d.JoinType.Round, circular_segments=32)
    return cs


# ---------- 3D helpers (installed frame) ----------
def ext_z(cs, z0, z1):
    """Extrude an xy cross-section between z0 and z1."""
    return M.extrude(cs, z1 - z0).translate([0, 0, z0])


def ext_x(cs_zy, x0, x1):
    """cs drawn in (z, y) coordinates, extruded across x0..x1."""
    w = x1 - x0
    return M.extrude(cs_zy, w).rotate([0, -90, 0]).translate([x1, 0, 0])


def ext_y(cs_xz, y0, y1):
    """cs drawn in (x, z) coordinates, extruded up from y0 to y1."""
    flipped = cs_xz.scale([1, -1])
    return M.extrude(flipped, y1 - y0).rotate([-90, 0, 0]).translate([0, y0, 0])


def cyl_z(r0, z0, z1, r1=None, cx=0.0, cy=0.0, seg=SEG):
    return M.cylinder(z1 - z0, r0, r1 if r1 is not None else -1.0, seg).translate([cx, cy, z0])


# ---------- the standard ----------
def keyway_cs(cx=0.0, cy=0.0, slot_axis="y"):
    slot_len = SLOT_END - SLOT_W / 2
    if slot_axis == "y":
        slot = CS.square([SLOT_W, 2 * slot_len], center=True) + circ(SLOT_W / 2, 0, slot_len, 36) + circ(SLOT_W / 2, 0, -slot_len, 36)
    else:
        slot = CS.square([2 * slot_len, SLOT_W], center=True) + circ(SLOT_W / 2, slot_len, 0, 36) + circ(SLOT_W / 2, -slot_len, 0, 36)
    return (circ(BORE_R) + slot).translate([cx, cy])


def board_socket_cut(cx, cy):
    """Everything removed from a board at one cell."""
    kw = ext_z(keyway_cs(cx, cy), PLATE_Z0 - EPS, PLATE_Z1 + 1)
    ch = cyl_z(CHAMBER_R, -1, PLATE_Z0, cx=cx, cy=cy)
    dimples = [cyl_z(DIMPLE_R, PLATE_Z0 - EPS, PLATE_Z0 + DIMPLE_D, r1=DIMPLE_R * 0.45, cx=cx + s * DIMPLE_AT, cy=cy, seg=32) for s in (-1, 1)]
    return kw + ch + dimples[0] + dimples[1]


def flange_key_cut(cx, cy):
    """Keyway plus 45 degree countersink through an accessory flange."""
    kw = ext_z(keyway_cs(cx, cy), FL_Z0 - 1, FL_Z1 + 1)
    z0 = CSK_Z0 - 0.3
    csk = cyl_z(CSK_R0 - 0.3, z0, FL_Z1 + 1.0, r1=CSK_R0 + (FL_Z1 + 1.0 - CSK_Z0), cx=0, cy=0, seg=79).rotate([0, 0, 1.3]).translate([cx, cy, 0])
    return kw + csk


def nub(cx, cy):
    """Locator spigot on the back of a flange; sits inside a neighbouring keyway bore."""
    prof = poly([(0, 5.0), (SHANK_R - 0.6, 5.0), (SHANK_R, 5.6), (SHANK_R, FL_Z0 + 0.4), (0, FL_Z0 + 0.4)])
    return M.revolve(prof, SEG).translate([cx, cy, 0])


def flange(x0, x1, y0, y1, r=6.0):
    w, h = x1 - x0, y1 - y0
    return ext_z(rrect(w, h, r, (x0 + x1) / 2, (y0 + y1) / 2), FL_Z0, FL_Z1)


def finish_accessory(body, keys=(), nubs=()):
    for (x, y) in keys:
        body = body - flange_key_cut(x, y)
    for (x, y) in nubs:
        body = body + nub(x, y)
    return body


# ---------- parts ----------
def board(cols=4, rows=4, r=6.0, chamfer=0.8):
    W, H = cols * P, rows * P
    base = ext_z(rrect(W, H, r, W / 2, H / 2), 0, PLATE_Z1 - chamfer)
    top = ext_z(rrect(W - 2 * chamfer, H - 2 * chamfer, r - chamfer, W / 2, H / 2), PLATE_Z1 - EPS, PLATE_Z1)
    b = M.batch_hull([base, top])
    cuts = []
    for i in range(cols):
        for j in range(rows):
            cuts.append(board_socket_cut((i + 0.5) * P, (j + 0.5) * P))
    # lightening pockets on the back, at interior cell corners
    for i in range(1, cols):
        for j in range(1, rows):
            cuts.append(ext_z(rrect(16, 16, 4, i * P, j * P), -1, PLATE_Z0 - 0.0))
    # half pockets along the edges keep the back flat-printing and light
    return b - M.batch_boolean(cuts, m3d.OpType.Add)


def turn_key(anchor=False):
    """The TURN key, built at the origin in the installed frame, LOCKED orientation (lugs along x)."""
    lug_len = LUG_TIP - LUG_W / 2
    lug_cs = circ(SHANK_R - 0.05, seg=67) + CS.square([2 * lug_len, LUG_W], center=True) + circ(LUG_W / 2, lug_len, 0, 36) + circ(LUG_W / 2, -lug_len, 0, 36)
    k = ext_z(lug_cs, LUG_Z0, PLATE_Z0)
    for sgn in (-1, 1):
        k = k + cyl_z(BUMP_R, PLATE_Z0 - 0.1, PLATE_Z0 + BUMP_H, r1=BUMP_R * 0.4, cx=sgn * DIMPLE_AT, seg=32)
    cone_z0 = CSK_Z0 - (BORE_R - SHANK_R) - CLAMP          # where the key cone leaves the shank
    head_r = CSK_R0 + (FL_Z1 - CSK_Z0)                     # 10.5
    cone_z1 = cone_z0 + (head_r - SHANK_R)
    top = cone_z1 + 1.6
    prof = poly([(0, LUG_Z0 + 0.3), (SHANK_R, LUG_Z0 + 0.3), (SHANK_R, cone_z0), (head_r, cone_z1),
                 (head_r, cone_z1 + 1.0), (head_r - 0.6, top), (0, top)])
    k = k + M.revolve(prof, SEG)
    grip = ext_z(rrect(17.0, 4.6, 2.3), top - 0.3, top + 2.8)
    k = k + grip
    # orientation dot at one end of the grip, so "horizontal = locked" is easy to read
    k = k - cyl_z(0.9, top + 2.3, top + 2.8 + 1, cx=6.0, seg=24)
    return k


def anchor_washer():
    """Wall fixing: sits in any keyway from the front, takes a 4 mm countersunk screw (and a wall plug)."""
    top = PLATE_Z1 + 2.8
    prof = poly([(2.25, 4.6), (SHANK_R - 0.5, 4.6), (SHANK_R, 5.2), (SHANK_R, PLATE_Z1), (10.0, PLATE_Z1),
                 (10.0, PLATE_Z1 + 2.2), (9.4, top), (4.75, top), (2.25, top - 2.5)])
    return M.revolve(prof, SEG)


def hook(width=26.0, reach=40.0, lip=16.0):
    """Single-key hook: key in the upper cell, nub in the lower cell."""
    key, nb = (0.0, P), (0.0, 0.0)
    x0, x1 = -width / 2, width / 2
    fl = flange(x0, x1, -16, P + 15, r=6)
    arm = CS.square([reach + 6, 10], center=False).translate([FL_Z1 - 3, -16])          # (z, y)
    lipcs = CS.square([8, lip + 10], center=False).translate([FL_Z1 + reach - 5, -16])
    prof = round2d(arm + lipcs, r_convex=3.0, r_concave=4.0)
    body = fl + ext_x(prof, x0, x1)
    return finish_accessory(body, keys=[key], nubs=[nb])


def rod_cradle(width=26.0, reach=34.0, rod_r=12.0):
    key, nb = (0.0, P), (0.0, 0.0)
    x0, x1 = -width / 2, width / 2
    fl = flange(x0, x1, -16, P + 15, r=6)
    cz, cy = FL_Z1 + reach, -16 + rod_r + 4
    arm = CS.square([reach, 10], center=False).translate([FL_Z1 - 3, -16])
    ring = circ(rod_r + 4, cz, cy) - circ(rod_r, cz, cy) - CS.square([2 * rod_r + 10, rod_r + 10], center=False).translate([cz - rod_r - 5, cy + 2])
    prof = round2d(arm + ring, r_convex=1.5, r_concave=3.0)
    body = fl + ext_x(prof, x0, x1)
    return finish_accessory(body, keys=[key], nubs=[nb])


def shelf(cells=2, depth=90.0, lip=14.0):
    keys = [(i * P, 0.0) for i in range(cells)]
    x0, x1 = -17.0, (cells - 1) * P + 17.0
    y_bot = -40.0
    fl = flange(x0, x1, y_bot, 16, r=6)
    w = x1 - x0
    plate = ext_y(rrect(w, depth - FL_Z0 + 2, 4, (x0 + x1) / 2, FL_Z0 + (depth - FL_Z0) / 2), y_bot, y_bot + 5)
    lipb = ext_y(rrect(w, 5, 2.4, (x0 + x1) / 2, depth - 2.5), y_bot, y_bot + lip)
    cheeks = []
    for xa in (x0, x1 - 4):
        tri = round2d(poly([(FL_Z1 - 1, 16), (FL_Z1 - 1, y_bot + 2), (FL_Z1 + 46, y_bot + 2)]), r_convex=2.0)
        cheeks.append(ext_x(tri, xa, xa + 4))
    body = fl + plate + lipb + cheeks[0] + cheeks[1]
    return finish_accessory(body, keys=keys)


def bin_(cells=2, depth=50.0, height=50.0, wall=2.0, dividers=0, divider_h=None, top_y=-10.0, name=None):
    keys = [(i * P, 0.0) for i in range(cells)]
    x0, x1 = -17.0, (cells - 1) * P + 17.0
    w = x1 - x0
    y0 = top_y - height
    fl = flange(x0, x1, y0, 16, r=6)
    cx, cz = (x0 + x1) / 2, FL_Z0 + depth / 2
    outer = ext_y(rrect(w, depth, 7, cx, cz), y0, top_y)
    inner = ext_y(rrect(w - 2 * wall, depth - 2 * wall, 5, cx, cz), y0 + wall, top_y + 1)
    body = fl + outer - inner
    if dividers:
        dh = divider_h if divider_h is not None else height - 8
        pitch = (w - 2 * wall) / (dividers + 1)
        for i in range(1, dividers + 1):
            xd = x0 + wall + i * pitch
            body = body + ext_y(rrect(1.4, depth - 2 * wall + 0.4, 0.3, xd, cz), y0 + wall - EPS, y0 + wall + dh)
    return finish_accessory(body, keys=keys)


def cup(width=40.0, depth=40.0, height=72.0, wall=2.0):
    key, nb = (0.0, P), (0.0, 0.0)
    x0, x1 = -width / 2, width / 2
    top_y = P + 14
    y0 = top_y - height - 30
    fl = flange(x0, x1, y0, P + 16, r=6)
    cz = FL_Z0 + depth / 2
    outer = ext_y(rrect(width, depth, 9, 0, cz), y0, top_y - 30)
    inner = ext_y(rrect(width - 2 * wall, depth - 2 * wall, 7, 0, cz), y0 + wall, top_y)
    body = fl + outer - inner
    return finish_accessory(body, keys=[key], nubs=[nb])


def name_plate(cells=4, height=40.0, thickness=5.0):
    keys = [(0.0, 0.0), ((cells - 1) * P, 0.0)]
    x0, x1 = -21.0, (cells - 1) * P + 21.0
    body = flange(x0, x1, -height / 2, height / 2, r=10)
    return finish_accessory(body, keys=keys), ((x0 + 22, x1 - 22), (-height / 2 + 7, height / 2 - 7))


# ---------- text ----------
def text_cs(text, font_path, cap_height=16.0, max_width=None, tracking=0.02):
    """Outline text with fontTools and return a CrossSection centred on the origin."""
    from fontTools.ttLib import TTFont
    from fontTools.pens.recordingPen import DecomposingRecordingPen
    font = TTFont(font_path)
    gs = font.getGlyphSet()
    cmap = font.getBestCmap()
    upm = font["head"].unitsPerEm
    cap = getattr(font["OS/2"], "sCapHeight", 0) or upm * 0.7
    s = cap_height / cap
    contours, x = [], 0.0
    for ch in text:
        gname = cmap.get(ord(ch))
        if gname is None:
            continue
        g = gs[gname]
        pen = DecomposingRecordingPen(gs)
        g.draw(pen)
        cur = []
        for op, args in pen.value:
            if op == "moveTo":
                cur = [args[0]]
            elif op == "lineTo":
                cur.append(args[0])
            elif op in ("qCurveTo", "curveTo"):
                start = cur[-1]
                pts = list(args)
                if op == "qCurveTo":
                    # expand implied on-curve points
                    ctrl = pts[:-1]
                    end = pts[-1]
                    segs = []
                    p0 = start
                    for i, c in enumerate(ctrl):
                        if i < len(ctrl) - 1:
                            nxt = ((c[0] + ctrl[i + 1][0]) / 2, (c[1] + ctrl[i + 1][1]) / 2)
                        else:
                            nxt = end
                        segs.append((p0, c, nxt))
                        p0 = nxt
                    for (a, c, b) in segs:
                        for t in np.linspace(0, 1, 9)[1:]:
                            cur.append(((1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0],
                                        (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]))
                else:
                    c1, c2, end = pts
                    for t in np.linspace(0, 1, 11)[1:]:
                        cur.append(((1 - t) ** 3 * start[0] + 3 * (1 - t) ** 2 * t * c1[0] + 3 * (1 - t) * t * t * c2[0] + t ** 3 * end[0],
                                    (1 - t) ** 3 * start[1] + 3 * (1 - t) ** 2 * t * c1[1] + 3 * (1 - t) * t * t * c2[1] + t ** 3 * end[1]))
            elif op in ("closePath", "endPath"):
                if len(cur) >= 3:
                    contours.append([((px + x) * s, py * s) for (px, py) in cur])
                cur = []
        x += g.width + tracking * upm
    if not contours:
        return None
    cs = CS(contours, m3d.FillRule.NonZero)
    (bx0, by0, bx1, by1) = cs.bounds()
    cs = cs.translate([-(bx0 + bx1) / 2, -cap_height / 2])
    if max_width and (bx1 - bx0) > max_width:
        f = max_width / (bx1 - bx0)
        cs = cs.scale([f, f])
    return cs


def name_plate_with_text(text, font_path, cells=4):
    plate, ((tx0, tx1), (ty0, ty1)) = name_plate(cells)
    avail_w = tx1 - tx0
    cs = text_cs(text, font_path, cap_height=min(17.0, ty1 - ty0), max_width=avail_w)
    cs = cs.translate([(tx0 + tx1) / 2, (ty0 + ty1) / 2 - 0.5])
    txt = ext_z(cs, FL_Z1 - 0.4, FL_Z1 + 1.2)     # 1.2 mm proud, 0.4 mm keyed into the plate
    plate = plate - ext_z(cs, FL_Z1 - 0.4, FL_Z1 + 1)
    return plate, txt


# ---------- tile system: custom-size drawer tray ----------
def drawer_tray(W=240.0, D=180.0, H=50.0, cols=3, rows=2, wall=1.6, divider=1.2, floor=1.2, r=6.0, merge=()):
    """Free-standing drawer tray sized to the customer's drawer (outer dims). Prints upright, no supports."""
    outer = ext_z(rrect(W, D, r, W / 2, D / 2), 0, H)
    t = outer - ext_z(rrect(W - 2 * wall, D - 2 * wall, max(1, r - wall), W / 2, D / 2), floor, H + 1)
    iw, idd = W - 2 * wall, D - 2 * wall
    for i in range(1, cols):
        x = wall + i * iw / cols
        t = t + ext_z(rrect(divider, idd + 0.2, 0.2, x, D / 2), floor - EPS, H - 6)
    for j in range(1, rows):
        y = wall + j * idd / rows
        t = t + ext_z(rrect(iw + 0.2, divider, 0.2, W / 2, y), floor - EPS, H - 6)
    # finger scoop on the long front wall
    t = t - cyl_z(14, H - 8, H + 1, cx=W / 2, cy=0, seg=64).scale([1.6, 1, 1]).translate([-(W / 2) * 0.6, 0, 0])
    return t


# ---------- stack system: dowel node ----------
def _arm(d, body_r, reach):
    if d in ("+z", "-z"):
        a = M.cylinder(reach, body_r, -1, 96)
        return a if d == "+z" else a.rotate([180, 0, 0])
    # horizontal arms get a downward keel so the underside never overhangs past 45 degrees
    k = body_r * math.sqrt(0.5)
    tear = circ(body_r, seg=96) + poly([(-k, k), (0, body_r * math.sqrt(2)), (k, k)])   # point on +y
    a = M.extrude(tear, reach).rotate([-90, 0, 0])      # axis +y, point now -z
    ang = {"+y": 0, "-y": 180, "+x": -90, "-x": 90}[d]
    return a.rotate([0, 0, ang])


def _socket(d, R, reach, depth):
    if d in ("+z", "-z"):
        prof = poly([(0, reach - depth - R), (R, reach - depth), (R, reach - 0.8), (R + 0.8, reach + 0.01), (R + 0.8, reach + 2), (0, reach + 2)])
        h = M.revolve(prof, 96)
        return h if d == "+z" else h.rotate([180, 0, 0])
    # horizontal: teardrop whose point faces +z in the print frame (prints without support)
    tear = circ(R, seg=96) + poly([(R * math.sqrt(0.5), -R * math.sqrt(0.5)), (0, -R * math.sqrt(2)), (-R * math.sqrt(0.5), -R * math.sqrt(0.5))])
    h = ext_z(tear, reach - depth, reach + 2)            # along +z, point on -y
    h = h.rotate([-90, 0, 0])                            # along +y, point now +z (up while printing)
    ang = {"+y": 0, "-y": 180, "+x": -90, "-x": 90}[d]
    return h.rotate([0, 0, ang])


def dowel_node(dirs=("+x", "+y", "+z", "-z"), dowel=19.0, clearance=0.4, depth=25.0, wall=4.2):
    """Printed node for standard round timber dowel. Prints standing on its -z arm, no supports."""
    R = dowel / 2 + clearance / 2
    body_r = R + wall
    reach = depth + R + 1.5          # socket floors sit outside each other's dowel, so dowels never meet
    core = M.sphere(body_r, 96)
    horiz = [d for d in dirs if d[1] in "xy"]
    low = [core] + [_arm(d, body_r, reach) for d in horiz] + ([_arm("-z", body_r, reach)] if "-z" in dirs else [])
    body = M.batch_hull(low)
    if "+z" in dirs:
        body = body + M.batch_hull([M.sphere(body_r * 0.97, 96), _arm("+z", body_r * 0.999, reach)])
    holes = M.batch_boolean([_socket(d, R, reach, depth) for d in dirs], m3d.OpType.Add)
    return body - holes


def dowel_foot(dowel=19.0, clearance=0.4, depth=22.0, wall=4.2, h=30.0):
    R = dowel / 2 + clearance / 2
    body_r = R + wall
    prof = poly([(0, 0), (body_r - 1.2, 0), (body_r, 1.2), (body_r, h - 1.0), (body_r - 1.0, h), (R + 0.8, h), (R, h - 0.8),
                 (R, h - depth), (0, h - depth)])
    return M.revolve(prof, 96)


# ---------- light: pendant shade (LED only) ----------
def pendant_shade(H=170.0, R_top=34.0, R_bot=105.0, flutes=28, amp=0.035, t=2.0, hole_r=21.0, cap=3.0):


    def warp(v):
        x, y, z = v[:, 0], v[:, 1], v[:, 2]
        th = np.arctan2(y, x)
        r = np.hypot(x, y)
        s = r - 100.0
        R = R_bot + (R_top - R_bot) * (z / H)
        rr = R * (1 + amp * np.cos(flutes * th)) + s
        out = v.copy()
        out[:, 0] = rr * np.cos(th)
        out[:, 1] = rr * np.sin(th)
        return out

    shell = M.extrude(CS.circle(100.0, 360) - CS.circle(100.0 - t, 360), H + 1.0, n_divisions=80).warp_batch(warp)
    # top ring that holds a certified lamp-holder cord set
    ring = cyl_z(R_top * (1 - amp) - t / 2 + 1.0, H - cap, H + 1.0, seg=187).rotate([0, 0, 0.7]) - cyl_z(hole_r, H - cap - 1, H + 2, seg=187)
    trim = M.cube([600, 600, H + 10]).translate([-300, -300, -5])
    return (shell + ring) ^ trim


# ---------- utils ----------
def bridge_steps(cx, cy, r, z, slot_len, axis="y", toward=-1, layer=0.4):
    """Cuts that let a round hole start in a bridged roof with no supports. At the roof's first layer the hole is a
    slot as wide as the hole running the bridge's length (`slot_len` along `axis`, wall to wall), so that layer is two
    plain bridges; the next layer squares it off across the slot; the round hole starts above. `z` is the face the
    roof starts from (where it meets the cavity); `toward` (-1 or +1) is the direction the roof grows in print."""
    w = 2 * r + 0.4                         # a little wider than the hole, so the hole never grazes the slot's edges
    long = [slot_len, w] if axis == "x" else [w, slot_len]
    z0 = z if toward > 0 else z - layer
    slot = M.cube([long[0], long[1], layer + EPS], center=True).translate([cx, cy, z0 + layer / 2])
    z1 = z0 + toward * layer
    square = M.cube([w, w, layer + EPS], center=True).translate([cx, cy, z1 + layer / 2])
    return slot + square


def to_trimesh(man):
    import trimesh
    mesh = man.to_mesh()
    v = np.asarray(mesh.vert_properties)[:, :3]
    f = np.asarray(mesh.tri_verts)
    return trimesh.Trimesh(vertices=v, faces=f, process=True)


def est_grams(man, density=1.24, shell_mm=0.9, infill=0.15):
    V = man.volume()
    SA = man.surface_area()
    shell = min(V, SA * shell_mm)
    return density * (shell + infill * max(0.0, V - shell)) / 1000.0
