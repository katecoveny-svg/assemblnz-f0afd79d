"""
dayrally tackle — the tackle wall and the reel, on the TURN (Kate's photos, 21 October 2026). Proposed, unprinted.

- pack case: a frame keyed to the board that a soft-plastics packet slides into from the top, its printed face
  showing through a big front window, held by side rails and a bottom lip; two sizes, for the 5 inch and 7 inch
  Daiwa Bait Junkie packs and anything near them. A printed window is never clear; an open one is.
- pack rail: three pegs on a bar that take packets by their hang holes, lips so they stay on.
- reel dock: a TURN cradle a spinning reel hangs from by its foot, like a rod's reel seat: the foot plate slides
  into a slot, the stem passes the gap, the reel hangs below. Sized to a 2500-size foot; the first print measures.
- reel knob: a handle knob for the common Shimano/Daiwa knob shaft (4 mm, two 4 × 7 × 2.5 bearings), fluted, in
  the owner's colour, with a name on the end. The only part of a reel worth printing: it carries no load the
  bearings do not take. Body, gears, drag and bearings are not printable to spec; what prints is what the hand
  touches and what the reel hangs on.
- spool band: a TPU band that holds the line against the spool lip, with a tab to find it.
- universal saddle: a V cradle for 22 to 45 mm (bars, stems, seat posts, top tubes, scooter stems) with two
  channels for 20 mm ladder straps, plus the strap and its buckle in TPU, so the pod and the kits fit any bike.
"""
import math
import os
import manifold3d as m3d
import lib
import dayrally as d1
import dayrally2 as d2
from lib import M, CS, P, ext_z, ext_x, ext_y, cyl_z, rrect, circ, poly, round2d, flange_key_cut, board_socket_cut, text_cs, EPS

FONT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "fonts", "Fredoka-Bold.ttf")
Z0, Z1 = lib.FL_Z0, lib.FL_Z1          # the TURN flange, 8..13, keys 42 mm apart on x
KEYS = d1.KEYS
INLAY = d2.INLAY

# soft-plastics packets, outer, from the Daiwa Bait Junkie packs: width, height, full thickness
PACKS = {"5": (92.0, 175.0, 12.0), "7": (105.0, 235.0, 14.0)}


def pack_case(size="5", wall=1.6, show=0.78):
    """A keyed frame the packet slides into from the top. Back plate carries the flange; side rails and a bottom lip
    hold the packet; the front is one big window with a 12 mm frame. `show` is how much of the packet height the
    case covers (the rest stands proud for the fingers)."""
    W, H, T = PACKS[size]
    cw, ct = W + 2.0, T + 1.5
    ch = H * show
    Lx, Ly = cw + 2 * wall, ch
    back_t = 3.6                                                                          # room for the key heads (3.1 proud of the flange)
    back = ext_z(rrect(Lx, Ly, 6.0, 0, 0), Z1 - 0.01, Z1 + back_t)                      # back plate on the flange
    plate = ext_z(rrect(Lx, Ly, 6.0, 0, 0), Z0, Z1)                                      # the flange itself
    for (x, y) in KEYS:
        plate = plate - flange_key_cut(x, y)
        back = back - cyl_z(11.5, Z1 - 1, Z1 + back_t + 1, cx=x, cy=y, seg=64)            # the keys turn from inside the case
    zf, zb = Z1 + back_t, Z1 + back_t + ct                                                # inside the frame, back to front
    sides = ext_z(rrect(Lx, Ly, 6.0, 0, 0) - rrect(cw, Ly + 2, 0.1, 0, 0), zf - EPS, zb + wall)
    lip = ext_z(rrect(Lx, wall + 2.0, 1.0, 0, -Ly / 2 + (wall + 2.0) / 2), zf - EPS, zb + wall)
    front = ext_z(rrect(Lx, Ly, 6.0, 0, 0) - rrect(cw - 24.0, Ly - 24.0, 6.0, 0, 2.0), zb, zb + wall)   # the window frame
    # a thumb notch at the top of the front frame so the packet lifts out
    front = front - ext_z(rrect(30.0, 14.0, 6.0, 0, Ly / 2), zb - 1, zb + wall + 1)
    body = plate + back + sides + lip + front
    # lighten the back plate: a window there too, leaving the flange and a cross
    body = body - ext_z(rrect(cw - 30.0, Ly * 0.3, 8.0, 0, Ly * 0.26), Z1 + 0.6, zf + 1)
    body = body - ext_z(rrect(cw - 30.0, Ly * 0.22, 8.0, 0, -Ly * 0.3), Z1 + 0.6, zf + 1)
    return body


