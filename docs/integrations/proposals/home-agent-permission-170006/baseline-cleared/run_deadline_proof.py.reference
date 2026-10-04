"""Review-only entrypoint. Runs only on separately approved existing owned Linux CI fixture."""
import importlib.util,pathlib,sys,json,time,subprocess,hashlib,dataclasses
ROOT=pathlib.Path(__file__).resolve().parent
sys.path.insert(0,str(ROOT))
from build_queries import generate
from live_client import Live
from budget import Budget
spec=importlib.util.spec_from_file_location('owned',ROOT/'owned-fixture/run_fixture.py')
owned=importlib.util.module_from_spec(spec);sys.modules['owned']=owned;spec.loader.exec_module(owned)

def require(x,m):owned.require(x,m)
SUCCESS=b'fixture_commit_request_completed\n'
CONNECTION_END=(b'server closed the connection unexpectedly\n'
 b'\tThis probably means the server terminated abnormally\n'
 b'\tbefore or while processing the request.\nconnection to server was lost\n')
def exact_error(r,message):
 require((r.code,r.stdout,r.stderr)==(1,b'',('ERROR:  '+message+'\n').encode()),'exact SQL rejection contract mismatch')
def exact_timeout(r,kind,stdout=b''):
 expected=('FATAL:  terminating connection due to '+kind+' timeout\n').encode()+CONNECTION_END
 require((r.code,r.stdout,r.stderr)==(2,stdout,expected),'exact timeout contract mismatch')
def exact_success(r):require((r.code,r.stdout,r.stderr)==(0,SUCCESS,b''),'exact success contract mismatch')
class Proof(owned.Fixture):
 @property
 def budget(self):
  if not hasattr(self,'_budget'):self._budget=Budget(self.deadline)
  return self._budget
 def end(self,seconds):return self.budget.end(seconds)
 def docker(self,args,data=None,seconds=10):
  with self.budget.phase(seconds):
   result=super().docker(args,data,seconds)
   self.budget.check();return result
 def raw(self,data,user='postgres',database='acl_fixture'):
  with self.budget.phase(8):
   result=super().raw(data,user,database)
   self.budget.check();return result
 def verify_server(self):
  with self.budget.phase(8):
   super().verify_server();self.budget.check()
 def args(self):
  a=self.psql_args();i=a.index('PGAPPNAME=home-client-fixture');a[i]='PGAPPNAME=home-client-no-prompt';return a
 def query(self,data,phase,seconds=35):
  with self.budget.phase(seconds) as end:
   self.verify_server()
   r=owned.run_bounded(self.args()+['-c',data.decode()],self.env,end)
   self.retain(phase,data,r);self.budget.check(end)
   self.dispatches=getattr(self,'dispatches',[])+[phase];return r
 def snapshot_new(self):
  with self.budget.phase(8):
   result=json.loads(self.checked(self.raw((ROOT/'queries/snapshot.sql').read_bytes()),'independent snapshot'))
   self.budget.check();return result
 def disappear(self):
  with self.budget.phase(7) as end:
   data=(ROOT/'queries/backend-observation.sql').read_bytes();started=time.monotonic()
   while time.monotonic()<end:
    state=json.loads(self.checked(self.raw(data),'independent backend/lock observation'))
    self.budget.check(end)
    if state=={'backends':0,'locks':0}:return {'elapsed_seconds':time.monotonic()-started,'state':state}
    time.sleep(min(.1,max(0,end-time.monotonic())))
   raise TimeoutError('backend/locks survived phase deadline')
 def live(self,data):
  client=None
  try:
   with self.budget.phase(3):
    self.verify_server()
    client=Live(self.args(),self.env,self.budget.work_end,cleanup_deadline=self.deadline,deadline_fn=self.budget.end)
    client.send(data);self.budget.check()
    return client
  except BaseException:
   if client is not None:client.close()
   raise
 def wait_lock(self):
  with self.budget.phase(4) as end:
   sql=b"SELECT count(*) FROM pg_catalog.pg_locks l JOIN pg_catalog.pg_stat_activity a ON a.pid=l.pid WHERE a.application_name='home-client-no-prompt' AND l.relation='public.home_agent_log'::regclass AND l.mode='AccessExclusiveLock' AND l.granted;"
   while time.monotonic()<end:
    result=self.checked(self.raw(sql),'lock witness');self.budget.check(end)
    if result==b'1\n':return
    time.sleep(min(.05,max(0,end-time.monotonic())))
   raise TimeoutError('did not witness target lock within phase deadline')

