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
-- Reconstruct ONLY disposable schema ACL entries, including explicit owner grants.
-- Per-schema ACL entries supplement implicit global defaults; retain global absence.
alter default privileges in schema public revoke all on tables from postgres,anon,authenticated,service_role;
alter default privileges in schema public revoke all on sequences from postgres,anon,authenticated,service_role;
alter default privileges in schema public revoke all on functions from postgres,anon,authenticated,service_role;
alter default privileges in schema public grant all on tables to postgres,anon,authenticated,service_role;
alter default privileges in schema public grant all on sequences to postgres,anon,authenticated,service_role;
alter default privileges in schema public grant execute on functions to postgres,anon,authenticated,service_role;
revoke all on auth.users from service_role,anon,authenticated;
revoke select(id,is_anonymous) on auth.users from service_role,anon,authenticated;
alter table auth.users enable row level security;
create or replace function auth.uid() returns uuid language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claim.sub',true),''),(nullif(current_setting('request.jwt.claims',true),'')::jsonb ->> 'sub'))::uuid $$;
commit;`);
const baseline=`select jsonb_build_object('policy',(select jsonb_agg(to_jsonb(p) order by policyname) from pg_policies p where schemaname='public' and tablename in ('do_personal_responsibilities','do_personal_runs')),'expiry',(select count(*) from pg_attribute where attrelid='public.do_personal_responsibilities'::regclass and attname='storage_body_expires_at' and not attisdropped),'storage',(select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname like 'do_personal_storage_%'),'bridge',to_regnamespace('do_personal_auth_private') is not null);`;
const before=sql(baseline);
const fixtureDefaults=sql("select jsonb_object_agg(defaclobjtype::text,defaclacl::text) from pg_default_acl where defaclrole=(select oid from pg_roles where rolname='postgres') and defaclnamespace='public'::regnamespace;").trim();
console.log('SYNTHETIC_PUBLIC_DEFAULT_ACL '+fixtureDefaults);
const expectedDefaults=JSON.parse(read(wrapper).match(/is distinct from '([^']+)'::jsonb then raise exception 'schema_defaults_changed'/)[1]);
assert.deepEqual(JSON.parse(fixtureDefaults),expectedDefaults,'Fixture defaults must match unmodified exact wrapper before rollback/install proof');
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
// Preserve actual structural catalog output from the successful exact wrapper.
// Synthetic metadata only; source definitions are NOT substituted for observations.
const structuralQueries=[{"label": "columns_defaults", "query": "select n.nspname as schema_name,c.relname as table_name,a.attnum as ordinal,\n a.attname as column_name,pg_catalog.format_type(a.atttypid,a.atttypmod) as data_type,\n a.attnotnull as not_null,a.attidentity as identity_kind,a.attgenerated as generated_kind,\n (d.oid is not null) as has_default,pg_catalog.pg_get_expr(d.adbin,d.adrelid,false) as default_expression,\n case when a.attcollation=0 then null else cn.nspname||'.'||co.collname end as collation,\n a.attisdropped as dropped\nfrom pg_catalog.pg_class c\njoin pg_catalog.pg_namespace n on n.oid=c.relnamespace\njoin pg_catalog.pg_attribute a on a.attrelid=c.oid and a.attnum>0 and not a.attisdropped\nleft join pg_catalog.pg_attrdef d on d.adrelid=c.oid and d.adnum=a.attnum\nleft join pg_catalog.pg_collation co on co.oid=a.attcollation\nleft join pg_catalog.pg_namespace cn on cn.oid=co.collnamespace\nwhere n.nspname='public' and (\n c.relname in ('do_personal_storage_enrolment','do_personal_storage_requests','do_personal_storage_maintenance')\n or (c.relname='do_personal_responsibilities' and a.attname='storage_body_expires_at'))\norder by schema_name,table_name,ordinal"}, {"label": "constraints", "query": "select n.nspname as schema_name,c.relname as table_name,k.conname as constraint_name,\n k.contype as constraint_kind,k.convalidated as validated,k.condeferrable as deferrable,\n k.condeferred as initially_deferred,k.connoinherit as no_inherit,\n pg_catalog.pg_get_constraintdef(k.oid,false) as definition,\n array(select a.attname from unnest(k.conkey) with ordinality key(attnum,position)\n  join pg_catalog.pg_attribute a on a.attrelid=k.conrelid and a.attnum=key.attnum order by key.position) as columns,\n rn.nspname as referenced_schema,rc.relname as referenced_table,\n array(select a.attname from unnest(k.confkey) with ordinality key(attnum,position)\n  join pg_catalog.pg_attribute a on a.attrelid=k.confrelid and a.attnum=key.attnum order by key.position) as referenced_columns,\n k.confupdtype as fk_update_action,k.confdeltype as fk_delete_action,k.confmatchtype as fk_match_type\nfrom pg_catalog.pg_constraint k\njoin pg_catalog.pg_class c on c.oid=k.conrelid\njoin pg_catalog.pg_namespace n on n.oid=c.relnamespace\nleft join pg_catalog.pg_class rc on rc.oid=k.confrelid\nleft join pg_catalog.pg_namespace rn on rn.oid=rc.relnamespace\nwhere n.nspname='public' and (\n c.relname in ('do_personal_storage_enrolment','do_personal_storage_requests','do_personal_storage_maintenance')\n or (c.relname in ('do_personal_responsibilities','do_personal_runs') and k.contype='f'))\norder by schema_name,table_name,constraint_name"}, {"label": "indexes", "query": "select n.nspname as schema_name,t.relname as table_name,ix.relname as index_name,\n am.amname as access_method,i.indisunique as unique_index,i.indisprimary as primary_index,\n i.indisexclusion as exclusion_index,i.indisvalid as valid,i.indisready as ready,\n i.indislive as live,i.indisreplident as replica_identity,i.indnkeyatts as key_count,\n i.indnatts as attribute_count,pg_catalog.pg_get_indexdef(i.indexrelid,0,false) as definition,\n pg_catalog.pg_get_expr(i.indpred,i.indrelid,false) as predicate,\n pg_catalog.pg_get_expr(i.indexprs,i.indrelid,false) as expressions,\n ix.reloptions as options,pg_catalog.pg_get_userbyid(ix.relowner) as owner,\n ix.relpersistence as persistence\nfrom pg_catalog.pg_index i\njoin pg_catalog.pg_class t on t.oid=i.indrelid\njoin pg_catalog.pg_namespace n on n.oid=t.relnamespace\njoin pg_catalog.pg_class ix on ix.oid=i.indexrelid\njoin pg_catalog.pg_am am on am.oid=ix.relam\nwhere n.nspname='public' and (\n t.relname in ('do_personal_storage_enrolment','do_personal_storage_requests','do_personal_storage_maintenance')\n or (t.relname='do_personal_responsibilities' and ix.relname='do_personal_storage_expiry'))\norder by schema_name,table_name,index_name"}, {"label": "expiry_index_identity", "query": "select n.nspname as index_schema,c.relname,c.relkind,tn.nspname as table_schema,t.relname as table_name\nfrom pg_catalog.pg_class c\njoin pg_catalog.pg_namespace n on n.oid=c.relnamespace\nleft join pg_catalog.pg_index i on i.indexrelid=c.oid\nleft join pg_catalog.pg_class t on t.oid=i.indrelid\nleft join pg_catalog.pg_namespace tn on tn.oid=t.relnamespace\nwhere c.relname='do_personal_storage_expiry' order by index_schema"}];
const structureReceipt={status:'observed_uncompared',serverVersion:sql('show server_version_num').trim(),wrapperSha256:hash(wrapper),groups:[]};
for(const {label,query} of structuralQueries){
 assert.match(query,/^select\b/i);
 const actualQuery='select row_to_json(observed)::text from (\n'+query+'\n) observed;';
 let raw;
 try{raw=sql(actualQuery);}catch(error){structureReceipt.status='unknown_query_failed';structureReceipt.groups.push({label,state:'unknown_query_failed',rowCount:null});console.log('STRUCTURAL_CATALOG_RECEIPT '+JSON.stringify(structureReceipt));throw error;}
 const rows=raw.split('\n').filter(Boolean).map(line=>JSON.parse(line));
 process.stdout.write('STRUCTURAL_RAW_BEGIN '+label+'\n'+raw+'STRUCTURAL_RAW_END '+label+'\n');
 structureReceipt.groups.push({label,querySha256:crypto.createHash('sha256').update(actualQuery).digest('hex'),rawSha256:crypto.createHash('sha256').update(raw).digest('hex'),rowCount:rows.length,state:rows.length?'observed_present_uncompared':'absent_no_rows',rows});
}
structureReceipt.status=structureReceipt.groups.every(g=>g.rowCount>0)?'observed_uncompared':'observed_incomplete';
console.log('STRUCTURAL_CATALOG_RECEIPT '+JSON.stringify(structureReceipt));
// A missing group is a failed observation, not success inferred from SQL source.
assert.ok(structureReceipt.groups.every(g=>g.rowCount>0),'Incomplete observed structural receipt; absence requires review');
assert.equal(structureReceipt.groups[3].rowCount,1,'Expiry index identity must have exactly one observed row');
console.log('PASS combined wrapper reviewed no-seed/no-activation postconditions and hosted caller proofs');
