import { z } from 'zod';
import { windowSchema } from '../protocol';
const uuid = z.string().uuid();
const revision = z.number().int().min(0).max(3);
const base = { requestId: uuid };
const task = { ...base, taskId: uuid, expectedRevision: revision };
export const commandSchema = z.discriminatedUnion('kind', [
  z.object({ ...base, kind: z.literal('accept_contact'), contactId: uuid, expectedRevision: z.number().int().min(0).max(10) }).strict(),
  z.object({ ...base, kind: z.literal('revoke_contact'), contactId: uuid, expectedRevision: z.number().int().min(0).max(10) }).strict(),
  z.object({ ...base, kind: z.literal('create_task'), contactId: uuid, expectedRevision: z.number().int().min(0).max(10), durationMinutes: z.number().int().min(15).max(120), expiresAt: z.string().datetime({ offset: true }) }).strict(),
  z.object({ ...task, kind: z.literal('save_windows'), windows: z.array(windowSchema).min(1).max(8), expiresAt: z.string().datetime({ offset: true }) }).strict(),
  z.object({ ...task, kind: z.literal('queue_disclosure'), disclosureDigest: z.string().regex(/^[a-f0-9]{64}$/) }).strict(),
  z.object({ ...task, kind: z.literal('deliver'), messageId: uuid }).strict(),
  z.object({ ...task, kind: z.literal('change_plan'), durationMinutes: z.number().int().min(15).max(120) }).strict(),
  z.object({ ...task, kind: z.literal('approve'), proposalDigest: z.string().regex(/^[a-f0-9]{64}$/) }).strict(),
  z.object({ ...task, kind: z.literal('decline') }).strict(),
]);
export type CoordinationCommand = z.infer<typeof commandSchema>;
/** A verified pairing provider is deliberately disconnected. No guessing, discovery or invitations. */
export interface PairingAdapter { allowsOwner(ownerId: string): Promise<boolean> }
export const closedPairingAdapter: PairingAdapter = { async allowsOwner() { return false; } };
export const DURABLE_COORDINATION_NOTICE = 'Inactive authenticated coordination foundation. No calendar adapter or external delivery.';
/** Allowlisted peer data only; no instructions, private memory or authority-bearing fields. */
export const durableEnvelopeSchema = z.object({
  version: z.literal(1), kind: z.literal('availability'), contactId: uuid, taskId: uuid,
  revision: z.number().int().min(1).max(3), from: uuid, to: uuid,
  expiresAt: z.string().datetime({ offset: true }), windows: z.array(windowSchema).min(1).max(8),
}).strict().refine(value => value.from !== value.to, 'Distinct participants required');
export type DurableEnvelope = z.infer<typeof durableEnvelopeSchema>;
