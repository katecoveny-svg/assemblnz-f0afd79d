export const INSURANCE_ASSUMPTIONS_VERSION = "2026-05-18-v1";

export const REBUILD_COST_PER_SQM_BY_REGION: Record<string, number> = {
  auckland: 3600,
  wellington: 3900,
  canterbury: 3300,
  waikato: 3200,
  "bay-of-plenty": 3350,
  otago: 3450,
  northland: 3250,
  other: 3400,
};

export const INSURANCE_RULES = {
  houseBuffer: 1.25,
  contentsAsShareOfRebuild: 0.25,
  contentsPerDependent: 15000,
  workFromHomeEquipment: 25000,
  comprehensiveVehicleThreshold: 8000,
  thirdPartyFireTheftThreshold: 4000,
  lifeIncomeMultiple: 10,
  incomeProtectionShare: 0.75,
  savingsBufferMonths: 12,
};

export const INSURANCE_SOURCES = [
  {
    label: "Cordell Sum Sure / insurer sum-insured methodology",
    note:
      "Used for the principle that sum insured should estimate full rebuild cost including demolition, professional fees, GST, and site allowances.",
    url: "https://www.asb.co.nz/home-and-contents-insurance/sum-insured.html",
  },
  {
    label: "The Treasury — sum insured risk",
    note:
      "Used for the risk framing around households carrying the underinsurance risk when sum insured is too low.",
    url: "https://www.treasury.govt.nz/publications/research-and-commentary/rangitaki-blog/sum-insured-cover-household-insurance-what-are-risks",
  },
  {
    label: "IRD — dependent child definition",
    note:
      "Used for dependant framing: children 15 or younger, or older children who remain financially dependent under IRD rules.",
    url: "https://www.ird.govt.nz/working-for-families/can-you-get-it/dependent-child",
  },
  {
    label: "FMA — insurance advice",
    note:
      "Used for the advice CTA: changing personal insurance can reduce cover, so users should speak with an appropriately licensed adviser.",
    url: "https://www.fma.govt.nz/consumer/getting-advice/insurance-advice/",
  },
  {
    label: "MBIE Annual Report 2024/25",
    note:
      "Used as public income context: Stats NZ labour-market income indicators are the base public source for NZ income benchmarking.",
    url: "https://www.mbie.govt.nz/dmsdocument/31275-mbie-annual-report-2024-25",
  },
];
