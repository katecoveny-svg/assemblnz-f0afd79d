"""UNRUN fixture. Only offline tests authorised. Fixed reviewed atomic transport patterns."""
import atexit,dataclasses,hashlib,json,os,pathlib,re,selectors,signal,subprocess,sys,tempfile,time,uuid
ROOT=pathlib.Path(__file__).resolve().parent
DOCKER='/usr/bin/docker'; ENDPOINT='unix:///var/run/docker.sock'; SOCKET='/var/run/postgresql'
PSQL='/usr/lib/postgresql/17/bin/psql'; POSTGRES='/usr/lib/postgresql/17/bin/postgres'; PGREADY='/usr/lib/postgresql/17/bin/pg_isready'
IMAGE='postgres:17.11-bookworm@sha256:639ab7ceb90e13123085b741fb31ef493fba25463002f6da665352e7b534b652'
IMAGE_ID='sha256:248efd5e58cd743f2a0e0daec8ea4649e5580145ec2a12e2345bc710d4a77201'
PACKAGED_VERSION='17.11-1.pgdg12+2'
IMAGE_FILES={PSQL:'92479a999b7227713c648475b20b2b870cc7b06ccd4fde429fc696045dd4f146',PGREADY:'10557978eac2173ef7ea9bed2e34fa44ecd30a9f9d4a3eca8c7b782a7eced107',POSTGRES:'f7d05a9a444dc63d93f6b6e329d31eaebae809e85c8479b5072d8aff595303ed','/usr/local/bin/docker-entrypoint.sh':'9c440299ae04a0a79d55b8bf03307036d890a40979d2fb698073c9050d4b20a5'}
GATE=b'ACL_COMMIT_GATE_READY'; OUTPUT_LIMIT=1024*1024
def require(value,message):
 if not value:raise RuntimeError(message)
def clean_environment(home):return {'PATH':'/usr/bin:/bin','HOME':home,'DOCKER_CONFIG':home}
def digest(data):return hashlib.sha256(data).hexdigest()
def validate_gate_source(data):
 require(data.count(b'\\echo '+GATE+b'\n')==1,'missing/duplicate immutable commit gate')
 require(data.count(b'\\prompt ')==1 and data.count(b'\\if :acl_commit_gate\n')==1,'missing/duplicate immutable prompt')
 require(data.endswith(b'\\if :acl_commit_gate\nCOMMIT;\n\\else\nROLLBACK;\n\\quit 4\n\\endif\n'),'unexpected immutable commit tail')
def verify_inspection(meta,cid,owner):
 require(re.fullmatch('[0-9a-f]{64}',cid or '') is not None,'invalid full container ID')
 require(meta.get('Id')==cid and meta.get('Name')=='/'+owner['name'],'container identity mismatch')
 require(meta.get('Image')==owner['image_id'],'image identity mismatch')
 labels=meta.get('Config',{}).get('Labels',{})
 for key,field in [('assembl.atomic.nonce','nonce'),('assembl.atomic.run','run_id'),('assembl.atomic.attempt','attempt')]:
  require(labels.get(key)==owner[field],'ownership mismatch')
 h=meta.get('HostConfig',{})
 require(h.get('NetworkMode')=='none','network isolation mismatch')
 require(not h.get('PortBindings') and not h.get('CapAdd') and not h.get('Privileged'),'unsafe ports/capabilities')
 require(not h.get('Binds') and not h.get('VolumesFrom'),'host binds/volumes forbidden')
 require(not h.get('PidMode') and h.get('IpcMode') in ('',None,'private'),'host namespaces forbidden')
 require(set(meta.get('NetworkSettings',{}).get('Networks',{})).issubset({'none'}),'attached network forbidden')
 require(set(h.get('Tmpfs',{}))=={'/var/lib/postgresql/data',SOCKET},'exact fresh tmpfs required')
 require(all(m.get('Type')=='tmpfs' and m.get('Destination') in ('/var/lib/postgresql/data',SOCKET) for m in meta.get('Mounts',[])),'unexpected mounts')
 require(h.get('Memory')==256*1024*1024 and h.get('NanoCpus')==1000000000 and h.get('PidsLimit')==128,'resource bounds mismatch')
