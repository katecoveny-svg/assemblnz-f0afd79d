export type ImprovementMetrics = {
  cases: number;
  accuracy: number;
  toolSuccess?: number | null;
  hallucinationRate?: number | null;
  avgLatencyMs?: number | null;
  avgCostNzd?: number | null;
};

export type ImprovementCandidate = {
  key: string;
  kind: 'skill' | 'prompt' | 'routing' | 'tool';
  baselineRef: string;
  candidateRef: string;
  baseline: ImprovementMetrics;
  candidate: ImprovementMetrics;
  expandsAuthority?: boolean;
  securityRegression?: boolean;
  highRiskWorkflow?: boolean;
  independentlyReviewed?: boolean;
};

export type ImprovementDecision = {
  decision: 'promote' | 'hold' | 'reject';
  reasons: string[];
};

/**
 * Safe self-improvement gate. Builderdoo may propose/evaluate changes, but a
 * candidate only earns promotion when measured evidence beats the baseline
 * without widening authority or regressing safety. Promotion still means
 * "prepare a reviewable change", never self-modify production directly.
 */
export function evaluateImprovement(input: ImprovementCandidate): ImprovementDecision {
  const reasons: string[] = [];
  const { baseline, candidate } = input;

  if (input.securityRegression) return { decision: 'reject', reasons: ['security regression detected'] };
  if (input.expandsAuthority) return { decision: 'reject', reasons: ['candidate expands agent authority'] };
  const valid = (metrics: ImprovementMetrics) =>
    Number.isInteger(metrics.cases) && metrics.cases >= 5 &&
    [metrics.accuracy, metrics.toolSuccess, metrics.hallucinationRate].every(value =>
      typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1) &&
    [metrics.avgLatencyMs, metrics.avgCostNzd].every(value =>
      typeof value === 'number' && Number.isFinite(value) && value >= 0);
  if (!valid(baseline) || !valid(candidate)) return { decision: 'hold', reasons: ['complete, finite baseline and candidate measurements are required'] };
  if (candidate.accuracy < baseline.accuracy) return { decision: 'reject', reasons: ['accuracy regressed'] };
  if (input.highRiskWorkflow && !input.independentlyReviewed) return { decision: 'hold', reasons: ['high-risk workflow requires independent review'] };

  const hallucinationDelta = (candidate.hallucinationRate ?? 0) - (baseline.hallucinationRate ?? 0);
  if (hallucinationDelta > 0.01) return { decision: 'reject', reasons: ['hallucination rate regressed'] };

  const toolDelta = (candidate.toolSuccess ?? 1) - (baseline.toolSuccess ?? 1);
  if (toolDelta < -0.02) return { decision: 'reject', reasons: ['tool success regressed'] };

  const accuracyGain = candidate.accuracy - baseline.accuracy;
  const costBase = baseline.avgCostNzd ?? 0;
  const costCandidate = candidate.avgCostNzd ?? costBase;
  const costIncrease = costBase > 0 ? (costCandidate - costBase) / costBase : 0;
  const latencyBase = baseline.avgLatencyMs ?? 0;
  const latencyCandidate = candidate.avgLatencyMs ?? latencyBase;
  const latencyImproved = latencyBase > 0 && latencyCandidate <= latencyBase * 0.9;
  const costImproved = costBase > 0 && costCandidate <= costBase * 0.9;

  if (costIncrease > 0.25 && accuracyGain < 0.05) {
    return { decision: 'hold', reasons: ['cost increased more than 25% without a material accuracy gain'] };
  }

  if (accuracyGain >= 0.02) reasons.push(`accuracy improved by ${(accuracyGain * 100).toFixed(1)} points`);
  if (toolDelta > 0.01) reasons.push('tool success improved');
  if (latencyImproved) reasons.push('latency improved by at least 10%');
  if (costImproved) reasons.push('cost improved by at least 10%');

  if (!reasons.length) return { decision: 'hold', reasons: ['candidate did not materially beat the baseline'] };
  return { decision: 'promote', reasons };
}
