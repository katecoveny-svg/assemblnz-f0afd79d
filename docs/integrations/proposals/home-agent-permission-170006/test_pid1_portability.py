import unittest,pathlib,ast,subprocess,tempfile,json
from run_deadline_proof import owned
ROOT=pathlib.Path(__file__).parent
class PID1Portability(unittest.TestCase):
 def probe(self):
  tree=ast.parse((ROOT/'owned-fixture/run_fixture.py').read_text())
  calls=[n for n in ast.walk(tree) if isinstance(n,ast.Call) and isinstance(n.func,ast.Attribute) and n.func.attr=='image_command' and n.args and isinstance(n.args[0],ast.List)]
  args=[ast.literal_eval(n.args[0]) for n in calls if all(isinstance(a,ast.Constant) for a in n.args[0].elts)]
  found=[a for a in args if '/proc/1/comm' in ' '.join(map(str,a))]
  self.assertEqual(len(found),1);self.assertEqual(found[0][:2],['/bin/sh','-c']);return found[0]
 def test_exact_minimal_probe_delta(self):
  prior=(ROOT/'cleared-diagnostic-reference/run_fixture.py.reference').read_text()
  current=(ROOT/'owned-fixture/run_fixture.py').read_text()
  old="self.image_command(['/usr/bin/cat','/proc/1/comm'])"
  new="self.image_command("+repr(self.probe())+")"
  # Compare AST rather than quote style; exactly one probe expression is admitted.
  self.assertEqual(prior.count(old),1)
  self.assertEqual(self.probe(),['/bin/sh','-c',"IFS= read -r fixture_comm < /proc/1/comm && printf '%s\\n' \"$fixture_comm\""])
  self.assertIn("data['path']==RUNNING_POSTGRES",current)
  self.assertIn("data['path_after']==RUNNING_POSTGRES",current)
  self.assertNotIn('/usr/bin/cat',current)
 def test_builtin_reader_prints_exact_comm_without_external_tools(self):
  args=self.probe()
  self.assertEqual(args[2],"IFS= read -r fixture_comm < /proc/1/comm && printf '%s\\n' \"$fixture_comm\"")
  with tempfile.TemporaryDirectory() as td:
   target=pathlib.Path(td)/'comm';target.write_text('postgres\n')
   # Local benign stand-in only; production source target stays literal /proc/1/comm.
   script=args[2].replace('/proc/1/comm',str(target))
   r=subprocess.run(['/bin/sh','-c',script],env={'PATH':'/no/external/tools'},capture_output=True,timeout=2)
   self.assertEqual((r.returncode,r.stdout,r.stderr),(0,b'postgres\n',b''))
 def test_unreadable_comm_is_nonzero(self):
  with tempfile.TemporaryDirectory() as td:
   script=self.probe()[2].replace('/proc/1/comm',str(pathlib.Path(td)/'missing'))
   r=subprocess.run(['/bin/sh','-c',script],env={'PATH':'/no/external/tools'},capture_output=True,timeout=2)
   self.assertNotEqual(r.returncode,0);self.assertEqual(r.stdout,b'')
 def test_known_shell_provenance_and_prior_failure(self):
  refs=ROOT/'cleared-diagnostic-reference'
  failed=json.loads((refs/'044-command.json').read_text());self.assertEqual(failed['returncode'],127);self.assertIn('/usr/bin/cat',failed['stderr'])
  logs=json.loads((refs/'cleanup-final-startup-logs.json').read_text())
  self.assertIn('Success. You can now start the database server',logs['stdout'])
  self.assertIn('database system is ready to accept connections',logs['stderr'])
  self.assertTrue(json.loads(json.loads((refs/'cleanup-final-terminal-state.json').read_text())['stdout'])['Running'])
  self.assertIn("'--entrypoint','/bin/sh'",(ROOT/'cleared-diagnostic-reference/run_fixture.py.reference').read_text())
if __name__=='__main__':unittest.main()
