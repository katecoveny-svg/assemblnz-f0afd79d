import { z } from 'zod';
export const MAX_THREADS = 8;
export const MAX_BACKUP_BYTES = 180_000;
const id = z.string().uuid();
const text = (max: number) => z.string().max(max).refine(s => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(s));
const date = z.string().refine(s => {
  if (!s) return true;
  const d = new Date(s + 'T12:00:00Z');
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === s;
}, 'Choose a valid date.');
export const actionSchema = z.object({ id, title: text(300), owner: text(100), due: date, done: z.boolean(), share: z.boolean() }).strict();
export const conversationSchema = z.object({
  id, title: text(100), source: text(8000), notes: text(2000), reply: text(4000),
  actions: z.array(actionSchema).max(12), revision: z.number().int().min(0).max(1000000),
  reviewedRevision: z.number().int().min(0).nullable(),
}).strict().refine(c => new Set(c.actions.map(a => a.id)).size === c.actions.length, 'Duplicate action.');
export const workspaceSchema = z.object({
  version: z.literal(1), activeId: id, conversations: z.array(conversationSchema).min(1).max(MAX_THREADS),
}).strict().refine(w => new Set(w.conversations.map(c => c.id)).size === w.conversations.length && w.conversations.some(c => c.id === w.activeId), 'Invalid conversations.');
export type Conversation = z.infer<typeof conversationSchema>;
export type MessageAction = z.infer<typeof actionSchema>;
export type MessageWorkspace = z.infer<typeof workspaceSchema>;
export function newConversation(threadId = crypto.randomUUID()): Conversation {
  return { id: threadId, title: 'New conversation', source: '', notes: '', reply: '', actions: [], revision: 0, reviewedRevision: null };
}
export function emptyWorkspace(): MessageWorkspace {
  const first = newConversation('00000000-0000-4000-8000-000000000001');
  return { version: 1, activeId: first.id, conversations: [first] };
}
export function editConversation(c: Conversation, change: Partial<Pick<Conversation, 'title' | 'source' | 'notes' | 'reply' | 'actions'>>): Conversation {
  return conversationSchema.parse({ ...c, ...change, revision: c.revision + 1, reviewedRevision: null });
}
/** Literal request lines, not inferred commitments. Owners/dates stay blank. */
export function candidateActions(source: string): MessageAction[] {
  return [...new Set(source.split(/\r?\n/).map(line => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim()).filter(Boolean))]
    .filter(line => /\b(?:please|could|can you|need|remember|send|bring|book|confirm|pay|call|reply|collect|check)\b/i.test(line))
    .slice(0, 12).map(title => ({ id: crypto.randomUUID(), title: title.slice(0, 300), owner: '', due: '', done: false, share: false }));
}
/** Explicit allowlist excludes raw source and private notes. */
export function outgoingText(c: Conversation): string {
  const selected = c.actions.filter(a => a.share && a.title.trim());
  return [c.reply.trim(), selected.length ? 'Next steps\n' + selected.map(a =>
    '• ' + a.title.trim() + (a.owner.trim() ? ' — ' + a.owner.trim() : '') + (a.due ? ' (' + a.due + ')' : '')
  ).join('\n') : ''].filter(Boolean).join('\n\n');
}
export function canShare(c: Conversation) { return c.reviewedRevision === c.revision && outgoingText(c).length > 0; }
export function reviewedText(c: Conversation): string {
  if (!canShare(c)) throw new Error('Review the current reply and selected steps first.');
  return outgoingText(c);
}
function bounded(raw: string) {
  if (new TextEncoder().encode(raw).length > MAX_BACKUP_BYTES) throw new Error('Keep the backup smaller than 180 KB.');
  return raw;
}
export function serialiseWorkspace(w: MessageWorkspace): string {
  const valid = workspaceSchema.parse(w);
  return bounded(JSON.stringify({ ...valid, conversations: valid.conversations.map(c => ({ ...c, reviewedRevision: null })) }, null, 2));
}
export function parseWorkspace(raw: string): MessageWorkspace {
  const valid = workspaceSchema.parse(JSON.parse(bounded(raw)));
  return { ...valid, conversations: valid.conversations.map(c => ({ ...c, reviewedRevision: null })) };
}
export const EXAMPLE_SOURCE = 'Fictional example\nPlease confirm whether Thursday afternoon suits.\nCould you bring the revised plan?';
