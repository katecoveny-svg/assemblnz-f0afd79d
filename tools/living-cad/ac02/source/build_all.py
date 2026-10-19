"""Rebuild CAD into a NEW directory by default; no network or print-farm dispatch."""
import argparse,os,subprocess,sys
from pathlib import Path
p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--out',default='rebuilt-cad',help='New output directory, relative to the current working directory')
p.add_argument('--name',default='JACK');p.add_argument('--pet-name',default='FRANKLIN');p.add_argument('--wall-label',default='ASSEMBL')
p.add_argument('--group',choices=['all','wall','desk','objects','storage','dayrally','bikes'],default='all')
a=p.parse_args();out=Path(a.out).resolve()
if out.exists() and any(out.iterdir()):p.error('Output directory is not empty. Choose another --out so existing revisions are preserved.')
env={**os.environ,'ASSEMBL_OUTPUT':str(out),'ASSEMBL_NAME':a.name,'ASSEMBL_PET_NAME':a.pet_name,'ASSEMBL_WALL_LABEL':a.wall_label}
groups=['wall','desk','objects','storage','dayrally','bikes'] if a.group=='all' else [a.group]
for group in groups:subprocess.run([sys.executable,str(Path(__file__).with_name(group+'.py'))],env=env,check=True)
subprocess.run([sys.executable,str(Path(__file__).with_name('audit_assemblies.py'))],env=env,check=True)
print(f'Generated files are in {out}. Physical validation is still required.')
