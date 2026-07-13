/**
 * Live routing wrapper — feeds the pure router real measurements.
 *
 * Loads this workflow's eval results (model_workflow_stats, written by
 * scripts/run-os-evals.ts) and each model's recent failure ratio from the
 * model_calls ledger, then routes. Fail-soft: with no measurements the
 * router falls back to priors and the ladder still resolves.
 */
import 'server-only';
import { getServiceClient } from '@/lib/supabase/service';
import {
  routeModel,
  type RouteDecision,
  type TaskRequirements,
  type TenantModelPolicy,
  type WorkflowStat,
} from './routing';

async function loadWorkflowStats(workflow: string): Promise<WorkflowStat[]> {
  try {
    const supabase = getServiceClient();
    const { data } = await supabase
      .from('model_workflow_stats')
      .select('model, workflow, accuracy, tool_success, hallucination_rate, avg_latency_ms, avg_cost_nzd')
      .eq('workflow', workflow)
      .order('run_at', { ascending: false })
      .limit(40);
    const latest = new Map<string, WorkflowStat>();
    for (const r of data ?? []) {
      if (!latest.has(r.model as string)) {
        latest.set(r.model as string, {
          model: r.model as string,
          workflow: r.workflow as string,
          accuracy: Number(r.accuracy),
          toolSuccess: r.tool_success == null ? null : Number(r.tool_success),
          hallucinationRate: r.hallucination_rate == null ? null : Number(r.hallucination_rate),
          avgLatencyMs: r.avg_latency_ms == null ? null : Number(r.avg_latency_ms),
          avgCostNzd: r.avg_cost_nzd == null ? null : Number(r.avg_cost_nzd),
        });
      }
    }
    return Array.from(latest.values());
  } catch {
    return [];
  }
}

async function loadFailureRates(): Promise<Record<string, number>> {
  try {
    const supabase = getServiceClient();
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('model_calls')
      .select('model, ok')
      .gte('created_at', since)
      .limit(1000);
    const totals = new Map<string, { n: number; failed: number }>();
    for (const r of data ?? []) {
      const t = totals.get(r.model as string) ?? { n: 0, failed: 0 };
      t.n += 1;
      if (!r.ok) t.failed += 1;
      totals.set(r.model as string, t);
    }
    const out: Record<string, number> = {};
    for (const [model, t] of totals) if (t.n >= 5) out[model] = t.failed / t.n;
    return out;
  } catch {
    return {};
  }
}

/** Route a workflow's task with live measurements. */
export async function routeForWorkflow(
  workflow: string,
  requirements: TaskRequirements,
  tenantPolicy?: TenantModelPolicy,
): Promise<RouteDecision> {
  const [stats, failureRates] = await Promise.all([loadWorkflowStats(workflow), loadFailureRates()]);
  return routeModel({ requirements, workflow, stats, failureRates, tenantPolicy });
}
