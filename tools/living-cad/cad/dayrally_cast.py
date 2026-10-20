"""
dayrally cast — a casting rod we can print, built for a real spinning reel. Proposed, unprinted.

What it is
  A three-section rod (0.91 m) whose sections pack inside the grip (253 × 36 mm); every part fits a 250 mm bed. The grip carries a
  screw-lock reel seat that takes a standard spinning reel foot (Shimano 1000 to 2500 size). Line guides
  run up the sections to a tip top. A TURN saddle carries the packed rod.

The engineering that makes it honest
  * Sections are HOLLOW SQUARE bars (1.8 mm walls) printed FLAT. Flat printing puts the layer lines and
    the carbon fibres along the rod, the direction a rod bends. A tube printed upright has every layer line
    across the bend, the weakest way to print a rod, and it is what the forwarded OpenSCAD asks for. The
    square bore is the socket: a square pin fills it at each joint, so the pin is as big as the bore allows.
  * The first pass of this file (solid round D-sections, then four solid square sections) was checked and
    failed on its own numbers: D-section sockets cannot keep a wall, thin pins overload, and four sections
    will not pack inside a grip a child can hold. Three hollow sections in a 30 mm bore do.
  * Load limit stated, not hidden. Design tip load 2.5 N (about 250 g lifted straight at the tip); the
    stress table is computed from the geometry at that load and again at 5 N. PPA-CF tensile strength is
    about 120 to 150 MPa along the fibres. Set the reel drag to 300 g or less. A glass blank is still much
    stronger: the doc says so and offers the bought-blank alternative on the same printed grip.
  * Material: PPA-CF for sections, pins, tip top and guides (Bambu: bending modulus 9.9 GPa dry, 9.6 wet;
    PA6-CF falls from 4.9 to 1.9 GPa wet, so not PA6-CF). ASA or PETG-CF for the grip, hood, nut, collar
    and cap. Thin epoxy rod finish on the sections; rinse after salt.

Not printed: the reel (a bought Shimano 1000-size spinning reel), rod-building thread and epoxy, 4 to 6 lb
mono. Nothing here is printed or cast; fit_test_cast.py is the only check so far.
"""
import math
import manifold3d as m3d
import lib
from lib import M, CS, ext_z, ext_y, cyl_z, rrect, circ, poly, EPS

# ---------------- rod ----------------
SEC_L = 220.0
N_SEC = 3
SIZES = [(12.0, 10.6), (10.6, 8.8), (8.8, 3.6)]                # square side at base and tip, butt to tip
CORNER = 0.18                                                   # corner radius as a fraction of the side
WALL = 1.8                                                      # hollow sections; the bore is the socket
SOLID_TIP = 90.0                                                # the tip section is solid over its last 90 mm
PIN_L, PIN_CLR = 60.0, 0.20                                     # square pins fill the bore; half in each section
TIP_TOP_ID, TIP_TOP_L = 3.6 + 0.3, 14.0
GUIDE_RINGS = [7.0, 5.5, 4.4]                                   # inner diameters, butt to tip; tip top ring 4.0
E_PPA_CF_WET = 9600.0                                           # MPa, Bambu PPA-CF after wet conditioning
TIP_LOAD_N = 2.5

