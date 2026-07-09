import { parseBrandConfig, type BrandConfig } from '@/lib/brand/brand-config';

/**
 * TOA ARCHITECTS — Tāmaki Makaurau Office Architecture. Nicholas Dalton's
 * kaupapa Māori design practice, 326 Karangahape Road. NZIA Practice.
 *
 * ⚠️ TARGET, NOT A PARTNER. Every surface frames this as "what a TOA ×
 * assembl operating system could look like". Nothing here is endorsed by or
 * attributable to TOA Architects Ltd. Logo + palette + type only — no project
 * photography, no client names, no site copy (public/brand/toa-architects/README.md).
 *
 * Brand values verified from toa.nz computed CSS 2026-07-04. The palette is
 * deliberately monochrome — TOA let photography carry colour, so this surface
 * lets the work (drafts, consents, reports) carry it instead. Champagne gold
 * #BFA37A appears only as the assembl crossover accent.
 *
 * The agent is ARC — the architecture/consents brain from the Waihanga kete
 * (live in supabase/functions/waihanga-orchestrator consent_readiness_precheck;
 * full prompt corpus in ~/Desktop/ASSEMBL/waihanga-agent-prompts.sql).
 */
export const toaArchitectsConfig: BrandConfig = parseBrandConfig({
  slug: 'toa-architects',
  displayName: 'TOA ARCHITECTS',
  logo: {
    // TOA publish only white wordmarks (their site is dark) — the ink version
    // is a faithful alpha-mask recolor to #161516 for light grounds. The hero
    // band uses darkSrc (the official white) on the #161516 ground.
    src: '/brand/toa-architects/logo-official-ink.png',
    darkSrc: '/brand/toa-architects/logo-official-white.png',
    alt: 'TOA Architects wordmark',
    wordmark: true,
  },
  colours: {
    // Light paper shell — TOA's site body is white with dark hero sections;
    // the drama lives in the ArcHeroBand + integrations panel, not the shell.
    bg: '#eff1ee', // pale sage-grey (from TOA's #E2E7E3 family)
    surface: '#ffffff',
    ink: '#161516', // TOA near-black
    muted: '#6f6f64', // TOA olive-grey
    accent: '#363a35', // TOA charcoal — the brand is monochrome by design
    canary: '#bfa37a', // assembl crossover — champagne gold, DIRECTION-LOCKED
  },
  fonts: {
    // Real fonts are Gotham + Archer (licensed). Montserrat/Public Sans are
    // the stand-ins wired in lib/brand/fonts.ts.
    display: 'Montserrat',
    body: 'Public Sans',
    mono: 'JetBrains Mono',
  },
  hero3D: 'toa-architects',
  voice: {
    // Personal — the demo is pitched to Nick Dalton (verified principal at
    // toa.nz; Kate's friend, per the seeded toa-architecture tenant record).
    greeting:
      'Kia ora Nick — Monday 7.02am. ARC drafted overnight; ten items are waiting for your review and nothing has been sent.',
    tone: 'ops-direct',
  },
  crossBrand: {
    // Concept pitch for a real practice — assembl stays quiet.
    position: 'footer-only',
    density: 'quiet',
  },
  patterns: {
    primary: '/brand/toa-architects/pattern-whakairo.svg',
  },
  // English-led sidebar per the brief.
  nav: [
    { label: 'Consents', href: 'consents' },
    { label: 'Clients', href: 'clients' },
    { label: 'Consultants', href: 'consultants' },
    { label: 'Fees', href: 'fees' },
    { label: 'Site Visits', href: 'site-visits' },
    { label: 'Documents', href: 'documents' },
  ],
  taglines: {
    // Concept framing only — never TOA's own copy, never a partnership claim.
    primary: 'WHAT A TOA × ASSEMBL OPERATING SYSTEM COULD LOOK LIKE',
    values: 'DRAFTS, NEVER DECIDES. FLAGS, NEVER CLAIMS.',
  },
});
