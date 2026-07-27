#!/usr/bin/env python3
"""
Turn a scanned car into the two things a demo page needs: a web-sized 3D asset
and a still for the marque campaign cards.

    python3 car-asset.py lambo.glb  --name lambo  --out ../assembling-giltrap
    python3 car-asset.py lambo.ply  --name lambo  --out ../assembling-giltrap

Handles both kinds of scan we get:

  .glb   a textured mesh   -> <name>.bin + <name>-tex.jpg
  .ply   a Gaussian splat  -> <name>.bin  (a lit point cloud)

Neither needs GLTFLoader or a splat renderer on the page. The .bin formats are
the ones index.html already reads, so a new marque is a file drop plus one line
in the CI table.

Why a point cloud for splats: a splat's colour is a spherical-harmonic DC term
with no normal — the nx/ny/nz fields in the file are all zero. The normal has
to be derived from each splat's own shape (its shortest axis, rotated by its
quaternion), and once you have that you can bake the studio lighting straight
into vertex colour. One draw call, no lights needed on the page.
"""

import argparse, json, struct, sys, io as _io
from pathlib import Path

import numpy as np


ORIENT = 'xyz'
AS_POINTS = False
POINT_BUDGET = 40000


def orient(p, spec):
    """Permute/flip axes, e.g. 'zyx' or 'x-zy'. Scanners disagree about up."""
    axes, out = {'x': 0, 'y': 1, 'z': 2}, []
    i = 0
    while i < len(spec):
        sign = 1.0
        if spec[i] == '-':
            sign, i = -1.0, i + 1
        out.append(sign * p[:, axes[spec[i]]])
        i += 1
    if len(out) != 3:
        raise SystemExit(f'--orient needs three axes, got {spec!r}')
    return np.stack(out, axis=1)


# ── mesh (.glb) ───────────────────────────────────────────────────────────────

# glTF accessor component types we care about, as numpy dtypes
CTYPE = {5120: np.int8, 5121: np.uint8, 5122: np.int16,
         5123: np.uint16, 5125: np.uint32, 5126: np.float32}
NCOMP = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}


def read_glb(path: Path):
    buf = path.read_bytes()
    magic, _ver, _len = struct.unpack_from('<4sII', buf, 0)
    if magic != b'glTF':
        raise SystemExit(f'{path.name} is not a binary glTF')
    gltf, bin_chunk, off = None, None, 12
    while off < len(buf):
        clen, ctype = struct.unpack_from('<II', buf, off)
        data = buf[off + 8: off + 8 + clen]
        if ctype == 0x4E4F534A:                       # 'JSON'
            gltf = json.loads(data.decode('utf-8'))
        elif ctype == 0x004E4942:                     # 'BIN\0'
            bin_chunk = data
        off += 8 + clen + ((4 - clen % 4) % 4)
    if gltf is None or bin_chunk is None:
        raise SystemExit('glb is missing its JSON or BIN chunk')
    return gltf, bin_chunk


def accessor(gltf, blob, idx):
    """Read one accessor out, honouring byteStride."""
    acc = gltf['accessors'][idx]
    n, ncomp = acc['count'], NCOMP[acc['type']]
    dt = np.dtype(CTYPE[acc['componentType']])
    bv = gltf['bufferViews'][acc['bufferView']]
    base = bv.get('byteOffset', 0) + acc.get('byteOffset', 0)
    stride = bv.get('byteStride') or (dt.itemsize * ncomp)
    if stride == dt.itemsize * ncomp:
        return np.frombuffer(blob, dtype=dt, count=n * ncomp, offset=base).reshape(n, ncomp)
    # interleaved: walk it
    out = np.empty((n, ncomp), dtype=dt)
    for i in range(n):
        out[i] = np.frombuffer(blob, dtype=dt, count=ncomp, offset=base + i * stride)
    return out


def biggest_primitive(gltf):
    """The car, not the ground plane or a stray marker — take the most triangles."""
    best, best_n = None, -1
    for mesh in gltf.get('meshes', []):
        for prim in mesh.get('primitives', []):
            if 'POSITION' not in prim.get('attributes', {}):
                continue
            n = gltf['accessors'][prim['indices']]['count'] if 'indices' in prim \
                else gltf['accessors'][prim['attributes']['POSITION']]['count']
            if n > best_n:
                best, best_n = prim, n
    if best is None:
        raise SystemExit('no drawable primitive in this glb')
    return best


