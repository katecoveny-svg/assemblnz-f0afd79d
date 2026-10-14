-- Fictional identity emulation; not a real authenticated phone/desktop test.
\set ON_ERROR_STOP on
do $$ begin
  if has_function_privilege('anon','public.do_continuity_read(text,uuid)','execute')
    or has_function_privilege('authenticated','public.do_continuity_mutate(jsonb)','execute')
    or has_table_privilege('authenticated','do_continuity_private.tasks','select')
    or has_schema_privilege('service_role','do_continuity_private','usage')
    or has_table_privilege('service_role','do_continuity_private.tasks','select')
    or has_function_privilege('service_role','public.do_continuity_read(text,uuid)','execute')
    or has_function_privilege('service_role','public.do_continuity_mutate(jsonb)','execute')
    or has_function_privilege('service_role','do_continuity_private.prune()','execute')
    or has_function_privilege('service_role','do_continuity_private.visible(do_continuity_private.tasks,timestamptz)','execute')
    or has_table_privilege('authenticated','do_continuity_private.owner_access','insert')
    or has_table_privilege('service_role','do_continuity_private.owner_access','select')
    or has_function_privilege('authenticated','do_continuity_private.owner_enabled(uuid,text)','execute')
    or has_function_privilege('service_role','do_continuity_private.utf16_length(text)','execute')
    then raise exception 'proposal must be closed before explicit grants'; end if;
end $$;
set role service_role;
do $$ begin
  begin perform public.do_continuity_read('personal'); raise exception 'unexpected service RPC access'; exception when insufficient_privilege then null; end;
  begin perform * from do_continuity_private.tasks; raise exception 'unexpected service table access'; exception when insufficient_privilege then null; end;
end $$;
reset role;
-- Isolated-test-only enablement. No equivalent production grants in the proposal.
grant execute on function public.do_continuity_read(text,uuid), public.do_continuity_mutate(jsonb) to authenticated;

do $$ begin
  if (select count(*) from do_continuity_private.owner_access)<>0 then raise exception 'proposal enabled an owner'; end if;
  if do_continuity_private.utf16_length('🟣')<>2 or do_continuity_private.utf16_length('a🟣')<>3 then raise exception 'UTF16 count mismatch'; end if;
end $$;
set role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',false);
select set_config('request.jwt.claims','{"is_anonymous":false}',false);
do $$ begin
  begin perform public.do_continuity_read('personal'); raise exception 'RPC grant enrolled an owner';
    exception when others then if sqlerrm <> 'continuity_storage_unavailable' then raise; end if; end;
  begin perform public.do_continuity_mutate('{"action":"save","id":"10000000-0000-4000-8000-000000000001","scope":"personal","request":"Fictional gated task","context":[],"consent":true,"consentVersion":"do-continuity-v1"}'); raise exception 'unenabled save';
    exception when others then if sqlerrm <> 'continuity_storage_unavailable' then raise; end if; end;
  begin update do_continuity_private.owner_access set enabled=true; raise exception 'owner self-enrolled'; exception when insufficient_privilege then null; end;
end $$;
reset role;
-- Explicit fictional test enrolment, never part of the proposal.
insert into do_continuity_private.owner_access(owner_id,scope,enabled,expires_at)
  select id,s,true,clock_timestamp()+interval '1 day' from auth.users cross join (values ('personal'),('work')) scopes(s);

set role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',false);
select set_config('request.jwt.claims','{"is_anonymous":false}',false);
do $$ declare first jsonb; replay jsonb; changed jsonb;
  payload jsonb := '{"action":"save","id":"10000000-0000-4000-8000-000000000001","scope":"personal","request":"Prepare the fictional picnic follow-up.","context":[{"id":"20000000-0000-4000-8000-000000000001","label":"Selected note","text":"Pickup is unconfirmed.","source":"user_selected"}],"consent":true,"consentVersion":"do-continuity-v1"}';
