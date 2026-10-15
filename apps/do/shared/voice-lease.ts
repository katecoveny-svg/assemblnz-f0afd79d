import { z } from 'zod';
/** All amounts/entitlement are server supplied. Client cannot select a funding source. */
export const voiceLeaseRequest = z.discriminatedUnion('action', [
  z.object({ action: z.literal('quote'), requestedSeconds: z.union([z.literal(300), z.literal(600), z.literal(900)]), voiceRevision: z.string().regex(/^[a-f0-9]{64}$/) }).strict(),
  z.object({ action: z.literal('start'), requestId: z.uuid(), quoteId: z.uuid(), consent: z.literal(true) }).strict(),
  z.object({ action: z.literal('resume'), leaseId: z.uuid() }).strict(),
  z.object({ action: z.literal('revoke'), leaseId: z.uuid() }).strict(),
]);
export type VoiceLeaseRequest = z.infer<typeof voiceLeaseRequest>;
export type VoiceCostQuote = {
  quoteId: string; expiresAt: number; requestedSeconds: number; voiceRevision: string;
  provider: 'google'; model: string; voiceName: string;
  funding: 'assembl_included'; planRevision: string; dailyReservedSecondsLimit: number;
  additionalChargeCents: 0; usageBasis: 'reserved_connection_seconds';
};

export type VoiceLeaseAllowance = {
  dailyReservedSecondsLimit: number; remainingSeconds: number;
  planRevision: string; funding: 'assembl_included';
  usageBasis: 'reserved_connection_seconds'; measuredCost: null;
};
