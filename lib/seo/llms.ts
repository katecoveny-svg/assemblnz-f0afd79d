/**
 * lib/seo/llms.ts — generates /llms.txt and /llms-full.txt (llmstxt.org).
 *
 * Treat these files as public product copy for AI crawlers. Keep the company
 * description aligned with the canonical repo context; older product eras may
 * appear only as historical/reusable capabilities, never as the top-level identity.
 */
import {
  CATEGORIES,
  PUBLIC_MARKETPLACE_AGENTS,
  priceLabel,
  type MarketplaceCategory,
} from '@/lib/marketplace/agents';
import { SITE_URL } from '@/lib/seo/schema';

const liveAgents = () => PUBLIC_MARKETPLACE_AGENTS.filter((a) => a.status === 'live');

function agentsByCat(cat: MarketplaceCategory) {
  return liveAgents().filter((a) => a.category === cat);
}

const SUMMARY =
  'assembl is a New Zealand software and agent platform for finding, doing and showing valuable work. Pursuit finds evidence-backed opportunities, DO is a portable model-agnostic agent workforce, and Studio turns the result into demonstrations, creative and commercial proof.';

const INTRO = `assembl (always lowercase) is a New Zealand company founded by Kate Hudson — assembl NZ Limited, NZBN 9429053514950, Auckland.

The current system is Pursuit → Factory → DO + Studio → Proof/Learning. Pursuit turns live and accumulated signals into bounded opportunities. DO carries a role, context, permissions, tools and evidence across browser, desktop, voice and connected workflows while the underlying AI model or execution harness can change. Studio makes proposed or completed work tangible through interactive demonstrations, websites, pitches, imagery, film, 3D and other creative production. The shared Factory underneath the system owns canonical context, reusable skills and primitives, connectors, model routing, approvals, tests/evals and proof.

Agentic customer journeys and productive wait states remain reusable capabilities where they improve a real customer workflow; they are not the top-level definition of assembl.`;

const KEY_PAGES = [
  ['/do', 'DO — the portable agent workforce and main execution product'],
  ['/do/office', 'DO Office — visible work, approvals, handoffs and spatial workforce view'],
  ['/do/builder', 'Builderdoo — the persistent software-factory specialist for planning and building reviewable work'],
  ['/do/connections', 'DO Connections — user-scoped capabilities and account connections with explicit authority'],
  ['/pursuit', 'Pursuit — live signals and evidence turned into qualified work'],
  ['/creative-studio', 'Studio — interactive demonstrations, websites, creative, film and proof'],
  ['/agent-schema', 'The assembl agent schema, authority ladder and machine-readable definition'],
  ['/agents', 'Specialist agents available for particular work'],
  ['/trust', 'Trust Centre — current data, security, evidence and governance posture'],
  ['/mana-receipts', 'Evidence receipts and provenance'],
  ['/about', 'Company and founder'],
  ['/contact', 'Get in touch'],
];

export function buildLlmsTxt(): string {
  const lines: string[] = [];
  lines.push('# assembl');
  lines.push('');
  lines.push(`> ${SUMMARY}`);
  lines.push('');
  lines.push(INTRO);
  lines.push('');

  lines.push('## Product system');
  lines.push('');
  lines.push('- **Pursuit — find it.** Live signals and business context become evidence-backed opportunities.');
  lines.push('- **DO — DO it.** Portable agents research, prepare, build and coordinate using the right configured models and tools.');
  lines.push('- **Studio — show it.** Demonstrations, websites, pitches, campaigns, imagery, film and spatial experiences make the result tangible.');
  lines.push('- **Factory.** Shared context, connectors, model routing, approvals, evals, evidence and reusable primitives sit underneath all three.');
  lines.push('');

  lines.push('## Pricing');
  lines.push('');
  lines.push(`Use the current product pages or contact assembl for current commercial terms. Historical pilot prices elsewhere in the repository are not the company-level offer. ${SITE_URL}/contact`);
  lines.push('');

  lines.push('## Key pages');
  lines.push('');
  for (const [path, desc] of KEY_PAGES) lines.push(`- [${path}](${SITE_URL}${path}): ${desc}`);
  lines.push('');

  lines.push('## Specialist agents');
  lines.push('');
  for (const cat of CATEGORIES) {
    const agents = agentsByCat(cat.slug);
    if (!agents.length) continue;
    lines.push(`### ${cat.label}`);
    lines.push('');
    for (const a of agents) lines.push(`- [${a.name}](${SITE_URL}/agents/${a.slug}) (${priceLabel(a)}): ${a.description}`);
    lines.push('');
  }

  lines.push('## Operating principles');
  lines.push('');
  lines.push('- Model/provider is replaceable; the agent role, context, permissions, tools and evidence persist.');
  lines.push('- Consequential actions such as sending, publishing, spending or account changes require the relevant explicit authority.');
  lines.push('- Connections are user-scoped; raw OAuth credentials and secrets are not normal prompt context.');
  lines.push('- Completed work should leave evidence/receipts and useful learning should be promoted through measured, reviewable changes.');
  lines.push('');

  lines.push('## About');
  lines.push('');
  lines.push('assembl was founded by Kate Hudson and is built in New Zealand.');
  lines.push('');
  return lines.join('\n');
}

