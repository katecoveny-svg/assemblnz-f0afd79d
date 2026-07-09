import { parseBrandConfig, type BrandConfig } from '@/lib/brand/brand-config';

/**
 * Auckland Dog Trainer — Learn To Talk Dog (concept pilot).
 *
 * Product surface for Fred Esquivel Paz's training method: intake, session
 * notes → homework, programme trackers, course builder, remote support, hiring.
 * Display name is the business; Fred is the trainer behind it.
 *
 * Palette: navy + pale pink. Imagery is method-first (leash / hand-signal /
 * training field) — never Happy Tails daycare photography.
 */
export const aucklandDogTrainerConfig: BrandConfig = parseBrandConfig({
  slug: 'auckland-dog-trainer',
  displayName: 'Auckland Dog Trainer',
  logo: {
    src: 'pending',
    alt: 'Auckland Dog Trainer — Learn To Talk Dog',
  },
  colours: {
    bg: '#F7EEF1',
    surface: '#FFFCFB',
    ink: '#1B2A4A',
    muted: '#6B7389',
    accent: '#D4A5B0',
    canary: '#C4A574',
  },
  fonts: {
    display: 'Playfair Display',
    body: 'Lato',
    mono: 'JetBrains Mono',
  },
  hero3D: 'auckland-dog-trainer',
  voice: {
    greeting: 'Learn to talk dog — then scale the method without losing the standard.',
    tone: 'warm-personal',
  },
  crossBrand: { position: 'footer-only', density: 'quiet' },
  patterns: {
    primary: '/brand/auckland-dog-trainer/pattern-training-field.svg',
    secondary: '/brand/auckland-dog-trainer/pattern-leads-and-paws.svg',
  },
  taglines: {
    primary: 'Learn To Talk Dog — Fred’s method, operating at scale.',
    social: 'Session clips → educational reels, carousels, and homework posts.',
    values: 'Draft-only. Nothing sends to a client without Fred’s yes.',
  },
  ctaLabel: 'TURN NOTES INTO A PLAN',
  nav: [
    { label: 'Leads', href: '?tab=leads' },
    { label: 'Dogs', href: '?tab=dogs' },
    { label: 'Programmes', href: '?tab=programmes' },
    { label: 'Notes engine', href: '?tab=notes' },
    { label: 'Course', href: '?tab=course' },
    { label: 'Social', href: '?tab=social' },
    { label: 'Support', href: '?tab=support' },
    { label: 'Hiring', href: '?tab=hiring' },
  ],
});
