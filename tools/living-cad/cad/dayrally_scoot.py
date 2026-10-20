"""
dayrally on the scooter. Kate, 20 October 2026: "the kits for scooters too, and the rod holder attachment for a
Flamingo, Lime and Honey Whale scooter". Share scooters (Flamingo, Lime) cannot be drilled or clamped with tools,
so everything here straps on and comes off in a minute; a kid's or a Honey Whale folder gets the same parts.
Proposed; nothing printed. Stem diameters of the three scooters were not measurable from here: the saddle's V
takes round or oval stems from 32 to 60 mm and the strap decides the rest. Measure the stem on the day.

  scoot-stem-saddle   a TURN socket plate (two sockets along the stem) on a 120 degree V, with two 25 mm strap
                      slots that wrap the stem; the pod mini, the ride pod or the quiver locks on
  scoot-quiver        one 40 mm tube, 150 tall, for a packed rod (the fixed-line rod's 32 mm grip or the cast rod's
                      36), with a full TURN flange on its back so it keys onto the stem saddle, the bar saddle or
                      the Grid; the floor end can go either way up because the two keys are symmetric
"""
import math
import lib
import dayrally as d1
import dayrally2 as d2
from lib import M, ext_z, ext_x, ext_y, cyl_z, rrect, circ, poly, flange_key_cut, EPS

KEYS = d1.KEYS                        # (-21, 0) and (21, 0): along x, the stem axis
STRAP_W, STRAP_T = 26.0, 4.0          # a 25 mm hook-and-loop or cam strap (bought)
STEM_MIN, STEM_MAX = 32.0, 60.0
BORE, QH = 40.0, 150.0


def stem_saddle(Lx=96.0, Wy=72.0, depth=34.0, gd=20.0):
    """The frame saddle grown for scooter stems: a 120 degree V along x, 20 mm deep, so 32 to 60 mm stems seat on the
    two V faces; two 26 x 4 strap channels across the V at x = +-32 so the strap passes through both cheeks and round
    the stem; two TURN sockets along x on top. 25 mm strap, no tools, off in a minute."""
    body = d2._socket_body(Lx, Wy, depth, r=12.0)
    half = math.radians(60)
    body = body - ext_x(poly([(-depth - 0.01, -gd * math.tan(half)), (-depth - 0.01, gd * math.tan(half)), (-depth + gd, 0)]), -Lx, Lx)
    for x in (-32.0, 32.0):
        body = body - ext_y(rrect(STRAP_W, STRAP_T, 1.2, x, -depth + gd + 2.0 - 4.0), -Wy, Wy)
    return body


def quiver(bore=BORE, H=QH, wall=2.4):
    """One tube along x for a packed rod, on a TURN flange (z 8..13, keys at +-21 along x). The tube floats 8 mm above
    the flange so the key heads (to z 17.3) clear it; three bridges at x = 0 and +-38 sit between and outside the heads.
    Floor with a drain at the +x end, which prints at the bottom (on_side) and mounts downward."""
    z0, z1 = lib.FL_Z0, lib.FL_Z1
    Lx, Wy = 96.0, 60.0
    plate = ext_z(rrect(Lx, Wy, 8.0), z0, z1)
    for (x, y) in KEYS:
        plate = plate - flange_key_cut(x, y)
    R = bore / 2 + wall
    zc = z1 + 8.0 + R                                                     # tube axis height: bottom at z 21
    tube = ext_x(circ(R, zc, 0.0, seg=112), -H / 2, H / 2) - ext_x(circ(bore / 2, zc, 0.0, seg=112), -H / 2 - 1, H / 2 - 3.0)   # (z, y) sections
    tube = tube - M.cylinder(10.0, 3.0, 3.0, 32).rotate([0, 90, 0]).translate([H / 2 - 5.0, 0.0, zc])   # drain through the floor
    body = plate + tube
    for x in (-38.0, 0.0, 38.0):
        body = body + ext_x(rrect(zc - R - z1 + 1.0, 2 * R, 1.0, (z1 - 0.5 + zc - R) / 2, 0.0), x - 5.0, x + 5.0)
    return body


def strap_gauge():
    return ext_y(rrect(STRAP_W, STRAP_T, 1.2), -100.0, 100.0)


PARTS = {
    "scoot-stem-saddle": ("scooter stem saddle", stem_saddle, "on_bottom", "scoot", "Straps to a 32-60 mm scooter stem, no tools; two TURN sockets along the stem for a pod or the quiver."),
    "scoot-quiver": ("scooter rod quiver", quiver, "on_side", "scoot", "One 40 mm tube, 150 tall, for a packed rod; TURN flange keys it onto the stem saddle. Floor end down."),
}
