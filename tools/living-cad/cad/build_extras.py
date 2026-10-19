import os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
import lib, extras as x
from build import emit, report, OUT, FONT
start = len(report)
SAMPLE = [  # a vanity drawer, measured by hand for the sample
    {"name": "Lipstick", "shape": "circle", "w": 22, "depth": 18}, {"name": "Lipstick", "shape": "circle", "w": 22, "depth": 18},
    {"name": "Lipstick", "shape": "circle", "w": 22, "depth": 18}, {"name": "Compact", "shape": "circle", "w": 66, "depth": 12},
    {"name": "Mascara", "shape": "stadium", "w": 138, "h": 18, "depth": 14}, {"name": "Brush", "shape": "stadium", "w": 172, "h": 16, "depth": 12},
    {"name": "Palette", "shape": "rect", "w": 112, "h": 72, "depth": 10}, {"name": "Perfume", "shape": "rect", "w": 46, "h": 30, "depth": 20}]
tray, D, places = x.cutout_tray(SAMPLE, W=240, H=24)
emit("tile-cutout-vanity", f"Cut-out tray (sample: vanity, 240 × {D:.0f} mm)", tray, "as_is", "tile", "Pockets shaped to each item, with finger scoops.")
emit("renter-over-door", "Over-door hanger", x.over_door_hanger(), "on_side", "renter", "Needs a 4 mm gap above the door. Use two per board.")
emit("renter-rail", "Wardrobe-rail hanger", x.rail_hanger(), "on_side", "renter", "Rails up to 32 mm.")
code = x.part_code("B44R", "OAT")
emit("renter-board-4x4", f"Grid board 4×4, renter back (code {code})", x.board_renter(4, 4, code, FONT), "face_down", "renter", "Flat back with strip lanes; reorder code on the back.")
# Own report file so this build and build_dayrally.py do not overwrite each other's rows.
json.dump(report[start:], open(os.path.join(OUT, "parts-report-extras.json"), "w"), indent=2)
print("code", code, "tray depth", round(D))
