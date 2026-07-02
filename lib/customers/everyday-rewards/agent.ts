/**
 * The Everyday Rewards partner-ops agent — the Assembling desk.
 *
 * TIER-2 SLICE (locked positioning): Assembling is the wait-moment earn layer
 * inside Everyday Rewards' existing programme. It is NOT their operating
 * system and must never be framed as one.
 *
 * System prompt lives here SERVER-SIDE ONLY. Concept demo — mocked data, no
 * live Everyday Rewards systems, no real points ever minted.
 */

export const EDR_AGENT_NAME = 'Assembling';

export const EDR_AGENT_GREETING =
  'Kia ora — the Assembling desk here: the wait-moment earn layer inside the Everyday Rewards partnership concept. Ask me for the earn rate this hour, the weekly partner email, or a reconciliation read-out. Concept demo — no real points are ever minted.';

export const EDR_SYSTEM_PROMPT = `You are the Assembling desk agent inside the Everyday Rewards partner-operations concept console. Assembling is the wait-moment earn layer — shoppers earn sponsor-funded points during natural waits (checkout queue, delivery window, click-and-collect).

Scope rules (non-negotiable):
- TIER-2 SLICE: Assembling is a layer inside Everyday Rewards' existing programme. You are NOT their operating system; defer anything outside the earn layer (merchandising, pricing, stores) to the EDR teams.
- CONCEPT DEMO: all data is mocked; no live Everyday Rewards or points systems are touched and no real points are ever minted. Say so when asked.
- Use your tools for anything factual: earnRateNow for the current-hour earn read-out, weeklyPartnerEmail for the partner performance email shape, sponsorLookup for sponsors/tiers/campaigns, reconStatus for points reconciliation, searchNZKnowledge for NZ law (Fair Trading Act, ASA codes, Privacy Act IPP 3A).
- Analytics are aggregate-only, no PII — hold that line.
- Numbers: NZD; point value $0.0075 (2,000 pts = $15). Show working when you compute.
- Tone: crisp partner-ops. Short sentences.

You sign: "Assembling desk — concept demo, no real points minted."`;

export const EDR_TRY_ME: string[] = [
  'Show the partner earn rate this hour',
  'Draft the weekly partner performance email to Sarah',
  'Is the points reconciliation balanced?',
  'Which sponsor tier is converting best?',
];

export function edrPromptExcerpt(): string {
  const lines = EDR_SYSTEM_PROMPT.split('\n').slice(0, 8).join('\n');
  return `${lines}\n… [remainder redacted for the pilot — the full prompt ships with the workspace]`;
}

export const EDR_KNOWLEDGE_SOURCES: Array<{
  label: string;
  tier: 'A' | 'B' | 'C';
  note: string;
}> = [
  { label: 'Fair Trading Act 1986', tier: 'A', note: 'sponsor creative + offer claims' },
  { label: 'ASA Advertising Standards Code', tier: 'A', note: 'sponsored-moment creative' },
  { label: 'Privacy Act 2020 · IPP 3A', tier: 'A', note: 'automated-decision notice, aggregate-only analytics' },
  { label: 'assembl NZ industry knowledge base (pgvector)', tier: 'B', note: 'legislation + official guidance, cited with URLs' },
  { label: 'Partner-ops workspace (mocked)', tier: 'C', note: 'sponsors · tiers · batches — concept demo only' },
];

/** Seeded "today" activity — all demo. */
export const EDR_ACTIVITY: Array<{ at: string; kind: string; note: string }> = [
  { at: '07:00', kind: 'computed', note: 'Overnight points batches reconciled — balanced to the cent.' },
  { at: '08:15', kind: 'read', note: 'Sponsored-moment fill scanned — 35% fill, 11.9M moments MTD.' },
  { at: '10:30', kind: 'drafted', note: 'Weekly partner performance email drafted for Sarah (awaiting review).' },
  { at: '11:05', kind: 'flagged', note: 'One sponsor creative pending ASA-code re-check before Friday flight.' },
];

/** Demo Mana Receipt stubs — clearly placeholder. */
export const EDR_RECEIPTS: Array<{
  id: string;
  createdAt: string;
  citations: Array<{ source: string; ref?: string }>;
  receiptHash: string;
  prevHash: string | null;
  hitlStatus?: string;
}> = [
  {
    id: 'MR-EDR-0002 · weekly partner email',
    createdAt: '2 Jul 2026, 10:30 am',
    citations: [{ source: 'Partner-ops workspace', ref: 'mocked recon + trend' }],
    receiptHash: 'demo:receipt — issued when the partnership runs live',
    prevHash: null,
    hitlStatus: 'pending_review',
  },
  {
    id: 'MR-EDR-0001 · points batch reconciliation',
    createdAt: '2 Jul 2026, 7:00 am',
    citations: [{ source: 'Partner-ops workspace', ref: 'points batches · treasury' }],
    receiptHash: 'demo:receipt — issued when the partnership runs live',
    prevHash: null,
    hitlStatus: 'final',
  },
];
