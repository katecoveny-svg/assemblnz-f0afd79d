import { z } from 'zod';

export const CONTINUITY_VERSION = 'do-continuity-v1' as const;
export const CONTINUITY_BOUNDARY = 'Preparation only. Nothing sent, booked or changed outside DO.';
export const CONTINUITY_RESULT_LIMIT = 16000;
export const scopeSchema = z.enum(['personal', 'work']);
export const contextSchema = z.object({
  id: z.string().uuid(), label: z.string().trim().min(1).max(80),
  text: z.string().trim().min(1).max(2000),
  source: z.literal('user_selected'),
}).strict();
// No memory retrieval: collection consent and owner_review_only records grant no access here.
export const saveSchema = z.object({
  action: z.literal('save'), id: z.string().uuid(), scope: scopeSchema,
  request: z.string().trim().min(8).max(4000), context: z.array(contextSchema).max(3),
  consent: z.literal(true), consentVersion: z.literal(CONTINUITY_VERSION),
}).strict();
export const changeSchema = z.object({
  action: z.enum(['prepare', 'edit', 'cancel', 'revoke']), id: z.string().uuid(),
  scope: scopeSchema, expectedRevision: z.number().int().positive(),
  result: z.string().max(CONTINUITY_RESULT_LIMIT).optional(),
}).strict().superRefine((value, ctx) => {
  if (value.action === 'edit' && value.result === undefined)
    ctx.addIssue({ code: 'custom', message: 'Include the edited result.' });
  if (value.action !== 'edit' && value.result !== undefined)
    ctx.addIssue({ code: 'custom', message: 'Only editing accepts a result.' });
});
export const mutationSchema = z.union([saveSchema, changeSchema]);
export const taskSchema = z.object({
  id: z.string().uuid(), ownerId: z.string().min(1), scope: scopeSchema,
  request: z.string().max(4000), context: z.array(contextSchema).max(3),
  revision: z.number().int().positive(), status: z.enum(['waiting', 'needs_review', 'cancelled', 'revoked', 'expired']),
  consentVersion: z.literal(CONTINUITY_VERSION), consentUntil: z.string().datetime(),
  expiresAt: z.string().datetime(), createdAt: z.string().datetime(), updatedAt: z.string().datetime(),
  result: z.string().max(CONTINUITY_RESULT_LIMIT).nullable(), executor: z.literal('worksheet-v1').nullable(),
}).strict();
export type PortableTask = z.infer<typeof taskSchema>;
export type Scope = z.infer<typeof scopeSchema>;
export type Save = z.infer<typeof saveSchema>;
export type Change = z.infer<typeof changeSchema>;
export class ContinuityError extends Error {
  constructor(public code: 'not_found' | 'conflict' | 'permission_expired' | 'stopped' | 'storage_unavailable' | 'id_reused' | 'quota_exhausted') { super(code); }
}

export function newTask(ownerId: string, raw: Save, now: string): PortableTask {
  const input = saveSchema.parse(raw);
  return taskSchema.parse({
    id: input.id, ownerId, scope: input.scope, request: input.request, context: input.context,
    revision: 1, status: 'waiting', consentVersion: CONTINUITY_VERSION,
    consentUntil: new Date(Date.parse(now) + 24 * 3600000).toISOString(),
    expiresAt: new Date(Date.parse(now) + 7 * 86400000).toISOString(),
    createdAt: now, updatedAt: now, result: null, executor: null,
  });
}

/** Expired content never leaves the adapter; expiry is server-clock based. */
export function visibleTask(task: PortableTask, now: string): PortableTask {
  if (Date.parse(task.expiresAt) <= Date.parse(now)) return { ...task, status: 'expired', request: '', context: [], result: null };
  if (Date.parse(task.consentUntil) <= Date.parse(now) && !['cancelled', 'revoked'].includes(task.status))
    return { ...task, status: 'expired', context: [], result: null };
  return structuredClone(task);
}

export function changeTask(task: PortableTask, input: Change, now: string, prepared?: string): PortableTask {
  changeSchema.parse(input);
  if (input.scope !== task.scope || input.id !== task.id) throw new ContinuityError('not_found');
  if (input.expectedRevision !== task.revision) throw new ContinuityError('conflict');
  if (input.action === 'cancel' || input.action === 'revoke') {
    return { ...task, revision: task.revision + 1, status: input.action === 'cancel' ? 'cancelled' : 'revoked',
      consentUntil: now, context: [], result: null, updatedAt: now };
  }
  if (['cancelled', 'revoked'].includes(task.status)) throw new ContinuityError('stopped');
  if (visibleTask(task, now).status === 'expired') throw new ContinuityError('permission_expired');
  if (input.action === 'prepare') {
    // Completed preparation is replayed; no second executor invocation is required.
    if (task.status === 'needs_review') return task;
    if (prepared === undefined) throw new ContinuityError('storage_unavailable');
    return { ...task, status: 'needs_review', result: prepared, executor: 'worksheet-v1', revision: task.revision + 1, updatedAt: now };
  }
  if (task.status !== 'needs_review') throw new ContinuityError('conflict');
  return { ...task, result: input.result!, revision: task.revision + 1, updatedAt: now };
}
