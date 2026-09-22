/** Assembl-only creative context. Client brands keep their own briefs and colours.
 * Sources: docs/assembl-brand-system.md, DESIGN.md, docs/assembl-copy-standard.md.
 */
export const ASSEMBL_CREATIVE_PROFILE = 'assembl-2026-09' as const;

export const ASSEMBL_CREATIVE_BRAND = {
  name: 'assembl',
  palette: { plum: '#240B21', muted: '#654A4E', rose: '#916A70', chalk: '#F5F1F2', paper: '#FFFDFB' },
  headline: 'assembl the work.',
  supporting: 'find it. DO it. show it.',
  positioning: 'assembl is a platform that turns live business signals into governed agentic work.',
} as const;

export const ASSEMBL_CREATIVE_ASSETS = [
  {
    id: 'atelier', label: 'the assembl atelier', note: 'homepage world · concept image',
    src: '/do/world/atelier-poster.png',
    promptCue: 'The same tactile, architectural atelier as the Assembl homepage: sculptural workspaces, rounded forms, quiet plum and rose light, useful objects gathering into a coherent whole',
  },
  {
    id: 'studio', label: 'the studio world', note: 'Studio world · concept image',
    src: '/do/office/office-poster.webp',
    promptCue: 'An editorial architectural studio, carefully composed physical objects, soft natural light and restrained plum/rose reflections; a proposed workspace, never evidence of live activity',
  },
] as const;

export const ASSEMBL_CREATIVE_STARTERS = [
  { label: 'the assembl world', brief: 'An architectural atelier where separate useful objects gather into one coherent workspace. Sculptural forms, rounded edges, paper surfaces and gentle plum and dusty-rose light. Leave quiet space for a headline.' },
  { label: 'find it', brief: 'An editorial still life showing separate source sheets gathering into one opportunity brief. Tactile paper, precise layers, one clear focal point and space for a headline. No readable text inside the image.' },
  { label: 'DO it', brief: 'A sculptural worktable where context, tools and a proposed next step assemble into one reviewable arrangement. A clear pause before action. Physical materials and soft directional light, with no fake dashboard or metrics.' },
  { label: 'show it', brief: 'A small architectural model emerging from a prepared brief: an idea becomes a world someone could step inside. Paper, plum and dusty rose, physical depth and editorial lighting.' },
] as const;

/** Applied on the server too, so the generation provider receives current canon. */
export function assemblImageBrief(brief: string, aspect = '4:5', referenceCue?: string): string {
  return [
    'Create one original Assembl concept image from the following subject brief.',
    `Subject: ${brief.trim()}`,
    '',
    'ASSEMBL ART DIRECTION',
    ASSEMBL_CREATIVE_BRAND.positioning,
    'Match the current Assembl homepage atelier: things gather, organise and move with purpose until a useful whole is visible.',
    'Palette: deep plum #240B21, muted plum #654A4E, dusty rose #916A70, chalk #F5F1F2 and paper #FFFDFB.',
    'Use editorial or sculptural product photography, physical depth, rounded forms, soft plum/rose gradient light, restrained glow and generous negative space. Make assembly the subject rather than an ornamental effect.',
    'Aotearoa natural light is welcome. Keep the camera and material world coherent. These are concept images, not client endorsements or operational proof.',
    'Do not use gold, brass, champagne, green master palettes, grape purple, neon effects, robots, chatbots, generic AI orbs or fake interfaces. Do not invent claims, metrics, logos or customer results.',
    'No embedded words or logos. The design tool adds the lowercase assembl wordmark and editable copy in Instrument Sans; IBM Plex Mono is reserved for proof metadata.',
    `Compose for ${aspect}; leave clear headline space and keep important detail away from crop edges.`,
    referenceCue ? `Reference composition: ${referenceCue}. Follow the palette above even when the reference has other colours.` : '',
  ].filter(Boolean).join('\n');
}