begin
  first := public.do_continuity_mutate(payload);
  replay := public.do_continuity_mutate(payload);
  if first <> replay or first->>'status' <> 'waiting' or jsonb_array_length(public.do_continuity_read('personal')) <> 1 then raise exception 'save/retry mismatch'; end if;
  begin perform public.do_continuity_mutate(payload || '{"ownerId":"other"}'); raise exception 'unexpected authority';
    exception when others then if sqlerrm <> 'continuity_conflict' then raise; end if; end;
  begin perform public.do_continuity_mutate(payload || '{"request":"Changed request must not overwrite original"}'); raise exception 'unexpected changed replay';
    exception when others then if sqlerrm <> 'continuity_id_reused' then raise; end if; end;
  begin perform public.do_continuity_mutate(payload || '{"id":"10000000-0000-4000-8000-000000000008","context":[{"id":123,"label":"note","text":"test","source":"user_selected"}]}'); raise exception 'unexpected numeric context ID';
    exception when others then if sqlerrm <> 'continuity_conflict' then raise; end if; end;
  changed := public.do_continuity_mutate('{"action":"prepare","id":"10000000-0000-4000-8000-000000000001","scope":"personal","expectedRevision":1}');
  if changed->>'status' <> 'needs_review' or changed->>'revision' <> '2' or changed->>'result' not like '%no model called%' then raise exception 'prepare mismatch'; end if;
  replay := public.do_continuity_mutate('{"action":"prepare","id":"10000000-0000-4000-8000-000000000001","scope":"personal","expectedRevision":2}');
  if replay <> changed then raise exception 'preparation replay changed'; end if;
  begin perform public.do_continuity_mutate('{"action":"edit","id":"10000000-0000-4000-8000-000000000001","scope":"personal","expectedRevision":1,"result":"stale"}'); raise exception 'unexpected stale edit';
    exception when others then if sqlerrm <> 'continuity_conflict' then raise; end if; end;
  perform public.do_continuity_mutate('{"action":"edit","id":"10000000-0000-4000-8000-000000000001","scope":"personal","expectedRevision":2,"result":"Reviewed fictional follow-up"}');
  if public.do_continuity_read('work','10000000-0000-4000-8000-000000000001') <> '[]'::jsonb then raise exception 'scope leak'; end if;
  begin perform public.do_continuity_mutate('{"action":"revoke","id":"10000000-0000-4000-8000-000000000001","scope":"work","expectedRevision":3}'); raise exception 'unexpected scope mutation';
    exception when others then if sqlerrm <> 'continuity_not_found' then raise; end if; end;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',false);
do $$ begin
  if public.do_continuity_read('personal','10000000-0000-4000-8000-000000000001') <> '[]'::jsonb then raise exception 'owner leak'; end if;
  begin perform public.do_continuity_mutate('{"action":"cancel","id":"10000000-0000-4000-8000-000000000001","scope":"personal","expectedRevision":3}'); raise exception 'unexpected other-owner mutation';
    exception when others then if sqlerrm <> 'continuity_not_found' then raise; end if; end;
end $$;
select set_config('request.jwt.claims','{"is_anonymous":true}',false);
do $$ begin
  begin perform public.do_continuity_read('personal'); raise exception 'unexpected anonymous read';
    exception when others then if sqlerrm <> 'continuity_not_found' then raise; end if; end;
end $$;
reset role;
update do_continuity_private.tasks set consent_until=now()-interval '1 second';
set role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',false);
select set_config('request.jwt.claims','{"is_anonymous":false}',false);
do $$ declare t jsonb; begin
  t := public.do_continuity_read('personal','10000000-0000-4000-8000-000000000001')->0;
  if t is null or t->>'status' <> 'expired' or t->'context' <> '[]'::jsonb or t->'result' <> 'null'::jsonb then raise exception 'expiry leak'; end if;
  begin perform public.do_continuity_mutate('{"action":"prepare","id":"10000000-0000-4000-8000-000000000001","scope":"personal","expectedRevision":3}'); raise exception 'unexpected expired preparation';
    exception when others then if sqlerrm <> 'continuity_permission_expired' then raise; end if; end;
  t := public.do_continuity_mutate('{"action":"revoke","id":"10000000-0000-4000-8000-000000000001","scope":"personal","expectedRevision":3}');
  if t->>'status'<>'revoked' or t->'context'<>'[]'::jsonb or t->'result'<>'null'::jsonb then raise exception 'revocation mismatch'; end if;
  begin perform public.do_continuity_mutate('{"action":"prepare","id":"10000000-0000-4000-8000-000000000001","scope":"personal","expectedRevision":4}'); raise exception 'unexpected stopped preparation';
    exception when others then if sqlerrm <> 'continuity_stopped' then raise; end if; end;
end $$;
reset role;
update do_continuity_private.tasks set expires_at=now()-interval '1 second';
set role authenticated;
do $$ declare t jsonb; begin
  t := public.do_continuity_read('personal','10000000-0000-4000-8000-000000000001')->0;
  if t is null or t->>'request'<>'' or t->>'status'<>'expired' then raise exception 'retention read leak'; end if;
  begin perform * from do_continuity_private.tasks; raise exception 'unexpected direct read';
    exception when insufficient_privilege then null; end;
end $$;
reset role;
select 'portable SQL owner/scope/CAS/idempotency/expiry/revocation checks passed' as evidence;
