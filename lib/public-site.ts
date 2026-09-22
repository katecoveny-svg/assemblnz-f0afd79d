import { PUBLIC_NAV_ALLOWLIST, PUBLIC_PURSUIT_HUB } from '@/lib/public-nav-allowlist';

export type DemoStatus = 'live' | 'preview' | 'concept';

export type ConceptDemo = {
  slug: string;
  title: string;
  label: string;
  summary: string;
  tryCopy: string;
  boundary: string;
  href: string;
  status: DemoStatus;
  external?: boolean;
  featured?: boolean;
};

/** Primary public nav — Kate allowlist (Pursuit is external hub only). */
export const PUBLIC_NAV_LINKS = PUBLIC_NAV_ALLOWLIST.filter(
  (item) => item.id !== 'home',
).map((item) => ({
  href: item.href,
  label: item.label,
  external: item.external,
}));

export { PUBLIC_PURSUIT_HUB };

export const CONCEPT_DEMOS: readonly ConceptDemo[] = [
  {
    slug: 'one-minute-agent',
    title: 'One Minute Agent',
    label: 'personal share tool',
    summary: 'Answer three questions and get a tiny personal agent for the task stealing your week.',
    tryCopy: 'Create a named result with a seven-day plan and its own shareable link.',
    boundary: 'Public build-week prototype. It offers practical prompts, not professional advice.',
    href: 'https://assembl-minute-one.katecoveny.chatgpt.site/personal-agent',
    status: 'preview',
    external: true,
    featured: true,
  },
  {
    slug: 'agent-maker',
    title: 'Agent Maker',
    label: 'build and share',
    summary: 'Name one job, pick a working style, and create a small agent page you can send to someone else.',
    tryCopy: 'Build a public agent, try its draft flow and remix agents other people share.',
    boundary: 'Every result is a draft. Public recipes never carry a private task or result.',
    href: '/a',
    status: 'live',
    featured: true,
  },
  {
    slug: 'motion-studio',
    title: 'Motion Studio',
    label: 'generative visual tool',
    summary: 'Sculpt a moving particle form, set the look, and export a still or five-second loop.',
    tryCopy: 'Use a preset or turn your own image into particles. Share a remixable study.',
    boundary: 'Everything renders in the browser. Uploaded images are not sent to assembl.',
    href: '/motion-studio',
    status: 'live',
    featured: true,
  },
  {
    slug: 'pattern-studio',
    title: 'Pattern Studio',
    label: 'brand pattern generator',
    summary: 'Make halftone, dither, ASCII and particle patterns for a campaign or page.',
    tryCopy: 'Create and export a repeatable visual direction without opening a design suite.',
    boundary: 'Creative study only. A person chooses and clears the final brand asset.',
    href: '/pattern-studio',
    status: 'live',
  },
  {
    slug: 'ad-studio',
    title: 'Ad Studio',
    label: 'campaign draft preview',
    summary: 'Read a sample Business Genome, draft a campaign, and lay it out across four ad sizes.',
    tryCopy: 'Choose a sample business and goal, then review the copy, visual and format set together.',
    boundary: 'Preview. Image generation depends on configured production providers; nothing auto-publishes.',
    href: '/ad-studio',
    status: 'preview',
  },
  {
    slug: 'hui',
    title: 'Hui',
    label: 'meeting record',
    summary: 'Turn a recording or notes into minutes, decisions, actions and a reviewable evidence pack.',
    tryCopy: 'Run a meeting record and download the draft pack for human review.',
    boundary: 'Get consent before recording. The output must be checked before it is shared or filed.',
    href: '/hui',
    status: 'live',
  },
  {
    slug: 'assembl-bills',
    title: 'assembl bills',
    label: 'consumer concept',
    summary: 'A plain-English home for bills that compares costs, explains changes and prepares a switch for approval.',
    tryCopy: 'Explore the fictional household flow and see where approval remains with the customer.',
    boundary: 'Concept data. No provider account is connected and no switch or payment is made.',
    href: '/bills',
    status: 'concept',
  },
  {
    slug: 'alphassembl',
    title: 'Alphassembl',
    label: 'dog-life concept',
    summary: 'A connected home for a dog owner — force-free guidance and a practical care record.',
    tryCopy: 'Explore the product story and the trainer-style guide.',
    boundary: 'Beta concept. Guidance is not a veterinary diagnosis and urgent concerns belong with a vet.',
    href: '/alphassembl',
    status: 'concept',
  },
  {
    slug: 'strong',
    title: 'Strong',
    label: 'health plan concept',
    summary: 'A sample health plan that connects goals, food, training and review — without replacing clinicians.',
    tryCopy: 'Explore how a personal plan could stay coherent across daily decisions.',
    boundary: 'Concept only. Not medical or dietary advice; clinical decisions stay with qualified professionals.',
    href: '/health/strong',
    status: 'concept',
  },
] as const;

export const PROMOTION_TOOL_SLUGS = [
  'one-minute-agent',
  'agent-maker',
  'motion-studio',
] as const;

export const STATUS_LABELS: Record<DemoStatus, string> = {
  live: 'live now',
  preview: 'preview',
  concept: 'concept',
};
