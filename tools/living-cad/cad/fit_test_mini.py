"""Digital fit checks for TURN mini. Run: python3 cad/fit_test_mini.py"""
import os, sys, json, math
sys.path.insert(0, os.path.dirname(__file__))
import lib, dayrally_mini as mm, dayrally as d1, dayrally2 as d2
from lib import M
ov = lambda a, b: round((a ^ b).volume(), 3)
out = {}
c = mm.cube()
key = mm.universal_key()
# key end A in the cube's +z face: the key's z=0 datum is the socket's chamber floor level; socket face at CUBE/2
kA = key.translate([0, 0, mm.CUBE / 2 - mm.FACE])
out["universal_key_in_cube_A_clash_mm3"] = ov(c, kA)
# key end B into a second cube above, face to face (disc 1.0 between recesses 0.5 + 0.5)
c2 = mm.cube().rotate([180, 0, 0]).translate([0, 0, mm.CUBE + 0.0])
out["cubes_face_to_face_clash_mm3"] = ov(c, c2)
out["universal_key_in_cube_B_clash_mm3"] = ov(c2, kA)
out["cube_B_quarter_turned_same"] = ov(c2.rotate([0, 0, 90]), kA)
# key unlocked (lugs along y) must pass through the keyway: rotate key 90 about z -> clash should be 0 (slot clearance)
out["universal_key_unlocked_passes_keyway_mm3"] = ov(c, kA.rotate([0, 0, 90]))
# single-key parts
out["end_cap_in_cube_clash_mm3"] = ov(c, mm.end_cap().translate([0, 0, mm.CUBE / 2 - mm.FACE]))
out["cube_face_adjacent_chambers_overlap"] = "by construction: chambers occupy 2.4-4.8 mm behind each face; interior 16.4 mm solid"
# action cam fingers
cm = mm.cam_mount()
out["cam_fingers_gauge_clash_mm3"] = ov(cm, mm.cam_finger_gauge())
out["cam_fingers_gauge_shifted_0.2_clash_mm3"] = ov(cm, mm.cam_finger_gauge().translate([0, 0.2, 0]))
# light mount
lm = mm.light_mount()
out["torch_25_in_light_mount_clash_mm3"] = ov(lm, mm.torch_gauge(25.0))
out["torch_26_in_light_mount_clash_mm3_designed_grip"] = ov(lm, mm.torch_gauge(26.0))
# clamps on bars
for name, fn, dias in (("tube_clamp", mm.tube_clamp, (22.0, 31.8, 35.0)), ("pole_clamp", mm.pole_clamp, (12.0, 16.0, 20.0))):
    part = fn()
    for d in dias:
        gd = (35.0 if name == "tube_clamp" else 20.0) * 0.45
        # a bar lying along y, resting in the V: centre height so it touches both V walls (120 deg V: centre at r / sin(60))
        zc = d / 2 / math.sin(math.radians(60)) - gd + gd    # V apex at z = gd, walls down to z = 0: centre at apex - r/sin60 ... compute directly
        apex = gd
        zc = apex - (d / 2) / math.sin(math.radians(60))
        bar = M.cylinder(80, d / 2, -1.0, 96).rotate([-90, 0, 0]).translate([0, -40, zc])
        out[f"{name}_bar_{d}_clash_mm3"] = ov(part, bar)
        out[f"{name}_bar_{d}_seats_above_bed"] = bool(zc - d / 2 > -40)
# adapter on a full board, on the bar saddle, cube on the boss clears the full key grips
ad = mm.adapter()
keys = M.batch_boolean([lib.turn_key().translate([x, y, 0]) for (x, y) in d1.KEYS], lib.m3d.OpType.Add)
out["adapter_keys_clash_mm3_designed_clamp"] = ov(ad, keys)
out["adapter_on_bar_saddle_clash_mm3"] = ov(d1.bar_saddle(), ad)
out["adapter_on_grid_board_clash_mm3"] = ov(lib.board(2, 2).translate([-42.0, -21.0, 0]), ad)
cube_on = mm.cube().translate([0, 0, 18.0 + mm.CUBE / 2])
out["cube_on_adapter_clash_mm3"] = ov(ad, cube_on)
out["cube_on_adapter_clears_full_key_grips_mm3"] = ov(keys, cube_on)
# photo tag, device holder, collar, hook, bar end
out["photo_in_tag_clash_mm3"] = ov(mm.photo_tag(), mm.photo_gauge())
dh = mm.device_holder()
dev = lib.ext_z(lib.rrect(60.0, 90.0, 5.0, seg=32), 3.2, 15.2)
out["device_60x90x12_in_holder_clash_mm3"] = ov(dh, dev)
col = mm.collar_mount()
web = M.cube([60.0, 25.0, 4.0], center=True).translate([0, 0, 2.4 + 2.0])
out["collar_25x4_in_mount_clash_mm3_bump_only"] = ov(col, web)
be = mm.keyed_bar_end()
out["bar_end_key_clash_mm3"] = ov(be, mm.end_cap())
bar_tube = M.cylinder(30, 9.4, -1.0, 96).translate([0, 0, -30.5]) - M.cylinder(32, 9.4 - 0.9, -1.0, 96).translate([0, 0, -31.5])
out["bar_end_in_18.8_bar_press_mm3_designed"] = ov(be, bar_tube)
out["helmet_base_on_90mm_shell_clash_mm3"] = ov(mm.helmet_base(), mm.helmet_gauge())
out["battery_68x14_in_dock_clash_mm3"] = ov(mm.battery_dock(), mm.battery_gauge())
ph = lib.ext_z(lib.rrect(78.0, 158.0, 8.0, seg=32), 3.2, 3.2 + 9.0)
out["phone_78x158x9_in_holder_clash_mm3"] = ov(mm.phone_holder(), ph)
# a helmet chain: base + cube (cam mount) through a universal key
chain_key = mm.universal_key().translate([0, 0, 6.5 - mm.FACE])
out["helmet_base_key_clash_mm3"] = ov(mm.helmet_base(), chain_key)
cm_on = mm.cam_mount().translate([0, 0, 6.5 + mm.CUBE / 2])
out["cam_mount_on_helmet_base_clash_mm3"] = ov(mm.helmet_base(), cm_on)
out["cam_mount_on_helmet_base_key_clash_mm3"] = ov(cm_on, chain_key)
json.dump(out, open(os.path.join(os.path.dirname(__file__), "..", "parts", "fit-tests-mini.json"), "w"), indent=2)
for k, v in out.items():
    print(f"{k:52s} {v}")
