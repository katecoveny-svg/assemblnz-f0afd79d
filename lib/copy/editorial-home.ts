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
  // `emph` = the champagne-accented word(s). Used for "AI", "VISIBLE AGENTS",
  // "AGENTIC ERA" — the two or three phrases the poster leans on.
  | { kind: 'emph'; value: string }
  | { kind: 'vig'; id: 'woolworths' | 'contact' | 'airnz' }
  | { kind: 'break' };

// Copy from Kate's 2026-07-21 brief: "MAKE AI VISIBLE. NEW ZEALAND'S AGENTS
// YOU CAN SEE HOLD AND UNDERSTAND that understand your business too." — with
// her instruction to "rework for punch, keep spirit". Broken poetically for
// the poster; inline vignettes answer the "make AI visible" claim inside the
// sentence. No Oxford commas (house rule). Swap only on Kate's word.
export const EDITORIAL_HERO_TOKENS: HeroToken[] = [
  { kind: 'text', value: 'MAKE' },
  { kind: 'emph', value: 'AI' },
  { kind: 'vig', id: 'woolworths' },
  { kind: 'text', value: 'VISIBLE.' },
  { kind: 'break' },
  { kind: 'text', value: 'NEW ZEALAND’S AGENTS' },
  { kind: 'break' },
  { kind: 'text', value: 'YOU CAN SEE HOLD' },
  { kind: 'vig', id: 'contact' },
  { kind: 'text', value: 'AND UNDERSTAND —' },
  { kind: 'break' },
  { kind: 'text', value: 'THAT UNDERSTAND YOUR' },
  { kind: 'break' },
  { kind: 'text', value: 'BUSINESS' },
  { kind: 'vig', id: 'airnz' },
  { kind: 'text', value: 'TOO.' },
];

/**
 * Viewport 3 — the manifesto. Same poster face and inline-vignette trick as
 * the hero. Copy from Kate's 2026-07-21 brief, verbatim spirit:
 * "AI IS NOT COMPLEX. WE HAVE MADE IT SO. VISIBLE AGENTS ARE THE ONLY AGENTS
 * PEOPLE ACTUALLY ADOPT. WELCOME TO THE AGENTIC ERA WITH YOUR OWN HANDS ON
 * THE WHEEL."
 */
export const EDITORIAL_MANIFESTO_EYEBROW = 'THE MANIFESTO';

export const EDITORIAL_MANIFESTO_TOKENS: HeroToken[] = [
  { kind: 'text', value: 'AI IS NOT COMPLEX.' },
  { kind: 'break' },
  { kind: 'text', value: 'WE HAVE' },
  { kind: 'vig', id: 'woolworths' },
  { kind: 'text', value: 'MADE IT SO.' },
  { kind: 'break' },
  { kind: 'emph', value: 'VISIBLE AGENTS' },
  { kind: 'text', value: 'ARE THE ONLY' },
  { kind: 'break' },
  { kind: 'text', value: 'AGENTS PEOPLE' },
  { kind: 'vig', id: 'contact' },
  { kind: 'text', value: 'ACTUALLY ADOPT.' },
  { kind: 'break' },
  { kind: 'text', value: 'WELCOME TO THE' },
  { kind: 'emph', value: 'AGENTIC ERA' },
  { kind: 'break' },
  { kind: 'text', value: 'WITH YOUR OWN HANDS' },
  { kind: 'vig', id: 'airnz' },
  { kind: 'text', value: 'ON THE WHEEL.' },
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

/**
 * Editorial footer — quiet. Reply address is the canonical assembl inbox.
 * Links are lowercase, hyphenated, Space Mono. Year stamped by the component
 * so it never drifts (the build passes it in — Date.now() is unavailable in
 * some render contexts we target).
 */
export const EDITORIAL_FOOTER = {
  contactLabel: 'Say kia ora',
  contactEmail: 'assembl@assembl.co.nz',
  links: [
    { label: 'field-notes', href: '/field-notes' },
    { label: 'concept-studio', href: 'https://assembl-concept-studio.katecoveny.chatgpt.site' },
    { label: 'about', href: '/about' },
    { label: 'pilots', href: '/pilots' },
  ],
  signoff: 'assembl.',
  // Kate Hudson is the founder; the studio ships from Aotearoa.
  place: 'Made visible in Aotearoa',
} as const;
