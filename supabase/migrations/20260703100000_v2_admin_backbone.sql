-- Phase 2 — v2 admin backbone.
--
-- Backs the extended operator hub at /admin (feature/v2-admin):
--
--   designated_admins       the allowlist ensureAdmin() checks, so operators can
--                           be added without a deploy (Kate is seeded).
--   is_designated_admin()   SECURITY DEFINER helper the RLS policies lean on.
--   agent_prompt_overrides  STAGED prompt edits. Runtime prompts live in CODE
--                           (lib/marketplace/agent-prompts.ts — see
--                           reference_agent_prompts_live_in_code); an admin edit
--                           here is a staged draft for the next code sync, and
--                           the admin UI labels it exactly that. The runtime MAY
--                           opt in to reading an override later; nothing reads
--                           it today.
--   content_approvals       generic approval queue: AI-generated content lands
--                           'pending' until Kate approves. Phase 5
--                           (withBrandLock) writes into this table — the schema
--                           is deliberately generic (surface/kind/storage_path).
--   bundles.sort_order      shelf ordering for the bundle CRUD.
--   tenant_customers.*      additive pilot-console columns: brand_config (which
--                           lib/brand/configs entry the console renders with)
--                           and demo_seed_enabled (whether demo seed data shows).
--
-- RLS matrix (service role bypasses RLS everywhere, as established):
--   designated_admins       read: designated admins · write: service role only
--   agent_prompt_overrides  read: designated admins · write: service role only
--   content_approvals       read: designated admins · write: service role only
--
-- Idempotent / fresh-apply safe: IF NOT EXISTS everywhere, policies dropped
-- before create, seeds ON CONFLICT DO NOTHING, tenant_customers guarded with
-- to_regclass (it is created by earlier pilot migrations). No DROPs of existing
-- tables or columns. Additive only.

begin;

-- ─────────────────────────────────────────────────────────────────────────
-- 1 · designated_admins — the operator allowlist
-- ─────────────────────────────────────────────────────────────────────────
-- Keyed by email so an operator can be allowlisted BEFORE their first sign-in
-- (magic link creates the auth.users row on first confirm). user_id back-fills
-- lazily the first time ensureAdmin() sees them.

