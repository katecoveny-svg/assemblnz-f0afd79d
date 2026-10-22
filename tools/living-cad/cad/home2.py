"""
assembl / living — at home, second set (Kate's photos, 22 October 2026). Proposed, unprinted. Drawn fresh from the
ideas in the photos, not copied: every piece has its own module, its own joint and fits a 250 mm printer.

- desk trays: a stacking desk set on an 81 mm module. S, M and L trays with fluted outsides and soft inside
  corners; their feet are inset so a tray nests on top of another the same size, and the XL base tray has a low
  grid of ribs so S, M and L sit on the module and cannot slide.
- fluted side table: two tapered fluted drums and a top, joined by spigot rings. Ribbed inside. A side table and a
  plant stand, not a seat.
- grid side table: a pill-shaped block with a top cut into a 14 mm grid (a third of the TURN pitch), and a round
  one. The top drops into the body on a tongue.
- Y stool: three identical bent arms that meet in a tri-lobe hub on three bolts. 24 cm: a step, a kids' seat, a
  plant stand; nobody stands or sits on it until a load test passes.
- magazine rack: a fluted sling on four tapered legs with a hoop handle in two halves. The sling prints standing on
  its end; the hoop prints flat.
"""
import math
import numpy as np
import manifold3d as m3d
import lib
from lib import M, CS, ext_z, cyl_z, rrect, circ, poly, round2d, EPS

U = 81.0                                      # the desk module


# ---------- fluted outlines ----------
def _rrect_path(w, h, r, n):
    """n points evenly along a rounded-rect perimeter, with outward normals."""
    r = min(r, w / 2 - 0.01, h / 2 - 0.01)
    a, b = w / 2 - r, h / 2 - r
    segs = []                                  # (length, fn(t) -> (x, y, nx, ny))
    def line(x0, y0, x1, y1, nx, ny):
        L = math.hypot(x1 - x0, y1 - y0)
        segs.append((L, lambda t: (x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, nx, ny)))
    def arc(cx, cy, a0):
        segs.append((math.pi / 2 * r, lambda t: (cx + r * math.cos(a0 + t * math.pi / 2), cy + r * math.sin(a0 + t * math.pi / 2),
                                                  math.cos(a0 + t * math.pi / 2), math.sin(a0 + t * math.pi / 2))))
    line(-a, -h / 2, a, -h / 2, 0, -1); arc(a, -b, -math.pi / 2)
    line(w / 2, -b, w / 2, b, 1, 0); arc(a, b, 0)
    line(a, h / 2, -a, h / 2, 0, 1); arc(-a, b, math.pi / 2)
    line(-w / 2, b, -w / 2, -b, -1, 0); arc(-a, -b, math.pi)
    total = sum(L for L, _ in segs)
    out = []
    for k in range(n):
        target = total * k / n
        acc = 0.0
        for L, fn in segs:
            if target <= acc + L or (L, fn) == segs[-1]:
                t = 0.0 if L == 0 else min(1.0, (target - acc) / L)
                out.append(fn(t))
                break
            acc += L
    return out, total


def fluted_rrect(w, h, r, pitch=7.0, depth=1.4, res=6):
    """A rounded rectangle whose edge is a run of shallow round flutes (grooves), `pitch` apart."""
    _, total = _rrect_path(w, h, r, 8)
    flutes = max(8, round(total / pitch))
    n = flutes * res
    pts, _ = _rrect_path(w, h, r, n)
    out = []
    for k, (x, y, nx, ny) in enumerate(pts):
        d = depth * 0.5 * (1 - math.cos(2 * math.pi * k / res))          # 0 at the ridge, depth at the groove
        out.append((x - nx * d, y - ny * d))
    return poly(out)


def fluted_circle(R, flutes=72, depth=2.0, res=6):
    n = flutes * res
    return poly([((R - depth * 0.5 * (1 - math.cos(2 * math.pi * k / res))) * math.cos(2 * math.pi * k / n),
                  (R - depth * 0.5 * (1 - math.cos(2 * math.pi * k / res))) * math.sin(2 * math.pi * k / n)) for k in range(n)])


