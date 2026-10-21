#!/usr/bin/env python3
"""
First-print order pack, 20 October 2026, refreshed 21 October: the bike set, the fish set, the pegboard, the rulers and
the test-print kit, plus a LEAN first print (the subset Kate chose on 21 October: the test kit, the rulers and the rod
joints) that answers the most with the least plastic.

    python3 tools/living-cad/launch/print_order.py            # writes launch/print-order-20261020/{order.csv,README.md}
    python3 tools/living-cad/launch/print_order.py --zip OUT  # also zips the STLs + CSV + README to OUT

Everything here is a FIRST PRINT: the parts have been checked digitally only. Clearances in the notes are
starting values; the point of this order is to learn them. Materials and colours follow the board look (sun,
tomato, black, cream) and the manifest's per-part material. Costs are estimates until the bureau quotes.
"""
import csv, json, os, shutil, sys, zipfile
from pathlib import Path

REPO = Path(__file__).resolve().parents[3]
MAN = json.loads((REPO / "lib" / "living" / "cad-manifest.json").read_text())
PARTS = {p["id"]: p for p in MAN["parts"]}
STL = REPO / "tools" / "living-cad" / "parts" / "stl"
KIT = REPO / "tools" / "living-cad" / "parts" / "test-kit"
OUT = Path(__file__).resolve().parent / "print-order-20261020"
SITE = "https://www.assembl.co.nz/living/cad/v0.3"

SUN, TOM, INK, CREAM = "sun yellow (#F5C400)", "tomato (#E04E3B)", "black", "cream (#F1ECE3)"

