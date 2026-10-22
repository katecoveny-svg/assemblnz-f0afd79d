"""
dayrally cam — a 120-film pinhole camera that actually works, in the dayrally line.

Status: designed and checked digitally. Nothing printed. Proposed only.

Format .......... 120 roll film, 6×6 (54 × 54 mm image), 12 frames, red-window frame counting
Pinhole ......... 40 mm "focal length", 0.28 mm hole → f/143 (Rayleigh, λ 550 nm)
Field of view ... 68° across the frame, 87° on the diagonal (wide; the cos⁴ fall-off is part of the look)
Shutter ......... rotating disc on the front skin, click-stopped open and closed
Film path ....... supply spool → guide bar → 1.0 mm slot behind the gate → guide bar → take-up spool
Back ............ drop-on plate, lip-in-groove light labyrinth, four snap clips, red window with a cover
Tripod .......... 1/4"-20 nut trapped in the base
dayrally ........ the cradle carries the TURN flange (two keyways, 42 mm apart) and clips to the body, so
                  the camera locks onto any dayrally mount or Grid board exactly like a pod does.

Camera frame (millimetres): x across the film, y up (spool axes), z along the light. Film emulsion at z = 0,
pinhole at z = F. The body was drawn to print front face down (camera +z toward the bed), every cavity opening
upward or sloping inside 45°, the bores through the top and bottom walls teardrops; Bambu Studio still wanted
supports at the film plane that way, so it prints on its side (camera +x toward the bed), where it needs none.

Not printed: pinhole disc (10 mm disc from a drink can or 0.05 mm brass shim, pierced with a #10 needle and
sanded back to 0.28 mm), red window disc (12 mm from red lighting gel or red PETG), one 1/4"-20 nut, matte
black paint or flock for the cone (optional), a self-adhesive felt washer under the shutter slide (optional).

Dimensions marked VERIFY come from reference values, not from a spool in hand. Measure a real 120 spool and
a roll's backing paper before the first print.
"""
import math
import numpy as np
import manifold3d as m3d
import lib
import dayrally as d1
import dayrally2 as d2
from lib import M, CS, P, ext_z, ext_x, ext_y, cyl_z, rrect, circ, poly, round2d, EPS, flange_key_cut

# ---------------- optics ----------------
F = 40.0                                    # pinhole to film
LAMBDA_MM = 0.00055
PINHOLE_D = round(1.9 * math.sqrt(LAMBDA_MM * F), 2)      # 0.28 mm (Rayleigh)
F_NUMBER = round(F / PINHOLE_D)                          # 143
GATE = 54.0                                 # image square
FOV_SIDE = round(math.degrees(2 * math.atan(GATE / 2 / F)))
FOV_DIAG = round(math.degrees(2 * math.atan(GATE * math.sqrt(2) / 2 / F)))

# ---------------- film and spool (VERIFY against a real spool) ----------------
FILM_W = 61.5                               # ISO 732: 60.7 to 61.7 mm wide
SLOT_W = FILM_W + 1.0                       # film channel width (y)
SLOT_GAP = 1.0                              # film + backing paper is about 0.25 mm; the rest is play
SPOOL_L = 64.5                              # VERIFY: flange-to-flange length
SPOOL_HOLE_D = 4.9                          # VERIFY: end hole in the hub
SPOOL_SLOT_W, SPOOL_SLOT_L = 1.8, 9.0       # VERIFY: drive slot across the hub end
CHAMBER_D = 28.0                            # bore around a full roll (flange about 25.5)
CHAMBER_L = SPOOL_L + 2.5                   # 67: room to drop a spool in past the floor pin
CHAMBER_X = 45.0                            # spool axes at x = ±45
CHAMBER_Z = -16.0                           # spool axes behind the film plane
FLOOR_PIN_D, FLOOR_PIN_H = SPOOL_HOLE_D - 0.5, 2.0