@dataclasses.dataclass
class Result:
 code:int; stdout:bytes; stderr:bytes; gates:int=0; votes:tuple=()
def terminate(proc):
 if proc.poll() is None:
  os.killpg(proc.pid,signal.SIGTERM)
  try:proc.wait(timeout=2)
  except subprocess.TimeoutExpired:os.killpg(proc.pid,signal.SIGKILL);proc.wait(timeout=2)
def run_bounded(argv,env,deadline,input_data=None,gate=False,limit=OUTPUT_LIMIT):
 """Selector stdin/stdout/stderr, absolute deadline/output cap, finally-owned process cleanup."""
 require(deadline>time.monotonic(),'operation deadline exhausted')
 p=subprocess.Popen(argv,env=env,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.STDOUT if gate else subprocess.PIPE,start_new_session=True,bufsize=0)
 sel=selectors.DefaultSelector();out=bytearray();err=bytearray();buf=bytearray()
 pending=bytearray(input_data or b'');gates=0;votes=[];diagnostic=False
 try:
  for stream,label in [(p.stdout,'out'),(p.stderr,'err')]:
   if stream is not None:os.set_blocking(stream.fileno(),False);sel.register(stream,selectors.EVENT_READ,label)
  os.set_blocking(p.stdin.fileno(),False)
  if pending:sel.register(p.stdin,selectors.EVENT_WRITE,'in')
  elif not gate:p.stdin.close()
  while sel.get_map() or p.poll() is None:
   remaining=deadline-time.monotonic()
   if remaining<=0:raise TimeoutError('bounded output/process deadline')
   marker=False
   for key,mask in sel.select(min(.05,remaining)):
    stream=key.fileobj
    if key.data=='in':
     try:n=os.write(stream.fileno(),pending[:65536])
     except BrokenPipeError:pending.clear();n=0
     del pending[:n]
     if not pending:
      sel.unregister(stream)
      if not gate:stream.close()
     continue
    try:chunk=os.read(stream.fileno(),65536)
    except BlockingIOError:continue
    if not chunk:sel.unregister(stream);continue
    (out if key.data=='out' else err).extend(chunk)
    if len(out)+len(err)>limit:raise RuntimeError('bounded output limit')
    if gate:
     buf.extend(chunk)
     if any(x in buf for x in (b'WARNING:',b'NOTICE:',b'ERROR:',b'FATAL:',b'psql:')):diagnostic=True
     while b'\n' in buf:
      line,_,rest=buf.partition(b'\n');buf[:]=rest
      if line==GATE:gates+=1;marker=True
   if marker:
    require(gates==1 and not votes,'duplicate runtime commit gate')
    vote=b'false\n' if diagnostic else b'true\n';votes.append(vote.decode().strip());pending.extend(vote)
    if p.stdin not in [k.fileobj for k in sel.get_map().values()]:sel.register(p.stdin,selectors.EVENT_WRITE,'in')
   if p.poll() is not None and pending:
    pending.clear()
    if not p.stdin.closed:
     try:sel.unregister(p.stdin)
     except KeyError:pass
     p.stdin.close()
  if gate:
   require(gates==1,'missing runtime commit gate')
   require(not diagnostic or (votes==['false'] and p.returncode!=0),'diagnostic not safely refused')
  return Result(p.returncode,bytes(out),bytes(err),gates,tuple(votes))
 finally:
  terminate(p);sel.close()
  for stream in (p.stdin,p.stdout,p.stderr):
   if stream is not None and not stream.closed:stream.close()
