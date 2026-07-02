/**
 * The Auckland Zoo workspace agent — Kaitiaki running as the keeping team's
 * resident intelligence.
 *
 * System prompt lives here SERVER-SIDE ONLY. Draft-only. The kaumātua-hold is
 * a hard rule: no taonga species (kiwi, tuatara, tūī or other taonga), no
 * whakapapa data — that work waits for kaumātua guidance, full stop.
 */

export const ZOO_AGENT_NAME = 'Kaitiaki';

export const ZOO_AGENT_GREETING =
  'Kia ora, kaitiaki — the day begins at the Zoo. I can log enrichment, draft the daily welfare email to the vet team, or prep a school-group brief. Every draft waits for a keeper before it goes anywhere.';

export const ZOO_SYSTEM_PROMPT = `You are Kaitiaki, the resident agent inside the Auckland Zoo keeper workspace — the AI operating system for the keeping team (a concept pilot; assembl is not affiliated with or endorsed by Auckland Zoo).

Operating rules (non-negotiable):
- DRAFT ONLY. You never send an email, file a record, or notify anyone. Every output is a draft a keeper or the vet team reviews. Say so when it matters.
- KAUMĀTUA-HOLD (hard rule): you hold NO data on taonga species — kiwi, tuatara, tūī, or any other taonga. If asked, explain that work on taonga species waits for kaumātua guidance and is deliberately out of this pilot's scope. Do not improvise about them.
- Use your tools for anything factual: lookupAnimal for the animal register, enrichmentLog for the enrichment template, welfareEmail for the daily vet-team email shape, schoolGroupBrief for precinct briefs, searchNZKnowledge for NZ law (Animal Welfare Act 1999, zoo containment standards).
- Cite what the tools return. Never invent an animal, a welfare observation, or a standard.
- Welfare language is factual and specific — behaviours observed, not anthropomorphised moods.
- Tone: warm, collegial, NZ English. You are talking to keepers at 7am.
- Concept pilot on demo data: the register holds six demo animals (Freya & Fiona the lionesses, Rimu the red panda, Momo the squirrel monkey, Anjalee the elephant, Miko the otter).

You sign drafts: "Drafted by Kaitiaki — keeper review before anything moves."`;

export const ZOO_TRY_ME: string[] = [
  "Log today's enrichment for Rimu the red panda — puzzle feeder, 20 minutes",
  'Draft the daily welfare check email to the vet team',
  'Prep the school-group brief for the Africa precinct',
  'What does the Animal Welfare Act require for enrichment records?',
];

export function zooPromptExcerpt(): string {
  const lines = ZOO_SYSTEM_PROMPT.split('\n').slice(0, 8).join('\n');
  return `${lines}\n… [remainder redacted for the pilot — the full prompt ships with the workspace]`;
}

export const ZOO_KNOWLEDGE_SOURCES: Array<{
  label: string;
  tier: 'A' | 'B' | 'C';
  note: string;
}> = [
  { label: 'Animal Welfare Act 1999', tier: 'A', note: 'duty of care, enrichment, welfare records' },
  { label: 'Zoo containment standards (MPI/EPA)', tier: 'A', note: 'enclosure + inspection obligations' },
  { label: 'assembl NZ industry knowledge base (pgvector)', tier: 'B', note: 'legislation + official guidance, cited with URLs' },
  { label: 'Keeper workspace register (demo set)', tier: 'C', note: 'six demo animals · kaumātua-hold on taonga species' },
];

/** Seeded "today" activity for the transparency tab — all demo. */
export const ZOO_ACTIVITY: Array<{ at: string; kind: string; note: string }> = [
  { at: '06:40', kind: 'read', note: 'Scanned overnight keeper notes — 6 register animals, no flags.' },
  { at: '07:05', kind: 'drafted', note: 'Drafted daily welfare email to the vet team (awaiting keeper review).' },
  { at: '07:30', kind: 'computed', note: 'Rotated enrichment schedule — Rimu puzzle feeder difficulty up one step.' },
  { at: '08:10', kind: 'flagged', note: 'MPI enclosure inspection window opens 15 Jul — prep checklist queued.' },
  { at: '08:45', kind: 'drafted', note: 'School-group brief drafted for the Africa precinct (60-cap talk at 11:00).' },
];

/** Demo Mana Receipt stubs — the shape the pilot writes, clearly placeholder. */
export const ZOO_RECEIPTS: Array<{
  id: string;
  createdAt: string;
  citations: Array<{ source: string; ref?: string }>;
  receiptHash: string;
  prevHash: string | null;
  hitlStatus?: string;
}> = [
  {
    id: 'MR-ZOO-0003 · daily welfare email',
    createdAt: '2 Jul 2026, 7:05 am',
    citations: [{ source: 'Keeper workspace register', ref: 'demo set' }, { source: 'Animal Welfare Act 1999' }],
    receiptHash: 'demo:receipt — issued when the pilot runs live',
    prevHash: null,
    hitlStatus: 'pending_review',
  },
  {
    id: 'MR-ZOO-0002 · enrichment log — Rimu',
    createdAt: '1 Jul 2026, 2:20 pm',
    citations: [{ source: 'Animal Welfare Act 1999', ref: 'enrichment record' }],
    receiptHash: 'demo:receipt — issued when the pilot runs live',
    prevHash: null,
    hitlStatus: 'reviewed',
  },
  {
    id: 'MR-ZOO-0001 · school-group brief — Africa',
    createdAt: '1 Jul 2026, 9:12 am',
    citations: [{ source: 'Keeper workspace register', ref: 'demo set' }],
    receiptHash: 'demo:receipt — issued when the pilot runs live',
    prevHash: null,
    hitlStatus: 'final',
  },
];
