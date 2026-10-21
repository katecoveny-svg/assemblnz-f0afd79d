#!/usr/bin/env python3
"""
Treatstock print API for assembl / living: quote and order the first-print sets through Treatstock's API v2
(the marketplace with Auckland PETG vendors, LAUNCH-OPERATIONS-20261019.md section 5).

Endpoints, from Treatstock's official client (github.com/Treatstock/apiv2, MIT; base https://api.treatstock.com/api/v2/):
  POST printable-packs                 multipart: files[i] (STL/PLY/3MF) or file-urls[i], title, print_instructions, location[country]
  GET  printable-packs/{id}            pack status: parts with uid, size, weight once calculated
  GET  printable-pack-costs            ?printablePackId= : prices per vendor, material group and colour
  PUT  printable-packs/{id}            form: modelTextureInfo[isOneMaterialForKit], modelTextureInfo[partsMaterial][uid][materialGroup|color|infill], qty[uid]
  GET  printable-pack-offers/          ?printablePackId= [&intlOnly=1] : offers per vendor for the chosen materials
  POST place-order/create              form: printablePackId, providerId, comment, location[email|company|phone], shippingAddress[...], modelTextureInfo
  GET  place-order/state               ?orderId=
  POST payment/pay                     orderId, total : pays from the Treatstock account balance (SPENDS MONEY)
  GET  material-group-colors/          the vendors' material groups and colour names
Every call carries ?private-key=<company key>. The key comes from support@treatstock.com ("Become an API partner").

Usage (the key is read from TREATSTOCK_PRIVATE_KEY; without it every command is a dry run that prints the plan):
  python3 tools/living-cad/launch/treatstock_api.py colors
  python3 tools/living-cad/launch/treatstock_api.py quote --set "pegboard" [--country NZ]
  python3 tools/living-cad/launch/treatstock_api.py status --pack 200010 | --order 44649
  python3 tools/living-cad/launch/treatstock_api.py order --pack 200010 --provider 934 --address address.json --confirm
  python3 tools/living-cad/launch/treatstock_api.py pay --order 44649 --total 123.45 --confirm-spend   (also needs TREATSTOCK_ALLOW_PAY=1)

Nothing here publishes, and nothing spends unless both the flag and the environment variable say so.
"""
import argparse, csv, json, os, sys, time
from pathlib import Path

HERE = Path(__file__).resolve().parent
ORDER_CSV = HERE / "print-order-20261020" / "order.csv"
QUOTES = HERE / "print-order-20261020" / "quotes"
STL = HERE.parent / "parts" / "stl"
KIT = HERE.parent / "parts" / "test-kit"
BASE = os.environ.get("TREATSTOCK_API_BASE", "https://api.treatstock.com/api/v2/")
KEY = os.environ.get("TREATSTOCK_PRIVATE_KEY", "")

# our colour and material names -> Treatstock material groups and colour names (confirm against `colors`)
COLOUR = {"sun": "Yellow", "tomato": "Red", "black": "Black", "cream": "White"}
GROUP = [("TPU", "TPU"), ("PPA-CF", "Nylon"), ("PA12-CF", "Nylon"), ("PETG-CF", "PETG"), ("ASA", "ASA"), ("PETG", "PETG"), ("PLA", "PLA")]


def colour_name(ours):
    for k, v in COLOUR.items():
        if k in ours.lower():
            return v
    return "Black"


def group_name(material):
    for k, v in GROUP:
        if k.lower() in material.lower():
            return v
    return "PETG"


def flatten(prefix, value, out):
    """PHP-style nested form keys, as http_build_query makes them."""
    if isinstance(value, dict):
        for k, v in value.items():
            flatten(f"{prefix}[{k}]" if prefix else str(k), v, out)
    elif isinstance(value, (list, tuple)):
        for i, v in enumerate(value):
            flatten(f"{prefix}[{i}]", v, out)
    elif value is not None and value != "":
        out.append((prefix, str(value)))
    return out