def main():
 generate();f=Proof()
 try:
  f.create();baseline=f.snapshot_new()
  def q(name):return (ROOT/'queries'/name).read_bytes()
  def failure(name,text):
   before=f.snapshot_new();r=f.query(q(name),name)
   exact_timeout(r,'transaction') if name=='active-deadline.sql' else exact_error(r,text)
   f.disappear();require(f.snapshot_new()==before,'failure changed state '+name)
  for name,text in [('wrong-target.sql','Wrong fixture target/executor/version'),('wrong-version.sql','Wrong fixture target/executor/version'),('poststate-drift.sql','Before commit metadata/effective-privilege drift'),('precommit-error.sql','Injected before COMMIT')]:failure(name,text)
  # Independent committed baseline drift; reject action and restore only that fixture drift.
  f.checked(f.raw(b'GRANT SELECT(id) ON public.home_agent_log TO anon;'),'inject baseline drift')
  failure('forward.sql','Pre-action metadata/effective-privilege drift')
  f.checked(f.raw(b'REVOKE SELECT(id) ON public.home_agent_log FROM anon;'),'restore fixture column ACL')
  require(f.snapshot_new()==baseline,'baseline restoration failed')
  exact_success(f.query(q('forward.sql'),'normal-forward'));f.disappear();post=f.snapshot_new()
  require(post!=baseline,'forward did not change privileges')
  exact_success(f.query(q('rollback.sql'),'normal-rollback'));f.disappear();require(f.snapshot_new()==baseline,'rollback snapshot mismatch')
  failure('active-deadline.sql','transaction timeout')
  for name in ['idle-deadline.sql','idle-total-deadline.sql']:
   before=f.snapshot_new();data=q(name);p=f.live(data)
   try:
    f.wait_lock()
    require(p.poll() is None,'client exited before independent idle witness')
    # Do not wait for psql exit: its open stdin reader is independent of server termination.
    server_gone=f.disappear()
    require(p.poll() is None,'client must remain waiting on open input while server deadline is observed')
    require(f.snapshot_new()==before,'server deadline failed to roll back')
    (f.record_dir/(name+'-server-witness.json')).write_text(json.dumps({'server_disappearance':server_gone,'stdin_open':p.stdin_open,'client_still_running':True,'snapshot_unchanged':True},indent=2))
    # Only after independently proving the backend/lock gone, wake the local psql input reader.
    wake=b'SELECT 1;\n'
    p.send(wake);code,out,err=p.collect()
    r=owned.Result(code,out,err);f.retain(name,data,r)
    f.retain(name+'-client-wakeup',wake,r)
    exact_timeout(r,'idle-in-transaction' if name=='idle-deadline.sql' else 'transaction',stdout=b'idle_ready\n')
   finally:p.close()
   f.disappear();require(f.snapshot_new()==before,'idle deadline committed')
  # Lock holder stays on an open input stream; independently witness lock before contender.
  holder=q('lock-holder.sql');before=f.snapshot_new();p=f.live(holder)
  try:
   f.wait_lock();r=f.query(q('lock-wait.sql'),'lock-wait',seconds=8)
   exact_error(r,'canceling statement due to lock timeout')
  finally:p.close()
  f.disappear();require(f.snapshot_new()==before,'lock wait changed state')
  # Simulated application-level lost reply AFTER actual COMMIT, not a real wire fault.
  sequence=f.sequence;result=f.query(q('forward.sql'),'lost-reply-committed')
  exact_success(result);result=None
  f.disappear();require(f.snapshot_new()==post,'unknown ACK reconciliation did not show poststate')
  require(f.sequence>sequence,'no retained dispatch evidence');require(f.dispatches.count('lost-reply-committed')==1,'unknown reply replayed')
  # There is exactly one forward dispatch in this case; no write request replay/retry.
  receipt={'case':'lost-reply-after-commit','classification':'unknown','reconciled':'poststate','write_dispatches':1,'wire_fault':False}
  (f.record_dir/'lost-reply-no-retry.json').write_text(json.dumps(receipt,indent=2))
  exact_success(f.query(q('rollback.sql'),'cleanup-rollback'))
  f.disappear();require(f.snapshot_new()==baseline,'final snapshot mismatch')
 finally:f.close()
if __name__=='__main__':main()
