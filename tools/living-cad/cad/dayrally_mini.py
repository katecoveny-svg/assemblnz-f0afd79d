"""
TURN mini — the assembl TURN at gadget scale, and the dayrally components library built on it.
20 October 2026. Proposed; nothing printed.

The TURN (lib.py) is a 42 mm grid with a 13 mm keyway. The board's components library is 26 mm cubes that chain
on a "universal key". So: every TURN feature scaled by K = 0.6 (keyway 7.8, chamber 13.2, plate 2.4 + standoff
2.4, lugs 2.0 wide, clamp 0.06) and a CUBE of 26 mm with a mini socket in every face. A double-ended key joins
two cubes: push one end into cube A and turn it by the other end's lugs; drop cube B over the exposed end and
quarter-turn the cube itself (a cube is square, so it ends up aligned either way).

  mini frame for a socket: the face is z = FACE (4.8), the chamber lies behind it, the key enters along -z.
  All parts are built with their main socket's face at +z unless noted, so a cube's +z face is "up".
"""
import math
import numpy as np
import manifold3d as m3d
import lib
import dayrally as d1
from lib import M, CS, ext_z, ext_x, ext_y, cyl_z, rrect, circ, poly, round2d, EPS

K = 0.6                                   # scale of the TURN
FACE = lib.PLATE_Z1 * K                   # 4.8: socket face in the mini frame
PLATE = lib.PLATE_Z0 * K                  # 2.4: plate thickness = standoff (chamber) depth
CH_R = lib.CHAMBER_R * K                  # 6.6
BORE_R = lib.BORE_R * K                   # 3.9
HEAD_R = (lib.CSK_R0 + (lib.FL_Z1 - lib.CSK_Z0)) * K    # 6.3
CUBE = 26.0
CUBE_R = 2.0                              # edge rounding
RECESS_R, RECESS_D = 6.5, 0.5             # disc recess round every socket, takes the double key's 1.0 mm disc
KEY_TOP = 17.3 * K                        # 10.38: a single key's grip top above the socket's z = 0 datum
GOPRO_FINGER, GOPRO_GAP, GOPRO_W, GOPRO_HOLE = 3.0, 3.35, 14.5, 5.3


def mini_socket_cut():
    """Everything removed from a part for one mini socket whose face is at z = FACE (chamber behind, toward -z)."""
    cut = lib.board_socket_cut(0.0, 0.0).scale([K, K, K])
    return cut + cyl_z(RECESS_R, FACE - RECESS_D, FACE + 1.0, seg=64)


def socket_on(part, face="+z", at=(0.0, 0.0), size=CUBE):
    """Cut a mini socket into a part centred at the origin: face in {+z,-z,+x,-x,+y,-y}, at = (u, v) offset on that face."""
    cut = mini_socket_cut().translate([at[0], at[1], size / 2 - FACE])
    rot = {"+z": [0, 0, 0], "-z": [180, 0, 0], "+x": [0, 90, 0], "-x": [0, -90, 0], "+y": [-90, 0, 0], "-y": [90, 0, 0]}[face]
    return part - cut.rotate(rot)


def key_half():
    """A mini key's lugs and shank up to the socket face (no head)."""
    k = lib.turn_key().scale([K, K, K])
    return k ^ M.cube([30, 30, FACE + 1.02], center=False).translate([-15, -15, -1])


def universal_key():
    """Double-ended: lugs, shank, a 1.0 mm disc at the join, shank, lugs. Joins two cubes face to face."""
    a = key_half()
    disc = cyl_z(RECESS_R - 0.15, FACE - 0.5, FACE + 0.5, seg=64)
    b = key_half().rotate([180, 0, 0]).translate([0, 0, 2 * FACE])
    return a + disc + b


def single_key(head_t=1.5):
    """Lugs and shank with a flat head: closes a socket, or a key for the adapter. Head sits on the face."""
    return key_half() + cyl_z(HEAD_R, FACE - EPS, FACE + head_t, seg=64)


def _box(sx, sy, sz, r=CUBE_R):
    """A rounded box centred at the origin."""
    b = ext_z(rrect(sx, sy, r, seg=32), -sz / 2, sz / 2)
    return b ^ ext_y(rrect(sx, sz, r, seg=32), -sy / 2 - 1, sy / 2 + 1)


def cube(faces=("+z", "-z", "+x", "-x", "+y", "-y")):
    """base mount: a 26 mm cube with a mini socket in every face."""
    c = _box(CUBE, CUBE, CUBE)
    for f in faces:
        c = socket_on(c, f)
    return c


