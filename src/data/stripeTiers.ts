/** Stripe product ↔ price ↔ app role mapping */
export const STRIPE_TIERS = {
  starter: {
    price_id: "price_1TCrHlPXAX9ohARR0eFaJYNW",
    product_id: "prod_UBDjBRdDhT4vSP",
    role: "starter" as const,
    label: "Starter",
  },
  pro: {
    price_id: "price_1TCrJaPXAX9ohARRca8Hjugj",
    product_id: "prod_UBDlAXBBnEhMfp",
    role: "pro" as const,
    label: "Pro",
  },
  business: {
    price_id: "price_1TCrMwPXAX9ohARR7Pb2J8S8",
    product_id: "prod_UBDoF9tASphyxg",
    role: "business" as const,
    label: "Business",
  },
  industry: {
    price_id: "price_1TCrOmPXAX9ohARRIFwlBtHY",
    product_id: "prod_UBDq9nnSgUlUH8",
    role: "business" as const,
    label: "Industry Suite",
  },
  luxury: {
    price_id: "price_1TCrPlPXAX9ohARRtNUR3jGZ",
    product_id: "prod_UBDrUUF0KtUzWJ",
    role: "business" as const,
    label: "Luxury Hospitality",
  },
  toroa_starter: {
    price_id: "price_1TCrQPPXAX9ohARRM5Ppeq4h",
    product_id: "prod_UBDswdBqmFPkXz",
    role: "starter" as const,
    label: "Tōroa Starter",
  },
  toroa_family: {
    price_id: "price_toroa_family",
    product_id: "prod_toroa_family",
    role: "starter" as const,
    label: "Tōroa Family",
  },
  toroa_plus: {
    price_id: "price_toroa_plus",
    product_id: "prod_toroa_plus",
    role: "pro" as const,
    label: "Tōroa Plus",
  },
} as const;

/** Resolve an app role from a Stripe product ID */
export function roleFromProductId(productId: string): "starter" | "pro" | "business" | null {
  for (const tier of Object.values(STRIPE_TIERS)) {
    if (tier.product_id === productId) return tier.role;
  }
  return null;
}
