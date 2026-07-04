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
    // THE official mark (Kate's 2026-07-04 upload) — navy globe, steel-blue
    // propeller, AIRO/NAUT curved lettering. Every Aironaut route uses this;
    // logo-circular-mark.png stays in the folder as fallback only.
    src: '/brand/aironaut/logo-mark-official.png',
    alt: 'AIRONAUT propeller-globe mark',
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
    primary: '/brand/aironaut/pattern-freight-icons-v2.png',
    secondary: '/brand/aironaut/pattern-freight-icons-v2.png',
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
      // Kate's 2026-07-04 upload — navy cargo ship, AIRONAUT CUSTOMS BROKERS
      // on the hull, branded containers on deck.
      heroImage: '/brand/aironaut/hero-cargo-ship.png',
    },
    {
      id: 'exotic-vehicles',
      label: 'Exotic Motor Vehicle Shipping',
      blurb: 'High-value cars in and out of NZ.',
      href: 'exotic-vehicles',
      // Kate's 2026-07-04 upload — grey 911 emerging from a container onto
      // the orange floor, AIRONAUT mark on the navy wall behind.
      heroImage: '/brand/aironaut/hero-porsche-container.png',
    },
    {
      id: 'boats-yachts',
      label: 'Boat & Yacht Transport',
      blurb: 'Marine transport worldwide.',
      href: 'boats-yachts',
      // Kate's 2026-07-04 upload (v2, cleaner render) — navy superyacht bow,
      // orange waterline stripe, AIRONAUT mark on the wall behind.
      heroImage: '/brand/aironaut/hero-yacht-bow-v2.png',
    },
    {
      id: 'wine',
      label: 'Wine Import & Export',
      blurb: 'NZ partner of Global Wine Logistics.',
      href: 'wine',
      // Kate's 2026-07-04 upload — branded shipment box + wooden crate,
      // Pinot Noir bottles.
      heroImage: '/brand/aironaut/hero-wine-crate.png',
    },
  ],
});
