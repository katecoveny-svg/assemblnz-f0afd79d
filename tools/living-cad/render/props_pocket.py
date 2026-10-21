"""Stand-ins for the pocket-range renders: the things the emergency, makeup and mini kits hold, a lip tube, an eraser
block, a refill, at published sizes as plain solids. Props for renders only; never print files, never included.
Run from the repo root: python3 tools/living-cad/render/props_pocket.py"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "cad"))
sys.path.insert(0, HERE)
from props import save, rbox
import manifold3d as m3d
from lib import M, CS, ext_z, cyl_z, rrect, circ, poly


def capsule(d, L):
    r = d / 2
    return M.batch_hull([M.sphere(r, 48).translate([0, 0, r]), M.sphere(r, 48).translate([0, 0, L - r])])


def tackle_props():
    """A soft-plastics packet (with its hang hole) in the two Daiwa sizes, and a stand-in spinning reel: a rotor
    drum, a body, a stem and foot, a handle. Props for renders only."""
    for name, (W, H, T) in (("packet-5", (92.0, 175.0, 12.0)), ("packet-7", (105.0, 235.0, 14.0))):
        body = rbox(W, H, T, r=2.0, rz=2.0) - cyl_z(3.0, -1, T + 1, cx=0, cy=H / 2 - 8.0, seg=32)
        save(name, body)
    rotor = cyl_z(24.0, 0, 30, seg=96) + cyl_z(22.0, 30, 36, seg=96)                 # spool and rotor, the axis along z
    body = M.batch_hull([cyl_z(14.0, 36, 37, seg=64), cyl_z(12.0, 70, 71, seg=64)])
    stem = ext_z(rrect(14.0, 8.0, 2.0, 0, 20.0), 50, 80) + ext_z(rrect(60.0, 17.0, 3.0, 0, 32.0), 76, 79.2)
    handle = ext_z(rrect(40.0, 6.0, 2.0, 28.0, 0), 50, 54) + cyl_z(10.0, 40, 66, cx=46.0, cy=0, seg=48)
    save("reel-2500", rotor + body + stem + handle)


if __name__ == "__main__":
    save("airpods-pro", rbox(60.6, 45.2, 21.7, r=6.0, rz=5.0))
    save("bank-nano", rbox(77.0, 36.8, 25.0, r=5.0, rz=5.0))
    save("tampon-compact", capsule(17.0, 82.0).rotate([0, 90, 0]))
    save("sanitiser-15", (cyl_z(12.5, 0, 60, seg=64) + cyl_z(8.0, 60, 76, seg=48)).rotate([0, 90, 0]))
    save("balm", cyl_z(8.0, 0, 65, seg=48) + cyl_z(8.2, 44, 65, seg=48))
    save("patch-sachet", rbox(60.0, 16.0, 4.0, r=1.5, rz=1.5))
    save("wipes-sachet", rbox(110.0, 80.0, 3.0, r=2.0, rz=1.2))
    tube = ext_z(rrect(22.0, 21.0, 5.0), 0, 100) + M.batch_hull([ext_z(rrect(22.0, 21.0, 5.0), 99.9, 100), ext_z(rrect(14.0, 21.0, 4.0, -4, 0), 113.9, 114)])
    save("lip-tube", tube.rotate([0, 90, 0]))
    save("eraser-block", rbox(65.0, 23.0, 13.0, r=1.5, rz=1.5))
    save("refill", (cyl_z(2.9, 0, 98.1, seg=32) + cyl_z(1.25, 98.1, 104, seg=24)).rotate([0, 90, 0]))
    save("compact", cyl_z(29.0, 0, 16, seg=96))
    save("card-flat", rbox(85.6, 54.0, 0.9, r=3.0, rz=0.4))
    save("mascara", capsule(16.0, 120.0).rotate([0, 90, 0]))
    tackle_props()
