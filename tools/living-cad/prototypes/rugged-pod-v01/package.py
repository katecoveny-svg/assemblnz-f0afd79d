"""Package exports and required source in the same relative layout; no secrets."""
from pathlib import Path
import hashlib,json,zipfile
ROOT=Path(__file__).resolve().parent
REPO=ROOT.parents[3]
files=[p for p in ROOT.rglob('*') if p.is_file() and '__pycache__' not in p.parts and p.suffix!='.zip' and p.name!='.gitignore']
files+=list((ROOT.parents[1]/'cad').glob('*.py'))
manifest={str(p.relative_to(REPO)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(files)}
with zipfile.ZipFile(ROOT/'dayrally-rugged-pod-v01.zip','w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for p in sorted(files): z.write(p,str(p.relative_to(REPO)))
    z.writestr('START-HERE.txt','Dayrally RP01, untested physical prototypes.\nOpen tools/living-cad/prototypes/rugged-pod-v01/README.md\nSTLs and STEP files are in that folder under generated/.\nAll units millimetres. Read PHYSICAL-TESTS.md before printing/use.\n')
    z.writestr('SHA256.json',json.dumps(manifest,indent=2)+'\n')
print(ROOT/'dayrally-rugged-pod-v01.zip')
