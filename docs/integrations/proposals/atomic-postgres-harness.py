"""UNRUN DB HARNESS SOURCE. Only --offline-contract is currently authorized.
Future --owned-fixture-proof requires separate review/approval and a trusted CI runner.
No arbitrary DSN. No packages. Fixed owned network-none Docker/unix-socket psql transport.
Discarded committed result is simulated ACK loss, NOT a wire-level lost ACK test.
"""
import atexit, hashlib, json, os, pathlib, re, selectors, signal, subprocess, sys, tempfile, time, uuid
IMAGE='postgres:17.11-bookworm@sha256:639ab7ceb90e13123085b741fb31ef493fba25463002f6da665352e7b534b652'
DOCKER='/usr/bin/docker'
ENDPOINT='unix:///var/run/docker.sock'
DATABASE='assembl_ingestion_fixture'
SOCKET='/var/run/postgresql'
ROOT=pathlib.Path(__file__).resolve().parent
SQL=ROOT/'atomic-ingestion-finalization.sql'

def require(value,message):
    if not value: raise RuntimeError(message)

def digest(path): return hashlib.sha256(pathlib.Path(path).read_bytes()).hexdigest()
def lit(value):
    if value is None: return 'NULL'
    if isinstance(value,int): return str(value)
    return "'"+str(value).replace("'","''")+"'"

def validated_mode(argv):
    require(len(argv)==1 and argv[0] in ('--offline-contract','--owned-fixture-proof'),'arbitrary DSNs/arguments forbidden')
    return argv[0]

def clean_environment(home):
    # Allowlist, never copy os.environ. Clears PG*, Docker routing, HOME startup files.
    return {'PATH':'/usr/bin:/bin','HOME':home,'DOCKER_CONFIG':home}

def verify_inspection(meta,cid,nonce,image_id):
    require(meta.get('Id')==cid,'container identity mismatch')
    require(meta.get('Image')==image_id,'image identity mismatch')
    require(meta.get('Config',{}).get('Labels',{}).get('assembl.atomic.nonce')==nonce,'ownership mismatch')
    require(meta.get('HostConfig',{}).get('NetworkMode')=='none','network isolation mismatch')
    require(not meta.get('HostConfig',{}).get('PortBindings'),'published ports forbidden')
    require(set(meta.get('NetworkSettings',{}).get('Networks',{})).issubset({'none'}),'attached network forbidden')
    require(not meta.get('HostConfig',{}).get('CapAdd'),'added capabilities forbidden')
    require(not meta.get('HostConfig',{}).get('Privileged'),'privileged container forbidden')
    require(not meta.get('HostConfig',{}).get('Binds'),'host binds forbidden')
    require(not meta.get('HostConfig',{}).get('VolumesFrom'),'inherited volumes forbidden')
    require(not meta.get('HostConfig',{}).get('PidMode') and meta.get('HostConfig',{}).get('IpcMode') in ('',None,'private'),'host namespaces forbidden')
    require(all(m.get('Type')=='tmpfs' and m.get('Destination') in ('/var/lib/postgresql/data',SOCKET) for m in meta.get('Mounts',[])),'unexpected mounts')
    tmpfs=meta.get('HostConfig',{}).get('Tmpfs',{})
    require(set(tmpfs)=={'/var/lib/postgresql/data',SOCKET},'fresh tmpfs required')

class Failure(RuntimeError):
    def __init__(self,code,message): self.code=code;self.message=message;super().__init__(code+': '+message)

def parse_failure(stderr):
    match=re.search(r'ERROR:\s+([A-Z0-9]{5}):\s+([^\n]+)',stderr)
    require(match is not None,'unclassified fixture error (never accepted as expected failure)')
    return Failure(match.group(1),match.group(2).strip())

def expect_failure(action,code,message):
    try: action()
    except Failure as exc:
        require(exc.code==code and exc.message==message,'wrong expected failure: '+str(exc))
        return
    raise RuntimeError('expected rejection did not occur')

