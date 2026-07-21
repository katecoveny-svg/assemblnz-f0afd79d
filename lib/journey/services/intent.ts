/**
 * assembl — intent service
 * ------------------------
 * Stage 2: turn a customer's natural language into structured intent.
 *
 * This is a DETERMINISTIC mock behind a clean `IntentService` interface. It is
 * never called from a React component — the runtime calls it. A real model
 * integration (via the repo's `ai` SDK) implements the same interface and
 * returns output validated against `GroceryIntentSchema`; invalid model output
 * fails safe to a low-confidence partial rather than throwing into the UI.
 */

import { z } from 'zod';

/* ── Structured grocery intent (validated) ─────────────────────────────── */

export const AgeGroupSchema = z.enum(['adult', 'teenager', 'child']);

export const GroceryIntentSchema = z.object({
  occasion: z.string(),
  people: z.number().int().nonnegative(),
  ageGroups: z.array(AgeGroupSchema),
  durationDays: z.number().int().positive(),
  mealNeeds: z.array(z.string()),
  dietaryNeeds: z.array(z.string()),
  avoid: z.array(z.string()),
  priorities: z.array(z.string()),
  budget: z.number().positive().nullable(),
});
export type GroceryIntent = z.infer<typeof GroceryIntentSchema>;

export type IntentParseResult = {
  intent: GroceryIntent;
  /** 0–1 confidence in the interpretation. */
  confidence: number;
  /** Things the system is unsure about — flagged, never silently guessed. */
  uncertainties: string[];
};

export interface IntentService {
  parse(statedIntent: string): Promise<IntentParseResult>;
}

/* ── Deterministic parsing helpers ─────────────────────────────────────── */

const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
  eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
};

function firstNumberNear(text: string, nounPattern: RegExp): number | null {
  const m = text.match(nounPattern);
  if (!m) return null;
  const token = m[1]?.toLowerCase();
  if (!token) return null;
  if (NUMBER_WORDS[token] != null) return NUMBER_WORDS[token];
  const n = Number.parseInt(token, 10);
  return Number.isFinite(n) ? n : null;
}

const EMPTY_INTENT: GroceryIntent = {
  occasion: 'a shop',
  people: 0,
  ageGroups: [],
  durationDays: 1,
  mealNeeds: [],
  dietaryNeeds: [],
  avoid: [],
  priorities: [],
  budget: null,
};

/**
 * The deterministic parser. Pure and synchronous under the hood so it is easy
 * to test; wrapped in a Promise to match the async service contract.
 */
