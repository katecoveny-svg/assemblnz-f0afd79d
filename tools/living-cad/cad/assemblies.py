"""
assembled views — one definition that drives the widget's live 3D and the hero renders
=====================================================================================
For each widget handle: one or more views, each a list of slots. A slot names a print file (by id, or by prefix
when the widget's choice decides which lid or insert goes there), its pose in the assembled frame as a 4 × 4 matrix
applied to the served STL (which emit() centred on x/y and set on z = 0 in its print orientation), its colour role
(body, accent, text, fixed) and an explode offset so a view can assemble itself on screen.

Poses come from the CAD modules' own frames, not from hand placement: a part built in the installed frame (pods,
lids, inserts, mounts, keys, boards, accessories) gets the inverse of emit()'s print transform; the rod's sections
stack by their spigot lengths. Run from the repo root after the builds:
    python3 tools/living-cad/cad/assemblies.py  ->  lib/living/assemblies.json
"""
import json, math, os, sys
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
import lib
import dayrally2 as d2
import dayrally_pocket as pk
import dayrally_rod as rod
from build_dayrally2 import PRINT

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
MAN = json.load(open(os.path.join(ROOT, "lib", "living", "cad-manifest.json")))
PARTS = {p["id"]: p for p in MAN["parts"]}
FONT = pk.FONT


def rot_matrix(rx, ry, rz):
    """manifold's rotate([rx, ry, rz]): x, then y, then z, degrees."""
    cx, sx = math.cos(math.radians(rx)), math.sin(math.radians(rx))
    cy, sy = math.cos(math.radians(ry)), math.sin(math.radians(ry))
    cz, sz = math.cos(math.radians(rz)), math.sin(math.radians(rz))
    Rx = np.array([[1, 0, 0], [0, cx, -sx], [0, sx, cx]])
    Ry = np.array([[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]])
    Rz = np.array([[cz, -sz, 0], [sz, cz, 0], [0, 0, 1]])
    return Rz @ Ry @ Rx


def printed_pose(man, how):
    """The 4 × 4 that takes the served STL of `man` (printed as `how`) back to `man`'s own frame."""
    R = rot_matrix(*PRINT[how])
    p = man.rotate(PRINT[how])
    x0, y0, z0, x1, y1, z1 = p.bounding_box()
    t = np.array([-(x0 + x1) / 2, -(y0 + y1) / 2, -z0])            # emit's translation: S = R m + t
    Ri = R.T
    Mx = np.eye(4)
    Mx[:3, :3] = Ri
    Mx[:3, 3] = -Ri @ t
    return Mx


def placed(Mx, offset=(0, 0, 0), rot=(0, 0, 0)):
    """Apply a further rotation then offset in the assembled frame."""
    A = np.eye(4)
    A[:3, :3] = rot_matrix(*rot)
    A[:3, 3] = np.array(offset, dtype=float)
    return A @ Mx


def mat(Mx):
    return [round(float(v), 4) for v in np.asarray(Mx).T.flatten()]      # column-major, as three.js Matrix4.fromArray reads it


def slot(ref, Mx, role="body", explode=(0, 0, 0), prefix=False, text=None):
    s = {"prefix" if prefix else "id": ref, "matrix": mat(Mx), "role": role, "explode": list(explode)}
    if text:
        s["text"] = text                                                   # the customer's own lettering is drawn here, never the sample
    return s


OUT = {}


def add(handle, views):
    OUT[handle] = {"views": views}


