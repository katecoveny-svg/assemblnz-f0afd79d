"""
dayrally pocket — the small things carried close (Kate's "girl range", 21 October 2026). Proposed, unprinted.

Pieces, all on the same TURN flange or the same inlay rules as the pods:

- lip sleeve: an open-topped sleeve for a lip treatment tube, name inlaid on the front, a loop for a ring, a thumb
  scoop to push the tube out. Prints on its front face so the inlay is the first layers.
- charms, second set: bow, cherry, moon, butterfly and smile outlines beside the dayrally2 six, initials inlaid.
- friend set: one heart split on a wave into two halves that fit back together, an initial on each, a ring hole on
  each. Two friends, one heart.
- the wide pod: a fifth pod size, 176 × 100 × 40, on the two-key TURN floor like the others, with the dayrally2
  lids and three inserts: emergency (earbuds case, a small power bank, a lip balm, two compact tampons, a mini
  sanitiser lying down, a patch sachet; a wipes sachet rides on top under the lid), makeup (a compact, a mascara, a
  balm, two pencils, a mini spray) and open (two deep bays; a folded pad fits one). The card lid, for the wide and the
  standard pod, holds a bank card against the inside of the lid on two rails, so the card is never under the stuff.
- the mini emergency kit: the standard pod with the card lid and an emergency insert (a compact tampon, a lip balm, a
  mini sanitiser, two patch sachets).
- id tag and id lid: a QR code inlaid flush that a bystander scans to reach the owner's emergency page (allergies,
  parent contacts, whatever the parent chooses to publish). The code here is a SAMPLE address; the real code is
  made per order. 25 × 25 modules at 1.0 mm.
- stationery: an eraser sleeve for a standard block eraser (the rubber is replaceable, the sleeve is yours); a pen
  body for a Parker-style G2 refill with a press-fit plug and a charm loop, name inlaid on the flat; a pencil topper
  that press-fits a standard pencil and carries any charm outline.

Pocket sizes are from published product dimensions with clearance; the first print checks each against the real
thing. Nothing here is a medical device and the id page is only what its owner publishes.
"""
import math
import os
import numpy as np
import manifold3d as m3d
import lib
import dayrally2 as d2
import extras as xx
from lib import M, CS, ext_z, ext_x, ext_y, cyl_z, rrect, circ, poly, round2d, text_cs, EPS

FONT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "fonts", "Fredoka-Bold.ttf")
INLAY = d2.INLAY

# ---------------- the wide pod: a fifth size on the dayrally2 machinery ----------------
WIDE = (176.0, 100.0, 40.0)        # the long pod's length, a third wider, 6 mm taller: room for an earbuds case beside a power bank
if "wide" not in d2.SIZES:
    d2.SIZES["wide"] = WIDE
    d2.INSERTS["wide"] = ["emergency", "makeup", "open"]


