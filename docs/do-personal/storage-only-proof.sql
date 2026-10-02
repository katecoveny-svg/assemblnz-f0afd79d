-- Run ONLY in disposable PostgreSQL with synthetic auth.users fixtures and existing
-- responsibility migration + storage-only-proposal installed. Not production SQL.
begin;
update public.do_personal_storage_maintenance set status='completed',last_completed_at=clock_timestamp(),last_attempt_at=clock_timestamp() where id=true;
insert into auth.users(id,is_anonymous) values
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',false),('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',false);
insert into public.do_personal_storage_enrolment(owner_id,enabled,expires_at,retention_reviewed,purpose)
values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true,clock_timestamp()+interval '1 day',true,'owner_entered_responsibility_review');
do $$ declare a uuid:='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'; b uuid:='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'; t uuid; foreign_task uuid; r public.do_personal_responsibilities; begin
 t:=public.do_personal_save_paused(a,gen_random_uuid(),'Synthetic task','Review synthetic notes','Fictional only','Pacific/Auckland',7,0);
 select * into r from public.do_personal_responsibilities where id=t and owner_id=a;
 if public.do_personal_save_paused(a,t,'Synthetic task','Review synthetic notes','Fictional only','Pacific/Auckland',7,0)<>t then raise exception 'idempotent_create_failed'; end if;
 if (select revision from public.do_personal_responsibilities where id=t)<>1 or (select storage_body_expires_at from public.do_personal_responsibilities where id=t)<>r.storage_body_expires_at then raise exception 'retry_renewed_or_revised'; end if;
 if r.active or r.consent_until<>'-infinity'::timestamptz or r.next_run_at<>'infinity'::timestamptz or r.revision<>1 then raise exception 'paused_save_failed'; end if;
 if exists(select 1 from public.do_personal_claim(a,t)) then raise exception 'paused_was_claimed'; end if;
 perform public.do_personal_save_paused(a,t,'Edited task','Review synthetic notes','Edited fictional only','Pacific/Auckland',7,1);
 begin perform public.do_personal_save_paused(a,t,'Stale task','Review synthetic notes','Stale fictional only','Pacific/Auckland',7,1); raise exception 'stale_was_saved'; exception when others then if sqlerrm<>'responsibility_conflict' then raise; end if; end;
 begin perform public.do_personal_save_paused(b,t,'Foreign task','Review synthetic notes','Foreign fictional only','Pacific/Auckland',7,2); raise exception 'foreign_was_saved'; exception when others then if sqlerrm<>'storage_unavailable' then raise; end if; end;
 foreign_task:=public.do_personal_save(b,null,'Foreign task','Review fictional notes','Synthetic foreign notes','Pacific/Auckland',7);
 begin perform public.do_personal_save_paused(a,foreign_task,'Foreign overwrite','Review synthetic notes','Foreign fictional only','Pacific/Auckland',7,1); raise exception 'enrolled_foreign_was_saved'; exception when others then if sqlerrm<>'responsibility_conflict' then raise; end if; end;
 -- Synthetic legacy active job: an edit must revoke its lease and cancel output.
 update public.do_personal_responsibilities set active=true,consent_until=clock_timestamp()+interval '1 day' where id=t;
 insert into public.do_personal_runs(responsibility_id,owner_id,revision,status) values(t,a,2,'running');
 perform public.do_personal_save_paused(a,t,'Revoked task','Review synthetic notes','Revoked fictional only','Pacific/Auckland',7,2);
 if exists(select 1 from public.do_personal_runs where responsibility_id=t and status='running') then raise exception 'revocation_failed'; end if;
 if exists(select 1 from public.do_personal_responsibilities where id=t and (active or consent_until>clock_timestamp())) then raise exception 'lease_remains'; end if;
 update public.do_personal_responsibilities set storage_body_expires_at=clock_timestamp()-interval '1 second' where id=t;
 if public.do_personal_storage_expire_batch(100)<>1 then raise exception 'pilot_cleanup_failed'; end if;
 begin perform public.do_personal_save_paused(a,t,'Synthetic task','Review synthetic notes','Fictional only','Pacific/Auckland',7,0); raise exception 'expired_request_resurrected'; exception when others then if sqlerrm<>'responsibility_conflict' then raise; end if; end;
 if not exists(select 1 from public.do_personal_responsibilities where id=foreign_task and storage_body_expires_at is null) then raise exception 'legacy_deleted'; end if;
 update public.do_personal_storage_enrolment set enabled=false where owner_id=a;
 begin perform public.do_personal_save_paused(a,t,'Disabled task','Review synthetic notes','Disabled fictional only','Pacific/Auckland',7,3); raise exception 'disabled_was_saved'; exception when others then if sqlerrm<>'storage_unavailable' then raise; end if; end;
end $$;
rollback;
