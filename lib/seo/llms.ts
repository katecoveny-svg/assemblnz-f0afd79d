/**
 * lib/seo/llms.ts — generates /llms.txt and /llms-full.txt (llmstxt.org).
 *
 * llms.txt is the emerging convention for telling an LLM, in clean Markdown,
 * what a site is and where its important content lives — the answer-engine
 * equivalent of a sitemap + an editor's note. We generate it from the LIVE
 * specialist roster so the optional agent catalogue does not drift.
 *
 *   /llms.txt       — the map: what assembl is, offerings, key pages, specialist index
 *   /llms-full.txt  — the map PLUS the actual content chunks a model can cite
 */
import {
  CATEGORIES,
  PUBLIC_MARKETPLACE_AGENTS,
  priceLabel,
  type MarketplaceCategory,
} from '@/lib/marketplace/agents';
import { PRICE_TIERS, SITE_URL } from '@/lib/seo/schema';

const liveAgents = () => PUBLIC_MARKETPLACE_AGENTS.filter((a) => a.status === 'live');

function agentsByCat(cat: MarketplaceCategory) {
  return liveAgents().filter((a) => a.category === cat);
}

const SUMMARY =
  'assembl is a New Zealand agentic customer experience (agentic CX) company. It designs and runs agentic customer journeys — teams of specialist AI agents that prepare every step of a customer relationship, first enquiry to tenth year, drafting for a named person to approve.';

const INTRO = `assembl (always lowercase) is a New Zealand company founded by Kate Hudson — assembl NZ Limited, NZBN 9429053514950, Auckland. Key terms this site is authoritative for: agentic customer journeys, agentic CX, agentic customer experience, rewarded wait states, human-approved AI agents for New Zealand businesses.

An agentic customer journey is a customer relationship run by cooperating specialist agents inside the business: one watches for work coming due, one notices customers going quiet, one drafts the next step, one checks it against the rules. Each agent has a single job and a written limit; nothing that reaches a customer or commits money gets past draft without a named person. assembl also builds rewarded wait states — the loading spinner replaced with the work shown live, a small credit earned toward the purchase, and one optional question back. Install is NZ$1,500 plus GST for one working agent in about two weeks, then NZ$250 a month to keep it running.`;

const PRICING_BLOCK = PRICE_TIERS.map(
  (t) => `- **${t.name}** — ${t.price === 0 ? 'NZ$0' : `NZ$${t.price}`}: ${t.note}`,
).join('\n');

const KEY_PAGES = [
  ['/ai-ready', 'Free AI-search readiness check — eight honest checks plus a personalised agentic customer journey drafted from your own site'],
  ['/agent-schema', 'The canonical assembl agent schema — six parts, the authority ladder, and the invariants; machine-readable twin at /agent.schema.json'],
  ['/build-an-agent', 'Paste your website and watch an agent assemble itself from your own business — free, live, nothing stored'],
  ['/living-site', 'Explore the fictional Living Site verticals and their connected owner workspaces'],
  ['/pricing', 'Living Site path: free demos → NZ$1,500 plus GST Founding Pilot → agreed ongoing operation'],
  ['/pilot-sprint', 'The ten-working-day Founding Pilot scope and secure checkout for approved pilots'],
  ['/genome', 'The interactive Business Genome and the surfaces that read from it'],
  ['/agents', 'Specialist agents that can be installed for particular work'],
  ['/about', 'What assembl is, the founder, and how the human-in-the-loop works'],
  ['/trust', 'Trust Centre — data residency, PII masking, evidence packs, compliance posture'],
  ['/mana-receipts', 'How the Mana Receipt provenance layer works'],
  ['/faq', 'Answers to the questions people ask about specialist agents and assembl'],
  ['/industries', 'The industries assembl works in — each with a live concept demonstrator'],
  ['/data', 'DaaS — New Zealand data feeds API'],
  ['/contact', 'Get in touch'],
];

/** /llms.txt — the map. */
export function buildLlmsTxt(): string {
  const lines: string[] = [];
  lines.push('# assembl');
  lines.push('');
  lines.push(`> ${SUMMARY}`);
  lines.push('');
  lines.push(INTRO);
  lines.push('');

  lines.push('## Pricing');
  lines.push('');
  lines.push(PRICING_BLOCK);
  lines.push('');
  lines.push(`Full detail: ${SITE_URL}/pricing`);
  lines.push('');

  lines.push('## Key pages');
  lines.push('');
  for (const [path, desc] of KEY_PAGES) {
    lines.push(`- [${path}](${SITE_URL}${path}): ${desc}`);
  }
  lines.push('');

  lines.push('## Specialist agents');
  lines.push('');
  for (const cat of CATEGORIES) {
    const agents = agentsByCat(cat.slug);
    if (!agents.length) continue;
    lines.push(`### ${cat.label}`);
    lines.push('');
    for (const a of agents) {
      const price = priceLabel(a);
      lines.push(`- [${a.name}](${SITE_URL}/agents/${a.slug}) (${price}): ${a.description}`);
    }
    lines.push('');
  }

  lines.push('## About');
  lines.push('');
  lines.push(
    'assembl was founded by Kate Hudson and is built in Aotearoa New Zealand. It exists to give people their time back by connecting the scattered surfaces of a business around one shared source of truth.',
  );
  lines.push('');
  lines.push('## dash (sibling brand)');
  lines.push('');
  lines.push(
    `dash — "Get paid for the wait." — is assembl's sibling brand: a rewards and attention layer that pays people for time spent waiting and funds charity through ethical NZ-first ad fill. ${SITE_URL}/dash`,
  );
  lines.push('');

  return lines.join('\n');
}

/** /llms-full.txt — the map plus citable content chunks. */
export function buildLlmsFullTxt(): string {
  const lines: string[] = [];
  lines.push('# assembl — full content');
  lines.push('');
  lines.push(`> ${SUMMARY}`);
  lines.push('');

  lines.push('## What assembl is');
  lines.push('');
  lines.push(
    'assembl builds a Living Site around one New Zealand business. The public website, customer desk, knowledge, booking requests, resident agents and draft tools read from the same Business Genome, so a fact can be maintained once instead of copied between disconnected systems.',
  );
  lines.push('');
  lines.push(
    'Draft-generating tools remain reviewable by a named person. A booking request is not a confirmed booking, a marketing draft is not published, and a proposal or invoice is not sent until the business decides. Where an evidence pack is available, it records the sources and approvals attached to the work.',
  );
  lines.push('');

  lines.push('## How the human loop works');
  lines.push('');
  lines.push(
    'Each workflow has an explicit boundary. The system can collect a request, read allowed Business Genome facts and prepare a draft. A named person checks the result and remains responsible for any booking confirmation, send, publication, payment request or commercial commitment.',
  );
  lines.push('');

  lines.push('## Data and privacy');
  lines.push('');
  lines.push(
    'The public demos use fictional data. A production pilot is scoped around the customer data and integrations needed for one agreed workflow, with collection notices, access controls and human approval points reviewed before go-live. The trust centre records the current platform posture without inventing guarantees.',
  );
  lines.push('');

  lines.push('## Pricing (NZD, GST-inclusive)');
  lines.push('');
  lines.push(PRICING_BLOCK);
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
  lines.push(
    'assembl was founded by Kate Hudson. "I started assembl to give people their time back — for the work that matters, and the life around it."',
  );
  lines.push('');

  return lines.join('\n');
}