# ---------------- body ----------------
WALL = 2.4
HX = CHAMBER_X + CHAMBER_D / 2 + 6.2        # 65.2 half length: chamber, labyrinth shelf, wall
HY = CHAMBER_L / 2 + 6.5                    # 40.0 half height: thick top and bottom walls carry the bores and the nut
Z_FRONT = F + WALL                          # 42.4: outer front face; the skin glues on here
Z_BACK = CHAMBER_Z - CHAMBER_D / 2 - 3.0    # -33.0: outer back face
GATE_T = 2.0                                # gate frame between the cone and the film
CONE_BASE = 60.0                            # cone square where it meets the gate frame
BORE_IN, BORE_OUT = 3.0, 9.0                # pinhole seat bore: 3 at the disc, opening toward the front
DISC_D, DISC_T = 11.0, 0.5                  # pinhole disc recess on the inside of the front wall
BAR_R = 2.5                                 # film guide bars; the top of each bar is the film plane
BAR_X = 32.5
SLOT_X = 30.0                               # the 1 mm slot runs to |x| = 30, then the bar takes over
POCKET = (25.0, 25.0, -8.0)                 # back pocket half-x, half-y, floor z (behind the red window)
WINDOW_D = 12.0                             # red window tunnel to the backing paper
GROOVE_W, GROOVE_D = 1.6, 3.0               # labyrinth groove in the back face
GROOVE_IN = 1.0                             # groove sits this far inside the outer wall
LIP_W, LIP_H = 1.2, 2.8
PLATE_T = 2.4
CLIP_W, CLIP_T, CLIP_HOOK = 14.0, 1.6, 0.9
CLIP_X = 22.0                               # clips at x = ±22 on the top and bottom faces
CLIP_Z = -18.0                              # catch groove centre
KNOB_BORE = 8.4                             # winder shaft 8.0 with three 0.25 ridges: a light press
PIN_BORE = 4.8                              # supply pin 4.4
BOSS_D, BOSS_H = 16.0, 4.0                  # light-trap boss on the top face around each bore
SKIRT_ID, SKIRT_OD, SKIRT_H = 24.0, 28.0, BOSS_H
NUT_AF, NUT_T, BOLT_D = 11.4, 5.5, 6.6      # 1/4"-20 nut (7/16" = 11.11 AF) and bolt clearance
CRADLE_GROOVE_Y = -HY + 5.0                 # cradle lips snap into a groove on the body ends, 5 mm up
# skin (front plate) and shutter
SKIN_T = 3.0
SKIN_WINDOW_D = 12.0
FELT_D = 20.0
PIVOT = (-14.0, 0.0)                        # shutter disc pivot on the skin
SHUT_D, SHUT_T, SHUT_HOLE_D = 46.0, 1.6, 13.0
DISC_BUMP_R, CLOSED_DEG = 19.0, 75.0        # detent bump radius on the disc; rotation from open to closed
PATTERN = 0.8                               # raised pattern on the skin, second colour


def _tear_y(r, cx, cz):
    """Circle in the (x, z) plane with a 45° point toward -z: a bore or boss along y that prints without
    support when the body stands front-down (print-up is camera -z)."""
    k = r * math.sqrt(0.5)
    return circ(r, cx, cz, seg=72) + poly([(cx - k, cz - k), (cx, cz - r * math.sqrt(2)), (cx + k, cz - k)])


def _cyl_y(r, cx, cz, y0, y1, seg=96):
    return ext_y(circ(r, cx, cz, seg=seg), y0, y1)


def _hex_y(af, cx, cz, y0, y1):
    """Hex pocket along y with a 45° roof on the print-up side (camera -z), so it prints without support."""
    R = af / math.sqrt(3)
    pts = [(cx + R * math.cos(math.radians(90 + 60 * i)), cz + R * math.sin(math.radians(90 + 60 * i))) for i in range(6)]
    roof = poly([(cx - af / 2, cz - R / 2), (cx, cz - R / 2 - af / 2), (cx + af / 2, cz - R / 2)])
    return ext_y(poly(pts) + roof, y0, y1)


