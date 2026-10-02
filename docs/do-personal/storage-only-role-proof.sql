-- DISPOSABLE DB ONLY. Fixtures must be synthetic, and baseline/proposal installed.
-- This exercises actual roles rather than merely checking a SQL string.
begin;
update public.do_personal_storage_maintenance set status='completed',last_completed_at=clock_timestamp(),last_attempt_at=clock_timestamp() where id=true;
insert into auth.users(id,is_anonymous) values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',false),('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',false);
insert into public.do_personal_storage_enrolment(owner_id,enabled,expires_at,retention_reviewed,purpose)
values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true,clock_timestamp()+interval '1 day',true,'owner_entered_responsibility_review');
set local role anon;
do $$begin
 begin perform public.do_personal_save_paused('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',gen_random_uuid(),'Denied synthetic task','Review fictional notes','Synthetic notes','Pacific/Auckland',7,0); raise exception 'caller_save_allowed'; exception when insufficient_privilege then null; end;
 begin perform public.do_personal_storage_expire_batch(100); raise exception 'caller_cleanup_allowed'; exception when insufficient_privilege then null; end;
 begin update public.do_personal_responsibilities set notes='Forbidden synthetic overwrite'; raise exception 'caller_direct_write_allowed'; exception when insufficient_privilege then null; end;
 begin perform public.do_personal_storage_ready('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'); raise exception 'anon_rpc_allowed'; exception when insufficient_privilege then null; end;
 begin perform 1 from public.do_personal_responsibilities; raise exception 'anon_read_allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
select set_config('request.jwt.claims','{"is_anonymous":false}',true);
do $$begin
 begin perform public.do_personal_save_paused('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',gen_random_uuid(),'Denied synthetic task','Review fictional notes','Synthetic notes','Pacific/Auckland',7,0); raise exception 'caller_save_allowed'; exception when insufficient_privilege then null; end;
 begin perform public.do_personal_storage_expire_batch(100); raise exception 'caller_cleanup_allowed'; exception when insufficient_privilege then null; end;
 begin update public.do_personal_responsibilities set notes='Forbidden synthetic overwrite'; raise exception 'caller_direct_write_allowed'; exception when insufficient_privilege then null; end;
 begin perform public.do_personal_storage_ready('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'); raise exception 'authenticated_rpc_allowed'; exception when insufficient_privilege then null; end;
 begin insert into public.do_personal_storage_enrolment(owner_id,expires_at,purpose) values('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',clock_timestamp()+interval '1 day','owner_entered_responsibility_review'); raise exception 'authenticated_enrolment_allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role service_role;
select public.do_personal_save_paused('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',gen_random_uuid(),'Synthetic role task','Review fictional notes','Synthetic notes','Pacific/Auckland',7,0);
reset role;
set local role authenticated;
do $$begin if (select count(*) from public.do_personal_responsibilities)<>1 then raise exception 'own_read_failed'; end if; end $$;
select set_config('request.jwt.claims','{"is_anonymous":true}',true);
do $$begin if exists(select 1 from public.do_personal_responsibilities) then raise exception 'anonymous_authenticated_read_allowed'; end if; end $$;
select set_config('request.jwt.claims','{"is_anonymous":false}',true);
select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',true);
do $$begin if exists(select 1 from public.do_personal_responsibilities) then raise exception 'foreign_read_allowed'; end if; end $$;
reset role;
set local role service_role;
update public.do_personal_responsibilities set storage_body_expires_at=clock_timestamp()-interval '1 second' where owner_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
do $$begin if exists(select 1 from public.do_personal_responsibilities) then raise exception 'expired_read_allowed'; end if; end $$;
reset role;
set local role service_role;
select public.do_personal_storage_expire_batch(100);
reset role;
rollback;