# ---------------- grip and reel seat ----------------
GRIP_L, GRIP_OD, GRIP_ID = 250.0, 36.0, 30.0
COLLAR_L, CAP_L, PRESS = 16.0, 10.0, 0.10
SEAT_TOP = 30.0                             # fixed hood this far below the grip top (the collar end)
FOOT_W, FOOT_T = 13.5, 3.6                  # pocket for a reel foot end
FOOT_MIN, FOOT_MAX = 55.0, 66.0             # reel foot lengths the seat must take
BED_L = 100.0                               # flat bed from the fixed hood down past the thread
HOOD_L, NUT_L = 18.0, 14.0
THREAD_MAJOR, THREAD_PITCH, THREAD_DEPTH, THREAD_CLR = GRIP_OD, 3.0, 1.0, 0.3   # cut into the grip wall
BORE_CHORD = 14.0                           # the bore's +x side is a flat chord: a 10.8 mm bridge when the grip prints lying on its back
BACK_FLAT = GRIP_OD / 2 - 1.4               # flat on the -x side (the key-groove side) the grip prints on
# the nut sits behind the hood; the hood's arch is HOOD_L - 9 from its base; the nut needs thread under it for
# every foot length, so the thread runs from the nut's lowest position to just under the hood at the shortest foot
HOOD_Z = lambda foot_l: (GRIP_L - SEAT_TOP) - foot_l + 2.0 - (HOOD_L - 9.0) - 0.3
THREAD_Z1 = HOOD_Z(FOOT_MIN) + HOOD_L + 1.0          # the hood rides over the thread crests for its whole travel
THREAD_Z0 = HOOD_Z(FOOT_MAX) - NUT_L - 2.0
THREAD_L = THREAD_Z1 - THREAD_Z0


def sq(side, cx=0.0, cz=0.0):
    return rrect(side, side, CORNER * side, cx, cz)


def _bar(s0, s1, L, cz0=0.0):
    """Tapered square bar along +y, base side s0 at y = 0 (centre z = cz0), tip side s1 at y = L. The bottom
    face stays on one plane so the bar prints flat on its biggest face."""
    base = ext_y(sq(s0, 0.0, cz0), 0.0, 0.2)
    tip = ext_y(sq(s1, 0.0, cz0 - (s0 - s1) / 2), L - 0.2, L)
    return M.batch_hull([base, tip])


def bore_side(side):
    return side - 2 * WALL


def pin_side(i):
    """Pin for joint i (between sections i and i+1): fills the bore at the joint, less the clearance."""
    return round(bore_side(SIZES[i][1]) - PIN_CLR, 2)


def section(i):
    """Section i, base at y = 0, flat bottom at z = -s0/2. Hollow with 1.8 mm walls (the bore is the socket at
    both ends); the tip section is solid over its last SOLID_TIP mm. Prints flat; the top wall bridges the bore."""
    s0, s1 = SIZES[i]
    body = _bar(s0, s1, SEC_L)
    if i < N_SEC - 1:
        bore = _bar(bore_side(s0), bore_side(s1), SEC_L + 2.0).translate([0, -1.0, 0])
    else:
        hollow_L = SEC_L - SOLID_TIP
        s_at = s1 + (s0 - s1) * SOLID_TIP / SEC_L
        bore = _bar(bore_side(s0), bore_side(s_at), hollow_L + 1.0).translate([0, -1.0, 0])
    socket = ext_y(sq(bore_side(s0)), -1.0, PIN_L / 2 + 2.0)                  # constant over the pin's reach
    return body - bore - socket


def pin(i):
    """Spigot pin for joint i. Square, 60 mm, 1 mm chamfers. Epoxied half into the lower section. Prints flat."""
    s = pin_side(i)
    body = ext_y(sq(s), 1.0, PIN_L - 1.0)
    lo = M.batch_hull([ext_y(sq(s - 2.0), 0.0, 0.1), ext_y(sq(s), 1.0, 1.1)])
    hi = M.batch_hull([ext_y(sq(s), PIN_L - 1.1, PIN_L - 1.0), ext_y(sq(s - 2.0), PIN_L - 0.1, PIN_L)])
    return body + lo + hi


