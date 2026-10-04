import { z } from 'zod';

/** Browser-safe contracts only. Provider configuration and credentials stay on the server. */
export const PERSONAL_DO_MODEL = 'gpt-6-astra' as const;
export const PERSONAL_DO_REASONING_EFFORT = 'medium' as const;
export const PERSONAL_DO_ASSISTANT_CONSENT = 'Share this message, added notes and the conversation shown here with OpenAI and TypeSafe for this request. Review the reply before using it. Nothing is sent, booked or changed for you.';
const text = (max: number) => z.string().trim().max(max).refine(value => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(value), 'Remove control characters.');
export const personalAssistantInputSchema = z.object({
  message: text(4000).refine(value => value.length >= 3, 'Tell DO a little more about what you need.'),
  context: text(6000).default(''),
  history: z.array(z.object({ role: z.enum(['user', 'assistant']), text: text(10000).refine(value => value.length > 0) }).strict()).max(2).default([]),
  consent: z.literal(true, { error: 'Confirm that OpenAI and TypeSafe may use this text for this request.' }),
  usePublicNz: z.boolean().default(false),
  useSavedStyle: z.boolean().default(false),
}).strict().refine(value => value.message.length + value.context.length + value.history.reduce((sum, turn) => sum + turn.text.length, 0) <= 24000, 'This conversation is too long. Start a new conversation or shorten the notes.');
export type PersonalAssistantInput = z.infer<typeof personalAssistantInputSchema>;

export const PERSONAL_ASSISTANT_ACTIONS = {
  prepare: 'A useful draft, plan, explanation or organised next step can be prepared from the request. Includes a draft alternative to an external action, clearly labelled as unexecuted. Never grants authority.',
  clarify: 'Essential information is missing or the request is ambiguous. Ask one focused question before preparing a draft.',
  unsupported: 'No safe bounded drafting or clarification response fits. Actual account access, sending, buying, bookings and background monitoring are unavailable.',
} as const;
export type PersonalAssistantAction = keyof typeof PERSONAL_ASSISTANT_ACTIONS;
export const personalAssistantDraftSchema = z.object({
  reply: z.string().min(1).max(4000).describe('A helpful plain-text answer. No claim to have executed tools or looked up current facts.'),
  rationale: z.string().min(1).max(500).describe('Brief user-facing explanation of the recommendation, not private reasoning or chain of thought.'),
  evidence: z.array(z.object({ source: z.enum(['message', 'notes', 'conversation', 'public_source']), citation: z.string().url().max(250).optional(), quote: z.string().min(1).max(500) }).strict()).max(5).describe('Exact short quotations from the supplied user message, notes or earlier user turns only. These are user-supplied claims, not independently verified facts.'),
  missingInformation: z.array(z.string().min(1).max(300)).max(5),
  nextStep: z.object({
    kind: z.enum(['review_draft', 'answer_question']),
    label: z.string().min(1).max(160),
    draft: z.string().min(1).max(6000).nullable().describe('An editable draft only when kind is review_draft; null for a clarification.'),
  }).strict(),
}).strict();
export type PersonalAssistantDraft = z.infer<typeof personalAssistantDraftSchema>;
export type PersonalAssistantAvailability = {
  signedIn: boolean; ready: boolean;
  reason: 'sign_in_required' | 'astra_unavailable' | 'typesafe_unavailable' | 'pilot_access_required' | 'consumer_unavailable' | 'entitlement_required' | null;
  message: string;
  model: typeof PERSONAL_DO_MODEL;
  externalActions: false;
};
export type PersonalAssistantResult = PersonalAssistantDraft & {
  id: string; createdAt: string; state: 'draft' | 'needs_input' | 'unsupported';
  reviewRequired: true; externalActions: false; persisted: false;
  reasoning: {
    provider: 'typesafe'; model: string; action: PersonalAssistantAction;
    confidence: number; threshold: number; elapsedMs: number;
    usage?: { inputTokens: number; outputTokens: number };
    note: string;
  };
  officialSources?: import('@/lib/public-nz/parliament').VerifiedBill[];
  officialSourcesRequested?: boolean;
  generation: { provider: 'openai'; requestedModel: typeof PERSONAL_DO_MODEL; actualModel: string; reasoningEffort: typeof PERSONAL_DO_REASONING_EFFORT; usage?: { inputTokens: number | null; outputTokens: number | null; reasoningTokens: number | null; cacheReadTokens: number | null; cacheWriteTokens: number | null } } | null;
};

/** Provider output cannot manufacture citations, execution authority or an unknown next-step kind. */
export function validatePersonalAssistantDraft(raw: unknown, input: PersonalAssistantInput, action: PersonalAssistantAction, officialSources: import('@/lib/public-nz/parliament').VerifiedBill[] = []): PersonalAssistantDraft {
  const draft = personalAssistantDraftSchema.parse(raw);
  if (draft.nextStep.kind === 'review_draft' ? !draft.nextStep.draft : draft.nextStep.draft !== null) throw new Error('invalid_next_step');
  if (action !== 'prepare' && (draft.nextStep.kind !== 'answer_question' || draft.nextStep.draft !== null)) throw new Error('clarification_required');
  const sources = { message: [input.message], notes: [input.context], conversation: input.history.filter(turn => turn.role === 'user').map(turn => turn.text) };
  if (draft.evidence.some(item => item.source === 'public_source' ? !officialSources.some(source => source.url === item.citation && Date.parse(source.verifiedAt) <= Date.now() && Date.parse(source.expiresAt) > Date.now() && [source.title, source.excerpt, source.status, source.stage].some(text => text?.includes(item.quote))) : !!item.citation || !sources[item.source].some(source => source.includes(item.quote)))) throw new Error('unsubstantiated_quote');
  return draft;
}