# (part id, qty, colour, note)
SETS = {
    "bike set": [
        ("rack-mount", 1, INK, "face down; two 25 mm straps round the rack platform (bought)"),
        ("rack-quiver", 1, SUN, "standing; two straps for a rack stay"),
        ("rack-toptube-saddle", 1, INK, "V up; zip ties"),
        ("ride-pod-base", 1, SUN, "hinge knuckles printed in; catch rib on the front"),
        ("ride-pod-lid", 1, SUN, "top down; carries the 'dayrally' inlay"),
        ("ride-pod-lid-pattern", 1, INK, "second colour, 0.6 mm: print as a colour change on the lid's first layers if the printer has one colour"),
        ("ride-latch", 1, INK, "accent tongue; drops into the lid housing from the top"),
        ("ride-hinge-pin", 2, INK, "or a 3 mm steel rod; bore 3.5 mm"),
        ("ride-gasket", 1, "black TPU 95A", "splash seal; TPU, not PETG"),
        ("ride-core-split", 1, CREAM, "two-pocket insert"),
        ("ride-slate-dayrally", 1, INK, "name slate, two 3 mm pegs press into the lid (0.08 mm interference)"),
        ("ride-slate-dayrally-pattern", 1, SUN, "raised 'dayrally' on the slate"),
        ("ride-bottle-cup", 1, SUN, "standing; 73-75 mm bottles; two M5 slots at 64 mm"),
        ("ride-grip-waves", 2, "black TPU 95A", "22.2 mm bars; bore 21.0 is the first guess, adjust GRIP_ID"),
        ("mini-bar-end", 2, INK, "keyed bar-end plug; 18.8 mm bar ends"),
        ("mini-tube-clamp", 1, INK, "V up; the stem/bar clamp for the cam"),
        ("mini-cam-mount", 1, SUN, "three-finger action-cam fitting; M5 thumb screw bought"),
        ("mini-universal-key", 4, CREAM, "lying flat; TURN mini double key, 0.6 g each"),
        ("mini-cube", 1, TOM, "a spare base mount to test the mini joint"),
        ("mini-bone-tag-name", 1, SUN, "rally's bone tag; split-ring hole"),
        ("mini-bone-tag-name-pattern", 1, INK, "raised RALLY, 0.8 mm"),
        ("dr-bar-saddle", 1, INK, "handlebar saddle for the pod"),
        ("grid-turn-key", 4, INK, "full-size TURN keys: two for the pod on the rack mount, two spare"),
    ],
    "fish set": [
        ("cast-grip", 1, SUN, "ASA or PETG-CF; prints on its back; the printed 36 x 3 thread is in the wall"),
        ("cast-hood", 1, INK, "ASA or PETG-CF; keyed sliding hood"),
        ("cast-nut", 1, INK, "ASA or PETG-CF; lock nut on the printed thread; adjust THREAD_CLR from this print"),
        ("cast-collar", 1, INK, "press fit into the grip (0.05 mm radial)"),
        ("cast-butt-cap", 1, INK, "press fit"),
        ("cast-section-1", 1, "black PPA-CF", "PRINT FLAT, 4 walls, 100% infill; PPA-CF needs a hardened nozzle and dry filament; PA12-CF if PPA-CF is unavailable, PETG-CF as a last resort (softer)"),
        ("cast-section-2", 1, "black PPA-CF", "as section 1"),
        ("cast-section-3", 1, "black PPA-CF", "as section 1; solid over the last 90 mm"),
        ("cast-pin-1", 1, "black PPA-CF", "square spigot pin, epoxied half into section 1; 0.2 mm clearance, adjust PIN_CLR"),
        ("cast-pin-2", 1, "black PPA-CF", "as pin 1"),
        ("cast-tip-top", 1, "black PPA-CF", "4 mm ring"),
        ("cast-guide-1", 1, "black PPA-CF", "single-foot guide; epoxy and whip"),
        ("cast-guide-2", 1, "black PPA-CF", ""),
        ("cast-guide-3", 1, "black PPA-CF", ""),
        ("rod-grip", 1, SUN, "fixed-line rod grip (PETG)"),
        ("rod-collar", 1, INK, "press fit, four slits"),
        ("rod-butt-cap", 1, INK, ""),
        ("rod-section-1", 1, "black PETG-CF", "upright, brim, slow outer walls; spigot clearance 0.15 adjust SPIGOT_CLR"),
        ("rod-section-2", 1, "black PETG-CF", ""),
        ("rod-section-3", 1, "black PETG-CF", ""),
        ("rod-tip", 1, "black PETG-CF", "solid tip"),
        ("rod-wharf-reel", 1, TOM, "V-groove hand reel, flat"),
        ("rod-saddle", 1, INK, "TURN saddle for the packed rod"),
        ("dr-handline-winder", 1, SUN, ""),
        ("grid-lure-garage", 1, INK, "Grid lure garage"),
        ("grid-rod-cradle", 2, INK, "pair"),
        ("dr2-pod-standard", 1, SUN, "tackle pod"),
        ("dr2-insert-standard-tackle", 1, CREAM, "tackle insert"),
        ("dr2-lid-standard-plain", 1, INK, "lid, top down"),
        ("grid-turn-key", 4, INK, "keys for the pod and the saddle"),
    ],
    "rulers": [
        ("dr2-lid-standard-ruler", 1, INK, "ruler lid, standard, top down; 0 to 12.8 cm from the lid's end"),
        ("dr2-lid-standard-ruler-inlay", 1, SUN, "second colour, 0.6 mm: ticks and numbers; colour change on the lid's first layers if one colour"),
        ("dr2-lid-long-ruler", 1, SUN, "ruler lid, long, top down; 0 to 17.6 cm; carries 'LID + BASE, END TO END: 35 CM'"),
        ("dr2-lid-long-ruler-inlay", 1, INK, "second colour, 0.6 mm"),
        ("ruler-pod-long-fish", 1, SUN, "the fish ruler base: raised marks 17.6 to 35.2 cm on the outer wall, 0.6 mm proud; standing, no supports"),
        ("dr2-insert-long-pens", 1, CREAM, "pens insert; the 15 cm ruler lives in a middle slot"),
        ("ruler-150", 1, INK, "15 cm ruler, flat, marks up; mm ticks engraved 0.4: the first print decides whether they read"),
        ("grid-turn-key", 2, INK, "keys for the long pod"),
    ],
    "pegboard": [
        ("grid-board-4x4", 1, CREAM, "the Grid board, 42 mm pitch; four anchor washers and screws to the wall"),
        ("grid-anchor-washer", 4, INK, "4 mm countersunk screws and wall plugs bought"),
        ("grid-turn-key", 6, INK, "the TURN key; this is the part that tells us the clamp and detent values"),
        ("grid-hook", 2, SUN, ""),
        ("grid-shelf-2", 1, SUN, ""),
        ("grid-bin-2", 1, SUN, ""),
        ("grid-cup", 1, TOM, ""),
        ("grid-name-plate", 1, INK, "name plate"),
        ("grid-name-plate-text", 1, SUN, "raised lettering, second colour"),
    ],
}

# The test-print kit (parts/test-kit/, its own report): the TURN clamp coupons every other part depends on.
KIT_COLOUR = {"01-board-2x2.stl": CREAM, "02-key-A-clamp-000.stl": INK, "02-key-B-clamp-010.stl": INK, "02-key-C-clamp-020.stl": INK,
              "03-hook.stl": SUN, "04-over-door-hanger.stl": INK, "05-pocket-clearance.stl": CREAM, "06-door-gap-gauge.stl": CREAM}

