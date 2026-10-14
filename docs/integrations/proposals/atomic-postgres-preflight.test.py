import ast, hashlib, importlib.util, json, pathlib, subprocess, tempfile, unittest
from unittest.mock import patch
ROOT=pathlib.Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('harness',ROOT/'atomic-postgres-harness.py')
h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h)
class Fixture:
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.addCleanup(self.tmp.cleanup);self.directory=pathlib.Path(self.tmp.name)
  self.owner=dict(nonce='fictional-nonce',run_id='fictional-run',attempt='1',container_id='fictional-owned-container')
  (self.directory/'owner.json').write_text(json.dumps(self.owner))
 def save(self,**kw):
  args=dict(directory=self.directory,owner=self.owner,sequence=1,sql='SELECT 1',stdout='partial output',stderr='psql: connection failed',returncode=2)
  args.update(kw);return json.loads(h.retain_psql_result(**args).read_text())
 def fixture(self):
  f=h.OwnedFixture.__new__(h.OwnedFixture);f.identity=None;f.psql_sequence=0;f.image_sequence=0;f.record_dir=self.directory;f.nonce=self.owner['nonce'];f.run_id=self.owner['run_id'];f.attempt='1';f.cid=self.owner['container_id'];f.env={};f.verify=lambda:None;f.psql_args=lambda _:['fictional-command-never-executed'];return f
class Diagnostics(Fixture,unittest.TestCase):
 def test_preserve_nonmatching_error_before_rejection(self):
  f=self.fixture()
  with patch.object(h.subprocess,'run',return_value=subprocess.CompletedProcess([],2,'partial','psql: FATAL: database does not exist')) as call:
   with self.assertRaisesRegex(RuntimeError,'unclassified fixture error'):f.raw(f.identity_sql())
  self.assertEqual(call.call_count,1)
  evidence=json.loads((self.directory/'psql-command-0001.json').read_text());self.assertEqual((evidence['returncode'],evidence['stdout'],evidence['stderr']),(2,'partial','psql: FATAL: database does not exist'))
 def test_first_identity_success_only(self):
  f=self.fixture()
  with patch.object(h.subprocess,'run',return_value=subprocess.CompletedProcess([],0,'{}\n','')):
   self.assertEqual(f.raw(f.identity_sql()),'{}');f.identity={};f.raw('SELECT 1')
  self.assertEqual(len(list(self.directory.glob('psql-command-*.json'))),1)
 def test_timeout_recorded_and_reraised(self):
  f=self.fixture()
  with patch.object(h.subprocess,'run',side_effect=subprocess.TimeoutExpired('fictional',8,output=b'partial',stderr=b'timeout')):
   with self.assertRaises(subprocess.TimeoutExpired):f.raw('SELECT 1')
  e=json.loads((self.directory/'psql-command-0001.json').read_text());self.assertIsNone(e['returncode']);self.assertTrue(e['timed_out']);self.assertEqual(e['stderr'],'timeout')
 def test_exact_expected_failure_retained(self):
  f=self.fixture();f.identity={}
  with patch.object(h.subprocess,'run',return_value=subprocess.CompletedProcess([],3,'','ERROR:  P7105: finalization write contract violated\n')):
   h.expect_failure(lambda:f.raw('SELECT 1'),'P7105','finalization write contract violated')
  self.assertEqual(json.loads((self.directory/'psql-command-0001.json').read_text())['returncode'],3)
 def test_redaction_bounds_and_fields(self):
  e=self.save(stdout='postgresql://user:fictional@host/db password="fictional" token=fictional PGPASSWORD=fictional '+('x'*20000))
  self.assertNotIn('fictional',e['stdout']);self.assertTrue(e['stdout_truncated']);self.assertLessEqual(len(e['stdout'].encode()),16384)
  self.assertEqual(e['sql_sha256'],hashlib.sha256(b'SELECT 1').hexdigest());self.assertNotIn('SELECT 1',json.dumps(e))
  self.assertEqual(set(e),{'phase','run_id','attempt','sequence','sql_sha256','returncode','timed_out','stdout','stderr','stdout_truncated','stderr_truncated'})
 def test_owner_mismatch(self):
  with self.assertRaisesRegex(RuntimeError,'ownership mismatch'):self.save(owner=dict(self.owner,nonce='different'))
  self.assertFalse(list(self.directory.glob('psql-command-*.json')))
 def test_exclusive_no_overwrite(self):
  self.save()
  with self.assertRaises(FileExistsError):self.save()
 def test_invalid_status_and_sequence(self):
  for kw in ({'returncode':True},{'returncode':None},{'returncode':'2'},{'sequence':True},{'sequence':0},{'timed_out':True,'returncode':2}):
   with self.subTest(kw=kw),self.assertRaises(RuntimeError):self.save(**kw)
 def test_unknown_error_not_expected_contract_failure(self):
  with self.assertRaisesRegex(RuntimeError,'unclassified'):h.expect_failure(lambda:(_ for _ in ()).throw(h.parse_failure('FATAL: unknown')),'P7105','finalization write contract violated')
 def test_no_optimizable_harness_asserts(self):
  self.assertFalse(any(isinstance(n,ast.Assert) for n in ast.walk(ast.parse((ROOT/'atomic-postgres-harness.py').read_text()))))


