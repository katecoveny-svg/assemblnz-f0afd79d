// REVIEW ONLY: run after PR1505 serial proof, before its unchanged race steps.
// Reuses only the existing original-control disposable DB. No remote URI/provider.
const fs=require('node:fs'),crypto=require('node:crypto'),cp=require('node:child_process'),assert=require('node:assert/strict');
assert.equal(process.env.DO_STORAGE_PROOF_ALLOWED,'synthetic_disposable_only');
assert.ok(process.env.GITHUB_RUN_ID);
for(const f of ['DO_PERSONAL_RESPONSIBILITY_STORAGE_ENABLED','DO_PERSONAL_RESPONSIBILITY_PURGE_ENABLED','DO_PROVIDER_MEMORY_ENABLED','DO_MEMORY_PILOT_PREPARATION_ENABLED','PERSONAL_DO_CONSUMER_ENABLED'])assert.equal(process.env[f],'false');
const inspect=k=>cp.execFileSync('docker',['inspect','--format',k,'do-storage-proof-task11'],{encoding:'utf8'}).trim();
assert.equal(inspect('{{ index .Config.Labels "assembl.synthetic-proof" }}'),'do-storage-only');
assert.equal(inspect('{{ index .Config.Labels "assembl.proof.run" }}'),process.env.GITHUB_RUN_ID);
assert.equal(inspect('{{ .HostConfig.NetworkMode }}'),'none');
assert.deepEqual(JSON.parse(inspect('{{json .HostConfig.PortBindings}}'))||{},{});
const read=p=>fs.readFileSync(p,'utf8'),hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const wrapper='docs/do-personal/storage-only-combined-operation.sql';
assert.equal(hash(wrapper),'bccbf6c9d476c0e2fc11f1c9447acd0206eca5869c2b73a426ab1e2dfea08aad');
assert.equal(hash('docs/do-personal/storage-only-proposal.sql'),'e0865a4b3389a67df623a8c03a9fb40cf7901760b64cd280a062b14adcaf74fc');
assert.equal(hash('docs/do-personal/storage-only-auth-bridge-proposal.sql'),'fda47111b1a6a20f3c3df29b7b10652cadb169eb4566edaa1e08699a5f3f22af');
function run(input,db='do_storage_original_acl'){return cp.spawnSync('psql',['-X','-v','ON_ERROR_STOP=1','-v','VERBOSITY=verbose','-qAt'],{input,encoding:'utf8',timeout:30000,maxBuffer:2*1024*1024,env:{...process.env,DO_STORAGE_PROOF_DATABASE:db}});}
function sql(input,db){const r=run(input,db);assert.equal(r.error,undefined);assert.equal(r.signal,null);assert.equal(r.status,0,r.stderr);return r.stdout;}
assert.equal(sql('show server_version_num').trim(),'170011');
// Verify this really is the just-completed original ACL control before destroying it.
assert.equal(sql("select has_table_privilege('service_role','public.do_personal_storage_requests','UPDATE')").trim(),'t');
sql('drop database do_storage_original_acl;','do_storage_proof');
sql('create database do_storage_original_acl;','do_storage_proof');
sql('begin;'+read('docs/do-personal/storage-only-ci-bootstrap.sql')+'\n'+read('supabase/migrations/20260929213918_do_personal_responsibilities.sql')+`\n
alter default privileges in schema public grant all on sequences to anon,authenticated,service_role;
revoke all on auth.users from service_role,anon,authenticated;
revoke select(id,is_anonymous) on auth.users from service_role,anon,authenticated;
alter table auth.users enable row level security;
create or replace function auth.uid() returns uuid language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claim.sub',true),''),(nullif(current_setting('request.jwt.claims',true),'')::jsonb ->> 'sub'))::uuid $$;
commit;`);
const baseline=`select jsonb_build_object('policy',(select jsonb_agg(to_jsonb(p) order by policyname) from pg_policies p where schemaname='public' and tablename in ('do_personal_responsibilities','do_personal_runs')),'expiry',(select count(*) from pg_attribute where attrelid='public.do_personal_responsibilities'::regclass and attname='storage_body_expires_at' and not attisdropped),'storage',(select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname like 'do_personal_storage_%'),'bridge',to_regnamespace('do_personal_auth_private') is not null);`;
const before=sql(baseline);
// Observe PostgreSQL's actual normalized qual inside a rolled-back probe.
const normalized=sql('begin;'+read('docs/do-personal/storage-only-proposal.sql')+"\nselect qual from pg_policies where schemaname='public' and tablename='do_personal_responsibilities' and policyname='personal_context_owner';rollback;").trim();
const expected=read(wrapper).match(/qual=\$expected\$([^$]*storage_body_expires_at[^$]*)\$expected\$/)[1];
assert.equal(normalized,expected,'Exact wrapper predicate normalization differs; stop and review, never weaken assertion');
assert.equal(sql(baseline),before);console.log('PASS rolled-back predicate probe '+normalized);
// Exact-byte mid-DDL failure: fixture event trigger rejects helper schema creation.
// This is not an edited wrapper and deliberately occurs AFTER storage DDL starts.
sql("create function public.synthetic_reject_bridge_ddl() returns event_trigger language plpgsql as $$ begin raise exception 'SYNTHETIC_BRIDGE_DDL_REJECT'; end $$;create event trigger synthetic_reject_bridge_ddl on ddl_command_start when tag in ('CREATE SCHEMA') execute function public.synthetic_reject_bridge_ddl();");
const rejected=run(read(wrapper));assert.equal(rejected.error,undefined);assert.equal(rejected.signal,null);assert.equal(rejected.status,3);assert.match(rejected.stderr,/SYNTHETIC_BRIDGE_DDL_REJECT/);assert.equal(sql(baseline),before,'Mid-DDL failure leaked state');
sql('drop event trigger synthetic_reject_bridge_ddl;drop function public.synthetic_reject_bridge_ddl();');console.log('PASS exact wrapper mid-DDL rollback');
process.stdout.write(sql(read(wrapper)));console.log('PASS exact combined wrapper SHA256 '+hash(wrapper));
assert.equal(sql('select count(*) from public.do_personal_storage_enrolment').trim(),'0');
assert.equal(sql('select count(*) from public.do_personal_storage_requests').trim(),'0');
assert.equal(sql("select count(*) from public.do_personal_storage_maintenance where status is not null or last_completed_at is not null or last_attempt_at is not null").trim(),'0');
assert.equal(sql("select has_column_privilege('service_role','auth.users','id','SELECT') or has_column_privilege('service_role','auth.users','is_anonymous','SELECT')").trim(),'f');
assert.equal(sql('select qual from pg_policies where schemaname=\'public\' and tablename=\'do_personal_responsibilities\' and policyname=\'personal_context_owner\'').trim(),expected);
// Only rollback-contained existing fictional proof fixtures; never set real flags/health.
for(const p of ['docs/do-personal/storage-only-default-acl-proof.sql','docs/do-personal/storage-only-auth-bridge-proof.sql','docs/do-personal/storage-only-auth-hosted-proof.sql'])process.stdout.write(sql(read(p)));
assert.equal(sql('select count(*) from public.do_personal_storage_enrolment').trim(),'0');
console.log('PASS combined wrapper reviewed no-seed/no-activation postconditions and hosted caller proofs');
