"""Mechanical repair of verified legacy DO colour references. No task/auth edits.
The original files must match their inspected blob IDs before changing them.
"""
from pathlib import Path
import subprocess,re
expected={'app/do/DoCanvas.tsx':'004dbafa9eb61b6111e6c7a9e14e3efbb5f672f0','app/do/DoAppearance.tsx':'5be6110964d7d531c4adbfbd6f9f60593b22b137','app/do/do-canvas.css':'605c5a097508145a6537074e78643077f568bb9d'}
for path,sha in expected.items():
 actual=subprocess.check_output(['git','hash-object',path],text=True).strip()
 if actual!=sha:raise RuntimeError(f'{path} changed since inspection; reconcile rather than overwrite')
def replace_once(text,old,new):
 if text.count(old)!=1:raise RuntimeError('Expected exact source fragment changed: '+old[:80])
 return text.replace(old,new,1)
p=Path('app/do/DoCanvas.tsx');s=p.read_text()
s=replace_once(s,'{ plum: "#d5a6e8", violet: "#aaa5ff", copper: "#e3ad91" }','{ plum: "#916A70", violet: "#654A4E", copper: "#F5F1F2" }')
s=replace_once(s,'src="/do/canvas/dimensional-d.png"','src="/do/canvas/identity-plum.svg"')
s=replace_once(s,'alt="Dimensional purple D and glowing dot"','alt="DO symbol in deep plum, paper and rose"')
s=replace_once(s,'src="/do/canvas/pet-do-purple.png"','src="/do/canvas/pet-do-plum.svg"')
s=replace_once(s,'                      {c}','                      {{ plum: "rose", violet: "plum", copper: "chalk" }[c]}')
p.write_text(s)
p=Path('app/do/DoAppearance.tsx');s=p.read_text()
s=replace_once(s,'const colours = { plum: "#916A70", violet: "#654A4E", copper: "#C4A494" };','// Retain saved colour keys, but render only the current brand palette.\n  const colours = { plum: "#916A70", violet: "#654A4E", copper: "#F5F1F2" };')
s=replace_once(s,'<legend>Colour</legend>','<legend>Accent</legend>')
s=replace_once(s,'              {c}','              {{ plum: "rose", violet: "plum", copper: "chalk" }[c]}')
p.write_text(s)
# Only colours found in the inspected DO stylesheet. Preserve all alpha values.
mapping={
'1e0e23':'240B21','faf4fa':'FFFDFB','ccb9cf':'F5F1F2','674770':'654A4E','f6edf7':'FFFDFB','fff8ff':'FFFDFB','25152b':'240B21','fff7ff':'FFFDFB','d6c2dd':'F5F1F2','9969ad':'916A70','35213f':'3B2035','c79ae2':'D6A5BD','ceb7d5':'F5F1F2','50365c':'654A4E','ab8ab5':'D6A5BD','765083':'916A70','302037':'3B2035','a977be':'916A70','faf6fa':'FFFDFB','321a3b':'240B21','decede':'E5D9DF','7b6085':'654A4E','7a6383':'654A4E','d3bddb':'D6A5BD','ddcfe3':'E5D9DF','43234e':'240B21','42204e':'240B21','42284e':'3B2035','79518b':'916A70','402051':'240B21','ddb4fc':'FFFDFB','b571ff':'916A70','aa62dc':'916A70','d6a0ff':'D6A5BD','24122e':'240B21','9869b0':'916A70','eee1f5':'FFFDFB','c896ea':'D6A5BD','d4bfdb':'F5F1F2','f7f2f7':'F5F1F2','f9efff':'FFFDFB','301539':'240B21','210f24':'240B21','694061':'654A4E','532c4d':'654A4E','b57fba':'916A70','805274':'654A4E','d6a0c4':'D6A5BD'}
p=Path('app/do/do-canvas.css');s=p.read_text()
s=re.sub(r'#([0-9a-fA-F]{6})([0-9a-fA-F]{2})?\b',lambda m:'#'+mapping.get(m[1].lower(),m[1])+(m[2] or ''),s)
# An authored plum mark must not be screened into a pale pink silhouette.
s=s.replace('mix-blend-mode: screen;','mix-blend-mode: normal;')
p.write_text(s)
Path('public/do/canvas/pet-do-plum.svg').write_text('''<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 80 80"><rect width="80" height="80" rx="22" fill="#240B21"/><g transform="translate(8 8)"><path d="M17 19Q27 7 39 19L47 30H57Q61 35 56 39H36L30 53H15Q10 38 17 19Z" fill="#F5F1F2"/><path d="M20 19Q9 17 9 35Q10 51 20 44L26 24" fill="#916A70"/><circle cx="37" cy="26" r="2.5" fill="#240B21"/><circle cx="57" cy="33" r="3" fill="#240B21"/></g></svg>''')
print('Repaired DO canvas assets, accents and stylesheet. Stored appearance keys and behaviours unchanged.')
