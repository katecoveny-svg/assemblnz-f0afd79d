"""Scenes for every catalogue product and kit that has no hand-made scene: the parts from the manifest laid out
on the ground in a brand colour, keys and washers to the right, the camera set from the spread. Writes them into
scenes.json under `cat-<handle>` so `render-scenes.mjs <out> cat-` renders the set. Run from the repo root:
    python3 tools/living-cad/render/make-catalogue-scenes.py && node tools/living-cad/render/render-scenes.mjs docs/living/renders cat-
Renders of the print files, not photographs; nothing printed."""
import json, os, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
MAN = json.load(open(os.path.join(ROOT, "lib", "living", "cad-manifest.json")))
SCENES_PATH = os.path.join(os.path.dirname(__file__), "scenes.json")
SCENES = json.load(open(SCENES_PATH))
PARTS = {p["id"]: p for p in MAN["parts"]}
COL = {c["id"]: c["hex"] for s in MAN["colours"].values() for c in s}
STL = "/tools/living-cad/parts/stl/"
SMALL = {"grid-turn-key", "grid-anchor-washer"}          # fittings go in a column to the right

# one body colour per handle; a second colour for inlays and keys
COLOUR = {
    "al-board-2x4": "oat", "al-rod-cradle": "sage", "al-shelf-2": "clay", "al-lure-garage": "ash", "al-foot": "plum",
    "al-shade-fold": "natural", "al-keys-6": "ink", "al-duo-strap": "sky", "al-belt-clip": "tangerine",
    "al-carabiner-loop": "lime", "al-home-dock": "cloud", "al-handline-winder": "mint", "al-zip-pull": "butter",
    "al-phone-stand": "lilac", "al-chair-hook": "tomato", "al-cable-winder": "grape", "al-spoke-beads": "sun",
    "al-tyre-lever": "cobalt", "al-bar-end": "blush", "al-board-renter": "chalk", "al-over-door": "sage",
    "al-rail-hanger": "clay", "al-kit-gear-wall": "oat", "al-kit-desk-reset": "sage", "al-kit-workshop-wall": "ash",
    "al-kit-entry-and-pets": "chalk", "al-kit-no-drill-door-wall": "oat",
}
ACCENT = {"living": "ink", "dayrally": "ink"}


def spread(parts):
    """Lay parts in a row by their printed footprint; fittings in a column at the right. Returns placed parts and span."""
    main = [(pid, q) for pid, q in parts if pid not in SMALL]
    fit = [(pid, q) for pid, q in parts if pid in SMALL]
    placed, x = [], 0.0
    gap = 14.0
    for pid, q in main:
        d = PARTS[pid]["dims_mm"]
        for i in range(q):
            w, h = d["x"], d["y"]
            placed.append((pid, x + w / 2, 0.0))
            x += w + gap
    width = x - gap
    # centre the row
    placed = [(pid, px - width / 2, py) for pid, px, py in placed]
    fx = width / 2 + 24
    fy = 0.0
    for pid, q in fit:
        d = PARTS[pid]["dims_mm"]
        for i in range(q):
            placed.append((pid, fx, fy))
            fy -= d["y"] + 8
            if fy < -120:
                fy, fx = 0.0, fx + d["x"] + 10
    xs = [px for _, px, _ in placed]
    ys = [py for _, _, py in placed]
    span = max(width + 60, (max(ys) - min(ys)) + 60, 80)
    return placed, span


def scene_for(handle, parts):
    body = COL[COLOUR[handle]]
    accent = COL["ink"] if COLOUR[handle] not in ("ink", "plum", "grape", "cobalt") else COL["cloud"]
    placed, span = spread(parts)
    out = []
    for pid, x, y in placed:
        p = PARTS[pid]
        flip = p["print_orientation"] == "face_down"
        colour = accent if pid in SMALL or pid.endswith("-inlay") or pid.endswith("-text") else body
        out.append({"file": f"{STL}{pid}.stl", "colour": colour, "x": round(x, 1), "y": round(y, 1), "z": 0, "flip": flip, "rot": 0})
        inlay = pid + "-inlay"
        if inlay in PARTS and not any(q == inlay for q, _ in parts):
            out.append({"file": f"{STL}{inlay}.stl", "colour": accent, "x": round(x, 1), "y": round(y, 1), "z": 0, "flip": flip, "rot": 0})
    d = span
    return {"parts": out, "cam": [round(1.15 * d), round(-1.5 * d), round(1.35 * d)]}


def kit_parts(kit):
    prods = {p["handle"]: p for p in MAN["products"]}
    acc = {}
    for line in kit["lines"]:
        for part in prods[line["handle"]]["parts"]:
            acc[part["id"]] = acc.get(part["id"], 0) + part["qty"] * line["qty"]
    return list(acc.items())


if __name__ == "__main__":
    made = []
    for p in MAN["products"]:
        if p["handle"] in COLOUR:
            SCENES[f"cat-{p['handle']}"] = scene_for(p["handle"], [(x["id"], x["qty"]) for x in p["parts"]])
            made.append(p["handle"])
    for k in MAN["kits"]:
        if k["handle"] in COLOUR:
            SCENES[f"cat-{k['handle']}"] = scene_for(k["handle"], kit_parts(k))
            made.append(k["handle"])
    missing = [h for h in COLOUR if h not in made]
    json.dump(SCENES, open(SCENES_PATH, "w"), indent=1, ensure_ascii=False)
    print(len(made), "scenes;", "not found:", missing)
