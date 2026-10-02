// Isolated CI fixture only: hardcoded loopback/database; no app/remote credentials.
// Prepared, NOT runtime-proven until this workflow produces a terminal PASS.
const {Client}=require(process.env.STUDIO_RUN_PG_MODULE||'/tmp/studio-run-sql-proof/node_modules/pg');
const assert=require('node:assert/strict'),fs=require('node:fs'),{randomUUID}=require('node:crypto');
const connectionString='postgresql://supabase_admin:fictional-studio-run-only@127.0.0.1:55440/studio_run_proof';
const owner='11111111-1111-4111-8111-111111111111',other='22222222-2222-4222-8222-222222222222',disabled='44444444-4444-4444-8444-444444444444',fingerprint='a'.repeat(64);
const policy={id:'synthetic-ci-only',ownerId:owner,expiresAt:'2099-01-01T00:00:00Z',maxRuns:1,provider:'openai',accountRef:'fictional-test-only',model:'test-model',pricingVersion:'synthetic-v1',maxCalls:2,maxInputTokens:2000,maxOutputTokens:1000,maxUsdMicros:7000,inputUsdMicrosPerMillion:1000000,outputUsdMicrosPerMillion:5000000,tools:false,cache:false,retries:0,repairs:0};
const clients=[];let checks=0;
const pass=name=>{checks++;console.log('PASS '+name);};
async function connect(role){const c=new Client({connectionString:role?connectionString.replace('supabase_admin:',role+':'):connectionString,query_timeout:10000});c.on('error',error=>console.error('Synthetic DB connection error:',error.message));await c.connect();clients.push(c);return c;}
const cmd=(client,name,input,id=owner)=>client.query('select public.studio_owner_run_command($1::uuid,$2::text,$3::jsonb) as result',[id,name,input]).then(r=>r.rows[0].result);
(async()=>{try{
 const admin=await connect();assert.equal((await admin.query('select current_database() as db')).rows[0].db,'studio_run_proof');
 assert.equal((await admin.query("select count(*)::int as n from information_schema.tables where table_schema='public' and table_name like 'studio_%'")).rows[0].n,0);
 // This dedicated empty database supplies ordinary synthetic identity fixtures.
 await admin.query(`create schema if not exists auth;create table if not exists auth.users(id uuid primary key);create or replace function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;create or replace function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
 do $$begin if not exists(select 1 from pg_roles where rolname='anon') then create role anon;end if;if not exists(select 1 from pg_roles where rolname='authenticated') then create role authenticated;end if;if not exists(select 1 from pg_roles where rolname='service_role') then create role service_role bypassrls;end if;end$$;
 alter role anon login password 'fictional-studio-run-only';alter role authenticated login password 'fictional-studio-run-only';alter role service_role login password 'fictional-studio-run-only';
 grant usage on schema auth,public to anon,authenticated,service_role;grant execute on function auth.uid(),auth.jwt() to anon,authenticated;alter default privileges in schema public grant all on tables to public,anon,authenticated,service_role;alter default privileges in schema public grant execute on functions to public,anon,authenticated,service_role;`);
 await admin.query('insert into auth.users(id) values($1),($2),($3) on conflict do nothing',[owner,other,disabled]);
 await admin.query(fs.readFileSync('docs/migration-review/owner-schema-proposal.sql','utf8'));
 await admin.query(fs.readFileSync('docs/migration-review/owner-run-schema-proposal.sql','utf8'));
 console.log('Synthetic DB versions:',JSON.stringify((await admin.query("select current_setting('server_version') as postgres,extversion as pg_jsonschema from pg_extension where extname='pg_jsonschema'")).rows[0]));
 await admin.query('insert into public.studio_owner_access(owner_user_id,enabled) values($1,true),($2,true),($3,false)',[owner,other,disabled]);
 await admin.query('insert into public.studio_owner_run_policies values($1,$2,$3)',[owner,policy.id,policy]);
 const service=await connect('service_role'),service2=await connect('service_role'),A=await connect('authenticated'),B=await connect('authenticated'),anon=await connect('anon');
 await A.query("select set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claims',$2,false)",[owner,JSON.stringify({is_anonymous:false})]);
 await B.query("select set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claims',$2,false)",[other,JSON.stringify({is_anonymous:false})]);
 const runId=randomUUID(),create={runId,inputFingerprint:fingerprint,selectedSourceReceipts:[],policyId:policy.id};
 for(const c of [A,B,anon])await assert.rejects(()=>cmd(c,'create',create),/permission denied/);pass('authenticated and anonymous callers cannot mutate admission');
 for(const table of ['studio_owner_runs','studio_owner_run_policies'])await assert.rejects(()=>service.query('update public.'+table+" set "+(table.endsWith('policies')?'policy':'receipt')+"='{}'"),/permission denied/);pass('service cannot overwrite policies/receipts through direct table writes');
 await assert.rejects(()=>cmd(service,'create',create,disabled),/run_owner_denied/);pass('disabled owner denied through trusted RPC');
 const races=await Promise.allSettled([cmd(service,'create',create),cmd(service2,'create',{...create,runId:randomUUID()})]);assert.equal(races.filter(r=>r.status==='fulfilled').length,1);const actual=races.find(r=>r.status==='fulfilled').value.runId;pass('policy lock admits one run across competing IDs');
 const base={...create,runId:actual};await assert.rejects(()=>cmd(service,'create',{...base,inputFingerprint:'b'.repeat(64)}),/run_input_conflict/);await assert.rejects(()=>cmd(service,'create',{...base,maxUsdMicros:999999}),/run_input_invalid/);pass('immutable input and strict schema prevent caller policy injection');
 const claim={runId:actual,actionId:randomUUID(),action:'develop',inputFingerprint:fingerprint,expectedRevision:0};
 const pair=await Promise.all([cmd(service,'claim',claim),cmd(service2,'claim',claim)]);assert.deepEqual(pair.map(r=>r.kind).sort(),['claimed','existing']);const claimed=pair.find(r=>r.kind==='claimed');pass('duplicate concurrent claims give dispatch preparation only once');
 const start={runId:actual,claimId:claimed.claimId,expectedRevision:1};const starts=await Promise.allSettled([cmd(service,'start',start),cmd(service2,'start',start)]);assert.equal(starts.filter(r=>r.status==='fulfilled').length,1);pass('started state commits once before dispatch');
 const outcome=await cmd(service,'outcome',{...start,expectedRevision:2,status:'complete'});assert.equal(outcome.claims[0].state,'usage-unverified');assert.equal(outcome.reservedUsdMicros,7000);pass('missing usage never releases reservation');
 assert.deepEqual(await cmd(service,'lookup',{runId:actual}),outcome);await assert.rejects(()=>cmd(service,'start',{...start,expectedRevision:3}),/run_dispatch_denied/);await assert.rejects(()=>cmd(service,'claim',{...claim,actionId:randomUUID(),expectedRevision:3}),/run_budget_exceeded/);pass('recovery is lookup-only; reserve blocks further calls');
 const otherPolicy={...policy,id:'synthetic-owner-b',ownerId:other};
 await admin.query('insert into public.studio_owner_run_policies values($1,$2,$3)',[other,otherPolicy.id,otherPolicy]);
 const otherRunId=randomUUID();await cmd(service,'create',{...create,runId:otherRunId,policyId:otherPolicy.id},other);
 const fixture=JSON.parse(fs.readFileSync('scripts/migration-review/synthetic-owner-payload.json','utf8'));
 const payloadA={...fixture,name:'Synthetic enabled owner A draft'},payloadB={...fixture,name:'Synthetic enabled owner B draft'};
 const draftA=(await A.query('select * from public.studio_save_owner_draft(null,0,$1::jsonb)',[payloadA])).rows[0];
 const draftB=(await B.query('select * from public.studio_save_owner_draft(null,0,$1::jsonb)',[payloadB])).rows[0];
 assert.ok(draftA&&draftB);
 const before=(await admin.query('select id,revision,payload,deleted_at from public.studio_owner_drafts order by id')).rows;
 const beforeRuns=(await admin.query('select owner_user_id,run_id,receipt from public.studio_owner_runs order by owner_user_id')).rows;
 for(const [client,ownId,foreignId,ownRun,foreignRun,ownDraft,foreignDraft,ownPayload] of [[A,owner,other,actual,otherRunId,draftA,draftB,payloadA],[B,other,owner,otherRunId,actual,draftB,draftA,payloadB]]){
  assert.deepEqual((await client.query('select run_id from public.studio_owner_runs')).rows.map(r=>r.run_id),[ownRun]);
  assert.deepEqual((await client.query('select id from public.studio_owner_drafts')).rows.map(r=>r.id),[ownDraft.id]);
  assert.equal((await client.query('select count(*)::int as n from public.studio_owner_runs where owner_user_id=$1 or run_id=$2',[foreignId,foreignRun])).rows[0].n,0);
  assert.equal((await client.query('select count(*)::int as n from public.studio_owner_drafts where owner_user_id=$1 or id=$2',[foreignId,foreignDraft.id])).rows[0].n,0);
  for(const table of ['studio_owner_runs','studio_owner_drafts'])await assert.rejects(()=>client.query('update public.'+table+' set owner_user_id=$1 where owner_user_id=$2',[ownId,foreignId]),/permission denied/);
  assert.equal((await client.query('select * from public.studio_save_owner_draft($1,1,$2::jsonb)',[foreignDraft.id,ownPayload])).rowCount,0);
  assert.equal((await client.query('select * from public.studio_delete_owner_draft($1,1)',[foreignDraft.id])).rowCount,0);
  await assert.rejects(()=>cmd(client,'lookup',{runId:foreignRun},foreignId),/permission denied/);
  await assert.rejects(()=>cmd(client,'claim',{...claim,runId:foreignRun,actionId:randomUUID(),expectedRevision:0},foreignId),/permission denied/);
  await assert.rejects(()=>cmd(service,'lookup',{runId:foreignRun},ownId),/run_unavailable/);
  await assert.rejects(()=>cmd(service,'claim',{...claim,runId:foreignRun,actionId:randomUUID(),expectedRevision:0},ownId),/run_unavailable/);
 }
 assert.deepEqual((await admin.query('select id,revision,payload,deleted_at from public.studio_owner_drafts order by id')).rows,before);
 assert.deepEqual((await admin.query('select owner_user_id,run_id,receipt from public.studio_owner_runs order by owner_user_id')).rows,beforeRuns);
 pass('two enabled owners retain distinct drafts/runs; cross-owner reads, writes, save/delete RPCs and run access deny without mutation');
 for(const client of [A,B,anon,service])for(const table of ['studio_owner_run_policies','studio_owner_runs','studio_owner_drafts']){
  for(const [privilege,statement] of [
   ['INSERT',`insert into public.${table} select * from public.${table} where false`],
   ['UPDATE',`update public.${table} set owner_user_id=owner_user_id where false`],
   ['DELETE',`delete from public.${table} where false`],
   ['TRUNCATE',`truncate public.${table}`],
  ]){assert.equal((await client.query('select has_table_privilege(current_user,$1,$2) as allowed',['public.'+table,privilege])).rows[0].allowed,false);await assert.rejects(()=>client.query(statement),/permission denied/);}
 }
 pass('authenticated A/B, anon and service deny INSERT/UPDATE/DELETE/TRUNCATE on policies/runs/drafts');


 // Independent budgets/evidence cases use new operator-approved synthetic policies.
 async function fresh(overrides={}){const p={...policy,id:randomUUID(),ownerId:other,maxUsdMicros:20000,...overrides};await admin.query('insert into public.studio_owner_run_policies values($1,$2,$3)',[other,p.id,p]);const id=randomUUID();await cmd(service,'create',{runId:id,inputFingerprint:fingerprint,selectedSourceReceipts:[],policyId:p.id},other);return {id,p};}
 async function beginCall(id){const v=await cmd(service,'claim',{runId:id,actionId:randomUUID(),action:'develop',inputFingerprint:fingerprint,expectedRevision:0},other);await cmd(service,'start',{runId:id,claimId:v.claimId,expectedRevision:1},other);return {runId:id,claimId:v.claimId,expectedRevision:2};}
 const rounding=await fresh({maxInputTokens:1,maxOutputTokens:1,inputUsdMicrosPerMillion:1,outputUsdMicrosPerMillion:1,maxUsdMicros:1});
 const roundClaim=await cmd(service,'claim',{runId:rounding.id,actionId:randomUUID(),action:'develop',inputFingerprint:fingerprint,expectedRevision:0},other);assert.equal(roundClaim.receipt.reservedUsdMicros,1);pass('exact integer ceiling rounds fractional micro-dollar upward');
 const calls=await fresh({maxCalls:1,maxUsdMicros:20000});await beginCall(calls.id);await assert.rejects(()=>cmd(service,'claim',{runId:calls.id,actionId:randomUUID(),action:'build',inputFingerprint:fingerprint,expectedRevision:2},other),/run_budget_exceeded/);pass('call cap rejects independently of dollar capacity');
 const correctEvidence={provider:policy.provider,model:policy.model,accountRef:policy.accountRef};
 for(const [label,fields] of [
  ['missing',{}],
  ['wrong-provider',{providerRequestId:'fixture',providerEvidence:{...correctEvidence,provider:'anthropic'},usage:{inputTokens:10,outputTokens:10,cacheTokens:0,toolCalls:0},validatedOutputFingerprint:fingerprint}],
  ['wrong-model',{providerRequestId:'fixture',providerEvidence:{...correctEvidence,model:'wrong'},usage:{inputTokens:10,outputTokens:10,cacheTokens:0,toolCalls:0},validatedOutputFingerprint:fingerprint}],
  ['wrong-account',{providerRequestId:'fixture',providerEvidence:{...correctEvidence,accountRef:'wrong'},usage:{inputTokens:10,outputTokens:10,cacheTokens:0,toolCalls:0},validatedOutputFingerprint:fingerprint}],
  ['over-bound',{providerRequestId:'fixture',providerEvidence:correctEvidence,usage:{inputTokens:2001,outputTokens:1001,cacheTokens:0,toolCalls:0},validatedOutputFingerprint:fingerprint}],
 ]){const f=await fresh(),v=await beginCall(f.id);const r=await cmd(service,'outcome',{...v,status:'complete',...fields},other);assert.equal(r.claims[0].state,'usage-unverified',label);assert.equal(r.reservedUsdMicros,7000,label);await assert.rejects(()=>cmd(service,'start',{...v,expectedRevision:3},other),/run_dispatch_denied/);}
 pass('missing/wrong/over-bound usage evidence retains reservation and prevents redispatch');
 const failedRun=await fresh(),failedCall=await beginCall(failedRun.id);const failed=await cmd(service,'outcome',{...failedCall,status:'failed',providerRequestId:'fixture-failed',providerEvidence:correctEvidence,usage:{inputTokens:10,outputTokens:10,cacheTokens:0,toolCalls:0}},other);assert.equal(failed.claims[0].state,'failed');assert.equal(failed.reservedUsdMicros,7000);assert.equal(failed.claims[0].actualUsdMicros,60);pass('explicit evidenced failed outcome retains reserve and records cost');
 const casRun=await fresh(),casBase={runId:casRun.id,action:'develop',inputFingerprint:fingerprint,expectedRevision:0};
 const casResults=await Promise.allSettled([cmd(service,'claim',{...casBase,actionId:randomUUID()},other),cmd(service2,'claim',{...casBase,actionId:randomUUID()},other)]);assert.equal(casResults.filter(r=>r.status==='fulfilled').length,1);assert.match(casResults.find(r=>r.status==='rejected').reason.message,/run_revision_conflict/);const casWinner=casResults.find(r=>r.status==='fulfilled').value;const persistedClaim=casWinner.receipt.claims[0];
 await assert.rejects(()=>cmd(service,'claim',{...casBase,actionId:persistedClaim.actionId,action:'build',expectedRevision:1},other),/run_input_conflict/);
 await assert.rejects(()=>cmd(service,'create',{runId:casRun.id,inputFingerprint:fingerprint,policyId:casRun.p.id,selectedSourceReceipts:[{id:'synthetic-source',sha256:'b'.repeat(64),scope:'public',checkedAt:'2026-10-02T00:00:00Z'}]},other),/run_input_conflict/);
 assert.deepEqual(await cmd(service,'lookup',{runId:casRun.id},other),casWinner.receipt);pass('distinct-action CAS has one winner; changed-action/source replay cannot mutate the run');

 const valid=await fresh(),validCall=await beginCall(valid.id);const complete=await cmd(service,'outcome',{...validCall,status:'complete',providerRequestId:'fixture-complete',providerEvidence:correctEvidence,usage:{inputTokens:10,outputTokens:10,cacheTokens:0,toolCalls:0},validatedOutputFingerprint:fingerprint},other);assert.equal(complete.claims[0].actualUsdMicros,60);assert.equal(complete.claims[0].state,'complete');assert.equal(complete.reservedUsdMicros,7000);pass('verified usage records exact cost without refund');
 for(const body of [null,{}, {...create,runId:null}, {...create,selectedSourceReceipts:null}, {...create,unexpected:true}])await assert.rejects(()=>cmd(service,'create',body),/run_input_invalid/);
 for(const body of [{runId:otherRunId,actionId:randomUUID(),action:'build',inputFingerprint:fingerprint,expectedRevision:null},{runId:otherRunId,actionId:randomUUID(),action:'build',inputFingerprint:fingerprint,expectedRevision:-1},{runId:otherRunId,actionId:randomUUID(),action:'build',inputFingerprint:fingerprint,expectedRevision:0,reserveUsdMicros:0}])await assert.rejects(()=>cmd(service,'claim',body),/run_input_invalid/);
 pass('null/missing/extra/invalid fields cannot bypass admission');
 const lock=await connect();const servicePid=(await service.query('select pg_backend_pid() as pid')).rows[0].pid;
 async function pollUntil(check,label){const deadline=Date.now()+3000;do{if(await check())return;await new Promise(resolve=>setTimeout(resolve,20));}while(Date.now()<deadline);throw Error('bounded_poll_timeout:'+label);}
 const waitForLock=pid=>pollUntil(async()=>((await admin.query('select wait_event_type from pg_stat_activity where pid=$1',[pid])).rows[0]?.wait_event_type)==='Lock','lock-wait');
 const waitForExpiry=expiry=>pollUntil(async()=>(await admin.query('select clock_timestamp()>=$1::timestamptz as expired',[expiry])).rows[0].expired,'expiry');

 async function waitExpiry(commandName,input,query,parameters){await lock.query('begin');await lock.query(query,parameters);const pending=cmd(service,commandName,input,other).then(()=>({ok:true}),error=>({error}));await waitForLock(servicePid);const expiry=(await lock.query(commandName==='create'?"select policy->>'expiresAt' as expiry from public.studio_owner_run_policies where owner_user_id=$1 and policy_id=$2":"select receipt->'policy'->>'expiresAt' as expiry from public.studio_owner_runs where owner_user_id=$1 and run_id=$2",parameters)).rows[0].expiry;await waitForExpiry(expiry);await lock.query('commit');const result=await pending;assert.match(result.error?.message||'',/run_policy_expired/);}
 const expPolicy={...policy,id:randomUUID(),ownerId:other};await admin.query('insert into public.studio_owner_run_policies values($1,$2,$3)',[other,expPolicy.id,expPolicy]);
 await waitExpiry('create',{runId:randomUUID(),inputFingerprint:fingerprint,selectedSourceReceipts:[],policyId:expPolicy.id},"update public.studio_owner_run_policies set policy=jsonb_set(policy,'{expiresAt}',to_jsonb(to_char((clock_timestamp()+interval '120 milliseconds') at time zone 'UTC','YYYY-MM-DD\"T\"HH24:MI:SS.MS\"Z\"'))) where owner_user_id=$1 and policy_id=$2",[other,expPolicy.id]);
 for(const phase of ['claim','start']){const f=await fresh();let v={runId:f.id,actionId:randomUUID(),action:'develop',inputFingerprint:fingerprint,expectedRevision:0};if(phase==='start'){const c=await cmd(service,'claim',v,other);v={runId:f.id,claimId:c.claimId,expectedRevision:1};}await waitExpiry(phase,v,"update public.studio_owner_runs set receipt=jsonb_set(receipt,'{policy,expiresAt}',to_jsonb(to_char((clock_timestamp()+interval '120 milliseconds') at time zone 'UTC','YYYY-MM-DD\"T\"HH24:MI:SS.MS\"Z\"'))) where owner_user_id=$1 and run_id=$2",[other,f.id]);}
 pass('create/claim/start recheck wallclock expiry after policy/run lock waits');
 // Disable first holds the row lock; waiting admission must see the committed denial.
 await lock.query('begin');await lock.query('update public.studio_owner_access set enabled=false where owner_user_id=$1',[other]);const denied=cmd(service,'lookup',{runId:otherRunId},other).then(()=>({ok:true}),error=>({error}));await waitForLock(servicePid);await lock.query('commit');assert.match((await denied).error?.message||'',/run_owner_denied/);await admin.query('update public.studio_owner_access set enabled=true where owner_user_id=$1',[other]);pass('disable committing while admission waits denies the waiting command');
 // Admission first holds FOR SHARE until its transaction ends; disable must wait.
 await service.query('begin');await cmd(service,'lookup',{runId:otherRunId},other);const lockPid=(await lock.query('select pg_backend_pid() as pid')).rows[0].pid;const disabling=lock.query('update public.studio_owner_access set enabled=false where owner_user_id=$1',[other]);await waitForLock(lockPid);await service.query('commit');await disabling;await assert.rejects(()=>cmd(service,'lookup',{runId:otherRunId},other),/run_owner_denied/);await admin.query('update public.studio_owner_access set enabled=true where owner_user_id=$1',[other]);pass('disable waits behind already admitted transaction then blocks later admission');
 await A.query("select set_config('request.jwt.claims','{\"is_anonymous\":true}',false)");assert.equal((await A.query('select count(*)::int as n from public.studio_owner_runs')).rows[0].n,0);pass('anonymous identity denied despite matching UUID');
 await admin.query('update public.studio_owner_access set enabled=false where owner_user_id=$1',[owner]);await assert.rejects(()=>cmd(service,'lookup',{runId:actual}),/run_owner_denied/);assert.equal((await B.query('select count(*)::int as n from public.studio_owner_runs where run_id=$1',[otherRunId])).rows[0].n,1);pass('DB disablement denies direct RPC without disabling the other owner');
 console.log(`PASS ${checks} isolated database checks; no production/provider access`);
}finally{await Promise.allSettled(clients.map(c=>c.end()));}})().catch(e=>{console.error(e);process.exitCode=1;});
