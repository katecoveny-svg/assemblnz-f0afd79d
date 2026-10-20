#!/usr/bin/env python3
"""
assembl living — catalogue manifest
===================================
Merges the CAD build reports (parts), the fit tests, the test-print kit and the
launch catalogue (products, kits, colours, prices, part codes) into one JSON that
`lib/living` reads. Copies the print files the storefront serves into
public/living/cad/<pack>/ and records their checksums.

Run from the repo root after the build scripts:

    python3 tools/living-cad/cad/build.py && python3 tools/living-cad/cad/build_extras.py \
      && python3 tools/living-cad/cad/build_dayrally.py && python3 tools/living-cad/cad/build_dayrally2.py \
      && python3 tools/living-cad/cad/test_kit.py && python3 tools/living-cad/manifest.py

The launch catalogue page (store/index.html) that generated the CSVs is not in the
repository; the CSVs are the record and `lib/living` is now the catalogue of truth.
"""
from __future__ import annotations

import csv
import hashlib
import json
import re
import shutil
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
PACK = "v0.3"
INTERFACE = "TURN v0.1"
PARTS = HERE / "parts"
LAUNCH = HERE / "launch"
PUBLIC = REPO / "public" / "living" / "cad" / PACK
TS_MANIFEST = REPO / "lib" / "living" / "cad-manifest.json"

# Families whose print files the storefront serves. Dayrally, bike and the pendant
# shade are rebuilt on demand (the shade alone is 6 MB of mesh).
SERVED_FAMILIES = {"grid", "tile", "stack", "renter", "camera", "rod", "cast", "ride", "mini", "rack", "scoot", "bike", "dayrally", "dayrally2", "light"}

COLOURS = {
    "living": [
        ("chalk", "Chalk", "#F1ECE3"), ("oat", "Oat", "#D8C4A0"), ("sage", "Sage", "#9FAE95"), ("clay", "Clay", "#B8694A"),
        ("plum", "Plum", "#4B2B41"), ("ash", "Ash", "#9A9792"), ("ink", "Ink", "#2A2A2D"),
    ],
    "dayrally": [
        ("tomato", "Tomato", "#E04E3B"), ("tangerine", "Tangerine", "#F28C28"), ("butter", "Butter", "#F3D97A"), ("lime", "Lime", "#BFD95A"),
        ("mint", "Mint", "#9EDFC5"), ("sky", "Sky", "#8EC5F2"), ("cobalt", "Cobalt", "#2E4FB5"), ("lilac", "Lilac", "#C7B5EC"),
        ("grape", "Grape", "#7A3E9D"), ("blush", "Blush", "#F2B8C6"), ("cloud", "Cloud", "#E8EAED"), ("sage", "Sage", "#9FAE95"),
        ("ink", "Ink", "#2A2A2D"), ("sun", "Sun", "#F5C400"),
    ],
    "natural": [("natural", "Natural translucent", "#EDE9E2")],
}

