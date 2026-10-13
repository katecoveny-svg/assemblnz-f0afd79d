import { z } from 'zod';

/** Browser-safe contract for kept conversations. Separate from memory notes and tasks:
 * a conversation is a transcript the owner chose to keep, not approved context. The
 * next request still sends only the last exchange; keeping changes nothing a provider sees. */
export const CONVERSATION_NOTICE_VERSION = 1;
export const CONVERSATION_RETENTION_DAYS = 30;
export const CONVERSATION_NOTICE = 'Keep this conversation on your account so you can pick it up on any device you sign in on. It is stored privately for 30 days after the last message and is not sent to a drafting provider by being kept. Forget it at any time. Do not keep conversations that contain another person’s details, health records, credentials or payment numbers.';
export const CONVERSATION_TURN_LIMIT = 40;
export const CONVERSATION_BYTES_LIMIT = 48000;
export const CONVERSATION_LIVE_LIMIT = 50;

const timestamp = z.string().datetime({ offset: true });
const clean = (max: number) => z.string().trim().min(1).max(max).refine(value => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(value), 'Remove control characters.');
export const conversationTurnSchema = z.object({
  role: z.enum(['user', 'assistant']),
  text: clean(10000),
  at: timestamp,
  draft: z.string().max(6000).nullable().default(null),
  label: z.string().max(160).nullable().default(null),
}).strict();
export type ConversationTurn = z.infer<typeof conversationTurnSchema>;

const fields = {
  title: clean(120),
  turns: z.array(conversationTurnSchema).min(1).max(CONVERSATION_TURN_LIMIT),
};
export const conversationSaveSchema = z.object({
  action: z.literal('save'), id: z.string().uuid(), expectedRevision: z.number().int().min(0),
  ...fields, consent: z.literal(true), noticeVersion: z.literal(CONVERSATION_NOTICE_VERSION),
}).strict();
export const conversationMutationSchema = z.union([
  conversationSaveSchema,
  z.object({ action: z.literal('forget'), id: z.string().uuid(), expectedRevision: z.number().int().min(1) }).strict(),
]);
export const conversationRecordSchema = z.object({
  id: z.string().uuid(), ...fields, revision: z.number().int().min(1),
  createdAt: timestamp, updatedAt: timestamp, expiresAt: timestamp,
  noticeVersion: z.literal(CONVERSATION_NOTICE_VERSION), use: z.literal('owner_review_only'),
}).strict();
export type ConversationRecord = z.infer<typeof conversationRecordSchema>;
export type ConversationMutation = z.infer<typeof conversationMutationSchema>;

export function conversationBytes(turns: ConversationTurn[], title = ''): number {
  return new TextEncoder().encode(JSON.stringify({ title, turns })).byteLength;
}
/** Title from the first user turn: enough to recognise it in a list, never a summary. */
export function conversationTitle(turns: ConversationTurn[]): string {
  const first = turns.find(turn => turn.role === 'user')?.text.replace(/\s+/g, ' ').trim() ?? 'Conversation';
  return first.length > 72 ? `${first.slice(0, 71).trimEnd()}…` : first;
}

export function nextConversationRecord(input: ConversationMutation, current: ConversationRecord | null, now: string): ConversationRecord | null {
  if ((current?.revision ?? 0) !== input.expectedRevision || (current && current.id !== input.id)) throw new Error('conversation_conflict');
  if (input.action === 'forget') return null;
  if (conversationBytes(input.turns, input.title) > CONVERSATION_BYTES_LIMIT) throw new Error('conversation_too_long');
  // Turn times come from the device clock; a clock a few seconds fast must not stop the keep, so the
  // server clock caps them. Nothing downstream relies on turn order within the same instant.
  const turns = input.turns.map(turn => Date.parse(turn.at) > Date.parse(now) ? { ...turn, at: now } : turn);
  // A kept conversation only grows: a stale device can never drop turns another device added.
  if (current && input.turns.length < current.turns.length) throw new Error('conversation_conflict');
  return conversationRecordSchema.parse({
    id: input.id, title: input.title, turns, revision: input.expectedRevision + 1,
    createdAt: current?.createdAt ?? now, updatedAt: now,
    expiresAt: new Date(Date.parse(now) + CONVERSATION_RETENTION_DAYS * 86400000).toISOString(),
    noticeVersion: input.noticeVersion, use: 'owner_review_only',
  });
}
