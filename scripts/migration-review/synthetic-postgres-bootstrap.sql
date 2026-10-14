-- HISTORICAL V1 HARNESS; rejected schema. DO NOT RUN for V2.
-- Use test-owner-schema.py exclusively in its isolated no-network container.
-- Isolated test harness only; never run against a linked project.
do $$ begin if not exists(select 1 from pg_roles where rolname='anon') then create role anon;end if;end $$;
do $$ begin if not exists(select 1 from pg_roles where rolname='authenticated') then create role authenticated;end if;end $$;
create schema auth;
create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
grant usage on schema auth to anon, authenticated;
grant execute on function auth.uid(), auth.jwt() to anon, authenticated;
insert into auth.users values ('11111111-1111-4111-8111-111111111111'),('22222222-2222-4222-8222-222222222222'),('33333333-3333-4333-8333-333333333333');
create schema storage;
create table storage.objects(id uuid primary key,bucket_id text,name text);
alter table storage.objects enable row level security;
grant usage on schema storage to authenticated,anon;
grant select on storage.objects to authenticated;