class Session:
    def __init__(self,owner,name):
        self.owner=owner;self.closed=False;owner.sessions.append(self)
        owner.verify()
        self.proc=subprocess.Popen(owner.psql_args(name),env=owner.env,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,bufsize=0)
        self.sel=selectors.DefaultSelector();self.sel.register(self.proc.stdout,selectors.EVENT_READ);self.buffer=b''
        self.identity=owner.identity_for(self)
        require(self.identity==owner.identity,'session server identity mismatch')
    def send(self,sql):
        require(not self.closed,'session closed');self.proc.stdin.write((sql+'\n').encode());self.proc.stdin.flush()
    def read_until(self,marker,timeout=5):
        deadline=time.monotonic()+timeout;lines=[]
        while time.monotonic()<deadline:
            while b'\n' in self.buffer:
                raw,self.buffer=self.buffer.split(b'\n',1);line=raw.decode()
                if line==marker:return '\n'.join(lines)
                lines.append(line)
            if self.sel.select(.05):
                chunk=os.read(self.proc.stdout.fileno(),65536)
                if chunk:self.buffer+=chunk
                elif self.proc.poll() is not None:raise parse_failure(self.proc.stderr.read().decode())
        raise RuntimeError('fixture barrier timeout')
    def query(self,sql):
        marker='barrier_'+uuid.uuid4().hex
        self.send(sql+"; SELECT '"+marker+"';")
        return self.read_until(marker)
    def close(self):
        if self.closed:return
        self.closed=True
        if self.proc.poll() is None:
            self.proc.terminate()
            try:self.proc.wait(timeout=2)
            except subprocess.TimeoutExpired:self.proc.kill();self.proc.wait(timeout=2)
        self.sel.close()
        for stream in (self.proc.stdin,self.proc.stdout,self.proc.stderr):stream.close()

