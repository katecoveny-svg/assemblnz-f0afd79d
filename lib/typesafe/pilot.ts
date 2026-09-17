import 'server-only';
import { createHash, randomUUID } from 'node:crypto';
import { planTools } from '@/apps/do/shared/router';
import { enforceApprovalPolicy } from '@/apps/do/shared/policy';
import { decide, makePayload, PilotError, type PilotInput, type PilotResult } from './core';
import { evaluateTypeSafe } from './transport';

export function pilotStatus(ownerId: string | null) {
  const enabled = process.env.TYPESAFE_ENABLED === 'true';
  const configured = Boolean(process.env.TYPESAFE_API_KEY?.trim());
  const ids = (process.env.TYPESAFE_PILOT_USER_IDS ?? '').split(',').map(id => id.trim()).filter(Boolean);
  const allowed = Boolean(ownerId && ids.includes(ownerId));
  return { signedIn: Boolean(ownerId), userId: ownerId, enabled, configured, allowed, ready: Boolean(ownerId && enabled && configured && allowed) };
}
export function requirePilot(ownerId: string) {
  const status = pilotStatus(ownerId);
  if (!status.allowed) throw new PilotError('pilot_access_required', 403, 'This account is not on the TypeSafe pilot allowlist.');
  if (!status.enabled || !status.configured) throw new PilotError('pilot_not_configured', 503, 'The TypeSafe pilot is not enabled and configured on this deployment.');
}
export async function runPilot(input: PilotInput, ownerId: string): Promise<PilotResult> {
  requirePilot(ownerId);
  const model = process.env.TYPESAFE_MODEL?.trim() || 'jev-1.13.0';
  const threshold = Number(process.env.TYPESAFE_REVIEW_THRESHOLD ?? '0.75');
  if (!Number.isFinite(threshold) || threshold < 0 || threshold > 1) throw new PilotError('invalid_configuration', 503, 'The review threshold is invalid.');
  const { evaluation, elapsedMs, attempts } = await evaluateTypeSafe(input, {
    apiKey: process.env.TYPESAFE_API_KEY!, model,
  });
  const decision = decide(input, evaluation, threshold);
  const canPrepare = decision.action !== 'ask_user' && decision.action !== 'unsupported';
  const primitive = decision.action === 'extract_facts' ? 'extract' : 'prepare';
  return {
    mode: 'live', decision, evaluation,
    ...(canPrepare ? { doPlan: planTools(primitive, { brief: input.intent }) } : {}),
    policy: enforceApprovalPolicy({
      can_do_without_asking: ['assemble a local draft from approved context'],
      must_ask_before: ['send a message', 'publish a draft', 'submit a form', 'change an order', 'allocate rewards'],
      never: ['execute external actions in this pilot', 'treat a model score as permission', 'claim a tool plan was executed'],
    }),
    trace: {
      id: randomUUID(), at: new Date().toISOString(),
      sourceHash: createHash('sha256').update(JSON.stringify(makePayload(input, model).state)).digest('hex'),
      elapsedMs, attempts, providerCalled: true, persisted: false, policyVersion: 'draft-only-v1', threshold,
    },
  };
}
