// PREPARED / NOT EXECUTED. Coordinator supplies disposable DB, synthetic owner A,
// reviewed baseline/proposal, one disabled enrolment row. No installs/production.
const {spawn,execFileSync}=require('node:child_process');const assert=require('node:assert/strict');
const url=process.env.DO_STORAGE_PROOF_URL;
if(process.env.DO_STORAGE_PROOF_ALLOWED!=='synthetic_disposable_only')throw new Error('Coordinated disposable proof approval required.');
const u=new URL(url);if(!['127.0.0.1','localhost'].includes(u.hostname)||u.port!=='55437'||u.pathname!=='/do_storage_proof')throw new Error('Only owned synthetic disposable database permitted.');
const a='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';let seq=0;
function query(sql,name=`do-storage-proof-${++seq}`,asService=true){return new Promise((resolve,reject)=>{const p=spawn('psql',['-X','-v','ON_ERROR_STOP=1','-qAt','-c',(asService?'set role service_role;':'')+sql],{env:{...process.env,PGDATABASE:url,PGAPPNAME:name}});let out='',err='';p.stdout.on('data',b=>out+=b);p.stderr.on('data',b=>err+=b);p.on('error',reject);p.on('exit',c=>c?reject(new Error(err)):resolve(out.trim()));});}
function hold(sql){let readyResolve,readyReject;const ready=new Promise((r,j)=>{readyResolve=r;readyReject=j;});const p=spawn('psql',['-X','-v','ON_ERROR_STOP=1','-qAt'],{env:{...process.env,PGDATABASE:url,PGAPPNAME:'do-storage-proof-holder'}});let out='',err='';p.stdout.on('data',b=>{out+=b;if(out.includes('locked'))readyResolve();});p.stderr.on('data',b=>err+=b);const done=new Promise((resolve,reject)=>{p.on('error',e=>{readyReject(e);reject(e);});p.on('exit',c=>{if(c){const e=new Error(err);readyReject(e);reject(e);}else resolve(out);});});done.catch(()=>{});p.stdin.write(`set role service_role;begin;${sql};select 'locked';\n`);return{ready,release:()=>p.stdin.end('commit;\n'),done};}
async function blocked(name,settled){const deadline=Date.now()+1500;while(Date.now()<deadline){if(settled())throw new Error('Waiter finished before a lock-wait barrier was proved.');
 // Test instrumentation stays in its own disposable administrator connection;
 // application calls above run under actual service_role. No role grants added.
 const observed=await query(`select exists(select 1 from pg_stat_activity a join pg_locks l on l.pid=a.pid where a.datname=current_database() and a.application_name='${name}' and a.wait_event_type='Lock' and not l.granted)`,'do-storage-proof-monitor',false);
 if(observed==='t')return;await new Promise(r=>setTimeout(r,15));}
 throw new Error('No proven blocked waiter before deadline; holder must not be released as a passing test.');}
async function race(holderSql,waiterSql,label,expected){const h=hold(holderSql);await h.ready;const name='do-storage-proof-waiter-'+label;let ended=false;const p=query(waiterSql,name);p.then(()=>ended=true,()=>ended=true);try{await blocked(name,()=>ended);}finally{h.release();await h.done;}if(expected==='f')assert.equal(await p,'f');else await assert.rejects(p,expected);}
const save=(id,rev,title='Synthetic race')=>`select public.do_personal_save_paused('${a}',${id?`'${id}'`:'gen_random_uuid()'},'${title}','Review fictional notes','Synthetic notes only','Pacific/Auckland',7,${rev})`;
async function task(){await query(`update public.do_personal_storage_enrolment set enabled=true,expires_at=clock_timestamp()+interval '1 day',enrolled_at=clock_timestamp() where owner_id='${a}';update public.do_personal_storage_maintenance set status='completed',last_completed_at=clock_timestamp() where id=true`);return(await query(save(null,0))).split('\n').at(-1);}
const remove=id=>query(`delete from public.do_personal_responsibilities where id='${id}'`);
(async()=>{
 let id=await task();let h=hold(`select id from public.do_personal_responsibilities where id='${id}' for update`);await h.ready;
 let done1=false,done2=false;let p1=query(save(id,1,'CAS one'),'do-storage-proof-cas-one'),p2=query(save(id,1,'CAS two'),'do-storage-proof-cas-two');p1.then(()=>done1=true,()=>done1=true);p2.then(()=>done2=true,()=>done2=true);
 try{await blocked('do-storage-proof-cas-one',()=>done1);await blocked('do-storage-proof-cas-two',()=>done2);}finally{h.release();await h.done;}
 let outcomes=await Promise.allSettled([p1,p2]);assert.equal(outcomes.filter(x=>x.status==='fulfilled').length,1);assert.match(outcomes.find(x=>x.status==='rejected').reason.message,/responsibility_conflict/);await remove(id);
 id=await task();await race(`delete from public.do_personal_responsibilities where id='${id}'`,save(id,1),'delete',/responsibility_conflict/);
 id=await task();await query(`update public.do_personal_responsibilities set active=true,consent_until=clock_timestamp()+interval '1 day' where id='${id}'`);
 let run=(await query(`insert into public.do_personal_runs(owner_id,responsibility_id,revision,status) values('${a}','${id}',1,'running') returning id`)).split('\n')[0];
 await race(`select id from public.do_personal_responsibilities where id='${id}' for update;${save(id,1)}`,`select public.do_personal_finish('${run}','Synthetic stale output','{}')`,'finish','f');await remove(id);
 id=await task();await race(`update public.do_personal_responsibilities set storage_body_expires_at=clock_timestamp()-interval '1 second' where id='${id}'`,save(id,1),'expiry',/(responsibility_conflict|storage_unavailable)/);await query('select public.do_personal_storage_expire_batch(100)');
 id=await task();await race(`update public.do_personal_responsibilities set storage_body_expires_at=clock_timestamp()-interval '1 second' where id='${id}';select public.do_personal_storage_expire_batch(100)`,save(id,1),'cleanup-renew',/responsibility_conflict/);
 id=await task();await race(`update public.do_personal_storage_enrolment set enabled=false where owner_id='${a}'`,save(id,1),'enrolment-revoke',/storage_unavailable/);await remove(id);
 id=await task();await query(`update public.do_personal_responsibilities set active=true,consent_until=clock_timestamp()+interval '1 day' where id='${id}'`);run=(await query(`insert into public.do_personal_runs(owner_id,responsibility_id,revision,status) values('${a}','${id}',1,'running') returning id`)).split('\n')[0];await race(`select public.do_personal_pause('${a}','${id}')`,`select public.do_personal_finish('${run}','Synthetic cancelled output','{}')`,'pause-finish','f');await remove(id);
 if(process.env.DO_STORAGE_PROOF_RESTART==='true'){
  id=await task();execFileSync('docker',['restart','do-storage-proof-task11'],{stdio:'ignore'});
  let ready=false;for(let i=0;i<20;i++){try{await query('select 1');ready=true;break;}catch{await new Promise(r=>setTimeout(r,100));}}if(!ready)throw new Error('Owned disposable restart recovery failed.');
  assert.equal(await query(save(id,0)),id);assert.equal(await query(`select count(*) from public.do_personal_storage_requests where owner_id='${a}' and request_id='${id}'`),'1');await remove(id);
 }
 console.log('Proven lock-wait CAS/delete/finish/expiry/cleanup/revocation/cancellation cases passed; restart optional and separately explicit.');
})().catch(e=>{console.error(e.message);process.exitCode=1;});
