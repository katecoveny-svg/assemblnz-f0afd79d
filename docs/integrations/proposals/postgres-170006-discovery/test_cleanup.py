import ast,json,pathlib,tempfile,time,unittest,sys
SOURCE=pathlib.Path(__file__).with_name('discover.py')
class Cleanup(unittest.TestCase):
 def test_diagnostic_failures_do_not_block_owned_removal(self):
  tree=ast.parse(SOURCE.read_text());fn=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in ('cleanup','evidence_write')]
  with tempfile.TemporaryDirectory() as d:
   cid='a'*64;nonce='b'*32;config='sha256:'+'c'*64;name='assembl-pg-discovery-'+nonce;calls=[]
   def run(args,*a,**k):
    calls.append(args)
    if args[:2]==['container','ls']:return cid+'\n' if any(x.startswith('name=') for x in args) else ''
    if args[0]=='inspect' and '{{json .Id}}' in args[2]:return ' '.join(json.dumps(x) for x in [cid,config,'/'+name,{'assembl.discovery.nonce':nonce}])
    if args[0] in ['logs','inspect']:raise TimeoutError('diagnostic timeout/output cap')
    if args[0]=='rm':return cid+'\n'
    raise AssertionError(args)
   scope={'sys':sys,'time':time,'re':__import__('re'),'json':json,'OUT':pathlib.Path(d),'cid':cid,'name':name,'nonce':nonce,'CONFIG':config,'receipt_namespace':'discovery','run':run,'owner':{'create_state':'acknowledged'},'save_owner':lambda:None,'require':lambda c,m:None if c else (_ for _ in ()).throw(RuntimeError(m))}
   exec(compile(ast.Module(body=fn,type_ignores=[]),str(SOURCE),'exec'),scope)
   scope['cleanup']()
   self.assertTrue(any(x[0]=='rm' for x in calls))
   self.assertEqual(json.loads((pathlib.Path(d)/'cleanup-final-report.json').read_text())['state'],'removed_and_absent')
   self.assertEqual([x['status'] for x in json.loads((pathlib.Path(d)/'cleanup-final-diagnostics.json').read_text())],['failed_nonblocking','failed_nonblocking'])
 def test_distinct_namespaces_preserve_final_report(self):
  # Execute the real cleanup body twice with a final owner already absent on independent cleanup.
  tree=ast.parse(SOURCE.read_text());fn=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in ('cleanup','evidence_write')]
  with tempfile.TemporaryDirectory() as d:
   p=pathlib.Path(d);(p/'cleanup-final-report.json').write_text('first frozen outcome')
   scope={'sys':sys,'time':time,'re':__import__('re'),'json':json,'OUT':p,'cid':None,'name':'assembl-pg-discovery-'+'b'*32,'nonce':'b'*32,'CONFIG':'sha256:'+'c'*64,'receipt_namespace':'cleanup-only','run':lambda *a,**k:'','owner':{'removal_confirmed':True},'save_owner':lambda:None,'require':lambda c,m:None if c else (_ for _ in ()).throw(RuntimeError(m))}
   exec(compile(ast.Module(body=fn,type_ignores=[]),str(SOURCE),'exec'),scope);scope['cleanup']()
   self.assertEqual((p/'cleanup-final-report.json').read_text(),'first frozen outcome')
   self.assertEqual(json.loads((p/'cleanup-only-report.json').read_text())['state'],'observed_absent_after_confirmed_removal')
if __name__=='__main__':unittest.main()
