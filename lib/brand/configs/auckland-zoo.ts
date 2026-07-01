import { parseBrandConfig, type BrandConfig } from '@/lib/brand/brand-config';

/**
 * Auckland Zoo brand config — wired to the real editorial assets Kate uploaded
 * on 2026-07-01. Palette is the safari-orange / off-white / ink editorial system
 * pulled from the uploaded pattern + portrait set. The safari line pattern is
 * NEVER colour-filled and the studio portraits (giraffe, red panda, lionesses,
 * squirrel monkey, elephant, otter) sit ONLY on warm orange, ink, or off-white
 * — never over any other coloured field.
 *
 * Cultural rule: the four taonga species called out in the brief are
 * kaumātua-hold. The earlier taonga-species parallax hero has been removed.
 * None of those species appear in this config, the hero, or the demo data.
 *
 * A secondary accent-blue `#2A5FE0` (pulled from the small dots in the safari
 * pattern) is reserved for hairline flourishes — the schema only exposes a
 * single `accent`, so the blue lives in code as a documented constant rather
 * than a config slot.
 */
export const aucklandZooConfig: BrandConfig = parseBrandConfig({
  slug: 'auckland-zoo',
  displayName: 'Auckland Zoo',
  logo: {
    src: '/img/customers/auckland-zoo/logo.svg',
    alt: 'Auckland Zoo wordmark',
  },
  colours: {
    // Safari orange — the anchor. The dashboard shell sits on this field so
    // paper-tone cards read as ink-on-paper laid over a warm orange bed.
    bg: '#F5761F',
    // Off-white paper — cards, watermark scrim, letterhead. Warmer than white
    // so photography never fights a cool surface.
    surface: '#F2EEE6',
    // Near-black ink — same ink used in the line pattern.
    ink: '#1B1B1B',
    // Warm sub-ink for muted supporting copy — pulled from the same warm family
    // as the surface so it never reads cold on the safari-orange field.
    muted: '#5A544D',
    // Secondary orange from the pattern — sparse use for accents and CTAs.
    // The blue dot from the pattern (#2A5FE0) is reserved for hairline
    // flourishes only; kept as a code constant since BrandConfig has one
    // accent slot.
    accent: '#F26B1F',
    // Canary hairline — assembl crossover moments only.
    canary: '#c7a24a',
  },
  fonts: {
    display: 'Playfair Display',
    body: 'Inter',
    mono: 'JetBrains Mono',
  },
  hero3D: 'auckland-zoo',
  voice: {
    greeting: 'Kia ora, kaitiaki — the day begins at the Zoo.',
    tone: 'warm-personal',
  },
  crossBrand: {
    position: 'footer-only',
    density: 'quiet',
  },
  patterns: {
    // Dashboard shell watermark + hero background. Tileable ink-line safari
    // pattern on off-white paper. NEVER colour-fill.
    primary: '/brand/auckland-zoo/pattern-safari-animals.png',
    // Empty states — same pattern (README ships one). Do not invent a second.
    secondary: '/brand/auckland-zoo/pattern-safari-animals.png',
  },
  photography: {
    // Giraffe — the strongest single-animal anchor: dignified, iconic,
    // solo-composed. Used in the hero and static fallback.
    anchor: '/brand/auckland-zoo/portrait-giraffe.png',
    // Rotated as visual placeholders in widgets (per-animal CRM avatars, etc).
    // Order matters — the CRM page passes this same order through.
    gallery: [
      '/brand/auckland-zoo/portrait-giraffe.png',
      '/brand/auckland-zoo/portrait-red-panda.png',
      '/brand/auckland-zoo/portrait-lionesses.png',
      '/brand/auckland-zoo/portrait-squirrel-monkey.png',
      '/brand/auckland-zoo/portrait-asian-elephant.png',
      '/brand/auckland-zoo/portrait-otter.png',
    ],
  },
});
