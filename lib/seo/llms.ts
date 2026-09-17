/**
 * Generates /llms.txt and /llms-full.txt from the current public assembl story.
 * Keep this aligned with docs/context/CURRENT.md and the live product surfaces.
 */
import {
  CATEGORIES,
  PUBLIC_MARKETPLACE_AGENTS,
  priceLabel,
  type MarketplaceCategory,
} from '@/lib/marketplace/agents';
import { SITE_URL } from '@/lib/seo/schema';

const liveAgents = () => PUBLIC_MARKETPLACE_AGENTS.filter((a) => a.status === 'live');
const agentsByCat = (cat: MarketplaceCategory) => liveAgents().filter((a) => a.category === cat);

const SUMMARY =
  'assembl is a New Zealand software company for finding, doing and showing valuable work. Pursuit finds evidence-backed opportunities, DO moves bounded work forward with agents, tools and permissions, and Studio turns the result into proof, pitches and experiences.';

const INTRO = `assembl (always lowercase) is a New Zealand company founded by Kate Hudson. Its public product structure is Pursuit → DO → Studio, with one shared operating layer underneath for context, connectors, models, permissions, evidence and learning.

Pursuit turns relevant signals into evidence-backed opportunities. DO brings the right agent, context, tools and permissions to a bounded job while keeping consequential actions behind explicit approval. Studio turns opportunities and completed work into interactive demonstrations, websites, campaigns, imagery, film, 3D experiences and other commercial proof.

Human authority remains explicit. A connection to a tool does not itself grant permission to send, publish, spend or make irreversible changes. Consequential actions require the configured approval boundary and completed work should leave evidence or a receipt.

Agentic customer journeys, loyalty, rewarded waits and sponsorship remain specialist capabilities inside suitable DO and Studio journeys. They are not the top-level definition of assembl.`;

const KEY_PAGES = [
  ['/pursuit', 'Pursuit — find evidence-backed opportunities and prepare the next move'],
  ['/do', 'DO — the action layer for bounded work with context, tools, permissions and evidence'],
  ['/creative-studio', 'Studio — interactive demonstrations, campaigns, visual production, web and 3D proof'],
  ['/trust', 'Trust Centre — security, privacy, evidence and governance posture'],
  ['/mana-receipts', 'Evidence receipt and provenance layer'],
  ['/about', 'About assembl and its founder'],
  ['/contact', 'Contact assembl'],
] as const;

export function buildLlmsTxt(): string {
  const lines: string[] = ['# assembl', '', `> ${SUMMARY}`, '', INTRO, '', '## Key pages', ''];
  for (const [path, desc] of KEY_PAGES) lines.push(`- [${path}](${SITE_URL}${path}): ${desc}`);
  lines.push('', '## Specialist agents', '', 'Specialist agents sit underneath DO. They are capabilities inside the product system rather than separate top-level assembl products.', '');
  for (const cat of CATEGORIES) {
    const agents = agentsByCat(cat.slug);
    if (!agents.length) continue;
    lines.push(`### ${cat.label}`, '');
    for (const a of agents) lines.push(`- [${a.name}](${SITE_URL}/agents/${a.slug}) (${priceLabel(a)}): ${a.description}`);
    lines.push('');
  }
  lines.push('## About', '', 'assembl was founded by Kate Hudson and is built in Aotearoa New Zealand. The current product principle is: find it. DO it. show it.', '');
  return lines.join('\n');
}

export function buildLlmsFullTxt(): string {
  const lines: string[] = [
    '# assembl — full content',
    '',
    `> ${SUMMARY}`,
    '',
    '## The system',
    '',
    INTRO,
    '',
    '## Pursuit',
    '',
    'Pursuit gathers live and accumulated signals about companies, markets, tenders, buyer needs, customer friction and relevant product or model changes, then turns them into bounded opportunities with evidence, provenance and a recommended next action.',
    '',
    '## DO',
    '',
    'DO is the action layer. It brings the right specialist agent, context, tools and permissions to bounded work while keeping status, approvals and evidence visible. DO can operate across browser, desktop, hosted and connected workflows rather than forcing every job into a separate application.',
    '',
    'The underlying model may vary by task. Identity, context, role, tools, permissions, task state and evidence should persist independently of the model selected for coding, research, voice, vision or creative work.',
    '',
    '## Studio',
    '',
    'Studio is the visual and commercial proof layer. It turns opportunities and software capability into interactive demonstrators, websites, campaigns, imagery, video, 3D experiences, pitches, tenders and other artefacts people can see, test and understand.',
    '',
    '## Customer journeys and useful waits',
    '',
    'Agentic customer journeys are a reusable capability across the system. DO can orchestrate the useful next step and Studio can make that journey tangible. Loyalty, rewards, sponsorship and productive wait states are used only where they improve the customer outcome. Utility comes before reward; interruption is not the product.',
    '',
    '## Security and authority',
    '',
    'Secrets are not prompt context. OAuth credentials and API keys stay in secure connector or server-side stores. Web pages, email and retrieved documents are treated as untrusted context rather than instructions. Sending, publishing, spending and irreversible changes remain separately permissioned actions and should leave an auditable receipt.',
    '',
    '## Self-improvement',
    '',
    'Assembl improves agents through measured evaluation rather than silent self-modification. Job evidence, model calls and workflow evaluations can produce candidate improvements. Security regressions or widened authority reject a candidate; high-risk improvements require independent review. A successful candidate becomes a reviewable change before production promotion.',
    '',
    '## Specialist agents',
    '',
    'Specialist agents sit underneath DO and are not separate top-level product brands.',
    '',
  ];

  for (const cat of CATEGORIES) {
    const agents = agentsByCat(cat.slug);
    if (!agents.length) continue;
    lines.push(`### ${cat.label}`, '');
    for (const a of agents) {
      lines.push(`#### ${a.name}${a.teReo ? ` (${a.teReo})` : ''} — ${priceLabel(a)}`, '', a.description, '');
      if (a.whatItDoes?.length) {
        lines.push('What it does:');
        for (const w of a.whatItDoes) lines.push(`- ${w}`);
        lines.push('');
      }
      if (a.nzKnowledge?.length) lines.push(`New Zealand knowledge: ${a.nzKnowledge.join('; ')}.`, '');
      lines.push(`URL: ${SITE_URL}/agents/${a.slug}`, '');
    }
  }

  lines.push('## Founder', '', 'assembl was founded by Kate Hudson. It is built in New Zealand around the idea that people should be able to delegate useful work while retaining visibility, authority and proof.', '');
  return lines.join('\n');
}
