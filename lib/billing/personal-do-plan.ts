/** Consumer configuration has no inherited business price or usage defaults. */
export type PersonalDoPlan = {
  priceId: string;
  maxOutputTokens: number;
  maxInputBytes: number;
  providerTariffs: { astraInputUsdPerMillion: number; astraOutputUsdPerMillion: number; astraCacheReadUsdPerMillion: number; astraCacheWriteUsdPerMillion: number; typesafeInputUsdPerMillion: number; typesafeOutputUsdPerMillion: number; usdToNzd: number };
  automaticTax: boolean;
  currency: 'nzd';
  monthlyAmountCents: number;
  taxTreatment: 'inclusive' | 'exclusive';
  requestsPerDay: number;
  maxMonthlyProviderCostCents: number;
  requestsPerMonth: number;
  maxRequestProviderCostCents: number;
  globalMonthlyProviderCostCents: number;
};

export function personalDoPlan(env: Record<string, string | undefined>): PersonalDoPlan | null {
  // Dedicated variables deliberately do not fall back to Solo/Team or business pricing.
  const priceId = env.PERSONAL_DO_STRIPE_PRICE_ID?.trim();
  const positiveInteger = (value: string | undefined) => value && /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) > 0 ? Number(value) : null;
  const monthlyAmountCents = positiveInteger(env.PERSONAL_DO_MONTHLY_AMOUNT_CENTS);
  const requestsPerDay = positiveInteger(env.PERSONAL_DO_REQUESTS_PER_DAY);
  const maxMonthlyProviderCostCents = positiveInteger(env.PERSONAL_DO_MAX_MONTHLY_PROVIDER_COST_CENTS);
  const requestsPerMonth = positiveInteger(env.PERSONAL_DO_REQUESTS_PER_MONTH);
  const maxRequestProviderCostCents = positiveInteger(env.PERSONAL_DO_MAX_REQUEST_PROVIDER_COST_CENTS);
  const globalMonthlyProviderCostCents = positiveInteger(env.PERSONAL_DO_GLOBAL_MONTHLY_PROVIDER_COST_CENTS);
  const maxOutputTokens = positiveInteger(env.PERSONAL_DO_MAX_OUTPUT_TOKENS);
  const maxInputBytes = positiveInteger(env.PERSONAL_DO_MAX_INPUT_BYTES);
  let providerTariffs: PersonalDoPlan['providerTariffs'] | null = null;
  try {
    const raw = JSON.parse(env.PERSONAL_DO_PROVIDER_TARIFFS_JSON ?? 'null');
    const keys = ['astraInputUsdPerMillion','astraOutputUsdPerMillion','astraCacheReadUsdPerMillion','astraCacheWriteUsdPerMillion','typesafeInputUsdPerMillion','typesafeOutputUsdPerMillion','usdToNzd'];
    if (raw && typeof raw === 'object' && keys.every(key => typeof raw[key] === 'number' && Number.isFinite(raw[key]) && raw[key] > 0)) providerTariffs = Object.fromEntries(keys.map(key => [key, raw[key]])) as PersonalDoPlan['providerTariffs'];
  } catch { /* Missing or invalid tariffs keep consumer access disabled. */ }
  const automaticTaxValue = env.PERSONAL_DO_STRIPE_AUTOMATIC_TAX;
  const taxTreatment = env.PERSONAL_DO_TAX_TREATMENT;
  if (env.PERSONAL_DO_COST_LIMITS_VERIFIED !== 'true' || !providerTariffs || !maxOutputTokens || maxOutputTokens > 6000 || !maxInputBytes || maxInputBytes > 64000 || !priceId?.startsWith('price_') || !monthlyAmountCents || !requestsPerDay || !maxMonthlyProviderCostCents || !requestsPerMonth || !maxRequestProviderCostCents || !globalMonthlyProviderCostCents || maxRequestProviderCostCents > maxMonthlyProviderCostCents || maxMonthlyProviderCostCents > globalMonthlyProviderCostCents ||
      (automaticTaxValue !== 'true' && automaticTaxValue !== 'false') || env.PERSONAL_DO_CURRENCY !== 'nzd' || (taxTreatment !== 'inclusive' && taxTreatment !== 'exclusive')) return null;
  return { priceId, maxOutputTokens, maxInputBytes, providerTariffs, automaticTax: automaticTaxValue === 'true', currency: 'nzd', monthlyAmountCents, taxTreatment, requestsPerDay, maxMonthlyProviderCostCents, requestsPerMonth, maxRequestProviderCostCents, globalMonthlyProviderCostCents };
}

export function enabledPersonalDoPlan(env: Record<string, string | undefined> = process.env): PersonalDoPlan | null {
  return env.PERSONAL_DO_CONSUMER_ENABLED === 'true' ? personalDoPlan(env) : null;
}
