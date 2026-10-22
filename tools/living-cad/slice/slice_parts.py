"""
Slice every served print file with Bambu Studio and record the real grams and print time.

Each part is sliced on its own, as served (already in print orientation), on a Bambu Lab X1 Carbon 0.4 mm profile at
0.20 mm Standard with the system filament for its material. The slicer's own figures replace the mesh estimates in
the cost model and the builder: `lib/living/slice-report.json` holds them. The sliced plate (`<id>.gcode.3mf`) and an
unsliced project (`<id>.3mf`) for each part land in `tools/living-cad/slice/out/`, which is not committed; rerun this
to rebuild them.

Needs the Bambu Studio AppImage extracted at /opt/bambu (or BAMBU_ROOT) and its libraries; see README.md here.
Run from the repo root:  python3 tools/living-cad/slice/slice_parts.py [--only id,id] [--jobs 4]
"""
import argparse, json, os, subprocess, sys, time, zipfile
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
HERE = os.path.dirname(os.path.abspath(__file__))
BAMBU = os.environ.get("BAMBU_ROOT", "/opt/bambu/squashfs-root")
PROFILES = os.path.join(HERE, "profiles")
OUT = os.path.join(HERE, "out")
REPORT = os.path.join(ROOT, "lib", "living", "slice-report.json")
MAN = json.load(open(os.path.join(ROOT, "lib", "living", "cad-manifest.json")))


def filament_for(material: str) -> str:
    """The catalogue's material text -> one of the flattened filament profiles (first choice wins)."""
    m = material.lower()
    first = m.split(" or ")[0].split("(")[0].strip()
    for key, slug in (("tpu", "tpu"), ("ppa-cf", "pa-cf"), ("pa12-cf", "pa-cf"), ("pa-cf", "pa-cf"), ("petg-cf", "petg-cf"),
                      ("asa", "asa"), ("petg", "petg"), ("pla", "pla"), ("pa", "pa-cf")):
        if key in first:
            return slug
    return "petg"


def env():
    e = dict(os.environ)
    e["LD_LIBRARY_PATH"] = os.path.join(BAMBU, "bin")
    e["LC_ALL"] = "C"
    return e


def slice_one(part):
    pid, stl, fil = part["id"], os.path.join(ROOT, "public", part["file"]["path"].lstrip("/")), filament_for(part["material"])
    work = os.path.join(OUT, pid)
    os.makedirs(work, exist_ok=True)
    settings = f"{PROFILES}/machine.json;{PROFILES}/process.json"
    cmd = [os.path.join(BAMBU, "bin", "bambu-studio"), "--debug", "1", "--slice", "0", "--arrange", "1",
           "--load-settings", settings, "--load-filaments", f"{PROFILES}/filament-{fil}.json",
           "--outputdir", work, "--export-3mf", f"{pid}.gcode.3mf", stl]
    t0 = time.time()
    try:
        r = subprocess.run(cmd, env=env(), capture_output=True, text=True, timeout=900)
    except subprocess.TimeoutExpired:
        return pid, {"ok": False, "error": "timeout", "filament": fil}
    res_path = os.path.join(work, "result.json")
    if not os.path.exists(res_path):
        return pid, {"ok": False, "error": (r.stderr or r.stdout)[-400:], "filament": fil}
    res = json.load(open(res_path))
    if res.get("return_code") != 0 or not res.get("sliced_plates"):
        return pid, {"ok": False, "error": res.get("error_string"), "filament": fil}
    plate = res["sliced_plates"][0]
    grams = sum(f.get("total_used_g", 0) for f in plate.get("filaments", []))
    seconds = plate.get("total_predication") or plate.get("main_predication")
    for f in os.listdir(work):                                   # keep the plate; drop the loose gcode
        if f.endswith(".gcode") and not f.endswith(".gcode.3mf"):
            os.remove(os.path.join(work, f))
    return pid, {"ok": True, "filament": fil, "grams": round(grams, 2), "minutes": round(seconds / 60, 1),
                 "warning": plate.get("warning_message") or "", "slice_seconds": round(time.time() - t0, 1)}


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", default="")
    ap.add_argument("--jobs", type=int, default=4)
    a = ap.parse_args()
    parts = [p for p in MAN["parts"] if p.get("file")]
    if a.only:
        want = set(a.only.split(","))
        parts = [p for p in parts if p["id"] in want]
    report = json.load(open(REPORT)) if os.path.exists(REPORT) else {"parts": {}}
    t0 = time.time()
    done = 0
    with ThreadPoolExecutor(a.jobs) as pool:
        for pid, row in pool.map(slice_one, parts):
            report["parts"][pid] = row
            done += 1
            if done % 10 == 0 or not row["ok"]:
                print(f"{done}/{len(parts)} {pid} {row if not row['ok'] else ''} {time.time() - t0:.0f}s", flush=True)
    profile = json.load(open(os.path.join(PROFILES, "machine.json")))
    report["printer"] = profile.get("name")
    report["process"] = json.load(open(os.path.join(PROFILES, "process.json"))).get("name")
    report["slicer"] = "Bambu Studio 02.08.02.61, command line"
    report["note"] = ("Each part sliced alone, as served, at 0.20 mm Standard, 2 walls, 15 % infill, system filament per material. "
                      "Two-colour parts are sliced as two files; the colour change on a shared plate adds time not counted here.")
    report["parts"] = dict(sorted(report["parts"].items()))
    json.dump(report, open(REPORT, "w"), indent=1)
    bad = [k for k, v in report["parts"].items() if not v["ok"]]
    print(f"{sum(1 for v in report['parts'].values() if v['ok'])} sliced, {len(bad)} failed: {bad[:20]}  {time.time() - t0:.0f}s")
