-- ===========================================================================
-- Tōro memory + consent foundation (Phase 1)
-- Spec: outputs/TORO-V0.1-ARCHITECTURE-SPEC-2026-05-11.md §4.1 + §4.2
--
-- Four tables, all RLS-scoped to public.tenants via the existing helper
-- public.is_tenant_member(_tenant_id) from 20260508204928_toro_tenants.sql.
--
--   1. toro_memory_blocks    — named, finite memory blocks (Letta-style).
--   2. toro_episodic_events  — individual timestamped events.
--   3. toro_routines         — recurring patterns ("school run, Tue–Fri 08:15").
--   4. toro_consent_grants   — per-entity Tōro-skill access grants
--                              (Home Assistant pattern, §4.2).
--
-- pgvector availability
-- ---------------------
-- The spec specifies `vector(1536)` on toro_memory_blocks.embedding. The
-- ivfflat index on that column only makes sense when the pgvector extension
-- is installed. This migration:
--   • creates the embedding column AND the ivfflat index ONLY when the
--     `vector` extension is present (do-block guard);
--   • is safe to re-run after pgvector is later added — a follow-up
--     migration will need to add the column + index then.
--
-- The DO block raises a NOTICE if pgvector is missing so the operator sees
-- it during apply. Tracking flag: pgvector availability needs Kate
-- confirmation before Phase 2 (semantic retrieval depends on it).
--
-- Hard rule #23 — children's-data retention
-- -----------------------------------------
-- The plugin-canon extension adds rule #23: rows touching child profiles
-- or health records get an 18-year retention window (until majority), not
-- the standard 7-year audit window.
--
-- This migration enforces #23 structurally:
--   • toro_memory_blocks and toro_episodic_events both carry a
--     `retention_policy text not null default 'standard_7yr'` column with a
--     CHECK constraint that pins values to ('standard_7yr','children_18yr').
--   • A BEFORE INSERT OR UPDATE trigger on each table inspects the row and,
--     when child markers are detected, sets retention_policy to
--     'children_18yr' (overriding the default).
--
-- Detection heuristic (intentionally conservative — better to over-flag than
-- under-flag a child row):
--   toro_memory_blocks:
--     • block_type = 'profile' AND content jsonb has any of:
--         - top-level `is_child = true`
--         - top-level `age` < 18
--         - top-level `dob` present (DoB is rarely stored for adults in Tōro)
--         - top-level `children` array present (this block IS about children)
--   toro_episodic_events:
--     • meta ->> 'subject_is_child' = 'true'  (callers set this when the
--       event is about a child)
--     • OR event_type in ('school_event','medical') AND meta ->> 'about_child' = 'true'
--
-- Future tightening (Phase 1B): once the child-profile schema is canonised,
-- replace the heuristic with a lookup against the children registry. Until
-- then, the retention_policy column is the structural enforcement point;
-- delete jobs MUST filter on it. Documented again in §4.1 of the spec.
--
-- Idempotent: safe to re-run. All `create table` use `if not exists`; all
-- policies are inside `do $$ if not exists (select 1 from pg_policies …) then
-- create policy …` guards.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. toro_memory_blocks
-- ---------------------------------------------------------------------------

create table if not exists public.toro_memory_blocks (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references public.tenants(id) on delete cascade,
  name              text not null,
  block_type        text not null
                      check (block_type in ('profile','routines','episodic','notes','procedural')),
  content           jsonb not null,
  max_chars         integer not null default 4000,
  retention_policy  text not null default 'standard_7yr'
                      check (retention_policy in ('standard_7yr','children_18yr')),
  updated_at        timestamptz not null default now(),
  created_at        timestamptz not null default now(),
  unique (tenant_id, name)
);

create index if not exists idx_toro_memory_blocks_tenant_type
  on public.toro_memory_blocks (tenant_id, block_type);

-- pgvector graceful degrade: add the embedding column + ivfflat index only
-- when the `vector` extension is present.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'vector') then
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'toro_memory_blocks'
        and column_name = 'embedding'
    ) then
      execute 'alter table public.toro_memory_blocks add column embedding vector(1536)';
    end if;

    if not exists (
      select 1 from pg_indexes
      where schemaname = 'public'
        and tablename = 'toro_memory_blocks'
        and indexname = 'idx_toro_memory_blocks_embedding'
    ) then
      execute 'create index idx_toro_memory_blocks_embedding
               on public.toro_memory_blocks
               using ivfflat (embedding vector_cosine_ops)';
    end if;
  else
    raise notice 'pgvector extension not installed — skipping embedding column + ivfflat index on toro_memory_blocks. Add via a follow-up migration once Kate enables the extension on assembl-prod.';
  end if;
end $$;

alter table public.toro_memory_blocks enable row level security;

