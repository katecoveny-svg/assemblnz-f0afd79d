"""Build TURN mini and the components library: parts/stl/mini-*.stl, a parts report and web previews.
Run: python3 cad/build_dayrally_mini.py"""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(__file__))
import lib, dayrally_mini as mm
from build_dayrally2 import emit, web, report, OUT, WEB

if __name__ == "__main__":
    os.makedirs(os.path.join(OUT, "stl"), exist_ok=True)
    os.makedirs(WEB, exist_ok=True)
    t0 = time.time()
    only = sys.argv[1:]
    for slug, (name, fn, how, group, notes) in mm.PARTS.items():
        if only and slug not in only:
            continue
        man = fn()
        emit(slug, name, man, how, group, notes)
        web(slug, man)
        print(slug, f"{time.time() - t0:.0f}s", flush=True)
    if not only or "mini-bone-tag" in only:
        FREDOKA = os.path.join(os.path.dirname(__file__), "..", "fonts", "Fredoka-Bold.ttf")
        tag, txt = mm.bone_tag("RALLY", FREDOKA)
        emit("mini-bone-tag-name", "bone tag, name", tag, "as_is", "mini", "rally's tag: a bone with the name raised in Fredoka Bold; 4 mm split-ring hole.")
        web("mini-bone-tag-name", tag)
        emit("mini-bone-tag-name-pattern", "bone tag, raised name", txt, "as_is", "mini", "Second colour, 0.8 mm.")
    spec = {"scale_of_turn": mm.K, "cube_mm": mm.CUBE, "keyway_mm": round(2 * mm.BORE_R, 1), "chamber_mm": round(2 * mm.CH_R, 1), "plate_mm": mm.PLATE,
            "socket_depth_mm": mm.FACE, "lug_width_mm": round(lib.LUG_W * mm.K, 2), "clamp_mm": round(lib.CLAMP * mm.K, 3), "detent_mm": round(lib.DIMPLE_D * mm.K, 2),
            "universal_key": "double-ended, 1.0 mm disc at the join; turn the first end by the other end's lugs, then quarter-turn the second cube",
            "action_cam_fitting": {"finger_mm": mm.GOPRO_FINGER, "gap_mm": mm.GOPRO_GAP, "width_mm": mm.GOPRO_W, "bolt": "M5 thumb screw, bought"},
            "adapter": "two full TURN keys at 42 mm under a 70 x 36 flange; one mini socket on an 18 mm boss above the key grips"}
    json.dump({"spec": spec, "parts": report}, open(os.path.join(OUT, "parts-report-mini.json"), "w"), indent=2, ensure_ascii=False)
    bad = [x["slug"] for x in report if not x["watertight"] or not x["fits_250_cube"] or (x["bodies"] != 1 and not x["slug"].endswith("-pattern"))]
    print(len(report), "files;", "problems:", bad, f"{time.time() - t0:.0f}s")
    for x in report:
        print(f'{x["slug"]:24s} {x["print_bbox_mm"]}  {x["est_grams_pla"]:6.1f} g  bodies {x["bodies"]}  wt {x["watertight"]}  overhang {x["unsupported_down_area_mm2"]}')