def end_cap():
    """A single key with a flat 13 mm head and a lanyard loop: closes an unused socket, gives a tie point."""
    cap = single_key(1.6)
    loop = ext_z(circ(5.0, HEAD_R + 3.2, 0, seg=48) - circ(2.6, HEAD_R + 3.2, 0, seg=48), FACE, FACE + 1.6)
    return cap + loop


def angle_joint():
    """Two sockets at 45 degrees: one in the bottom face, one in a sloped face. (y, z) wedge extruded along x."""
    prof = [(-13.0, -13.0), (13.0, -13.0), (13.0, -5.0), (-5.0, 13.0), (-13.0, 13.0)]
    body = lib.ext_x(poly([(z, y) for (y, z) in prof]), -13.0, 13.0)
    body = socket_on(body, "-z")
    # sloped face: centre of the slope segment is (4, 4), outward normal (1, 1)/sqrt2
    cut = mini_socket_cut().translate([0, 0, -FACE]).rotate([-45, 0, 0])       # face at origin, normal (0, 1, 1)/sqrt2
    cut = cut.translate([0, 4.0, 4.0])
    return body - cut


def flat_mount(w=42.0, t=6.0):
    """A plate with a socket and four countersunk screw holes (3.5 mm): screw or stick it anywhere."""
    p = ext_z(rrect(w, w, 6.0, seg=48), 0, t)
    p = p - mini_socket_cut().translate([0, 0, t - FACE])
    for sx in (-1, 1):
        for sy in (-1, 1):
            p = p - cyl_z(1.9, -1, t + 1, cx=sx * (w / 2 - 6.0), cy=sy * (w / 2 - 6.0), seg=32)
            p = p - cyl_z(1.9, t - 2.0, t + 1, r1=1.9 + 3.0, cx=sx * (w / 2 - 6.0), cy=sy * (w / 2 - 6.0), seg=32)
    return p


def tube_clamp(bar_min=22.0, bar_max=35.0):
    """A V saddle with two zip-tie channels and a socket on top; bars (22-35) or poles (12-20)."""
    gd = bar_max * 0.45
    Lx, Wy, depth = 36.0, 30.0, gd + 8.0
    body = ext_z(rrect(Lx, Wy, 5.0, seg=40), 0, depth)
    half = math.radians(60)
    v = poly([(-gd * math.tan(half), -0.01), (gd * math.tan(half), -0.01), (0, gd)])
    body = body - ext_y(v, -Wy, Wy)
    for y in (-8.0, 8.0):
        body = body - ext_x(rrect(3.4, 6.0, 1.0, gd + 2.6, y), -Lx, Lx)
    body = body - mini_socket_cut().translate([0, 0, depth - FACE])
    return body


def pole_clamp():
    return tube_clamp(12.0, 20.0)


def cam_mount():
    """action cam mount: a cube with the three-finger action-camera fitting on top (3.0 fingers, 3.35 gaps, M5)."""
    c = cube(("-z", "+x", "-x", "+y", "-y"))
    fingers = None
    pitch = GOPRO_FINGER + GOPRO_GAP
    for i in (-1, 0, 1):
        y = i * pitch
        f = ext_y(rrect(GOPRO_W, 10.0, 0.5, 0, CUBE / 2 + 5.0 - 0.0) + circ(GOPRO_W / 2, 0, CUBE / 2 + 10.0, seg=48), y - GOPRO_FINGER / 2, y + GOPRO_FINGER / 2)
        fingers = f if fingers is None else fingers + f
    fingers = fingers - ext_y(circ(GOPRO_HOLE / 2, 0, CUBE / 2 + 10.0, seg=48), -20, 20)
    fingers = fingers + M.cube([GOPRO_W, 3 * pitch, 2.0], center=True).translate([0, 0, CUBE / 2 + 0.9])
    return c + fingers


def cam_finger_gauge():
    """The camera side: two 3.0 mm fingers 3.35 apart, with the M5 bore, slid into the mount's gaps."""
    pitch = GOPRO_FINGER + GOPRO_GAP
    g = None
    for i in (-0.5, 0.5):
        y = i * pitch
        f = ext_y(rrect(GOPRO_W - 1.0, 7.6, 0.5, 0, CUBE / 2 + 2.4 + 3.8) + circ(GOPRO_W / 2 - 0.5, 0, CUBE / 2 + 10.0, seg=48), y - GOPRO_FINGER / 2, y + GOPRO_FINGER / 2)
        g = f if g is None else g + f
    bolt = ext_y(circ(2.5, 0, CUBE / 2 + 10.0, seg=32), -12, 12)
    return g + bolt


