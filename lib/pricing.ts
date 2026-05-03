/**
 * Source of truth: PRICING-LOCKED.md (locked 2026-04-08).
 * All prices NZD, GST exclusive.
 */

export type PricingTier = {
  slug: "family" | "operator" | "leader" | "enterprise" | "outcome";
  name: string;
  audience: string;
  monthly: string;
  monthlyNote?: string;
  setup: string;
  setupNote?: string;
  includes: string[];
  highlighted?: boolean;
};

export const PRICING_TIERS: PricingTier[] = [
  {
    slug: "family",
    name: "Family",
    audience: "Households",
    monthly: "$29",
    setup: "—",
    setupNote: "No setup fee",
    includes: [
      "Tōroa whānau agent",
      "SMS-first interface",
      "Household coordination",
    ],
  },
  {
    slug: "operator",
    name: "Operator",
    audience: "Single-site SMB",
    monthly: "$1,490",
    setup: "$590",
    setupNote: "Split across first 3 invoices on request",
    includes: [
      "1 industry kete",
      "Up to 5 seats",
      "20 evidence packs / month",
    ],
  },
  {
    slug: "leader",
    name: "Leader",
    audience: "Multi-site SMB",
    monthly: "$1,990",
    setup: "$1,290",
    setupNote: "Split across first 3 invoices on request",
    includes: [
      "2 industry kete",
      "Up to 15 seats",
      "60 evidence packs / month",
      "Quarterly compliance review",
    ],
    highlighted: true,
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    audience: "Mid-market NZ",
    monthly: "$2,990",
    setup: "$2,890",
    setupNote: "Split across first 3 invoices on request",
    includes: [
      "All 5 industry kete",
      "Unlimited seats",
      "200 evidence packs / month",
      "99.9% SLA",
      "NZ data residency",
      "Named success manager",
    ],
  },
  {
    slug: "outcome",
    name: "Outcome",
    audience: "High-value flows",
    monthly: "from $5,000",
    monthlyNote: "Plus 10–20% of measured savings",
    setup: "Per engagement",
    includes: [
      "Bespoke outcome workflows",
      "Tied to measured savings",
      "Custom integrations",
    ],
  },
];

export const PRICING_NOTE =
  "All prices NZD, GST exclusive. Add 15% GST at invoice. Setup fees can be split across the first 3 invoices on request.";
