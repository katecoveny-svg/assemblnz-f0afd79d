#!/usr/bin/env python3
"""
assembl / living — parametric CAD source · engineering pack AL-02
=================================================================

One shared physical interface (IF-01) and four foundations:

  grid   — wall panel + peg-mounted accessories (24 mm pitch, Ø6.4 holes)
  tile   — trays on a 96 mm footprint (= 4 × grid pitch), joined by clips
  stack  — freestanding riser whose bays are exactly one tile footprint
  rail   — hollow accessory bar accepting the same grid pegs

Every part is built from the constants below, exported as STEP (editable) and
STL (printable), then checked: valid B-rep, one solid, watertight mesh.
That is a digital manufacturing check. It is NOT a physical strength, fit or
wall-mounting test — those remain separate steps (see docs/living/).

Run from the repo root:

    python3 tools/living-cad/build.py            # writes public/living/cad/AL-02
    python3 tools/living-cad/build.py --check    # build + validate, no export

Requires: cadquery >= 2.4  (pip install cadquery)
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import struct
import sys
from pathlib import Path

import cadquery as cq

# ───────────────────────────────────────────────────────────── interface IF-01
PACK = "AL-02"
INTERFACE = "IF-01"
PITCH = 24.0            # mm · grid pitch; tile footprint = 4 × PITCH = 96 mm
HOLE_D = 6.4            # mm · panel/rail peg hole
PEG_D = 6.0             # mm · accessory peg (0.4 mm diametral clearance)
PEG_L = 8.0             # mm · peg length (4 mm panel + 4 mm behind)
PEG_LIP = 4.0           # mm · retaining lip below the peg tip, behind the panel
PANEL_T = 4.0           # mm · panel thickness
PLATE_T = 3.0           # mm · accessory back-plate thickness
STANDOFF = 8.0          # mm · panel-to-wall standoff (pegs + lips need ≥ 6)
TILE = 4 * PITCH        # 96 mm
TRAY_WALL = 2.4
TRAY_FLOOR = 2.0
TRAY_H = 24.0
PLA_DENSITY = 1.24      # g/cm³ (indicative, 100 % infill)

REPO = Path(__file__).resolve().parents[2]
OUT_DIR = REPO / "public" / "living" / "cad" / PACK
MANIFEST_TS = REPO / "lib" / "living" / "cad-manifest.json"


# ───────────────────────────────────────────────────────────── primitives
def box(x: float, y: float, z: float, cx: float = 0, cy: float = 0, cz: float = 0) -> cq.Workplane:
    """Axis-aligned box of size (x, y, z) centred at (cx, cy, cz)."""
    return cq.Workplane("XY").box(x, y, z).translate((cx, cy, cz))


def box_from(x0: float, x1: float, y0: float, y1: float, z0: float, z1: float) -> cq.Workplane:
    """Axis-aligned box spanning [x0,x1] × [y0,y1] × [z0,z1]."""
    return box(x1 - x0, y1 - y0, z1 - z0, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)


def cyl(r: float, length: float, pnt: tuple[float, float, float], direction: tuple[float, float, float]) -> cq.Workplane:
    return cq.Workplane("XY").add(cq.Solid.makeCylinder(r, length, cq.Vector(*pnt), cq.Vector(*direction)))


def cone(r1: float, r2: float, length: float, pnt: tuple[float, float, float], direction: tuple[float, float, float]) -> cq.Workplane:
    return cq.Workplane("XY").add(cq.Solid.makeCone(r1, r2, length, cq.Vector(*pnt), cq.Vector(*direction)))


def peg(x: float, z: float) -> cq.Workplane:
    """
    One IF-01 peg in the accessory frame: the back plate occupies y ∈ [0, PLATE_T],
    the panel sits at y ∈ [-PANEL_T, 0]. The peg runs from y = 0 to y = -PEG_L
    with a retaining lip hanging below its tip, behind the panel.
    """
    shaft = cyl(PEG_D / 2, PEG_L, (x, 0.0, z), (0, -1, 0))
    tip_chamfer = cone(PEG_D / 2, PEG_D / 2 - 1.0, 1.0, (x, -PEG_L, z), (0, -1, 0))
    lip = box_from(x - PEG_D / 2, x + PEG_D / 2, -PEG_L - 1.0, -PEG_L + 3.0, z - PEG_D / 2 - PEG_LIP, z)
    return shaft.union(tip_chamfer).union(lip)


def csk_hole_y(x: float, z: float, y_face: float, depth: float, d: float = 4.5, csk_d: float = 9.0) -> cq.Workplane:
    """Countersunk screw-hole cutter entering a face at y = y_face, going -Y."""
    through = cyl(d / 2, depth + 0.2, (x, y_face + 0.1, z), (0, -1, 0))
    csk_depth = (csk_d - d) / 2  # 90° countersink
    sink = cone(csk_d / 2 + 0.1, d / 2, csk_depth + 0.1, (x, y_face + 0.1, z), (0, -1, 0))
    return through.union(sink)


# ───────────────────────────────────────────────────────────── parts
def grid_panel(cols: int = 8, rows: int = 8) -> cq.Workplane:
    """
    grid-panel-192 · 8 × 8 holes, 192 × 192 × 4 mm, four integrated 8 mm wall
    standoffs with countersunk Ø4.5 screw holes at the corner cells.
    Fits a 220 × 220 bed (Ender class), 250 × 210 (Prusa MK4) and 256 (Bambu P/X/A1).
    """
    w, h = cols * PITCH, rows * PITCH
    panel = cq.Workplane("XY").box(w, h, PANEL_T).edges("|Z").fillet(8.0)
    pts = [(-w / 2 + PITCH / 2 + c * PITCH, -h / 2 + PITCH / 2 + r * PITCH) for c in range(cols) for r in range(rows)]
    corners = [pts[0], pts[rows - 1], pts[(cols - 1) * rows], pts[cols * rows - 1]]
    corner_set = set(corners)
    peg_pts = [p for p in pts if p not in corner_set]
    # standoff bosses under the corner cells (back of the panel)
    for (x, y) in corners:
        boss = cyl(7.0, STANDOFF, (x, y, -PANEL_T / 2), (0, 0, -1))
        panel = panel.union(boss)
    panel = panel.faces(">Z").workplane().pushPoints(peg_pts).hole(HOLE_D)
    panel = panel.faces(">Z").workplane().pushPoints(corners).cskHole(4.5, 9.0, 90)
    return panel


def grid_hook() -> cq.Workplane:
    """grid-hook-single · 20 × 44 back plate, two pegs 24 mm apart, 32 mm arm with 10 mm upturned lip."""
    plate = box_from(-10, 10, 0, PLATE_T, -22, 22)
    arm = box_from(-4, 4, PLATE_T - 0.5, 35, -22, -17)
    lip = box_from(-4, 4, 31, 35, -22, -12)
    return plate.union(arm).union(lip).union(peg(0, 12)).union(peg(0, -12))


def grid_ledge() -> cq.Workplane:
    """grid-ledge-96 · 96 × 60 shelf with 10 mm front lip, four pegs over two rows. Light objects only."""
    plate = box_from(-48, 48, 0, PLATE_T, -30, 15)
    shelf = box_from(-48, 48, PLATE_T - 0.5, 63, -30, -26)
    lip = box_from(-48, 48, 60, 63, -30, -20)
    part = plate.union(shelf).union(lip)
    for x in (-36, 36):
        part = part.union(peg(x, 6)).union(peg(x, -18))
    return part


def grid_cup() -> cq.Workplane:
    """grid-cup-48 · Ø48 × 70 cup (brushes, pens, tools) on a 30 × 44 plate with two pegs."""
    plate = box_from(-15, 15, 0, PLATE_T, -22, 22)
    cy = PLATE_T + 24 - 1.0  # overlap the plate by 1 mm so the union is clean
    outer = cyl(24.0, 70.0, (0, cy, -48), (0, 0, 1))
    inner = cyl(22.0, 70.0, (0, cy, -48 + TRAY_FLOOR), (0, 0, 1))
    return plate.union(outer).cut(inner).union(peg(0, 12)).union(peg(0, -12))


def tile_tray(x: float, y: float) -> cq.Workplane:
    """tile-tray · open tray on the 96 mm footprint, 2.4 mm walls, 2 mm floor, 6 mm corner radius."""
    outer = cq.Workplane("XY").box(x, y, TRAY_H).edges("|Z").fillet(6.0)
    inner = (
        cq.Workplane("XY")
        .box(x - 2 * TRAY_WALL, y - 2 * TRAY_WALL, TRAY_H)
        .edges("|Z")
        .fillet(6.0 - TRAY_WALL)
        .translate((0, 0, TRAY_FLOOR))
    )
    return outer.cut(inner).translate((0, 0, TRAY_H / 2))


def tile_clip() -> cq.Workplane:
    """tile-clip · H-clip bridging two adjacent tray walls (2 × 2.4 mm + 0.4 mm gap)."""
    gap = 2 * TRAY_WALL + 0.4
    leg = 1.6
    top = box_from(-(gap / 2 + leg), gap / 2 + leg, -6, 6, 8, 10)
    left = box_from(-(gap / 2 + leg), -gap / 2, -6, 6, 0, 8)
    right = box_from(gap / 2, gap / 2 + leg, -6, 6, 0, 8)
    return top.union(left).union(right)


def stack_riser() -> cq.Workplane:
    """stack-riser-192 · two 96 × 96 bays, three 4 mm legs, 56 mm clear height, 1.5 mm locating rim."""
    deck = box_from(-96, 96, -48, 48, 56, 60)
    part = deck
    for x0, x1 in ((-96, -92), (-2, 2), (92, 96)):
        part = part.union(box_from(x0, x1, -48, 48, 0, 56))
    rim_outer = box_from(-96, 96, -48, 48, 60, 61.5)
    rim_inner = box_from(-94.5, 94.5, -46.5, 46.5, 60, 61.5)
    return part.union(rim_outer.cut(rim_inner))


def rail_bar() -> cq.Workplane:
    """
    rail-bar-192 · hollow bar, 3 mm front wall with eight IF-01 peg holes, open back
    against the wall, two front-flush screw ears. Prints front-face down, no supports.
    """
    body = box_from(-96, 96, 0, 14, 0, 28)
    cavity = box_from(-93, 93, -0.1, 11, 3, 25)
    part = body.cut(cavity)
    for x in (-108, 96):
        ear = box_from(x, x + 12, 11, 14, 6, 22)
        part = part.union(ear)
    for k in range(8):
        x = -84 + k * PITCH
        part = part.cut(cyl(HOLE_D / 2, 3.2, (x, 14.1, 17), (0, -1, 0)))
    for x in (-102, 102):
        part = part.cut(csk_hole_y(x, 14, 14, 3))
    return part


# ───────────────────────────────────────────────────────────── registry
PARTS: list[dict] = [
    {
        "id": "grid-panel-192",
        "name": "grid panel · 192",
        "foundation": "grid",
        "build": grid_panel,
        "print": {"orientation": "flat, holes up", "supports": "none", "material": "PLA or PETG", "layer_mm": 0.2, "infill": "40 % gyroid", "walls": 3},
        "load": {"class": "light", "note": "Prototype. Wall fixing is by four screws into suitable anchors; the panel has not been load-tested."},
    },
    {
        "id": "grid-hook-single",
        "name": "grid hook · single",
        "foundation": "grid",
        "build": grid_hook,
        "print": {"orientation": "on its side (plate edge down), pegs horizontal", "supports": "none", "material": "PETG preferred", "layer_mm": 0.2, "infill": "100 %", "walls": 4},
        "load": {"class": "light", "note": "Headsets, keys, cables, light tools. Not for bags or clothing."},
    },
    {
        "id": "grid-ledge-96",
        "name": "grid ledge · 96",
        "foundation": "grid",
        "build": grid_ledge,
        "print": {"orientation": "shelf upside down, plate vertical", "supports": "peg lips only", "material": "PETG preferred", "layer_mm": 0.2, "infill": "60 %", "walls": 4},
        "load": {"class": "light", "note": "Small objects only — phone, skincare, a plant pot under 300 g."},
    },
    {
        "id": "grid-cup-48",
        "name": "grid cup · 48",
        "foundation": "grid",
        "build": grid_cup,
        "print": {"orientation": "cup upright, pegs horizontal", "supports": "peg lips only", "material": "PLA or PETG", "layer_mm": 0.2, "infill": "20 %", "walls": 3},
        "load": {"class": "light", "note": "Brushes, pens, lures in sleeves, small tools."},
    },
    {
        "id": "tile-tray-96x96",
        "name": "tile tray · 96 × 96",
        "foundation": "tile",
        "build": lambda: tile_tray(TILE, TILE),
        "print": {"orientation": "open side up", "supports": "none", "material": "PLA", "layer_mm": 0.2, "infill": "15 %", "walls": 3},
        "load": {"class": "light", "note": "Drawer and vanity contents."},
    },
    {
        "id": "tile-tray-96x48",
        "name": "tile tray · 96 × 48",
        "foundation": "tile",
        "build": lambda: tile_tray(TILE, TILE / 2),
        "print": {"orientation": "open side up", "supports": "none", "material": "PLA", "layer_mm": 0.2, "infill": "15 %", "walls": 3},
        "load": {"class": "light", "note": "Drawer and vanity contents."},
    },
    {
        "id": "tile-clip",
        "name": "tile clip",
        "foundation": "tile",
        "build": tile_clip,
        "print": {"orientation": "on its side", "supports": "none", "material": "PETG preferred", "layer_mm": 0.16, "infill": "100 %", "walls": 3},
        "load": {"class": "light", "note": "Joins two trays edge to edge. Fit depends on printer tolerance — test before a batch."},
    },
    {
        "id": "stack-riser-192",
        "name": "stack riser · 192",
        "foundation": "stack",
        "build": stack_riser,
        "print": {"orientation": "deck down (upside down)", "supports": "none", "material": "PLA", "layer_mm": 0.2, "infill": "25 %", "walls": 3},
        "load": {"class": "light", "note": "Desktop objects only. Not a shelf for books or heavy items."},
    },
    {
        "id": "rail-bar-192",
        "name": "rail bar · 192",
        "foundation": "rail",
        "build": rail_bar,
        "print": {"orientation": "front face down", "supports": "none", "material": "PETG preferred", "layer_mm": 0.2, "infill": "40 %", "walls": 4},
        "load": {"class": "light", "note": "Two screws into suitable anchors. Hooks and cups only; not load-tested."},
    },
]


# ───────────────────────────────────────────────────────────── validation
def stl_watertight(path: Path) -> tuple[bool, int]:
    """Edge-manifold check on a binary STL: every undirected edge used exactly twice, opposite directions."""
    data = path.read_bytes()
    n = struct.unpack_from("<I", data, 80)[0]
    tris = []
    off = 84
    for _ in range(n):
        vals = struct.unpack_from("<12f", data, off)
        off += 50
        v = [tuple(round(c, 4) for c in vals[3 + 3 * i: 6 + 3 * i]) for i in range(3)]
        tris.append(v)
    edges: dict[tuple, int] = {}
    for a, b, c in tris:
        for p, q in ((a, b), (b, c), (c, a)):
            edges[(p, q)] = edges.get((p, q), 0) + 1
    for (p, q), count in edges.items():
        if count != 1 or edges.get((q, p), 0) != 1:
            return False, n
    return True, n


def bbox_of(shape: cq.Shape) -> dict:
    bb = shape.BoundingBox()
    return {"x": round(bb.xlen, 2), "y": round(bb.ylen, 2), "z": round(bb.zlen, 2)}


def build_all(export: bool) -> dict:
    if export:
        OUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest = {
        "pack": PACK,
        "interface": INTERFACE,
        "interface_spec": {
            "pitch_mm": PITCH,
            "hole_mm": HOLE_D,
            "peg_mm": PEG_D,
            "peg_length_mm": PEG_L,
            "panel_thickness_mm": PANEL_T,
            "standoff_mm": STANDOFF,
            "tile_footprint_mm": TILE,
            "tray_wall_mm": TRAY_WALL,
        },
        "status": "prototype — digitally validated, not physically validated",
        "source": "tools/living-cad/build.py",
        "parts": [],
    }
    ok = True
    for spec in PARTS:
        wp = spec["build"]()
        solids = wp.solids().vals()
        shape = wp.val()
        valid = bool(shape.isValid())
        single = len(solids) == 1
        volume_mm3 = float(shape.Volume())
        entry = {
            "id": spec["id"],
            "name": spec["name"],
            "foundation": spec["foundation"],
            "revision": f"{PACK}.1",
            "dims_mm": bbox_of(shape),
            "volume_cm3": round(volume_mm3 / 1000, 2),
            "mass_g_pla": round(volume_mm3 / 1000 * PLA_DENSITY, 1),
            "print": spec["print"],
            "load": spec["load"],
            "validation": {"brep_valid": valid, "single_solid": single},
            "files": {},
        }
        if export:
            stl = OUT_DIR / f"{spec['id']}.stl"
            step = OUT_DIR / f"{spec['id']}.step"
            cq.exporters.export(wp, str(stl), exportType="STL", tolerance=0.05, angularTolerance=0.15, opt={"ascii": False})
            cq.exporters.export(wp, str(step), exportType="STEP")
            watertight, tri_count = stl_watertight(stl)
            entry["validation"]["watertight"] = watertight
            entry["validation"]["triangles"] = tri_count
            for key, p in (("stl", stl), ("step", step)):
                entry["files"][key] = {
                    "path": f"/living/cad/{PACK}/{p.name}",
                    "bytes": p.stat().st_size,
                    "sha256": hashlib.sha256(p.read_bytes()).hexdigest(),
                }
            ok = ok and watertight
        ok = ok and valid and single
        status = "ok" if (valid and single and entry["validation"].get("watertight", True)) else "FAIL"
        print(f"{status:4} {spec['id']:<20} {entry['dims_mm']}  {entry['mass_g_pla']} g", file=sys.stderr)
        manifest["parts"].append(entry)
    return manifest if ok else (_ for _ in ()).throw(SystemExit("validation failed — see above"))


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="build and validate without exporting")
    args = ap.parse_args()
    manifest = build_all(export=not args.check)
    if not args.check:
        text = json.dumps(manifest, indent=2) + "\n"
        (OUT_DIR / "manifest.json").write_text(text)
        MANIFEST_TS.parent.mkdir(parents=True, exist_ok=True)
        MANIFEST_TS.write_text(text)
        print(f"wrote {len(manifest['parts'])} parts to {OUT_DIR.relative_to(REPO)} and {MANIFEST_TS.relative_to(REPO)}", file=sys.stderr)


if __name__ == "__main__":
    main()
