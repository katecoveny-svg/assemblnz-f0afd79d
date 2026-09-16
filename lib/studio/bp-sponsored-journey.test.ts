import { describe, expect, it } from 'vitest';
import {
  BP_ASA_SPONSORED_LABEL,
  BP_SPONSORED_SCENARIO,
  BP_SPONSORED_STEPS,
  BP_VERTICAL,
  bpCopyViolatesVerticalLock,
  buildBpSponsoredReceipt,
  sponsoredJourneyStepIndex,
} from './bp-sponsored-journey';

describe('bp-sponsored-journey', () => {
  it('locks vertical to fuel / convenience retail loyalty', () => {
    expect(BP_VERTICAL.id).toBe('fuel-convenience-retail-loyalty');
    expect(BP_SPONSORED_SCENARIO.vertical).toBe(BP_VERTICAL.id);
    expect(BP_VERTICAL.not).toMatch(/electricity/i);
    expect(BP_ASA_SPONSORED_LABEL).toBe('Sponsored');
  });

  it('covers the Assembl sponsored-agent spine for pump / app loyalty', () => {
    const ids = BP_SPONSORED_STEPS.map((step) => step.id);
    expect(ids).toEqual([
      'moment',
      'agent',
      'intent',
      'assemble',
      'offer',
      'permit',
      'action',
      'handoff',
      'receipt',
    ]);
    expect(BP_SPONSORED_STEPS.some((step) => step.requiresPermit)).toBe(true);
    expect(BP_SPONSORED_STEPS.filter((step) => step.showSponsoredLabel).length).toBeGreaterThanOrEqual(2);
    expect(BP_SPONSORED_SCENARIO.differentiator).toMatch(/Permit/i);
    expect(BP_SPONSORED_SCENARIO.differentiator).toMatch(/OpenAI Ads/i);
    expect(BP_SPONSORED_SCENARIO.differentiator).toMatch(/Not an electricity/i);
  });

  it('rejects electricity / energy-switch wording in BP demo copy', () => {
    const corpus = [
      BP_SPONSORED_SCENARIO.label,
      BP_SPONSORED_SCENARIO.intent,
      BP_SPONSORED_SCENARIO.differentiator,
      ...BP_SPONSORED_STEPS.flatMap((step) => [step.title, step.body, step.evidence, step.note ?? '']),
    ].join('\n');
    // Differentiator intentionally names electricity as a negative — strip that clause for the guard.
    const withoutNegation = corpus.replace(/Not an electricity switch demo\.?/gi, '');
    expect(bpCopyViolatesVerticalLock(withoutNegation)).toBe(false);
    expect(bpCopyViolatesVerticalLock('switch home energy plan while you wait')).toBe(true);
    expect(bpCopyViolatesVerticalLock('resolve ICP then quote')).toBe(true);
  });

  it('builds an honest DEMO receipt for fuel loyalty', () => {
    const receipt = buildBpSponsoredReceipt(new Date('2026-09-16T21:00:00.000Z'));
    expect(receipt.receiptId).toMatch(/^rcp_demo_bp_/);
    expect(receipt.permitId).toMatch(/^prm_demo_bp_/);
    expect(receipt.vertical).toBe('fuel-convenience-retail-loyalty');
    expect(receipt.actionStatus).toBe('demo_succeeded');
    expect(receipt.handoff).toBe('staged_hook_later');
    expect(receipt.honesty).toMatch(/DEMO/i);
    expect(receipt.honesty).toMatch(/not electricity/i);
    expect(sponsoredJourneyStepIndex('permit')).toBe(5);
  });
});