def light_mount(torch_d=25.0):
    """light mount: a cube with a C ring for a 22-26 mm torch body on top; a rubber band notch holds it."""
    c = cube(("-z", "+x", "-x", "+y", "-y"))
    R = torch_d / 2
    cz = CUBE / 2 + R + 1.0
    ring = ext_x(circ(R + 2.4, cz, 0, seg=96) - circ(R, cz, 0, seg=96), -11.0, 11.0)
    opening = ext_x(poly([(cz, 0), (cz + 2 * R, -R * 0.9), (cz + 2 * R + 10, -R * 0.9), (cz + 2 * R + 10, R * 0.9), (cz + 2 * R, R * 0.9)]), -12, 12)
    ring = ring - opening
    ring = ring - ext_x(circ(R, cz, 0, seg=96), -12, 12)
    body = c + ring
    for sx in (-1, 1):
        groove = ext_x(circ(R + 2.4 + 1.0, cz, 0, seg=96) - circ(R + 2.4 - 0.8, cz, 0, seg=96), sx * 9.0 - 1.0, sx * 9.0 + 1.0)
        body = body - (groove - M.cube([4, 40, 40], center=True).translate([sx * 9.0, 0, CUBE / 2 - 20 + 0.0]))   # not into the cube
    return body


def torch_gauge(d=25.0):
    R = d / 2
    return M.cylinder(60.0, R, -1.0, 96).rotate([0, 90, 0]).translate([-30, 0, CUBE / 2 + R + 1.0])


def adapter():
    """mini-to-full adapter: a two-key TURN flange (70 x 36) with a raised boss carrying one mini socket, so a cube
    chain locks onto a pod floor, the bar saddle, the home dock or the Grid. The boss clears the full key grips."""
    fl = ext_z(rrect(70.0, 36.0, 8.0, seg=48), lib.FL_Z0, lib.FL_Z1)
    for (x, y) in d1.KEYS:
        fl = fl - lib.flange_key_cut(x, y)
    boss_top = 18.0                                           # full key grips reach z 17.3
    boss = cyl_z(9.0, lib.FL_Z1 - EPS, boss_top, seg=64)
    boss = boss + cyl_z(11.0, lib.FL_Z1 - EPS, lib.FL_Z1 + 2.0, r1=9.0, seg=64)
    body = fl + boss - mini_socket_cut().translate([0, 0, boss_top - FACE])
    return body


def photo_tag(photo=(40.0, 30.0)):
    """photo tag: a frame with a photo pocket under four corner tabs, a socket on the back, a lanyard hole."""
    pw, ph = photo
    W, H, T = pw + 12.0, ph + 18.0, 7.0
    t = ext_z(rrect(W, H, 6.0, seg=48), 0, T)
    t = t - mini_socket_cut().translate([0, -3.0, 0]).rotate([180, 0, 0]).translate([0, 0, FACE])   # socket face at z = 0 (the back)
    pocket_z = T - 1.6
    t = t - ext_z(rrect(pw + 0.6, ph + 0.6, 2.0, 0, -3.0, seg=32), pocket_z, T + 1)
    for sx in (-1, 1):
        for sy in (-1, 1):
            tab = ext_z(rrect(6.0, 6.0, 1.0, sx * (pw / 2 - 2.0), -3.0 + sy * (ph / 2 - 2.0), seg=16), T - 0.6, T)
            t = t + tab
    t = t - ext_z(rrect(pw - 8.0, ph - 8.0, 3.0, 0, -3.0, seg=32), -1, pocket_z + 1)       # open window behind the photo (lighter, the back of the photo shows)
    t = t + ext_z(rrect(pw - 8.0 + 2, ph - 8.0 + 2, 3.0, 0, -3.0, seg=32) - rrect(pw - 8.0, ph - 8.0, 3.0, 0, -3.0, seg=32), pocket_z - 1.0, pocket_z)  # keep the pocket floor rim
    t = t - cyl_z(2.6, -1, T + 1, cy=H / 2 - 5.0, seg=32)
    return t


def photo_gauge(photo=(40.0, 30.0)):
    pw, ph = photo
    return ext_z(rrect(pw, ph, 1.5, 0, -3.0, seg=32), 7.0 - 1.6 + 0.1, 7.0 - 1.6 + 0.4)


