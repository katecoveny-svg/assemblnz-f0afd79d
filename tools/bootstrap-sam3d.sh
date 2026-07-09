#!/usr/bin/env bash
# Bootstrap Meta SAM 3D Objects on a GPU machine.
# This Cursor Cloud VM has no NVIDIA GPU — run this where CUDA ≥ 32GB VRAM exists.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO="$ROOT/tools/sam-3d-objects"

if [[ ! -d "$REPO/.git" ]]; then
  mkdir -p "$ROOT/tools"
  git clone --depth 1 https://github.com/facebookresearch/sam-3d-objects.git "$REPO"
fi

echo "SAM 3D Objects is at: $REPO"
echo
echo "Next (requires NVIDIA ≥32GB VRAM + Hugging Face access):"
echo "  1. cd $REPO && follow doc/setup.md (mamba env + pip installs)"
echo "  2. hf auth login   # after requesting access to facebook/sam-3d-objects"
echo "  3. hf download --repo-type model --local-dir checkpoints/hf-download --max-workers 1 facebook/sam-3d-objects"
echo "  4. mv checkpoints/hf-download/checkpoints checkpoints/hf"
echo "  5. python demo.py  # or notebook/demo_single_object.ipynb"
echo "  6. Export splat.ply / GLB → public/brand/<slug>/heroes/"
echo
if command -v nvidia-smi >/dev/null 2>&1; then
  nvidia-smi --query-gpu=name,memory.total --format=csv,noheader || true
else
  echo "No nvidia-smi on this host — inference cannot run here."
fi