# ---------- desk trays ----------
def desk_tray(cols, rows, H=45.0, wall=2.0, floor=1.6, r=9.0):
    """A module tray: outer (n·81 − 2) so neighbours leave a 2 mm gap; a 3 mm inset foot nests in a same-size tray."""
    w, h = cols * U - 2.0, rows * U - 2.0
    body = ext_z(fluted_rrect(w, h, r), 3.0, H)
    foot = ext_z(rrect(w - 2 * wall - 1.2, h - 2 * wall - 1.2, r - wall - 0.6), 0, 3.0 + EPS)
    cav = ext_z(rrect(w - 2 * wall, h - 2 * wall, r - wall), 3.0 + floor, H + 1)
    rim = ext_z(rrect(w - 2 * wall + 1.2, h - 2 * wall + 1.2, r - wall + 0.6), H - 0.6, H + 1)     # a small lead-in chamfer
    return body + foot - cav - rim


def desk_base(H=24.0, wall=2.4, floor=2.0, rib=1.4):
    """The XL base tray: three by two modules inside, a low rib between cells so S, M and L sit on the module."""
    iw, ih = 3 * U, 2 * U
    w, h, r = iw + 2 * wall, ih + 2 * wall, 11.0
    t = ext_z(fluted_rrect(w, h, r, pitch=8.0, depth=1.6), 0, H) - ext_z(rrect(iw, ih, r - wall), floor, H + 1)
    ribs = []
    for i in (1, 2):
        ribs.append(ext_z(rrect(rib, ih - 8, rib / 2, -iw / 2 + i * U, 0), floor - EPS, floor + 2.2))
    ribs.append(ext_z(rrect(iw - 8, rib, rib / 2, 0, 0), floor - EPS, floor + 2.2))
    return t + M.batch_boolean(ribs, m3d.OpType.Add)


# ---------- fluted side table ----------
DRUM = {"r_floor": 118.0, "r_mid": 111.0, "r_top": 104.0, "h": 175.0, "wall": 2.2, "spigot": 12.0}


def drum_section(lower=True):
    d = DRUM
    r0, r1 = (d["r_floor"], d["r_mid"]) if lower else (d["r_mid"], d["r_top"])
    h, wall = d["h"], d["wall"]
    s = r1 / r0
    outer = M.extrude(fluted_circle(r0, 72, 2.4), h, scale_top=(s, s))
    inner = M.extrude(circ(r0 - wall - 2.4, seg=144), h + 0.02, scale_top=(s, s)).translate([0, 0, -0.01])
    body = outer - inner
    Ri = r0 - wall - 2.4
    ribs = [ext_z(rrect(2.0, Ri - 34.0 + 2.0, 0.6, 0, (34.0 + Ri + 2.0) / 2), 0, h).rotate([0, 0, a]) for a in (0, 120, 240)]
    inside = M.extrude(circ(Ri + 1.0, seg=144), h, scale_top=(s, s))
    hub = ext_z(circ(36.0, seg=96) - circ(33.0, seg=96), 0, h)
    z_rib0 = 0.0 if lower else d["spigot"] + 0.6
    frame = (M.batch_boolean(ribs, m3d.OpType.Add) ^ inside) + hub
    body = body + (frame.trim_by_plane([0, 0, 1], z_rib0) if z_rib0 else frame)
    if lower:                                            # the spigot ring the upper drum drops over
        ri = r1 - wall - 2.4
        body = body + ext_z(circ(ri - 0.3, seg=144) - circ(ri - 3.3, seg=144), h - EPS, h + d["spigot"])
        # a 45 degree ledge from the wall in to the ring, so the ring is carried while printing (no cantilever)
        r_in, r_wall = ri - 3.3, (r0 - wall - 2.4) * s + 0.6
        drop = r_wall - r_in
        ledge = M.revolve(poly([(r_in, h + 0.01), (r_wall, h + 0.01), (r_wall, h - drop - 1.0), (r_wall - 0.6, h - drop - 1.0)]), 144)
        body = body + ledge
    return body