-- ---------------------------------------------------------------------------
-- 2. toro_episodic_events
-- ---------------------------------------------------------------------------

create table if not exists public.toro_episodic_events (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references public.tenants(id) on delete cascade,
  occurred_at       timestamptz not null,
  event_type        text not null,
  who               text[],
  body              text not null,
  meta              jsonb not null default '{}'::jsonb,
  retention_policy  text not null default 'standard_7yr'
                      check (retention_policy in ('standard_7yr','children_18yr')),
  created_at        timestamptz not null default now()
);

create index if not exists idx_toro_episodic_events_tenant_occurred
  on public.toro_episodic_events (tenant_id, occurred_at desc);

create index if not exists idx_toro_episodic_events_tenant_type_occurred
  on public.toro_episodic_events (tenant_id, event_type, occurred_at desc);

alter table public.toro_episodic_events enable row level security;

-- ---------------------------------------------------------------------------
-- 3. toro_routines
-- ---------------------------------------------------------------------------

create table if not exists public.toro_routines (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants(id) on delete cascade,
  name          text not null,
  cadence       text not null,
  participants  text[],
  details       jsonb not null default '{}'::jsonb,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

create index if not exists idx_toro_routines_tenant_active
  on public.toro_routines (tenant_id, active);

alter table public.toro_routines enable row level security;

-- ---------------------------------------------------------------------------
-- 4. toro_consent_grants  (Home Assistant per-entity pattern, spec §4.2)
-- ---------------------------------------------------------------------------

create table if not exists public.toro_consent_grants (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants(id) on delete cascade,
  entity_type   text not null check (entity_type in (
                  'child_profile','calendar','photo_album','location_history',
                  'school_portal','health_record','financial_account','message_thread'
                )),
  entity_id     text not null,
  skill_slug    text not null,
  granted_by    uuid references auth.users(id),
  granted_at    timestamptz not null default now(),
  revoked_at    timestamptz,
  expires_at    timestamptz,
  unique (tenant_id, entity_type, entity_id, skill_slug)
);

create index if not exists idx_toro_consent_grants_tenant_active
  on public.toro_consent_grants (tenant_id, entity_type)
  where revoked_at is null;

alter table public.toro_consent_grants enable row level security;

-- ---------------------------------------------------------------------------
-- 5. Retention-policy triggers (hard rule #23)
-- ---------------------------------------------------------------------------

create or replace function public.toro_memory_blocks_set_retention()
returns trigger
language plpgsql
as $$
declare
  is_child_profile boolean := false;
begin
  if new.block_type = 'profile' and new.content is not null then
    -- Detection heuristic — see migration header comment block.
    is_child_profile :=
      coalesce((new.content ->> 'is_child')::boolean, false)
      or (new.content ? 'dob')
      or (new.content ? 'children')
      or (
        new.content ? 'age'
        and (new.content ->> 'age') ~ '^\d+$'
        and (new.content ->> 'age')::int < 18
      );
  end if;

  if is_child_profile then
    new.retention_policy := 'children_18yr';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_toro_memory_blocks_retention on public.toro_memory_blocks;
create trigger trg_toro_memory_blocks_retention
  before insert or update on public.toro_memory_blocks
  for each row execute function public.toro_memory_blocks_set_retention();

create or replace function public.toro_episodic_events_set_retention()
returns trigger
language plpgsql
as $$
declare
  about_child boolean := false;
begin
  -- Detection heuristic — see migration header comment block.
  about_child :=
    coalesce((new.meta ->> 'subject_is_child')::boolean, false)
    or (
      new.event_type in ('school_event','medical')
      and coalesce((new.meta ->> 'about_child')::boolean, false)
    );

  if about_child then
    new.retention_policy := 'children_18yr';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_toro_episodic_events_retention on public.toro_episodic_events;
create trigger trg_toro_episodic_events_retention
  before insert or update on public.toro_episodic_events
  for each row execute function public.toro_episodic_events_set_retention();

-- ---------------------------------------------------------------------------
-- 6. RLS policies — gated by public.is_tenant_member(tenant_id)
-- ---------------------------------------------------------------------------

-- toro_memory_blocks ---------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'toro_memory_blocks'
      and policyname = 'toro_memory_blocks_select_member'
  ) then
    create policy toro_memory_blocks_select_member on public.toro_memory_blocks
      for select to authenticated
      using (public.is_tenant_member(tenant_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'toro_memory_blocks'
      and policyname = 'toro_memory_blocks_insert_member'
  ) then
    create policy toro_memory_blocks_insert_member on public.toro_memory_blocks
      for insert to authenticated
      with check (public.is_tenant_member(tenant_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'toro_memory_blocks'
      and policyname = 'toro_memory_blocks_update_member'
  ) then
    create policy toro_memory_blocks_update_member on public.toro_memory_blocks
      for update to authenticated
      using (public.is_tenant_member(tenant_id))
      with check (public.is_tenant_member(tenant_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'toro_memory_blocks'
      and policyname = 'toro_memory_blocks_delete_member'
  ) then
    create policy toro_memory_blocks_delete_member on public.toro_memory_blocks
      for delete to authenticated
      using (public.is_tenant_member(tenant_id));
  end if;
end $$;

-- toro_episodic_events -------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'toro_episodic_events'
      and policyname = 'toro_episodic_events_select_member'
  ) then
    create policy toro_episodic_events_select_member on public.toro_episodic_events
      for select to authenticated
      using (public.is_tenant_member(tenant_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'toro_episodic_events'
      and policyname = 'toro_episodic_events_insert_member'
  ) then
    create policy toro_episodic_events_insert_member on public.toro_episodic_events
      for insert to authenticated
      with check (public.is_tenant_member(tenant_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'toro_episodic_events'
      and policyname = 'toro_episodic_events_update_member'
  ) then
    create policy toro_episodic_events_update_member on public.toro_episodic_events
      for update to authenticated
      using (public.is_tenant_member(tenant_id))
      with check (public.is_tenant_member(tenant_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'toro_episodic_events'
      and policyname = 'toro_episodic_events_delete_member'
  ) then
    create policy toro_episodic_events_delete_member on public.toro_episodic_events
      for delete to authenticated
      using (public.is_tenant_member(tenant_id));
  end if;
end $$;

-- toro_routines --------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'toro_routines'
      and policyname = 'toro_routines_select_member'
  ) then
    create policy toro_routines_select_member on public.toro_routines
      for select to authenticated
      using (public.is_tenant_member(tenant_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'toro_routines'
      and policyname = 'toro_routines_insert_member'
  ) then
    create policy toro_routines_insert_member on public.toro_routines
      for insert to authenticated
      with check (public.is_tenant_member(tenant_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'toro_routines'
      and policyname = 'toro_routines_update_member'
  ) then
    create policy toro_routines_update_member on public.toro_routines
      for update to authenticated
      using (public.is_tenant_member(tenant_id))
      with check (public.is_tenant_member(tenant_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'toro_routines'
      and policyname = 'toro_routines_delete_member'
  ) then
    create policy toro_routines_delete_member on public.toro_routines
      for delete to authenticated
      using (public.is_tenant_member(tenant_id));
  end if;
end $$;

-- toro_consent_grants --------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'toro_consent_grants'
      and policyname = 'toro_consent_grants_select_member'
  ) then
    create policy toro_consent_grants_select_member on public.toro_consent_grants
      for select to authenticated
      using (public.is_tenant_member(tenant_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'toro_consent_grants'
      and policyname = 'toro_consent_grants_insert_member'
  ) then
    create policy toro_consent_grants_insert_member on public.toro_consent_grants
      for insert to authenticated
      with check (public.is_tenant_member(tenant_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'toro_consent_grants'
      and policyname = 'toro_consent_grants_update_member'
  ) then
    create policy toro_consent_grants_update_member on public.toro_consent_grants
      for update to authenticated
      using (public.is_tenant_member(tenant_id))
      with check (public.is_tenant_member(tenant_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'toro_consent_grants'
      and policyname = 'toro_consent_grants_delete_member'
  ) then
    create policy toro_consent_grants_delete_member on public.toro_consent_grants
      for delete to authenticated
      using (public.is_tenant_member(tenant_id));
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 7. Comments (for psql \d+ and Supabase Studio)
-- ---------------------------------------------------------------------------

comment on table public.toro_memory_blocks is
  'Tōro v0.1 — Letta-style named memory blocks per tenant. Hard rule #23: rows about children get retention_policy = ''children_18yr''.';

comment on column public.toro_memory_blocks.retention_policy is
  'Hard rule #23: ''children_18yr'' for child-profile rows, else ''standard_7yr''. Trigger toro_memory_blocks_set_retention sets this; delete jobs MUST filter on it.';

comment on table public.toro_episodic_events is
  'Tōro v0.1 — individual timestamped events. retention_policy follows hard rule #23 (children: 18 years).';

comment on column public.toro_episodic_events.retention_policy is
  'Set by trigger from meta->>''subject_is_child'' or event_type+meta->>''about_child''. Delete jobs MUST filter on it.';

comment on table public.toro_routines is
  'Tōro v0.1 — recurring family routines (e.g. school run, Tue-Fri 08:15).';

comment on table public.toro_consent_grants is
  'Tōro v0.1 — per-entity, per-skill consent grants (Home Assistant pattern, spec §4.2). Revoke = UPDATE revoked_at; never DELETE.';
