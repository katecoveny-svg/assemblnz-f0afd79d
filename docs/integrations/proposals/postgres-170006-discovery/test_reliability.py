import ast,json,pathlib,tempfile,time,unittest,os,selectors,signal,subprocess,sys,uuid,re
SOURCE=pathlib.Path(__file__).with_name('discover.py')
def definitions(names,scope):
 tree=ast.parse(SOURCE.read_text());nodes=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in names]
 exec(compile(ast.Module(body=nodes,type_ignores=[]),str(SOURCE),'exec'),scope)
class Reliability(unittest.TestCase):
 def test_atomic_owner_and_no_assert_guards(self):
  self.assertFalse(any(isinstance(n,ast.Assert) for n in ast.walk(ast.parse(SOURCE.read_text()))))
  with tempfile.TemporaryDirectory() as d:
   p=pathlib.Path(d);scope={'OUT':p,'owner':{'nonce':'first'},'os':os,'json':json,'uuid':uuid}
   definitions(['save_owner'],scope);scope['save_owner']();scope['owner']={'nonce':'second'};scope['save_owner']()
   self.assertEqual(json.loads((p/'owner.json').read_text()),{'nonce':'second'});self.assertEqual(list(p.glob('*.tmp')),[])
 def test_partial_timeout_and_cap_receipts(self):
  for program,seconds,error in [("import time;print('partial',flush=True);time.sleep(2)",.1,TimeoutError),("import sys;sys.stdout.write('x'*(4*1024*1024+10000));sys.stdout.flush()",2,RuntimeError)]:
   with tempfile.TemporaryDirectory() as d:
    scope={'OUT':pathlib.Path(d),'BASE':[sys.executable,'-u','-c',program],'end':time.monotonic()+3,'sequence':0,'receipt_namespace':'discovery','env':{'PATH':os.environ['PATH']},'time':time,'subprocess':subprocess,'selectors':selectors,'os':os,'signal':signal,'json':json}
    definitions(['run','evidence_write'],scope)
    with self.assertRaises(error):scope['run']([],seconds)
    receipt=json.loads(next(pathlib.Path(d).glob('discovery-*-command.json')).read_text());self.assertIsNotNone(receipt['fault']);self.assertLessEqual(receipt['retained_bytes'],4*1024*1024);self.assertGreater(receipt['retained_bytes'],0)
 def test_empty_lost_ack_reconciliation_is_unresolved(self):
  class Clock:
   value=0
   def monotonic(self):return self.value
   def sleep(self,n):self.value+=n
  with tempfile.TemporaryDirectory() as d:
   scope={'OUT':pathlib.Path(d),'cid':None,'name':'assembl-pg-discovery-'+'b'*32,'nonce':'b'*32,'CONFIG':'sha256:'+'c'*64,'receipt_namespace':'cleanup-only','owner':{'create_state':'pending'},'run':lambda *a,**k:'','time':Clock(),'json':json,'re':re,'require':lambda c,m:None if c else (_ for _ in ()).throw(RuntimeError(m))}
   scope['sys']=sys;definitions(['cleanup','evidence_write'],scope)
   with self.assertRaisesRegex(RuntimeError,'late create remains unresolved'):scope['cleanup']()
   report=json.loads((pathlib.Path(d)/'cleanup-only-report.json').read_text());self.assertEqual(report['state'],'observed_absent_unresolved_lost_create_ack');self.assertGreater(len(report['name_observations']),1)
if __name__=='__main__':unittest.main()
