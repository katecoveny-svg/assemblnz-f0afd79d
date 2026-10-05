-- COMBINED REVIEW ONLY / BLOCKED: storage plus new privileged Auth bridge; no execution approval.
-- Exact reviewed proposal follows untouched; no enrollment or activation.
begin;
set local lock_timeout='2s';
set local statement_timeout='20s';
do $$ begin
 if current_user<>'postgres' or session_user<>'postgres' then raise exception 'installer_role_unreviewed'; end if;
 if exists(select 1 from pg_default_acl where defaclrole=(select oid from pg_roles where rolname=current_user) and defaclnamespace=0) then raise exception 'global_defaults_changed'; end if;
 if (select jsonb_object_agg(defaclobjtype::text,defaclacl::text) from pg_default_acl where defaclrole=(select oid from pg_roles where rolname=current_user) and defaclnamespace='public'::regnamespace) is distinct from '{"S":"{postgres=rwU/postgres,anon=rwU/postgres,authenticated=rwU/postgres,service_role=rwU/postgres}","f":"{postgres=X/postgres,anon=X/postgres,authenticated=X/postgres,service_role=X/postgres}","r":"{postgres=arwdDxtm/postgres,anon=arwdDxtm/postgres,authenticated=arwdDxtm/postgres,service_role=arwdDxtm/postgres}"}'::jsonb then raise exception 'schema_defaults_changed'; end if;
 if exists(select 1 from pg_auth_members where member=(select oid from pg_roles where rolname='service_role')) then raise exception 'service_inheritance_unreviewed'; end if;
 if to_regclass('public.do_personal_storage_enrolment') is not null or to_regclass('public.do_personal_storage_requests') is not null or to_regclass('public.do_personal_storage_maintenance') is not null or exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and (proname like 'do_personal_storage_%' or proname='do_personal_save_paused')) or exists(select 1 from pg_attribute where attrelid='public.do_personal_responsibilities'::regclass and attname='storage_body_expires_at' and not attisdropped) then raise exception 'unexpected_partial_install'; end if;
 if not has_schema_privilege('service_role','public','USAGE') or not has_schema_privilege('service_role','auth','USAGE') then raise exception 'schema_dependency_missing'; end if;
 -- Separate reviewed bridge uses existing postgres rights; service gets no direct Auth grant.
 if not has_table_privilege('postgres','auth.users','SELECT') or not exists(select 1 from pg_roles where rolname='postgres' and rolbypassrls) then raise exception 'bridge_owner_auth_dependency_missing'; end if;
 if has_column_privilege('service_role','auth.users','id','SELECT') or has_column_privilege('service_role','auth.users','is_anonymous','SELECT') then raise exception 'unexpected_direct_auth_grant'; end if;
 if to_regnamespace('do_personal_auth_private') is not null then raise exception 'bridge_partial_install'; end if;
 if exists(select 1 from unnest(array['SELECT','INSERT','UPDATE','DELETE']) p where not has_table_privilege('service_role','public.do_personal_responsibilities',p)) then raise exception 'responsibility_dependency_missing'; end if;
 if exists(select 1 from unnest(array['SELECT','UPDATE']) p where not has_table_privilege('service_role','public.do_personal_runs',p)) then raise exception 'run_dependency_missing'; end if;
 if (select count(*) from pg_policies where schemaname='public' and tablename in ('do_personal_responsibilities','do_personal_runs'))<>2 or not exists(select 1 from pg_policies where schemaname='public' and tablename='do_personal_responsibilities' and policyname='personal_context_owner' and cmd='SELECT' and roles=array['authenticated']::name[] and qual=$expected$((( SELECT auth.uid() AS uid) = owner_id) AND (COALESCE(( SELECT (auth.jwt() ->> 'is_anonymous'::text)), 'false'::text) = 'false'::text))$expected$) or not exists(select 1 from pg_policies where schemaname='public' and tablename='do_personal_runs' and policyname='personal_runs_owner' and cmd='SELECT' and roles=array['authenticated']::name[] and qual=$expected$((( SELECT auth.uid() AS uid) = owner_id) AND (COALESCE(( SELECT (auth.jwt() ->> 'is_anonymous'::text)), 'false'::text) = 'false'::text))$expected$) then raise exception 'baseline_policy_changed'; end if;
 if (select count(*) from pg_class where oid in ('public.do_personal_responsibilities'::regclass,'public.do_personal_runs'::regclass) and relrowsecurity and pg_get_userbyid(relowner)='postgres')<>2 then raise exception 'baseline_rls_or_owner_changed'; end if;
 if not exists(select 1 from pg_constraint where conrelid='public.do_personal_runs'::regclass and conname='do_personal_runs_responsibility_id_owner_id_fkey' and contype='f' and confdeltype='c' and confrelid='public.do_personal_responsibilities'::regclass) then raise exception 'cascade_dependency_changed'; end if;
