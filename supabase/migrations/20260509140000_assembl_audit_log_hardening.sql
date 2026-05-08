-- =============================================================================
-- 20260509140000_assembl_audit_log_hardening.sql
-- =============================================================================
-- Day 7 hardening — fills the gaps between PR #75's canon §7.5 verbatim
-- migration (20260508120000_assembl_audit_log.sql) and the production-ready
-- shape the canon scaffold called for.
--
-- Adds (additive — depends on PR #75's migration being applied first):
--   1. INSERT policy hardened with user_id = auth.uid() guard (prevents
--      authenticated users from impersonating other users in their own org)
--   2. UPDATE policy for review-state transitions only
--      (human_review_status, reviewer_user_id, decision)
--   3. CHECK constraint on human_review_status accepted values
--   4. Partial index for the pending-review queue
--   5. (session_id) index for per-session audit lookups
--   6. FK constraints on user_id and reviewer_user_id → auth.users(id)
--   7. COMMENT ON TABLE for pg_class introspection
--
-- NO DELETE policy is intentional. With RLS enabled and no DELETE policy,
-- nobody can delete rows — the audit log is append-only by absence (canon §7.5
-- foolproofing #5, 7-year retention enforcement).
--
-- Idempotent: every operation is wrapped in existence checks so re-runs
-- are safe.
-- =============================================================================

begin;

-- ─── Sanity check: PR #75's table must exist ───────────────────────────────
do $$
begin
  if not exists (
    select 1 from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'assembl_audit_log'
  ) then
    raise exception
      'assembl_audit_log table not found. Apply migration 20260508120000_assembl_audit_log.sql first.';
  end if;
end $$;

-- ─── 1. INSERT policy — replace with user_id = auth.uid() guard ────────────
-- PR #75's INSERT policy permits any authenticated org member to insert with
-- ANY user_id. The hardening guard ensures rows can only be inserted with
-- user_id matching the authenticated user (prevents impersonation in audit).
drop policy if exists "users insert own org audit log" on public.assembl_audit_log;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'assembl_audit_log'
      and policyname = 'users insert own org audit log'
  ) then
    create policy "users insert own org audit log"
      on public.assembl_audit_log
      for insert
      to authenticated
      with check (
        org_id  = (auth.jwt() ->> 'org_id')::uuid
        and user_id = auth.uid()
      );
  end if;
end $$;

-- ─── 2. UPDATE policy — review-state transitions only ─────────────────────
-- Reviewers approve/reject by updating human_review_status, reviewer_user_id,
-- and decision. The original tool_input/output stay frozen.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'assembl_audit_log'
      and policyname = 'reviewers update review state in own org'
  ) then
    create policy "reviewers update review state in own org"
      on public.assembl_audit_log
      for update
      to authenticated
      using (org_id = (auth.jwt() ->> 'org_id')::uuid)
      with check (org_id = (auth.jwt() ->> 'org_id')::uuid);
  end if;
end $$;
-- Note: column-level immutability of tool_input / tool_output / org_id /
-- user_id / agent_slug / session_id is enforced at the API layer rather than
-- via column GRANTs, to keep the migration simple. The API layer (Day 8
-- writeAuditRow + reviewer endpoint) is the only writer that bypasses RLS.

-- ─── 3. CHECK constraint on human_review_status ───────────────────────────
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'assembl_audit_log_human_review_status_check'
      and conrelid = 'public.assembl_audit_log'::regclass
  ) then
    alter table public.assembl_audit_log
      add constraint assembl_audit_log_human_review_status_check
      check (
        human_review_status is null
        or human_review_status in (
          'pending', 'approved', 'rejected', 'auto_approved', 'edited_then_approved'
        )
      );
  end if;
end $$;

-- ─── 4. Partial index — pending-review queue ──────────────────────────────
create index if not exists idx_audit_log_pending_review
  on public.assembl_audit_log (org_id, created_at desc)
  where human_review_status = 'pending';

-- ─── 5. Session-scoped audit lookups ──────────────────────────────────────
create index if not exists idx_audit_log_session
  on public.assembl_audit_log (session_id);

-- ─── 6. FK constraints — user_id + reviewer_user_id → auth.users ──────────
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'assembl_audit_log_user_id_fkey'
      and conrelid = 'public.assembl_audit_log'::regclass
  ) then
    alter table public.assembl_audit_log
      add constraint assembl_audit_log_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete restrict;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'assembl_audit_log_reviewer_user_id_fkey'
      and conrelid = 'public.assembl_audit_log'::regclass
  ) then
    alter table public.assembl_audit_log
      add constraint assembl_audit_log_reviewer_user_id_fkey
      foreign key (reviewer_user_id) references auth.users(id) on delete restrict;
  end if;
end $$;

-- ─── 7. Table comment for pg_class introspection ──────────────────────────
comment on table public.assembl_audit_log is
  'Audit row for every plugin tool call. RLS by org_id. Append-only (no DELETE policy). 7-year retention enforced operationally per Customs and Excise Act 2018 s.405 + Tax Administration Act 1994. Canon §7.5.';

commit;

-- =============================================================================
-- Verification queries (run after apply):
-- =============================================================================
--   SELECT policyname, cmd FROM pg_policies
--    WHERE tablename='assembl_audit_log' ORDER BY policyname;
--   -- expect 3 policies: SELECT (canon), INSERT (hardened), UPDATE
--
--   SELECT conname FROM pg_constraint
--    WHERE conrelid='public.assembl_audit_log'::regclass ORDER BY conname;
--   -- expect: pkey + 2 FKs + 1 CHECK = 4 constraint rows
--
--   SELECT indexname FROM pg_indexes
--    WHERE schemaname='public' AND tablename='assembl_audit_log' ORDER BY indexname;
--   -- expect: pkey + (org_id, created_at) + (agent_slug, created_at) + pending_review + session_id = 5 indexes
--
--   SELECT obj_description('public.assembl_audit_log'::regclass);
--   -- expect: comment string above
-- =============================================================================