def tip_top():
    """Sleeve over the last 14 mm of the tip, with a ring. Prints ring down."""
    s = TIP_TOP_ID
    sleeve = ext_y(sq(s + 2.8) - sq(s), 0.0, TIP_TOP_L)
    cap = M.batch_hull([ext_y(sq(s + 2.8), TIP_TOP_L - 0.5, TIP_TOP_L), ext_y(circ(1.6, seg=32), TIP_TOP_L + 2.0, TIP_TOP_L + 2.2)])
    rid = GUIDE_RINGS[-1]
    ring = ext_y(circ(rid / 2 + 1.5, 0.0, rid / 2 + 3.2, seg=48) - circ(rid / 2, 0.0, rid / 2 + 3.2, seg=48), TIP_TOP_L + 1.0, TIP_TOP_L + 3.0)
    bridge = ext_y(rrect(3.0, 4.0, 0.5, 0.0, 2.2), TIP_TOP_L + 1.0, TIP_TOP_L + 3.0)
    return sleeve + cap + ring + bridge


def guide(ring_id, bar_side):
    """Single-foot running guide: ring on a post, 14 mm foot with a flat underside for the square bar. Epoxy and
    whip. Prints on its side (ring flat on the bed)."""
    t = 1.6
    stand = ring_id / 2 + 2.5
    zc = bar_side / 2 + stand
    ring = ext_y(circ(ring_id / 2 + t, 0.0, zc, seg=48) - circ(ring_id / 2, 0.0, zc, seg=48), -1.0, 1.0)
    post = ext_y(rrect(3.2, stand - 1.0, 0.5, 0.0, bar_side / 2 + (stand - 1.0) / 2), -1.0, 1.0)
    foot = ext_y(rrect(bar_side * 0.8, 2.0, 0.6, 0.0, bar_side / 2 + 1.0), -7.0, 7.0)
    return ring + post + foot


# ---------------- grip, seat, collar, cap ----------------
def thread_profile(major, depth, pitch, clearance=0.0, n=180):
    """The thread as a radial profile r(θ) over one turn: a twisted extrusion with one turn per pitch sweeps
    it into a true helical tooth. Trapezoid: 0.5 crest, 50° flanks, a hair of root. (A flat tooth drawn in the
    plane and twisted gives a paper-thin fin, which the first pass of this file did.)"""
    r_min = major / 2 - depth + clearance
    r_maj = major / 2 + clearance
    run = depth * 1.2                                                 # flank 50° from the horizontal when printed upright
    pts = []
    for k in range(n):
        th = 2 * math.pi * k / n
        a = pitch * k / n                                            # axial position within the turn
        d = abs(a - pitch / 2)                                        # distance from the tooth centre line
        if d <= 0.25:
            r = r_maj
        elif d <= 0.25 + run:
            r = r_maj - depth * (d - 0.25) / run
        else:
            r = r_min
        pts.append((r * math.cos(th), r * math.sin(th)))
    return poly(pts)


def external_thread(z0, length, clearance=0.0):
    cs = thread_profile(THREAD_MAJOR, THREAD_DEPTH, THREAD_PITCH, clearance)
    turns = length / THREAD_PITCH
    return M.extrude(cs, length, n_divisions=int(turns * 36), twist_degrees=360.0 * turns).translate([0, 0, z0])


BED_X = GRIP_OD / 2 - 1.2                   # the reel bed plane (x), 1.2 mm into the tube wall


