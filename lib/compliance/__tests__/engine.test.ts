import { describe, expect, it } from 'vitest';
import { ComplianceEngine } from '../engine';
import { AUAHA_POLICIES } from '../policies/auaha';
import { CLINIC_POLICIES } from '../policies/clinic';
import type { AgentAction } from '../types';

function action(over: Partial<AgentAction>): AgentAction {
  return {
    id: 'a1',
    domain: 'creative',
    kind: 'publish_asset',
    payload: {},
    confidence: 0.95,
    proposedAt: 0,
    rationale: 'test',
    ...over,
  };
}

describe('AAAIP compliance engine (ported)', () => {
  it('blocks an unlicensed third-party asset (Auaha copyright)', () => {
    const engine = new ComplianceEngine({ policies: AUAHA_POLICIES });
    const d = engine.evaluate(action({ payload: { usesThirdPartyAsset: true } }));
    expect(d.verdict).toBe('block');
    expect(d.explanation).toContain('auaha.copyright');
  });

  it('parks a low-confidence creative decision for human review', () => {
    const engine = new ComplianceEngine({ policies: AUAHA_POLICIES });
    const d = engine.evaluate(action({ confidence: 0.3 }));
    expect(d.verdict).toBe('needs_human');
  });

  it('allows a clean, licensed, confident asset', () => {
    const engine = new ComplianceEngine({ policies: AUAHA_POLICIES });
    const d = engine.evaluate(
      action({ payload: { usesThirdPartyAsset: true, licenceRef: 'CC-BY-4.0', brandRisk: 0.1, factScore: 0.9 } }),
    );
    expect(d.verdict).toBe('allow');
  });

  it('blocks scheduling without patient consent (clinic)', () => {
    const engine = new ComplianceEngine({ policies: CLINIC_POLICIES });
    const d = engine.evaluate(
      action({ domain: 'clinic_scheduling', kind: 'schedule_appointment', payload: { consentOnFile: false } }),
    );
    expect(d.verdict).toBe('block');
    expect(d.explanation).toContain('clinic.consent');
  });
});