export function buildLlmsFullTxt(): string {
  const lines: string[] = [];
  lines.push('# assembl — full content');
  lines.push('');
  lines.push(`> ${SUMMARY}`);
  lines.push('');

  lines.push('## What assembl is');
  lines.push('');
  lines.push(INTRO);
  lines.push('');

  lines.push('## DO');
  lines.push('');
  lines.push(
    'DO is the portable execution layer. A DO can keep the same identity, role, context, authority and evidence while different models or execution harnesses are selected for coding, research, voice, vision, creative or other work. Current surfaces include hosted DO, browser/side-panel experiences, a native Mac companion, mobile/share surfaces, voice and the DO Office coordination view.',
  );
  lines.push('');
  lines.push(
    'Connecting a tool does not automatically authorize consequential actions. Assembl separates connection state from action authority and keeps approvals/evidence visible.',
  );
  lines.push('');

  lines.push('## Builderdoo and self-improvement');
  lines.push('');
  lines.push(
    'Builderdoo is the software-factory specialist inside DO. It creates bounded build jobs with canonical context, capabilities, definition of done and proof requirements, and can hand those jobs to compatible local or cloud execution harnesses. Self-improvement is measured rather than autonomous: candidate prompt, skill, routing or tool changes must beat a baseline on evaluations without widening authority or regressing security before they can become a reviewable repository change.',
  );
  lines.push('');

  lines.push('## Pursuit and Studio');
  lines.push('');
  lines.push('Pursuit finds evidence-backed work: market/company changes, customer and buyer signals, tenders, procurement, product gaps and reusable Assembl capabilities.');
  lines.push('');
  lines.push('Studio turns opportunities and completed work into visible proof: interactive demonstrations, websites, customer journeys, pitches, imagery, video, 3D and commercial creative.');
  lines.push('');

  lines.push('## Context and Business Genome');
  lines.push('');
  lines.push(
    'Assembl company memory and a customer Business Genome are separate layers. Repository-backed Assembl canon describes how the platform works. A Business Genome is structured context for a particular customer/business — products, customers, policies, language, workflows, permissions, systems, knowledge and success measures — that Pursuit, DO, Studio and journeys can use when relevant.',
  );
  lines.push('');

  lines.push('## Human authority, data and security');
  lines.push('');
  lines.push(
    'Every meaningful workflow has an explicit authority boundary. The system may observe, research, prepare or act within granted limits; sending, publication, spend, account changes and other consequential actions remain subject to the configured approval policy. Secrets should remain in secure credential stores/connectors rather than normal model context. Evidence and receipts record what happened and what still needs a person.',
  );
  lines.push('');

  lines.push('## Commercial terms');
  lines.push('');
  lines.push(`Use current product pages or contact assembl for current commercial terms: ${SITE_URL}/contact`);
  lines.push('');

  lines.push('## Specialist agents (catalogue)');
  lines.push('');
  for (const cat of CATEGORIES) {
    const agents = agentsByCat(cat.slug);
    if (!agents.length) continue;
    lines.push(`### ${cat.label}`);
    lines.push('');
    for (const a of agents) {
      lines.push(`#### ${a.name}${a.teReo ? ` (${a.teReo})` : ''} — ${priceLabel(a)}`);
      lines.push('');
      lines.push(a.description);
      lines.push('');
      if (a.whatItDoes?.length) {
        lines.push('What it does:');
        for (const w of a.whatItDoes) lines.push(`- ${w}`);
        lines.push('');
      }
      if (a.nzKnowledge?.length) {
        lines.push(`New Zealand knowledge: ${a.nzKnowledge.join('; ')}.`);
        lines.push('');
      }
      lines.push(`URL: ${SITE_URL}/agents/${a.slug}`);
      lines.push('');
    }
  }

  lines.push('## Founder');
  lines.push('');
  lines.push('assembl was founded by Kate Hudson in New Zealand.');
  lines.push('');
  return lines.join('\n');
}
