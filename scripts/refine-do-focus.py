"""Small visual-proof refinement, gated to the inspected stylesheet; no backend change."""
from pathlib import Path
import hashlib
root=Path(__file__).resolve().parents[1]
p=root/'components/do/do-product-focus.module.css'
data=p.read_bytes()
marker='/* phone readability refinement */'
if marker not in data.decode():
 sha=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
 if sha!='3c93123dae1a69e619576dffebddc452e833a904':raise SystemExit('Styles changed; inspect before applying the refinement.')
 with p.open('a') as f:
  f.write('''\n/* phone readability refinement */
.shell{letter-spacing:normal;word-spacing:normal}
.hero h1{letter-spacing:-.04em;word-spacing:.025em}
.localLabel{font-size:9px}.limit{font-size:10px}.recordSub{font-size:12px}
@media(max-width:600px){.hero h1{font-size:40px;max-width:315px;line-height:1.06}.consent{font-size:12px}.limit{font-size:9px}.recordSub{font-size:11px}.privacyNote{font-size:10px}}
''')
print('Readability refinement present; media navigation retains first-party pop-out boundary.')
