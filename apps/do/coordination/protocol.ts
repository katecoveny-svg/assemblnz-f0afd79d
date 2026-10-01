import { z } from 'zod';

const instant = z.string().datetime({ offset: true });
export const windowSchema = z.object({ start: instant, end: instant }).strict().refine(w => Date.parse(w.end) > Date.parse(w.start), 'Window must be positive');
export type Window = z.infer<typeof windowSchema>;
const owner = z.enum(['alex', 'sam']);
export type Owner = z.infer<typeof owner>;
export const envelopeSchema = z.object({
  version: z.literal(1), transport: z.literal('synthetic'), id: z.string().uuid(),
  from: owner, to: owner, contactId: z.literal('fictional-contact'), taskId: z.literal('fictional-diary'),
  revision: z.number().int().min(1).max(3), digest: z.string().regex(/^[a-f0-9]{64}$/),
  expiresAt: instant, payload: z.object({ kind: z.literal('availability'), windows: z.array(windowSchema).min(1).max(8) }).strict(),
}).strict();
export type Envelope = z.infer<typeof envelopeSchema>;
export type Receipt = { kind: 'proposal_agreed'; revision: number; digest: string; slot: Window; owners: Owner[]; calendarBookingCreated: false };
export type Session = {
  mode: 'synthetic'; revision: number; expiresAt: string; durationMinutes: number;
  contacts: Record<Owner, boolean>; disclosed: Partial<Record<Owner, Window[]>>;
  received: Partial<Record<Owner, Window[]>>; approvals: Partial<Record<Owner, string>>;
  seen: Record<string, string>; status: 'contact' | 'disclosure' | 'proposal' | 'agreed' | 'declined' | 'no_overlap' | 'expired' | 'revoked';
  proposal?: Window; digest?: string; receipt?: Receipt;
};
export function fixture(noOverlap = false): { session: Session; privateWindows: Record<Owner, Window[]> } {
  return {
    session: { mode: 'synthetic', revision: 1, expiresAt: '2026-10-05T22:00:00Z', durationMinutes: 30, contacts: { alex: false, sam: false }, disclosed: {}, received: {}, approvals: {}, seen: {}, status: 'contact' },
    privateWindows: {
      alex: [{ start: '2026-10-05T09:00:00+13:00', end: '2026-10-05T11:00:00+13:00' }],
      sam: [{ start: `2026-10-05T${noOverlap ? '12' : '10'}:00:00+13:00`, end: `2026-10-05T${noOverlap ? '13' : '12'}:00:00+13:00` }],
    },
  };
}
export function overlap(a: Window[], b: Window[], minutes: number): Window | undefined {
  if (!Number.isInteger(minutes) || minutes < 15 || minutes > 120) throw new Error('Invalid duration');
  const candidates = a.flatMap(x => b.map(y => ({ start: Math.max(Date.parse(x.start), Date.parse(y.start)), end: Math.min(Date.parse(x.end), Date.parse(y.end)) })))
    .filter(w => Number.isFinite(w.start) && w.end - w.start >= minutes * 60000).sort((x, y) => x.start - y.start);
  const w = candidates[0];
  return w ? { start: new Date(w.start).toISOString(), end: new Date(w.start + minutes * 60000).toISOString() } : undefined;
}
export async function digest(value: unknown): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(value)));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
}
const peer = (who: Owner): Owner => who === 'alex' ? 'sam' : 'alex';
function active(s: Session, now: number) {
  if (!Number.isFinite(now) || now >= Date.parse(s.expiresAt)) throw new Error('Permission expired');
  if (['declined', 'expired', 'revoked'].includes(s.status)) throw new Error('Task closed');
}
/** Local owner decision only. Never called by an inbound message handler. */
export function acceptContact(s: Session, who: Owner, now: number): Session {
  active(s, now);
  const contacts = { ...s.contacts, [who]: true };
  return { ...s, contacts, status: contacts.alex && contacts.sam ? 'disclosure' : 'contact' };
}
/** Exact local disclosure approval; only the allowlisted windows leave this boundary. */
export async function disclose(s: Session, who: Owner, windows: Window[], now: number): Promise<{ session: Session; envelope: Envelope }> {
  active(s, now);
  if (!s.contacts.alex || !s.contacts.sam || s.status !== 'disclosure' || s.disclosed[who]) throw new Error('Disclosure unavailable');
  const checked = z.array(windowSchema).min(1).max(8).parse(windows);
  if (checked.some(w => Date.parse(w.start) <= now || Date.parse(w.end) > Date.parse(s.expiresAt))) throw new Error('Window outside task lifetime');
  const payload = { kind: 'availability' as const, windows: checked };
  const content = { version: 1 as const, transport: 'synthetic' as const, id: crypto.randomUUID(), from: who, to: peer(who), contactId: 'fictional-contact' as const, taskId: 'fictional-diary' as const, revision: s.revision, expiresAt: s.expiresAt, payload };
  const envelope = { ...content, digest: await digest(content) };
  return { session: { ...s, disclosed: { ...s.disclosed, [who]: checked } }, envelope };
}
export interface CoordinationTransport { readonly mode: 'synthetic'; deliver(session: Session, recipient: Owner, data: unknown, now: number): Promise<{ session: Session; duplicate: boolean }> }
/** Untrusted peer data cannot create consent, approve a proposal or write memory. */
export const syntheticTransport: CoordinationTransport = {
  mode: 'synthetic',
  async deliver(s, recipient, data, now) {
    active(s, now);
    const e = envelopeSchema.parse(data);
    if (e.to !== recipient || e.from === recipient || e.revision !== s.revision || e.expiresAt !== s.expiresAt || !s.contacts.alex || !s.contacts.sam) throw new Error('Scope or revision mismatch');
    const { digest: supplied, ...content } = e;
    if (await digest(content) !== supplied) throw new Error('Digest mismatch');
    if (s.seen[e.id]) {
      if (s.seen[e.id] !== supplied) throw new Error('Replay collision');
      return { session: s, duplicate: true };
    }
    if (s.status !== 'disclosure' || !s.disclosed[e.from] || JSON.stringify(s.disclosed[e.from]) !== JSON.stringify(e.payload.windows)) throw new Error('No exact local disclosure approval');
    const received = { ...s.received, [e.from]: e.payload.windows };
    let next: Session = { ...s, received, seen: { ...s.seen, [e.id]: supplied } };
    if (received.alex && received.sam) {
      const proposal = overlap(received.alex, received.sam, s.durationMinutes);
      const planDigest = await digest({ taskId: e.taskId, contactId: e.contactId, revision: s.revision, expiresAt: s.expiresAt, durationMinutes: s.durationMinutes, owners: ['alex', 'sam'], windows: received, proposal: proposal ?? null });
      next = { ...next, proposal, digest: planDigest, status: proposal ? 'proposal' : 'no_overlap' };
    }
    return { session: next, duplicate: false };
  },
};
export function approveProposal(s: Session, who: Owner, revision: number, exactDigest: string, now: number): Session {
  active(s, now);
  if (!s.proposal || !s.digest || exactDigest !== s.digest || revision !== s.revision || !['proposal', 'agreed'].includes(s.status)) throw new Error('Review changed or unavailable');
  const approvals = { ...s.approvals, [who]: exactDigest };
  const agreed = approvals.alex === s.digest && approvals.sam === s.digest;
  return { ...s, approvals, status: agreed ? 'agreed' : 'proposal', receipt: agreed ? { kind: 'proposal_agreed', revision, digest: exactDigest, slot: s.proposal, owners: ['alex', 'sam'], calendarBookingCreated: false } : undefined };
}
export function close(s: Session, reason: 'declined' | 'revoked' | 'expired', now: number): Session {
  if (reason === 'expired' && now < Date.parse(s.expiresAt)) throw new Error('Not expired');
  return { ...s, status: reason, disclosed: {}, received: {}, approvals: {}, proposal: undefined, digest: undefined, receipt: undefined };
}
export function changePlan(s: Session, minutes: number, now: number): Session {
  active(s, now);
  if (s.revision >= 3) throw new Error('Maximum three rounds reached');
  overlap([], [], minutes);
  return { ...s, revision: s.revision + 1, durationMinutes: minutes, status: 'disclosure', disclosed: {}, received: {}, approvals: {}, proposal: undefined, digest: undefined, receipt: undefined };
}
export function displayWindow(w: Window): string {
  const format = new Intl.DateTimeFormat('en-NZ', { timeZone: 'Pacific/Auckland', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
  return `${format.format(new Date(w.start))} – ${format.format(new Date(w.end))}`;
}