def drum_top(t=10.0):
    d = DRUM
    R = d["r_top"] + 4.0
    top = ext_z(circ(R, seg=192), 0, t)
    top = top - ext_z(circ(R + 1, seg=192) - circ(R - 1.2, seg=192), t - 1.2, t + 1)         # a soft edge step
    ri = d["r_top"] - d["wall"] - 2.4
    ring = ext_z(circ(ri - 0.3, seg=144) - circ(ri - 3.3, seg=144), -d["spigot"], EPS)
    pocket = ext_z(circ(ri - 3.3 - EPS, seg=144), -1, t - 4.0)                  # hollow under a 4 mm skin
    ribs = [ext_z(rrect(2.0, 2 * (ri - 3.3), 0.6), -1, t - 4.0 + EPS).rotate([0, 0, a]) for a in (0, 60, 120)]
    return top + ring - pocket + (M.batch_boolean(ribs, m3d.OpType.Add) ^ pocket.translate([0, 0, 0]))


# ---------- grid side table ----------
def _pill(w, h):
    return rrect(w, h, min(w, h) / 2 - 0.02, seg=96)


GRID = {"w": 240.0, "h": 160.0, "H": 220.0, "wall": 2.4, "top": 16.0, "pitch": 14.0}


def grid_body(round_=False):
    g = GRID
    outer = circ(g["h"] / 2 + 30, seg=192) if round_ else _pill(g["w"], g["h"])
    inner = outer.offset(-g["wall"], m3d.JoinType.Round, circular_segments=96)
    body = ext_z(outer, 0, g["H"]) - ext_z(inner, -1, g["H"] + 1)
    x0, y0, x1, y1 = inner.bounds()
    clip = ext_z(inner.offset(1.0, m3d.JoinType.Round), -1, g["H"] + 1)
    rib = ext_z(rrect(x1 - x0 + 2, 2.0, 0.6), 0, g["H"] - 8) ^ clip
    rib2 = ext_z(rrect(2.0, y1 - y0 + 2, 0.6), 0, g["H"] - 8) ^ clip
    return body + rib + rib2


def grid_top(round_=False):
    g = GRID
    outer = circ(g["h"] / 2 + 30, seg=192) if round_ else _pill(g["w"], g["h"])
    top = ext_z(outer, 0, g["top"])
    x0, y0, x1, y1 = outer.bounds()
    p = g["pitch"]
    grooves = []
    for k in range(int((x1 - x0) / p) + 2):
        x = -((int((x1 - x0) / p) + 1) * p) / 2 + k * p
        grooves.append(ext_z(rrect(1.8, y1 - y0 + 4, 0.4, x, 0), g["top"] - 3.0, g["top"] + 1))
    for k in range(int((y1 - y0) / p) + 2):
        y = -((int((y1 - y0) / p) + 1) * p) / 2 + k * p
        grooves.append(ext_z(rrect(x1 - x0 + 4, 1.8, 0.4, 0, y), g["top"] - 3.0, g["top"] + 1))
    top = top - (M.batch_boolean(grooves, m3d.OpType.Add) ^ ext_z(outer.offset(-4.0, m3d.JoinType.Round), -1, g["top"] + 2))
    inner = outer.offset(-g["wall"] - 0.3, m3d.JoinType.Round, circular_segments=96)
    tongue = ext_z(inner - inner.offset(-3.0, m3d.JoinType.Round, circular_segments=96), -8.0, EPS)
    hollow = inner.offset(-3.0 - EPS, m3d.JoinType.Round, circular_segments=96)
    pocket = ext_z(hollow, -1, g["top"] - 6.0)                                 # a 6 mm skin under the grid
    x0, y0, x1, y1 = hollow.bounds()
    ribs = ext_z(rrect(x1 - x0 + 2, 2.0, 0.6), -1, g["top"] - 6.0 + EPS) + ext_z(rrect(2.0, y1 - y0 + 2, 0.6), -1, g["top"] - 6.0 + EPS)
    return top + tongue - pocket + (ribs ^ pocket)


