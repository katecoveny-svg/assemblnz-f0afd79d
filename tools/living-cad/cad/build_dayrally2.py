"""Build dayrally v2: print files (parts/stl/dr2-*.stl), a parts report, and web preview models.
Run: python3 cad/build_dayrally2.py"""
import json, os, sys, struct, base64, time
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
import lib, dayrally2 as d
HERE = os.path.dirname(__file__)
OUT = os.path.join(HERE, "..", "parts")
WEB = os.path.join(HERE, "..", "store", "model")
FONT = os.path.join(HERE, "..", "fonts", "InstrumentSans-SemiBold.ttf")
PRINT = {"face_down": [180, 0, 0], "as_is": [0, 0, 0], "on_side": [0, 90, 0], "on_bottom": [90, 0, 0], "stand_up": [-90, 0, 0]}
report = []


def overhang(tm, limit=45.0):
    n, a, zc = tm.face_normals, tm.area_faces, tm.triangles_center[:, 2]
    return float(a[(n[:, 2] < -np.cos(np.radians(limit))) & (zc > 0.25)].sum())


def emit(slug, name, man, how, group, notes=""):
    p = man.rotate(PRINT[how])
    x0, y0, z0, x1, y1, z1 = p.bounding_box()
    p = p.translate([-(x0 + x1) / 2, -(y0 + y1) / 2, -z0])
    tm = lib.to_trimesh(p)
    tm.export(os.path.join(OUT, "stl", f"{slug}.stl"))
    # trimesh's vertex merge can report a false "not watertight" on thin features; the raw manifold mesh is the truth
    _m = p.to_mesh()
    import trimesh as _tri
    raw_ok = bool(_tri.Trimesh(vertices=np.asarray(_m.vert_properties)[:, :3], faces=np.asarray(_m.tri_verts), process=False).is_watertight)
    report.append({"slug": slug, "name": name, "group": group, "print_orientation": how,
                   "print_bbox_mm": [round(x1 - x0, 1), round(y1 - y0, 1), round(z1 - z0, 1)],
                   "fits_250_cube": max(x1 - x0, y1 - y0, z1 - z0) <= 250.0, "volume_cm3": round(man.volume() / 1000, 2),
                   "est_grams_pla": round(lib.est_grams(man), 1), "watertight": bool(tm.is_watertight) or raw_ok, "genus": man.genus(), "bodies": len(man.decompose()),
                   "unsupported_down_area_mm2": round(overhang(tm), 0), "notes": notes})


def web(slug, man, rot=(-90, 0, 0)):
    tm = lib.to_trimesh(man.rotate(list(rot)))
    b = tm.export(file_type="glb")
    _, _, length = struct.unpack('<III', b[:12]); off = 12; js = None; binb = b''
    while off < length:
        clen, ctype = struct.unpack('<II', b[off:off + 8]); chunk = b[off + 8:off + 8 + clen]
        if ctype == 0x4E4F534A: js = json.loads(chunk)
        elif ctype == 0x004E4942: binb = chunk
        off += 8 + clen
    js['buffers'][0]['uri'] = 'data:application/octet-stream;base64,' + base64.b64encode(binb).decode(); js['buffers'][0]['byteLength'] = len(binb)
    open(os.path.join(WEB, slug + ".json"), "w").write(json.dumps(js, separators=(',', ':')))


if __name__ == "__main__":
    os.makedirs(os.path.join(OUT, "stl"), exist_ok=True)
    os.makedirs(WEB, exist_ok=True)
    t0 = time.time()
    SAMPLE = {"mini": "AROHA", "standard": "MILA", "tall": "NIKAU", "long": "JAYDEN"}
    for size in d.SIZES:
        base = d.pod_base(size)
        emit(f"dr2-pod-{size}", f"dayrally pod, {size}", base, "as_is", "pod", "Floor is a TURN flange: fits every dayrally mount and any Grid board.")
        web(f"dr2-pod-{size}", base)
        plain, _ = d.pod_lid(size, "plain")
        emit(f"dr2-lid-{size}-plain", f"Lid, {size}, plain", plain, "face_down", "lid", "Prints top-down.")
        web(f"dr2-lid-{size}", plain)
        for style in d.LID_STYLES[1:]:
            lid, inlay = d.pod_lid(size, style, SAMPLE[size], FONT)
            if style == "name" or size == "standard":
                emit(f"dr2-lid-{size}-{style}", f"Lid, {size}, {style}" + (f" (sample: {SAMPLE[size]})" if style == "name" else ""), lid, "face_down", "lid", "Inlay prints as the first layers in a second colour.")
                emit(f"dr2-lid-{size}-{style}-inlay", f"Lid inlay, {size}, {style}", inlay, "face_down", "lid", "")
            if style != "name":
                web(f"dr2-inlay-{size}-{style}", inlay)
        for lay in d.INSERTS[size]:
            ins, label = d.insert(size, lay)
            emit(f"dr2-insert-{size}-{lay}", f"Insert, {size}: {label}", ins, "as_is", "insert", "")
            web(f"dr2-insert-{size}-{lay}", ins)
        print(size, f"{time.time() - t0:.0f}s", flush=True)
    for slug, fn in d.MOUNTS.items():
        m = fn()
        emit(f"dr2-mount-{slug}", f"Mount: {slug.replace('-', ' ')}", m, "face_down", "mount", "")
        web(f"dr2-mount-{slug}", m)
    for shape in d.CHARMS:
        body, inlay = d.bag_charm(shape, "MK", FONT)
        emit(f"dr2-charm-{shape}", f"Bag charm, {shape} (sample: MK)", body, "as_is", "add-on", "Initials inlaid on the bed side.")
        if inlay:
            emit(f"dr2-charm-{shape}-inlay", f"Bag charm inlay, {shape}", inlay, "as_is", "add-on", "")
    zp, zi = d.zip_pull("M", FONT)
    emit("dr2-zip-pull", "Zip pull (sample: M)", zp, "as_is", "add-on", "Not for children under 3: small part.")
    emit("dr2-zip-pull-inlay", "Zip pull inlay", zi, "as_is", "add-on", "")
    emit("dr2-phone-stand", "Phone stand", d.phone_stand(), "on_side", "add-on", "Prints on its side.")
    emit("dr2-spoke-bead", "Spoke bead (set of 12)", d.spoke_bead(), "as_is", "add-on", "Snaps onto 2 mm spokes. Small part.")
    emit("dr2-chair-hook", "Chair hook", d.chair_hook(), "as_is", "add-on", "Snaps onto 22–25 mm tubes.")
    emit("dr2-cable-winder", "Cable winder", d.cable_winder(), "as_is", "add-on", "")
    json.dump(report, open(os.path.join(OUT, "parts-report-dayrally2.json"), "w"), indent=2, ensure_ascii=False)
    bad = [r["slug"] for r in report if not r["watertight"] or not r["fits_250_cube"] or (r["bodies"] != 1 and "inlay" not in r["slug"])]
    print(len(report), "files;", "problems:", bad, f"{time.time() - t0:.0f}s")