def recover_cleanup(owner,directory,env,base):
 """Reuse exact-name/full-ID recovery from atomic workflow, with bounded absence confirmation."""
 deadline=time.monotonic()+30
 require(re.fullmatch('[0-9a-f]{32}',owner['nonce']) is not None,'cleanup nonce invalid')
 require(owner['name']=='assembl-home-client-'+owner['nonce'] and owner['image_id']==IMAGE_ID,'cleanup record mismatch')
 for field in ('run_id','attempt'):require(re.fullmatch('[0-9]+',owner[field]) is not None,'cleanup CI identity invalid')
 cid=owner.get('container_id');require(cid is None or re.fullmatch('[0-9a-f]{64}',cid) is not None,'cleanup ID invalid')
 target=cid or owner['name'];report={'state':'unresolved','nonce':owner['nonce'],'removed':False}
 try:
  r=run_bounded(base+['inspect',target],env,min(deadline,time.monotonic()+8))
  if r.code:
   require(r.stderr.decode().strip()=='Error: No such object: '+target,'cleanup inspection failed, not absent')
   report['state']='owned_container_already_absent';return report
  meta=json.loads(r.stdout)[0];verified=meta.get('Id')
  require(cid is None or verified==cid,'cleanup ID mismatch');verify_inspection(meta,verified,owner)
  r=run_bounded(base+['rm','--force','--volumes',verified],env,min(deadline,time.monotonic()+10))
  require(r.code==0 and not r.stderr,'owned cleanup remove failed')
  absent=run_bounded(base+['inspect',verified],env,min(deadline,time.monotonic()+8))
  require(absent.code!=0 and absent.stderr.decode().strip()=='Error: No such object: '+verified,'cleanup absence not confirmed')
  report.update(state='removed',removed=True,container_id=verified);return report
 finally:(directory/'cleanup.json').write_text(json.dumps(report,indent=2))
