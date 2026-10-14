-- Executed on assembl-prod on 15 October 2026 NZDT; PASS.
-- Synthetic identifiers only. Entire transaction rolls back. No provider calls.
begin;
insert into auth.users(id) values('ad92469d-cdad-4c6f-8b1d-9dad719e3a28'),('c92af137-7b39-4766-8257-985579408de6');
set local role authenticated;
do $test$
declare owners uuid[] := array['ad92469d-cdad-4c6f-8b1d-9dad719e3a28','c92af137-7b39-4766-8257-985579408de6']::uuid[];
workspaces uuid[] := array['558db262-4866-4253-b6bc-0114f8f029ea','751c4c35-b911-49d5-9ec6-c67b72032cf2']::uuid[];
jobs uuid[] := array['1144c2b9-70c2-4ec3-b300-67a739057d8a','901f26ee-963d-4ffd-bd92-06794e0f8df9']::uuid[];
receipts uuid[] := array['18301659-8e03-47cc-a1bb-d572789f95ea','fc1e8275-5eff-41c0-9eba-25e28d5fd84a']::uuid[];
i integer; t text; n integer;
begin
for i in 1..2 loop
 perform set_config('request.jwt.claim.sub',owners[i]::text,true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub',owners[i],'role','authenticated')::text,true);
 if auth.uid() is distinct from owners[i] then raise exception 'auth owner mismatch'; end if;
 insert into public.do_workspaces(id,owner_id,name) values(workspaces[i],owners[i],'Rollback-only Office acceptance');
 insert into public.do_agents(id,owner_id,workspace_id,name,primitive,spec) values(jobs[i],owners[i],workspaces[i],'Synthetic writing check','prepare','{"synthetic":true}');
 insert into public.do_receipts(id,owner_id,workspace_id,do_agent_id,title,summary,kind) values(receipts[i],owners[i],workspaces[i],jobs[i],'Synthetic receipt','Initial saved summary','note');
 insert into public.do_job_events(owner_id,workspace_id,do_agent_id,event_id,kind,detail) values(owners[i],workspaces[i],jobs[i],jobs[i]::text,'synthetic_saved','{"synthetic":true}');
 update public.do_agents set status='done' where id=jobs[i];
 update public.do_receipts set summary='Reloaded synthetic result' where id=receipts[i];
end loop;
for i in 1..2 loop
 perform set_config('request.jwt.claim.sub',owners[i]::text,true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub',owners[i],'role','authenticated')::text,true);
 foreach t in array array['do_workspaces','do_agents','do_receipts','do_job_events'] loop
 execute format('select count(*) from public.%I where owner_id = any($1)',t) into n using owners;
 if n <> 1 then raise exception 'owner % table % isolation count %',i,t,n; end if;
 execute format('update public.%I set owner_id=owner_id where owner_id=$1',t) using owners[3-i];
 get diagnostics n=row_count;
 if n<>0 then raise exception 'cross-owner update visible'; end if;
 end loop;
 if (select status from public.do_agents where id=jobs[i]) <> 'done' then raise exception 'job reload failed'; end if;
 if (select summary from public.do_receipts where id=receipts[i]) <> 'Reloaded synthetic result' then raise exception 'receipt reload failed'; end if;
 begin
 insert into public.do_workspaces(owner_id,name) values(owners[3-i],'Forbidden');
 raise exception 'foreign owner workspace accepted';
 exception when insufficient_privilege then null; end;
 begin
 insert into public.do_agents(owner_id,workspace_id,name,primitive) values(owners[i],workspaces[3-i],'Forbidden','prepare');
 raise exception 'foreign workspace accepted';
 exception when insufficient_privilege then null; end;
 begin
 insert into public.do_receipts(owner_id,workspace_id,do_agent_id,title) values(owners[i],workspaces[i],jobs[3-i],'Forbidden');
 raise exception 'foreign agent receipt accepted';
 exception when insufficient_privilege then null; end;
 begin
 insert into public.do_job_events(owner_id,workspace_id,do_agent_id,event_id,kind) values(owners[i],workspaces[i],jobs[3-i],gen_random_uuid()::text,'forbidden');
 raise exception 'foreign agent event accepted';
 exception when insufficient_privilege then null; end;
 begin
 update public.do_agents set owner_id=owners[3-i] where id=jobs[i];
 raise exception 'ownership reassignment accepted';
 exception when insufficient_privilege then null; end;
end loop;
end $test$;
reset role;
rollback;
select 'PASS: two-owner authenticated writes, updated rereads, four-table read/update isolation, forged ownership/workspace/agent rejection; all fixtures rolled back' as result;