class OwnedFixture:
    def __init__(self):
        self.nonce=uuid.uuid4().hex;self.cid=None;self.sessions=[];self.identity=None;self.closed=False
        self.home=tempfile.TemporaryDirectory(prefix='atomic-proof-config-');self.env=clean_environment(self.home.name)
        self.docker_base=[DOCKER,'--host',ENDPOINT,'--config',self.home.name]
        self.image_id=None
        require(os.environ.get('GITHUB_ACTIONS')=='true','owned proof requires separately approved ephemeral CI runner')
        self.run_id=os.environ.get('GITHUB_RUN_ID','');self.attempt=os.environ.get('GITHUB_RUN_ATTEMPT','')
        require(re.fullmatch('[0-9]+',self.run_id) and re.fullmatch('[0-9]+',self.attempt),'invalid CI run identity')
        runner_temp=pathlib.Path(os.environ.get('RUNNER_TEMP',''))
        require(runner_temp.is_absolute() and runner_temp.is_dir(),'trusted runner temp required')
        self.record_dir=runner_temp/'atomic-ingestion-proof';self.record_dir.mkdir(exist_ok=True)
        self.record=self.record_dir/'owner.json'
        require(not self.record.exists(),'proof ownership record already exists; do not adopt/reuse')
        self.evidence={'image_reference':IMAGE,'sql_sha256':digest(SQL),'harness_sha256':digest(__file__),'transport':'owned network-none container, fixed Unix socket, env allowlist','python_version':sys.version,'python_executable_sha256':digest(sys.executable)}
        atexit.register(self.close)
    def docker(self,args,check=True):
        result=subprocess.run(self.docker_base+args,env=self.env,text=True,capture_output=True,timeout=10)
        if check:require(result.returncode==0,'docker operation failed: '+result.stderr)
        return result
    def save_record(self,name):
        record={'name':name,'nonce':self.nonce,'run_id':self.run_id,'attempt':self.attempt,'container_id':self.cid,'image_id':self.image_id,'image_reference':IMAGE}
        tmp=self.record.with_suffix('.tmp');tmp.write_text(json.dumps(record));os.replace(tmp,self.record)
    def create(self):
        # Future runner must pre-provision the reviewed image. No pull/install fallback.
        image=json.loads(self.docker(['image','inspect',IMAGE]).stdout)[0]
        self.image_id=image['Id'];require(IMAGE.split('@')[1] in [d.split('@')[-1] for d in image.get('RepoDigests',[])],'image digest mismatch')
        name='assembl-atomic-'+self.nonce;self.save_record(name)
        r=self.docker(['create','--pull=never','--name',name,'--network','none','--label','assembl.atomic.nonce='+self.nonce,'--label','assembl.atomic.run='+self.run_id,'--label','assembl.atomic.attempt='+self.attempt,
        '--tmpfs','/var/lib/postgresql/data:rw,size=128m','--tmpfs',SOCKET+':rw,size=8m',
        '--memory','256m','--cpus','1','--pids-limit','128','--env','POSTGRES_DB='+DATABASE,'--env','POSTGRES_HOST_AUTH_METHOD=trust',IMAGE,
        'postgres','-c',"listen_addresses=",'-c','unix_socket_directories='+SOCKET])
        self.cid=r.stdout.strip();require(re.fullmatch('[0-9a-f]{64}',self.cid),'invalid created container ID')
        self.save_record(name);self.verify();self.docker(['start',self.cid])
        deadline=time.monotonic()+30
        while time.monotonic()<deadline:
            ready=self.docker(['exec',self.cid,'env','-i','PATH=/usr/local/bin:/usr/bin:/bin','pg_isready','-h',SOCKET,'-p','5432','-U','postgres','-d',DATABASE],check=False)
            if ready.returncode==0:break
            time.sleep(.1)
        else:raise RuntimeError('owned fixture readiness timeout')
        # Identity comes from newly CREATED exact container, not arbitrary DB metadata.
        self.identity=json.loads(self.raw(self.identity_sql()))
        require(self.identity['database']==DATABASE and self.identity['user']=='postgres' and self.identity['address'] is None,'wrong database/socket identity')
        require(self.identity['data_directory']=='/var/lib/postgresql/data','data directory mismatch')
        require(self.identity['version']=='170011','server version mismatch')
        self.evidence.update({'container_id':self.cid,'image_id':self.image_id,'isolation':self.verify(),'server_identity':self.identity})
        self.raw("CREATE SCHEMA fixture_identity; CREATE TABLE fixture_identity.marker(nonce text PRIMARY KEY); INSERT INTO fixture_identity.marker VALUES("+lit(self.nonce)+")")
        self.evidence['psql_driver']=self.docker(['exec',self.cid,'env','-i','PATH=/usr/local/bin:/usr/bin:/bin','psql','--version']).stdout.strip()
        self.evidence['psql_driver_sha256']=self.docker(['exec',self.cid,'env','-i','PATH=/usr/local/bin:/usr/bin:/bin','sha256sum','/usr/local/bin/psql']).stdout.strip().split()[0]
    def verify(self):
        require(self.cid is not None,'no task-owned instance')
        meta=json.loads(self.docker(['inspect',self.cid]).stdout)[0]
        verify_inspection(meta,self.cid,self.nonce,self.image_id)
        require(meta['Config']['Labels'].get('assembl.atomic.run')==self.run_id and meta['Config']['Labels'].get('assembl.atomic.attempt')==self.attempt,'run ownership mismatch')
        return {'network':meta['HostConfig']['NetworkMode'],'ports':meta['HostConfig'].get('PortBindings'),'mounts':meta.get('Mounts',[]),'tmpfs':meta['HostConfig']['Tmpfs'],'nonce':self.nonce}
    def psql_args(self,name):
        require(re.fullmatch('atomic-[a-z0-9-]+',name) is not None,'invalid application name')
        # No URI, external args, inherited PG*, shell, service or hostaddr.
        return self.docker_base+['exec','-i',self.cid,'env','-i','PATH=/usr/local/bin:/usr/bin:/bin','HOME=/tmp','PGAPPNAME='+name,
        'PGOPTIONS=-c statement_timeout=5000 -c lock_timeout=3000','psql','-X','-qAt','-v','ON_ERROR_STOP=1','-v','VERBOSITY=verbose','-h',SOCKET,'-p','5432','-U','postgres','-d',DATABASE]
    def raw(self,sql):
        self.verify();r=subprocess.run(self.psql_args('atomic-query'),env=self.env,input=sql+';\n',text=True,capture_output=True,timeout=8)
        if r.returncode:raise parse_failure(r.stderr)
        return r.stdout.strip()
    def identity_sql(self):
        return "SELECT json_build_object('database',current_database(),'user',current_user,'address',inet_server_addr(),'version',current_setting('server_version_num'),'data_directory',current_setting('data_directory'),'system_identifier',(SELECT system_identifier::text FROM pg_control_system()))"
    def identity_for(self,session):
        identity=json.loads(session.query(self.identity_sql()))
        marker=session.query('SELECT nonce FROM fixture_identity.marker')
        require(marker==self.nonce,'instance nonce mismatch');return identity
    def query(self,sql):
        self.verify();identity=json.loads(self.raw(self.identity_sql()));require(identity==self.identity,'server instance changed')
        require(self.raw('SELECT nonce FROM fixture_identity.marker')==self.nonce,'instance nonce mismatch')
        return self.raw(sql)
    def close(self):
        if self.closed:return
        self.closed=True
        errors=[]
        for s in self.sessions:
            try:s.close()
            except Exception as exc:errors.append(str(exc))
        if self.cid:
            try:
                meta=json.loads(self.docker(['inspect',self.cid]).stdout)[0]
                require(meta.get('Id')==self.cid and meta.get('Image')==self.image_id and meta.get('Config',{}).get('Labels',{}).get('assembl.atomic.nonce')==self.nonce and meta['Config']['Labels'].get('assembl.atomic.run')==self.run_id and meta['Config']['Labels'].get('assembl.atomic.attempt')==self.attempt,'cleanup ownership mismatch')
                self.docker(['rm','--force','--volumes',self.cid])
            except Exception as exc:errors.append(str(exc))
        self.home.cleanup()
        if errors:raise RuntimeError('cleanup failed: '+'; '.join(errors))

