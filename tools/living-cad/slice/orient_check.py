"""
Ask Bambu Studio which flat orientations of a part print without supports.

Each served part is turned into the six flat orientations and sliced with supports off; the slicer's own warning
("floating cantilever" / "floating regions") decides. The answer says whether re-orienting is enough or the CAD has to
change. Rotations are about the part's own axes, applied to the served (already print-oriented) file.

Run from the repo root:  python3 tools/living-cad/slice/orient_check.py [--only id,id] [--jobs 4]
Writes tools/living-cad/slice/out/orient-check.json (not committed).
"""
import argparse, json, os, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor

import numpy as np
import trimesh

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from slice_parts import BAMBU, MAN, OUT, PROFILES, REPORT, ROOT, env, filament_for

FLAT = {"as_is": (0, 0, 0), "flip": (180, 0, 0), "x+90": (90, 0, 0), "x-90": (-90, 0, 0), "y+90": (0, 90, 0), "y-90": (0, -90, 0)}


def turned(stl, rot, dst):
    m = trimesh.load(stl)
    for axis, deg in zip(np.eye(3), rot):
        if deg:
            m.apply_transform(trimesh.transformations.rotation_matrix(np.radians(deg), axis))
    m.apply_translation(-m.bounds[0])
    m.export(dst)


def check(job):
    part, name, rot = job
    stl = os.path.join(ROOT, "public", part["file"]["path"].lstrip("/"))
    fil = filament_for(part["material"])
    with tempfile.TemporaryDirectory() as tmp:
        src = os.path.join(tmp, f"{part['id']}.stl")
        turned(stl, rot, src)
        cmd = [os.path.join(BAMBU, "bin", "bambu-studio"), "--debug", "1", "--slice", "0", "--arrange", "1",
               "--load-settings", f"{PROFILES}/machine.json;{PROFILES}/process.json",
               "--load-filaments", f"{PROFILES}/filament-{fil}.json", "--outputdir", tmp, src]
        try:
            subprocess.run(cmd, env=env(), capture_output=True, text=True, timeout=900)
        except subprocess.TimeoutExpired:
            return part["id"], name, {"ok": False, "error": "timeout"}
        res_path = os.path.join(tmp, "result.json")
        if not os.path.exists(res_path):
            return part["id"], name, {"ok": False, "error": "no result"}
        res = json.load(open(res_path))
        plates = res.get("sliced_plates") or [{}]
        warn = plates[0].get("warning_message") or ""
        mins = round((plates[0].get("total_predication") or 0) / 60, 1)
        return part["id"], name, {"ok": res.get("return_code") == 0, "floating": "floating" in warn, "minutes": mins}


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", default="")
    ap.add_argument("--jobs", type=int, default=4)
    a = ap.parse_args()
    report = json.load(open(REPORT))["parts"]
    ids = a.only.split(",") if a.only else [k for k, v in report.items() if v.get("supports")]
    parts = {p["id"]: p for p in MAN["parts"] if p.get("file")}
    jobs = [(parts[i], n, r) for i in ids for n, r in FLAT.items()]
    out = {}
    with ThreadPoolExecutor(a.jobs) as pool:
        for pid, name, row in pool.map(check, jobs):
            out.setdefault(pid, {})[name] = row
    os.makedirs(OUT, exist_ok=True)
    json.dump(out, open(os.path.join(OUT, "orient-check.json"), "w"), indent=1)
    for pid, rows in out.items():
        clean = [n for n, r in rows.items() if r.get("ok") and not r.get("floating")]
        print(f"{pid:28s} clean: {', '.join(f'{n} ({rows[n]['minutes']} min)' for n in clean) or '-'}")