create table if not exists public.designated_admins (
  email        text primary key check (email = lower(email)),
  user_id      uuid references auth.users (id) on delete set null,
  display_name text,
  added_by     text,
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

comment on table public.designated_admins is
  'Operator allowlist for /admin. ensureAdmin() grants access to active rows (by user_id or email). Writes are service-role only, from admin server actions.';

-- Seed the founder mailboxes (matches the code allowlist in lib/admin/ensureAdmin.ts).
insert into public.designated_admins (email, display_name, added_by)
values
  ('assembl@assembl.co.nz', 'Kate Hudson', 'seed:20260703100000'),
  ('kate@assembl.co.nz',    'Kate Hudson', 'seed:20260703100000')
on conflict (email) do nothing;

-- ─────────────────────────────────────────────────────────────────────────
-- 2 · is_designated_admin() — RLS helper
-- ─────────────────────────────────────────────────────────────────────────
-- SECURITY DEFINER so the policy check can read designated_admins (and the
-- caller's email in auth.users) without granting either to authenticated.

create or replace function public.is_designated_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.designated_admins da
    where da.active
      and (
        da.user_id = uid
        or da.email = lower(coalesce(
             (select u.email from auth.users u where u.id = uid), ''))
      )
  );
$$;

revoke all on function public.is_designated_admin(uuid) from public;
grant execute on function public.is_designated_admin(uuid) to authenticated, service_role;

alter table public.designated_admins enable row level security;

drop policy if exists designated_admins_admin_read on public.designated_admins;
create policy designated_admins_admin_read on public.designated_admins
  for select to authenticated
  using (public.is_designated_admin(auth.uid()));
-- No insert/update/delete policies: writes are service-role only.

-- ─────────────────────────────────────────────────────────────────────────
-- 3 · agent_prompt_overrides — staged prompt edits (code stays canonical)
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.agent_prompt_overrides (
  agent_slug    text primary key,
  system_prompt text not null,
  note          text,
  status        text not null default 'staged'
                  check (status in ('staged', 'synced', 'discarded')),
  updated_by    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.agent_prompt_overrides is
  'STAGED admin edits to agent system prompts. Runtime reads prompts from code (lib/marketplace/agent-prompts.ts); a row here is a draft for the next code sync — status flips to synced once the edit lands in code.';

alter table public.agent_prompt_overrides enable row level security;

drop policy if exists agent_prompt_overrides_admin_read on public.agent_prompt_overrides;
create policy agent_prompt_overrides_admin_read on public.agent_prompt_overrides
  for select to authenticated
  using (public.is_designated_admin(auth.uid()));
-- Writes are service-role only (admin server actions behind ensureAdmin()).

-- ─────────────────────────────────────────────────────────────────────────
-- 4 · content_approvals — the pending-until-Kate-approves queue
-- ─────────────────────────────────────────────────────────────────────────
-- Generic on purpose: Phase 5 (withBrandLock) will insert rows for any
-- AI-generated artefact (image, copy block, page section, social post…).

create table if not exists public.content_approvals (
  id           uuid primary key default gen_random_uuid(),
  -- Where the content is destined for, e.g. 'homepage-hero', 'social:instagram',
  -- 'customers/happy-tails/ops'. Free text so new surfaces need no migration.
  surface      text not null,
  -- What the artefact is: 'image', 'copy', 'video', 'html', 'document', …
  kind         text not null,
  -- Pointer into storage (Supabase Storage path or public URL) when the
  -- artefact is a file; inline artefacts can ride in payload instead.
  storage_path text,
  title        text,
  summary      text,
  payload      jsonb not null default '{}'::jsonb,
  -- Optional pilot scope, e.g. 'happy-tails'.
  tenant_slug  text,
  status       text not null default 'pending'
                 check (status in ('pending', 'approved', 'rejected')),
  created_by   text,
  reviewed_by  text,
  reviewed_at  timestamptz,
  review_note  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.content_approvals is
  'AI-generated content lands here as pending and only ships once approved in /admin/approvals. Generic hook for Phase 5 withBrandLock.';

create index if not exists content_approvals_status_idx
  on public.content_approvals (status, created_at desc);
create index if not exists content_approvals_tenant_idx
  on public.content_approvals (tenant_slug) where tenant_slug is not null;

alter table public.content_approvals enable row level security;

drop policy if exists content_approvals_admin_read on public.content_approvals;
create policy content_approvals_admin_read on public.content_approvals
  for select to authenticated
  using (public.is_designated_admin(auth.uid()));
-- Writes are service-role only (producers + the /admin review actions).

-- ─────────────────────────────────────────────────────────────────────────
-- 5 · bundles.sort_order — shelf ordering for the bundle CRUD
-- ─────────────────────────────────────────────────────────────────────────
-- bundles exists from 20260701093000_bundle_architecture.sql (earlier in the
-- chain), but guard anyway so a partially-applied environment never errors.

do $$
begin
  if to_regclass('public.bundles') is not null then
    alter table public.bundles add column if not exists sort_order integer not null default 100;
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────────────────
-- 6 · tenant_customers — additive pilot-console columns
-- ─────────────────────────────────────────────────────────────────────────
-- tenant_customers is created by several earlier pilot migrations (idempotent
-- CREATE IF NOT EXISTS in each); guard so this never assumes which ran.

do $$
begin
  if to_regclass('public.tenant_customers') is not null then
    -- Which lib/brand/configs entry the branded ops console renders with.
    alter table public.tenant_customers add column if not exists brand_config text;
    -- Whether the console shows demo seed data (concept pilots) or live-only.
    alter table public.tenant_customers add column if not exists demo_seed_enabled boolean not null default true;
  end if;
end $$;

commit;

-- ─────────────────────────────────────────────────────────────────────────
-- Verification
-- ─────────────────────────────────────────────────────────────────────────
--   select email, active from public.designated_admins;
--     → assembl@assembl.co.nz + kate@assembl.co.nz, active.
--   select public.is_designated_admin('00000000-0000-0000-0000-000000000000');
--     → false (no such user).
--   \d public.content_approvals / public.agent_prompt_overrides — RLS enabled,
--     one admin-read policy each, no write policies.
