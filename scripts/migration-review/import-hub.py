from pathlib import Path
import re,json,hashlib,argparse
parser=argparse.ArgumentParser(description='Initial archival import only. Do not overwrite an adapted review branch.')
parser.add_argument('source',type=Path,help='Authorised original checkout; read-only')
src=parser.parse_args().source.resolve()
out=Path.cwd()/ 'components/client-hub-migration/original'
roots=['app/hub/concept-studio.tsx']
seen=set(); inventory=[]; missing=[]
def resolve(p):
 for q in [p,p.with_suffix('.ts'),p.with_suffix('.tsx'),p.with_suffix('.css'),p/'index.ts',p/'index.tsx']:
  if q.is_file():return q
 return None
def copy(p):
 rel=p.relative_to(src)
 if rel in seen:return
 seen.add(rel);raw=p.read_bytes();text=raw.decode()
 if 'cloudflare:workers' in text or 'server-only' in text:
  raise Exception('Server runtime dependency requires adapter: '+str(rel))
 # Only copy app/lib implementation dependencies, never environment/runtime data.
 def imp(m):
  spec=m.group(2)
  if spec.startswith('@/'):
   dep=resolve(src/spec[2:])
   if dep is None:missing.append(spec);return m.group(0)
   copy(dep)
   return m.group(1)+'@/components/client-hub-migration/original/'+str(dep.relative_to(src)).removesuffix(dep.suffix)+m.group(3) if dep.suffix in ['.ts','.tsx'] else m.group(1)+'@/components/client-hub-migration/original/'+str(dep.relative_to(src))+m.group(3)
  if spec.startswith('.'):
   dep=resolve(p.parent/spec)
   if dep:copy(dep)
  return m.group(0)
 text=re.sub(r'((?:from\s*|import\s*)["\'])([^"\']+)(["\'])',imp,text)
 text=text.replace('from "zod"','from "zod/v3"').replace("from 'zod'","from 'zod/v3'")
 if re.search(r'\bfetch\s*\(',text):
  text='import { migrationFetch as fetch } from "@/lib/client-hub-migration/review-adapter";\n'+text if not text.startswith(('"use client";',"'use client';")) else text.replace(';',';\nimport { migrationFetch as fetch } from "@/lib/client-hub-migration/review-adapter";',1)
 # Keep navigation inside this isolated review rather than touching original workspace.
 text=text.replace('https://assembl-pursuit.katecoveny.chatgpt.site','http://127.0.0.1:3187')
 if rel==Path('app/hub/concept-studio.tsx'):
  text=text.replace('const studioPath=studioCompany?', 'const studioPath=studioCompany?')
  text=text.replace('`/studios/${studioCompany}/work`:localPreview?"/hub-preview":"/hub"','"/review/client-hub":localPreview?"/review/client-hub":"/review/client-hub"')
 dest=out/rel;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(text)
 inventory.append({'path':str(rel),'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)})
for r in roots:copy(src/r)
Path('docs/migration-review/source-inventory.json').write_text(json.dumps({'siteId':'appgprj_6aa356a9700081919f7959cc70c9f6d8','sourceCommit':'f9c752ed5d5107ebac9f675aa6d14bce116c01c1','productionReconciled':False,'files':inventory,'missing':missing},indent=2))
print(len(inventory),'source files copied; missing',missing)
# Preserve hashes of all five dirty files; originals remain untouched.
dirty=['app/api/campaigns/route.ts','app/hub/campaign-dashboard.tsx','app/hub/enterprise.css','lib/concept-experience.ts','lib/enterprise-plan.ts']
Path('docs/migration-review/dirty-source-hashes.json').write_text(json.dumps({n:hashlib.sha256((src/n).read_bytes()).hexdigest() for n in dirty},indent=2))
