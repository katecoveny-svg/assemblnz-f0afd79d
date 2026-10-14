-- DISPOSABLE ONLY after existing corrected storage candidate; no production use.
-- Reproduce observed ACL+RLS dependency, not the permissive original bootstrap.
revoke all on auth.users from service_role,anon,authenticated;
revoke select(id,is_anonymous) on auth.users from service_role,anon,authenticated;
alter table auth.users enable row level security;
-- Match the inspected production auth.uid() claim precedence, not old sub-only helper.
create or replace function auth.uid() returns uuid language sql stable as $$
 select coalesce(nullif(current_setting('request.jwt.claim.sub',true),''),
 (nullif(current_setting('request.jwt.claims',true),'')::jsonb ->> 'sub'))::uuid
$$;
begin;
insert into auth.users(id,is_anonymous) values('ffffffff-ffff-4fff-8fff-ffffffffffff',false);
delete from public.do_personal_storage_enrolment;
insert into public.do_personal_storage_enrolment(owner_id,enabled,retention_reviewed,expires_at,purpose) values('ffffffff-ffff-4fff-8fff-ffffffffffff',true,true,clock_timestamp()+interval '1 day','owner_entered_responsibility_review');
update public.do_personal_storage_maintenance set status='completed',last_completed_at=clock_timestamp(),last_attempt_at=clock_timestamp() where id=true;
set local role service_role;
do $$ declare returned_state text; returned_message text; begin
 if has_column_privilege('service_role','auth.users','id','SELECT') or has_column_privilege('service_role','auth.users','is_anonymous','SELECT') then raise exception 'fixture_still_has_auth_read'; end if;
 if not has_function_privilege('service_role','public.do_personal_storage_ready(uuid)','EXECUTE') or not has_schema_privilege('service_role','auth','USAGE') or not has_table_privilege('service_role','public.do_personal_storage_enrolment','SELECT') or not has_table_privilege('service_role','public.do_personal_storage_maintenance','SELECT') or not has_table_privilege('service_role','public.do_personal_responsibilities','SELECT') then raise exception 'negative_other_dependency_missing'; end if;
 begin perform public.do_personal_storage_ready('ffffffff-ffff-4fff-8fff-ffffffffffff'); raise exception 'original_auth_dependency_unexpectedly_passed';
 exception when insufficient_privilege then
  get stacked diagnostics returned_state=returned_sqlstate,returned_message=message_text;
  if returned_state<>'42501' or returned_message<>'permission denied for table users' then raise exception 'negative_wrong_permission_error: % %',returned_state,returned_message; end if;
  raise notice 'EXPECTED_AUTH_SELECT_DENIAL_42501_users';
 end;
end $$;
reset role;
rollback;