# Commercial product → print files. Pairs and packs list every file printed per unit.
PRODUCT_PARTS: dict[str, list[tuple[str, int]]] = {
    "al-board-4x4": [("grid-board-4x4", 1), ("grid-anchor-washer", 4)],
    "al-board-2x4": [("grid-board-2x4", 1), ("grid-anchor-washer", 2)],
    "al-hook": [("grid-hook", 1), ("grid-turn-key", 1)],
    "al-rod-cradle": [("grid-rod-cradle", 2), ("grid-turn-key", 2)],
    "al-shelf-2": [("grid-shelf-2", 1), ("grid-turn-key", 2)],
    "al-shelf-3": [("grid-shelf-3", 1), ("grid-turn-key", 3)],
    "al-bin-2": [("grid-bin-2", 1), ("grid-turn-key", 2)],
    "al-cup": [("grid-cup", 1), ("grid-turn-key", 1)],
    "al-lure-garage": [("grid-lure-garage", 1), ("grid-turn-key", 3)],
    "al-name-plate": [("grid-name-plate", 1), ("grid-name-plate-text", 1), ("grid-turn-key", 2)],
    "al-keys-6": [("grid-turn-key", 6)],
    "al-node-corner": [("stack-node-corner", 1)],
    "al-node-tee": [("stack-node-tee", 1)],
    "al-foot": [("stack-foot", 1)],
    "al-shade-fold": [("light-pendant-fold", 1)],
    "al-board-renter": [("renter-board-4x4", 1)],
    "al-over-door": [("renter-over-door", 2), ("grid-turn-key", 2)],
    "al-rail-hanger": [("renter-rail", 2), ("grid-turn-key", 2)],
    "al-pod-mini": [("dr2-pod-mini", 1), ("dr2-lid-mini-plain", 1), ("dr2-insert-mini-split", 1), ("grid-turn-key", 2)],
    "al-pod-standard": [("dr2-pod-standard", 1), ("dr2-lid-standard-plain", 1), ("dr2-insert-standard-everyday", 1), ("grid-turn-key", 2)],
    "al-pod-tall": [("dr2-pod-tall", 1), ("dr2-lid-tall-plain", 1), ("dr2-insert-tall-deep-two", 1), ("grid-turn-key", 2)],
    "al-pod-long": [("dr2-pod-long", 1), ("dr2-lid-long-plain", 1), ("dr2-insert-long-everyday", 1), ("grid-turn-key", 2)],
    "al-strap-clip": [("dr2-mount-strap-clip", 1)],
    "al-duo-strap": [("dr2-mount-duo-strap", 1)],
    "al-belt-clip": [("dr2-mount-belt-clip", 1)],
    "al-carabiner-loop": [("dr2-mount-carabiner-loop", 1)],
    "al-home-dock": [("dr2-mount-home-dock", 1)],
    "al-handline-winder": [("dr-handline-winder", 1)],
    "al-bag-tag": [("dr-bag-tag", 1), ("dr-bag-tag-name", 1)],
    "al-bag-charm": [("dr2-charm-star", 1), ("dr2-charm-star-inlay", 1)],
    "al-zip-pull": [("dr2-zip-pull", 2), ("dr2-zip-pull-inlay", 2)],
    "al-phone-stand": [("dr2-phone-stand", 1)],
    "al-chair-hook": [("dr2-chair-hook", 2)],
    "al-cable-winder": [("dr2-cable-winder", 2)],
    "al-bar-saddle": [("dr2-mount-bar-saddle", 1)],
    "al-frame-saddle": [("dr2-mount-frame-saddle", 1)],
    "al-number-plate": [("bike-number-plate", 1), ("bike-number-plate-text", 1)],
    "al-spoke-beads": [("dr2-spoke-bead", 12)],
    "al-tyre-lever": [("bike-tyre-lever", 2)],
    "al-bar-end": [("bike-bar-end", 2)],
}

# Material per print file family/slug, from the upstream README's parts table.
MATERIAL = {
    "grid-turn-key": "PETG", "grid-anchor-washer": "PETG", "grid-rod-cradle": "PETG or ASA", "grid-lure-garage": "PETG or ASA",
    "stack-node-corner": "PETG", "stack-node-tee": "PETG", "stack-foot": "PETG", "light-pendant-fold": "Translucent PETG (LED only)",
    "renter-over-door": "PETG", "renter-rail": "PETG", "dr-bar-saddle": "PETG", "dr-strap-clip": "PETG",
    "bike-number-plate": "PETG", "bike-number-plate-text": "PETG", "bike-tyre-lever": "PETG or PA", "bike-bar-end": "PETG",
    "dr-handline-winder": "PETG", "dr2-chair-hook": "PETG", "dr2-cable-winder": "PETG", "dr2-spoke-bead": "PETG",
    "cam-back": "PETG", "cam-shutter-disc": "PETG", "cam-window-cover": "PETG", "cam-cradle": "PETG",
    "rod-grip": "PETG", "rod-collar": "PETG", "rod-butt-cap": "PETG", "rod-wharf-reel": "PETG", "rod-saddle": "PETG",
    "rod-section-1": "PETG-CF or PA-CF", "rod-section-2": "PETG-CF or PA-CF", "rod-section-3": "PETG-CF or PA-CF", "rod-tip": "PETG-CF or PA-CF",
    "cast-grip": "ASA or PETG-CF", "cast-hood": "ASA or PETG-CF", "cast-nut": "ASA or PETG-CF", "cast-collar": "ASA or PETG-CF", "cast-butt-cap": "ASA or PETG-CF",
    "ride-gasket": "TPU 95A", "ride-grip-waves": "TPU 95A", "ride-grip-dots": "TPU 95A", "ride-hinge-pin": "PETG (or a 3 mm steel rod)",
}


