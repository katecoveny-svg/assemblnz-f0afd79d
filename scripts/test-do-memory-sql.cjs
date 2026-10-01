// Local database proof only. npm install --prefix /tmp/assembl-personal-sql @electric-sql/pglite@0.3.14
const { PGlite } = require(process.env.ASSEMBL_PGLITE_MODULE || '/tmp/assembl-personal-sql/node_modules/@electric-sql/pglite');
const fs = require('node:fs'); const os = require('node:os'); const path = require('node:path'); const assert = require('node:assert/strict');
(async () => {
 class PostgresProof {
  constructor() { const { Client } = require('/tmp/assembl-personal-sql/node_modules/pg'); this.client = new Client({ connectionString: 'postgresql://postgres:fictional-test-only@127.0.0.1:55437/do_proof' }); this.ready = this.client.connect(); }
  async query(sql, params) { await this.ready; return this.client.query(sql, params); }
  async exec(sql) { return this.query(sql); }
  async close() { await this.ready; return this.client.end(); }
 }
 const Database = process.env.DO_PROOF_POSTGRES === 'true' ? PostgresProof : PGlite;
 const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'do-memory-proof-'));
 let db = new Database(directory); let checks = 0;
 const check = (name, ok) => { assert.ok(ok, name); checks++; console.log('PASS ' + name); };
 try {
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key,is_anonymous boolean default false); create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$; create function auth.jwt() returns jsonb language sql as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$; grant usage on schema public to anon,authenticated,service_role; grant usage on schema auth to authenticated,service_role; grant select on auth.users to service_role;`);
  await db.exec(fs.readFileSync('docs/do-personal/schema-review.sql', 'utf8'));
  await db.exec(fs.readFileSync('supabase/migrations/20260929213918_do_personal_responsibilities.sql', 'utf8'));
  const a = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', b = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', anonymous = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', id = '11111111-1111-4111-8111-111111111111';
  await db.query('insert into auth.users values ($1,false),($2,false),($3,true)', [a,b,anonymous]);
  const now = new Date().toISOString();
  const record = { id, subject: 'self', kind: 'routine', text: 'Fictional project review.', source: 'owner_entered', observedAt: now, retentionDays: 7, active: true, revision: 1, consentedAt: now, reviewedAt: now, updatedAt: now, expiresAt: new Date(Date.parse(now)+7*86400000).toISOString(), noticeVersion: 1, use: 'owner_review_only' };
  const change = async (owner, revision, value) => db.query('select public.do_personal_memory_change($1,$2,$3,$4)', [owner,id,revision,value]);
  for (const key of Object.keys(record)) await assert.rejects(() => change(a,0,{...record,[key]:null}));
  check('every required JSON value rejects null',true);
  for (const malformed of [{...record,active:'true'}, {...record,text:12}, {...record,extra:'permission'}, {...record,expiresAt:'not-a-date'}, {...record,revision:1.5}, {...record,retentionDays:'7'}]) await assert.rejects(() => change(a,0,malformed));
  check('malformed types, extra fields and dates fail in PostgreSQL',true);
  await assert.rejects(() => change(a,0,null)); check('absent delete cannot report success',true);
  await change(a,0,record);
  await assert.rejects(() => change(a,0,record)); check('retry cannot duplicate or overwrite creation',true);
  await assert.rejects(() => change(anonymous,0,record)); check('anonymous account cannot create context',true);
  await change(b,0,{...record,text:'Other fictional context.'});
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[b]); await db.exec('set role authenticated');
  const visible = (await db.query('select owner_id,record from public.do_personal_memory')).rows;
  check('owner RLS hides other owner even with identical record ID',visible.length===1 && visible[0].owner_id===b);
  await assert.rejects(() => change(b,1,{...record,revision:2})); check('client cannot invoke service-only CAS',true);
  await assert.rejects(() => db.query('update public.do_personal_memory set record=null')); check('client cannot bypass CAS writes',true);
  await db.exec('reset role; set role anon'); await assert.rejects(() => db.query('select * from public.do_personal_memory')); check('guest cannot read memory storage',true); await db.exec('reset role');
  const task = (await db.query("select public.do_personal_save($1,null,'Day','Prepare a fictional checklist','Fictional task','Pacific/Auckland',7) as id",[a])).rows[0].id;
  const claim = async () => (await db.query('select * from public.do_personal_claim($1,$2)',[a,task])).rows;
  const run = (await claim())[0].run_id;
  await db.close(); db = new Database(directory);
  check('memory and claimed job survive actual database reopen',(await db.query('select record from public.do_personal_memory where owner_id=$1',[a])).rows[0].record.text===record.text && (await db.query('select status from public.do_personal_runs where id=$1',[run])).rows[0].status==='running');
  check('retry after reopen does not claim twice',(await claim()).length===0);
  await db.query("update public.do_personal_runs set started_at=now()-interval '11 minutes' where id=$1",[run]); await claim();
  check('interrupted worker marks old run failed',(await db.query('select status,evidence from public.do_personal_runs where id=$1',[run])).rows[0].evidence.error==='worker_interrupted');
  await db.query("update public.do_personal_runs set started_at=now()-interval '2 hours' where id=$1",[run]);
  const next = (await claim())[0].run_id;
  await db.query('select public.do_personal_pause($1,$2)',[a,task]);
  check('pause rejects in-flight finish',(await db.query("select public.do_personal_finish($1,'Fictional draft','{}',false) as ok",[next])).rows[0].ok===false);
  await change(a,1,null);
  check('delete removes content but preserves retry protection',(await db.query('select record,revision from public.do_personal_memory where owner_id=$1',[a])).rows[0].record===null);
  await assert.rejects(() => change(a,0,record)); await assert.rejects(() => change(a,2,{...record,revision:3})); check('delayed create and edit cannot resurrect deletion',true);
  check('deletion cannot remove another owner context',(await db.query('select record from public.do_personal_memory where owner_id=$1',[b])).rows[0].record.text==='Other fictional context.');
  await db.query("update public.do_personal_memory set record=record || $2::jsonb,expires_at=($2::jsonb->>'expiresAt')::timestamptz where owner_id=$1", [b, { consentedAt: new Date(Date.now()-86400000).toISOString(), observedAt: new Date(Date.now()-86400000).toISOString(), reviewedAt: new Date(Date.now()-86400000).toISOString(), updatedAt: new Date(Date.now()-86400000).toISOString(), expiresAt: new Date(Date.now()-3600000).toISOString(), retentionDays: 90 }]);
  const expiredChange = await change(b,1,{...record,revision:2});
  check('expiry before purge commits tombstone and rejects renewal',expiredChange.rows[0].do_personal_memory_change===false);
  await assert.rejects(() => change(b,2,{...record,revision:3})); check('expiry ABA cannot restore context',true);
  await db.query('select public.do_personal_memory_purge($1)',[b]);
  check('expiry erases content with revision tombstone',(await db.query('select record,revision from public.do_personal_memory where owner_id=$1',[b])).rows[0].revision===2);
  await db.query('delete from public.do_personal_responsibilities where id=$1 and owner_id=$2',[task,a]);
  check('job deletion cascades receipts',(await db.query('select * from public.do_personal_runs where responsibility_id=$1',[task])).rows.length===0);
  const uuid = require('node:crypto').randomUUID;
  const ids = Array.from({length:30},()=>uuid());
  const put = (key, rev, value) => db.query('select public.do_personal_memory_change($1,$2,$3,$4)',[b,key,rev,value]);
  await Promise.all(ids.map(key=>put(key,0,{...record,id:key})));
  await assert.rejects(()=>put(uuid(),0,{...record,id:uuid()}));
  const extra = uuid(); await assert.rejects(()=>put(extra,0,{...record,id:extra})); check('30 live records cap is enforced',true);
  const results = await Promise.allSettled([put(ids[0],1,{...record,id:ids[0],revision:2,text:'First edit'}),put(ids[0],1,{...record,id:ids[0],revision:2,text:'Second edit'})]);
  check('competing CAS edits allow exactly one winner',results.filter(result=>result.status==='fulfilled').length===1);
  const past = new Date(Date.now()-86400000).toISOString(), expiry = new Date(Date.now()-3600000).toISOString();
  await db.query("update public.do_personal_memory set record=record || $2::jsonb,expires_at=($2::jsonb->>'expiresAt')::timestamptz where owner_id=$1 and record is not null",[b,{observedAt:past,consentedAt:past,reviewedAt:past,updatedAt:past,expiresAt:expiry}]);
  check('bounded purge removes exactly requested batch',(await db.query('select public.do_personal_memory_expire_batch(7) as count')).rows[0].count===7);
  await assert.rejects(()=>db.query('select public.do_personal_memory_expire_batch(101)')); check('unbounded purge requests rejected',true);
  const target = (await db.query('select id,revision from public.do_personal_memory where owner_id=$1 and record is not null limit 1',[b])).rows[0];
  await Promise.allSettled([db.query('select public.do_personal_memory_purge($1)',[b]),put(target.id,target.revision,{...record,id:target.id,revision:target.revision+1})]);
  check('purge/edit race cannot restore expired content',(await db.query('select record from public.do_personal_memory where owner_id=$1 and id=$2',[b,target.id])).rows[0].record===null);
  if (process.env.DO_PROOF_POSTGRES === 'true') {
   // Separate PostgreSQL sessions exercise advisory/row locking, not just queued client requests.
   const second = new PostgresProof(), fresh = uuid();
   try {
    const race = await Promise.allSettled([put(fresh,0,{...record,id:fresh}),second.query('select public.do_personal_memory_change($1,$2,$3,$4)',[b,fresh,0,{...record,id:fresh}])]);
    check('separate-session insert race permits one creation',race.filter(result=>result.status==='fulfilled').length===1);
    const concurrent = await Promise.allSettled([put(fresh,1,{...record,id:fresh,revision:2}),second.query('select public.do_personal_memory_change($1,$2,$3,$4)',[b,fresh,1,{...record,id:fresh,revision:2}])]);
    check('separate-session CAS race permits one edit',concurrent.filter(result=>result.status==='fulfilled').length===1);
    const fill = Array.from({length:28},()=>uuid());
    await Promise.all(fill.map(key=>put(key,0,{...record,id:key})));
    const capA=uuid(),capB=uuid();
    const capRace=await Promise.allSettled([put(capA,0,{...record,id:capA}),second.query('select public.do_personal_memory_change($1,$2,$3,$4)',[b,capB,0,{...record,id:capB}])]);
    check('separate-session inserts cannot exceed 30 live records',capRace.filter(result=>result.status==='fulfilled').length===1);
    await db.query("update public.do_personal_memory set record=record || $3::jsonb,expires_at=($3::jsonb->>'expiresAt')::timestamptz where owner_id=$1 and id=$2",[b,fresh,{observedAt:past,consentedAt:past,reviewedAt:past,updatedAt:past,expiresAt:expiry}]);
    await Promise.allSettled([db.query('select public.do_personal_memory_expire_batch(100)'),second.query('select public.do_personal_memory_change($1,$2,$3,$4)',[b,fresh,2,{...record,id:fresh,revision:3}])]);
    check('separate-session expiry/purge race leaves only tombstone',(await db.query('select record from public.do_personal_memory where owner_id=$1 and id=$2',[b,fresh])).rows[0].record===null);
   } finally { await second.close(); }
  }
  console.log(`${checks} local database checks passed`);
 } finally { await db.close(); fs.rmSync(directory,{ recursive:true,force:true }); }
})().catch(error => { console.error(error); process.exitCode=1; });
