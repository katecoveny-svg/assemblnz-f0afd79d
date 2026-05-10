/**
 * Read + refresh helpers for the kpi_evidence_summary materialised view.
 *
 * The view ships in supabase/migrations/<ts>_evidence_kpi_views.sql but
 * depends on assembl_audit_log (Day 7) and mana_receipts (Day 7.5).
 * Until those land, the view returns a single all-NULL row by design.
 *
 * If the view itself isn't applied yet, both helpers degrade to a mock
 * snapshot so the dashboard renders cleanly.
 */
import 'server-only';
import { createClient } from '@/lib/supabase/server';

export interface KpiSnapshot {
  computed_at: string;
  time_to_first_completed_case_minutes: number | null;
  citation_coverage_pct: number | null;
  approval_coverage_pct: number | null;
  action_reversal_rate_pct: number | null;
  cycle_time_reduction_pct: number | null;
  nrr_by_cohort_pct: number | null;
  high_risk_outputs_total: number;
  high_risk_outputs_with_citation: number;
  high_risk_actions_total: number;
  high_risk_actions_with_approval: number;
  agent_outputs_last_30d: number;
  agent_outputs_reversed_within_7d: number;
}

export interface LoadKpisResult {
  snapshot: KpiSnapshot | null;
  source: 'view' | 'mock';
  error?: string;
}

const MOCK_SNAPSHOT: KpiSnapshot = {
  computed_at: '2026-05-09T22:00:00.000Z',
  time_to_first_completed_case_minutes: 47,
  citation_coverage_pct: 96.4,
  approval_coverage_pct: 100.0,
  action_reversal_rate_pct: 1.8,
  cycle_time_reduction_pct: null,
  nrr_by_cohort_pct: null,
  high_risk_outputs_total: 142,
  high_risk_outputs_with_citation: 137,
  high_risk_actions_total: 53,
  high_risk_actions_with_approval: 53,
  agent_outputs_last_30d: 612,
  agent_outputs_reversed_within_7d: 11,
};

export async function loadKpiSnapshot(): Promise<LoadKpisResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('kpi_evidence_summary')
    .select('*')
    .order('computed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isMissingRelation(error)) {
      return { snapshot: MOCK_SNAPSHOT, source: 'mock' };
    }
    return { snapshot: null, source: 'view', error: error.message };
  }

  if (!data) {
    return { snapshot: MOCK_SNAPSHOT, source: 'mock' };
  }
  return { snapshot: data as KpiSnapshot, source: 'view' };
}

export async function refreshKpiSnapshot(): Promise<{
  ok: boolean;
  computed_at?: string;
  reason?: string;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('refresh_kpi_evidence_summary');
  if (error) {
    if (isMissingRelation(error)) {
      return {
        ok: false,
        reason:
          'kpi_evidence_summary view not yet applied — run the migration in this PR before refreshing',
      };
    }
    return { ok: false, reason: error.message };
  }
  return { ok: true, computed_at: typeof data === 'string' ? data : undefined };
}

function isMissingRelation(error: { code?: string; message?: string }): boolean {
  if (error.code === '42P01' || error.code === '42883' || error.code === '42703') return true;
  const m = (error.message ?? '').toLowerCase();
  return (
    m.includes('does not exist') ||
    m.includes('could not find the function') ||
    m.includes('could not find the table')
  );
}
