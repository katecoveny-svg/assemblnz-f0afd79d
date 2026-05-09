-- Evidence ledger settings — per-tenant retention + verifier + cite-uncertain policy.
-- Spec: outputs/IMPLEMENTATION-PLAN-VERTICAL-AI-STRATEGY-2026-05-09.md (§5, §3 Phase 1).
--
-- Schema-first scaffold: this migration assumes the tenants table from PR #79
-- (feat/toro-tenants-migration) is already applied. If it isn't, this migration
-- short-circuits without erroring so the rest of the project still installs
-- cleanly. The Phase 1 settings page also gracefully degrades when the column
-- is missing (see app/app/admin/evidence/settings/page.tsx).
--
-- The default JSONB structure stored in tenants.evidence_settings:
--   {
--     "retention": {
--       "receipts_months": 84,             // 7 years (Customs Act s.405 / TAA)
--       "audit_log_months": 84,            // 7 years
--       "min_months": 12,
--       "max_months": 360                  // 30 years cap
--     },
--     "public_verifier": "off",            // "on" | "off"
--     "cite_when_uncertain": "always_cite" // "always_cite" | "flag_for_human"
--   }
--
-- Idempotent.

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'tenants'
  ) then
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'tenants'
        and column_name = 'evidence_settings'
    ) then
      alter table public.tenants
        add column evidence_settings jsonb not null default '{}'::jsonb;
    end if;
  else
    raise notice
      'tenants table not present yet — evidence_settings column skipped. '
      'Re-run this migration after PR #79 applies.';
  end if;
end $$;
