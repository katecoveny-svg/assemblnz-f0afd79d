-- Rename existing platform-tenant tables out of the way for Tōro multi-tenant.
-- Spec context: outputs/TORO-MULTI-TENANT-CHATWOOT-ARCHITECTURE-2026-05-09.md
-- Decision context: see PR description for the conflict diagnosis + rationale.
--
-- The existing `tenants` and `tenant_members` tables in this database were
-- scaffolded as a B2B platform-customer concept (1 bootstrap row "Assembl",
-- columns: name / plan='trial' / billing_email / credit_nzd / kete_primary
-- / brand_color / website_url / logo_url / onboarding_complete / status).
-- The Tōro spec (locked 2026-05-09) re-uses the table name `tenants` for a
-- DIFFERENT concept — household tenants for the consumer Tōro plugin.
--
-- This migration moves the existing platform-tenant tables out of the way so
-- the Tōro migration (20260508204928_toro_tenants.sql, already in repo) can
-- run cleanly against fresh table names.
--
-- Timestamp prefix 20260508120000 places this BEFORE the Tōro migration
-- (20260508204928), so when migrations apply in order, the rename runs first.
--
-- Idempotent: each rename is wrapped in `if exists` checks so re-running is safe.

begin;

-- ─── tenants → platform_orgs ────────────────────────────────────────────────
do $$
begin
  if exists (
    select 1 from pg_class
    where relname = 'tenants'
      and relnamespace = (select oid from pg_namespace where nspname = 'public')
      -- Only rename if it still has the old platform-tenant schema (has billing_email column).
      -- This guards against accidentally renaming the new Tōro tenants table on a fresh project.
      and exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'tenants' and column_name = 'billing_email'
      )
  ) then
    alter table public.tenants rename to platform_orgs;
    raise notice 'Renamed tenants → platform_orgs';
  else
    raise notice 'tenants table not present with old schema — skipping rename (likely already renamed or fresh project)';
  end if;
end $$;

-- ─── tenant_members → platform_org_members ─────────────────────────────────
-- The existing tenant_members has a role CHECK constraint with platform-roles
-- ('admin','manager','operator','viewer','trial') — distinct from the Tōro
-- spec's roles ('owner','admin','member'). Detect by that signature.
do $$
begin
  if exists (
    select 1 from pg_constraint c
    join pg_class r on r.oid = c.conrelid
    where r.relname = 'tenant_members'
      and r.relnamespace = (select oid from pg_namespace where nspname = 'public')
      and c.conname = 'tenant_members_role_check'
      and pg_get_constraintdef(c.oid) like '%manager%'
  ) then
    alter table public.tenant_members rename to platform_org_members;
    raise notice 'Renamed tenant_members → platform_org_members';
  else
    raise notice 'tenant_members not present with old role signature — skipping rename';
  end if;
end $$;

-- ─── Rename explicitly-named constraints/indexes on the renamed tables ─────
-- Postgres auto-updates FK references to the new table name, but the
-- *constraint names themselves* stay literal. Rename the most visible ones
-- for clarity in pg_constraint / pg_indexes.

do $$
begin
  -- platform_orgs: PK + slug unique
  if exists (select 1 from pg_constraint where conname = 'tenants_pkey') then
    alter table public.platform_orgs rename constraint tenants_pkey to platform_orgs_pkey;
  end if;
  if exists (select 1 from pg_constraint where conname = 'tenants_slug_unique') then
    alter table public.platform_orgs rename constraint tenants_slug_unique to platform_orgs_slug_unique;
  end if;

  -- platform_org_members: PK + role check + FKs + unique
  if exists (select 1 from pg_constraint where conname = 'tenant_members_pkey') then
    alter table public.platform_org_members rename constraint tenant_members_pkey to platform_org_members_pkey;
  end if;
  if exists (select 1 from pg_constraint where conname = 'tenant_members_role_check') then
    alter table public.platform_org_members rename constraint tenant_members_role_check to platform_org_members_role_check;
  end if;
  if exists (select 1 from pg_constraint where conname = 'tenant_members_tenant_id_fkey') then
    alter table public.platform_org_members rename constraint tenant_members_tenant_id_fkey to platform_org_members_org_id_fkey;
  end if;
  if exists (select 1 from pg_constraint where conname = 'tenant_members_user_id_fkey') then
    alter table public.platform_org_members rename constraint tenant_members_user_id_fkey to platform_org_members_user_id_fkey;
  end if;
  if exists (select 1 from pg_constraint where conname = 'tenant_members_tenant_id_user_id_key') then
    alter table public.platform_org_members rename constraint tenant_members_tenant_id_user_id_key to platform_org_members_org_user_unique;
  end if;
exception when undefined_table then
  raise notice 'Constraint rename block: target table not present, skipping';
end $$;

-- Rename loose indexes (not backed by constraints).
do $$
begin
  if exists (select 1 from pg_indexes where indexname = 'idx_tenant_members_tenant_id' and schemaname = 'public') then
    alter index public.idx_tenant_members_tenant_id rename to idx_platform_org_members_org_id;
  end if;
  if exists (select 1 from pg_indexes where indexname = 'idx_tenant_members_user_id' and schemaname = 'public') then
    alter index public.idx_tenant_members_user_id rename to idx_platform_org_members_user_id;
  end if;
end $$;

-- ─── Rename existing RLS policies on the renamed tables ─────────────────────
-- Old policy names contained "Tenant" / "members" — rename to be unambiguous.
-- Postgres requires `alter policy ... rename to ...` and policies attach to
-- the renamed table automatically, but we want clearer names.
do $$
begin
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'platform_org_members'
      and policyname = 'Tenant members can view their tenant'
  ) then
    alter policy "Tenant members can view their tenant"
      on public.platform_org_members
      rename to "Platform org members can view their org";
  end if;
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'platform_org_members'
      and policyname = 'Users can view their memberships'
  ) then
    alter policy "Users can view their memberships"
      on public.platform_org_members
      rename to "Users can view their platform_org memberships";
  end if;
end $$;

commit;

-- ─── Verification queries (run after apply) ─────────────────────────────────
--   SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename IN ('platform_orgs','platform_org_members','tenants','tenant_members');
--     -- expect: platform_orgs, platform_org_members (NO tenants, NO tenant_members yet — Tōro migration creates them next)
--   SELECT COUNT(*) FROM platform_orgs;             -- expect 1 (the bootstrap row "Assembl")
--   SELECT COUNT(*) FROM platform_org_members;      -- expect 0
--   SELECT conname FROM pg_constraint WHERE conrelid = 'public.platform_orgs'::regclass;
--   SELECT conname FROM pg_constraint WHERE conrelid = 'public.platform_org_members'::regclass;
--
-- After this migration AND the Tōro migration both apply, the following layout exists:
--   • platform_orgs                — old B2B platform-customer concept (frozen)
--   • platform_org_members         — old B2B platform-customer membership
--   • tenants                      — NEW: Tōro household tenants
--   • tenant_members               — NEW: Tōro household membership
--   • tenant_invitations           — NEW: Tōro invitations
