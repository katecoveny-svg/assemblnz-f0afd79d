/**
 * Stripe product ↔ price ↔ app role mapping — 2026 locked pricing
 *
 * Legacy price IDs (essentials/business/enterprise at $199/$399/$799) are kept
 * for grandfathered customers — see PRICING-LOCKED.md. New signups flow through
 * starter (Operator $590/mo) and pro (Leader $1,290/mo).
 */
export const STRIPE_TIERS = {
  // --- Current public tiers ---
  starter: {
    price_id: "price_1TCrHlPXAX9ohARR0eFaJYNW",
    product_id: "prod_UBDjBRdDhT4vSP",
    role: "essentials" as const,
    label: "Operator — $590/mo",
  },
  pro: {
    price_id: "price_1TCrJaPXAX9ohARRca8Hjugj",
    product_id: "prod_UBDlAXBBnEhMfp",
    role: "business" as const,
    label: "Leader — $1,290/mo",
  },
  enterprise: {
    price_id: "price_1TCrMwPXAX9ohARR7Pb2J8S8",
    product_id: "prod_UBDoF9tASphyxg",
    role: "enterprise" as const,
    label: "Enterprise — $2,890/mo",
  },
  toroa: {
    price_id: "price_1TILj8PXAX9ohARRZqtNCzRW",
    product_id: "prod_UGtW4B1N1JxWUM",
    role: "essentials" as const,
    label: "Toro — $29/mo",
  },

  // --- Legacy aliases for grandfathered customers ---
  essentials: {
    price_id: "price_1TCrHlPXAX9ohARR0eFaJYNW",
    product_id: "prod_UBDjBRdDhT4vSP",
    role: "essentials" as const,
    label: "Operator — $590/mo",
  },
  business: {
    price_id: "price_1TCrJaPXAX9ohARRca8Hjugj",
    product_id: "prod_UBDlAXBBnEhMfp",
    role: "business" as const,
    label: "Leader — $1,290/mo",
  },
} as const;

/** Resolve an app role from a Stripe product ID */
export function roleFromProductId(productId: string): "essentials" | "business" | "enterprise" | null {
  for (const tier of Object.values(STRIPE_TIERS)) {
    if (tier.product_id === productId) return tier.role;
  }
  return null;
}
