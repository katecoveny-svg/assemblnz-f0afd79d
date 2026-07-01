/**
 * Cross-agent handoff map — Tōro flagship deep-port.
 *
 * Ported from the "Cross-agent coordination" table in the old
 * `assemblnz-f0afd79d-main/agents/toroa/system-prompt.md`. When an agent hits a
 * task outside its lane, it suggests the sibling that owns it (the
 * symbiotic-network pattern from the old `agent-router`). This data module lets
 * the chat surface render "Hand off to X" hints; targets use the new marketplace
 * slugs so they deep-link straight into the right agent.
 */

export type Handoff = {
  /** marketplace slug of the agent to hand off to */
  target: string;
  /** the agent's display name (for the hint chip) */
  label: string;
  /** when to hand off */
  when: string;
};

/**
 * keyed by the source agent's marketplace slug — the LIVE locked-canon slugs.
 * The legacy Tōro coordination table is mapped onto the family agents that
 * replaced it; the rest are the natural neighbours within the 4 canon categories.
 * (The earlier port keyed pre-canon slugs — family/mariner/scribe/etc — which no
 * longer exist, so the hints never fired; this remaps to the real roster.)
 */
export const HANDOFFS: Record<string, Handoff[]> = {
  // Family & Whānau — the old Tōro coordination table, mapped to canon agents.
  'toro': [
    { target: 'fridge-to-list', label: 'Kai', when: 'Meal plans and the weekly shop' },
    { target: 'panui-parser', label: 'Pānui Parser', when: 'A school notice or newsletter to read' },
    { target: 'school-notice', label: 'School Notice', when: 'Newsletter events to add to the calendar' },
    { target: 'awhi', label: 'Awhi', when: 'A daily check-in with an elder' },
  ],
  'dawn': [
    { target: 'toro', label: 'Tōro', when: 'Turning the brief into the day’s logistics' },
    { target: 'panui-parser', label: 'Pānui Parser', when: 'A school notice mentioned in the brief' },
  ],
  'panui-parser': [
    { target: 'school-notice', label: 'School Notice', when: 'Adding the parsed events to the calendar' },
    { target: 'toro', label: 'Tōro', when: 'Coordinating who does what around the notice' },
  ],
  // Business & SME.
  'hui': [
    { target: 'hui', label: 'Hui', when: 'Keeping a searchable record of the meeting' },
    { target: 'sweep', label: 'Sweep', when: 'Turning actions into follow-up emails' },
  ],
  'hui': [{ target: 'hui', label: 'Hui', when: 'Clean minutes from one meeting' }],
  'invoice-tidy': [{ target: 'treasury', label: 'Treasury', when: 'GST, PAYE or provisional tax on the figures' }],
  'treasury': [{ target: 'invoice-tidy', label: 'Invoice Tidy', when: 'Reconciling the invoices behind the return' }],
  'travel-logs': [{ target: 'treasury', label: 'Treasury', when: 'Folding the expense claim into the tax position' }],
  'creative-studio': [
    { target: 'sweep', label: 'Sweep', when: 'Sending the finished asset out to the list' },
  ],
  // Trades, Ops & Coast.
  'tide': [
    { target: 'tide-weather', label: 'Tide & Weather', when: 'A plain-words local marine forecast' },
    { target: 'catch-log', label: 'Catch Log', when: 'Logging the day’s catch on the water' },
  ],
  'tide-weather': [{ target: 'tide', label: 'Tide', when: 'A full pre-departure brief and notices' }],
  'catch-log': [{ target: 'tide-weather', label: 'Tide & Weather', when: 'Conditions for the next trip' }],
  'pikau': [
    { target: 'compliance-check', label: 'Compliance Check', when: 'Certs, permits and renewals on the consignment' },
  ],
  // Health & Service.
  'quill': [{ target: 'front', label: 'Front', when: 'After-hours patient calls and messages' }],
};

/**
 * Render the handoff hints as a compact system-prompt block so the agent can
 * suggest the sibling that owns an out-of-lane task (the symbiotic-network
 * pattern), without needing the chat UI to render chips. Empty string when the
 * agent has no registered neighbours.
 */
export function handoffPromptBlock(slug: string): string {
  const hs = handoffsFor(slug);
  if (hs.length === 0) return '';
  const lines = hs.map((h) => `- ${h.when}: suggest the user open ${h.label}.`).join('\n');
  return `# When to hand off\nIf a request is outside your lane, point the user to the right sibling agent — do not attempt it yourself:\n${lines}`;
}

/** Handoffs for a given source agent (empty array if none registered). */
export function handoffsFor(slug: string): Handoff[] {
  return HANDOFFS[slug] ?? [];
}
