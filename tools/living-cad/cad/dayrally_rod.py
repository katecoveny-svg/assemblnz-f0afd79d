"""
dayrally rod — a fixed-line rod that packs into its own grip, and a wharf reel. Proposed, unprinted.

What it is
  A short fixed-line rod (no reel on the rod, no guides: the line ties to the tip, tenkara-style) for wharves,
  rock pools and streams. Four sections plug together with tapered spigots; packed, the sections slide inside
  the grip tube and the butt cap closes it. The grip carries line-keeper notches and a hook park.
  Assembled 0.99 m. Packed 233 × 32 mm, about 105 g (grip in PETG, sections in PETG-CF).

What it is not
  It is not a casting rod and it will not fish like a glass or carbon blank. Print it in PETG-CF or PA-CF;
  PLA softens in a hot car and plain PETG creeps. The published printed rods that work are in CF filament.

Also here
  wharf reel ...... a 100 mm V-groove handline spool that prints in one piece: the classic hand reel,
                    for 30 m of mono. Hangs on a Grid hook. No hooks supplied.
  rod saddle ...... TURN flange (two keyways, 42 mm apart) with two snap clips for the packed grip, so the rod
                    rides on a bag strap, a bike bar or the Grid wall like a pod.

All parts print upright or flat without supports. Joints and clips are checked digitally; fit values are
starting points for the first PETG-CF print.
"""
import math
import manifold3d as m3d
import lib
import dayrally as d1
import dayrally2 as d2
from lib import M, CS, P, ext_z, ext_y, cyl_z, rrect, circ, poly, round2d, EPS, flange_key_cut

# ---------------- rod ----------------
GRIP_L, GRIP_OD, GRIP_ID = 230.0, 32.0, 27.0
SEC_L = 190.0
SECTIONS = [  # (name, od at base, od at top, wall)
    ("s1", 14.0, 12.4, 2.2),
    ("s2", 11.0, 9.6, 1.9),
    ("s3", 8.6, 7.4, 1.6),
]
TIP = ("tip", 6.2, 3.0)                     # solid taper
SPIGOT_L, SPIGOT_CLR, SPIGOT_TAPER = 28.0, 0.15, 0.25
COLLAR_L, CAP_L = 25.0, 14.0
PRESS = 0.10                                # collar and cap press into the grip bore


def _taper(r0, r1, h, seg=96):
    return M.cylinder(h, r0, r1, seg)


def section(i):
    """Hollow tapered tube with a solid tapered spigot at its base that plugs into the section below.
    Prints upright (spigot down)."""
    name, od0, od1, wall = SECTIONS[i]
    tube = _taper(od0 / 2, od1 / 2, SEC_L) - _taper(od0 / 2 - wall, od1 / 2 - wall, SEC_L + 1).translate([0, 0, 0.5])
    # the socket at the top of this section takes the next section's spigot: bore it to that spigot size
    nxt_od = SECTIONS[i + 1][1] if i + 1 < len(SECTIONS) else TIP[1]
    sock_r = (nxt_od + 1.2) / 2            # next spigot is nxt_od + 1.2 wide (it has a shoulder)
    tube = tube - M.cylinder(SPIGOT_L + 1, sock_r + SPIGOT_CLR, sock_r + SPIGOT_CLR - SPIGOT_TAPER / 2, 96).translate([0, 0, SEC_L - SPIGOT_L])
    # the spigot at the base of this section (solid, tapered) that goes into the section below (or the collar)
    sp_r = (od0 + 1.2) / 2
    spig = M.cylinder(SPIGOT_L, sp_r - SPIGOT_TAPER / 2, sp_r, 96).translate([0, 0, -SPIGOT_L])
    shoulder = _taper(sp_r + 0.6, od0 / 2, 3.0).translate([0, 0, -0.01])
    return tube + spig + shoulder


def tip():
    od0, od1 = TIP[1], TIP[2]
    rod = _taper(od0 / 2, od1 / 2, SEC_L)
    sp_r = (od0 + 1.2) / 2
    spig = M.cylinder(SPIGOT_L, sp_r - SPIGOT_TAPER / 2, sp_r, 96).translate([0, 0, -SPIGOT_L])
    shoulder = _taper(sp_r + 0.6, od0 / 2, 3.0).translate([0, 0, -0.01])
    # line loop at the top: a ring in the plane of the rod
    ring = ext_y(circ(3.6, 0, SEC_L + 2.6, seg=48) - circ(2.0, 0, SEC_L + 2.6, seg=48), -1.0, 1.0)
    neck = M.cylinder(3.0, od1 / 2, od1 / 2, 48).translate([0, 0, SEC_L - 0.5])
    return rod + spig + shoulder + ring + neck


