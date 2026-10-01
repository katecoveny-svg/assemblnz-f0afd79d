#!/usr/bin/env python3
"""Run one isolated full standard build; only its process group may be stopped."""
import argparse, json, os, signal, subprocess, time
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--dir',required=True);p.add_argument('--log',required=True);p.add_argument('--seconds',type=int,default=360);a=p.parse_args()
cwd=Path(a.dir).resolve();log=Path(a.log).resolve();log.parent.mkdir(parents=True,exist_ok=True)
env=dict(os.environ);env['NODE_OPTIONS']='--max-old-space-size=6144'
metadata={'cwd':str(cwd),'commit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=cwd,text=True).strip(),'command':'NODE_OPTIONS=--max-old-space-size=6144 pnpm build','node':subprocess.check_output(['node','--version'],cwd=cwd,text=True).strip(),'pnpm':subprocess.check_output(['pnpm','--version'],cwd=cwd,text=True).strip(),'timeout_seconds':a.seconds,'started_utc':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
start=time.monotonic()
with log.open('wb') as stream:
 proc=subprocess.Popen(['pnpm','build'],cwd=cwd,env=env,stdout=stream,stderr=subprocess.STDOUT,start_new_session=True)
 metadata['pid']=proc.pid;metadata['timed_out']=False
 try:code=proc.wait(timeout=a.seconds)
 except subprocess.TimeoutExpired:
  metadata['timed_out']=True;os.killpg(proc.pid,signal.SIGTERM)
  try:code=proc.wait(timeout=10)
  except subprocess.TimeoutExpired:os.killpg(proc.pid,signal.SIGKILL);code=proc.wait()
metadata.update(exit_code=code,elapsed_seconds=round(time.monotonic()-start,2),log_bytes=log.stat().st_size,log_tail=log.read_text(errors='replace').splitlines()[-20:])
log.with_suffix('.result.json').write_text(json.dumps(metadata,indent=2)+'\n');print(json.dumps(metadata,indent=2))
raise SystemExit(0 if code==0 else 1)
