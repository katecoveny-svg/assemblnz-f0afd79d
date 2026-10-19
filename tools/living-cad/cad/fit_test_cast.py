"""Digital fit checks for the dayrally cast rod. Run: python3 cad/fit_test_cast.py"""
import os, sys, json, math
sys.path.insert(0, os.path.dirname(__file__))
import lib, dayrally_cast as c
from lib import M
ov = lambda a, b: round((a ^ b).volume(), 3)
out = {}
secs = [c.section(i) for i in range(c.N_SEC)]
pins = [c.pin(i) for i in range(c.N_SEC - 1)]
for i in range(c.N_SEC - 1):
    s0, s1 = c.SIZES[i]
    cz = -(s0 - s1) / 2
    pin_in = pins[i].translate([0, c.SEC_L - c.PIN_L / 2, cz])                 # half in the lower section's top socket
    upper = secs[i + 1].translate([0, c.SEC_L, cz])                              # upper section slides over the other half
    out[f"joint_{i + 1}_pin_in_lower_clash_mm3"] = ov(secs[i], pin_in)
    out[f"joint_{i + 1}_pin_in_upper_clash_mm3"] = ov(upper, pin_in)
    out[f"joint_{i + 1}_sections_clash_mm3"] = ov(secs[i], upper)
    p = c.pin_side(i)
    out[f"joint_{i + 1}_socket_wall_mm"] = c.WALL
g, col, cap, hd, nt = c.grip(), c.collar(), c.butt_cap(), c.hood(), c.nut()
collar_in = col.translate([0, 0, c.GRIP_L - c.COLLAR_L])
out["collar_press_mm3"] = ov(g, collar_in)
s1 = secs[0].rotate([90, 0, 0]).translate([0, 0, c.GRIP_L + 3.0])              # +y -> +z, base socket over the collar pin
out["s1_over_collar_pin_clash_mm3"] = ov(collar_in, s1)
out["cap_press_mm3"] = ov(g, cap.translate([0, 0, -3.0]))
bed_z1 = c.GRIP_L - c.SEAT_TOP
for L in (c.FOOT_MIN, 62.0, c.FOOT_MAX):
    foot = c.reel_foot_gauge(L).translate([c.BED_X, 0, bed_z1 + 2.0 - L])
    hz = c.HOOD_Z(L)
    hood_in = hd.translate([0, 0, hz])
    nz = hz - c.NUT_L - 0.2
    nz = c.THREAD_Z0 + 1.0 + math.floor((nz - c.THREAD_Z0 - 1.0) / c.THREAD_PITCH) * c.THREAD_PITCH        # in phase with the grip thread
    nut_in = nt.translate([0, 0, nz])
    out[f"foot_{int(L)}_nut_to_hood_gap_mm"] = round(hz - (nz + c.NUT_L), 2)
    out[f"foot_{int(L)}_in_fixed_hood_clash_mm3"] = ov(g, foot)
    out[f"foot_{int(L)}_hood_on_grip_clash_mm3"] = ov(g, hood_in)
    out[f"foot_{int(L)}_hood_on_foot_clash_mm3"] = ov(hood_in, foot)
    out[f"foot_{int(L)}_nut_on_thread_clash_mm3"] = ov(g, nut_in)
    out[f"foot_{int(L)}_nut_within_thread"] = (nz >= c.THREAD_Z0 - 0.01) and (nz + c.NUT_L <= c.THREAD_Z1 + 0.01)
    if L == 62.0:
        out["nut_half_pitch_off_clashes_mm3"] = ov(g, nt.translate([0, 0, nz + c.THREAD_PITCH / 2]))     # sanity: must be large
ok, placed = c.packing_check()
out["sections_pack_inside_grip"] = ok
out["assembled_length_mm"] = round(c.GRIP_L + 3.0 + c.N_SEC * c.SEC_L, 1)
print(json.dumps(out, indent=1))
json.dump(out, open(os.path.join(os.path.dirname(__file__), "..", "parts", "fit-tests-cast.json"), "w"), indent=2)