class ImageContract(Fixture,unittest.TestCase):
 # Image and startup mocks; never construct an owned container.
 def preflight_fixture(self):
  f=self.fixture();f.evidence={};return f
 def replies(self,args,check=True):
  if args==['/usr/bin/readlink','-e',h.PSQL]:out=h.PSQL+'\n'
  elif args[0]=='/usr/bin/sha256sum':out=''.join(v+'  '+k+'\n' for k,v in h.IMAGE_FILES.items())
  elif args[:2]==['/usr/bin/dpkg-query','-W']:out=h.PACKAGED_VERSION+'\n'
  elif args[:2]==['/usr/bin/dpkg-query','-S']:out='postgresql-client-17: '+h.PSQL+'\n'
  elif args==[h.PSQL,'--version']:out='psql (PostgreSQL) 17.11 (Debian '+h.PACKAGED_VERSION+')\n'
  else:raise RuntimeError('unexpected mock image command '+repr(args))
  return subprocess.CompletedProcess(args,0,out,'')
 def test_packaged_binary_and_hash(self):
  f=self.preflight_fixture();f.image_command=self.replies;f.image_preflight()
  self.assertEqual(f.evidence['psql_driver_path'],'/usr/lib/postgresql/17/bin/psql')
  self.assertEqual(f.evidence['psql_driver_sha256'],'92479a999b7227713c648475b20b2b870cc7b06ccd4fde429fc696045dd4f146')
 def test_bad_resolved_executable_rejected(self):
  f=self.preflight_fixture();f.image_command=lambda *a,**kw:subprocess.CompletedProcess([],0,'/usr/local/bin/psql','')
  with self.assertRaisesRegex(RuntimeError,'reviewed packaged executable'):f.image_preflight()
 def test_corrupt_image_hash_rejected(self):
  f=self.preflight_fixture()
  def reply(args,check=True):
   r=self.replies(args,check)
   if args[0]=='/usr/bin/sha256sum':r.stdout=r.stdout.replace(h.IMAGE_FILES[h.PSQL],'0'*64)
   return r
  f.image_command=reply
  with self.assertRaisesRegex(RuntimeError,'executable/source mismatch'):f.image_preflight()
 def test_package_mismatch_rejected(self):
  f=self.preflight_fixture()
  def reply(args,check=True):
   r=self.replies(args,check)
   if args[:2]==['/usr/bin/dpkg-query','-W']:r.stdout='17.10\n'
   return r
  f.image_command=reply
  with self.assertRaisesRegex(RuntimeError,'packaged psql version'):f.image_preflight()
 def test_final_server_waits_past_temporary_server(self):
  f=self.fixture();f.startup_deadline=30;clock=[0];commands=iter(['docker-entrypoi','env','bash','gosu','bash','postgres']);ready=[]
  def reply(args,check=True):
   if args==['/usr/bin/cat','/proc/1/comm']:out=next(commands)
   elif args==['/usr/bin/readlink','-e','/proc/1/exe']:out=h.POSTGRES
   elif args[0]==h.PGREADY:ready.append(clock[0]);out='accepting connections'
   else:raise RuntimeError('unexpected fixture command')
   return subprocess.CompletedProcess(args,0,out,'')
  f.image_command=reply
  with patch.object(h.time,'monotonic',side_effect=lambda:clock[0]),patch.object(h.time,'sleep',side_effect=lambda t:clock.__setitem__(0,clock[0]+t)):
   f.wait_final_server()
  self.assertEqual(ready,[.5]);observations=json.loads((self.directory/'final-startup.json').read_text())['observations']
  self.assertEqual([x['pid1_command'] for x in observations],['docker-entrypoi','env','bash','gosu','bash','postgres'])
  self.assertNotIn('pg_isready_returncode',observations[0])
 def test_final_readiness_failure_is_bounded(self):
  f=self.fixture();f.startup_deadline=.25;clock=[0]
  def reply(args,check=True):
   if args[0]=='/usr/bin/cat':return subprocess.CompletedProcess(args,0,'postgres','')
   if args[0]=='/usr/bin/readlink':return subprocess.CompletedProcess(args,0,h.POSTGRES,'')
   return subprocess.CompletedProcess(args,1,'rejecting','')
  f.image_command=reply
  with patch.object(h.time,'monotonic',side_effect=lambda:clock[0]),patch.object(h.time,'sleep',side_effect=lambda t:clock.__setitem__(0,clock[0]+t)):
   with self.assertRaisesRegex(RuntimeError,'final-startup timeout'):f.wait_final_server()
  self.assertEqual(clock[0],.25)
 def test_unknown_readiness_failure_not_retried(self):
  f=self.fixture();f.startup_deadline=None
  f.image_command=lambda a,check=True:subprocess.CompletedProcess(a,3,'postgres' if a[0]=='/usr/bin/cat' else h.POSTGRES,'')
  with self.assertRaisesRegex(RuntimeError,'unexpected final-server readiness failure'):f.wait_final_server()
 def test_pid1_executable_mismatch_rejected(self):
  f=self.fixture();f.startup_deadline=None
  f.image_command=lambda a,check=True:subprocess.CompletedProcess(a,0,'postgres' if a[0]=='/usr/bin/cat' else '/unapproved/postgres','')
  with self.assertRaisesRegex(RuntimeError,'unexpected final PID1 executable'):f.wait_final_server()
 def test_startup_time_caps_each_subprocess(self):
  f=self.fixture();f.startup_deadline=10
  with patch.object(h.time,'monotonic',return_value=9.75):self.assertEqual(f.remaining_timeout(8),.25)
  with patch.object(h.time,'monotonic',return_value=10):
   with self.assertRaisesRegex(RuntimeError,'final-startup timeout'):f.remaining_timeout(8)
 def test_psql_fixed_container_binary_and_user(self):
  f=self.fixture();f.docker_base=['/usr/bin/docker','--host',h.ENDPOINT,'--config','fictional-owned-config']
  args=h.OwnedFixture.psql_args(f,'atomic-query')
  self.assertIn(h.PSQL,args);self.assertNotIn('/usr/local/bin/psql',args);self.assertIn('--user',args)
  self.assertEqual(args[args.index('--user')+1],'postgres');self.assertIn('-X',args)
 def test_multibyte_utf8_cap_exact(self):
  for value in ['x'*16383+'😀','😀'*5000,'x'*16384,'x'*16385]:
   output,truncated=h.safe_psql_output(value);self.assertLessEqual(len(output.encode('utf-8')),16384);self.assertNotIn('�',output);self.assertEqual(truncated,len(value.encode())>16384)
 def test_stderr_sql_context_is_not_hidden(self):
  evidence=self.save(stderr='ERROR:  42601: syntax error\nLINE 1: SELECT fixture_value\nCONTEXT: SQL statement fixture_statement')
  self.assertIn('SELECT fixture_value',evidence['stderr'])
 def test_all_image_command_results_retained_before_failure(self):
  f=self.fixture();calls=[]
  def docker(args,check=True):calls.append(args);return subprocess.CompletedProcess(args,2,'partial','token=fictional error')
  f.docker=docker
  with self.assertRaisesRegex(RuntimeError,'image command failed'):
   h.OwnedFixture.image_command(f,['/usr/bin/readlink','-e',h.PSQL])
  evidence=json.loads((self.directory/'image-command-0001.json').read_text())
  self.assertEqual(evidence['phase'],'image_command');self.assertEqual(evidence['returncode'],2);self.assertNotIn('fictional',evidence['stderr']);self.assertNotIn('sql_sha256',evidence)
  self.assertEqual(calls[0][:4],['exec','--user','postgres',f.cid])
 def test_image_timeout_retained(self):
  f=self.fixture();f.docker=lambda *a,**kw:(_ for _ in ()).throw(subprocess.TimeoutExpired('fixed',1,output=b'partial',stderr=b'failed'))
  with self.assertRaises(subprocess.TimeoutExpired):h.OwnedFixture.image_command(f,['/usr/bin/cat','/proc/1/comm'])
  evidence=json.loads((self.directory/'image-command-0001.json').read_text());self.assertIsNone(evidence['returncode']);self.assertTrue(evidence['timed_out'])
 def create_fixture(self):
  f=self.fixture();f.evidence={};calls=[]
  meta={'Id':h.IMAGE_ID,'RepoDigests':['postgres@'+h.IMAGE.split('@')[1]],'Architecture':'amd64','Os':'linux','Config':{'Entrypoint':['docker-entrypoint.sh'],'Cmd':['postgres']}}
  def docker(args,check=True):
   calls.append(args)
   if args[:2]==['image','inspect']:out=json.dumps([meta])
   elif args[0]=='create':out='a'*64
   else:out=''
   return subprocess.CompletedProcess(args,0,out,'')
  f.docker=docker;f.save_record=lambda name:None;f.image_preflight=lambda:calls.append(['preflight']);f.wait_final_server=lambda:calls.append(['final-server'])
  f.pid1_executable=lambda:h.POSTGRES
  identity={'database':h.DATABASE,'user':'postgres','address':None,'data_directory':'/var/lib/postgresql/data','version':'170011','system_identifier':'fictional'}
  def raw(sql):calls.append(['identity' if sql.startswith('SELECT json_build_object') else 'marker']);return json.dumps(identity)
  f.raw=raw;return f,calls,meta
 def test_create_fixed_image_commands_and_identity_order(self):
  f,calls,meta=self.create_fixture();f.create()
  create=next(a for a in calls if a[0]=='create')
  self.assertIn('--pull=never',create);self.assertEqual(create[create.index('--network')+1],'none');self.assertIn(h.IMAGE,create)
  self.assertEqual(create[-5:],['postgres','-c','listen_addresses=','-c','unix_socket_directories='+h.SOCKET])
  self.assertLess(calls.index(['preflight']),calls.index(['final-server']));self.assertLess(calls.index(['final-server']),calls.index(['identity']));self.assertLess(calls.index(['identity']),calls.index(['marker']))
  self.assertIsNone(f.startup_deadline)
 def test_wrong_image_platform_rejected_before_create(self):
  f,calls,meta=self.create_fixture();meta['Architecture']='arm64'
  with self.assertRaisesRegex(RuntimeError,'platform/config mismatch'):f.create()
  self.assertFalse(any(a[0]=='create' for a in calls))
 def test_first_identity_failure_never_retried(self):
  f,calls,meta=self.create_fixture();count=[]
  def failure(sql):count.append(sql);raise RuntimeError('unclassified fixture error')
  f.raw=failure
  with self.assertRaisesRegex(RuntimeError,'unclassified fixture error'):f.create()
  self.assertEqual(len(count),1);self.assertNotIn(['marker'],calls)
 def test_exact_pinned_file_hash_contract(self):
  self.assertEqual(h.IMAGE_FILES,{
   '/usr/lib/postgresql/17/bin/psql':'92479a999b7227713c648475b20b2b870cc7b06ccd4fde429fc696045dd4f146',
   '/usr/lib/postgresql/17/bin/pg_isready':'10557978eac2173ef7ea9bed2e34fa44ecd30a9f9d4a3eca8c7b782a7eced107',
   '/usr/lib/postgresql/17/bin/postgres':'f7d05a9a444dc63d93f6b6e329d31eaebae809e85c8479b5072d8aff595303ed',
   '/usr/local/bin/docker-entrypoint.sh':'9c440299ae04a0a79d55b8bf03307036d890a40979d2fb698073c9050d4b20a5'})
 def test_verified_startup_order_in_source(self):
  source=(ROOT/'atomic-postgres-harness.py').read_text()
  create=source.split('    def create(self):',1)[1].split('    def image_command',1)[0]
  self.assertLess(create.index('self.image_preflight()'),create.index('self.wait_final_server()'))
  self.assertLess(create.index('self.wait_final_server()'),create.index('self.raw(self.identity_sql())'))
  self.assertLess(create.index('self.pid1_executable()==POSTGRES'),create.index('CREATE SCHEMA'))
if __name__=='__main__':unittest.main(verbosity=2)
