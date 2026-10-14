import unittest,json,pathlib,copy,ast,time,tempfile
from unittest.mock import patch,Mock
from run_deadline_proof import owned
ROOT=pathlib.Path(__file__).parent
class SharedIdentity(unittest.TestCase):
 def data(self):
  state={'running':True,'oom_killed':False,'restarts':0,'pid':123,'started_at':'fixed-owned-start'}
  return {'launcher_path':owned.POSTGRES,'launcher_sha256':owned.IMAGE_FILES[owned.POSTGRES],'path':owned.RUNNING_POSTGRES,'file_sha256':owned.RUNNING_POSTGRES_SHA256,'proc_sha256':owned.RUNNING_POSTGRES_SHA256,'path_after':owned.RUNNING_POSTGRES,'file_sha256_after':owned.RUNNING_POSTGRES_SHA256,'proc_sha256_after':owned.RUNNING_POSTGRES_SHA256,'state':state,'state_after':dict(state),'comm_diagnostic':{'code':0,'stdout':'unknown-name\n','stderr':''}}
 def test_exact_measured_path_file_and_proc_hash_admit_without_comm(self):
  self.assertEqual(owned.validate_running_identity(self.data()),(123,'fixed-owned-start'))
  for comm in ('sh','.postgres-wrapp','unexpected-but-only-diagnostic'):
   d=self.data();d['comm_diagnostic']['stdout']=comm
   self.assertEqual(owned.validate_running_identity(d),(123,'fixed-owned-start'))
 def test_wrong_path_file_hash_proc_hash_and_launcher_rejected(self):
  for key,value in [('path',owned.POSTGRES),('path_after','/tmp/other'),('file_sha256','0'*64),('proc_sha256','0'*64),('file_sha256_after','0'*64),('proc_sha256_after','0'*64),('launcher_path','/tmp/launcher'),('launcher_sha256','0'*64)]:
   d=self.data();d[key]=value
   with self.assertRaises(RuntimeError):owned.validate_running_identity(d)
 def test_pid1_change_during_or_after_measurement_rejected(self):
  for key,value in [('pid',124),('started_at','different-start')]:
   d=self.data();d['state_after'][key]=value
   with self.assertRaises(RuntimeError):owned.validate_running_identity(d)
  with self.assertRaises(RuntimeError):owned.validate_running_identity(self.data(),(124,'fixed-owned-start'))
 def test_lifecycle_rejection(self):
  for key,value in [('running',False),('oom_killed',True),('restarts',1),('pid',0),('pid','123'),('started_at','')]:
   d=self.data();d['state'][key]=value
   with self.assertRaises(RuntimeError):owned.validate_running_identity(d)
 def test_one_shared_check_precedes_sql_and_is_used_for_ongoing_verification(self):
  tree=ast.parse((ROOT/'owned-fixture/run_fixture.py').read_text());fixture=next(n for n in tree.body if isinstance(n,ast.ClassDef) and n.name=='Fixture')
  methods={n.name:n for n in fixture.body if isinstance(n,ast.FunctionDef)}
  for name in ('create','verify_server'):
   calls=[n.func.attr for n in ast.walk(methods[name]) if isinstance(n,ast.Call) and isinstance(n.func,ast.Attribute)]
   self.assertIn('check_postgres_identity',calls)
  source=(ROOT/'owned-fixture/run_fixture.py').read_text();create=source.split(' def create(self):',1)[1].split(' def capture_locale',1)[0]
  self.assertLess(create.index('self.check_postgres_identity()'),create.index("self.raw(b'SELECT 1;'"))
  self.assertNotIn("comm in ('sh','postgres')",create)
 def test_expected_identity_equals_independently_verified_capture(self):
  d=json.loads((ROOT/'verified-running-identity/pid1-executable-capture.json').read_text())
  self.assertEqual(owned.RUNNING_POSTGRES,d['pid1_executable_path']);self.assertEqual(owned.RUNNING_POSTGRES_SHA256,d['pid1_running_executable_sha256'])
  self.assertEqual(d['declared_sha256'],owned.IMAGE_FILES[owned.POSTGRES])
 def test_shared_collector_rejects_host_pid_swap_and_retains_measurements(self):
  state={'Running':True,'OOMKilled':False,'Pid':123,'StartedAt':'fixed-owned-start'};calls=[]
  f=owned.Fixture.__new__(owned.Fixture);f.sequence=0
  def command(args):
   calls.append(args)
   if args[0]=='/usr/bin/readlink':return owned.Result(0,((owned.POSTGRES if args[-1]==owned.POSTGRES else owned.RUNNING_POSTGRES)+'\n').encode(),b'')
   if args[0]=='/usr/bin/sha256sum':return owned.Result(0,((owned.IMAGE_FILES[owned.POSTGRES] if args[-1]==owned.POSTGRES else owned.RUNNING_POSTGRES_SHA256)+'  '+args[-1]+'\n').encode(),b'')
   return owned.Result(0,b'unknown-name\n',b'')
  f.image_command=command;f.verify=Mock(side_effect=[{'State':state,'RestartCount':0},{'State':dict(state,Pid=124),'RestartCount':0}])
  with tempfile.TemporaryDirectory() as td:
   f.record_dir=pathlib.Path(td)
   with self.assertRaisesRegex(RuntimeError,'PID1 process changed'):f.check_postgres_identity()
   self.assertEqual(len(list(pathlib.Path(td).glob('*running-identity.json'))),1)
   self.assertEqual(calls.count(['/usr/bin/sha256sum','/proc/1/exe']),2)
 def test_startup_and_sql_suffix_preserved_with_only_identity_call_added(self):
  previous=(ROOT/'verified-running-identity/previous-run_fixture.py.reference').read_text()
  current=(ROOT/'owned-fixture/run_fixture.py').read_text()
  def create(source):return source.split(' def create(self):',1)[1].split(' def capture_locale',1)[0]
  old,new=create(previous),create(current)
  self.assertEqual(old.split('  self.preflight()',1)[0],new.split('  self.preflight()',1)[0])
  marker='  self.identity=self.server_identity()\n'
  old_suffix=old.split(marker,1)[1]
  new_suffix=new.split(marker,1)[1]
  self.assertEqual(old_suffix,new_suffix[len('  self.check_postgres_identity()\n'):] if new_suffix.startswith('  self.check_postgres_identity()\n') else new_suffix)
  self.assertIn('self.budget.phase(30)',new)
 def test_phase_exit_failure_does_not_publish_pid_anchor(self):
  from contextlib import contextmanager
  class ExitFailure:
   @contextmanager
   def phase(self,seconds):
    yield time.monotonic()+seconds
    raise TimeoutError('late identity phase exit')
  f=owned.Fixture.__new__(owned.Fixture);f.sequence=0;f.budget=ExitFailure()
  state={'Running':True,'OOMKilled':False,'Pid':123,'StartedAt':'fixed-owned-start'}
  f.verify=Mock(return_value={'State':state,'RestartCount':0})
  def command(args):
   if args[0]=='/usr/bin/readlink':return owned.Result(0,((owned.POSTGRES if args[-1]==owned.POSTGRES else owned.RUNNING_POSTGRES)+'\n').encode(),b'')
   if args[0]=='/usr/bin/sha256sum':return owned.Result(0,((owned.IMAGE_FILES[owned.POSTGRES] if args[-1]==owned.POSTGRES else owned.RUNNING_POSTGRES_SHA256)+'  '+args[-1]+'\n').encode(),b'')
   return owned.Result(0,b'diagnostic-name\n',b'')
  f.image_command=command
  with tempfile.TemporaryDirectory() as td:
   f.record_dir=pathlib.Path(td)
   with self.assertRaisesRegex(TimeoutError,'phase exit'):f.check_postgres_identity()
   self.assertFalse(hasattr(f,'pid1_anchor'))
   data=json.loads(next(pathlib.Path(td).glob('*running-identity.json')).read_text())
   self.assertTrue(data['identity_checks_matched']);self.assertNotIn('admitted',data)
if __name__=='__main__':unittest.main()
