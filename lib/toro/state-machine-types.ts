/**
 * Pure types + TRANSITIONS data for the Tōro draft state machine.
 *
 * No runtime dependencies — safe to import from tests that cannot resolve
 * Supabase (and from edge functions that ship without the full Next.js
 * dependency tree).
 *
 * Spec: outputs/TORO-V0.1-ARCHITECTURE-SPEC-2026-05-11.md §4.4
 */

export type DraftState =
  | 'pending_approval'
  | 'reviewing'
  | 'approved'
  | 'edited_then_approved'
  | 'rejected'
  | 'sent'
  | 'send_failed'
  | 'expired';

export const TRANSITIONS: Record<DraftState, DraftState[]> = {
  pending_approval: ['reviewing', 'expired'],
  reviewing: ['approved', 'edited_then_approved', 'rejected', 'pending_approval'],
  approved: ['sent', 'send_failed'],
  edited_then_approved: ['sent', 'send_failed'],
  rejected: [],
  sent: [],
  send_failed: ['approved'],
  expired: [],
};

const TERMINAL_STATES: ReadonlySet<DraftState> = new Set(['rejected', 'sent', 'expired']);

export function isTerminal(state: DraftState): boolean {
  return TERMINAL_STATES.has(state);
}

export function isValidTransition(from: DraftState, to: DraftState): boolean {
  const allowed = TRANSITIONS[from];
  if (!allowed) return false;
  return allowed.includes(to);
}
