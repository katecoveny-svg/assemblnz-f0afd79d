/**
 * Customer permissions — the single source of truth for the logo wall.
 *
 * ───────────────────────────────────────────────────────────────────────────
 *  HONESTY RULES (locked 2026-06-16 — do not weaken without Kate Hudson's sign-off)
 * ───────────────────────────────────────────────────────────────────────────
 *  1. ONLY entries with `status: 'approved'` ever render on the public site.
 *     The wall, the /customers index, and the /customers/[slug] pages all read
 *     from `approvedCustomers()` — never from the raw array.
 *  2. Every entry MUST carry a `consentBasis` describing the written permission
 *     on file. No logo goes up without an email/agreement confirming logo use.
 *     The signed record lives in `legal/customer-permissions/<slug>.md`.
 *  3. ZERO mana whenua relationship claims. Do NOT add any iwi, hapū, Māori
 *     organisation, or Te Hiku Media entry unless Kate has explicitly green-lit
 *     it AND a real, consented relationship exists. The default is no Māori-org
 *     logos. (See project_voice_answers_jun16.md rule 3.)
 *  4. No fake testimonials, no composite customers, no logos lifted from press
 *     releases. If we have nothing approved, the wall ships its invitation state
 *     ("yours could be the first logo here") — that is the honest answer, and
 *     it is the answer right now.
 *
 *  As of 2026-06-17 there are ZERO approved customer logos on file. The array
 *  below is intentionally empty. The wall renders its invitation state until a
 *  real, consented customer is added here with a matching legal record.
 *
 *  To add a customer: drop the signed permission in
 *  legal/customer-permissions/<slug>.md, then add an entry below following the
 *  shape of EXAMPLE_SHAPE (which is NOT exported and NEVER renders).
 */

export type ConsentBasis =
  /** Signed pilot agreement that explicitly grants logo + quote use. */
  | 'signed-pilot-logo-consent'
  /** Standalone written (email) consent to display logo + quote. */
  | 'written-logo-consent'
  /** Advisor / partner who has agreed in writing to be named. */
  | 'advisor-consent'
  /** Signed pilot, but NO consent yet to show the brand — render redacted. */
  | 'pilot-under-nda';

export type CustomerSegment =
  | 'professional-services'
  | 'construction'
  | 'hospitality'
  | 'freight'
  | 'education'
  | 'automotive'
  | 'public-sector'
  | 'advisor';

export type Customer = {
  /** URL slug → /customers/[slug]. kebab-case, stable. */
  slug: string;
  /** Display name of the organisation. */
  name: string;
  /**
   * Path to a logo asset under /public (SVG preferred, transparent PNG ok).
   * Omit to render the organisation name as a clean text logotype — the honest
   * default until a real logo file is supplied with permission.
   */
  logoSrc?: string;
  /** Which side of the breadth story this customer tells. */
  segment: CustomerSegment;
  /** The kete / hapai tool they actually use. */
  tool?: string;

  /** One-line quote, under 25 words. Verbatim, never paraphrased. */
  quote?: string;
  /** Named spokesperson — full name. */
  spokesperson?: string;
  /** Spokesperson title + organisation. */
  spokespersonTitle?: string;
  /** Optional spokesperson photo under /public. */
  photoSrc?: string;

  /**
   * One concrete outcome line, numbers preferred.
   * e.g. "Cut producer-statement turnaround from 11 days to 3".
   */
  outcome?: string;

  /** Whether a /customers/[slug] case study should be linked + rendered. */
  hasCaseStudy: boolean;

  /**
   * Publication gate. Only 'approved' renders publicly. 'pending' and 'draft'
   * are staging-only and are filtered out by approvedCustomers().
   */
  status: 'approved' | 'pending' | 'draft';

  /** How we are permitted to show this — see ConsentBasis. Required. */
  consentBasis: ConsentBasis;
  /** Path to the signed record, relative to repo root. */
  consentRecord: string;
  /**
   * If true, the brand is shown REDACTED ("Pilot partner — name withheld under
   * NDA") rather than with a real logo/name. Use with 'pilot-under-nda'.
   */
  redacted?: boolean;
};

/**
 * The live data. EMPTY by design as of 2026-06-17 — no approved logos on file.
 *
 * When you add the first real customer, it MUST have a matching signed record
 * in legal/customer-permissions/ and a non-redacted consent basis (or be
 * rendered redacted under NDA). Aim for a breadth spread per the brief: one
 * professional services, one industry vertical, one public sector — NOT padding.
 */
export const CUSTOMERS: Customer[] = [];

/**
 * Reference shape only — NOT exported into CUSTOMERS, NEVER rendered. Shows the
 * exact fields a real entry needs so adding one is copy-paste-then-edit. Delete
 * the redaction/quote fields that don't apply.
 *
 *   {
 *     slug: 'example-co',
 *     name: 'Example Co',
 *     logoSrc: '/img/customers/example-co.svg',   // omit → text logotype
 *     segment: 'construction',
 *     tool: 'Waihanga — RFI + variation pack drafting',
 *     quote: 'It gives us the variation pack in minutes, with the clause cited.',
 *     spokesperson: 'Full Name',
 *     spokespersonTitle: 'Site Manager, Example Co',
 *     outcome: 'Cut variation-pack turnaround from 2 days to 20 minutes',
 *     hasCaseStudy: true,
 *     status: 'approved',
 *     consentBasis: 'signed-pilot-logo-consent',
 *     consentRecord: 'legal/customer-permissions/example-co.md',
 *   }
 */

/** Public-facing list — the ONLY function the site should read from. */
export function approvedCustomers(): Customer[] {
  return CUSTOMERS.filter((c) => c.status === 'approved');
}

/** A single approved customer by slug, or undefined. */
export function getCustomer(slug: string): Customer | undefined {
  return approvedCustomers().find((c) => c.slug === slug);
}

/** Slugs that should have a static /customers/[slug] page generated. */
export function caseStudySlugs(): string[] {
  return approvedCustomers()
    .filter((c) => c.hasCaseStudy && !c.redacted)
    .map((c) => c.slug);
}
