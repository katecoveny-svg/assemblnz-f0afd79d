import { parseBrandConfig, type BrandConfig } from '@/lib/brand/brand-config';

export const happyTailsConfig: BrandConfig = parseBrandConfig({
  slug: 'happy-tails',
  displayName: 'Happy Tails',
  logo: {
    // NOTE: logo mark still pending — this SVG is a placeholder for now.
    src: 'pending', // logo mark pending — non-image value → OpsShell renders the monogram chip (schema requires non-empty)
    alt: 'Happy Tails wordmark',
  },
  mascot: {
    src: '/brand/happy-tails/franklin-black-longhair-rear.png',
    alt: 'Franklin, the Happy Tails brand anchor',
  },
  // Pearl canon (2026-07-17): white ground, ink + teal + gold — the homepage
  // palette carried onto the pilot surfaces. Dog photography and line-art
  // patterns stay exactly as they are.
  colours: {
    // Pearl-white ground.
    bg: '#ffffff',
    // Surface a breath off white so cards still read as layered.
    surface: '#fbfcfb',
    // Pearl ink.
    ink: '#313c42',
    // Muted body tone.
    muted: '#68766f',
    // Teal accent — CTA + status dot only.
    accent: '#3f7373',
    // Gold hairline — used sparingly at assembl crossover moments only.
    canary: '#b8964f',
  },
  fonts: {
    display: 'Cormorant Garamond',
    body: 'Inter',
    mono: 'JetBrains Mono',
  },
  hero3D: 'happy-tails',
  voice: {
    greeting: 'Morning, love — Franklin says woof.',
    tone: 'warm-personal',
  },
  crossBrand: {
    position: 'footer-only',
    density: 'quiet',
  },
  patterns: {
    // Dashboard shell watermark + hero background.
    primary: '/brand/happy-tails/pattern-tails-and-paws.png',
    // Empty states + 404.
    secondary: '/brand/happy-tails/pattern-dogs-mixed.png',
  },
  photography: {
    // Franklin — THE brand anchor. Editorial studio portrait, back-of-dog.
    anchor: '/brand/happy-tails/franklin-black-longhair-rear.png',
    // Rotated as visual placeholders in widgets (per-dog CRM avatars, etc).
    gallery: [
      '/brand/happy-tails/dog-tan-play-stance.png',
      '/brand/happy-tails/dog-dalmatian-leap.png',
      '/brand/happy-tails/dog-dalmatian-standing.png',
      '/brand/happy-tails/dog-corgi-tail.png',
      '/brand/happy-tails/dog-husky-fluffy-tail.png',
      '/brand/happy-tails/dog-terrier-tan-tail.png',
      '/brand/happy-tails/dog-poodle-curls.png',
    ],
  },
});
