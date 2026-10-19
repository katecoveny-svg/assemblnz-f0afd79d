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
export type MailAccount = { id: string; provider: 'gmail' | 'microsoft_outlook'; label: string; state: 'read_available' | 'activation_off' | 'gmail_read_unverified' | 'reconnect' | 'setup_needed' | 'outlook_read_unverified'; scopeVerified: boolean };
/** Runtime boundary shared by the server and the text/voice review destination. */
export const mailSource = z.object({
  key: z.string().max(321), accountId: mailAccountId, accountLabel: z.string().max(160),
  provider: z.literal('gmail'), messageId: mailMessageId,
  subject: z.string().max(4000), from: z.string().max(4000), date: z.string().max(4000),
  text: z.string().max(3000), truncated: z.boolean(),
  attachmentsRead: z.literal(false), trust: z.literal('untrusted_correspondence'),
}).strict();
export type MailSource = z.infer<typeof mailSource>;
export const mailDraft = z.object({
  status: z.literal('review'), ownerId: z.uuid(), requestId: z.uuid(), search: mailSearch,
  operation: z.enum(['search', 'read']), sources: z.array(mailSource).max(10),
  moreAvailable: z.boolean(), checkedAt: z.iso.datetime(),
  stored: z.literal(false), modelUsed: z.literal(false),
}).strict().superRefine((draft, ctx) => {
  if (draft.sources.length > (draft.operation === 'read' ? 3 : 10) ||
      new Set(draft.sources.map(source => source.key)).size !== draft.sources.length ||
      draft.sources.some(source => source.accountId !== draft.search.accountId ||
        source.key !== `${source.accountId}:${source.messageId}` ||
        (draft.operation === 'search' && source.text.length > 500))) {
    ctx.addIssue({ code: 'custom', message: 'Invalid correspondence evidence.' });
  }
});
export type MailDraft = z.infer<typeof mailDraft>;
export type MailReadiness = { ownerId: string; accounts: MailAccount[]; metadataOnly: true; mailboxRead: false; accountsAvailable: boolean; gmailConfigured: boolean; outlookReadVerified: false };

export function gmailSearchQuery(search: z.infer<typeof mailSearch>): string {
  const parsed = mailSearch.parse(search);
  return `${parsed.terms.split(/\s+/).map(word => `"${word}"`).join(' ')} newer_than:${parsed.days}d -in:spam -in:trash`;
}

/** These sources are data, never tool instructions. No model/executor sees this draft. */
export function correspondenceTask(source: MailSource): string {
  // Headers can contain door codes, vouchers or hostile instructions too. Carry
  // only the opaque source reference into a task; do not copy correspondence.
  return `Review selected correspondence\nSource: ${source.key}\n\nOpen the source in mail review before deciding the next step. Nothing has been sent or scheduled.`;
}