def material_for(slug: str) -> str:
    if slug in MATERIAL:
        return MATERIAL[slug]
    if slug.startswith("cast-"):
        return "PPA-CF (PA12-CF second)"
    if slug.startswith(("ride-slate", "ride-latch", "ride-pod-lid-pattern")):
        return "PLA Matte"
    if slug.startswith(("ride-", "mini-", "rack-", "scoot-")):
        return "PETG"
    if slug.startswith("dr2-mount-"):
        return "PETG"
    return "PLA Matte"


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_parts() -> list[dict]:
    rows: list[dict] = []
    for name, family in (("parts-report", None), ("parts-report-extras", None), ("parts-report-dayrally", "dayrally"), ("parts-report-dayrally2", "dayrally2"),
                         ("parts-report-cam", "camera"), ("parts-report-rod", "rod"), ("parts-report-cast", "cast"), ("parts-report-ride", "ride"), ("parts-report-mini", "mini"), ("parts-report-bike", "rack"), ("parts-report-scoot", "scoot")):
        loaded = json.loads((PARTS / f"{name}.json").read_text())
        for r in (loaded["parts"] if isinstance(loaded, dict) else loaded):
            fam = r.get("system") or family
            if fam == "dayrally" and r["slug"].startswith("bike-"):
                fam = "bike"
            x, y, z = r["print_bbox_mm"]
            rows.append({
                "id": r["slug"],
                "name": r["name"],
                "family": fam,
                "group": r.get("group"),
                "revision": f"{PACK}",
                "print_orientation": r["print_orientation"],
                "dims_mm": {"x": x, "y": y, "z": z},
                "fits_250_cube": r["fits_250_cube"],
                "volume_cm3": r["volume_cm3"],
                "mass_g_pla": r["est_grams_pla"],
                "material": material_for(r["slug"]),
                # Every part is exported in print orientation and prints without supports; the dowel
                # nodes have a small overhang near the base (brim, supports optional). The raw
                # unsupported area is kept as data: inlays and short bridges inflate it.
                "supports": "brim; supports optional" if r["slug"].startswith("stack-node") else "none",
                "watertight": r["watertight"],
                "genus": r["genus"],
                "bodies": r.get("bodies"),
                "unsupported_down_area_mm2": r["unsupported_down_area_mm2"],
                "notes": r.get("notes", ""),
                "file": None,
            })
    return rows


def serve_files(parts: list[dict]) -> None:
    if PUBLIC.exists():
        shutil.rmtree(PUBLIC)
    PUBLIC.mkdir(parents=True)
    for p in parts:
        if p["family"] not in SERVED_FAMILIES:
            continue
        src = PARTS / "stl" / f"{p['id']}.stl"
        if not src.exists():
            raise SystemExit(f"missing print file {src}; run the build scripts first")
        dst = PUBLIC / src.name
        shutil.copyfile(src, dst)
        p["file"] = {"path": f"/living/cad/{PACK}/{src.name}", "bytes": dst.stat().st_size, "sha256": sha(dst)}
    kit_dir = PUBLIC / "test-kit"
    kit_dir.mkdir()
    for f in sorted((PARTS / "test-kit").glob("*.stl")):
        shutil.copyfile(f, kit_dir / f.name)


def load_products() -> tuple[list[dict], list[dict]]:
    rows = list(csv.DictReader((LAUNCH / "shopify-products.csv").open(encoding="utf-8")))
    costing = {r["product"]: r for r in csv.DictReader((LAUNCH / "costing.csv").open(encoding="utf-8"))}
    products: dict[str, dict] = {}
    for r in rows:
        h = r["URL handle"]
        if r["Title"]:
            products[h] = {"handle": h, "title": r["Title"], "desc": r["Description"], "type": r["Type"], "tags": r["Tags"],
                           "price_nzd": float(r["Price"]), "ship_g": int(r["Weight value (grams)"]), "skus": []}
        products[h]["skus"].append({"colour": r["Option1 value"], "sku": r["SKU"]})
    items, kits = [], []
    for h, p in products.items():
        paras = re.findall(r"<p>(.*?)</p>", p["desc"])
        m = re.match(r"AL-([A-Z0-9]+)-", p["skus"][0]["sku"])
        short = m.group(1) if m else None
        cost = costing.get(p["title"])
        cost_row = {"max_cost_nzd": float(cost["max production cost NZD for 40% margin"]), "max_usd_per_gram": float(cost["max USD per gram"] or 0), "ship_nzd": float(cost["customer shipping NZD (3DAPI AU/NZ small parcel)"])} if cost else None
        if h.startswith("al-kit-"):
            lines = [{"title": t, "qty": int(q)} for q, t in re.findall(r"<li>(\d+) × ([^<]+)</li>", p["desc"])]
            kits.append({"handle": h, "short": short, "title": p["title"], "note": paras[0], "collection": "dayrally" if p["title"].startswith("dayrally") else "living",
                         "price_nzd": p["price_nzd"], "ship_g": p["ship_g"], "lines": lines, "costing": cost_row})
            continue
        colours = "natural" if p["type"] == "Light" else "dayrally" if p["type"] in ("dayrally", "Bike") else "living"
        size_line = paras[1] if len(paras) > 1 else ""
        size, _, mat = size_line.partition(" · ")
        items.append({
            "handle": h, "short": short, "title": p["title"], "blurb": paras[0], "size": size.strip(),
            "material": mat.replace(". Printed to order and posted to you.", "").strip(), "type": p["type"],
            "personalised": "personalised" in p["tags"], "colours": colours, "price_nzd": p["price_nzd"], "ship_g": p["ship_g"],
            "parts": [{"id": s, "qty": q} for s, q in PRODUCT_PARTS.get(h, [])], "costing": cost_row,
            "skus": p["skus"],
        })
    # resolve kit lines to handles by product title
    by_title = {i["title"]: i["handle"] for i in items}
    for k in kits:
        for line in k["lines"]:
            line["handle"] = by_title[line.pop("title")]
    return items, kits


