-- Run in a transaction against the installed migration. No email transport,
-- customer data or permanent records. Every test record is rolled back.
begin;
insert into auth.users(id,email) values
 ('11111111-12aa-4aaa-8aaa-aaaaaaaaaaaa','enquiry-test-a@example.invalid'),
 ('22222222-12aa-4aaa-8aaa-aaaaaaaaaaaa','enquiry-test-b@example.invalid');
do $$
declare a uuid='11111111-12aa-4aaa-8aaa-aaaaaaaaaaaa'; b uuid='22222222-12aa-4aaa-8aaa-aaaaaaaaaaaa';
 j jsonb; original jsonb; other jsonb; child jsonb; rev text; rejected boolean=false; n integer;
begin
  j=public.do_enquiry_receive(a,'test:event','same-hash','{"name":"Aroha","email":"aroha@example.invalid","message":"Please help","subject":"Your enquiry","body":"Thank you","source":"test"}');
  original=public.do_enquiry_receive(a,'test:event','same-hash','{}');
  assert original->>'id'=j->>'id','duplicate event created a second job';
  begin perform public.do_enquiry_receive(a,'test:event','changed-hash','{}'); exception when others then rejected=sqlerrm='source_conflict'; end;
  assert rejected,'changed duplicate accepted'; rejected=false;
  begin perform public.do_enquiry_transition(b,(j->>'id')::uuid,'approve',jsonb_build_object('revision',j->>'revision')); exception when others then rejected=sqlerrm='not_found'; end;
  assert rejected,'foreign owner could claim job'; rejected=false;
  rev=j->>'revision';
  j=public.do_enquiry_transition(a,(j->>'id')::uuid,'edit',jsonb_build_object('revision',rev,'subject','Reviewed subject','body','Reviewed body'));
  assert j->>'revision'<>rev,'edit did not invalidate prior approval';
  begin perform public.do_enquiry_transition(a,(j->>'id')::uuid,'approve',jsonb_build_object('revision',rev)); exception when others then rejected=sqlerrm='review_changed'; end;
  assert rejected,'stale approval accepted'; rejected=false;
  j=public.do_enquiry_transition(a,(j->>'id')::uuid,'approve',jsonb_build_object('revision',j->>'revision'));
  assert j->>'status'='sending','claim not durable';
  begin perform public.do_enquiry_transition(a,(j->>'id')::uuid,'approve',jsonb_build_object('revision',j->>'revision')); exception when others then rejected=sqlerrm='review_changed'; end;
  assert rejected,'duplicate approval accepted'; rejected=false;
  begin perform public.do_enquiry_transition(a,(j->>'id')::uuid,'finish',jsonb_build_object('revision',j->>'revision','status','sent')); exception when others then rejected=sqlerrm='receipt_required'; end;
  assert rejected,'sent without provider receipt';
  j=public.do_enquiry_transition(a,(j->>'id')::uuid,'finish',jsonb_build_object('revision',j->>'revision','status','sent','providerId','fictional-provider-receipt','source','test_transport'));
  assert j->>'sent_at' is not null and j->>'answered_at' is null and j->>'booked_at' is null,'funnel conflated acceptance and outcome';
  update public.do_enquiry_jobs set followup_due_at=now()-interval '1 minute' where id=(j->>'id')::uuid;
  n=public.do_enquiry_followups(20,a); assert n=1,'due followup not prepared';
  n=public.do_enquiry_followups(20,a); assert n=0,'duplicate followup prepared';
  select to_jsonb(t) into child from public.do_enquiry_jobs t where parent_id=(j->>'id')::uuid;
  assert child->>'status'='pending' and child->>'approved_at' is null,'followup inherited approval';
  j=public.do_enquiry_transition(a,(j->>'id')::uuid,'answered','{"source":"test","evidence":"Fictional reply reference"}');
  assert (select status from public.do_enquiry_jobs where id=(child->>'id')::uuid)='cancelled','reply did not close pending followup';
  original=public.do_enquiry_transition(a,(j->>'id')::uuid,'answered','{"source":"test","evidence":"Duplicate reply event"}');
  assert original->'evidence'=j->'evidence','duplicate outcome inflated evidence';
  j=public.do_enquiry_transition(a,(j->>'id')::uuid,'booked','{"source":"test","evidence":"Fictional booking reference"}');
  assert j->>'booked_at' is not null,'booking not recorded';
  other=public.do_enquiry_receive(b,'test:other','other-hash','{"name":"Rangi","email":"rangi@example.invalid","message":"Help","subject":"Enquiry","body":"Thanks","source":"test"}');
  assert not has_function_privilege('authenticated','public.do_enquiry_transition(uuid,uuid,text,jsonb)','execute'),'browser role can self-approve via RPC';
  assert not has_table_privilege('authenticated','public.do_enquiry_jobs','update'),'browser role can mutate approval';
  assert not has_table_privilege('anon','public.do_enquiry_jobs','select'),'anonymous role can read jobs';
  assert not has_table_privilege('authenticated','public.do_enquiry_connections','select'),'browser role can read connection hashes';
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-12aa-4aaa-8aaa-aaaaaaaaaaaa',true);
do $$ begin
  assert (select count(*) from public.do_enquiry_jobs)=2,'owner RLS isolation failed';
  assert not exists(select 1 from public.do_enquiry_jobs where owner_id<>'11111111-12aa-4aaa-8aaa-aaaaaaaaaaaa'::uuid),'foreign data visible';
end $$;
reset role;
select 'PASS: idempotency, ownership, stale/duplicate approval, receipts, follow-ups, outcome dedupe, RLS and grants; all fixtures rolled back' as result;
rollback;
