// Local database proof for the installed continuity migration, on embedded PostgreSQL.
// Single-session port of docs/do-continuity/isolated-tests.sql plus the approval-stage
// grants and owner self-enrolment. The Docker harness (test-do-continuity-sql.cjs) still
// covers separate-session lock and race checks. Never touches a hosted database.
// npm install --prefix /tmp/assembl-personal-sql @electric-sql/pglite@0.3.14
const { PGlite } = require(process.env.ASSEMBL_PGLITE_MODULE || '/tmp/assembl-personal-sql/node_modules/@electric-sql/pglite');
const fs = require('node:fs'); const os = require('node:os'); const path = require('node:path'); const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const owner = '00000000-0000-4000-8000-000000000001', other = '00000000-0000-4000-8000-000000000002';
const id = '10000000-0000-4000-8000-000000000001';
const save = { action: 'save', id, scope: 'personal', request: 'Prepare the fictional picnic follow-up.',
  context: [{ id: '20000000-0000-4000-8000-000000000001', label: 'Selected note', text: 'Pickup is unconfirmed.', source: 'user_selected' }], consent: true, consentVersion: 'do-continuity-v1' };
(async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'do-continuity-proof-'));
  const db = new PGlite(directory); let checks = 0;
  const check = (name, ok) => { assert.ok(ok, name); checks++; console.log('PASS ' + name); };
  const as = async (who, anonymous = false) => {
    await db.exec('reset role');
    if (who === null) return;
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [who]);
    await db.query("select set_config('request.jwt.claims',$1,false)", [JSON.stringify({ is_anonymous: anonymous })]);
    await db.exec('set role authenticated');
  };
  const read = async (scope, taskId = null) => (await db.query('select public.do_continuity_read($1,$2) as r', [scope, taskId])).rows[0].r;
  const mutate = async input => (await db.query('select public.do_continuity_mutate($1) as r', [input])).rows[0].r;
  const access = async (scope, enable = null) => (await db.query('select public.do_continuity_access($1,$2) as r', [scope, enable])).rows[0].r;
  const fails = async (fn, code) => { try { await fn(); return false; } catch (error) { return String(error.message).includes(code); } };
  try {
    await db.exec(fs.readFileSync(path.join(root, 'docs/do-continuity/isolated-bootstrap.sql'), 'utf8'));
    await db.exec(fs.readFileSync(path.join(root, 'supabase/migrations/20261013091000_do_continuity.sql'), 'utf8'));

    const priv = async (q) => (await db.query(q)).rows[0].ok;
    check('private schema and tables stay closed to every client role', await priv(`select not (has_schema_privilege('service_role','do_continuity_private','usage') or has_table_privilege('authenticated','do_continuity_private.tasks','select') or has_table_privilege('service_role','do_continuity_private.tasks','select') or has_table_privilege('authenticated','do_continuity_private.owner_access','insert') or has_table_privilege('service_role','do_continuity_private.owner_access','select')) as ok`));
    check('service role cannot execute the owner RPCs', await priv(`select not (has_function_privilege('service_role','public.do_continuity_read(text,uuid)','execute') or has_function_privilege('service_role','public.do_continuity_mutate(jsonb)','execute') or has_function_privilege('service_role','public.do_continuity_access(text,boolean)','execute') or has_function_privilege('anon','public.do_continuity_read(text,uuid)','execute')) as ok`));
    check('authenticated owners can execute read, mutate and access', await priv(`select has_function_privilege('authenticated','public.do_continuity_read(text,uuid)','execute') and has_function_privilege('authenticated','public.do_continuity_mutate(jsonb)','execute') and has_function_privilege('authenticated','public.do_continuity_access(text,boolean)','execute') as ok`));
    check('migration enrols nobody', (await db.query('select count(*)::int as n from do_continuity_private.owner_access')).rows[0].n === 0);

    await as(owner);
    check('before enrolment the owner is told storage is unavailable, not shown an empty list', await fails(() => read('personal'), 'continuity_storage_unavailable') && await fails(() => mutate(save), 'continuity_storage_unavailable'));
    check('access state reads as off before enrolment', (await access('personal')).enabled === false);
    await as(owner, true);
    check('anonymous sessions cannot enrol or read', await fails(() => access('personal', true), 'continuity_not_found') && await fails(() => read('personal'), 'continuity_not_found'));
    await as(owner);
    const enrolled = await access('personal', true);
    const expiresIn = (Date.parse(enrolled.expiresAt) - Date.now()) / 86400000;
    check('owner self-enrolment records consent for about 90 days', enrolled.enabled === true && expiresIn > 89.9 && expiresIn < 90.1);
    check('enrolment is scope-specific', (await access('work')).enabled === false && await fails(() => mutate({ ...save, scope: 'work' }), 'continuity_storage_unavailable'));
    check('owner cannot write owner_access directly', await fails(() => db.query("update do_continuity_private.owner_access set expires_at=now()+interval '10 years'"), 'permission denied'));

    const first = await mutate(save), replay = await mutate(save);
    check('same-ID save retry replays the original', JSON.stringify(first) === JSON.stringify(replay) && first.status === 'waiting' && (await read('personal')).length === 1);
    check('changed request with same ID is refused', await fails(() => mutate({ ...save, request: 'Changed request must not overwrite original' }), 'continuity_id_reused'));
    check('client owner field is ignored by the strict contract', await fails(() => mutate({ ...save, ownerId: other }), 'continuity_conflict'));
    check('numeric context IDs are refused', await fails(() => mutate({ ...save, id: '10000000-0000-4000-8000-000000000008', context: [{ id: 123, label: 'note', text: 'test', source: 'user_selected' }] }), 'continuity_conflict'));
    const prepared = await mutate({ action: 'prepare', id, scope: 'personal', expectedRevision: 1 });
    check('prepare yields an inert worksheet at revision 2', prepared.status === 'needs_review' && prepared.revision === 2 && /no model called/.test(prepared.result));
    check('prepare replay returns the same worksheet', JSON.stringify(await mutate({ action: 'prepare', id, scope: 'personal', expectedRevision: 2 })) === JSON.stringify(prepared));
    check('stale edit is a conflict', await fails(() => mutate({ action: 'edit', id, scope: 'personal', expectedRevision: 1, result: 'stale' }), 'continuity_conflict'));
    const edited = await mutate({ action: 'edit', id, scope: 'personal', expectedRevision: 2, result: 'Reviewed fictional follow-up' });
    check('edit persists and reopens at revision 3', edited.revision === 3 && (await read('personal', id))[0].result === 'Reviewed fictional follow-up');
    check('a scope without sync reports unavailable rather than an empty list', await fails(() => read('work', id), 'continuity_storage_unavailable'));
    await access('work', true);
    check('other scope never sees the task', (await read('work', id)).length === 0 && await fails(() => mutate({ action: 'revoke', id, scope: 'work', expectedRevision: 3 }), 'continuity_not_found'));

    await as(other); await access('personal', true);
    check('other owner sees nothing and cannot mutate', (await read('personal', id)).length === 0 && await fails(() => mutate({ action: 'cancel', id, scope: 'personal', expectedRevision: 3 }), 'continuity_not_found'));
    for (let n = 1; n <= 40; n++) await mutate({ ...save, id: `30000000-0000-4000-8000-${String(n).padStart(12, '0')}`, scope: 'personal' });
    check('owner live-task quota stops the 41st save', await fails(() => mutate({ ...save, id: '30000000-0000-4000-8000-000000000041' }), 'continuity_quota_exhausted'));

    await as(owner);
    check('turning sync off closes reads and writes at once', (await access('personal', false)).enabled === false && await fails(() => read('personal'), 'continuity_storage_unavailable'));
    check('turning sync back on finds the retained task', (await access('personal', true)).enabled === true && (await read('personal', id))[0].revision === 3);

    await as(null); await db.query("update do_continuity_private.tasks set consent_until=now()-interval '1 second' where owner_id=$1", [owner]); await as(owner);
    const expired = (await read('personal', id))[0];
    check('expired permission withholds context and result', expired.status === 'expired' && expired.context.length === 0 && expired.result === null);
    check('expired task cannot be prepared', await fails(() => mutate({ action: 'prepare', id, scope: 'personal', expectedRevision: 3 }), 'continuity_permission_expired'));
    const revoked = await mutate({ action: 'revoke', id, scope: 'personal', expectedRevision: 3 });
    check('revocation clears context and result', revoked.status === 'revoked' && revoked.context.length === 0 && revoked.result === null);
    check('stopped task cannot be prepared', await fails(() => mutate({ action: 'prepare', id, scope: 'personal', expectedRevision: 4 }), 'continuity_stopped'));
    check('direct table reads are denied to the owner', await fails(() => db.query('select * from do_continuity_private.tasks'), 'permission denied'));

    await as(null); await db.query("update do_continuity_private.tasks set expires_at=now()-interval '1 second' where owner_id=$1", [owner]); await db.exec('select do_continuity_private.prune()');
    check('retention prune leaves no content behind', (await db.query("select count(*)::int as n from do_continuity_private.tasks where owner_id=$1 and (request<>'' or context<>'[]'::jsonb or result is not null or save_fingerprint<>'expired')", [owner])).rows[0].n === 0);
    await as(owner);
    check('late replay after retention cannot create fresh consent', await fails(() => mutate(save), 'continuity_id_reused') && (await read('personal', id))[0].request === '');
    console.log(`${checks} local database checks passed`);
  } finally { await db.close(); fs.rmSync(directory, { recursive: true, force: true }); }
})().catch(error => { console.error(error); process.exitCode = 1; });