def cone_cut():
    """Square pyramid from the pinhole seat to the gate frame, then the image aperture through the frame."""
    top = ext_z(rrect(BORE_IN + 3.0, BORE_IN + 3.0, 1.0), F - 0.01, F + 0.01)
    base = ext_z(rrect(CONE_BASE, CONE_BASE, 2.0), GATE_T, GATE_T + 0.02)
    cone = M.batch_hull([top, base])
    gate = ext_z(rrect(GATE, GATE, 0.6), -SLOT_GAP - 0.5, GATE_T + 0.1)
    seat = cyl_z(DISC_D / 2, F - DISC_T, F + 0.5, seg=72)
    bore = cyl_z(BORE_IN / 2, F - 0.5, Z_FRONT + 1.0, r1=BORE_OUT / 2 + 0.6, seg=72)
    return cone + gate + seat + bore


def chamber_cut(sx):
    cx = sx * CHAMBER_X
    y0, y1 = -CHAMBER_L / 2, CHAMBER_L / 2
    bore = _cyl_y(CHAMBER_D / 2, cx, CHAMBER_Z, y0, y1)
    slot = ext_y(rrect(CHAMBER_D, CHAMBER_Z - Z_BACK + 2.0, 0.2, cx, (CHAMBER_Z + Z_BACK - 2.0) / 2), y0, y1)
    # clearance so the film can run over the guide bar and down into the chamber
    ramp = ext_y(rrect(CHAMBER_X - SLOT_X, -CHAMBER_Z + 1.0, 0.2, sx * (SLOT_X + CHAMBER_X) / 2, (CHAMBER_Z - 1.0) / 2), -SLOT_W / 2, SLOT_W / 2)
    return bore + slot + ramp


RIDGE_PITCH, RIDGE_DEPTH, RIDGE_FLAT = 6.0, 2.6, 0.6


