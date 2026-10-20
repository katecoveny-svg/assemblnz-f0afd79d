"""Stand-in objects for the "what's in it" pod renders: a few everyday things at
real sizes, built as plain solids so the pictures show what each insert holds.
They are props for renders only, never print files, and never claimed as
included. Output: tools/living-cad/render/extra/props/*.stl (mm, z up, each
sitting on z = 0).

Run from the repo root: python3 tools/living-cad/render/props.py
"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "cad"))
import manifold3d as m3d
import lib
from lib import M, CS, ext_z, cyl_z, rrect, circ

OUT = os.path.join(HERE, "extra", "props")
os.makedirs(OUT, exist_ok=True)


def save(name, man):
    x0, y0, z0, x1, y1, z1 = man.bounding_box()
    man = man.translate([-(x0 + x1) / 2, -(y0 + y1) / 2, -z0])
    lib.to_trimesh(man).export(os.path.join(OUT, name + ".stl"))
    x0, y0, z0, x1, y1, z1 = man.bounding_box()
    print(f"{name:18s} {x1 - x0:6.1f} × {y1 - y0:6.1f} × {z1 - z0:5.1f} mm")


def rbox(w, h, t, r=3.0, rz=None):
    """A rounded box: hull of eight spheres (r) so every edge is soft."""
    rz = r if rz is None else rz
    pts = [(sx * (w / 2 - r), sy * (h / 2 - r), z) for sx in (-1, 1) for sy in (-1, 1) for z in (rz, t - rz)]
    return M.batch_hull([M.sphere(r, 32).translate([x, y, z]) for (x, y, z) in pts])


def torus(R, r, seg=96):
    return M.revolve(circ(r, R, 0.0, seg=48), seg)


# ---- fish: two spoons, a soft bait, three sinkers, a swivel ----
def spoon(L=42.0, W=15.0, t=5.0):
    body = M.sphere(1.0, 48).scale([L / 2, W / 2, t / 2]).translate([0, 0, t / 2])
    eye = torus(2.2, 0.8, 48).rotate([90, 0, 0]).translate([L / 2 - 1.0, 0, t / 2])
    hook = torus(5.0, 0.7, 48).rotate([90, 0, 0]).translate([-L / 2 - 2.0, 0, 5.0])  # a ring reads as a treble at this scale
    return body + eye + hook


def grub(L=50.0, D=9.0):
    body = M.batch_hull([M.sphere(D / 2, 32).translate([-L / 2 + D / 2, 0, D / 2]), M.sphere(D / 2, 32).translate([L / 2 - D / 2 - 10, 0, D / 2])])
    tail = M.sphere(1.0, 32).scale([12, 5, 2.5]).translate([L / 2 - 8, 0, 2.5]).rotate([0, 0, 25])
    return body + tail


def sinker(d=11.0):
    return M.sphere(d / 2, 48).translate([0, 0, d / 2])


def swivel(L=22.0):
    bar = cyl_z(1.6, 0, L, seg=24).rotate([0, 90, 0]).translate([-L / 2, 0, 1.6])
    rings = torus(3.2, 0.8, 48).translate([-L / 2 - 2.5, 0, 1.6]) + torus(3.2, 0.8, 48).translate([L / 2 + 2.5, 0, 1.6])
    return bar + rings


# ---- tech: an earbuds case and a coiled cable with a plug ----
def earbuds_case(w=50.0, h=40.0, t=21.0):
    case = rbox(w, h, t, r=6.0)
    seam = ext_z(rrect(w + 1, h + 1, 6.5), t * 0.55, t * 0.55 + 0.6)
    return case - (seam - ext_z(rrect(w - 1.2, h - 1.2, 5.9), t * 0.5, t * 0.7))


def cable_coil(R=15.0, r=2.0, turns=2):
    coil = M.batch_boolean([torus(R - k * 2.6, r, 96).translate([0, 0, r + k * 0.6]) for k in range(turns)], m3d.OpType.Add)
    plug = rbox(8.5, 7.0, 2.8, r=1.2).translate([R + 6, 0, 0.0])
    return coil + plug


# ---- beach: a sun balm tin, two lip balm tins, a key ring with two keys ----
def tin(d=30.0, h=16.0):
    base = cyl_z(d / 2 - 0.3, 0, h - 4, seg=96)
    lid = cyl_z(d / 2, h - 4.5, h, seg=96)
    return base + lid


def keys():
    ring = torus(10.0, 1.3, 96).translate([0, 0, 1.3])
    def key(angle, L=27.0):
        head = ext_z(circ(8.0, seg=48) - circ(2.2, 0, 3.0, seg=32), 0, 2.0)
        blade = ext_z(rrect(L, 7.0, 1.5, L / 2 + 5, 0), 0, 2.0)
        teeth = M.batch_boolean([ext_z(rrect(3.0, 2.2, 0.4, 12 + k * 5.5, -3.0), -1, 3) for k in range(4)], m3d.OpType.Add)
        return (head + blade - teeth).translate([-8.0, 0, 0]).rotate([0, 0, angle])
    k1 = key(200).translate([9, 0, 0.6])
    k2 = key(235).translate([9, 0, 2.6])
    return ring + k1 + k2


# ---- stationery: a pencil, a pen ----
def pencil(L=120.0, d=7.0):
    body = cyl_z(d / 2, 0, L - 14, seg=6)
    tip = cyl_z(d / 2, L - 14, L - 3, r1=1.6, seg=6)
    lead = cyl_z(1.6, L - 3, L, r1=0.4, seg=24)
    ferrule = cyl_z(d / 2 + 0.3, 0, 8, seg=32)
    return (body + tip + lead + ferrule).rotate([0, 90, 0]).translate([-L / 2, 0, d / 2 + 0.3])


def pen(L=140.0, d=9.5):
    body = cyl_z(d / 2, 0, L - 18, seg=48)
    cone = cyl_z(d / 2, L - 18, L - 2, r1=1.5, seg=48)
    nib = cyl_z(1.2, L - 2, L, r1=0.6, seg=24)
    clip = rbox(2.0, 2.4, 34.0, r=0.9, rz=0.9).translate([0, d / 2 + 0.8, 4])
    return (body + cone + nib + clip).rotate([0, 90, 0]).translate([-L / 2, 0, d / 2 + 1.2])


# ---- cards: a bank card, standing on its long edge ----
def card(w=85.6, h=54.0, t=0.8):
    c = ext_z(rrect(w, h, 3.2), 0, t)
    return c.rotate([90, 0, 0]).translate([0, 0, h / 2])


if __name__ == "__main__":
    save("spoon", spoon(34.0, 13.0, 4.5))
    save("grub", grub(38.0, 8.0))
    save("sinker", sinker())
    save("swivel", swivel())
    save("earbuds-case", earbuds_case())
    save("cable-coil", cable_coil())
    save("tin-30", tin(30.0, 16.0))
    save("tin-18", tin(18.0, 13.0))
    save("keys", keys())
    save("pencil", pencil())
    save("pencil-short", pencil(96.0))
    save("pen", pen())
    save("card", card())
