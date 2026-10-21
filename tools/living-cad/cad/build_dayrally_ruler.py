"""Build the ruler parts: parts/stl/ruler-*.stl, a parts report and web previews. The ruler lids themselves come from
build_dayrally2.py (lid style "ruler"). Run: python3 cad/build_dayrally_ruler.py"""
import json, math, os, sys, time
sys.path.insert(0, os.path.dirname(__file__))
import lib, dayrally2 as d2, dayrally_ruler as ru
from build_dayrally2 import emit, web, report, OUT, WEB

if __name__ == "__main__":
    os.makedirs(os.path.join(OUT, "stl"), exist_ok=True)
    os.makedirs(WEB, exist_ok=True)
    t0 = time.time()
    for slug, (name, fn, how, group, notes) in ru.PARTS.items():
        man = fn()
        emit(slug, name, man, how, group, notes)
        web(slug, man)
        print(slug, f"{time.time() - t0:.0f}s", flush=True)
    L = d2.SIZES["long"][0]
    spec = {"lid_scale_cm": {s: round(d2.SIZES[s][0] / 10, 1) for s in d2.SIZES}, "lid_inlay_mm": d2.INLAY, "lid_resolution_mm": 5,
            "fish_ruler": {"pod": "long", "lid_cm": [0.0, L / 10], "base_cm": [L / 10, 2 * L / 10], "datum": "the stadium apex at each end; lid and base end to end",
                           "sideways_slop_error_mm": {str(d): round(2 * 36.0 - math.sqrt((2 * 36.0) ** 2 - d ** 2), 2) for d in (5, 10, 15)},
                           "numbers_on_base": "19 to 34; 18 and 35 are ribs", "raised_mm": ru.RAISE, "legal_sizes_marked": False},
            "ruler_150": {"size_mm": [150, 10, 2], "ticks": "every mm, engraved 0.4", "lives_in": "long pod pen slot (middle two, 157 mm)"},
            "status": "designed and checked digitally; nothing printed. Check every scale against a steel rule on the first print."}
    json.dump({"spec": spec, "parts": report}, open(os.path.join(OUT, "parts-report-ruler.json"), "w"), indent=2, ensure_ascii=False)
    bad = [x["slug"] for x in report if not x["watertight"] or not x["fits_250_cube"] or x["bodies"] != 1]
    print(len(report), "files;", "problems:", bad)
    for x in report:
        print(f'{x["slug"]:22s} {x["print_bbox_mm"]}  {x["est_grams_pla"]:6.1f} g  bodies {x["bodies"]}  wt {x["watertight"]}  overhang {x["unsupported_down_area_mm2"]}')
