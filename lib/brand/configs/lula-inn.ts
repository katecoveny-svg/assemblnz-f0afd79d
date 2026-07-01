import { parseBrandConfig, type BrandConfig } from '@/lib/brand/brand-config';

export const lulaInnConfig: BrandConfig = parseBrandConfig({
  slug: 'lula-inn',
  displayName: 'Lula Inn',
  logo: {
    src: 'pending', // logo mark pending — non-image value → OpsShell renders the monogram chip (schema requires non-empty)
    alt: 'Lula Inn wordmark',
  },
  colours: {
    bg: '#2b0d13',
    surface: '#3a1420',
    ink: '#f5e7d1',
    muted: '#b89a72',
    accent: '#7a1d2a',
    canary: '#d4af57',
  },
  fonts: {
    display: 'Cormorant Garamond',
    body: 'Inter',
    mono: 'JetBrains Mono',
  },
  hero3D: 'lula-inn',
  voice: {
    greeting: 'Evening — the room is filling up.',
    tone: 'warm-personal',
  },
  crossBrand: {
    position: 'footer-only',
    density: 'quiet',
  },
});
