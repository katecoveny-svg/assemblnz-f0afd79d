"""
Build a Bambu Studio project (.3mf) per product for a print farm: the product's print files in the right quantities,
arranged on the plate, with the printer, process and filament settings already in the file. One project per
material, since a farm loads one material per job: `<handle>-<filament>.3mf`.

Unsliced on purpose: the farm opens it in Bambu Studio, picks its own printer if different, and slices. The
sliced single-part plates from slice_parts.py stay beside them for exact time and grams.

Run from the repo root after slice_parts.py:  python3 tools/living-cad/slice/make_plates.py [--only handle,handle]
Output: tools/living-cad/slice/out/plates/<handle>/ and plates-index.json (not committed).
"""
import argparse, json, os, subprocess, sys
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from slice_parts import BAMBU, MAN, OUT, PROFILES, REPORT, ROOT, env, filament_for

ITEMS = json.load(open(os.path.join(ROOT, "tools", "living-cad", "launch", "widget-items.json")))
SLICED = json.load(open(REPORT))["parts"] if os.path.exists(REPORT) else {}
PARTS = {p["id"]: p for p in MAN["parts"] if p.get("file")}
PLATES = os.path.join(OUT, "plates")


def build(item):
    handle = item["handle"]
    groups = defaultdict(list)
    for line in item["parts"]:
        p = PARTS.get(line["id"])
        if p:
            groups[filament_for(p["material"])].append((p, line["qty"]))
    rows = []
    for fil, lines in groups.items():
        work = os.path.join(PLATES, handle)
        os.makedirs(work, exist_ok=True)
        name = f"{handle}-{fil}.3mf"
        stls = [os.path.join(ROOT, "public", p["file"]["path"].lstrip("/")) for p, _ in lines]
        supports = any(SLICED.get(p["id"], {}).get("supports") for p, _ in lines)   # one part needs them -> the plate has them on
        process = "process-support" if supports else "process"
        cmd = [os.path.join(BAMBU, "bin", "bambu-studio"), "--debug", "1", "--arrange", "1",
               "--clone-objects", ",".join(str(q) for _, q in lines),
               "--load-settings", f"{PROFILES}/machine.json;{PROFILES}/{process}.json",
               "--load-filaments", f"{PROFILES}/filament-{fil}.json",
               "--outputdir", work, "--export-3mf", name, *stls]
        try:
            subprocess.run(cmd, env=env(), capture_output=True, text=True, timeout=900)
        except subprocess.TimeoutExpired:
            rows.append({"file": name, "ok": False, "error": "timeout"})
            continue
        res_path = os.path.join(work, "result.json")
        res = json.load(open(res_path)) if os.path.exists(res_path) else {}
        ok = os.path.exists(os.path.join(work, name)) and res.get("return_code", 1) == 0
        rows.append({"file": f"{handle}/{name}", "filament": fil, "supports": supports, "ok": ok, "parts":[{"id": p["id"], "qty": q} for p, q in lines],
                     **({} if ok else {"error": res.get("error_string", "no output")})})
        if os.path.exists(res_path):
            os.remove(res_path)
    return handle, rows


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", default="")
    ap.add_argument("--jobs", type=int, default=4)
    a = ap.parse_args()
    items = [i for i in ITEMS if not a.only or i["handle"] in a.only.split(",")]
    index = {}
    with ThreadPoolExecutor(a.jobs) as pool:
        for handle, rows in pool.map(build, items):
            index[handle] = rows
    os.makedirs(PLATES, exist_ok=True)
    json.dump(index, open(os.path.join(PLATES, "plates-index.json"), "w"), indent=1)
    bad = [(h, r["file"], r.get("error")) for h, rows in index.items() for r in rows if not r["ok"]]
    print(f"{sum(len(r) for r in index.values())} plate projects for {len(index)} products; {len(bad)} failed: {bad[:10]}")
