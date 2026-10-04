// Existing labelled network-none synthetic container only. No remote DB connection.
const fs=require('node:fs'),crypto=require('node:crypto'),{execFileSync,spawnSync}=require('node:child_process'),assert=require('node:assert/strict');
assert.equal(process.env.DO_STORAGE_PROOF_ALLOWED,'synthetic_disposable_only');
assert.ok(process.env.GITHUB_RUN_ID,'CI run identity required');
for(const flag of ['DO_PERSONAL_RESPONSIBILITY_STORAGE_ENABLED','DO_PERSONAL_RESPONSIBILITY_PURGE_ENABLED','DO_PROVIDER_MEMORY_ENABLED','DO_MEMORY_PILOT_PREPARATION_ENABLED','PERSONAL_DO_CONSUMER_ENABLED']) assert.equal(process.env[flag],'false');
const inspect=key=>execFileSync('docker',['inspect','--format',key,'do-storage-proof-task11'],{encoding:'utf8'}).trim();
assert.equal(inspect('{{ index .Config.Labels "assembl.synthetic-proof" }}'),'do-storage-only');
assert.equal(inspect('{{ index .Config.Labels "assembl.proof.run" }}'),process.env.GITHUB_RUN_ID);
assert.equal(inspect('{{ .HostConfig.NetworkMode }}'),'none');
assert.deepEqual(JSON.parse(inspect('{{json .HostConfig.PortBindings}}')) || {},{});
const correctedDB='do_storage_proof',originalDB='do_storage_original_acl';
function sql(text,db=correctedDB){return execFileSync('psql',['-X','-v','ON_ERROR_STOP=1','-qAt'],{input:text,encoding:'utf8',maxBuffer:2*1024*1024,timeout:30000,env:{...process.env,DO_STORAGE_PROOF_DATABASE:db}});}
const read=file=>fs.readFileSync(file,'utf8');
const originalFile='docs/do-personal/storage-only-original-acl-control.sql',correctedFile='docs/do-personal/storage-only-proposal.sql',aclFile='docs/do-personal/storage-only-default-acl-proof.sql';
for(const [file,expected] of [[originalFile,'1d5d7d7f59fa7a10ac3df46fef7b7d8c0b60bd2666fd9fbda7531f59b16ee1da'],[correctedFile,'e0865a4b3389a67df623a8c03a9fb40cf7901760b64cd280a062b14adcaf74fc']]){
 const digest=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');assert.equal(digest,expected);console.log('SQL_SHA256 '+file+' '+digest);
}
assert.equal(sql('show server_version_num').trim(),'170011');
assert.equal(sql("select count(*) from pg_roles where rolname in ('anon','authenticated','service_role')").trim(),'0','Fresh synthetic cluster roles required');
assert.equal(sql("select count(*) from pg_database where datname='do_storage_original_acl'").trim(),'0','Fresh original-control database required');
sql('create database do_storage_original_acl;');
const fixtures="insert into auth.users(id,is_anonymous) values('dddddddd-dddd-4ddd-8ddd-dddddddddddd',false),('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',true);";
function install(file,db){process.stdout.write(sql("begin;set local lock_timeout='2s';set local statement_timeout='20s';\n"+read(file)+'\ncommit;',db));console.log('PASS '+db+' '+file);}
for(const db of [originalDB,correctedDB]){
 assert.equal(sql("select count(*) from pg_namespace where nspname='auth'",db).trim(),'0','Fresh namespace required; never apply over existing Auth data.');
 install('docs/do-personal/storage-only-ci-bootstrap.sql',db);
 install('supabase/migrations/20260929213918_do_personal_responsibilities.sql',db);
 sql(fixtures,db);
 install(db===originalDB?originalFile:correctedFile,db);
}
// Original must fail for the precise defect, not syntax/transport/missing objects.
const negative=spawnSync('psql',['-X','-v','ON_ERROR_STOP=1','-qAt'],{input:read(aclFile),encoding:'utf8',maxBuffer:2*1024*1024,timeout:30000,env:{...process.env,DO_STORAGE_PROOF_DATABASE:originalDB}});
assert.equal(negative.error,undefined,'Negative control did not execute');
assert.equal(negative.signal,null,'Negative control was interrupted');
assert.equal(negative.status,3,'Original must fail SQL assertion, not transport');
assert.match(negative.stderr,/ERROR:\s+ACL_EXCESS_SERVICE_REQUEST_UPDATE(?:\r?\n|$)/,'Wrong original-control failure');
process.stdout.write(negative.stderr);console.log('EXPECTED_FAIL original ACL_EXCESS_SERVICE_REQUEST_UPDATE');
process.stdout.write(sql(read(aclFile)));console.log('PASS corrected complete effective ACL matrix and actual denials');
for(const file of ['docs/do-personal/storage-only-proof.sql','docs/do-personal/storage-only-role-proof.sql','docs/do-personal/storage-only-ci-edges.sql']){process.stdout.write(sql(read(file)));console.log('PASS '+file);}
// Existing subsequent workflow steps use corrected DB; no changes to race/restart/cancel scripts.
sql(`insert into auth.users(id,is_anonymous) values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',false),('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',false),('cccccccc-cccc-4ccc-8ccc-cccccccccccc',true);
insert into public.do_personal_storage_enrolment(owner_id,enabled,expires_at,retention_reviewed,purpose) values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',false,clock_timestamp()+interval '1 day',true,'owner_entered_responsibility_review');`);
console.log('Two fresh DB controls complete; no application worker enabled. Existing races/restart/cancellation must also pass.');
