"""Build the scooter parts: parts/stl/scoot-*.stl, a parts report and web previews. Run: python3 cad/build_dayrally_scoot.py"""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(__file__))
import lib, dayrally_scoot as sc
from build_dayrally2 import emit, web, report, OUT, WEB

if __name__ == "__main__":
    os.makedirs(os.path.join(OUT, "stl"), exist_ok=True)
    os.makedirs(WEB, exist_ok=True)
    t0 = time.time()
    for slug, (name, fn, how, group, notes) in sc.PARTS.items():
        man = fn()
        emit(slug, name, man, how, group, notes)
        web(slug, man)
        print(slug, f"{time.time() - t0:.0f}s", flush=True)
    spec = {"stem_mm": [sc.STEM_MIN, sc.STEM_MAX], "strap": "one 25 mm hook-and-loop or cam strap, no tools, removable",
            "quiver_bore_mm": sc.BORE, "quiver_height_mm": sc.QH, "takes": "the fixed-line rod packed (32 mm grip) or the cast rod packed (36 mm grip)",
            "scooters": {"Flamingo (share)": "stem not measured; strap-on only, remove before returning the scooter", "Lime Gen4 (share)": "stem not measured; strap-on only, remove before returning the scooter", "Honey Whale (owned folder)": "stem not measured; strap-on, or the bar saddle on the handlebar"}}
    json.dump({"spec": spec, "parts": report}, open(os.path.join(OUT, "parts-report-scoot.json"), "w"), indent=2, ensure_ascii=False)
    bad = [x["slug"] for x in report if not x["watertight"] or not x["fits_250_cube"] or x["bodies"] != 1]
    print(len(report), "files;", "problems:", bad)
    for x in report:
        print(f'{x["slug"]:22s} {x["print_bbox_mm"]}  {x["est_grams_pla"]:6.1f} g  bodies {x["bodies"]}  wt {x["watertight"]}  overhang {x["unsupported_down_area_mm2"]}')
