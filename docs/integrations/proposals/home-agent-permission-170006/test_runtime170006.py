import unittest,json,pathlib,copy,re
from run_deadline_proof import owned
ROOT=pathlib.Path(__file__).parent
class Runtime170006(unittest.TestCase):
 def test_exact_retained_tools(self):
  ex=json.loads((ROOT/'observed-reference/executables.json').read_text())
  self.assertEqual(owned.IMAGE_FILES,{v['path']:v['sha256'] for v in ex.values()})
  for v in ex.values():self.assertIn(v['sha256']+'  '+v['path'],owned.STARTUP_SCRIPT)
  self.assertLess(owned.STARTUP_SCRIPT.index('sha256sum -c'),owned.STARTUP_SCRIPT.index(owned.INITDB+' -D'))
 def test_locale_fails_closed(self):
  rows=[dict(database=n,collate='en_US.UTF-8',ctype='en_US.UTF-8',encoding='UTF8',provider='i',icu_locale='en-US',locale_version=None if n=='template0' else '153.121') for n in ('postgres','template0','template1')]
  owned.validate_locale(rows,'cluster')
  bad=copy.deepcopy(rows);bad[1]['locale_version']='153.121'
  with self.assertRaises(RuntimeError):owned.validate_locale(bad,'cluster')
  for field,value in [('provider','c'),('collate','C'),('icu_locale','en-NZ'),('locale_version','999')]:
   bad=copy.deepcopy(rows);bad[0][field]=value
   with self.assertRaises(RuntimeError):owned.validate_locale(bad,'cluster')
 def test_closed_startup_and_clients(self):
  self.assertNotIn('PGPASSWORD',owned.STARTUP_SCRIPT)
  self.assertNotIn('docker-entrypoint.sh',owned.STARTUP_SCRIPT.split(' -D /var/lib/postgresql/data/acl')[0].split('sha256sum -c -')[-1])
  f=object.__new__(owned.Fixture);f.base=['/usr/bin/docker'];f.cid='a'*64
  self.assertIn('-w',f.psql_args());self.assertIn(owned.PSQL,f.psql_args())
  with self.assertRaises(RuntimeError):f.psql_args(database='external')
 def test_preserved_witness_and_snapshot_bytes(self):
  base=ROOT/'baseline-cleared'
  for name in ('live_client.py','budget.py','run_deadline_proof.py','forward.sql.txt','rollback.sql.txt','owned-fixture/bootstrap.sql','owned-fixture/cleanup_owned.py'):
   self.assertEqual((ROOT/name).read_bytes(),(base/(name+'.reference')).read_bytes())
  for name in ('forward','rollback'):
   from build_queries import build
   self.assertIn('<> 170006',build(name));self.assertNotIn('<> 170011',build(name))
if __name__=='__main__':unittest.main()