def film_slot_cut():
    """The 1 mm channel behind the film. Its far wall is a row of 45° V grooves running along the film, so the
    body prints it without support; the backing paper rides on the ridge tips."""
    slot = ext_z(rrect(2 * SLOT_X + 0.2, SLOT_W, 0.2), -SLOT_GAP, 0.0)
    n = int(SLOT_W // RIDGE_PITCH)
    vs = []
    for i in range(n + 1):
        y = (i - n / 2) * RIDGE_PITCH
        half = (RIDGE_PITCH - RIDGE_FLAT) / 2
        v = poly([(-SLOT_GAP + 0.05, y - half), (-SLOT_GAP - half * 1.2, y), (-SLOT_GAP + 0.05, y + half)])   # (z, y), 50° flanks
        vs.append(ext_x(v, -SLOT_X, SLOT_X))
    grooves = M.batch_boolean(vs, m3d.OpType.Add)
    grooves = grooves ^ ext_z(rrect(2 * SLOT_X + 0.2, SLOT_W - 0.4, 0.2), -SLOT_GAP - 10, 0.0)     # keep inside the channel width
    return slot + grooves


def back_pocket_cut():
    hx, hy, zf = POCKET
    pocket = ext_z(rrect(2 * hx, 2 * hy, 6.0), Z_BACK - 1.0, zf)
    tunnel = cyl_z(WINDOW_D / 2, zf - 0.1, -SLOT_GAP + 0.1, seg=72)
    return pocket + tunnel


def _groove_edges():
    ox, oy = HX - WALL - GROOVE_IN, HY - WALL - GROOVE_IN
    return ox, oy


def labyrinth_groove_cut():
    ox, oy = _groove_edges()
    ring = rrect(2 * ox, 2 * oy, 5.0) - rrect(2 * (ox - GROOVE_W), 2 * (oy - GROOVE_W), 5.0 - GROOVE_W)
    return ext_z(ring, Z_BACK - 1.0, Z_BACK + GROOVE_D)


def _slab_y(w, z0, z1, cx, y_a, y_b):
    """Box in x/z extruded between two y values (either order)."""
    return ext_y(rrect(w, z1 - z0, 0.3, cx, (z0 + z1) / 2), min(y_a, y_b), max(y_a, y_b))


def clip_catch_cut():
    """Recesses on the top and bottom faces so the back's clips sit flush, with a catch groove each."""
    cuts = []
    for sy in (-1, 1):
        for sx in (-1, 1):
            yo = sy * (HY + 0.5)
            cuts.append(_slab_y(CLIP_W + 0.8, Z_BACK - 1.0, CLIP_Z + 4.0, sx * CLIP_X, yo, yo - sy * (CLIP_T + 0.2 + 0.5)))
            cuts.append(_slab_y(CLIP_W + 0.8, CLIP_Z - 1.9, CLIP_Z + 1.9, sx * CLIP_X, yo, yo - sy * (CLIP_T + 0.2 + 0.5 + CLIP_HOOK)))
    return M.batch_boolean(cuts, m3d.OpType.Add)


def knob_bores_cut():
    y0, y1 = HY - 6.5 - 1.0, HY + BOSS_H + 1.0
    take = ext_y(_tear_y(KNOB_BORE / 2, CHAMBER_X, CHAMBER_Z), y0, y1)
    supply = ext_y(_tear_y(PIN_BORE / 2, -CHAMBER_X, CHAMBER_Z), y0, y1)
    return take + supply


def tripod_cut():
    nut = _hex_y(NUT_AF, 0.0, 20.0, -HY - 1.0, -HY + NUT_T)
    bolt = ext_y(_tear_y(BOLT_D / 2, 0.0, 20.0), -HY + NUT_T - 0.1, -HY + NUT_T + 3.5)
    return nut + bolt


def pivot_pocket_cut():
    return cyl_z(2.1, Z_FRONT - 3.0, Z_FRONT + 1.0, cx=PIVOT[0], cy=PIVOT[1], seg=36)


def cradle_groove_cut():
    g = []
    for sx in (-1, 1):
        g.append(ext_x(rrect(Z_FRONT - Z_BACK - 2 * WALL - 4.0, 2.0, 0.3, (Z_BACK + Z_FRONT) / 2, CRADLE_GROOVE_Y),
                       min(sx * HX, sx * (HX - 0.8)), max(sx * HX, sx * (HX - 0.8))))
    return g[0] + g[1]


def body():
    """One piece. Prints on its side (camera +x toward the bed), no supports."""
    L, H = 2 * HX, 2 * HY
    blk = ext_z(rrect(L, H, 8.0), Z_BACK, Z_FRONT)
    for cx in (-CHAMBER_X, CHAMBER_X):                       # light-trap bosses around the two bores
        blk = blk + ext_y(_tear_y(BOSS_D / 2, cx, CHAMBER_Z), HY - 0.5, HY + BOSS_H)
    cuts = [cone_cut(), chamber_cut(-1), chamber_cut(1), film_slot_cut(), back_pocket_cut(), labyrinth_groove_cut(),
            clip_catch_cut(), knob_bores_cut(), tripod_cut(), cradle_groove_cut(), pivot_pocket_cut()]
    b = blk - M.batch_boolean(cuts, m3d.OpType.Add)
    for sx in (-1, 1):
        # film guide bar: its top is the film plane, it sits on the gate frame and spans the slot
        b = b + _cyl_y(BAR_R, sx * BAR_X, -BAR_R, -SLOT_W / 2 - 0.5, SLOT_W / 2 + 0.5)
        b = b + ext_y(rrect(BAR_X - SLOT_X + 1.2, BAR_R, 0.2, sx * ((SLOT_X + BAR_X) / 2 + 0.2), -BAR_R / 2), -SLOT_W / 2 - 0.5, SLOT_W / 2 + 0.5)
        # floor pin the spool drops onto, chamfered
        yb = -CHAMBER_L / 2
        pin = _cyl_y(FLOOR_PIN_D / 2, sx * CHAMBER_X, CHAMBER_Z, yb - 0.5, yb + FLOOR_PIN_H, seg=48)
        tip = M.batch_hull([ext_y(circ(FLOOR_PIN_D / 2, sx * CHAMBER_X, CHAMBER_Z, seg=48), yb + FLOOR_PIN_H - 0.01, yb + FLOOR_PIN_H),
                            ext_y(circ(FLOOR_PIN_D / 2 - 0.7, sx * CHAMBER_X, CHAMBER_Z, seg=48), yb + FLOOR_PIN_H + 0.8, yb + FLOOR_PIN_H + 0.82)])
        b = b + pin + tip
    return b


def back():
    """Back plate. Prints inner face up: lip, clips and the window recess all point up."""
    L, H = 2 * HX, 2 * HY
    z0, z1 = Z_BACK - PLATE_T, Z_BACK
    plate = ext_z(rrect(L, H, 8.0), z0, z1)
    ox, oy = _groove_edges()
    ox, oy = ox - (GROOVE_W - LIP_W) / 2, oy - (GROOVE_W - LIP_W) / 2
    lip = ext_z(rrect(2 * ox, 2 * oy, 5.0) - rrect(2 * (ox - LIP_W), 2 * (oy - LIP_W), 5.0 - LIP_W), z1 - 0.1, z1 + LIP_H)
    plate = plate + lip
    plate = plate - cyl_z(WINDOW_D / 2 - 1.5, z0 - 1, z1 + 1, seg=72)                 # window
    plate = plate - cyl_z(WINDOW_D / 2 + 0.6, z1 - 0.8, z1 + 1, seg=72)               # red disc recess, inside
    plate = plate - cyl_z(1.7, z0 - 1, z1 + 1, cx=0.0, cy=-13.0, seg=36)              # cover pivot
    for sy in (-1, 1):
        for sx in (-1, 1):
            yo = sy * (HY - CLIP_T / 2 - 0.1)
            arm = ext_z(rrect(CLIP_W, CLIP_T, 0.3, sx * CLIP_X, yo), z1 - 0.1, CLIP_Z + 1.4)
            yi = yo - sy * CLIP_T / 2                                                 # arm face toward the body
            wedge = poly([(CLIP_Z - 1.6, yi + sy * 0.3), (CLIP_Z - 1.0, yi - sy * CLIP_HOOK), (CLIP_Z + 0.8, yi - sy * CLIP_HOOK), (CLIP_Z + 1.2, yi + sy * 0.3)])
            hook = ext_x(wedge, sx * CLIP_X - CLIP_W / 2, sx * CLIP_X + CLIP_W / 2)
            plate = plate + arm + hook
    return plate


def window_cover():
    """Rotates over the red window on a split pin (or swap the pin for an M3 screw). Prints flat."""
    t = 1.6
    disc = ext_z(circ(WINDOW_D / 2 + 2.5), 0, t)
    ear = ext_z(circ(4.0, 0.0, -13.0), 0, t)
    cover = M.batch_hull([disc, ear]) + ext_z(rrect(6.0, 4.0, 1.5, 0.0, 10.0), 0, t + 1.4)
    pin = cyl_z(1.5, t - 0.1, t + PLATE_T + 1.4, cx=0.0, cy=-13.0, seg=36)
    barb = M.batch_hull([cyl_z(1.5, t + PLATE_T + 0.2, t + PLATE_T + 0.22, cx=0, cy=-13.0, seg=36),
                         cyl_z(1.85, t + PLATE_T + 0.6, t + PLATE_T + 0.62, cx=0, cy=-13.0, seg=36),
                         cyl_z(1.2, t + PLATE_T + 1.4, t + PLATE_T + 1.42, cx=0, cy=-13.0, seg=36)])
    pin = (pin + barb) - ext_z(rrect(0.8, 6.0, 0.1, 0.0, -13.0), t + 0.8, t + PLATE_T + 2.0)
    return cover + pin


def _knob_head(h):
    head = ext_z(rrect(SKIRT_OD, SKIRT_OD, SKIRT_OD / 2 - 0.01, seg=96), 0, h)
    for i in range(8):
        a = math.radians(i * 45)
        head = head - cyl_z(2.8, -1, h + 1, cx=(SKIRT_OD / 2 + 0.8) * math.cos(a), cy=(SKIRT_OD / 2 + 0.8) * math.sin(a), seg=36)
    skirt = cyl_z(SKIRT_OD / 2 - 0.8, h - 0.1, h + SKIRT_H, seg=96) - cyl_z(SKIRT_ID / 2, h - 0.2, h + SKIRT_H + 1, seg=96)
    return head + skirt


def winder_knob():
    """One piece: head, skirt over the body boss (light trap), shaft, drive blade. The blade is narrower than
    the bore so the knob lifts straight out for loading. Three ridges on the shaft make it a light press."""
    h = 6.0
    k = _knob_head(h)
    top = h + SKIRT_H + 6.5 + 0.2                         # shaft reaches the chamber ceiling
    shaft = cyl_z(KNOB_BORE / 2 - 0.2, h - 0.1, top, seg=72)
    for i in range(3):
        a = i * 120
        shaft = shaft + ext_z(rrect(0.9, 1.4, 0.3, KNOB_BORE / 2 - 0.4, 0.0).rotate(a), h + SKIRT_H + 1.0, h + SKIRT_H + 5.5)
    blade = ext_z(rrect(SPOOL_SLOT_L - 1.0, SPOOL_SLOT_W - 0.4, 0.3), top - 0.1, top + 6.0)
    blade = M.batch_hull([blade, ext_z(rrect(SPOOL_SLOT_L - 2.2, SPOOL_SLOT_W - 1.0, 0.2), top + 6.6, top + 6.62)])
    return k + shaft + blade


def supply_pin():
    """Supply-side pin with the same light-trap skirt. Pull up to load, push down to hold the spool."""
    h = 5.0
    k = _knob_head(h)
    top = h + SKIRT_H + 6.5 + 0.2
    pin = cyl_z(PIN_BORE / 2 - 0.2, h - 0.1, top + 6.0, seg=48)
    tip = M.batch_hull([cyl_z(PIN_BORE / 2 - 0.2, top + 5.9, top + 6.0, seg=48), cyl_z(PIN_BORE / 2 - 1.0, top + 6.8, top + 6.82, seg=48)])
    return k + pin + tip


def skin(style="dots", name=None, font=None):
    """Front skin: covers the body front, carries the shutter rails, the felt recess and a raised dayrally pattern
    in a second colour. Prints outer face up. Returns (skin, pattern)."""
    L, H = 2 * HX, 2 * HY
    z0, z1 = Z_FRONT, Z_FRONT + SKIN_T
    s = ext_z(rrect(L, H, 8.0), z0, z1)
    s = s - cyl_z(SKIN_WINDOW_D / 2, z0 - 1, z1 + 1, seg=72)
    s = s - cyl_z(FELT_D / 2, z1 - 0.4, z1 + 1, seg=72)
    px, py = PIVOT
    s = s - cyl_z(1.7, z0 - 1, z1 + 1, cx=px, cy=py, seg=36)                        # pivot for the shutter disc
    for ang in (180.0, 180.0 + CLOSED_DEG):                                        # detents: open, closed
        cx, cy = px + DISC_BUMP_R * math.cos(math.radians(ang)), py + DISC_BUMP_R * math.sin(math.radians(ang))
        s = s - M.batch_hull([cyl_z(1.9, z1 - 0.6, z1 - 0.58, cx=cx, cy=cy, seg=36), cyl_z(2.6, z1 - 0.02, z1 + 0.5, cx=cx, cy=cy, seg=36)])
    pattern = None
    if style == "name":
        cs = lib.text_cs(name, font, cap_height=12.0, max_width=42.0).translate([41.0, 0.0]) if (name and font) else None
    else:
        cs = d2.pattern_cs(style, L, H, name, font)
    if cs is not None and cs.area() > 1:
        keep = cs - circ(SHUT_D / 2 + 9.0, PIVOT[0], PIVOT[1]) - circ(FELT_D / 2 + 3.0)
        if keep.area() > 1:
            pattern = ext_z(keep, z1 - 0.4, z1 + PATTERN)
            s = s - ext_z(keep, z1 - 0.4, z1 + 1)
    return s, pattern


def shutter_disc():
    """Rotary shutter: a disc on a split pin over the skin's pivot, with a hole that lines up with the window when
    open. Built hole-at-open, bump up (prints flat); in use the bump faces the skin and clicks into the detents."""
    t = SHUT_T
    px, py = PIVOT
    disc = ext_z(circ(SHUT_D / 2, px, py, seg=120), 0, t) - cyl_z(SHUT_HOLE_D / 2, -1, t + 1, cx=0.0, cy=0.0, seg=72)
    tab = ext_z(rrect(10.0, 8.0, 3.0, px, py + SHUT_D / 2 + 2.0), 0, t)                # in-plane finger lug
    bx, by = px + DISC_BUMP_R * math.cos(math.pi), py
    bump = M.batch_hull([cyl_z(2.2, t - 0.02, t, cx=bx, cy=by, seg=36), cyl_z(1.4, t + 0.48, t + 0.5, cx=bx, cy=by, seg=36)])
    pin = cyl_z(1.5, t - 0.1, t + SKIN_T + 1.6, cx=px, cy=py, seg=36)
    barb = M.batch_hull([cyl_z(1.5, t + SKIN_T + 0.2, t + SKIN_T + 0.22, cx=px, cy=py, seg=36),
                         cyl_z(1.85, t + SKIN_T + 0.7, t + SKIN_T + 0.72, cx=px, cy=py, seg=36),
                         cyl_z(1.2, t + SKIN_T + 1.6, t + SKIN_T + 1.62, cx=px, cy=py, seg=36)])
    pin = (pin + barb) - ext_z(rrect(0.8, 6.0, 0.1, px, py), t + 0.8, t + SKIN_T + 2.0)
    return disc + tab + pin


def cradle():
    """TURN cradle: a flange with two keyways 42 mm apart (the keys lock it to a mount before the camera clips
    in) and two lips that snap into the groove on the body ends."""
    Lx, Wy = 2 * HX + 2 * (0.3 + 1.8) + 2.0, 60.0
    z0, z1 = lib.FL_Z0, lib.FL_Z1
    plate = ext_z(rrect(Lx, Wy, 8.0), z0, z1)
    for (x, y) in d1.KEYS:
        plate = plate - flange_key_cut(x, y)
    for sx in (-1, 1):
        xi = sx * (HX + 0.3)
        lip = ext_z(rrect(1.8, 40.0, 0.5, sx * (HX + 0.3 + 0.9), 0.0), z1 - 0.1, z1 + 7.2)
        hook = ext_y(poly([(xi + sx * 0.3, z1 + 4.0), (xi - sx * 0.8, z1 + 4.8), (xi - sx * 0.8, z1 + 5.6), (xi + sx * 0.3, z1 + 6.4)]), -20.0, 20.0)
        plate = plate + lip + hook
    return plate


def exposure_table(iso=400):
    """Sunny-16 starting points at f/143 in seconds, before reciprocity correction."""
    stops = {"bright sun": 0, "hazy sun": 1, "overcast": 3, "open shade": 4, "indoors by a window": 9}
    k = (F_NUMBER / 16.0) ** 2
    return {kk: round((1.0 / iso) * (2 ** s) * k, 1) for kk, s in stops.items()}


PARTS = {
    "cam-body": ("dayrally cam body", body, "on_side", "camera", "Prints on its side, no supports (front face down needed them at the film plane). Ink PLA Matte; paint or flock the cone matte black."),
    "cam-back": ("dayrally cam back", back, "as_is", "camera", "Prints inner face up. Red window disc glues into the recess."),
    "cam-window-cover": ("Red window cover", window_cover, "as_is", "camera", "Split pin into the back, or an M3 screw."),
    "cam-winder-knob": ("Winder knob", winder_knob, "as_is", "camera", "Head down. The skirt covers the body boss; the blade lifts straight out for loading."),
    "cam-supply-pin": ("Supply pin", supply_pin, "as_is", "camera", "Pull up to load the film."),
    "cam-shutter-disc": ("Shutter disc", shutter_disc, "as_is", "camera", "Split pin into the skin; bump faces the skin in use."),
    "cam-cradle": ("TURN cradle", cradle, "as_is", "camera", "Two keys lock it to any dayrally mount or Grid board; the camera clips in."),
}
