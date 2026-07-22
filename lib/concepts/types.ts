/**
 * assembl — private-concept platform · config types
 * -------------------------------------------------
 * A concept is a branded, private customer-facing moment that runs on the ONE
 * verified journey engine (`lib/journey/*`). The split is deliberate (brief §2):
 * the editorial frame, runtime, verification and proof are SHARED; each
 * organisation supplies only its tenant-specific signature, brand and language.
 *
 * A concept never re-implements the runtime — it references a `journeyId` that
 * the verified repository already serves, so the customer view and
 * inside-the-journey view are two representations of the SAME run.
 */

export type ConceptBrand = {
  accent: string;
  accentDeep: string;
  ink: string;
  paper: string;
  /** Optional soft wash of the accent for arrival surfaces. */
  accentSoft?: string;
};

export type ConceptSignature = {
  /** Tenant-specific arrival framing — not forced into a shared card shape. */
  eyebrow: string;
  /** The signature line (Kate's verbatim hook). */
  hook: string;
  hookLong: string;
  /** One-line customer scenario this concept demonstrates. */
  scenario: string;
};

export type ConceptCommercial = {
  /** Verbatim data chips from the outreach one-pager. */
  chips: string[];
  /** consumer / client / assembl value split. */
  model: { consumer: string; client: string; assembl: string };
  pilotAsk: string;
};

export type ConceptConfig = {
  slug: string;
  org: string;
  programme: string;
  /** The verified journey this concept runs (served by journeyRepository). */
  journeyId: string;
  brand: ConceptBrand;
  signature: ConceptSignature;
  /** Industry language overrides for shared labels. */
  language: { start: string; insideLabel: string; customerLabel: string };
  commercial: ConceptCommercial;
  /** Plain-language independent-concept disclosure (verbatim). */
  disclosure: string;
  /** Whether this concept requires a private access token in production. */
  flagship: boolean;
};
