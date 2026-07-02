/**
 * The six capability cards from DIRECTION-LOCKED-2026-07-01 — Kate's English,
 * capability-first frame for the homepage + marketing surfaces:
 *
 *   Communication / Trust / Workflow / Insights / Operations / Knowledge
 *
 * The LIVE registry (lib/marketplace/bundles.ts, V4 cull) is organised by
 * vertical (construction, automotive, creative, …), not capability — so each
 * capability card links to the NEAREST live bundle or surface. Registry slugs
 * are NEVER renamed here; this is a marketing-side mapping only.
 *
 * Mapping rationale (documented in the v2-site PR body):
 *   communication → /bundles/ensemble  (copy, campaigns, on-brand comms)
 *   trust         → /bundles/counsel   (legal + compliance drafting)
 *   workflow      → /bundles/assembler (programme, contract + consent workflow)
 *   insights      → /data              (live NZ data feeds + signals)
 *   operations    → /bundles/forge     (service, workshop + freight operations)
 *   knowledge     → /bundles/kaitiaki  (the deepest knowledge-grounded
 *                                       collection live today)
 *
 * Card descriptions are the locked one-liners from the direction doc,
 * lowercased per the "lowercase everything on-brand" rule.
 */

export type CapabilityCard = {
  /** stable key */
  slug: string;
  /** lowercase display name (Cormorant on the card) */
  title: string;
  /** the locked one-line capability sentence */
  description: string;
  /** small tag chips */
  tags: string[];
  /** where the card links — nearest live bundle / surface */
  href: string;
  /** live registry bundle slug behind this card, when there is one */
  bundleSlug?: string;
};

export const CAPABILITY_CARDS: CapabilityCard[] = [
  {
    slug: 'communication',
    title: 'communication',
    description: 'crafts and delivers clear, on-brand communications across channels.',
    tags: ['copy', 'campaigns'],
    href: '/bundles/ensemble',
    bundleSlug: 'ensemble',
  },
  {
    slug: 'trust',
    title: 'trust',
    description: 'monitors risk, ensures compliance, and builds confidence.',
    tags: ['risk', 'compliance'],
    href: '/bundles/counsel',
    bundleSlug: 'counsel',
  },
  {
    slug: 'workflow',
    title: 'workflow',
    description: 'designs, runs, and optimises end-to-end processes.',
    tags: ['automation', 'orchestration'],
    href: '/bundles/assembler',
    bundleSlug: 'assembler',
  },
  {
    slug: 'insights',
    title: 'insights',
    description: 'turns data and signals into actionable insight.',
    tags: ['analytics', 'signals'],
    href: '/data',
  },
  {
    slug: 'operations',
    title: 'operations',
    description: 'keeps systems, teams, and services running seamlessly.',
    tags: ['systems', 'support'],
    href: '/bundles/forge',
    bundleSlug: 'forge',
  },
  {
    slug: 'knowledge',
    title: 'knowledge',
    description: 'organises and activates knowledge at scale.',
    tags: ['search', 'synthesis'],
    href: '/bundles/kaitiaki',
    bundleSlug: 'kaitiaki',
  },
];
