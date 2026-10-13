-- INACTIVE REVIEW PROPOSAL. NOT a production migration; do not apply automatically.
-- The route is disabled by default; no production schema/flag is changed. Promote via Supabase CLI only after isolated SQL proof and approval.
-- First durable slice covers reviewed text/link/note metadata only. No image or vault storage.
create function public.do_saved_valid_content(value jsonb) returns boolean
language plpgsql immutable security invoker set search_path = '' as $$
declare tag jsonb; link text;
begin
  if value is null then return true; end if;
  if jsonb_typeof(value) <> 'object' or octet_length(value::text) > 40000
     or not (value ?& array['version','kind','title','text','sourceUrl','tags'])
     or (value - array['version','kind','title','text','sourceUrl','tags']) <> '{}'::jsonb
     or value->'version' <> '1'::jsonb
     or jsonb_typeof(value->'kind') <> 'string'
     or value->>'kind' not in ('note','text','link')
     or jsonb_typeof(value->'title') <> 'string'
     or length(btrim(value->>'title')) not between 1 and 160
     or jsonb_typeof(value->'text') <> 'string' or length(value->>'text') > 6000
     or (value->>'kind' in ('note','text') and length(btrim(value->>'text')) = 0)
     or jsonb_typeof(value->'sourceUrl') <> 'string'
     or jsonb_typeof(value->'tags') <> 'array' then return false; end if;
  if jsonb_array_length(value->'tags') > 8 then return false; end if;
  for tag in select jsonb_array_elements(value->'tags') loop
    if jsonb_typeof(tag) <> 'string' or length(btrim(tag #>> '{}')) not between 1 and 32 then return false; end if;
  end loop;
  link := value->>'sourceUrl';
  if value->>'kind' = 'link' and link = '' then return false; end if;
  if link <> '' and (length(link) > 2000
     or link !~ '^https://([a-zA-Z0-9-]+[.])+[a-zA-Z]{2,}(/[^?#[:space:]]*)?$'
     or link ~* '^https://[^/]*[.](local|internal|lan|test|invalid)(/|$)') then return false; end if;
  return true;
end;
$$;
revoke all on function public.do_saved_valid_content(jsonb) from public, anon;
grant execute on function public.do_saved_valid_content(jsonb) to authenticated;
create table public.do_saved_items (
  owner_id uuid not null references auth.users(id) on delete cascade,
  id uuid not null,
  revision integer not null check (revision > 0),
  content jsonb,
  deleted boolean not null default false,
  consent_version text not null check (consent_version = 'do-saved-v1'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (owner_id, id),
  check (deleted = (content is null)),
  check (public.do_saved_valid_content(content))
);
alter table public.do_saved_items enable row level security;
alter table public.do_saved_items force row level security;
revoke all on public.do_saved_items from public, anon, authenticated, service_role;
grant select, insert, update on public.do_saved_items to authenticated;
create policy saved_read on public.do_saved_items for select to authenticated
  using ((select auth.uid()) = owner_id and coalesce((select auth.jwt())->>'is_anonymous', 'false') <> 'true');
create policy saved_insert on public.do_saved_items for insert to authenticated
  with check ((select auth.uid()) = owner_id and coalesce((select auth.jwt())->>'is_anonymous', 'false') <> 'true' and revision = 1 and not deleted);
create policy saved_update on public.do_saved_items for update to authenticated
  using ((select auth.uid()) = owner_id and coalesce((select auth.jwt())->>'is_anonymous', 'false') <> 'true')
  with check ((select auth.uid()) = owner_id and coalesce((select auth.jwt())->>'is_anonymous', 'false') <> 'true');
create index do_saved_items_owner_recent on public.do_saved_items(owner_id, updated_at desc);

-- Enforce revision progression and permanent content-free tombstones even outside the adapter.
create function public.do_saved_guard_update() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if new.owner_id <> old.owner_id or new.id <> old.id or new.created_at <> old.created_at or new.consent_version <> old.consent_version
     or old.deleted or new.revision <> old.revision + 1 then
    raise exception 'saved_conflict';
  end if;
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function public.do_saved_guard_update() from public, anon, authenticated;
create trigger do_saved_guard before update on public.do_saved_items
  for each row execute function public.do_saved_guard_update();

-- Adapter requirement: UPDATE ... WHERE owner_id = auth.uid() AND id = :id
-- AND revision = :expected_revision RETURNING ...; zero rows = conflict.
-- Creation uses INSERT (no upsert). Duplicate IDs must never resurrect tombstones.
-- Do not grant DELETE. Owner erasure is content=NULL, deleted=true, revision+1.
-- Live items are retained until explicitly removed or account deletion. Tombstones keep no content.
-- Bound both live storage and the non-reusable ID ledger. The insert lock serializes per-owner quota checks.
create function public.do_saved_guard_insert() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if auth.uid() is distinct from new.owner_id then raise exception 'saved_owner'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(new.owner_id::text, 0));
  if (select count(*) from public.do_saved_items where owner_id = new.owner_id and not deleted) >= 80
     or (select count(*) from public.do_saved_items where owner_id = new.owner_id) >= 1000 then
    raise exception 'saved_quota';
  end if;
  new.created_at := now(); new.updated_at := now();
  return new;
end;
$$;
revoke all on function public.do_saved_guard_insert() from public, anon, authenticated;
create trigger do_saved_insert before insert on public.do_saved_items
  for each row execute function public.do_saved_guard_insert();