end $$;
-- NOT APPROVED. ACL correction only; no run-expiry policy change.
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
revoke all on public.do_personal_storage_enrolment from public,anon,authenticated,service_role;
grant select,insert,update,delete on public.do_personal_storage_enrolment to service_role;
create table public.do_personal_storage_maintenance (
 id boolean primary key default true check(id),last_attempt_at timestamptz,last_completed_at timestamptz,
 status text check(status in ('completed','backlog','deadline','failed')),purged integer not null default 0 check(purged between 0 and 300)
);
alter table public.do_personal_storage_maintenance enable row level security;
revoke all on public.do_personal_storage_maintenance from public,anon,authenticated,service_role;
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
revoke all on public.do_personal_storage_requests from public,anon,authenticated,service_role;
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
revoke all on function public.do_personal_storage_ready(uuid),public.do_personal_save_paused(uuid,uuid,text,text,text,text,integer,integer) from public,anon,authenticated,service_role;
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
revoke all on function public.do_personal_storage_expire_batch(integer),public.do_personal_storage_record_maintenance(text,integer,timestamptz),public.do_personal_storage_maintenance_health() from public,anon,authenticated,service_role;
grant execute on function public.do_personal_storage_expire_batch(integer),public.do_personal_storage_record_maintenance(text,integer,timestamptz),public.do_personal_storage_maintenance_health() to service_role;

-- Separate unapproved Auth dependency source begins.
-- REVIEW ONLY. Separate dependency proposal; passed storage candidate stays unchanged.
-- Install together atomically only after exact approval; no enrollment/health seeds.
do $$ begin
 if current_user<>'postgres' or not pg_catalog.has_table_privilege('postgres','auth.users','SELECT') or not exists(select 1 from pg_catalog.pg_roles where rolname='postgres' and rolbypassrls) then raise exception 'bridge_owner_unreviewed'; end if;
 if pg_catalog.to_regnamespace('do_personal_auth_private') is not null then raise exception 'bridge_partial_install'; end if;
end $$;
create schema do_personal_auth_private authorization postgres;
revoke all on schema do_personal_auth_private from public,anon,authenticated,service_role;
grant usage on schema do_personal_auth_private to service_role;
create function do_personal_auth_private.enrolled_owner_is_nonanonymous(p_owner uuid)
returns boolean language plpgsql security definer set search_path='' as $$
declare caller_uid uuid; caller_role text;
begin
 if p_owner is null then return false; end if;
 caller_role:=pg_catalog.current_setting('role',true);
 -- Hosted service calls use SET ROLE service_role. Direct administrative proof
 -- calls are allowed only from the existing postgres session without another role.
 if caller_role is distinct from 'service_role' and not (session_user='postgres' and caller_role in ('none','postgres')) then return false; end if;
 caller_uid:=auth.uid();
 if caller_uid is not null and caller_uid<>p_owner then return false; end if;
 -- Scope each lookup to current sole enrolled owner. service_role can mutate
 -- enrollment, so this is not anti-enumeration protection from a compromised service key.
 if not exists(select 1 from public.do_personal_storage_enrolment e where e.owner_id=p_owner and e.enabled and e.retention_reviewed and e.purpose='owner_entered_responsibility_review' and e.expires_at>pg_catalog.clock_timestamp()) then return false; end if;
 return exists(select 1 from auth.users u where u.id=p_owner and not u.is_anonymous);
end $$;
alter function do_personal_auth_private.enrolled_owner_is_nonanonymous(uuid) owner to postgres;
revoke all on function do_personal_auth_private.enrolled_owner_is_nonanonymous(uuid) from public,anon,authenticated,service_role;
grant execute on function do_personal_auth_private.enrolled_owner_is_nonanonymous(uuid) to service_role;
-- Main readiness remains INVOKER. Only its two-column Auth join is replaced.
create or replace function public.do_personal_storage_ready(p_owner uuid) returns boolean
language sql security invoker set search_path='' as $$
 select exists(select 1 from public.do_personal_storage_enrolment e
 where e.owner_id=p_owner and e.enabled and e.retention_reviewed and e.expires_at>clock_timestamp()
 and do_personal_auth_private.enrolled_owner_is_nonanonymous(e.owner_id)
 and exists(select 1 from public.do_personal_storage_maintenance m where m.id=true and m.status='completed'
 and m.last_completed_at<=clock_timestamp() and m.last_completed_at>clock_timestamp()-interval '90 minutes')
 and not exists(select 1 from public.do_personal_responsibilities where storage_body_expires_at<=clock_timestamp()))
$$;
revoke all on function public.do_personal_storage_ready(uuid) from public,anon,authenticated,service_role;
grant execute on function public.do_personal_storage_ready(uuid) to service_role;

