import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

// Disposable Postgres + pgvector; no host port, production URL, or real data.
const container = `assembl-memory-rls-${process.pid}`;
function docker(args, input) {
  const r = spawnSync('docker', args, { input, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(r.stderr || r.stdout);
  return r.stdout.trim();
}
function sql(query) {
  // TCP waits for the final server; initdb's temporary socket server restarts.
  return docker(['exec', '-i', container, 'psql', '-h', '127.0.0.1', '-X', '-qAt', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres'], query);
}
const alice = '11111111-1111-4111-8111-111111111111';
const bob = '22222222-2222-4222-8222-222222222222';
const tenant = '33333333-3333-4333-8333-333333333333';
const old = readFileSync(new URL('../supabase/migrations/20260420020250_550f0934-2896-43c0-b8b0-2916c009ac61.sql', import.meta.url), 'utf8');
const policies = old.slice(old.indexOf('DROP POLICY IF EXISTS "agent_memory_tenant_read"'), old.indexOf('-- 4. Extraction queue'));
const search = old.slice(old.indexOf('CREATE OR REPLACE FUNCTION public.match_agent_memory('));
const migration = readFileSync(new URL('../supabase/migrations/20260916011438_protect_private_agent_memory.sql', import.meta.url), 'utf8');
let checks = 0;
function check(name, role, user, query, expected) {
  assert.equal(sql(`SET ROLE ${role}; SET request.jwt.claim.sub = '${user}'; ${query}`), expected, name);
  checks++;
  console.log(`PASS ${name}`);
}
function denied(name, role, user, query) {
  assert.throws(() => sql(`SET ROLE ${role}; SET request.jwt.claim.sub = '${user}'; ${query}`), /permission denied|row-level security/, name);
  checks++;
  console.log(`PASS ${name}`);
}
try {
  docker(['run', '--rm', '-d', '--network', 'none', '--name', container,
    '-e', 'POSTGRES_HOST_AUTH_METHOD=trust', 'pgvector/pgvector:pg17']);
  let ready = false;
  for (let i = 0; i < 40; i++) {
    try { sql('SELECT 1'); ready = true; break; } catch { await new Promise(r => setTimeout(r, 250)); }
  }
  assert.ok(ready, 'isolated Postgres started');
  sql(`
    CREATE EXTENSION vector;
    CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
    CREATE SCHEMA auth;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
      $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
    CREATE TABLE tenant_members (tenant_id uuid, user_id uuid);
    GRANT SELECT ON tenant_members TO anon, authenticated, service_role;
    INSERT INTO tenant_members VALUES ('${tenant}', '${alice}'), ('${tenant}', '${bob}');
    CREATE TABLE agent_memory (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
      tenant_id uuid, memory_type text, subject text, content text, importance integer,
      embedding vector(3), superseded_by uuid, scope text DEFAULT 'personal'
    );
    ALTER TABLE agent_memory ENABLE ROW LEVEL SECURITY;
    GRANT ALL ON agent_memory TO anon, authenticated, service_role;
    CREATE POLICY agent_memory_owner ON agent_memory FOR ALL TO authenticated
      USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
    CREATE POLICY "Users can view own memories" ON agent_memory FOR SELECT TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own memories" ON agent_memory FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update own memories" ON agent_memory FOR UPDATE TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete own memories" ON agent_memory FOR DELETE TO authenticated USING (auth.uid() = user_id);
    ${policies}
    ${search}
    INSERT INTO agent_memory(user_id, tenant_id, subject, embedding) VALUES
      ('${alice}', NULL, 'alice-private', '[1,0,0]'),
      ('${bob}', NULL, 'bob-private', '[1,0,0]'),
      ('${bob}', '${tenant}', 'bob-tenant', '[1,0,0]');
  `);
  check('reproduces legacy anonymous read on synthetic rows', 'anon', '', 'SELECT count(*) FROM agent_memory', '2');
  check('reproduces legacy search bypass on synthetic rows', 'anon', '', "SELECT count(*) FROM match_agent_memory(NULL,NULL,'[1,0,0]',10,0)", '3');
  sql(migration);
  sql(migration); // idempotent reapplication
  denied('anonymous table read', 'anon', '', 'SELECT count(*) FROM agent_memory');
  denied('anonymous insertion', 'anon', '', `INSERT INTO agent_memory(user_id) VALUES ('${alice}')`);
  denied('anonymous search', 'anon', '', "SELECT count(*) FROM match_agent_memory(NULL,NULL,'[1,0,0]',10,0)");
  denied('anonymous truncate', 'anon', '', 'TRUNCATE agent_memory');
  denied('authenticated truncate', 'authenticated', alice, 'TRUNCATE agent_memory');
  check('owner sees only own row, not tenant peer', 'authenticated', alice, 'SELECT count(*) FROM agent_memory', '1');
  check('owner sees own personal and tenant rows', 'authenticated', bob, 'SELECT count(*) FROM agent_memory', '2');
  check('null search cannot bypass owner isolation', 'authenticated', alice, "SELECT count(*) FROM match_agent_memory(NULL,NULL,'[1,0,0]',10,0)", '1');
  check('forged search owner cannot read peer', 'authenticated', alice, `SELECT count(*) FROM match_agent_memory(NULL,'${bob}','[1,0,0]',10,0)`, '0');
  denied('cross-owner insert', 'authenticated', alice, `INSERT INTO agent_memory(user_id) VALUES ('${bob}')`);
  denied('owner reassignment', 'authenticated', alice, `UPDATE agent_memory SET user_id='${bob}' WHERE user_id='${alice}'`);
  check('cross-owner update affects no rows', 'authenticated', alice, `WITH changed AS (UPDATE agent_memory SET subject='forged' WHERE user_id='${bob}' RETURNING id) SELECT count(*) FROM changed`, '0');
  check('cross-owner delete affects no rows', 'authenticated', alice, `WITH changed AS (DELETE FROM agent_memory WHERE user_id='${bob}' RETURNING id) SELECT count(*) FROM changed`, '0');
  check('owner insert works', 'authenticated', alice, `WITH changed AS (INSERT INTO agent_memory(user_id,subject) VALUES ('${alice}','new') RETURNING id) SELECT count(*) FROM changed`, '1');
  check('owner update works', 'authenticated', alice, `WITH changed AS (UPDATE agent_memory SET subject='edited' WHERE subject='new' RETURNING id) SELECT count(*) FROM changed`, '1');
  check('owner delete works', 'authenticated', alice, `WITH changed AS (DELETE FROM agent_memory WHERE subject='edited' RETURNING id) SELECT count(*) FROM changed`, '1');
  check('trusted service search retained', 'service_role', '', "SELECT count(*) FROM match_agent_memory(NULL,NULL,'[1,0,0]',10,0)", '3');
  check('no original rows removed', 'postgres', '', 'SELECT count(*) FROM agent_memory', '3');
  console.log(`${checks} database checks passed.`);
} finally {
  spawnSync('docker', ['rm', '-f', container], { stdio: 'ignore' });
}
