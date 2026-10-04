"""Offline path semantics; no Docker/image invocation."""
import ast,pathlib,re,subprocess,tempfile,unittest
SOURCE=pathlib.Path(__file__).with_name('discover.py')
class Portability(unittest.TestCase):
 def scope(self,override=None):
  calls=[]
  def execute(args,*a,**k):
   calls.append(args)
   if args[0]=='/usr/bin/readlink':
    if args[1]!='-f':raise RuntimeError('BusyBox rejects GNU-only readlink option')
    # Emulate documented -f including a missing final leaf. Real shell checks below.
    return override if override is not None else str(pathlib.Path(args[2]).resolve(strict=False))+'\n'
   r=subprocess.run(args,capture_output=True,text=True,timeout=2)
   if r.returncode:raise RuntimeError('resolved file/executable check refused')
   return r.stdout
  tree=ast.parse(SOURCE.read_text());nodes=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in ('require','resolve_executable')]
  scope={'execute':execute,'re':re};exec(compile(ast.Module(body=nodes,type_ignores=[]),str(SOURCE),'exec'),scope)
  return scope,calls
 def test_existing_regular_executable_symlink_is_canonicalized_and_checked(self):
  with tempfile.TemporaryDirectory() as d:
   p=pathlib.Path(d);binary=p/'binary';binary.write_text('#!/bin/sh\nexit 0\n');binary.chmod(0o700);link=p/'alias';link.symlink_to(binary)
   scope,calls=self.scope();self.assertEqual(scope['resolve_executable'](str(link)),str(binary.resolve()))
   self.assertEqual(calls[0],['/usr/bin/readlink','-f',str(link)])
   self.assertEqual(calls[1],['/bin/sh','-c','test -f "$1" && test -x "$1"','discovery-file-check',str(binary.resolve())])
 def test_missing_dangling_directory_and_nonexecutables_refuse_before_hash_or_invocation(self):
  with tempfile.TemporaryDirectory() as d:
   p=pathlib.Path(d);directory=p/'directory';directory.mkdir();plain=p/'plain';plain.write_text('fixture');plain.chmod(0o600);dangling=p/'dangling';dangling.symlink_to(p/'absent')
   for path in [p/'missing',dangling,directory,plain]:
    with self.subTest(path=path.name):
     scope,calls=self.scope()
     with self.assertRaisesRegex(RuntimeError,'file/executable check refused'):scope['resolve_executable'](str(path))
     self.assertEqual(len(calls),2);self.assertFalse(any('sha256sum' in x[0] for x in calls))
 def test_invalid_input_and_resolved_paths_are_rejected_before_shell(self):
  for path in ['relative','/tmp/fixture;echo','/tmp/fixture\nnext','/tmp/fixture space']:
   scope,calls=self.scope()
   with self.assertRaisesRegex(RuntimeError,'Invalid executable input path'):scope['resolve_executable'](path)
   self.assertEqual(calls,[])
  for result in ['', 'relative', '/tmp/path;echo', '/tmp/path\nsecond']:
   scope,calls=self.scope(result)
   with self.assertRaisesRegex(RuntimeError,'Invalid resolved executable path'):scope['resolve_executable']('/usr/bin/postgres')
   self.assertEqual(len(calls),1)
 def test_all_discovery_executable_paths_use_guard_before_hashing(self):
  source=SOURCE.read_text();tree=ast.parse(source);main=next(n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='main')
  calls=[n for n in ast.walk(main) if isinstance(n,ast.Call) and isinstance(n.func,ast.Name) and n.func.id=='resolve_executable']
  self.assertEqual(len(calls),2) # PostgreSQL tools and entrypoint resolution.
  self.assertNotIn("['/usr/bin/readlink','-e'",source)
  self.assertIn("require(re.fullmatch('[a-f0-9]{64}',sha), 'Invalid entrypoint SHA256')",source)
if __name__=='__main__':unittest.main()
