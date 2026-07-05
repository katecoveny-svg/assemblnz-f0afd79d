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
    src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="%230A2A43"/><path d="M4 26c4 0 4-4 8-4s4 4 8 4 4-4 8-4 4 4 8 4" stroke="%231E7A8C" stroke-width="2.5" fill="none"/><path d="M4 32c4 0 4-4 8-4s4 4 8 4 4-4 8-4 4 4 8 4" stroke="%236E93A6" stroke-width="2.5" fill="none"/></svg>',
    alt: 'Moana — three swell lines mark',
  },
  // Moana palette:
  //   Deep sea navy  #0A2A43 — primary surface / shell
  //   Teal           #1E7A8C — secondary / accents / links
  //   Foam / sand    #F2EFE6 — paper card interiors
  //   Charcoal ink   #1B2A32 — body text
  //   Muted steel    #6E93A6 — subheads / muted
  //   Safety orange  #E1622F — accent (primary CTA + live dot ONLY)
  //   Champagne      #BFA37A — assembl crossover accent
  colours: {
    bg: '#0A2A43', // Deep sea navy — primary surface
    surface: '#F2EFE6', // Foam / sand — paper card interior
    ink: '#1B2A32', // Charcoal ink — body
    muted: '#6E93A6', // Muted steel — subhead / muted
    accent: '#E1622F', // Safety orange — CTA + live dot only
    canary: '#BFA37A', // assembl crossover accent (champagne)
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
  taglines: {
    primary: 'The sea, read for you.',
    social: 'Know the water before you go.',
    values: 'Read the sea. Respect the rules. Get home safe.',
  },
  ctaLabel: 'CHECK THE FORECAST',
  // Nav hrefs are path segments under /customers/moana/ops/ (schema requires
  // non-empty). The Overview link (bare base) is rendered by the layout.
  nav: [
    { label: 'Forecast', href: 'forecast' },
    { label: 'Tides', href: 'tides' },
    { label: 'Catch log', href: 'catch-log' },
    { label: 'Knots', href: 'knots' },
    { label: 'Hot spots', href: 'hot-spots' },
    { label: 'Safety', href: 'safety' },
  ],
});