class Fixture:
 def __init__(self):
  require(sys.platform=='linux' and os.environ.get('GITHUB_ACTIONS')=='true','separately approved ephemeral Linux CI runner required')
  run=os.environ.get('GITHUB_RUN_ID','');attempt=os.environ.get('GITHUB_RUN_ATTEMPT','')
  require(re.fullmatch('[0-9]+',run) and re.fullmatch('[0-9]+',attempt),'invalid CI ownership')
  tmp=pathlib.Path(os.environ.get('RUNNER_TEMP',''));require(tmp.is_absolute() and tmp.is_dir(),'trusted runner temp required')
  self.record_dir=tmp/'home-agent-client-grant-proof';self.record_dir.mkdir(exist_ok=True);self.record=self.record_dir/'owner.json'
  require(not self.record.exists(),'never adopt/reuse ownership record')
  self.home=tempfile.TemporaryDirectory(prefix='home-client-config-');self.env=clean_environment(self.home.name)
  self.base=[DOCKER,'--host',ENDPOINT,'--config',self.home.name]
  self.nonce=uuid.uuid4().hex;self.cid=None;self.closed=False;self.deadline=time.monotonic()+150;self.sequence=0
  self.owner={'name':'assembl-home-client-'+self.nonce,'nonce':self.nonce,'run_id':run,'attempt':attempt,'container_id':None,'image_id':IMAGE_ID,'image_reference':IMAGE}
  self.sql_bytes={p.name:p.read_bytes() for p in ROOT.glob('*.sql')};self.hashes={n:digest(b) for n,b in self.sql_bytes.items()}
  for name in ('forward.sql','rollback.sql'):validate_gate_source(self.sql_bytes[name])
  atexit.register(self.close)
 def end(self,seconds):
  end=min(self.deadline,time.monotonic()+seconds);require(end>time.monotonic(),'whole-run deadline exhausted');return end
 def docker(self,args,data=None,seconds=10):return run_bounded(self.base+args,self.env,self.end(seconds),data)
 def checked(self,r,label):
  require(r.code==0 and not r.stderr,label+' failed/diagnostic');return r.stdout
 def save(self):
  temp=self.record.with_suffix('.tmp');temp.write_text(json.dumps(self.owner))
  with temp.open('rb') as f:os.fsync(f.fileno())
  os.replace(temp,self.record);fd=os.open(self.record_dir,os.O_RDONLY)
  try:os.fsync(fd)
  finally:os.close(fd)
 def verify(self):
  require(self.cid is not None,'no acknowledged owned ID')
  meta=json.loads(self.checked(self.docker(['inspect',self.cid]),'inspection'))[0]
  verify_inspection(meta,self.cid,self.owner);return meta
 def image_command(self,args):
  self.verify();return self.docker(['exec','--user','postgres',self.cid,'/usr/bin/env','-i','PATH=/usr/bin:/bin','HOME=/tmp']+args)
 def psql_args(self,user='postgres',database='acl_fixture'):
  require(user in ('postgres','fixture_admin') and database in ('acl_fixture','postgres'),'closed fixture identities only')
  return self.base+['exec','--user','postgres','-i',self.cid,'/usr/bin/env','-i','PATH=/usr/bin:/bin','HOME=/tmp','PGAPPNAME=home-client-fixture','PGOPTIONS=-c statement_timeout=5000 -c lock_timeout=3000',PSQL,'-X','-qAt','-v','ON_ERROR_STOP=1','-v','VERBOSITY=terse','-h',SOCKET,'-p','5432','-U',user,'-d',database]
 def retain(self,phase,data,r):
  self.sequence+=1
  (self.record_dir/('%03d-%s.json'%(self.sequence,phase))).write_text(json.dumps({'nonce':self.nonce,'container_id':self.cid,'sql_sha256':digest(data),'returncode':r.code,'stdout':r.stdout.decode(errors='replace'),'stderr':r.stderr.decode(errors='replace'),'gates':r.gates,'votes':r.votes},indent=2))
 def raw(self,data,user='postgres',database='acl_fixture'):
  self.verify();r=run_bounded(self.psql_args(user,database),self.env,self.end(8),data);self.retain('query',data,r);return r
 def create(self):
  image=json.loads(self.checked(self.docker(['image','inspect',IMAGE]),'pre-provisioned image'))[0]
  require(image['Id']==IMAGE_ID and image.get('Architecture')=='amd64' and image.get('Os')=='linux','image identity/platform mismatch')
  require(IMAGE.split('@')[1] in [x.split('@')[-1] for x in image.get('RepoDigests',[])],'image digest mismatch')
  require(image.get('Config',{}).get('Entrypoint')==['docker-entrypoint.sh'] and image['Config'].get('Cmd')==['postgres'],'image startup mismatch')
  self.save()
  r=self.docker(['create','--pull=never','--name',self.owner['name'],'--network','none','--label','assembl.atomic.nonce='+self.nonce,'--label','assembl.atomic.run='+self.owner['run_id'],'--label','assembl.atomic.attempt='+self.owner['attempt'],'--tmpfs','/var/lib/postgresql/data:rw,size=128m','--tmpfs',SOCKET+':rw,size=8m','--memory','256m','--cpus','1','--pids-limit','128','--env','POSTGRES_DB=postgres','--env','POSTGRES_USER=fixture_admin','--env','POSTGRES_HOST_AUTH_METHOD=trust',IMAGE,'postgres','-c','listen_addresses=','-c','unix_socket_directories='+SOCKET])
  self.cid=self.checked(r,'create').decode().strip();require(re.fullmatch('[0-9a-f]{64}',self.cid) is not None,'invalid create ack')
  self.owner['container_id']=self.cid;self.save();self.verify();self.checked(self.docker(['start',self.cid]),'start')
  self.preflight();end=self.end(30)
  while time.monotonic()<end:
   comm=self.checked(self.image_command(['/usr/bin/cat','/proc/1/comm']),'PID1').decode().strip()
   require(comm in ('docker-entrypoi','env','bash','gosu','postgres'),'unexpected PID1')
   if comm=='postgres':
    require(self.checked(self.image_command(['/usr/bin/readlink','-e','/proc/1/exe']),'PID1 path').decode().strip()==POSTGRES,'unexpected final executable')
    ready=self.image_command([PGREADY,'-h',SOCKET,'-p','5432','-U','fixture_admin','-d','postgres'])
    require(ready.code in (0,1,2),'unexpected readiness failure')
    if ready.code==0:break
   time.sleep(min(.1,max(0,end-time.monotonic())))
  else:raise TimeoutError('final PID1 readiness deadline')
  self.identity=self.server_identity()
  require(self.identity['database']=='postgres' and self.identity['user']=='fixture_admin' and self.identity['address'] is None and self.identity['version']=='170011' and self.identity['data_directory']=='/var/lib/postgresql/data','unexpected fixture identity')
  self.checked(self.raw(self.sql_bytes['bootstrap.sql'],'fixture_admin','postgres'),'bootstrap')
  marker=("CREATE SCHEMA fixture_identity; CREATE TABLE fixture_identity.marker(nonce text PRIMARY KEY); INSERT INTO fixture_identity.marker VALUES('"+self.nonce+"'); GRANT USAGE ON SCHEMA fixture_identity TO postgres; GRANT SELECT ON fixture_identity.marker TO postgres;").encode()
  self.checked(self.raw(marker,'fixture_admin','acl_fixture'),'nonce marker')
 def preflight(self):
  require(self.checked(self.image_command(['/usr/bin/readlink','-e',PSQL]),'psql path').decode().strip()==PSQL,'packaged psql required')
  actual={}
  for line in self.checked(self.image_command(['/usr/bin/sha256sum']+list(IMAGE_FILES)),'image files').decode().splitlines():
   match=re.fullmatch(r'([0-9a-f]{64})  (/[^\n]+)',line);require(match is not None and match.group(2) not in actual,'bad image checksum');actual[match.group(2)]=match.group(1)
  require(actual==IMAGE_FILES,'reviewed executable/source mismatch')
  package=self.checked(self.image_command(['/usr/bin/dpkg-query','-W','-f='+'$'+'{Version}\n','postgresql-client-17']),'package').decode().strip()
  require(package==PACKAGED_VERSION,'packaged version mismatch')
  ownership=self.checked(self.image_command(['/usr/bin/dpkg-query','-S',PSQL]),'package ownership').decode().strip()
  require(ownership in ('postgresql-client-17: '+PSQL,'postgresql-client-17:amd64: '+PSQL),'psql package ownership mismatch')
  version=self.checked(self.image_command([PSQL,'--version']),'client version').decode().strip()
  require(version=='psql (PostgreSQL) 17.11 (Debian '+PACKAGED_VERSION+')','psql version identity mismatch')
 def server_identity(self):
  sql=b"SELECT json_build_object('database',current_database(),'user',current_user,'address',inet_server_addr(),'version',current_setting('server_version_num'),'data_directory',current_setting('data_directory'),'system_identifier',(SELECT system_identifier::text FROM pg_control_system()));"
  return json.loads(self.checked(self.raw(sql,'fixture_admin','postgres'),'identity'))
 def verify_server(self):
  self.verify()
  require(self.checked(self.image_command(['/usr/bin/readlink','-e','/proc/1/exe']),'PID1').decode().strip()==POSTGRES,'server process changed')
  require(self.checked(self.raw(b'SELECT nonce FROM fixture_identity.marker;'),'nonce').decode().strip()==self.nonce,'instance nonce mismatch')
  require(self.server_identity()==self.identity,'server instance changed')
 def action(self,name):
  data=self.sql_bytes[name];validate_gate_source(data);self.verify_server()
  path=SOCKET+'/home-client-'+self.nonce+'-'+name
  r=self.docker(['exec','--user','postgres','-i',self.cid,'/usr/bin/env','-i','PATH=/usr/bin:/bin','HOME=/tmp','/usr/bin/tee',path],data)
  require(self.checked(r,'SQL transfer')==data,'SQL transfer mismatch')
  self.checked(self.image_command(['/usr/bin/chmod','0444',path]),'SQL mode')
  sha=self.checked(self.image_command(['/usr/bin/sha256sum',path]),'SQL hash').decode().split()[0]
  require(sha==self.hashes[name],'frozen SQL bytes changed')
  r=run_bounded(self.psql_args()+['-f',path],self.env,self.end(35),gate=True);self.retain(name,data,r);return r
 def snapshot(self):
  data=self.sql_bytes['forward.sql'];start=data.index(b'CREATE FUNCTION pg_temp.home_acl_snapshot()')
  end=data.index(b'$snapshot$;',start)+len(b'$snapshot$;')
  return json.loads(self.checked(self.raw(data[start:end]+b'\nSELECT pg_temp.home_acl_snapshot();'),'snapshot'))
 def rejected(self,name,reason,database='acl_fixture'):
  before=self.snapshot();self.verify_server()
  r=self.raw(self.sql_bytes[name],database=database)
  assert_rejection(r,reason)
  require(self.snapshot()==before,'expected rejection changed state');return r
 def close(self):
  if self.closed:return
  self.closed=True
  try:
   if self.record.exists():recover_cleanup(self.owner,self.record_dir,self.env,self.base)
  finally:self.home.cleanup()
