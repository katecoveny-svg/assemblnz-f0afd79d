"""Build dayrally ride: print files (parts/stl/ride-*.stl), a parts report and web previews.
Run: python3 cad/build_dayrally_ride.py"""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(__file__))
import lib, dayrally_ride as r
from build_dayrally2 import emit, web, report, OUT, WEB

FREDOKA = os.path.join(os.path.dirname(__file__), "..", "fonts", "Fredoka-Bold.ttf")

if __name__ == "__main__":
    os.makedirs(os.path.join(OUT, "stl"), exist_ok=True)
    os.makedirs(WEB, exist_ok=True)
    t0 = time.time()
    only = sys.argv[1:]
    for slug, (name, fn, how, group, notes) in r.PARTS.items():
        if only and slug not in only:
            continue
        man = fn()
        emit(slug, name, man, how, group, notes)
        web(slug, man)
        print(slug, f"{time.time() - t0:.0f}s", flush=True)
    if not only or "ride-pod-lid" in only:
        lid, inlay = r.pod_lid(FREDOKA)
        emit("ride-pod-lid", "ride pod, lid", lid, "face_down", "ride", "Prints top-down. 'dayrally' inlaid in the second colour; two peg holes for the slate.")
        web("ride-pod-lid", lid)
        emit("ride-pod-lid-pattern", "ride pod, lid wordmark inlay", inlay, "face_down", "ride", "Second colour, 0.6 mm.")
        print("ride-pod-lid", f"{time.time() - t0:.0f}s", flush=True)
    if not only or "ride-slate" in only:
        for name in ("dayrally", "name"):
            s, txt = r.slate(name if name == "dayrally" else "JACK", FREDOKA)
            emit(f"ride-slate-{name}", f"ride pod, slate, {name}", s, "face_down", "ride", "Accent colour; two pegs press into the lid. The name is raised 0.8 mm (second colour or the slate's own colour).")
            web(f"ride-slate-{name}", s)
            emit(f"ride-slate-{name}-pattern", f"ride pod, slate text, {name}", txt, "face_down", "ride", "Raised text, second colour.")
        print("ride-slate", f"{time.time() - t0:.0f}s", flush=True)
    spec = {
        "pod_mm": [r.POD_L, r.POD_W, r.POD_H + r.LID_H], "pod_floor": "TURN flange, two keys 42 mm apart",
        "hinge": f"printed knuckles, {r.PIN_D} mm pin in a {r.PIN_D + 2 * r.PIN_CLR:.1f} mm bore",
        "latch": "accent tongue in a top-entry housing; window over a 1.4 mm rib",
        "gasket": f"TPU ring {r.GASKET_W} x {r.GASKET_H} in a {r.GROOVE_D} mm groove; rib {r.RIB_H}. Splash-proof; not tested, not submersible",
        "grip": {"bar_mm": 22.2, "id_mm": r.GRIP_ID, "od_mm": r.GRIP_OD, "length_mm": r.GRIP_L, "material": "TPU 95A"},
        "watch": {k: {"case_mm": list(v), "pocket_clr_mm": r.POCKET_CLR} for k, v in r.WATCH.items()},
        "phone": {"width_mm": list(r.PHONE_W), "length_mm": list(r.PHONE_LEN), "thickness_mm": list(r.PHONE_T), "channel_mm": r.CH_H, "rack_pitch_mm": r.RACK_PITCH},
        "bottle": {"cup_id_mm": r.CUP_ID, "bottle_mm": "73-75", "m5_spacing_mm": r.M5_SPACING},
        "stand": {"mm": [r.ST_W, r.ST_D0, r.ST_H], "cradle_mm": [r.CRADLE_W, r.CRADLE_D], "lean_deg": r.CRADLE_LEAN},
        "font": "Fredoka Bold (SIL OFL 1.1) for the wordmark and slates",
    }
    json.dump({"spec": spec, "parts": report}, open(os.path.join(OUT, "parts-report-ride.json"), "w"), indent=2, ensure_ascii=False)
    bad = [x["slug"] for x in report if not x["watertight"] or not x["fits_250_cube"] or (x["bodies"] != 1 and not x["slug"].endswith(("-pattern", "-text")))]
    print(len(report), "files;", "problems:", bad, f"{time.time() - t0:.0f}s")
    for x in report:
        print(f'{x["slug"]:28s} {x["print_bbox_mm"]}  {x["est_grams_pla"]:6.1f} g  bodies {x["bodies"]}  wt {x["watertight"]}  overhang {x["unsupported_down_area_mm2"]}')
