import 'server-only';
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import type { FamilyKind } from '@/lib/family/types';

/**
 * "Throw it in" — the family drop parser. Anyone in the whānau can drop a note
 * ("Mila's netball moved to Saturday 10am") from any device; this routes the
 * intent to the right tab and returns a single PROPOSED item for Kate to
 * approve. Same NLP layer that grounds the newsletter parse — draft-only.
 */

const schema = z.object({
  kind: z.enum(['event', 'task', 'pickup', 'shopping', 'approval', 'memory']).describe('Which part of the family week this belongs to'),
  title: z.string().describe('A short, clear title for the item'),
  when_label: z.string().optional().describe('Human date/time if one is mentioned, e.g. "Saturday 10am"'),
  person: z.string().optional().describe('Which child/family member, if named'),
  location: z.string().optional(),
});

export type DroppedItem = z.infer<typeof schema>;

const SYSTEM = `You route a single quick note from a New Zealand family member into ONE item for the family dashboard.
Kinds:
- event: something happening at a time (a game, a party, an appointment, a school thing)
- pickup: someone needs collecting from somewhere
- shopping: something to buy / add to the list
- task: a thing to do, sign, bring or reply to
- approval: anything involving money, a payment, or booking transport/messaging — flag for the parent
- memory: a durable family fact/preference/constraint worth remembering
Rules: extract the real date/time as written; name the child if given; keep the title short and practical. Never invent detail. Draft-only — you propose, the parent approves.`;

/** Keyword fallback when no model key is set — still routes sensibly. */
function heuristic(text: string): DroppedItem {
  const t = text.toLowerCase();
  const kind: FamilyKind =
    /\b(pick ?up|collect|drop ?off|from school|from the)\b/.test(t) ? 'pickup' :
    /\b(buy|get|need|milk|bread|shop|grocer|list)\b/.test(t) ? 'shopping' :
    /\b(pay|\$|deposit|allowance|money|booking|book)\b/.test(t) ? 'approval' :
    /\b(remember|always|never|allerg|hates|loves)\b/.test(t) ? 'memory' :
    /\b(at|on|pm|am|tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday|game|training|party|appointment)\b/.test(t) ? 'event' :
    'task';
  return { kind, title: text.trim().slice(0, 120) };
}

export async function parseDrop(text: string): Promise<DroppedItem> {
  const clean = text.trim();
  if (!clean) return { kind: 'task', title: '(empty note)' };
  if (!process.env.ANTHROPIC_API_KEY) return heuristic(clean);
  try {
    const { object } = await generateObject({
      model: anthropic('claude-sonnet-4-6'),
      schema,
      system: SYSTEM,
      prompt: `Route this family note into one item:\n\n"""${clean.slice(0, 800)}"""`,
      maxRetries: 1,
    });
    return object;
  } catch {
    return heuristic(clean);
  }
}
