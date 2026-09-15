import { describe, expect, it } from 'vitest';
import { evaluateImprovement, type ImprovementCandidate } from './improvement';

const candidate = (overrides: Partial<ImprovementCandidate> = {}): ImprovementCandidate => ({
  key: 'builder-do',
  kind: 'skill',
  baselineRef: 'skill:v1',
  candidateRef: 'skill:v2',
  baseline: { cases: 20, accuracy: 0.8, toolSuccess: 0.9, hallucinationRate: 0.04, avgLatencyMs: 2000, avgCostNzd: 0.04 },
  candidate: { cases: 20, accuracy: 0.84, toolSuccess: 0.92, hallucinationRate: 0.03, avgLatencyMs: 1800, avgCostNzd: 0.038 },
  ...overrides,
});

describe('evaluateImprovement', () => {
  it('promotes a measured improvement without widening authority', () => {
    expect(evaluateImprovement(candidate()).decision).toBe('promote');
  });

  it('rejects security regressions even when quality improves', () => {
    expect(evaluateImprovement(candidate({ securityRegression: true })).decision).toBe('reject');
  });

  it('rejects authority expansion', () => {
    expect(evaluateImprovement(candidate({ expandsAuthority: true })).decision).toBe('reject');
  });

  it('holds under-evaluated candidates', () => {
    expect(evaluateImprovement(candidate({ candidate: { cases: 2, accuracy: 0.95 } })).decision).toBe('hold');
  });

  it('requires independent review for high-risk workflows', () => {
    expect(evaluateImprovement(candidate({ highRiskWorkflow: true, independentlyReviewed: false })).decision).toBe('hold');
  });
});
