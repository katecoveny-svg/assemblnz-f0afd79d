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
  'assembl is a New Zealand software company for finding, doing and showing valuable work. Pursuit finds evidence-backed opportunities, DO is a portable multi-model agent workforce, and Studio makes the result visible as proof, pitches and experiences.';

const INTRO = `assembl (always lowercase) is a New Zealand company founded by Kate Hudson. Its current product system is Pursuit → DO + Studio, with one shared Factory underneath for context, connectors, models, permissions, evidence and learning.

Pursuit turns relevant signals into qualified work. DO carries persistent agent identity, context, tools, permissions and evidence across browser, desktop and connected workflows while the underlying model can change. Studio turns opportunities and completed work into interactive demonstrations, websites, campaigns, imagery, film, 3D experiences and other commercial proof.

Human authority remains explicit. A connection to a tool does not itself grant permission to send, publish, spend or make irreversible changes. Consequential actions require the configured approval boundary and completed work should leave evidence or a receipt.`;

const KEY_PAGES = [
  ['/pursuit', 'Pursuit — find the opening; build the possibility (lean www brief)'],
  ['https://assembl-pursuit.katecoveny.chatgpt.site', 'Pursuit hub — private ChatGPT workspace for client work'],
  ['/do', 'DO — public Meeting notes and generic Household chores board'],
  ['/do/meetings', 'Meeting DO — record, transcribe, review useful notes'],
  ['/do/household', 'Household DO — scrubbed public demo chores board'],
  ['/creative-studio', 'Studio — interactive demonstrations, campaigns, visual production, web and 3D proof'],
  ['/llms.txt', 'Machine-readable product map for agents'],
  ['/trust', 'Trust Centre — security, privacy, evidence and governance posture'],
  ['/mana-receipts', 'Evidence receipt and provenance layer'],
  ['/agents', 'Specialist agent catalogue'],
  ['/about', 'About assembl and its founder'],
  ['/contact', 'Contact assembl'],
] as const;

export function buildLlmsTxt(): string {
  const lines: string[] = ['# assembl', '', `> ${SUMMARY}`, '', INTRO, '', '## Key pages', ''];
  for (const [path, desc] of KEY_PAGES) {
    const href = path.startsWith('http') ? path : `${SITE_URL}${path}`;
    lines.push(`- [${path}](${href}): ${desc}`);
  }
  lines.push('', '## Specialist agents', '');
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
    '## DO',
    '',
    'DO is the portable execution layer. A DO is not tied to one model vendor: its identity, context, role, tools, permissions, task state and evidence persist while the runtime can route work to the best configured model for coding, research, voice, vision or creative production.',
    '',
    'DO surfaces include the hosted workspace, browser companion, native Mac companion, Builderdoo, DO Office, voice and connected workflows. The product should expose capabilities rather than connector clutter: users connect an account once, then specialist DOs can request the allowed capability under the same permission system.',
    '',
    '## Self-improvement',
    '',
    'Assembl improves agents through measured evaluation rather than silent self-modification. Job evidence, model calls and workflow evaluations can produce candidate improvements. Security regressions or widened authority reject a candidate; high-risk improvements require independent review. A successful candidate becomes a reviewable change before production promotion.',
    '',
    '## Security and authority',
    '',
    'Secrets are not prompt context. OAuth credentials and API keys stay in secure connector or server-side stores. Web pages, email and retrieved documents are treated as untrusted context rather than instructions. Sending, publishing, spending and irreversible changes remain separately permissioned actions and should leave an auditable receipt.',
    '',
    '## Pursuit',
    '',
    'Pursuit gathers live and accumulated signals about companies, markets, tenders, buyer needs, customer friction and relevant product or model changes, then turns them into bounded opportunities with evidence and a recommended next action.',
    '',
    '## Studio',
    '',
    'Studio is the visual and commercial proof layer. It turns opportunities and software capability into interactive demonstrators, websites, campaigns, imagery, video, 3D experiences, pitches and other artefacts people can see, test and understand.',
    '',
    '## Specialist agents',
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
