import { z } from 'zod';

export const familyRequest = z.object({
  senders: z.array(z.string().trim().email().max(254).regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i)).min(1).max(8),
  days: z.union([z.literal(7), z.literal(14), z.literal(30)]),
  consent: z.literal(true),
}).strict();
export const familyResult = z.object({
  summary: z.string().max(1200),
  items: z.array(z.object({
    kind: z.enum(['date', 'form', 'payment', 'bring', 'reply', 'information']),
    title: z.string().max(240),
    detail: z.string().max(1200),
    when: z.string().max(150),
    person: z.string().max(120),
    sourceId: z.string().max(100),
    evidence: z.string().max(500),
  }).strict()).max(60),
  questions: z.array(z.string().max(400)).max(12),
}).strict();
export type FamilyResult = z.infer<typeof familyResult>;
export type FamilyMessage = { id: string; subject: string; from: string; date: string; text: string; truncated: boolean; hasAttachments: boolean };
export type GmailPayload = { mimeType?: string; filename?: string; body?: { data?: string; attachmentId?: string }; parts?: GmailPayload[]; headers?: { name: string; value: string }[] };
export type GmailMessage = { id?: string; payload?: GmailPayload; snippet?: string };

export function familyQuery(senders: string[], days: 7 | 14 | 30) {
  // Validation precedes interpolation. No free-form Gmail search or whole-inbox scan.
  const parsed = familyRequest.parse({ senders, days, consent: true });
  return `{${parsed.senders.map(sender => `from:(${sender})`).join(' ')}} newer_than:${days}d -in:spam -in:trash`;
}
export function senderAddress(value: string) {
  return (value.match(/<([^<>]+)>/)?.[1] || value).trim().toLowerCase();
}
export function decodeGmail(message: GmailMessage): FamilyMessage | null {
  if (!message.id || !/^[a-zA-Z0-9_-]+$/.test(message.id) || !message.payload) return null;
  const payload = message.payload;
  const header = (name: string) => payload.headers?.find(h => h.name.toLowerCase() === name)?.value || '';
  let hasAttachments = false;
  function read(part: GmailPayload, depth = 0): string {
    if (depth > 12) return '';
    if (part.filename || part.body?.attachmentId) { hasAttachments = true; return ''; }
    if (part.parts?.length) {
      const pieces = part.parts.map(p => ({ type: p.mimeType, text: read(p, depth + 1) }));
      const plain = pieces.filter(p => p.type === 'text/plain' && p.text);
      return (part.mimeType === 'multipart/alternative' && plain.length ? plain : pieces).map(p => p.text).join('\n');
    }
    if (!part.body?.data || !['text/plain', 'text/html'].includes(part.mimeType || '')) return '';
    const decoded = Buffer.from(part.body.data, 'base64url').toString('utf8');
    return part.mimeType === 'text/html' ? decoded.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>') : decoded;
  }
  const text = read(payload).trim();
  return { id: message.id, subject: header('subject').slice(0, 300), from: header('from').slice(0, 300), date: header('date').slice(0, 100), text: text.slice(0, 4000), truncated: text.length > 4000, hasAttachments };
}
export function validateFamilyEvidence(value: unknown, messages: FamilyMessage[]) {
  const parsed = familyResult.parse(value);
  for (const item of parsed.items) {
    const source = messages.find(message => message.id === item.sourceId);
    const normal = (text: string) => text.replace(/\s+/g, ' ').trim();
    if (!source || !item.evidence.trim() || !normal(source.text).includes(normal(item.evidence))) throw new Error('Unverified family evidence');
  }
  return parsed;
}
