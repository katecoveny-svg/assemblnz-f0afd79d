"""Hero scenes from the assembled views: each handle's first view (and the rod's two) as `asm-<handle>-<view>`, the
chosen default lid and insert, body and accent in brand colours, the sample-name inlays left out (a text area is
not a picture). Run from the repo root after assemblies.py:
    python3 tools/living-cad/render/make-assembly-scenes.py && node tools/living-cad/render/render-scenes.mjs docs/living/renders asm-"""
import json, os, re
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
A = json.load(open(os.path.join(ROOT, "lib", "living", "assemblies.json")))["handles"]
MAN = json.load(open(os.path.join(ROOT, "lib", "living", "cad-manifest.json")))
PARTS = {p["id"]: p for p in MAN["parts"]}
ITEMS = {i["handle"]: i for i in json.load(open(os.path.join(ROOT, "tools", "living-cad", "launch", "widget-items.json")))}
SCENES_PATH = os.path.join(os.path.dirname(__file__), "scenes.json")
SCENES = json.load(open(SCENES_PATH))
COL = {c["id"]: c["hex"] for s in MAN["colours"].values() for c in s}
STL = "/tools/living-cad/parts/stl/"
LOOK = {"al-pod-mini": ("butter", "ink"), "al-pod-standard": ("sky", "ink"), "al-pod-tall": ("mint", "ink"), "al-pod-long": ("lime", "ink"),
        "lab-emergency-pack": ("lilac", "cloud"), "lab-mini-emergency": ("blush", "cloud"), "lab-fish-ruler": ("sky", "ink"),
        "al-strap-clip": ("tomato", "sky"), "al-duo-strap": ("sun", "sky"), "al-belt-clip": ("tangerine", "sky"), "al-bar-saddle": ("ink", "sun"),
        "al-frame-saddle": ("cobalt", "sun"), "al-carabiner-loop": ("lime", "sky"), "al-home-dock": ("cloud", "sky"),
        "lab-dayrally-rod": ("ink", "sun"), "al-hook": ("clay", "chalk"), "al-cup": ("plum", "chalk"), "al-shelf-2": ("sage", "chalk"),
        "al-shelf-3": ("oat", "chalk"), "al-bin-2": ("clay", "chalk"),
        "lab-desk-set": ("clay", "sage"), "lab-fluted-table": ("sage", "chalk"), "lab-grid-table": ("clay", "plum"), "lab-grid-table-round": ("plum", "clay"),
        "lab-y-stool": ("oat", "clay"), "lab-magazine-rack": ("clay", "plum")}
FIXED, PROP = COL["ink"], COL["chalk"]


def matches(slot, pid):
    if "id" in slot:
        return slot["id"] == pid
    p = slot["prefix"]
    if p.endswith("*-inlay"):
        return pid.startswith(p[:-7]) and pid.endswith("-inlay")
    return pid.startswith(p) and not pid.endswith("-inlay")


made = 0
for handle, entry in A.items():
    body, accent = LOOK.get(handle, ("sky", "ink"))
    item = ITEMS.get(handle)
    chosen = [p["id"] for p in item["parts"]] if item else []
    for vi, view in enumerate(entry["views"]):
        if vi > 0 and handle != "lab-dayrally-rod":
            continue
        parts = []
        for s in view["slots"]:
            ids = [s["id"]] if "id" in s else [pid for pid in chosen if matches(s, pid)]
            for pid in dict.fromkeys(ids):
                if pid not in PARTS:
                    continue
                if re.search(r"-name-inlay$", pid):
                    continue                                    # the sample name is not shown
                if re.search(r"-name$", pid):                    # the plain file for the body
                    for cand in (re.sub(r"-name$", "-plain", pid), re.sub(r"-name$", "", pid)):
                        if cand in PARTS:
                            pid = cand
                            break
                colour = {"body": COL[body], "accent": COL[accent], "fixed": FIXED}.get(s["role"], COL[accent] if s["role"] == "prop" and handle.startswith("al-") and "mount" not in pid else PROP)
                if s["role"] == "prop":
                    colour = COL["sky"] if "pod" in pid or "lid" in pid or "insert" in pid else PROP
                lift = 30 if ("with a pod" in view["name"] and s["role"] in ("prop", "fixed")) else 0      # the picture shows the mount under the pod
                parts.append({"file": f"{STL}{pid}.stl", "colour": colour, "x": 0, "y": 0, "z": lift, "flip": False, "rot": 0, "matrix": s["matrix"]})
        d = view["reach"]
        name = f"asm-{handle}-{re.sub(r'[^a-z0-9]+', '-', view['name'].lower()).strip('-')}"
        low = "with a pod" in view["name"] or "packed" in view["name"]
        SCENES[name] = {"parts": parts, "cam": [round(0.9 * d), round(-1.3 * d), round((0.5 if low else 1.0) * d)]}
        made += 1
json.dump(SCENES, open(SCENES_PATH, "w"), indent=1, ensure_ascii=False)
print(made, "assembly scenes")
