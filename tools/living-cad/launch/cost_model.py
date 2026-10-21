"""Cost and price model for every widget item: products, kits and lab items.

Two cost bases, both estimates until a print partner quotes and a first print measures real times:
  own    — printed in-house on a desktop printer: filament by mass and material, print time from mass, machine time,
           handling labour, packaging, a failure allowance.
  bureau — a NZ print service at the rate card in print_order.py (NZD per gram by material plus a per-file charge).
Prices include 15 % GST. The suggested price is the own-print cost marked up to the target gross margin after Shopify
payment fees, then rounded to a shelf price. Shipping is not in the unit cost: it is charged to the customer.
Run from the repo root:
    pnpm exec tsx tools/living-cad/launch/dump_items.ts > tools/living-cad/launch/widget-items.json
    python3 tools/living-cad/launch/cost_model.py          -> tools/living-cad/launch/cost-model.csv
"""
import csv, json, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, HERE)
from print_order import rate_for, PER_FILE          # the bureau rate card

MAN = json.load(open(os.path.join(ROOT, "lib", "living", "cad-manifest.json")))
PARTS = {p["id"]: p for p in MAN["parts"]}
ITEMS = json.load(open(os.path.join(HERE, "widget-items.json")))

# ---- assumptions (NZD, October 2026; edit here, every number below follows) ----
GST = 1.15
FILAMENT_PER_KG = {"PLA Matte": 42.0, "PLA": 40.0, "PETG": 45.0, "Translucent": 48.0, "ASA": 50.0, "TPU": 75.0,
                   "PETG-CF": 95.0, "PA12-CF": 150.0, "PPA-CF": 190.0, "PA": 110.0}
DEPOSITION_G_PER_H = {"TPU": 7.0, "PPA-CF": 11.0, "PA12-CF": 11.0, "PETG-CF": 12.0, "PETG": 16.0, "ASA": 15.0, "PLA": 20.0}   # 0.2 mm layers, desktop printer, mixed part sizes
WASTE = 0.08                 # purge, brims, the odd failed print
SETUP_H_PER_JOB = 0.12       # bed prep, start, remove: once per print job (identical copies print together)
EXTRA_COPY_H = 0.02          # each further copy of the same part in a job
MACHINE_PER_H = 0.60         # printer over its life plus power and nozzles
LABOUR_PER_H = 35.0
HANDLING_MIN_PER_JOB = 2.5   # inspect, deburr, bag: per job, plus a little per copy
HANDLING_MIN_PER_COPY = 0.5
PACK_MIN_PER_ORDER = 6.0     # pack, label, lodge: once per order, shared when an order holds several items
ITEMS_PER_ORDER = 3.0        # the basket the "in a basket" cost assumes
PACKAGING_SMALL = 2.20       # mailer and tissue, under 300 g packed
PACKAGING_LARGE = 3.60       # box, over 300 g packed
FAILURE = 0.06               # of material and machine
PAY_PCT, PAY_FIX = 0.0265, 0.30     # Shopify Payments, NZ cards
MARGIN = {"product": 0.55, "kit": 0.50, "prototype": 0.55}   # target gross margin on the ex-GST, ex-fee price


def filament_rate(material):
    m = material.lower()
    for k in ("PPA-CF", "PA12-CF", "PETG-CF", "TPU", "Translucent", "ASA", "PETG", "PLA Matte", "PLA", "PA"):
        if k.lower() in m:
            return FILAMENT_PER_KG[k]
    return FILAMENT_PER_KG["PETG"]


def deposition(material):
    m = material.lower()
    for k in ("TPU", "PPA-CF", "PA12-CF", "PETG-CF", "PETG", "ASA", "PLA"):
        if k.lower() in m:
            return DEPOSITION_G_PER_H[k]
    return DEPOSITION_G_PER_H["PETG"]


def cost_item(item):
    """Costs for one item. `own` is the item sold on its own (one order); `basket` shares packing across ITEMS_PER_ORDER."""
    g = 0.0; hours = 0.0; material_cost = 0.0; jobs = 0; copies = 0; bureau = 0.0
    for line in item["parts"]:
        p = PARTS.get(line["id"])
        if not p:
            continue
        q = line["qty"]
        mass = p["mass_g_pla"] * (1.27 / 1.24 if "PETG" in p["material"] else 1.0)
        g += mass * q
        material_cost += mass * (1 + WASTE) / 1000 * filament_rate(p["material"]) * q
        hours += SETUP_H_PER_JOB + EXTRA_COPY_H * (q - 1) + mass * q / deposition(p["material"])
        jobs += 1; copies += q
        bureau += mass * q * rate_for(p["material"]) + PER_FILE
    machine = hours * MACHINE_PER_H
    handling = LABOUR_PER_H * (HANDLING_MIN_PER_JOB * jobs + HANDLING_MIN_PER_COPY * copies) / 60
    packing = LABOUR_PER_H * PACK_MIN_PER_ORDER / 60
    packed = g * 1.3 + 40
    packaging = PACKAGING_LARGE if packed > 300 else PACKAGING_SMALL
    fail = FAILURE * (material_cost + machine)
    variable = material_cost + machine + handling + fail
    own = variable + packing + packaging
    basket = variable + (packing + packaging) / ITEMS_PER_ORDER
    return {"g": g, "hours": hours, "files": copies, "material": material_cost, "machine": machine, "labour": handling,
            "packing": packing, "packaging": packaging, "fail": fail, "variable": variable, "own": own, "basket": basket,
            "bureau": bureau + packaging + packing}


