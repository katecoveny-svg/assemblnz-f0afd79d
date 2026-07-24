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
 *   vig   — an inline 3D agent part (id references AGENT_PARTS below)
 *   break — force a line break at this point
 */
export type HeroToken =
  | { kind: 'text'; value: string }
  // `emph` = the champagne-accented word(s). Used for "AI", "VISIBLE AGENTS",
  // "AGENTIC ERA" — the two or three phrases the poster leans on.
  | { kind: 'emph'; value: string }
  // `vig` = an inline live 3D object — one of the six agent parts.
  | { kind: 'vig'; id: PartId }
  | { kind: 'break' };

// Copy from Kate's 2026-07-21 brief: "MAKE AI VISIBLE. NEW ZEALAND'S AGENTS
// YOU CAN SEE HOLD AND UNDERSTAND that understand your business too." — with
// her instruction to "rework for punch, keep spirit". Broken poetically for
// the poster; inline vignettes are the actual agent PARTS (chrome objects),
// answering the "make AI visible" claim inside the sentence. No Oxford commas
// (house rule). Swap only on Kate's word.
export const EDITORIAL_HERO_TOKENS: HeroToken[] = [
  { kind: 'text', value: 'MAKE' },
  { kind: 'emph', value: 'AI' },
  { kind: 'vig', id: 'intelligence' },
  { kind: 'text', value: 'VISIBLE.' },
  { kind: 'break' },
  { kind: 'text', value: 'NEW ZEALAND’S AGENTS' },
  { kind: 'break' },
  { kind: 'text', value: 'YOU CAN SEE HOLD' },
  { kind: 'vig', id: 'memory' },
  { kind: 'text', value: 'AND UNDERSTAND —' },
  { kind: 'break' },
  { kind: 'text', value: 'THAT UNDERSTAND YOUR' },
  { kind: 'break' },
  { kind: 'text', value: 'BUSINESS' },
  { kind: 'vig', id: 'voice' },
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
  { kind: 'vig', id: 'knowledge' },
  { kind: 'text', value: 'MADE IT SO.' },
  { kind: 'break' },
  { kind: 'emph', value: 'VISIBLE AGENTS' },
  { kind: 'text', value: 'ARE THE ONLY' },
  { kind: 'break' },
  { kind: 'text', value: 'AGENTS PEOPLE' },
  { kind: 'vig', id: 'abilities' },
  { kind: 'text', value: 'ACTUALLY ADOPT.' },
  { kind: 'break' },
  { kind: 'text', value: 'WELCOME TO THE' },
  { kind: 'emph', value: 'AGENTIC ERA' },
  { kind: 'break' },
  { kind: 'text', value: 'WITH YOUR OWN HANDS' },
  { kind: 'vig', id: 'boundaries' },
  { kind: 'text', value: 'ON THE WHEEL.' },
];

export const EDITORIAL_SUBLINE =
  'AN INDEPENDENT NZ AGENCY · AGENTIC ERA · MADE VISIBLE';

export const EDITORIAL_CTAS = {
  primary: { label: 'enter the gallery', href: '#gallery' },
  secondary: { label: 'read our field notes', href: '/field-notes' },
} as const;

/**
 * The six parts of an assembl agent — the same objects the agent builder is
 * made of, surfaced two ways: as tiny live 3D objects wedged between words in
 * the posters, and as full sculptures on plinths in the walkable gallery.
 *
 * This is a HOMEPAGE, not the named concept demos — so the objects are the
 * product's own vocabulary (Intelligence, Memory, Knowledge, Abilities,
 * Voice, Boundaries), each with the physical form and material the builder
 * uses. Intelligence is the obsidian knot — deliberately NOT chrome; it's the
 * one object made of a different substance. The other five are one chrome
 * family in distinct tints, so they read as a set.
 *
 * `shape`    → the geometry the object takes
 * `material` → obsidian | chrome | brushed (drives the PBR in the 3D code)
 * `tint`     → base colour for that material
 * `helper`   → the builder's own one-line description of the part
 */
export type PartShape = 'knot' | 'cubes' | 'octahedron' | 'capsule' | 'sphere' | 'ring';
export type PartMaterial = 'obsidian' | 'chrome' | 'brushed';

export const AGENT_PARTS = {
  intelligence: {
    label: 'Intelligence',
    shape: 'knot' as const,
    material: 'obsidian' as PartMaterial,
    tint: '#0B0B0D',
    helper: 'The brain. Picks its words.',
  },
  memory: {
    label: 'Memory',
    shape: 'cubes' as const,
    material: 'chrome' as PartMaterial,
    tint: '#C4D2DB',
    helper: 'What it remembers between chats.',
  },
  knowledge: {
    label: 'Knowledge',
    shape: 'octahedron' as const,
    material: 'chrome' as PartMaterial,
    tint: '#D3CCC0',
    helper: 'Where it looks things up.',
  },
  abilities: {
    label: 'Abilities',
    shape: 'capsule' as const,
    material: 'chrome' as PartMaterial,
    tint: '#E6EAED',
    helper: 'What it can go and do.',
  },
  voice: {
    label: 'Voice',
    shape: 'sphere' as const,
    material: 'chrome' as PartMaterial,
    tint: '#AEB6BC',
    helper: 'How it speaks and what it cares about.',
  },
  boundaries: {
    label: 'Boundaries',
    shape: 'ring' as const,
    material: 'brushed' as PartMaterial,
    tint: '#C9CCD0',
    helper: 'What it will never do.',
  },
} as const;

export type PartId = keyof typeof AGENT_PARTS;

/** Order the parts stand in the gallery, left to right along the arc. */
export const GALLERY_PART_ORDER: PartId[] = [
  'memory',
  'knowledge',
  'intelligence',
  'voice',
  'abilities',
  'boundaries',
];

/**
 * The suspended centrepiece — the assembled agent itself, floating above the
 * six parts it is made from. Label kept to the product vocabulary.
 */
export const GALLERY_AGENT = {
  label: 'The assembl agent',
  helper: 'Every part below, assembled.',
} as const;

export const GALLERY_CAPTION = {
  left: 'The gallery · the parts of an assembl agent',
  right: 'Drag to look · every object is a part you can place',
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
