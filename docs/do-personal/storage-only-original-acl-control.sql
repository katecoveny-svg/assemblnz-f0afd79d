-- REVIEW/TEST ONLY. Do not apply automatically or replay migration backlog.
-- New pilot rows alone get body expiry. Existing rows remain NULL and are never
-- swept by this cleanup. These policy changes are proposal-only approval items.
alter table public.do_personal_responsibilities add column storage_body_expires_at timestamptz;
create index do_personal_storage_expiry on public.do_personal_responsibilities(storage_body_expires_at) where storage_body_expires_at is not null;
drop policy personal_context_owner on public.do_personal_responsibilities;
create policy personal_context_owner on public.do_personal_responsibilities for select to authenticated
 using ((select auth.uid())=owner_id and coalesce((select auth.jwt()->>'is_anonymous'),'false')='false'
 and (storage_body_expires_at is null or storage_body_expires_at>clock_timestamp()));
-- No account IDs are seeded. Retention/cleanup approval precedes enabling any row.
create table public.do_personal_storage_enrolment (
 owner_id uuid primary key references auth.users(id) on delete cascade,
 enabled boolean not null default false,
 enrolled_at timestamptz not null default clock_timestamp(),
 expires_at timestamptz not null,
 check(expires_at>enrolled_at and expires_at<=enrolled_at+interval '7 days'),
 retention_reviewed boolean not null default false,
 purpose text not null check(purpose='owner_entered_responsibility_review'),
 singleton boolean not null default true unique check(singleton)
);
alter table public.do_personal_storage_enrolment enable row level security;
revoke all on public.do_personal_storage_enrolment from public,anon,authenticated;
grant select,insert,update,delete on public.do_personal_storage_enrolment to service_role;
create table public.do_personal_storage_maintenance (
 id boolean primary key default true check(id),last_attempt_at timestamptz,last_completed_at timestamptz,
 status text check(status in ('completed','backlog','deadline','failed')),purged integer not null default 0 check(purged between 0 and 300)
);
alter table public.do_personal_storage_maintenance enable row level security;
revoke all on public.do_personal_storage_maintenance from public,anon,authenticated;
grant select,insert,update on public.do_personal_storage_maintenance to service_role;
insert into public.do_personal_storage_maintenance(id) values(true);

-- Bounded content-free create identities survive deletion/expiry and prevent delayed
-- retry from resurrecting a deleted task. Cap 30 per enrolled owner until account deletion.
create table public.do_personal_storage_requests (
 owner_id uuid not null references auth.users(id) on delete cascade,
 request_id uuid not null,created_at timestamptz not null default clock_timestamp(),
 primary key(owner_id,request_id)
);
alter table public.do_personal_storage_requests enable row level security;
revoke all on public.do_personal_storage_requests from public,anon,authenticated;
grant select,insert on public.do_personal_storage_requests to service_role;
create function public.do_personal_storage_ready(p_owner uuid) returns boolean
language sql security invoker set search_path='' as $$
 select exists(select 1 from public.do_personal_storage_enrolment e join auth.users u on u.id=e.owner_id
 where e.owner_id=p_owner and e.enabled and e.retention_reviewed and e.expires_at>clock_timestamp() and not u.is_anonymous
 and exists(select 1 from public.do_personal_storage_maintenance m where m.id=true and m.status='completed'
 and m.last_completed_at<=clock_timestamp() and m.last_completed_at>clock_timestamp()-interval '90 minutes')
 and not exists(select 1 from public.do_personal_responsibilities where storage_body_expires_at<=clock_timestamp()))
