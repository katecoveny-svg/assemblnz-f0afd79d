/* Disposable, network-disabled local PostgreSQL only. No hosted configuration read.
 * Run: node scripts/test-do-continuity-sql.cjs
 * Docker permission may be needed. Uses the already installed postgres:17-alpine.
 */
const { execFileSync, execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { readFileSync, mkdirSync, writeFileSync } = require('node:fs');
const { createHash } = require('node:crypto');
const path = require('node:path');
const exec = promisify(execFile);
const root = path.resolve(__dirname, '..');
const container = `assembl-portable-sql-${process.pid}`;
const docker = args => execFileSync('docker', args, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
const psqlArgs = ['exec', '-i', container, 'psql', '-h', '127.0.0.1', '-U', 'postgres', '-qAt', '-v', 'ON_ERROR_STOP=1'];
const sql = input => execFileSync('docker', psqlArgs, { input, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
const owner = '00000000-0000-4000-8000-000000000001';
const other = '00000000-0000-4000-8000-000000000002';
const id = '10000000-0000-4000-8000-000000000003';
const session = (query, who = owner) => `begin; set local role authenticated; set local request.jwt.claim.sub='${who}'; set local request.jwt.claims='{"is_anonymous":false}'; ${query}; commit;`;
const mutate = input => `select public.do_continuity_mutate('${JSON.stringify(input)}'::jsonb)`;
const assert = (value, message) => { if (!value) throw new Error(message); };
async function main() {
  let started = false;
  try {
    docker(['run', '--detach', '--rm', '--name', container, '--network', 'none', '--env', 'POSTGRES_HOST_AUTH_METHOD=trust', 'postgres:17-alpine']);
    started = true;
    let ready = false;
    for (let attempt = 0; attempt < 30; attempt++) {
      try { docker(['exec', container, 'pg_isready', '-h', '127.0.0.1', '-U', 'postgres']); ready = true; break; }
      catch { await new Promise(resolve => setTimeout(resolve, 100)); }
    }
    assert(ready, 'Local database did not start.');
    for (const file of ['isolated-bootstrap.sql', 'schema-proposal.sql', 'isolated-tests.sql'])
      sql(readFileSync(path.join(root, 'docs/do-continuity', file), 'utf8'));
    const save = { action: 'save', id, scope: 'personal', request: 'Prepare the fictional school pickup checklist.', context: [], consent: true, consentVersion: 'do-continuity-v1' };
    const first = JSON.parse(sql(session(mutate(save))));
    const replay = JSON.parse(sql(session(mutate(save))));
    assert(JSON.stringify(first) === JSON.stringify(replay), 'Lost-acknowledgement retry changed the task.');
    const reopened = JSON.parse(sql(session(`select public.do_continuity_read('personal','${id}')`)))[0];
    assert(reopened.id === id && reopened.request === save.request, 'Separate database session did not reopen the same task.');
    const preparation = { action: 'prepare', id, scope: 'personal', expectedRevision: 1 };
    // Two independent psql sessions race the same revision. Exactly one commits.
    const races = await Promise.allSettled([
      exec('docker', [...psqlArgs, '-c', session(`${mutate(preparation)}; select pg_sleep(0.2)`)], { encoding: 'utf8' }),
      exec('docker', [...psqlArgs, '-c', session(mutate(preparation))], { encoding: 'utf8' }),
    ]);
    assert(races.filter(r => r.status === 'fulfilled').length === 1, 'Concurrent preparation must commit once.');
    const rejected = races.find(r => r.status === 'rejected');
    assert(rejected?.reason.stderr.includes('continuity_conflict'), 'Concurrent loser must receive a revision conflict.');
    const edited = JSON.parse(sql(session(mutate({ action: 'edit', id, scope: 'personal', expectedRevision: 2, result: 'Reviewed fictional follow-up' }))));
    const desktop = JSON.parse(sql(session(`select public.do_continuity_read('personal','${id}')`)))[0];
    assert(desktop.result === edited.result && desktop.revision === 3, 'Fresh session lost edited result.');
    assert(sql(session(`select public.do_continuity_read('personal','${id}')`, other)) === '[]', 'Other owner saw a task.');
    const maximum = { ...save, id: '10000000-0000-4000-8000-000000000004', request: 'r'.repeat(4000),
      context: [1, 2, 3].map(n => ({ id: `20000000-0000-4000-8000-00000000000${n}`, label: 'l'.repeat(80), text: 't'.repeat(2000), source: 'user_selected' })) };
    sql(session(mutate(maximum), other));
    const maximumResult = JSON.parse(sql(session(mutate({ action: 'prepare', id: maximum.id, scope: 'personal', expectedRevision: 1 }), other)));
    assert(maximumResult.result.length > 10000 && maximumResult.result.length < 16000, 'Valid maximum input did not prepare within result bound.');
    const unicodeMaximum = { ...maximum, id: '10000000-0000-4000-8000-000000000005', request: '🟣'.repeat(2000),
      context: maximum.context.map(c => ({ ...c, label: '🟣'.repeat(40), text: '🟣'.repeat(1000) })) };
    sql(session(mutate(unicodeMaximum), other));
    const unicodeResult = JSON.parse(sql(session(mutate({ action: 'prepare', id: unicodeMaximum.id, scope: 'personal', expectedRevision: 1 }), other)));
    assert(unicodeResult.result.length > 10000 && unicodeResult.result.length < 16000, 'Maximum Unicode bundle failed.');
    const rejectRpc = (input, who, expected) => {
      try { sql(session(mutate(input), who)); throw new Error('RPC accepted out-of-contract input.'); }
      catch (error) { assert(String(error.stderr).includes(expected), `Expected ${expected} for RPC boundary.`); }
    };
    // Direct authenticated RPC calls must obey Zod/JS UTF-16 limits as well.
    const invalidUnicode = [
      { ...save, id: '70000000-0000-4000-8000-000000000001', request: '🟣'.repeat(2001) },
      { ...save, id: '70000000-0000-4000-8000-000000000002', context: [{ ...unicodeMaximum.context[0], label: '🟣'.repeat(41) }] },
      { ...save, id: '70000000-0000-4000-8000-000000000003', context: [{ ...unicodeMaximum.context[0], text: '🟣'.repeat(1001) }] },
    ];
    invalidUnicode.forEach(input => rejectRpc(input, other, 'continuity_conflict'));
    rejectRpc({ action: 'edit', id: unicodeMaximum.id, scope: 'personal', expectedRevision: 2, result: '🟣'.repeat(8001) }, other, 'continuity_conflict');
    sql(session(mutate({ action: 'edit', id: unicodeMaximum.id, scope: 'personal', expectedRevision: 2, result: '🟣'.repeat(8000) }), other));
    assert(JSON.parse(sql(session(`select public.do_continuity_read('personal','${unicodeMaximum.id}')`, other)))[0].result.length === 16000, 'Exact Unicode result boundary failed.');

    const quotaOwner = '00000000-0000-4000-8000-000000000003';
    const byteOwner = '00000000-0000-4000-8000-000000000004';
    const sentinelOwner = '00000000-0000-4000-8000-000000000005';
    const lockOwner = '00000000-0000-4000-8000-000000000006';
    sql(`insert into auth.users values ('${quotaOwner}'),('${byteOwner}'),('${sentinelOwner}'),('${lockOwner}');`);
    sql(`insert into do_continuity_private.owner_access(owner_id,scope,enabled,expires_at)
      select id,s,true,clock_timestamp()+interval '1 day' from auth.users cross join (values ('personal'),('work')) scopes(s)
      where id in ('${quotaOwner}','${byteOwner}','${sentinelOwner}','${lockOwner}');`);
    sql(session(`do $$ declare p jsonb; begin
      for n in 1..39 loop
        p := jsonb_build_object('action','save','id','30000000-0000-4000-8000-'||lpad(n::text,12,'0'),'scope',case when n%2=0 then 'work' else 'personal' end,
          'request','Fictional count quota test','context','[]'::jsonb,'consent',true,'consentVersion','do-continuity-v1');
        perform public.do_continuity_mutate(p);
      end loop;
    end $$`, quotaOwner));
    const countRaces = await Promise.allSettled([40, 41].map(n => exec('docker', [...psqlArgs, '-c', session(mutate({ ...save, id: `30000000-0000-4000-8000-${String(n).padStart(12, '0')}` }), quotaOwner)], { encoding: 'utf8' })));
    assert(countRaces.filter(r => r.status === 'fulfilled').length === 1 && countRaces.some(r => r.status === 'rejected' && r.reason.stderr.includes('continuity_quota_exhausted')), 'Concurrent saves bypassed owner count quota.');
    sql(session(`do $$ declare blocked boolean:=false; task_id text; t jsonb; begin
      for n in 1..14 loop
        task_id := '40000000-0000-4000-8000-'||lpad(n::text,12,'0');
        perform public.do_continuity_mutate(jsonb_build_object('action','save','id',task_id,'scope','personal','request',repeat('r',4000),'context','[]'::jsonb,'consent',true,'consentVersion','do-continuity-v1'));
      end loop;
      for n in 1..14 loop
        task_id := '40000000-0000-4000-8000-'||lpad(n::text,12,'0');
        begin
          perform public.do_continuity_mutate(jsonb_build_object('action','prepare','id',task_id,'scope','personal','expectedRevision',1));
          perform public.do_continuity_mutate(jsonb_build_object('action','edit','id',task_id,'scope','personal','expectedRevision',2,'result',repeat('e',16000)));
        exception when others then if sqlerrm <> 'continuity_quota_exhausted' then raise; end if; blocked:=true; exit; end;
      end loop;
      if not blocked then raise exception 'output growth bypassed owner byte quota'; end if;
    end $$`, byteOwner));
    assert(Number(sql(`select sum(octet_length(request)+octet_length(context::text)+coalesce(octet_length(result),0)) from do_continuity_private.tasks where owner_id='${byteOwner}';`)) <= 262144, 'Owner byte quota exceeded.');
    sql(`insert into do_continuity_private.tasks(owner_id,id,scope,request,context,save_fingerprint,status,consent_version,consent_until,expires_at)
      select '${sentinelOwner}',md5(n::text)::uuid,'personal','','[]','expired','expired','do-continuity-v1','1900-01-01','1900-01-01' from generate_series(1,2048) n;`);
    try { sql(session(mutate({ ...save, id: '50000000-0000-4000-8000-000000000001' }), sentinelOwner)); throw new Error('Lifetime ID quota bypassed.'); }
    catch (error) { assert(String(error.stderr).includes('continuity_quota_exhausted'), 'Lifetime quota failed with wrong error.'); }

    const lockId = '60000000-0000-4000-8000-000000000001';
    sql(session(mutate({ ...save, id: lockId }), lockOwner));
    for (const lockKind of ['owner', 'row']) {
      sql(`update do_continuity_private.tasks set consent_until=clock_timestamp()+interval '1 second' where owner_id='${lockOwner}' and id='${lockId}';`);
      const lockStatement = lockKind === 'owner'
        ? `select pg_advisory_xact_lock(hashtextextended('${lockOwner}',0))`
        : `select 1 from do_continuity_private.tasks where owner_id='${lockOwner}' and id='${lockId}' for update`;
      const blocker = exec('docker', [...psqlArgs, '-c', `begin; set local application_name='portable-expiry-lock'; ${lockStatement}; select pg_sleep(1.4); commit;`], { encoding: 'utf8' });
      let locked = false;
      for (let attempt = 0; attempt < 30; attempt++) {
        if (sql("select count(*) from pg_stat_activity where application_name='portable-expiry-lock' and wait_event='PgSleep';") === '1') { locked = true; break; }
        await new Promise(resolve => setTimeout(resolve, 20));
      }
      assert(locked, 'Could not establish isolated lock wait.');
      const beforeExpiry = sql(`select consent_until>clock_timestamp() from do_continuity_private.tasks where owner_id='${lockOwner}' and id='${lockId}';`);
      assert(beforeExpiry === 't', 'Timing harness started after expiry.');
      try { await exec('docker', [...psqlArgs, '-c', session(mutate({ action: 'prepare', id: lockId, scope: 'personal', expectedRevision: 1 }), lockOwner)], { encoding: 'utf8' }); throw new Error('Stale transaction time allowed expired preparation.'); }
      catch (error) { assert(String(error.stderr).includes('continuity_permission_expired'), `${lockKind} lock expiry failed with wrong error.`); }
      await blocker;
      assert(sql(`select revision from do_continuity_private.tasks where owner_id='${lockOwner}' and id='${lockId}';`) === '1', 'Expired preparation committed work.');
    }
    // Access is scope-specific and DB-managed. An RPC execute grant alone is
    // insufficient, and expiry during a lock wait must not admit new work.
    sql(`update do_continuity_private.owner_access set enabled=false where owner_id='${other}' and scope='work';`);
    rejectRpc({ ...save, id: '80000000-0000-4000-8000-000000000001', scope: 'work' }, other, 'continuity_storage_unavailable');
    sql(`update do_continuity_private.owner_access set expires_at=clock_timestamp()-interval '1 second' where owner_id='${other}' and scope='personal';`);
    rejectRpc({ action: 'prepare', id: maximum.id, scope: 'personal', expectedRevision: 2 }, other, 'continuity_storage_unavailable');
    sql(`update do_continuity_private.owner_access set expires_at=clock_timestamp()+interval '1 second' where owner_id='${lockOwner}' and scope='personal';`);
    const accessBlocker = exec('docker', [...psqlArgs, '-c', `begin; set local application_name='portable-access-lock'; select pg_advisory_xact_lock(hashtextextended('${lockOwner}',0)); select pg_sleep(1.4); commit;`], { encoding: 'utf8' });
    let accessLocked = false;
    for (let attempt = 0; attempt < 30; attempt++) {
      if (sql("select count(*) from pg_stat_activity where application_name='portable-access-lock' and wait_event='PgSleep';") === '1') { accessLocked = true; break; }
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    assert(accessLocked, 'Could not establish access-gate lock wait.');
    try { await exec('docker', [...psqlArgs, '-c', session(mutate({ ...save, id: '80000000-0000-4000-8000-000000000002' }), lockOwner)], { encoding: 'utf8' }); throw new Error('Expired owner access admitted a save.'); }
    catch (error) { assert(String(error.stderr).includes('continuity_storage_unavailable'), 'Owner enablement expiry returned wrong error.'); }
    await accessBlocker;
    // An exact same-ID retry takes a row lock too. Recheck owner access after
    // waiting, before returning any retained request or selected context.
    sql(`update do_continuity_private.owner_access set expires_at=clock_timestamp()+interval '1 second' where owner_id='${lockOwner}' and scope='personal';`);
    const retryBlocker = exec('docker', [...psqlArgs, '-c', `begin; set local application_name='portable-retry-access-lock'; select 1 from do_continuity_private.tasks where owner_id='${lockOwner}' and id='${lockId}' for update; select pg_sleep(1.4); commit;`], { encoding: 'utf8' });
    let retryLocked = false;
    for (let attempt = 0; attempt < 30; attempt++) {
      if (sql("select count(*) from pg_stat_activity where application_name='portable-retry-access-lock' and wait_event='PgSleep';") === '1') { retryLocked = true; break; }
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    assert(retryLocked, 'Could not establish retry access-gate row lock.');
    assert(sql(`select expires_at>clock_timestamp() from do_continuity_private.owner_access where owner_id='${lockOwner}' and scope='personal';`) === 't', 'Retry harness started after owner access expiry.');
    try { await exec('docker', [...psqlArgs, '-c', session(mutate({ ...save, id: lockId }), lockOwner)], { encoding: 'utf8' }); throw new Error('Expired owner access disclosed a same-ID retry.'); }
    catch (error) { assert(String(error.stderr).includes('continuity_storage_unavailable'), 'Retry owner enablement expiry returned wrong error.'); }
    await retryBlocker;
    assert(sql(`select revision from do_continuity_private.tasks where owner_id='${lockOwner}' and id='${lockId}';`) === '1', 'Denied retry changed the retained task.');
    sql("update do_continuity_private.tasks set expires_at=now()-interval '1 second'; select do_continuity_private.prune();");
    const retainedBodies = sql("select count(*) from do_continuity_private.tasks where request<>'' or context<>'[]'::jsonb or result is not null or save_fingerprint<>'expired';");
    assert(retainedBodies === '0', 'Retention maintenance left content behind.');
    sql("update do_continuity_private.tasks set expires_at=clock_timestamp()-interval '100 days'; select do_continuity_private.prune();");
    try { sql(session(mutate(save))); throw new Error('Day-100 replay created fresh consent.'); }
    catch (error) { assert(String(error.stderr).includes('continuity_id_reused'), 'Late replay was not rejected.'); }
    assert(sql(`select count(*) from do_continuity_private.tasks where owner_id='${owner}' and id='${id}';`) === '1', 'Late retry duplicated or removed stable ID.');
    const result = { checkedAt: new Date().toISOString(), schemaSha256: createHash('sha256').update(readFileSync(path.join(root, 'docs/do-continuity/schema-proposal.sql'))).digest('hex'),
      storage: 'isolated PostgreSQL 17', authentication: 'fictional Supabase Auth stubs', realCrossDeviceProven: false,
      checks: ['inherited Supabase-style ACL revocation including service_role', 'owner isolation', 'scope isolation', 'same-ID save retry', 'separate-session reopen', 'concurrent preparation CAS', 'editable-result reopen', 'maximum ASCII/Unicode input', 'Unicode direct-RPC UTF16 boundaries', 'atomic owner count quota', 'owner byte quota on output growth', 'bounded lifetime ID quota', 'owner-lock wallclock expiry', 'row-lock wallclock expiry', 'numeric context-ID rejection', 'revocation', 'direct table denial', 'retention purge', 'day-100 replay denied', 'zero proposal-enabled owners', 'RPC execute does not enrol an owner', 'owner/scoped/expiring DB enablement including lock wait', 'same-ID retry owner access expiry during row-lock wait'], passed: true };
    const folder = path.join(root, 'output/playwright'); mkdirSync(folder, { recursive: true });
    writeFileSync(path.join(folder, 'portable-sql-results.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
  } finally { if (started) docker(['rm', '--force', container]); }
}
main().catch(error => { console.error(error.message, error.stderr || ''); process.exitCode = 1; });
