import { parseBrandConfig, type BrandConfig } from '@/lib/brand/brand-config';

/**
 * Contact Energy × Assembling — Switch pitch concept.
 * Pattern wallpaper + brand tokens so the pilot shares OS chrome with peers.
 */
export const contactEnergyConfig: BrandConfig = parseBrandConfig({
  slug: 'contact-energy',
  displayName: 'Contact Energy',
  logo: {
    src: '/brand/contact-energy/logo-official.svg',
    alt: 'Contact Energy wordmark',
    wordmark: true,
  },
  colours: {
    bg: '#F7F4F0',
    surface: '#FFFFFF',
    ink: '#1A1A1A',
    muted: '#6B6560',
    accent: '#C8102E',
    canary: '#BFA37A',
  },
  fonts: {
    display: 'Inter Tight',
    body: 'Inter',
    mono: 'JetBrains Mono',
  },
  // Closest existing scene; Contact ops uses its own CSS hero today.
  hero3D: 'everyday-rewards',
  voice: {
    greeting: 'Switch is listening — ask about usage, credits, or a plan change.',
    tone: 'crisp-corporate',
  },
  crossBrand: {
    position: 'footer-only',
    density: 'quiet',
  },
  patterns: {
    primary: '/brand/contact-energy/pattern-switch.svg',
  },
  taglines: {
    primary: 'Loading moments become bill credits.',
    social: 'Earn while you wait. Switch when it pays.',
    values: 'Draft recommendations only — you approve every switch.',
  },
});