# ---------------- the pods: base, lid (chosen), lid inlay, insert (chosen), two keys; open and closed ----------------
def pod_views(size, prefix_lid, prefix_insert, base_id, extra_lids=()):
    L, W, H, ZT = d2.dims(size)
    base = d2.pod_base(size) if size != "wide" else d2.pod_base("wide")
    base_M = printed_pose(base, "as_is")
    lid_plain, _ = d2.pod_lid(size, "plain")
    lid_M = printed_pose(lid_plain, "face_down")
    inlay_text = {"w": L - 40, "h": min(20.0, W * 0.32), "z": ZT + d2.LID_H + 0.05}
    key_M = printed_pose(lib.turn_key(), "as_is")
    ins_plain = d2.insert_grid(size, 2, 1) if size != "wide" else d2.insert_grid("wide", 2, 1, h=24.0)
    ins_M = printed_pose(ins_plain, "as_is")
    keys = [slot("grid-turn-key", placed(key_M, (x, y, 0)), "fixed", (0, 0, -30)) for (x, y) in d2.KEYS]
    closed = [slot(base_id, base_M, "body"), slot(prefix_lid, lid_M, "body", (0, 0, 60), prefix=True),
              slot(prefix_lid + "*-inlay", placed(lid_M, (0, 0, 0)), "accent", (0, 0, 60), prefix=True, text=inlay_text),
              slot(prefix_insert, ins_M, "accent", (0, 0, 30), prefix=True)] + keys
    open_ = [slot(base_id, base_M, "body"), slot(prefix_insert, ins_M, "accent", (0, 0, 20), prefix=True),
             slot(prefix_lid, placed(lid_M, (0, -(W + 24), -(ZT - d2.Z0)), (0, 0, 0)), "body", (0, 0, 0), prefix=True),
             slot(prefix_lid + "*-inlay", placed(lid_M, (0, -(W + 24), -(ZT - d2.Z0))), "accent", (0, 0, 0), prefix=True, text={**inlay_text, "y": -(W + 24), "z": inlay_text["z"] - (ZT - d2.Z0)})] + keys
    return [{"name": "closed", "slots": closed, "reach": max(L, W) * 1.1}, {"name": "open", "slots": open_, "reach": max(L, W + W + 24) * 1.1}]


for size in ("mini", "standard", "tall", "long"):
    add(f"al-pod-{size}", pod_views(size, f"dr2-lid-{size}-", f"dr2-insert-{size}-", f"dr2-pod-{size}"))
add("lab-emergency-pack", pod_views("wide", "pk-lid-wide-", "pk-insert-wide-", "pk-pod-wide"))
add("lab-mini-emergency", pod_views("standard", "pk-lid-standard-", "pk-insert-standard-", "dr2-pod-standard"))
add("lab-fish-ruler", pod_views("long", "dr2-lid-long-", "dr2-insert-long-", "ruler-pod-long-fish"))

# ---------------- the mounts, with a standard pod closed on them ----------------
std_closed = pod_views("standard", "dr2-lid-standard-", "dr2-insert-standard-", "dr2-pod-standard")[0]["slots"]
for slug, fn in d2.MOUNTS.items():
    m = fn()
    mount_M = printed_pose(m, "face_down")
    handle = {"strap-clip": "al-strap-clip", "duo-strap": "al-duo-strap", "belt-clip": "al-belt-clip", "frame-saddle": "al-frame-saddle",
              "bar-saddle": "al-bar-saddle", "carabiner-loop": "al-carabiner-loop", "home-dock": "al-home-dock"}.get(slug)
    if not handle:
        continue
    # the pod on the mount is a prop: fixed files (plain lid, everyday insert), not the widget's choices
    pod_ids = {"dr2-lid-standard-": None, "dr2-lid-standard-*-inlay": None, "dr2-insert-standard-": "dr2-insert-standard-everyday"}   # open pod: the floor on the mount is the point
    with_pod = [slot(f"dr2-mount-{slug}", mount_M, "body")]
    for sl in std_closed:
        if "prefix" in sl:
            pid = pod_ids.get(sl["prefix"])
            if not pid:
                continue
            sl = {**sl, "id": pid}
            sl.pop("prefix"); sl.pop("text", None)
        with_pod.append(dict(sl, role=("fixed" if sl["role"] == "fixed" else "prop"), explode=[0, 0, 50]))
    add(handle, [{"name": "with a pod", "slots": with_pod, "reach": 200}, {"name": "the mount", "slots": [slot(f"dr2-mount-{slug}", mount_M, "body")], "reach": 110}])

