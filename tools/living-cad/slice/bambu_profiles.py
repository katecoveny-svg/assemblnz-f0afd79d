"""
Flatten Bambu Studio system profiles into complete JSON files the slicer's command line accepts.

The system profiles inherit (`inherits`) from parents in the same folder; the CLI wants each one whole. This walks the
chain and merges child over parent. Profiles come from the Bambu Studio install (AppImage extracted to /opt/bambu, or
BAMBU_RESOURCES). Run: python3 tools/living-cad/slice/bambu_profiles.py
"""
import json, os, sys

RES = os.environ.get("BAMBU_RESOURCES", "/opt/bambu/squashfs-root/resources/profiles/BBL")
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "profiles")

MACHINE = "Bambu Lab X1 Carbon 0.4 nozzle"           # hardened nozzle, enclosed: prints every material in the catalogue
PROCESS = "0.20mm Standard @BBL X1C"
FILAMENTS = {                                          # our material names -> the Bambu system filament
    "pla": "Bambu PLA Matte @BBL X1C",
    "petg": "Bambu PETG HF @BBL X1C",
    "petg-cf": "Bambu PETG-CF @BBL X1C 0.4 nozzle",
    "pa-cf": "Bambu PAHT-CF @BBL X1C",
    "tpu": "Bambu TPU 95A HF @BBL X1C",
    "asa": "Bambu ASA @BBL X1C 0.4 nozzle",
}


def find(kind, name):
    p = os.path.join(RES, kind, name + ".json")
    if not os.path.exists(p):
        raise SystemExit(f"no {kind} profile named {name!r} in {RES}")
    return json.load(open(p))


def flatten(kind, name):
    data = find(kind, name)
    parent = data.get("inherits")
    merged = flatten(kind, parent) if parent else {}
    merged.update({k: v for k, v in data.items() if k != "inherits"})
    return merged


def write(kind, name, slug):
    d = flatten(kind, name)
    d["name"] = name
    d["from"] = "system"
    if kind == "process":
        d["curr_bed_type"] = "Textured PEI Plate"           # every catalogue material prints on textured PEI (PLA, PETG, CF, TPU, ASA)
    d.pop("inherits", None)
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, f"{slug}.json")
    json.dump(d, open(path, "w"), indent=1, sort_keys=True)
    return path


if __name__ == "__main__":
    print(write("machine", MACHINE, "machine"))
    print(write("process", PROCESS, "process"))
    for slug, name in FILAMENTS.items():
        try:
            print(write("filament", name, f"filament-{slug}"))
        except SystemExit as e:
            print("skip:", e, file=sys.stderr)
