"""Build the tackle pieces: parts/stl/tk-*.stl, a parts report with the spec, web previews. Run: python3 cad/build_dayrally_tackle.py"""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(__file__))
import lib, dayrally_tackle as tk
from build_dayrally2 import emit, web, report, OUT, WEB

if __name__ == "__main__":
    os.makedirs(os.path.join(OUT, "stl"), exist_ok=True)
    os.makedirs(WEB, exist_ok=True)
    t0 = time.time()
    for slug, (name, fn, how, group, notes) in tk.PARTS.items():
        man = fn()
        if man is None:
            continue
        emit(slug, name, man, how, group, notes)
        if not slug.endswith("-inlay"):
            web(slug, man)
        print(slug, f"{time.time() - t0:.0f}s", flush=True)
    spec = {"packs_mm": tk.PACKS, "reel_foot_mm": tk.FOOT, "knob": {"shaft_mm": tk.KNOB_SHAFT, "bearing_mm": tk.KNOB_BEARING, "note": "the common Shimano/Daiwa knob shaft; measure the reel's before printing"},
            "spool_band_for_mm": 47.0, "universal_saddle_mm": [22.0, 45.0], "strap": {"width_mm": 20.0, "length_mm": 240.0, "pitch_mm": 8.0, "material": "TPU 95A"},
            "what_of_a_reel_prints": {"yes": ["handle knob (on the stock shaft and bearings)", "spool band and line clip", "reel dock and foot cover", "handle-end caps, drag-knob caps (cosmetic)", "a hard case or pouch frame"],
                                      "no": ["body and rotor (alignment and stiffness)", "gears and pinion (tooth loads, wear)", "drag washers and bearings", "bail arm and line roller", "the main shaft"]},
            "status": "designed and checked digitally; nothing printed. Pack sizes, the reel foot and the knob shaft are to be measured on the real things before the first print."}
    json.dump({"spec": spec, "parts": report}, open(os.path.join(OUT, "parts-report-tackle.json"), "w"), indent=2, ensure_ascii=False)
    bad = [x["slug"] for x in report if not x["watertight"] or not x["fits_250_cube"] or (x["bodies"] != 1 and "inlay" not in x["slug"])]
    print(len(report), "files;", "problems:", bad, f"{time.time() - t0:.0f}s")
