"""
Build one part straight from the CAD, in its print orientation, and ask Bambu Studio whether it needs supports.
For iterating on a design before the family build and the manifest: nothing in the repo is written.

Run from the repo root:
    python3 tools/living-cad/slice/try_part.py ride-watch-42 mini-end-cap        (ids from a module's PARTS)
    python3 tools/living-cad/slice/try_part.py --expr "dayrally2.phone_stand()" --how on_side --material PLA
"""
import argparse, importlib, json, os, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
CAD = os.path.join(HERE, "..", "cad")
sys.path.insert(0, HERE)
sys.path.insert(0, CAD)
from slice_parts import BAMBU, PROFILES, env, filament_for          # noqa: E402

MODULES = ["dayrally_ride", "dayrally_mini", "dayrally_pocket", "dayrally_tackle", "home2", "dayrally_cast",
           "dayrally_cam", "dayrally_scoot", "dayrally_bike"]
MATERIAL = {p["id"]: p["material"] for p in json.load(open(os.path.join(HERE, "..", "..", "..", "lib", "living", "cad-manifest.json")))["parts"]}


def find(pid):
    for name in MODULES:
        mod = importlib.import_module(name)
        if pid in getattr(mod, "PARTS", {}):
            _, fn, how, _, _ = mod.PARTS[pid]
            return fn, how
    raise SystemExit(f"{pid}: not in any module's PARTS; use --expr")


def export(man, how, path):
    import lib
    from build_dayrally2 import PRINT
    p = man.rotate(PRINT[how])
    x0, y0, z0, x1, y1, z1 = p.bounding_box()
    p = p.translate([-(x0 + x1) / 2, -(y0 + y1) / 2, -z0])
    lib.to_trimesh(p).export(path)


def ask(path, material):
    with tempfile.TemporaryDirectory() as tmp:
        cmd = [os.path.join(BAMBU, "bin", "bambu-studio"), "--debug", "1", "--slice", "0", "--arrange", "1",
               "--load-settings", f"{PROFILES}/machine.json;{PROFILES}/process.json",
               "--load-filaments", f"{PROFILES}/filament-{filament_for(material)}.json", "--outputdir", tmp, path]
        subprocess.run(cmd, env=env(), capture_output=True, text=True, timeout=900)
        res = json.load(open(os.path.join(tmp, "result.json")))
        plate = (res.get("sliced_plates") or [{}])[0]
        grams = sum(f.get("total_used_g", 0) for f in plate.get("filaments", []))
        return plate.get("warning_message") or "", round(grams, 1), round((plate.get("total_predication") or 0) / 60, 1)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("ids", nargs="*")
    ap.add_argument("--expr")
    ap.add_argument("--how", default="as_is")
    ap.add_argument("--material", default="PETG")
    ap.add_argument("--keep", help="also write the STL here")
    a = ap.parse_args()
    jobs = []
    for pid in a.ids:
        fn, how = find(pid)
        jobs.append((pid, fn, how, MATERIAL.get(pid, a.material)))
    if a.expr:
        mod = a.expr.split(".")[0]
        g = {mod: importlib.import_module(mod)}
        jobs.append((a.expr, lambda: eval(a.expr, g), a.how, a.material))
    for label, fn, how, material in jobs:
        with tempfile.TemporaryDirectory() as tmp:
            path = os.path.join(tmp, "part.stl")
            export(fn(), how, path)
            if a.keep:
                import shutil
                shutil.copyfile(path, os.path.join(a.keep, f"{label}.stl"))
            warn, g, mins = ask(path, material)
        print(f"{label:28s} {how:13s} {'NEEDS SUPPORT' if 'floating' in warn else 'clean':13s} {g:7.1f} g {mins:7.1f} min  {warn[:60]}", flush=True)
