/**
 * Agent marketplace data.
 *
 * Waihanga + Pīkau agents are the live ones (those kete are shipping).
 * Other kete have placeholder agents — Reo's Track 1 will refine copy
 * for all 46 in a follow-up PR.
 */

import type { KeteSlug } from './kete';

export type Capability =
  | 'compliance'
  | 'communications'
  | 'bim'
  | 'audit'
  | 'pricing'
  | 'customs'
  | 'booking'
  | 'safety'
  | 'planning'
  | 'quality';

export type Agent = {
  slug: string;
  name: string;
  role: string;
  kete: KeteSlug;
  oneLiner: string;
  legislation: string[];
  capabilities: Capability[];
  buyingOptions: {
    subscribe: boolean;
    perOutput: number | null;
    perResolution: number | null;
  };
};

export const AGENTS: Agent[] = [
  // ── Waihanga (Construction) — 6 agents, live ─────────────────────────
  {
    slug: 'arai',
    name: 'Ārai',
    role: 'Health & Safety lead',
    kete: 'waihanga',
    oneLiner: 'Drafts SSSPs grounded in HSWA 2015. Cites every relevant section.',
    legislation: ['HSWA 2015 s 36-46', 'WorkSafe Code of Practice'],
    capabilities: ['compliance', 'safety', 'audit'],
    buyingOptions: { subscribe: true, perOutput: 89, perResolution: 290 },
  },
  {
    slug: 'kaupapa',
    name: 'Kaupapa',
    role: 'Project scoping',
    kete: 'waihanga',
    oneLiner: 'Defines scope boundaries, identifies regulatory touchpoints, maps the consent pathway.',
    legislation: ['Building Act 2004', 'RMA 1991'],
    capabilities: ['planning', 'compliance'],
    buyingOptions: { subscribe: true, perOutput: 89, perResolution: null },
  },
  {
    slug: 'ata',
    name: 'Ata',
    role: 'BIM and plan analysis',
    kete: 'waihanga',
    oneLiner: 'Reviews building information models and plan sets for code compliance.',
    legislation: ['Building Code 2025', 'NZS 4121:2001', 'Building Product Specifications 2025'],
    capabilities: ['bim', 'compliance'],
    buyingOptions: { subscribe: true, perOutput: 149, perResolution: null },
  },
  {
    slug: 'rawa',
    name: 'Rawa',
    role: 'Materials and procurement',
    kete: 'waihanga',
    oneLiner: 'Checks materials against Building Product Specifications and NZ Building Code.',
    legislation: ['Building Product Specifications 2025', 'NZ Building Code'],
    capabilities: ['compliance', 'audit'],
    buyingOptions: { subscribe: true, perOutput: 89, perResolution: null },
  },
  {
    slug: 'whakaae',
    name: 'Whakaaē',
    role: 'Building consents',
    kete: 'waihanga',
    oneLiner: 'Drafts consent applications citing Building Act 2004 s 14B and relevant Acceptable Solutions.',
    legislation: ['Building Act 2004 s 14B', 'Acceptable Solutions'],
    capabilities: ['compliance', 'planning'],
    buyingOptions: { subscribe: true, perOutput: 149, perResolution: 1490 },
  },
  {
    slug: 'pai',
    name: 'Pai',
    role: 'Quality assurance',
    kete: 'waihanga',
    oneLiner: 'Runs final compliance checks and assembles the Evidence Pack for submission.',
    legislation: ['Building Act 2004', 'NZS 3910'],
    capabilities: ['quality', 'audit'],
    buyingOptions: { subscribe: true, perOutput: 149, perResolution: null },
  },

  // ── Pīkau (Freight & Customs) — 3 agents, live ──────────────────────
  {
    slug: 'pikau',
    name: 'Pīkau',
    role: 'Customs declarations',
    kete: 'pikau',
    oneLiner: 'Drafts customs entries citing Customs and Excise Act 2018 requirements.',
    legislation: ['Customs and Excise Act 2018', 'NZ Tariff Schedule'],
    capabilities: ['customs', 'compliance'],
    buyingOptions: { subscribe: true, perOutput: 19, perResolution: 190 },
  },
  {
    slug: 'gateway',
    name: 'Gateway',
    role: 'Tariff classification',
    kete: 'pikau',
    oneLiner: 'Classifies HS codes and assesses duty against the NZ Tariff Schedule.',
    legislation: ['Customs and Excise Act 2018', 'WCO Harmonised System'],
    capabilities: ['customs', 'pricing'],
    buyingOptions: { subscribe: true, perOutput: 19, perResolution: 190 },
  },
  {
    slug: 'transit-freight',
    name: 'Transit-Freight',
    role: 'Freight documentation',
    kete: 'pikau',
    oneLiner: 'Produces shipping documentation with audit trails for customs and brokers.',
    legislation: ['Customs and Excise Act 2018', 'Maritime NZ requirements'],
    capabilities: ['customs', 'audit'],
    buyingOptions: { subscribe: true, perOutput: 19, perResolution: null },
  },

  // ── Manaaki (Hospitality) — placeholder, Reo refines in Track 1 ─────
  {
    slug: 'aura',
    name: 'Aura',
    role: 'Guest experience and service compliance',
    kete: 'manaaki',
    oneLiner: 'Manages guest experience standards and service-level compliance.',
    legislation: ['Sale and Supply of Alcohol Act 2012', 'Health Act 1956'],
    capabilities: ['compliance', 'communications'],
    buyingOptions: { subscribe: true, perOutput: 89, perResolution: null },
  },
  {
    slug: 'saffron',
    name: 'Saffron',
    role: 'Kitchen and food safety',
    kete: 'manaaki',
    oneLiner: 'Drafts food control plans and safety logs grounded in Food Act 2014.',
    legislation: ['Food Act 2014', 'MPI Food Control Plans'],
    capabilities: ['safety', 'compliance'],
    buyingOptions: { subscribe: true, perOutput: 89, perResolution: 290 },
  },
  {
    slug: 'cellar',
    name: 'Cellar',
    role: 'Liquor licensing',
    kete: 'manaaki',
    oneLiner: 'Handles liquor licence renewals and SSAA 2012 compliance.',
    legislation: ['Sale and Supply of Alcohol Act 2012'],
    capabilities: ['compliance'],
    buyingOptions: { subscribe: true, perOutput: 149, perResolution: null },
  },

  // ── Auaha (Creative) — placeholder ────────────────────────────────
  {
    slug: 'prism',
    name: 'Prism',
    role: 'Brand strategy',
    kete: 'auaha',
    oneLiner: 'Brand strategy, positioning, and creative direction.',
    legislation: ['Fair Trading Act 1986', 'ASA Codes'],
    capabilities: ['communications'],
    buyingOptions: { subscribe: true, perOutput: 149, perResolution: null },
  },
  {
    slug: 'muse',
    name: 'Muse',
    role: 'Copywriting',
    kete: 'auaha',
    oneLiner: 'Drafts copy with NZ legislation citations where required.',
    legislation: ['Fair Trading Act 1986', 'ASA Codes'],
    capabilities: ['communications'],
    buyingOptions: { subscribe: true, perOutput: 19, perResolution: null },
  },

  // ── Arataki (Automotive) — placeholder ─────────────────────────────
  {
    slug: 'motor',
    name: 'Motor',
    role: 'Workshop safety and compliance',
    kete: 'arataki',
    oneLiner: 'Workshop safety, equipment compliance, and dealership obligations.',
    legislation: ['Consumer Guarantees Act 1993', 'Motor Vehicle Sales Act 2003'],
    capabilities: ['compliance', 'safety'],
    buyingOptions: { subscribe: true, perOutput: 89, perResolution: null },
  },
  {
    slug: 'transit',
    name: 'Transit',
    role: 'Vehicle compliance',
    kete: 'arataki',
    oneLiner: 'Heavy vehicle compliance, NZTA logbook requirements, transport safety.',
    legislation: ['Land Transport Act 1998', 'NZTA rules'],
    capabilities: ['compliance', 'audit'],
    buyingOptions: { subscribe: true, perOutput: 89, perResolution: null },
  },

  // ── Hoko (Retail) — placeholder ────────────────────────────────
  {
    slug: 'hoko-cga',
    name: 'Hoko-CGA',
    role: 'Consumer protection',
    kete: 'hoko',
    oneLiner: 'Consumer Guarantees Act compliance for NZ retailers.',
    legislation: ['Consumer Guarantees Act 1993', 'Fair Trading Act 1986'],
    capabilities: ['compliance'],
    buyingOptions: { subscribe: true, perOutput: 89, perResolution: null },
  },

  // ── Ako (Early Childhood) — placeholder ─────────────────────────────
  {
    slug: 'ako-licence',
    name: 'Ako-Licence',
    role: 'ECE licensing compliance',
    kete: 'ako',
    oneLiner: 'Education Act 2020 licensing, child safety, and curriculum documentation.',
    legislation: ['Education and Training Act 2020', 'Privacy Act 2020 IPP 3A'],
    capabilities: ['compliance', 'safety'],
    buyingOptions: { subscribe: true, perOutput: 89, perResolution: null },
  },

  // ── Tōro (Whānau) — Family plan agent ─────────────────────────
  {
    slug: 'toro',
    name: 'Tōro',
    role: 'Family agent',
    kete: 'toro',
    oneLiner: 'Household admin, school communications, appointment management, family scheduling.',
    legislation: ['Privacy Act 2020'],
    capabilities: ['communications', 'planning'],
    buyingOptions: { subscribe: true, perOutput: null, perResolution: null },
  },
];

export const CAPABILITY_LABELS: Record<Capability, string> = {
  compliance: 'Compliance',
  communications: 'Communications',
  bim: 'BIM',
  audit: 'Audit',
  pricing: 'Pricing',
  customs: 'Customs',
  booking: 'Booking',
  safety: 'Safety',
  planning: 'Planning',
  quality: 'Quality',
};

export function agentsForKete(slug: KeteSlug): Agent[] {
  return AGENTS.filter((a) => a.kete === slug);
}

export function agentCountByKete(): Record<KeteSlug, number> {
  const counts: Record<string, number> = {};
  for (const a of AGENTS) {
    counts[a.kete] = (counts[a.kete] || 0) + 1;
  }
  return counts as Record<KeteSlug, number>;
}