# The lean first print, 21 October: the least plastic that answers the clamp, the inlay, the 35 cm registration and the rod joints.
LEAN = {("test kit", f) for f in KIT_COLOUR} | {("rulers", f"{pid}.stl") for pid, *_ in SETS["rulers"]} | {
    ("fish set", f) for f in ("cast-pin-1.stl", "cast-pin-2.stl", "cast-section-2.stl", "cast-section-3.stl", "rod-section-2.stl", "rod-section-3.stl")}

# rough NZ bureau estimate until a quote: PETG/PLA per gram, plus a per-file handling charge; CF and TPU dearer
RATE = {"default": 0.28, "PPA-CF": 0.95, "PA12-CF": 0.75, "PETG-CF": 0.45, "TPU": 0.45, "ASA": 0.35}
PER_FILE = 4.0


def rate_for(material):
    for k, v in RATE.items():
        if k != "default" and k.lower() in material.lower():
            return v
    return RATE["default"]


def build(zip_to=None):
    OUT.mkdir(parents=True, exist_ok=True)
    rows, totals = [], {}
    missing = []
    for set_name, items in SETS.items():
        g_set = 0.0; cost_set = 0.0; files = 0
        for pid, qty, colour, note in items:
            p = PARTS.get(pid)
            if not p or not (STL / f"{pid}.stl").exists():
                missing.append(pid); continue
            material = p.get("material", "PETG")
            if "TPU" in colour: material = "TPU 95A"
            if "PPA-CF" in colour: material = "PPA-CF (PA12-CF second, PETG-CF last)"
            if "PETG-CF" in colour: material = "PETG-CF"
            g = float(p.get("mass_g_pla") or p.get("est_grams_pla") or 0.0)
            est = (g * rate_for(material) + PER_FILE) * qty
            g_set += g * qty; cost_set += est; files += qty
            rows.append({"set": set_name, "file": f"{pid}.stl", "url": f"{SITE}/{pid}.stl", "qty": qty, "material": material, "colour": colour,
                         "print_orientation": p.get("print_orientation") or p.get("orientation", ""), "est_g_each": round(g, 1), "est_cost_nzd": round(est, 2), "sha256": p.get("file", {}).get("sha256", "") if isinstance(p.get("file"), dict) else "",
                         "lean": "yes" if (set_name, f"{pid}.stl") in LEAN else "", "note": note})
        totals[set_name] = (files, round(g_set), round(cost_set))
    kit_rows = json.loads((KIT / "kit-report.json").read_text())
    g_set = cost_set = 0.0; files = 0
    for r in kit_rows:
        g = float(r["est_grams_pla"]); qty = int(r["qty"]); material = r["material"]
        est = (g * rate_for(material) + PER_FILE) * qty
        g_set += g * qty; cost_set += est; files += qty
        rows.append({"set": "test kit", "file": r["file"], "url": f"{SITE}/test-kit/{r['file']}", "qty": qty, "material": material, "colour": KIT_COLOUR[r["file"]],
                     "print_orientation": "as_is", "est_g_each": round(g, 1), "est_cost_nzd": round(est, 2), "sha256": "", "lean": "yes", "note": r["check"]})
    totals["test kit"] = (files, round(g_set), round(cost_set))
    lean = [r for r in rows if r["lean"] == "yes"]
    lean_total = (sum(int(r["qty"]) for r in lean), round(sum(float(r["est_g_each"]) * int(r["qty"]) for r in lean)), round(sum(float(r["est_cost_nzd"]) for r in lean)))
    with open(OUT / "order.csv", "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)
    md = ["# First-print order, 20 October 2026, refreshed 21 October: bike set, fish set, pegboard, rulers, test kit", "",
          "**Status: order pack prepared; nothing ordered or paid. Every part is a first print, checked digitally only.**",
          "**Kate's pick, 21 October: the lean first print** (`lean = yes` in `order.csv`): the test-print kit, the rulers set and the rod joints",
          f"(cast pins 1 and 2 with sections 2 and 3, fixed-line sections 2 and 3). {lean_total[0]} pieces, about {lean_total[1]} g, **about NZD {lean_total[2]}** before a quote.",
          "It answers the TURN clamp, the two-colour inlay, the 35 cm end-to-end registration and whether a printed spigot or pin fits, in one run.", "",
          "Files: the STLs are served hashed from `https://www.assembl.co.nz/living/cad/v0.3/` (the manifest beside them carries the SHA-256 of each);",
          "the same files are in the zip. Print notes per file are in `order.csv` and the design docs (`DAYRALLY-RIDE.md`, `DAYRALLY-MINI.md`,",
          "`DAYRALLY-CAST.md`, `DAYRALLY-ROD.md`, `ASSEMBL-LIVING.md`).", "", "| Set | Files | Est. grams | Est. cost NZD (bureau, before quote) |", "|---|---|---|---|"]
    for k, (files, g, c) in totals.items():
        md.append(f"| {k} | {files} | {g} | about {c} |")
    md += [f"| **lean first print** | {lean_total[0]} | {lean_total[1]} | **about {lean_total[2]}** |",
           f"| **everything** | {sum(v[0] for v in totals.values())} | {sum(v[1] for v in totals.values())} | **about {sum(v[2] for v in totals.values())}** |", "",
           "Estimate basis: PETG/PLA NZD 0.28 per gram, PETG-CF 0.45, TPU 0.45, ASA 0.35, PA12-CF 0.75, PPA-CF 0.95, plus NZD 4 handling per file. A bureau quote replaces this.", "",
           "## Where to order (LAUNCH-OPERATIONS-20261019.md section 5)", "",
           "1. **3DPrintIt, Auckland** (first choice: local, PETG, batch-friendly, instant quote for suitable models; no API). Upload the zip, pick the material and colour per the CSV, ask for the carbon-fibre nylon sections as a separate quote.",
           "2. **A Treatstock Auckland vendor** for the same pegboard files, to compare fit, finish and price.",
           "3. The **PPA-CF rod sections** need a hardened nozzle, a dry box and an enclosure. If neither bureau runs PPA-CF, order those seven files in PA12-CF, and if not that, PETG-CF (softer; the doc says so). Everything else is ordinary PETG, ASA or TPU.", "",
           "## What this order teaches (tune before the second print)", "",
           "- The six TURN keys and the board: `CLAMP`, `BUMP_H`, `DIMPLE_D` in `lib.py` (the full-size clamp), and by the 0.6 factor the mini key.",
           "- The ride pod: `PIN_CLR`, `LIP_CLR`, `PEG_PRESS`, `RIB_H`; whether the bento seal holds under a tap.",
           "- The grips: `GRIP_ID` on a real bar. The cast rod: `PIN_CLR`, `THREAD_CLR`, and whether a pin survives a snag at 300 g drag.",
           "- The mini joint: whether a 0.6-scale detent holds, which decides the swivel and swipe joints.",
           "- The rulers (`DAYRALLY-RULER.md`): every scale against a steel rule at 0, 10 and 17 cm on the lid and 20, 30 and 35 on the base; whether a 1.0 mm inlay tick and a 0.6 mm raised rib print clean; whether the mm ticks on the 15 cm piece read; whether the two apexes register on a wet wharf.", "",
           "## Not in this order, on purpose", "",
           "- The pinhole camera (measure a real 120 spool first), the watch cradle (measure the charging puck first), the phone mount and slider (print after the key clamp is known).",
           "- Bought parts to have ready: two 25 mm straps, zip ties, a 3 mm steel rod (optional hinge pin), M5 thumb screw, 4 mm screws and plugs for the board, a Shimano 1000-size reel, 4 to 6 lb mono, rod epoxy and thread, a 1/4 teaspoon of patience for the first key.",
           ]
    (OUT / "README.md").write_text("\n".join(md) + "\n")
    if zip_to:
        zp = Path(zip_to)
        with zipfile.ZipFile(zp, "w", zipfile.ZIP_DEFLATED) as z:
            z.write(OUT / "order.csv", "order.csv"); z.write(OUT / "README.md", "README.md")
            for r in rows:
                src = (KIT if r["set"] == "test kit" else STL) / r["file"]
                z.write(src, f"{r['set'].replace(' ', '-')}/{r['file']}")
            z.writestr("LEAN-FIRST-PRINT.txt", "Kate's pick, 21 October: print only the rows with lean = yes in order.csv (the test-kit, rulers folders and the six rod joint files in fish-set).\n")
        print("zip:", zp, zp.stat().st_size // 1024, "KB")
    print("missing:", missing); print(totals)


if __name__ == "__main__":
    build(sys.argv[2] if len(sys.argv) > 2 and sys.argv[1] == "--zip" else None)
