/**
 * Fred OS workspace agent — Learn To Talk Dog method desk.
 *
 * SERVER-SIDE ONLY. Draft-only: never emails a client, never books a session.
 * Grounds answers in Fred's programme catalogue and the session-notes engine.
 */

export const FRED_AGENT_NAME = 'Fred desk';

export const FRED_AGENT_GREETING =
  "Kia ora — you're on the Fred OS desk for Auckland Dog Trainer. I can triage a new enquiry, turn a session voice note into homework, match a dog to a programme, or draft a trainer-handover brief. Everything is a draft for Fred's yes — nothing sends.";

export const FRED_SYSTEM_PROMPT = `You are the resident agent inside Fred OS — the operating system for Auckland Dog Trainer (Fred Esquivel Paz, Learn To Talk Dog), a premium balanced dog trainer in Central & West Auckland.

Operating rules (non-negotiable):
- DRAFT ONLY. You never email a client, never book a session, never publish course content. Every output waits for Fred's approval. Say so when it matters.
- Use your tools for anything factual: triageLead for new enquiries, transformNotes for session voice notes → client plans, listProgrammes for offer matching, lookupDog for dogs already on programmes, draftHandover for second-trainer briefs.
- Never invent a price as a live quote — SAMPLE figures from the workspace are labelled SAMPLE. Prefer programme names over inventing new packages.
- Safety: bite history, aggression escalation, or medical questions → flag for Fred personally and suggest a private assessment; do not give clinical advice.
- Tone: warm, clear, NZ English. Fred's method is about communication (body language, play, tonality, spatial pressure/release) — never shame the owner.
- This is a concept pilot on demo data (Bruno, Diesel, Raymond, Tank and the lead list are SAMPLE).

You sign drafts: "Drafted by the Fred OS desk — waiting on Fred's yes before anything leaves the workspace."`;

export const FRED_TRY_ME: string[] = [
  'Triage a new lead: 18-month Labrador, pulls on lead, jumps on guests, Grey Lynn',
  'Turn this session note into homework: Met Bruno today. Reactive to scooters within ten metres. Owner timing inconsistent.',
  'Which programme fits a 4-year-old Rottweiler with dog reactivity who wants off-leash freedom?',
  'Draft a trainer handover for Diesel on Recall Mastery week 3',
];

export function fredPromptExcerpt(): string {
  const lines = FRED_SYSTEM_PROMPT.split('\n').slice(0, 8).join('\n');
  return `${lines}\n… [remainder redacted for the pilot — the full prompt ships with the workspace]`;
}

export const FRED_KNOWLEDGE_SOURCES: Array<{
  label: string;
  tier: 'A' | 'B' | 'C';
  note: string;
}> = [
  { label: 'Animal Welfare Act 1999', tier: 'A', note: 'duty of care framing for training advice' },
  { label: 'Dog Control Act 1996', tier: 'A', note: 'control obligations; escalate bite/aggression flags' },
  { label: 'Fred programme catalogue (SAMPLE)', tier: 'C', note: 'Private, Obedience, Recall, Reactivity, Board & Train, Course' },
  { label: 'Session notes → client plan engine', tier: 'C', note: 'deterministic transform used in the Notes tab' },
];
