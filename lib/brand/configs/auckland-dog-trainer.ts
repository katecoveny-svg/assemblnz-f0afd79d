import { parseBrandConfig, type BrandConfig } from '@/lib/brand/brand-config';

/**
 * Harbourside Dog Training — calm, method-first (concept pilot).
 *
 * Product surface for Sam's training method: intake, session
 * notes → homework, programme trackers, course builder, remote support, hiring.
 * Display name is the business; Sam is the trainer behind it.
 *
 * Palette: navy + pale pink. Imagery is method-first editorial photography +
 * HT-style line-art patterns — never Happy Tails daycare pack photos.
 */
export const aucklandDogTrainerConfig: BrandConfig = parseBrandConfig({
  slug: 'auckland-dog-trainer',
  displayName: 'Harbourside Dog Training',
  logo: {
    // Fictional cast (locked 2026-07-10): no real-world lockup may surface.
    // A non-image src renders the monogram chip + display name in OpsShell.
    src: 'monogram',
    alt: 'Harbourside Dog Training',
    wordmark: false,
  },
  siteUrl: 'https://www.assembl.co.nz/living-site/dog-training',
  mascot: {
    src: '/brand/auckland-dog-trainer/heroes/studio-paw.webp',
    alt: 'Dog giving paw — calm, method-first',
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
  // Scene id kept for Brand3DCanvas registry; OsWowStage prefers photography
  // when present (editorial stills / future SAM 3D exports).
  hero3D: 'auckland-dog-trainer',
  voice: {
    greeting: 'Calm, method-first training — then scale the method without losing the standard.',
    tone: 'warm-personal',
  },
  crossBrand: { position: 'footer-only', density: 'quiet' },
  patterns: {
    // Hand-drawn training doodles (sit, paw, hand signal, leads, whistle,
    // clicker) — navy ink on transparent, HT brand-board style.
    primary: '/brand/auckland-dog-trainer/pattern-training-doodles.png',
    secondary: '/brand/auckland-dog-trainer/pattern-leads-and-paws.svg',
  },
  photography: {
    // Studio editorial portraits on a blush-pink seamless — method-first,
    // never Happy Tails daycare pack photos.
    anchor: '/brand/auckland-dog-trainer/heroes/studio-sit-profile.webp',
    gallery: [
      '/brand/auckland-dog-trainer/heroes/studio-paw.webp',
      '/brand/auckland-dog-trainer/heroes/studio-sit-profile.webp',
    ],
  },
  taglines: {
    primary: 'calm, method-first — Sam’s method, operating at scale.',
    social: 'Session clips → educational reels, carousels, and homework posts.',
    values: 'Draft-only. Nothing sends to a client without Sam’s yes.',
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
