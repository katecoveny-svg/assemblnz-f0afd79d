/**
 * Agent marketplace and fleet data.
 *
 * This is the public fleet registry. Every listed specialist is chat-explorable
 * and expected to collaborate through Iho, Mahara memory, and the ambient loop.
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

export type AgentPhase = 'hunt' | 'pitch' | 'execution' | 'ledger' | 'infra';
export type AgentStatus = 'live' | 'draft';

export type Agent = {
  slug: string;
  name: string;
  role: string;
  kete: KeteSlug;
  phase?: AgentPhase;
  status?: AgentStatus;
  oneLiner: string;
  expertise?: string;
  collaboratesWith?: string[];
  memoryScope?: string;
  ambientBrief?: string;
  legislation: string[];
  capabilities: Capability[];
  buyingOptions: {
    subscribe: boolean;
    perOutput: number | null;
    perResolution: number | null;
  };
};

const DEFAULT_BUYING_OPTIONS: Agent['buyingOptions'] = {
  subscribe: true,
  perOutput: null,
  perResolution: null,
};

export const PHASE_LABELS: Record<AgentPhase, string> = {
  hunt: 'Hunt',
  pitch: 'Pitch',
  execution: 'Execution',
  ledger: 'Ledger',
  infra: 'Infra',
};

export const PHASE_ORDER: AgentPhase[] = ['hunt', 'pitch', 'execution', 'ledger', 'infra'];

export const FLEET_AGENT_SLUGS_BY_KETE: Record<KeteSlug, string[]> = {
  waihanga: ['hapori', 'kaupapa', 'ata', 'rawa', 'whakaae', 'pai', 'arai', 'iho', 'signal'],
  manaaki: ['manuhiri', 'aura', 'kai', 'hau', 'mahi', 'pai', 'putea', 'iho', 'signal'],
  pikau: ['morunga', 'gateway', 'pikau', 'transit', 'transit-freight', 'arai', 'iho', 'signal'],
  arataki: ['motor', 'whaikorero', 'whare', 'rawa', 'whakaae', 'pai', 'iho', 'signal'],
  auaha: ['muse', 'prism', 'vessel-studio', 'saffron', 'pai', 'putea', 'iho', 'signal'],
  ako: ['aroha', 'ako-licence', 'kaiako', 'tamariki', 'ero-pack', 'iho', 'signal'],
  matauranga: ['akonga', 'kaiako-s', 'reo', 'ropu', 'ero-s', 'iho', 'signal'],
  hoko: ['spark', 'hoko-cga', 'stock', 'cellar', 'pai', 'putea', 'iho', 'signal'],
  toro: ['toro', 'iho', 'signal'],
};

export const AGENTS: Agent[] = [
  // ── Shared infra ───────────────────────────────────────────────────
  {
    slug: 'iho',
    name: 'Iho',
    role: 'Fleet routing brain',
    kete: 'waihanga',
    phase: 'infra',
    status: 'live',
    oneLiner: 'Routes work to the right specialist and coordinates handoffs across the kete.',
    expertise: 'Principal orchestration layer for agent selection, cross-kete handoff, context compression, and proof routing.',
    collaboratesWith: ['signal', 'pai', 'putea', 'aroha'],
    memoryScope: 'Shared tenant profile, active workflow state, agent handoff notes, and reviewer preferences.',
    ambientBrief: 'Scan new work, decide which specialists should collaborate, and prepare the next best draft for review.',
    legislation: ['Privacy Act 2020'],
    capabilities: ['planning', 'quality'],
    buyingOptions: DEFAULT_BUYING_OPTIONS,
  },
  {
    slug: 'signal',
    name: 'Signal',
    role: 'Security and data guardrail',
    kete: 'waihanga',
    phase: 'infra',
    status: 'live',
    oneLiner: 'Checks security, privacy, and operational-risk posture for the fleet.',
    expertise: 'Senior security, privacy, and operational-risk reviewer for NZ small-business systems.',
    collaboratesWith: ['iho', 'pai', 'arai', 'tamariki'],
    memoryScope: 'Security posture, integration inventory, sensitive-data decisions, and prior risk acceptances.',
    ambientBrief: 'Watch for privacy, access, connector, and operational-risk drift across the tenant fleet.',
    legislation: ['Privacy Act 2020', 'NZISM'],
    capabilities: ['compliance', 'safety', 'audit'],
    buyingOptions: DEFAULT_BUYING_OPTIONS,
  },

  // ── Waihanga (Construction) ────────────────────────────────────────
  draftAgent('hapori', 'Hāpori', 'Community and stakeholder scan', 'waihanga', 'hunt'),
  {
    slug: 'kaupapa',
    name: 'Kaupapa',
    role: 'Project scoping',
    kete: 'waihanga',
    phase: 'pitch',
    status: 'live',
    oneLiner: 'Defines scope boundaries, identifies regulatory touchpoints, maps the consent pathway.',
    expertise: 'Construction project director level: CCA, programme, scope, variations, payment claims, and consent pathway strategy.',
    collaboratesWith: ['ata', 'rawa', 'whakaae', 'arai', 'pai'],
    memoryScope: 'Project brief, contract type, milestones, variation register, payment-claim history, and council pathway.',
    ambientBrief: 'Review live project movement and prepare scope, programme, or contract risks for the daily briefing.',
    legislation: ['Building Act 2004', 'RMA 1991'],
    capabilities: ['planning', 'compliance'],
    buyingOptions: { subscribe: true, perOutput: 89, perResolution: null },
  },
  {
    slug: 'ata',
    name: 'Ata',
    role: 'BIM and plan analysis',
    kete: 'waihanga',
    phase: 'execution',
    status: 'live',
    oneLiner: 'Reviews building information models and plan sets for code compliance.',
    expertise: 'BIM, plan review, accessibility, clash detection, and NZ Building Code evidence at senior reviewer level.',
    collaboratesWith: ['kaupapa', 'rawa', 'whakaae', 'pai'],
    memoryScope: 'Model versions, plan assumptions, compliance flags, clash notes, and reviewer decisions.',
    ambientBrief: 'Scan changed plans/models and surface code, accessibility, or coordination issues before submission.',
    legislation: ['Building Code 2025', 'NZS 4121:2001', 'Building Product Specifications 2025'],
    capabilities: ['bim', 'compliance'],
    buyingOptions: { subscribe: true, perOutput: 149, perResolution: null },
  },
  {
    slug: 'rawa',
    name: 'Rawa',
    role: 'Materials and procurement',
    kete: 'waihanga',
    phase: 'execution',
    status: 'live',
    oneLiner: 'Checks materials against Building Product Specifications and NZ Building Code.',
    expertise: 'Materials, product substitution, supplier evidence, BPS 2025, and warranty-risk review.',
    collaboratesWith: ['ata', 'whakaae', 'pai'],
    memoryScope: 'Product selections, substitution approvals, supplier documents, warranty notes, and compliance evidence.',
    ambientBrief: 'Watch materials changes and prepare substitution or evidence-pack gaps for reviewer approval.',
    legislation: ['Building Product Specifications 2025', 'NZ Building Code'],
    capabilities: ['compliance', 'audit'],
    buyingOptions: { subscribe: true, perOutput: 89, perResolution: null },
  },
  {
    slug: 'whakaae',
    name: 'Whakaaē',
    role: 'Building consents',
    kete: 'waihanga',
    phase: 'execution',
    status: 'live',
    oneLiner: 'Drafts consent applications citing Building Act 2004 s 14B and relevant Acceptable Solutions.',
    expertise: 'Building consent strategist with deep knowledge of s14B responsibilities, CCC readiness, and council evidence expectations.',
    collaboratesWith: ['kaupapa', 'ata', 'rawa', 'pai'],
    memoryScope: 'Consent pathway, RFIs, producer statements, BCA feedback, and approval evidence.',
    ambientBrief: 'Monitor consent artefacts and draft responses or missing-evidence lists before the BCA asks.',
    legislation: ['Building Act 2004 s 14B', 'Acceptable Solutions'],
    capabilities: ['compliance', 'planning'],
    buyingOptions: { subscribe: true, perOutput: 149, perResolution: 1490 },
  },
  {
    slug: 'pai',
    name: 'Pai',
    role: 'Quality assurance',
    kete: 'waihanga',
    phase: 'ledger',
    status: 'live',
    oneLiner: 'Runs final compliance checks and assembles the Evidence Pack for submission.',
    expertise: 'Evidence-pack auditor for final QA, provenance, reviewer sign-off, and regulator-ready records.',
    collaboratesWith: ['iho', 'kaupapa', 'whakaae', 'signal'],
    memoryScope: 'Reviewer decisions, accepted citations, evidence-pack seals, defects, and final submission notes.',
    ambientBrief: 'Compile daily proof gaps, unreviewed drafts, and ready-to-seal packs for operator review.',
    legislation: ['Building Act 2004', 'NZS 3910'],
    capabilities: ['quality', 'audit'],
    buyingOptions: { subscribe: true, perOutput: 149, perResolution: null },
  },
  {
    slug: 'arai',
    name: 'Ārai',
    role: 'Health and safety lead',
    kete: 'waihanga',
    phase: 'ledger',
    status: 'live',
    oneLiner: 'Drafts SSSPs grounded in HSWA 2015. Cites every relevant section.',
    expertise: 'WorkSafe-grade health and safety specialist: HSWA, SSSP, SWMS, incident triage, and notifiable-event routing.',
    collaboratesWith: ['kaupapa', 'pai', 'signal'],
    memoryScope: 'Site hazards, controls, inductions, incidents, toolbox talks, and notifiable-event decisions.',
    ambientBrief: 'Watch hazard changes and prepare site-safety drafts or escalation notes before work starts.',
    legislation: ['HSWA 2015 s 36-46', 'WorkSafe Code of Practice'],
    capabilities: ['compliance', 'safety', 'audit'],
    buyingOptions: { subscribe: true, perOutput: 89, perResolution: 290 },
  },

  // ── Manaaki (Hospitality) ──────────────────────────────────────────
  draftAgent('manuhiri', 'Manuhiri', 'Guest and booking intake', 'manaaki', 'hunt'),
  {
    slug: 'aura',
    name: 'Aura',
    role: 'Guest experience and service compliance',
    kete: 'manaaki',
    phase: 'pitch',
    status: 'live',
    oneLiner: 'Manages guest experience standards and service-level compliance.',
    expertise: 'Hospitality operations lead for guest experience, host responsibility, venue standards, and service recovery.',
    collaboratesWith: ['kai', 'hau', 'mahi', 'putea'],
    memoryScope: 'Guest preferences, venue rules, service incidents, licence conditions, and approved house voice.',
    ambientBrief: 'Summarise bookings, incidents, review patterns, and service drafts before the shift begins.',
    legislation: ['Sale and Supply of Alcohol Act 2012', 'Health Act 1956'],
    capabilities: ['compliance', 'communications'],
    buyingOptions: { subscribe: true, perOutput: 89, perResolution: null },
  },
  draftAgent('kai', 'Kai', 'Food safety operations', 'manaaki', 'execution'),
  draftAgent('hau', 'Hau', 'Wellbeing and venue safety', 'manaaki', 'execution'),
  draftAgent('mahi', 'Mahi', 'Roster and shift evidence', 'manaaki', 'execution'),
  draftAgent('putea', 'Pūtea', 'Money and margin ledger', 'manaaki', 'ledger'),

  // ── Pīkau (Freight and Customs) ────────────────────────────────────
  draftAgent('morunga', 'Mōrunga', 'Freight opportunity intake', 'pikau', 'hunt'),
  {
    slug: 'gateway',
    name: 'Gateway',
    role: 'Tariff classification',
    kete: 'pikau',
    phase: 'pitch',
    status: 'live',
    oneLiner: 'Classifies HS codes and assesses duty against the NZ Tariff Schedule.',
    expertise: 'Senior tariff classifier with NZ Working Tariff, WCO HS, valuation, and broker evidence experience.',
    collaboratesWith: ['pikau', 'transit-freight', 'transit'],
    memoryScope: 'Product descriptions, prior classifications, rulings, supplier records, and broker decisions.',
    ambientBrief: 'Review new shipment lines for classification, duty, preference, and ruling risk.',
    legislation: ['Customs and Excise Act 2018', 'WCO Harmonised System'],
    capabilities: ['customs', 'pricing'],
    buyingOptions: { subscribe: true, perOutput: 19, perResolution: 190 },
  },
  {
    slug: 'pikau',
    name: 'Pīkau',
    role: 'Customs declarations',
    kete: 'pikau',
    phase: 'execution',
    status: 'live',
    oneLiner: 'Drafts customs entries citing Customs and Excise Act 2018 requirements.',
    expertise: 'Customs-entry specialist for TSW drafts, valuation, import GST, broker handoff, and audit records.',
    collaboratesWith: ['gateway', 'transit-freight', 'transit', 'pai'],
    memoryScope: 'Shipment records, importer profile, invoices, Incoterms, permits, and broker feedback.',
    ambientBrief: 'Prepare broker-ready draft packs for shipments approaching cut-off or clearance risk.',
    legislation: ['Customs and Excise Act 2018', 'NZ Tariff Schedule'],
    capabilities: ['customs', 'compliance'],
    buyingOptions: { subscribe: true, perOutput: 19, perResolution: 190 },
  },
  {
    slug: 'transit',
    name: 'Transit',
    role: 'Freight movement compliance',
    kete: 'pikau',
    phase: 'execution',
    status: 'live',
    oneLiner: 'Tracks movement records, compliance events, and transport handoff evidence.',
    expertise: 'Freight movement and transport compliance specialist for chain-of-custody and exception handling.',
    collaboratesWith: ['pikau', 'transit-freight', 'signal'],
    memoryScope: 'Carrier handoffs, ETA changes, POD records, exceptions, and customer update decisions.',
    ambientBrief: 'Watch ETAs, holds, delays, and documentation gaps; draft operator updates for approval.',
    legislation: ['Land Transport Act 1998', 'NZTA rules'],
    capabilities: ['compliance', 'audit'],
    buyingOptions: { subscribe: true, perOutput: 89, perResolution: null },
  },
  {
    slug: 'transit-freight',
    name: 'Transit-Freight',
    role: 'Freight documentation',
    kete: 'pikau',
    phase: 'execution',
    status: 'live',
    oneLiner: 'Produces shipping documentation with audit trails for customs and brokers.',
    expertise: 'Freight documentation lead for commercial docs, packing lists, BOL/AWB packs, and broker-ready evidence.',
    collaboratesWith: ['gateway', 'pikau', 'transit'],
    memoryScope: 'Document templates, consignee preferences, shipment artefacts, and prior correction history.',
    ambientBrief: 'Assemble missing-doc lists and draft broker/customer handoffs before deadlines bite.',
    legislation: ['Customs and Excise Act 2018', 'Maritime NZ requirements'],
    capabilities: ['customs', 'audit'],
    buyingOptions: { subscribe: true, perOutput: 19, perResolution: null },
  },

  // ── Arataki (Automotive and Fleet) ─────────────────────────────────
  {
    slug: 'motor',
    name: 'Motor',
    role: 'Workshop safety and compliance',
    kete: 'arataki',
    phase: 'hunt',
    status: 'live',
    oneLiner: 'Workshop safety, equipment compliance, and dealership obligations.',
    expertise: 'Automotive compliance principal for workshop safety, MVSA, CGA, WoF/CoF, and dealer governance.',
    collaboratesWith: ['whaikorero', 'whare', 'rawa', 'whakaae', 'pai'],
    memoryScope: 'Dealer obligations, workshop hazards, customer issues, vehicle records, and approval boundaries.',
    ambientBrief: 'Surface workshop, fleet, and customer-risk items for the morning service/sales briefing.',
    legislation: ['Consumer Guarantees Act 1993', 'Motor Vehicle Sales Act 2003'],
    capabilities: ['compliance', 'safety'],
    buyingOptions: { subscribe: true, perOutput: 89, perResolution: null },
  },
  draftAgent('whaikorero', 'Whaikōrero', 'Customer and insurer narrative', 'arataki', 'pitch'),
  draftAgent('whare', 'Whare', 'Workshop operating records', 'arataki', 'execution'),

  // ── Auaha (Creative) ───────────────────────────────────────────────
  {
    slug: 'muse',
    name: 'Muse',
    role: 'Copywriting',
    kete: 'auaha',
    phase: 'hunt',
    status: 'live',
    oneLiner: 'Drafts copy with NZ legislation citations where required.',
    expertise: 'Senior copy and communications specialist for NZ brand voice, claims discipline, and channel fit.',
    collaboratesWith: ['prism', 'saffron', 'vessel-studio', 'pai'],
    memoryScope: 'Approved voice, claim register, content calendar, campaign history, and reviewer feedback.',
    ambientBrief: 'Draft the day’s content opportunities and flag claim or approval gaps before publishing review.',
    legislation: ['Fair Trading Act 1986', 'ASA Codes'],
    capabilities: ['communications'],
    buyingOptions: { subscribe: true, perOutput: 19, perResolution: null },
  },
  {
    slug: 'prism',
    name: 'Prism',
    role: 'Brand strategy',
    kete: 'auaha',
    phase: 'pitch',
    status: 'live',
    oneLiner: 'Brand strategy, positioning, and creative direction.',
    expertise: 'Brand strategy director for positioning, audience maps, creative platforms, and claim-safe offers.',
    collaboratesWith: ['muse', 'saffron', 'vessel-studio'],
    memoryScope: 'Brand strategy, audiences, offers, approved claims, tone constraints, and campaign learnings.',
    ambientBrief: 'Review campaign signals and prepare strategy adjustments or briefing drafts for review.',
    legislation: ['Fair Trading Act 1986', 'ASA Codes'],
    capabilities: ['communications'],
    buyingOptions: { subscribe: true, perOutput: 149, perResolution: null },
  },
  draftAgent('vessel-studio', 'Vessel-Studio', 'Visual vessel production', 'auaha', 'execution'),
  {
    slug: 'saffron',
    name: 'Saffron',
    role: 'Campaign and content production',
    kete: 'auaha',
    phase: 'execution',
    status: 'live',
    oneLiner: 'Drafts content production plans and campaign handoff records.',
    expertise: 'Campaign operations lead for production planning, asset handoff, channel sequencing, and review queues.',
    collaboratesWith: ['prism', 'muse', 'vessel-studio', 'putea'],
    memoryScope: 'Campaign plans, asset status, approval gates, channel rules, and post-campaign lessons.',
    ambientBrief: 'Find blocked campaign work and prepare the next batch of assets or approval notes.',
    legislation: ['Fair Trading Act 1986', 'ASA Codes'],
    capabilities: ['communications', 'compliance'],
    buyingOptions: { subscribe: true, perOutput: 89, perResolution: 290 },
  },

  // ── Ako (Early Childhood Education) ────────────────────────────────
  draftAgent('aroha', 'Aroha', 'Whānau and staff relationship scan', 'ako', 'hunt'),
  {
    slug: 'ako-licence',
    name: 'Ako-Licence',
    role: 'ECE licensing compliance',
    kete: 'ako',
    phase: 'pitch',
    status: 'live',
    oneLiner: 'Education Act 2020 licensing, child safety, and curriculum documentation.',
    expertise: 'ECE licensing and compliance lead across Education and Training Act 2020, ECE regulations, Te Whāriki, ERO, and child safety.',
    collaboratesWith: ['kaiako', 'tamariki', 'ero-pack', 'iho', 'signal'],
    memoryScope: 'Centre licence profile, ratios, kaiako qualifications, child-safety records, ERO evidence, and whānau comms voice.',
    ambientBrief: 'Prepare ratio, licence, ERO, and child-safety reminders before the centre day begins.',
    legislation: ['Education and Training Act 2020', 'Privacy Act 2020 IPP 3A'],
    capabilities: ['compliance', 'safety'],
    buyingOptions: { subscribe: true, perOutput: 89, perResolution: null },
  },
  draftAgent('kaiako', 'Kaiako', 'Teacher evidence and planning', 'ako', 'execution'),
  draftAgent('tamariki', 'Tamariki', 'Child safety and records', 'ako', 'execution'),
  draftAgent('ero-pack', 'ERO-pack', 'ERO evidence bundle', 'ako', 'ledger'),

  // ── Mātauranga (Secondary Education) ───────────────────────────────
  draftAgent('akonga', 'Ākonga', 'Student cohort scan', 'matauranga', 'hunt'),
  draftAgent('kaiako-s', 'Kaiako-S', 'Secondary teacher reporting', 'matauranga', 'pitch'),
  draftAgent('reo', 'Reo', 'Language and reporting clarity', 'matauranga', 'execution'),
  draftAgent('ropu', 'Rōpū', 'Group and board records', 'matauranga', 'execution'),
  draftAgent('ero-s', 'ERO-S', 'Secondary ERO evidence bundle', 'matauranga', 'ledger'),

  // ── Hoko (Retail) ─────────────────────────────────────────────────
  draftAgent('spark', 'Spark', 'Retail opportunity intake', 'hoko', 'hunt'),
  {
    slug: 'hoko-cga',
    name: 'Hoko-CGA',
    role: 'Consumer protection',
    kete: 'hoko',
    phase: 'pitch',
    status: 'live',
    oneLiner: 'Consumer Guarantees Act compliance for NZ retailers.',
    expertise: 'Retail consumer-protection specialist for CGA remedies, Fair Trading claims, returns, and dispute-ready records.',
    collaboratesWith: ['stock', 'cellar', 'spark', 'putea'],
    memoryScope: 'Returns policy, product categories, supplier history, customer complaint patterns, and remedy decisions.',
    ambientBrief: 'Review overnight customer issues, returns, stock risk, and campaign claims for the daily trading brief.',
    legislation: ['Consumer Guarantees Act 1993', 'Fair Trading Act 1986'],
    capabilities: ['compliance'],
    buyingOptions: { subscribe: true, perOutput: 89, perResolution: null },
  },
  draftAgent('stock', 'Stock', 'Inventory and supplier records', 'hoko', 'execution'),
  {
    slug: 'cellar',
    name: 'Cellar',
    role: 'Product and licence records',
    kete: 'hoko',
    phase: 'execution',
    status: 'live',
    oneLiner: 'Maintains product records, restricted-goods checks, and evidence trails.',
    expertise: 'Product-records and restricted-goods specialist for licensing, supplier traceability, and retail evidence.',
    collaboratesWith: ['hoko-cga', 'stock', 'pai', 'signal'],
    memoryScope: 'Product register, restricted-goods conditions, supplier certifications, and audit decisions.',
    ambientBrief: 'Flag restricted-goods, traceability, supplier, or licence records that need human review.',
    legislation: ['Sale and Supply of Alcohol Act 2012', 'Consumer Guarantees Act 1993'],
    capabilities: ['compliance', 'audit'],
    buyingOptions: { subscribe: true, perOutput: 149, perResolution: null },
  },

  // ── Tōro (Whānau) ─────────────────────────────────────────────────
  {
    slug: 'toro',
    name: 'Tōro',
    role: 'Family agent',
    kete: 'toro',
    phase: 'execution',
    status: 'live',
    oneLiner: 'Household admin, school communications, appointment management, family scheduling.',
    expertise: 'Whānau operations navigator for school comms, routines, money, appointments, travel, and parent-approved actions.',
    collaboratesWith: ['iho', 'signal'],
    memoryScope: 'Household preferences, school calendars, consent boundaries, routines, and parent approval history.',
    ambientBrief: 'Read the week ahead and prepare parent-review drafts for school, money, routines, and travel.',
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

const AGENT_BY_SLUG = new Map(AGENTS.map((agent) => [agent.slug, agent]));

export function agentsForKete(slug: KeteSlug): Agent[] {
  const fleet = FLEET_AGENT_SLUGS_BY_KETE[slug];
  if (!fleet) return AGENTS.filter((a) => a.kete === slug);
  return fleet.map((agentSlug) => AGENT_BY_SLUG.get(agentSlug)).filter(Boolean) as Agent[];
}

export function agentBySlug(slug: string): Agent | undefined {
  return AGENT_BY_SLUG.get(slug);
}

export function agentCountByKete(): Record<KeteSlug, number> {
  return Object.fromEntries(
    (Object.keys(FLEET_AGENT_SLUGS_BY_KETE) as KeteSlug[]).map((slug) => [
      slug,
      agentsForKete(slug).length,
    ]),
  ) as Record<KeteSlug, number>;
}

export function agentChatId(agent: Agent): string {
  return agent.slug.toUpperCase();
}

export function groupedAgentsByPhase(agents: Agent[]): Array<{
  phase: AgentPhase;
  label: string;
  agents: Agent[];
}> {
  return PHASE_ORDER.map((phase) => ({
    phase,
    label: PHASE_LABELS[phase],
    agents: agents.filter((agent) => agent.phase === phase),
  })).filter((group) => group.agents.length > 0);
}

function draftAgent(
  slug: string,
  name: string,
  role: string,
  kete: KeteSlug,
  phase: AgentPhase,
): Agent {
  return {
    slug,
    name,
    role,
    kete,
    phase,
    status: 'draft',
    oneLiner: 'Draft specialist registered for fleet activation. System prompt content is pending.',
    legislation: [],
    capabilities: ['planning'],
    buyingOptions: DEFAULT_BUYING_OPTIONS,
  };
}