def grip():
    """Open tube. Line-keeper notches near each end and a hook park slot. Prints upright."""
    g = M.cylinder(GRIP_L, GRIP_OD / 2, GRIP_OD / 2, 128) - M.cylinder(GRIP_L + 2, GRIP_ID / 2, GRIP_ID / 2, 128).translate([0, 0, -1])
    # shallow finger flutes along the grip
    for i in range(8):
        a = i * 45
        g = g - M.cylinder(GRIP_L - 60, 2.2, 2.2, 32).translate([GRIP_OD / 2 + 1.0, 0, 30]).rotate([0, 0, a])
    # line keeper notches: two V notches at each end, opposite sides
    for z in (18.0, GRIP_L - 18.0):
        for a in (0, 180):
            v = poly([(GRIP_OD / 2 + 1, z - 3.5), (GRIP_OD / 2 - 2.0, z), (GRIP_OD / 2 + 1, z + 3.5)])
            g = g - ext_y(v, -6, 6).rotate([0, 0, a + 90])
    # hook park: a slot the hook bend drops into
    g = g - M.cube([2.0, 10.0, 6.0], True).translate([GRIP_OD / 2 - 1.5, 0, GRIP_L / 2]).rotate([0, 0, 90])
    return g


def collar():
    """Presses into the top of the grip; its socket takes the s1 spigot. Prints flange down."""
    r_in = GRIP_ID / 2 + PRESS / 2
    c = M.cylinder(COLLAR_L, r_in, r_in, 128) + M.cylinder(3.0, GRIP_OD / 2, GRIP_OD / 2, 128).translate([0, 0, COLLAR_L])
    sp_r = (SECTIONS[0][1] + 1.2) / 2
    c = c - M.cylinder(SPIGOT_L + 1, sp_r + SPIGOT_CLR, sp_r + SPIGOT_CLR - SPIGOT_TAPER / 2, 96).translate([0, 0, COLLAR_L + 3.0 - SPIGOT_L])
    for a in range(0, 360, 90):                                      # four slits so the press fit forgives
        c = c - M.cube([1.2, GRIP_OD, COLLAR_L - 4], True).translate([0, 0, (COLLAR_L - 4) / 2]).rotate([0, 0, a])
    return c


def butt_cap():
    """Presses into the butt end; closes the packed rod. A 1 mm lip with two nail notches to pull it. Prints lip down."""
    r_in = GRIP_ID / 2 + PRESS / 2
    c = M.cylinder(CAP_L, r_in, r_in, 128).translate([0, 0, 3.0]) + M.cylinder(3.0, GRIP_OD / 2 + 1.0, GRIP_OD / 2 + 1.0, 128)
    c = c - M.cylinder(CAP_L, r_in - 1.8, r_in - 1.8, 96).translate([0, 0, 5.0])
    for a in range(0, 360, 90):
        c = c - M.cube([1.2, GRIP_OD, CAP_L - 3], True).translate([0, 0, 3.0 + (CAP_L - 3) / 2 + 1.5]).rotate([0, 0, a])
    for a in (0, 180):                                                 # two nail notches in the lip
        c = c - M.cube([6.0, 10.0, 1.6], True).translate([GRIP_OD / 2 + 1.0, 0, 0.8]).rotate([0, 0, a])
    return c


# ---------------- wharf reel ----------------
REEL_D, REEL_CORE_D, HAND_D = 100.0, 80.0, 46.0


