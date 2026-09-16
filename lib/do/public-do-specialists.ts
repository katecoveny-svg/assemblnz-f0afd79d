/**
 * Public `/do` specialist shelf — product DEMO only.
 *
 * ED privacy HARD FAIL: never put Personal DO, Household Floor, Inbox DO,
 * Bills DO, operator task boards, or do-not-share / demo-week household
 * context on the public marketing `/do` surface.
 *
 * Work DOs (Writing, Creative, Detail, Builder) are allowed as generic
 * product examples when clearly DEMO.
 */

export type PublicDoSpecialistScope = 'work';

export type PublicDoSpecialist = {
  id: string;
  name: string;
  scope: PublicDoSpecialistScope;
  glyph: string;
  description: string;
  note: string;
  /** Workspace skill id when opening the in-page DO workspace. */
  task?: 'rewrite' | 'image' | 'extract' | 'reply' | 'plan' | 'brief';
  /** Navigate instead of opening the in-page workspace. */
  href?: string;
};

/** Banned names / ids that must never appear on public `/do`. */
export const PUBLIC_DO_BANNED_SPECIALIST_IDS = [
  'personal',
  'household',
  'inbox',
  'bills',
  'family',
] as const;

export const PUBLIC_DO_BANNED_SPECIALIST_NAMES = [
  'Personal DO',
  'Household Floor',
  'Inbox DO',
  'Bills DO',
] as const;

/**
 * Public product-demo specialists only.
 * Keep Writing DO and other work DOs as DEMO examples.
 */
export const PUBLIC_DO_SPECIALISTS: PublicDoSpecialist[] = [
  {
    id: 'writing',
    name: 'Writing DO',
    scope: 'work',
    glyph: '✦',
    description: 'Make the words sound like you.',
    note: 'DEMO · Polish a draft, keep its meaning and review the result.',
    task: 'rewrite',
  },
  {
    id: 'creative',
    name: 'Creative DO',
    scope: 'work',
    glyph: '◈',
    description: 'Give an idea a visible shape.',
    note: 'DEMO · Prepare an image from your brief when the image provider is configured.',
    task: 'image',
  },
  {
    id: 'details',
    name: 'Detail DO',
    scope: 'work',
    glyph: '⌕',
    description: 'Find the dates, figures and links.',
    note: 'DEMO · Extract exact details from the text you approve.',
    task: 'extract',
  },
  {
    id: 'builder',
    name: 'Builder DO',
    scope: 'work',
    glyph: '⌘',
    description: 'Turn a software idea into a build job.',
    note: 'DEMO · Prepare a build contract for your chosen coding worker. Review before execution.',
    href: '/do/builder',
  },
];

/** Copy that must not appear as live personal / operator context on public `/do`. */
export const PUBLIC_DO_BANNED_COPY = [
  /Personal DO/i,
  /Household Floor/i,
  /Inbox DO/i,
  /Bills DO/i,
  /do not share/i,
  /School notice:/i,
  /Power bill:/i,
  /Dentist reminder:/i,
  /school pickup/i,
] as const;