def shelf(price):
    """Round a price to a shelf price: 50 c steps to $20, whole dollars to $60, $5 steps above."""
    if price <= 20:
        return math.ceil(price * 2) / 2
    if price <= 60:
        return float(math.ceil(price))
    return float(math.ceil(price / 5) * 5)


def price_for(cost, kind):
    """Retail incl GST so that (ex-GST price − payment fee − cost) / ex-GST price = margin."""
    m = MARGIN[kind]
    # ex = cost / (1 - m - PAY_PCT*GST) - PAY_FIX adjustment, solved: ex(1-m) - (PAY_PCT*ex*GST + PAY_FIX) = cost
    ex = (cost + PAY_FIX) / (1 - m - PAY_PCT * GST)
    return shelf(ex * GST)


def margin_at(price, cost):
    if not price:
        return None
    ex = price / GST
    return (ex - (price * PAY_PCT + PAY_FIX) - cost) / ex


if __name__ == "__main__":
    rows = []
    for it in ITEMS:
        c = cost_item(it)
        current = it.get("priceNzd")
        suggested = price_for(c["own"] if it["kind"] == "kit" else c["basket"], it["kind"])   # a kit is its own order
        rows.append({"handle": it["handle"], "kind": it["kind"], "title": it["title"], "type": it["type"], "material": it["material"],
                     "files": c["files"], "grams": round(c["g"], 1), "print_hours": round(c["hours"], 2),
                     "filament_nzd": round(c["material"], 2), "machine_nzd": round(c["machine"], 2), "handling_nzd": round(c["labour"], 2),
                     "failure_nzd": round(c["fail"], 2), "variable_cost_nzd": round(c["variable"], 2),
                     "packing_and_packaging_nzd": round(c["packing"] + c["packaging"], 2),
                     "cost_alone_nzd": round(c["own"], 2), "cost_in_basket_nzd": round(c["basket"], 2),
                     "bureau_cost_nzd": round(c["bureau"], 2), "current_price_nzd": current, "suggested_price_nzd": suggested,
                     "margin_now_alone": round(margin_at(current, c["own"]), 3) if current else "",
                     "margin_now_in_basket": round(margin_at(current, c["basket"]), 3) if current else "",
                     "margin_suggested_alone": round(margin_at(suggested, c["own"]), 3),
                     "margin_suggested_in_basket": round(margin_at(suggested, c["basket"]), 3),
                     "bureau_margin_suggested": round(margin_at(suggested, c["bureau"]), 3)})
    with open(os.path.join(HERE, "cost-model.csv"), "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader(); w.writerows(rows)
    json.dump({"assumptions": {"gst": GST, "filament_per_kg": FILAMENT_PER_KG, "deposition_g_per_h": DEPOSITION_G_PER_H, "waste": WASTE,
                               "setup_h_per_job": SETUP_H_PER_JOB, "extra_copy_h": EXTRA_COPY_H, "machine_per_h": MACHINE_PER_H, "labour_per_h": LABOUR_PER_H,
                               "handling_min_per_job": HANDLING_MIN_PER_JOB, "handling_min_per_copy": HANDLING_MIN_PER_COPY, "pack_min_per_order": PACK_MIN_PER_ORDER, "items_per_order": ITEMS_PER_ORDER,
                               "packaging": [PACKAGING_SMALL, PACKAGING_LARGE], "failure": FAILURE, "payments": [PAY_PCT, PAY_FIX], "margin": MARGIN},
               "rows": rows}, open(os.path.join(HERE, "cost-model.json"), "w"), indent=1)
    print(len(rows), "items")
    for r in rows:
        cur = f"{r['current_price_nzd']:>6}" if r["current_price_nzd"] else "     -"
        print(f"{r['handle']:30s} {r['grams']:7.1f} g {r['print_hours']:5.1f} h  alone {r['cost_alone_nzd']:6.2f} basket {r['cost_in_basket_nzd']:6.2f} bureau {r['bureau_cost_nzd']:6.2f} | now {cur} → {r['suggested_price_nzd']:6.1f}  margin now {r['margin_now_in_basket'] if r['margin_now_in_basket'] != '' else '-'}")