def pack_rail(pegs=3, pitch=42.0):
    """Three pegs on a keyed bar; packets hang by their holes. A lip on each peg; the bar sits proud of the board so
    the packets clear the keys below."""
    Lx, Ly = pegs * pitch + 12.0, 26.0
    bar = ext_z(rrect(Lx, Ly, 8.0, 0, 0), Z0, Z1 + 3.0)
    for (x, y) in KEYS:
        bar = bar - flange_key_cut(x, y)
        bar = bar - cyl_z(11.5, Z1, Z1 + 4.0, cx=x, cy=y, seg=64)                         # key heads sit in open pockets
    for k in range(pegs):
        x = -(pegs - 1) / 2 * pitch + k * pitch
        peg = cyl_z(3.2, Z1 + 3.0 - EPS, Z1 + 3.0 + 16.0, cx=x, cy=4.0, seg=48)
        head = M.batch_hull([cyl_z(3.2, Z1 + 3.0 + 16.0, Z1 + 3.0 + 16.1, cx=x, cy=4.0, seg=48), cyl_z(5.2, Z1 + 3.0 + 18.0, Z1 + 3.0 + 20.0, cx=x, cy=4.0, seg=48)])
        bar = bar + peg + head
    return bar


# a 2500-size spinning reel foot: plate length, width at the ends, plate thickness, stem width and thickness
FOOT = {"length": 60.0, "width": 17.0, "thick": 3.2, "stem_w": 14.0, "stem_t": 8.0}


def reel_dock():
    """The reel hangs in front of the board by its foot, the way a reel seat holds it: a block on the flange with a
    horizontal slot in its front face that the foot plate slides into, a gap below the slot for the stem, the reel
    body hanging under. The keys turn from the front through open pockets."""
    f = FOOT
    Lx, Ly = 84.0, 62.0
    zF = Z1 + 22.0                                                       # the block's front face
    body = ext_z(rrect(Lx, Ly, 10.0, 0, 0), Z0, zF)
    for (x, y) in KEYS:
        body = body - flange_key_cut(x, y)
        body = body - cyl_z(11.5, Z1, zF + 1, cx=x, cy=y, seg=64)
    y_slot = 18.0                                                        # the foot plate's underside
    slot = ext_z(rrect(f["length"] + 2.0, f["thick"] + 0.8, 0.6, 0, y_slot + (f["thick"] + 0.8) / 2), Z1 + 4.0, zF + 1)
    stem = ext_z(rrect(f["stem_w"] + 2.0, y_slot + Ly / 2 + 2.0, 1.0, 0, (y_slot - Ly / 2 - 2.0) / 2), Z1 + 4.0, zF + 1)
    body = body - slot - stem
    # lighten the block: pockets in the back corners, away from the keys and the slot
    for sx in (-1, 1):
        body = body - ext_z(rrect(16.0, 16.0, 4.0, sx * 32.0, -22.0), Z1 + 1.5, zF - 2.0)
    return body


KNOB_SHAFT, KNOB_BEARING = 4.0, (7.0, 2.5)       # shaft Ø, bearing outer Ø and width (two per knob)


def reel_knob(d=22.0, L=26.0, name=None, font=None):
    """A fluted T knob on the common 4 mm knob shaft: two 7 mm bearing seats at the ends of a Ø4.6 bore, a cap end
    with the owner's name inlaid, eight soft flutes. Prints standing on the open (shaft) end."""
    body = M.batch_hull([cyl_z(d / 2 - 2.0, 0, 0.01, seg=96), cyl_z(d / 2, 5.0, L - 5.0, seg=96), cyl_z(d / 2 - 3.0, L - 0.01, L, seg=96)])
    for i in range(8):
        a = i * 45
        body = body - cyl_z(3.0, 4.0, L - 4.0, cx=d / 2 + 1.0, cy=0, seg=48).rotate([0, 0, a])
    body = body - cyl_z(KNOB_SHAFT / 2 + 0.3, -1, L - 3.0, seg=48)
    bo, bw = KNOB_BEARING
    body = body - cyl_z(bo / 2 + 0.05, -1, bw, seg=64)                              # outer bearing seat
    body = body - cyl_z(bo / 2 + 0.05, L - 3.0 - bw, L - 3.0 + 0.0, seg=64)        # inner bearing seat, under the cap
    inlay = None
    if name and font:
        cs = text_cs(name, font, cap_height=4.0, max_width=d - 8).translate([0, 0])
        inlay = ext_z(cs, L - INLAY, L)
        body = body - ext_z(cs, L - INLAY, L + 1)
    return body, inlay