SCHEMA="""
CREATE TABLE public.kb_sources(id uuid PRIMARY KEY,active boolean DEFAULT true,status text DEFAULT 'error',last_checked_at timestamptz,last_successful_fetch timestamptz,last_updated_at timestamptz,consecutive_failures integer DEFAULT 0);
CREATE TABLE public.kb_source_runs(id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,source_id uuid REFERENCES public.kb_sources(id),status text DEFAULT 'running',started_at timestamptz DEFAULT clock_timestamp(),finished_at timestamptz,new_docs integer DEFAULT 0,updated_docs integer DEFAULT 0,error jsonb);
CREATE FUNCTION public.fixture_legacy_trigger() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.finished_at IS NOT NULL AND NEW.status='ok' THEN UPDATE public.kb_sources SET last_successful_fetch=NEW.finished_at WHERE id=NEW.source_id; END IF; RETURN NEW; END $$;
CREATE TRIGGER trg_kb_source_runs_reliability AFTER INSERT OR UPDATE ON public.kb_source_runs FOR EACH ROW EXECUTE FUNCTION public.fixture_legacy_trigger();
"""

def start_sql(sid,key):return 'SELECT public.kb_start_ingestion_proposal('+lit(sid)+','+lit(key)+')'
def finish_sql(a,outcome='ok',added=1,updated=0):return 'SELECT public.kb_finalize_ingestion_proposal('+','.join(map(lit,[a['source_id'],a['run_id'],a['attempt_version'],outcome,added,updated]))+')'
def lookup_sql(a):return 'SELECT public.kb_ingestion_receipt_proposal('+','.join(map(lit,[a['source_id'],a['run_id'],a['attempt_version']]))+')'