def wide_insert(layout):
    """Inserts for the wide pod. Pockets: (shape, w, h, x, y, depth) in the insert's own frame; real sizes plus clearance."""
    if layout == "emergency":
        # inner 171.6 × 95.6. Row 1 (y 2..49): earbuds case, power bank, a lip balm standing. Row 2 (y −47..−2): two
        # compact tampons, a 15 mL sanitiser lying down, a patch sachet. A wipes sachet rides on top under the lid.
        pk = [("rect", 62, 47, -54, 25, 24),          # earbuds case: AirPods Pro 2 is 60.6 × 45.2 × 21.7 (Buds3 58.9 × 48.7 × 24.4 needs the next size)
              ("rect", 78, 40, 20, 25, 24),           # small power bank: Anker Nano 5,000 is 77 × 36.8 × 25 (stands 1 mm proud under 13 mm of lid)
              ("circle", 18, 18, 72, 25, 24),         # lip balm, standing: Ø16 × 65 stands proud, the lid clears it
              ("stadium", 88, 19, -41, -12, 12),      # compact tampon with applicator, wrapped: about 80 × Ø17
              ("stadium", 88, 19, -41, -34, 12),      # second
              ("stadium", 80, 27, 44, -14, 16),       # 15 mL mini sanitiser spray lying down: about 76 × Ø25
              ("rect", 60, 16, 44, -38, 10)]          # a few patches in their sachet, or a plaster
        return d2.insert_pockets("wide", pk, h=25.0), "Emergency (earbuds, power bank, balm, 2 compact tampons, sanitiser, patches)"
    if layout == "makeup":
        pk = [("circle", 60, 60, -51, -15, 16),       # compact, to Ø58
              ("stadium", 122, 18, -22, 37, 14),      # mascara lying along the top: about 120 × Ø16
              ("stadium", 66, 17, 42, 16, 14),        # lip balm or liner, lying
              ("stadium", 44, 14, 38, -4, 10), ("stadium", 44, 14, 38, -22, 10),   # two pencils, short
              ("stadium", 76, 26, 44, -38, 16),       # 15 mL mini spray lying down
              ("rect", 20, 20, -2, -4, 10)]           # hair ties
        return d2.insert_pockets("wide", pk, h=22.0), "Makeup (compact, mascara, balm, 2 pencils, mini spray, hair ties)"
    if layout == "open":
        return d2.insert_grid("wide", 2, 1, h=24.0), "Open (2 deep bays)"
    raise ValueError(layout)


CARD = (86.0, 54.0, 0.9)     # ISO ID-1 bank card, with its embossing


def std_insert(layout):
    """Inserts for the standard pod that belong to this range. Inner 123.6 × 67.6, up to 19.6 mm tall."""
    if layout == "emergency":
        pk = [("stadium", 88, 19, -16, 23, 12),       # a compact tampon
              ("circle", 18, 18, 46, 23, 18),         # lip balm standing (stands proud; the lid clears it)
              ("stadium", 78, 26, -20, -3, 16),       # 15 mL mini sanitiser spray lying down
              ("rect", 40, 20, 40, -3, 10),           # patch sachet
              ("stadium", 66, 17, -25, -26, 10),      # a second balm, or a liner
              ("rect", 40, 14, 38, -26, 8)]           # hair ties, a plaster
        return d2.insert_pockets("standard", pk, h=19.0), "Emergency, mini (tampon, balm, sanitiser, patches)"
    raise ValueError(layout)


def card_lid(size="wide", style="plain", name=None, font=None):
    """A lid with two rails inside that hold a bank card against the lid top (wide and standard pods: both inner
    faces are wider than a card). Prints top-down like every lid: the rails rise from the lid's inner face, their
    lips overhang 1.4 mm, which a 0.4 mm nozzle bridges."""
    lid, inlay = d2.pod_lid(size, style, name, font)
    L, W, H, ZT = d2.dims(size)
    z_in = ZT + d2.LID_H - d2.LID_TOP            # inner face of the lid top
    cw, ch, ct = CARD
    gap = 0.5
    rail_h = ct + gap + 1.6                      # card, clearance, lip thickness
    for s in (-1, 1):
        y = s * (ch / 2 + gap / 2 + 0.8)          # rail centreline just outside the card edge
        post = ext_z(rrect(cw - 10, 1.6, 0.5, 0, y), z_in - rail_h, z_in + EPS)
        lip = ext_z(rrect(cw - 10, 1.6 + 1.4, 0.5, 0, y - s * 0.7), z_in - rail_h, z_in - rail_h + 1.6)
        lid = lid + post + lip
    stop = ext_z(rrect(1.6, ch - 6, 0.5, -cw / 2 - 1.3, 0), z_in - rail_h, z_in + EPS)     # the card stops here; slides in from +x
    lid = lid + stop
    return lid, inlay


