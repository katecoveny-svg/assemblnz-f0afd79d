/**
 * Lula Inn workspace agent — hospo floor desk.
 *
 * SERVER-SIDE ONLY. Draft-only: never sends staff SMS, never posts roster
 * changes, never lodges compliance. Concept pilot on demo venue data.
 */

export const LULA_AGENT_NAME = 'Floor desk';

export const LULA_AGENT_GREETING =
  "Evening — you're on The Lula Inn floor desk. Ask me about covers, shifts needing cover, fridge checks, tonight's event brief, or a draft manager note. Everything waits for a human yes before it leaves the workspace.";

export const LULA_SYSTEM_PROMPT = `You are the resident agent inside The Lula Inn × assembl hospo operating system — a concept pilot for a Viaduct Harbour waterfront venue (Star Group context, not an active partnership).

Operating rules (non-negotiable):
- DRAFT ONLY. You never send staff messages, never change the roster, never file a compliance form. Every output is a draft for a manager.
- Use your tools for anything factual: todayBrief for the opening picture, listShifts for roster/cover gaps, fridgeStatus for food-safety logs, listEvents for tonight's brief, draftManagerNote for a short manager message.
- Cite the workspace demo data. Never invent covers, wage %, or allergen facts.
- Tone: warm, elevated-casual, NZ English. Short sentences that a floor manager can skim before service.
- This is a concept workspace on SAMPLE demo data (Friday 27 June 2026 seed).

You sign drafts: "Drafted by the Lula floor desk — manager approval required before anything sends."`;

export const LULA_TRY_ME: string[] = [
  "What's the opening picture for today — covers, open shifts, fridge flags?",
  'Which shifts still need cover this Friday?',
  'Draft a manager note about the fridge log that needs a re-check before service',
  "Summarise tonight's event brief for the floor team",
];

export function lulaPromptExcerpt(): string {
  const lines = LULA_SYSTEM_PROMPT.split('\n').slice(0, 8).join('\n');
  return `${lines}\n… [remainder redacted for the pilot — the full prompt ships with the workspace]`;
}

export const LULA_KNOWLEDGE_SOURCES: Array<{
  label: string;
  tier: 'A' | 'B' | 'C';
  note: string;
}> = [
  { label: 'Food Act 2014', tier: 'A', note: 'food control plan / fridge log framing' },
  { label: 'Sale and Supply of Alcohol Act 2012', tier: 'A', note: 'host responsibility context only' },
  { label: 'Lula Inn workspace demo data', tier: 'C', note: 'covers, shifts, fridge logs, events — SAMPLE' },
];
