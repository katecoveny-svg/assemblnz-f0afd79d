import 'server-only';
import { enabledPersonalDoPlan } from '@/lib/billing/personal-do-plan';
import { hasPersonalDoEntitlement } from '@/lib/billing/personal-do-access';
import { pilotStatus } from '@/lib/typesafe/pilot';
import { PERSONAL_DO_MODEL, type PersonalAssistantAvailability, type PersonalAssistantInput } from './assistant';
import { runDoTextReasoning, runPrivatePersonalDoReasoning } from '../shared/reasoning-server';
export function personalAssistantAvailability(ownerId: string | null): PersonalAssistantAvailability {
  const common = { model: PERSONAL_DO_MODEL, externalActions: false as const };
  if (!ownerId) return { ...common, signedIn: false, ready: false, reason: 'sign_in_required', message: 'Sign in to ask your Personal DO. Your note can stay here while you decide.' };
  const typesafe = pilotStatus(ownerId);
  // Explicit consumer rollout uses a dedicated owner entitlement; the existing allowlist is only the private test path.
  if (process.env.PERSONAL_DO_CONSUMER_ENABLED === 'true') {
    if (!enabledPersonalDoPlan()) return { ...common, signedIn: true, ready: false, reason: 'consumer_unavailable', message: 'Personal DO subscriptions are not available yet.' };
    if (process.env.TYPESAFE_ENABLED !== 'true' || !process.env.TYPESAFE_API_KEY?.trim()) return { ...common, signedIn: true, ready: false, reason: 'typesafe_unavailable', message: 'DO is temporarily unavailable. Your note stays here.' };
    if (!process.env.OPENAI_API_KEY?.trim()) return { ...common, signedIn: true, ready: false, reason: 'astra_unavailable', message: 'DO is temporarily unavailable. Your note stays here.' };
    return { ...common, signedIn: true, ready: true, reason: null, message: 'Your reply is checked by TypeSafe and prepared for your review.' };
  }
  if (!typesafe.allowed) return { ...common, signedIn: true, ready: false, reason: 'pilot_access_required', message: 'Personal DO is not enabled for this account yet. Your note stays here while assembl connects your access.' };
  if (!typesafe.ready) return { ...common, signedIn: true, ready: false, reason: 'typesafe_unavailable', message: 'The TypeSafe reasoning service is not available on this deployment yet. Your note stays in the editor.' };
  if (!process.env.OPENAI_API_KEY?.trim()) return { ...common, signedIn: true, ready: false, reason: 'astra_unavailable', message: 'GPT-6 Astra is not configured on this deployment yet. Your note stays in the editor.' };
  return { ...common, signedIn: true, ready: true, reason: null, message: 'Configured for GPT-6 Astra with a TypeSafe request check. Each reply reports the model that actually answered.' };
}

/** Personal UI retains the established private account path; consumer calls use durable shared admission. */
export async function runPersonalAssistant(input: PersonalAssistantInput, ownerId: string, signal?: AbortSignal, requestId?: string) {
  return process.env.PERSONAL_DO_CONSUMER_ENABLED === 'true'
    ? runDoTextReasoning(input, ownerId, signal, requestId)
    : runPrivatePersonalDoReasoning(input, ownerId, signal);
}

export async function checkedPersonalAssistantAvailability(ownerId: string | null): Promise<PersonalAssistantAvailability> {
  const availability = personalAssistantAvailability(ownerId);
  if (!availability.ready || !ownerId || process.env.PERSONAL_DO_CONSUMER_ENABLED !== 'true') return availability;
  try {
    if (await hasPersonalDoEntitlement(ownerId)) return availability;
    return { ...availability, ready: false, reason: 'entitlement_required', message: 'A current Personal DO subscription is required.' };
  } catch { return { ...availability, ready: false, reason: 'consumer_unavailable', message: 'DO could not check your access. Please try again.' }; }
}
