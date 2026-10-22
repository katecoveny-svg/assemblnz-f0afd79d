"""Build the second home set: parts/stl/hm-*.stl, a parts report, web previews. Run: python3 cad/build_home2.py"""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(__file__))
import home2 as h
from build_dayrally2 import emit, web, report, OUT, WEB

if __name__ == "__main__":
    os.makedirs(os.path.join(OUT, "stl"), exist_ok=True)
    os.makedirs(WEB, exist_ok=True)
    t0 = time.time()
    for slug, (name, fn, how, group, notes) in h.PARTS.items():
        man = fn()
        emit(slug, name, man, how, group, notes)
        web(slug, man)
        print(slug, f"{time.time() - t0:.0f}s", flush=True)
    spec = {"desk_module_mm": h.U, "drum": h.DRUM, "grid_table": h.GRID, "y_stool": h.Y, "rack": h.RACK,
            "hardware": {"hm-y-hub": "3 × M6 × 30 bolts and nyloc nuts"},
            "status": "designed and checked digitally; nothing printed. The stool is not a seat until a load test passes; the side tables are side tables and plant stands."}
    json.dump({"spec": spec, "parts": report}, open(os.path.join(OUT, "parts-report-home2.json"), "w"), indent=2, ensure_ascii=False)
    bad = [x["slug"] for x in report if not x["watertight"] or not x["fits_250_cube"] or x["bodies"] != 1]
    print(len(report), "files;", "problems:", bad, f"{time.time() - t0:.0f}s")
