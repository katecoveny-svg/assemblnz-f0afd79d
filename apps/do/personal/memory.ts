import { z } from 'zod';

export const MEMORY_NOTICE_VERSION = 1;
export const PERSONAL_MEMORY_NOTICE = 'Optional context about yourself, saved privately to your account by assembl for your own review. It is not sent to a drafting provider or shared with family or supporters. Choose a retention period; expired records are excluded and removed on the next memory request. Review, edit, pause or delete at any time. Do not enter information about another person, health records, credentials or identity/payment numbers.';
const timestamp = z.string().datetime({ offset: true });
const fields = {
  subject: z.literal('self'),
  kind: z.enum(['preference', 'routine', 'ongoing_context']),
  text: z.string().trim().min(1).max(1200).refine(value => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(value)),
  source: z.literal('owner_entered'),
  observedAt: timestamp,
  retentionDays: z.union([z.literal(7), z.literal(30), z.literal(90)]),
  active: z.boolean(),
};
export const personalMemorySaveSchema = z.object({
  action: z.literal('save'), id: z.string().uuid(), expectedRevision: z.number().int().min(0),
  ...fields, consent: z.literal(true), noticeVersion: z.literal(MEMORY_NOTICE_VERSION),
  selfOnly: z.literal(true), nonSensitive: z.literal(true),
}).strict();
export const personalMemoryMutationSchema = z.union([
  personalMemorySaveSchema,
  z.object({ action: z.enum(['review', 'pause', 'delete']), id: z.string().uuid(), expectedRevision: z.number().int().min(1) }).strict(),
]);
export const personalMemoryRecordSchema = z.object({
  id: z.string().uuid(), ...fields, revision: z.number().int().min(1),
  consentedAt: timestamp, reviewedAt: timestamp, updatedAt: timestamp, expiresAt: timestamp,
  noticeVersion: z.literal(MEMORY_NOTICE_VERSION),
  use: z.literal('owner_review_only'),
}).strict();
export type PersonalMemoryRecord = z.infer<typeof personalMemoryRecordSchema>;
export type PersonalMemoryMutation = z.infer<typeof personalMemoryMutationSchema>;

export function nextMemoryRecord(input: PersonalMemoryMutation, current: PersonalMemoryRecord | null, now: string): PersonalMemoryRecord | null {
  if ((current?.revision ?? 0) !== input.expectedRevision || (current && current.id !== input.id)) throw new Error('memory_conflict');
  if (input.action === 'delete') return null;
  if (input.action !== 'save') {
    if (!current || Date.parse(current.expiresAt) <= Date.parse(now)) throw new Error('memory_expired');
    return { ...current, revision: current.revision + 1, updatedAt: now,
      ...(input.action === 'pause' ? { active: false } : { reviewedAt: now }) };
  }
  if (Date.parse(input.observedAt) > Date.parse(now)) throw new Error('Check when this context was observed.');
  return personalMemoryRecordSchema.parse({
    id: input.id, subject: input.subject, kind: input.kind, text: input.text, source: input.source,
    observedAt: input.observedAt, retentionDays: input.retentionDays, active: input.active,
    revision: input.expectedRevision + 1, consentedAt: now, reviewedAt: now, updatedAt: now,
    expiresAt: new Date(Date.parse(now) + input.retentionDays * 86400000).toISOString(),
    noticeVersion: input.noticeVersion, use: 'owner_review_only',
  });
}

/** Fictional guest previews only. These labels never grant access or representation. */
export const familyPreviewSchema = z.object({
  fictional: z.literal(true), alias: z.enum(['Person 1', 'Person 2', 'Person 3']),
  relationship: z.enum(['child', 'adult', 'supporter']),
  visibility: z.literal('owner_only'), authority: z.literal('none'),
}).strict();
