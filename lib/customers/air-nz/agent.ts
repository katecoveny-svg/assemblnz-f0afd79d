/**
 * The Air NZ partner-ops agent — the Assembling desk.
 *
 * TIER-2 SLICE (locked positioning): Assembling is the wait-moment earn layer
 * bolted onto Air New Zealand's existing product. It is NOT the airline's
 * operating system and must never be framed as one.
 *
 * System prompt lives here SERVER-SIDE ONLY. Concept demo — mocked data, no
 * live Air NZ / Koru / Airpoints systems, no real points ever minted.
 */

export const AIRNZ_AGENT_NAME = 'Assembling';

export const AIRNZ_AGENT_GREETING =
  "Kia ora — the Assembling desk here: the earn layer running inside the Air New Zealand partnership concept. Ask me for a wait-state earn trajectory, the morning briefing, or a sponsor read-out. Concept demo — nothing here touches a live Air NZ system.";

export const AIRNZ_SYSTEM_PROMPT = `You are the Assembling desk agent inside the Air New Zealand partner-operations concept console. Assembling is the wait-moment earn layer — passengers earn during the natural waits of a trip (gate, boarding, IFE) from sponsor-funded moments.

Scope rules (non-negotiable):
- TIER-2 SLICE: Assembling is a layer inside Air New Zealand's existing product. You are NOT the airline's operating system, never claim to run the airline, and defer anything outside the earn layer (ops, scheduling, service) to Air NZ's own teams.
- CONCEPT DEMO: all data is mocked. No live Air NZ, Koru, or Airpoints systems are touched, and no real Airpoints Dollars are ever minted. Say so when asked.
- Use your tools for anything factual: earnTrajectory for wait-state earn across a day, morningBrief for the CDO briefing, sponsorLookup for sponsors/campaigns, searchNZKnowledge for NZ law (Fair Trading Act, Privacy Act IPP 3A).
- Analytics are aggregate-only, minimum bucket 1,000, no PII — hold that line in every answer.
- Numbers: NZD. The revenue split is fixed: 55% treasury (60% of that credited to members as Airpoints Dollars), 45% assembl share.
- Tone: crisp partner-ops. Short sentences.

You sign: "Assembling desk — concept demo, no live systems touched."`;

export const AIRNZ_TRY_ME: string[] = [
  "Show me a passenger's wait-state earn trajectory across today's flights",
  'Draft the tomorrow-morning briefing for the customer team',
  'Which route is converting best right now?',
  'How does the revenue split work on NZ$10,000 gross?',
];

export function airnzPromptExcerpt(): string {
  const lines = AIRNZ_SYSTEM_PROMPT.split('\n').slice(0, 8).join('\n');
  return `${lines}\n… [remainder redacted for the pilot — the full prompt ships with the workspace]`;
}

export const AIRNZ_KNOWLEDGE_SOURCES: Array<{
  label: string;
  tier: 'A' | 'B' | 'C';
  note: string;
}> = [
  { label: 'Privacy Act 2020 · IPP 3A', tier: 'A', note: 'automated-decision notice, aggregate-only analytics' },
  { label: 'Fair Trading Act 1986', tier: 'A', note: 'sponsor creative claims' },
  { label: 'assembl NZ industry knowledge base (pgvector)', tier: 'B', note: 'legislation + official guidance, cited with URLs' },
  { label: 'Partner-ops workspace (mocked)', tier: 'C', note: 'sponsors · campaigns · segments — concept demo only' },
];

/** Seeded "today" activity for the transparency tab — all demo. */
export const AIRNZ_ACTIVITY: Array<{ at: string; kind: string; note: string }> = [
  { at: '06:00', kind: 'drafted', note: "CDO morning brief drafted for Jeremy O'Brien (awaiting review)." },
  { at: '06:20', kind: 'read', note: 'Overnight gate + IFE fill scanned — 66% held, no unsold premium evening bank.' },
  { at: '07:45', kind: 'flagged', note: '2degrees gate creative claim fix still open — go-live 15 Jul at risk.' },
  { at: '09:10', kind: 'computed', note: 'Re-ran route conversion — AKL⇄ZQN leads at 44% opt-in.' },
];

/** Demo Mana Receipt stubs — the shape the slice writes, clearly placeholder. */
export const AIRNZ_RECEIPTS: Array<{
  id: string;
  createdAt: string;
  citations: Array<{ source: string; ref?: string }>;
  receiptHash: string;
  prevHash: string | null;
  hitlStatus?: string;
}> = [
  {
    id: 'MR-AIRNZ-0002 · CDO morning brief',
    createdAt: '2 Jul 2026, 6:00 am',
    citations: [{ source: 'Partner-ops workspace', ref: 'mocked revenue + compliance' }],
    receiptHash: 'demo:receipt — issued when the partnership runs live',
    prevHash: null,
    hitlStatus: 'pending_review',
  },
  {
    id: 'MR-AIRNZ-0001 · sponsor claim flag — 2degrees',
    createdAt: '1 Jul 2026, 4:32 pm',
    citations: [{ source: 'Fair Trading Act 1986', ref: 'creative claims' }],
    receiptHash: 'demo:receipt — issued when the partnership runs live',
    prevHash: null,
    hitlStatus: 'reviewed',
  },
];
