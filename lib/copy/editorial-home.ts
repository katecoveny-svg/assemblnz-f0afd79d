/**
 * Editorial gallery homepage — copy source.
 *
 * Copy in this file was written directly by Kate on 2026-07-20 as part of the
 * `homepage/editorial-gallery` rebuild brief. Kate's rule for this file:
 * use the words she gave, LITERALLY. No added commas, no italic accents,
 * no paraphrase. Line breaks are the only editorial layering allowed.
 */

export const EDITORIAL_WORDMARK = 'assembl.';

/**
 * The hero H1, split into typographic "tokens" so the editorial layout can
 * break lines poetically and slot inline 3D vignettes (chrome sphere, glass
 * block, koru) between phrases the way the designbyshiv reference slots
 * photos between words.
 *
 * Token kinds:
 *   text  — Kate's words, rendered verbatim in the poster face
 *   vig   — an inline 3D vignette (id references CONCEPT_VIGNETTES below)
 *   break — force a line break at this point
 */
export type HeroToken =
  | { kind: 'text'; value: string }
  | { kind: 'vig'; id: 'woolworths' | 'contact' | 'airnz' }
  | { kind: 'break' };

// Kate's message 2026-07-20: "Please don't say New Zealand's ai adoption
// agency!" — so that phrase is removed. Waiting for Kate to hand back the
// replacement middle line; using "WE BUILD" as a stand-in so the hero still
// reads. Do not tighten this — swap on Kate's word.
export const EDITORIAL_HERO_TOKENS: HeroToken[] = [
  { kind: 'text', value: 'MAKE AI' },
  { kind: 'vig', id: 'woolworths' },
  { kind: 'text', value: 'VISIBLE.' },
  { kind: 'break' },
  { kind: 'text', value: 'WE BUILD' },
  { kind: 'vig', id: 'contact' },
  { kind: 'text', value: 'AGENTS YOU CAN' },
  { kind: 'break' },
  { kind: 'text', value: 'SEE HOLD AND' },
  { kind: 'text', value: 'UNDERSTAND.' },
  { kind: 'break' },
  { kind: 'text', value: 'NOTHING SHIPS' },
  { kind: 'vig', id: 'airnz' },
  { kind: 'text', value: 'WITHOUT YOUR YES.' },
];

export const EDITORIAL_SUBLINE =
  'AN INDEPENDENT NZ AGENCY · AGENTIC ERA · MADE VISIBLE';

export const EDITORIAL_CTAS = {
  primary: { label: 'enter the gallery', href: '#gallery' },
  secondary: { label: 'read our field notes', href: '/field-notes' },
} as const;

/**
 * The three concept installations — surfaced as tiny inline 3D vignettes in
 * the hero H1, then rendered as physical sculptures on plinths inside the
 * walkable gallery (viewport 2). `href` points at Kate's concept-studio
 * microsites — the enterprise cold-outreach targets, not the fictional
 * demo cast. Independent-concept disclaimer must sit near any embed.
 *
 * `shape` picks the physical form the vignette + installation take:
 *   sphere → chrome/glass sphere (Woolworths / Everyday Rewards)
 *   block  → translucent glass block, warm-lit (Contact Energy)
 *   torus  → chrome torus, iridescent (Air New Zealand koru)
 */
export const CONCEPT_VIGNETTES = {
  woolworths: {
    label: 'Woolworths',
    shape: 'sphere' as const,
    href: 'https://assembl-concept-studio.katecoveny.chatgpt.site/everyday-rewards',
  },
  contact: {
    label: 'Contact',
    shape: 'block' as const,
    href: 'https://assembl-concept-studio.katecoveny.chatgpt.site/contact',
  },
  airnz: {
    label: 'Air NZ',
    shape: 'torus' as const,
    href: 'https://assembl-concept-studio.katecoveny.chatgpt.site/air-new-zealand',
  },
} as const;
