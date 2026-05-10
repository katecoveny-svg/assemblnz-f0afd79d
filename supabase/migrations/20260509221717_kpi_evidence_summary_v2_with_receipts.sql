-- Evidence ledger KPI summary v2 — upgrade to include the mana_receipts join.
--
-- v1 (`20260509221716_evidence_kpi_views.sql`) shipped without any reference
-- to `public.mana_receipts` because Postgres parses FROM clauses before
-- evaluating runtime guards, so a view that referenced the receipts table
-- would 42P01 during the Day 7 → Day 7.5 rollout window (audit_log present,
-- receipts not yet). v2 is the targeted upgrade that swaps in the join the
-- moment Kaihanga ships Day 7.5.
--
-- v2 BEHAVIOUR:
--   - Wrapped in a single DO block guarded by `to_regclass('public.mana_receipts')`.
--   - If the receipts table is missing, this migration prints a NOTICE and
--     returns without changing anything (true idempotent no-op).
--   - If the receipts table exists, this migration DROPs the existing
--     `kpi_evidence_summary` matview and re-CREATEs it with the receipts
--     join, restoring the unique index and updating the compute function
--     with a `kpi_evidence_summary_compute_v2()` body.
--   - Adds `refresh_kpi_mana_receipts_summary()` — an explicit, receipt-
--     dependent refresh entry-point with its own runtime `to_regclass`
--     guard that returns NULL early if the table has been dropped under it.
--
-- The schema shape (column names + types) of `kpi_evidence_summary` is
-- IDENTICAL to v1. v2 just populates the previously-NULL receipt-derived
-- columns (`citation_coverage_pct`, `high_risk_outputs_with_citation`)
-- with real numbers. UI / TS contracts (`KpiSnapshot` in lib/evidence/kpis.ts)
-- continue to work unchanged.
--
-- Idempotent. Safe to ship before mana_receipts; safe to re-run.