def device_holder(w=62.0, h=92.0):
    """device holder: a shallow cradle with lips, two 20 mm strap slots, a socket on the back; for a GPS, a phone in a
    case, a power bank. A bought elastic strap holds the device."""
    T = 10.0
    c = ext_z(rrect(w + 8.0, h + 8.0, 8.0, seg=48), 0, T)
    c = c - ext_z(rrect(w + 0.6, h + 0.6, 6.0, seg=48), 3.0, T + 1)
    c = c - ext_z(rrect(w - 16.0, h - 16.0, 6.0, seg=48), -1, 4.0)
    c = c + M.cube([w - 16.0 + 2, 14.0, 3.0], center=True).translate([0, 0, 1.5])                  # keep a bridge under the socket
    for sy in (-1, 1):
        c = c - M.cube([22.0, 4.0, T + 2], center=True).translate([0, sy * (h / 2 - 10.0), T / 2])
    c = c - mini_socket_cut().rotate([180, 0, 0]).translate([0, 0, FACE])
    return c


def helmet_base(R=90.0, w=50.0, d=40.0, t=6.5):
    """GoPro-style helmet base: a plate curved underneath to a 90 mm radius (a helmet shell) with a socket on top, for a
    3M VHB pad cut to the same outline. The cam mount cube locks on; the angle joint aims it."""
    p = ext_z(rrect(w, d, 8.0, seg=48), 0, t)
    p = p - M.cylinder(w + 4, R, -1.0, 256).rotate([0, 90, 0]).translate([-(w + 4) / 2, 0, -R + 1.0])
    p = p - mini_socket_cut().translate([0, 0, t - FACE])
    return p


def helmet_gauge(R=90.0):
    return M.cylinder(80, R, -1.0, 256).rotate([0, 90, 0]).translate([-40, 0, -R + 1.0 - 0.05])


def battery_dock(bank=(70.0, 15.0), L=60.0):
    """battery extender: a sleeve for a power bank (up to 70 x 15 mm section) with a cable notch, two 20 mm strap
    slots and a socket on the back; the bank rides the bars or the pod and the phone charges on the move."""
    bw, bt = bank
    W, T = bw + 2 * 2.4 + 0.6, bt + 2.4 + 0.6 + FACE
    c = ext_z(rrect(W, L, 4.0, seg=40), 0, T)
    c = c - ext_z(rrect(bw + 0.6, L + 2, 2.0, seg=32), FACE + 2.4, T + 1)
    c = c - M.cube([bw - 10.0, L + 2, T], center=True).translate([0, 0, T])            # open front: lips 5 mm each side
    for sy in (-1, 1):
        c = c - M.cube([W + 2, 4.0, bt + 1.0], center=True).translate([0, sy * (L / 2 - 8.0), FACE + 2.4 + bt / 2 + 0.3])
    c = c - M.cube([14.0, 12.0, T + 2], center=True).translate([0, -L / 2, T / 2])     # cable notch
    c = c - mini_socket_cut().rotate([180, 0, 0]).translate([0, 0, FACE])
    return c


def battery_gauge(bank=(68.0, 14.0), L=140.0):
    return M.cube([bank[0], L, bank[1]], center=True).translate([0, 0, FACE + 2.4 + 0.3 + bank[1] / 2])


def phone_holder():
    """iPhone on the bars in the mini system: a device holder sized for a cased phone (up to 80 x 160), two strap slots
    for a silicone strap, socket on the back; lock it on a tube clamp or the bar saddle through the adapter."""
    return device_holder(w=80.0, h=160.0)


def bone_tag(name="RALLY", font=None, L=44.0, W=24.0, T=3.0):
    """rally's tag: a bone-shaped name tag, the name raised 0.8 mm in Fredoka Bold, a 4 mm split-ring hole.
    Hangs from a collar ring, or from the end cap's loop."""
    from lib import text_cs
    r = W / 2 * 0.62
    cs = rrect(L - 2 * r, W * 0.62, 3.0, seg=32)
    for sx in (-1, 1):
        for sy in (-1, 1):
            cs = cs + circ(r, sx * (L / 2 - r), sy * (W / 2 - r), seg=48)
    cs = round2d(cs, r_concave=2.0)
    tag = ext_z(cs, 0, T) - cyl_z(2.0, -1, T + 1, cx=-(L / 2 - 4.0), seg=32)
    txt = None
    if font and name:
        tcs = text_cs(name, font, cap_height=7.0, max_width=L - 16).translate([2.0, 0])
        if tcs.area() > 1:
            txt = ext_z(tcs, T - EPS, T + 0.8)
    return tag, txt


