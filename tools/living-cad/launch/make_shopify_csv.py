"""Build a Shopify product import CSV from the store catalogue (store/index.html).
Every product is imported as a DRAFT so nothing goes live. Prices are the proposed prices.
Run: python3 launch/make_shopify_csv.py  ->  launch/shopify-products.csv"""
import csv, json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
s = open(os.path.join(HERE, "..", "store", "index.html"), encoding="utf-8").read()

def js_objs(var):
    block = re.search(r"const %s = \[(.*?)\n\];" % var, s, re.S).group(1)
    return [dict(re.findall(r'(\w+): "([^"]*)"', m)) for m in re.findall(r"\{[^{}]*\}", block)]

COLOURS = js_objs("COLOURS")
DR_COL = js_objs("DR_COL")
SHORT = dict(re.findall(r'"([a-z0-9-]+)": "([A-Z0-9]+)"', re.search(r"const SHORT = \{(.*?)\};", s, re.S).group(1)))
SYS = dict(re.findall(r'(\w+): "([^"]+)"', re.search(r"const SYS = \{(.*?)\};", s).group(1)))
PARTS = {}
for m in re.finditer(r'^  "([a-z0-9-]+)": \{ (.*?) \},?$', s, re.M):
    body = m.group(2)
    p = dict(re.findall(r'(\w+): "([^"]*)"', body))
    p.update({k: float(v) for k, v in re.findall(r'(price|g): ([\d.]+)', body)})
    p["personal"] = "personal: true" in body
    p["custom"] = "custom:" in body
    PARTS[m.group(1)] = p

ALPH = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
def code(sku, col):
    body = f"{SHORT[sku]}-{col[:3].upper()}"
    return f"AL-{body}-{ALPH[sum((i + 1) * ord(c) for i, c in enumerate(body)) % 32]}"

HEAD = ["URL handle", "Title", "Description", "Vendor", "Type", "Tags", "Published on online store", "Status",
        "SKU", "Option1 name", "Option1 value", "Price", "Weight value (grams)", "Weight unit for display",
        "Requires shipping", "Fulfillment service", "Inventory tracker", "Continue selling when out of stock",
        "Cost per item", "Product image URL", "Image alt text"]
rows = []
def add(handle, title, desc, ptype, tags, variants):
    for i, (opt, sku, price, grams) in enumerate(variants):
        first = i == 0
        rows.append({"URL handle": handle, "Title": title if first else "", "Description": desc if first else "",
                     "Vendor": "assembl living" if first else "", "Type": ptype if first else "", "Tags": tags if first else "",
                     "Published on online store": "FALSE" if first else "", "Status": "draft" if first else "",
                     "SKU": sku, "Option1 name": "Colour" if first else "", "Option1 value": opt, "Price": f"{price:.2f}",
                     "Weight value (grams)": round(grams), "Weight unit for display": "g", "Requires shipping": "TRUE",
                     "Fulfillment service": "manual", "Inventory tracker": "", "Continue selling when out of stock": "continue",
                     "Cost per item": "", "Product image URL": "", "Image alt text": ""})

PACK_G = 40   # rough packaging allowance per parcel for shipping weight
for sku, p in PARTS.items():
    if p.get("custom"):
        continue
    cols = DR_COL if p["sys"] in ("dayrally", "bike") else COLOURS
    if p["sys"] == "light":
        cols = [{"id": "natural", "name": "Natural translucent"}]   # translucent PETG, LED only
    desc = (f"<p>{p['blurb']}</p><p>{p['size']} · {p['mat']}. Printed to order and posted to you.</p>"
            + ("<p>Personalised: the name is entered in the configurator before checkout.</p>" if p["personal"] else ""))
    tags = ", ".join(t for t in [SYS[p["sys"]], "made to order", "personalised" if p["personal"] else ""] if t)
    add(f"al-{sku}", p["name"], desc, SYS[p["sys"]], tags,
        [(c["name"], code(sku, c["id"]), p["price"], p["g"] + PACK_G) for c in cols])

# kits (one colour option: the base colour; the parts colour is picked in the configurator)
kits = {}
for m in re.finditer(r'\{ space: "\w+",(?: label: "\w+", mount: "\w+",)? title: "([^"]+)",(?: img: \[[^\]]+\],)? lines: (\[\[.*?\]\]), note: "([^"]+)"', s):
    kits[m.group(1)] = (json.loads(m.group(2)), m.group(3), None)
SIZE_SKU = {"mini": "pod-mini", "standard": "pod-standard", "tall": "pod-tall", "long": "pod-long"}
for m in re.finditer(r'(\w+): \{ name: "([^"]+)", size: "(\w+)", insert: "[^"]+", lid: "[^"]+", way: "[^"]+", mount: "([a-z-]+)", addons: \[([^\]]*)\], note: "([^"]+)" \}', s):
    lines = [[SIZE_SKU[m.group(3)], 1]] + ([[m.group(4), 1]] if m.group(4) != "none" else []) + [[a.strip('" '), 1] for a in m.group(5).split(",") if a.strip()]
    full = sum(PARTS[a]["price"] * n for a, n in lines)
    kits[f"dayrally {m.group(2)} kit"] = (lines, m.group(6), full - round(full * 0.1))
for title, (lines, note, price) in kits.items():
    price = price or sum(PARTS[a]["price"] * n for a, n in lines)
    g = sum(PARTS[a]["g"] * n for a, n in lines) + PACK_G
    dr = title.startswith("dayrally")
    cols = DR_COL if dr else COLOURS
    handle = "al-kit-" + re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    desc = f"<p>{note}</p><ul>" + "".join(f"<li>{n} × {PARTS[a]['name']}</li>" for a, n in lines) + "</ul><p>Printed to order and posted to you.</p>"
    kit_short = "K" + "".join(w[:3] for w in re.sub(r"[^A-Za-z ]", "", title).upper().split())[:6]
    add(handle, title, desc, "dayrally" if dr else "Room kit", "kit, made to order" + (", personalised" if any(PARTS[a]["personal"] for a, _ in lines) else ""),
        [(c["name"], f"AL-{kit_short}-{c['id'][:3].upper()}", price, g) for c in cols])

out = os.path.join(HERE, "shopify-products.csv")
with open(out, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=HEAD); w.writeheader(); w.writerows(rows)
print(len(rows), "rows,", len({r['URL handle'] for r in rows}), "products ->", out)