# ---------------- lip sleeve ----------------
def lip_sleeve(tube=(24.0, 23.0, 118.0), wall=1.6, name=None, font=None):
    """Open-topped sleeve lying on its front face (the inlay face). The tube goes in along +x and sits 30 % proud; a
    thumb scoop in the back face at the open end lets a thumb push it out; a ring loop stands off the closed end.
    Sized to the slant-tip peptide tubes (rhode 114 × 22 × 21, Laneige 96 × 23 × 23, Summer Fridays about 120 × 23)."""
    w, t, depth = tube                           # tube width (y), thickness (z), length (x)
    cw, ct = w + 1.0, t + 0.8                   # clearance
    L = depth + wall + 2.0                       # closed end wall, tube sits 4 mm proud of the open end? no: 70 % covered
    cover = depth * 0.7
    L = cover + wall
    body = ext_z(rrect(L, cw + 2 * wall, 5.0, L / 2, 0), 0, ct + 2 * wall)
    pocket = ext_z(rrect(cover + 2, cw, 3.0, wall + (cover + 2) / 2, 0), wall, wall + ct)
    body = body - pocket
    # thumb scoop on the top face (the print bed face is z=0; the scoop is in the opposite face so the inlay face stays whole)
    scoop = ext_z(circ(9.0, L, 0, seg=64), wall + ct - 1, ct + 2 * wall + 1)
    body = body - scoop
    # ring loop at the closed end
    loop = ext_z(circ(5.0, -3.5, 0, seg=48) - circ(2.3, -3.5, 0, seg=40), 0, 3.2)
    body = body + loop + ext_z(rrect(6, 10, 1, 0.5, 0), 0, 3.2)
    inlay = None
    if name and font:
        cs = text_cs(name, font, cap_height=7.0, max_width=cover - 20).scale([-1, 1]).translate([L / 2 + 2, 0])
        inlay = ext_z(cs, 0, INLAY)
        body = body - ext_z(cs, -1, INLAY)
    return body, inlay


# ---------------- charms, second set, and the friend set ----------------
def _outline2(shape, s=46.0):
    if shape == "bow":
        loop = rrect(s * 0.42, s * 0.3, s * 0.12)
        left = loop.translate([-s * 0.24, 0]).rotate(18)
        right = loop.translate([s * 0.24, 0]).rotate(-18)
        knot = circ(s * 0.11, seg=40)
        tails = round2d(poly([(-s * 0.05, -s * 0.05), (-s * 0.2, -s * 0.46), (-s * 0.04, -s * 0.4), (0, -s * 0.2), (s * 0.04, -s * 0.4), (s * 0.2, -s * 0.46), (s * 0.05, -s * 0.05)]), r_convex=1.0, r_concave=0.8)
        tab = rrect(s * 0.22, s * 0.2, s * 0.05, 0, s * 0.13)          # carries the ring above the knot
        return (left + right + knot + tails + tab).offset(-0.6, m3d.JoinType.Round, circular_segments=16).offset(0.6, m3d.JoinType.Round, circular_segments=16)
    if shape == "cherry":
        a = circ(s * 0.17, -s * 0.17, -s * 0.2, seg=48)
        b = circ(s * 0.17, s * 0.19, -s * 0.24, seg=48)
        stem1 = poly([(-s * 0.17, -s * 0.1), (-s * 0.12, -s * 0.1), (s * 0.03, s * 0.38), (-s * 0.02, s * 0.38)])
        stem2 = poly([(s * 0.19, -s * 0.14), (s * 0.24, -s * 0.14), (s * 0.03, s * 0.38), (-s * 0.02, s * 0.38)])
        leaf = circ(s * 0.11, s * 0.1, s * 0.42, seg=40).scale([1.6, 0.6]).rotate(25).translate([s * 0.06, s * 0.14])
        return a + b + round2d(stem1 + stem2, r_convex=0.8) + leaf
    if shape == "moon":
        return circ(s / 2, seg=96) - circ(s * 0.42, s * 0.22, s * 0.08, seg=96)
    if shape == "butterfly":
        w1 = circ(s * 0.2, seg=48).scale([1.25, 1.0]).rotate(20)
        w2 = circ(s * 0.16, seg=48).scale([1.2, 1.0]).rotate(-25)
        wings = w1.translate([-s * 0.22, s * 0.12]) + w1.scale([-1, 1]).translate([s * 0.22, s * 0.12]) + w2.translate([-s * 0.2, -s * 0.16]) + w2.scale([-1, 1]).translate([s * 0.2, -s * 0.16])
        body = rrect(s * 0.1, s * 0.56, s * 0.05)
        return (wings + body).offset(-0.5, m3d.JoinType.Round, circular_segments=16).offset(0.5, m3d.JoinType.Round, circular_segments=16)
    if shape == "smile":
        return circ(s / 2, seg=96)
    raise ValueError(shape)


