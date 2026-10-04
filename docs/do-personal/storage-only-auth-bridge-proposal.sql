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
