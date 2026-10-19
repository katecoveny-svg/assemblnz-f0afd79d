"""Read back exported STEP files and check every solid pair in each supplied assembly.
Contact is not interference. Clearance tests are not mechanical qualification.
"""
from common import *
from itertools import combinations
from functools import lru_cache

def records():
    groups=[]
    for path in sorted((ROOT/'validation').glob('*.json')):
        data=json.loads(path.read_text())
        if isinstance(data,dict) and isinstance(data.get('parts'),list) and isinstance(data.get('assemblies'),list):
            groups.append(data)
    return {r['id']:r for g in groups for r in g.get('parts',[])},[a for g in groups for a in g.get('assemblies',[])]

def main():
    parts,assemblies=records()
    @lru_cache(None)
    def load(pid):
        rec=parts[pid];sh=cq.importers.importStep(str(ROOT/rec['step'])).val()
        sh=sh.translate(tuple(-v for v in rec['print_translation_mm']))
        for ax,deg in reversed(list(zip(((1,0,0),(0,1,0),(0,0,1)),rec['print_rotation_xyz_deg']))):
            if deg:sh=sh.rotate((0,0,0),ax,-deg)
        return sh
    result=[]
    for a in assemblies:
        items=[(c['instance'],place(load(c['part_id']),c['rotation_xyz_deg'],c['translation_mm'])) for c in a['components']]
        faults=[];count=0
        for (an,sa),(bn,sb) in combinations(items,2):
            ba,bb=sa.BoundingBox(),sb.BoundingBox()
            if any(min(getattr(ba,k+'max'),getattr(bb,k+'max'))-max(getattr(ba,k+'min'),getattr(bb,k+'min'))<1e-5 for k in 'xyz'):continue
            count+=1
            try:
                vol=sa.intersect(sb).Volume()
                if vol>.005:faults.append({'a':an,'b':bn,'volume_mm3':round(vol,5)})
            except Exception as e:faults.append({'a':an,'b':bn,'error':str(e)})
        rec={'assembly':a['id'],'pairs_with_bbox_overlap':count,'intersections':faults,'passed':len(faults)==0}
        result.append(rec);print(json.dumps(rec),flush=True)
    (ROOT/'validation/assembly-intersections.json').write_text(json.dumps(result,indent=2))
if __name__=='__main__':main()