def spool_band(spool_d=47.0, w=6.0, t=1.6):
    """TPU band for the spool lip with a tab that holds the line end. Prints flat."""
    r = spool_d / 2 - 1.5                                                  # stretches on
    ring = ext_z(circ(r + t, seg=128) - circ(r, seg=128), 0, w)
    tab = ext_z(rrect(10.0, 8.0, 2.0, r + t + 3.0, 0), 0, w) - ext_z(rrect(6.0, 1.2, 0.5, r + t + 4.0, 0), -1, w + 1)
    return ring + tab


def universal_saddle(d_min=22.0, d_max=45.0, strap_w=20.0):
    """A V cradle that seats any round tube from 22 to 45 mm, two channels for 20 mm ladder straps or zip ties, on
    the TURN socket body (the pod's floor and every accessory's flange lock to it)."""
    Lx, Wy, depth = 84.0, 44.0, 30.0
    body = d2._socket_body(Lx, Wy, depth, r=10.0)
    half = math.radians(50)
    gd = 24.0
    v = poly([(-gd * math.tan(half), -depth - 0.01), (gd * math.tan(half), -depth - 0.01), (0, -depth + gd)])
    body = body - ext_y(v, -Wy, Wy)
    for y in (-12.0, 12.0):                                               # strap channels across the V
        body = body - ext_x(rrect(strap_w + 1.0, 3.6, 1.0, -depth + 11.0, y), -Lx, Lx)
    return body


def ladder_strap(L=240.0, w=20.0, t=2.4, pitch=8.0):
    """TPU 95A ladder strap: teeth every 8 mm for the buckle, a rounded tongue, a slot at the root for the buckle pin."""
    body = ext_z(rrect(L, w, w / 2 - 0.01, 0, 0), 0, t)
    teeth = [ext_z(rrect(2.4, w - 6.0, 0.6, -L / 2 + 30.0 + i * pitch, 0), t - 0.4, t + 1.6) for i in range(int((L - 60.0) / pitch))]
    body = body + M.batch_boolean(teeth, m3d.OpType.Add)
    body = body - ext_z(rrect(6.0, w - 8.0, 1.5, -L / 2 + 10.0, 0), -1, t + 1)
    return body


def strap_buckle(w=20.0):
    """The catch the ladder strap pulls through and locks on; a pin bar for the strap's root slot."""
    body = ext_z(rrect(w + 10.0, 14.0, 2.0, 0, 0), 0, 8.0)
    body = body - ext_z(rrect(w + 1.0, 3.4, 0.8, 0, 2.5), -1, 9)                     # the strap passes through
    body = body - ext_z(rrect(w + 1.0, 2.0, 0.5, 0, -3.5), -1, 9)                    # the pin slot
    tooth = ext_z(rrect(w - 4.0, 1.6, 0.4, 0, 0.6), 5.0, 8.0)
    return body + tooth


PARTS = {
    "tk-pack-case-5": ("Pack case, 5 inch packs", lambda: pack_case("5"), "on_bottom", "tackle", "Keyed frame with an open front window for a 92 × 175 mm soft-plastics packet. Prints standing on its bottom lip, open top up: no supports."),
    "tk-pack-case-7": ("Pack case, 7 inch packs", lambda: pack_case("7"), "on_bottom", "tackle", "For a 105 × 235 mm packet. Prints standing on its bottom lip."),
    "tk-pack-rail": ("Pack rail, 3 pegs", pack_rail, "as_is", "tackle", "Packets hang by their holes; lips keep them on. Prints flange down, pegs up."),
    "tk-reel-dock": ("Reel dock", reel_dock, "face_down", "tackle", "A spinning reel hangs by its foot; sized to a 2500 foot, measure yours."),
    "tk-reel-knob": ("Reel knob (sample: MILA)", lambda: reel_knob(name="MILA", font=FONT)[0], "as_is", "tackle", "Fluted T knob for the common 4 mm knob shaft with two 4 × 7 × 2.5 bearings (not included). Measure the shaft and bearings first."),
    "tk-reel-knob-inlay": ("Reel knob inlay", lambda: reel_knob(name="MILA", font=FONT)[1], "as_is", "tackle", ""),
    "tk-spool-band": ("Spool band, 2500", spool_band, "as_is", "tackle", "TPU 95A; stretches over a 47 mm spool lip; the tab holds the line end."),
    "tk-universal-saddle": ("Universal saddle, 22–45 mm", universal_saddle, "face_down", "mount", "V cradle and two strap channels; takes the ladder strap, a Voile-type strap or zip ties. Any bar, stem, post or tube."),
    "tk-ladder-strap": ("Ladder strap, 240 mm", ladder_strap, "as_is", "mount", "TPU 95A; print flat."),
    "tk-strap-buckle": ("Strap buckle", strap_buckle, "as_is", "mount", "PETG; the ladder locks on the tooth."),
}
