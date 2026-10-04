import unittest,tempfile,pathlib,json,time,hashlib,sys,io
from unittest.mock import patch,Mock
from contextlib import redirect_stdout
import capture_pid1_identity as module
from run_deadline_proof import owned
class ExecutableCapture(unittest.TestCase):
 def fixture(self,td):
  f=module.Capture.__new__(module.Capture);f.deadline=time.monotonic()+60;f.record_dir=pathlib.Path(td);f.cid='a'*64;f.docker=Mock(return_value=owned.Result(0,b'',b'LOG: database system is ready to accept connections\n'));f.raw=Mock(side_effect=AssertionError('SQL forbidden'))
  return f
 def commands(self,calls,wrapper,bad_path=False,unstable=False):
  actual='/nix/store/'+'a'*32+'-observed/bin/.actual-server';resolutions=0
  def command(self,args):
   nonlocal resolutions
   calls.append(args)
   if args[:2]==['/usr/bin/readlink','-f']:
    if args[2]=='/proc/1/exe':
     resolutions+=1
     value='invalid path' if bad_path else actual+('-changed' if unstable and resolutions>1 else '')
    else:value=args[2]
    return owned.Result(0,(value+'\n').encode(),b'')
   if args[:1]==['/usr/bin/sha256sum']:
    h=hashlib.sha256(wrapper).hexdigest() if args[1]==owned.POSTGRES else 'a'*64
    return owned.Result(0,(h+'  '+args[1]+'\n').encode(),b'')
   if args==module.PROBE:return owned.Result(0,b'.postgres-wrapp\n',b'')
   if args[2]==module.WRAPPER_READ:return owned.Result(0,wrapper,b'')
   return owned.Result(0,b'',b'')
  return command
 def test_unknown_comm_captured_after_path_hash_and_never_admitted(self):
  wrapper=b'#!/bin/sh\nexec /nix/store/'+b'a'*32+b'-observed/bin/.actual-server "$@"\n';calls=[]
  with tempfile.TemporaryDirectory() as td,patch.object(owned.Fixture,'image_command',self.commands(calls,wrapper)),patch.dict(owned.IMAGE_FILES,{owned.POSTGRES:hashlib.sha256(wrapper).hexdigest()}):
   f=self.fixture(td)
   with self.assertRaises(module.CapturedBeforeAdmission):f.image_command(module.PROBE)
   d=json.loads((pathlib.Path(td)/'pid1-executable-capture.json').read_text())
   self.assertTrue(d['capture_complete']);self.assertFalse(d['wrapper_relationship_admitted']);self.assertEqual(d['pid1_comm_result']['stdout'],'.postgres-wrapp\n');f.raw.assert_not_called()
   self.assertLess(calls.index(['/usr/bin/readlink','-f','/proc/1/exe']),calls.index(module.PROBE))
   self.assertLess(next(i for i,a in enumerate(calls) if a[0]=='/usr/bin/sha256sum'),calls.index(module.PROBE))
 def test_invalid_executable_path_rejected_without_hash_or_sql(self):
  calls=[]
  with tempfile.TemporaryDirectory() as td,patch.object(owned.Fixture,'image_command',self.commands(calls,b'',bad_path=True)):
   f=self.fixture(td)
   with self.assertRaisesRegex(RuntimeError,'approved Nix'):f.image_command(module.PROBE)
   self.assertFalse(any(a[0]=='/usr/bin/sha256sum' for a in calls));f.raw.assert_not_called()
 def test_changed_pid1_rejected_even_matching_wrapper_text(self):
  wrapper=b'#!/bin/sh\nexec /nix/store/'+b'a'*32+b'-observed/bin/.actual-server \"$@\"\n';calls=[]
  with tempfile.TemporaryDirectory() as td,patch.object(owned.Fixture,'image_command',self.commands(calls,wrapper,unstable=True)),patch.dict(owned.IMAGE_FILES,{owned.POSTGRES:hashlib.sha256(wrapper).hexdigest()}):
   f=self.fixture(td)
   with self.assertRaisesRegex(RuntimeError,'PID1 changed'):f.image_command(module.PROBE)
   f.raw.assert_not_called()
 def test_wrapper_copy_mismatch_is_not_relationship_admission(self):
  calls=[]
  with tempfile.TemporaryDirectory() as td,patch.object(owned.Fixture,'image_command',self.commands(calls,b'not exact\n')):
   f=self.fixture(td)
   with self.assertRaises(RuntimeError):f.image_command(module.PROBE)
   self.assertFalse(json.loads((pathlib.Path(td)/'pid1-executable-capture.json').read_text())['wrapper_relationship_admitted']);f.raw.assert_not_called()
 def test_diagnostic_main_closes_and_does_not_call_permission_entrypoint(self):
  f=Mock();f.create.side_effect=module.CapturedBeforeAdmission()
  with patch.object(module,'Capture',return_value=f),patch.object(sys,'argv',['capture_pid1_identity.py']),patch.object(module.signal,'signal'),redirect_stdout(io.StringIO()):module.main()
  f.close.assert_called_once_with()
 def test_current_reviewed_permission_runtime_hash(self):
  path=pathlib.Path(__file__).parent/'owned-fixture/run_fixture.py'
  self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(),'ce16921d9922d038f3e7825d483a882b58cd9d144c9d39966d1c8199c4f62e9b')
 def test_sql_and_libpq_construction_fail_even_if_interception_misses(self):
  f=module.Capture.__new__(module.Capture)
  with self.assertRaisesRegex(RuntimeError,'forbids all SQL'):f.raw(b'SELECT 1;')
  with self.assertRaisesRegex(RuntimeError,'forbids libpq'):f.psql_args()
 def test_intercept_matches_exact_settled_probe(self):
  import ast
  tree=ast.parse((pathlib.Path(__file__).parent/'owned-fixture/run_fixture.py').read_text())
  probes=[ast.literal_eval(n.args[0]) for n in ast.walk(tree) if isinstance(n,ast.Call) and isinstance(n.func,ast.Attribute) and n.func.attr=='image_command' and n.args and isinstance(n.args[0],ast.List) and all(isinstance(v,ast.Constant) for v in n.args[0].elts)]
  self.assertEqual(probes.count(module.PROBE),1)
 def test_literal_wrapper_target_requires_single_static_nix_path(self):
  target='/nix/store/'+'a'*32+'-observed/bin/.actual-server'
  for line in ('exec "'+target+'" "$@"','exec -a "$0" "'+target+'" "$@"'):
   self.assertEqual(module.literal_exec_target(line),target)
  for text in ('exec "$dynamic" "$@"','exec /tmp/arbitrary "$@"','exec '+target+' "$@"\nexec '+target+' "$@"'):
   with self.assertRaises(RuntimeError):module.literal_exec_target(text)
 def test_two_literal_launcher_layers_are_captured_without_execution(self):
  middle='/nix/store/'+'b'*32+'-launcher/bin/postgres'
  actual='/nix/store/'+'a'*32+'-observed/bin/.actual-server'
  first=('exec "'+middle+'" "$@"\n').encode();second=('exec "'+actual+'" "$@"\n').encode();calls=[]
  base=self.commands(calls,first)
  def command(f,args):
   if args[:1]==['/usr/bin/sha256sum'] and args[1]==middle:
    calls.append(args);return owned.Result(0,(hashlib.sha256(second).hexdigest()+'  '+middle+'\n').encode(),b'')
   if args[:3]==['/bin/sh','-c',module.WRAPPER_READ] and args[-1]==middle:
    calls.append(args);return owned.Result(0,second,b'')
   return base(f,args)
  with tempfile.TemporaryDirectory() as td,patch.object(owned.Fixture,'image_command',command),patch.dict(owned.IMAGE_FILES,{owned.POSTGRES:hashlib.sha256(first).hexdigest()}):
   f=self.fixture(td)
   with self.assertRaises(module.CapturedBeforeAdmission):f.image_command(module.PROBE)
   d=json.loads((pathlib.Path(td)/'pid1-executable-capture.json').read_text())
   self.assertEqual(len(d['launcher_chain']),2);self.assertTrue(d['launcher_chain_reaches_observed_executable']);self.assertFalse(d['wrapper_relationship_admitted'])
   self.assertFalse(any(a[0] in (actual,middle) for a in calls));f.raw.assert_not_called()
 def test_shell_copy_is_exact_and_fails_on_size_bounds(self):
  import subprocess
  with tempfile.TemporaryDirectory() as td:
   p=pathlib.Path(td)/'public-wrapper'
   for text,code in [('exec /known/target "$@"\n',0),('line\n'*65,81),('x'*4097+'\n',82)]:
    p.write_text(text)
    r=subprocess.run(['/bin/sh','-c',module.WRAPPER_READ,'bounded-read',str(p)],env={'PATH':'/no/external/tools'},capture_output=True,timeout=2)
    self.assertEqual(r.returncode,code)
    if code==0:self.assertEqual(r.stdout,text.encode())
 def test_resolved_literal_target_cannot_escape_nix_namespace(self):
  target='/nix/store/'+'b'*32+'-launcher/bin/postgres'
  wrapper=('exec "'+target+'" "$@"\n').encode();calls=[];base=self.commands(calls,wrapper)
  def command(f,args):
   if args==['/usr/bin/readlink','-f',target]:calls.append(args);return owned.Result(0,b'/tmp/arbitrary-executable\n',b'')
   return base(f,args)
  with tempfile.TemporaryDirectory() as td,patch.object(owned.Fixture,'image_command',command),patch.dict(owned.IMAGE_FILES,{owned.POSTGRES:hashlib.sha256(wrapper).hexdigest()}):
   f=self.fixture(td)
   with self.assertRaisesRegex(RuntimeError,'approved Nix'):f.image_command(module.PROBE)
   self.assertFalse(any('/tmp/arbitrary-executable' in a for a in calls));f.raw.assert_not_called()
 def test_running_proc_hash_must_match_resolved_file_before_capture(self):
  wrapper=b'public wrapper\n';calls=[];base=self.commands(calls,wrapper)
  def command(f,args):
   if args==['/usr/bin/sha256sum','/proc/1/exe']:calls.append(args);return owned.Result(0,('b'*64+'  /proc/1/exe\n').encode(),b'')
   return base(f,args)
  with tempfile.TemporaryDirectory() as td,patch.object(owned.Fixture,'image_command',command):
   f=self.fixture(td)
   with self.assertRaisesRegex(RuntimeError,'running executable differs'):f.image_command(module.PROBE)
   self.assertNotIn(module.PROBE,calls);f.raw.assert_not_called()
 def test_running_proc_hash_change_after_capture_is_rejected(self):
  wrapper=b'exec /nix/store/'+b'a'*32+b'-observed/bin/.actual-server "$@"\n';calls=[];base=self.commands(calls,wrapper);measurements=[]
  def command(f,args):
   if args==['/usr/bin/sha256sum','/proc/1/exe']:
    calls.append(args);measurements.append(args);h='a'*64 if len(measurements)==1 else 'b'*64
    return owned.Result(0,(h+'  /proc/1/exe\n').encode(),b'')
   return base(f,args)
  with tempfile.TemporaryDirectory() as td,patch.object(owned.Fixture,'image_command',command),patch.dict(owned.IMAGE_FILES,{owned.POSTGRES:hashlib.sha256(wrapper).hexdigest()}):
   f=self.fixture(td)
   with self.assertRaisesRegex(RuntimeError,'running executable changed'):f.image_command(module.PROBE)
   self.assertEqual(len(measurements),2);f.raw.assert_not_called()
if __name__=='__main__':unittest.main()
