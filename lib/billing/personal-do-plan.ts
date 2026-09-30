/** Review-only consumer configuration. No checkout or entitlement is enabled here. */
export type PersonalDoPlan = {
  priceId: string;
  currency: 'nzd';
  monthlyAmountCents: number;
  taxTreatment: 'inclusive' | 'exclusive';
  requestsPerDay: number;
  maxMonthlyProviderCostCents: number;
};

export function personalDoPlan(env: Record<string, string | undefined>): PersonalDoPlan | null {
  // Dedicated variables deliberately do not fall back to Solo/Team or business pricing.
  const priceId = env.PERSONAL_DO_STRIPE_PRICE_ID?.trim();
  const positiveInteger = (value: string | undefined) => value && /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) > 0 ? Number(value) : null;
  const monthlyAmountCents = positiveInteger(env.PERSONAL_DO_MONTHLY_AMOUNT_CENTS);
  const requestsPerDay = positiveInteger(env.PERSONAL_DO_REQUESTS_PER_DAY);
  const maxMonthlyProviderCostCents = positiveInteger(env.PERSONAL_DO_MAX_MONTHLY_PROVIDER_COST_CENTS);
  const taxTreatment = env.PERSONAL_DO_TAX_TREATMENT;
  if (!priceId?.startsWith('price_') || !monthlyAmountCents || !requestsPerDay || !maxMonthlyProviderCostCents ||
      env.PERSONAL_DO_CURRENCY !== 'nzd' || (taxTreatment !== 'inclusive' && taxTreatment !== 'exclusive')) return null;
  return { priceId, currency: 'nzd', monthlyAmountCents, taxTreatment, requestsPerDay, maxMonthlyProviderCostCents };
}
