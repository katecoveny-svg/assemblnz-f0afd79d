import { parseBrandConfig, type BrandConfig } from '@/lib/brand/brand-config';

export const aucklandZooConfig: BrandConfig = parseBrandConfig({
  slug: 'auckland-zoo',
  displayName: 'Auckland Zoo',
  logo: {
    src: '/img/customers/auckland-zoo/logo.svg',
    alt: 'Auckland Zoo wordmark',
  },
  colours: {
    bg: '#f6efe1',
    surface: '#fbf6ea',
    ink: '#2b2416',
    muted: '#7a6a4e',
    accent: '#4a6b3a',
    canary: '#c7a24a',
  },
  fonts: {
    display: 'Playfair Display',
    body: 'Inter',
    mono: 'JetBrains Mono',
  },
  hero3D: 'auckland-zoo',
  voice: {
    greeting: 'Kia ora, kaitiaki — the manu are waking.',
    tone: 'warm-personal',
  },
  crossBrand: {
    position: 'footer-only',
    density: 'quiet',
  },
});
