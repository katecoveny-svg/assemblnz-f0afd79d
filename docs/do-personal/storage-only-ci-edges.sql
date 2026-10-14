-- Additional synthetic CI cases. Only the coordinator's fresh disposable DB.
begin;
update public.do_personal_storage_maintenance set status='completed',last_attempt_at=clock_timestamp(),last_completed_at=clock_timestamp() where id=true;
insert into auth.users(id,is_anonymous) values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',false),('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',false),('cccccccc-cccc-4ccc-8ccc-cccccccccccc',true);
insert into public.do_personal_storage_enrolment(owner_id,enabled,expires_at,retention_reviewed,purpose)
values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true,clock_timestamp()+interval '1 day',true,'owner_entered_responsibility_review');
set local role service_role;
do $$declare a uuid:='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'; t uuid:=gen_random_uuid(); expiry timestamptz; begin
 perform public.do_personal_save_paused(a,t,'Synthetic replay','Review fictional notes','Original synthetic notes','Pacific/Auckland',7,0);
 select storage_body_expires_at into expiry from public.do_personal_responsibilities where id=t;
 if public.do_personal_save_paused(a,t,'Synthetic replay','Review fictional notes','Original synthetic notes','Pacific/Auckland',7,0)<>t then raise exception 'same_request_replay_failed'; end if;
 if (select storage_body_expires_at from public.do_personal_responsibilities where id=t)<>expiry or (select revision from public.do_personal_responsibilities where id=t)<>1 then raise exception 'replay_renewed_or_revised'; end if;
 begin perform public.do_personal_save_paused(a,t,'Synthetic replay','Review fictional notes','Differing synthetic notes','Pacific/Auckland',7,0); raise exception 'differing_request_overwrote'; exception when others then if sqlerrm<>'responsibility_conflict' then raise; end if; end;
 delete from public.do_personal_responsibilities where id=t and owner_id=a;
 begin perform public.do_personal_save_paused(a,t,'Synthetic replay','Review fictional notes','Original synthetic notes','Pacific/Auckland',7,0); raise exception 'manual_delete_replay_resurrected'; exception when others then if sqlerrm<>'responsibility_conflict' then raise; end if; end;
 if exists(select 1 from public.do_personal_responsibilities where id=t) or not exists(select 1 from public.do_personal_storage_requests where owner_id=a and request_id=t) then raise exception 'delete_identity_fence_failed'; end if;
 begin perform public.do_personal_storage_expire_batch(0); raise exception 'zero_cleanup_bound_allowed'; exception when others then if sqlerrm<>'storage_invalid_batch' then raise; end if; end;
 begin perform public.do_personal_storage_expire_batch(101); raise exception 'large_cleanup_bound_allowed'; exception when others then if sqlerrm<>'storage_invalid_batch' then raise; end if; end;
end $$;
reset role;
-- Simulate a delayed/disabled cleanup: expired body remains physically present.
-- The Node coordinator asserts both application collection and purge flags are off.
insert into public.do_personal_responsibilities(owner_id,title,goal,notes,timezone,local_hour,active,consent_until,next_run_at,storage_body_expires_at)
values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Synthetic legacy','Review fictional notes','Legacy retained','Pacific/Auckland',7,false,'-infinity','infinity',null),
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Synthetic live','Review fictional notes','Live retained','Pacific/Auckland',7,false,'-infinity','infinity',clock_timestamp()+interval '1 day'),
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Synthetic expired','Review fictional notes','Expired hidden','Pacific/Auckland',7,false,'-infinity','infinity',clock_timestamp()-interval '1 second');
update public.do_personal_storage_maintenance set status='failed' where id=true;
set local role authenticated;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
select set_config('request.jwt.claims','{"is_anonymous":false}',true);
do $$begin
 if (select count(*) from public.do_personal_responsibilities)<>2 then raise exception 'flag_off_expiry_or_legacy_visibility_failed'; end if;
 if exists(select 1 from public.do_personal_responsibilities where title='Synthetic expired') then raise exception 'expired_body_exposed_while_cleanup_failed'; end if;
 if not exists(select 1 from public.do_personal_responsibilities where title='Synthetic legacy') then raise exception 'legacy_hidden'; end if;
end $$;
reset role;
do $$begin if not exists(select 1 from public.do_personal_responsibilities where title='Synthetic expired' and notes='Expired hidden') then raise exception 'expiry_test_did_not_leave_physical_body'; end if; end $$;
set local role service_role;
select public.do_personal_storage_expire_batch(100);
reset role;
insert into public.do_personal_responsibilities(owner_id,title,goal,notes,timezone,local_hour,active,consent_until,next_run_at,storage_body_expires_at)
select 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Synthetic backlog','Review fictional notes','Fictional only','Pacific/Auckland',7,false,'-infinity','infinity',clock_timestamp()-interval '1 second' from generate_series(1,101);
set local role service_role;
do $$begin
 if public.do_personal_storage_expire_batch(100)<>100 then raise exception 'cleanup_did_not_obey_100_bound'; end if;
 if (select count(*) from public.do_personal_responsibilities where storage_body_expires_at<=clock_timestamp())<>1 then raise exception 'cleanup_backlog_count_wrong'; end if;
 if public.do_personal_storage_expire_batch(100)<>1 then raise exception 'cleanup_remaining_count_wrong'; end if;
 if not exists(select 1 from public.do_personal_responsibilities where title='Synthetic legacy') then raise exception 'cleanup_deleted_legacy'; end if;
 if not exists(select 1 from public.do_personal_responsibilities where title='Synthetic live') then raise exception 'cleanup_deleted_live'; end if;
end $$;
reset role;
rollback;
