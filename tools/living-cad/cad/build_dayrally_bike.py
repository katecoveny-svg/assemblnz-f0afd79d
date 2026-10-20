"""Build the bike-set mounts: parts/stl/rack-*.stl, a parts report and web previews. Run: python3 cad/build_dayrally_bike.py"""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(__file__))
import lib, dayrally_bike as bk
from build_dayrally2 import emit, web, report, OUT, WEB

if __name__ == "__main__":
    os.makedirs(os.path.join(OUT, "stl"), exist_ok=True)
    os.makedirs(WEB, exist_ok=True)
    t0 = time.time()
    for slug, (name, fn, how, group, notes) in bk.PARTS.items():
        man = fn()
        emit(slug, name, man, how, group, notes)
        web(slug, man)
        print(slug, f"{time.time() - t0:.0f}s", flush=True)
    spec = {"rack_mount_mm": [150, 100], "straps": "two 25 mm straps round the rack platform", "quiver_bore_mm": 40.0, "quiver_tubes": 2,
            "toptube_saddle_tubes_mm": [25, 45], "picture": "docs/living/boards/dayrally-bike-20261020.jpg"}
    json.dump({"spec": spec, "parts": report}, open(os.path.join(OUT, "parts-report-bike.json"), "w"), indent=2, ensure_ascii=False)
    bad = [x["slug"] for x in report if not x["watertight"] or not x["fits_250_cube"] or x["bodies"] != 1]
    print(len(report), "files;", "problems:", bad)
    for x in report:
        print(f'{x["slug"]:22s} {x["print_bbox_mm"]}  {x["est_grams_pla"]:6.1f} g  bodies {x["bodies"]}  wt {x["watertight"]}  overhang {x["unsupported_down_area_mm2"]}')