def glb_to_bin(src: Path, name: str, out: Path):
    gltf, blob = read_glb(src)
    prim = biggest_primitive(gltf)
    pos = accessor(gltf, blob, prim['attributes']['POSITION']).astype(np.float64)
    if 'TEXCOORD_0' in prim['attributes']:
        uv = accessor(gltf, blob, prim['attributes']['TEXCOORD_0']).astype(np.float64)
    else:
        uv = np.zeros((len(pos), 2))
    idx = (accessor(gltf, blob, prim['indices']).astype(np.uint32).ravel()
           if 'indices' in prim else np.arange(len(pos), dtype=np.uint32))

    # Move it to the origin so every marque lands in the same place. Axes are
    # left exactly as the scanner gave them — see --orient below; the page
    # turns the car with its own rotation, so nothing is guessed here.
    pos = orient(pos, ORIENT)
    pos -= pos.min(axis=0)
    lo, rg = pos.min(axis=0), np.maximum(pos.max(axis=0) - pos.min(axis=0), 1e-9)
    # texture, if the scan carries one
    tex = None
    mat = gltf.get('materials', [{}])[prim.get('material', 0)] if gltf.get('materials') else {}
    ti = mat.get('pbrMetallicRoughness', {}).get('baseColorTexture', {}).get('index')
    if ti is not None:
        img = gltf['images'][gltf['textures'][ti]['source']]
        if 'bufferView' in img:
            bv = gltf['bufferViews'][img['bufferView']]
            o = bv.get('byteOffset', 0)
            tex = blob[o: o + bv['byteLength']]
    size = [round(float(v), 3) for v in rg]

    if AS_POINTS:
        # Every car on the page is a point cloud, so a mesh scan gets sampled
        # across its own surface rather than dithered afterwards from a picture
        # of itself. Dithering a render gives a density that depends on how
        # light the car is — a white SUV came out solid while a black estate
        # came out sparse. Sampling the geometry is colour-blind.
        n_pts = sample_mesh_to_points(pos, uv, idx, tex, name, out, lo, rg)
        print(f'  {name}.bin      {n_pts:,} points sampled from '
              f'{len(idx)//3:,} tris · bbox {size}')
        return size

    q = np.clip(((pos - lo) / rg) * 2 - 1, -1, 1)
    q = np.round(q * 32767).astype(np.int16)
    u = np.round(np.clip(uv, 0, 1) * 65535).astype(np.uint16)
    (out / f'{name}.bin').write_bytes(
        struct.pack('<II', len(pos), len(idx)) + struct.pack('<6f', *lo, *rg)
        + q.tobytes() + u.tobytes() + idx.astype(np.uint32).tobytes())

    if tex:
        from PIL import Image
        im = Image.open(_io.BytesIO(tex)).convert('RGB')
        im.thumbnail((2048, 2048), Image.LANCZOS)
        im.save(out / f'{name}-tex.jpg', quality=86, optimize=True)
        print(f'  {name}-tex.jpg  {(out / f"{name}-tex.jpg").stat().st_size//1024} KB')
    print(f'  {name}.bin      {len(pos):,} verts · {len(idx)//3:,} tris · bbox {size}')
    return size


def sample_mesh_to_points(pos, uv, idx, tex, name, out, lo, rg):
    """Scatter points over the mesh, weighted by triangle area, coloured from
    the texture and shaded by each triangle's own normal."""
    tri = idx.reshape(-1, 3)
    A, B, C = pos[tri[:, 0]], pos[tri[:, 1]], pos[tri[:, 2]]
    cross = np.cross(B - A, C - A)
    area = 0.5 * np.linalg.norm(cross, axis=1)
    total = area.sum()
    if total <= 0:
        raise SystemExit('mesh has no surface area to sample')

    rng = np.random.default_rng(7)                      # reruns match
    # Proportional allocation, then top up by area so the count is exact and
    # no large panel is left bare by rounding.
    exact = area / total * POINT_BUDGET
    per = np.floor(exact).astype(np.int64)
    short = POINT_BUDGET - per.sum()
    if short > 0:
        per[np.argsort(-(exact - per))[:short]] += 1
    t = np.repeat(np.arange(len(tri)), per)

    r1, r2 = rng.random(len(t)), rng.random(len(t))
    s = np.sqrt(r1)
    w = np.stack([1 - s, s * (1 - r2), s * r2], axis=1)[:, :, None]
    P = (w * np.stack([A[t], B[t], C[t]], axis=1)).sum(axis=1)
    UV = (w * np.stack([uv[tri[t, 0]], uv[tri[t, 1]], uv[tri[t, 2]]], axis=1)).sum(axis=1)

    if tex is not None:
        from PIL import Image
        img = np.asarray(Image.open(_io.BytesIO(tex)).convert('RGB'), dtype=np.float64) / 255
        h, wd = img.shape[:2]
        # glTF UV origin is top-left, which is why the page sets flipY=false
        px = np.clip((UV[:, 0] * (wd - 1)).astype(np.int64), 0, wd - 1)
        py = np.clip((UV[:, 1] * (h - 1)).astype(np.int64), 0, h - 1)
        rgb = img[py, px]
    else:
        rgb = np.full((len(P), 3), 0.62)

    nrm = cross[t] / np.maximum(np.linalg.norm(cross[t], axis=1, keepdims=True), 1e-9)
    lights = [((0.10, 0.96, 0.26), (1.00, 0.97, 0.90), 1.05),
              ((-0.80, 0.24, 0.55), (1.00, 0.90, 0.76), 0.66),
              ((0.82, 0.20, -0.34), (0.88, 0.93, 1.00), 0.44)]
    shade = np.full_like(rgb, 0.22)
    for d, c, p in lights:
        d = np.array(d) / np.linalg.norm(d)
        shade += np.abs(nrm @ d)[:, None] * np.array(c) * p
    rgb = np.clip(rgb * shade * np.array([1.00, 0.93, 0.78]), 0, 1)

    q16 = np.round(np.clip(((P - lo) / rg) * 2 - 1, -1, 1) * 32767).astype(np.int16)
    col = np.round(rgb * 255).astype(np.uint8)
    (out / f'{name}.bin').write_bytes(
        struct.pack('<I', len(P)) + struct.pack('<6f', *lo, *rg)
        + q16.tobytes() + col.tobytes())
    return len(P)