class Treatstock:
    def __init__(self, key=KEY, base=BASE, dry=False):
        self.key, self.base, self.dry = key, base, dry or not key
        import requests
        self.http = requests.Session()

    def _url(self, path, **params):
        from urllib.parse import urlencode
        params["private-key"] = self.key or "<TREATSTOCK_PRIVATE_KEY>"
        return self.base + path + ("&" if "?" in path else "?") + urlencode(params)

    def _call(self, method, path, params=None, data=None, files=None):
        url = self._url(path, **(params or {}))
        if self.dry:
            print(f"[dry run] {method} {url}")
            if data: print("          form:", json.dumps(data if isinstance(data, dict) else dict(data))[:600])
            if files: print("          files:", [f[1][0] for f in files])
            return {}
        r = self.http.request(method, url, data=data, files=files, timeout=300)
        try:
            j = r.json()
        except ValueError:
            raise SystemExit(f"{method} {path}: HTTP {r.status_code}, not JSON: {r.text[:300]}")
        if r.status_code != 200 or (isinstance(j, dict) and j.get("error")):
            raise SystemExit(f"{method} {path}: HTTP {r.status_code}: {json.dumps(j)[:600]}")
        return j

    def material_group_colors(self):
        return self._call("GET", "material-group-colors/")

    def create_pack(self, paths, country="NZ", title="", instructions=""):
        files = [(f"files[{i}]", (Path(p).name, open(p, "rb"), "application/octet-stream")) for i, p in enumerate(paths)]
        data = flatten("", {"title": title, "print_instructions": instructions, "location": {"country": country}}, [])
        try:
            return self._call("POST", "printable-packs", data=data, files=files)
        finally:
            for _, (_, fh, _) in files:
                fh.close()

    def pack_status(self, pack_id):
        return self._call("GET", f"printable-packs/{pack_id}")

    def prices(self, pack_id):
        return self._call("GET", "printable-pack-costs", params={"printablePackId": pack_id})

    def change_pack(self, pack_id, parts_material, qty):
        data = flatten("", {"modelTextureInfo": {"isOneMaterialForKit": 0, "partsMaterial": parts_material}, "qty": qty}, [])
        return self._call("PUT", f"printable-packs/{pack_id}", data=data)

    def offers(self, pack_id, intl_only=False):
        params = {"printablePackId": pack_id}
        if intl_only: params["intlOnly"] = 1
        return self._call("GET", "printable-pack-offers/", params=params)

    def place_order(self, pack_id, provider_id, location, address, texture_info, comment=""):
        data = flatten("", {"printablePackId": pack_id, "providerId": provider_id, "comment": comment, "location": location,
                            "shippingAddress": address, "modelTextureInfo": texture_info}, [])
        return self._call("POST", "place-order/create", data=data)

    def order_state(self, order_id):
        return self._call("GET", "place-order/state", params={"orderId": order_id})

    def pay(self, order_id, total):
        if os.environ.get("TREATSTOCK_ALLOW_PAY") != "1":
            raise SystemExit("refusing to pay: set TREATSTOCK_ALLOW_PAY=1 and pass --confirm-spend; this spends the account balance")
        return self._call("POST", "payment/pay", data=[("orderId", str(order_id)), ("total", str(total))])


def rows_for(set_name):
    """Rows of one set from order.csv; "lean first print" is the 21 October subset flagged lean = yes across sets."""
    with open(ORDER_CSV) as f:
        return [r for r in csv.DictReader(f) if r["set"] == set_name or (set_name == "lean first print" and r.get("lean") == "yes")]