def wharf_reel():
    """One-piece V-groove hand reel. Prints flat: lower flange on the bed, V walls at 45° and 50°."""
    R, rc = REEL_D / 2, REEL_CORE_D / 2
    t, d = 3.0, R - rc                                              # lower V wall at 45°, upper wall at 50° so it prints
    up = d * math.tan(math.radians(50))
    top = t + d + up
    prof = poly([(HAND_D / 2, 0), (R, 0), (R, t), (rc, t + d), (R, top), (R, top + t), (HAND_D / 2, top + t)])
    reel = M.revolve(prof, 160)
    # line anchor hole through the core and a hook park notch on the top rim
    reel = reel - M.cylinder(40, 1.6, 1.6, 24).rotate([90, 0, 0]).translate([rc + 2, 20, t + d])
    reel = reel - M.cube([6.0, 2.0, 8.0], True).translate([R - 1.0, 0, top + t - 2])
    return reel


# ---------------- rod saddle (TURN) ----------------
def rod_saddle():
    """TURN flange with two snap C-clips for the packed grip (32 mm). Keys go in from the clip side."""
    Lx, Wy = 60.0, 84.0
    z0, z1 = lib.FL_Z0, lib.FL_Z1
    plate = ext_z(rrect(Lx, Wy, 8.0), z0, z1)
    for (x, y) in d1.KEYS:
        plate = plate - flange_key_cut(x, y)
    R = GRIP_OD / 2 + 0.3
    t = 3.0
    zc = z1 + 8.0 + R                                                 # tube bottom clears the key heads (z 19.3)
    half = math.asin(min(0.95, (0.80 * GRIP_OD / 2) / R))
    for y in (-30.0, 30.0):
        ring = ext_y(circ(R + t, 0.0, zc, seg=96) - circ(R, 0.0, zc, seg=96), y - 6.0, y + 6.0)
        far = 2.2 * (R + t)
        gap = poly([(0.0, zc), (-far * math.sin(half), zc + far * math.cos(half)), (far * math.sin(half), zc + far * math.cos(half))])
        ring = ring - ext_y(gap, y - 7, y + 7)
        stem = ext_y(rrect(2 * R + 2 * t, zc - R - z1 + 1.0, 1.0, 0.0, (z1 - 0.5 + zc - R) / 2), y - 6.0, y + 6.0)
        plate = plate + ring + stem
    return plate


def packing_check():
    """Can s1, s2, s3 and the tip lie side by side inside the grip bore? Greedy circle packing in a circle."""
    radii = sorted([SECTIONS[0][1], SECTIONS[1][1], SECTIONS[2][1], TIP[1]], reverse=True)
    radii = [r / 2 + 0.2 for r in radii]
    Rb = GRIP_ID / 2
    placed = []
    import itertools
    for r in radii:
        best = None
        for ang in range(0, 360, 5):
            for dist in [i * 0.25 for i in range(int((Rb - r) / 0.25), -1, -1)]:
                x, y = dist * math.cos(math.radians(ang)), dist * math.sin(math.radians(ang))
                if math.hypot(x, y) + r > Rb + 1e-6:
                    continue
                if all(math.hypot(x - px, y - py) >= r + pr - 1e-6 for (px, py, pr) in placed):
                    best = (x, y, r)
                    break
            if best:
                break
        if not best:
            return False, placed
        placed.append(best)
    return True, placed


PARTS = {
    "rod-grip": ("Rod grip and case", grip, "as_is", "rod", "Prints upright. Sections pack inside; line winds on the notches."),
    "rod-collar": ("Rod collar", collar, "as_is", "rod", "Presses into the grip top; socket for section 1."),
    "rod-butt-cap": ("Rod butt cap", butt_cap, "as_is", "rod", "Presses into the grip butt; pull to unpack."),
    "rod-section-1": ("Rod section 1", lambda: section(0), "as_is", "rod", "PETG-CF or PA-CF. Spigot down."),
    "rod-section-2": ("Rod section 2", lambda: section(1), "as_is", "rod", "PETG-CF or PA-CF. Spigot down."),
    "rod-section-3": ("Rod section 3", lambda: section(2), "as_is", "rod", "PETG-CF or PA-CF. Spigot down."),
    "rod-tip": ("Rod tip with line loop", tip, "as_is", "rod", "PETG-CF or PA-CF. Solid taper; loop-to-loop the line."),
    "rod-wharf-reel": ("Wharf reel", wharf_reel, "as_is", "rod", "One piece, V groove at 45°. 30 m of mono. No hooks supplied."),
    "rod-saddle": ("Rod saddle (TURN)", rod_saddle, "as_is", "rod", "Flange on the bed. Two keys lock it to any mount; the packed rod snaps in."),
}