def prove(f):
    passed=[]
    def mark(name):passed.append(name)
    def query(sql):return f.query(sql)
    def js(sql):return json.loads(query(sql))
    def source():
        sid=str(uuid.uuid4());query("INSERT INTO public.kb_sources(id,last_checked_at,last_successful_fetch,last_updated_at) VALUES("+lit(sid)+",'2026-09-13','2026-09-13','2026-09-13')");return sid
    def start(sid,key=None):return js(start_sql(sid,key or str(uuid.uuid4())))
    def finish(a,**kwargs):return js(finish_sql(a,**kwargs))
    def health(sid):return js('SELECT to_jsonb(s) FROM public.kb_sources s WHERE id='+lit(sid))
    def snapshot(sid):return js("SELECT json_build_object('source',(SELECT to_jsonb(s) FROM public.kb_sources s WHERE id="+lit(sid)+"),'runs',(SELECT coalesce(jsonb_agg(to_jsonb(r) ORDER BY id),'[]') FROM public.kb_source_runs r WHERE source_id="+lit(sid)+'))')
    require(query("SELECT count(*) FROM pg_class WHERE relnamespace='public'::regnamespace")=='0','public fixture must be empty')
    require(query("SELECT count(*) FROM pg_proc WHERE pronamespace='public'::regnamespace")=='0','public routines must be empty')
    query('BEGIN;'+SCHEMA+SQL.read_text()+'COMMIT;')
    sid=source();key=str(uuid.uuid4());a=start(sid,key);same=start(sid,key);require(a==same,'start identity changed');require(health(sid)['ingestion_version']==1,'duplicate version');mark('atomic start idempotency')
    ack_sid=source();ack_key=str(uuid.uuid4());query(start_sql(ack_sid,ack_key)) # discard committed start response intentionally
    recovered_start=start(ack_sid,ack_key);require(health(ack_sid)['ingestion_version']==1 and recovered_start['start_key']==ack_key,'start discard recovery failed');mark('discarded start result recovery')
    before=snapshot(sid)
    for sql,code,message in [(start_sql(sid,None),'P7100','invalid start arguments'),(finish_sql(a,added=-1),'P7100','invalid finalization arguments'),(finish_sql(a,outcome=None),'P7100','invalid finalization arguments')]:
        expect_failure(lambda sql=sql:query(sql),code,message);require(snapshot(sid)==before,'invalid args mutated state')
    query('UPDATE public.kb_sources SET active=NULL WHERE id='+lit(sid));before=snapshot(sid)
    expect_failure(lambda:start(sid),'P7106','source inactive');require(snapshot(sid)==before,'null-active start mutated state')
    query('UPDATE public.kb_sources SET active=true WHERE id='+lit(sid));query('UPDATE public.kb_source_runs SET status=NULL WHERE id='+lit(a['run_id']));before=snapshot(sid)
    expect_failure(lambda:finish(a),'P7104','invalid run state');require(snapshot(sid)==before,'null-status finalize mutated state')
    query("UPDATE public.kb_source_runs SET status='running' WHERE id="+lit(a['run_id']))
    for assignment in ["status=NULL","active=NULL","active=false"]:
        query('UPDATE public.kb_sources SET '+assignment+' WHERE id='+lit(sid));before=snapshot(sid)
        expect_failure(lambda:finish(a),'P7104','invalid run state');require(snapshot(sid)==before,'source guard mutated state')
        query("UPDATE public.kb_sources SET status='running',active=true WHERE id="+lit(sid))
    mark('invalid arguments and null guards')
    receipt=finish(a);stored=js(lookup_sql(a));require(receipt==stored,'returned receipt not stored');again=finish(a);require(again==receipt,'retry changed receipt')
    expect_failure(lambda:finish(a,added=2),'P7103','conflicting finalization retry')
    b=start(sid);finish(b);before=snapshot(sid);old=js(lookup_sql(a));retry=finish(a);require(old==receipt and retry==receipt and snapshot(sid)==before,'old receipt changed newer health');mark('stored receipt and historical recovery')
    a=start(sid);b=start(sid);finish(b);before=health(sid);superseded=finish(a);require(superseded['state']=='superseded' and health(sid)==before,'superseded health mutation')
    a=start(sid);old=health(sid);start(sid)
    fields=['status','last_checked_at','last_successful_fetch','last_updated_at','consecutive_failures'];query('UPDATE public.kb_sources SET '+','.join(k+'='+lit(old[k]) for k in fields)+' WHERE id='+lit(sid));before=health(sid)
    superseded=finish(a);require(superseded['state']=='superseded' and health(sid)==before,'ABA revived ownership');mark('superseded and full health ABA')
    a=start(sid);before=health(sid);finish(a,outcome='error',added=0);after=health(sid);require(after['last_successful_fetch']==before['last_successful_fetch'] and after['last_updated_at']==before['last_updated_at'],'error advanced freshness')
    a=start(sid);before=health(sid);finish(a,added=0);after=health(sid);require(after['last_successful_fetch']>=before['last_successful_fetch'] and after['last_updated_at']==before['last_updated_at'],'unchanged content timestamp');mark('error and unchanged freshness')
    # Inject BEFORE suppression/rewrites/raises at every start/final source/run write.
    for operation,table,event in [('start','kb_sources','UPDATE'),('start','kb_source_runs','INSERT'),('finish','kb_sources','UPDATE'),('finish','kb_source_runs','UPDATE')]:
        for mode in ['raise','suppress','rewrite']:
            sid=source();a=start(sid) if operation=='finish' else None;before=snapshot(sid)
            body="RAISE EXCEPTION USING ERRCODE='P7190',MESSAGE='fixture injected failure';" if mode=='raise' else 'RETURN NULL;' if mode=='suppress' else "NEW.status:='unexpected'; RETURN NEW;"
            query('CREATE FUNCTION public.fixture_fault() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN '+body+' END $$;CREATE TRIGGER z_fixture_fault BEFORE '+event+' ON public.'+table+' FOR EACH ROW EXECUTE FUNCTION public.fixture_fault();')
            try:
                expected='start write contract violated' if operation=='start' else 'finalization write contract violated'
                expect_failure(lambda:finish(a) if operation=='finish' else start(sid),'P7190' if mode=='raise' else 'P7105','fixture injected failure' if mode=='raise' else expected)
                require(snapshot(sid)==before,'fault did not roll back '+operation+'/'+table+'/'+mode)
            finally:query('DROP TRIGGER z_fixture_fault ON public.'+table+';DROP FUNCTION public.fixture_fault();')
    mark('raised suppressed rewritten writes roll back')
    # AFTER source rewrites may not be reflected in RETURNING, requiring reread.
    for operation in ['start','finish']:
        sid=source();a=start(sid) if operation=='finish' else None;before=snapshot(sid)
        query("CREATE FUNCTION public.fixture_after_source() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF pg_trigger_depth()=1 THEN UPDATE public.kb_sources SET status='unexpected' WHERE id=NEW.id; END IF; RETURN NEW; END $$; CREATE TRIGGER z_fixture_after_source AFTER UPDATE ON public.kb_sources FOR EACH ROW EXECUTE FUNCTION public.fixture_after_source();")
        try:
            expect_failure(lambda:finish(a) if operation=='finish' else start(sid),'P7105','start write contract violated' if operation=='start' else 'finalization write contract violated')
            require(snapshot(sid)==before,'AFTER source rewrite survived')
        finally:query('DROP TRIGGER z_fixture_after_source ON public.kb_sources;DROP FUNCTION public.fixture_after_source();')
    # AFTER insert rewrite of the run must also be detected by stored-row validation.
    sid=source();before=snapshot(sid)
    query("CREATE FUNCTION public.fixture_after_insert() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN UPDATE public.kb_source_runs SET status='unexpected' WHERE id=NEW.id; RETURN NEW; END $$; CREATE TRIGGER z_fixture_after_insert AFTER INSERT ON public.kb_source_runs FOR EACH ROW EXECUTE FUNCTION public.fixture_after_insert();")
    try:
        expect_failure(lambda:start(sid),'P7105','start write contract violated');require(snapshot(sid)==before,'AFTER run insert rewrite survived')
    finally:query('DROP TRIGGER z_fixture_after_insert ON public.kb_source_runs;DROP FUNCTION public.fixture_after_insert();')
    mark('AFTER-source and inserted-run rewrite rollback')
    # AFTER run trigger rewriting source health must be caught by final persisted reread.
    sid=source();a=start(sid);before=snapshot(sid)
    query("CREATE FUNCTION public.fixture_after() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN UPDATE public.kb_sources SET status='unexpected' WHERE id=NEW.source_id; RETURN NEW; END $$; CREATE TRIGGER z_fixture_after AFTER UPDATE ON public.kb_source_runs FOR EACH ROW EXECUTE FUNCTION public.fixture_after();")
    try:expect_failure(lambda:finish(a),'P7105','finalization write contract violated');require(snapshot(sid)==before,'AFTER rewrite survived')
    finally:query('DROP TRIGGER z_fixture_after ON public.kb_source_runs;DROP FUNCTION public.fixture_after();')
    require(query("SELECT count(*) FROM pg_trigger WHERE tgname='trg_kb_source_runs_reliability' AND NOT tgisinternal")=='0','legacy writer retained');mark('trigger interaction and persisted source reread')
    # Direct legacy completion and finished-row mutation must fail with exact fence errors.
    sid=source();pending=start(sid);before=snapshot(sid)
    expect_failure(lambda:query("UPDATE public.kb_source_runs SET status='ok',finished_at=clock_timestamp() WHERE id="+lit(pending['run_id'])),'P7108','completion requires receipt')
    require(snapshot(sid)==before,'direct completion fence changed state')
    completed=finish(pending);before=snapshot(sid)
    expect_failure(lambda:query('UPDATE public.kb_source_runs SET new_docs=999 WHERE id='+lit(pending['run_id'])),'P7107','immutable finished run')
    require(snapshot(sid)==before and js(lookup_sql(pending))==completed,'immutable fence changed receipt or health')
    mark('P7107/P7108 direct-completion fence rejection')
    # Fresh docker-exec psql connection after intentionally discarding a committed result.
    sid=source();a=start(sid);finish(a) # intentionally discard result; no wire-fault claim
    receipt=js(lookup_sql(a));retry=finish(a);require(receipt==retry and receipt['state']=='committed','fresh-connection recovery mismatch');mark('discarded-result fresh-connection recovery')
    concurrency(f,source,start,finish,health,query,mark)
    f.evidence['passed_cases']=passed
    return f.evidence

