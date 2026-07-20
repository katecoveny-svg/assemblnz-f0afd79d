/**
 * Editorial gallery homepage — copy source.
 *
 * Copy in this file was written directly by Kate on 2026-07-20 as part of the
 * `homepage/editorial-gallery` rebuild brief. Do not paraphrase or tighten —
 * substitute only with Kate's explicit approval.
 */

export const EDITORIAL_WORDMARK = 'assembl.';

/**
 * The hero H1, split into typographic "tokens" so the editorial layout can
 * break lines poetically and slot inline concept-demo chips between phrases.
 *
 * Token kinds:
 *   text  — a plain word or phrase
 *   accent — the same, rendered heavier / emphasised
 *   chip  — an inline concept-demo chip (id references CONCEPT_CHIPS below)
 *   break — force a line break at this point
 */
export type HeroToken =
  | { kind: 'text'; value: string }
  | { kind: 'accent'; value: string }
  | { kind: 'chip'; id: 'woolworths' | 'contact' | 'airnz' }
  | { kind: 'break' };

export const EDITORIAL_HERO_TOKENS: HeroToken[] = [
  { kind: 'text', value: 'MAKE' },
  { kind: 'accent', value: 'AI' },
  { kind: 'chip', id: 'woolworths' },
  { kind: 'text', value: 'VISIBLE.' },
  { kind: 'break' },
  { kind: 'text', value: 'NEW ZEALAND’S' },
  { kind: 'text', value: 'AI ADOPTION' },
  { kind: 'chip', id: 'contact' },
  { kind: 'text', value: 'AGENCY BUILDS' },
  { kind: 'break' },
  { kind: 'text', value: 'AGENTS YOU CAN' },
  { kind: 'accent', value: 'SEE,' },
  { kind: 'accent', value: 'HOLD' },
  { kind: 'text', value: 'AND UNDERSTAND.' },
  { kind: 'break' },
  { kind: 'text', value: 'NOTHING SHIPS' },
  { kind: 'chip', id: 'airnz' },
  { kind: 'text', value: 'WITHOUT YOUR' },
  { kind: 'accent', value: 'YES.' },
];

export const EDITORIAL_SUBLINE =
  'AN INDEPENDENT NZ AGENCY · AGENTIC ERA · MADE VISIBLE';

export const EDITORIAL_CTAS = {
  primary: { label: 'enter the gallery', href: '#gallery' },
  secondary: { label: 'read our field notes', href: '/field-notes' },
} as const;

/**
 * Concept installations shown inline in the hero as tiny visual punctuation,
 * and (viewport 2) surfaced as physical objects in the walkable gallery.
 * `href` points at Kate's concept-studio microsites — the enterprise cold
 * outreach targets, not the fictional demo cast. Independent-concept
 * disclaimer must sit near any embed of these.
 */
export const CONCEPT_CHIPS = {
  woolworths: {
    label: 'Woolworths',
    color: '#178841',
    accent: '#FFC72C',
    href: 'https://assembl-concept-studio.katecoveny.chatgpt.site/everyday-rewards',
  },
  contact: {
    label: 'Contact',
    color: '#FFD100',
    accent: '#E4002B',
    href: 'https://assembl-concept-studio.katecoveny.chatgpt.site/contact',
  },
  airnz: {
    label: 'Air NZ',
    color: '#00205B',
    accent: '#F5F5F5',
    href: 'https://assembl-concept-studio.katecoveny.chatgpt.site/air-new-zealand',
  },
} as const;
