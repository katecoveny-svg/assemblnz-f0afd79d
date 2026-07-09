import { parseBrandConfig, type BrandConfig } from '@/lib/brand/brand-config';

/**
 * MOANA — NZ recreational boating & fishing assistant (concept pilot).
 *
 * NOT a real customer. A pitch surface built around two live assembl agents —
 * Tide & Weather (`tide-weather`) and Catch Log (`catch-log`) — to show what a
 * boating/fishing "AI operating system" feels like. Draft-only: it reads the
 * sea and points you at the official source, it never books, lodges or sends.
 *
 * Honesty posture: no fabricated live weather, tide or fishing-rule numbers —
 * every such answer links the official source (MetService Marine, LINZ, MPI).
 *
 * `hero3D` reuses the existing `aironaut` scene id purely to satisfy the schema
 * enum; the Moana workspace never renders a 3D scene (it leads with live chat,
 * like TOA). Deep-sea-navy shell, safety-orange used ONLY for the primary CTA
 * and the live status dot, champagne (#BFA37A) as the assembl crossover accent.
 */
export const moanaConfig: BrandConfig = parseBrandConfig({
  slug: 'moana',
  displayName: 'Moana',
  logo: {
    // No brand mark for a concept pilot — the header renders the initial in an
    // accent chip (OpsShell handles the non-image case). Kept as a tiny inline
    // data-URI so nothing 404s and no asset needs committing.
    src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="%23F5F1E8"/><path d="M4 26c4 0 4-4 8-4s4 4 8 4 4-4 8-4 4 4 8 4" stroke="%23BFA37A" stroke-width="2.5" fill="none"/><path d="M4 32c4 0 4-4 8-4s4 4 8 4 4-4 8-4 4 4 8 4" stroke="%23C97B63" stroke-width="2.5" fill="none"/></svg>',
    alt: 'Moana — gold swell lines mark',
  },
  // Moana palette — LUMINOUS NZ MARINE (2026-07, "glass + gold + pāua"):
  //   Warm pearl     #F5F1E8 — light shell / primary surface
  //   White glass    #FFFFFF — card interiors (translucent)
  //   Warm ink       #2A2620 — body text
  //   Warm grey      #8A8272 — subheads / muted
  //   Snapper coral  #C97B63 — accent (primary CTA + live dot)
  //   Champagne gold #BFA37A — dominant accent (filigree, hairlines, sparkle)
  //   component marine tones: pāua teal #2E7D74, pāua blue #3A6B8C, kelp #9A7B3A
  colours: {
    bg: '#F5F1E8', // Warm pearl — light shell
    surface: '#FFFFFF', // White glass — card interior
    ink: '#2A2620', // Warm ink — body
    muted: '#8A8272', // Warm grey — subhead / muted
    accent: '#C97B63', // Snapper coral — CTA + live dot
    canary: '#BFA37A', // Champagne gold — dominant accent
  },
  fonts: {
    display: 'Poppins',
    body: 'Lato',
    mono: 'JetBrains Mono',
  },
  hero3D: 'aironaut',
  voice: {
    greeting: 'The sea, read for you.',
    tone: 'warm-personal',
  },
  crossBrand: {
    // Concept pilot — assembl stays quiet.
    position: 'footer-only',
    density: 'quiet',
  },
  patterns: {
    primary: '/brand/moana/pattern-swell.svg',
  },
  taglines: {
    primary: 'The sea, read for you.',
    social: 'Know the water before you go.',
    values: 'Read the sea. Respect the rules. Get home safe.',
  },
  ctaLabel: 'CHECK THE FORECAST',
  // Nav hrefs are path segments under /customers/moana/ops/ (schema requires
  // non-empty). The Overview link (bare base) is rendered by the layout.
  nav: [
    { label: "Jack's fishing", href: 'jack' },
    { label: 'Kids lessons', href: 'lessons' },
    { label: 'Forecast', href: 'forecast' },
    { label: 'Tides', href: 'tides' },
    { label: 'Catch log', href: 'catch-log' },
    { label: 'Knots', href: 'knots' },
    { label: 'Hot spots', href: 'hot-spots' },
    { label: 'Safety', href: 'safety' },
  ],
});
