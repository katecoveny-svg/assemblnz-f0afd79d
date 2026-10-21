"""Build the pocket range: parts/stl/pk-*.stl, a parts report with the range spec, and web previews.
Run: python3 cad/build_dayrally_pocket.py"""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(__file__))
import lib, dayrally2 as d2, dayrally_pocket as pk
from build_dayrally2 import emit, web, report, OUT, WEB

if __name__ == "__main__":
    os.makedirs(os.path.join(OUT, "stl"), exist_ok=True)
    os.makedirs(WEB, exist_ok=True)
    t0 = time.time()
    for slug, (name, fn, how, group, notes) in pk.PARTS.items():
        man = fn()
        if man is None:
            continue                      # a charm with no room for initials carries no inlay
        emit(slug, name, man, how, group, notes)
        if not slug.endswith("-inlay"):
            web(slug, man)
        print(slug, f"{time.time() - t0:.0f}s", flush=True)
    L, W, H = pk.WIDE
    spec = {"wide_pod_mm": [L, W, H], "wide_inner_mm": [L - 2 * d2.WALL, W - 2 * d2.WALL], "insert_max_height_mm": round(d2._ins_dims("wide")[2], 1),
            "lid_headroom_over_insert_mm": round((H + d2.Z0) - (d2.INS_Z0 + 25.0) + d2.LID_H - d2.LID_TOP, 1),
            "card_mm": list(pk.CARD), "lip_tube_mm": [24.0, 23.0, 118.0], "eraser_block_mm": [65.0, 23.0, 13.0], "refill": list(pk.REFILL),
            "pencil_bore_mm": 7.8, "qr": {"modules": 25, "module_mm": 1.0, "error": "M", "sample": pk.SAMPLE_ID_URL,
                                           "note": "the real code is made per order from the owner's id page address; the sample is not a live page"},
            "pockets_from": "published product sizes with clearance (AirPods Pro 2 60.6 × 45.2 × 21.7; Anker Nano 77 × 36.8 × 25; compact tampon ~80 × Ø17; 15 mL spray ~76 × Ø25; Staedtler 526 50 65 × 23 × 13; G2 refill 98.1 × Ø5.8)",
            "status": "designed and checked digitally; nothing printed. Every pocket is checked against the real thing on the first print."}
    json.dump({"spec": spec, "parts": report}, open(os.path.join(OUT, "parts-report-pocket.json"), "w"), indent=2, ensure_ascii=False)
    bad = [x["slug"] for x in report if not x["watertight"] or not x["fits_250_cube"] or (x["bodies"] != 1 and "inlay" not in x["slug"])]
    print(len(report), "files;", "problems:", bad, f"{time.time() - t0:.0f}s")
