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

/** Operator outcomes (Phase 5): approval rate per model on this workflow —
 *  the strongest real-world signal there is. Blended into accuracy. */
async function loadOutcomeRates(workflow: string): Promise<Record<string, number>> {
  try {
    const supabase = getServiceClient();
    const { data } = await supabase
      .from('os_outcomes')
      .select('model, score')
      .eq('workflow', workflow)
      .order('created_at', { ascending: false })
      .limit(300);
    const agg = new Map<string, { n: number; sum: number }>();
    for (const r of data ?? []) {
      if (!r.model) continue;
      const a = agg.get(r.model as string) ?? { n: 0, sum: 0 };
      a.n += 1;
      a.sum += Number(r.score);
      agg.set(r.model as string, a);
    }
    const out: Record<string, number> = {};
    for (const [model, a] of agg) if (a.n >= 3) out[model] = a.sum / a.n;
    return out;
  } catch {
    return {};
  }
}

/** Route a workflow's task with live measurements: eval accuracy blended
 *  with real operator-approval outcomes (70/30 when both exist). */
export async function routeForWorkflow(
  workflow: string,
  requirements: TaskRequirements,
  tenantPolicy?: TenantModelPolicy,
): Promise<RouteDecision> {
  const [stats, failureRates, outcomes] = await Promise.all([
    loadWorkflowStats(workflow),
    loadFailureRates(),
    loadOutcomeRates(workflow),
  ]);
  const blended: WorkflowStat[] = stats.map((s) => {
    const outcome = outcomes[s.model];
    return outcome === undefined
      ? s
      : { ...s, accuracy: +(s.accuracy * 0.7 + outcome * 0.3).toFixed(3) };
  });
  for (const [model, rate] of Object.entries(outcomes)) {
    if (!blended.some((s) => s.model === model)) {
      blended.push({
        model,
        workflow,
        accuracy: rate,
        toolSuccess: null,
        hallucinationRate: null,
        avgLatencyMs: null,
        avgCostNzd: null,
      });
    }
  }
  return routeModel({ requirements, workflow, stats: blended, failureRates, tenantPolicy });
}
