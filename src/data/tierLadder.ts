// ═══════════════════════════════════════════════════════════════
// Locked tier ladder — canonical, NZD ex GST
// Source of truth: BRAND-VOICE-RULES.md (locked 2026-04-20)
//
// This file is the ONLY place homepage / marketing cards should
// read tier copy from. Editing prices here changes them site-wide.
//
// Pricing is locked. To change, you must:
//   1. Update BRAND-VOICE-RULES.md
//   2. Update src/data/pricing.ts (Stripe lookup keys)
//   3. Then update this file.
//
// Gate 1 of BRAND-VOICE-RULES requires "full price (monthly + setup)
// not the monthly half" on every customer-facing tier card.
// ═══════════════════════════════════════════════════════════════

export type TierKey =
  | "family"
  | "operator"
  | "leader"
  | "enterprise"
  | "outcome"
  | "pilotSprint";

export type TierLadderEntry = {
  /** Short display label (e.g. "Operator") */
  label: string;
  /** Compact price string for narrow cards: "$1,490/mo + $590 setup" */
  price: string;
  /** Long-form full-price string for hero copy: "NZ$1,490/mo + NZ$590 setup (ex GST)" */
  fullPrice: string;
  /** One-line tagline shown beneath the price */
  blurb: string;
};

export const TIER_LADDER: Record<TierKey, TierLadderEntry> = {
  family: {
    label: "Tōro",
    price: "$29/mo",
    fullPrice: "NZ$29/mo (ex GST)",
    blurb: "SMS-first family assistant for whānau.",
  },
  operator: {
    label: "Operator",
    price: "$1,490/mo + $590 setup",
    fullPrice: "NZ$1,490/mo + NZ$590 setup (ex GST)",
    blurb: "One kete, five seats. For owner-operators.",
  },
  leader: {
    label: "Leader",
    price: "$1,990/mo + $1,290 setup",
    fullPrice: "NZ$1,990/mo + NZ$1,290 setup (ex GST)",
    blurb: "Two ketes, fifteen seats. For growing teams.",
  },
  enterprise: {
    label: "Enterprise",
    price: "$2,990/mo + $2,890 setup",
    fullPrice: "NZ$2,990/mo + NZ$2,890 setup (ex GST)",
    blurb: "All ketes plus Tōro, unlimited seats.",
  },
  outcome: {
    label: "Outcome",
    price: "from $5,000/mo",
    fullPrice: "from NZ$5,000/mo (ex GST), per engagement",
    blurb: "Bespoke gain-share engagements.",
  },
  pilotSprint: {
    label: "Pilot Sprint",
    price: "NZ$5,000 + GST",
    fullPrice: "NZ$5,000 + GST · two weeks · money-back",
    blurb: "Two weeks. One workflow. One evidence pack.",
  },
} as const;

/** Convenience getter — never returns undefined; throws at build time if key drifts. */
export function tier(key: TierKey): TierLadderEntry {
  const t = TIER_LADDER[key];
  if (!t) throw new Error(`tierLadder: unknown tier "${key}"`);
  return t;
}
