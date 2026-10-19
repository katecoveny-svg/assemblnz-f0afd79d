"""Build the dayrally cam: print files (parts/stl/cam-*.stl), a parts report and web previews.
Run: python3 cad/build_dayrally_cam.py"""
import json, os, sys, time
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
import lib, dayrally_cam as c
from build_dayrally2 import emit, web, report, OUT, WEB, FONT, PRINT

if __name__ == "__main__":
    os.makedirs(os.path.join(OUT, "stl"), exist_ok=True)
    os.makedirs(WEB, exist_ok=True)
    t0 = time.time()
    for slug, (name, fn, how, group, notes) in c.PARTS.items():
        man = fn()
        emit(slug, name, man, how, group, notes)
        web(slug, man)
        print(slug, f"{time.time() - t0:.0f}s", flush=True)
    for style in ("dots", "waves", "plain"):
        s, pat = c.skin(style)
        emit(f"cam-skin-{style}", f"Front skin, {style}", s, "as_is", "camera", "Outer face up; rails and detents on top.")
        web(f"cam-skin-{style}", s)
        if pat is not None:
            emit(f"cam-skin-{style}-pattern", f"Front skin pattern, {style}", pat, "as_is", "camera", "Second colour, raised 0.8 mm.")
            web(f"cam-skin-{style}-pattern", pat)
    s, pat = c.skin("name", "MILA", FONT)
    emit("cam-skin-name", "Front skin, name (sample: MILA)", s, "as_is", "camera", "Outer face up.")
    emit("cam-skin-name-pattern", "Front skin name (sample: MILA)", pat, "as_is", "camera", "Second colour, raised 0.8 mm.")
    spec = {"format": "120 roll film, 6x6", "image_mm": [c.GATE, c.GATE], "focal_mm": c.F, "pinhole_mm": c.PINHOLE_D, "f_number": c.F_NUMBER,
            "fov_deg": {"side": c.FOV_SIDE, "diagonal": c.FOV_DIAG}, "frames_per_roll": 12,
            "exposure_s_iso400": c.exposure_table(400), "exposure_s_iso100": c.exposure_table(100),
            "body_mm": [round(2 * c.HX, 1), round(2 * c.HY, 1), round(c.Z_FRONT + c.SKIN_T - c.Z_BACK + c.PLATE_T, 1)],
            "verify_before_print": ["SPOOL_L", "SPOOL_HOLE_D", "SPOOL_SLOT_W", "SPOOL_SLOT_L", "FILM_W"]}
    json.dump({"spec": spec, "parts": report}, open(os.path.join(OUT, "parts-report-cam.json"), "w"), indent=2, ensure_ascii=False)
    bad = [r["slug"] for r in report if not r["watertight"] or not r["fits_250_cube"] or (r["bodies"] != 1 and "pattern" not in r["slug"])]
    print(len(report), "files;", "problems:", bad, f"{time.time() - t0:.0f}s")
    print(json.dumps(spec, indent=1))
