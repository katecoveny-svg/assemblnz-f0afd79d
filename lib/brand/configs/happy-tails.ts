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
  colours: {
    // Warm-white paper base — never true white behind photography.
    bg: '#FBF7F1',
    // Surface reads a touch warmer than bg so cards feel like layered paper.
    surface: '#F5EFE4',
    // Near-black ink, matches the line-art patterns exactly.
    ink: '#1A1918',
    // Soft ink for muted supporting copy (fits editorial magazine tone).
    muted: '#6B655C',
    // Warm brown/tan pulled from the studio photography — reads editorial on warm-white.
    accent: '#8B5A2B',
    // Canary hairline — used sparingly at assembl crossover moments only.
    canary: '#FFD42A',
  },
  fonts: {
    display: 'Fraunces',
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
