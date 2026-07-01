import { parseBrandConfig, type BrandConfig } from '@/lib/brand/brand-config';

export const aeronautConfig: BrandConfig = parseBrandConfig({
  slug: 'aeronaut',
  displayName: 'Aeronaut',
  logo: {
    src: '/img/customers/aeronaut/logo.svg',
    darkSrc: '/img/customers/aeronaut/logo-dark.svg',
    alt: 'Aeronaut wordmark',
  },
  colours: {
    bg: '#0b1424',
    surface: '#131e33',
    ink: '#e6ecf5',
    muted: '#8494ac',
    accent: '#7bb0ff',
    canary: '#c0cbde',
  },
  fonts: {
    display: 'Space Grotesk',
    body: 'Inter',
    mono: 'JetBrains Mono',
  },
  hero3D: 'aeronaut',
  voice: {
    greeting: 'Vessel status — nominal.',
    tone: 'ops-direct',
  },
  crossBrand: {
    position: 'header-tag',
    density: 'medium',
  },
});
