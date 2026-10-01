import 'server-only';
import { z } from 'zod';
import { getServiceClient } from '@/lib/supabase/service';
import { memoryUseScopeSchema, PROVIDER_MEMORY_NOTICE_VERSION } from './memory-use';
import { MemoryUseError, type ProviderMemoryStore } from './memory-use-server';
import { preparationPolicySchema } from './preparation-controls';

const id = z.string().uuid();
const revision = z.number().int().min(0);
const date = z.string().datetime({ offset: true });
export const providerContextMutationSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('confirm'), id, expectedRevision: revision, kind: z.enum(['goal','preference','constraint']), text: z.string().trim().min(1).max(1200).refine(value => !/[\u0000-\u001f\u007f]/u.test(value)), observedAt: date, retentionDays: z.union([z.literal(7),z.literal(30),z.literal(90)]), selfOnly: z.literal(true), nonSensitive: z.literal(true), confirm: z.literal(true) }).strict(),
  z.object({ action: z.literal('delete'), id, expectedRevision: revision.refine(value => value>0) }).strict(),
]);
export const providerConsentMutationSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('consent'), id, expectedRevision: revision, scope: memoryUseScopeSchema, selections: z.array(z.object({ recordId: id, revision: z.number().int().positive() }).strict()).min(1).max(8), expiresAt: date, providers: z.tuple([z.literal('openai'),z.literal('typesafe')]), noticeVersion: z.literal(PROVIDER_MEMORY_NOTICE_VERSION), consent: z.literal(true) }).strict(),
  z.object({ action: z.literal('revoke'), id, expectedRevision: revision.refine(value => value>0) }).strict(),
]);
const policyMutation = z.object({ responsibilityId: id, expectedRevision: revision, policy: preparationPolicySchema }).strict();
const reservation = z.object({ runId: id, consentId: id, consentRevision: z.number().int().positive(), policyRevision: z.number().int().positive(), noveltyKey: z.string().regex(/^[a-zA-Z0-9:_-]{1,160}$/) }).strict();

/** No route installs this adapter. Explicit flag remains off by default. */
function client(ownerId: string) {
  if (process.env.DO_PROVIDER_MEMORY_ENABLED !== 'true' || !id.safeParse(ownerId).success) throw new MemoryUseError('memory_use_unavailable');
  return getServiceClient();
}
async function rpc(ownerId: string, name: string, fields: Record<string, unknown>): Promise<unknown> {
  try {
    const { data, error } = await client(ownerId).rpc(name, { p_owner: ownerId, ...fields }).abortSignal(AbortSignal.timeout(5000));
    if (error || data === null) throw new MemoryUseError('memory_use_unavailable');
    return data;
  } catch { throw new MemoryUseError('memory_use_unavailable'); }
}
export function createProviderMemoryStore(): ProviderMemoryStore | null {
  if (process.env.DO_PROVIDER_MEMORY_ENABLED !== 'true') return null;
  return {
    scopeIsCurrent: async ({ ownerId, scope }) => (await rpc(ownerId, 'do_provider_scope_current', { p_scope: scope })) === true,
    readSnapshot: async ({ ownerId, scope, consentId }) => {
      const raw = await rpc(ownerId, 'do_provider_context_snapshot', { p_id: consentId, p_scope: scope });
      const parsed = z.object({ consent: z.unknown(), records: z.array(z.unknown()) }).strict().safeParse(raw);
      if (!parsed.success) throw new MemoryUseError('memory_use_unavailable');
      return parsed.data;
    },
  };
}
/** Server-verified owner only. Confirmation and provider consent are separate writes. */
export async function changeProviderContext(ownerId: string, raw: unknown): Promise<boolean> {
  const parsed = providerContextMutationSchema.safeParse(raw);
  if (!parsed.success) throw new MemoryUseError('memory_use_denied');
  const input = parsed.data;
  const result = await rpc(ownerId, 'do_provider_context_change', { p_id: input.id, p_expected: input.expectedRevision, p_kind: input.action==='confirm'?input.kind:null, p_body: input.action==='confirm'?input.text:null, p_observed: input.action==='confirm'?input.observedAt:null, p_retention: input.action==='confirm'?input.retentionDays:null });
  if (typeof result !== 'boolean') throw new MemoryUseError('memory_use_unavailable');
  return result;
}
export async function changeProviderConsent(ownerId: string, raw: unknown): Promise<boolean> {
  const parsed = providerConsentMutationSchema.safeParse(raw);
  if (!parsed.success) throw new MemoryUseError('memory_use_denied');
  const input = parsed.data;
  const result = await rpc(ownerId, 'do_provider_consent_change', { p_id: input.id, p_expected: input.expectedRevision, p_scope: input.action==='consent'?input.scope:null, p_selections: input.action==='consent'?input.selections:null, p_expires: input.action==='consent'?input.expiresAt:null });
  if (typeof result !== 'boolean') throw new MemoryUseError('memory_use_unavailable');
  return result;
}
export async function changePreparationPolicy(ownerId: string, raw: unknown): Promise<boolean> {
  const parsed = policyMutation.safeParse(raw);
  if (!parsed.success) throw new MemoryUseError('memory_use_denied');
  const input = parsed.data;
  const result = await rpc(ownerId, 'do_provider_policy_change', { p_task: input.responsibilityId, p_expected: input.expectedRevision, p_timezone: input.policy.timezone, p_start: input.policy.quietStartHour, p_end: input.policy.quietEndHour, p_cooldown: input.policy.cooldownHours, p_paused: input.policy.paused });
  if (typeof result !== 'boolean') throw new MemoryUseError('memory_use_unavailable');
  return result;
}
/** True means this run reserved the key once; false never authorises redispatch. */
export async function reservePreparedWork(ownerId: string, raw: unknown): Promise<boolean> {
  const parsed = reservation.safeParse(raw);
  if (!parsed.success) throw new MemoryUseError('memory_use_denied');
  const input = parsed.data;
  const result = await rpc(ownerId, 'do_provider_prepare_reserve', { p_run: input.runId, p_consent: input.consentId, p_consent_revision: input.consentRevision, p_key: input.noveltyKey, p_policy_revision: input.policyRevision });
  if (typeof result !== 'boolean') throw new MemoryUseError('memory_use_unavailable');
  return result;
}
export async function readProviderContextReview(ownerId: string): Promise<{ contexts: unknown[]; consents: unknown[] }> {
  const raw = await rpc(ownerId, 'do_provider_context_review', {});
  const parsed = z.object({ contexts: z.array(z.unknown()).max(30), consents: z.array(z.unknown()).max(30) }).strict().safeParse(raw);
  if (!parsed.success) throw new MemoryUseError('memory_use_unavailable');
  return parsed.data;
}
export async function changePreparedWorkState(ownerId: string, raw: unknown): Promise<boolean> {
  const parsed = z.object({ noveltyKey: z.string().regex(/^[a-zA-Z0-9:_-]{1,160}$/), status: z.enum(['prepared_draft','dismissed','failed']), dismissedUntil: date.nullable() }).strict().safeParse(raw);
  if (!parsed.success) throw new MemoryUseError('memory_use_denied');
  const result = await rpc(ownerId, 'do_provider_prepare_state', { p_key: parsed.data.noveltyKey, p_status: parsed.data.status, p_until: parsed.data.dismissedUntil });
  if (typeof result !== 'boolean') throw new MemoryUseError('memory_use_unavailable');
  return result;
}
