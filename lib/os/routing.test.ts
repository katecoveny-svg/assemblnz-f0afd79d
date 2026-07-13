import { describe, expect, it } from 'vitest';
import {
  MODEL_CANDIDATES,
  routeModel,
  type TaskRequirements,
} from './routing';

const allAvailable = () => true;

const base: TaskRequirements = {
  capabilities: ['reasoning', 'tool_use', 'structured_output'],
  riskLevel: 'high',
  latencyPreference: 'background',
  qualityPreference: 'balanced',
  dataClassification: 'internal',
  estimatedValue: 'medium',
  requiresIndependentVerification: false,
};

describe('routeModel', () => {
  it('prefers the production Claude primary with priors only', () => {
    const { ladder } = routeModel({ requirements: base, isAvailable: allAvailable });
    expect(ladder[0]).toBe('claude-sonnet-5');
    expect(ladder.length).toBeGreaterThan(1);
  });

  it('measured workflow accuracy outranks the quality prior', () => {
    const { ladder } = routeModel({
      requirements: base,
      workflow: 'enquiry-reply',
      isAvailable: allAvailable,
      stats: [
        { model: 'gpt-5.6-terra', workflow: 'enquiry-reply', accuracy: 0.95, toolSuccess: 1, hallucinationRate: 0, avgLatencyMs: 900, avgCostNzd: 0.01 },
        { model: 'claude-sonnet-5', workflow: 'enquiry-reply', accuracy: 0.7, toolSuccess: 1, hallucinationRate: 0.1, avgLatencyMs: 900, avgCostNzd: 0.01 },
      ],
    });
    expect(ladder[0]).toBe('gpt-5.6-terra');
  });

  it('respects the privacy ceiling — restricted data never leaves approved providers', () => {
    const { ladder } = routeModel({
      requirements: { ...base, dataClassification: 'restricted' },
      isAvailable: allAvailable,
    });
    for (const id of ladder) {
      const c = MODEL_CANDIDATES.find((m) => m.id === id)!;
      expect(c.maxDataClassification).toBe('restricted');
    }
    expect(ladder).not.toContain('gpt-5.6-terra');
    expect(ladder).not.toContain('gemini-3.5-flash');
  });

  it('respects tenant provider policy', () => {
    const { ladder } = routeModel({
      requirements: base,
      isAvailable: allAvailable,
      tenantPolicy: { allowedProviders: ['google'] },
    });
    expect(ladder).toEqual(['gemini-3.5-flash']);
  });

  it('keeps experimental providers out until they win the workflow', () => {
    const without = routeModel({ requirements: base, isAvailable: allAvailable });
    expect(without.ladder).not.toContain('grok-4');

    const winning = routeModel({
      requirements: base,
      workflow: 'enquiry-reply',
      isAvailable: allAvailable,
      stats: [
        { model: 'grok-4', workflow: 'enquiry-reply', accuracy: 0.98, toolSuccess: 1, hallucinationRate: 0, avgLatencyMs: 500, avgCostNzd: 0.005 },
        { model: 'claude-sonnet-5', workflow: 'enquiry-reply', accuracy: 0.8, toolSuccess: 1, hallucinationRate: 0, avgLatencyMs: 900, avgCostNzd: 0.01 },
      ],
    });
    expect(winning.ladder).toContain('grok-4');
  });

  it('realtime voice routes to the realtime candidate only', () => {
    const { ladder } = routeModel({
      requirements: {
        ...base,
        capabilities: ['realtime_voice'],
        latencyPreference: 'realtime',
        dataClassification: 'internal',
      },
      isAvailable: allAvailable,
      // GPT-Live is experimental — it needs a measurement to route
      workflow: 'voice-chief-of-staff',
      stats: [
        { model: 'gpt-live', workflow: 'voice-chief-of-staff', accuracy: 0.9, toolSuccess: null, hallucinationRate: null, avgLatencyMs: 300, avgCostNzd: 0.02 },
      ],
    });
    expect(ladder).toEqual(['gpt-live']);
  });

  it('failure rates on the ledger demote a model', () => {
    const { ladder } = routeModel({
      requirements: base,
      isAvailable: allAvailable,
      failureRates: { 'claude-sonnet-5': 0.9 },
    });
    expect(ladder[0]).not.toBe('claude-sonnet-5');
  });

  it('independent verification puts a second provider at rung two', () => {
    const { ladder } = routeModel({
      requirements: { ...base, requiresIndependentVerification: true },
      isAvailable: allAvailable,
    });
    const first = MODEL_CANDIDATES.find((m) => m.id === ladder[0])!;
    const second = MODEL_CANDIDATES.find((m) => m.id === ladder[1])!;
    expect(first.provider).not.toBe(second.provider);
  });

  it('unavailable providers never appear', () => {
    const { ladder } = routeModel({
      requirements: base,
      isAvailable: (c) => c.provider === 'anthropic',
    });
    for (const id of ladder) expect(id.startsWith('claude')).toBe(true);
  });
});
