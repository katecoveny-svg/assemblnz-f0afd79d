"""Explicit download step, separate from the offline inference worker."""
import json
from pathlib import Path
import argparse
from huggingface_hub import snapshot_download
catalogue = json.loads((Path(__file__).resolve().parents[2] / "lib/voice/assembl/catalogue.json").read_text())
parser = argparse.ArgumentParser()
parser.add_argument("--output", required=True)
args = parser.parse_args()
destination = Path(args.output).resolve()
snapshot_download(repo_id=catalogue["model"], revision=catalogue["revision"], local_dir=str(destination))
(destination / "assembl-model.json").write_text(json.dumps({"model": catalogue["model"], "revision": catalogue["revision"]}))
print("Provisioned pinned voice model at", destination)