CHARMS2 = ["bow", "cherry", "moon", "butterfly", "smile"]
HOLE2 = {"bow": (0, 9), "cherry": (0, 17), "moon": (-6, 17), "butterfly": (0, 15), "smile": (0, 17)}


def charm2(shape="bow", initials=None, font=None, t=4.0):
    """Like dayrally2.bag_charm with the second set of outlines. The smile carries its face as the inlay instead of initials."""
    cs = _outline2(shape)
    hx, hy = HOLE2[shape]
    cs = cs + circ(4.6, hx, hy, seg=48)
    body = ext_z(cs - circ(2.3, hx, hy, seg=40), 0, t)
    inlay = None
    if shape == "smile":
        face = circ(2.2, -7, 4, seg=32) + circ(2.2, 7, 4, seg=32)
        mouth = (circ(12, 0, 2, seg=96) - circ(9.6, 0, 3.2, seg=96)) ^ rrect(30, 12, 0.1, 0, -8)
        fc = face + mouth
        inlay = ext_z(fc, 0, INLAY)
        body = body - ext_z(fc, -1, INLAY)
    elif initials and font:
        room = cs.offset(-1.5, m3d.JoinType.Round, circular_segments=16)
        at = {"bow": (0, -3), "cherry": (0, -10.5), "moon": (-7, -5), "butterfly": (0, -2)}.get(shape, (0, -3))
        for cap in ((9.0, 7.5, 6.5, 5.5, 4.8) if len(initials) <= 2 else (7.0, 6.0, 5.0)):
            tc = text_cs(initials, font, cap_height=cap, max_width=24).scale([-1, 1]).translate(list(at))
            clipped = tc ^ room
            if clipped.area() > 0.97 * tc.area():
                inlay = ext_z(clipped, 0, INLAY)
                body = body - ext_z(clipped, -1, INLAY)
                break
    return body, inlay


def friend_set(initials=("M", "K"), font=None, s=54.0, t=4.0, clearance=0.35):
    """One heart split on a wave into two halves that fit back together. Each half: a ring hole at its shoulder and
    one initial inlaid. Returns [(body, inlay), (body, inlay)] for the left and right halves."""
    heart = d2._outline("heart", s)
    # the split: a wavy line down the middle, as a thin polygon to subtract
    ys = np.linspace(-s * 0.6, s * 0.6, 60)
    xs = 3.5 * np.sin(ys / s * 2 * np.pi * 1.5)
    cut = poly([(x - clearance / 2, y) for x, y in zip(xs, ys)] + [(x + clearance / 2, y) for x, y in zip(xs[::-1], ys[::-1])])
    left_mask = poly([(x, y) for x, y in zip(xs, ys)] + [(-s, s * 0.6), (-s, -s * 0.6)])
    right_mask = poly([(x, y) for x, y in zip(xs[::-1], ys[::-1])] + [(s, -s * 0.6), (s, s * 0.6)])
    halves = []
    for k, (mask, side) in enumerate(((left_mask, -1), (right_mask, 1))):
        cs = (heart ^ mask) - cut
        hx, hy = side * s * 0.26, s * 0.3
        cs = cs + circ(4.4, hx, hy, seg=48)
        body = ext_z(cs - circ(2.3, hx, hy, seg=40), 0, t)
        inlay = None
        ch = initials[k] if k < len(initials) else None
        if ch and font:
            tc = text_cs(ch, font, cap_height=10.0).scale([-1, 1]).translate([side * s * 0.19, -s * 0.06])
            room = cs.offset(-1.5, m3d.JoinType.Round, circular_segments=16)
            tc = tc ^ room
            inlay = ext_z(tc, 0, INLAY)
            body = body - ext_z(tc, -1, INLAY)
        halves.append((body, inlay))
    return halves


