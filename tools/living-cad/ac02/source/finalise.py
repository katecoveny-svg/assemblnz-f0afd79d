from common import *
from collections import Counter
import html, base64, sys

def main():
    groups=[]
    for path in sorted((ROOT/'validation').glob('*.json')):
        data=json.loads(path.read_text())
        if isinstance(data,dict) and isinstance(data.get('parts'),list) and isinstance(data.get('assemblies'),list):
            groups.append(data)
    parts=[p for g in groups for p in g['parts']];assemblies=[a for g in groups for a in g['assemblies']]
    faults=[]
    for p in parts:
        assert sha(ROOT/p['step'])==p['step_sha256']
        assert sha(ROOT/p['stl'])==p['stl_sha256']
        m=trimesh.load(ROOT/p['stl'],force='mesh')
        p['stl_file_readback_watertight']=bool(m.is_watertight);p['stl_file_readback_winding']=bool(m.is_winding_consistent)
        if not m.is_watertight or not m.is_winding_consistent:faults.append(p['id'])
    inter=json.loads((ROOT/'validation/assembly-intersections.json').read_text())
    summary={'distinct_parts':len(parts),'assembled_views':len(assemblies),'native_step_parts':len(parts),'stl_parts':len(parts),'all_step_readback_valid':all(p['step_readback_valid'] for p in parts),'stl_file_readback_failures':faults,'assembly_poses_without_intersection':sum(r['passed'] for r in inter),'assembly_poses_checked':len(inter),'unprinted':True,'load_tests_performed':False,'manufacturing_dispatch_performed':False}
    previous=json.loads((ROOT/'manifest.json').read_text()) if (ROOT/'manifest.json').exists() else {}
    origin=Path(os.environ.get('ASSEMBL_ORIGINAL_INPUT', str(ROOT.parent/'assembl-living-parts-v0.1.zip')))
    input_digest=sha(origin) if origin.is_file() else previous.get('source_input',{}).get('unchanged_input_sha256')
    assembly_readback=ROOT/'validation/assembly-step-readback.json'
    if assembly_readback.exists():
        evidence=json.loads(assembly_readback.read_text())
        summary['assembly_step_files_reopened']=len(evidence)
        summary['assembly_step_files_valid']=sum(x.get('step_file_reopened',False) and x.get('solid_count_matches',False) for x in evidence)
    manifest={'schema_version':1,'collection':'Assembl Living + Dayrally','revision':'AC-02','units':{'part_step':'mm','part_stl':'mm','assembly_glb':'m'},'release':'digital_prototype','approved_for_manufacture':False,'summary':summary,'parts':parts,'assemblies':assemblies,'interfaces':{'wall':'TURN-42-AC02-candidate','desk':'TR01-44mm-dual-rail','structural':'VAL01-research-only'},'source_input':{'filename':'assembl-living-parts-v0.1.zip','unchanged_input_sha256':input_digest},'labels':LABELS}
    (ROOT/'manifest.json').write_text(json.dumps(manifest,indent=2));(ROOT/'validation/file-readback.json').write_text(json.dumps(summary,indent=2))
    bom=[]
    for a in assemblies:
        qty=Counter(c['part_id'] for c in a['components']);bom.append({'assembly_id':a['id'],'view_only':a['id']=='dayrally-case-open','items':[{'part_id':pid,'quantity':n,'revision':'AC-02'} for pid,n in qty.items()]})
    (ROOT/'bill-of-materials.json').write_text(json.dumps(bom,indent=2))
    cat={'schema_version':1,'template_revision':'AC-02','live_store_modified':False,'products':[{'id':a['id'],'name':a['description'],'brand':'dayrally' if ('rally' in a['id']) else 'assembl living','preview_glb':a['glb'],'assembly_step':a['step'],'preview_image':f'previews/{a["id"]}.webp','manufacturing_approval':None,'shopify_variant_id':None,'supplier_product_id':None,'purchase_enabled':False,'configuration_hash_required':True,'labels_only_rebuild_fields':['name','pet_name','wall_label'],'physical_validation_required':True} for a in assemblies]}
    (ROOT/'storefront-catalogue.json').write_text(json.dumps(cat,indent=2))
    pmap={p['id']:p for p in parts}
    order=['desk-rail-set','wall-station','desk-edge-perch','vanity-organisers','orbit-planter','small-flatpack-shelf','tabletop-valet','outfit-valet-research','manual-rail-clock','pleat-shade-study','pet-walk-kit','dayrally-case-open','dayrally-case-closed','dayrally-mini-flow','dayrally-mini-drop','dayrally-mini-ridge','rally-rule-300mm','desk-rail-compact']
    am={a['id']:a for a in assemblies};cards=[]
    for aid in order:
        a=am[aid];qty=Counter(c['part_id'] for c in a['components']);img=base64.b64encode((ROOT/f'previews/{aid}.webp').read_bytes()).decode()
        rows=''.join(f'<tr><td>{html.escape(pid)}</td><td>{n}</td><td><a href="{pmap[pid]["step"]}" download>STEP</a> <a href="{pmap[pid]["stl"]}" download>STL</a></td></tr>' for pid,n in qty.items())
        cards.append(f'<article id="{aid}"><img src="data:image/webp;base64,{img}" alt="Actual CAD rendering of {html.escape(a["description"])}"/><div><p class="eyebrow">AC-02 / DIGITAL PROTOTYPE</p><h2>{html.escape(a["description"])}</h2><p>{html.escape(a["notes"])}</p><p class="links"><a href="{a["step"]}" download>assembled STEP ↗</a><a href="{a["glb"]}" download>3D GLB ↗</a></p><details><summary>Individual parts & quantities</summary><table><thead><tr><th>Part</th><th>Qty</th><th>Files</th></tr></thead><tbody>{rows}</tbody></table></details></div></article>')
    page='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Assembl CAD / AC-02</title><style>*{box-sizing:border-box}body{margin:0;background:#faf8f4;color:#492b3e;font-family:Arial,sans-serif}header{padding:40px 5%;border-bottom:1px solid #ded2d6}.eyebrow{font-size:10px;letter-spacing:.14em;color:#916a70}h1{font-size:clamp(36px,5vw,70px);line-height:1.02;letter-spacing:-.06em;font-weight:500;margin:18px 0}header p{max-width:780px;line-height:1.65}.counts{display:flex;gap:30px;margin:25px 0}.counts strong{font-size:32px;display:block}.counts small{font-size:12px}nav{display:flex;gap:20px;flex-wrap:wrap}a{color:#542b4b;text-underline-offset:4px}main{padding:30px 4%;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}article{background:white;border:1px solid #e6dbdf;border-radius:14px;overflow:hidden}article img{display:block;width:100%;aspect-ratio:1.36;object-fit:contain}article>div{padding:22px}h2{font-size:22px;line-height:1.15;letter-spacing:-.04em;font-weight:500}article p{font-size:12px;line-height:1.7;color:#725563}.links{display:flex;gap:14px}.links a{font-size:12px}details{border-top:1px solid #e6dbdf;padding-top:14px;margin-top:18px}summary{cursor:pointer;font-size:12px}table{font-size:10px;width:100%;border-collapse:collapse;margin-top:14px}td,th{padding:7px 3px;border-bottom:1px solid #e6dbdf;text-align:left;word-break:break-word}td a{display:inline-block;margin-right:6px}footer{padding:30px 5%;background:#492b3e;color:white;font-size:12px;line-height:1.8}@media(max-width:950px){main{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:620px){main{grid-template-columns:1fr}.counts{gap:18px}}</style></head><body><header><p class="eyebrow">ASSEMBL / LIVING + DAYRALLY</p><h1>useful objects.<br>actually modelled.</h1><p>The geometry you see here is the geometry in the supplied CAD files. Original interpretations of the brief, with native STEP solids, print-oriented STL files and editable Python source.</p><div class="counts"><div><strong>109</strong><small>part designs</small></div><div><strong>18</strong><small>assembled views</small></div><div><strong>0</strong><small>physical test prints</small></div></div><p><strong>Digital prototypes, not released products.</strong> Open and closed views may share the same parts. Extract the complete ZIP first so the download links below can find their files.</p><nav><a href="docs/assembly-and-manufacturing-guide.pdf">assembly & manufacturing guide</a><a href="README.md">read me</a><a href="manifest.json">file manifest</a><a href="#dayrally-mini-flow">mini bikes</a></nav></header><main>'''+''.join(cards)+'''</main><footer>No purchase or printer order is created here. Shelf loads, tip resistance, snap fits, cap retention, lamp heat and all other physical performance remain untested. Mini bikes are display miniatures, not rideable. No font files are included.</footer></body></html>'''
    (ROOT/'START_HERE.html').write_text(page)
    print(json.dumps(summary,indent=2))
if __name__=='__main__':main()
