// Only bootstraps a newly created, labelled, network-none synthetic CI container.
const fs=require('node:fs'),{execFileSync}=require('node:child_process'),assert=require('node:assert/strict');
assert.equal(process.env.DO_STORAGE_PROOF_ALLOWED,'synthetic_disposable_only');
assert.ok(process.env.GITHUB_RUN_ID,'CI run identity required');
assert.equal(process.env.DO_PERSONAL_RESPONSIBILITY_STORAGE_ENABLED,'false');
assert.equal(process.env.DO_PERSONAL_RESPONSIBILITY_PURGE_ENABLED,'false');
const inspect=key=>execFileSync('docker',['inspect','--format',key,'do-storage-proof-task11'],{encoding:'utf8'}).trim();
assert.equal(inspect('{{ index .Config.Labels "assembl.synthetic-proof" }}'),'do-storage-only');
assert.equal(inspect('{{ index .Config.Labels "assembl.proof.run" }}'),process.env.GITHUB_RUN_ID);
assert.equal(inspect('{{ .HostConfig.NetworkMode }}'),'none');
assert.deepEqual(JSON.parse(inspect('{{json .HostConfig.PortBindings}}')) || {},{});
function sql(text){return execFileSync('psql',['-X','-v','ON_ERROR_STOP=1','-qAt'],{input:text,encoding:'utf8',maxBuffer:2*1024*1024});}
assert.equal(sql('show server_version_num').trim(),'170011');
assert.equal(sql("select count(*) from pg_namespace where nspname='auth'").trim(),'0','Fresh database required; never apply over existing Auth data.');
for(const file of [
 'docs/do-personal/storage-only-ci-bootstrap.sql',
 'supabase/migrations/20260929213918_do_personal_responsibilities.sql',
 'docs/do-personal/storage-only-proposal.sql',
 'docs/do-personal/storage-only-proof.sql',
 'docs/do-personal/storage-only-role-proof.sql',
 'docs/do-personal/storage-only-ci-edges.sql',
]){process.stdout.write(sql(fs.readFileSync(file,'utf8')));console.log('PASS '+file);}
// Fresh persistent fictional fixtures solely for the subsequent separate-process races.
sql(`insert into auth.users(id,is_anonymous) values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',false),('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',false),('cccccccc-cccc-4ccc-8ccc-cccccccccccc',true);
insert into public.do_personal_storage_enrolment(owner_id,enabled,expires_at,retention_reviewed,purpose) values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',false,clock_timestamp()+interval '1 day',true,'owner_entered_responsibility_review');`);
console.log('Synthetic setup and serial/roles/edge proofs complete; no application background worker enabled.');
