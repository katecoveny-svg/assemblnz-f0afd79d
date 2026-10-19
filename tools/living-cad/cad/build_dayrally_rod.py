"""Build the dayrally rod and wharf reel: print files (parts/stl/rod-*.stl), a parts report and web previews.
Run: python3 cad/build_dayrally_rod.py"""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(__file__))
import lib, dayrally_rod as r
from build_dayrally2 import emit, web, report, OUT, WEB

if __name__ == "__main__":
    os.makedirs(os.path.join(OUT, "stl"), exist_ok=True)
    t0 = time.time()
    for slug, (name, fn, how, group, notes) in r.PARTS.items():
        man = fn()
        emit(slug, name, man, how, group, notes)
        web(slug, man)
        print(slug, f"{time.time() - t0:.0f}s", flush=True)
    ok, placed = r.packing_check()
    spec = {"assembled_length_mm": round(r.GRIP_L + 3.0 + (len(r.SECTIONS) + 1) * r.SEC_L, 0),
            "packed_mm": [r.GRIP_L + 3.0, r.GRIP_OD], "sections": r.SECTIONS, "tip": r.TIP, "spigot_mm": r.SPIGOT_L, "spigot_clearance_mm": r.SPIGOT_CLR,
            "packs_inside_grip": ok, "packing": placed, "material": "PETG-CF or PA-CF for the sections and tip; PETG for the grip, reel and saddle",
            "reel": {"d_mm": r.REEL_D, "core_mm": r.REEL_CORE_D, "hand_hole_mm": r.HAND_D}}
    json.dump({"spec": spec, "parts": report}, open(os.path.join(OUT, "parts-report-rod.json"), "w"), indent=2, ensure_ascii=False)
    bad = [x["slug"] for x in report if not x["watertight"] or not x["fits_250_cube"] or x["bodies"] != 1]
    print(len(report), "files;", "problems:", bad, f"{time.time() - t0:.0f}s")
    print(json.dumps(spec, indent=1))