def grip():
    """Tube with the reel bed, fixed hood and screw-lock thread. Prints upright, butt down. Sections pack inside."""
    g = M.cylinder(GRIP_L, GRIP_OD / 2, GRIP_OD / 2, 128)
    bed_z1 = GRIP_L - SEAT_TOP
    bed_z0 = bed_z1 - BED_L
    # thread cut into the wall: remove everything in the thread zone that is not the thread solid
    groove = M.cylinder(THREAD_L, GRIP_OD / 2 + 1, GRIP_OD / 2 + 1, 128).translate([0, 0, THREAD_Z0]) - external_thread(THREAD_Z0, THREAD_L)
    g = g - groove
    g = g - M.cube([12.0, FOOT_W + 6.0, BED_L + 2.0], False).translate([BED_X, -(FOOT_W + 6.0) / 2, bed_z0 - 1.0])
    g = g - M.cube([3.0, 4.2, BED_L + 2.0], False).translate([-GRIP_OD / 2 - 1.0, -2.1, bed_z0 - 1.0])      # hood key groove
    g = g + M.cube([6.0 + (BED_X - 12.0), FOOT_W + 7.0, 8.0], False).translate([12.0, -(FOOT_W + 7.0) / 2, bed_z1])   # fixed hood, rooted in the wall
    g = g - M.cube([FOOT_T + 0.3, FOOT_W, 9.0], False).translate([BED_X - 0.01, -FOOT_W / 2, bed_z1 - 0.5])   # its pocket, through the tube wall too
    bore = M.cylinder(GRIP_L + 2, GRIP_ID / 2, GRIP_ID / 2, 128).translate([0, 0, -1]) ^ M.cube([BORE_CHORD + GRIP_ID, GRIP_ID + 2, GRIP_L + 4], True).translate([BORE_CHORD - (BORE_CHORD + GRIP_ID) / 2, 0, GRIP_L / 2])
    g = g - bore
    g = g - M.cube([10.0, GRIP_OD + 2, GRIP_L + 2], True).translate([-BACK_FLAT - 5.0, 0, GRIP_L / 2])        # back flat to print on
    for i in range(8):                                                                                      # finger flutes
        g = g - M.cylinder(THREAD_Z0 - 30.0, 2.0, 2.0, 32).translate([GRIP_OD / 2 + 1.2, 0, 16.0]).rotate([0, 0, i * 45])
    return g


def hood():
    """Sliding hood: a keyed sleeve with the arch that captures the reel foot's other end. Prints arch up."""
    r_in = THREAD_MAJOR / 2 + 0.3
    s = M.cylinder(HOOD_L, r_in + 2.4, r_in + 2.4, 128) - M.cylinder(HOOD_L + 2, r_in, r_in, 128).translate([0, 0, -1])
    s = s - M.cube([12.0, FOOT_W + 6.4, HOOD_L + 2], False).translate([BED_X - 0.1, -(FOOT_W + 6.4) / 2, -1])
    arch = M.cube([6.0, FOOT_W + 7.0, 9.0], False).translate([BED_X - 0.2, -(FOOT_W + 7.0) / 2, HOOD_L - 9.0])
    arch = arch - M.cube([FOOT_T + 0.3, FOOT_W, 10.0], False).translate([BED_X - 0.21, -FOOT_W / 2, HOOD_L - 9.5])
    key = M.cube([2.6, 3.6, HOOD_L], False).translate([-GRIP_OD / 2 - 0.8, -1.8, 0])
    return s + arch + key


def nut():
    """Lock nut: internal thread, grip rim. Prints flat."""
    r_out = THREAD_MAJOR / 2 + 3.0
    n = M.cylinder(NUT_L, r_out, r_out, 128)
    for i in range(12):
        n = n - M.cylinder(NUT_L + 2, 1.8, 1.8, 24).translate([r_out + 0.4, 0, -1]).rotate([0, 0, i * 30])
    return n - external_thread(-1.0, NUT_L + 2.0, clearance=THREAD_CLR)


def collar():
    """Presses into the grip top; carries the square pin that section 1's base socket slides over."""
    r_in = GRIP_ID / 2 + PRESS / 2
    c = M.cylinder(COLLAR_L, r_in, r_in, 128) + M.cylinder(3.0, GRIP_OD / 2, GRIP_OD / 2, 128).translate([0, 0, COLLAR_L])
    for a in range(0, 360, 90):
        c = c - M.cube([1.2, GRIP_OD, COLLAR_L - 4], True).translate([0, 0, (COLLAR_L - 4) / 2]).rotate([0, 0, a])
    s = bore_side(SIZES[0][0]) - PIN_CLR
    p = ext_z(sq(s), COLLAR_L + 2.9, COLLAR_L + 3.0 + PIN_L / 2 - 1.0)
    p = p + M.batch_hull([ext_z(sq(s), COLLAR_L + 3.0 + PIN_L / 2 - 1.2, COLLAR_L + 3.0 + PIN_L / 2 - 1.0), ext_z(sq(s - 2.0), COLLAR_L + 3.0 + PIN_L / 2 - 0.2, COLLAR_L + 3.0 + PIN_L / 2)])
    return c + p