def concurrency(f,source,start,finish,health,query,mark):
    def session(name):return Session(f,name)
    def holder(sid):
        h=session('atomic-holder');h.query('BEGIN;SELECT id FROM public.kb_sources WHERE id='+lit(sid)+' FOR UPDATE');return h
    def worker(sql,name):
        s=session(name);pid=int(s.query('SELECT pg_backend_pid()'));marker='result_'+uuid.uuid4().hex;s.send(sql+";SELECT '"+marker+"';");return s,pid,marker
    def blocked(pid):
        deadline=time.monotonic()+2
        while time.monotonic()<deadline:
            observed=query("SELECT EXISTS(SELECT 1 FROM pg_stat_activity a JOIN pg_locks l ON a.pid=l.pid WHERE a.pid="+str(pid)+" AND a.datname=current_database() AND a.wait_event_type='Lock' AND NOT l.granted)")
            if observed=='t':return
            time.sleep(.01)
        raise RuntimeError('no actual overlapping blocked worker')
    def result(w):return json.loads(w[0].read_until(w[2]))
    # Hold source lock before workers; observe both blocked before holder writes/releases.
    sid=source();key=str(uuid.uuid4());h=holder(sid);w1=w2=None
    try:
        w1=worker(start_sql(sid,key),'atomic-start-one');w2=worker(start_sql(sid,key),'atomic-start-two');blocked(w1[1]);blocked(w2[1]);h.query('COMMIT')
        a=result(w1);b=result(w2);require(a==b and health(sid)['ingestion_version']==1,'duplicate start single winner failed')
    finally:
        h.close()
        for w in (w1,w2):
            if w:w[0].close()
    mark('observed concurrent duplicate starts single winner')
    # Start-first: blocked old finalizer sees holder allocate and finish new version.
    sid=source();a=start(sid);h=holder(sid);w=None;w1=w2=None
    try:
        w=worker(finish_sql(a),'atomic-finish-old');blocked(w[1]);h.query('SELECT id FROM public.kb_source_runs WHERE id='+lit(a['run_id'])+' FOR UPDATE NOWAIT')
        b=json.loads(h.query(start_sql(sid,str(uuid.uuid4()))));h.query(finish_sql(b));h.query('COMMIT');before=health(sid)
        old=result(w);require(old['state']=='superseded' and health(sid)==before,'start-first supersession')
    finally:
        h.close()
        if w:w[0].close()
    mark('observed start-first and source-before-run locking')
    # Finish-first: blocked later start overlaps holder finalization.
    sid=source();a=start(sid);h=holder(sid);w=None;w1=w2=None
    try:
        w=worker(start_sql(sid,str(uuid.uuid4())),'atomic-start-later');blocked(w[1]);receipt=json.loads(h.query(finish_sql(a)));h.query('COMMIT');b=result(w)
        recovered=json.loads(query(lookup_sql(a)));require(b['attempt_version']==a['attempt_version']+1 and receipt==recovered,'finish-first receipt')
    finally:
        h.close()
        if w:w[0].close()
    mark('observed finish-first overlap')
    # Identical concurrent finalizers: two replies, one durable completion/counter effect.
    sid=source();a=start(sid);h=holder(sid);w=None;w1=w2=None
    try:
        w1=worker(finish_sql(a),'atomic-final-one');w2=worker(finish_sql(a),'atomic-final-two');blocked(w1[1]);blocked(w2[1]);h.query('COMMIT')
        r1=result(w1);r2=result(w2);require(r1==r2 and r1==json.loads(query(lookup_sql(a))),'identical finalizer identity')
    finally:
        h.close()
        for w in (w1,w2):
            if w:w[0].close()
    mark('observed identical concurrent finalizers')
    # Conflicting concurrent finalizers: nondeterministic winner, exact conflict loser.
    sid=source();a=start(sid);h=holder(sid);w=None;w1=w2=None
    try:
        w1=worker(finish_sql(a,added=1),'atomic-conflict-one');w2=worker(finish_sql(a,added=2),'atomic-conflict-two');blocked(w1[1]);blocked(w2[1]);h.query('COMMIT')
        outcomes=[]
        for w in (w1,w2):
            try:outcomes.append(('ok',result(w)))
            except Failure as exc:require(exc.code=='P7103' and exc.message=='conflicting finalization retry','wrong concurrency failure');outcomes.append(('conflict',None))
        require(sum(x[0]=='ok' for x in outcomes)==1 and sum(x[0]=='conflict' for x in outcomes)==1,'conflict single winner')
        winner=next(x[1] for x in outcomes if x[0]=='ok');require(winner==json.loads(query(lookup_sql(a))),'winner receipt not persisted')
    finally:
        h.close()
        for w in (w1,w2):
            if w:w[0].close()
    mark('observed conflicting concurrent finalizers single winner')

    # ERROR completions must increment failure counter once under identical/conflicting races.
    for identical in (True,False):
        sid=source();a=start(sid);before=health(sid);h=holder(sid);w1=w2=None
        try:
            w1=worker(finish_sql(a,outcome='error',added=0),'atomic-error-one')
            w2=worker(finish_sql(a,outcome='error',added=0 if identical else 1),'atomic-error-two')
            blocked(w1[1]);blocked(w2[1]);h.query('COMMIT');outcomes=[]
            for w in (w1,w2):
                try:outcomes.append(('ok',result(w)))
                except Failure as exc:
                    require(not identical and exc.code=='P7103' and exc.message=='conflicting finalization retry','wrong ERROR-finalizer rejection');outcomes.append(('conflict',None))
            receipts=[r for state,r in outcomes if state=='ok']
            require(len(receipts)==(2 if identical else 1),'ERROR finalizer winner count')
            require(all(r==receipts[0] for r in receipts),'identical ERROR receipts differ')
            stored=json.loads(query(lookup_sql(a)));after=health(sid)
            require(stored==receipts[0] and stored['payload']['outcome']=='error','ERROR stored receipt identity')
            require(after['consecutive_failures']==before['consecutive_failures']+1,'ERROR counter incremented more/less than once')
            require(after['last_successful_fetch']==before['last_successful_fetch'] and after['last_updated_at']==before['last_updated_at'],'ERROR race advanced freshness')
        finally:
            h.close()
            for w in (w1,w2):
                if w:w[0].close()
        mark('observed '+('identical' if identical else 'conflicting')+' concurrent ERROR finalizers increment once')

