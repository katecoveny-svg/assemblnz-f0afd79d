import {
  executeUnderPermit,
  issuePermit,
  mintReceipt,
  prepareAction,
  stubId,
} from '@/lib/do/action-stub';

import { getSponsoredDemo } from './grocery-demo';
import type {
  SponsoredJourneyRun,
  SponsoredJourneyRunStatus,
  SponsoredJourneyStepId,
} from './types';

const STATUS_STEP: Record<SponsoredJourneyRunStatus, SponsoredJourneyStepId> = {
  idle: 'branded_agent',
  intent: 'understand_intent',
  assembled: 'assemble_next',
  offer_shown: 'reward_offer',
  permit_pending: 'permit',
  permitted: 'permit',
  action_simulated: 'action_stub',
  handoff_stubbed: 'crm_handoff',
  receipted: 'receipt',
};

type Store = Map<string, SponsoredJourneyRun>;

const globalStore = globalThis as typeof globalThis & {
  __assemblSponsoredJourneyRuns?: Store;
};

function runs(): Store {
  if (!globalStore.__assemblSponsoredJourneyRuns) {
    globalStore.__assemblSponsoredJourneyRuns = new Map();
  }
  return globalStore.__assemblSponsoredJourneyRuns;
}

export function resetSponsoredJourneyRuns() {
  runs().clear();
}

function touch(run: SponsoredJourneyRun, status: SponsoredJourneyRunStatus): SponsoredJourneyRun {
  const next: SponsoredJourneyRun = {
    ...run,
    status,
    current_step: STATUS_STEP[status],
    updated_at: new Date().toISOString(),
  };
  runs().set(next.run_id, next);
  return next;
}

export function startSponsoredRun(input?: {
  demo_id?: string;
  intent?: string;
}): SponsoredJourneyRun {
  const demo = getSponsoredDemo(input?.demo_id ?? 'sponsored-grocery-loyalty-demo');
  if (!demo) throw new Error('Unknown sponsored demo');
  const now = new Date().toISOString();
  const run: SponsoredJourneyRun = {
    run_id: stubId('sjr'),
    demo_id: demo.id,
    status: 'intent',
    intent: input?.intent?.trim() || demo.seedIntent,
    use_sponsored_path: true,
    current_step: 'understand_intent',
    created_at: now,
    updated_at: now,
    mode: 'demo_stub',
  };
  runs().set(run.run_id, run);
  return run;
}

export function getSponsoredRun(run_id: string): SponsoredJourneyRun | undefined {
  return runs().get(run_id);
}

export function listSponsoredRuns(): SponsoredJourneyRun[] {
  return [...runs().values()].sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export function advanceSponsoredRun(
  run_id: string,
  action:
    | 'assemble'
    | 'show_offer'
    | 'skip_offer'
    | 'request_permit'
    | 'approve_permit'
    | 'deny_permit'
    | 'execute'
    | 'handoff'
    | 'receipt',
): SponsoredJourneyRun {
  const run = runs().get(run_id);
  if (!run) throw new Error(`Unknown run: ${run_id}`);
  const demo = getSponsoredDemo(run.demo_id);
  if (!demo) throw new Error('Demo missing');

  switch (action) {
    case 'assemble':
      return touch(run, 'assembled');
    case 'show_offer':
      return touch({ ...run, use_sponsored_path: true }, 'offer_shown');
    case 'skip_offer':
      return touch({ ...run, use_sponsored_path: false }, 'offer_shown');
    case 'request_permit': {
      const basketTotal = demo.basket.reduce((sum, line) => sum + line.priceNzd * line.qty, 0);
      const prepared = prepareAction({
        action_name: run.use_sponsored_path
          ? 'loyalty.redeem_and_add_to_order'
          : 'commerce.add_to_order',
        namespace: 'demo.sponsored.grocery',
        title: run.use_sponsored_path
          ? 'Redeem demo offer + add basket (stub)'
          : 'Add basket without offer (stub)',
        args: {
          run_id: run.run_id,
          intent: run.intent,
          offer_id: run.use_sponsored_path ? demo.offer.id : null,
          line_skus: demo.basket
            .filter((line) => run.use_sponsored_path || !line.sponsored)
            .map((line) => line.sku),
          total_nzd: basketTotal,
        },
        idempotency_key: `sponsored:${run.run_id}:prepare`,
        risk_class: 'medium',
        agent_id: 'agt_kitchen_do',
        tenant_id: 'ten_sponsored_demo',
      });
      const permit = issuePermit({
        prep_id: prepared.prep_id,
        scopes: ['action:loyalty.redeem', 'action:commerce.add_to_order'],
        ttl_seconds: 900,
        max_uses: 1,
      });
      return touch(
        { ...run, prep_id: prepared.prep_id, permit_id: permit.permit_id },
        'permit_pending',
      );
    }
    case 'approve_permit':
      if (!run.permit_id) throw new Error('No permit to approve');
      return touch(run, 'permitted');
    case 'deny_permit':
      return touch(run, 'offer_shown');
    case 'execute': {
      if (!run.permit_id || !run.prep_id) throw new Error('Permit required before execute');
      if (run.status !== 'permitted') throw new Error('Approve permit before execute');
      const executed = executeUnderPermit({
        permit_id: run.permit_id,
        prep_id: run.prep_id,
        idempotency_key: `sponsored:${run.run_id}:execute`,
        result: {
          order_stub_id: stubId('ord'),
          points_stub: run.use_sponsored_path ? demo.offer.points : 0,
        },
      });
      return touch({ ...run, action_id: executed.action_id }, 'action_simulated');
    }
    case 'handoff': {
      const handoff_id = stubId('hnd');
      return touch({ ...run, handoff_id }, 'handoff_stubbed');
    }
    case 'receipt': {
      if (!run.action_id) throw new Error('Action required before receipt');
      const receipt = mintReceipt({
        action_id: run.action_id,
        summary: run.use_sponsored_path
          ? 'Simulated sponsored grocery redeem + add-to-order'
          : 'Simulated unpaid-path add-to-order',
        evidence: [
          { kind: 'run_id', value: run.run_id },
          { kind: 'handoff_id', value: run.handoff_id ?? 'none' },
          { kind: 'executionClaimed', value: 'false' },
        ],
        sponsor_report: {
          sponsored: run.use_sponsored_path,
          label: demo.offer.disclosure,
          vertical: demo.vertical,
        },
      });
      return touch({ ...run, receipt_id: receipt.receipt_id }, 'receipted');
    }
    default: {
      const _exhaustive: never = action;
      throw new Error(`Unknown action: ${_exhaustive}`);
    }
  }
}
