"""
dayrally on the bike, as Kate's picture draws it (docs/living/boards/dayrally-bike-20261020.jpg): a pod on the
rear rack, rods standing in a quiver on the rack, a pod along the top tube, the bottle, the cam on the stem.
The pods, bottle cup and cam mount exist; these are the three mounts that put them where the picture puts them.
20 October 2026. Proposed; nothing printed.

  rack-mount          a TURN socket plate strapped to a rear rack platform: the ride pod or the long pod locks on
  rack-quiver         two 40 mm tubes for packed rods, strapped to a rack stay or the seat tube; TURN flange on its back
  rack-toptube-saddle the frame saddle turned inline, so a pod lies along the top tube
"""
import math
import manifold3d as m3d
import lib
import dayrally as d1
import dayrally2 as d2
from lib import M, CS, ext_z, ext_x, ext_y, cyl_z, rrect, circ, poly, round2d, flange_key_cut, board_socket_cut, EPS

KEYS = d1.KEYS
STRAP_W, STRAP_T = 26.0, 4.0


def rack_mount(Lx=150.0, Wy=100.0, depth=10.0):
    """Socket plate (two TURN sockets along x, the rack's length) with four strap slots so two 25 mm straps wrap the
    rack platform, ribs underneath to bite a rack's rails, and lightening windows. The pod locks on top."""
    body = d2._socket_body(Lx, Wy, depth, r=12.0)
    # five ribs along x on the underside, 2 mm proud, so the plate sits on round rails without rocking
    for y in (-36.0, -18.0, 0.0, 18.0, 36.0):
        body = body + ext_z(rrect(Lx - 30.0, 3.0, 1.0, 0, y), -depth - 2.0, -depth + EPS)
    for sx in (-1, 1):
        for sy in (-1, 1):
            body = body - ext_z(rrect(STRAP_T + 1.0, STRAP_W + 2.0, 1.5, sx * (Lx / 2 - 14.0), sy * (Wy / 2 - 22.0)), -depth - 3, lib.PLATE_Z1 + 1)
    for cx in (-48.0, 48.0):
        body = body - ext_z(rrect(28.0, 22.0, 6.0, cx, 0.0), -depth - 1, lib.PLATE_Z1 + 1)
    return body


def rack_quiver(bore=40.0, H=130.0, n=2, pitch=46.0):
    """Two tubes for packed rods (the cast rod grip is 36 mm, the fixed-line rod 32): 2.4 walls, 3 mm floors with
    drains, two strap slots through a back plate for a rack stay or the seat tube. At home it hangs on a Grid hook by
    its upper slot (a full-size TURN flange here would put the key heads inside the tubes). Prints standing."""
    R = bore / 2 + 2.4
    W = (n - 1) * pitch + 2 * R
    cs = rrect(W, 2 * R, R - 0.01, seg=96)
    body = ext_z(cs, 0, H)
    for i in range(n):
        x = -(n - 1) * pitch / 2 + i * pitch
        body = body - cyl_z(bore / 2, 3.0, H + 1, cx=x, seg=96)
        body = body - cyl_z(4.0, -1, 4.0, cx=x, seg=32)
    # back plate (a TURN flange z 8..13 in the installed frame, here lying along -y) with strap slots
    back = M.cube([W - 8.0, 5.0, H - 16.0], center=False).translate([-(W - 8.0) / 2, -R - 4.0, 8.0])
    body = body + back
    for z in (22.0, H - 22.0):
        body = body - M.cube([W + 2, STRAP_T + 1.0, STRAP_W + 2.0], center=True).translate([0, -R - 1.5, z])
    return body


def toptube_saddle():
    """The frame saddle with its groove along x, so the pod lies along the top tube. 25-45 mm tubes; zip ties."""
    Lx, Wy, depth = 84.0, 36.0, 24.0
    body = d2._socket_body(Lx, Wy, depth)
    half = math.radians(60)
    gd = 16.0
    body = body - ext_x(poly([(-depth - 0.01, -gd * math.tan(half)), (-depth - 0.01, gd * math.tan(half)), (-depth + gd, 0)]), -Lx, Lx)
    for x in (-28.0, 28.0):
        body = body - ext_y(rrect(7.0, 3.4, 1.0, x, -14.0), -Wy, Wy)
    return body


def strap_gauge():
    return M.cube([STRAP_T, STRAP_W, 40.0], center=True)


PARTS = {
    "rack-mount": ("rack mount", rack_mount, "face_down", "rack", "Two straps round the rack platform; the ride pod or the long pod locks on."),
    "rack-quiver": ("rod quiver", rack_quiver, "as_is", "rack", "Two 40 mm tubes for packed rods; straps to a rack stay or the seat tube; hangs on a Grid hook at home."),
    "rack-toptube-saddle": ("top-tube saddle", toptube_saddle, "face_down", "rack", "The frame saddle turned inline: a pod along the top tube. 25-45 mm tubes, zip ties."),
}