def butt_cap():
    r_in = GRIP_ID / 2 + PRESS / 2
    c = M.cylinder(CAP_L, r_in, r_in, 128).translate([0, 0, 3.0]) + M.cylinder(3.0, GRIP_OD / 2 + 1.0, GRIP_OD / 2 + 1.0, 128)
    c = c - M.cylinder(CAP_L, r_in - 1.8, r_in - 1.8, 96).translate([0, 0, 4.0])
    for a in range(0, 360, 90):
        c = c - M.cube([1.2, GRIP_OD, CAP_L - 3], True).translate([0, 0, 3.0 + (CAP_L - 3) / 2 + 1.5]).rotate([0, 0, a])
    for a in (0, 180):
        c = c - M.cube([6.0, 10.0, 1.6], True).translate([GRIP_OD / 2 + 1.0, 0, 0.8]).rotate([0, 0, a])
    return c


def reel_foot_gauge(L=62.0):
    """A dummy spinning-reel foot (1000 to 2500 size) along z with its sole on x = 0 facing +x: two ends 3.2 thick
    and 12.5 wide, a thicker middle and a stem. For the fit test only."""
    W, T = 12.5, 3.2
    end = lambda z0, z1: M.cube([T, W, z1 - z0], False).translate([0, -W / 2, z0])
    mid = M.cube([T + 3.0, W - 2.0, L - 36.0], False).translate([0, -(W - 2.0) / 2, 18.0])
    stem = M.cube([25.0, 8.0, 10.0], False).translate([T, -4.0, L / 2 - 5.0])
    return end(0.0, 18.0) + end(L - 18.0, L) + mid + stem


def packing_check(step=1.0):
    """Do the three square bars fit inside the grip bore, axis-aligned, without overlapping? Exhaustive search over
    a grid for the two biggest, then any free spot for the third."""
    sides = sorted([sz[0] + 0.3 for sz in SIZES], reverse=True)
    R = GRIP_ID / 2

    def inside(x, y, s):
        h = s / 2
        return x + h <= BORE_CHORD and all(math.hypot(x + sx * h, y + sy * h) <= R for sx in (-1, 1) for sy in (-1, 1))

    def overlap(a, b):
        return abs(a[0] - b[0]) < (a[2] + b[2]) / 2 - 1e-9 and abs(a[1] - b[1]) < (a[2] + b[2]) / 2 - 1e-9

    n = int(R / step)
    grid = [(x * step, y * step) for x in range(-n, n + 1) for y in range(-n, n + 1)]
    spots = [[(x, y, s) for (x, y) in grid if inside(x, y, s)] for s in sides]
    for a in spots[0]:
        if a[0] > 0 or a[1] > 0:
            continue                                        # symmetry: the biggest bar in the lower-left quadrant
        for b in spots[1]:
            if overlap(a, b):
                continue
            for c in spots[2]:
                if not overlap(a, c) and not overlap(b, c):
                    return True, [a, b, c]
    return False, []


