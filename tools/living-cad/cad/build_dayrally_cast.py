"""Build the dayrally cast rod: print files (parts/stl/cast-*.stl), a parts report and web previews.
Run: python3 cad/build_dayrally_cast.py"""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(__file__))
import lib, dayrally_cast as c
from build_dayrally2 import emit, web, report, OUT, WEB

if __name__ == "__main__":
    os.makedirs(os.path.join(OUT, "stl"), exist_ok=True)
    t0 = time.time()
    for slug, (name, fn, how, group, notes) in c.PARTS.items():
        man = fn()
        emit(slug, name, man, how, group, notes)
        web(slug, man)
        print(slug, f"{time.time() - t0:.0f}s", flush=True)
    ok, placed = c.packing_check()
    spec = {"assembled_length_mm": round(c.GRIP_L + 3.0 + c.N_SEC * c.SEC_L), "packed_mm": [c.GRIP_L + 3.0, c.GRIP_OD],
            "sections_square_mm": c.SIZES, "section_mm": c.SEC_L, "wall_mm": c.WALL, "pins_square_mm": [c.pin_side(i) for i in range(c.N_SEC - 1)], "pin_mm": c.PIN_L, "pin_clearance_mm": c.PIN_CLR,
            "packs_inside_grip": ok, "packing": placed, "reel_seat": {"foot_pocket_mm": [c.FOOT_W, c.FOOT_T], "foot_length_range_mm": [c.FOOT_MIN, c.FOOT_MAX], "thread": f"{c.THREAD_MAJOR} x {c.THREAD_PITCH}", "thread_z_mm": [round(c.THREAD_Z0, 1), round(c.THREAD_Z1, 1)]},
            "guides_ring_id_mm": c.GUIDE_RINGS, "stiffness": c.stiffness_table(), "design_tip_load_N": c.TIP_LOAD_N, "stress_at_design_load": c.stress_table(), "stress_at_5N": c.stress_table(5.0),
            "material": "PPA-CF for sections, tip top and guides (PA12-CF second); ASA or PETG-CF for grip, hood, nut, collar, cap. Not PA6-CF.",
            "reel": "bought: Shimano 1000-size spinning reel"}
    json.dump({"spec": spec, "parts": report}, open(os.path.join(OUT, "parts-report-cast.json"), "w"), indent=2, ensure_ascii=False)
    bad = [x["slug"] for x in report if not x["watertight"] or not x["fits_250_cube"] or x["bodies"] != 1]
    print(len(report), "files;", "problems:", bad, f"{time.time() - t0:.0f}s")
    print(json.dumps({k: v for k, v in spec.items() if k not in ("packing",)}, indent=1))