# ---------------- the id code ----------------
SAMPLE_ID_URL = "HTTPS://ASSEMBL.CO.NZ/I/SAMPLE"     # upper case keeps the QR in alphanumeric mode: 25 × 25 modules at level M


def qr_cs(text=SAMPLE_ID_URL, module=1.0, error="m"):
    """The QR code as a cross-section of dark modules, centred on the origin, dark modules joined where adjacent."""
    import segno
    q = segno.make(text, error=error)
    rows = [list(r) for r in q.matrix]
    n = len(rows)
    cells = []
    for j, row in enumerate(rows):
        for i, v in enumerate(row):
            if v:
                cells.append(CS.square([module + 0.02, module + 0.02], center=True).translate([(i - (n - 1) / 2) * module, ((n - 1) / 2 - j) * module]))
    return CS.batch_boolean(cells, m3d.OpType.Add), n


def id_tag(url=SAMPLE_ID_URL, font=None, L=64.0, W=38.0, t=4.0, module=1.0):
    """A bag or bike tag with the QR inlaid flush beside the word SCAN and a ring hole. Printed code-side down."""
    cs = rrect(L, W, 8.0)
    hx = -L / 2 + 8
    body = ext_z(cs - circ(2.6, hx, 0, seg=40), 0, t)
    code, n = qr_cs(url, module)
    code = code.scale([-1, 1]).translate([L / 2 - 4 - n * module / 2, 0])         # mirrored: it reads from the bed side
    inlay = ext_z(code, 0, INLAY)
    body = body - ext_z(code, -1, INLAY)
    if font:
        tc = text_cs("SCAN", font, cap_height=5.0).rotate(90).scale([-1, 1]).translate([hx + 10, 0])
        inlay = inlay + ext_z(tc, 0, INLAY)
        body = body - ext_z(tc, -1, INLAY)
    return body, inlay


def id_lid(size="mini", url=SAMPLE_ID_URL, name=None, font=None, module=1.0):
    """Any pod lid with the QR inlaid in its top beside the name: the pod on the bike carries the owner's page."""
    lid, inlay = d2.pod_lid(size, "plain")
    L, W, H, ZT = d2.dims(size)
    z1 = ZT + d2.LID_H
    code, n = qr_cs(url, module)
    code = code.translate([L / 2 - 10 - n * module / 2, 0])
    cs = code
    if name and font:
        tc = text_cs(name, font, cap_height=min(12.0, W * 0.2), max_width=L - n * module - 30).translate([-(n * module + 6) / 2, 0])
        cs = cs + tc
    inlay = ext_z(cs, z1 - INLAY, z1)
    lid = lid - ext_z(cs, z1 - INLAY, z1 + 1)
    return lid, inlay


