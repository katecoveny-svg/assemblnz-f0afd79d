# Local ML tooling

## SAM 3D Objects (Meta)

Cloned at `tools/sam-3d-objects` from
[facebookresearch/sam-3d-objects](https://github.com/facebookresearch/sam-3d-objects).

**What it does:** reconstructs textured 3D geometry (Gaussian splat / mesh) from a
single 2D photo — the right path for real product/hero 3D, not cartoon R3F.

### Hard requirements (from Meta's setup docs)

- Linux x86_64
- **NVIDIA GPU with ≥ 32 GB VRAM**
- Hugging Face access to [`facebook/sam-3d-objects`](https://huggingface.co/facebook/sam-3d-objects)
  (request + `hf auth login`)
- `mamba` / conda env from `environments/default.yml`

This Cursor Cloud VM has **no NVIDIA GPU** and no HF token, so checkpoints and
inference cannot run here. The clone is kept on disk (gitignored) so a GPU
machine can pick it up.

### On a GPU box

```bash
cd tools/sam-3d-objects
# follow doc/setup.md — mamba env, pip install, then:
hf auth login
hf download --repo-type model --local-dir checkpoints/hf-download --max-workers 1 facebook/sam-3d-objects
mv checkpoints/hf-download/checkpoints checkpoints/hf

python demo.py
# or notebook/demo_single_object.ipynb
# Export splat.ply / mesh → drop into public/brand/<slug>/heroes/
```

### Assembl integration path

1. Photograph (or upload) a brand still.
2. Run SAM 3D Objects → `splat.ply` / GLB.
3. Place under `public/brand/<slug>/heroes/`.
4. Point `BrandConfig.photography.anchor` (and optional gallery) at the still;
   wire a splat/GLB viewer in `OsEditorialHero` when assets land.

Until then, OS headers use **editorial photography + HT-style line-art patterns**,
not cartoon Three.js silhouettes.
