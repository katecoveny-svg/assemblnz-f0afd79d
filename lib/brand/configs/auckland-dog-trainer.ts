import { parseBrandConfig, type BrandConfig } from '@/lib/brand/brand-config';

/**
 * FRED OS — Auckland Dog Trainer / Learn To Talk Dog (concept pilot).
 *
 * NOT a live partnership. Pitch surface for Fred Esquivel Paz: turns his
 * training method into intake, session notes → homework, programme trackers,
 * course builder, remote support triage, and trainer hiring/onboarding.
 *
 * Palette from the brief: navy + pale pink, cleaned up for an ops console.
 * Hero feature: Session Notes → Client Plan engine.
 */
export const aucklandDogTrainerConfig: BrandConfig = parseBrandConfig({
  slug: 'auckland-dog-trainer',
  displayName: 'Fred OS',
  logo: {
    // Placeholder monogram — OpsShell falls back to the chip when src is not
    // an image path (same pattern as Happy Tails pending mark).
    src: 'pending',
    alt: 'Fred OS — Learn To Talk Dog',
  },
  colours: {
    // Soft blush wash — pale pink brand signal without flooding the shell.
    bg: '#F7EEF1',
    // Clean paper cards over the blush.
    surface: '#FFFCFB',
    // Deep navy ink — Fred's primary brand colour.
    ink: '#1B2A4A',
    // Soft navy-grey for supporting copy.
    muted: '#6B7389',
    // Pale pink accent — CTAs and live status only.
    accent: '#D4A5B0',
    // Soft gold hairline for assembl crossover moments.
    canary: '#C4A574',
  },
  fonts: {
    display: 'Playfair Display',
    body: 'Lato',
    mono: 'JetBrains Mono',
  },
  // Closest existing dog-world hero scene; concept demos reuse known scenes.
  hero3D: 'happy-tails',
  voice: {
    greeting: 'Learn to talk dog — then scale the method without losing the standard.',
    tone: 'warm-personal',
  },
  crossBrand: { position: 'footer-only', density: 'quiet' },
  patterns: {
    primary: '/brand/auckland-dog-trainer/pattern-leads-and-paws.svg',
  },
  taglines: {
    primary: 'Scale Fred’s method. Keep Fred’s standards.',
    social: 'Session notes → homework, CRM, course match, trainer handover.',
    values: 'Draft-only. Nothing sends to a client without Fred’s yes.',
  },
  ctaLabel: 'TURN NOTES INTO A PLAN',
  nav: [
    { label: 'Leads', href: '?tab=leads' },
    { label: 'Dogs', href: '?tab=dogs' },
    { label: 'Programmes', href: '?tab=programmes' },
    { label: 'Notes engine', href: '?tab=notes' },
    { label: 'Course', href: '?tab=course' },
    { label: 'Support', href: '?tab=support' },
    { label: 'Hiring', href: '?tab=hiring' },
  ],
});