# ---------------- stationery ----------------
def eraser_sleeve(block=(65.0, 23.0, 13.0), wall=1.6, cover=42.0, name=None, font=None):
    """A sleeve for a standard block eraser, open at one end, a thumb slot in the back so the rubber can be pushed
    out as it wears. Lies on its broad face for the name inlay."""
    L, W, T = block
    cw, ct = W + 0.8, T + 0.6
    body = ext_z(rrect(cover + wall, cw + 2 * wall, 3.0, (cover + wall) / 2, 0), 0, ct + 2 * wall)
    pocket = ext_z(rrect(cover + 2, cw, 1.5, wall + (cover + 2) / 2, 0), wall, wall + ct)
    body = body - pocket
    slot = ext_z(rrect(cover - 12, 9.0, 4.0, wall + cover / 2 + 2, 0), wall + ct - 1, ct + 2 * wall + 1)
    body = body - slot
    inlay = None
    if name and font:
        cs = text_cs(name, font, cap_height=6.0, max_width=cover - 12).scale([-1, 1]).translate([(cover + wall) / 2, 0])
        inlay = ext_z(cs, 0, INLAY)
        body = body - ext_z(cs, -1, INLAY)
    return body, inlay


REFILL = (98.1, 5.9, 2.5)       # Parker-style G2 ballpoint refill (ISO 12757-2): 98.1 long, body about Ø5.8, tip Ø2.5


def pen_body(across=11.0, flat=8.5, name=None, font=None):
    """A pen for a G2 refill: a rounded-hexagon section with one wide flat on the bed carrying the name; a tapered
    nose with a tip hole; the bore opens at the back for the plug. Prints lying on the flat."""
    Lr, Dr, Dt = REFILL
    nose = 12.0
    L = Lr + nose + 6.0           # refill, nose, and room behind it for the plug
    hexa = circ(across / 2, seg=6).rotate(30)
    sec = hexa.offset(-1.6, m3d.JoinType.Round, circular_segments=24).offset(1.6, m3d.JoinType.Round, circular_segments=24)
    sec = sec ^ rrect(across + 2, flat * 2, 0.1, 0, flat / 2)      # one flat at y = -flat/2 ... keep simple: flatten the bottom
    sec = sec ^ rrect(across + 2, 2 * (flat - 0.0), 0.1, 0, 0)
    body = ext_x(sec, 0, L - nose)
    tip = M.batch_hull([ext_x(sec.offset(-0.01, m3d.JoinType.Round), L - nose - 0.01, L - nose), ext_x(circ(2.6, seg=48), L - 0.01, L)])
    body = body + tip
    bore = ext_x(circ((Dr + 0.5) / 2, seg=48), -1, L - nose + 4)
    tiph = ext_x(circ((Dt + 0.5) / 2, seg=32), L - nose, L + 1)
    body = body - bore - tiph
    inlay = None
    if name and font:
        cs = text_cs(name, font, cap_height=5.0, max_width=60).scale([-1, 1]).translate([L * 0.45, 0])
        # the flat is the bed face at z = -flat/2 ... in this frame the section is centred; the inlay goes on the -z face: rotate later in emit
        inlay = ext_z(cs, -flat / 2, -flat / 2 + INLAY)
        body = body - ext_z(cs, -flat / 2 - 1, -flat / 2 + INLAY)
    return body, inlay


def pen_plug(across=11.0, flat=8.5, bore_d=REFILL[1] + 0.5, depth=8.0):
    """Press-fit plug for the back of the pen: a collar matching the body, a ribbed spigot into the bore, a loop."""
    hexa = circ(across / 2, seg=6).rotate(30)
    sec = hexa.offset(-1.6, m3d.JoinType.Round, circular_segments=24).offset(1.6, m3d.JoinType.Round, circular_segments=24) ^ rrect(across + 2, 2 * flat, 0.1, 0, 0)
    collar = ext_x(sec, 0, 6.0)
    spigot = ext_x(circ(bore_d / 2 + 0.08, seg=48), -depth, 0)
    for k in range(3):
        spigot = spigot + ext_x(circ(bore_d / 2 + 0.25, seg=48) - circ(bore_d / 2 - 1, seg=48), -depth + 1.5 + k * 2.2, -depth + 2.3 + k * 2.2)
    loop = ext_z(circ(4.0, 9.5, 0, seg=48) - circ(2.0, 9.5, 0, seg=40), -1.6, 1.6)
    return collar + spigot + loop


