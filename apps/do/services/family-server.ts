import 'server-only';
import { doGmailReader } from '@/lib/connectors/pipedream';
import { runDoTextReasoning } from '../shared/reasoning-server';
import { DO_TEXT_PROVIDER_CONSENT_VERSION } from '../shared/provider-consent';
import { PilotError } from '@/lib/typesafe/core';
import { decodeGmail, familyQuery, senderAddress, validateFamilyEvidence, type GmailMessage, type FamilyMessage } from './family';

export async function collectFamilyMail(owner: string, senders: string[], days: 7 | 14 | 30) {
  const read = await doGmailReader(owner);
  const params = new URLSearchParams({ q: familyQuery(senders, days), maxResults: '20' });
  const list = await read<{ messages?: { id: string }[]; nextPageToken?: string }>(`messages?${params}`);
  const messages: FamilyMessage[] = [];
  const ids = (list.messages || []).slice(0, 20);
  const allowed = senders.map(s => s.toLowerCase());
  for (let index = 0; index < ids.length; index += 4) {
    const batch = await Promise.all(ids.slice(index, index + 4).map(async ({ id }) => {
      if (!/^[a-zA-Z0-9_-]+$/.test(id)) throw new Error('Invalid message ID');
      return decodeGmail(await read<GmailMessage>(`messages/${id}?format=full`));
    }));
    messages.push(...batch.filter((m): m is FamilyMessage => Boolean(m && allowed.includes(senderAddress(m.from)))));
  }
  return { messages, moreAvailable: Boolean(list.nextPageToken) };
}
export async function organiseFamilyMail(messages: FamilyMessage[], signal: AbortSignal, scope?: { ownerId: string; providerConsentVersion: string; requestId?: string }) {
  if (!scope?.ownerId || scope.providerConsentVersion !== DO_TEXT_PROVIDER_CONSENT_VERSION) throw new PilotError('provider_consent_required', 400, 'Confirm OpenAI and TypeSafe before preparing these emails.');
  const context = JSON.stringify({ emails: messages });
  if (context.length > 6000) throw new PilotError('input_limit', 400, 'Too much email text matched. Choose a shorter range or fewer senders. No email text was transmitted.');
  const result = await runDoTextReasoning({ message: 'Prepare a family-admin digest as an editable JSON draft with summary, items and questions. Each item needs kind (date, form, payment, bring, reply or information), title, detail, when (source wording or Not specified), person (source wording or Not specified), sourceId and evidence (exact source-text quotation). Use only supplied emails. Attachments are not read. No household or sensitive facts may be inferred. No action is completed.', context, history: [], consent: true, usePublicNz: false, useSavedStyle: false }, scope.ownerId, signal, scope.requestId);
  if (!result.generation || !result.nextStep.draft) throw new PilotError('generation_failed', 503, 'DO did not return a family digest for review.');
  const text = result.nextStep.draft.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  return { ...validateFamilyEvidence(JSON.parse(text), messages), model: result.generation.actualModel, reasoning: result.reasoning, providerConsentVersion: DO_TEXT_PROVIDER_CONSENT_VERSION };
}