def collar_mount(web_w=25.0, web_t=4.0):
    """pet: slides onto a 20-25 mm collar; a tag, a light or a cam locks on top. A bump stops it walking."""
    Lx, Wy, H = 34.0, web_w + 8.0, web_t + 2.4 + FACE + 1.0
    b = ext_z(rrect(Lx, Wy, 4.0, seg=40), 0, H)
    b = b - ext_y(rrect(Lx + 2, web_t, 1.0, 0, 2.4 + web_t / 2), -web_w / 2, web_w / 2)
    b = b - mini_socket_cut().translate([0, 0, H - FACE])
    b = b + ext_y(poly([(-4.0, 2.4 + web_t + 0.3), (4.0, 2.4 + web_t + 0.3), (0, 2.4 + web_t - 0.8)]), -web_w / 2 + 2, web_w / 2 - 2)
    return b


def lantern_hook():
    """camp: a J hook (20 mm throat) with a socket: hangs a lantern or a bag from a pole or a branch, and the socket
    takes the end cap's loop or a cube."""
    bar = CS.square([6.0, 44.0], center=False).translate([-3.0, -44.0])
    ring = (circ(16.0, 13.0, -44.0, seg=64) - circ(10.0, 13.0, -44.0, seg=64)) ^ CS.square([40, 20], center=False).translate([-7, -64])
    tip = CS.square([6.0, 12.0], center=False).translate([23.0, -46.0])
    prof = round2d(bar + ring + tip, r_convex=1.5)
    hook = lib.ext_x(prof, -7.0, 7.0)
    block = _box(26.0, 14.0, FACE + 2.4 + 2.0).translate([0, 0, (FACE + 2.4 + 2.0) / 2 - 1.0])
    body = hook + block
    return body - mini_socket_cut().translate([0, 0, FACE + 2.4 + 2.0 - 1.0 - FACE])


def keyed_bar_end(bar_id=18.8):
    """The bar-end plug with a mini socket in its cap: a charm, a cube or a light locks into the bar end."""
    plug = d1.bar_end_plug(bar_id=bar_id, cap_d=24.0)
    plug = plug.rotate([180, 0, 0])                           # cap face up at z = 0, stem toward -z
    cut = mini_socket_cut().translate([0, 0, -FACE])          # face at z = 0, chamber below (inside the stem's hollow)
    return plug - cut


PARTS = {
    "mini-universal-key": ("universal key", universal_key, "on_side", "mini", "Double-ended TURN mini key: joins two cubes. Lies flat to print."),
    "mini-end-cap": ("end cap", end_cap, "face_down", "mini", "Closes a socket; the loop is a tie point and the handle."),
    "mini-cube": ("base mount", cube, "as_is", "mini", "26 mm cube, a socket in every face."),
    "mini-angle-joint": ("angle joint", angle_joint, "as_is", "mini", "Two sockets 45 degrees apart."),
    "mini-flat-mount": ("flat mount", flat_mount, "as_is", "mini", "Four 3.5 mm screws or adhesive."),
    "mini-tube-clamp": ("tube clamp, bars", tube_clamp, "face_down", "mini", "22-35 mm bars; two zip ties."),
    "mini-pole-clamp": ("tube clamp, poles", pole_clamp, "face_down", "mini", "12-20 mm poles; two zip ties."),
    "mini-cam-mount": ("action cam mount", cam_mount, "as_is", "mini", "Three-finger action-cam fitting (3.0 / 3.35 / M5); bought thumb screw."),
    "mini-light-mount": ("light mount", light_mount, "on_side", "mini", "C ring for a 22-26 mm torch, band notches."),
    "mini-adapter": ("mini-to-full adapter", adapter, "as_is", "mini", "Two full TURN keys underneath, one mini socket on a boss above the key grips."),
    "mini-photo-tag": ("photo tag", photo_tag, "as_is", "mini", "40 x 30 photo under four corner tabs; socket on the back; lanyard hole."),
    "mini-device-holder": ("device holder", device_holder, "as_is", "mini", "Cradle with strap slots for a 20 mm elastic strap; socket on the back."),
    "mini-helmet-base": ("helmet base", helmet_base, "face_down", "mini", "Curved to a 90 mm helmet shell; 3M VHB pad; the cam mount locks on."),
    "mini-battery-dock": ("battery dock", battery_dock, "as_is", "mini", "Sleeve for a power bank up to 70 x 15 mm; cable notch; strap slots; socket on the back."),
    "mini-phone-holder": ("phone holder", phone_holder, "as_is", "mini", "Cased phone up to 80 x 160; silicone strap; socket on the back."),
    "mini-collar-mount": ("collar mount", collar_mount, "as_is", "mini", "Slides onto a 20-25 mm collar; a tag or light locks on top."),
    "mini-lantern-hook": ("lantern hook", lantern_hook, "on_side", "mini", "J hook with a socket."),
    "mini-bar-end": ("bar-end plug, keyed", keyed_bar_end, "face_down", "mini", "The bar-end plug with a mini socket in its cap."),
}