# ---------------- the rod: assembled along +z, and packed in its grip on the saddle ----------------
def rod_views():
    G = printed_pose(rod.grip(), "as_is")
    C = printed_pose(rod.collar(), "as_is")
    B = printed_pose(rod.butt_cap(), "as_is")
    S = [printed_pose(rod.section(i), "as_is") for i in range(3)]
    T = printed_pose(rod.tip(), "as_is")
    top = rod.GRIP_L + 3.0                                  # the collar flange sits on the grip top
    z1 = top                                                # s1's origin (its spigot is 28 mm down inside the collar)
    assembled = [slot("rod-butt-cap", placed(B, (0, 0, 0), (180, 0, 0)), "accent", (0, 0, -40)),
                 slot("rod-grip", G, "body"),
                 slot("rod-collar", placed(C, (0, 0, rod.GRIP_L - rod.COLLAR_L)), "accent", (0, 0, 40)),
                 slot("rod-section-1", placed(S[0], (0, 0, z1)), "body", (0, 0, 60)),
                 slot("rod-section-2", placed(S[1], (0, 0, z1 + rod.SEC_L)), "body", (0, 0, 120)),
                 slot("rod-section-3", placed(S[2], (0, 0, z1 + 2 * rod.SEC_L)), "body", (0, 0, 180)),
                 slot("rod-tip", placed(T, (0, 0, z1 + 3 * rod.SEC_L)), "body", (0, 0, 240))]
    # lay it down for the picture: rotate the whole view about y so z runs along x
    lay = [dict(s, matrix=mat(placed(np.array(s["matrix"]).reshape(4, 4).T, (0, 0, 16), (0, 90, 0)))) for s in assembled]
    # packed: the sections inside the grip, the cap on, the grip in its TURN saddle with two keys
    sad = printed_pose(rod.rod_saddle(), "as_is")
    key_M = printed_pose(lib.turn_key(), "as_is")
    packed = [slot("rod-saddle", sad, "accent"),
              slot("rod-grip", placed(G, (-rod.GRIP_L / 2, 0, 13 + 2.0 + 16), (0, 90, 0)), "body", (0, 0, 40)),
              slot("rod-butt-cap", placed(B, (-rod.GRIP_L / 2 - 2, 0, 13 + 2.0 + 16), (0, -90, 0)), "accent", (-30, 0, 40)),
              slot("rod-collar", placed(C, (rod.GRIP_L / 2 - rod.COLLAR_L, 0, 13 + 2.0 + 16), (0, 90, 0)), "accent", (30, 0, 40))] + \
             [slot("grid-turn-key", placed(key_M, (x, 0, 0)), "fixed", (0, 0, -30)) for x in (-lib.P / 2, lib.P / 2)]
    return [{"name": "assembled", "slots": lay, "reach": 620}, {"name": "packed, on its saddle", "slots": packed, "reach": 260}]


add("lab-dayrally-rod", rod_views())

# ---------------- grid accessories on a board with their keys ----------------
def on_board(handle, part_id, fn, keys, board=(2, 4), at=(lib.P / 2, lib.P * 1.5)):
    """The accessory keyed to a board: `keys` are its keyways in its own frame; `at` is where its origin lands so
    every key and nub sits on a cell centre ((i + ½)P, (j + ½)P on the board)."""
    cols, rows = board
    bM = printed_pose(lib.board(cols, rows), "face_down")
    acc = fn()
    aM = printed_pose(acc, PARTS[part_id]["print_orientation"])
    key_M = printed_pose(lib.turn_key(), "as_is")
    ax, ay = at
    slots = [slot(f"grid-board-{cols}x{rows}", bM, "prop"), slot(part_id, placed(aM, (ax, ay, 0)), "body", (0, 0, 40))]
    for (kx, ky) in keys:
        slots.append(slot("grid-turn-key", placed(key_M, (ax + kx, ay + ky, 0)), "fixed", (0, 0, 70)))
    add(handle, [{"name": "on the board", "slots": slots, "reach": max(cols, rows) * lib.P * 1.15}, {"name": "the piece", "slots": [slot(part_id, aM, "body")], "reach": 120}])


on_board("al-hook", "grid-hook", lib.hook, [(0, lib.P)])
on_board("al-cup", "grid-cup", lib.cup, [(0, lib.P)])
on_board("al-shelf-2", "grid-shelf-2", lambda: lib.shelf(2), [(0, 0), (lib.P, 0)], at=(lib.P / 2, lib.P * 2.5))
on_board("al-bin-2", "grid-bin-2", lambda: lib.bin_(2), [(0, 0), (lib.P, 0)], at=(lib.P / 2, lib.P * 2.5))
on_board("al-shelf-3", "grid-shelf-3", lambda: lib.shelf(3), [(0, 0), (lib.P, 0), (2 * lib.P, 0)], board=(4, 4), at=(lib.P / 2, lib.P * 2.5))


# ---------------- at home, second set: the desk trays, the side tables, the Y stool, the magazine rack ----------------
import home2 as hm