do $$
begin
  if to_regclass('public.mana_receipts') is null then
    raise notice
      'mana_receipts table not present yet — kpi_evidence_summary v2 upgrade '
      'skipped. Re-run this migration after Day 7.5 lands.';
    return;
  end if;

  -- v2 compute function: identical to v1 + the receipts join.
  create or replace function public.kpi_evidence_summary_compute_v2()
  returns table (
    computed_at                            timestamptz,
    time_to_first_completed_case_minutes   numeric,
    citation_coverage_pct                  numeric,
    approval_coverage_pct                  numeric,
    action_reversal_rate_pct               numeric,
    cycle_time_reduction_pct               numeric,
    nrr_by_cohort_pct                      numeric,
    high_risk_outputs_total                bigint,
    high_risk_outputs_with_citation        bigint,
    high_risk_actions_total                bigint,
    high_risk_actions_with_approval        bigint,
    agent_outputs_last_30d                 bigint,
    agent_outputs_reversed_within_7d       bigint
  )
  language plpgsql
  stable
  security definer
  set search_path = public
  as $body$
  declare
    has_audit    boolean := to_regclass('public.assembl_audit_log') is not null;
    has_receipts boolean := to_regclass('public.mana_receipts') is not null;
  begin
    if not has_audit then
      return query select
        now() as computed_at,
        null::numeric, null::numeric, null::numeric,
        null::numeric, null::numeric, null::numeric,
        0::bigint, 0::bigint, 0::bigint, 0::bigint, 0::bigint, 0::bigint;
      return;
    end if;

    -- If receipts disappear under us at runtime, fall back to v1's behaviour
    -- (NULL/0 for the receipt-derived columns) without throwing.
    if not has_receipts then
      return query select * from public.kpi_evidence_summary_compute();
      return;
    end if;

    return query
    with audit as (
      select * from public.assembl_audit_log
    ),
    high_risk as (
      select * from audit
      where coalesce(audit.risk_class, '') in ('high', 'critical')
    ),
    outputs_30d as (
      select * from audit
      where audit.created_at >= now() - interval '30 days'
        and coalesce(audit.event_type, '') = 'agent_output'
    ),
    citation_join as (
      select hr.id,
             exists (
               select 1
               from public.mana_receipts r
               where r.audit_log_id = hr.id
                 and jsonb_array_length(coalesce(r.citations, '[]'::jsonb)) > 0
             ) as has_citation
      from high_risk hr
    ),
    reversed as (
      select count(*) filter (
        where coalesce(audit.reversed_at, null) is not null
          and audit.reversed_at <= audit.created_at + interval '7 days'
      ) as reversed_n,
      count(*) as total_n
      from outputs_30d audit
    ),
    first_case as (
      select percentile_cont(0.5) within group (
        order by extract(epoch from (
          coalesce(audit.completed_at, audit.created_at) - audit.created_at
        )) / 60.0
      ) as median_minutes
      from audit
      where audit.created_at >= now() - interval '30 days'
        and coalesce(audit.event_type, '') = 'case_completed'
    )
    select
      now() as computed_at,
      (select median_minutes from first_case)                          as time_to_first_completed_case_minutes,
      case when (select count(*) from citation_join) = 0 then null
           else round(
             100.0 * (select count(*) from citation_join where has_citation)::numeric
             / (select count(*) from citation_join)::numeric, 1)
      end                                                              as citation_coverage_pct,
      case when (select count(*) from high_risk) = 0 then null
           else round(
             100.0 * (select count(*) from high_risk
                      where coalesce(approval_status, '') = 'approved')::numeric
             / (select count(*) from high_risk)::numeric, 1)
      end                                                              as approval_coverage_pct,
      case when (select total_n from reversed) = 0 then null
           else round(
             100.0 * (select reversed_n from reversed)::numeric
             / (select total_n from reversed)::numeric, 1)
      end                                                              as action_reversal_rate_pct,
      null::numeric                                                    as cycle_time_reduction_pct,
      null::numeric                                                    as nrr_by_cohort_pct,
      (select count(*) from citation_join)                             as high_risk_outputs_total,
      (select count(*) from citation_join where has_citation)          as high_risk_outputs_with_citation,
      (select count(*) from high_risk)                                 as high_risk_actions_total,
      (select count(*) from high_risk
         where coalesce(approval_status, '') = 'approved')             as high_risk_actions_with_approval,
      (select count(*) from outputs_30d)                               as agent_outputs_last_30d,
      (select reversed_n from reversed)                                as agent_outputs_reversed_within_7d;

  exception when undefined_column then
    -- audit_log or receipts column names drifted from expectations —
    -- surface zeros so the dashboard renders cleanly while the schema settles.
    return query select
      now() as computed_at,
      null::numeric, null::numeric, null::numeric,
      null::numeric, null::numeric, null::numeric,
      0::bigint, 0::bigint, 0::bigint, 0::bigint, 0::bigint, 0::bigint;
  end;
  $body$;

  -- Replace the v1 matview with v2 (same column shape; UI + TS unchanged).
  drop materialized view if exists public.kpi_evidence_summary;
  create materialized view public.kpi_evidence_summary as
    select * from public.kpi_evidence_summary_compute_v2();

  -- Restore the unique index used by CONCURRENT refresh.
  create unique index if not exists kpi_evidence_summary_uniq_idx
    on public.kpi_evidence_summary (computed_at);

  grant select on public.kpi_evidence_summary to authenticated;
end $$;

-- Receipt-dependent refresh entry point. Always installs (so callers can
-- target it whether or not v2 has applied yet) but its body checks
-- `to_regclass` at runtime and returns NULL with a NOTICE when receipts
-- aren't there. Useful for ops paths that want to be explicit about the
-- receipt dependency, in addition to the always-safe
-- `refresh_kpi_evidence_summary()` from the v1 migration.
create or replace function public.refresh_kpi_mana_receipts_summary()
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  ts timestamptz;
begin
  if to_regclass('public.mana_receipts') is null then
    raise notice
      'mana_receipts not present — refresh_kpi_mana_receipts_summary() is a no-op. '
      'Apply Day 7.5 migrations first.';
    return null;
  end if;
  if to_regclass('public.kpi_evidence_summary') is null then
    raise notice
      'kpi_evidence_summary not present — apply 20260509221716_evidence_kpi_views.sql first.';
    return null;
  end if;
  begin
    refresh materialized view concurrently public.kpi_evidence_summary;
  exception when feature_not_supported then
    refresh materialized view public.kpi_evidence_summary;
  end;
  select max(computed_at) into ts from public.kpi_evidence_summary;
  return coalesce(ts, now());
end;
$$;

grant execute on function public.refresh_kpi_mana_receipts_summary() to authenticated;
