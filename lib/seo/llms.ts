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
  'assembl builds Living Sites for New Zealand businesses: one connected website, customer desk, Business Genome and set of approval-led workflows. People retain control of bookings, sends, publishing and commercial commitments.';

const INTRO = `assembl (always lowercase) is a New Zealand company founded by Kate Hudson. A Living Site is the connected operating layer for one business: its public website, booking and enquiry flows, customer desk, Business Genome, resident voice and chat desk, proposals, invoices and draft marketing tools. Specialist agents can be installed inside that system for particular work. A named person reviews commitments and decides what is sent, published, booked or charged.`;

const PRICING_BLOCK = PRICE_TIERS.map(
  (t) => `- **${t.name}** — ${t.price === 0 ? 'NZ$0' : `NZ$${t.price}`}: ${t.note}`,
).join('\n');

const KEY_PAGES = [
  ['/living-site', 'Explore the fictional Living Site verticals and their connected owner workspaces'],
  ['/pricing', 'Living Site path: free demos → NZ$1,500 plus GST Founding Pilot → agreed ongoing operation'],
  ['/pilot-sprint', 'The ten-working-day Founding Pilot scope and secure checkout for approved pilots'],
  ['/genome', 'The interactive Business Genome and the surfaces that read from it'],
  ['/agents', 'Specialist agents that can be installed for particular work'],
  ['/about', 'What assembl is, the founder, and how the human-in-the-loop works'],
  ['/trust', 'Trust Centre — data residency, PII masking, evidence packs, compliance posture'],
  ['/mana-receipts', 'How the Mana Receipt provenance layer works'],
  ['/faq', 'Answers to the questions people ask about specialist agents and assembl'],
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
