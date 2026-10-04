"""Exercise real run subprocesses and real EISDIR/ENOTDIR writes, without Docker."""
import ast,json,os,pathlib,re,selectors,signal,subprocess,sys,tempfile,time,unittest,uuid
SOURCE=pathlib.Path(__file__).with_name('discover.py')
class DiskFailure(unittest.TestCase):
 def test_real_disk_failures_never_gate_owned_removal(self):
  for broken in ('all_evidence','diagnostic_summary'):
   with self.subTest(broken=broken),tempfile.TemporaryDirectory() as d:
    root=pathlib.Path(d);out=root/'evidence';trace=root/'trace.jsonl';state=root/'removed';cid='a'*64;nonce='b'*32;config='sha256:'+'c'*64;name='assembl-pg-discovery-'+nonce
    if broken=='all_evidence':out.write_text('not a directory')
    else:
     out.mkdir();(out/'cleanup-final-diagnostics.json').mkdir()
    script=root/'fake_docker.py'
    script.write_text("""import sys,json,pathlib
trace,state,cid,config,name,nonce=sys.argv[1:7];args=sys.argv[7:]
with pathlib.Path(trace).open('a') as f:f.write(json.dumps(args)+'\\n')
if args[:2]==['container','ls']:
 print(cid if any(x.startswith('name=') for x in args) and not pathlib.Path(state).exists() else '')
elif args[0]=='inspect' and '{{json .Id}}' in args[2]:
 print(' '.join(json.dumps(x) for x in [cid,config,'/'+name,{'assembl.discovery.nonce':nonce}]))
elif args[0]=='rm':
 pathlib.Path(state).write_text('removed');print(cid)
elif args[0]=='logs':print('startup diagnostics')
elif args[0]=='inspect':print('{}')
else:raise SystemExit(9)
""")
    scope={'OUT':out,'BASE':[sys.executable,str(script),str(trace),str(state),cid,config,name,nonce],'end':time.monotonic()+30,'sequence':0,'receipt_namespace':'discovery','env':{'PATH':os.environ['PATH']},'cid':cid,'nonce':nonce,'name':name,'CONFIG':config,'owner':{'create_state':'acknowledged'},'time':time,'subprocess':subprocess,'selectors':selectors,'os':os,'signal':signal,'json':json,'sys':sys,'uuid':uuid,'re':re}
    tree=ast.parse(SOURCE.read_text());nodes=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in ('run','cleanup','evidence_write','save_owner','require')]
    exec(compile(ast.Module(body=nodes,type_ignores=[]),str(SOURCE),'exec'),scope)
    with self.assertRaisesRegex(RuntimeError,'evidence persistence failed'):scope['cleanup']()
    calls=[json.loads(x) for x in trace.read_text().splitlines()]
    rm=next(i for i,x in enumerate(calls) if x[0]=='rm')
    self.assertEqual(calls[rm],['rm','--force','--volumes',cid])
    self.assertTrue(any(x[:2]==['container','ls'] and 'id='+cid in x for x in calls[rm+1:]))
    self.assertTrue(state.exists());self.assertTrue(scope['owner']['removal_confirmed'])
    report=scope['cleanup_memory_report'];self.assertEqual(report['state'],'removed_and_absent');self.assertTrue(report['evidence_failures'])
    self.assertFalse(scope['cleanup_evidence_mode'])
    self.assertTrue(all(r['complete'] and r['code']==0 for r in scope['cleanup_memory_receipts']))
    inspect_receipt=next(r for r in scope['cleanup_memory_receipts'] if r['argv'][0]=='inspect' and '{{json .Id}}' in r['argv'][2])
    self.assertIn(cid,inspect_receipt['stdout'])
    if broken=='all_evidence':self.assertTrue(any(e['file'].endswith('-command.json') for e in report['evidence_failures']))
    else:
     self.assertTrue(any(e['file']=='cleanup-final-diagnostics.json' for e in report['evidence_failures']))
     persisted=json.loads((out/'cleanup-final-report.json').read_text());self.assertEqual(persisted['state'],'removed_and_absent');self.assertTrue(persisted['evidence_failures'])
if __name__=='__main__':unittest.main()
