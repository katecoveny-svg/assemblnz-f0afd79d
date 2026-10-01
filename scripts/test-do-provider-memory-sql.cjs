// Disposable local proof only; never reads application credentials.
const { PGlite } = require(process.env.ASSEMBL_PGLITE_MODULE || '/tmp/assembl-personal-sql/node_modules/@electric-sql/pglite');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
class PostgresProof {
 constructor(){ const {Client}=require('/tmp/assembl-personal-sql/node_modules/pg'); this.client=new Client({connectionString:'postgresql://postgres:fictional-test-only@127.0.0.1:55437/do_proof'});this.ready=this.client.connect(); }
 async query(sql,params){await this.ready;return this.client.query(sql,params);}
 async exec(sql){return this.query(sql);}
 async close(){await this.ready;await this.client.end();}
}
(async()=>{
 const real=process.env.DO_PROOF_POSTGRES==='true',Database=real?PostgresProof:PGlite;
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'do-provider-proof-'));let db=new Database(dir),checks=0;
 const check=(label,ok=true)=>{assert.ok(ok,label);checks++;console.log('PASS '+label);};
 const a='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',b='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',guest='cccccccc-cccc-4ccc-8ccc-cccccccccccc',id='11111111-1111-4111-8111-111111111111',cid='22222222-2222-4222-8222-222222222222';
 try {
  await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key,is_anonymous boolean default false);create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;create function auth.jwt() returns jsonb language sql as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;grant usage on schema public to anon,authenticated,service_role;grant usage on schema auth to authenticated,service_role;grant select on auth.users to service_role;`);
  await db.exec(fs.readFileSync('supabase/migrations/20260929213918_do_personal_responsibilities.sql','utf8'));
  await db.exec(fs.readFileSync('docs/do-personal/provider-memory-schema.sql','utf8'));
  await db.query('insert into auth.users values($1,false),($2,false),($3,true)',[a,b,guest]);
  const now=new Date().toISOString(),expires=new Date(Date.now()+6*86400000).toISOString();
  const context=(owner,expected=0,body='Fictional sample goal.',target=id)=>db.query('select do_provider_context_change($1,$2,$3,$4,$5,$6,$7) as ok',[owner,target,expected,'goal',body,now,7]);
  const consent=(owner,expected=0,scope={kind:'assistant'},target=cid,selected=[{recordId:id,revision:1}],expiry=expires)=>db.query('select do_provider_consent_change($1,$2,$3,$4,$5,$6) as ok',[owner,target,expected,scope,JSON.stringify(selected),expiry]);
  const snapshot=(owner,scope={kind:'assistant'},target=cid)=>db.query('select do_provider_context_snapshot($1,$2,$3) as data',[owner,target,scope]);
  await assert.rejects(()=>context(guest));check('anonymous owner cannot persist provider context');
  await context(a);await context(b);await consent(a);check('separate explicit context and consent persist');
  await db.exec('set role service_role');check('service role can retrieve owner-bound snapshot',(await snapshot(a)).rows[0].data.records.length===1);await db.exec('reset role');
  check('owner review exposes only owned live context',(await db.query('select do_provider_context_review($1) as data',[a])).rows[0].data.contexts.length===1);
  await assert.rejects(()=>context(a));check('stale retry cannot overwrite context');
  await assert.rejects(()=>consent(a,1,{kind:'assistant',extra:'permission'}));check('scope expansion rejected');
  await assert.rejects(()=>consent(a,1,{kind:'assistant'},cid,[{recordId:id,revision:1},{recordId:id,revision:1}]));check('duplicate selected records rejected');
  await assert.rejects(()=>consent(a,1,{kind:'assistant'},cid,[{recordId:id,revision:2}]));check('record revision bound at consent');
  await assert.rejects(()=>consent(a,1,{kind:'assistant'},cid,[{recordId:id,revision:1}],new Date(Date.now()+8*86400000).toISOString()));check('consent duration cannot exceed seven days');
  await assert.rejects(()=>db.query("select do_provider_context_change($1,$2,0,'goal','Fictional goal','-infinity',7)",[a,'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee']));
  await assert.rejects(()=>consent(a,1,{kind:'assistant'},cid,[{recordId:id,revision:1}],'infinity'));check('non-finite observation and consent expiry rejected');
  const unicodeIds=Array.from({length:6},(_,index)=>`eeeeeeee-eeee-4eee-8eee-${String(index).padStart(12,'0')}`);
  for(const target of unicodeIds)await context(a,0,'😀'.repeat(600),target);
  await assert.rejects(()=>context(a,0,'😀'.repeat(601),'eeeeeeee-eeee-4eee-8eee-999999999999'));check('individual context uses UTF16 unit limit');
  await assert.rejects(()=>consent(a,0,{kind:'assistant'},'eeeeeeee-eeee-4eee-8eee-999999999998',unicodeIds.map(recordId=>({recordId,revision:1}))));check('7200 UTF16 selected units rejected at SQL consent boundary');
  await assert.rejects(()=>consent(a,0,{kind:'assistant'},'eeeeeeee-eeee-4eee-8eee-999999999998',[{recordId:unicodeIds[0].toUpperCase(),revision:1},{recordId:unicodeIds[0],revision:1}]));check('UUID casing cannot bypass selected-record uniqueness');
  const upperConsent='88888888-8888-4888-8888-888888888888';await consent(a,0,{kind:'assistant'},upperConsent,[{recordId:unicodeIds[0].toUpperCase(),revision:1}]);check('accepted UUID selections stored canonically',(await snapshot(a,{kind:'assistant'},upperConsent)).rows[0].data.consent.selections[0].recordId===unicodeIds[0]);
  await assert.rejects(()=>snapshot(b));check('snapshot cannot find another owner consent');
  await db.exec('set role authenticated');await assert.rejects(()=>snapshot(a));await assert.rejects(()=>db.query('select * from do_provider_context'));await assert.rejects(()=>context(a,1));await db.exec('reset role');check('authenticated client cannot read tables or invoke service RPCs');
  await db.exec('set role anon');await assert.rejects(()=>snapshot(a));await db.exec('reset role');check('guest has no persistent provider memory access');
  await db.close();db=new Database(dir);check('context and consent survive database reopen',(await snapshot(a)).rows[0].data.records[0].text==='Fictional sample goal.');
  await context(a,1,'Edited fictional goal.');await assert.rejects(()=>snapshot(a));check('editing context invalidates selected revision');
  await consent(a,1,{kind:'assistant'},cid,[{recordId:id,revision:2}]);
  await db.query('select do_provider_consent_change($1,$2,2,null,null,null)',[a,cid]);await assert.rejects(()=>snapshot(a));await assert.rejects(()=>consent(a,3));check('revocation erases selection and cannot resurrect by CAS');
  await context(a,2,null);await assert.rejects(()=>context(a,3));check('deletion tombstone prevents ABA resurrection');
  check('deletion preserves other owner body',(await db.query('select body from do_provider_context where owner_id=$1',[b])).rows[0].body==='Fictional sample goal.');
  // Expired content cannot be renewed even before purge.
  await db.query("update do_provider_context set confirmed_at=clock_timestamp()-interval '8 days',observed_at=clock_timestamp()-interval '8 days',expires_at=clock_timestamp()-interval '2 days' where owner_id=$1",[b]);
  check('expired update commits content-free tombstone',(await context(b,1)).rows[0].ok===false);
  await assert.rejects(()=>context(b,2));check('expired tombstone cannot be revived');
  const task=(await db.query("select do_personal_save($1,null,'Sample','Prepare fictional sample','Fictional notes','Pacific/Auckland',7) as id",[a])).rows[0].id;
  const run=(await db.query('select * from do_personal_claim($1,$2)',[a,task])).rows[0].run_id;
  const contextId='33333333-3333-4333-8333-333333333333',consentId='44444444-4444-4444-8444-444444444444',scope={kind:'responsibility',responsibilityId:task,responsibilityRevision:1};
  await context(a,0,'Fictional responsibility preference.',contextId);await consent(a,0,scope,consentId,[{recordId:contextId,revision:1}]);
  await assert.rejects(()=>consent(b,0,scope,consentId));check('responsibility scope verifies server owner');
  check('JSON null cannot bypass responsibility kind',(await db.query('select do_provider_scope_current($1,$2) as ok',[a,{...scope,kind:null}])).rows[0].ok===false);
  await db.query('select do_provider_policy_change($1,$2,0,$3,0,0,24,false)',[a,task,'Pacific/Auckland']);
  const reserve=(connection=db,key='sample:revision:1')=>connection.query('select do_provider_prepare_reserve($1,$2,$3,1,$4,1) as ok',[a,run,consentId,key]);
  if(real){ const peer=new Database();try{ const attempts=await Promise.all([reserve(db),reserve(peer)]);check('separate workers reserve novelty exactly once',attempts.filter(item=>item.rows[0].ok).length===1); }finally{await peer.close();} }
  else check('first reservation persisted',(await reserve()).rows[0].ok===true);
  check('same-run retry cannot dispatch twice',(await reserve()).rows[0].ok===false);
  check('uncertain work can be inspected without redispatch',(await db.query('select do_provider_prepare_get($1,$2) as data',[a,'sample:revision:1'])).rows[0].data.status==='reserved');
  await assert.rejects(()=>db.query("select do_provider_prepare_state($1,$2,'prepared_draft',null) as ok",[a,'sample:revision:1']));check('reservation state setter cannot fabricate a prepared receipt');
  await db.close();
  if(real && process.env.DO_PROOF_RESTART_POSTGRES==='true'){
   const {execFileSync}=require('node:child_process');
   execFileSync('docker',['restart','do-provider-memory-proof-task11'],{stdio:'ignore'});
   for(let attempt=0;attempt<30;attempt++){try{execFileSync('docker',['exec','do-provider-memory-proof-task11','pg_isready','-U','postgres'],{stdio:'ignore'});break;}catch{if(attempt===29)throw new Error('disposable PostgreSQL restart unavailable');await new Promise(resolve=>setTimeout(resolve,200));}}
   check('actual disposable PostgreSQL process restarted');
  }
  db=new Database(dir);check('restart does not grant redispatch',(await reserve()).rows[0].ok===false);
  check('different novelty blocked by persisted cooldown',(await reserve(db,'sample:revision:2')).rows[0].ok===false);
  await db.query("update do_provider_preparation_reservation set created_at=clock_timestamp()-interval '2 days' where owner_id=$1",[a]);
  await db.query('select do_provider_policy_change($1,$2,1,$3,0,0,24,true)',[a,task,'Pacific/Auckland']);
  check('policy pause blocks work',(await db.query('select do_provider_prepare_reserve($1,$2,$3,1,$4,2) as ok',[a,run,consentId,'sample:revision:2'])).rows[0].ok===false);
  check('atomic publication rejects changed policy before output is visible',(await db.query("select do_provider_prepare_publish($1,$2,'Fictional draft','{}') as ok",[a,'sample:revision:1'])).rows[0].ok===false&&(await db.query('select output from do_personal_runs where id=$1',[run])).rows[0].output===null);
  const task2=(await db.query("select do_personal_save($1,null,'Atomic','Prepare fictional atomic sample','Fictional notes','Pacific/Auckland',7) as id",[a])).rows[0].id;
  const run2=(await db.query('select * from do_personal_claim($1,$2)',[a,task2])).rows[0].run_id;
  const consent2='55555555-5555-4555-8555-555555555555';
  await consent(a,0,{kind:'responsibility',responsibilityId:task2,responsibilityRevision:1},consent2,[{recordId:contextId,revision:1}]);
  await db.query('select do_provider_policy_change($1,$2,0,$3,0,0,24,false)',[a,task2,'Pacific/Auckland']);
  check('existing owned job reserves atomic publication once',(await db.query('select do_provider_prepare_reserve($1,$2,$3,1,$4,1) as ok',[a,run2,consent2,'atomic:1'])).rows[0].ok===true);
  check('atomic publication stores draft and receipt together',(await db.query("select do_provider_prepare_publish($1,$2,'Fictional context-derived draft','{\"quote\":\"Fictional sample\"}') as ok",[a,'atomic:1'])).rows[0].ok===true&&(await db.query('select status from do_personal_runs where id=$1',[run2])).rows[0].status==='needs_review');
  check('publication retry never writes twice',(await db.query("select do_provider_prepare_publish($1,$2,'Retry','{}') as ok",[a,'atomic:1'])).rows[0].ok===false);
  check('dismissal preserves no action authority',(await db.query("select do_provider_prepare_state($1,$2,'dismissed',null) as ok",[a,'atomic:1'])).rows[0].ok===true);
  if(real){
   await db.query("update do_provider_preparation_reservation set created_at=clock_timestamp()-interval '2 days' where owner_id=$1",[a]);
   const task3=(await db.query("select do_personal_save($1,null,'Expiry','Prepare fictional expiry sample','Fictional notes','Pacific/Auckland',7) as id",[a])).rows[0].id;
   const run3=(await db.query('select * from do_personal_claim($1,$2)',[a,task3])).rows[0].run_id;
   const consent3='66666666-6666-4666-8666-666666666666';
   await consent(a,0,{kind:'responsibility',responsibilityId:task3,responsibilityRevision:1},consent3,[{recordId:contextId,revision:1}],new Date(Date.now()+600).toISOString());
   await db.query('select do_provider_policy_change($1,$2,0,$3,0,0,24,false)',[a,task3,'Pacific/Auckland']);
   assert.equal((await db.query('select do_provider_prepare_reserve($1,$2,$3,1,$4,1) as ok',[a,run3,consent3,'expiry:1'])).rows[0].ok,true);
   const holder=new Database();try{
    await holder.exec('begin');await holder.query('select pg_advisory_xact_lock(hashtextextended($1,3028))',[a]);
    const publication=db.query("select do_provider_prepare_publish($1,$2,'Must never become visible','{}') as ok",[a,'expiry:1']);
    await new Promise(resolve=>setTimeout(resolve,800));await holder.exec('commit');
    check('publication rechecks expiry after a separate-session lock wait',(await publication).rows[0].ok===false&&(await db.query('select output from do_personal_runs where id=$1',[run3])).rows[0].output===null);
   }finally{await holder.close();}
  }
  await context(a,1,null,contextId);
  const erased=(await db.query('select status,output,evidence from do_personal_runs where id=$1',[run2])).rows[0];
  check('context deletion removes derived draft/evidence and cancels job',erased.status==='cancelled'&&erased.output===null&&!JSON.stringify(erased.evidence).includes('Fictional'));
  await db.query('select do_personal_pause($1,$2)',[a,task]);await assert.rejects(()=>snapshot(a,scope,consentId));await assert.rejects(()=>reserve());check('responsibility pause invalidates read and in-flight reservation');
  await assert.rejects(()=>db.query('select do_provider_context_expire(0)'));check('cleanup is bounded');
  await db.query('delete from auth.users where id=$1',[a]);check('account deletion removes context consent and reservation metadata',(await db.query('select (select count(*) from do_provider_context where owner_id=$1)+(select count(*) from do_provider_context_consent where owner_id=$1)+(select count(*) from do_provider_preparation_reservation where owner_id=$1) as count',[a])).rows[0].count==0);
  console.log(`${checks} provider-memory SQL checks passed (${real?'PostgreSQL separate sessions':'PGlite reopen'}).`);
 }finally{await db.close();fs.rmSync(dir,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exitCode=1;});