# ---------- Y stool ----------
Y = {"H": 240.0, "reach": 150.0, "w": 44.0, "t": 24.0, "leg": 26.0, "tongue": 38.0}


def y_arm():
    """One arm, in its installed frame: radial along +x from the centre, top at z = H. Prints on its side."""
    y = Y
    H, R, w, t, leg = y["H"], y["reach"], y["w"], y["t"], y["leg"]
    top = CS.square([R - y["tongue"], t]).translate([y["tongue"], H - t])
    down = CS.square([leg, H]).translate([R - leg, 0])
    prof = round2d(top + down, r_convex=8.0, r_concave=34.0)
    tongue = CS.square([y["tongue"] + 2 - Y_TONGUE_X0, 12.0]).translate([Y_TONGUE_X0, H - t + 6.0])
    prof = prof + round2d(tongue, r_convex=2.0)
    arm = lib.ext_y(prof, -w / 2, w / 2)
    hole = cyl_z(3.3, H - t - 1, H + 1, cx=Y_BOLT_X, seg=48)                      # M6 clearance through the tongue
    return arm - hole


Y_TONGUE_X0 = 13.0                  # the tongues start 13 mm out: three 44 mm tongues at 120 degrees clear each other
Y_BOLT_X = (Y_TONGUE_X0 + Y["tongue"]) / 2


def y_hub():
    """Tri-lobe hub with a flat face where each arm meets it (r = the arm's beam end) and a pocket opening through
    that face for the arm's tongue: the tongue slides in radially and one bolt drops through hub and tongue. (The first
    drawing closed the pockets and ran the arms into the lobes; it could not be put together.) Prints standing on one
    of the flat faces: face down, the 46 mm pocket roofs are bridges Bambu Studio still flags. The stepped bridges
    (slot, square, round) under the counterbores stay: they cost nothing and keep a face-down print possible."""
    y = Y
    H, t, r_face = y["H"], y["t"], y["tongue"]
    lobes = [circ(30.0, 26.0 * math.cos(math.radians(a)), 26.0 * math.sin(math.radians(a)), seg=96) for a in (0, 120, 240)]
    cs = CS.batch_hull(lobes) if hasattr(CS, "batch_hull") else lobes[0] + lobes[1] + lobes[2]
    for a in (0, 120, 240):
        cs = cs - CS.square([60.0, 120.0]).translate([r_face, -60.0]).rotate(a)
    hub = ext_z(cs, H - t, H)
    cuts = []
    pw = y["w"] + 2.0
    for a in (0, 120, 240):
        x0 = Y_TONGUE_X0 - 0.6
        pocket = ext_z(rrect(r_face + 4.0 - x0, pw, 2.0, (x0 + r_face + 4.0) / 2, 0), H - t + 5.7, H - t + 18.3)
        bolt = cyl_z(3.3, H - t - 1, H + 1, cx=Y_BOLT_X, seg=48)
        head = cyl_z(5.4, H - 4.0, H + 1, cx=Y_BOLT_X, seg=48)
        steps = lib.bridge_steps(Y_BOLT_X, 0.0, 3.3, H - 4.0, 2 * 5.4, axis="x", toward=-1) + \
            lib.bridge_steps(Y_BOLT_X, 0.0, 3.3, H - t + 5.7, pw, axis="y", toward=-1)
        cuts.append((pocket + bolt + head + steps).rotate([0, 0, a]))
    return hub - M.batch_boolean(cuts, m3d.OpType.Add)


# ---------- magazine rack ----------
RACK = {"L": 220.0, "W": 160.0, "z0": 110.0, "top": 300.0, "t": 3.0, "hoop": 12.0, "band": 10.0}


def _u(W, z0, top, r):
    """A U as (y, z): bottom at z0, sides up to `top`, bottom radius r = W / 2."""
    cz = z0 + r
    return [(-W / 2, top)] + [(r * math.cos(a), cz + r * math.sin(a)) for a in np.linspace(math.pi, 2 * math.pi, 61)] + [(W / 2, top)]


