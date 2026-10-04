import unittest,tempfile,pathlib,json,time,sys,ast
from unittest.mock import patch
from run_deadline_proof import owned
class Diagnostics(unittest.TestCase):
 def fixture(self,directory):
  f=owned.Fixture.__new__(owned.Fixture);f.base=['fixed-docker'];f.env={};f.deadline=time.monotonic()+20;f.sequence=0;f.nonce='b'*32;f.cid='a'*64;f.record_dir=pathlib.Path(directory);f.verify=lambda:None
  return f
 def test_early_pid1_exit_keeps_actual_failure(self):
  with tempfile.TemporaryDirectory() as td:
   f=self.fixture(td);failure=owned.Result(1,b'partial initialization\n',b'container is not running\n')
   with patch.object(owned,'run_bounded',return_value=failure):
    with self.assertRaisesRegex(RuntimeError,'PID1 failed'):f.checked(f.image_command(['/usr/bin/cat','/proc/1/comm']),'PID1')
   receipt=json.loads(next(pathlib.Path(td).glob('*command.json')).read_text())
   self.assertEqual((receipt['returncode'],receipt['stdout'],receipt['stderr']),(1,'partial initialization\n','container is not running\n'))
 def test_timeout_keeps_partial_output(self):
  with self.assertRaises(TimeoutError) as captured:
   owned.run_bounded([sys.executable,'-u','-c',"import sys,time;print('partial',flush=True);sys.stderr.write('early failure\\n');sys.stderr.flush();time.sleep(10)"],{},time.monotonic()+.2)
  r=captured.exception.bounded_result;self.assertIn(b'partial',r.stdout)
 def test_output_cap_retains_exact_bounded_partial(self):
  with self.assertRaises(RuntimeError) as captured:
   owned.run_bounded([sys.executable,'-u','-c',"print('123456789',flush=True)"],{},time.monotonic()+3,limit=2)
  result=captured.exception.bounded_result
  self.assertEqual(len(result.stdout)+len(result.stderr),2)
 def test_first_removal_and_independent_absence_are_separate(self):
  owner={'name':'assembl-home-client-'+'b'*32,'nonce':'b'*32,'image_id':owned.IMAGE_ID,'container_id':'a'*64,'run_id':'1','attempt':'1'}
  removed=False
  def run(argv,env,end,**kwargs):
   nonlocal removed
   args=argv[1:]
   if args[0]=='rm':removed=True;return owned.Result(0,b'',b'')
   if args[0]=='logs':return owned.Result(0,b'early startup log',b'')
   if '--format' in args:return owned.Result(0,b'{}',b'')
   if removed:return owned.Result(1,b'',('Error: No such object: '+'a'*64).encode())
   return owned.Result(0,json.dumps([{'Id':'a'*64}]).encode(),b'')
  with tempfile.TemporaryDirectory() as td,patch.object(owned,'run_bounded',side_effect=run),patch.object(owned,'verify_inspection'):
   path=pathlib.Path(td)
   owned.recover_cleanup(owner,path,{},['docker'])
   first=(path/'cleanup-final-report.json').read_bytes()
   owned.recover_cleanup(owner,path,{},['docker'],phase='cleanup-independent')
   self.assertEqual((path/'cleanup-final-report.json').read_bytes(),first)
   self.assertEqual(json.loads(first)['state'],'removed')
   self.assertEqual(json.loads((path/'cleanup-independent-report.json').read_text())['state'],'owned_container_already_absent')
 def cleanup_case(self,fail_diagnostic=False,fail_write=False):
  owner={'name':'assembl-home-client-'+'b'*32,'nonce':'b'*32,'image_id':owned.IMAGE_ID,'container_id':'a'*64,'run_id':'1','attempt':'1'};calls=[]
  def run(argv,env,end,**kwargs):
   args=argv[1:];calls.append((args,end,kwargs))
   if args[0]=='logs':
    if fail_diagnostic:raise TimeoutError('diagnostic timeout')
    return owned.Result(0,b'initdb partial log\n',b'actual startup error\n')
   if '--format' in args:return owned.Result(0,b'{"Running":false,"ExitCode":1}',b'')
   if args[0]=='rm':return owned.Result(0,b'a'*64+b'\n',b'')
   if sum(1 for a,_,_ in calls if a[0]=='inspect' and '--format' not in a)==1:return owned.Result(0,json.dumps([{'Id':'a'*64}]).encode(),b'')
   return owned.Result(1,b'',('Error: No such object: '+'a'*64).encode())
  with tempfile.TemporaryDirectory() as td,patch.object(owned,'run_bounded',side_effect=run),patch.object(owned,'verify_inspection'):
   if fail_write:
    with patch.object(pathlib.Path,'write_text',side_effect=OSError('disk full')):
     with self.assertRaisesRegex(RuntimeError,'AFTER disposal'):owned.recover_cleanup(owner,pathlib.Path(td),{},['docker'])
   elif fail_diagnostic:
    with self.assertRaisesRegex(RuntimeError,'AFTER disposal'):owned.recover_cleanup(owner,pathlib.Path(td),{},['docker'])
    self.assertEqual(json.loads((pathlib.Path(td)/'cleanup-final-report.json').read_text())['state'],'removed')
   else:
    result=owned.recover_cleanup(owner,pathlib.Path(td),{},['docker']);self.assertEqual(result['state'],'removed')
    if not fail_diagnostic:
     log=json.loads((pathlib.Path(td)/'cleanup-final-startup-logs.json').read_text());self.assertIn('actual startup error',log['stderr']);self.assertIn('partial log',log['stdout'])
   self.assertTrue(any(a[0]=='rm' for a,_,_ in calls));self.assertEqual(calls[-1][0],['inspect','a'*64])
   self.assertTrue(all(kwargs.get('limit')==65536 for a,_,kwargs in calls if a[0]=='logs' or '--format' in a))
 def test_early_exit_logs_then_cleanup(self):self.cleanup_case()
 def test_diagnostic_timeout_cannot_block_cleanup(self):self.cleanup_case(fail_diagnostic=True)
 def test_disk_failure_cannot_block_cleanup(self):self.cleanup_case(fail_write=True)
 def test_inspection_environment_not_retained(self):
  r=owned.Result(0,json.dumps([{'Id':'owned','Config':{'Env':['SECRET=fictional'],'Labels':{}},'State':{}}]).encode(),b'')
  receipt=owned.command_receipt(['inspect','owned'],r);self.assertNotIn('SECRET',receipt['stdout']);self.assertNotIn('Env',receipt['stdout'])
 def test_startup_and_permission_sources_unchanged(self):
  root=pathlib.Path(__file__).parent
  before=ast.parse((root/'cleared-diagnostic-reference/run_fixture.py.reference').read_text())
  after=ast.parse((root/'owned-fixture/run_fixture.py').read_text())
  def methods(tree):
   fixture=next(n for n in tree.body if isinstance(n,ast.ClassDef) and n.name=='Fixture')
   return {n.name:ast.dump(n) for n in fixture.body if isinstance(n,ast.FunctionDef)}
  old,new=methods(before),methods(after)
  for name in old:
   if name!='create':self.assertEqual(old[name],new[name],name)
  prior=None
  for tree in (before,after):
   constants={n.targets[0].id:ast.dump(n.value) for n in tree.body if isinstance(n,ast.Assign) and isinstance(n.targets[0],ast.Name)}
   if prior is None:prior=constants
   else:self.assertEqual(prior,constants)
if __name__=='__main__':unittest.main()
