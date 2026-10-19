"""Production-cost ceilings for every product and kit, from the store catalogue.
Assumptions (edit below): prices include 15% GST; Shopify Payments 2.65% + $0.30 (Basic plan, NZ cards);
3DAPI 10% commission; target 40% gross margin on the ex-GST price; US$1 = NZ$1.768 (Wise mid-market, 19 Oct 2026);
3DAPI AU/NZ small-parcel shipping US$9.49 (up to 600 g), paid by the customer.
Run: python3 launch/make_costing.py -> launch/costing.csv"""
import csv, os, re, importlib.util
HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("shop", os.path.join(HERE, "make_shopify_csv.py"))
import io, contextlib
with contextlib.redirect_stdout(io.StringIO()):
    shop = importlib.util.module_from_spec(spec); spec.loader.exec_module(shop)
FX, GST, PAY_PCT, PAY_FIX, COMM, MARGIN = 1.768, 1.15, 0.0265, 0.30, 0.10, 0.40
SHIP = round(9.49 * FX, 2)
def ceiling(price):
    ex = price / GST
    return ex - (price * PAY_PCT + PAY_FIX + COMM * ex) - MARGIN * ex
rows = []
for sku, p in shop.PARTS.items():
    if p.get("custom") or not p.get("price"):
        continue
    rows.append(("part", p["name"], p["price"], p["g"]))
for title, (lines, note, price) in shop.kits.items():
    price = price or sum(shop.PARTS[a]["price"] * n for a, n in lines)
    rows.append(("kit", title, price, sum(shop.PARTS[a]["g"] * n for a, n in lines)))
with open(os.path.join(HERE, "costing.csv"), "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["type", "product", "price NZD incl GST (proposed)", "est grams PLA", "max production cost NZD for 40% margin", "same in USD",
                "max USD per gram", "customer shipping NZD (3DAPI AU/NZ small parcel)", "shipping as % of price"])
    for t, n, pr, g in rows:
        c = ceiling(pr)
        w.writerow([t, n, pr, round(g, 1), round(c, 2), round(c / FX, 2), round(c / FX / g, 3) if g else "", SHIP, f"{SHIP / pr * 100:.0f}%"])
print(len(rows), "rows")
