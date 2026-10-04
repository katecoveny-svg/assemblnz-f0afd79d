-- FRESH DISPOSABLE DATABASE ONLY. Same minimal role/JWT helper contract as the
-- approved existing provider-memory proof; no real Auth users, tokens or APIs.
-- Roles are cluster-wide: create once, then validate when bootstrapping DB two.
do $$ declare r text; begin
 foreach r in array array['anon','authenticated','service_role'] loop
  if not exists(select 1 from pg_roles where rolname=r) then
   if r='service_role' then create role service_role nologin bypassrls;
   elsif r='anon' then create role anon nologin;
   else create role authenticated nologin; end if;
  end if;
  if not exists(select 1 from pg_roles where rolname=r and not rolcanlogin and not rolsuper and rolbypassrls=(r='service_role')) then raise exception 'synthetic_role_properties_mismatch'; end if;
 end loop;
end $$;
create schema auth;
create table auth.users(id uuid primary key,is_anonymous boolean not null default false);
create function auth.uid() returns uuid language sql as $$
 select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid
$$;
create function auth.jwt() returns jsonb language sql as $$
 select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb
$$;
grant usage on schema public to anon,authenticated,service_role;
grant usage on schema auth to authenticated,service_role;
grant select on auth.users to service_role;
-- Regression: reproduce broad Supabase public defaults for installation role.
alter default privileges in schema public grant all on tables to anon,authenticated,service_role;
alter default privileges in schema public grant execute on functions to anon,authenticated,service_role;
