"""UNRUN independent always-cleanup; no database/SQL calls or arbitrary target arguments."""
import json,os,pathlib,re,sys,tempfile
import run_fixture as m
def main():
 m.require(len(sys.argv)==1,'cleanup accepts no routing arguments')
 m.require(sys.platform=='linux' and os.environ.get('GITHUB_ACTIONS')=='true','approved ephemeral Linux CI only')
 run=os.environ.get('GITHUB_RUN_ID','');attempt=os.environ.get('GITHUB_RUN_ATTEMPT','')
 m.require(re.fullmatch('[0-9]+',run) and re.fullmatch('[0-9]+',attempt),'invalid CI ownership')
 tmp=pathlib.Path(os.environ.get('RUNNER_TEMP',''))
 m.require(tmp.is_absolute() and tmp.is_dir(),'trusted runner temp required')
 directory=tmp/'home-agent-client-grant-proof';directory.mkdir(exist_ok=True)
 record=directory/'owner.json'
 if not record.exists():
  (directory/'cleanup.json').write_text(json.dumps({'state':'no_container_ownership_record','removed':False}))
  return
 owner=json.loads(record.read_text())
 m.require(owner['run_id']==run and owner['attempt']==attempt,'cleanup run mismatch; do not adopt')
 with tempfile.TemporaryDirectory(prefix='home-client-cleanup-config-') as home:
  env=m.clean_environment(home);base=[m.DOCKER,'--host',m.ENDPOINT,'--config',home]
  m.recover_cleanup(owner,directory,env,base)
if __name__=='__main__':main()

