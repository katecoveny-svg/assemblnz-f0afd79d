import { describe, expect, it } from 'vitest';
import {
  BP_SPONSORED_SCENARIO,
  BP_SPONSORED_STEPS,
  buildBpSponsoredReceipt,
  sponsoredJourneyStepIndex,
} from './bp-sponsored-journey';

describe('bp-sponsored-journey', () => {
  it('covers the full Assembl sponsored-agent spine', () => {
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
    expect(BP_SPONSORED_SCENARIO.differentiator).toMatch(/Permit/i);
    expect(BP_SPONSORED_SCENARIO.differentiator).toMatch(/OpenAI Ads/i);
  });

  it('builds an honest DEMO receipt', () => {
    const receipt = buildBpSponsoredReceipt(new Date('2026-09-16T21:00:00.000Z'));
    expect(receipt.receiptId).toMatch(/^rcp_demo_bp_/);
    expect(receipt.permitId).toMatch(/^prm_demo_bp_/);
    expect(receipt.actionStatus).toBe('demo_succeeded');
    expect(receipt.handoff).toBe('staged_hook_later');
    expect(receipt.honesty).toMatch(/DEMO only/i);
    expect(sponsoredJourneyStepIndex('permit')).toBe(5);
  });
});
