import { parseBrandConfig, type BrandConfig } from '@/lib/brand/brand-config';

/**
 * FAMILY OS — the whānau operating system (concept pilot).
 *
 * NOT a real customer. A hub-and-spoke family assistant built on the live
 * household agents (Pānui Parser, School Notice, Fridge-to-List, Tōro): forward
 * a school newsletter and it becomes the family's week — events, tasks,
 * pickups, shopping and an approval queue. Draft-and-suggest only: the agent
 * proposes, the family approves, the app executes (deep-link handoffs).
 *
 * Warm cream + champagne gold, coral accent, in the luminous glass direction.
 */
export const familyConfig: BrandConfig = parseBrandConfig({
  slug: 'family',
  displayName: 'Family OS',
  logo: {
    src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="%23FBF6EE"/><circle cx="14" cy="16" r="5" fill="%23E08A6B"/><circle cx="26" cy="16" r="5" fill="%23BFA37A"/><path d="M6 33c0-6 5-9 8-9s3 2 6 2 3-2 6-2 8 3 8 9" fill="none" stroke="%232A2620" stroke-width="2"/></svg>',
    alt: 'Family OS — two heads over a hearth',
  },
  // Family OS palette — warm home + luminous glass:
  //   Warm cream   #FBF6EE — light shell
  //   White glass  #FFFFFF — card interiors
  //   Warm ink     #2A2620 — body
  //   Warm grey    #8A8272 — muted
  //   Coral        #E08A6B — accent (approve / primary)
  //   Champagne    #BFA37A — dominant accent (hairlines, gold)
  //   (component tones: sage #7A8B6F for "done", soft blue #6E93A6 for info)
  colours: {
    bg: '#FBF6EE',
    surface: '#FFFFFF',
    ink: '#2A2620',
    muted: '#8A8272',
    accent: '#E08A6B',
    canary: '#BFA37A',
  },
  fonts: {
    display: 'Playfair Display',
    body: 'Lato',
    mono: 'JetBrains Mono',
  },
  hero3D: 'aironaut',
  voice: {
    greeting: 'Forward the newsletter. I’ll sort the week.',
    tone: 'warm-personal',
  },
  crossBrand: { position: 'footer-only', density: 'quiet' },
  taglines: {
    primary: 'Life admin, handled.',
    social: 'Forward the newsletter. Get the week.',
    values: 'I draft. You approve. Nothing happens without you.',
  },
  ctaLabel: 'PARSE THE NEWSLETTER',
  nav: [
    { label: 'This week', href: 'week' },
    { label: 'Pickups', href: 'pickups' },
    { label: 'Shopping', href: 'shopping' },
    { label: 'Approvals', href: 'approvals' },
    { label: 'Family memory', href: 'memory' },
    { label: 'Care circle', href: 'care-circle' },
  ],
});
