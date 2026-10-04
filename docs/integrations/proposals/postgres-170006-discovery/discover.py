"""UNRUN. Immutable public-image discovery only; no permission SQL/production connections."""
import os,sys,pathlib,tempfile,subprocess,time,json,hashlib,uuid,re,signal,selectors
IMAGE='public.ecr.aws/supabase/postgres@sha256:2f907f53ca8d59b4a620cdcbefe21854046f5409b20e96887e2fa2289c902bdb'
CONFIG='sha256:2b35381bd3f617b535b605f185d4aebf314f2e3d13710f88c737bc0aca06c047'
DOCKER='/usr/bin/docker';ENDPOINT='unix:///var/run/docker.sock'
OUT=pathlib.Path(os.environ.get('RUNNER_TEMP',''))/'postgres-170006-discovery'
OUT.mkdir(exist_ok=True);end=time.monotonic()+360;sequence=0;receipt_namespace="discovery"
home=tempfile.TemporaryDirectory(prefix='pg-discovery-config-')
env={'PATH':'/usr/bin:/bin','HOME':home.name,'DOCKER_CONFIG':home.name}
BASE=[DOCKER,'--host',ENDPOINT,'--config',home.name]
nonce=uuid.uuid4().hex;name='assembl-pg-discovery-'+nonce;cid=None
owner={'nonce':nonce,'name':name,'container_id':None,'image':IMAGE,'config':CONFIG,'run_id':os.environ.get('GITHUB_RUN_ID'),'attempt':os.environ.get('GITHUB_RUN_ATTEMPT'),'create_state':'not_started','removal_confirmed':False}

def require(condition,message):
 if not condition:raise RuntimeError(message)

