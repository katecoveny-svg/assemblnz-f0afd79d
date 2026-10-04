"""Offline contract tests: mocked daemon metadata and benign Python pipe peers only.
Never starts Docker, psql, a database, a network or the owned-fixture mode."""
import copy,json,os,pathlib,sys,tempfile,time,unittest
from unittest.mock import patch
import run_fixture as m
class Offline(unittest.TestCase):
 def owner(self,cid=None):
  return {'nonce':'a'*32,'name':'assembl-home-client-'+'a'*32,'run_id':'37160214912','attempt':'1','image_id':m.IMAGE_ID,'container_id':cid}
 def meta(self):
  o=self.owner();return {'Id':'b'*64,'Name':'/'+o['name'],'Image':m.IMAGE_ID,
   'Config':{'Labels':{'assembl.atomic.nonce':o['nonce'],'assembl.atomic.run':o['run_id'],'assembl.atomic.attempt':o['attempt']}},
   'HostConfig':{'NetworkMode':'none','Tmpfs':{'/var/lib/postgresql/data':'rw',m.SOCKET:'rw'},
    'Memory':256*1024*1024,'NanoCpus':1000000000,'PidsLimit':128,'IpcMode':'private'},
   'Mounts':[],'NetworkSettings':{'Networks':{'none':{}}}}
 def child(self,source,seconds=2,gate=False,limit=m.OUTPUT_LIMIT,data=None):
  with tempfile.TemporaryDirectory() as home:
   return m.run_bounded([sys.executable,'-I','-c',source],m.clean_environment(home),
     time.monotonic()+seconds,data,gate,limit)
 def test_environment_allowlist(self):
  dirty={'DOCKER_HOST':'tcp://remote','DOCKER_CONTEXT':'remote','DOCKER_CONFIG':'/bad',
   'PGHOST':'remote','PGSERVICE':'remote','PYTHONPATH':'/bad','LD_PRELOAD':'/bad'}
  with patch.dict(os.environ,dirty):
   self.assertEqual(m.clean_environment('/private'),{'PATH':'/usr/bin:/bin','HOME':'/private','DOCKER_CONFIG':'/private'})
 def test_fixed_transport_source(self):
  self.assertEqual(m.DOCKER,'/usr/bin/docker');self.assertEqual(m.ENDPOINT,'unix:///var/run/docker.sock')
  source=(m.ROOT/'run_fixture.py').read_text()
  self.assertNotIn("['docker'",source);self.assertNotIn('os.environ.copy()',source)
  self.assertNotIn("'--pull=always'",source);self.assertNotIn("'--volume'",source)
  self.assertIn("'psql package ownership mismatch'",source);self.assertIn("'psql version identity mismatch'",source)
 def test_ownership_checks(self):
  m.verify_inspection(self.meta(),'b'*64,self.owner())
  for change in ('cid','nonce','run','image','name','network','bind','privileged','memory','mount'):
   with self.subTest(change=change):
    x=self.meta()
    if change=='cid':x['Id']='c'*64
    if change=='nonce':x['Config']['Labels']['assembl.atomic.nonce']='c'*32
    if change=='run':x['Config']['Labels']['assembl.atomic.run']='99'
    if change=='image':x['Image']='wrong'
    if change=='name':x['Name']='/other'
    if change=='network':x['HostConfig']['NetworkMode']='bridge'
    if change=='bind':x['HostConfig']['Binds']=['/host:/inside']
    if change=='privileged':x['HostConfig']['Privileged']=True
    if change=='memory':x['HostConfig']['Memory']=0
    if change=='mount':x['Mounts']=[{'Type':'bind','Destination':'/review'}]
    with self.assertRaises(RuntimeError):m.verify_inspection(x,'b'*64,self.owner())
 def test_cleanup_lost_create_ack(self):
  calls=[]
  def fake(argv,env,deadline,*args,**kw):
   calls.append(argv)
   if len(calls)==1:return m.Result(0,json.dumps([self.meta()]).encode(),b'')
   if len(calls)==2:return m.Result(0,b'b'*64+b'\n',b'')
   return m.Result(1,b'',b'Error: No such object: '+b'b'*64+b'\n')
  with tempfile.TemporaryDirectory() as d,patch.object(m,'run_bounded',side_effect=fake):
   result=m.recover_cleanup(self.owner(),pathlib.Path(d),m.clean_environment(d),[m.DOCKER,'--host',m.ENDPOINT,'--config',d])
  self.assertEqual(calls[0][-1],self.owner()['name'])
  self.assertEqual(calls[1][-1],'b'*64);self.assertEqual(result['state'],'removed')
 def test_cleanup_mismatch_never_removes(self):
  x=self.meta();x['Config']['Labels']['assembl.atomic.nonce']='c'*32
  with tempfile.TemporaryDirectory() as d,patch.object(m,'run_bounded',return_value=m.Result(0,json.dumps([x]).encode(),b'')) as run:
   with self.assertRaisesRegex(RuntimeError,'ownership mismatch'):
    m.recover_cleanup(self.owner(),pathlib.Path(d),{},['fixed'])
   self.assertEqual(run.call_count,1)
   self.assertEqual(json.loads((pathlib.Path(d)/'cleanup.json').read_text())['state'],'unresolved')
 def test_cleanup_daemon_error_not_absence(self):
  with tempfile.TemporaryDirectory() as d,patch.object(m,'run_bounded',return_value=m.Result(1,b'',b'permission denied')) as run:
   with self.assertRaisesRegex(RuntimeError,'not absent'):m.recover_cleanup(self.owner(),pathlib.Path(d),{},['fixed'])
   self.assertEqual(run.call_count,1)
 def test_cleanup_exact_absence_only(self):
  with tempfile.TemporaryDirectory() as d,patch.object(m,'run_bounded',return_value=m.Result(1,b'',('Error: No such object: '+self.owner()['name']).encode())):
   self.assertEqual(m.recover_cleanup(self.owner(),pathlib.Path(d),{},['fixed'])['state'],'owned_container_already_absent')
 def test_cleanup_timeout_unresolved(self):
  with tempfile.TemporaryDirectory() as d,patch.object(m,'run_bounded',side_effect=TimeoutError('mock')):
   with self.assertRaises(TimeoutError):m.recover_cleanup(self.owner(),pathlib.Path(d),{},['fixed'])
   self.assertEqual(json.loads((pathlib.Path(d)/'cleanup.json').read_text())['state'],'unresolved')
 def test_missing_and_duplicate_immutable_gates(self):
  data=(m.ROOT/'forward.sql').read_bytes();m.validate_gate_source(data)
  for changed in [data.replace(b'\\echo '+m.GATE+b'\n',b''),data.replace(b'\\echo '+m.GATE+b'\n',b'\\echo '+m.GATE+b'\n'*1+b'\\echo '+m.GATE+b'\n')]:
   with self.assertRaisesRegex(RuntimeError,'missing/duplicate'):m.validate_gate_source(changed)
 def test_clean_runtime_gate(self):
  r=self.child("import sys;print('ACL_COMMIT_GATE_READY',flush=True);v=input();sys.exit(0 if v=='true' else 4)",gate=True)
  self.assertEqual(r.code,0);self.assertEqual(r.votes,('true',))
 def test_diagnostic_refuses_commit(self):
  r=self.child("import sys;print('WARNING: fixture synthetic diagnostic',flush=True);print('ACL_COMMIT_GATE_READY',flush=True);v=input();sys.exit(4 if v=='false' else 0)",gate=True)
  self.assertEqual(r.code,4);self.assertEqual(r.votes,('false',))
 def test_duplicate_runtime_gate_refuses(self):
  with self.assertRaisesRegex(RuntimeError,'duplicate runtime'):
   self.child("import os,time;os.write(1,b'ACL_COMMIT_GATE_READY\\nACL_COMMIT_GATE_READY\\n');time.sleep(10)",gate=True)
 def test_missing_runtime_gate(self):
  with self.assertRaisesRegex(RuntimeError,'missing runtime'):
   self.child("print('no gate')",gate=True)
 def test_stalled_output_deadline(self):
  start=time.monotonic()
  with self.assertRaises(TimeoutError):self.child("import time;time.sleep(10)",seconds=.15,gate=True)
  self.assertLess(time.monotonic()-start,3)
 def test_partial_output_deadline(self):
  with self.assertRaises(TimeoutError):self.child("import os,time;os.write(1,b'ACL_COMMIT');time.sleep(10)",seconds=.15,gate=True)
 def test_output_limit(self):
  with self.assertRaisesRegex(RuntimeError,'output limit'):self.child("import os;os.write(1,b'x'*20000)",limit=1024)
 def test_bounded_streaming_input(self):
  r=self.child("import sys;data=sys.stdin.buffer.read();print(len(data))",data=b'x'*120000)
  self.assertEqual(r.stdout.strip(),b'120000')
 def test_expired_deadline_does_not_spawn(self):
  with patch.object(m.subprocess,'Popen') as spawn:
   with self.assertRaisesRegex(RuntimeError,'exhausted'):m.run_bounded([],{},time.monotonic()-1)
   spawn.assert_not_called()
 def test_wrong_rejection_reason_never_passes(self):
  reason='Pre-action metadata/effective-privilege drift; abort'
  m.assert_rejection(m.Result(3,b'',('ERROR: '+reason+'\n').encode()),reason)
  for r in [m.Result(3,b'',b'ERROR: syntax error\n'),m.Result(1,b'',('ERROR: '+reason).encode()),m.Result(3,b'',('ERROR: '+reason+'\nWARNING: bad\n').encode()),m.Result(3,b'',('ERROR: '+reason+'\nconnection lost\n').encode())]:
   with self.assertRaisesRegex(RuntimeError,'reason mismatch'):m.assert_rejection(r,reason)
 def test_wrong_target_exact_rejection(self):
  reason='Wrong fixture target/executor/version'
  m.assert_rejection(m.Result(3,(reason+'\n').encode(),b''),reason)
  with self.assertRaises(RuntimeError):m.assert_rejection(m.Result(3,b'',b'ERROR: missing DB'),reason)
 def test_rejection_requires_unchanged_snapshot(self):
  f=m.Fixture.__new__(m.Fixture);f.sql_bytes={'forward.sql':b'fixture'}
  reason='Pre-action metadata/effective-privilege drift; abort'
  with patch.object(f,'snapshot',side_effect=[{'a':1},{'a':2}]),patch.object(f,'verify_server'),patch.object(f,'raw',return_value=m.Result(3,b'',('ERROR: '+reason).encode())):
   with self.assertRaisesRegex(RuntimeError,'changed state'):f.rejected('forward.sql',reason)
 def test_reviewed_fixture_action_bodies_unchanged(self):
  # CI contains no production-host SQL; compare the approved shared body hashes.
  expected={'forward.sql':'74cf66400387953bd490fc6ede72ef5804df93e060a51b0d70962bba4f8480c2','rollback.sql':'1fe27da0436cd716bb5152b756815d405c704b8d63640abb2de98ddf83cc599f'}
  for name,want in expected.items():
   data=(m.ROOT/name).read_bytes()
   self.assertEqual(m.digest(data[data.index(b'BEGIN;'):]),want)
 def test_fixture_default_owner_entries(self):
  s=(m.ROOT/'bootstrap.sql').read_text()
  for privilege,kind in [('ALL','TABLES'),('ALL','SEQUENCES'),('EXECUTE','FUNCTIONS')]:
   self.assertIn('ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT '+privilege+' ON '+kind+' TO postgres;',s)
 def test_full_create_ack_loss_preregisters_owner(self):
  f=m.Fixture.__new__(m.Fixture)
  with tempfile.TemporaryDirectory() as d:
   f.record_dir=pathlib.Path(d);f.record=f.record_dir/'owner.json';f.owner=self.owner();f.nonce=f.owner['nonce'];f.cid=None
   image={'Id':m.IMAGE_ID,'Architecture':'amd64','Os':'linux','RepoDigests':[m.IMAGE],
    'Config':{'Entrypoint':['docker-entrypoint.sh'],'Cmd':['postgres']}}
   with patch.object(f,'docker',side_effect=[m.Result(0,json.dumps([image]).encode(),b''),TimeoutError('lost create ack')]):
    with self.assertRaises(TimeoutError):f.create()
   self.assertEqual(json.loads(f.record.read_text())['container_id'],None)
   self.assertEqual(json.loads(f.record.read_text())['nonce'],'a'*32)
 def test_psql_transport_closed_arguments(self):
  f=m.Fixture.__new__(m.Fixture);f.base=[m.DOCKER,'--host',m.ENDPOINT,'--config','/private'];f.cid='b'*64
  argv=f.psql_args()
  self.assertIn(m.PSQL,argv);self.assertIn('/usr/bin/env',argv);self.assertIn('-i',argv)
  self.assertIn('b'*64,argv);self.assertNotIn('DOCKER_HOST',str(argv))
  with self.assertRaises(RuntimeError):f.psql_args(database='postgres://remote')
 def test_whole_run_deadline(self):
  f=m.Fixture.__new__(m.Fixture);f.deadline=time.monotonic()-.01
  with self.assertRaisesRegex(RuntimeError,'exhausted'):f.end(30)
 def test_actual_service_assertions_prepared(self):
  s=(m.ROOT/'service-check.sql').read_text()
  self.assertEqual(s.count('RETURNING id INTO'),2);self.assertIn('n<>before_count+2',s)
  self.assertIn('SET LOCAL ROLE service_role;',s);self.assertEqual(s.count('SELECT count(*) INTO'),2)
if __name__=='__main__':unittest.main()

