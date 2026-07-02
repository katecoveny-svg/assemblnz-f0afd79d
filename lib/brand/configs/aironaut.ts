import { parseBrandConfig, type BrandConfig } from '@/lib/brand/brand-config';

/**
 * AIRONAUT — full-service NZ air + sea freight importer/exporter. Kate's dad's
 * actual family business, so the review bar here is Happy Tails-tier: every
 * widget renders draft-only, nothing sends, nothing lodges.
 *
 * Legal entity: Aironaut Customs Brokers Ltd.
 * URL: aironaut.co.nz
 *
 * English-Air-Nautical portmanteau. Uppercase AIRONAUT is the wordmark;
 * lowercase `aironaut` is the slug and code identifier.
 *
 * Brand kit landed 2026-07-01 — palette, typography, logo, pattern, hero
 * photography, taglines and CTA copy are all real values now (no placeholders).
 */
export const aironautConfig: BrandConfig = parseBrandConfig({
  slug: 'aironaut',
  displayName: 'AIRONAUT',
  logo: {
    src: '/brand/aironaut/logo-circular-mark.png',
    alt: 'AIRONAUT circular mark',
  },
  // Real Aironaut palette:
  //   Deep Navy   #0B1F3A — primary surface, logo, headlines
  //   Steel Blue  #6E8FB3 — secondary / subheads / propeller
  //   Burnt Orange#C8622A — accent / CTAs / "REQUEST A QUOTE"
  //   Warm Stone  #D9D4C7 — paper / neutral background / card interiors
  //   Charcoal    #1F1F1F — body text
  //   White       #FFFFFF — reverse / negative
  colours: {
    bg: '#0B1F3A', // Deep Navy — primary surface
    surface: '#D9D4C7', // Warm Stone — paper card interior
    ink: '#1F1F1F', // Charcoal — body
    muted: '#6E8FB3', // Steel Blue — secondary / subhead
    accent: '#C8622A', // Burnt Orange — CTAs / action
    canary: '#FFD42A', // assembl crossover — untouched
  },
  fonts: {
    display: 'Orbitron',
    body: 'Lato',
    mono: 'JetBrains Mono',
  },
  hero3D: 'aironaut',
  voice: {
    // Primary Aironaut tagline — set uppercase Orbitron by the hero.
    greeting: 'GLOBAL TRADE. MADE SIMPLE.',
    tone: 'ops-direct',
  },
  crossBrand: {
    // Family pilot, high review bar — assembl stays quiet.
    position: 'footer-only',
    density: 'quiet',
  },
  patterns: {
    // Signature repeating freight-icon pattern on warm-stone bg. Used inside
    // Warm Stone card interiors only — never on the Deep Navy shell (see
    // OpsShell + README notes).
    primary: '/brand/aironaut/pattern-freight-icons.png',
    secondary: '/brand/aironaut/pattern-freight-icons.png',
  },
  photography: {
    // Primary Freight anchor — chrome propeller on burnt-orange field, with
    // the circular mark etched on the spinner (hero-propeller-orange.png is
    // the unbranded original; keep both).
    anchor: '/brand/aironaut/hero-propeller-orange-branded.png',
    // Gallery order (used by rotating widgets / carousels):
    gallery: [
      '/brand/aironaut/hero-propeller-orange-branded.png',
      '/brand/aironaut/hero-cargo-plane.png',
      '/brand/aironaut/hero-yacht-hull.png',
      '/brand/aironaut/wine-shipment.png',
      '/brand/aironaut/hero-perishable-food.png',
      '/brand/aironaut/packaging-suite.png',
    ],
  },
  taglines: {
    primary: 'GLOBAL TRADE. MADE SIMPLE.',
    social: 'CONNECTING BUSINESSES TO THE WORLD.',
    values: 'PRECISION. COMPLIANCE. TRUST.',
  },
  ctaLabel: 'REQUEST A QUOTE',
  serviceLines: [
    {
      id: 'freight',
      label: 'Freight Import Export',
      blurb: 'General air + sea freight — the parent service.',
      href: 'freight',
      // Landing page uses hero-propeller-orange (via config.photography.anchor)
      // so the freight sub-page uses hero-cargo-plane for depth/variety.
      heroImage: '/brand/aironaut/hero-cargo-plane.png',
    },
    {
      id: 'exotic-vehicles',
      label: 'Exotic Motor Vehicle Shipping',
      blurb: 'High-value cars in and out of NZ.',
      href: 'exotic-vehicles',
      // TODO(kate): a dedicated exotic-vehicles hero would be great — using
      // packaging-suite for now as the closest fit from the current kit.
      heroImage: '/brand/aironaut/packaging-suite.png',
    },
    {
      id: 'boats-yachts',
      label: 'Boat & Yacht Transport',
      blurb: 'Marine transport worldwide.',
      href: 'boats-yachts',
      heroImage: '/brand/aironaut/hero-yacht-hull.png',
    },
    {
      id: 'wine',
      label: 'Wine Import & Export',
      blurb: 'NZ partner of Global Wine Logistics.',
      href: 'wine',
      heroImage: '/brand/aironaut/wine-shipment.png',
    },
  ],
});
