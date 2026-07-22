/**
 * assembl — live (model-backed) intent service
 * --------------------------------------------
 * A real `IntentService` implementation that structures the customer's natural
 * language with a model via the repo's AI SDK, validated against
 * `GroceryIntentSchema`. It degrades to the deterministic parser
 * (`parseGroceryIntent`) whenever the model is unavailable or returns invalid
 * data — so it NEVER throws into the caller and always returns schema-valid
 * output (mirrors the heuristic-fallback pattern in `lib/family/parse.ts`).
 *
 * Server-side only (needs the API key + SDK); the client reaches it through the
 * `structureIntentAction` server action, never by importing this module.
 */

import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import {
  GroceryIntentSchema,
  parseGroceryIntent,
  type IntentParseResult,
  type IntentService,
} from './intent';

const SYSTEM = [
  'You convert a customer\'s natural-language grocery request into structured intent.',
  'Extract only what is stated or clearly implied. Do not invent details.',
  'people = total number of people to feed. ageGroups from any of adult/teenager/child mentioned.',
  'durationDays = how many days the food must cover (a weekend is 3).',
  'mealNeeds e.g. "easy dinners", "breakfasts", "lunches", "snacks".',
  'dietaryNeeds e.g. "pescatarian", "vegetarian", "vegan", "gluten-free".',
  'avoid = things to leave out (e.g. "spicy food", "nuts").',
  'priorities e.g. "easy preparation", "teen-friendly", "low waste", "value-conscious".',
  'budget = a number in NZD if stated, otherwise null.',
  'Use NZ English. Return null budget rather than guessing.',
].join(' ');

/** Model id matches the repo\'s existing structured-parse usage. */
const INTENT_MODEL = 'claude-sonnet-4-6';

export const anthropicIntentService: IntentService = {
  async parse(statedIntent: string): Promise<IntentParseResult> {
    const fallback = parseGroceryIntent(statedIntent);
    if (!process.env.ANTHROPIC_API_KEY) return fallback;
    try {
      const { object } = await generateObject({
        model: anthropic(INTENT_MODEL),
        schema: GroceryIntentSchema,
        system: SYSTEM,
        prompt: `Structure this request:\n\n"""${statedIntent.slice(0, 1200)}"""`,
        maxRetries: 1,
      });
      const parsed = GroceryIntentSchema.safeParse(object);
      if (!parsed.success) return fallback;
      // Merge: trust the model, but keep any deterministic uncertainties it
      // didn\'t surface (e.g. "no budget stated").
      const uncertainties = parsed.data.budget == null
        ? Array.from(new Set([...fallback.uncertainties]))
        : [];
      return { intent: parsed.data, confidence: 0.85, uncertainties };
    } catch {
      return fallback;
    }
  },
};

/**
 * The intent service the runtime should use. Model-backed when a key is present,
 * deterministic otherwise — chosen here so callers stay agnostic.
 */
export function resolveIntentService(): IntentService {
  return anthropicIntentService;
}