def cmd_quote(api, set_name, country):
    rows = rows_for(set_name)
    if not rows:
        raise SystemExit(f"no rows for set {set_name!r}; sets: {sorted({r['set'] for r in csv.DictReader(open(ORDER_CSV))})}")
    paths = [(KIT if r["set"] == "test kit" else STL) / r["file"] for r in rows]
    missing = [p.name for p in paths if not p.exists()]
    if missing:
        raise SystemExit(f"missing STL: {missing}")
    print(f"{set_name}: {len(rows)} files, {sum(int(r['qty']) for r in rows)} pieces, est {sum(float(r['est_g_each']) * int(r['qty']) for r in rows):.0f} g")
    pack = api.create_pack(paths, country=country, title=f"assembl / living · {set_name} · first print",
                           instructions="First print of our own designs. Print as sent, do not scale or repair. Orientation and notes per file in the order sheet.")
    if api.dry:
        for r in rows:
            print(f"  {r['file']:34s} x{r['qty']}  {group_name(r['material']):6s} {colour_name(r['colour']):7s}  {r['note'][:70]}")
        return
    pack_id = pack["id"]
    print("pack", pack_id, pack.get("redir"))
    for _ in range(24):                                   # wait for size and weight calculation
        st = api.pack_status(pack_id)
        parts = st.get("parts") or pack.get("parts") or []
        if parts and all(p.get("weight") for p in parts):
            break
        time.sleep(5)
    by_name = {p["name"]: p for p in parts}
    parts_material, qty = {}, {}
    for r in rows:
        p = by_name.get(r["file"])
        if not p:
            print("  no part for", r["file"]); continue
        parts_material[p["uid"]] = {"materialGroup": group_name(r["material"]), "color": colour_name(r["colour"])}
        qty[p["uid"]] = int(r["qty"])
    api.change_pack(pack_id, parts_material, qty)
    offers = api.offers(pack_id)
    QUOTES.mkdir(parents=True, exist_ok=True)
    out = QUOTES / f"{set_name.replace(' ', '-')}-{pack_id}.json"
    out.write_text(json.dumps({"set": set_name, "pack": pack, "status": st, "offers": offers}, indent=1))
    ol = sorted(offers.get("offersList", []), key=lambda o: o.get("printPrice", 1e9))
    print(f"{len(ol)} offers; cheapest:")
    for o in ol[:8]:
        print(f"  provider {o.get('providerId')}: {o.get('printPrice')}")
    print("saved", out, "\nNext: order --pack", pack_id, "--provider <id> --address address.json --confirm (vendor country and reviews: see the offers JSON and the pack page)")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("colors")
    q = sub.add_parser("quote"); q.add_argument("--set", required=True); q.add_argument("--country", default="NZ")
    s = sub.add_parser("status"); s.add_argument("--pack"); s.add_argument("--order")
    o = sub.add_parser("order"); o.add_argument("--pack", required=True); o.add_argument("--provider", required=True); o.add_argument("--address", required=True, help="JSON: {location:{email,company,phone}, shippingAddress:{country,state,street,city,firstName,lastName,zip}}"); o.add_argument("--comment", default="Please print as sent; first print of our own designs."); o.add_argument("--confirm", action="store_true")
    p = sub.add_parser("pay"); p.add_argument("--order", required=True); p.add_argument("--total", required=True); p.add_argument("--confirm-spend", action="store_true")
    a = ap.parse_args()
    api = Treatstock()
    if api.dry:
        print("TREATSTOCK_PRIVATE_KEY is not set: dry run, nothing is sent.")
    if a.cmd == "colors":
        print(json.dumps(api.material_group_colors(), indent=1)[:4000])
    elif a.cmd == "quote":
        cmd_quote(api, a.set, a.country)
    elif a.cmd == "status":
        print(json.dumps(api.pack_status(a.pack) if a.pack else api.order_state(a.order), indent=1)[:4000])
    elif a.cmd == "order":
        if not a.confirm:
            raise SystemExit("add --confirm to place the order (it creates an unpaid order on the account)")
        addr = json.loads(Path(a.address).read_text())
        quote = sorted(QUOTES.glob(f"*-{a.pack}.json"))
        texture = json.loads(quote[-1].read_text())["offers"].get("modelTextureInfo") if quote else None
        print(json.dumps(api.place_order(a.pack, a.provider, addr["location"], addr["shippingAddress"], texture, a.comment), indent=1))
    elif a.cmd == "pay":
        if not a.confirm_spend:
            raise SystemExit("add --confirm-spend (and TREATSTOCK_ALLOW_PAY=1) to pay from the account balance")
        print(json.dumps(api.pay(a.order, a.total), indent=1))


if __name__ == "__main__":
    main()
