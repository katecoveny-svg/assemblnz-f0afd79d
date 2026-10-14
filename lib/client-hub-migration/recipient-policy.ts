import { z } from 'zod';

export const recipientGrantSchema = z.object({
  id: z.uuid(), ownerUserId: z.uuid(), recipientUserId: z.uuid(), snapshotId: z.uuid(),
  revision: z.number().int().positive(), status: z.enum(['active', 'revoked']),
  expiresAt: z.iso.datetime(),
}).strict();
export type RecipientGrant = z.infer<typeof recipientGrantSchema>;

// A URL/token is never identity. All projections and media must reuse this policy
// after server-side authenticated identity and authoritative grant lookup.
export function canReadRecipientSnapshot(grant: unknown, userId: string | null, snapshotId: string, now = Date.now()) {
  const parsed = recipientGrantSchema.safeParse(grant);
  if (!parsed.success || !userId) return false;
  const g = parsed.data;
  return g.status === 'active' && g.recipientUserId === userId && g.snapshotId === snapshotId && Date.parse(g.expiresAt) > now;
}

export function isLocalReviewEnabled(nodeEnv: string | undefined, flag: string | undefined, host: string | null) {
  return nodeEnv === 'development' && flag === '1' && !!host && /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
}
