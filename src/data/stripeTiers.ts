/** Stripe product ↔ price ↔ app role mapping — 2026 confirmed pricing */
export const STRIPE_TIERS = {
  essentials: {
    price_id: "price_1TCrHlPXAX9ohARR0eFaJYNW",
    product_id: "prod_UBDjBRdDhT4vSP",
    role: "essentials" as const,
    label: "Essentials — $199/mo",
  },
  business: {
    price_id: "price_1TCrJaPXAX9ohARRca8Hjugj",
    product_id: "prod_UBDlAXBBnEhMfp",
    role: "business" as const,
    label: "Business — $399/mo",
  },
  enterprise: {
    price_id: "price_1TCrMwPXAX9ohARR7Pb2J8S8",
    product_id: "prod_UBDoF9tASphyxg",
    role: "enterprise" as const,
    label: "Enterprise — $799/mo",
  },
  toroa: {
    price_id: "price_1TILj8PXAX9ohARRZqtNCzRW",
    product_id: "prod_UGtW4B1N1JxWUM",
    role: "essentials" as const,
    label: "Tōroa — $29/mo",
  },
} as const;

/** Resolve an app role from a Stripe product ID */
export function roleFromProductId(productId: string): "essentials" | "business" | "enterprise" | null {
  for (const tier of Object.values(STRIPE_TIERS)) {
    if (tier.product_id === productId) return tier.role;
  }
  return null;
}