$$;
create function public.do_personal_save_paused(p_owner uuid,p_id uuid,p_title text,p_goal text,p_notes text,p_timezone text,p_hour integer,p_expected_revision integer)
returns uuid language plpgsql security invoker set search_path='' set statement_timeout='5s' set lock_timeout='2s' as $$
declare v_id uuid; v_current integer; v_expiry timestamptz; v_row public.do_personal_responsibilities;
begin
 -- Same lock as legacy save/claim; serialises limits and revisions across callers.
 perform pg_advisory_xact_lock(3026,1);
 perform 1 from public.do_personal_storage_enrolment where owner_id=p_owner for update;
 if not public.do_personal_storage_ready(p_owner) then raise exception 'storage_unavailable'; end if;
 if p_id is null or p_expected_revision is null or p_expected_revision<0 or p_expected_revision>=2000000000
 or p_hour is null or p_hour<0 or p_hour>23
 or p_title is null or char_length(p_title) not between 1 and 100
 or p_goal is null or char_length(p_goal) not between 10 and 1500
 or p_notes is null or char_length(p_notes) not between 1 and 10000
 or p_timezone is null or not exists(select 1 from pg_timezone_names where name=p_timezone) then raise exception 'storage_invalid'; end if;
 select * into v_row from public.do_personal_responsibilities where owner_id=p_owner and id=p_id for update;
 if found then
  -- A matching replay acknowledges the existing revision; it never renews retention,
  -- increments revision, revives work or creates another task.
  if v_row.revision=p_expected_revision+1 and not v_row.active and v_row.consent_until<=clock_timestamp()
   and (v_row.storage_body_expires_at is null or v_row.storage_body_expires_at>clock_timestamp())
   and v_row.title=p_title and v_row.goal=p_goal and v_row.notes=p_notes
   and v_row.timezone=p_timezone and v_row.local_hour=p_hour
   and (p_expected_revision>0 or exists(select 1 from public.do_personal_storage_requests where owner_id=p_owner and request_id=p_id)) then
   if not public.do_personal_storage_ready(p_owner) then raise exception 'storage_unavailable'; end if;
   return p_id;
  end if;
 end if;
 if p_expected_revision=0 then
  if v_row.id is not null or exists(select 1 from public.do_personal_storage_requests where owner_id=p_owner and request_id=p_id) then raise exception 'responsibility_conflict'; end if;
  if (select count(*) from public.do_personal_responsibilities where owner_id=p_owner)>=5 then raise exception 'responsibility_limit'; end if;
  if (select count(*) from public.do_personal_storage_requests where owner_id=p_owner)>=30 then raise exception 'storage_request_limit'; end if;
  insert into public.do_personal_storage_requests(owner_id,request_id) values(p_owner,p_id);
  insert into public.do_personal_responsibilities(id,owner_id,title,goal,notes,timezone,local_hour,active,consent_until,next_run_at,storage_body_expires_at)
  values(p_id,p_owner,p_title,p_goal,p_notes,p_timezone,p_hour,false,'-infinity','infinity',clock_timestamp()+interval '7 days') returning id into v_id;
 else
  v_current:=v_row.revision;v_expiry:=v_row.storage_body_expires_at;
  if v_current is null or v_current<>p_expected_revision or (v_expiry is not null and v_expiry<=clock_timestamp()) then raise exception 'responsibility_conflict'; end if;
  -- Editing is also revocation: invalidate old lease and any in-flight publication.
  update public.do_personal_responsibilities set title=p_title,goal=p_goal,notes=p_notes,timezone=p_timezone,local_hour=p_hour,
  storage_body_expires_at=case when storage_body_expires_at is null then null else clock_timestamp()+interval '7 days' end,
  active=false,consent_until='-infinity',next_run_at='infinity',revision=revision+1,updated_at=clock_timestamp()
  where owner_id=p_owner and id=p_id returning id into v_id;
  update public.do_personal_runs set status='cancelled',finished_at=clock_timestamp()
  where owner_id=p_owner and responsibility_id=v_id and status='running';
 end if;
 if not public.do_personal_storage_ready(p_owner) then raise exception 'storage_unavailable'; end if;
 return v_id;
end $$;
revoke all on function public.do_personal_storage_ready(uuid),public.do_personal_save_paused(uuid,uuid,text,text,text,text,integer,integer) from public,anon,authenticated;
grant execute on function public.do_personal_storage_ready(uuid),public.do_personal_save_paused(uuid,uuid,text,text,text,text,integer,integer) to service_role;

-- Cleanup is independent of enrolment/collection and never touches NULL legacy expiry.
create function public.do_personal_storage_expire_batch(p_limit integer default 100) returns integer
language plpgsql security invoker set search_path='' set lock_timeout='2s' as $$
declare n integer;
begin
 if p_limit is null or p_limit<1 or p_limit>100 then raise exception 'storage_invalid_batch'; end if;
 with due as (select id from public.do_personal_responsibilities where storage_body_expires_at is not null
 and storage_body_expires_at<=clock_timestamp() order by storage_body_expires_at for update skip locked limit p_limit)
 delete from public.do_personal_responsibilities t using due where t.id=due.id and t.storage_body_expires_at<=clock_timestamp();
 get diagnostics n=row_count; return n;
end $$;
create function public.do_personal_storage_record_maintenance(p_status text,p_purged integer,p_started timestamptz) returns boolean
language plpgsql security invoker set search_path='' as $$
begin
 if p_status is null or p_status not in ('completed','backlog','deadline','failed') or p_purged is null or p_purged<0 or p_purged>300 or p_started is null or p_started>clock_timestamp() then raise exception 'storage_invalid_health'; end if;
 update public.do_personal_storage_maintenance set last_attempt_at=p_started,status=p_status,purged=p_purged,
 last_completed_at=case when p_status='completed' then clock_timestamp() else last_completed_at end where id=true;
 return found;
end $$;
create function public.do_personal_storage_maintenance_health() returns jsonb
language sql security invoker set search_path='' as $$
 select jsonb_build_object('lastAttemptAt',m.last_attempt_at,'lastCompletedAt',m.last_completed_at,'status',m.status,'purged',m.purged,
 'sampledOverdue',(select count(*) from (select 1 from public.do_personal_responsibilities where storage_body_expires_at<=clock_timestamp() limit 1001) q),
 'oldestOverdueAt',(select min(storage_body_expires_at) from public.do_personal_responsibilities where storage_body_expires_at<=clock_timestamp()))
 from public.do_personal_storage_maintenance m where id=true
$$;
revoke all on function public.do_personal_storage_expire_batch(integer),public.do_personal_storage_record_maintenance(text,integer,timestamptz),public.do_personal_storage_maintenance_health() from public,anon,authenticated;
grant execute on function public.do_personal_storage_expire_batch(integer),public.do_personal_storage_record_maintenance(text,integer,timestamptz),public.do_personal_storage_maintenance_health() to service_role;
