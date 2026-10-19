import { z } from 'zod';
import { mailDraft, mailRequest, type MailDraft, type MailRequest } from './contract';

/** One owner, one in-flight request. Cancellation invalidates late publication. */
export class MailReviewSession {
  private pending: { request: MailRequest; startedAt: number; controller: AbortController } | null = null;
  private used = new Set<string>();
  constructor(readonly ownerId: string, private now = () => Date.now()) {}
  begin(raw: MailRequest) {
    const parsed = mailRequest.safeParse(raw);
    if (this.pending || !parsed.success || parsed.data.ownerId !== this.ownerId ||
        this.used.has(parsed.data.requestId) || this.used.size >= 256) return null;
    const controller = new AbortController();
    this.used.add(parsed.data.requestId);
    // Zod makes a snapshot so later edits cannot change the pending authority.
    this.pending = { request: parsed.data, startedAt: this.now(), controller };
    return controller.signal;
  }
  accept(value: unknown): value is MailDraft {
    const pending = this.pending;
    if (!pending || pending.controller.signal.aborted) return false;
    const elapsed = this.now() - pending.startedAt;
    if (elapsed < 0 || elapsed > 60_000) { this.pending = null; return false; }
    const parsed = mailDraft.safeParse(value);
    if (!parsed.success) return false;
    const result = parsed.data, request = pending.request;
    if (result.requestId !== request.requestId || result.ownerId !== this.ownerId ||
        result.operation !== request.operation || result.search.accountId !== request.search.accountId ||
        result.search.terms !== request.search.terms || result.search.days !== request.search.days ||
        (request.operation === 'read' && (result.sources.length !== request.messageIds.length ||
          result.sources.some(source => !request.messageIds.includes(source.messageId))))) return false;
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
