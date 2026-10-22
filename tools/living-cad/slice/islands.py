"""
Find where a part needs supports, using Bambu Studio's own rule, so the CAD can be changed to print without them.

Bambu's rule (BambuStudio v02.08.02.61, src/libslic3r/Support/TreeSupport.cpp, detect_overhangs):
- an overhang is the part of a layer outside the layer below grown by layer_h / tan(threshold), threshold 30 degrees;
- it is a cantilever if one of its contours (a hole counts) touches nothing below, or if any point of its outline is
  more than 3 mm from where it meets the layer below. A roof bridged on every side passes; a roof with a free edge,
  or a hole through a bridged roof, does not;
- a sharp tail is a small island that starts with nothing under it.
The slicer's warning stays the final word (slice_parts.py, orient_check.py); this says where and how big.

Run from the repo root:  python3 tools/living-cad/slice/islands.py cam-body rack-mount ...   (ids from the manifest)
          python3 tools/living-cad/slice/islands.py --orient cam-body     (also count flags in the six flat orientations)
          python3 tools/living-cad/slice/islands.py --file some.stl
"""
import json, os, sys
import numpy as np
import manifold3d as m3
import trimesh
from shapely.geometry import MultiPolygon, Point, Polygon
from shapely.ops import unary_union

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
LAYER = 0.2
FIRST = 0.2
EW = 0.42                                    # extrusion width
OFFSET = LAYER / np.tan(np.radians(30))      # how far a layer may step past the one below before it is an overhang
CANTILEVER = 3.0
BIG = 8.0                                    # sharp tails are islands smaller than BIG x BIG (Bambu's thresh_big_overhang is of this order)
FLAT = {"as_is": (0, 0, 0), "flip": (180, 0, 0), "x+90": (90, 0, 0), "x-90": (-90, 0, 0), "y+90": (0, 90, 0), "y-90": (0, -90, 0)}


def load_id(pid):
    man = json.load(open(os.path.join(ROOT, "lib", "living", "cad-manifest.json")))
    part = next(p for p in man["parts"] if p["id"] == pid)
    return trimesh.load(os.path.join(ROOT, "public", part["file"]["path"].lstrip("/")))


def rotated(tm, rot):
    m = tm.copy()
    for axis, deg in zip(np.eye(3), rot):
        if deg:
            m.apply_transform(trimesh.transformations.rotation_matrix(np.radians(deg), axis))
    m.apply_translation(-m.bounds[0])
    return m


def _signed(r):
    x, y = r[:, 0], r[:, 1]
    return 0.5 * float(np.dot(x, np.roll(y, -1)) - np.dot(y, np.roll(x, -1)))


def layers(tm):
    """Cross-section at the middle of every layer as shapely geometry (manifold's slice: outer contours minus holes)."""
    man = m3.Manifold(m3.Mesh(vert_properties=np.asarray(tm.vertices, dtype=np.float32), tri_verts=np.asarray(tm.faces, dtype=np.uint32)))
    out = []
    z = FIRST / 2
    while z < tm.bounds[1][2]:
        rings = [np.asarray(c) for c in man.slice(float(z)).to_polygons() if len(c) >= 3]
        outer = [Polygon(r).buffer(0) for r in rings if _signed(r) > 0]
        holes = [Polygon(r).buffer(0) for r in rings if _signed(r) < 0]
        g = unary_union(outer) if outer else Polygon()
        if holes:
            g = g.difference(unary_union(holes))
        out.append((z, g))
        z += (FIRST + LAYER) / 2 if z < FIRST else LAYER
    return out


def parts_of(geom):
    if geom.is_empty:
        return []
    if hasattr(geom, "geoms"):
        return [g for g in geom.geoms if isinstance(g, Polygon)]
    return [geom] if isinstance(geom, Polygon) else []


def analyse(tm):
    """Cantilevers and sharp tails, layer by layer, by Bambu's rule."""
    found = []
    ls = layers(tm)
    for k in range(1, len(ls)):
        z, curr = ls[k]
        lower = ls[k - 1][1]
        if curr.is_empty:
            continue
        support = lower.buffer(EW)
        meet = lower.buffer(max(EW, OFFSET) + 0.1)
        hang = curr.difference(lower.buffer(OFFSET))
        for p in parts_of(hang):
            if p.buffer(-EW).is_empty:
                continue                                    # thinner than a line: Bambu drops it as a small overhang
            rings = [p.exterior] + list(p.interiors)
            floating = [r for r in rings if not any(support.contains(Point(c)) for c in r.coords)]
            kind, dist = None, 0.0
            if floating:
                kind = "floating contour (hole or edge, nothing below)"
            else:
                edge = p.intersection(meet)
                if edge.is_empty:
                    continue
                dist = max(edge.distance(Point(c)) for c in p.exterior.coords)
                if dist > CANTILEVER:
                    kind = "cantilever"
            if kind:
                found.append({"z": round(z, 2), "kind": kind, "reach": round(dist, 1), "area": round(p.area, 1),
                              "bbox": [round(v, 1) for v in p.bounds]})
        for p in parts_of(curr):
            if not p.buffer(0.1 * EW).intersects(lower) and p.area < BIG * BIG and not p.buffer(-0.1 * EW).is_empty:
                below2 = ls[k - 2][1] if k >= 2 else Polygon()
                if not p.buffer(0.1 * EW).intersects(below2):
                    found.append({"z": round(z, 2), "kind": "sharp tail (island)", "reach": 0, "area": round(p.area, 1),
                                  "bbox": [round(v, 1) for v in p.bounds]})
    return found


def report(tm, label, detail=True, limit=12):
    f = analyse(tm)
    print(f"  {label:8s} {len(f):3d} flagged  h {tm.bounds[1][2]:.1f}")
    if detail:
        seen = set()
        for r in f:
            key = (r["kind"], tuple(round(v) for v in r["bbox"]))
            if key in seen:
                continue
            seen.add(key)
            print(f"      z {r['z']:6.2f}  {r['kind']:46s} reach {r['reach']:5.1f}  area {r['area']:7.1f}  bbox {r['bbox']}")
            if len(seen) >= limit:
                break
    return f


if __name__ == "__main__":
    args = sys.argv[1:]
    orient = "--orient" in args
    args = [a for a in args if a != "--orient"]
    if args and args[0] == "--file":
        for path in args[1:]:
            print(f"== {path}")
            report(rotated(trimesh.load(path), (0, 0, 0)), "as_is")
        sys.exit()
    for pid in args:
        tm = load_id(pid)
        print(f"== {pid}  extents {np.round(tm.extents, 1).tolist()}")
        report(rotated(tm, (0, 0, 0)), "as_is")
        if orient:
            for name, rot in list(FLAT.items())[1:]:
                report(rotated(tm, rot), name, detail=False)
