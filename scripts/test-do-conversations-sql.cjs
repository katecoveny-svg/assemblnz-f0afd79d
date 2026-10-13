// Local database proof for kept conversations on embedded PostgreSQL. Never touches a hosted database.
// npm install --prefix /tmp/assembl-personal-sql @electric-sql/pglite@0.3.14
const { PGlite } = require(process.env.ASSEMBL_PGLITE_MODULE || '/tmp/assembl-personal-sql/node_modules/@electric-sql/pglite');
const fs = require('node:fs'); const os = require('node:os'); const path = require('node:path'); const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
(async () => {
 const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'do-conversation-proof-'));
 let db = new PGlite(directory); let checks = 0;
 const check = (name, ok) => { assert.ok(ok, name); checks++; console.log('PASS ' + name); };
 try {
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key,is_anonymous boolean default false); create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$; create function auth.jwt() returns jsonb language sql as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$; grant usage on schema public to anon,authenticated,service_role; grant usage on schema auth to authenticated,service_role; grant select on auth.users to service_role;`);
  await db.exec(fs.readFileSync(path.join(root, 'supabase/migrations/20261013092000_do_personal_conversations.sql'), 'utf8'));
  const a = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', b = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', anonymous = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', id = '11111111-1111-4111-8111-111111111111';
  await db.query('insert into auth.users values ($1,false),($2,false),($3,true)', [a, b, anonymous]);
  const now = new Date().toISOString(), later = new Date(Date.parse(now) + 30 * 86400000).toISOString();
  const turn = (role, text) => ({ role, text, at: now, draft: null, label: null });
  const record = (revision, turns = [turn('user', 'Fictional request'), turn('assistant', 'Fictional reply')], updatedAt = now, expiresAt = later) =>
   ({ id, title: 'Fictional request', turns, revision, createdAt: now, updatedAt, expiresAt, noticeVersion: 1, use: 'owner_review_only' });
  const change = async (owner, revision, value, key = id) => db.query('select public.do_personal_conversation_change($1,$2,$3,$4) as ok', [owner, key, revision, value]);
  const rejects = async (fn, code) => { try { await fn(); return false; } catch (error) { return String(error.message).includes(code); } };
  check('create stores revision 1', (await change(a, 0, record(1))).rows[0].ok === true);
  check('retry of the create is a conflict, not a duplicate', await rejects(() => change(a, 0, record(1)), 'conversation_conflict'));
  check('anonymous accounts cannot keep conversations', await rejects(() => change(anonymous, 0, record(1)), 'owner_required'));
  check('record shape is enforced in PostgreSQL', await rejects(() => change(a, 1, { ...record(2), extra: 'authority' }), 'violates check') && await rejects(() => change(a, 1, record(2, [turn('system', 'x'), turn('assistant', 'y')])), 'violates check'));
  check('future provenance is refused', await rejects(() => change(a, 1, record(2, undefined, new Date(Date.now() + 86400000).toISOString(), new Date(Date.now() + 31 * 86400000).toISOString())), 'conversation_future_provenance'));
  const extended = record(2, [turn('user', 'Fictional request'), turn('assistant', 'Fictional reply'), turn('user', 'Follow-up')]);
  check('extending the conversation advances the revision', (await change(a, 1, extended)).rows[0].ok === true);
  check('a stale device cannot shorten what another device extended', await rejects(() => change(a, 2, record(3)), 'conversation_conflict'));
  await change(b, 0, { ...record(1), title: 'Other owner' });
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [b]); await db.exec('set role authenticated');
  const visible = (await db.query('select owner_id,record from public.do_personal_conversations')).rows;
  check('owner RLS hides the other owner even with the same conversation ID', visible.length === 1 && visible[0].owner_id === b);
  check('clients cannot call the service-only RPC or write the table', await rejects(() => change(b, 1, record(2)), 'permission denied') && await rejects(() => db.query('update public.do_personal_conversations set record=null'), 'permission denied'));
  await db.exec('reset role; set role anon');
  check('guests cannot read kept conversations', await rejects(() => db.query('select * from public.do_personal_conversations'), 'permission denied'));
  await db.exec('reset role');
  await db.close(); db = new PGlite(directory);
  check('kept conversation survives a database reopen', (await db.query('select record from public.do_personal_conversations where owner_id=$1', [a])).rows[0].record.turns.length === 3);
  check('forgetting removes content and keeps a tombstone', (await change(a, 2, null)).rows[0].ok === true && (await db.query('select record,revision from public.do_personal_conversations where owner_id=$1', [a])).rows[0].record === null);
  check('a delayed save cannot resurrect a forgotten conversation', await rejects(() => change(a, 0, record(1)), 'conversation_conflict') && await rejects(() => change(a, 3, record(4)), 'conversation_conflict'));
  const past = new Date(Date.now() - 2 * 86400000).toISOString(), expired = new Date(Date.now() - 3600000).toISOString();
  await db.query("update public.do_personal_conversations set record=record || $2::jsonb,expires_at=($2::jsonb->>'expiresAt')::timestamptz where owner_id=$1", [b, { createdAt: past, updatedAt: past, expiresAt: expired }]);
  check('an expired conversation is tombstoned on touch and cannot be renewed', (await change(b, 1, record(2))).rows[0].ok === false && await rejects(() => change(b, 2, record(3)), 'conversation_conflict'));
  const uuid = require('node:crypto').randomUUID;
  const ids = Array.from({ length: 50 }, () => uuid());
  for (const key of ids) await change(b, 0, { ...record(1), id: key }, key);
  const extra = uuid();
  check('50 live conversations cap is enforced', await rejects(() => change(b, 0, { ...record(1), id: extra }, extra), 'conversation_limit'));
  await db.query("update public.do_personal_conversations set record=record || $2::jsonb,expires_at=($2::jsonb->>'expiresAt')::timestamptz where owner_id=$1 and record is not null", [b, { createdAt: past, updatedAt: past, expiresAt: expired }]);
  check('bounded purge removes exactly the requested batch', (await db.query('select public.do_personal_conversation_expire_batch(7) as n')).rows[0].n === 7);
  check('owner purge clears the rest', (await db.query('select public.do_personal_conversation_purge($1) as n', [b])).rows[0].n === 43);
  console.log(`${checks} local database checks passed`);
 } finally { await db.close(); fs.rmSync(directory, { recursive: true, force: true }); }
})().catch(error => { console.error(error); process.exitCode = 1; });
