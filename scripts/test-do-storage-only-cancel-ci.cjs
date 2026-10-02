// Synthetic CI only: cancel one observed blocked service-role request and prove rollback.
const {spawn,execFileSync}=require('node:child_process'),assert=require('node:assert/strict');
assert.equal(process.env.DO_STORAGE_PROOF_ALLOWED,'synthetic_disposable_only');assert.ok(process.env.GITHUB_RUN_ID);
const a='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',name='do-storage-proof-explicit-cancel';
const sql=text=>execFileSync('psql',['-X','-v','ON_ERROR_STOP=1','-qAt'],{input:text,encoding:'utf8'}).trim();
const id=sql(`set role service_role;select public.do_personal_save_paused('${a}',gen_random_uuid(),'Synthetic cancellation','Review fictional notes','Original fictional notes','Pacific/Auckland',7,0);`).split('\n').at(-1);
let release,readyResolve,readyReject;
const ready=new Promise((r,j)=>{readyResolve=r;readyReject=j;});
const holder=spawn('psql',['-X','-v','ON_ERROR_STOP=1','-qAt'],{stdio:['pipe','pipe','pipe']});let holderError='';
holder.stderr.on('data',b=>holderError+=b);holder.stdout.on('data',b=>{if(String(b).includes('locked'))readyResolve();});
const holderDone=new Promise((r,j)=>{holder.on('error',e=>{readyReject(e);j(e);});holder.on('exit',c=>{if(c){const e=new Error(holderError);readyReject(e);j(e);}else r();});});holderDone.catch(()=>{});
holder.stdin.write(`set role service_role;begin;select id from public.do_personal_responsibilities where id='${id}' for update;select 'locked';\n`);release=()=>holder.stdin.end('commit;\n');
(async()=>{await ready;let ended=false,error='';
 const waiter=spawn('psql',['-X','-v','ON_ERROR_STOP=1','-qAt','-c',`set role service_role;select public.do_personal_save_paused('${a}','${id}','Synthetic cancellation','Review fictional notes','Must never replace original','Pacific/Auckland',7,1);`],{env:{...process.env,PGAPPNAME:name}});
 waiter.stderr.on('data',b=>error+=b);const done=new Promise((r,j)=>{waiter.on('error',j);waiter.on('exit',c=>{ended=true;r(c);});});
 try{let pid='',deadline=Date.now()+1500;while(Date.now()<deadline){assert.equal(ended,false,'Waiter ended before proven lock barrier');pid=sql(`select distinct a.pid from pg_stat_activity a join pg_locks l on l.pid=a.pid where a.datname=current_database() and a.application_name='${name}' and a.wait_event_type='Lock' and not l.granted;`);if(pid)break;await new Promise(r=>setTimeout(r,15));}
 assert.match(pid,/^\d+$/,'Exactly one blocked synthetic waiter required');assert.equal(sql(`select pg_cancel_backend(${pid});`),'t');assert.notEqual(await done,0);assert.match(error,/canceling statement due to user request/);
 }finally{release();await holderDone;}
 assert.equal(sql(`set role service_role;select revision||':'||notes from public.do_personal_responsibilities where owner_id='${a}' and id='${id}';`),'1:Original fictional notes');
 sql(`set role service_role;delete from public.do_personal_responsibilities where owner_id='${a}' and id='${id}';`);
 console.log('PASS actual pg_cancel_backend of proven blocked request leaves original revision/body unchanged.');
})().catch(e=>{console.error(e.message);process.exitCode=1;});
