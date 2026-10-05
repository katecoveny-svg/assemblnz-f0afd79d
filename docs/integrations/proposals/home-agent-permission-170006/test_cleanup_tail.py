import ast,json,pathlib,sys,tempfile,time,unittest
from unittest.mock import patch
from run_deadline_proof import owned
class CleanupTail(unittest.TestCase):
 def exercise(self,logs,primary=False):
  owner={'name':'assembl-home-client-'+'b'*32,'nonce':'b'*32,'image_id':owned.IMAGE_ID,'container_id':'a'*64,'run_id':'1','attempt':'1'};calls=[];removed=False
  def run(argv,env,end,**kwargs):
   nonlocal removed
   args=argv[1:];calls.append((args,end,kwargs))
   if args[0]=='logs':
    self.assertEqual(args,['logs','--tail','80','a'*64]);self.assertEqual(kwargs['limit'],65536)
    return logs(env,end,kwargs['limit'])
   if '--format' in args:return owned.Result(0,b'{"Running":true,"OOMKilled":false}',b'')
   if args[0]=='rm':removed=True;return owned.Result(0,b'a'*64+b'\n',b'')
   if removed:return owned.Result(1,b'',b'Error: No such object: '+b'a'*64+b'\n')
   return owned.Result(0,json.dumps([{'Id':'a'*64}]).encode(),b'')
  with tempfile.TemporaryDirectory() as td,patch.object(owned,'run_bounded',side_effect=run),patch.object(owned,'verify_inspection'):
   d=pathlib.Path(td);failure=None
   if primary:(d/'primary-client-error.json').write_text('{"returncode":1,"stderr":"original proof error"}')
   try:
    if primary:
     try:raise ValueError('original proof error')
     except ValueError:owned.recover_cleanup(owner,d,{},['docker'])
    else:owned.recover_cleanup(owner,d,{},['docker'])
   except RuntimeError as error:failure=error
   receipt=json.loads((d/'cleanup-final-startup-logs.json').read_text());report=json.loads((d/'cleanup-final-report.json').read_text())
   self.assertTrue(removed);self.assertEqual(calls[-1][0],['inspect','a'*64]);self.assertTrue(report['removed']);self.assertEqual(report['evidence_failures'],[])
   if primary:self.assertEqual(json.loads((d/'primary-client-error.json').read_text())['stderr'],'original proof error')
   return receipt,report,failure
 def test_large_omitted_history_fitting_tail(self):
  history=[('historical SQL echo '+str(i)+'x'*1024).encode() for i in range(1000)]+[b'ERROR: expected synthetic rejection']*80
  self.assertGreater(sum(map(len,history)),65536)
  def logs(env,end,limit):return owned.Result(0,b'',b'\n'.join(history[-80:])+b'\n')
  r,report,error=self.exercise(logs)
  self.assertIsNone(error);self.assertTrue(r['capture_complete']);self.assertFalse(r['full_history_requested']);self.assertFalse(r['full_history_complete']);self.assertTrue(r['history_omission_possible']);self.assertIsNone(r['omitted_history_count']);self.assertEqual(r['requested_tail_lines'],80);self.assertIn('ERROR: expected',r['stderr']);self.assertEqual(report['diagnostic_failures'],[])
 def test_oversized_tail_fails_after_disposal(self):
  # One record can exceed the cap despite the fixed line tail.
  actual=owned.run_bounded
  def logs(env,end,limit):return actual([sys.executable,'-u','-c',"import sys;sys.stderr.write('x'*70000);sys.stderr.flush()"],env,end,limit=limit)
  r,report,error=self.exercise(logs)
  self.assertIsNotNone(error);self.assertIn('AFTER disposal',str(error));self.assertTrue(r['partial']);self.assertFalse(r['capture_complete']);self.assertEqual(r['stdout_bytes']+r['stderr_bytes'],65536);self.assertEqual(r['aggregate_byte_cap'],65536);self.assertTrue(report['diagnostic_failures'])
 def test_primary_failure_and_partial_diagnostics_retained(self):
  def logs(env,end,limit):
   error=TimeoutError('partial diagnostic timeout');error.bounded_result=owned.Result(None,b'partial startup',b'partial error');raise error
  r,report,error=self.exercise(logs,primary=True)
  self.assertIsNotNone(error);self.assertEqual(report['primary_failure_type'],'ValueError');self.assertEqual(r['stdout'],'partial startup');self.assertEqual(r['stderr'],'partial error');self.assertTrue(r['partial']);self.assertFalse(r['capture_complete']);self.assertEqual(r['fault'],'TimeoutError')
 def test_nonzero_logs_still_fail(self):
  r,report,error=self.exercise(lambda env,end,limit:owned.Result(1,b'',b'docker logs failed'))
  self.assertIsNotNone(error);self.assertFalse(r['capture_complete']);self.assertEqual(r['stderr'],'docker logs failed');self.assertEqual(report['diagnostic_failures'][0]['code'],1)
 def test_entire_proof_and_identity_source_preserved(self):
  root=pathlib.Path(__file__).parent;old=ast.parse((root/'cleanup-reviewed/run_fixture.py.reference').read_text());new=ast.parse((root/'owned-fixture/run_fixture.py').read_text())
  def frozen(tree):return [ast.dump(n) for n in tree.body if not isinstance(n,ast.FunctionDef) or n.name!='recover_cleanup']
  self.assertEqual(frozen(old),frozen(new))
if __name__=='__main__':unittest.main()
