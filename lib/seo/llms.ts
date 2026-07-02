/**
 * lib/seo/llms.ts — generates /llms.txt and /llms-full.txt (llmstxt.org).
 *
 * llms.txt is the emerging convention for telling an LLM, in clean Markdown,
 * what a site is and where its important content lives — the AI-search
 * equivalent of a sitemap + an editor's note. We generate it from the LIVE
 * agent roster so it never drifts from the marketplace.
 *
 *   /llms.txt       — the map: what assembl is, offerings, key pages, agent index
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
  'assembl is an AI platform built in Aotearoa New Zealand: a marketplace of specialist agents for the admin work that drains small teams. Every output is a human-reviewed draft, sealed with a Mana Receipt provenance record, and designed to the Privacy Act 2020 (including IPP 3A).';

const INTRO = `assembl (always lowercase) is a New Zealand company founded by Kate Hudson. It is not a general chatbot — it is a shelf of single-purpose agents, each tuned for one real New Zealand job (school notices, GST, rosters, clinical notes, building consents, customs entries, employment law). An agent drafts the work; a named person on the team reviews and signs it off; every output ships with an evidence pack — the "Mana Receipt" — recording the sources used and who approved it. Personal details are masked before any model call.`;

const PRICING_BLOCK = PRICE_TIERS.map(
  (t) => `- **${t.name}** — ${t.price === 0 ? 'NZ$0' : `NZ$${t.price}/month`}: ${t.note}`,
).join('\n');

const KEY_PAGES = [
  ['/agents', 'The marketplace — browse every agent by category'],
  ['/pricing', 'Pricing ladder: Free → Everyday $9.99 → Pro Stack $49 → Specialist $199 → All-Access $250'],
  ['/about', 'What assembl is, the founder, and how the human-in-the-loop works'],
  ['/trust', 'Trust Centre — data residency, PII masking, evidence packs, compliance posture'],
  ['/mana-receipts', 'How the Mana Receipt provenance layer works'],
  ['/faq', 'Answers to the questions people ask about NZ AI agents and assembl'],
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

  lines.push('## Agents');
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
    'assembl was founded by Kate Hudson and is built in Aotearoa New Zealand. It exists to give people their time back — for the work that matters and the life around it. NZ law, council and sector rules, and tikanga are built in from the start, not bolted on.',
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
    'assembl is an AI platform built in Aotearoa New Zealand that solves the real reason AI adoption stalls in New Zealand businesses: not the technology, but trust and uptake. Instead of asking teams to learn prompting and switch tools, assembl ships a marketplace of specialist agents that each do one ordinary job and produce a reviewable result in minutes.',
  );
  lines.push('');
  lines.push(
    'Every output is draft-only and reviewed by a named human before it ships, with an auditable trail (the "Mana Receipt" provenance layer) and privacy designed to the Privacy Act 2020 including IPP 3A. The adoption path is deliberate: a public agent proves useful, then becomes a private, branded tool for that team — turning a single win into a repeatable internal system.',
  );
  lines.push('');

  lines.push('## How the human loop works');
  lines.push('');
  lines.push(
    'Every output runs the same steps: the request comes in and personal details are masked first; the right agent and model are chosen; the work is drafted with sources cited inline; someone on the team reads it and decides; and the receipt is sealed with their name on it. The model never sees a real name.',
  );
  lines.push('');

  lines.push('## Data and privacy');
  lines.push('');
  lines.push(
    'Data is hosted in Sydney today, with a New Zealand hosting option in progress. Personally identifiable information (PII) is stripped before any model call — names stay with the user. Every output ends in an evidence pack: a downloadable bundle you can hand to an auditor. This is designed to the New Zealand Privacy Act 2020, including Information Privacy Principle 3A.',
  );
  lines.push('');

  lines.push('## Pricing (NZD, GST-inclusive)');
  lines.push('');
  lines.push(PRICING_BLOCK);
  lines.push('');

  lines.push('## Agents (full catalogue)');
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