def offline_contract():
    # No Docker, subprocess, libpq or SQL execution. Tests pure boundary functions.
    count=0
    def check(value,message):
        nonlocal count;require(value,message);count+=1
    dirty={'PGHOSTADDR':'production.invalid','PGSERVICE':'external','PGDATABASE':'postgres://external','HOME':'external','DOCKER_HOST':'tcp://external','DOCKER_CONTEXT':'external'}
    original=os.environ.copy()
    try:os.environ.update(dirty);check(clean_environment('/fixture')=={'PATH':'/usr/bin:/bin','HOME':'/fixture','DOCKER_CONFIG':'/fixture'},'environment leak')
    finally:os.environ.clear();os.environ.update(original)
    good={'Id':'owned','Image':'image','Config':{'Labels':{'assembl.atomic.nonce':'nonce'}},'HostConfig':{'NetworkMode':'none','Tmpfs':{'/var/lib/postgresql/data':'rw',SOCKET:'rw'}},'Mounts':[]}
    verify_inspection(good,'owned','nonce','image');check(True,'baseline')
    for field,value in [('NetworkMode','bridge'),('PortBindings',{'5432/tcp':[]}),('Privileged',True),('Binds',['/host:/data']),('VolumesFrom',['other']),('PidMode','host'),('IpcMode','host')]:
        bad=json.loads(json.dumps(good));bad['HostConfig'][field]=value
        try:verify_inspection(bad,'owned','nonce','image')
        except RuntimeError:check(True,'reject '+field)
        else:raise RuntimeError('accepted '+field)
    for key,value in [('Id','other'),('Image','other'),('Mounts',[{'Type':'volume','Destination':'/data'}])]:
        bad=json.loads(json.dumps(good));bad[key]=value
        try:verify_inspection(bad,'owned','nonce','image')
        except RuntimeError:check(True,'reject '+key)
        else:raise RuntimeError('accepted '+key)
    bad=json.loads(json.dumps(good));bad['Config']['Labels']['assembl.atomic.nonce']='other'
    try:verify_inspection(bad,'owned','nonce','image')
    except RuntimeError:check(True,'reject nonce')
    else:raise RuntimeError('accepted nonce')
    for code in ('55P03','57014','42501'):
        try:expect_failure(lambda code=code:(_ for _ in ()).throw(Failure(code,'timeout or permission')),'P7105','finalization write contract violated')
        except RuntimeError:check(True,'reject unexpected failure')
        else:raise RuntimeError('unexpected failure accepted')
    for argv in [['host=localhost hostaddr=203.0.113.1 dbname=assembl_ingestion_fixture'],['postgres://external'],['--owned-fixture-proof','--host=external'],[]]:
        try:validated_mode(argv)
        except RuntimeError:check(True,'reject arbitrary connection input')
        else:raise RuntimeError('arbitrary arguments accepted')
    check('-h' not in clean_environment('/fixture'),'environment is not connection input')
    # Python -O cannot remove these unconditional checks; no assert statement exists.
    print(json.dumps({'offline_boundary_checks_passed':count,'database_executed':False,'docker_executed':False}))

if __name__=='__main__':
    mode=validated_mode(sys.argv[1:])
    if mode=='--offline-contract':offline_contract()
    else:
        fixture=OwnedFixture()
        def terminated(signum,frame):raise KeyboardInterrupt('fixture terminated')
        signal.signal(signal.SIGTERM,terminated);signal.signal(signal.SIGINT,terminated)
        try:fixture.create();evidence=prove(fixture);print(json.dumps(evidence,indent=2))
        finally:fixture.close()
