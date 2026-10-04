"""Offline contract tests: mocked daemon metadata and benign Python pipe peers only.
Never starts Docker, psql, a database, a network or the owned-fixture mode."""
import copy,json,os,pathlib,sys,tempfile,time,unittest
from unittest.mock import patch
import run_fixture as m
class Offline(unittest.TestCase):
 def locale_rows(self,fixture=False):
  names=['postgres','template0','template1']
  if fixture:names.insert(0,'acl_fixture')
  return [dict(database=n,collate='C',ctype='en_US.utf8',encoding='UTF8',provider='c') for n in names]
 def test_locale_contract(self):
  cluster=self.locale_rows(); fixture=self.locale_rows(True)
  self.assertEqual(m.validate_locale(cluster,'cluster'),cluster)
  self.assertEqual(m.validate_locale(fixture,'fixture',cluster),fixture)
  for field,value in [('collate','en_US.utf8'),('encoding','SQL_ASCII'),('provider','i'),('ctype','')]:
   rows=copy.deepcopy(fixture);rows[0][field]=value
   with self.subTest(field=field),self.assertRaises(RuntimeError):m.validate_locale(rows,'fixture',cluster)
  for rows in [fixture[:-1],fixture+[fixture[0]],list(reversed(fixture)),None]:
   with self.subTest(rows=rows),self.assertRaises(RuntimeError):m.validate_locale(rows,'fixture',cluster)
  with self.assertRaises(RuntimeError):m.validate_locale(cluster,'unknown')
  rows=copy.deepcopy(fixture);rows[0]['ctype']='other'
  with self.assertRaises(RuntimeError):m.validate_locale(rows,'fixture',cluster)
  rows=copy.deepcopy(fixture)
  for row in rows:row['ctype']='other'
  with self.assertRaises(RuntimeError):m.validate_locale(rows,'fixture',cluster)
 def test_locale_capture_retained_before_rejection(self):
  with tempfile.TemporaryDirectory() as directory:
   f=object.__new__(m.Fixture);f.record_dir=pathlib.Path(directory)
   wrong=self.locale_rows();wrong[0]['encoding']='SQL_ASCII'
   f.raw=lambda *args:m.Result(0,json.dumps(wrong).encode(),b'')
   with self.assertRaises(RuntimeError):f.capture_locale('cluster')
   evidence=json.loads((f.record_dir/'locale-cluster.json').read_text())
   self.assertEqual(evidence['databases'],wrong)
   self.assertEqual(evidence['initdb_args'],'--lc-collate=C --encoding=UTF8')
 def test_locale_capture_closed_names(self):
  f=object.__new__(m.Fixture)
  with self.assertRaises(RuntimeError):f.capture_locale('arbitrary_database')
 def test_initialization_and_capture_order(self):
  source=(m.ROOT/'run_fixture.py').read_text()
  self.assertIn("'--env','POSTGRES_INITDB_ARGS='+INITDB_ARGS",source)
  create=source[source.index(' def create(self):'):source.index(' def preflight(self):')]
  self.assertLess(create.index("self.capture_locale('cluster')"),create.index("self.sql_bytes['bootstrap.sql']"))
  self.assertLess(create.index("'nonce marker'"),create.index("self.capture_locale('fixture')"))
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
  m.assert_rejection(m.Result(3,b'',('ERROR:  '+reason+'\n').encode()),reason)
  for r in [m.Result(3,b'',b'ERROR:  syntax error\n'),m.Result(1,b'',('ERROR:  '+reason).encode()),m.Result(3,b'',('ERROR:  '+reason+'\nWARNING: bad\n').encode()),m.Result(3,b'',('ERROR:  '+reason+'\nconnection lost\n').encode())]:
   with self.assertRaisesRegex(RuntimeError,'reason mismatch'):m.assert_rejection(r,reason)
 def test_wrong_target_exact_rejection(self):
  reason='Wrong fixture target/executor/version';error=('ERROR:  '+reason+'\n').encode()
  m.assert_rejection(m.Result(3,b'',error),reason)
  for r in [m.Result(0,(reason+'\n').encode(),b'\\quit: extra argument "3" ignored\n'),m.Result(0,b'',error),m.Result(1,b'',error),m.Result(3,b'',b'ERROR:  missing DB\n'),m.Result(3,b'extra',error),m.Result(3,b'',error+b'WARNING: extra\n'),m.Result(3,b'',error,1,('true',)),m.Result(3,b'',error,0,('false',))]:
   with self.subTest(result=r),self.assertRaises(RuntimeError):m.assert_rejection(r,reason)
 def test_wrong_target_supported_error_before_transaction(self):
  for name in ('forward.sql','rollback.sql'):
   source=(m.ROOT/name).read_text();prefix=source[:source.index('BEGIN;')]
   self.assertIn('\\set ON_ERROR_STOP on',prefix)
   self.assertIn("RAISE EXCEPTION USING MESSAGE='Wrong fixture target/executor/version';",prefix)
   self.assertNotIn('\\quit',prefix);self.assertNotIn('GRANT ',prefix)
  transport=m.Fixture.__new__(m.Fixture);transport.base=[m.DOCKER,'--host',m.ENDPOINT,'--config','/private'];transport.cid='b'*64
  self.assertIn('VERBOSITY=terse',transport.psql_args())
 def test_both_wrong_target_scripts_and_state_verification(self):
  reason='Wrong fixture target/executor/version'
  for name in ('forward.sql','rollback.sql'):
   f=m.Fixture.__new__(m.Fixture);f.sql_bytes={name:b'fixture'}
   with patch.object(f,'snapshot',side_effect=[{'acl':['grant']},{'acl':['grant']}]) as snapshot,patch.object(f,'verify_server'),patch.object(f,'raw',return_value=m.Result(3,b'',('ERROR:  '+reason+'\n').encode())) as raw:
    f.rejected(name,reason,database='postgres');self.assertEqual(snapshot.call_count,2)
    raw.assert_called_once_with(b'fixture',database='postgres')
   with patch.object(f,'snapshot',side_effect=[{'acl':['grant']},{'acl':[]}]),patch.object(f,'verify_server'),patch.object(f,'raw',return_value=m.Result(3,b'',('ERROR:  '+reason+'\n').encode())):
    with self.assertRaisesRegex(RuntimeError,'changed state'):f.rejected(name,reason,database='postgres')
 def test_legacy_false_vote_exit_zero_is_rejected(self):
  # Simulates the retained PG17 behaviour; this peer is not a database proof.
  with self.assertRaisesRegex(RuntimeError,'diagnostic not safely refused'):
   self.child("import sys;print('WARNING: synthetic diagnostic',flush=True);print('ACL_COMMIT_GATE_READY',flush=True);v=input();print('\\\\quit: extra argument \"4\" ignored',flush=True);sys.exit(0)",gate=True)
 def test_rejection_requires_unchanged_snapshot(self):
  f=m.Fixture.__new__(m.Fixture);f.sql_bytes={'forward.sql':b'fixture'}
  reason='Pre-action metadata/effective-privilege drift; abort'
  with patch.object(f,'snapshot',side_effect=[{'a':1},{'a':2}]),patch.object(f,'verify_server'),patch.object(f,'raw',return_value=m.Result(3,b'',('ERROR:  '+reason+'\n').encode())):
   with self.assertRaisesRegex(RuntimeError,'changed state'):f.rejected('forward.sql',reason)
 def test_refusal_locus_is_frozen_statement_end(self):
  for name in ('forward.sql','rollback.sql'):
   data=(m.ROOT/name).read_bytes();path=m.SOCKET+'/home-client-'+'a'*32+'-1-'+name
   locus=m.commit_refusal_locus(path,data)
   self.assertEqual(locus,(path,data.splitlines().index(b'END $commit_refused$;')+1))
   with self.assertRaises(RuntimeError):m.commit_refusal_locus('/arbitrary.sql',data)
   with self.assertRaises(RuntimeError):m.commit_refusal_locus(path,data+b'END $commit_refused$;\n')
   with self.assertRaises(RuntimeError):m.commit_refusal_locus(path,data.replace(b'END $commit_refused$;',b''))
 def test_action_binds_actual_staged_path_and_frozen_line_in_receipt(self):
  for name in ('forward.sql','rollback.sql'):
   f=m.Fixture.__new__(m.Fixture);data=(m.ROOT/name).read_bytes()
   f.sql_bytes={name:data};f.hashes={name:m.digest(data)};f.nonce='a'*32;f.cid='b'*64;f.sequence=5;f.env={}
   path=m.SOCKET+'/home-client-'+f.nonce+'-5-'+name;locus=m.commit_refusal_locus(path,data)
   output=m.GATE+b'\n'+('psql:'+path+':'+str(locus[1])+': ERROR:  Fixture commit gate refused; transaction rolled back\n').encode()
   def execute(argv,env,deadline,**kwargs):
    self.assertEqual(argv,['fixed-psql','-f',path]);self.assertTrue(kwargs['refuse']);self.assertTrue(kwargs['gate'])
    return m.Result(3,output,b'',1,('false',))
   with tempfile.TemporaryDirectory() as directory:
    f.record_dir=pathlib.Path(directory)
    with patch.object(f,'verify_server'),patch.object(f,'docker',return_value=m.Result(0,data,b'')),patch.object(f,'image_command',side_effect=[m.Result(0,b'',b''),m.Result(0,(m.digest(data)+'  '+path+'\n').encode(),b'')]),patch.object(f,'psql_args',return_value=['fixed-psql']),patch.object(f,'end',return_value=time.monotonic()+2),patch.object(m,'run_bounded',side_effect=execute):
     result=f.action(name,refuse=True);self.assertEqual(result.locus,locus);m.assert_commit_refusal(result)
    receipt=json.loads(next(f.record_dir.glob('006-refused-*.json')).read_text())
    self.assertEqual(receipt['locus'],list(locus));self.assertEqual(receipt['sql_sha256'],m.digest(data))
 def test_exact_pg17_diagnostic_spacing_and_locus(self):
  reason='Wrong fixture target/executor/version'
  for error in [('ERROR: '+reason+'\n').encode(),('ERROR:   '+reason+'\n').encode(),('psql:file.sql:1: ERROR:  '+reason+'\n').encode()]:
   with self.assertRaises(RuntimeError):m.assert_rejection(m.Result(3,b'',error),reason)
  locus=(m.SOCKET+'/home-client-'+'a'*32+'-1-forward.sql',117)
  exact=m.GATE+b'\n'+('psql:'+locus[0]+':117: ERROR:  Fixture commit gate refused; transaction rolled back\n').encode()
  for output in [exact.replace(b'ERROR:  ',b'ERROR: '),exact.replace(b':117:',b':118:'),exact.replace(b'-1-forward.sql:',b'-2-forward.sql:'),exact.replace(b'psql:',b''),exact+b'NOTICE: unexpected\n']:
   with self.assertRaises(RuntimeError):m.assert_commit_refusal(m.Result(3,output,b'',1,('false',),locus))
  for bad in [(),('/arbitrary.sql',117),(locus[0],0),(locus[0],True)]:
   with self.assertRaises(RuntimeError):m.assert_commit_refusal(m.Result(3,exact,b'',1,('false',),bad))
 def test_reviewed_permission_action_bodies_unchanged(self):
  expected={'forward.sql': '6761480cf23c8eb75d0ef156906a009827c3efe33a34dff92c4673bfb0efc535', 'rollback.sql': '2cec859279384b70fc66dc72e892f4995d94c1ce39d6f86e16a3ce03352198ac'}
  for name,want in expected.items():
   data=(m.ROOT/name).read_bytes()
   self.assertEqual(m.digest(data[data.index(b'BEGIN;'):data.index(b'\\echo '+m.GATE)]),want)
 def test_reviewed_corrected_full_action_body_hashes(self):
  expected={'forward.sql': 'e872bc3caf2808539fb088a2800fcdffddd031a8ffa06b8fdd7bc5f2e1051e2d', 'rollback.sql': '4bf6b1c44ecbecc1fbe2e8eb08d5fb29f9b681fd28621394dceff1122a31714b'}
  for name,want in expected.items():
   data=(m.ROOT/name).read_bytes();self.assertEqual(m.digest(data[data.index(b'BEGIN;'):]),want)
 def test_commit_refusal_exact_result(self):
  locus=(m.SOCKET+'/home-client-'+'a'*32+'-1-forward.sql',117)
  output=m.GATE+b'\n'+('psql:'+locus[0]+':117: ERROR:  Fixture commit gate refused; transaction rolled back\n').encode()
  m.assert_commit_refusal(m.Result(3,output,b'',1,('false',),locus))
  for result in [m.Result(0,output,b'',1,('false',),locus),m.Result(4,output,b'',1,('false',),locus),m.Result(3,output,b'',1,('true',),locus),m.Result(3,output,b'',0,('false',),locus),m.Result(3,output+b'NOTICE: unexpected\n',b'',1,('false',),locus),m.Result(3,output,b'extra',1,('false',),locus)]:
   with self.subTest(result=result),self.assertRaises(RuntimeError):m.assert_commit_refusal(result)
 def test_refusal_rollback_before_error_source(self):
  for name in ('forward.sql','rollback.sql'):
   data=(m.ROOT/name).read_bytes();m.validate_gate_source(data)
   self.assertNotIn(b'\\quit',data)
   tail=data[data.index(b'\\echo '+m.GATE):]
   self.assertLess(tail.index(b'ROLLBACK;'),tail.index(b'RAISE EXCEPTION'))
   self.assertIn(b"\\prompt '' acl_commit_gate",tail)
 def test_refused_action_preserves_state_and_requires_no_idle_transaction(self):
  locus=(m.SOCKET+'/home-client-'+'a'*32+'-1-forward.sql',117)
  output=m.GATE+b'\n'+('psql:'+locus[0]+':117: ERROR:  Fixture commit gate refused; transaction rolled back\n').encode()
  for name in ('forward.sql','rollback.sql'):
   f=m.Fixture.__new__(m.Fixture)
   with patch.object(f,'snapshot',side_effect=[{'acl':['a']},{'acl':['a']}]),patch.object(f,'action',return_value=m.Result(3,output,b'',1,('false',),locus)) as action,patch.object(f,'raw',return_value=m.Result(0,b'0\n',b'')) as raw:
    f.refused_action(name);action.assert_called_once_with(name,refuse=True);self.assertIn(b'idle in transaction',raw.call_args[0][0])
   with patch.object(f,'snapshot',side_effect=[{'acl':['a']},{'acl':['b']}]),patch.object(f,'action',return_value=m.Result(3,output,b'',1,('false',),locus)):
    with self.assertRaisesRegex(RuntimeError,'changed state'):f.refused_action(name)
   with patch.object(f,'snapshot',side_effect=[{'acl':['a']},{'acl':['a']}]),patch.object(f,'action',return_value=m.Result(3,output,b'',1,('false',),locus)),patch.object(f,'raw',return_value=m.Result(0,b'1\n',b'')):
    with self.assertRaisesRegex(RuntimeError,'idle transaction'):f.refused_action(name)
 def test_forced_false_vote_only(self):
  with tempfile.TemporaryDirectory() as home:
   locus=(m.SOCKET+'/home-client-'+'a'*32+'-1-forward.sql',117)
   diagnostic='psql:'+locus[0]+':117: ERROR:  Fixture commit gate refused; transaction rolled back'
   source="import sys;print('ACL_COMMIT_GATE_READY',flush=True);v=input();print("+repr(diagnostic)+",flush=True);sys.exit(3 if v=='false' else 0)"
   r=m.run_bounded([sys.executable,'-I','-c',source],m.clean_environment(home),time.monotonic()+2,gate=True,refuse=True)
   m.assert_commit_refusal(m.dataclasses.replace(r,locus=locus))
   with self.assertRaises(RuntimeError):m.run_bounded([],{},time.monotonic()+2,refuse=True)
   with self.assertRaises(RuntimeError):m.run_bounded([],{},time.monotonic()+2,gate=True,refuse='true')
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