ALPH = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def check_char(body: str) -> str:
    return ALPH[sum((i + 1) * ord(c) for i, c in enumerate(body)) % len(ALPH)]


def main() -> None:
    parts = load_parts()
    serve_files(parts)
    items, kits = load_products()
    known = {p["id"] for p in parts}
    for it in items:
        for pp in it["parts"]:
            if pp["id"] not in known:
                raise SystemExit(f"{it['handle']} references unknown print file {pp['id']}")
        for s in it["skus"]:
            m = re.match(r"AL-(.+)-([A-Z0-9])$", s["sku"])
            if m and check_char(m.group(1)) != m.group(2):
                raise SystemExit(f"check letter mismatch for {s['sku']}")
    kit_report = json.loads((PARTS / "test-kit" / "kit-report.json").read_text())
    fit = {name: json.loads((PARTS / f"fit-tests{suffix}.json").read_text()) for name, suffix in (("grid", ""), ("renter", "-renter"), ("dayrally", "-dayrally"), ("dayrally2", "-dayrally2"), ("camera", "-cam"), ("rod", "-rod"), ("cast", "-cast"), ("ride", "-ride"), ("mini", "-mini"), ("bike", "-bike"), ("scoot", "-scoot"))}
    lab = {name: json.loads((PARTS / f"parts-report-{suffix}.json").read_text())["spec"] for name, suffix in (("camera", "cam"), ("rod", "rod"), ("cast", "cast"), ("ride", "ride"), ("mini", "mini"), ("bike", "bike"), ("scoot", "scoot"))}
    manifest = {
        "pack": PACK,
        "interface": INTERFACE,
        "interface_spec": {
            "pitch_mm": 42.0, "board_thickness_mm": 8.0, "standoff_mm": 4.0, "plate_mm": 4.0, "keyway_bore_mm": 13.0,
            "lug_slot_mm": 4.0, "chamber_mm": 22.0, "flange_mm": 5.0, "nub_mm": 12.4, "detent_mm": 0.35, "clamp_mm": 0.10,
            "key_action": "push in with the grip upright, quarter-turn to horizontal to lock",
            "max_part_mm": 250,
        },
        "status": "designed and checked digitally; nothing printed yet. Clamp, detent and clearance values are starting points for the test-print kit.",
        "source": "tools/living-cad/cad/lib.py",
        "built_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "colours": {k: [{"id": i, "name": n, "hex": h} for i, n, h in v] for k, v in COLOURS.items()},
        "parts": parts,
        "products": items,
        "kits": kits,
        "test_kit": {
            "instructions": "tools/living-cad/parts/test-kit/TEST-KIT.md",
            "files": [{**r, "path": f"/living/cad/{PACK}/test-kit/{r['file']}"} for r in kit_report],
            "total_g": round(sum(r["est_grams_pla"] * r["qty"] for r in kit_report)),
        },
        "fit_tests": fit,
        "lab": lab,
        "part_code_alphabet": ALPH,
    }
    (PUBLIC / "manifest.json").write_text(json.dumps(manifest, indent=1, ensure_ascii=False) + "\n")
    # The copy the app bundles keeps only the scalar fit-test results; the sweeps stay in the public manifest.
    slim = {**manifest, "fit_tests": {k: {kk: vv for kk, vv in v.items() if isinstance(vv, (int, float, bool, str))} for k, v in fit.items()}}
    TS_MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    TS_MANIFEST.write_text(json.dumps(slim, indent=1, ensure_ascii=False) + "\n")
    served = sum(1 for p in parts if p["file"])
    print(f"{len(parts)} print files ({served} served), {len(items)} products, {len(kits)} kits → {TS_MANIFEST.relative_to(REPO)}")


if __name__ == "__main__":
    main()
