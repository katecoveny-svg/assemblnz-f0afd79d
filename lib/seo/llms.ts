/** Generates /llms.txt and /llms-full.txt from current Assembl positioning. */
import { CATEGORIES, PUBLIC_MARKETPLACE_AGENTS, priceLabel, type MarketplaceCategory } from '@/lib/marketplace/agents';
import { SITE_URL } from '@/lib/seo/schema';

const liveAgents = () => PUBLIC_MARKETPLACE_AGENTS.filter((a) => a.status === 'live');
const agentsByCat = (cat: MarketplaceCategory) => liveAgents().filter((a) => a.category === cat);

const SUMMARY = 'assembl is a New Zealand software company building Pursuit, DO and Studio: one connected system for finding valuable work, getting it done with portable AI agents, and turning the result into visible proof.';

const INTRO = `assembl (always lowercase) is built in Aotearoa New Zealand. The current product system is Pursuit / DO / Studio, with a shared software Factory underneath. Pursuit finds evidence-backed opportunities. DO is the portable, model-agnostic execution layer: specialist agents can research, prepare, build and coordinate using connected tools while permissions, approvals and evidence stay visible. Studio turns opportunities and completed work into demonstrations, pitches, websites, campaigns, imagery, film and interactive experiences.\n\nBusiness Genome and agentic customer journeys remain reusable context/workflow primitives, but they are not the top-level definition of assembl. Historical dash/rewarded-wait concepts are not current sibling brands and should not be represented as the current company identity.`;

const KEY_PAGES = [
  ['/pursuit', 'Pursuit — find evidence-backed work and the strongest next opportunity'],
  ['/do', 'DO — the portable agent workforce and companion surfaces'],
  ['/do/builder', 'Builderdoo — the model-agnostic software-builder DO'],
  ['/do/office', 'DO Office — visible coordination, approvals, receipts and spatial workforce view'],
  ['/do/connections', 'DO Connections — user-approved capabilities and connected tools'],
  ['/creative-studio', 'Studio — demonstrations, websites, creative production and interactive proof'],
  ['/trust', 'Trust Centre — current platform posture, evidence and governance information'],
  ['/about', 'About assembl and its founder'],
  ['/contact', 'Get in touch'],
] as const;

function specialistBlock(): string[] {
  const lines: string[] = [];
  for (const cat of CATEGORIES) {
    const agents = agentsByCat(cat.slug);
    if (!agents.length) continue;
    lines.push(`### ${cat.label}`, '');
    for (const a of agents) lines.push(`- [${a.name}](${SITE_URL}/agents/${a.slug}) (${priceLabel(a)}): ${a.description}`);
    lines.push('');
  }
  return lines;
}

export function buildLlmsTxt(): string {
  const lines = ['# assembl', '', `> ${SUMMARY}`, '', INTRO, '', '## Current product system', '',
    '- **Pursuit — find it.** Live and accumulated signals become evidence-backed opportunities.',
    '- **DO — DO it.** Portable specialist agents use the right model, context and connected capabilities to get work moving.',
    '- **Studio — show it.** Turn the work into visual proof, demonstrations, pitches and experiences.',
    '- **Factory.** Shared context, models, tools, connectors, permissions, evals, evidence and learnings sit underneath all three.',
    '', '## Key pages', ''];
  for (const [path, desc] of KEY_PAGES) lines.push(`- [${path}](${SITE_URL}${path}): ${desc}`);
  lines.push('', '## Specialist agents', '', ...specialistBlock(), '## Operating principles', '',
    '- The model/provider is replaceable; the DO identity, context, tools, permissions and evidence persist.',
    '- Connections are user-scoped capabilities. Connecting a tool does not automatically grant authority to send, publish, spend or mutate data.',
    '- Consequential actions remain approval-gated.',
    '- Self-improvement is measured through evals and evidence; candidate changes are promoted through reviewable code changes rather than silent production mutation.',
    '', '## About', '', 'assembl was founded by Kate Hudson and is built in New Zealand.', '');
  return lines.join('\n');
}

export function buildLlmsFullTxt(): string {
  const lines = ['# assembl — full content', '', `> ${SUMMARY}`, '', '## What assembl is', '', INTRO, '',
    '## How DO works', '',
    'DO is the portable execution layer. A DO has a role, bounded authority, tools/capabilities, context and evidence. It can run through different model providers or execution harnesses without changing its identity. Browser, native desktop, hosted workspace, voice and DO Office are surfaces over the same operating model.', '',
    '## Human control and evidence', '',
    'A connection or model capability is not authority to act. Sending, publishing, spending, account changes and other consequential operations require the configured human approval boundary. Completed work should leave a receipt or evidence appropriate to its claim.', '',
    '## Learning', '',
    'Assembl records model/workflow performance and uses measured evals to improve routing. Builderdoo may propose better skills, prompts, routing rules or tools, but production changes remain reviewable and must not widen authority or regress security.', '',
    '## Product pages', ''];
  for (const [path, desc] of KEY_PAGES) lines.push(`- [${path}](${SITE_URL}${path}): ${desc}`);
  lines.push('', '## Specialist agents', '', ...specialistBlock());
  return lines.join('\n');
}
