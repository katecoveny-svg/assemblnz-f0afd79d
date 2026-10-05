-- DISPOSABLE ONLY. No real authenticator, JWT, credentials or user records.
-- Session principal differs from postgres, so helper's admin fallback cannot pass.
begin;
create role do_proof_authenticator nologin noinherit;
grant service_role to do_proof_authenticator;
insert into auth.users(id,is_anonymous) values('ffffffff-ffff-4fff-8fff-ffffffffffff',false),('22222222-2222-4222-8222-222222222222',false);
delete from public.do_personal_storage_enrolment;
insert into public.do_personal_storage_enrolment(owner_id,enabled,retention_reviewed,expires_at,purpose) values('ffffffff-ffff-4fff-8fff-ffffffffffff',true,true,clock_timestamp()+interval '1 day','owner_entered_responsibility_review');
update public.do_personal_storage_maintenance set status='completed',last_completed_at=clock_timestamp(),last_attempt_at=clock_timestamp() where id=true;
set session authorization do_proof_authenticator;
set role service_role;
select set_config('request.jwt.claim.sub','',true);
select set_config('request.jwt.claims','{"role":"service_role","iss":"supabase"}',true);
do $$
declare t uuid:='44444444-4444-4444-8444-444444444444'; old_expiry timestamptz;
begin
 if session_user<>'do_proof_authenticator' or session_user='postgres' or current_user<>'service_role' or current_setting('role')<>'service_role' then raise exception 'hosted_principal_not_proven'; end if;
 if auth.uid() is not null then raise exception 'service_claim_without_sub_not_null'; end if;
 if has_column_privilege('service_role','auth.users','id','SELECT') or has_column_privilege('service_role','auth.users','is_anonymous','SELECT') then raise exception 'hosted_direct_auth_read_expanded'; end if;
 if not public.do_personal_storage_ready('ffffffff-ffff-4fff-8fff-ffffffffffff') then raise exception 'hosted_readiness_failed'; end if;
 if public.do_personal_save_paused('ffffffff-ffff-4fff-8fff-ffffffffffff',t,'Hosted synthetic task','Review fictional hosted notes','Fictional hosted notes','Pacific/Auckland',7,0)<>t then raise exception 'hosted_create_failed'; end if;
 select storage_body_expires_at into old_expiry from public.do_personal_responsibilities where id=t;
 if public.do_personal_save_paused('ffffffff-ffff-4fff-8fff-ffffffffffff',t,'Hosted synthetic task','Review fictional hosted notes','Fictional hosted notes','Pacific/Auckland',7,0)<>t then raise exception 'hosted_retry_failed'; end if;
 if not exists(select 1 from public.do_personal_responsibilities where id=t and revision=1 and not active and storage_body_expires_at=old_expiry) then raise exception 'hosted_retry_mutated'; end if;
 perform public.do_personal_save_paused('ffffffff-ffff-4fff-8fff-ffffffffffff',t,'Hosted edited task','Review fictional hosted notes','Fictional hosted edit','Pacific/Auckland',7,1);
 perform public.do_personal_save_paused('ffffffff-ffff-4fff-8fff-ffffffffffff',t,'Hosted edited task','Review fictional hosted notes','Fictional hosted edit','Pacific/Auckland',7,1);
 if not exists(select 1 from public.do_personal_responsibilities where id=t and revision=2 and not active) then raise exception 'hosted_edit_replay_mutated'; end if;
 begin perform public.do_personal_save_paused('ffffffff-ffff-4fff-8fff-ffffffffffff',t,'Hosted stale task','Review fictional hosted notes','Fictional stale edit','Pacific/Auckland',7,1); raise exception 'hosted_stale_cas_allowed'; exception when others then if sqlerrm<>'responsibility_conflict' then raise; end if; end;
 begin perform public.do_personal_save_paused('22222222-2222-4222-8222-222222222222',t,'Hosted foreign task','Review fictional hosted notes','Fictional foreign edit','Pacific/Auckland',7,2); raise exception 'hosted_foreign_allowed'; exception when others then if sqlerrm<>'storage_unavailable' then raise; end if; end;
end $$;
-- Production auth.uid supports JSON claims sub and the separate claim.sub setting.
select set_config('request.jwt.claims','{"role":"service_role","sub":"ffffffff-ffff-4fff-8fff-ffffffffffff"}',true);
do $$ begin if auth.uid()<>'ffffffff-ffff-4fff-8fff-ffffffffffff'::uuid or not public.do_personal_storage_ready('ffffffff-ffff-4fff-8fff-ffffffffffff') then raise exception 'hosted_json_uid_failed'; end if; end $$;
select set_config('request.jwt.claims','{"role":"service_role","sub":"22222222-2222-4222-8222-222222222222"}',true);
do $$ begin if public.do_personal_storage_ready('ffffffff-ffff-4fff-8fff-ffffffffffff') then raise exception 'hosted_json_uid_mismatch_allowed'; end if; end $$;
select set_config('request.jwt.claim.sub','ffffffff-ffff-4fff-8fff-ffffffffffff',true);
do $$ begin if auth.uid()<>'ffffffff-ffff-4fff-8fff-ffffffffffff'::uuid or not public.do_personal_storage_ready('ffffffff-ffff-4fff-8fff-ffffffffffff') then raise exception 'hosted_separate_sub_precedence_failed'; end if; end $$;
reset role;
reset session authorization;
rollback;
