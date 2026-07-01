import { parseBrandConfig, type BrandConfig } from '@/lib/brand/brand-config';

export const airNzConfig: BrandConfig = parseBrandConfig({
  slug: 'air-nz',
  displayName: 'Air New Zealand',
  logo: {
    src: 'pending', // logo mark pending — non-image value → OpsShell renders the monogram chip (schema requires non-empty)
    darkSrc: '/img/customers/air-nz/logo-dark.svg',
    alt: 'Air New Zealand koru',
  },
  colours: {
    bg: '#0a2a33',
    surface: '#0f3944',
    ink: '#f2f7f8',
    muted: '#8fb2b9',
    accent: '#00a4b7',
    canary: '#c9d6d8',
  },
  fonts: {
    // Söhne unavailable — brief specifies Inter Tight + Fraunces Italic 900 fallback.
    display: 'Inter Tight',
    body: 'Fraunces',
    mono: 'JetBrains Mono',
  },
  hero3D: 'air-nz',
  voice: {
    greeting: 'Kia ora — here is today at a glance.',
    tone: 'crisp-corporate',
  },
  crossBrand: {
    position: 'footer-only',
    density: 'quiet',
  },
});
