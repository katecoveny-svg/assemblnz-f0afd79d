import { parseBrandConfig, type BrandConfig } from '@/lib/brand/brand-config';

export const happyTailsConfig: BrandConfig = parseBrandConfig({
  slug: 'happy-tails',
  displayName: 'Happy Tails',
  logo: {
    src: '/img/customers/happy-tails/logo.svg',
    alt: 'Happy Tails wordmark',
  },
  mascot: {
    src: '/img/customers/happy-tails/mascot-franklin.svg',
    alt: 'Franklin the dachshund',
  },
  colours: {
    bg: '#fff8e6',
    surface: '#fffdf2',
    ink: '#3b2a12',
    muted: '#8a7a58',
    accent: '#d99a1b',
    canary: '#ffd447',
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
});
