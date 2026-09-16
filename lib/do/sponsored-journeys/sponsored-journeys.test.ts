import { describe, expect, it, beforeEach } from 'vitest';

import { resetActionStubStore } from '@/lib/do/action-stub';

import {
  GROCERY_LOYALTY_SPONSORED_DEMO,
  advanceSponsoredRun,
  resetSponsoredJourneyRuns,
  startSponsoredRun,
} from './index';

describe('Sponsored Journeys runner', () => {
  beforeEach(() => {
    resetActionStubStore();
    resetSponsoredJourneyRuns();
  });

  it('exposes grocery demo with honest disclaimer and unpaid path', () => {
    expect(GROCERY_LOYALTY_SPONSORED_DEMO.vertical).toBe('grocery_loyalty_demo');
    expect(GROCERY_LOYALTY_SPONSORED_DEMO.disclaimer).toMatch(/not OpenAI Sponsored Agents/i);
    expect(GROCERY_LOYALTY_SPONSORED_DEMO.unpaidPathLabel).toBeTruthy();
    expect(GROCERY_LOYALTY_SPONSORED_DEMO.steps.some((s) => s.id === 'permit')).toBe(true);
  });

  it('runs branded intent → permit → simulated action → receipt', () => {
    let run = startSponsoredRun({ intent: 'Quick dinner for four' });
    expect(run.status).toBe('intent');
    run = advanceSponsoredRun(run.run_id, 'assemble');
    run = advanceSponsoredRun(run.run_id, 'show_offer');
    run = advanceSponsoredRun(run.run_id, 'request_permit');
    expect(run.status).toBe('permit_pending');
    expect(run.permit_id).toMatch(/^prm_/);
    run = advanceSponsoredRun(run.run_id, 'approve_permit');
    run = advanceSponsoredRun(run.run_id, 'execute');
    expect(run.status).toBe('action_simulated');
    run = advanceSponsoredRun(run.run_id, 'handoff');
    run = advanceSponsoredRun(run.run_id, 'receipt');
    expect(run.status).toBe('receipted');
    expect(run.receipt_id).toMatch(/^rcpt_/);
  });

  it('allows skipping the sponsored offer', () => {
    let run = startSponsoredRun();
    run = advanceSponsoredRun(run.run_id, 'assemble');
    run = advanceSponsoredRun(run.run_id, 'skip_offer');
    expect(run.use_sponsored_path).toBe(false);
    run = advanceSponsoredRun(run.run_id, 'request_permit');
    run = advanceSponsoredRun(run.run_id, 'approve_permit');
    run = advanceSponsoredRun(run.run_id, 'execute');
    expect(run.status).toBe('action_simulated');
  });
});
