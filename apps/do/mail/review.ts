import { z } from 'zod';
import type { MailDraft } from './contract';

/** One owner, one in-flight request. Cancellation invalidates late publication. */
export class MailReviewSession {
  private pending: { id: string; controller: AbortController } | null = null;
  constructor(readonly ownerId: string) {}
  begin(id: string) {
    if (this.pending) return null;
    const controller = new AbortController();
    this.pending = { id, controller };
    return controller.signal;
  }
  accept(result: MailDraft): boolean {
    if (!this.pending || this.pending.controller.signal.aborted || this.pending.id !== result.requestId || this.ownerId !== result.ownerId) return false;
    this.pending = null;
    return true;
  }
  cancel() { this.pending?.controller.abort(); this.pending = null; }
}

const reviewedHandoff = z.object({
  id: z.uuid(), ownerId: z.uuid(), text: z.string().trim().min(1).max(1200),
  expiresAt: z.number().finite(),
}).strict();
export type ReviewedMailHandoff = z.infer<typeof reviewedHandoff>;

/** An in-memory voice→mail draft seam, with no account choice or permission carried.
 * Caller must end the voice session and clear provider consent before invoking it.
 */
export function createMailHandoffReceiver(ownerId: string, now = () => Date.now()) {
  const consumed = new Set<string>();
  return (value: unknown, hasExistingWork: boolean): string | null => {
    const parsed = reviewedHandoff.safeParse(value);
    if (!parsed.success) return null;
    const handoff = parsed.data;
    if (handoff.ownerId !== ownerId || hasExistingWork || consumed.has(handoff.id) || consumed.size >= 32 || handoff.expiresAt <= now() || handoff.expiresAt > now() + 60_000) return null;
    consumed.add(handoff.id);
    return handoff.text;
  };
}
