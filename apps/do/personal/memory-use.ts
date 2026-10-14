import { z } from 'zod';

/** Separate from collection consent. Existing owner_review_only records stay unchanged. */
export const PROVIDER_MEMORY_NOTICE_VERSION = 1;
export const PROVIDER_MEMORY_NOTICE = 'Optionally share these selected, confirmed notes about your own goals, preferences or constraints with OpenAI and TypeSafe for this assistant or named responsibility until the chosen expiry. You may revoke permission at any time. Notes are unverified context; permission does not authorise sending, booking, payment or medical decisions. Revocation cannot recall a request already sent.';
const date = z.string().datetime({ offset: true });
export const memoryUseScopeSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('assistant') }).strict(),
  z.object({ kind: z.literal('responsibility'), responsibilityId: z.string().uuid().toLowerCase(), responsibilityRevision: z.number().int().positive() }).strict(),
]);
export type MemoryUseScope = z.infer<typeof memoryUseScopeSchema>;
export const memoryUseConsentSchema = z.object({
  id: z.string().uuid().toLowerCase(), revision: z.number().int().positive(), ownerId: z.string().uuid().toLowerCase(),
  noticeVersion: z.literal(PROVIDER_MEMORY_NOTICE_VERSION), providers: z.tuple([z.literal('openai'), z.literal('typesafe')]),
  scope: memoryUseScopeSchema, selections: z.array(z.object({ recordId: z.string().uuid().toLowerCase(), revision: z.number().int().positive() }).strict()).min(1).max(8),
  consentedAt: date, expiresAt: date, revokedAt: date.nullable(),
}).strict().refine(value => new Set(value.selections.map(item => item.recordId)).size === value.selections.length, 'Duplicate selection');
export type MemoryUseConsent = z.infer<typeof memoryUseConsentSchema>;
/** Explicit owner confirmation is required; no proposal/dismissal inference enters this shape. */
export const confirmedProviderMemorySchema = z.object({
  id: z.string().uuid().toLowerCase(), ownerId: z.string().uuid().toLowerCase(), revision: z.number().int().positive(), subject: z.literal('self'),
  kind: z.enum(['goal', 'preference', 'constraint']), text: z.string().trim().min(1).max(1200).refine(value => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(value)),
  source: z.literal('owner_entered'), confirmedAt: date, observedAt: date, expiresAt: date,
  active: z.literal(true), nonSensitive: z.literal(true), use: z.literal('explicit_provider_context'),
}).strict();
export type ConfirmedProviderMemory = z.infer<typeof confirmedProviderMemorySchema>;
export type MemoryContextReference = { recordId: string; revision: number; observedAt: string; expiresAt: string; consentId: string; consentRevision: number; scope: MemoryUseScope };
export type ProviderMemoryBundle = { data: { kind: ConfirmedProviderMemory['kind']; text: string }[]; references: MemoryContextReference[]; externalAction: 'none'; untrusted: true };

export function validateMemorySnapshot(ownerId: string, scope: MemoryUseScope, consentRaw: unknown, recordsRaw: unknown[], now: string): ProviderMemoryBundle {
  const owner = z.string().uuid().toLowerCase().parse(ownerId);
  const purpose = memoryUseScopeSchema.parse(scope);
  const consent = memoryUseConsentSchema.parse(consentRaw);
  const clock = Date.parse(date.parse(now));
  if (consent.ownerId !== owner || JSON.stringify(consent.scope) !== JSON.stringify(purpose) || consent.revokedAt !== null || Date.parse(consent.consentedAt) > clock || Date.parse(consent.expiresAt) <= clock || Date.parse(consent.expiresAt) > Date.parse(consent.consentedAt) + 7 * 86400000) throw new Error('memory_use_denied');
  const records = recordsRaw.map(record => confirmedProviderMemorySchema.parse(record));
  if (records.length !== consent.selections.length || new Set(records.map(record => record.id)).size !== records.length) throw new Error('memory_use_denied');
  const selected = consent.selections.map(selection => {
    const record = records.find(item => item.id === selection.recordId);
    if (!record || record.ownerId !== owner || record.revision !== selection.revision || Date.parse(record.expiresAt) <= clock || Date.parse(record.confirmedAt) > clock || Date.parse(record.observedAt) > Date.parse(record.confirmedAt) || Date.parse(record.confirmedAt) >= Date.parse(record.expiresAt) || Date.parse(consent.expiresAt) > Date.parse(record.expiresAt)) throw new Error('memory_use_denied');
    return record;
  });
  if (selected.reduce((sum, item) => sum + item.text.length, 0) > 6000) throw new Error('memory_context_limit');
  return { data: selected.map(item => ({ kind: item.kind, text: item.text })), references: selected.map(item => ({ recordId: item.id, revision: item.revision, observedAt: item.observedAt, expiresAt: item.expiresAt, consentId: consent.id, consentRevision: consent.revision, scope: purpose })), externalAction: 'none', untrusted: true };
}
