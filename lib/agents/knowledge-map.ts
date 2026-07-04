/**
 * Per-agent knowledge anchors + the universal trust-footer contract.
 *
 * Tier model:
 *   A — an official primary source assembl syncs (knowledge_sources rows:
 *       pco-legislation, nz-customs-tariff, building-code-as, bpac-nz, …).
 *   B — assembl's curated NZ knowledge base (kb_doc_chunks via
 *       searchNZKnowledge) and professional-body guidance.
 *   C — connected operational systems (pilot-scoped; not on public chat).
 *
 * Every agent gets at least one Tier A anchor. The anchor list is prompt
 * guidance (which sources to consult + name in the footer); retrieval itself
 * runs through the shared tools in the chat route.
 */

export type KnowledgeAnchor = { source: string; tier: 'A' | 'B' | 'C' };

const PCO: KnowledgeAnchor = { source: 'NZ Legislation (legislation.govt.nz)', tier: 'A' };

const BUNDLE_ANCHORS: Record<string, KnowledgeAnchor[]> = {
  assembler: [
    { source: 'Building Code Acceptable Solutions (building.govt.nz)', tier: 'A' },
    PCO,
    { source: 'NZIA / ACE practice guidance', tier: 'B' },
  ],
  forge: [
    { source: 'NZ Customs Working Tariff', tier: 'A' },
    PCO,
    { source: 'Companies Office register', tier: 'B' },
  ],
  ensemble: [
    PCO,
    { source: 'ASA Advertising Codes', tier: 'B' },
  ],
  practice: [
    { source: 'BPAC NZ / NZ Formulary / MoH clinical guidance', tier: 'A' },
    { source: 'HDC Code of Rights', tier: 'A' },
    PCO,
  ],
  kaitiaki: [
    PCO, // Animal Welfare Act 1999, Wildlife Act 1953, Conservation Act 1987
    { source: 'MPI / DOC published guidance', tier: 'B' },
  ],
  hearth: [
    PCO,
    { source: 'IRD rates + MBIE employment guidance', tier: 'A' },
  ],
};

const AGENT_ANCHORS: Record<string, KnowledgeAnchor[]> = {
  pikau: [{ source: 'NZ Customs Working Tariff', tier: 'A' }, PCO],
  gateway: [{ source: 'NZ Customs Working Tariff', tier: 'A' }, PCO],
  treasury: [{ source: 'IRD tax rates + Tax Information Bulletins', tier: 'A' }, PCO],
  'invoice-tidy': [{ source: 'IRD tax rates (GST)', tier: 'A' }, PCO],
  quill: [{ source: 'BPAC NZ / NZ Formulary', tier: 'A' }, { source: 'HDC Code of Rights', tier: 'A' }],
  front: [{ source: 'HDC Code of Rights', tier: 'A' }, PCO],
  'compliance-check': [PCO, { source: 'ACC schedules + operational policy', tier: 'A' }],
  roster: [{ source: 'MBIE wage rates + Holidays Act guidance', tier: 'A' }, PCO],
  aroha: [{ source: 'MBIE employment guidance + Holidays Act 2003', tier: 'A' }, PCO],
  'ako-licence': [PCO, { source: 'MoE licensing criteria (Te Whāriki)', tier: 'B' }],
};

/** Bundle membership for anchor defaults (mirrors the staging registry; code
 * only carries `bundle` for Kaitiaki, so the map lives here). */
const BUNDLE_BY_SLUG: Record<string, string> = {
  arai: 'assembler', ata: 'assembler', kaupapa: 'assembler', pai: 'assembler', rawa: 'assembler', whakaae: 'assembler',
  arataki: 'forge', gateway: 'forge', pikau: 'forge',
  auaha: 'ensemble', muse: 'ensemble', prism: 'ensemble', saffron: 'ensemble', 'social-manager': 'ensemble',
  front: 'practice', quill: 'practice',
  keeper: 'kaitiaki', 'vet-small-animal': 'kaitiaki', 'vet-large-animal': 'kaitiaki', 'vet-equine': 'kaitiaki',
  'vet-exotic': 'kaitiaki', 'spca-workflow': 'kaitiaki', 'rescue-coordination': 'kaitiaki', 'doggy-daycare': 'kaitiaki',
  'kakapo-recovery': 'kaitiaki', 'kiwi-conservation': 'kaitiaki', 'wildbase-recovery': 'kaitiaki', 'zoo-vet': 'kaitiaki',
  'species-recovery': 'kaitiaki',
  awhi: 'hearth', 'catch-log': 'hearth', dawn: 'hearth', 'fridge-to-list': 'hearth', 'panui-parser': 'hearth',
  'school-notice': 'hearth', switch: 'hearth', 'tide-weather': 'hearth', toro: 'hearth', voyage: 'hearth',
};

export function bundleFor(slug: string): string | null {
  return BUNDLE_BY_SLUG[slug] ?? null;
}

export function anchorsFor(slug: string, bundle: string | null = bundleFor(slug)): KnowledgeAnchor[] {
  return AGENT_ANCHORS[slug] ?? BUNDLE_ANCHORS[bundle ?? ''] ?? [PCO];
}

/**
 * The universal trust-footer contract. Same shape as the customs
 * TARIFF_TRUST_FOOTER_RULES, generalised for every agent.
 */
export function trustFooterRules(slug: string, bundle: string | null = bundleFor(slug)): string {
  const anchors = anchorsFor(slug, bundle);
  const anchorList = anchors.map((a) => `- ${a.source} — Tier ${a.tier}`).join('\n');
  return `## Trust footer (mandatory contract)
Your assigned knowledge sources, in order of authority:
${anchorList}

Rules:
- Before answering anything that turns on NZ law, regulation, rates, codes, or official guidance, call searchNZKnowledge (and any specialist lookup tool you have) first.
- End every answer that makes a factual claim with a trust footer on its own line:
  "Source: <source name(s) actually used> · Trust: <the LOWEST tier used in this answer>"
- If the knowledge tools reported unavailable, errored, or returned nothing relevant and the claim needed them, end with exactly:
  "TRUST SCORE: UNAVAILABLE — I couldn't reach my sources for this one"
  and clearly mark the answer as unverified general knowledge.
- Never invent a citation, a section number, a rate, or a sync time. A missing source is stated, not papered over.
- Purely conversational replies (greetings, clarifying questions) need no footer.`;
}

/**
 * Kaumātua-hold: taonga-species operational guidance is gated until the
 * kaitiaki advisory group signs it off. Applies to every Kaitiaki-bundle
 * agent; the two dedicated recovery agents are additionally held at the
 * route level.
 */
export const TAONGA_SPECIES_HOLD = `## Kaumātua-hold (hard stop)
Kiwi, kākāpō, tuatara, and tūī are taonga species. Operational or hands-on guidance about them — handling, translocation, breeding programmes, monitoring protocols, site locations — is on hold pending kaumātua and iwi sign-off.
- If asked, say the mahi is held for kaumātua review and offer publicly documented DOC guidance as background only, clearly labelled.
- General public education (what the species is, its conservation status) is fine, with sources.
- Never work around this by reframing the question.`;

/** Slugs held entirely behind the kaumātua gate. */
export const KAUMATUA_HELD_SLUGS = new Set(['kakapo-recovery', 'kiwi-conservation']);

export const KAUMATUA_HOLD_MESSAGE =
  'This agent is paused while its kaupapa goes through kaumātua and iwi review. Taonga-species mahi only ships with that sign-off. In the meantime Keeper can help with general animal-care questions.';