def _zy(pts):
    return poly([(z, y) for (y, z) in pts])                       # ext_x takes its cross-section as (z, y)


def _boss_z(y):
    k = RACK
    r = k["W"] / 2
    return k["z0"] + r - math.sqrt(r * r - y * y)                  # the sling's underside at y


def _tear(r, cx, cy, sx):
    """A circle with a 45 degree point toward sx * x: a horizontal hole or boss that prints without supports."""
    c = circ(r, cx, cy, seg=64)
    s = r / math.sqrt(2)
    return c + poly([(cx + sx * s, cy + s), (cx + sx * r * math.sqrt(2), cy), (cx + sx * s, cy - s)][::sx])


def rack_sling():
    k = RACK
    W, t = k["W"], k["t"]
    outer = _zy(_u(W, k["z0"], k["top"], W / 2))
    inner = outer.offset(-t, m3d.JoinType.Round, circular_segments=48)
    shell = (outer - inner) - CS.square([20, W + 10]).translate([k["top"] - t, -W / 2 - 5])     # open top
    s = lib.ext_x(shell, -k["L"] / 2, k["L"] / 2)
    ribs = [lib.ext_x(circ(1.4, z, y, seg=24), -k["L"] / 2 - 0.01, k["L"] / 2 + 0.01) - lib.ext_x(inner, -k["L"], k["L"])
            for (y, z) in [(-W / 2, zz) for zz in np.linspace(k["z0"] + W / 2 + 10, k["top"] - 12, 6)] + [(W / 2, zz) for zz in np.linspace(k["z0"] + W / 2 + 10, k["top"] - 12, 6)]]
    bosses = []
    for x in (-k["L"] / 2 + 22, k["L"] / 2 - 22):
        for y in (-40.0, 40.0):
            zs = _boss_z(y)
            # the sling prints standing on its +x end, so a boss lies on its side: teardrop it (point to +x, down
            # while printing) and teardrop the leg hole the other way (point to -x, up while printing)
            b = ext_z(_tear(12.0, x, y, +1), zs - 18.0, zs + 6.0) - lib.ext_x(inner, -k["L"], k["L"])
            bosses.append(b)
        # a keel along each leg line, through both bosses: standing on its end the sling prints its bosses on these
        # (a boss on its own sticks out sideways and starts in mid-air)
    keels, holes = [], []
    for y in (-40.0, 40.0):
        zs = _boss_z(y)
        keels.append(lib.ext_x(rrect(18.0 + 6.0, 6.0, 1.0, zs - 18.0 + 12.0, y), -k["L"] / 2, k["L"] / 2) - lib.ext_x(inner, -k["L"], k["L"]))
        holes += [ext_z(_tear(4.2, x, y, -1), zs - 19, zs - 4) for x in (-k["L"] / 2 + 22, k["L"] / 2 - 22)]      # leg holes, cut once
    return (s + M.batch_boolean(ribs + bosses + keels, m3d.OpType.Add)) - M.batch_boolean(holes, m3d.OpType.Add)


def rack_leg():
    L = _boss_z(40.0) - 18.0                                   # floor to the boss underside
    return cyl_z(10.0, 0, L, r1=7.5, seg=64) + cyl_z(3.9, L - EPS, L + 14.0, seg=48)


SPLIT = 236.0


def _hoop_cs(lower=True):
    k = RACK
    r = k["W"] / 2
    R = r + k["hoop"] / 2 + k["t"] + 0.6
    cz = k["z0"] + r
    if lower:
        centre = [(-R, SPLIT)] + [(R * math.cos(a), cz + R * math.sin(a)) for a in np.linspace(math.pi, 2 * math.pi, 61)] + [(R, SPLIT)]
    else:
        centre = [(-R, SPLIT)] + [(R * math.cos(a), SPLIT + 10.0 + 72.0 * math.sin(a)) for a in np.linspace(math.pi, 0, 61)] + [(R, SPLIT)]
    segs = [CS.batch_hull([circ(k["hoop"] / 2, a[1], a[0], seg=24), circ(k["hoop"] / 2, b[1], b[0], seg=24)]) for (a, b) in zip(centre[:-1], centre[1:])]
    return CS.batch_boolean(segs, m3d.OpType.Add), R


