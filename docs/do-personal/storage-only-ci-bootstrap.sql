-- FRESH DISPOSABLE DATABASE ONLY. Same minimal role/JWT helper contract as the
-- approved existing provider-memory proof; no real Auth users, tokens or APIs.
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
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
-- Deliberately no broad default table grants and no new client write permissions.
