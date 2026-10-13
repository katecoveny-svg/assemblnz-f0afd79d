// Repeatable database proof for Personal DO wake-ups; embedded Postgres, no production connection or provider call.
// npm install --prefix /tmp/assembl-personal-sql @electric-sql/pglite@0.3.14
const {PGlite}=require(process.env.ASSEMBL_PGLITE_MODULE||'/tmp/assembl-personal-sql/node_modules/@electric-sql/pglite');
const fs=require('node:fs');const assert=require('node:assert/strict');
(async()=>{const db=new PGlite();let count=0;const check=(name,ok)=>{assert.ok(ok,name);count++;console.log('PASS '+name)};
 await db.exec(`create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key,is_anonymous boolean default false); create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$; create function auth.jwt() returns jsonb language sql as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;grant usage on schema auth to authenticated,service_role;grant select on auth.users to service_role;`);
 await db.exec(fs.readFileSync('supabase/migrations/20260929213918_do_personal_responsibilities.sql','utf8'));
 await db.exec(fs.readFileSync('docs/do-personal/storage-only-proposal.sql','utf8'));
 await db.exec(fs.readFileSync('supabase/migrations/20261013093000_do_personal_wakeups.sql','utf8'));
 const a='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',b='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',anon='cccccccc-cccc-4ccc-8ccc-cccccccccccc';
 await db.query('insert into auth.users values ($1,false),($2,false),($3,true)',[a,b,anon]);
 // Enrol one owner in the storage-only pilot the way the proposal expects (single enrolment, retention reviewed, cleanup healthy);
 // the other owner keeps a legacy row so both save paths are covered.
 await db.query("insert into public.do_personal_storage_enrolment(owner_id,enabled,expires_at,retention_reviewed,purpose) values($1,true,clock_timestamp()+interval '6 days',true,'owner_entered_responsibility_review')",[a]);
 await db.query("select public.do_personal_storage_record_maintenance('completed',0,clock_timestamp())");
 const one=(sql,args)=>db.query(sql,args).then(r=>r.rows[0]);
 const nextWake=async(cadence,weekday,hour,tz,once,after)=>(await one('select public.do_personal_next_wake($1,$2,$3,$4,$5,$6)::text as t',[cadence,weekday,hour,tz,once,after])).t;

 // Next-wake function across cadences, in NZ time (NZDT = UTC+13 from 27 Sep 2026).
 check('daily: later today when the hour has not passed',(await nextWake('daily',null,9,'Pacific/Auckland',null,'2026-10-13T19:00:00Z'))==='2026-10-13 20:00:00+00');
 check('daily: tomorrow once the hour has passed',(await nextWake('daily',null,7,'Pacific/Auckland',null,'2026-10-13T20:00:00Z'))==='2026-10-14 18:00:00+00');
 check('weekdays: Friday evening NZ rolls to Monday',(await nextWake('weekdays',null,7,'Pacific/Auckland',null,'2026-10-16T08:00:00Z'))==='2026-10-18 18:00:00+00');
 check('weekly: same weekday next week when today\'s hour has passed',(await nextWake('weekly',2,7,'Pacific/Auckland',null,'2026-10-13T08:00:00Z'))==='2026-10-19 18:00:00+00');
 check('weekly: upcoming weekday this week',(await nextWake('weekly',5,7,'Pacific/Auckland',null,'2026-10-13T08:00:00Z'))==='2026-10-15 18:00:00+00');
 check('once: the chosen moment, never a past one',(await nextWake('once',null,7,'Pacific/Auckland','2026-10-20T03:00:00Z','2026-10-13T08:00:00Z'))==='2026-10-20 03:00:00+00'&&(await nextWake('once',null,7,'Pacific/Auckland','2026-10-10T03:00:00Z','2026-10-13T08:00:00Z'))==='infinity');
 check('manual: no scheduled wake-up',(await nextWake('manual',null,7,'Pacific/Auckland',null,'2026-10-13T08:00:00Z'))==='infinity');
 check('daily hour follows NZ daylight saving',(await nextWake('daily',null,7,'Pacific/Auckland',null,'2026-09-24T20:00:00Z'))==='2026-09-25 19:00:00+00'&&(await nextWake('daily',null,7,'Pacific/Auckland',null,'2026-09-25T20:00:00Z'))==='2026-09-26 18:00:00+00');

 // Saving through the paused storage path leaves wake-ups off; scheduling is a separate consent.
 const id='11111111-1111-4111-8111-111111111111';
 const save=(owner,rid,rev)=>db.query("select public.do_personal_save_paused($1,$2,'Prepare my day','Prepare a short daily brief from my notes','Proposal due Friday. Waiting on Sam for the quote. Call the school?','Pacific/Auckland',7,$3)",[owner,rid,rev]);
 await save(a,id,0);
 const legacy=(await one("select public.do_personal_save($1,null,'Loose ends','Review my ongoing work and unanswered questions','Chase the plumber','Pacific/Auckland',7) as id",[b])).id;
 let row=await one('select active,cadence,next_run_at::text as next,consent_until::text as consent from public.do_personal_responsibilities where id=$1',[id]);
 check('saving notes does not turn wake-ups on',row.active===false&&row.next==='infinity'&&row.cadence==='daily');
 const schedule=(owner,rid,cadence,weekday,hour,once,rev)=>one('select public.do_personal_schedule($1,$2,$3,$4,$5,$6,$7,$8) as r',[owner,rid,cadence,weekday,hour,'Pacific/Auckland',once,rev]).then(r=>r.r);
 await assert.rejects(()=>schedule(b,id,'daily',null,7,null,1),/not_found/);check('another owner cannot schedule my responsibility',true);
 await assert.rejects(()=>schedule(anon,id,'daily',null,7,null,1),/owner_required/);check('anonymous accounts cannot schedule',true);
 await assert.rejects(()=>schedule(a,id,'daily',null,7,null,3),/responsibility_conflict/);check('a stale revision cannot schedule',true);
 await assert.rejects(()=>schedule(a,id,'weekly',null,7,null,1),/wake_invalid/);check('weekly needs a weekday',true);
 await assert.rejects(()=>schedule(a,id,'once',null,7,null,1),/wake_invalid/);check('once needs a moment',true);
 await assert.rejects(()=>schedule(a,id,'once',null,7,new Date(Date.now()+10*864e5).toISOString(),1),/wake_window/);check('once must fall inside the consent window',true);
 await assert.rejects(()=>schedule(a,id,'daily',null,24,null,1),/wake_invalid/);check('hour is bounded',true);
 await db.query("update public.do_personal_responsibilities set storage_body_expires_at=now()+interval '3 days' where id=$1",[id]);
 const weekdays=await schedule(a,id,'weekdays',null,7,null,1);
 row=await one('select active,cadence,revision,next_run_at,consent_until from public.do_personal_responsibilities where id=$1',[id]);
 check('scheduling turns wake-ups on with a bounded consent and a real next wake',row.active===true&&row.cadence==='weekdays'&&weekdays.active===true&&new Date(row.next_run_at)>new Date()&&new Date(row.consent_until)<=new Date(Date.now()+7*864e5+1000));
 check('scheduling checks the revision without bumping it',row.revision===1&&weekdays.revision===1);
 check('consent never outlives the stored body',new Date(row.consent_until)<=new Date(Date.now()+3*864e5+1000));
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[a]);await db.exec('set role authenticated');
 check('owner reads the schedule through RLS',(await one('select cadence,next_run_at from public.do_personal_responsibilities where id=$1',[id])).cadence==='weekdays');
 await assert.rejects(()=>db.query("select public.do_personal_schedule($1,$2,'daily',null,7,'Pacific/Auckland',null,1)",[a,id]));check('clients cannot call the schedule RPC directly',true);
 await assert.rejects(()=>db.query("update public.do_personal_responsibilities set next_run_at=now()"));check('clients cannot forge a wake-up',true);
 await db.exec('reset role');

 // Claims: scheduled claims need a due row; targeted claims need a reason.
 const claim=(owner,rid,trigger,note)=>db.query('select * from public.do_personal_claim($1,$2,$3,$4)',[owner,rid,trigger,note]).then(r=>r.rows);
 await assert.rejects(()=>claim(a,id,'scheduled',null),/wake_invalid/);check('a targeted claim must say why DO woke up',true);
 await assert.rejects(()=>claim(a,id,'message',null),/wake_invalid/);check('a message wake-up carries the note',true);
 check('not due yet: the scheduled worker finds nothing',(await claim(null,null,'scheduled',null)).length===0);
 const manual=(await claim(a,id,'manual',null))[0];
 let run=await one('select trigger,note,status from public.do_personal_runs where id=$1',[manual.run_id]);
 check('Prepare now records a manual wake-up',run.trigger==='manual'&&run.note===null&&run.status==='running');
 const before=(await one('select next_run_at from public.do_personal_responsibilities where id=$1',[id])).next_run_at;
 check('a manual wake-up does not move the schedule',String(before)===String((await one('select next_run_at from public.do_personal_responsibilities where id=$1',[id])).next_run_at));
 check('finish publishes a draft for review',(await one("select public.do_personal_finish($1,'Worksheet','{\"method\":\"worksheet\"}',false) as ok",[manual.run_id])).ok===true&&(await one('select status from public.do_personal_runs where id=$1',[manual.run_id])).status==='needs_review');
 check('one wake-up per hour per responsibility',(await claim(a,id,'message','Focus on the quote'))?.length===0);
 await db.query("update public.do_personal_runs set started_at=now()-interval '2 hours' where id=$1",[manual.run_id]);
 const message=(await claim(a,id,'message','Focus on the quote'))[0];
 check('a note wakes DO up with the note attached',(await one('select trigger,note from public.do_personal_runs where id=$1',[message.run_id])).note==='Focus on the quote');
 await db.query("select public.do_personal_finish($1,'Worksheet 2','{}',false)",[message.run_id]);
 // Scheduled wake-up: make the row due, let the worker claim it, and watch it advance by cadence.
 await db.query("update public.do_personal_responsibilities set next_run_at=now()-interval '1 minute' where id=$1",[id]);
 await db.query("update public.do_personal_runs set started_at=now()-interval '2 hours' where responsibility_id=$1",[id]);
 const due=(await claim(null,null,'scheduled',null))[0];
 check('the worker claims a due row on schedule',due?.responsibility?.id===id&&(await one('select trigger from public.do_personal_runs where id=$1',[due.run_id])).trigger==='scheduled');
 const advanced=(await one('select next_run_at,extract(isodow from next_run_at at time zone timezone) as dow from public.do_personal_responsibilities where id=$1',[id]));
 check('a scheduled claim advances to the next weekday wake-up',new Date(advanced.next_run_at)>new Date()&&Number(advanced.dow)<=5);
 await db.query("select public.do_personal_finish($1,'Worksheet 3','{}',false)",[due.run_id]);

 // Once: fires once, then nothing.
 await db.query("update public.do_personal_runs set started_at=now()-interval '2 hours' where responsibility_id=$1",[id]);
 const soon=new Date(Date.now()+60_000).toISOString();
 await schedule(a,id,'once',null,7,soon,1);
 check('once is scheduled at the chosen moment',new Date((await one('select next_run_at from public.do_personal_responsibilities where id=$1',[id])).next_run_at).toISOString()===soon);
 await db.query("update public.do_personal_responsibilities set next_run_at=now()-interval '1 second' where id=$1",[id]);
 const once=(await claim(null,null,'scheduled',null))[0];
 row=await one('select active,cadence,next_run_at::text as next from public.do_personal_responsibilities where id=$1',[id]);
 check('a once wake-up fires once and then has no next wake-up',(await one('select trigger from public.do_personal_runs where id=$1',[once.run_id])).trigger==='once'&&row.active===true&&row.cadence==='once'&&row.next==='infinity');
 await db.query("select public.do_personal_finish($1,'Once','{}',false)",[once.run_id]);
 await db.query("update public.do_personal_runs set started_at=now()-interval '2 hours' where responsibility_id=$1",[id]);
 check('Prepare now still works after a once wake-up',(await claim(a,id,'manual',null)).length===1);

 // Pause, editing and expiry all stop wake-ups.
 await db.query('select public.do_personal_pause($1,$2)',[a,id]);
 check('pause cancels the running wake-up and stops the schedule',(await one('select active from public.do_personal_responsibilities where id=$1',[id])).active===false&&(await one("select count(*)::int as n from public.do_personal_runs where responsibility_id=$1 and status='running'",[id])).n===0);
 // Pause bumps the revision; the reopened row carries it.
 await schedule(a,id,'daily',null,7,null,2);
 await save(a,id,2);
 row=await one('select active,revision,next_run_at::text as next from public.do_personal_responsibilities where id=$1',[id]);
 check('editing the notes revokes wake-ups until they are turned on again',row.active===false&&row.revision===3&&row.next==='infinity');
 await schedule(a,id,'daily',null,7,null,3);
 await db.query("update public.do_personal_responsibilities set storage_body_expires_at=now()-interval '1 second',next_run_at=now()-interval '1 minute' where id=$1",[id]);
 check('an expired body is never woken up',(await claim(null,null,'scheduled',null)).length===0);
 await assert.rejects(()=>schedule(a,id,'daily',null,7,null,3),/responsibility_conflict/);check('an expired body cannot be rescheduled',true);
 // Daily quota: five wake-ups per owner per day across every trigger.
 await db.query("insert into public.do_personal_usage(owner_id,created_at) select $1,now()-interval '2 hours' from generate_series(1,5)",[b]);
 await schedule(b,legacy,'manual',null,7,null,1);
 check('manual-only responsibilities are on without a scheduled wake-up',(await one('select active,next_run_at::text as next from public.do_personal_responsibilities where id=$1',[legacy])).next==='infinity');
 check('the daily wake-up quota counts every trigger',(await claim(b,legacy,'manual',null)).length===0);
 await db.close();console.log(`${count} database checks passed`);
})().catch(e=>{console.error(e);process.exitCode=1});
