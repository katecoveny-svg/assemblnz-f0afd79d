#!/usr/bin/env python3
"""
Store copy for the 57 assembl / living drafts, generated from the catalogue manifest so every description
says what the part is, what it fits, and how it belongs to one modular system.

    python3 tools/living-cad/launch/descriptions.py            # writes launch/descriptions.json
    python3 tools/living-cad/launch/descriptions.py --print    # also prints the HTML for a look

The JSON is what gets pushed to the Shopify drafts (productUpdate descriptionHtml). Copy voice: short, warm,
exact; sentence case; never "AI", "smart", "premium".
"""
import html
import json
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[3]
MAN = json.loads((REPO / "lib" / "living" / "cad-manifest.json").read_text())

TURN = ("Every assembl / living piece shares one connection: the assembl TURN, a quarter-turn key on a 42 mm grid. "
        "Push the key in, turn it a quarter, and it is locked. Turn it back and the piece moves.")

FAMILY = {
    "Grid · wall": "Grid boards screw to the wall (washers included). Hooks, shelves, bins and cups then move in seconds and leave no mark.",
    "dayrally": "dayrally pods and mounts share the same TURN as the wall system, so the pod that rides a bag strap today locks onto a Grid board at home tonight.",
    "Bike": "Bike pieces use the same pod and the same key, so one pod moves between the handlebars, the bag and the wall.",
    "Stack · furniture": "Stack joints turn 19 mm pine dowel from any hardware store into shelves, stands and rails. The printed parts are the small, exact bits; the long, cheap material is timber.",
    "Renter": "Renter pieces hang the Grid without a drill: over a door, from a wardrobe rail, or on removable adhesive strips.",
    "Light": "The fold shade is printed in translucent PETG for an LED cord set. It is the one living piece that is not on the TURN grid.",
    "Room kit": "Everything in a room kit shares one connection, so any other living piece can be added later and it will fit.",
}

FILL = {   # what fits, where the blurb needs it
    "al-pod-mini": "Fits earbuds and a case, lip balm, a key, a few coins.",
    "al-pod-standard": "Fits a phone-sized flat lay: cards, cash, sunscreen stick, a small tackle tray, snacks.",
    "al-pod-tall": "Fits bottles standing up, a sunscreen tube, bug spray, cards on edge.",
    "al-pod-long": "Fits pens and pencils, a ruler, small tools, long lures and soft baits.",
}

HOW = {
    "personalised": "Personalised: the name goes in the configurator on this page before checkout. Lettering prints in your accent colour.",
}

STATUS = "Printed to order in New Zealand from the assembl / living v0.3 print files, and posted to you."


def p(text):
    return f"<p>{html.escape(text, quote=False)}</p>"


def product_html(it):
    paras = [p(it["blurb"])]
    if it["handle"] in FILL:
        paras.append(p(FILL[it["handle"]]))
    size = it["size"].replace("×", "×")
    mat = it["material"].rstrip(".")
    paras.append(p(f"{size} · {mat}."))
    fam = FAMILY.get(it["type"])
    if it["type"] in ("Stack · furniture", "Light"):
        paras.append(p(fam + " It sits beside the Grid wall in the same seven colours."))
    else:
        paras.append(p(TURN + (" " + fam if fam else "")))
    if it["personalised"]:
        paras.append(p(HOW["personalised"]))
    paras.append(p(STATUS))
    return "\n".join(paras)


def kit_html(kit, by_handle):
    paras = [p(kit["note"])]
    items = "".join(f"<li>{l['qty']} × {html.escape(by_handle[l['handle']]['title'], quote=False)}</li>" for l in kit["lines"])
    paras.append(f"<ul>{items}</ul>")
    personalised = any(by_handle[l["handle"]]["personalised"] for l in kit["lines"])
    if kit["collection"] == "dayrally":
        paras.append(p("Pick a colour. Add a name. It arrives printed and clicks together in a minute. " + FAMILY["dayrally"]))
    else:
        paras.append(p(TURN + " " + FAMILY["Room kit"]))
    if personalised:
        paras.append(p(HOW["personalised"]))
    paras.append(p(STATUS))
    return "\n".join(paras)


def main():
    by_handle = {it["handle"]: it for it in MAN["products"]}
    out = {}
    for it in MAN["products"]:
        out[it["handle"]] = {"title": it["title"], "descriptionHtml": product_html(it)}
    for kit in MAN["kits"]:
        out[kit["handle"]] = {"title": kit["title"], "descriptionHtml": kit_html(kit, by_handle)}
    dst = Path(__file__).with_name("descriptions.json")
    dst.write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n")
    print(len(out), "descriptions ->", dst.relative_to(REPO))
    if "--print" in sys.argv:
        for h in ("al-kit-dayrally-beach-kit", "al-pod-standard", "al-board-4x4", "al-node-corner"):
            print("\n##", h, "\n" + out[h]["descriptionHtml"])


if __name__ == "__main__":
    main()