# ── Gaussian splat (.ply) ─────────────────────────────────────────────────────

def read_ply(path: Path):
    raw = path.read_bytes()
    end = raw.find(b'end_header\n') + len(b'end_header\n')
    header = raw[:end].decode('ascii', 'replace')
    if 'binary_little_endian' not in header:
        raise SystemExit('only binary_little_endian PLY is supported')
    PLY = {'float': 'f4', 'float32': 'f4', 'double': 'f8', 'uchar': 'u1',
           'uint8': 'u1', 'char': 'i1', 'int': 'i4', 'uint': 'u4',
           'short': 'i2', 'ushort': 'u2'}
    n, fields = 0, []
    for line in header.splitlines():
        p = line.split()
        if len(p) >= 3 and p[0] == 'element' and p[1] == 'vertex':
            n = int(p[2])
        elif len(p) >= 3 and p[0] == 'property' and p[1] != 'list':
            fields.append((p[2], PLY[p[1]]))
    arr = np.frombuffer(raw, dtype=np.dtype(fields), count=n, offset=end)
    return arr, [f for f, _ in fields]


def ply_to_bin(src: Path, name: str, out: Path, keep: int):
    arr, fields = read_ply(src)
    xyz = np.stack([arr['x'], arr['y'], arr['z']], axis=1).astype(np.float64)

    # colour: SH DC term if this is a splat, plain rgb if it is a normal cloud
    if 'f_dc_0' in fields:
        C0 = 0.28209479177387814
        rgb = np.stack([arr[f'f_dc_{i}'] for i in range(3)], axis=1) * C0 + 0.5
    elif 'red' in fields:
        rgb = np.stack([arr['red'], arr['green'], arr['blue']], axis=1) / 255.0
    else:
        rgb = np.full((len(xyz), 3), 0.6)
    rgb = np.clip(rgb, 0, 1)

    # drop the near-transparent splats — they are the haze around the car
    if 'opacity' in fields:
        # tanh form rather than 1/(1+exp(-x)): opacity runs to about -30 in a
        # real scan, exp() of that overflows, and numpy then reports the flag
        # against whatever ufunc runs next — which sent me hunting a matmul bug
        # that was never there.
        keepmask = 0.5 * (1 + np.tanh(arr['opacity'].astype(np.float64) / 2)) > 0.35
        xyz, rgb, arr = xyz[keepmask], rgb[keepmask], arr[keepmask]

    # A splat has no normal. Its shortest axis is the flat direction, which is
    # the surface normal once rotated into world space by its own quaternion.
    if 'scale_0' in fields and 'rot_0' in fields:
        sc = np.stack([np.exp(arr[f'scale_{i}'].astype(np.float64)) for i in range(3)], axis=1)
        q = np.stack([arr[f'rot_{i}'].astype(np.float64) for i in range(4)], axis=1)
        q /= np.maximum(np.linalg.norm(q, axis=1, keepdims=True), 1e-9)
        w, x, y, z = q[:, 0], q[:, 1], q[:, 2], q[:, 3]
        R = np.stack([
            np.stack([1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y)], 1),
            np.stack([2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x)], 1),
            np.stack([2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y)], 1),
        ], axis=1)
        nrm = R[np.arange(len(R)), :, np.argmin(sc, axis=1)]
        # Cheap insurance: a scan can carry a dead splat with a zero or absurd
        # quaternion. Point those up rather than dropping them — single pixels.
        bad = ~np.isfinite(nrm).all(axis=1)
        nrm[bad] = (0.0, 1.0, 0.0)
        nrm /= np.maximum(np.linalg.norm(nrm, axis=1, keepdims=True), 1e-9)
        nrm[~np.isfinite(nrm).all(axis=1)] = (0.0, 1.0, 0.0)

        # Bake the same softbox the page uses, so a still and the live scene
        # agree. Normals from splats have no consistent winding, so light both
        # faces — abs() rather than max(0, ·).
        lights = [((0.10, 0.96, 0.26), (1.00, 0.97, 0.90), 1.05),   # top
                  ((-0.80, 0.24, 0.55), (1.00, 0.90, 0.76), 0.66),  # warm left
                  ((0.82, 0.20, -0.34), (0.88, 0.93, 1.00), 0.44)]  # cool right
        shade = np.full_like(rgb, 0.22)
        for d, c, p in lights:
            d = np.array(d) / np.linalg.norm(d)
            shade += np.abs(nrm @ d)[:, None] * np.array(c) * p
        # Champagne is assembl's mark and the scans are graded to it, so the
        # bake carries the tint rather than leaving a scan bare white.
        rgb = np.clip((0.20 + 0.80 * rgb) * shade * np.array([1.00, 0.93, 0.78]), 0, 1)

    xyz = orient(xyz, ORIENT)
    if keep and len(xyz) > keep:                       # thin evenly, keep shape
        step = len(xyz) / keep
        sel = (np.arange(keep) * step).astype(np.int64)
        xyz, rgb = xyz[sel], rgb[sel]

    xyz -= xyz.min(axis=0)
    lo, rg = xyz.min(axis=0), np.maximum(xyz.max(axis=0) - xyz.min(axis=0), 1e-9)
    q16 = np.round(np.clip(((xyz - lo) / rg) * 2 - 1, -1, 1) * 32767).astype(np.int16)
    col = np.round(rgb * 255).astype(np.uint8)

    (out / f'{name}.bin').write_bytes(
        struct.pack('<I', len(xyz)) + struct.pack('<6f', *lo, *rg)
        + q16.tobytes() + col.tobytes())
    size = [round(float(v), 3) for v in rg]
    print(f'  {name}.bin      {len(xyz):,} points · bbox {size}')
    return size


