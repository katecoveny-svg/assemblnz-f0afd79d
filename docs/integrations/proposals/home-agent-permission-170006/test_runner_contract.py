import unittest,time,sys
from run_deadline_proof import exact_success,exact_error,exact_timeout,owned,SUCCESS,CONNECTION_END
from live_client import Live
class Contracts(unittest.TestCase):
 def test_exact_success(self):
  exact_success(owned.Result(0,SUCCESS,b''))
  for r in [owned.Result(0,SUCCESS+b'extra\n',b''),owned.Result(0,b'',b''),owned.Result(1,SUCCESS,b'')]:
   with self.assertRaises(RuntimeError):exact_success(r)
 def test_exact_rejection(self):
  exact_error(owned.Result(1,b'',b'ERROR:  Wrong fixture target/executor/version\n'),'Wrong fixture target/executor/version')
  for code,msg in [(3,b'ERROR:  wrong\n'),(1,b'prefix ERROR:  wrong\n'),(1,b'ERROR:  wrong\nextra\n')]:
   with self.assertRaises(RuntimeError):exact_error(owned.Result(code,b'',msg),'wrong')
 def test_timeout_contract(self):
  good=owned.Result(2,b'idle_ready\n',b'FATAL:  terminating connection due to idle-in-transaction timeout\n'+CONNECTION_END)
  exact_timeout(good,'idle-in-transaction',stdout=b'idle_ready\n')
  with self.assertRaises(RuntimeError):exact_timeout(owned.Result(1,good.stdout,good.stderr),'idle-in-transaction',stdout=good.stdout)
  with self.assertRaises(RuntimeError):exact_timeout(owned.Result(2,good.stdout,good.stderr+b'extra\n'),'idle-in-transaction',stdout=good.stdout)
 def test_live_selector_bounded_collection(self):
  end=time.monotonic()+3
  x=Live([sys.executable,'-u','-c',"import sys; print('ready'); sys.stdin.readline(); print('done')"],{},end-1,cleanup_deadline=end)
  try:
   x.send(b'wake\n');code,out,err=x.collect()
   self.assertEqual((code,out,err),(0,b'ready\ndone\n',b''))
  finally:x.close()
if __name__=='__main__':unittest.main()
