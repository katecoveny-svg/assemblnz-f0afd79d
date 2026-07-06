import 'server-only';
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import type { ParsedWeek } from '@/lib/family/types';

/**
 * Newsletter → the family week. The agent EXTRACTS structure and PROPOSES
 * actions — it never books, pays, RSVPs or messages. It returns JSON only;
 * the backend stores everything as 'proposed' and the family approves.
 *
 * Model: claude-sonnet-4-6 (the marketplace mid tier) via the AI SDK. Fails
 * safe — on any error the caller keeps the dashboard working with a note.
 */

const schema = z.object({
  summary: z.string().describe('One warm sentence: what this week holds for the family.'),
  events: z.array(z.object({
    title: z.string(),
    when_label: z.string().describe('Human date/time as written, e.g. "Friday 6pm"'),
    person: z.string().optional().describe('Which child/family member, if named'),
    location: z.string().optional(),
  })),
  tasks: z.array(z.object({
    title: z.string().describe('A form to sign, a payment, a thing to bring or reply to'),
    person: z.string().optional(),
    due_label: z.string().optional(),
  })),
  pickups: z.array(z.object({
    child: z.string(),
    from: z.string().describe('Where they need collecting from'),
    when_label: z.string(),
    note: z.string().optional(),
  })),
  shopping: z.array(z.object({
    list: z.string().describe('A named list, e.g. "Shared lunch — nut-free plate"'),
    items: z.array(z.string()),
    reason: z.string().optional(),
  })),
  approvals: z.array(z.object({
    title: z.string(),
    reason: z.string(),
    kind: z.enum(['money', 'transport', 'messaging', 'shopping', 'other']),
  })),
  memory: z.array(z.object({
    fact: z.string().describe('A durable family constraint/preference worth remembering'),
    person: z.string().optional(),
  })),
});

const SYSTEM = `You are the Family OS — a household assistant for a New Zealand family.
You turn a school newsletter (or daycare bulletin, sports email, class notice) into the family's week.

Rules (never break):
- You EXTRACT and PROPOSE only. You never book, pay, RSVP, message anyone, or spend money. Every real-world action becomes an "approval" the adult confirms first.
- Anything involving money, transport, external messaging, or shopping MUST also appear as an approval.
- Be specific and practical: real dates/times as written, the child's name where given, where a pickup is from.
- Turn "bring X / shared plate / mufti / sports kit" into a shopping list with concrete items (nut-free if the family has an allergy).
- Keep it warm and NZ-family (kai, kura, whānau where natural). Only include what's genuinely in the newsletter — don't invent events.
- memory = durable facts worth keeping (allergies, routines, constraints) — only if the newsletter clearly implies one.`;

export async function parseNewsletter(text: string, family: {
  children?: string[];
  memory?: string[];
} = {}): Promise<ParsedWeek | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const context = [
    family.children?.length ? `Children: ${family.children.join(', ')}.` : '',
    family.memory?.length ? `Known family facts: ${family.memory.join('; ')}.` : '',
  ].filter(Boolean).join(' ');
  try {
    const { object } = await generateObject({
      model: anthropic('claude-sonnet-4-6'),
      schema,
      system: SYSTEM,
      prompt: `${context ? context + '\n\n' : ''}Here is the newsletter. Extract the family's week:\n\n"""${text.slice(0, 8000)}"""`,
      maxRetries: 1,
    });
    return object as ParsedWeek;
  } catch {
    return null;
  }
}