export function parseGroceryIntent(statedIntent: string): IntentParseResult {
  const text = statedIntent.toLowerCase();
  const uncertainties: string[] = [];
  let confidence = 0.55;

  // People + age groups.
  const ageGroups: GroceryIntent['ageGroups'] = [];
  const teens = firstNumberNear(text, /(\w+)\s+teen(?:ager)?s?/);
  const adults = firstNumberNear(text, /(\w+)\s+adults?/);
  const kids = firstNumberNear(text, /(\w+)\s+(?:kids?|children|child)/);
  if (teens != null) ageGroups.push('teenager');
  if (adults != null) ageGroups.push('adult');
  if (kids != null) ageGroups.push('child');
  let people = (teens ?? 0) + (adults ?? 0) + (kids ?? 0);
  if (people === 0) {
    // Try a bare "for N people".
    const generic = firstNumberNear(text, /(\w+)\s+people/);
    if (generic != null) {
      people = generic;
      confidence += 0.05;
    }
  } else {
    confidence += 0.1;
  }

  // Occasion.
  let occasion = 'a shop';
  if (/beach ?house|holiday ?house|bach/.test(text)) occasion = 'weekend at the beach house';
  else if (/birthday/.test(text)) occasion = 'birthday gathering';
  else if (/friends? (staying|over|round)/.test(text)) occasion = 'friends staying';
  else if (/school lunch/.test(text)) occasion = 'school lunches';
  else if (/weekend/.test(text)) occasion = 'a weekend';
  else if (/week/.test(text)) occasion = 'a busy week';
  if (occasion !== 'a shop') confidence += 0.05;

  // Duration.
  let durationDays = 1;
  const nights = firstNumberNear(text, /(\w+)\s+nights?/);
  const days = firstNumberNear(text, /(\w+)\s+days?/);
  if (nights != null) durationDays = nights + 1;
  else if (days != null) durationDays = days;
  else if (/weekend/.test(text)) durationDays = 3;
  else if (/week/.test(text)) durationDays = 7;

  // Meal needs.
  const mealNeeds: string[] = [];
  if (/easy dinners?|quick dinners?/.test(text)) mealNeeds.push('easy dinners');
  else if (/dinners?/.test(text)) mealNeeds.push('dinners');
  if (/breakfasts?/.test(text)) mealNeeds.push('breakfasts');
  if (/lunch(?:es)?/.test(text)) mealNeeds.push('lunches');
  if (/snacks?/.test(text)) mealNeeds.push('snacks');
  if (mealNeeds.length) confidence += 0.1;

  // Dietary needs.
  const dietaryNeeds: string[] = [];
  if (/pescatarian/.test(text)) dietaryNeeds.push('pescatarian');
  if (/vegetarian/.test(text)) dietaryNeeds.push('vegetarian');
  if (/vegan/.test(text)) dietaryNeeds.push('vegan');
  if (/gluten[- ]free/.test(text)) dietaryNeeds.push('gluten-free');
  if (dietaryNeeds.length) confidence += 0.05;

  // Avoidances.
  const avoid: string[] = [];
  if (/(hate|hates|avoid|no|not) .*spic|spicy/.test(text) && /spic/.test(text)) {
    avoid.push('spicy food');
  }
  if (/nut allerg|no nuts|avoid nuts/.test(text)) avoid.push('nuts');

  // Priorities.
  const priorities: string[] = [];
  if (/easy|simple|quick|minimal/.test(text)) priorities.push('easy preparation');
  if (/teen/.test(text)) priorities.push('teen-friendly');
  if (/low waste|no waste|not waste/.test(text)) priorities.push('low waste');
  if (/value|budget|cheap|afford/.test(text)) priorities.push('value-conscious');
  if (/shared|share|together/.test(text)) priorities.push('shared meals');

  // Budget.
  let budget: number | null = null;
  const budgetMatch = text.match(/\$\s?(\d+(?:\.\d+)?)/);
  if (budgetMatch) {
    budget = Number.parseFloat(budgetMatch[1]);
    confidence += 0.05;
  } else {
    uncertainties.push('No budget stated — will ask before finalising.');
  }

  if (people === 0) uncertainties.push('Number of people is unclear.');
  if (!/deliver|collect|pick ?up/.test(text)) {
    uncertainties.push('Delivery or collection not stated.');
  }

  const intent: GroceryIntent = {
    ...EMPTY_INTENT,
    occasion,
    people,
    ageGroups,
    durationDays,
    mealNeeds,
    dietaryNeeds,
    avoid,
    priorities,
    budget,
  };

  return {
    intent,
    confidence: Math.min(0.95, Number(confidence.toFixed(2))),
    uncertainties,
  };
}

/** The default deterministic service used by the seed runtime. */
export const mockIntentService: IntentService = {
  async parse(statedIntent: string): Promise<IntentParseResult> {
    const result = parseGroceryIntent(statedIntent);
    // Validate our own output against the schema — same gate a live model hits.
    const parsed = GroceryIntentSchema.safeParse(result.intent);
    if (!parsed.success) {
      // Fail safe: return an empty, explicitly-uncertain intent rather than throw.
      return {
        intent: EMPTY_INTENT,
        confidence: 0,
        uncertainties: ['Could not interpret the request — please rephrase.'],
      };
    }
    return { ...result, intent: parsed.data };
  },
};

/**
 * Adapter for a live model. Pass a function that returns raw JSON; output is
 * validated and falls back safely on invalid data (never throws into the UI).
 */
export function liveIntentService(
  call: (statedIntent: string) => Promise<unknown>,
): IntentService {
  return {
    async parse(statedIntent: string): Promise<IntentParseResult> {
      let raw: unknown;
      try {
        raw = await call(statedIntent);
      } catch {
        raw = null;
      }
      const parsed = GroceryIntentSchema.safeParse(raw);
      if (!parsed.success) {
        return {
          intent: EMPTY_INTENT,
          confidence: 0,
          uncertainties: ['The interpretation could not be validated — asking for detail instead.'],
        };
      }
      return { intent: parsed.data, confidence: 0.7, uncertainties: [] };
    },
  };
}
