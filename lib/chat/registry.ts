/**
 * lib/chat/registry.ts
 *
 * Kete + agent registry for the /app/chat surface.
 *
 * Each entry tells the chat client:
 *   • which kete to group the agent under
 *   • the human-facing name + role
 *   • the `agentId` and `packId` values to pass to the `iho-router` Supabase
 *     edge function (the Iho brain resolves either the agent code/name OR
 *     falls back to keyword classification within the pack).
 *
 * The accent colour mirrors the locked Mārama Whenua palette in
 * `app/globals.css` so the picker visually matches the rest of the site.
 *
 * NOTE: We surface a curated subset of agents tonight — Kate's number-one ask
 * is "I can pick an agent and TALK to it". We can grow the list as more
 * agents land in `agent_prompts` and the Iho registry.
 */

export type ChatAgent = {
  /** stable ID used as `agentId` in the iho-router request — Iho resolves by code or name */
  agentId: string;
  /** display name */
  name: string;
  /** one-line role for the picker subtitle */
  role: string;
  /** ISO short blurb for the chat header */
  blurb?: string;
};

export type ChatKete = {
  /** matches `packId` in iho-router */
  slug: string;
  name: string;
  industry: string;
  accent: string;
  agents: ChatAgent[];
};

export const CHAT_KETES: ChatKete[] = [
  {
    slug: 'toro',
    name: 'Tōro',
    industry: 'Whānau',
    accent: '#23211F',
    agents: [
      {
        agentId: 'TORO',
        name: 'tōro',
        role: 'Your family’s quiet assistant',
        blurb:
          'Permission slips, school notices, dinner ideas, appointment letters — Tōro reads the paperwork so you don’t have to.',
      },
    ],
  },
  {
    slug: 'manaaki',
    name: 'Manaaki',
    industry: 'Hospitality',
    accent: '#AC5838',
    agents: [
      {
        agentId: 'AURA',
        name: 'Aura',
        role: 'Food safety + licensing',
        blurb: 'Food Act 2014, alcohol licensing, kitchen compliance.',
      },
      {
        agentId: 'HAVEN',
        name: 'Haven',
        role: 'Guest experience + bookings',
      },
    ],
  },
  {
    slug: 'waihanga',
    name: 'Waihanga',
    industry: 'Construction',
    accent: '#2B6B57',
    agents: [
      {
        agentId: 'ARAI',
        name: 'Ārai',
        role: 'Health & safety on site',
        blurb: 'HSWA 2015, SSSPs, hazard registers, WorkSafe.',
      },
      {
        agentId: 'KAUPAPA',
        name: 'Kaupapa',
        role: 'Project + contract administration',
        blurb: 'Construction Contracts Act 2002 — payment claims, retention, variations.',
      },
      {
        agentId: 'ATA',
        name: 'Ata',
        role: 'BIM + plan review',
      },
      {
        agentId: 'RAWA',
        name: 'Rawa',
        role: 'Materials + procurement',
      },
      {
        agentId: 'PAI',
        name: 'Pai',
        role: 'Quality + handover',
      },
      {
        agentId: 'WHAKAAE',
        name: 'Whakaaē',
        role: 'Consents + RMA',
      },
    ],
  },
  {
    slug: 'auaha',
    name: 'Auaha',
    industry: 'Creative',
    accent: '#5B4FA0',
    agents: [
      { agentId: 'PRISM', name: 'Prism', role: 'Brand-voice copy' },
      { agentId: 'MUSE', name: 'Muse', role: 'Campaign + content planning' },
    ],
  },
  {
    slug: 'arataki',
    name: 'Arataki',
    industry: 'Advisory + automotive',
    accent: '#D4842A',
    agents: [
      { agentId: 'MOTOR', name: 'Motor', role: 'Workshop compliance' },
      { agentId: 'TRANSIT', name: 'Transit', role: 'Fleet documentation' },
    ],
  },
  {
    slug: 'pikau',
    name: 'Pīkau',
    industry: 'Freight + customs',
    accent: '#3B7CB5',
    agents: [
      { agentId: 'PIKAU', name: 'Pīkau', role: 'Customs precedent + broker audit trails' },
      { agentId: 'GATEWAY', name: 'Gateway', role: 'Border + entry classification' },
    ],
  },
  {
    slug: 'hoko',
    name: 'Hoko',
    industry: 'Trade + retail',
    accent: '#7B3F8F',
    agents: [
      { agentId: 'HOKO-CGA', name: 'Hoko-CGA', role: 'Consumer Guarantees Act compliance' },
    ],
  },
  {
    slug: 'ako',
    name: 'Ako',
    industry: 'Education + learning',
    accent: '#6B5843',
    agents: [
      { agentId: 'AKO-LICENCE', name: 'Ako-Licence', role: 'ECE licensing + tamariki safety' },
    ],
  },
  {
    slug: 'cross-pack',
    name: 'Cross-pack',
    industry: 'Across every kete',
    accent: '#1F4F40',
    agents: [
      {
        agentId: 'AROHA',
        name: 'Aroha',
        role: 'HR + NZ employment law',
        blurb: 'Minimum wage, KiwiSaver, leave, personal grievances, restructures.',
      },
      {
        agentId: 'SIGNAL',
        name: 'Signal',
        role: 'IT security + cyber',
        blurb: 'NZISM, CERT NZ, Privacy Act 2020 breach response.',
      },
      {
        agentId: 'IHO',
        name: 'Iho',
        role: 'Routing brain — let assembl pick',
        blurb:
          'Not sure who to ask? Iho reads your question, picks the right specialist, and routes you.',
      },
    ],
  },
];

export type ChatAgentRef = {
  kete: ChatKete;
  agent: ChatAgent;
};

export function findAgent(keteSlug: string, agentId: string): ChatAgentRef | null {
  const kete = CHAT_KETES.find((k) => k.slug === keteSlug);
  if (!kete) return null;
  const agent = kete.agents.find((a) => a.agentId === agentId);
  if (!agent) return null;
  return { kete, agent };
}

export const DEFAULT_AGENT_REF: ChatAgentRef = {
  kete: CHAT_KETES[0],
  agent: CHAT_KETES[0].agents[0],
};
