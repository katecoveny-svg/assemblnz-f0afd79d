import { z } from 'zod';

export const MAIL_READ_CONSENT = 'do-mail-read-v1' as const;
export const mailAccountId = z.string().min(1).max(160).regex(/^[a-zA-Z0-9_-]+$/);
export const mailMessageId = z.string().min(1).max(160).regex(/^[a-zA-Z0-9_-]+$/);
export const mailSearch = z.object({
  accountId: mailAccountId,
  // Literal words only. No caller-provided provider query language, URLs or tools.
  terms: z.string().trim().min(2).max(100).regex(/^[\p{L}\p{N}@._+ -]+$/u),
  days: z.union([z.literal(7), z.literal(14), z.literal(30)]),
}).strict();
export const mailRequest = z.object({
  ownerId: z.uuid(),
  requestId: z.uuid(),
  consentVersion: z.literal(MAIL_READ_CONSENT),
  search: mailSearch,
  operation: z.enum(['search', 'read']),
  messageIds: z.array(mailMessageId).max(3),
}).strict().superRefine((value, ctx) => {
  if ((value.operation === 'search' && value.messageIds.length) ||
      (value.operation === 'read' && !value.messageIds.length) ||
      new Set(value.messageIds).size !== value.messageIds.length) {
    ctx.addIssue({ code: 'custom', message: 'Choose distinct messages for this operation.' });
  }
});
export type MailRequest = z.infer<typeof mailRequest>;
export type MailAccount = { id: string; provider: 'gmail' | 'microsoft_outlook'; label: string; state: 'read_available_unverified' | 'reconnect' | 'setup_needed' | 'outlook_read_unverified'; scopeVerified: false };
export type MailSource = {
  key: string; accountId: string; accountLabel: string; provider: 'gmail'; messageId: string;
  subject: string; from: string; date: string; text: string; truncated: boolean;
  attachmentsRead: false; trust: 'untrusted_correspondence';
};
export type MailDraft = {
  status: 'review'; ownerId: string; requestId: string; search: z.infer<typeof mailSearch>;
  operation: 'search' | 'read'; sources: MailSource[]; moreAvailable: boolean;
  checkedAt: string; stored: false; modelUsed: false;
};
export type MailReadiness = { ownerId: string; accounts: MailAccount[]; metadataOnly: true; mailboxRead: false; accountsAvailable: boolean };

export function gmailSearchQuery(search: z.infer<typeof mailSearch>): string {
  const parsed = mailSearch.parse(search);
  return `${parsed.terms.split(/\s+/).map(word => `"${word}"`).join(' ')} newer_than:${parsed.days}d -in:spam -in:trash`;
}

/** These sources are data, never tool instructions. No model/executor sees this draft. */
export function correspondenceTask(source: MailSource): string {
  return `Review correspondence: ${source.subject || 'Untitled message'}\nFrom (unverified mail header): ${source.from}\nAccount: ${source.accountLabel} (${source.accountId})\nSource: ${source.key}\n\nDecide the next step. Nothing has been sent or scheduled.`;
}