-- Metadata-only postconditions inside the same transaction; any failure aborts install.
do $$ begin if (select count(*) from pg_class where oid in ('public.do_personal_responsibilities'::regclass,'public.do_personal_runs'::regclass) and relrowsecurity and pg_get_userbyid(relowner)='postgres')<>2 then raise exception 'baseline_post_rls_or_owner_changed'; end if; end $$;
do $$
declare t text; priv text; r text; signature text; expected boolean;
begin
 if has_table_privilege('service_role','public.do_personal_storage_requests','UPDATE') then
  raise exception 'ACL_EXCESS_SERVICE_REQUEST_UPDATE';
 end if;
 foreach t in array array['do_personal_storage_enrolment','do_personal_storage_maintenance','do_personal_storage_requests'] loop
  foreach r in array array['anon','authenticated','service_role'] loop
   foreach priv in array array['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER','MAINTAIN'] loop
    expected:=r='service_role' and (priv in ('SELECT','INSERT') or (priv='UPDATE' and t<>'do_personal_storage_requests') or (priv='DELETE' and t='do_personal_storage_enrolment'));
    if has_table_privilege(r,'public.'||t,priv) is distinct from expected then
     raise exception 'ACL_TABLE_MATRIX_MISMATCH: % % % expected %',r,t,priv,expected;
    end if;
   end loop;
  end loop;
 end loop;
 foreach signature in array array['public.do_personal_storage_ready(uuid)','public.do_personal_save_paused(uuid,uuid,text,text,text,text,integer,integer)','public.do_personal_storage_expire_batch(integer)','public.do_personal_storage_record_maintenance(text,integer,timestamptz)','public.do_personal_storage_maintenance_health()'] loop
  foreach r in array array['anon','authenticated','service_role'] loop
   if has_function_privilege(r,signature,'EXECUTE') is distinct from (r='service_role') then raise exception 'ACL_FUNCTION_MATRIX_MISMATCH: % %',r,signature; end if;
  end loop;
 end loop;
end $$;
do $$ declare t text; begin
 foreach t in array array['do_personal_storage_enrolment','do_personal_storage_maintenance','do_personal_storage_requests'] loop
  if not exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname=t and c.relrowsecurity and pg_get_userbyid(c.relowner)=current_user) or exists(select 1 from pg_policies where schemaname='public' and tablename=t) then raise exception 'new_object_owner_or_rls_mismatch'; end if;
 end loop;
 if (select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and (proname like 'do_personal_storage_%' or proname='do_personal_save_paused') and not p.prosecdef and pg_get_userbyid(p.proowner)=current_user and 'search_path=""'=any(p.proconfig))<>5 then raise exception 'rpc_security_metadata_mismatch'; end if;
 if (select count(*) from pg_policies where schemaname='public' and tablename='do_personal_responsibilities')<>1 or not exists(select 1 from pg_policies where schemaname='public' and tablename='do_personal_responsibilities' and policyname='personal_context_owner' and cmd='SELECT' and roles=array['authenticated']::name[] and qual=$expected$((( SELECT auth.uid() AS uid) = owner_id) AND (COALESCE(( SELECT (auth.jwt() ->> 'is_anonymous'::text)), 'false'::text) = 'false'::text) AND ((storage_body_expires_at IS NULL) OR (storage_body_expires_at > clock_timestamp())))$expected$ and with_check is null) then raise exception 'expiry_policy_exact_mismatch'; end if;
end $$;
do $$ declare r text; begin
 if not exists(select 1 from pg_namespace where nspname='do_personal_auth_private' and pg_get_userbyid(nspowner)='postgres') then raise exception 'bridge_schema_owner_mismatch'; end if;
 if not exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='do_personal_auth_private' and p.proname='enrolled_owner_is_nonanonymous' and pg_get_function_identity_arguments(p.oid)='p_owner uuid' and p.prosecdef and pg_get_userbyid(p.proowner)='postgres' and p.prorettype='boolean'::regtype and 'search_path=""'=any(p.proconfig)) then raise exception 'bridge_function_metadata_mismatch'; end if;
 foreach r in array array['anon','authenticated','service_role'] loop
  if has_schema_privilege(r,'do_personal_auth_private','CREATE') or has_schema_privilege(r,'do_personal_auth_private','USAGE') is distinct from (r='service_role') or has_function_privilege(r,'do_personal_auth_private.enrolled_owner_is_nonanonymous(uuid)','EXECUTE') is distinct from (r='service_role') then raise exception 'bridge_acl_mismatch'; end if;
 end loop;
 if has_column_privilege('service_role','auth.users','id','SELECT') or has_column_privilege('service_role','auth.users','is_anonymous','SELECT') then raise exception 'auth_direct_privileges_changed'; end if;
end $$;
commit;
