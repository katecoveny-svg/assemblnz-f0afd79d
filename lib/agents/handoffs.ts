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
 * keyed by the source agent's marketplace slug. Tōro's table is ported verbatim
 * (mapped to current slugs); other entries are the natural reciprocals.
 */
export const HANDOFFS: Record<string, Handoff[]> = {
  // Tōro (family) — verbatim from the legacy toroa system prompt.
  family: [
    { target: 'kai-planner', label: 'Kai Planner', when: 'Meal plans and the weekly shop' },
    { target: 'study-buddy', label: 'Study Buddy', when: 'Homework help and NZ-curriculum practice' },
    { target: 'te-reo-tutor', label: 'Te Reo Tutor', when: 'Te reo lessons and tikanga questions' },
    { target: 'social-manager', label: 'Social Manager', when: 'Family event invitations, school-newsletter help' },
    { target: 'customs-freight', label: 'Customs + Freight', when: 'Overseas online shopping and landed cost' },
  ],
  // Reciprocals / natural neighbours.
  'kai-planner': [{ target: 'family', label: 'Tōro', when: 'Wider family logistics and the week ahead' }],
  'study-buddy': [{ target: 'te-reo-tutor', label: 'Te Reo Tutor', when: 'Te reo Māori practice and pronunciation' }],
  mariner: [{ target: 'skipper', label: 'Skipper', when: 'Recreational trip planning and bar-crossing safety' }],
  skipper: [{ target: 'mariner', label: 'Mariner', when: 'Commercial compliance, MOSS, surveys, quota' }],
  'site-safety': [
    { target: 'project-manager', label: 'Project Manager', when: 'Programme, payment claims, variations' },
    { target: 'building-consent', label: 'Building Consent', when: 'Consents, producer statements, CCC' },
  ],
  scribe: [{ target: 'practice-manager', label: 'Practice Manager', when: 'APC renewals, audits, HDC responses' }],
  shield: [{ target: 'contract-reader', label: 'Contract Reader', when: 'Contract clauses and obligations' }],
};

/** Handoffs for a given source agent (empty array if none registered). */
export function handoffsFor(slug: string): Handoff[] {
  return HANDOFFS[slug] ?? [];
}