def save_owner():
 data=(json.dumps(owner,indent=2)+'\n').encode()
 temporary=OUT/('owner-'+uuid.uuid4().hex+'.tmp')
 fd=os.open(temporary,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
 try:
  with os.fdopen(fd,'wb') as stream:stream.write(data);stream.flush();os.fsync(stream.fileno())
  os.replace(temporary,OUT/'owner.json')
  directory_fd=os.open(OUT,os.O_RDONLY)
  try:os.fsync(directory_fd)
  finally:os.close(directory_fd)
 finally:
  if temporary.exists():temporary.unlink()

def evidence_write(path,text):
 try:path.write_text(text)
 except Exception as error:
  if not globals().get('cleanup_evidence_mode',False):raise
  cleanup_evidence_errors.append({'file':path.name,'type':type(error).__name__,'message':str(error)[:300]})

def run(args,seconds=10,deadline=None,both=False):
 global sequence
 limit=min(end if deadline is None else deadline,time.monotonic()+seconds)
 if limit<=time.monotonic():raise TimeoutError('discovery deadline exhausted')
 p=subprocess.Popen(BASE+args,stdout=subprocess.PIPE,stderr=subprocess.PIPE,stdin=subprocess.DEVNULL,env=env,start_new_session=True,bufsize=0)
 sel=selectors.DefaultSelector();out=bytearray();err=bytearray();fault=None;complete=False;cap=4*1024*1024
 for stream,label in [(p.stdout,'out'),(p.stderr,'err')]:os.set_blocking(stream.fileno(),False);sel.register(stream,selectors.EVENT_READ,label)
 try:
  while sel.get_map() or p.poll() is None:
   remaining=limit-time.monotonic()
   if remaining<=0:raise TimeoutError('Docker command deadline')
   for key,_ in sel.select(min(.1,remaining)):
    try:chunk=os.read(key.fd,8192)
    except BlockingIOError:continue
    if not chunk:sel.unregister(key.fileobj)
    else:
     available=cap-len(out)-len(err)
     (out if key.data=='out' else err).extend(chunk[:available])
     if len(chunk)>available:raise RuntimeError('output cap')
  if time.monotonic()>=limit:raise TimeoutError('late Docker completion')
  complete=True
  if p.returncode:raise RuntimeError('Docker command failed; retained receipt')
  return out.decode(errors='replace')+err.decode(errors='replace') if both else out.decode(errors='replace')
 except BaseException as error:
  fault={'type':type(error).__name__,'message':str(error)};raise
 finally:
  try:
   if p.poll() is None:
    os.killpg(p.pid,signal.SIGKILL)
    p.wait(timeout=2)
  finally:
   sequence+=1
   result={'argv':args,'code':p.poll(),'complete':complete,'fault':fault,'stdout':out.decode(errors='replace'),'stderr':err.decode(errors='replace'),'cap_bytes':cap,'retained_bytes':len(out)+len(err)}
   if globals().get('cleanup_evidence_mode',False):cleanup_memory_receipts.append(result)
   try:evidence_write(OUT/(receipt_namespace+'-%03d-command.json'%sequence),json.dumps(result,indent=2)+'\n')
   finally:sel.close();p.stdout.close();p.stderr.close()

def inspection(target,deadline=None):
 # Project only permitted fields at Docker, BEFORE receipt retention. Never log Config.Env.
 fields={'Id':'.Id','Image':'.Image','Name':'.Name','Labels':'.Config.Labels',
 'NetworkMode':'.HostConfig.NetworkMode','Binds':'.HostConfig.Binds','Ports':'.HostConfig.PortBindings'}
 fmt='{'+','.join('"'+k+'":{{json '+v+'}}' for k,v in fields.items())+'}'
 return json.loads(run(['inspect','--format',fmt,target],deadline=deadline))

def execute(args,seconds=10,deadline=None):
 meta=inspection(cid,deadline)
 require(meta['Id']==cid and meta['Image']==CONFIG and meta['NetworkMode']=='none', "Discovery invariant: meta['Id']==cid and meta['Image']==CONFIG and meta['NetworkMode']=='none'")
 require(meta['Labels']['assembl.discovery.nonce']==nonce and not meta['Binds'] and not meta['Ports'], "Discovery invariant: meta['Labels']['assembl.discovery.nonce']==nonce and not meta['Binds'] and not meta['Ports']")
 return run(['exec','--user','postgres',cid,'/usr/bin/env','-i','PATH=/usr/lib/postgresql/17/bin:/usr/local/bin:/usr/bin:/bin','HOME=/tmp']+args,seconds,deadline)

def resolve_executable(path):
 require(re.fullmatch('/[A-Za-z0-9_./-]+',path), 'Invalid executable input path')
 # BusyBox readlink supports -f, not GNU -e. -f alone may allow a missing leaf.
 resolved=execute(['/usr/bin/readlink','-f',path]).strip()
 require(re.fullmatch('/[A-Za-z0-9_./-]+',resolved), 'Invalid resolved executable path')
 # test -f enforces existence AND a regular file; test -x checks access as postgres.
 execute(['/bin/sh','-c','test -f "$1" && test -x "$1"','discovery-file-check',resolved])
 return resolved

def cleanup():
 global receipt_namespace,cleanup_evidence_mode,cleanup_evidence_errors,cleanup_memory_receipts,cleanup_memory_report
 cleanup_evidence_mode=True;cleanup_evidence_errors=[];cleanup_memory_receipts=[];cleanup_memory_report=None
 if receipt_namespace=="discovery":receipt_namespace="cleanup-final"
 deadline=time.monotonic()+30;target=cid or name
 report={'nonce':nonce,'container_id':cid,'state':'unresolved'}
 try:
  # Exact full ID / nonce ownership before removal; never a broad name/pattern cleanup.
  reconcile_end=min(deadline-20,time.monotonic()+5)
  present='';observations=[]
  while time.monotonic()<reconcile_end:
   present=run(['container','ls','--all','--no-trunc','--filter','name=^/'+name+'$','--format','{{.ID}}'],1,reconcile_end).strip()
   observations.append({'time_monotonic':time.monotonic(),'container_id':present or None})
   if present:break
   if owner.get('removal_confirmed') or owner.get('create_state')=='not_started':break
   time.sleep(min(.2,max(0,reconcile_end-time.monotonic())))
  report['name_observations']=observations
  if not present:
   if owner.get('removal_confirmed'):report['state']='observed_absent_after_confirmed_removal';return
   if owner.get('create_state')=='not_started':report['state']='observed_absent_no_create_request';return
   report['state']='observed_absent_unresolved_lost_create_ack'
   raise RuntimeError('late create remains unresolved; empty listing is not proof of no future container')
  require(re.fullmatch('[a-f0-9]{64}',present), "Discovery invariant: re.fullmatch('[a-f0-9]{64}',present)")
  raw=run(['inspect','--format','{{json .Id}} {{json .Image}} {{json .Name}} {{json .Config.Labels}}',target],8,deadline)
  dec=json.JSONDecoder();values=[];rest=raw.strip()
  while rest:val,n=dec.raw_decode(rest);values.append(val);rest=rest[n:].lstrip()
  actual,image,actual_name,labels=values
  require((cid is None or actual==cid) and image==CONFIG and actual_name=='/'+name and labels.get('assembl.discovery.nonce')==nonce, "Discovery invariant: (cid is None or actual==cid) and image==CONFIG and actual_name=='/'+name and labels.get('assembl.discovery.nonce')==nonce")
  # Diagnostic failures never gate removal. Reserve 20s of the fixed cleanup budget.
  diagnostic_end=min(deadline-20,time.monotonic()+2)
  diagnostics=[]
  for label,args,both in [('terminal-postgres.log',['logs',actual],True),('terminal-state.json',['inspect','--format','{{json .State}}',actual],False)]:
   try:
    text=run(args,1,diagnostic_end,both=both)
    evidence_write(OUT/(receipt_namespace+'-'+label),text)
    diagnostics.append({'file':label,'status':'captured'})
   except Exception as error:
    diagnostics.append({'file':label,'status':'failed_nonblocking','type':type(error).__name__,'message':str(error)})
  evidence_write(OUT/(receipt_namespace+'-diagnostics.json'),json.dumps(diagnostics,indent=2)+'\n')
  run(['rm','--force','--volumes',actual],10,deadline)
  absence=run(['container','ls','--all','--no-trunc','--filter','id='+actual,'--format','{{.ID}}'],8,deadline)
  require(absence.strip()=='', "Discovery invariant: absence.strip()==''")
  report.update(state='removed_and_absent',container_id=actual)
  owner['removal_confirmed']=True
  try:save_owner()
  except Exception as error:cleanup_evidence_errors.append({'file':'owner.json','type':type(error).__name__,'message':str(error)[:300]})
 finally:
  primary_error=sys.exc_info()[1]
  report['evidence_failures']=cleanup_evidence_errors
  cleanup_memory_report=report
  evidence_write(OUT/(receipt_namespace+'-report.json'),json.dumps(report,indent=2)+'\n')
  cleanup_evidence_mode=False
  if cleanup_evidence_errors:
   message='Cleanup evidence persistence failed after ownership/removal checks: '+json.dumps({'state':report['state'],'failures':cleanup_evidence_errors})
   try:print(message,file=sys.stderr,flush=True)
   except Exception:pass
   if primary_error is None:raise RuntimeError(message)


def main():
 global cid
 require(sys.platform=='linux' and os.environ.get('GITHUB_ACTIONS')=='true', "Discovery invariant: sys.platform=='linux' and os.environ.get('GITHUB_ACTIONS')=='true'")
 require(re.fullmatch('[0-9]+',owner['run_id'] or '') and owner['attempt']=='1', "Discovery invariant: re.fullmatch('[0-9]+',owner['run_id'] or '') and owner['attempt']=='1'")
 require(not (OUT/'owner.json').exists(), "Discovery invariant: not (OUT/'owner.json').exists()")
 save_owner()
 try:
  run(['pull','--platform','linux/amd64',IMAGE],180)
  # No production secrets, published ports or socket binds; shared official default startup.
  identity=run(['image','inspect','--format','{{.Id}} {{.Architecture}} {{.Os}}',IMAGE]).strip()
  require(identity==CONFIG+' amd64 linux', "Discovery invariant: identity==CONFIG+' amd64 linux'")
  entrypoint=run(['image','inspect','--format','{{json .Config.Entrypoint}}',IMAGE]).strip()
  (OUT/'image-entrypoint.json').write_text(entrypoint+'\n')
  (OUT/'image-identity.json').write_text(json.dumps({'reference':IMAGE,'runtime_image_identity':identity},indent=2)+'\n')
  owner['create_state']='pending';save_owner()
  cid=run(['create','--pull=never','--platform','linux/amd64','--name',name,'--network','none','--label','assembl.discovery.nonce='+nonce,'--tmpfs','/var/lib/postgresql/data:rw,size=1g','--tmpfs','/var/run/postgresql:rw,size=8m','--memory','2g','--cpus','2','--pids-limit','128','--env','POSTGRES_PASSWORD=fictional-studio-run-only','--env','POSTGRES_DB=studio_run_proof',IMAGE]).strip()
  require(re.fullmatch('[a-f0-9]{64}',cid), "Discovery invariant: re.fullmatch('[a-f0-9]{64}',cid)")
  owner['container_id']=cid;owner['create_state']='acknowledged';save_owner()
  run(['start',cid])
  # Fixed discovery names/locations only. Record file identities before invoking binaries.
  paths={}
  for binary in ['postgres','initdb','pg_ctl','psql','pg_config']:
   path=execute(['/bin/sh','-c','command -v '+binary]).strip()
   require(re.fullmatch('/[A-Za-z0-9_./-]+',path), "Discovery invariant: re.fullmatch('/[A-Za-z0-9_./-]+',path)")
   resolved=resolve_executable(path)
   sha=execute(['/usr/bin/sha256sum',resolved]).split()[0]
   require(re.fullmatch('[a-f0-9]{64}',sha), "Discovery invariant: re.fullmatch('[a-f0-9]{64}',sha)")
   version=execute([resolved,'--version']).strip()
   paths[binary]={'path':resolved,'sha256':sha,'version':version}
  for entry in json.loads(entrypoint) or []:
   if not entry.startswith('-') and re.fullmatch('[A-Za-z0-9_./-]+',entry):
    path=execute(['/bin/sh','-c','command -v '+entry]).strip()
    resolved=resolve_executable(path)
    sha=execute(['/usr/bin/sha256sum',resolved]).split()[0]
    require(re.fullmatch('[a-f0-9]{64}',sha), 'Invalid entrypoint SHA256')
    paths['entrypoint:'+entry]={'path':resolved,'sha256':sha,'executed':False}
  require(re.search(r'\b17\.6\b',paths['postgres']['version']) and re.search(r'\b17\.6\b',paths['psql']['version']), "Discovery invariant: re.search(r'\\b17\\.6\\b',paths['postgres']['version']) and re.search(r'\\b17\\.6\\b',paths['psql']['version'])")
  (OUT/'executables.json').write_text(json.dumps(paths,indent=2)+'\n')
  # Shared Hub .111 startup profile; stop strictly before the first synthetic CREATE SCHEMA.
  ready_end=min(end,time.monotonic()+60)
  while time.monotonic()<ready_end:
   # One bounded, catalog-only psql connection attempt; failed attempts retained and never writes.
   try:
    execute([paths['psql']['path'],'-X','-qAt','-v','ON_ERROR_STOP=1','-h','/var/run/postgresql','-U','supabase_admin','-d','studio_run_proof','-c','SELECT 1;'],5,ready_end)
    break
   except RuntimeError:
    if time.monotonic()>=ready_end:raise
    time.sleep(min(.1,max(0,ready_end-time.monotonic())))
  else:raise TimeoutError('shared startup readiness deadline')
  sql="SELECT json_build_object('database',current_database(),'user',current_user,'session_user',session_user,'server_version_num',current_setting('server_version_num'),'encoding',current_setting('server_encoding'),'locale',(SELECT json_build_object('provider',datlocprovider,'collate',datcollate,'ctype',datctype,'icu_locale',datlocale,'version',datcollversion) FROM pg_catalog.pg_database WHERE datname=current_database()),'timeouts',(SELECT json_object_agg(name,setting) FROM pg_catalog.pg_settings WHERE name IN ('statement_timeout','lock_timeout','idle_in_transaction_session_timeout','transaction_timeout')),'jsonschema_available',(SELECT count(*) FROM pg_catalog.pg_available_extension_versions WHERE name='pg_jsonschema' AND version='0.3.3'),'jsonschema_installed',(SELECT count(*) FROM pg_catalog.pg_extension WHERE extname='pg_jsonschema'),'public_auth_tables',(SELECT count(*) FROM pg_catalog.pg_tables WHERE schemaname IN ('public','auth')));"
  data=json.loads(execute([paths['psql']['path'],'-X','-qAt','-v','ON_ERROR_STOP=1','-h','/var/run/postgresql','-U','supabase_admin','-d','studio_run_proof','-c',sql]))
  require(data['server_version_num']=='170006' and data['database']=='studio_run_proof' and data['user']=='supabase_admin', "Discovery invariant: data['server_version_num']=='170006' and data['database']=='studio_run_proof' and data['user']=='supabase_admin'")
  require(data['jsonschema_available']==1 and data['jsonschema_installed']==0 and data['public_auth_tables']==0, "Discovery invariant: data['jsonschema_available']==1 and data['jsonschema_installed']==0 and data['public_auth_tables']==0")
  (OUT/'runtime-metadata.json').write_text(json.dumps(data,indent=2)+'\n')
  logs=run(['logs',cid],both=True);(OUT/'postgres.log').write_text(logs)
  state=json.loads(run(['inspect','--format','{{json .State}}',cid]))
  restarts=run(['inspect','--format','{{.RestartCount}}',cid]).strip()
  require(state['Running'] is True and state['OOMKilled'] is False and restarts=='0', "Discovery invariant: state['Running'] is True and state['OOMKilled'] is False and restarts=='0'")
  require(not re.search(r'terminated by signal|segmentation fault|reinitializing|all server processes terminated|database system was interrupted|terminating any other active server processes',logs,re.I), "Discovery invariant: not re.search(r'terminated by signal|segmentation fault|reinitializing|all server processes terminated|database system was interrupted|terminating any other active server processes',logs,re.I)")
  (OUT/'startup-health.json').write_text(json.dumps({'state':state,'restart_count':restarts},indent=2)+'\n')

 finally:
  try:cleanup()
  finally:home.cleanup()
def cleanup_only():
 global nonce,name,cid,owner,receipt_namespace
 receipt_namespace="cleanup-only"
 require(sys.platform=='linux' and os.environ.get('GITHUB_ACTIONS')=='true', "Discovery invariant: sys.platform=='linux' and os.environ.get('GITHUB_ACTIONS')=='true'")
 if not (OUT/'owner.json').exists():return
 owner=json.loads((OUT/'owner.json').read_text())
 require(owner['image']==IMAGE and owner['config']==CONFIG, "Discovery invariant: owner['image']==IMAGE and owner['config']==CONFIG")
 require(owner['run_id']==os.environ.get('GITHUB_RUN_ID') and owner['attempt']=='1'==os.environ.get('GITHUB_RUN_ATTEMPT'), "Discovery invariant: owner['run_id']==os.environ.get('GITHUB_RUN_ID') and owner['attempt']=='1'==os.environ.get('GITHUB_RUN_ATTEMPT')")
 nonce=owner['nonce'];require(re.fullmatch('[a-f0-9]{32}',nonce), "Discovery invariant: re.fullmatch('[a-f0-9]{32}',nonce)")
 name=owner['name'];require(name=='assembl-pg-discovery-'+nonce, "Discovery invariant: name=='assembl-pg-discovery-'+nonce")
 cid=owner['container_id'];require(cid is None or re.fullmatch('[a-f0-9]{64}',cid), "Discovery invariant: cid is None or re.fullmatch('[a-f0-9]{64}',cid)")
 try:cleanup()
 finally:home.cleanup()
if __name__=='__main__':
 if sys.argv[1:]==['--cleanup-only']:cleanup_only()
 elif not sys.argv[1:]:main()
 else:raise SystemExit('closed arguments only')