def pencil_topper(shape="star", bore_d=7.8, depth=14.0, font=None):
    """A charm outline standing on a short collar that press-fits a standard hex pencil (7.0 across flats, 7.4–7.9
    across corners: the corners bite the bore)."""
    collar = cyl_z(6.2, 0, depth + 2.0, seg=64) - cyl_z(bore_d / 2, -1, depth, seg=48)
    cs = d2._outline(shape, 30.0) if shape in d2.CHARMS else _outline2(shape, 30.0)
    charm = ext_z(cs, depth + 2.0, depth + 2.0 + 3.2).translate([0, 0, 0])
    # the charm stands up: rotate its plane vertical over the collar
    charm = ext_y(cs.translate([0, 15.0 + depth + 2.0]), -1.6, 1.6)
    neck = cyl_z(2.6, depth + 1.0, depth + 9.0, seg=32)
    return collar + neck + charm


def _wide(style):
    return lambda: d2.pod_lid("wide", style, "MILA", FONT)


PARTS = {
    "pk-pod-wide": ("dayrally pod, wide", lambda: d2.pod_base("wide"), "as_is", "pod", "176 × 100 × 40: the emergency and makeup pod. Floor is a TURN flange: every dayrally mount, any Grid board."),
    "pk-lid-wide-plain": ("Lid, wide, plain", lambda: d2.pod_lid("wide", "plain")[0], "face_down", "lid", "Prints top-down."),
    "pk-lid-wide-name": ("Lid, wide, name (sample: MILA)", lambda: _wide("name")()[0], "face_down", "lid", "Inlay prints as the first layers in a second colour."),
    "pk-lid-wide-name-inlay": ("Lid inlay, wide, name", lambda: _wide("name")()[1], "face_down", "lid", ""),
    "pk-lid-wide-dots": ("Lid, wide, dots", lambda: _wide("dots")()[0], "face_down", "lid", ""),
    "pk-lid-wide-dots-inlay": ("Lid inlay, wide, dots", lambda: _wide("dots")()[1], "face_down", "lid", ""),
    "pk-lid-wide-card": ("Card lid, wide, plain", lambda: card_lid("wide", "plain")[0], "face_down", "lid", "Two rails inside hold a bank card against the lid."),
    "pk-lid-wide-card-name": ("Card lid, wide, name (sample: MILA)", lambda: card_lid("wide", "name", "MILA", FONT)[0], "face_down", "lid", "The card lid with the name inlaid on top."),
    "pk-lid-wide-card-name-inlay": ("Card lid inlay, wide, name", lambda: card_lid("wide", "name", "MILA", FONT)[1], "face_down", "lid", ""),
    "pk-lid-standard-card": ("Card lid, standard, plain", lambda: card_lid("standard", "plain")[0], "face_down", "lid", "The standard lid with the card rails."),
    "pk-lid-standard-card-name": ("Card lid, standard, name (sample: MILA)", lambda: card_lid("standard", "name", "MILA", FONT)[0], "face_down", "lid", "The standard card lid with the name inlaid on top."),
    "pk-lid-standard-card-name-inlay": ("Card lid inlay, standard, name", lambda: card_lid("standard", "name", "MILA", FONT)[1], "face_down", "lid", ""),
    "pk-insert-wide-emergency": ("Insert, wide: emergency", lambda: wide_insert("emergency")[0], "as_is", "insert", "Earbuds case, power bank, balm, two compact tampons, sanitiser lying down, patches."),
    "pk-insert-wide-makeup": ("Insert, wide: makeup", lambda: wide_insert("makeup")[0], "as_is", "insert", "Compact, mascara, balm, two pencils, mini spray, hair ties."),
    "pk-insert-wide-open": ("Insert, wide: open", lambda: wide_insert("open")[0], "as_is", "insert", "Two deep bays; a folded pad fits one."),
    "pk-insert-standard-emergency": ("Insert, standard: emergency, mini", lambda: std_insert("emergency")[0], "as_is", "insert", "A compact tampon, a balm, a mini sanitiser, patches."),
    "pk-lip-sleeve": ("Lip sleeve (sample: MILA)", lambda: lip_sleeve(name="MILA", font=FONT)[0], "as_is", "pocket", "Open-topped sleeve for a lip treatment tube; name inlaid on the front; ring loop. Prints inlay-face down."),
    "pk-lip-sleeve-inlay": ("Lip sleeve inlay", lambda: lip_sleeve(name="MILA", font=FONT)[1], "as_is", "pocket", ""),
    "pk-id-tag": ("ID tag (sample code)", lambda: id_tag(font=FONT)[0], "as_is", "pocket", "QR inlaid flush beside SCAN; the real code is made per order. Prints code-side down."),
    "pk-id-tag-inlay": ("ID tag inlay (sample code)", lambda: id_tag(font=FONT)[1], "as_is", "pocket", ""),
    "pk-lid-mini-id": ("Lid, mini, id (sample code)", lambda: id_lid("mini")[0], "face_down", "lid", "The mini lid with the owner's QR inlaid; the name goes on the base's tag or a second lid style."),
    "pk-lid-mini-id-inlay": ("Lid inlay, mini, id (sample code)", lambda: id_lid("mini")[1], "face_down", "lid", ""),
    "pk-eraser-sleeve": ("Eraser sleeve (sample: MILA)", lambda: eraser_sleeve(name="MILA", font=FONT)[0], "as_is", "stationery", "Takes a 65 × 23 × 13 block eraser; thumb slot pushes it out. Prints inlay-face down."),
    "pk-eraser-sleeve-inlay": ("Eraser sleeve inlay", lambda: eraser_sleeve(name="MILA", font=FONT)[1], "as_is", "stationery", ""),
    "pk-pen-body": ("Pen body, G2 refill (sample: MILA)", lambda: pen_body(name="MILA", font=FONT)[0], "as_is", "stationery", "Takes a Parker-style G2 refill; prints on its flat, inlay down."),
    "pk-pen-body-inlay": ("Pen body inlay", lambda: pen_body(name="MILA", font=FONT)[1], "as_is", "stationery", ""),
    "pk-pen-plug": ("Pen plug", pen_plug, "as_is", "stationery", "Press-fit into the pen's bore; charm loop."),
}
for sh in CHARMS2:
    PARTS[f"pk-charm-{sh}"] = (f"Bag charm, {sh} (sample: MK)", (lambda s=sh: charm2(s, "MK", FONT)[0]), "as_is", "pocket", "Second charm set; initials inlaid on the bed side." if sh != "smile" else "The face is the inlay.")
    PARTS[f"pk-charm-{sh}-inlay"] = (f"Bag charm inlay, {sh}", (lambda s=sh: charm2(s, "MK", FONT)[1]), "as_is", "pocket", "")
for k, side in ((0, "left"), (1, "right")):
    PARTS[f"pk-friend-{side}"] = (f"Friend set, {side} half (sample: {'M' if k == 0 else 'K'})", (lambda i=k: friend_set(("M", "K"), FONT)[i][0]), "as_is", "pocket", "Half a heart on a wave; fits its other half.")
    PARTS[f"pk-friend-{side}-inlay"] = (f"Friend set inlay, {side}", (lambda i=k: friend_set(("M", "K"), FONT)[i][1]), "as_is", "pocket", "")
for sh in ("star", "heart", "bow", "smile"):
    PARTS[f"pk-topper-{sh}"] = (f"Pencil topper, {sh}", (lambda s=sh: pencil_topper(s)), "as_is", "stationery", "Press-fits a standard hex pencil.")
