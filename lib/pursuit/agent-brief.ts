/**
 * Machine-readable Pursuit brief for agents and answer engines.
 * No secrets, keys, endpoints or tool-health detail.
 */
import { PURSUIT_SITE_ORIGIN } from '@/lib/product-destinations';

export const PURSUIT_AGENT_BRIEF = {
  id: 'assembl-pursuit-public',
  name: 'Pursuit',
  product: 'Pursuit',
  url: 'https://www.assembl.co.nz/pursuit',
  hub: PURSUIT_SITE_ORIGIN,
  summary:
    'Assembl brings New Zealand live intelligence and signals into a demonstrator / client Pursuit.',
  plainEnglish: [
    'Assembl finds NZ opportunities and signals and turns them into a client Pursuit demonstrator.',
    'Radar, live intelligence and API calls power the work behind the scenes.',
    'The public page shows the canvas experience: rearrange agent-suggested parts, then move into a brand or client frame.',
    'The working hub is the external ChatGPT Pursuit workspace — not the public marketing page.',
  ],
  publicSees: [
    'NZ signals and opportunities',
    'Canvas rearrange of an agent-suggested idea',
    'Brand / client demonstrator framing',
    'Link to the Pursuit hub',
  ],
  publicDoesNotSee: [
    'API keys',
    'Endpoint lists',
    'Tool health dashboards',
    'Internal radar plumbing',
  ],
  primaryCta: {
    label: 'Open the Pursuit hub',
    href: PURSUIT_SITE_ORIGIN,
  },
  related: {
    studio: '/creative-studio',
    do: '/do',
    meetingDo: '/do/meetings',
    householdDo: '/do/household',
  },
  notPromoted: ['/pursuit/playground', '/do/maker/partner', '/studio/do-maker'],
  media: {
    heroLoop: '/pursuit/media/pursuit-canvas-loop.mp4',
    heroLoopWebm: '/pursuit/media/pursuit-canvas-loop.webm',
    poster: '/pursuit/media/pursuit-canvas-poster.jpg',
    dropInNote:
      'Replace PREVIEW loop with a muted screen recording of the real Pursuit canvas (rearrange → brand). Keep the same filenames or update PursuitCanvasHero.',
  },
  updated: '2026-09-17',
} as const;