def assert_rejection(r,reason):
 if reason=='Wrong fixture target/executor/version':
  require(r.code==3 and r.stdout.decode().strip()==reason and not r.stderr,'wrong target rejection reason mismatch')
 else:
  exact=re.fullmatch(r'ERROR:\s+'+re.escape(reason)+r'\s*',r.stderr.decode())
  require(r.code==3 and exact is not None,'SQL rejection reason mismatch')
def prove(f):
 f.create();require(f.snapshot()==json.loads((ROOT.parent/'baseline.json').read_text()),'bootstrap baseline mismatch')
 def sql(n):f.checked(f.raw(f.sql_bytes[n]),n)
 def mutate(s):f.checked(f.raw(s.encode()),'fixture mutation')
 def action(n):
  r=f.action(n);require(r.code==0 and not r.stderr and r.votes==('true',),'unclean action')
 reason='Pre-action metadata/effective-privilege drift; abort'
 f.rejected('forward.sql','Wrong fixture target/executor/version',database='postgres')
 sql('service-check.sql');action('forward.sql');sql('client-denial.sql');sql('service-check.sql')
 require(f.snapshot()==json.loads((ROOT.parent/'poststate.json').read_text()),'poststate mismatch')
 mutate('GRANT SELECT ON public.home_agent_log TO anon;');f.rejected('rollback.sql',reason)
 mutate('REVOKE SELECT ON public.home_agent_log FROM anon;');action('rollback.sql');sql('service-check.sql')
 for add,remove in [('GRANT SELECT ON public.home_agent_log TO anon WITH GRANT OPTION;','REVOKE GRANT OPTION FOR SELECT ON public.home_agent_log FROM anon;'),('GRANT service_role TO anon WITH INHERIT TRUE, SET TRUE;','REVOKE service_role FROM anon;'),('GRANT SELECT ON public.home_agent_log TO service_role WITH GRANT OPTION;','REVOKE GRANT OPTION FOR SELECT ON public.home_agent_log FROM service_role;')]:
  mutate(add);f.rejected('forward.sql',reason);mutate(remove)
 mutate('GRANT SELECT(message) ON public.home_agent_log TO anon;');f.rejected('forward.sql',reason)
 return {'sql_hashes':f.hashes,'image_reference':IMAGE,'identity':f.identity,'container_id':f.cid,'scope':'disposable proof only'}
def main():
 require(len(sys.argv)==2 and sys.argv[1] in ('--offline-contract','--owned-fixture-proof'),'closed modes only; no connection overrides')
 if sys.argv[1]=='--offline-contract':
  import unittest
  result=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.discover(str(ROOT),'test_offline.py'))
  return 0 if result.wasSuccessful() else 1
 def stop(signum,frame):raise TimeoutError('outer fixture termination deadline')
 signal.signal(signal.SIGTERM,stop)
 f=Fixture()
 try:print(json.dumps(prove(f),indent=2))
 finally:f.close()
 return 0
if __name__=='__main__':raise SystemExit(main())

