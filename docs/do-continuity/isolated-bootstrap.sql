-- Test harness only. Deliberately fake Supabase Auth; never production auth proof.
do $$ begin
  if not exists(select 1 from pg_roles where rolname='anon') then create role anon; end if;
  if not exists(select 1 from pg_roles where rolname='authenticated') then create role authenticated; end if;
  if not exists(select 1 from pg_roles where rolname='service_role') then create role service_role bypassrls; end if;
end $$;
create schema auth;
create table auth.users(id uuid primary key);
insert into auth.users values ('00000000-0000-4000-8000-000000000001'),('00000000-0000-4000-8000-000000000002');
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid;
$$;
create function auth.jwt() returns jsonb language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true),''),'{}')::jsonb;
$$;
-- Emulate Supabase-style inherited ACLs, including service-role bypass. Proposal
-- must explicitly revoke these; RLS alone does not constrain this role.
create schema do_continuity_private;
grant usage on schema do_continuity_private to service_role;
alter default privileges grant all on tables to service_role;
alter default privileges grant execute on functions to service_role;
alter default privileges in schema do_continuity_private grant all on tables to anon, authenticated, service_role;
alter default privileges in schema do_continuity_private grant execute on functions to anon, authenticated, service_role;
