import os, sys, json, struct, base64
sys.path.insert(0, os.path.dirname(__file__))
import lib, dayrally as d
OUT = os.path.join(os.path.dirname(__file__), "..", "store", "model")
items = {"dr-pod-base": d.pod_base(), "dr-pod-lid": d.pod_lid()[0], "dr-insert-fish": d.pod_insert(3, 2), "dr-insert-everyday": d.pod_insert(3, 1),
         "dr-bar-saddle": d.bar_saddle(), "dr-strap-clip": d.strap_clip()}
for slug, man in items.items():
    tm = lib.to_trimesh(man.rotate([-90, 0, 0]))       # z-up -> y-up for the web viewer
    b = tm.export(file_type="glb")
    magic, ver, length = struct.unpack('<III', b[:12]); off = 12; js = None; binb = b''
    while off < length:
        clen, ctype = struct.unpack('<II', b[off:off + 8]); chunk = b[off + 8:off + 8 + clen]
        if ctype == 0x4E4F534A: js = json.loads(chunk)
        elif ctype == 0x004E4942: binb = chunk
        off += 8 + clen
    js['buffers'][0]['uri'] = 'data:application/octet-stream;base64,' + base64.b64encode(binb).decode(); js['buffers'][0]['byteLength'] = len(binb)
    open(os.path.join(OUT, slug + ".json"), "w").write(json.dumps(js, separators=(',', ':')))
    print(slug, round(os.path.getsize(os.path.join(OUT, slug + ".json")) / 1024), "KB")
