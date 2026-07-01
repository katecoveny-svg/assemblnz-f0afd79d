import { parseBrandConfig, type BrandConfig } from '@/lib/brand/brand-config';

export const everydayRewardsConfig: BrandConfig = parseBrandConfig({
  slug: 'everyday-rewards',
  displayName: 'Everyday Rewards',
  logo: {
    src: '/img/customers/everyday-rewards/logo.svg',
    alt: 'Everyday Rewards wordmark',
  },
  colours: {
    bg: '#fff2e8',
    surface: '#ffffff',
    ink: '#231409',
    muted: '#7a5842',
    accent: '#fd6400',
    canary: '#ffb87a',
  },
  fonts: {
    display: 'Manrope',
    body: 'Inter',
    mono: 'JetBrains Mono',
  },
  hero3D: 'everyday-rewards',
  voice: {
    greeting: 'Hey team — points are moving.',
    tone: 'family-conversational',
  },
  crossBrand: {
    position: 'context-panel',
    density: 'medium',
  },
});
