import unittest,re,json,hashlib
from pathlib import Path
from build_queries import build,generate,snapshot,ROOT
class Sources(unittest.TestCase):
 def test_expected_json_unchanged(self):
  for name in ['forward','rollback']:
   old=re.findall(r'\$expected\$(.*?)\$expected\$::jsonb',(ROOT/(name+'.sql.txt')).read_text(),re.S)
   new=re.findall(r'\$expected\$(.*?)\$expected\$::jsonb',build(name),re.S)
   self.assertEqual(new,old)
 def test_no_prompt_helper_or_psql(self):
  for name in ['forward','rollback']:
   s=build(name);self.assertNotIn('\\',s);self.assertNotIn('CREATE FUNCTION',s);self.assertNotIn('pg_temp.',s)
   self.assertEqual(s.count('BEGIN;'),1);self.assertEqual(s.count('COMMIT;'),1)
   self.assertLess(s.index("transaction_timeout = '30s'"),s.index('LOCK TABLE'))
   self.assertIn('search_path = pg_catalog, public',s)
 def test_catalog_and_c(self):
  s=build('forward');self.assertNotRegex(s,r'\b(?:FROM|JOIN) pg_(?!catalog\.)')
  self.assertNotIn('COLLATE "C"',s);self.assertIn('COLLATE pg_catalog."C"',s)
 def test_snapshot_has_no_helper_or_write(self):
  s=snapshot();self.assertIn('WITH roles',s);self.assertIn('pg_catalog.pg_class',s)
  for x in ['CREATE ','REVOKE ','GRANT ',' INTO actual']:self.assertNotIn(x,s)
 def test_actions_identical(self):
  for name,start in [('forward','REVOKE ALL PRIVILEGES'),('rollback','GRANT SELECT, INSERT')]:
   old=(ROOT/(name+'.sql.txt')).read_text();a=old[old.index(start):old.index('\nDO $assert$',old.index(start))].strip();self.assertIn(a,build(name))
 def test_generated_cases(self):
  d=generate();self.assertIn("transaction_timeout = '2s'",(d/'active-deadline.sql').read_text())
  self.assertIn('170010',(d/'wrong-version.sql').read_text())
  self.assertIn("idle_in_transaction_session_timeout='0'",(d/'idle-total-deadline.sql').read_text())
if __name__=='__main__':unittest.main()