def rack_hoop(lower=True):
    k = RACK
    cs, R = _hoop_cs(lower)
    band = lib.ext_x(cs, -k["band"] / 2, k["band"] / 2)
    if lower:
        band = band.trim_by_plane([0, 0, -1], -SPLIT)              # flat joint face
        # tenons the band's full thickness (x), so printing flat they start on the bed (round pins began mid-air)
        pins = [M.cube([k["band"], 5.0, 20.0], center=True).translate([0, y, SPLIT]) for y in (-R, R)]
        return band + M.batch_boolean(pins, m3d.OpType.Add)
    band = band.trim_by_plane([0, 0, 1], SPLIT)
    holes = [M.cube([k["band"] + 2.0, 5.6, 12.0], center=True).translate([0, y, SPLIT + 5.0]) for y in (-R, R)]       # mortises, through the band
    return band - M.batch_boolean(holes, m3d.OpType.Add)


PARTS = {
    "hm-tray-s": ("Desk tray S, 79 × 79", lambda: desk_tray(1, 1), "as_is", "home", "Fluted outside, soft inside corners; nests on a same-size tray."),
    "hm-tray-m": ("Desk tray M, 160 × 79", lambda: desk_tray(2, 1), "as_is", "home", "Two modules."),
    "hm-tray-l": ("Desk tray L, 241 × 79", lambda: desk_tray(3, 1), "as_is", "home", "Three modules; a pen tray."),
    "hm-tray-base": ("Desk base tray XL, 248 × 167", desk_base, "as_is", "home", "Holds S, M and L on an 81 mm module; low ribs stop them sliding."),
    "hm-drum-lower": ("Fluted side table, lower drum", lambda: drum_section(True), "as_is", "home", "Ø236 at the floor; the spigot ring takes the upper drum."),
    "hm-drum-upper": ("Fluted side table, upper drum", lambda: drum_section(False), "face_down", "home", "Drops over the lower drum's spigot. Prints top end down, so the ribs and hub start on the bed."),
    "hm-drum-top": ("Fluted side table, top", drum_top, "face_down", "home", "Prints face down; its ring drops into the upper drum."),
    "hm-grid-body": ("Grid side table, pill body", lambda: grid_body(False), "as_is", "home", "240 × 160 × 220, ribbed inside."),
    "hm-grid-top": ("Grid side table, pill top", lambda: grid_top(False), "face_down", "home", "A 14 mm grid cut into the top; the tongue drops into the body. Prints grid-down, hollow side up."),
    "hm-grid-body-round": ("Grid side table, round body", lambda: grid_body(True), "as_is", "home", "Ø220 × 220."),
    "hm-grid-top-round": ("Grid side table, round top", lambda: grid_top(True), "face_down", "home", "Prints grid-down, hollow side up."),
    "hm-y-arm": ("Y stool arm (×3)", y_arm, "on_bottom", "home", "Three identical arms; prints on its side. 24 cm; load-test before use as a seat."),
    "hm-y-hub": ("Y stool hub", y_hub, "on_side", "home", "Tri-lobe hub with a flat face and an open pocket for each arm; three M6 × 30 bolts and nuts, not printed. Prints standing on a flat face, no supports."),
    "hm-rack-sling": ("Magazine rack sling", rack_sling, "on_side", "home", "Prints standing on its end."),
    "hm-rack-leg": ("Magazine rack leg (×4)", rack_leg, "as_is", "home", "Tapered, a spigot into the sling's boss."),
    "hm-rack-hoop-lower": ("Magazine rack hoop, lower", lambda: rack_hoop(True), "on_side", "home", "Prints flat; two tenons up into the upper half."),
    "hm-rack-hoop-upper": ("Magazine rack hoop, upper", lambda: rack_hoop(False), "on_side", "home", "Prints flat; the handle."),
}
