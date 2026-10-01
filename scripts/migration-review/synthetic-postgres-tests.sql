-- Real Postgres queries under synthetic authenticated identities. No keys/network.
set role authenticated;
set request.jwt.claim.sub='11111111-1111-4111-8111-111111111111';
create temporary table first_save as select * from public.studio_save_owner_draft(null,0,'{"schemaVersion":1,"privateNotes":"OWNER_ONLY_SENTINEL"}'::jsonb);
do $$ begin
 if (select count(*) from first_save)<>1 then raise exception 'Create failed'; end if;
 if (select revision from first_save)<>1 then raise exception 'Initial revision failed'; end if;
end $$;
select * from public.studio_save_owner_draft((select id from first_save),1,'{"schemaVersion":1,"privateNotes":"OWNER_ONLY_SENTINEL","name":"Revised"}');
do $$ begin
 if (select count(*) from public.studio_save_owner_draft((select id from first_save),1,'{"schemaVersion":1}'))<>0 then raise exception 'Stale overwrite allowed'; end if;
end $$;
reset role;
insert into public.studio_recipient_snapshots(id,owner_user_id,draft_id,revision,projection)
select '44444444-4444-4444-8444-444444444444',d.owner_user_id,d.id,d.revision,'{"title":"Reviewed synthetic concept","mediaIds":["66666666-6666-4666-8666-666666666666"]}' from first_save f join public.studio_owner_drafts d using(id);
insert into public.studio_recipient_grants values('55555555-5555-4555-8555-555555555555','11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','44444444-4444-4444-8444-444444444444',2,'active',now()+interval '1 hour',now());
insert into public.studio_snapshot_media values('44444444-4444-4444-8444-444444444444','66666666-6666-4666-8666-666666666666','11111111-1111-4111-8111-111111111111','synthetic/selected.png');
insert into storage.objects values('66666666-6666-4666-8666-666666666666','studio-private','synthetic/selected.png'),('77777777-7777-4777-8777-777777777777','studio-private','synthetic/unselected.png');
set role authenticated;
set request.jwt.claim.sub='22222222-2222-4222-8222-222222222222';
do $$ begin
 if (select count(*) from public.studio_owner_drafts)<>0 then raise exception 'Recipient sees owner draft'; end if;
 if (select count(*) from public.studio_recipient_snapshots)<>1 then raise exception 'Recipient projection denied'; end if;
 if exists(select 1 from public.studio_recipient_snapshots where projection::text like '%OWNER_ONLY_SENTINEL%') then raise exception 'Private data leaked'; end if;
 if (select count(*) from storage.objects)<>1 then raise exception 'Media membership broken'; end if;
 if (select count(*) from public.studio_save_owner_draft((select id from first_save),2,'{"schemaVersion":1}'))<>0 then raise exception 'Cross-owner overwrite'; end if;
 begin update public.studio_recipient_grants set recipient_user_id='33333333-3333-4333-8333-333333333333';raise exception 'Recipient can edit grant';exception when insufficient_privilege then null;end;
end $$;
set request.jwt.claim.sub='33333333-3333-4333-8333-333333333333';
do $$ begin
 if (select count(*) from public.studio_recipient_snapshots)<>0 or (select count(*) from storage.objects)<>0 or (select count(*) from public.studio_owner_drafts)<>0 then raise exception 'Wrong user access'; end if;
end $$;
reset role;
update public.studio_recipient_grants set status='revoked';
set role authenticated;
set request.jwt.claim.sub='22222222-2222-4222-8222-222222222222';
do $$ begin if (select count(*) from public.studio_recipient_snapshots)<>0 or (select count(*) from storage.objects)<>0 then raise exception 'Revocation ineffective';end if;end $$;
reset role;
update public.studio_recipient_grants set status='active',expires_at=now()-interval '1 second';
set role authenticated;
set request.jwt.claim.sub='22222222-2222-4222-8222-222222222222';
do $$ begin if (select count(*) from public.studio_recipient_snapshots)<>0 or (select count(*) from storage.objects)<>0 then raise exception 'Expiry ineffective';end if;end $$;
set request.jwt.claim.sub='11111111-1111-4111-8111-111111111111';
set request.jwt.claims='{"is_anonymous":true}';
do $$ begin if (select count(*) from public.studio_owner_drafts)<>0 then raise exception 'Anonymous owner access';end if;end $$;
reset role;
set role anon;
do $$ begin
 begin perform * from public.studio_owner_drafts;raise exception 'Anon sees draft';exception when insufficient_privilege then null;end;
 begin perform * from public.studio_recipient_snapshots;raise exception 'Anon sees snapshot';exception when insufficient_privilege then null;end;
end $$;
reset role;
select 'PASS: create/reopen/revision/conflict/owner/recipient/private-data/media/wrong-user/revocation/expiry/anonymous/immutable-grants' as result;
