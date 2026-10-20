"""Check rendered prop placement against pod, insert and other props.

Digital interference check only; not physical fit, closed-lid or performance proof.
Run from any directory with numpy, trimesh and manifold3d installed.
"""
import json
import math
from pathlib import Path
import numpy as np
import trimesh

ROOT = Path(__file__).resolve().parents[3]
SCENES = json.loads((Path(__file__).parent / 'scenes.json').read_text())


def mesh(part):
    path = ROOT / part['file'].lstrip('/')
    if not path.exists():
        path = ROOT / 'public/living/cad/v0.3' / path.name
    result = trimesh.load(path)
    low, high = result.bounds
    result.apply_translation([-(low[0] + high[0]) / 2, -(low[1] + high[1]) / 2, -low[2]])
    if part.get('flip'):
        result.apply_transform(trimesh.transformations.rotation_matrix(math.pi, [1, 0, 0]))
        result.apply_translation([0, 0, high[2] - low[2]])
    if part.get('rot'):
        result.apply_transform(trimesh.transformations.rotation_matrix(part['rot'], [0, 0, 1]))
    result.apply_translation([part['x'], part['y'], part.get('z', 0)])
    return result


def check():
    failures = []
    count = 0
    for name, scene in SCENES.items():
        if not name.startswith('pods-'):
            continue
        props = [(p, mesh(p)) for p in scene['parts'] if '/props/' in p['file']]
        solids = [(p, mesh(p)) for p in scene['parts'] if '/props/' not in p['file'] and 'dr2-lid-' not in p['file']]
        for i, (part, prop) in enumerate(props):
            for other, solid in solids + props[:i]:
                # Render-only key props can contain intersecting component shells;
                # manifold resolves their volume for the boolean operation.
                volume = abs(trimesh.boolean.intersection([prop, solid], engine='manifold', check_volume=False).volume)
                count += 1
                if not np.isfinite(volume) or volume > 0.01:
                    failures.append(f'{name}: {Path(part["file"]).stem} / {Path(other["file"]).stem}: {volume:.3f} mm3')
    if failures:
        raise SystemExit('\n'.join(failures))
    print(f'PASS: {count} prop/pod, prop/insert and prop/prop checks; no overlap above 0.01 mm3. Not physical validation.')


if __name__ == '__main__':
    check()