def pose(pid, fn):
    return printed_pose(fn(), PARTS[pid]["print_orientation"])


def home_views():
    U = hm.U
    tS, tM, tL, tB = (pose("hm-tray-s", lambda: hm.desk_tray(1, 1)), pose("hm-tray-m", lambda: hm.desk_tray(2, 1)),
                      pose("hm-tray-l", lambda: hm.desk_tray(3, 1)), pose("hm-tray-base", hm.desk_base))
    fl = 2.0
    desk = [slot("hm-tray-base", tB, "accent"),
            slot("hm-tray-l", placed(tL, (0, -U / 2, fl)), "body", (0, 0, 60)),
            slot("hm-tray-m", placed(tM, (-U / 2, U / 2, fl)), "body", (0, 0, 90)),
            slot("hm-tray-s", placed(tS, (U, U / 2, fl)), "body", (0, 0, 120)),
            slot("hm-tray-s", placed(tS, (U, U / 2, fl + 42.0)), "accent", (0, 0, 160))]
    add("lab-desk-set", [{"name": "stacked", "slots": desk, "reach": 300}])

    d = hm.DRUM
    lo, up, top = pose("hm-drum-lower", lambda: hm.drum_section(True)), pose("hm-drum-upper", lambda: hm.drum_section(False)), pose("hm-drum-top", hm.drum_top)
    add("lab-fluted-table", [{"name": "assembled", "reach": 780, "slots": [
        slot("hm-drum-lower", lo, "body"), slot("hm-drum-upper", placed(up, (0, 0, d["h"])), "body", (0, 0, 80)),
        slot("hm-drum-top", placed(top, (0, 0, 2 * d["h"])), "accent", (0, 0, 160))]}])

    g = hm.GRID
    for handle, rnd, suffix in (("lab-grid-table", False, ""), ("lab-grid-table-round", True, "-round")):
        b, t = pose(f"hm-grid-body{suffix}", lambda: hm.grid_body(rnd)), pose(f"hm-grid-top{suffix}", lambda: hm.grid_top(rnd))
        add(handle, [{"name": "assembled", "reach": 520, "slots": [slot(f"hm-grid-body{suffix}", b, "body"),
                                                                  slot(f"hm-grid-top{suffix}", placed(t, (0, 0, g["H"])), "accent", (0, 0, 90))]}])

    arm, hub = pose("hm-y-arm", hm.y_arm), pose("hm-y-hub", hm.y_hub)
    add("lab-y-stool", [{"name": "assembled", "reach": 420, "slots": [slot("hm-y-arm", placed(arm, (0, 0, 0), (0, 0, a)), "body", (60 * math.cos(math.radians(a)), 60 * math.sin(math.radians(a)), 0)) for a in (0, 120, 240)]
                         + [slot("hm-y-hub", hub, "accent", (0, 0, 80))]}])

    k = hm.RACK
    sling, leg = pose("hm-rack-sling", hm.rack_sling), pose("hm-rack-leg", hm.rack_leg)
    hl, hu = pose("hm-rack-hoop-lower", lambda: hm.rack_hoop(True)), pose("hm-rack-hoop-upper", lambda: hm.rack_hoop(False))
    legs = [slot("hm-rack-leg", placed(leg, (x, y, 0)), "accent", (0, 0, -40)) for x in (-k["L"] / 2 + 22, k["L"] / 2 - 22) for y in (-40.0, 40.0)]
    add("lab-magazine-rack", [{"name": "assembled", "reach": 480, "slots": [slot("hm-rack-sling", sling, "body")] + legs +
                               [slot("hm-rack-hoop-lower", hl, "accent", (0, 0, -60)), slot("hm-rack-hoop-upper", hu, "accent", (0, 0, 90))]}])


home_views()

# ---------------- the builder: every wall piece in its own frame, with its keys and the cells it covers ----------------
import dayrally_tackle as tk


def wall_piece(piece_id, name, parts, keys, group, fn_bbox, handle=None):
    """A piece the builder can drop on a board. `parts` are (part id, matrix in the piece frame, role); `keys` are the
    key centres in the piece frame (each lands on a cell centre); the bbox gives the cells it covers."""
    x0, y0, _, x1, y1, _ = fn_bbox
    return {"id": piece_id, "name": name, "group": group, "handle": handle,
            "parts": [{"id": pid, "matrix": mat(M_), "role": role} for (pid, M_, role) in parts],
            "keys": [[round(float(x), 3), round(float(y), 3)] for (x, y) in keys],
            "bbox": [round(float(v), 2) for v in (x0, y0, x1, y1)]}


