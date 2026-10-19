"""Derive the slim AC-02 manifest the web app bundles (lib/living/ac02-manifest.json).

Keeps only what the widget needs: part identity, mass (from solid volume and a
candidate density), hashes, print envelope and the assembled views with their
component instances and designed colours. Run from the repo root:

    python3 -I tools/living-cad/ac02/slim.py
"""
import json, pathlib
root = pathlib.Path(__file__).resolve().parents[3]
src = json.load(open(root / 'tools/living-cad/ac02/manifest.json'))
cat = {p['id']: p for p in json.load(open(root / 'tools/living-cad/ac02/storefront-catalogue.json'))['products']}
DENSITY = {'PLA': 1.24, 'PETG': 1.27, 'TPU': 1.21}
def density(material):
    for k, v in DENSITY.items():
        if k in material.upper(): return v
    return 1.24
parts = []
for p in src['parts']:
    vol_cm3 = p['solid_volume_mm3'] / 1000.0
    parts.append({
        'id': p['id'], 'group': p['group'], 'description': p['description'], 'revision': p['revision'], 'release': p['release'],
        'material': p['material_candidate'], 'bboxMm': p['print_bbox_mm'], 'volumeCm3': round(vol_cm3, 2),
        'massG': round(vol_cm3 * density(p['material_candidate']), 1), 'watertight': bool(p['mesh_watertight']) and bool(p['stl_file_readback_watertight']),
        'stlSha256': p['stl_sha256'], 'stepSha256': p['step_sha256'], 'notes': p['notes'],
    })
assemblies = []
for a in src['assemblies']:
    c = cat.get(a['id'], {})
    assemblies.append({
        'id': a['id'], 'name': c.get('name', a['description']), 'brand': c.get('brand', 'living'), 'description': a['description'], 'notes': a['notes'],
        'revision': a['revision'], 'release': a['release'], 'approvedForManufacture': bool(a['approved_for_manufacture']),
        'boundsMm': [round(hi - lo, 1) for lo, hi in zip(a['bounds_mm'][0], a['bounds_mm'][1])] if isinstance(a['bounds_mm'][0], list) else a['bounds_mm'], 'glb': f"/living/cad/ac02/{a['id']}.glb", 'preview': f"/living/cad/ac02/previews/{a['id']}.webp",
        'components': [{'partId': x['part_id'], 'instance': x['instance'], 'colour': x['colour']} for x in a['components']],
    })
out = {'schema': 'assembl.living.ac02-slim/1', 'revision': src['revision'], 'release': src['release'], 'approvedForManufacture': bool(src['approved_for_manufacture']),
       'interfaces': src['interfaces'], 'labels': src['labels'], 'summary': src['summary'], 'parts': parts, 'assemblies': assemblies}
dst = root / 'lib/living/ac02-manifest.json'
dst.write_text(json.dumps(out, indent=1, ensure_ascii=False) + '\n')
print(dst, dst.stat().st_size, 'bytes;', len(parts), 'parts;', len(assemblies), 'assemblies')