# ── main ──────────────────────────────────────────────────────────────────────

def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('src', type=Path, help='a .glb mesh or a .ply Gaussian splat')
    ap.add_argument('--name', required=True, help="asset stem, e.g. 'lambo'")
    ap.add_argument('--out', type=Path, default=Path('.'), help='demo directory')
    ap.add_argument('--points', type=int, default=45000,
                    help='max points to keep from a splat (default 45000)')
    ap.add_argument('--orient', default='xyz',
                    help="axis order, e.g. 'zyx' or 'x-zy' (default: leave alone)")
    ap.add_argument('--as-points', action='store_true',
                    help='sample a .glb mesh into a point cloud (matches the splats)')
    a = ap.parse_args()
    globals()['ORIENT'] = a.orient
    globals()['AS_POINTS'] = a.as_points
    globals()['POINT_BUDGET'] = a.points
    if not a.src.exists():
        raise SystemExit(f'no such file: {a.src}')
    a.out.mkdir(parents=True, exist_ok=True)

    print(f'{a.src.name} -> {a.out}/')
    ext = a.src.suffix.lower()
    if ext == '.glb':
        size = glb_to_bin(a.src, a.name, a.out)
        kind = 'points' if a.as_points else 'mesh'
    elif ext == '.ply':
        size = ply_to_bin(a.src, a.name, a.out, a.points)
        kind = 'points'
    else:
        raise SystemExit(f'unsupported: {ext} — give me a .glb or a .ply')

    # Proportions are the only honest way to tell what you have been sent. A
    # 356 is tall and short; a supercar is long and very low. Say what the
    # numbers are and let a person name the car.
    L = max(size) or 1
    long_axis = 'xyz'[size.index(max(size))]
    print(f'\n  proportions  1 : {min(size)/L:.3f} : {sorted(size)[1]/L:.3f}  '
          f'(longest : shortest : middle, normalised)')
    print(f'  longest axis {long_axis}   loaded as {kind}')
    print('  a saloon sits near 1 : 0.29 : 0.41 · a 356 near 1 : 0.35 : 0.42 ·')
    print('  a supercar is lower again, nearer 1 : 0.25 : 0.45')
    print(f'\nNext: render a still with car-still.sh, then add')
    print(f"  scan:'{a.name}-side.png'   to the marque's row in the CI table.")


if __name__ == '__main__':
    main()