BUILDER_PIECES = []
for pid, name, fn, keys, group, handle in [
        ("grid-hook", "hook", lib.hook, [(0, lib.P)], "hang", "al-hook"),
        ("grid-cup", "cup", lib.cup, [(0, lib.P)], "hold", "al-cup"),
        ("grid-rod-cradle", "rod cradle", lib.rod_cradle, [(0, lib.P)], "hang", "al-rod-cradle"),
        ("grid-shelf-2", "shelf, 2 wide", lambda: lib.shelf(2), [(0, 0), (lib.P, 0)], "shelf", "al-shelf-2"),
        ("grid-shelf-3", "shelf, 3 wide", lambda: lib.shelf(3), [(0, 0), (lib.P, 0), (2 * lib.P, 0)], "shelf", "al-shelf-3"),
        ("grid-bin-2", "bin, 2 wide", lambda: lib.bin_(2), [(0, 0), (lib.P, 0)], "hold", "al-bin-2"),
        ("grid-lure-garage", "lure garage", lambda: lib.bin_(3, depth=46, height=78, dividers=11), [(0, 0), (lib.P, 0), (2 * lib.P, 0)], "tackle", "al-lure-garage"),
        ("tk-pack-case-5", "soft-bait case, 5 inch", lambda: tk.pack_case("5"), tk.KEYS, "tackle", "lab-pack-case"),
        ("tk-pack-case-7", "soft-bait case, 7 inch", lambda: tk.pack_case("7"), tk.KEYS, "tackle", "lab-pack-case"),
        ("tk-pack-rail", "pack rail", tk.pack_rail, tk.KEYS, "tackle", "lab-pack-rail"),
        ("tk-reel-dock", "reel dock", tk.reel_dock, tk.KEYS, "tackle", "lab-reel-dock")]:
    m = fn()
    BUILDER_PIECES.append(wall_piece(pid, name, [(pid, printed_pose(m, PARTS[pid]["print_orientation"]), "body")], keys, group, m.bounding_box(), handle))

for size in ("mini", "standard", "long"):
    L, W, H, ZT = d2.dims(size)
    base = d2.pod_base(size)
    lid_plain, _ = d2.pod_lid(size, "plain")
    BUILDER_PIECES.append(wall_piece(f"pod-{size}", f"pod, {size}", [(f"dr2-pod-{size}", printed_pose(base, "as_is"), "body"),
                                                                      (f"dr2-lid-{size}-plain", printed_pose(lid_plain, "face_down"), "accent")],
                                     d2.KEYS, "pod", (-L / 2 - 8, -W / 2, 0, L / 2 + 8, W / 2, 0), f"al-pod-{size}"))

KEY_MATRIX = mat(printed_pose(lib.turn_key(), "as_is"))
BOARDS = {f"grid-board-{c}x{r}": {"cols": c, "rows": r, "matrix": mat(printed_pose(lib.board(c, r), "face_down"))} for (c, r) in ((4, 4), (2, 4))}

# the mounts on their own, in the pod's frame (a pod of any size sits on a mount the way the standard one does)
MOUNT_FRAMES = {}
for slug, fn in d2.MOUNTS.items():
    MOUNT_FRAMES[f"dr2-mount-{slug}"] = mat(printed_pose(fn(), "face_down"))
MOUNT_FRAMES["tk-universal-saddle"] = mat(printed_pose(tk.universal_saddle(), "face_down"))

json.dump({"frame": "mm; a wall piece's keys land on cell centres ((i + 0.5) P, (j + 0.5) P) of a board lying in xy, faces +z",
           "pitch": lib.P, "key_matrix": KEY_MATRIX, "boards": BOARDS, "pieces": BUILDER_PIECES, "mounts": MOUNT_FRAMES},
          open(os.path.join(ROOT, "lib", "living", "builder.json"), "w"), indent=0)
print(len(BUILDER_PIECES), "builder pieces")

json.dump({"frame": "mm, z up; matrices column-major, applied to the served STL (centred on x and y, z from 0)", "handles": OUT},
          open(os.path.join(ROOT, "lib", "living", "assemblies.json"), "w"), indent=0)
print(len(OUT), "handles:", list(OUT))