def stress_table(tip_load=TIP_LOAD_N):
    """Bending stress at each section base and each pin at a tip load, from the geometry. Square: I = s^4/12,
    c = s/2. Levers are distances from the tip."""
    rows = []
    for i, (s0, s1) in enumerate(SIZES):
        lever = (N_SEC - i) * SEC_L
        Mb = tip_load * lever
        b = bore_side(s0)
        I = (s0 ** 4 - b ** 4) / 12
        rows.append({"where": f"section {i + 1} base ({s0} mm sq, {WALL} wall)", "lever_mm": lever, "moment_Nmm": round(Mb), "stress_MPa": round(Mb * (s0 / 2) / I, 1)})
        if i < N_SEC - 1:
            p = pin_side(i)
            lever_j = (N_SEC - 1 - i) * SEC_L
            Mj = tip_load * lever_j
            rows.append({"where": f"pin {i + 1} ({p} mm sq)", "lever_mm": lever_j, "moment_Nmm": round(Mj), "stress_MPa": round(Mj * (p / 2) / (p ** 4 / 12), 1)})
    # the solid tip, 80 mm from the end
    s_100 = SIZES[-1][1] + (SIZES[-1][0] - SIZES[-1][1]) * 80 / SEC_L
    rows.append({"where": f"solid tip 80 mm from the end ({round(s_100, 1)} mm sq)", "lever_mm": 80, "moment_Nmm": round(tip_load * 80), "stress_MPa": round(tip_load * 80 * (s_100 / 2) / (s_100 ** 4 / 12), 1)})
    return rows


def stiffness_table():
    """EI (N·mm²) of each section base against a hollow E-glass tube of the same outside size (wall 12%)."""
    out = []
    for i, (s0, s1) in enumerate(SIZES):
        I_sq = (s0 ** 4 - bore_side(s0) ** 4) / 12
        wall = max(0.8, s0 * 0.12)
        I_tube = math.pi * (s0 ** 4 - (s0 - 2 * wall) ** 4) / 64
        out.append({"section": i + 1, "side_mm": s0, "EI_ppa_cf_Nmm2": round(E_PPA_CF_WET * I_sq), "EI_glass_tube_Nmm2": round(30000 * I_tube)})
    return out


PARTS = {
    "cast-grip": ("Cast grip with reel seat", lambda: grip().rotate([0, -90, 0]), "as_is", "cast", "ASA or PETG-CF. Prints lying on its back flat. Screw-lock reel seat; sections pack inside."),
    "cast-hood": ("Sliding hood", hood, "as_is", "cast", "Keyed to the grip; rides the thread crests; the nut pushes it onto the reel foot."),
    "cast-nut": ("Lock nut", nut, "as_is", "cast", "Printed thread, 36 × 3 mm, 50° flanks."),
    "cast-collar": ("Collar with pin", collar, "as_is", "cast", "Presses into the grip top; section 1 slides over its pin."),
    "cast-butt-cap": ("Butt cap", butt_cap, "as_is", "cast", "Presses into the butt; pull to unpack."),
    "cast-section-1": ("Section 1", lambda: section(0), "as_is", "cast", "PPA-CF. Hollow square bar, prints flat."),
    "cast-section-2": ("Section 2", lambda: section(1), "as_is", "cast", "PPA-CF. Prints flat."),
    "cast-section-3": ("Section 3, tip", lambda: section(2), "as_is", "cast", "PPA-CF. Prints flat; solid over the last 90 mm; tip top slips over the end."),
    "cast-pin-1": ("Spigot pin 1", lambda: pin(0), "as_is", "cast", "PPA-CF. Epoxy half into section 1's top."),
    "cast-pin-2": ("Spigot pin 2", lambda: pin(1), "as_is", "cast", "PPA-CF. Epoxy half into section 2's top."),
    "cast-tip-top": ("Tip top", tip_top, "stand_up", "cast", "PPA-CF. Epoxy onto the tip."),
    "cast-guide-1": ("Guide 1 (7 mm ring)", lambda: guide(GUIDE_RINGS[0], 11.3), "on_bottom", "cast", "PPA-CF. Epoxy and whip onto section 1."),
    "cast-guide-2": ("Guide 2 (5.5 mm ring)", lambda: guide(GUIDE_RINGS[1], 9.7), "on_bottom", "cast", "Section 2."),
    "cast-guide-3": ("Guide 3 (4.4 mm ring)", lambda: guide(GUIDE_RINGS[2], 6.2), "on_bottom", "cast", "Section 3."),
}
