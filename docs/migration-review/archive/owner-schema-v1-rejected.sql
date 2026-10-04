-- REJECTED by independent review. Historical evidence only; DO NOT APPLY.
-- PROPOSAL ONLY. Never applied to production. Local synthetic Postgres proof.
create table public.studio_owner_drafts (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id),
  revision integer not null default 1 check (revision > 0),
  payload jsonb not null check (jsonb_typeof(payload) = 'object' and payload->>'schemaVersion' = '1' and octet_length(payload::text) <= 1800000),
  updated_at timestamptz not null default clock_timestamp(),
  unique(id,owner_user_id)
);
create index studio_owner_drafts_owner_updated on public.studio_owner_drafts(owner_user_id, updated_at desc);
alter table public.studio_owner_drafts enable row level security;
create policy studio_draft_owner_read on public.studio_owner_drafts for select to authenticated using ((select auth.uid()) = owner_user_id and coalesce((select auth.jwt())->>'is_anonymous','false') <> 'true');
create policy studio_draft_owner_insert on public.studio_owner_drafts for insert to authenticated with check ((select auth.uid()) = owner_user_id and coalesce((select auth.jwt())->>'is_anonymous','false') <> 'true');
create policy studio_draft_owner_update on public.studio_owner_drafts for update to authenticated using ((select auth.uid()) = owner_user_id and coalesce((select auth.jwt())->>'is_anonymous','false') <> 'true') with check ((select auth.uid()) = owner_user_id and coalesce((select auth.jwt())->>'is_anonymous','false') <> 'true');
revoke all on public.studio_owner_drafts from anon, authenticated;
grant select, insert, update on public.studio_owner_drafts to authenticated;

create function public.studio_draft_revision_guard() returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if TG_OP = 'INSERT' and NEW.revision <> 1 then raise exception 'Initial revision must be 1'; end if;
  if TG_OP = 'UPDATE' and (NEW.owner_user_id <> OLD.owner_user_id or NEW.id <> OLD.id or NEW.revision <> OLD.revision + 1) then raise exception 'Immutable owner/id or invalid revision'; end if;
  NEW.updated_at := clock_timestamp(); return NEW;
end $$;
revoke all on function public.studio_draft_revision_guard() from public;
create trigger studio_draft_revision before insert or update on public.studio_owner_drafts for each row execute function public.studio_draft_revision_guard();

create function public.studio_save_owner_draft(p_id uuid, p_revision integer, p_payload jsonb)
returns setof public.studio_owner_drafts language plpgsql security invoker set search_path = '' as $$
begin
  if auth.uid() is null or coalesce(auth.jwt()->>'is_anonymous','false') = 'true' then raise exception 'Unauthenticated' using errcode = '42501'; end if;
  if p_id is null then
    if p_revision <> 0 then raise exception 'Invalid initial revision' using errcode = '22023'; end if;
    return query insert into public.studio_owner_drafts(owner_user_id,payload) values(auth.uid(),p_payload) returning *;
  else
    return query update public.studio_owner_drafts set payload=p_payload, revision=revision+1 where id=p_id and owner_user_id=auth.uid() and revision=p_revision returning *;
    -- Zero rows means unavailable/wrong owner/stale revision. Never insert on conflict.
  end if;
end $$;
revoke all on function public.studio_save_owner_draft(uuid,integer,jsonb) from public, anon;
grant execute on function public.studio_save_owner_draft(uuid,integer,jsonb) to authenticated;

-- Recipient surfaces remain disabled. These structures are for reviewed future activation.
create table public.studio_recipient_snapshots (
  id uuid primary key, owner_user_id uuid not null references auth.users(id),
  draft_id uuid not null, revision integer not null check(revision > 0),
  projection jsonb not null, created_at timestamptz not null default now(),
  foreign key(draft_id,owner_user_id) references public.studio_owner_drafts(id,owner_user_id),
  unique(id,owner_user_id,revision), unique(id,owner_user_id)
);
create table public.studio_recipient_grants (
  id uuid primary key, owner_user_id uuid not null references auth.users(id),
  recipient_user_id uuid not null references auth.users(id), snapshot_id uuid not null,
  revision integer not null, status text not null check(status in ('active','revoked')),
  expires_at timestamptz not null, created_at timestamptz not null default now(),
  foreign key(snapshot_id,owner_user_id,revision) references public.studio_recipient_snapshots(id,owner_user_id,revision),
  unique(snapshot_id,recipient_user_id)
);
create index studio_grants_recipient_snapshot on public.studio_recipient_grants(recipient_user_id,snapshot_id);
create table public.studio_snapshot_media (
  snapshot_id uuid not null references public.studio_recipient_snapshots(id), media_id uuid not null,
  owner_user_id uuid not null references auth.users(id), object_path text not null,
  primary key(snapshot_id,media_id),
  foreign key(snapshot_id,owner_user_id) references public.studio_recipient_snapshots(id,owner_user_id)
);

alter table public.studio_recipient_snapshots enable row level security;
alter table public.studio_recipient_grants enable row level security;
alter table public.studio_snapshot_media enable row level security;
revoke all on public.studio_recipient_snapshots, public.studio_recipient_grants, public.studio_snapshot_media from anon, authenticated;
grant select on public.studio_recipient_snapshots, public.studio_recipient_grants, public.studio_snapshot_media to authenticated;
create policy studio_grant_read on public.studio_recipient_grants for select to authenticated using (coalesce((select auth.jwt())->>'is_anonymous','false') <> 'true' and ((select auth.uid()) = recipient_user_id or (select auth.uid()) = owner_user_id));
create policy studio_snapshot_read on public.studio_recipient_snapshots for select to authenticated using (
 coalesce((select auth.jwt())->>'is_anonymous','false') <> 'true' and ((select auth.uid()) = owner_user_id or exists(select 1 from public.studio_recipient_grants g where g.snapshot_id=studio_recipient_snapshots.id and g.recipient_user_id=(select auth.uid()) and g.status='active' and g.expires_at > now() and g.revision=studio_recipient_snapshots.revision))
);
create policy studio_snapshot_media_read on public.studio_snapshot_media for select to authenticated using (
 coalesce((select auth.jwt())->>'is_anonymous','false') <> 'true' and ((select auth.uid()) = owner_user_id or exists(select 1 from public.studio_recipient_grants g where g.snapshot_id=studio_snapshot_media.snapshot_id and g.recipient_user_id=(select auth.uid()) and g.status='active' and g.expires_at > now()))
);
-- No INSERT/UPDATE/DELETE grants or policies for snapshots/grants/media.
-- Future reviewed server publication must atomically produce an immutable projection.
