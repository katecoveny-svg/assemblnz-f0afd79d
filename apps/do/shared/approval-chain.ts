/**
 * Approval chain for major consequential / financial decisions only.
 * Inspired by TradingAgents-style specialist → skeptic → decision → human yes.
 * Simple agents stay single-primitive — no multi-agent theatre.
 */

import { randomUUID } from 'node:crypto';
import { requiresHumanApproval } from './policy';
import type { PendingApproval } from './types';

export type ApprovalStage = 'specialist' | 'skeptic' | 'decision' | 'human';

export interface ApprovalChainStep {
  stage: ApprovalStage;
  note: string;
  at: string;
}

export function needsMajorChain(action: string): boolean {
  return requiresHumanApproval(action) && /\b(pay|buy|sign|submit)\b/i.test(action);
}

export function buildMajorApproval(
  action: string,
): PendingApproval & { chain: ApprovalChainStep[] } {
  const now = new Date().toISOString();
  const chain: ApprovalChainStep[] = [
    {
      stage: 'specialist',
      note: 'Specialist draft · proposed the consequential step from the brief.',
      at: now,
    },
    {
      stage: 'skeptic',
      note: 'Skeptic check · flagged risk: external send/pay/sign cannot auto-run.',
      at: now,
    },
    {
      stage: 'decision',
      note: 'Decision packet · ready for your yes. DEMO will not execute externally.',
      at: now,
    },
    {
      stage: 'human',
      note: 'Waiting on you.',
      at: now,
    },
  ];
  return {
    id: randomUUID(),
    action,
    reason: `Major decision chain · ${action}`,
    policyHit: 'policy',
    createdAt: now,
    chain,
  };
}
