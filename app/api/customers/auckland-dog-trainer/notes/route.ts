import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { ModelMessage } from 'ai';
import { MODEL_TIER_TO_ANTHROPIC } from '@/lib/marketplace/agents';
import { generateWithFallback, resolveModelLadder } from '@/lib/ai/router';
import {
  transformSessionNotes,
  type NotesPlan,
} from '@/lib/customers/auckland-dog-trainer/notes-engine';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST /api/customers/auckland-dog-trainer/notes — the session scribe agent.
 *
 * Takes a raw session voice-note transcript and drafts the six outputs
 * (client summary, dog profile, homework, risk notes, course match, next
 * booking, handover, follow-up) with the real model ladder. Falls back to the
 * deterministic local transform when no model key is configured or the model
 * reply cannot be parsed — the scribe always answers. DRAFT-ONLY: nothing is
 * sent to a client from here.
 */

const BodySchema = z.object({
  note: z.string().trim().min(10).max(8000),
});

const PlanSchema = z.object({
  clientSummary: z.string().min(1),
  dogProfile: z.object({
    name: z.string().min(1),
    age: z.string().min(1),
    breed: z.string().min(1),
    issues: z.array(z.string().min(1)).min(1),
  }),
  weeklyHomework: z.array(z.string().min(1)).min(2),
  riskNotes: z.array(z.string().min(1)).min(1),
  courseMatch: z.object({ module: z.string().min(1), reason: z.string().min(1) }),
  nextBooking: z.object({ offer: z.string().min(1), reason: z.string().min(1) }),
  trainerHandover: z.string().min(1),
  followUp: z.object({ when: z.string().min(1), message: z.string().min(1) }),
  contentIdea: z.string().min(1),
});

const SYSTEM = `You are the session scribe inside the Harbourside Dog Training operating system — Sam's practice (Harbourside Dog Training — a fictional sample business, Auckland).

Sam records a quick voice note after a session. You turn it into structured drafts, in Sam's warm, plain-spoken NZ-English voice. Everything is a DRAFT for Sam's yes — never claim anything was sent or booked.

Sam's programme catalogue for course/booking matching: Private In-Home Session; 6-Week Obedience & Manners; Recall Mastery (4 weeks, ethical e-collar); Reactivity Rewired (6 weeks); Perfect Dog Board & Train (3 weeks); Boutique Boarding; Group Bootcamp (4-week Saturday group intensives, new); Online Course.

Return ONLY a JSON object (no prose, no markdown fences) with exactly these keys:
{
  "clientSummary": string,          // friendly recap email to the owner, signed "— Sam · Harbourside Dog Training"
  "dogProfile": { "name": string, "age": string, "breed": string, "issues": string[] },
  "weeklyHomework": string[],       // 3-4 concrete tasks for the owner this week
  "riskNotes": string[],            // safety/handling flags; ["No elevated risk flags from this note."] if none
  "courseMatch": { "module": string, "reason": string },
  "nextBooking": { "offer": string, "reason": string },
  "trainerHandover": string,        // brief for another trainer covering the dog
  "followUp": { "when": string, "message": string },
  "contentIdea": string             // one social/email content idea drawn from the session
}
Rules: ground every field in the note — never invent bite history, prices, or client details that are not stated. If a detail is missing use "not stated". NZ English.`;

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    );
  }
  const { note } = parsed.data;

  const ladder = resolveModelLadder(MODEL_TIER_TO_ANTHROPIC.mid, []);
  if (ladder.length > 0) {
    const messages: ModelMessage[] = [{ role: 'user', content: note }];
    const result = await generateWithFallback({
      ladder,
      system: SYSTEM,
      messages,
      agentSlug: 'adt-session-scribe',
    });
    if (result.ok) {
      const jsonStr = result.text
        .replace(/^```(?:json)?/i, '')
        .replace(/```$/i, '')
        .trim();
      try {
        const plan = PlanSchema.parse(JSON.parse(jsonStr)) as NotesPlan;
        return NextResponse.json({ plan, engine: 'model' as const });
      } catch {
        // fall through to the local engine below
      }
    }
  }

  return NextResponse.json({
    plan: transformSessionNotes(note),
    engine: 'local' as const,
  });
}
