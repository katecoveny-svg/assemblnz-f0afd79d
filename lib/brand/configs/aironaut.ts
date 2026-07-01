import { parseBrandConfig, type BrandConfig } from '@/lib/brand/brand-config';

/**
 * AIRONAUT — full-service NZ air + sea freight importer/exporter. Kate's dad's
 * actual family business, so the review bar here is Happy Tails-tier: every
 * widget renders draft-only, nothing sends, nothing lodges, and everything is
 * clearly demo until the real assets land.
 *
 * English-Air-Nautical portmanteau. Uppercase AIRONAUT is the wordmark;
 * lowercase `aironaut` is the slug and code identifier.
 *
 * Still awaited from Kate (verbatim from the README):
 *   - website URL
 *   - real client / consignment data
 *   - logo + wordmark files
 *   - physical address + phone + contact
 *   - preferred colours + typography
 *
 * Everything below is a placeholder until those files land.
 */
export const aironautConfig: BrandConfig = parseBrandConfig({
  slug: 'aironaut',
  displayName: 'AIRONAUT',
  logo: {
    // Placeholder path — file may not exist yet. Kate hasn't sent the logo/
    // wordmark files. When they do, drop the SVG at this path and remove this
    // note.
    src: '/img/customers/aironaut/logo.svg',
    darkSrc: '/img/customers/aironaut/logo-dark.svg',
    alt: 'AIRONAUT wordmark',
  },
  // TODO(kate): replace with real Aironaut palette when brand files land.
  // Placeholders: deep ink navy + warm cream card interior + in-flight/at-sea
  // warm orange accent. Professional freight-forwarding tonality, kept
  // deliberately restrained until we see the real colours.
  colours: {
    bg: '#0e1b2a', // deep ink navy
    surface: '#f7f1e1', // warm cream — card interior contrast
    ink: '#0a0d12',
    muted: '#5f6b78',
    accent: '#e67a2c', // in-flight/at-sea warm orange
    canary: '#ffd42a', // assembl crossover — untouched
  },
  fonts: {
    display: 'Space Grotesk',
    body: 'Inter',
    mono: 'JetBrains Mono',
  },
  hero3D: 'aironaut',
  voice: {
    greeting:
      'Consignments, quotes, and clearances — all draft, all yours to review.',
    tone: 'ops-direct',
  },
  crossBrand: {
    // Family pilot, high review bar — assembl stays quiet.
    position: 'footer-only',
    density: 'quiet',
  },
  serviceLines: [
    {
      id: 'freight',
      label: 'Freight Import Export',
      blurb: 'General air + sea freight — the parent service.',
      href: 'freight',
    },
    {
      id: 'exotic-vehicles',
      label: 'Exotic Motor Vehicle Shipping',
      blurb: 'High-value cars in and out of NZ.',
      href: 'exotic-vehicles',
    },
    {
      id: 'boats-yachts',
      label: 'Boat & Yacht Transport',
      blurb: 'Marine transport worldwide.',
      href: 'boats-yachts',
    },
    {
      id: 'wine',
      label: 'Wine Import & Export',
      blurb: 'NZ partner of Global Wine Logistics.',
      href: 'wine',
    },
  ],
});
