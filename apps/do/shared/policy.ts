/**
 * DO approval policy — HARD.
 *
 * The model never decides risk tier. Server-side policy classifies
 * consequential actions. Buy / book / send / post / submit / pay / sign
 * ALWAYS need human approval.
 */

import type { ConsequentialVerb } from './types';

export const CONSEQUENTIAL_VERBS: readonly ConsequentialVerb[] = [
  'buy',
  'book',
  'send',
  'post',
  'submit',
  'pay',
  'sign',
] as const;

const VERB_PATTERN = new RegExp(
  `\\b(${CONSEQUENTIAL_VERBS.join('|')})\\b`,
  'i',
);

/** Match a consequential verb in free text. Returns the verb or null. */
export function detectConsequentialVerb(text: string): ConsequentialVerb | null {
  const m = text.match(VERB_PATTERN);
  if (!m) return null;
  return m[1].toLowerCase() as ConsequentialVerb;
}

/**
 * True when an action string is consequential and must sit under
 * must_ask_before / pendingApprovals — never can_do_without_asking.
 */
export function requiresHumanApproval(action: string): boolean {
  return detectConsequentialVerb(action) !== null;
}

/**
 * Enforce policy on a draft agent: strip consequential verbs from
 * can_do_without_asking and move them into must_ask_before.
 * Also ensures a baseline never-list for autonomous consequential work.
 */
export function enforceApprovalPolicy<
  T extends {
    can_do_without_asking: string[];
    must_ask_before: string[];
    never: string[];
  },
>(draft: T): T {
  const safe: string[] = [];
  const ask = new Set(draft.must_ask_before.map((s) => s.trim()).filter(Boolean));

  for (const action of draft.can_do_without_asking) {
    const trimmed = action.trim();
    if (!trimmed) continue;
    if (requiresHumanApproval(trimmed)) {
      ask.add(trimmed);
    } else {
      safe.push(trimmed);
    }
  }

  const never = new Set(draft.never.map((s) => s.trim()).filter(Boolean));
  never.add('buy, book, send, post, submit, pay, or sign without a human yes');
  never.add('claim completed for anything that was only drafted or proposed');

  return {
    ...draft,
    can_do_without_asking: safe,
    must_ask_before: Array.from(ask),
    never: Array.from(never),
  };
}

export const POLICY_HONESTY =
  'DEMO · consequential actions (buy/book/send/post/submit/pay/sign) always need your yes. The model does not decide risk.';
