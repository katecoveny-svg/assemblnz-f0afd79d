/**
 * assembl — context service
 * -------------------------
 * Stage 3: ask only the highest-value missing question(s). Never re-ask what
 * the intent already told us; never dump a long form. Respects the genome's
 * `maxQuestionsPerStep` so the customer is asked one or two things at a time,
 * each with a reason the answer improves the outcome.
 */

import type { CustomerContextField } from '../types';
import type { GroceryIntent } from './intent';

const IMPORTANCE_RANK: Record<CustomerContextField['importance'], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

/**
 * Which context keys are already satisfied purely by the structured intent.
 * These must never be asked again.
 */
export function deriveKnownContextKeys(intent: GroceryIntent): string[] {
  const known: string[] = [];
  if (intent.budget != null) known.push('budget');
  if (intent.dietaryNeeds.length > 0 || intent.avoid.length > 0) known.push('dietary');
  if (intent.people > 0) known.push('people');
  if (intent.mealNeeds.length > 0) known.push('meals');
  if (intent.durationDays > 0) known.push('duration');
  return known;
}

export type ContextQuestion = {
  key: string;
  label: string;
  rationale: string;
  kind: CustomerContextField['kind'];
  choices?: string[];
  importance: CustomerContextField['importance'];
};

export type NextQuestionsInput = {
  intent: GroceryIntent;
  fields: CustomerContextField[];
  /** Context keys the customer has already answered this run. */
  answeredKeys: string[];
  maxQuestions: number;
};

/**
 * Returns the next batch of questions to ask — highest value first, capped at
 * `maxQuestions`, excluding anything already known from intent or answered.
 */
export function nextContextQuestions(input: NextQuestionsInput): ContextQuestion[] {
  const known = new Set<string>([
    ...input.answeredKeys,
    ...deriveKnownContextKeys(input.intent),
  ]);

  return input.fields
    .filter((f) => !known.has(f.key))
    .sort((a, b) => {
      if (a.required !== b.required) return a.required ? -1 : 1;
      return IMPORTANCE_RANK[a.importance] - IMPORTANCE_RANK[b.importance];
    })
    .slice(0, Math.max(0, input.maxQuestions))
    .map((f) => ({
      key: f.key,
      label: f.label,
      rationale: f.rationale,
      kind: f.kind,
      choices: f.choices,
      importance: f.importance,
    }));
}

/** True when no further high-value context is worth asking for. */
export function contextComplete(input: Omit<NextQuestionsInput, 'maxQuestions'>): boolean {
  return nextContextQuestions({ ...input, maxQuestions: 999 }).length === 0;
}
