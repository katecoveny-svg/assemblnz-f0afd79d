import unittest,subprocess,json,tempfile,pathlib,time,sys
from unittest.mock import patch
from run_deadline_proof import owned
class DiagnosticBudget(unittest.TestCase):
 def test_image_and_container_inspection_projection(self):
  payload=json.dumps([{'Id':'pinned','Config':{'Env':['SECRET=fictional']}}]).encode()
  for args in (['inspect','owned'],['image','inspect',owned.IMAGE]):
   receipt=owned.command_receipt(args,owned.Result(0,payload,b''))
   self.assertNotIn('SECRET',receipt['stdout']);self.assertNotIn('Env',receipt['stdout'])
   error=TimeoutError();error.bounded_result=owned.Result(None,payload,b'')
   self.assertIn('withheld',owned.command_receipt(args,error=error)['stdout'])
   self.assertIn('withheld',owned.command_receipt(args,owned.Result(1,b'{"Config":{"Env":',b''))['stdout'])
 def test_delayed_termination_preserves_twenty_seconds_for_cleanup(self):
  owner={'name':'assembl-home-client-'+'b'*32,'nonce':'b'*32,'image_id':owned.IMAGE_ID,'container_id':'a'*64,'run_id':'1','attempt':'1'}
  clock=[0.0];removed=[False];remove_at=[]
  class SlowTermination:
   pid=123;returncode=None
   def poll(self):return self.returncode
   def wait(self,timeout):
    clock[0]+=timeout
    if self.returncode is None:
     self.returncode=-9
     raise subprocess.TimeoutExpired('owned',timeout)
    return self.returncode
  def run(argv,env,end,**kwargs):
   args=argv[1:]
   if args[0]=='logs' or '--format' in args:
    clock[0]+=.5;owned.terminate(SlowTermination(),end)
    error=TimeoutError('delayed diagnostic termination');error.bounded_result=owned.Result(-9,b'partial',b'diagnostic');raise error
   if args[0]=='rm':remove_at.append(clock[0]);clock[0]+=10;removed[0]=True;return owned.Result(0,b'',b'')
   if removed[0]:clock[0]+=8;return owned.Result(1,b'',('Error: No such object: '+'a'*64).encode())
   clock[0]+=8;return owned.Result(0,json.dumps([{'Id':'a'*64}]).encode(),b'')
  with tempfile.TemporaryDirectory() as td,patch.object(owned.time,'monotonic',side_effect=lambda:clock[0]),patch.object(owned,'run_bounded',side_effect=run),patch.object(owned,'verify_inspection'),patch.object(owned.os,'killpg'):
   with self.assertRaisesRegex(RuntimeError,'AFTER disposal'):owned.recover_cleanup(owner,pathlib.Path(td),{},['docker'])
   self.assertEqual(remove_at,[10]);self.assertEqual(clock[0],28)
   self.assertEqual(json.loads((pathlib.Path(td)/'cleanup-final-report.json').read_text())['state'],'removed')
 def test_termination_failure_retains_streams_and_closes_all(self):
  captured=[];selectors=[];real_popen=owned.subprocess.Popen;real_selector=owned.selectors.DefaultSelector;real_terminate=owned.terminate
  def fail_reap(proc,deadline):
   real_terminate(proc,deadline);raise RuntimeError('reap failure')
  def spawn(*args,**kwargs):
   p=real_popen(*args,**kwargs);captured.append(p);return p
  def selector():
   s=real_selector();selectors.append(s);return s
  with patch.object(owned.subprocess,'Popen',side_effect=spawn),patch.object(owned.selectors,'DefaultSelector',side_effect=selector),patch.object(owned,'terminate',side_effect=fail_reap):
   with self.assertRaisesRegex(RuntimeError,'reap failure') as failure:
    owned.run_bounded([sys.executable,'-u','-c',"import sys,time;print('actual stdout',flush=True);sys.stderr.write('actual stderr\\n');sys.stderr.flush();time.sleep(10)"],{},time.monotonic()+.2)
  self.assertEqual(failure.exception.primary_fault,'TimeoutError')
  r=failure.exception.bounded_result
  self.assertIn(b'actual stdout',r.stdout);self.assertIn(b'actual stderr',r.stderr)
  self.assertTrue(all(stream.closed for stream in (captured[0].stdin,captured[0].stdout,captured[0].stderr)))
  self.assertIsNone(selectors[0].get_map())
 def test_real_term_ignoring_child_fits_absolute_budget(self):
  started=time.monotonic()
  with self.assertRaises(TimeoutError) as failure:
   owned.run_bounded([sys.executable,'-u','-c',"import signal,time;signal.signal(signal.SIGTERM,signal.SIG_IGN);print('partial',flush=True);time.sleep(10)"],{},started+.6)
  self.assertLess(time.monotonic()-started,.9)
  self.assertIn(b'partial',failure.exception.bounded_result.stdout)
if __name__=='__main__':unittest.main()
