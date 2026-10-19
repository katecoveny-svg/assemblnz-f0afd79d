"""Build the assembl living v0.1 part library: print files (STL, print orientation),
preview files (GLB, installed orientation), fit tests and a parts report."""
import json, os, sys, time
import numpy as np
import trimesh
import manifold3d as m3d
sys.path.insert(0, os.path.dirname(__file__))
import lib
from lib import M

OUT = os.path.join(os.path.dirname(__file__), "..", "parts")
FONT = os.path.join(os.path.dirname(__file__), "..", "fonts", "InstrumentSans-SemiBold.ttf")
os.makedirs(os.path.join(OUT, "stl"), exist_ok=True)
os.makedirs(os.path.join(OUT, "glb"), exist_ok=True)

PRINT = {   # installed frame -> print frame
    "face_down": [180, 0, 0],
    "as_is": [0, 0, 0],
    "on_side": [0, 90, 0],
    "on_bottom": [90, 0, 0],
}


def to_print(man, how):
    p = man.rotate(PRINT[how])
    (x0, y0, z0, x1, y1, z1) = p.bounding_box()
    return p.translate([-(x0 + x1) / 2, -(y0 + y1) / 2, -z0])


def overhang_area(man_print, limit_deg=45.0):
    tm = lib.to_trimesh(man_print)
    n = tm.face_normals
    a = tm.area_faces
    zc = tm.triangles_center[:, 2]
    down = (n[:, 2] < -np.cos(np.radians(limit_deg))) & (zc > 0.25)
    return float(a[down].sum())


report = []


def emit(slug, name, man, how, system, notes="", glb_man=None, extra=None):
    st = man.status()
    p = to_print(man, how)
    tm = lib.to_trimesh(p)
    tm.export(os.path.join(OUT, "stl", f"{slug}.stl"))
    g = lib.to_trimesh(glb_man if glb_man is not None else man)
    g.export(os.path.join(OUT, "glb", f"{slug}.glb"))
    (x0, y0, z0, x1, y1, z1) = p.bounding_box()
    row = {
        "slug": slug, "name": name, "system": system,
        "print_orientation": how,
        "print_bbox_mm": [round(x1 - x0, 1), round(y1 - y0, 1), round(z1 - z0, 1)],
        "fits_250_cube": max(x1 - x0, y1 - y0, z1 - z0) <= 250.0,
        "volume_cm3": round(man.volume() / 1000, 2),
        "est_grams_pla": round(lib.est_grams(man), 1),
        "watertight": bool(tm.is_watertight),
        "manifold_status": str(st),
        "genus": man.genus(),
        "unsupported_down_area_mm2": round(overhang_area(p), 0),
        "notes": notes,
    }
    if extra:
        row.update(extra)
    report.append(row)
    print(f"{slug:28s} {row['print_bbox_mm']}  {row['est_grams_pla']:7.1f} g  wt={row['watertight']}  overhang={row['unsupported_down_area_mm2']}")
    return row


t0 = time.time()
# ---- GRID: wall system ----
emit("grid-board-4x4", "Grid board 4×4", lib.board(4, 4), "face_down", "grid",
     "168 × 168 mm tile. Prints front-face down, no supports. Fix to wall with 4 anchor washers.")
emit("grid-board-2x4", "Grid board 2×4", lib.board(2, 4), "face_down", "grid", "84 × 168 mm tile for narrow spaces.")
key = lib.turn_key()
emit("grid-turn-key", "TURN key", key, "as_is", "grid", "Prints lugs-down. Vertical grip = open, horizontal = locked.")
emit("grid-anchor-washer", "Anchor washer", lib.anchor_washer(), "face_down", "grid", "Takes a 4 mm countersunk screw and wall plug.")
emit("grid-hook", "Hook", lib.hook(), "on_side", "grid", "Key above, locator nub below.")
emit("grid-rod-cradle", "Rod cradle", lib.rod_cradle(), "on_side", "grid", "Pair of cradles holds a rod horizontally for display. Fits rod butts up to 24 mm.")
emit("grid-shelf-2", "Shelf, 2 wide", lib.shelf(2), "on_bottom", "grid", "Light items only until load-tested.")
emit("grid-shelf-3", "Shelf, 3 wide", lib.shelf(3), "on_bottom", "grid", "Light items only until load-tested.")
emit("grid-bin-2", "Bin, 2 wide", lib.bin_(2), "on_bottom", "grid", "")
emit("grid-cup", "Cup", lib.cup(), "on_bottom", "grid", "Brushes, pens, tools.")
emit("grid-lure-garage", "Lure garage", lib.bin_(3, depth=46, height=78, dividers=11), "on_bottom", "grid",
     "Lures stand in slots; hooks stay inside the walls.")
plate, txt = lib.name_plate_with_text("MILA", FONT)
emit("grid-name-plate", "Name plate (sample: MILA)", plate, "as_is", "grid", "Plate and lettering are separate bodies for two colours.",
     glb_man=plate)
emit("grid-name-plate-text", "Name plate lettering", txt, "as_is", "grid", "Second colour; prints in the same job as the plate.")
lib.to_trimesh(plate + txt)  # sanity: union works
# ---- TILE: drawer trays ----
emit("tile-tray-3x2", "Drawer tray 3×2 (sample 240×180×50)", lib.drawer_tray(240, 180, 50, 3, 2), "as_is", "tile", "Sized to the customer's drawer.")
emit("tile-tray-2x1", "Drawer tray 2×1 (sample 160×90×40)", lib.drawer_tray(160, 90, 40, 2, 1), "as_is", "tile", "")
emit("tile-tray-1x1", "Drawer tray 1×1 (sample 90×90×40)", lib.drawer_tray(90, 90, 40, 1, 1, r=8), "as_is", "tile", "")
# ---- STACK: dowel nodes ----
emit("stack-node-corner", "Dowel node, corner", lib.dowel_node(("+x", "+y", "+z", "-z")), "as_is", "stack", "Takes 19 mm round timber dowel.")
emit("stack-node-tee", "Dowel node, tee", lib.dowel_node(("+x", "-x", "+y", "+z", "-z")), "as_is", "stack", "")
emit("stack-foot", "Dowel foot", lib.dowel_foot(), "as_is", "stack", "Felt pad recess optional.")
# ---- LIGHT ----
emit("light-pendant-fold", "Fold pendant shade", lib.pendant_shade(), "face_down", "light",
     "Shade only. LED bulbs only. Customer fits a certified E27 pendant cord set.")
print(f"built in {time.time() - t0:.1f}s")
json.dump(report, open(os.path.join(OUT, "parts-report.json"), "w"), indent=2)
# preview-only: blank plate the store paints a live name onto
blank, _ = lib.name_plate()
lib.to_trimesh(blank).export(os.path.join(OUT, "glb", "grid-name-plate-blank.glb"))
